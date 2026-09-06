---
title: StockAnalyst 부하테스트로 잡은 연결 누수 - 502의 범인은 백엔드가 아니었다
date: 2026-09-07
category: stockanalyst
src: cover.svg
tags: [stockanalyst, k6, 부하테스트, nginx, keepalive, TIME_WAIT, 502, 트러블슈팅]
summary: 50VU 씩 올리다 200VU 에서 502 가 터졌다. Tomcat 스레드를 늘리려다 멈추고 로그를 뒤졌더니 백엔드는 멀쩡했고, nginx 가 요청마다 새 연결을 열고 닫아 임시 포트를 다 써 버린 것이었다. 실패율 43% 에서 0% 까지, 잘못 짚을 뻔한 순간들과 함께 그 과정을 순서대로 적었다.
---

> StockAnalyst 는 Spring Boot + React(Vite) + Python 파이프라인으로 만든 주식 정보 서비스다. 전체 구조는 [개발기 (2) 목차](/post/stockanalyst-dev-log-2-overview)에 있다. [앞 글](/post/stockanalyst-inference-concurrency)에서 ONNX 추론과 스레드풀을 묶은 뒤 "그래서 몇 명까지 받을 수 있나"를 재려고 k6 를 돌렸는데, 그 과정에서 세마포어와는 아무 상관없는 문제가 하나 튀어나왔다. 이 글은 그 문제를 찾아가는 과정의 기록이다. 결론만 보면 nginx 설정 세 줄인데, 거기까지 가는 동안 세 번은 엉뚱한 곳을 짚을 뻔했다.

한눈에 보기

- 40VU 까지는 실패 0, p95 32ms 였는데 400VU 로 올리자 실패율 43%. 그중 절반은 테스트 도중 만료된 토큰 때문이었다. 요약에 상태코드를 안 찍어서 처음엔 몰랐다
- 상태코드를 찍고 다시 보니 전부 502. 50VU 씩 올려 보니 150 까지 실패 0, 200 부터 실패 시작. 같은 순간 `docker stats` 에서 정적 파일과 프록시만 하는 nginx 가 CPU 370%
- nginx 로그에 `[error]` 는 없었다. `[crit] connect() ... failed (99: Address not available)`, 백엔드로 새 연결을 열 임시 포트가 바닥난 것이다. `proxy_pass` 는 기본으로 요청마다 연결을 새로 열고 닫는다
- `upstream ... keepalive 64` + `proxy_http_version 1.1` + `Connection ""` 세 줄로 168,534 요청 실패 0. 벽은 300VU 의 CPU 포화로 밀렸다
- 메모리 누수가 아니라 연결 누수였다. 요청이 끝나도 소켓은 60초 동안 TIME_WAIT 로 남고, 그게 초당 500개씩 쌓이면 28,000개 포트가 1분 만에 찬다

## 1. 출발점, 40VU 는 너무 쉬웠다

세마포어를 넣은 뒤 k6 로 홈, 종목 상세, 공매도 세 화면을 섞어 10, 20, 40VU 순서로 4분을 돌렸다. 11,507 요청에 실패 0, p95 32ms. 목표로 잡았던 홈 1.5초, 상세 2.5초와 자릿수가 두 개 차이났다. "40명은 문제없다"는 알았는데 상한이 어디인지는 모르는 상태였다.

그래서 단계를 하나 더 만들었다. 100, 200, 400VU 로 5분. 이름은 `stress`.

## 2. 첫 번째 결과, 실패율 43%인데 무엇이 실패했나

```
=== 요약 ===
요청 173461건 · 실패율 43.29%
홈       p95 297ms · max 2671ms
종목상세 p95 296ms · max 2112ms   (캔들 p95 518ms · max 2112ms)
공매도   p95 236ms · max 1747ms
실패한 요청:
  x candles 2xx  실패 2884 / 성공 6421
  x macro 2xx  실패 3364 / 성공 5941
  ...
  x signals 2xx  실패 9305 / 성공 0
  x accuracy 2xx  실패 9305 / 성공 0
  x short-market 2xx  실패 3066 / 성공 0
  x short-us 2xx  실패 3066 / 성공 0
```

여기서 첫 번째로 잘못 짚을 뻔했다. 43% 는 "서버가 400VU 를 못 버틴다"로 읽히기 딱 좋은 숫자다. 그런데 목록을 다시 보면 이상한 게 있다. 네 개 요청(`signals`, `accuracy`, `short-market`, `short-us`)은 성공이 0 이고, 나머지는 전부 30~38% 로 고르게 실패했다. 서버가 과부하라면 성공 0 인 요청이 따로 있을 이유가 없다.

