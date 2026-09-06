---
title: StockAnalyst k6 부하테스트 스크립트에서 배운 것 - 숫자보다 먼저 갖춰야 하는 것들
date: 2026-09-08
category: stockanalyst
src: cover.svg
tags: [stockanalyst, k6, 부하테스트, 성능, 스크립트, javascript]
summary: 처음 짠 부하테스트 스크립트는 실패율 5%를 보여주면서 그게 URL 인코딩 문제인지 서버 문제인지 말해 주지 않았다. 세 번 고쳐 쓰면서 정리한 것. 화면 단위로 묶기, 실패를 상태코드로 세기, VU 단계별 표를 요약에 넣기, 시작 전에 입력을 검증하기, 외부 호출 경로를 끄기. k6 코드와 함께.
---

> StockAnalyst 서버의 수용 인원을 재려고 k6 스크립트를 하나 짰다. 부하를 걸게 된 계기는 [세마포어 글](/post/stockanalyst-inference-concurrency)이고, 돌린 결과는 [502 추적기](/post/stockanalyst-loadtest-port-leak)에 있다. 결과 못지않게 스크립트 자체를 세 번이나 고쳐 쓴 과정에서 배운 게 많았고, 이 글은 그 정리다. 프로젝트에 붙어 있는 이야기지만 k6 스크립트를 처음 짜는 사람이라면 그대로 가져다 써도 되게 썼다.

한눈에 보기

- 엔드포인트 하나를 때리지 말고 화면 하나가 부르는 요청 묶음을 그대로 보낸다. `http.batch` + `group` + `tags`
- `check` 만으로는 부족하다. 실패를 상태코드별로 세어야 401(토큰)과 502(연결)와 504(느림)가 갈린다. 태그 붙인 Counter 하나는 요약에 안 풀리니 코드마다 Counter 를 따로 둔다
- 요청마다 그 순간의 활성 VU 를 태그하고, 항상 통과하는 threshold 를 걸어 두면 `handleSummary` 에서 VU 단계별 실패율과 p95 표를 만들 수 있다. 상한이 어디인지 이 표 하나로 보인다
- 시작 전에 막을 수 있는 건 막는다. 토큰 `exp` 검사, 한글 URL 인코딩, 외부 API 를 부르는 경로 끄기
- smoke, ramp, step, soak 순서. 첫 실행은 항상 5VU 1분이다. 스크립트 버그를 400VU 에서 찾고 싶지 않다면

## 1. 무엇을 때릴 것인가, 엔드포인트가 아니라 화면

처음 떠올리기 쉬운 건 "제일 무거운 API 하나를 골라 VU 를 올린다"이다. 그런데 그러면 두 가지를 놓친다. 실제 사용자는 화면 하나를 열 때 요청을 7~13개 동시에 보내고, 그 요청들은 서로 다른 테이블, 캐시, 외부 API 를 건드린다. 하나만 때리면 그 하나의 한계는 알 수 있어도 화면이 열리는 시간은 모른다.

그래서 스크립트의 단위를 화면으로 잡았다. 프론트 코드에서 페이지가 마운트될 때 부르는 요청을 순서대로 옮겨 적은 것이다.

```js
export function home() {
  const t0 = Date.now();
  group("home", () => {
    const reqs = [
      ["GET", `${BASE}/api/v1/market/indices`, null, params("home", "indices")],
      ["GET", `${BASE}/api/v1/market/fx`, null, params("home", "fx")],
      ["GET", `${BASE}/api/v1/rank/fluctuation-rank?marketType=0000&rankType=0`, null, params("home", "rank-kr")],
      ["GET", `${BASE}/api/v1/news/search?query=${encodeURIComponent("주식")}&display=4&page=1`, null, params("home", "news-search")],
      ["GET", `${BASE}/api/v1/opinions/changes/recent?days=7&limit=40`, null, params("home", "opinion-recent")],
      ["GET", `${BASE}/api/v1/market/dow-theory`, null, params("home", "dow")],
    ];
    const res = http.batch(reqs);
    res.forEach((r, i) => ok(r, reqs[i][3].tags.name));
  });
  pageTime.add(Date.now() - t0, { page: "home" });
  sleep(1 + Math.random() * 2);
}
```

`http.batch` 는 브라우저처럼 요청을 병렬로 보낸다(기본 호스트당 6개). `group` 은 요약에서 화면 단위로 묶어 주고, `params()` 가 붙이는 `tags: { page, name }` 이 나중에 "홈의 p95" 와 "캔들 요청의 p95" 를 따로 뽑는 열쇠다. `pageTime` 은 묶음 전체가 끝나기까지의 시간이다. 사용자가 실제로 기다리는 시간은 요청 하나의 p95 가 아니라 이것이다.

