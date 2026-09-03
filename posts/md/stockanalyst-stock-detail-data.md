---
title: StockAnalyst 종목 상세 데이터 - 공매도 IP 차단, 옵션 체인 압축, DART 공시
date: 2026-09-02
category: stockanalyst
src: cover.svg
tags: [stockanalyst, 공매도, 옵션, DART, KIS, python]
summary: StockAnalyst 종목 상세에 붙인 데이터 기록. pykrx 공매도 수집으로 KRX에 IP 차단당한 뒤 CSV 임포트, 화면 단위 조회로 돌아온 과정, 숏커버 압력 추정식, 국내 지수옵션·미국 옵션 체인 압축, DART corp_code 캐싱.
---

> StockAnalyst는 Spring Boot + React(Vite) + Python 파이프라인으로 만든 주식 정보 서비스다. 개발기 1편은 [뉴스 감성 모델](/post/stockanalyst-sentiment-model)과 [종목 추출](/post/stockanalyst-ticker-extraction)이었고, 2편은 그것을 뺀 나머지를 주제별로 나눴다. 전체 목차는 [개발기 (2) 목차](/post/stockanalyst-dev-log-2-overview)에 있다.

**한눈에 보기**

- 국내·해외 데이터 소스가 전부 다르다. 투자의견·공매도·옵션·공시·펀더멘털 다섯 종류
- 공매도는 pykrx 종목별 수집 → **IP 차단(약관 위반)** → CSV 임포트 → 화면 단위 하루 10건으로 정착
- 숏커버 압력은 Days To Cover와 제곱근 법칙 **추정치**. 계산식과 가정을 화면에 반드시 같이 노출
- 미국 옵션은 체인 원본 대신 만기별 PCR·최대고통·ATM IV로 압축. DART는 corp_code 매핑을 하루 1회 캐싱

종목 상세 화면에는 데이터 다섯 종류가 더 붙는다. 국내와 해외의 소스가 전부 다르다.

| 항목 | 국내 | 해외 |
|---|---|---|
| 투자의견 | KIS API 실시간 (10분 캐시) | yfinance recommendations + 목표주가 |
| 공매도 잔고 | KRX (자세한 사연은 아래) | yfinance info (FINRA 격주 공시) |
| 옵션 | 개별주식옵션은 유동성이 없어 미지원, 지수옵션만 KRX Open API | yfinance option_chain |
| 공시 | DART Open API | 없음 |
| 펀더멘털 | FinanceDataReader + pykrx | yfinance info |

## 공매도 - 차단당하고, CSV로 갔다가, 화면 단위로 돌아오다

<svg viewBox="0 0 760 250" width="100%" style="max-width:760px;display:block;margin:22px auto" role="img" aria-label="pykrx 차단에서 CSV 임포트를 거쳐 화면 단위 조회로 돌아온 경로">
<text x="0" y="14" font-size="13" fill="var(--color-text-muted)">공매도 데이터 경로가 바뀐 순서</text>
<circle cx="14" cy="42" r="6" fill="#e5534b" stroke="var(--color-bg-elevated)" stroke-width="2"/>
<line x1="14" y1="50" x2="14" y2="86" stroke="var(--color-border-strong)" stroke-width="2"/>
<text x="32" y="40" font-size="11" fill="var(--color-text-dim)">1</text>
<text x="32" y="56" font-size="13" fill="var(--color-text)">pykrx로 종목별 공매도를 수천 건 수집 → KRX가 IP를 하루 차단. 사유는 속도 제한이 아니라 약관 위반</text>
<circle cx="14" cy="94" r="6" fill="#d29922" stroke="var(--color-bg-elevated)" stroke-width="2"/>
<line x1="14" y1="102" x2="14" y2="138" stroke="var(--color-border-strong)" stroke-width="2"/>
<text x="32" y="92" font-size="11" fill="var(--color-text-dim)">2</text>
<text x="32" y="108" font-size="13" fill="var(--color-text)">정식 경로 확인: 화면 다운로드 · 데이터 상품 구입 · Open API. Open API에는 공매도가 없다</text>
<circle cx="14" cy="146" r="6" fill="#d29922" stroke="var(--color-bg-elevated)" stroke-width="2"/>
<line x1="14" y1="154" x2="14" y2="190" stroke="var(--color-border-strong)" stroke-width="2"/>
<text x="32" y="144" font-size="11" fill="var(--color-text-dim)">3</text>
<text x="32" y="160" font-size="13" fill="var(--color-text)">화면에서 내려받은 CSV 임포트로 전환. 헤더 별칭 표, 인코딩·헤더 위치 자동 탐색, 파일명에서 날짜·코드</text>
<circle cx="14" cy="198" r="6" fill="var(--color-accent)" stroke="var(--color-bg-elevated)" stroke-width="2"/>
<text x="32" y="196" font-size="11" fill="var(--color-text-dim)">4</text>
<text x="32" y="212" font-size="13" fill="var(--color-text)">종목별 조회 없이 화면 단위(전종목 잔고·거래, 상위 50, 투자자별)만 하루 10건 안팎으로. 3초 간격,</text>
<text x="32" y="228" font-size="13" fill="var(--color-text)">상한 40건, 거부 시 즉시 중단</text>
</svg>

차단 안내를 다시 읽어 보니 문제는 요청 속도가 아니라 **"자동화 수단을 이용한 정보 무단 수집"**이라는 약관 조항이었다. 속도를 늦춘다고 해결되는 게 아니다.

