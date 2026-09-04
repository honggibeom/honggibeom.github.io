---
title: StockAnalyst OCI 무료 티어 배포 준비 - 홈 리전, 요청 수 병목, ARM 빌드, 유휴 회수
date: 2026-09-04
category: stockanalyst
src: cover.svg
tags: [stockanalyst, oci, 배포, docker, 인프라, arm]
summary: 주식 분석 서비스를 오라클 클라우드 Always Free에 올리기까지의 판단 기록. 2026년 6월에 반토막 난 A1 스펙, 홈 리전이 춘천이면 A1을 못 쓴다는 되돌릴 수 없는 제약, 관리형 MySQL 대신 직접 설치를 고른 세 가지 이유, 용량이 아니라 요청 수가 먼저 바닥나는 Object Storage, 유휴 인스턴스 회수, aarch64 빌드 함정, mem_limit 없는 컨테이너에서 JVM이 호스트를 노리는 문제.
---

> StockAnalyst는 Spring Boot + React(Vite) + Python 파이프라인으로 만든 주식 정보 서비스다. 전체 구조는 [개발기 (2) 목차](/post/stockanalyst-dev-log-2-overview)에 있고, 이 글은 그것을 오라클 클라우드 Always Free 티어에 올리기로 하고 **준비하면서 내린 판단들을 근거와 함께 남긴 기록**이다. "이렇게 하면 됩니다" 가이드가 아니다.

**한눈에 보기**

- 인터넷에 도는 "A1 4 OCPU / 24 GB"는 옛날 값이다. 2026년 6월에 **2 OCPU / 12 GB**로 반토막 났다
- **홈 리전이 춘천이면 A1을 아예 못 만든다.** 그리고 홈 리전은 되돌릴 수 없다. 여기서 막히면 나머지가 무의미하다
- 관리형 MySQL 대신 직접 설치. 결정적인 이유는 용량이 아니라 **백업 보관 1일 · PITR 없음**이었다
- 진짜 병목은 용량이 아니라 **Object Storage 요청 50,000건/월 = 하루 83 페이지뷰**
- 걱정한 CPU·메모리는 12 GB 중 8.75 GB로 여유. **짐작한 병목과 실제 병목이 달랐다**

구성은 이렇다.

| 구성요소 | 내용 |
|---|---|
| 백엔드 | Spring Boot 4, JDK 17 |
| 프론트 | React 19 + Vite + Tailwind v4 |
| DB | MySQL 8 (약 1.7 GB, 일봉 950만 행) |
| 캐시 | Redis 7 |
| 배치 | 파이썬 — 시세·뉴스·공매도 수집, ONNX 감성 분석 |

트래픽이 많은 서비스가 아니다. [한국투자증권 API 호출 제한](/post/stockanalyst-data-pipeline)에 묶여 있어서 애초에 폭주할 수가 없는 구조다. 그래서 "무료 티어로 충분한가"보다 **"무료 티어의 제약 중 뭐가 진짜로 발목을 잡는가"**가 핵심 질문이었다.

결론부터 말하면, 발목을 잡은 건 CPU도 메모리도 아니었다.

## 1. 먼저 정정 — A1 스펙이 2026년 6월에 반토막 났다

인터넷에 돌아다니는 OCI 무료 티어 글은 대부분 "Ampere A1 4 OCPU / 24 GB 무료"라고 쓰여 있다. **지금은 아니다.**

| | 예전 (대부분의 글) | 현재 (2026-06-15~) |
|---|---|---|
| Ampere A1 | 4 OCPU / 24 GB | **2 OCPU / 12 GB** |
| OCPU-시간 | 3,000/월 | **1,500/월** |
| GB-시간 | 18,000/월 | **9,000/월** |

오라클이 별도 공지 없이 문서만 고쳤다. 기존에 만들어 둔 인스턴스는 유지되지만, **종료하면 그 스펙으로는 다시 못 만든다.**