그 네 개의 공통점은 로그인이 필요한 API 라는 것이었다. 액세스 토큰은 30분짜리인데, 테스트를 준비하며 복사해 둔 토큰이 실행 시점에 이미 만료되어 있었다. 발급 22:31, 만료 23:01, 실행 23:03. 네 요청은 시작부터 끝까지 전부 401 이었다.

이걸 바로 알아채지 못한 이유는 요약에 상태코드가 없었기 때문이다. "실패 9305 / 성공 0" 만으로는 401 인지 502 인지 알 수 없다. 스크립트에 상태코드별 카운터를 넣었고(이 얘기는 [다음 글](/post/stockanalyst-k6-script-tips)에서 다룬다), 토큰의 `exp` 를 시작 전에 읽어 남은 시간이 테스트 길이보다 짧으면 실행을 막게 했다.

401 을 빼고 다시 계산하면 실제 실패율은 26% 정도. 여전히 높지만 이제 "무엇이" 실패했는지 볼 차례였다.

## 3. 두 번째 결과, 전부 502

새 토큰으로 다시 돌렸다.

```
요청 161811건 · 실패율 29.47%
실패 상태코드:
  status 502   x 47685  (nginx→백엔드 연결 실패)
```

401 은 사라졌고 남은 실패는 한 종류, 502 였다. 이게 두 번째 갈림길이다. 502 는 nginx 가 백엔드에 붙지 못했다는 뜻이고, 504 는 붙었는데 응답이 늦었다는 뜻이다. 504 가 하나도 없다는 건 백엔드가 느려서 생긴 문제가 아니라는 뜻이다. 실제로 성공한 요청만 보면 p95 300ms 로 멀쩡했다.

이때 `docker stats` 를 같이 보고 있었다.

| 컨테이너 | CPU | 메모리 |
|---|---|---|
| backend (Spring) | 461% | 2.5GB / 4GB |
| frontend (nginx) | 370% | 43MB / 256MB |
| mysql | 200% | 2.6GB / 4GB |
| redis | 3% | 6MB |

백엔드 461% 는 이해가 된다. 초당 500 요청을 받으면서 JSON 을 만들고 gzip 을 하니까. MySQL 200% 도 그렇다. 그런데 nginx 370% 는 설명이 안 됐다. nginx 가 하는 일은 정적 파일을 주고 `/api/` 를 백엔드로 넘기는 것뿐이다. 그 일에 코어 네 개가 필요할 리 없다.

여기서 세 번째로 잘못 짚을 뻔했다. 502 를 보고 처음 떠올린 건 "Tomcat 이 연결을 거절하나?" 였다. Tomcat 기본값은 요청 스레드 200개, 대기열 100개. 400VU 가 6개씩 병렬로 던지면 2,400 연결이니 넘칠 만하다고 생각했다. `server.tomcat.accept-count` 를 올리려다 멈춘 건, 그러면 nginx 의 370% 가 설명되지 않기 때문이었다. 거절당하는 쪽이 아니라 거절하는 쪽이 바쁠 이유가 없다.

## 4. 어디서 꺾이는지, 50VU 씩

100, 200, 400 은 계단이 너무 커서 어디서 시작되는지 안 보였다. 50VU 씩 8단계로 400 까지 올리면서, 요청마다 그 순간의 활성 VU 를 태그해 단계별로 갈라 봤다.

| 활성 VU | 요청 | 실패 | p95 |
|---|---|---|---|
| 50 이하 | 5,345 | 0% | 45ms |
| 100 이하 | 10,872 | 0% | 40ms |
| 150 이하 | 16,720 | 0% | 57ms |
| 200 이하 | 22,298 | 13.0% | 112ms |
| 250 이하 | 24,767 | 23.2% | 680ms |
| 300 이하 | 29,919 | 42.2% | 608ms |
| 400 이하 | 34,716 | 44.2% | 1,315ms |

150 까지는 아무 일도 없다가 200 에서 갑자기 13% 다. p95 는 57 에서 112ms 로 거의 안 움직였다. 천천히 나빠지는 게 아니라 어떤 한도에 닿는 순간 툭 끊기는 모양이다. 150VU 에서 200VU 로 넘어가는 구간의 처리량은 초당 470~520 요청이었다. 이 숫자를 기억해 두자.

## 5. 로그에 `[error]` 가 없다