종목 상세는 캔들 1만 행을 먼저 받고(차트가 먼저 그려져야 하니까) 나머지를 묶어 보내는 식으로, 프론트의 순서를 그대로 따랐다. 국내와 해외 종목은 부르는 API 가 달라서 절반씩 섞었다.

마지막에 세 화면을 사용자 행동 비율로 섞는다.

```js
export default function () {
  const r = Math.random();
  if (r < 0.4) home();
  else if (r < 0.85) stockDetail();
  else shortSale();
}
```

## 2. 생각하는 시간, VU 는 사람이 아니다

각 화면 끝의 `sleep(1 + Math.random() * 2)` 가 "생각하는 시간"이다. 이게 없으면 VU 하나가 초당 수십 화면을 열고, 40VU 가 4,000명처럼 보인다. 반대로 너무 길면 400VU 로도 부하가 안 걸린다.

이 스크립트는 1~5초로 잡았다. 실제 사용자는 차트 한 장을 열어 놓고 몇십 초를 보니 VU 가 사람보다 10배쯤 공격적이다. 그래서 결과를 읽을 때 "200VU 에서 p95 62ms" 를 "동시 접속자 200명" 으로 옮기면 안 되고, 1,500명 안팎으로 읽어야 한다. VU 와 사람의 환산 비율은 스크립트를 짤 때 정해지는 것이라, 결과 보고서에 그 비율을 같이 적어야 한다.

## 3. 실패는 상태코드로 센다

첫 실행 결과가 이랬다.

```
요청 11507건 · 실패율 5.20%
```

5% 가 무엇인지 알 수 없었다. `check` 는 통과와 실패만 세고 `http_req_failed` 는 비율만 준다. 어느 요청이, 어떤 상태코드로 실패했는지가 없으면 그다음 행동을 정할 수 없다. 이 5% 는 결국 k6 가 URL 의 한글을 인코딩하지 않아 톰캣이 400 으로 거절한 것이었는데, 그걸 아는 데 한참 걸렸다.

두 번째 시도는 태그를 붙인 Counter 였다.

```js
const failStatus = new Counter("fail_status");
if (!passed) failStatus.add(1, { name, status: String(res.status) });
```

이건 요약에 안 나온다. k6 는 태그별 서브메트릭을 `handleSummary` 의 `data.metrics` 에 넣어 주지 않는다(threshold 가 걸린 조합만 예외인데, 4절에서 이 성질을 거꾸로 이용한다). 결국 상태코드마다 Counter 를 따로 만들었다.

```js
const STATUS_KEYS = ["0", "400", "401", "403", "404", "429", "500", "502", "503", "504", "other"];
const failByStatus = Object.fromEntries(STATUS_KEYS.map((k) => [k, new Counter(`fail_status_${k}`)]));

function ok(res, name) {
  const passed = check(res, { [`${name} 2xx`]: (r) => r.status >= 200 && r.status < 300 });
  if (!passed) {
    const key = STATUS_KEYS.includes(String(res.status)) ? String(res.status) : "other";
    failByStatus[key].add(1, { name });
  }
  return passed;
}
```

요약에서는 이렇게 뜬다.

```
실패 상태코드:
  status 502   x 47685  (nginx→백엔드 연결 실패)
실패한 요청:
  x candles 2xx  실패 2884 / 성공 6421
  x signals 2xx  실패 9305 / 성공 0
```

상태코드 한 줄이 갈라 주는 것들:

| 코드 | 뜻 | 다음 행동 |
|---|---|---|
| 0 | 응답 자체가 없음. 연결 거부 또는 k6 타임아웃 | 서버가 죽었거나 포트가 닫힘. 부하 문제가 아닐 수 있다 |
| 400 | 요청이 잘못됨 | 스크립트 버그 (인코딩, 파라미터) |
| 401 | 인증 실패 | 토큰 만료. 회원 API 실패를 전부 빼고 다시 계산 |
| 429 | 요청 제한 | 서버가 아니라 레이트 리미터가 막음 |
| 502 | 프록시가 백엔드에 못 붙음 | 연결 쪽. 포트, keepalive, 백엔드 프로세스 |
| 503 | 과부하로 거절 | 스레드풀, 대기열 한도 |
| 504 | 붙었는데 응답이 늦음 | 진짜 느린 것. 쿼리, 외부 API, CPU |