무료 티어 글을 읽을 때는 작성일부터 확인하는 게 좋다. 이 글의 숫자도 2026년 9월 기준이다.

## 2. 홈 리전이 모든 걸 결정한다

가장 먼저 확인해야 할 항목인데 의외로 언급하는 글이 없다. 오라클 공식 문서에 이런 두 문장이 있다.

> Always Free 컴퓨트 인스턴스는 **홈 리전에 생성해야 한다.**
>
> A1 인스턴스는 어느 가용 도메인에서도 만들 수 있다 — **South Korea North(춘천)은 예외.**

두 문장을 겹치면 결론이 나온다. **홈 리전이 춘천이면 A1을 아예 못 쓴다.** 그리고 홈 리전은 테넌시를 만들 때 정해지고 나중에 바꾸는 게 사실상 불가능하다.

<svg viewBox="0 0 760 132" width="100%" style="max-width:760px;display:block;margin:22px auto" role="img" aria-label="홈 리전이 춘천이면 A1을 만들 수 없고 그 결정은 되돌릴 수 없다">
<text x="0" y="14" font-size="13" fill="var(--color-text-muted)">가장 먼저 확인할 것 — 되돌릴 수 없는 유일한 제약</text>
<rect x="0" y="30" width="200" height="66" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="100" y="56" font-size="13" fill="var(--color-text)" text-anchor="middle">테넌시 홈 리전</text>
<text x="100" y="74" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">생성 때 정해지고 못 바꾼다</text>
<path d="M200 63h28m-7-5l7 5-7 5" stroke="var(--color-text-dim)" stroke-width="1.5" fill="none"/>
<rect x="236" y="18" width="250" height="44" rx="8" fill="#e5534b" opacity="0.12" stroke="#e5534b"/>
<text x="361" y="36" font-size="13" fill="var(--color-text)" text-anchor="middle" font-weight="600">춘천 (South Korea North)</text>
<text x="361" y="52" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">A1을 아예 만들 수 없다</text>
<rect x="236" y="70" width="250" height="44" rx="8" fill="var(--color-accent-soft)" stroke="var(--color-accent)"/>
<text x="361" y="88" font-size="13" fill="var(--color-text)" text-anchor="middle" font-weight="600">그 외 리전</text>
<text x="361" y="104" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">홈 리전 안에서만 A1 생성 가능</text>
<path d="M486 92h28m-7-5l7 5-7 5" stroke="var(--color-text-dim)" stroke-width="1.5" fill="none"/>
<rect x="522" y="70" width="238" height="44" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="641" y="88" font-size="13" fill="var(--color-text)" text-anchor="middle">내 계정: 오사카</text>
<text x="641" y="104" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">한국에서 RTT 30~40ms</text>
</svg>

내 계정은 홈 리전이 오사카(Japan Central)라 통과했다. 한국에서 오사카는 RTT 30~40ms 수준이라 웹 응답에 체감될 정도는 아니다. 배치가 한국투자증권·KRX를 국외에서 호출하게 되지만, 어차피 호출 제한에 묶여 있어서 영향이 없다.

콘솔 우측 상단 리전 메뉴에서 `(Home)` 표시부터 확인하자. 다른 모든 항목은 나중에 고칠 수 있지만 이건 아니다.

## 3. 가장 오래 고민한 결정 — DB를 어디에 둘 것인가

오라클은 **MySQL HeatWave Database Service**라는 관리형 MySQL을 Always Free로 준다. 인스턴스에 직접 설치하는 것과 어느 쪽이 나은지가 제일 어려운 판단이었다.

| | A1에 직접 설치 | MySQL HeatWave Always Free |
|---|---|---|
| CPU | A1의 2 OCPU 공유 | **1 ECPU** (`MySQL.Free` shape) |
| 용량 | 블록스토리지 200 GB 내 자유 | **50 GB 고정** |
| 백업 | 직접 구성 | 자동, 단 **보관 1일 · PITR 없음** |
| HA | 없음 | 없음 (standalone만) |
| 리전 | 인스턴스와 동일 | 홈 리전 전용 |
| 튜닝 | 자유 | 대부분 잠김 |
| 인스턴스 회수 시 | **같이 날아감** | 살아남음 |

