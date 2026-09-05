---
title: StockAnalyst 변곡점 예측 v2 - 배치를 지우고 온디맨드로, PyTorch 재학습과 정밀도 상한
date: 2026-09-02
category: stockanalyst
src: cover.svg
tags: [stockanalyst, python, pytorch, onnx, 변곡점, 머신러닝]
summary: 전 종목 배치 예측을 지우고 버튼을 눌렀을 때만 계산하는 구조로 바꾼 기록. 국내 종목 신호가 무너진 진짜 원인(임계값 이진 탐색의 도달 불가능한 목표)을 찾고, TensorFlow를 버리고 PyTorch로 옮겨 국내 372·미국 380종목으로 v2를 재학습했다. 그리고 평가를 정직하게 다시 짜서 "가격 지표만으로는 정밀도 0.6이 상한"이라는 결론에 도달한 과정.
---

> StockAnalyst는 Spring Boot + React(Vite) + Python 파이프라인으로 만든 주식 정보 서비스다. 이 글은 [변곡점 예측 1편](/post/stockanalyst-turning-point-model)의 후속이다. 1편이 Keras 앙상블과 배치 예측을 만든 이야기라면, 이 글은 그 배치를 지우고 모델을 다시 학습시킨 뒤 "이 모델이 실제로 얼마나 맞히는가"를 정직하게 재본 이야기다.

한눈에 보기

- 전 종목 배치 예측(`predict_fast.py`, 파이프라인 predict 단계)을 삭제. "AI 가격예측" 버튼을 눌렀을 때 Spring이 계산한다
- 국내 종목 신호가 망가진 원인은 학습 데이터가 아니라 임계값 이진 탐색의 목표가 도달 불가능했던 것. `TARGET_CAP=0.8`로 해결
- 윈도우 TensorFlow 2.18은 GPU를 못 써서 학습 코드를 PyTorch로 이식. 국내 372 + 미국 380종목으로 v2 재학습
- 평가를 다시 짜니 가격 지표 24개만으로는 정밀도 0.55~0.6이 상한. 학습 종목을 40→372로 늘려도 0.557→0.585에서 포화

## 배치를 통째로 지웠다

1편의 마지막은 "종목당 1분이던 예측을 64종목 묶음으로 바꿔 호출을 15,000번에서 240번으로 줄였다"였다. 그런데 그 최적화의 전제 자체가 틀렸다. 전 종목을 미리 계산할 이유가 없었다.

| | 배치(이전) | 온디맨드(지금) |
|---|---|---|
| 언제 계산 | 파이프라인 20분 주기, 전 종목 | 종목 상세 캔들차트(프로)에서 "AI 가격예측"을 누를 때 |
| 계산 주체 | Python `predict_fast.py` | Spring 백엔드 (ONNX Runtime) |
| 저장 | DB에 신호 테이블 적재 | Redis 캐시 `signal:v2:{ticker}:{asOf}` |
| 실제 사용률 | 전 종목 계산, 대부분 조회 안 됨 | 사용자가 본 종목만 |
| 코드 | predict-kr / predict-us 단계 | 파이프라인에서 삭제 |

한 종목 계산은 밀리초 단위다. 사용자가 하루에 열어보는 종목은 많아야 수십 개인데 5,000종목을 20분마다 다시 계산하고 있었다. 최적화를 잘한 게 아니라 안 해도 되는 일을 빠르게 하고 있었던 셈이다.