nginx 컨테이너 로그를 열었다. 처음 필터는 당연히 `[error]` 였다.

```
docker compose logs frontend --since 40m | findstr /c:"[error]"
```

아무것도 없었다. 502 가 47,000번 났는데 에러 로그가 한 줄도 없다. 대신 `[warn]` 이 수천 줄이었다.

```
[warn] an upstream response is buffered to a temporary file /var/cache/nginx/proxy_temp/1/00/0000000001
       while reading upstream, request: "GET /api/v1/stockcandledaily/all?page=0&size=10000&stock_code=AAPL"
```

이건 502 와 무관한 별개의 발견이다. 캔들 1만 행 응답(gzip 후 수백 KB)이 nginx 기본 프록시 버퍼(8 x 4KB)보다 커서 매번 디스크 임시파일을 거치고 있었다. 부하를 걸지 않았으면 몰랐을 것이고, `proxy_buffers 16 128k` 로 고쳤다. 하지만 502 의 원인은 아니었다.

`[error]` 가 없다면 nginx 는 이 오류를 다른 레벨로 찍는다는 뜻이다. `[crit]` 과 `[alert]` 를 찾았다.

```
[crit] 40#40: *14080 connect() to 172.18.0.4:80 failed (99: Address not available)
       while connecting to upstream, client: 172.18.0.1, server: _,
       request: "GET /api/v1/news/by-ticker?ticker=051910&limit=8 HTTP/1.1",
       upstream: "http://172.18.0.4:80/api/v1/news/by-ticker?ticker=051910&limit=8"
```

`connect() failed (99)`. errno 99 는 `EADDRNOTAVAIL`, 새 소켓을 열 로컬 주소(포트)가 없다는 뜻이다. 연결이 거절된 게(`111: Connection refused`) 아니라, 거절당하기 전에 nginx 쪽에서 연결을 시도조차 못 한 것이다. nginx 는 이 오류를 `[crit]` 으로 찍는다. `[error]` 만 찾았으면 계속 못 봤을 것이다.

## 6. 왜 포트가 바닥나는가

이제 그림이 맞춰진다.

<svg viewBox="0 0 760 300" width="100%" style="max-width:760px;display:block;margin:24px auto" role="img" aria-label="nginx 가 요청마다 백엔드로 새 연결을 열고 닫으면 닫힌 소켓이 TIME_WAIT 로 60초 남는다. 초당 500 요청이면 60초 뒤 30,000개가 쌓여 임시 포트 28,000개를 넘는다">
  <g font-size="12" fill="var(--color-text)">
    <rect x="20" y="30" width="120" height="44" rx="8" fill="var(--color-accent-soft)" stroke="var(--color-accent)"/>
    <text x="80" y="57" text-anchor="middle">k6 (400VU)</text>
    <rect x="240" y="30" width="120" height="44" rx="8" fill="var(--color-accent-soft)" stroke="var(--color-accent)"/>
    <text x="300" y="57" text-anchor="middle">nginx</text>
    <rect x="600" y="30" width="120" height="44" rx="8" fill="var(--color-accent-soft)" stroke="var(--color-accent)"/>
    <text x="660" y="57" text-anchor="middle">backend:80</text>
    <path d="M140 52 H236" stroke="var(--color-text-dim)" stroke-width="1.5" marker-end="url(#arr-pl)"/>
    <text x="188" y="44" text-anchor="middle" fill="var(--color-text-dim)" font-size="11">keepalive (재사용)</text>
    <path d="M360 44 H596" stroke="#e5534b" stroke-width="1.5" marker-end="url(#arr-pl)"/>
    <path d="M360 60 H596" stroke="#e5534b" stroke-width="1.5" marker-end="url(#arr-pl)"/>
    <text x="478" y="36" text-anchor="middle" fill="#e5534b" font-size="11">요청마다 새 연결을 열고 닫음 (HTTP/1.0)</text>
  </g>
  <defs><marker id="arr-pl" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="var(--color-text-dim)"/></marker></defs>
  <g font-size="11" fill="var(--color-text-dim)">
    <text x="20" y="120">nginx 쪽 임시 포트 (32768~60999, 약 28,000개)</text>
    <rect x="20" y="130" width="720" height="26" rx="4" fill="none" stroke="var(--color-border)"/>
    <rect x="20" y="130" width="720" height="26" rx="4" fill="#e5534b" opacity="0.18"/>
    <text x="380" y="147" text-anchor="middle" fill="var(--color-text)">TIME_WAIT 소켓, 닫힌 뒤 60초 동안 포트를 점유</text>
    <text x="20" y="190">초당 500 요청 x 60초 = 30,000 &gt; 28,000</text>
    <text x="20" y="210">60초 안에 포트가 바닥나고, 그다음 connect() 는 EADDRNOTAVAIL(99)</text>
    <text x="20" y="230">nginx 는 502 를 돌려주고, 백엔드는 그 요청을 본 적도 없다</text>
    <text x="20" y="270" fill="var(--color-text)">150VU 까지 멀쩡하고 200VU 에서 툭 끊긴 이유: 임계값이 초당 467 요청(28,000 나누기 60초)이다</text>
  </g>
