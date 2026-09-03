---
title: StockAnalyst 시황 위젯 - 다우 이론 6국면 판정과 환율·원자재 파생 신호
date: 2026-09-02
category: stockanalyst
src: cover.svg
tags: [stockanalyst, 다우이론, 환율, 기술적분석, yfinance, react]
summary: StockAnalyst 시황 위젯 기록. 다우 이론 1차 추세를 주봉 + ZigZag 5%로 판정하고 6국면을 추정하는 위젯, 금/구리 비율·브렌트-WTI 스프레드·엔캐리 등급 같은 환율 파생 신호, 그리고 미국 지수 NULL 종가와 2개월 전 전일 종가 버그.
---

> StockAnalyst는 Spring Boot + React(Vite) + Python 파이프라인으로 만든 주식 정보 서비스다. 개발기 1편은 [뉴스 감성 모델](/post/stockanalyst-sentiment-model)과 [종목 추출](/post/stockanalyst-ticker-extraction)이었고, 2편은 그것을 뺀 나머지를 주제별로 나눴다. 전체 목차는 [개발기 (2) 목차](/post/stockanalyst-dev-log-2-overview)에 있다.

**한눈에 보기**

- 다우 이론 위젯은 일봉 5일 극값 대신 **주봉 + ZigZag 5%**로 스윙 고저점을 잡는다. 1차 추세는 수개월 단위
- 두 지수가 같은 방향이면 상호 확증, 52주 레인지 위치와 합쳐 **6국면** 추정. 나중엔 지수 4개 각각에도
- 환율 위젯은 시세만이 아니라 금/구리, 브렌트−WTI, 엔캐리 청산 리스크 같은 **파생 신호**
- 미국 장 마감 전 수집 → NaN 종가 INSERT → 증분 로직이 그 행을 최신으로 봄. 삭제가 필수였다

우하단에 플로팅 위젯 두 개를 붙였다. 하나는 다우 이론, 하나는 환율이다.

## 다우 이론 위젯

국내(KODEX200·KOSDAQ150)와 미국(SPY·QQQ) 두 시장 쌍으로 1차 추세를 판정한다.

<svg viewBox="0 0 760 124" width="100%" style="max-width:760px;display:block;margin:22px auto" role="img" aria-label="주봉으로 집계하고 ZigZag로 잔파동을 걸러 스윙 고저점을 잡은 뒤, 두 지수의 방향을 비교해 국면을 추정한다">
<g font-size="13" fill="var(--color-text)" text-anchor="middle">
<rect x="0" y="30" width="129" height="70" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="64" y="52">일봉 → 주봉</text>
<text x="64" y="69" fill="var(--color-text-dim)" font-size="11">ISO주 집계 · 최근</text>
<text x="64" y="83" fill="var(--color-text-dim)" font-size="11">3년</text>
<rect x="157" y="30" width="129" height="70" rx="8" fill="var(--color-accent-soft)" stroke="var(--color-accent)"/>
<text x="222" y="52" font-weight="600">ZigZag 5%</text>
<text x="222" y="69" fill="var(--color-text-dim)" font-size="11">잔파동 제거 · 스윙</text>
<text x="222" y="83" fill="var(--color-text-dim)" font-size="11">고저점</text>
<rect x="314" y="30" width="129" height="70" rx="8" fill="var(--color-accent-soft)" stroke="var(--color-accent)"/>
<text x="378" y="52" font-weight="600">HH/HL · LH/LL</text>
<text x="378" y="69" fill="var(--color-text-dim)" font-size="11">1차 추세 판정</text>
<rect x="471" y="30" width="129" height="70" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="536" y="52">두 지수 비교</text>
<text x="536" y="69" fill="var(--color-text-dim)" font-size="11">같은 방향 = 상호 확증</text>
<rect x="628" y="30" width="129" height="70" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="692" y="52">6국면 추정</text>
<text x="692" y="69" fill="var(--color-text-dim)" font-size="11">52주 레인지 위치 +</text>
<text x="692" y="83" fill="var(--color-text-dim)" font-size="11">신호</text>
</g>
<path d="M129 65.0h22m-6-5l6 5-6 5" stroke="var(--color-text-dim)" stroke-width="1.5" fill="none"/>
<path d="M286 65.0h22m-6-5l6 5-6 5" stroke="var(--color-text-dim)" stroke-width="1.5" fill="none"/>
<path d="M443 65.0h22m-6-5l6 5-6 5" stroke="var(--color-text-dim)" stroke-width="1.5" fill="none"/>
<path d="M600 65.0h22m-6-5l6 5-6 5" stroke="var(--color-text-dim)" stroke-width="1.5" fill="none"/>
</svg>

