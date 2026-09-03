---
title: StockAnalyst 보안과 설정 - 시크릿 분리, 관리자 승격, 배치 API 키, 권한 체계
date: 2026-09-02
category: stockanalyst
src: cover.svg
tags: [stockanalyst, spring-security, spring-boot, 보안, oauth2, 설정관리]
summary: StockAnalyst 보안과 설정 기록. 평문으로 있던 API 키·DB 비밀번호를 application-secret.yml로 분리하고 optional 없이 import해 없으면 기동이 실패하게, 소셜 로그인 전용에서 관리자를 이메일 등록 + 로그인 시 승격으로, permitAll이던 배치 엔드포인트에 X-Batch-Key, 자원별 권한 체계.
---

> StockAnalyst는 Spring Boot + React(Vite) + Python 파이프라인으로 만든 주식 정보 서비스다. 개발기 1편은 [뉴스 감성 모델](/post/stockanalyst-sentiment-model)과 [종목 추출](/post/stockanalyst-ticker-extraction)이었고, 2편은 그것을 뺀 나머지를 주제별로 나눴다. 전체 목차는 [개발기 (2) 목차](/post/stockanalyst-dev-log-2-overview)에 있다.

**한눈에 보기**

- 기밀은 `application-secret.yml`(git 제외)로. `optional` 없이 import해서 **없으면 기동 실패**
- 비밀번호 계정이 없으니 관리자는 **이메일 등록 + 구글 로그인 시 승격**. 카카오는 이메일을 못 받아 제외
- 누구나 가짜 신호를 넣을 수 있던 `/stocknews`에 48자 `X-Batch-Key`
- 기준 데이터는 GET 공개, 쓰기는 관리자, 사용자 자원은 서비스 계층에서 소유자 검증

## 기밀을 파일에서 분리

`application.yml`에 KIS 앱키·시크릿, Google 클라이언트 시크릿, DB 비밀번호가 평문으로 있었다. 기밀을 전부 `application-secret.yml`(git 제외)로 옮기고 `spring.config.import`로 불러온다.

<svg viewBox="0 0 760 124" width="100%" style="max-width:760px;display:block;margin:22px auto" role="img" aria-label="application.yml이 application-secret.yml을 필수로 import한다. 파일이 없으면 기동이 실패한다">
<g font-size="13" fill="var(--color-text)" text-anchor="middle">
<rect x="0" y="30" width="160" height="70" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="80" y="52">application.yml</text>
<text x="80" y="69" fill="var(--color-text-dim)" font-size="11">git에 포함 · 기밀 없음</text>
<rect x="200" y="30" width="160" height="70" rx="8" fill="var(--color-accent-soft)" stroke="var(--color-accent)"/>
<text x="280" y="52" font-weight="600">spring.config.import</text>
<text x="280" y="69" fill="var(--color-text-dim)" font-size="11">optional 없이 필수</text>
<rect x="400" y="30" width="160" height="70" rx="8" fill="var(--color-accent-soft)" stroke="var(--color-accent)"/>
<text x="480" y="52" font-weight="600">application-secret.yml</text>
<text x="480" y="69" fill="var(--color-text-dim)" font-size="11">git 제외 · KIS</text>
<text x="480" y="83" fill="var(--color-text-dim)" font-size="11">Google · DB 비밀번호</text>
<rect x="600" y="30" width="160" height="70" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="680" y="52">없으면 기동 실패</text>
<text x="680" y="69" fill="var(--color-text-dim)" font-size="11">즉시 알 수 있다</text>
</g>
<path d="M160 65.0h34m-6-5l6 5-6 5" stroke="var(--color-text-dim)" stroke-width="1.5" fill="none"/>
<path d="M360 65.0h34m-6-5l6 5-6 5" stroke="var(--color-text-dim)" stroke-width="1.5" fill="none"/>
<path d="M560 65.0h34m-6-5l6 5-6 5" stroke="var(--color-text-dim)" stroke-width="1.5" fill="none"/>
</svg>