</svg>

nginx 의 `proxy_pass` 는 기본으로 업스트림에 HTTP/1.0 으로 붙고 keepalive 를 쓰지 않는다. API 요청 하나마다 `backend:80` 에 `connect()` 하고, 응답을 받으면 `close()` 한다. TCP 에서 먼저 닫는 쪽의 소켓은 바로 사라지지 않고 TIME_WAIT 상태로 60초를 머문다(늦게 도착하는 패킷을 처리하기 위한 규약이다). 그동안 그 포트는 다시 못 쓴다.

임시 포트 범위는 리눅스 기본 32768~60999, 약 28,000개. 초당 N 요청이면 60초 뒤 60N 개가 TIME_WAIT 로 쌓인다. 60N 이 28,000 을 넘는 N 은 467. 4절에서 실패가 시작된 구간의 처리량이 초당 470~520 이었다. 계산이 맞는다.

nginx 의 CPU 370% 도 여기서 나온다. 초당 500번 3-way handshake 를 하고 500번 4-way close 를 하는 비용이다. 커널이 그 일을 하고 있었고, `docker stats` 는 그걸 nginx 컨테이너 몫으로 보여준 것이다.

이건 메모리 누수처럼 무언가가 계속 남아 있는 종류의 누수는 아니다. 60초가 지나면 알아서 회수된다. 하지만 회수되는 속도보다 쓰는 속도가 빠르면 누수와 똑같이 동작한다. 자원이 "돌아오지 않는" 게 아니라 "제때 돌아오지 않는" 것이고, 그 임계값이 초당 467 이라는 아주 구체적인 숫자로 나타났다.

## 7. 고치기, 세 줄

```nginx
upstream backend_api {
    server backend:80;
    keepalive 64;
    keepalive_requests 1000;
    keepalive_timeout 60s;
}
location /api/ {
    proxy_pass http://backend_api;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
    ...
}
```

`upstream` 블록에 `keepalive` 를 주면 nginx 워커가 백엔드와의 연결을 닫지 않고 풀에 넣어 뒀다가 다음 요청에 재사용한다. 64 는 워커당 열어 두는 유휴 연결 수다. 그러려면 두 가지가 더 필요하다. HTTP/1.1 이어야 하고(`proxy_http_version 1.1`, keepalive 는 1.1 부터다), 클라이언트가 보낸 `Connection: close` 헤더를 백엔드로 그대로 넘기면 백엔드가 연결을 닫아 버리니 빈 값으로 덮어야 한다(`proxy_set_header Connection ""`). 세 개 중 하나라도 빠지면 keepalive 가 동작하지 않는다.

백엔드 코드는 한 줄도 안 바뀌었다. Tomcat 설정도 그대로다.

## 8. 고친 뒤

같은 step 을 다시 돌렸다.

| 활성 VU | 실패 (전 / 후) | p95 (전 / 후) |
|---|---|---|
| 150 이하 | 0% / 0% | 57 / 43ms |
| 200 이하 | 13% / 0% | 112 / 62ms |
| 250 이하 | 23% / 0% | 680 / 271ms |
| 300 이하 | 42% / 0% | 608 / 1,360ms |
| 350 이하 | 35% / 0% | 885 / 2,875ms |
| 400 이하 | 44% / 0% | 1,315 / 1,163ms |

168,534 요청, 실패 0. 502 는 완전히 사라졌다.

