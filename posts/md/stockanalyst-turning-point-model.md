---
title: StockAnalyst 변곡점 예측 - Keras 앙상블, 임계값 이진 탐색, 종목당 1분을 밀리초로
date: 2026-09-02
category: stockanalyst
src: cover.svg
tags: [stockanalyst, python, tensorflow, keras, 변곡점, 기술적분석]
summary: StockAnalyst 변곡점 예측 모델 기록. 40일 기술지표 창과 Keras 3개 앙상블, ZigZag 정답, 고점·저점을 따로 정하는 임계값 이진 탐색과 4단계 노이즈 필터, 그리고 종목당 1분 걸리던 예측을 64종목 묶음으로 바꿔 호출을 15,000번에서 240번으로 줄인 과정. (2026-09에 이 배치 구조는 삭제하고 온디맨드로 전환했다 — 후속 글 참고)
---

> StockAnalyst는 Spring Boot + React(Vite) + Python 파이프라인으로 만든 주식 정보 서비스다. 개발기 1편은 [뉴스 감성 모델](/post/stockanalyst-sentiment-model)과 [종목 추출](/post/stockanalyst-ticker-extraction)이었고, 2편은 그것을 뺀 나머지를 주제별로 나눴다. 전체 목차는 [개발기 (2) 목차](/post/stockanalyst-dev-log-2-overview)에 있다.

> **2026-09 업데이트** — 이 글에 나오는 배치 예측(파이프라인의 predict 단계, `predict_fast.py`)은 지금은 없다. "AI 가격예측" 버튼을 눌렀을 때 Spring 백엔드가 계산하는 온디맨드 구조로 바꾸고, 모델도 PyTorch로 다시 학습한 v2로 교체했다. 아래 임계값 이진 탐색에도 상한 규칙이 하나 추가됐다. 무엇을 왜 바꿨는지는 [변곡점 예측 v2 - 배치를 지우고 온디맨드로](/post/stockanalyst-turning-point-v2)에 있다. 이 글은 그 전까지의 기록으로 남겨 둔다. 그 뒤 신호를 실시간과 사후 분석으로 나눈 이야기는 [개발기 (3)](/post/stockanalyst-dev-log-3-signals-rates)에 있다.

**한눈에 보기**

- 가짜 뉴스·무필터 캔들 목업을 실데이터 세 종류로 교체. `Promise.allSettled`로 하나가 실패해도 차트는 뜬다
- 고점·저점 확률 분포가 비대칭이라 **임계값을 따로** 이진 탐색으로 정하고, 4단계 노이즈 필터를 거친다
- 종목당 1분은 모델이 아니라 **그래프 재트레이싱** 때문. 64종목 묶음으로 호출 15,000 → 240번, 결과는 동일
- 임계값을 전체 구간에서 정하므로 증분이 안 된다 → 매번 전부 돌리되 싸게

## 가짜 뉴스를 떼어내다

초기 종목 상세 차트는 `attachRandomNews()`로 가짜 뉴스를 랜덤하게 붙이는 목업이었고, 캔들도 필터 없이 전 종목을 불러왔다. 파이썬으로 계산한 변곡점 신호는 DB에 저장만 되고 화면에는 안 나왔다.

| | 처음 | 바꾼 뒤 |
|---|---|---|
| 캔들 | 전 종목 무필터 | 종목 코드로 필터 |
| 뉴스 | `attachRandomNews()` 랜덤 | `/stocknews`의 실제 신호 — 매수(빨강 ▲, 봉 아래)·매도(파랑 ▼, 봉 위) 마커 |
| 매크로 | 없음 | 시장별 지표. 마커에 마우스를 올리면 최근 5거래일 변화 |
| 실패 처리 | 하나 실패하면 전부 실패 | `Promise.allSettled`로 격리. 신호나 매크로가 실패해도 차트는 항상 뜬다 |

매크로 지표는 yfinance(원/달러, WTI, 달러인덱스, 미국채 10년)와 FRED(미국채 2년, 장단기 금리차, 실업률, 한국 기준금리, 국고채 10년)에서 받아 **하나의 테이블**에 넣는다. 국내/미국 세트로 나누지 않은 이유는 WTI와 미국채 10년이 양쪽에 겹쳐서 이중 적재 위험이 있기 때문이고, 시장별 세트 분리는 백엔드가 한다.