처음엔 일봉의 좌우 5일 극값으로 스윙 고저점을 잡았는데, 잔파동에 HH/HL(고점 상승·저점 상승) 판정이 흔들렸다. 두 가지를 바꿨다.

| 문제 | 처리 | 이유 |
|---|---|---|
| 잔파동마다 고저점이 생김 | **ZigZag 5% 필터** — 직전 전환점 대비 5% 이상 반대로 움직여야 전환 확정 ([변곡점 모델](/post/stockanalyst-turning-point-model)의 정답 라벨과 같은 필터다) | 5% 미만 흔들림은 추세가 아니다 |
| 일봉 잡음 | 1차 추세는 아예 **주봉**(ISO주 집계, 최근 3년)으로 | 다우의 1차 추세는 수개월 단위다 |

두 지수가 같은 방향이면 상호 확증, 엇갈리면 전환 경고다. 20일 상승일/하락일 평균 거래량으로 거래량 확증도 본다. 52주 레인지 내 위치와 신호를 조합해 **다우 6국면**을 추정하고, 각 국면의 전문가 대 개인 매매 표(와이코프 관점)와 사이클 그림을 같이 보여 준다.

<svg viewBox="0 0 760 230" width="100%" style="max-width:760px;display:block;margin:22px auto" role="img" aria-label="축적기, 대중참여기, 분산기, 하락 초기, 공포, 침체로 이어지는 시장 사이클 곡선">
<text x="0" y="14" font-size="13" fill="var(--color-text-muted)">다우 이론 6국면 (와이코프 관점)</text>
<polyline points="40.0,165.0 46.8,164.9 53.6,164.6 60.4,164.0 67.2,163.3 74.0,162.3 80.8,161.1 87.6,159.8 94.4,158.2 101.2,156.4 108.0,154.5 114.8,152.4 121.6,150.1 128.4,147.7 135.2,145.1 142.0,142.3 148.8,139.5 155.6,136.5 162.4,133.4 169.2,130.2 176.0,127.0 182.8,123.7 189.6,120.3 196.4,116.9 203.2,113.5 210.0,110.0 216.8,106.5 223.6,103.1 230.4,99.7 237.2,96.3 244.0,93.0 250.8,89.8 257.6,86.6 264.4,83.5 271.2,80.5 278.0,77.7 284.8,74.9 291.6,72.3 298.4,69.9 305.2,67.6 312.0,65.5 318.8,63.6 325.6,61.8 332.4,60.2 339.2,58.9 346.0,57.7 352.8,56.7 359.6,56.0 366.4,55.4 373.2,55.1 380.0,55.0 386.8,55.1 393.6,55.4 400.4,56.0 407.2,56.7 414.0,57.7 420.8,58.9 427.6,60.2 434.4,61.8 441.2,63.6 448.0,65.5 454.8,67.6 461.6,69.9 468.4,72.3 475.2,74.9 482.0,77.7 488.8,80.5 495.6,83.5 502.4,86.6 509.2,89.8 516.0,93.0 522.8,96.3 529.6,99.7 536.4,103.1 543.2,106.5 550.0,110.0 556.8,113.5 563.6,116.9 570.4,120.3 577.2,123.7 584.0,127.0 590.8,130.2 597.6,133.4 604.4,136.5 611.2,139.5 618.0,142.3 624.8,145.1 631.6,147.7 638.4,150.1 645.2,152.4 652.0,154.5 658.8,156.4 665.6,158.2 672.4,159.8 679.2,161.1 686.0,162.3 692.8,163.3 699.6,164.0 706.4,164.6 713.2,164.9 720.0,165.0" fill="none" stroke="var(--color-accent)" stroke-width="2.5" stroke-linejoin="round"/>
<circle cx="53.6" cy="164.6" r="5" fill="var(--color-accent)" stroke="var(--color-bg-elevated)" stroke-width="2"/>
<text x="53.6" y="190.6" font-size="12" fill="var(--color-text)" text-anchor="middle" font-weight="600">축적기</text>
<text x="53.6" y="204.6" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">바닥 · 전문가 매집</text>
<circle cx="203.2" cy="113.5" r="5" fill="var(--color-accent)" stroke="var(--color-bg-elevated)" stroke-width="2"/>
<text x="203.2" y="139.5" font-size="12" fill="var(--color-text)" text-anchor="middle" font-weight="600">대중참여기</text>
<text x="203.2" y="153.5" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">추세 확인 · 거래량 증가</text>
<circle cx="325.6" cy="61.8" r="5" fill="var(--color-accent)" stroke="var(--color-bg-elevated)" stroke-width="2"/>
<text x="325.6" y="45.8" font-size="12" fill="var(--color-text)" text-anchor="middle" font-weight="600">분산기</text>
<text x="325.6" y="59.8" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">고점 · 전문가 매도</text>
<circle cx="434.4" cy="61.8" r="5" fill="var(--color-accent)" stroke="var(--color-bg-elevated)" stroke-width="2"/>
<text x="434.4" y="45.8" font-size="12" fill="var(--color-text)" text-anchor="middle" font-weight="600">하락 초기</text>
<text x="434.4" y="59.8" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">HH/HL 깨짐</text>
<circle cx="550.0" cy="110.0" r="5" fill="var(--color-accent)" stroke="var(--color-bg-elevated)" stroke-width="2"/>
<text x="550.0" y="136.0" font-size="12" fill="var(--color-text)" text-anchor="middle" font-weight="600">공포</text>
<text x="550.0" y="150.0" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">투매</text>
<circle cx="672.4" cy="159.8" r="5" fill="var(--color-accent)" stroke="var(--color-bg-elevated)" stroke-width="2"/>
<text x="672.4" y="185.8" font-size="12" fill="var(--color-text)" text-anchor="middle" font-weight="600">침체</text>
<text x="672.4" y="199.8" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">무관심 · 다음 축적</text>
</svg>