<svg viewBox="0 0 760 190" width="100%" style="max-width:760px;display:block;margin:22px auto" role="img" aria-label="배치 구조에서는 파이프라인이 전 종목을 계산해 DB에 넣었고, 온디맨드 구조에서는 버튼 클릭이 Spring의 ONNX 추론과 캐시로 이어진다">
<text x="0" y="14" font-size="13" fill="var(--color-text-muted)">이전 - 배치</text>
<rect x="0" y="26" width="176" height="46" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="88" y="54" font-size="13" fill="var(--color-text)" text-anchor="middle">파이프라인 20분</text>
<rect x="208" y="26" width="176" height="46" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="296" y="54" font-size="13" fill="var(--color-text)" text-anchor="middle">전 종목 예측</text>
<rect x="416" y="26" width="176" height="46" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="504" y="54" font-size="13" fill="var(--color-text)" text-anchor="middle">DB 적재</text>
<rect x="624" y="26" width="136" height="46" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="692" y="54" font-size="13" fill="var(--color-text-dim)" text-anchor="middle">대부분 미조회</text>
<path d="M176 49h26m-6-5l6 5-6 5M384 49h26m-6-5l6 5-6 5M592 49h26m-6-5l6 5-6 5" stroke="var(--color-text-dim)" stroke-width="1.5" fill="none"/>
<text x="0" y="122" font-size="13" fill="var(--color-text-muted)">지금 - 온디맨드</text>
<rect x="0" y="134" width="176" height="46" rx="8" fill="var(--color-accent-soft)" stroke="var(--color-accent)"/>
<text x="88" y="162" font-size="13" fill="var(--color-text)" text-anchor="middle" font-weight="600">버튼 클릭</text>
<rect x="208" y="134" width="176" height="46" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="296" y="162" font-size="13" fill="var(--color-text)" text-anchor="middle">Spring · ONNX</text>
<rect x="416" y="134" width="176" height="46" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="504" y="162" font-size="13" fill="var(--color-text)" text-anchor="middle">Redis 캐시</text>
<rect x="624" y="134" width="136" height="46" rx="8" fill="var(--color-accent-soft)" stroke="var(--color-accent)"/>
<text x="692" y="162" font-size="13" fill="var(--color-text)" text-anchor="middle">화면</text>
<path d="M176 157h26m-6-5l6 5-6 5M384 157h26m-6-5l6 5-6 5M592 157h26m-6-5l6 5-6 5" stroke="var(--color-text-dim)" stroke-width="1.5" fill="none"/>
</svg>

## 국내 종목만 신호가 무너진 이유

온디맨드로 옮기고 나서 삼성전자를 눌러 봤더니 신호가 엉망이었다. 임계값이 0.01, 즉 사실상 모든 확률 봉우리가 신호가 됐다. 미국 종목은 멀쩡했다.

처음 의심한 것은 학습 데이터였다. "미국 종목 위주로 학습해서 국내 종목에 안 맞는 것 아닌가." 그럴듯했지만 틀렸다. 원인은 임계값을 정하는 이진 탐색 자체에 있었다.

1편에서 임계값은 "ZigZag 정답 개수의 1.8배만큼 신호가 나오는 값"을 이진 탐색으로 찾는다고 썼다. 여기에 함정이 있다. 신호는 최소 10일 간격(`MIN_DISTANCE`)을 지켜야 하므로, 아무리 임계값을 낮춰도 나올 수 있는 봉우리 수에는 상한이 있다.

| | 미국 종목 | 국내 종목 |
|---|---|---|
| 변동성 | 상대적으로 낮음 | 높음 → ZigZag(5%) 극점이 많음 |
| 목표 개수 (극점 × 1.8) | 상한 안 | 상한 초과 |
| 이진 탐색 결과 | 정상 수렴 | 0.01 바닥으로 붕괴 |

목표가 도달 불가능하면 이진 탐색은 "더 낮추면 되겠지"를 반복하다 하한에 처박힌다. 코드가 잘못된 게 아니라 불가능한 목표를 주고 있었다.

<svg viewBox="0 0 700 150" width="100%" style="max-width:700px;display:block;margin:22px auto" role="img" aria-label="국내 종목은 목표 신호 개수가 10일 간격으로 나올 수 있는 최대 봉우리 수를 넘어 이진 탐색이 붕괴했다">
<text x="0" y="14" font-size="13" fill="var(--color-text-muted)">국내 종목 예시 - 신호 개수</text>
<text x="0" y="46" font-size="13" fill="var(--color-text)">가능한 최대</text>
<rect x="112" y="31" width="230" height="20" rx="4" fill="var(--color-border-strong)"/>
<text x="352" y="46" font-size="12" fill="var(--color-text-muted)">10일 간격이 만드는 상한</text>
<text x="0" y="86" font-size="13" fill="var(--color-text)">기존 목표</text>
<rect x="112" y="71" width="420" height="20" rx="4" fill="var(--color-border-strong)" opacity="0.45"/>
<text x="542" y="86" font-size="12" fill="var(--color-text-muted)">극점 × 1.8 → 도달 불가</text>
<text x="0" y="126" font-size="13" fill="var(--color-text)">수정 목표</text>
<rect x="112" y="111" width="184" height="20" rx="4" fill="var(--color-accent)"/>
<text x="306" y="126" font-size="12" fill="var(--color-text-muted)">전체 봉우리 × 0.8 로 자름</text>
</svg>