502 와 504 를 구분하지 못하면 "서버가 느리다"와 "서버에 못 붙는다"를 같은 것으로 보고 엉뚱한 곳을 고친다. [502 추적기](/post/stockanalyst-loadtest-port-leak)가 정확히 그 얘기다.

## 4. VU 단계별 표, threshold 를 거꾸로 쓰기

100, 200, 400 으로 올리면 "400 에서 실패 44%" 는 알 수 있어도 어디서 시작됐는지는 모른다. 50 씩 8단계로 올리면서 요청마다 그 순간의 활성 VU 를 태그하면 단계별로 갈라 볼 수 있다.

```js
import exec from "k6/execution";

const VU_BUCKETS = [50, 100, 150, 200, 250, 300, 350, 400];
STAGES.step = VU_BUCKETS.flatMap((b) => [{ duration: "10s", target: b }, { duration: "30s", target: b }])
  .concat([{ duration: "10s", target: 0 }]);

function vuBucket() {
  const v = exec.instance.vusActive;
  return String(VU_BUCKETS.find((b) => v <= b) || VU_BUCKETS[VU_BUCKETS.length - 1]);
}

function params(page, name) {
  return { tags: { page, name, vus: vuBucket() }, timeout: "30s" };
}
```

문제는 3절에서 말한 성질이다. `http_req_failed{vus:200}` 같은 서브메트릭은 요약에 안 온다. 예외가 하나 있는데, threshold 가 걸린 태그 조합은 온다. 그래서 항상 통과하는 threshold 를 걸어 둔다. 실패율은 항상 1 이하이고 p95 는 항상 0 이상이니 아래 두 조건은 절대 실패하지 않는다.

```js
const vuBucketThresholds = Object.fromEntries(VU_BUCKETS.flatMap((b) => [
  [`http_req_failed{vus:${b}}`, ["rate<=1"]],
  [`http_req_duration{vus:${b}}`, ["p(95)>=0"]],
]));

export const options = {
  stages: STAGES[STAGE_NAME],
  thresholds: { ...vuBucketThresholds, http_req_failed: ["rate<0.01"] },
};
```

이제 `handleSummary` 에서 표를 만들 수 있다.

```js
const byVu = VU_BUCKETS.map((b) => {
  const f = m[`http_req_failed{vus:${b}}`]?.values;
  const d = m[`http_req_duration{vus:${b}}`]?.values;
  const n = f ? f.passes + f.fails : 0;
  if (!n) return null;
  return `  ${String(b).padStart(3)}VU 이하  요청 ${String(n).padStart(6)}  실패 ${(f.rate * 100).toFixed(1).padStart(5)}%  p95 ${String(Math.round(d["p(95)"])).padStart(5)}ms`;
}).filter(Boolean);
```

```
VU 단계별:
   50VU 이하  요청   5345  실패   0.0%  p95    45ms
  100VU 이하  요청  10872  실패   0.0%  p95    40ms
  150VU 이하  요청  16720  실패   0.0%  p95    57ms
  200VU 이하  요청  22298  실패  13.0%  p95   112ms
  250VU 이하  요청  24767  실패  23.2%  p95   680ms
```

이 표가 스크립트에서 제일 값진 출력이다. "150 까지 0%, 200 부터 13%" 는 곧 상한이 그 사이에 있다는 뜻이고, 그 구간의 처리량(초당 요청 수)을 보면 어떤 한도에 닿았는지 역산할 수 있다.

<svg viewBox="0 0 760 200" width="100%" style="max-width:760px;display:block;margin:24px auto" role="img" aria-label="step 단계의 VU 변화. 50VU 씩 8단계, 각 단계 10초 올리고 30초 유지">
  <g font-size="11" fill="var(--color-text-dim)">
    <line x1="50" y1="160" x2="740" y2="160" stroke="var(--color-border)"/>
    <line x1="50" y1="20" x2="50" y2="160" stroke="var(--color-border)"/>
    <text x="14" y="164">0</text><text x="8" y="94">200</text><text x="8" y="26">400</text>
    <text x="50" y="180">0s</text><text x="360" y="180">2m40s</text><text x="690" y="180">5m30s</text>
  </g>
  <polyline fill="none" stroke="var(--color-accent)" stroke-width="2" points="50,160 71,142.5 134,142.5 155,125 218,125 239,107.5 302,107.5 323,90 386,90 407,72.5 470,72.5 491,55 554,55 575,37.5 638,37.5 659,20 722,20 743,160"/>
  <g font-size="10" fill="var(--color-text-dim)">
    <text x="90" y="138">50</text><text x="174" y="120">100</text><text x="258" y="103">150</text><text x="342" y="85">200</text><text x="426" y="68">250</text><text x="510" y="50">300</text><text x="594" y="33">350</text><text x="678" y="16">400</text>
  </g>