### 처음엔 용량 때문에 직접 설치라고 생각했다

10년치 일봉이 쌓여 있으니 50 GB로는 모자랄 거라 짐작했다. 재봤더니 **1.69 GB**였다. 50 GB의 3.4%다.

```sql
SELECT table_schema, ROUND(SUM(data_length+index_length)/1024/1024/1024, 2) AS gb
FROM information_schema.tables GROUP BY table_schema;
```

10년치가 이미 다 들어간 상태에서 1.69 GB면 일일 증분은 종목당 한 행씩이라 연간 수백 MB 수준이다. 50 GB는 수십 년치다. **용량 논거는 완전히 틀렸다.** 짐작으로 아키텍처를 정하면 안 된다는 걸 확인한 셈이다.

### 그래서 진짜 이유는 세 가지로 좁혀졌다

**하나, `MySQL.Free`는 1 ECPU다.** 야간 배치가 수천 종목의 일봉을 대량 UPSERT하는데 여기서 느려진다. 반면 A1에 직접 올리면 `innodb_buffer_pool_size=2G`로 1.7 GB짜리 DB가 통째로 램에 올라간다. 디스크를 거의 안 친다.

**둘, 백업 보관이 1일이고 PITR이 없다.** 이게 더 컸다. 잘못된 배치가 데이터를 망가뜨렸는데 이틀 뒤에 알아채면 복구할 방법이 없다. 직접 설치하면 `mysqldump` gzip이 300~400 MB라 Object Storage 20 GB에 두 달치를 쌓을 수 있다. 관리형은 보관 기간을 늘리는 옵션 자체가 없다.

**셋, `docker-compose.yml`이 이미 그 구성이다.** mysql + redis + backend + frontend가 다 들어 있고 로컬에서 동작한다([함정 네 개를 잡은 기록](/post/stockanalyst-infra-oci)). 그대로 A1에 올리면 추가 작업이 거의 없다. 관리형으로 가면 compose에서 mysql을 빼고, 접속 정보를 환경변수로 갈아끼우고, VCN 보안목록을 손봐야 한다. 얻는 것에 비해 품이 든다.

**결정: A1에 직접 설치.** 다만 관리형의 장점 하나는 진짜다 — 인스턴스가 회수돼도 DB가 살아있다는 것. 이건 6절에서 따로 대응한다.

## 4. 로드밸런서는 안 쓴다

Always Free에 Flexible LB가 하나 포함되는데 **10 Mbps 제한**이 걸려 있다. 이미지가 섞인 페이지에서는 답답해질 수 있는 대역폭이다.

DNS를 인스턴스 공인 IP에 바로 붙이고 nginx + certbot으로 TLS를 끝내면 이 제한을 아예 우회한다. 아웃바운드는 월 10 TB까지 무료라 여유가 많다. 인스턴스가 하나뿐인 구성에서 LB는 부하 분산도 못 하니 실익이 없다.

## 5. 진짜 병목은 Object Storage 요청 수였다

용량이 아니라 **요청 수**다.

| | 한도 |
|---|---|
| Object Storage 용량 | 20 GB |
| **API 요청** | **50,000건/월** |

뉴스 목록 한 페이지에 이미지가 20장이면 조회 1회당 20 요청이다. 계산하면 이렇게 된다.

| 가정 | 계산 |
|---|---|
| 페이지뷰당 이미지 20장 | 요청 20건 |
| 월 50,000건 ÷ 30일 | 하루 약 1,667건 |
| ÷ 20 | **하루 83 페이지뷰**로 한도가 끝난다 |

이미지 수천 장을 넣어도 20 GB는 남아도는데, 요청 수가 먼저 바닥난다.