고친 방법은 한 줄이다. 목표를 전체 봉우리 수 × `TARGET_CAP`(0.8) 으로 잘랐다.

```python
# signal_core.py
TARGET_CAP = 0.8

def find_threshold_for_count(prob_series, target_count, min_distance):
    all_peaks, _ = find_peaks(prob_series, distance=min_distance)
    target_count = min(target_count, len(all_peaks) * TARGET_CAP)
    ...
```

백엔드 Java에도 같은 규칙을 넣었다. `SignalPostProcessor.findThresholdForCount(prob, target, minDistance, targetCap)` 로 인자를 하나 늘리고, `Params`에 `targetCap`을 추가했으며, `SignalModel`이 `config.json`의 `target_cap`(기본 0.8)을 읽는다. 파이썬과 Java 중 한쪽만 고치면 두 구현이 갈라지므로 항상 같이 바꾼다.

수정 후 삼성전자 임계값은 고점 0.45 / 저점 0.27로 돌아왔다. 원인을 데이터에서 찾았다면 몇 주를 학습에 썼을 것이다.

## TensorFlow를 버리고 PyTorch로

모델을 다시 학습시키려는데 GPU가 안 잡혔다. 윈도우용 TensorFlow는 2.11부터 네이티브 GPU 지원이 끊겼고, 설치돼 있던 2.18도 CPU만 썼다. 선택지는 셋이었다.

| 선택지 | 판단 |
|---|---|
| WSL/우분투 설치 | 환경을 하나 더 관리해야 함 - 안 하기로 함 |
| CPU로 학습 | 종목 400개 × 3모델은 현실적이지 않음 |
| PyTorch로 이식 | 감성 모델용 conda 환경(`stock-sentiment`)에 이미 torch 2.6 + CUDA가 있음 → 채택 |

이미 뉴스 감성 모델을 그 환경에서 학습시키고 있었으니 GPU(RTX 3070 Ti)는 그대로 쓸 수 있었다. 모델 3종을 PyTorch로 옮겨 `train_v2_torch.py`를 만들었다.

| 파일 | 역할 |
|---|---|
| `signal_core.py` | 지표·ZigZag·임계값 탐색·후처리. Java 포팅의 기준 - 여기 수식이 바뀌면 백엔드도 같이 바뀐다 |
| `train_v2.py` | 데이터 로드(DB 시총 상위 N), 라벨 완화, 시간순 분할, 평가 함수 |
| `train_v2_torch.py` | 실제 학습. 모델 3종 + focal loss + 조기 종료 + `torch.onnx.export` |
| `export_onnx.py` | 산출물을 백엔드로 복사하고 대조 정답 덤프 (base 환경, 서버 불필요) |
| `compare_java.py` | 백엔드 `/api/v1/stocknews/predict?debug=true` 와 값 대조 |

학습 명령은 이렇게 생겼다.

```bash
python findPoint/train_v2_torch.py --kr 400 --us 400 \
  --out saved_models_v2_400 --baseline models/signal \
  --copy-to ..\stock_infomation_backend\models\signal
```

ONNX는 `torch.onnx.export`(opset 17)로 바로 내보낸다. 입력은 `input` `[N, 40, 24]` float32, 출력은 `[N, 3]` 확률이다. 산출물 폴더 구조(`model_0..2.onnx`, `scaler.json`, `config.json`)를 이전 Keras 경로와 똑같이 맞춰서 백엔드는 무엇으로 학습했는지 몰라도 되게 했다.

이식이 맞는지는 값으로 확인했다. `compare_java.py`로 삼성전자 22개 신호 전부, AAPL 26개 신호 전부가 일치했고 확률 오차는 1e-6 수준이었다. TensorFlow는 이제 이 프로젝트에서 완전히 빠졌다.

## v2는 무엇을 바꿨나

| 항목 | 기존 | v2 |
|---|---|---|
| 학습 종목 | 소수 표본 | 국내 372 + 미국 380 (DB 시총 상위) |
| 기간 | 제한적 | 2015~2026 DB 캔들 |
| 라벨 | ZigZag 극점 당일만 정답 | ±2일 완화 - 하루 차이를 오답으로 보지 않음 |
| 분할 | 무작위 | 종목별 시간순 70/15/15, 조기 종료는 검증만 |
| 클래스 불균형 | 그대로 | 정상 구간 시퀀스 35%만 남김 + focal loss |
| 프레임워크 | Keras (CPU) | PyTorch (GPU) |