</svg>

## 5. 시작 전에 막을 수 있는 것

부하테스트 한 번은 5분이고, 400VU 까지 올린 뒤에야 "토큰이 만료돼 있었다"를 알면 5분과 그동안 서버를 때린 것이 전부 헛수고다. 시작 전에 확인할 수 있는 건 시작 전에 확인한다.

토큰 만료. JWT 는 `exp` 를 갖고 있으니 init 단계에서 읽는다.

```js
import encoding from "k6/encoding";

if (TOKEN) {
  const payload = JSON.parse(encoding.b64decode(TOKEN.split(".")[1], "rawurl", "s"));
  const leftSec = payload.exp - Math.floor(Date.now() / 1000);
  if (leftSec <= 0) throw new Error(`ACCESS_TOKEN 이 ${-leftSec}초 전에 만료됨`);
  const planned = { smoke: 60, ramp: 240, step: 330, soak: 600 }[STAGE_NAME] || 240;
  if (leftSec < planned) throw new Error(`ACCESS_TOKEN 남은 시간 ${leftSec}초 < 테스트 길이 ${planned}초`);
  if (__VU === 0) console.log(`ACCESS_TOKEN 남은 시간 ${Math.floor(leftSec / 60)}분`);
}
```

init 코드는 VU 마다 한 번씩 실행되므로 `console.log` 를 그냥 두면 400VU 에서 400줄이 찍힌다. `__VU === 0`(최초 파싱 때) 에서만 출력한다.

URL 인코딩. k6 는 URL 의 한글을 알아서 인코딩하지 않는다. `encodeURIComponent` 를 빼먹으면 톰캣이 400 으로 거절하고, 요약엔 "news-search 실패 5%" 만 남는다.

외부 호출 경로. 이 서비스는 뉴스 카드에 기사가 없으면 네이버 검색을 즉석에서 부르고, 지수와 환율은 야후에서 받는다. 부하테스트가 그대로 외부 API 호출이 되면 상대 서비스에 폐를 끼치고 429 로 막혀 결과도 오염된다. 테스트 전에 `SHORT_NEWS_LIVE_MAX=0` 으로 즉석 검색을 끄고, 끝나면 되돌린다. 온디맨드 예측(종목당 수천 시퀀스 추론)처럼 하나가 병목의 전부가 될 요청은 아예 안 부른다. 넣으면 그것만 보이고 나머지가 안 보인다.

## 6. 단계, 항상 smoke 부터

```js
const STAGES = {
  smoke: [{ duration: "1m", target: 5 }],
  ramp: [
    { duration: "30s", target: 10 }, { duration: "1m", target: 10 },
    { duration: "30s", target: 20 }, { duration: "1m", target: 20 },
    { duration: "30s", target: 40 }, { duration: "30s", target: 0 },
  ],
  soak: [{ duration: "30s", target: 20 }, { duration: "10m", target: 20 }, { duration: "30s", target: 0 }],
  step: /* 4절 */,
};
```

| 단계 | 목적 | 이걸로 알 수 있는 것 |
|---|---|---|
| smoke (5VU 1분) | 스크립트가 맞는지 | 400, 401 이 나오면 서버가 아니라 스크립트 문제. 여기서 0% 가 나와야 다음으로 간다 |
| ramp (10~40VU) | 정상 범위의 기준선 | "이 정도면 여유롭다"는 p95 값. 상한과 비교할 기준 |
| step (50VU 씩) | 상한 찾기 | 실패가 시작되는 VU, p95 가 꺾이는 VU |
| soak (20VU 10분) | 시간에 따른 열화 | 메모리 누수, 커넥션 풀 고갈처럼 오래 돌려야 보이는 것 |

순서를 지키는 이유는 간단하다. 400VU 에서 나온 실패가 스크립트 버그인지 서버 한계인지 구분하려면 5VU 에서 0% 였다는 사실이 필요하다.

## 7. 요약은 직접 만든다

k6 기본 출력은 메트릭 이름과 백분위가 빼곡한 표라, 돌릴 때마다 눈으로 골라 읽어야 한다. `handleSummary` 로 필요한 것만 찍는다.