그래서 뉴스 이미지는 자체 스토리지에 복사하지 않고 **원본 `og:image` URL을 그대로 임베드**한다. 로드에 실패하면(`onError`) 서비스 로고로 대체한다. 이 결정을 내린 경위와 저작권 쪽 근거는 [인프라 글](/post/stockanalyst-infra-oci)에 적었는데, 무료 티어 계산을 해보고 나니 같은 결론이 다른 이유로 한 번 더 맞았다.

결과적으로 Object Storage는 야간 `mysqldump` 백업 용도로만 쓰게 됐다. 덤프는 하루 한 번이라 요청 수에 영향이 없다.

## 6. Always Free 컴퓨트는 놀고 있으면 회수된다

**7일간 CPU·네트워크·메모리 사용률이 낮으면 오라클이 인스턴스를 회수한다.** 개인 프로젝트는 상시 트래픽이 없으니 정통으로 맞는 조건이다.

DB를 인스턴스에 직접 올리기로 한 이상 이건 곧 데이터 위험이다. 3절에서 관리형 MySQL을 진지하게 고민한 유일한 이유이기도 했다. 대응은 세 겹으로 잡았다.

| # | 대응 | 무엇을 막나 |
|---|---|---|
| 1 | 헬스체크 cron | 주기적으로 CPU를 깨워 유휴 판정을 피한다 |
| 2 | 야간 `mysqldump` → Object Storage | 인스턴스를 잃어도 새로 띄워 복구 |
| 3 | 블록볼륨 백업 5개를 DB 볼륨에 배정 | 볼륨 단위 롤백 |

핵심은 2번이다. 덤프가 있으면 인스턴스 회수는 "복구 작업"이지 "데이터 손실"이 아니다. 1번은 회수를 늦추는 것뿐이고 보장은 아니다.

## 7. ARM이라 빌드 위치가 중요하다

A1은 aarch64다. **윈도우에서 빌드한 이미지는 안 뜬다.** A1 위에서 직접 빌드하거나 `docker buildx build --platform linux/arm64`를 써야 한다.

호환성은 미리 확인해 뒀다.

| | arm64 지원 |
|---|---|
| JDK 17 (Temurin/Corretto) | 지원 |
| `mysql:8.0`, `redis:7-alpine` 공식 이미지 | 지원 |
| Vite — `@rolldown/binding-linux-arm64-gnu` | 지원 |
| Tailwind v4 — `@tailwindcss/oxide-linux-arm64-gnu` | 지원 |
| 배치 — pandas, numpy, pymysql, FinanceDataReader | 지원 |

여기서 한 가지 함정이 있다. **호스트의 `node_modules`를 이미지에 복사하면 안 된다.** 윈도우에서 설치된 rolldown·tailwind 네이티브 바인딩이 리눅스에서 안 맞는다. `.dockerignore`로 제외하고 이미지 안에서 `npm ci`를 돌려야 한다. [프론트를 Vite로 옮길 때](/post/stockanalyst-frontend-rebuild) 이미 한 번 밟은 함정인데, 아키텍처가 바뀌니 같은 자리에서 또 걸릴 뻔했다.

## 8. 메모리 제한을 안 걸어두면 JVM이 호스트를 노린다

`docker-compose.yml`을 다시 보니 **`mem_limit`가 하나도 없었다.** 그런데 Dockerfile에는 이렇게 들어 있다.

```dockerfile
-XX:MaxRAMPercentage=70
```

컨테이너에 제한이 없으면 JVM이 인식하는 "가용 메모리"가 호스트 전체가 된다. 12 GB의 70%면 8.4 GB를 힙으로 잡으려 든다. MySQL과 Redis가 같이 도는 12 GB 머신에서 이러면 OOM이다. 로컬에서는 램이 넉넉해서 드러나지 않던 문제다.