나중에 코스피↑·코스닥↓처럼 엇갈리는 날이 잦아서, 지수 4개 각각에도 자기 국면과 자기 사이클 그래프를 주는 구조로 바꿨다. 시장 쌍의 판정과 개별 지수의 판정을 둘 다 본다.

### 미국 지수 종가가 NULL로 들어오던 버그

미국 장 마감 전(KST 새벽)에 수집하면 yfinance가 당일 미완성 봉을 NaN 종가로 주고, 수집기가 그대로 INSERT했다. QQQ 현재가가 0이 되고 국면 판정이 보류됐다.

| 위치 | 수정 |
|---|---|
| 수집기 | 종가 유효성 필터. NaN이면 INSERT하지 않음 |
| 서비스 | "마지막 유효 종가"를 쓰도록 |
| 기존 데이터 | NULL 행 삭제 후 재수집. **증분 로직이 NULL 행을 최신으로 보기 때문에** 삭제가 필수였다 |

세 번째가 함정이다. 증분 수집은 "DB의 마지막 날짜 이후"만 받으니, NULL 종가라도 행이 있으면 그날은 이미 받은 것으로 취급돼 영영 안 채워진다. 이 함정은 뒤에 공매도 잔고에서 한 번 더 나온다 — 증분 설계 쪽 정리는 [파이프라인 글](/post/stockanalyst-data-pipeline)에 있다.

## 환율 위젯

야후 chart API(60초 캐시)로 환율 5종, 원자재 5종(금·WTI·브렌트·구리·은), BTC·ETH, 미국채 10년을 받는다. 원본 시세만 보여 주는 게 아니라 파생 신호를 계산한다.

| 파생 신호 | 계산 | 읽는 법 |
|---|---|---|
| 금/구리 비율 | 금 ÷ 구리 | 상승 = 침체 신호 (안전자산 선호, 산업 수요 둔화) |
| 브렌트−WTI 스프레드 | 브렌트 − WTI | $6 이상이면 지정학 리스크 |
| 원화 고유 약세 vs 달러 강세 | 달러인덱스 변화 대비 원/달러 변화 | 달러가 안 올랐는데 원/달러가 오르면 원화 고유 약세 |
| 원화 환산 금값 | 금(온스) × USD/KRW ÷ 31.1 | 원/g |
| 엔캐리 청산 리스크 | USD/JPY 6개월 일봉, 20/60거래일 엔 절상률 | ALERT / WATCH / SAFE |

## 홈 주요 지수 - 난수를 걷어내다

홈의 주요 지수는 원래 하드코딩과 난수였다. 야후 chart로 11개 지수를 받도록 바꾸면서 버그 두 개를 만났다.

| 증상 | 원인 | 수정 |
|---|---|---|
| 등락률이 −21% | `range=2mo`로 받으니 `chartPreviousClose`가 **2개월 전 값** | 전일 종가를 일봉 시리즈에서 직접 구함 |
| 장중인데 "장 닫힘" | 야후의 상태 값을 그대로 씀 | 거래소 시간대로 직접 판정 |