모델 3종은 BiLSTM+Attention, CNN+BiLSTM, Transformer이고 셋의 확률을 평균 낸다. 입력은 40일 창 × 지표 24개다(이동평균 이격도 4, MACD 3, RSI, 스토캐스틱 2, 볼린저 2, ATR, 거래량비, OBV, 수익률 5, 구간내 위치 3, 변동성).

시간순 분할이 특히 중요했다. 무작위로 나누면 같은 종목의 인접한 창이 학습과 테스트에 나뉘어 들어가 성능이 부풀려진다. 종목별로 앞 70%를 학습, 다음 15%를 검증, 마지막 15%를 테스트로 두고 테스트는 마지막에 딱 한 번만 봤다.

## 평가를 정직하게 다시 짰다

여기서부터가 이 작업의 본론이다. 모델을 새로 만들었으면 좋아졌는지 확인해야 하는데, 기존 평가로는 v2와 기존 모델이 거의 같아 보였다. 평가 방식이 잘못돼 있었다.

### ① 모델 자체 - 후처리 없이

먼저 후처리(스냅·검증·교차·변동률)를 전부 끄고, 모델이 내놓은 확률만으로 ZigZag 극점을 ±2일 안에 맞히는지 AP(정밀도-재현율 곡선 아래 면적)로 봤다.

| | 기존 (고점 / 저점) | v2 (고점 / 저점) |
|---|---|---|
| 국내 | 0.480 / 0.527 | 0.547 / 0.626 |
| 미국 | 0.316 / 0.413 | 0.392 / 0.505 |

전 구간에서 올랐고, 무작위로 찍었을 때 대비 1.9~2.7배다. 모델 자체는 분명히 좋아졌다.

### ② 실사용 - 미래를 보지 않고 매일 판정

문제는 이쪽이다. 화면에 그려지는 과거 신호는 뒤 데이터를 알고 있는 상태에서 계산된다. 실제로 쓸모가 있으려면 그날까지의 데이터만으로 "오늘이 변곡점인가"를 답할 수 있어야 한다. 그래서 매일 그 시점까지의 확률로만 신호를 내고, ±3일 안에 실제 극점이 있으면 적중으로 쳤다.

| 방식 | 국내 정밀도 | 미국 정밀도 |
|---|---|---|
| 모델 없이 "가격이 최근 10일 극점" 규칙만 | 0.52 | 0.35 |
| 기존 모델 | 0.563 | 0.423 |
| v2 모델 (×0.6 설정) | 0.568 | 0.459 |

<svg viewBox="0 0 700 208" width="100%" style="max-width:700px;display:block;margin:22px auto" role="img" aria-label="실사용 정밀도 비교. 국내는 규칙 0.52, 기존 0.563, v2 0.568. 미국은 규칙 0.35, 기존 0.423, v2 0.459">
<text x="0" y="14" font-size="13" fill="var(--color-text-muted)">미래를 보지 않은 신호의 정밀도 (±3일 적중)</text>
<text x="0" y="40" font-size="12" fill="var(--color-text-dim)">국내</text>
<text x="0" y="62" font-size="13" fill="var(--color-text)">가격 규칙</text>
<rect x="96" y="48" width="329" height="17" rx="4" fill="var(--color-border-strong)" opacity="0.45"/>
<text x="435" y="62" font-size="12" fill="var(--color-text-muted)">0.52</text>
<text x="0" y="86" font-size="13" fill="var(--color-text)">기존</text>
<rect x="96" y="72" width="356" height="17" rx="4" fill="var(--color-border-strong)"/>
<text x="462" y="86" font-size="12" fill="var(--color-text-muted)">0.563</text>
<text x="0" y="110" font-size="13" fill="var(--color-text)">v2</text>
<rect x="96" y="96" width="360" height="17" rx="4" fill="var(--color-accent)"/>
<text x="466" y="110" font-size="12" fill="var(--color-text-muted)">0.568</text>
<text x="0" y="140" font-size="12" fill="var(--color-text-dim)">미국</text>
<text x="0" y="162" font-size="13" fill="var(--color-text)">가격 규칙</text>
<rect x="96" y="148" width="222" height="17" rx="4" fill="var(--color-border-strong)" opacity="0.45"/>
<text x="328" y="162" font-size="12" fill="var(--color-text-muted)">0.35</text>
<text x="0" y="186" font-size="13" fill="var(--color-text)">기존</text>
<rect x="96" y="172" width="268" height="17" rx="4" fill="var(--color-border-strong)"/>
<text x="374" y="186" font-size="12" fill="var(--color-text-muted)">0.423</text>
<text x="0" y="210" font-size="13" fill="var(--color-text)">v2</text>
<rect x="96" y="196" width="291" height="17" rx="4" fill="var(--color-accent)"/>
<text x="397" y="210" font-size="12" fill="var(--color-text-muted)">0.459</text>
</svg>

