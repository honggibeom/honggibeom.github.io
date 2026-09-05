---
title: StockAnalyst 인프라 - S3에서 OCI로, Docker Compose, Always Free 티어 검토
date: 2026-09-02
category: stockanalyst
src: cover.svg
tags: [stockanalyst, docker, docker-compose, oci, 인프라, 배포]
summary: StockAnalyst 인프라 기록. AWS SDK 종료로 OCI Object Storage 전환, 뉴스 이미지를 미러링 대신 원본 og:image 임베드로 결정한 이유, 세 저장소를 묶은 docker compose와 함정 네 개, OCI Always Free(A1 2 OCPU/12GB) 검토와 Object Storage 월 50,000건 병목 계산.
---

> StockAnalyst는 Spring Boot + React(Vite) + Python 파이프라인으로 만든 주식 정보 서비스다. 개발기 1편은 [뉴스 감성 모델](/post/stockanalyst-sentiment-model)과 [종목 추출](/post/stockanalyst-ticker-extraction)이었고, 2편은 그것을 뺀 나머지를 주제별로 나눴다. 전체 목차는 [개발기 (2) 목차](/post/stockanalyst-dev-log-2-overview)에 있다.

한눈에 보기

- AWS SDK 1.x 종료 → OCI 네이티브 SDK. 설정이 비면 빈을 안 만들고 경고만, 앱은 뜬다
- 뉴스 이미지는 스토리지 미러링 대신 원본 og:image 임베드. 저작권과 무료 티어 한도 양쪽에서 맞는 결정
- compose 함정 4개: localhost API 주소, 리터럴 DB 비밀번호, Windows node_modules, vite outDir
- A1은 2 OCPU/12GB로 줄었지만 충분. 병목은 Object Storage 월 50,000건 = 하루 83 페이지뷰

## Object Storage - S3에서 OCI로

AWS SDK 1.x가 2025년 12월 지원 종료라 OCI Object Storage 네이티브 SDK로 교체했다.

| | AWS 시절 | OCI 전환 후 |
|---|---|---|
| 엔드포인트 경로 | - | 그대로 유지. 프론트 영향 없음 |
| 설정이 비어 있을 때 | 더미 자격증명으로 빈이 생성돼 업로드 시점에야 실패 | 클라이언트 빈을 만들지 않고 경고만 남김. 앱은 정상 기동 |

### 뉴스 이미지는 원본 URL을 그대로 임베드

처음엔 뉴스 이미지를 스토리지에 미러링하려 했다가 원본 og:image URL을 그대로 임베드하기로 결정했다. 언론사 사진을 자체 스토리지에 복제·재배포하는 건 원본 임베드와 저작권상 성격이 다르다. 핫링크 차단이나 원본 삭제는 프론트 `onError` 폴백으로 처리한다. 이 결정은 뒤에 나올 무료 티어 제약과도 맞아떨어졌다.

<svg viewBox="0 0 760 124" width="100%" style="max-width:760px;display:block;margin:22px auto" role="img" aria-label="뉴스 이미지는 백엔드가 기사 페이지 head만 읽어 og:image URL을 뽑고, 브라우저는 원본 URL을 그대로 임베드한다">
<g font-size="13" fill="var(--color-text)" text-anchor="middle">
<rect x="0" y="30" width="132" height="70" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="66" y="52">브라우저</text>
<text x="66" y="69" fill="var(--color-text-dim)" font-size="11">뉴스 목록 요청</text>
<rect x="156" y="30" width="132" height="70" rx="8" fill="var(--color-accent-soft)" stroke="var(--color-accent)"/>
<text x="222" y="52" font-weight="600">백엔드</text>
<text x="222" y="69" fill="var(--color-text-dim)" font-size="11">네이버 검색 API</text>
<rect x="312" y="30" width="132" height="70" rx="8" fill="var(--color-accent-soft)" stroke="var(--color-accent)"/>
<text x="378" y="52" font-weight="600">기사 페이지 &lt;head&gt;</text>
<text x="378" y="69" fill="var(--color-text-dim)" font-size="11">앞 96KB만 읽고 끊음</text>
<text x="378" y="83" fill="var(--color-text-dim)" font-size="11">3초 타임아웃</text>
<rect x="468" y="30" width="132" height="70" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="534" y="52">og:image URL</text>
<text x="534" y="69" fill="var(--color-text-dim)" font-size="11">URL 해시 24시간</text>
<text x="534" y="83" fill="var(--color-text-dim)" font-size="11">캐시 · 없음도 캐시</text>
<rect x="624" y="30" width="132" height="70" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="690" y="52">브라우저</text>
<text x="690" y="69" fill="var(--color-text-dim)" font-size="11">원본 URL 임베드</text>
<text x="690" y="83" fill="var(--color-text-dim)" font-size="11">onError 폴백</text>
</g>
<path d="M132 65.0h18m-6-5l6 5-6 5" stroke="var(--color-text-dim)" stroke-width="1.5" fill="none"/>
<path d="M288 65.0h18m-6-5l6 5-6 5" stroke="var(--color-text-dim)" stroke-width="1.5" fill="none"/>
<path d="M444 65.0h18m-6-5l6 5-6 5" stroke="var(--color-text-dim)" stroke-width="1.5" fill="none"/>
<path d="M600 65.0h18m-6-5l6 5-6 5" stroke="var(--color-text-dim)" stroke-width="1.5" fill="none"/>
</svg>