<svg viewBox="0 0 760 150" width="100%" style="max-width:760px;display:block;margin:22px auto" role="img" aria-label="12기가바이트 중 8.75기가바이트를 컨테이너에 배분하고 3.25기가바이트를 남겼다">
<text x="0" y="14" font-size="13" fill="var(--color-text-muted)">A1 12 GB에 mem_limit 배분 (제한을 안 걸면 JVM 혼자 8.4 GB를 노린다)</text>
<rect x="0.0" y="30" width="251.3" height="30" rx="4" fill="var(--color-accent)" opacity="0.55"/>
<text x="126.7" y="50" font-size="12" fill="var(--color-text)" text-anchor="middle">backend 4G</text>
<rect x="253.3" y="30" width="188.0" height="30" rx="4" fill="var(--color-border-strong)" opacity="0.55"/>
<text x="348.3" y="50" font-size="12" fill="var(--color-text)" text-anchor="middle">mysql 3G</text>
<rect x="443.3" y="30" width="61.3" height="30" rx="4" fill="#d29922" opacity="0.55"/>
<text x="475.0" y="50" font-size="12" fill="var(--color-text)" text-anchor="middle">배치 1G</text>
<rect x="506.7" y="30" width="29.7" height="30" rx="4" fill="var(--color-text-dim)" opacity="0.55"/>
<rect x="538.3" y="30" width="13.8" height="30" rx="4" fill="var(--color-border-strong)" opacity="0.55"/>
<rect x="554.2" y="30" width="203.8" height="30" rx="4" fill="var(--color-border)" opacity="0.55"/>
<text x="657.1" y="50" font-size="12" fill="var(--color-text)" text-anchor="middle">여유 3.25G</text>
<text x="0" y="84" font-size="12" fill="var(--color-text-dim)">backend 4 GB — JVM 힙 약 2.5 GB</text>
<text x="0" y="102" font-size="12" fill="var(--color-text-dim)">mysql 3 GB — innodb_buffer_pool_size=2G, DB 1.7 GB가 통째로 램에</text>
<text x="0" y="120" font-size="12" fill="var(--color-text-dim)">배치 1 GB · redis 512 MB(maxmemory 256mb) · nginx 256 MB</text>
<text x="0" y="138" font-size="12" fill="var(--color-text-dim)">합계 약 8.75 GB / 12 GB</text>
</svg>

| 서비스 | mem_limit | 비고 |
|---|---|---|
| backend | 4 GB | JVM 힙 약 2.5 GB |
| mysql | 3 GB | `innodb_buffer_pool_size=2G` — DB 1.7 GB가 통째로 램에 |
| 배치 (cron) | 1 GB | |
| redis | 512 MB | `maxmemory 256mb` |
| frontend (nginx) | 256 MB | |
| **합계** | **약 8.75 GB / 12 GB** | 여유 3.25 GB |

CPU·메모리는 결국 여유가 많다. 처음 걱정했던 것과 정반대였다.

## 9. 배포 전에 코드에서 고쳐야 했던 것

### `ddl-auto`

로컬 개발용으로 `update`를 쓰고 있었다. 운영에 이대로 올리면 엔티티를 수정할 때마다 스키마가 말없이 바뀐다. `create`였다면 **재시작마다 전 테이블이 DROP**되니 더 심각하다.

`validate`로 바꾸고 스키마 변경은 Flyway로 관리하는 게 맞다. `validate`는 엔티티와 실제 스키마가 어긋나면 기동을 막아주기 때문에, 배포 후 스키마 드리프트를 조기에 잡아준다.

### 시크릿

외부 API 키와 DB 비밀번호가 설정 파일에 평문으로 있었고, 그게 그대로 jar에 들어가 도커 이미지에 구워지고 있었다. **이미지를 공개 레지스트리에 올리는 순간 키가 공개된다.** 파일 분리 자체는 [보안과 설정 글](/post/stockanalyst-security-config)에서 이미 한 작업인데, 배포에서는 한 겹이 더 필요하다.

환경변수나 **OCI Vault**(Always Free로 시크릿 150개)로 빼는 게 맞다. 그리고 커밋 이력에 올라간 적이 있는 키는 빼는 것만으로 부족하고 로테이션해야 한다.