CSV 임포트는 헤더 표기가 화면마다 조금씩 달라서 별칭 표로 흡수하고, 인코딩(cp949 / utf-8-sig)과 헤더 위치(0~2행)를 자동 탐색하고, 날짜나 종목코드가 헤더에 없으면 파일명에서 읽는다.

그러다 "5영업일치만 매일 받으면 요청이 하루 10건인데, 그건 사람이 클릭하는 것과 다를 게 없지 않나"로 정리했다. 종목별 조회를 하지 않고 **화면 단위**로만 조회하는 스크립트를 다시 만들었다. 약관 조항 자체는 그대로라는 점은 알고 있고, 차단 안내가 오면 스위치 하나로 CSV로 돌아간다.

이 데이터를 화면에 어떻게 놓았는지, 그리고 이후에 잡은 공매도 수집 버그 셋은 [개발기 (3)](/post/stockanalyst-dev-log-3-signals-rates)에 있다.

### 숏커버 압력은 추정치다

화면에는 숏커버 압력을 보여 준다. 공시값이 아니라 **추정치**이고, 계산식과 가정을 응답에 실어 화면에 반드시 같이 노출한다. "예상 상승률"로 단정하지 않는다. (이런 고지는 나중에 `Disclaimer` 컴포넌트 하나로 통일했다 — [3편](/post/stockanalyst-dev-log-3-signals-rates))

| 지표 | 식 | 뜻 |
|---|---|---|
| Days To Cover | 공매도 잔고 ÷ 20일 평균 거래량 | 잔고를 전부 되사는 데 며칠 걸리나 |
| 시장충격 (제곱근 법칙) | `ΔP/P ≈ Y · σ · √(Q/ADV)`, Y = 0.5와 1.0 두 값 | 잔고 Q를 한 번에 되사면 가격이 얼마나 밀리나 |

## 옵션

| | 국내 지수옵션 | 미국 옵션 |
|---|---|---|
| 소스 | KRX Open API (`basDd` 하루 1건, 일 10,000회 한도) | yfinance option_chain |
| 저장 | 기준일로부터 3개월 이내 월물만 | 체인 원본 대신 만기별 PCR · 최대고통가격 · ATM IV로 **압축** |
| 만기 선택 | 먼 월물은 거래가 없어 행만 차지 | 3개월 이내 중 가장 가까운 것 + 월물(셋째 금요일) 우선, 최대 4개 |

KRX는 승인이 두 단계라(인증키 발급 승인 → API별 활용신청 승인) 401은 승인 문제, 404는 경로 문제로 구분해 안내한다. 미국 주간 만기 종목은 3개월에 만기가 13개라 전부 받으면 하루 8천 건이 된다. 압축이 필요한 이유다.

## DART 공시

<svg viewBox="0 0 760 124" width="100%" style="max-width:760px;display:block;margin:22px auto" role="img" aria-label="DART 공시는 corp_code 매핑을 하루 한 번 캐싱한 뒤 최근 6개월 공시를 분류해 배지로 보여 준다">
<g font-size="13" fill="var(--color-text)" text-anchor="middle">
<rect x="0" y="30" width="160" height="70" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="80" y="52">corpCode.xml (zip)</text>
<text x="80" y="69" fill="var(--color-text-dim)" font-size="11">스트리밍 파싱</text>
<rect x="200" y="30" width="160" height="70" rx="8" fill="var(--color-accent-soft)" stroke="var(--color-accent)"/>
<text x="280" y="52" font-weight="600">6자리 종목코드만 캐싱</text>
<text x="280" y="69" fill="var(--color-text-dim)" font-size="11">하루 1회</text>
<rect x="400" y="30" width="160" height="70" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="480" y="52">최근 6개월 공시</text>
<text x="480" y="69" fill="var(--color-text-dim)" font-size="11">corp_code로 조회</text>
<rect x="600" y="30" width="160" height="70" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="680" y="52">보고서명 분류 배지</text>
<text x="680" y="69" fill="var(--color-text-dim)" font-size="11">정기 · 실적 · 배당 · 증자</text>
<text x="680" y="83" fill="var(--color-text-dim)" font-size="11">…</text>
</g>
<path d="M160 65.0h34m-6-5l6 5-6 5" stroke="var(--color-text-dim)" stroke-width="1.5" fill="none"/>
<path d="M360 65.0h34m-6-5l6 5-6 5" stroke="var(--color-text-dim)" stroke-width="1.5" fill="none"/>
<path d="M560 65.0h34m-6-5l6 5-6 5" stroke="var(--color-text-dim)" stroke-width="1.5" fill="none"/>
</svg>

opendart의 목록 API는 종목코드가 아니라 `corp_code`로만 조회된다. 그래서 `corpCode.xml`(zip)을 받아 스트리밍 파싱해 6자리 종목코드가 있는 것만 하루 1회 캐싱한다. 최근 6개월 공시는 보고서명으로 대략 분류(정기공시 / 실적 / 배당 / 증자·CB / 자사주 / 지배구조 / 수주)해 배지를 붙인다. 상세 페이지 새로고침마다 호출되던 걸 10분 캐시로 막았다. 키당 일 20,000건 한도다.

## 삽질 하나

KIS 403이 나서 코드에서 한참 원인을 찾았다. 응답의 EGW 코드를 로그에 찍게 하니 **EGW00105(AppSecret 무효)**였다. 포털에서 재발급하면 되는 문제였다. 외부 API 에러는 상태 코드만 보지 말고 본문의 에러 코드부터 찍자.