`optional`을 **붙이지 않은 게** 포인트다. secret 파일이 없으면 기동이 실패해서 "어, 설정이 왜 비어 있지"를 한참 뒤에 아는 대신 즉시 안다. 파이썬 쪽도 `krx_credentials.json`을 없애고 `.env` 하나로 통일했다.

이미 노출된 키는 파일을 분리한다고 안전해지지 않는다. **로테이션**이 필요하고, 배포 전 목록에 올려 뒀다.

## 관리자는 이메일 등록 + 로그인 시 승격

소셜 로그인 전용이라 비밀번호 계정이 없다. 그러면 관리자 계정을 어떻게 만드나.

<svg viewBox="0 0 760 110" width="100%" style="max-width:760px;display:block;margin:22px auto" role="img" aria-label="관리자는 비밀번호 계정 없이 이메일 등록 + 로그인 시 승격 방식">
<g font-size="13" fill="var(--color-text)" text-anchor="middle">
<rect x="0" y="30" width="160" height="56" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="80" y="52">설정 admin.email</text>
<text x="80" y="69" fill="var(--color-text-dim)" font-size="11">관리자 이메일 등록</text>
<rect x="200" y="30" width="160" height="56" rx="8" fill="var(--color-accent-soft)" stroke="var(--color-accent)"/>
<text x="280" y="52" font-weight="600">구글 로그인</text>
<text x="280" y="69" fill="var(--color-text-dim)" font-size="11">이메일 일치 확인</text>
<rect x="400" y="30" width="160" height="56" rx="8" fill="var(--color-accent-soft)" stroke="var(--color-accent)"/>
<text x="480" y="52" font-weight="600">ROLE_ADMIN 부여</text>
<text x="480" y="69" fill="var(--color-text-dim)" font-size="11">로그인 시 승격</text>
<rect x="600" y="30" width="160" height="56" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="680" y="52">기동 시 시드</text>
<text x="680" y="69" fill="var(--color-text-dim)" font-size="11">계정 없으면 생성</text>
</g>
<path d="M160 58.0h34m-6-5l6 5-6 5" stroke="var(--color-text-dim)" stroke-width="1.5" fill="none"/>
<path d="M360 58.0h34m-6-5l6 5-6 5" stroke="var(--color-text-dim)" stroke-width="1.5" fill="none"/>
<path d="M560 58.0h34m-6-5l6 5-6 5" stroke="var(--color-text-dim)" stroke-width="1.5" fill="none"/>
</svg>

카카오 로그인은 비즈 앱 없이는 이메일 동의항목을 못 켜서 구글 단일로 정리했다. 이메일이 없으면 관리자 승격 판단 자체가 안 된다.

## 배치 API 키

변곡점 신호를 넣는 `POST /stocknews`가 `permitAll`이라 누구나 가짜 신호를 넣을 수 있었다. 48자 랜덤 공유 키를 `X-Batch-Key` 헤더로 검사하고, 배치 스크립트가 `.env`의 `BATCH_API_KEY`를 보낸다. 사용자 인증과는 별개 경로다. 배치는 로그인할 수 없으니까.

## 권한 체계

| 자원 | 읽기 | 쓰기 | 비고 |
|---|---|---|---|
| 기준 데이터 (주식 · 캔들 · 지수 · 뉴스 · 매크로 등) | 공개 (GET) | 관리자 | 누구나 볼 수 있어야 하는 데이터 |
| 변곡점 신호 (`/stocknews`) | 공개 | 배치 키 | `X-Batch-Key` |
| 사용자 소유 자원 (북마크 · 포트폴리오 · 위험분석) | 회원 | 회원 | **서비스 계층에서 소유자 검증**. 로그인했다고 남의 포트폴리오를 보면 안 된다 |

## 삽질 하나

`@Query("""...""", countQuery = """...""")`는 컴파일 오류다. 어노테이션 요소가 둘 이상이면 첫 번째도 `value =`로 이름을 붙여야 한다. 문제는 이 오류 하나가 **어노테이션 프로세서를 막아서** Lombok이 만드는 `log`·`getId()`·`builder()`가 전부 사라진 것처럼 에러 100개가 났다는 것이다. 에러가 100개면 첫 에러만 보자. 나머지는 첫 에러의 그림자다.