한 가지 더 배운 것 — 설정 파일의 값은 같은 이름의 환경변수로 항상 덮이지 않는다. `spring.datasource.password`가 파일에 리터럴로 있으면 임의로 정한 `DB_PASSWORD`로는 안 덮이고, 스프링 표준 키인 `SPRING_DATASOURCE_PASSWORD`로 줘야 우선순위가 먹는다.

## 10. 최종 구성

<svg viewBox="0 0 760 208" width="100%" style="max-width:760px;display:block;margin:22px auto" role="img" aria-label="A1 인스턴스 한 대에 nginx, Spring Boot, MySQL, Redis, 파이썬 배치가 올라가고 Object Storage는 백업만 받는다">
<text x="0" y="14" font-size="13" fill="var(--color-text-muted)">최종 구성 — Ampere A1 한 대 (2 OCPU / 12 GB, Oracle Linux 9 aarch64)</text>
<rect x="0" y="24" width="530" height="160" rx="10" fill="var(--color-text)" opacity="0.04"/>
<rect x="14" y="38" width="250" height="50" rx="8" fill="var(--color-accent-soft)" stroke="var(--color-accent)"/>
<text x="139.0" y="59" font-size="13" fill="var(--color-text)" text-anchor="middle" font-weight="600">nginx</text>
<text x="139.0" y="76" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">React 정적 + 리버스 프록시 + TLS</text>
<rect x="278" y="38" width="238" height="50" rx="8" fill="var(--color-accent-soft)" stroke="var(--color-accent)"/>
<text x="397.0" y="59" font-size="13" fill="var(--color-text)" text-anchor="middle" font-weight="600">Spring Boot 4</text>
<text x="397.0" y="76" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">JDK 17 aarch64</text>
<rect x="14" y="100" width="164" height="50" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="96.0" y="121" font-size="13" fill="var(--color-text)" text-anchor="middle" font-weight="600">MySQL 8</text>
<text x="96.0" y="138" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">buffer pool 2G</text>
<rect x="190" y="100" width="150" height="50" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="265.0" y="121" font-size="13" fill="var(--color-text)" text-anchor="middle" font-weight="600">Redis 7</text>
<text x="265.0" y="138" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">maxmemory 256mb</text>
<rect x="352" y="100" width="164" height="50" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="434.0" y="121" font-size="13" fill="var(--color-text)" text-anchor="middle" font-weight="600">파이썬 배치</text>
<text x="434.0" y="138" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">cron · 야간 수집</text>
<path d="M530 125h26m-7-5l7 5-7 5" stroke="var(--color-text-dim)" stroke-width="1.5" fill="none"/>
<rect x="564" y="100" width="196" height="50" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="662" y="121" font-size="13" fill="var(--color-text)" text-anchor="middle">Object Storage</text>
<text x="662" y="138" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">mysqldump 백업만</text>
<text x="0" y="202" font-size="12" fill="var(--color-text-dim)">로드밸런서는 쓰지 않는다 — Always Free LB는 10 Mbps 제한이라 DNS를 공인 IP에 직접 붙이는 편이 빠르다</text>
</svg>

## 체크리스트

배포를 준비한다면 이 순서로 확인하면 된다. 위에서 아래로 갈수록 되돌리기 쉬워진다.

- [ ] **홈 리전 확인** — 춘천이면 A1을 못 쓴다. 여기서 막히면 나머지가 무의미
- [ ] A1 인스턴스 생성 — "Out of host capacity"가 자주 뜬다. 될 때까지 재시도
- [ ] `ddl-auto`를 `validate`로, 스키마는 Flyway로
- [ ] 시크릿을 환경변수/OCI Vault로 분리, 노출된 키 로테이션
- [ ] `docker-compose.yml`에 `mem_limit` 추가
- [ ] `.dockerignore`에 `node_modules` — ARM에서 네이티브 바인딩이 깨진다
- [ ] A1 위에서 빌드하거나 `buildx --platform linux/arm64`
- [ ] `mysqldump` → A1 이관
- [ ] nginx + certbot TLS (LB는 10 Mbps 제한이라 생략)
- [ ] 야간 백업 cron + 유휴 회수 방지 헬스체크