이 테이블을 그대로 다시 쓰는 화면이 나중에 생긴다. [국채·금리 페이지](/post/stockanalyst-dev-log-3-signals-rates)다. 같은 지표를 실시간 시세로 따로 받는 [환율 위젯](/post/stockanalyst-dow-theory)은 별개 경로다. 그리고 여기 적힌 "한국 기준금리"는 사실 재할인율이었다는 것도 그때 드러났다.

## 변곡점 예측 모델

Keras 모델 3개 앙상블이다. 40일 창의 기술지표로 시퀀스를 만들고 고점/저점/보통 3분류 확률을 낸다. 정답은 ZigZag(5%)로 만든다. ZigZag는 직전 전환점에서 5% 이상 반대로 움직여야 새 고점·저점으로 인정하는 필터라, 잔파동을 걸러낸 "진짜 꺾인 자리"가 정답이 된다. 같은 필터를 [다우 이론 위젯](/post/stockanalyst-dow-theory)에서도 쓴다 — 쓰임은 다르지만 "어디가 스윙 고저점인가"를 정하는 도구는 하나다.

<svg viewBox="0 0 760 124" width="100%" style="max-width:760px;display:block;margin:22px auto" role="img" aria-label="40일 기술지표 창이 3개 모델 앙상블을 거쳐 확률이 되고, 임계값과 4단계 필터를 지나 신호가 된다">
<g font-size="13" fill="var(--color-text)" text-anchor="middle">
<rect x="0" y="30" width="129" height="70" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="64" y="52">40일 창</text>
<text x="64" y="69" fill="var(--color-text-dim)" font-size="11">기술지표 10종 시퀀스</text>
<rect x="157" y="30" width="129" height="70" rx="8" fill="var(--color-accent-soft)" stroke="var(--color-accent)"/>
<text x="222" y="52" font-weight="600">Keras 모델 3개</text>
<text x="222" y="69" fill="var(--color-text-dim)" font-size="11">앙상블 평균</text>
<rect x="314" y="30" width="129" height="70" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="378" y="52">확률 3개</text>
<text x="378" y="69" fill="var(--color-text-dim)" font-size="11">고점 · 저점 · 보통</text>
<rect x="471" y="30" width="129" height="70" rx="8" fill="var(--color-accent-soft)" stroke="var(--color-accent)"/>
<text x="536" y="52" font-weight="600">임계값</text>
<text x="536" y="69" fill="var(--color-text-dim)" font-size="11">고점·저점 각각 이진</text>
<text x="536" y="83" fill="var(--color-text-dim)" font-size="11">탐색</text>
<rect x="628" y="30" width="129" height="70" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="692" y="52">노이즈 필터 4단계</text>
<text x="692" y="69" fill="var(--color-text-dim)" font-size="11">스냅 · 검증 · 교차</text>
<text x="692" y="83" fill="var(--color-text-dim)" font-size="11">변동률</text>
</g>
<path d="M129 65.0h22m-6-5l6 5-6 5" stroke="var(--color-text-dim)" stroke-width="1.5" fill="none"/>
<path d="M286 65.0h22m-6-5l6 5-6 5" stroke="var(--color-text-dim)" stroke-width="1.5" fill="none"/>
<path d="M443 65.0h22m-6-5l6 5-6 5" stroke="var(--color-text-dim)" stroke-width="1.5" fill="none"/>
<path d="M600 65.0h22m-6-5l6 5-6 5" stroke="var(--color-text-dim)" stroke-width="1.5" fill="none"/>
</svg>

### 핵심은 임계값

고점 확률과 저점 확률의 분포가 **비대칭**이라 하나의 임계값을 쓰면 고점은 거의 안 잡히고 저점은 폭주했다. 모델이 저점에는 자신 있고 고점에는 소심한 셈이다.

그래서 임계값을 고점·저점 **각각** 정한다. 기준은 "ZigZag 정답 개수의 1.8배만큼 신호가 나오게"이고, 그 개수가 나오는 임계값을 이진 탐색으로 찾는다. 1.8배는 후처리에서 걸러질 몫을 감안한 여유다.