국내에서 모델이 가격 규칙보다 나은 폭은 0.52 → 0.568, 5%p 남짓이다. 미국은 0.35 → 0.459로 폭이 크지만, 미국은 애초에 규칙만으로는 잘 안 되는 시장이라는 뜻이기도 하다.

### ③ 데이터를 더 넣으면 되지 않을까

가장 먼저 떠오르는 처방은 "종목을 더 넣자"다. 실제로 해봤다. 국내 학습 종목을 40 → 120 → 372로 늘렸다.

<svg viewBox="0 0 700 170" width="100%" style="max-width:700px;display:block;margin:22px auto" role="img" aria-label="국내 학습 종목을 40, 120, 372개로 늘렸을 때 정밀도는 0.557, 0.582, 0.585로 포화됐다">
<text x="0" y="14" font-size="13" fill="var(--color-text-muted)">학습 종목 수에 따른 국내 정밀도</text>
<line x1="60" y1="130" x2="660" y2="130" stroke="var(--color-border)" stroke-width="1"/>
<line x1="60" y1="34" x2="60" y2="130" stroke="var(--color-border)" stroke-width="1"/>
<text x="52" y="38" font-size="11" fill="var(--color-text-dim)" text-anchor="end">0.60</text>
<text x="52" y="134" font-size="11" fill="var(--color-text-dim)" text-anchor="end">0.54</text>
<path d="M120 98 L330 58 L600 53" fill="none" stroke="var(--color-accent)" stroke-width="2"/>
<circle cx="120" cy="98" r="5" fill="var(--color-accent)"/>
<circle cx="330" cy="58" r="5" fill="var(--color-accent)"/>
<circle cx="600" cy="53" r="5" fill="var(--color-accent)"/>
<text x="120" y="86" font-size="12" fill="var(--color-text)" text-anchor="middle">0.557</text>
<text x="330" y="46" font-size="12" fill="var(--color-text)" text-anchor="middle">0.582</text>
<text x="600" y="41" font-size="12" fill="var(--color-text)" text-anchor="middle">0.585</text>
<text x="120" y="148" font-size="12" fill="var(--color-text-dim)" text-anchor="middle">40종목</text>
<text x="330" y="148" font-size="12" fill="var(--color-text-dim)" text-anchor="middle">120종목</text>
<text x="600" y="148" font-size="12" fill="var(--color-text-dim)" text-anchor="middle">372종목</text>
</svg>

40 → 120에서 0.025 오르고, 120 → 372에서는 0.003 오른다. 포화다. 과적합도 아니다. 학습 손실이 검증 손실보다 낮지 않았으니 모델이 데이터를 외운 게 아니라, 더 배울 게 남지 않은 것이다.

### 결론 - 상한은 0.6 근처다

세 실험을 합치면 답이 나온다. 가격에서 뽑은 지표 24개만으로는 "지금 이 국소 극점이 진짜 5% 반전의 시작인지"를 동전 던지기보다 조금 나은 수준으로만 판별할 수 있다. 정밀도 상한은 0.55~0.6이다. 모델 구조를 바꾸거나 데이터를 더 넣어서 넘을 수 있는 벽이 아니다.

넘으려면 입력이나 목표를 바꿔야 한다.

| 방향 | 내용 |
|---|---|
| 비가격 입력 | 뉴스 감성 점수, 공매도 잔고, 투자자별 매매 동향, 지수 대비 상대강도 |
| 목표 변경 | "지금이 극점인가" 대신 "향후 10일 안에 ±5% 움직일 확률" - 시점을 맞히지 않아도 되는 문제로 |