뉴스 호출을 프론트에서 백엔드로 옮긴 것도 이때다. 네이버 검색 응답에는 이미지가 없어서 기사 페이지의 `og:image`를 읽어야 하는데, 브라우저에서는 CORS로 막힌다. 서버는 `<head>`만 필요하니 응답 앞 96KB만 읽고 끊고, 3초 타임아웃, URL 해시 기준 24시간 캐시("이미지 없음"도 캐시해야 재시도하지 않는다), 브라우저 UA 흉내. `setupProxy.js`가 개발 서버 전용이라 빌드 산출물에서 뉴스가 통째로 죽던 문제도 함께 해결됐다.

## Docker

세 저장소를 하나의 compose로 묶었다.

<svg viewBox="0 0 760 176" width="100%" style="max-width:760px;display:block;margin:22px auto" role="img" aria-label="frontend, backend, batch 프로파일, mysql, redis 컨테이너와 호스트에서 도는 예측">
<text x="0" y="14" font-size="13" fill="var(--color-text-muted)">docker compose 구성</text>
<rect x="0" y="30" width="242" height="70" rx="8" fill="var(--color-accent-soft)" stroke="var(--color-accent)"/>
<text x="121" y="52" font-size="13" fill="var(--color-text)" text-anchor="middle" font-weight="600">frontend</text>
<text x="121" y="69" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">node build → nginx · /api</text>
<text x="121" y="83" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">/oauth2 /ws 프록시</text>
<rect x="258" y="30" width="242" height="70" rx="8" fill="var(--color-accent-soft)" stroke="var(--color-accent)"/>
<text x="379" y="52" font-size="13" fill="var(--color-text)" text-anchor="middle" font-weight="600">backend</text>
<text x="379" y="69" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">gradle → JRE 멀티스테이지</text>
<rect x="516" y="30" width="242" height="70" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="637" y="52" font-size="13" fill="var(--color-text)" text-anchor="middle">batch (profile)</text>
<text x="637" y="69" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">평소엔 안 뜸 · 예측 제외</text>
<rect x="0" y="116" width="242" height="54" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="121" y="148" font-size="13" fill="var(--color-text)" text-anchor="middle">mysql</text>
<rect x="258" y="116" width="242" height="54" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="379" y="148" font-size="13" fill="var(--color-text)" text-anchor="middle">redis</text>
<rect x="516" y="116" width="242" height="54" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="637" y="138" font-size="13" fill="var(--color-text)" text-anchor="middle">예측</text>
<text x="637" y="155" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">당시엔 호스트에서 실행 (지금은 없음)</text>
</svg>

함정은 네 개였다.

| 증상 | 원인 | 처리 |
|---|---|---|
| 컨테이너에서 브라우저가 호스트를 직접 때림 | 프론트의 API 기본 주소가 `http://localhost:80` | 빈 문자열을 주입해 같은 오리진 프록시로 |
| `DB_PASSWORD`로 비밀번호가 안 덮임 | secret 파일의 값이 리터럴 | `SPRING_DATASOURCE_PASSWORD` 환경변수 |
| 프론트 빌드가 리눅스에서 깨짐 | 호스트의 `node_modules`(Windows 네이티브 바인딩)를 복사 | `.dockerignore` + 이미지 안에서 `npm ci` |
| 빌드 산출물을 못 찾음 | vite `outDir`이 `build` | 경로 맞춤 |

예측은 당시 TensorFlow 때문에 배치 이미지에서 제외하고 호스트에서 돌렸다. 지금은 배치 예측 자체가 없고 백엔드가 ONNX로 계산한다 - [변곡점 예측 v2](/post/stockanalyst-turning-point-v2).

## OCI Always Free로 갈 수 있나

검토 결과는 "가능하다, 단 인용된 스펙이 옛날 값이다". Ampere A1이 2026년 6월에 4 OCPU/24GB에서 2 OCPU/12GB로 반토막 났고, 오라클은 공지 없이 문서만 고쳤다. 그래도 이 서비스에는 12GB로 충분하다.

정작 걸린 건 컴퓨팅이 아니라 Object Storage API 요청 50,000건/월이었다. 뉴스 한 페이지에 이미지가 20장이면 하루 83 페이지뷰로 한도가 끝난다. 위에서 내린 원본 임베드 결정이 여기서 다시 한번 맞았다 - 이미지를 스토리지에서 서빙했으면 무료 티어로는 하루 83명이 한계였다.

여기까지가 "갈 수 있나"의 답이고, 실제로 올리기로 하고 내린 판단들(홈 리전 제약, 관리형 MySQL과의 비교, 유휴 인스턴스 회수, aarch64 빌드, 컨테이너 메모리 배분)은 [OCI 무료 티어 배포 준비](/post/stockanalyst-oci-deploy)에 따로 정리했다.

그리고 검토 중에 발견한 것 하나: `ddl-auto: create`가 그대로 있었다. 운영에 올리면 재시작마다 데이터가 전멸한다. [배포 전 목록](/post/stockanalyst-dev-log-2-overview) 맨 위에 올렸다.