## 마치며

준비하면서 제일 크게 배운 건 **짐작한 병목과 실제 병목이 달랐다**는 점이다.

<svg viewBox="0 0 760 262" width="100%" style="max-width:760px;display:block;margin:22px auto" role="img" aria-label="CPU 메모리와 DB 용량은 한도에 한참 못 미치는데 Object Storage 요청 수만 한도를 가득 채운다">
<text x="0" y="14" font-size="13" fill="var(--color-text-muted)">각 한도를 얼마나 쓰는가 — 걱정한 축과 실제로 조이는 축</text>
<text x="0" y="46" font-size="13" fill="var(--color-text)" font-weight="600">CPU · 메모리</text>
<text x="760" y="46" font-size="11" fill="var(--color-text-dim)" text-anchor="end">12 GB 중 8.75 GB 배분</text>
<rect x="0" y="54" width="760" height="20" rx="5" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<rect x="0" y="54" width="557.3" height="20" rx="5" fill="var(--color-accent)" opacity="0.5"/>
<text x="565" y="68" font-size="12" fill="var(--color-text)" text-anchor="start" font-weight="600">73%</text>
<text x="0" y="90" font-size="12" fill="var(--color-text-dim)">여유 3.25 GB</text>
<text x="0" y="120" font-size="13" fill="var(--color-text)" font-weight="600">DB 용량</text>
<text x="760" y="120" font-size="11" fill="var(--color-text-dim)" text-anchor="end">MySQL HeatWave 50 GB 한도</text>
<rect x="0" y="128" width="760" height="20" rx="5" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<rect x="0" y="128" width="25.7" height="20" rx="5" fill="var(--color-accent)" opacity="0.5"/>
<text x="34" y="142" font-size="12" fill="var(--color-text)" text-anchor="start" font-weight="600">3.4%</text>
<text x="0" y="164" font-size="12" fill="var(--color-text-dim)">실측 1.69 GB</text>
<text x="0" y="194" font-size="13" fill="var(--color-text)" font-weight="600">Object Storage 요청</text>
<text x="760" y="194" font-size="11" fill="var(--color-text-dim)" text-anchor="end">월 50,000건 · 하루 83 페이지뷰면 소진</text>
<rect x="0" y="202" width="760" height="20" rx="5" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<rect x="0" y="202" width="760.0" height="20" rx="5" fill="#e5534b" opacity="0.85"/>
<text x="752" y="216" font-size="12" fill="var(--color-bg-elevated)" text-anchor="end" font-weight="600">100%</text>
<text x="0" y="238" font-size="12" fill="var(--color-text-dim)">여기서 먼저 끝난다</text>
</svg>

- 걱정했던 CPU·메모리 → 12 GB 중 8.75 GB로 여유
- 걱정했던 DB 용량 → 50 GB 한도의 3.4%
- 실제 병목 → Object Storage **요청 수**, 그리고 홈 리전이라는 되돌릴 수 없는 제약

무료 티어는 "얼마나 주느냐"보다 **"어떤 축에서 조이느냐"**를 보는 게 맞다. 용량은 넉넉한데 요청 수로 조이고, CPU는 여유로운데 유휴 회수로 조이고, 리전은 아예 되돌릴 수가 없다.

그리고 아키텍처 결정은 재보고 하자. DB 용량을 짐작으로 판단했다면 근거가 틀린 채로 결론만 우연히 맞는 상태가 됐을 것이다.

> 이 글의 무료 티어 수치는 2026년 9월 기준이다. 오라클은 공지 없이 문서만 고친 전례가 있으니, 실제 진행 전에 오라클 공식 문서의 Always Free Resources 페이지에서 직접 확인하는 걸 권한다.