둘 다 별도 과제로 남겼다. 지금 중요한 건 상한을 알고 쓰는 것이다.

## 평가 규칙에서 걷어낸 두 가지

처음에 v2와 기존 모델이 실사용 평가에서 거의 같게 나왔다. 모델이 안 좋아진 게 아니라 평가가 차이를 지우고 있었다.

| 문제 | 왜 차이를 지웠나 |
|---|---|
| 확률이 "최근 5일 중 최고"일 때만 신호로 인정 | v2는 라벨을 ±2일로 완화해 확률 곡선이 평탄해졌다. 뾰족함을 요구하는 조건이 v2에 불리하게 작용했다 |
| 개수를 맞추는 임계값을 평가에도 그대로 사용 | 목표 개수를 채우려고 임계값이 알아서 내려가 신호를 억지로 만들어낸다. 모델이 나빠도 개수는 채워진다 |

두 조건을 평가에서 빼고 변형별로 비교하도록 바꾸자 그제야 v2가 앞선다는 게 보였다. 평가 규칙이 모델보다 먼저 의심 대상이라는 걸 배웠다.

## 이건 예측인가, 표시인가

한 가지 정직하게 적어둘 것이 있다. 화면에 보이는 과거 신호는 위치가 꽤 정확한데, 그건 후처리 1단계에서 신호일을 근처 실제 고가·저가 날짜로 스냅하기 때문이다. 가격을 보고 맞춘 것이므로 예측이라기보다 "지나간 변곡점 표시"에 가깝다.

미래를 모르는 상태에서의 성능은 위 ②번 표의 0.57 / 0.46이 전부다. 잘 맞는 것처럼 보이는 과거 그림과 실제 예측력 사이의 간극을 사용자가 오해하지 않는 게 더 중요하다.

이 숙제는 문구를 고치는 대신 신호 자체를 두 종류로 나누는 것으로 풀었다. 그날까지의 데이터만 보고 찍혀 다시는 안 바뀌는 신호와, 전 구간을 다시 보고 찍는 사후 분석을 차트에서 모양으로 구분한다 → [개발기 (3)](/post/stockanalyst-dev-log-3-signals-rates).

## 운영 메모

모델을 갱신할 때 순서를 헷갈리면 백엔드와 파이썬이 다른 모델을 보게 된다. 네 단계로 고정했다.

| # | 단계 | 명령 / 확인 |
|---|---|---|
| 1 | 학습 | `train_v2_torch.py --kr 400 --us 400 --copy-to ..\stock_infomation_backend\models\signal` |
| 2 | 정답 덤프 | base 환경에서 `export_onnx.py --skip-export --model-dir saved_models_v2_400 --dump 005930,AAPL` |
| 3 | 백엔드 재빌드·재시작 | 새 `models/signal`을 물고 뜨는지 확인 |
| 4 | 대조 | `compare_java.py` - 신호 위치와 확률이 파이썬과 같은지 |

나머지 메모.

- 파이프라인 스크립트는 전부 DB에 직접 붙는다. 백엔드가 떠 있어야 하는 건 `compare_java.py` 하나뿐이다
- `saved_models_v2*/` 와 `models/` 는 gitignore. 대신 Docker 배포 이미지에는 `models/signal`을 꼭 포함해야 한다

유니버스 prune, 나스닥100 목록 캐시, 미국 캔들 백필처럼 모델과 상관없는 운영 항목은 [데이터 파이프라인 글](/post/stockanalyst-data-pipeline)로 모아 뒀다.

## 정리

이번 작업에서 실제로 배운 것은 모델이 아니라 셋이다.

1. 안 해도 되는 계산을 빠르게 만들지 말 것. 배치 최적화는 잘 만든 낭비였다
2. 이상 동작의 원인을 데이터에서 먼저 찾지 말 것. 국내 신호 붕괴는 학습이 아니라 임계값 목표가 도달 불가능해서였다
3. 평가를 모델보다 먼저 의심할 것. 그리고 평가가 정직해지면 대개 좋은 소식이 아니라 상한을 알려준다

가격만 보는 모델의 상한을 확인했으니, 다음은 뉴스 감성과 수급 데이터를 입력으로 넣는 쪽이다. 아직 손대지 않았고, 그 사이에 한 일은 [개발기 (3)](/post/stockanalyst-dev-log-3-signals-rates)에 있다.