<svg viewBox="0 0 760 210" width="100%" style="max-width:760px;display:block;margin:24px auto" role="img" aria-label="활성 VU 별 실패율. 고치기 전에는 200VU 부터 13%에서 44% 까지 오르고, 고친 뒤에는 전 구간 0%">
  <g font-size="11" fill="var(--color-text-dim)">
    <line x1="60" y1="160" x2="740" y2="160" stroke="var(--color-border)"/>
    <line x1="60" y1="20" x2="60" y2="160" stroke="var(--color-border)"/>
    <text x="14" y="164">0%</text><text x="8" y="94">25%</text><text x="8" y="26">50%</text>
    <text x="84" y="178">50</text><text x="164" y="178">100</text><text x="244" y="178">150</text><text x="324" y="178">200</text><text x="404" y="178">250</text><text x="484" y="178">300</text><text x="564" y="178">350</text><text x="644" y="178">400</text><text x="700" y="178">VU</text>
  </g>
  <g fill="#e5534b" opacity="0.7">
    <rect x="316" y="123.6" width="22" height="36.4"/><rect x="396" y="95" width="22" height="65"/><rect x="476" y="41.8" width="22" height="118.2"/><rect x="556" y="62.3" width="22" height="97.7"/><rect x="636" y="36.2" width="22" height="123.8"/>
  </g>
  <g fill="var(--color-accent)">
    <rect x="100" y="157" width="22" height="3" rx="1"/><rect x="180" y="157" width="22" height="3" rx="1"/><rect x="260" y="157" width="22" height="3" rx="1"/><rect x="340" y="157" width="22" height="3" rx="1"/><rect x="420" y="157" width="22" height="3" rx="1"/><rect x="500" y="157" width="22" height="3" rx="1"/><rect x="580" y="157" width="22" height="3" rx="1"/><rect x="660" y="157" width="22" height="3" rx="1"/>
  </g>
  <g font-size="11" fill="var(--color-text-dim)">
    <text x="312" y="118">13%</text><text x="392" y="89">23%</text><text x="472" y="36">42%</text><text x="552" y="57">35%</text><text x="632" y="31">44%</text>
    <rect x="470" y="196" width="12" height="8" fill="#e5534b" opacity="0.7"/><text x="486" y="204">고치기 전 (502)</text>
    <rect x="600" y="196" width="12" height="8" fill="var(--color-accent)"/><text x="616" y="204">고친 뒤, 0%</text>
  </g>
</svg>

대신 벽의 모양이 바뀌었다. 250 부터 p95 가 오르고 300 에서 1초를 넘는다. 이번엔 거절이 아니라 대기다. 백엔드와 MySQL 이 같은 12코어를 다 써서 요청이 줄을 서는 것이고, 이건 코드가 아니라 코어의 문제다. 실사용자는 이 스크립트의 VU 보다 10배쯤 느긋하게 움직이니(화면 사이 1~5초 vs 수십 초) 200VU 는 동시 접속자 1,500명 안팎에 해당한다. 개인 프로젝트로는 한참 여유다.

## 9. 되돌아보면

세 번 엉뚱한 곳을 짚을 뻔했고, 매번 멈춰 세운 건 설명되지 않는 숫자 하나였다.

| 순간 | 짚을 뻔한 것 | 멈춰 세운 것 |
|---|---|---|
| 실패율 43% | 서버가 400VU 를 못 버틴다 | 성공 0 인 요청이 딱 4개. 과부하는 그렇게 안 생긴다 |
| 502 47,000건 | Tomcat 스레드, 대기열 부족 | 거절당하는 쪽(nginx)이 CPU 370% 일 이유가 없다 |
| `[error]` 로그 0건 | 로그가 안 남는 종류의 문제 | 502 가 47,000번인데 로그가 없을 리 없다. 다른 레벨을 봐야 한다 |

거꾸로 말하면, 부하테스트에서 제일 먼저 갖춰야 하는 건 높은 VU 가 아니라 실패를 상태코드별로 세는 것, 그리고 부하 중에 `docker stats` 와 로그를 같이 보는 것이다. 그 둘이 없었으면 "Tomcat 스레드 400개로 올림" 이라는 커밋을 남기고, 502 는 그대로였을 것이다.

그리고 부하를 걸어야만 보이는 것이 있다. 요청마다 연결을 새로 여는 건 초당 100 요청에서는 아무 증상이 없다. 임시 포트 28,000개를 60초 안에 쓰려면 초당 467 이 필요하고, 그 숫자는 사용자 한 명이 아무리 열심히 클릭해도 만들 수 없다. 캔들 응답이 매번 디스크를 거치던 것도 마찬가지다. 둘 다 서비스를 만든 뒤 처음으로 부하를 건 날 한꺼번에 나왔다.

스크립트를 어떻게 짰는지, 상태코드별 카운터와 VU 단계별 표를 k6 요약에 어떻게 넣었는지는 [다음 글](/post/stockanalyst-k6-script-tips)에 따로 적었다.