이 "1.8배"에는 나중에 드러난 함정이 있다. 어떤 종목에서는 그 목표 자체가 **애초에 도달할 수 없는 숫자**여서, 이진 탐색이 바닥까지 내려가 임계값이 0.01이 되어 버린다. 국내 종목 신호가 통째로 무너졌던 원인이 이것이었고, 무엇이 상한을 만들고 있었는지와 어떻게 잘랐는지는 [v2 글](/post/stockanalyst-turning-point-v2)에 적었다.

임계값을 넘긴 봉우리가 그대로 신호가 되는 것도 아니다. 네 단계 후처리를 거친다.

| 단계 | 하는 일 |
|---|---|
| 1. 가격 극값으로 스냅 | 신호일을 근처의 실제 고가·저가 날짜로 옮긴다 |
| 2. 창 안 극값 검증 | 그 날이 창 안에서 정말 극값인지 확인 |
| 3. 고저 교차 강제 | 고점 다음엔 저점, 저점 다음엔 고점만 허용 |
| 4. 최소 변동률 | 직전 신호 대비 변동이 너무 작으면 버림 |

적중률도 계산한다. 신호일 이후 5·10·20거래일 실제 종가와 대조해 매수는 상승, 매도는 하락이면 적중이고, 종목 상세에 **"과거 성과이며 미래 보장 아님"**과 함께 보여 준다.

## 종목당 1분이던 예측을 묶음으로

전 종목 예측을 결정하고 나니 속도가 문제였다. 종목당 1분이면 5,000종목은 83시간이다.

프로파일링해 보니 모델 계산이 아니라 **호출 방식**이었다. 종목마다 `model.predict`를 3번 부르는데, 시퀀스 수가 종목마다 달라서 TensorFlow가 매번 그래프를 다시 트레이싱했다. 시퀀스 1,100개짜리 작은 모델이면 실제 계산은 GPU에서 0.1초도 안 된다. 나머지는 전부 준비 시간이었다.

| | 종목별 호출 | 64종목 묶음 |
|---|---|---|
| 캔들 조회 | 종목마다 쿼리 | `IN (...)` 한 번 |
| 시퀀스 | 종목별 | 하나로 이어 붙임 |
| `model.predict` | 종목마다 3번 | 묶음당 3번, 결과를 종목별로 다시 나눔 |
| 임계값 탐색·후처리·전송 | 종목별 | 종목별 그대로 (밀리초 단위) |

<svg viewBox="0 0 640 104" width="100%" style="max-width:640px;display:block;margin:22px auto" role="img" aria-label="종목별 호출 15,000번이 64종목 묶음으로 240번이 됐다">
<text x="0" y="14" font-size="13" fill="var(--color-text-muted)">5,000종목 기준 model.predict 호출 횟수</text>
<text x="0" y="45" font-size="13" fill="var(--color-text)">전</text>
<rect x="60" y="30" width="390" height="20" rx="4" fill="var(--color-border-strong)"/>
<text x="458" y="45" font-size="13" fill="var(--color-text-muted)">15,000번</text>
<text x="0" y="85" font-size="13" fill="var(--color-text)">후</text>
<rect x="60" y="70" width="6" height="20" rx="4" fill="var(--color-accent)"/>
<text x="74" y="85" font-size="13" fill="var(--color-text-muted)">240번</text>
</svg>

결과는 같다. 모델이 배치 안의 다른 샘플에 영향을 받지 않는 구조라(추론 시 BatchNorm은 고정 통계) 확률이 소수점 여섯째 자리에서나 흔들린다.

모델은 캔들처럼 증분이 안 된다. 40일 창 때문이 아니라 **임계값을 전체 구간에서 정하기 때문**이다. 새 데이터 하루가 들어오면 임계값이 바뀌고, 임계값이 바뀌면 과거 신호도 바뀐다. 그래서 매번 2022년부터 전부 다시 돌리되, 그 계산을 싸게 만드는 쪽으로 갔다.

그리고 이 구조는 오래가지 않았다. **계산을 싸게 만드는 것과 그 계산이 필요한가는 다른 문제**였는데, 여기서는 앞의 것만 풀었기 때문이다. 결국 이 배치는 통째로 사라진다 → [변곡점 예측 v2](/post/stockanalyst-turning-point-v2).