```js
export function handleSummary(data) {
  const m = data.metrics;
  const p = (name, tag) => {
    const v = m[tag ? `${name}{${tag}}` : name]?.values;
    return v ? `p95 ${Math.round(v["p(95)"])}ms · max ${Math.round(v.max)}ms` : "-";
  };
  const failedChecks = [];
  const walk = (g) => {
    (g.checks || []).forEach((c) => { if (c.fails > 0) failedChecks.push(`  x ${c.name}  실패 ${c.fails} / 성공 ${c.passes}`); });
    (g.groups || []).forEach(walk);
  };
  walk(data.root_group);
  const lines = [
    "=== 요약 ===",
    `요청 ${m.http_reqs.values.count}건 · 실패율 ${(m.http_req_failed.values.rate * 100).toFixed(2)}%`,
    ...byVu,
    `홈       ${p("http_req_duration", "page:home")}`,
    `종목상세 ${p("http_req_duration", "page:stock")}   (캔들 ${p("http_req_duration", "name:candles")})`,
    ...byStatus,
    failedChecks.length ? "실패한 요청:" : "실패한 요청 없음",
    ...failedChecks,
  ];
  return { stdout: lines.join("\n") + "\n", "loadtest/last-summary.json": JSON.stringify(data, null, 2) };
}
```

`page:home` 처럼 태그로 서브메트릭을 꺼내려면 그 조합에도 threshold 가 걸려 있어야 한다(`"http_req_duration{page:home}": ["p(95)<1500"]`). 목표값을 threshold 로 두면 요약에 뜨는 것과 통과 기준이 한 곳에서 정해진다. 전체 JSON 도 파일로 남겨 두면 나중에 "그때 max 가 얼마였지"를 다시 열어 볼 수 있다.

## 8. 부하 중에 같이 볼 것

요약은 k6 쪽에서 본 결과다. 서버 쪽에서 무슨 일이 있었는지는 테스트가 도는 동안 따로 봐야 하고, 끝난 뒤엔 늦다.

```
docker stats backend-1 frontend-1 mysql-1 redis-1
```

컨테이너별 CPU 를 보면 병목이 어디인지 절반은 나온다. 백엔드가 400% 면 CPU 가 벽이고, 백엔드는 한가한데 MySQL 이 200% 면 쿼리다. 정적 파일만 주는 nginx 가 370% 면 그건 뭔가 잘못된 것이고, 실제로 그게 502 의 실마리였다.

로그는 레벨을 넓게 잡는다. nginx 는 업스트림 연결 실패를 `[error]` 가 아니라 `[crit]` 으로, `worker_connections` 부족은 `[alert]` 로 찍는다.

```
docker compose logs frontend --since 30m | findstr /c:"[crit]" /c:"[alert]" /c:"connect()"
```

백엔드 쪽은 부하에서만 찍히는 로그가 INFO 로 나오게 미리 만들어 둔다. 세마포어 대기 초과처럼 "건너뛰었다"는 사건이 debug 면 운영에서 영영 안 보인다.

## 9. 정리, 스크립트가 갖춰야 할 것

| 항목 | 없으면 |
|---|---|
| 화면 단위 요청 묶음 + page/name 태그 | 엔드포인트 하나의 한계는 알아도 화면이 열리는 시간은 모른다 |
| 생각하는 시간 + VU 를 사람으로 환산하는 비율 | "200VU" 를 200명으로 읽는다 |
| 상태코드별 실패 카운터 | 401 과 502 와 504 를 같은 "실패" 로 본다 |
| VU 단계별 표 (태그 + 항상 통과하는 threshold) | 상한이 "100 과 400 사이 어딘가" 로 남는다 |
| 시작 전 검증 (토큰 exp, 인코딩) | 5분 뒤에 스크립트 문제였음을 안다 |
| 외부 호출 경로 끄기 | 남의 API 를 때리고 429 로 결과가 오염된다 |
| smoke, ramp, step, soak 순서 | 실패가 스크립트 문제인지 서버 문제인지 구분 못 한다 |
| 부하 중 docker stats + 넓은 로그 레벨 | 502 의 원인이 nginx 인지 Tomcat 인지 영영 모른다 |

전체 스크립트는 `stock_analyst_backend/loadtest/stock-load.js` 에 있고, 위 조각들은 거기서 그대로 가져왔다. 화면 목록과 API 경로만 바꾸면 다른 서비스에도 쓸 수 있다.
