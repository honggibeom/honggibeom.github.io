---
title: StockAnalyst 뉴스 감성 분류, 한국어 BERT를 파인튜닝해서 Spring에서 ONNX로 돌리기
date: 2026-09-01
category: stockanalyst
src: cover.svg
tags: [python, spring, bert, onnx, 감성분석, 파인튜닝, stockanalyst]
summary: 뉴스 기사의 호재/악재 판정을 Gemini에서 자체 모델로 옮겼다. 왜 LLM이 아니라 BERT 분류기인지, 정답 데이터를 어떻게 만들고 어떻게 평가했는지, 그리고 파이썬 없이 Spring 안에서 ONNX로 추론하는 구조까지 실험 기록 그대로 남긴다.
---

> StockAnalyst는 Spring Boot + React(Vite) + Python 파이프라인으로 만든 주식 정보 서비스다. 뉴스 기사마다 "호재인지 악재인지"와 "어느 종목 얘기인지"를 붙여 주는데, 처음엔 Gemini API 한 번으로 둘 다 처리하다가 호출 제한과 환각 때문에 둘 다 자체 구현으로 바꿨다. 종목 쪽은 [사전 매칭 글](/post/stockanalyst-ticker-extraction)에 정리했고, 이 글은 **감성 모델** 얘기다. 결론부터 말하면 한국어 BERT 계열 모델을 직접 파인튜닝해서, Spring 안에서 ONNX Runtime으로 추론하는 구조가 됐다. 이후 작업 전체의 목차는 [개발기 (2)](/post/stockanalyst-dev-log-2-overview)에 있다.

**한눈에 보기**

- 3분류 문제에는 생성 모델이 아니라 **BERT 인코더 + 분류 헤드**. 자바에서는 ONNX Runtime으로 추론, 파이썬 의존성 0
- 정답 데이터는 Gemini 라벨을 쓰지 않고 **직접 라벨링한 gold 740건**. 라벨 기준을 "주가 영향"에서 "회사에 좋은 소식인가"로 한 번 뒤집었다
- 다수결 기준선과 5-fold 교차검증 없이는 숫자를 믿을 수 없었다. 최종 **klue/roberta-large 81.0% ± 3.8, 방향 정확도 97.8%**
- "금리 = 악재"처럼 단어에 붙은 편향은 규칙이 아니라 **반례 데이터**로 고쳤다

## 1. 모델 선택 - mini GPT가 아니라 BERT

처음 떠올린 건 "mini GPT 같은 걸 자바에서 돌릴 수 없나"였다. 그런데 문제를 다시 보면 이건 **3분류**다. 호재 / 중립 / 악재. 문장을 생성할 필요가 없다.

### 인코더 + 분류 헤드가 낫다

GPT 같은 생성 모델은 다음 토큰을 하나씩 뽑는 구조라, 분류를 시키려면 "이 기사는 호재입니다" 같은 문장을 생성시키고 그걸 다시 파싱해야 한다. 모델이 지시를 안 따르면 파싱이 깨지고, 토큰을 하나씩 만드니 느리다.

BERT 계열 **인코더**는 문장 전체를 한 번에 읽어서 각 토큰의 벡터를 만든다. 맨 앞 `[CLS]` 토큰 벡터가 문장 전체 요약 역할을 하고, 그 위에 작은 선형 레이어(**분류 헤드**)를 얹으면 클래스 수만큼의 점수(로짓)가 나온다. 3분류면 숫자 3개, softmax를 거치면 합이 1인 확률 3개. 파싱할 게 없다.

<svg viewBox="0 0 760 150" width="100%" style="max-width:760px;display:block;margin:24px auto" role="img" aria-label="제목이 토크나이저, 인코더, 분류 헤드를 거쳐 확률 3개와 점수 하나가 되는 흐름">
  <g font-size="13" fill="var(--color-text)" text-anchor="middle">
    <rect x="4" y="40" width="112" height="56" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
    <text x="60" y="64">기사 제목</text><text x="60" y="82" fill="var(--color-text-dim)" font-size="11">문자열</text>
    <rect x="156" y="40" width="112" height="56" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
    <text x="212" y="64">토크나이저</text><text x="212" y="82" fill="var(--color-text-dim)" font-size="11">input_ids · mask</text>
    <rect x="308" y="40" width="112" height="56" rx="8" fill="var(--color-accent-soft)" stroke="var(--color-accent)"/>
    <text x="364" y="64" font-weight="600">인코더</text><text x="364" y="82" fill="var(--color-text-dim)" font-size="11">[CLS] 벡터</text>
    <rect x="460" y="40" width="112" height="56" rx="8" fill="var(--color-accent-soft)" stroke="var(--color-accent)"/>
    <text x="516" y="64" font-weight="600">분류 헤드</text><text x="516" y="82" fill="var(--color-text-dim)" font-size="11">로짓 3개</text>
    <rect x="612" y="40" width="144" height="56" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
    <text x="684" y="64">softmax</text><text x="684" y="82" fill="var(--color-text-dim)" font-size="11">p(neg) p(neu) p(pos)</text>
  </g>
  <g stroke="var(--color-text-dim)" stroke-width="1.5" fill="none">
    <path d="M116 68h34m-6-5l6 5-6 5"/><path d="M268 68h34m-6-5l6 5-6 5"/><path d="M420 68h34m-6-5l6 5-6 5"/><path d="M572 68h34m-6-5l6 5-6 5"/>
  </g>
  <text x="684" y="128" font-size="12" fill="var(--color-text-muted)" text-anchor="middle">score = p(pos) − p(neg)</text>
  <text x="364" y="128" font-size="12" fill="var(--color-text-dim)" text-anchor="middle">Spring: DJL 토크나이저 + ONNX Runtime · Python: 학습 때만</text>
</svg>

| | 소형 LLM (1B~7B) | BERT 분류 (110M~340M) |
|---|---|---|
| 크기 | 2~8GB | INT8 양자화 시 110~330MB |
| CPU 추론 | 기사당 수 초 | 기사당 수십 ms |
| 출력 | 텍스트 → 파싱 필요 | 확률 3개 |
| 실패 방식 | 지시 무시, 형식 이탈 | 없음. 항상 확률이 나온다 |

기사 수천 건을 CPU에서 배치로 돌려야 하고 실시간 검색에도 써야 하니, 선택의 여지가 없었다.

### 자바에서 돌리기 - ONNX Runtime + DJL 토크나이저

파이썬 서버를 하나 더 띄우고 싶지 않았다. 배포 대상이 하나 늘어나면 장애 지점도 하나 늘어난다. 자바 실행은 **ONNX Runtime Java** + **DJL의 HuggingFace 토크나이저** 조합으로 했다.

1. 학습한 모델을 ONNX 파일로 내보낸다 (파이썬, 한 번만)
2. Spring이 기동할 때 ONNX Runtime 세션을 열고, 같이 내보낸 토크나이저 파일로 DJL 토크나이저를 만든다
3. 기사 제목이 들어오면 토크나이저가 `input_ids`, `attention_mask`를 만든다. 파이썬 학습 때와 같은 토크나이저 규칙이어야 한다
4. 세션에 넣으면 로짓 3개가 나온다 → softmax → 확률

파이썬 의존성이 0이고, 도커 이미지는 모델 파일 크기만큼만 커진다. Jlama 같은 자바 네이티브 LLM 런타임도 봤는데 Vector API 때문에 Java 21이 필요해서(프로젝트는 17) 제외했다. 어차피 LLM을 안 쓰기로 했으니 아쉬울 것도 없었다.

### 점수를 하나로 접기

확률 3개를 그대로 화면에 뿌리진 않는다. **`score = p[pos] − p[neg]`**로 −1~+1 사이 값 하나를 만들고, `|score| < 밴드`면 중립으로 표시한다.

<svg viewBox="0 0 640 120" width="100%" style="max-width:640px;display:block;margin:20px auto" role="img" aria-label="−1부터 +1까지의 점수 축과 가운데 중립 밴드">
  <defs><linearGradient id="sa-scale" x1="0" x2="1"><stop offset="0" stop-color="#e5534b"/><stop offset="0.5" stop-color="var(--color-border-strong)"/><stop offset="1" stop-color="var(--color-accent)"/></linearGradient></defs>
  <rect x="40" y="40" width="560" height="10" rx="5" fill="url(#sa-scale)"/>
  <rect x="180" y="30" width="280" height="30" rx="4" fill="var(--color-text)" opacity="0.08"/>
  <g font-size="12" fill="var(--color-text-muted)" text-anchor="middle">
    <text x="40" y="76">−1</text><text x="180" y="76">−0.5</text><text x="320" y="76">0</text><text x="460" y="76">+0.5</text><text x="600" y="76">+1</text>
    <text x="110" y="20" fill="var(--color-text)">악재</text><text x="320" y="20" fill="var(--color-text)">중립 (밴드 = 0.5)</text><text x="530" y="20" fill="var(--color-text)">호재</text>
  </g>
  <g font-size="12" fill="var(--color-text-dim)" text-anchor="middle">
    <circle cx="104" cy="45" r="5" fill="var(--color-text)" stroke="var(--color-bg-elevated)" stroke-width="2"/><text x="104" y="104">동결 문장, 재학습 전 −0.77</text>
    <circle cx="345" cy="45" r="5" fill="var(--color-text)" stroke="var(--color-bg-elevated)" stroke-width="2"/><text x="345" y="104">재학습 후 +0.09</text>
  </g>
</svg>

| p(neg) | p(neu) | p(pos) | score | 밴드 0.5 판정 | 밴드 0.3 판정 |
|---|---|---|---|---|---|
| 0.05 | 0.15 | 0.80 | +0.75 | 호재 | 호재 |
| 0.20 | 0.40 | 0.40 | +0.20 | 중립 | 중립 |
| 0.10 | 0.45 | 0.45 | +0.35 | 중립 | 호재 |
| 0.85 | 0.10 | 0.05 | −0.80 | 악재 | 악재 |

이렇게 접는 이유가 있다. 첫째, UI에서는 "얼마나 호재인가"를 한 축으로 보여주는 게 훨씬 읽기 쉽다. 게이지 하나, 색 하나면 된다. 둘째, **밴드가 서비스 설정값**이라 모델을 다시 학습하지 않고도 중립의 폭을 조절할 수 있다. 위 표의 셋째 줄처럼 밴드를 0.5에서 0.3으로 줄이면 같은 확률이 중립에서 호재로 바뀐다. 모델은 확률만 내고, "어디까지를 중립으로 볼 것인가"는 서비스가 정한다.

## 2. 정답지 만들기 - 가장 오래 걸린 부분

모델보다 데이터가 문제였다.

### Gemini 라벨을 정답으로 쓰면 안 되는 이유

DB에는 이미 Gemini가 붙여 둔 감성 라벨이 수천 건 있었다. 이걸 정답으로 학습하면 빠르긴 한데, 그러면 **Gemini의 습관을 그대로 배운다.** Gemini가 "출시"를 무조건 호재로 찍었다면 내 모델도 그렇게 찍고, Gemini가 틀린 건 내 모델도 틀린다. 잘해야 Gemini만큼이고, Gemini를 걷어내려던 이유 중 하나인 오판은 하나도 해결이 안 된다.

그래서 **기사를 뽑아서 사람(여기선 Claude)이 다시 라벨을 달아 gold 데이터셋**을 만들었다. 흐름은 `export_for_review.py`로 검수 대상을 추출하고 → 라벨을 달고 → `import_labels.py`로 gold에 병합한다. 검수 대상은 무작위로도, 특정 키워드가 들어간 것만 골라서도 뽑을 수 있다. 이게 뒤에서 편향을 잡을 때 요긴했다.

### 라벨 기준을 한 번 뒤집었다

| | v1 | v2 |
|---|---|---|
| 기준 | **주가에 실제 영향이 있는가** | **회사에 좋은 소식인가 나쁜 소식인가** |
| 제품 출시, 수상, 인재 영입, 행사 | 중립 | 약호재 (+0.1~0.3) |
| 소송, 경쟁 위협, 거래 제한 | 상황에 따라 | 약악재 |
| 중립으로 남는 것 | 실적·수주·규제·사고가 아닌 거의 전부 | 모아보기, 호악재 혼재, CEO 교체, 칼럼·정치·사회 |
| 제목만 보고 판정 가능한가 | 아니오 | 예 |

v1은 이론적으로 맞는 기준이다. 주가를 움직이는 건 실적, 수주, 규제, 사고 같은 것이지 "갤럭시 신제품 출시"가 아니라는 논리다.

그런데 300건 → 600건으로 데이터를 두 배로 늘려도 정확도가 72%에서 74.8%로 겨우 올랐다. 데이터를 늘려도 안 오르면 양이 아니라 **라벨 자체**를 의심해야 한다. 오답 159건을 하나씩 보니 원인이 보였다. "갤럭시 북6 출시"를 모델은 호재라고 하고 정답은 중립이다. 모델이 이상한 게 아니다. **제목만 봐서는 절대 구분할 수 없는 라벨**을 강요하고 있었던 것이다. "출시가 주가에 영향이 있는지"는 그 제품이 뭔지, 시장 기대가 어땠는지를 알아야 판단할 수 있는데, 제목 열 글자에 그 정보는 없다.

v2는 기준을 "제목에 있는 정보만으로 판단 가능한가"로 바꾼 셈이다. 모델에게 줄 수 있는 입력이 제목뿐이면, 라벨도 제목만 보고 달 수 있는 것이어야 한다. 기존 600건 중 111건을 이 기준으로 다시 달았다.

## 3. 실험 기록

| 단계 | 데이터 | 모델 | 3-class 정확도 | 호재 vs 악재 방향 |
|---|---|---|---|---|
| 첫 평가 | 20건 | KR-FinBert-SC 미학습 | 65% | – |
| 기준선 확인 | 20건 | "항상 호재" | **75%** | – |
| 1차 | 300건 | KR-FinBert-SC 파인튜닝 | 72.3% ± 2.2 | – |
| 2차 | 600건 | KR-FinBert-SC | 74.8% ± 3.0 | 93.5% |
| 라벨 v2 | 600건 | KR-FinBert-SC | 74.8% ± 3.0 | 93.5% |
| **모델 교체** | 600건 | **klue/roberta-large** | **81.0% ± 3.8** | **97.8%** |

<svg viewBox="0 0 640 190" width="100%" style="max-width:640px;display:block;margin:20px auto" role="img" aria-label="5-fold 교차검증 3-class 정확도: 300건 FinBert 72.3±2.2, 600건 FinBert 74.8±3.0, 600건 roberta-large 81.0±3.8">
  <text x="0" y="14" font-size="13" fill="var(--color-text-muted)">3-class 정확도 (5-fold 교차검증, 평균 ± 표준편차)</text>
  <g stroke="var(--color-border)" stroke-width="1">
    <line x1="150" y1="30" x2="150" y2="150"/><line x1="290" y1="30" x2="290" y2="150"/><line x1="430" y1="30" x2="430" y2="150"/><line x1="570" y1="30" x2="570" y2="150"/>
  </g>
  <g font-size="11" fill="var(--color-text-dim)" text-anchor="middle">
    <text x="150" y="166">60%</text><text x="290" y="166">70%</text><text x="430" y="166">80%</text><text x="570" y="166">90%</text>
  </g>
  <g font-size="13" fill="var(--color-text)">
    <text x="0" y="52">300건 FinBert</text>
    <rect x="150" y="38" width="172" height="20" rx="4" fill="var(--color-border-strong)"/>
    <line x1="291" y1="48" x2="353" y2="48" stroke="var(--color-text)" stroke-width="1.5"/><line x1="291" y1="42" x2="291" y2="54" stroke="var(--color-text)" stroke-width="1.5"/><line x1="353" y1="42" x2="353" y2="54" stroke="var(--color-text)" stroke-width="1.5"/>
    <text x="362" y="53" fill="var(--color-text-muted)">72.3 ± 2.2</text>
    <text x="0" y="92">600건 FinBert</text>
    <rect x="150" y="78" width="207" height="20" rx="4" fill="var(--color-border-strong)"/>
    <line x1="315" y1="88" x2="399" y2="88" stroke="var(--color-text)" stroke-width="1.5"/><line x1="315" y1="82" x2="315" y2="94" stroke="var(--color-text)" stroke-width="1.5"/><line x1="399" y1="82" x2="399" y2="94" stroke="var(--color-text)" stroke-width="1.5"/>
    <text x="408" y="93" fill="var(--color-text-muted)">74.8 ± 3.0</text>
    <text x="0" y="132">600건 roberta-large</text>
    <rect x="150" y="118" width="294" height="20" rx="4" fill="var(--color-accent)"/>
    <line x1="391" y1="128" x2="497" y2="128" stroke="var(--color-text)" stroke-width="1.5"/><line x1="391" y1="122" x2="391" y2="134" stroke="var(--color-text)" stroke-width="1.5"/><line x1="497" y1="122" x2="497" y2="134" stroke="var(--color-text)" stroke-width="1.5"/>
    <text x="506" y="133" fill="var(--color-text-muted)">81.0 ± 3.8</text>
  </g>
</svg>

숫자보다 교훈이 중요하다.

### 다수결 기준선을 항상 같이 찍어라

첫 평가의 65%는 착시였다. 표본 20건 중 15건이 호재라서, **"무조건 호재"라고 찍는 바보 모델도 75%**가 나온다. 65%짜리 모델은 바보보다 못한 거였다. 모델 정확도는 절대값이 아니라 "가장 많은 클래스를 항상 찍는 기준선보다 얼마나 나은가"로 봐야 한다. 이후 평가 스크립트에 다수결 기준선을 항상 같이 출력하고, 표본이 100건 미만이면 판정을 보류하게 했다.

### 5-fold 교차검증 - ±가 붙어야 숫자를 믿을 수 있다

처음엔 300건을 학습 8 : 검증 2로 한 번 나눠서 평가했다. 검증이 59건이다. 59건이면 기사 한 건이 정확도 1.7%p를 좌우한다. 실제로 **분할을 바꿔 가며 돌리니 편차가 ±7%p**였다. 72%와 79%가 같은 모델에서 나온다. 이 상태에서 "라벨을 바꿨더니 2%p 올랐다"는 말은 아무 의미가 없다.

<svg viewBox="0 0 640 180" width="100%" style="max-width:640px;display:block;margin:20px auto" role="img" aria-label="5-fold 교차검증: 데이터를 5조각으로 나눠 매번 다른 한 조각을 검증에 쓴다">
  <g font-size="12" fill="var(--color-text-muted)">
    <text x="0" y="20">fold 1</text><text x="0" y="50">fold 2</text><text x="0" y="80">fold 3</text><text x="0" y="110">fold 4</text><text x="0" y="140">fold 5</text>
  </g>
  <g fill="var(--color-border-strong)">
    <rect x="60" y="6" width="98" height="20" rx="4"/><rect x="160" y="6" width="98" height="20" rx="4"/><rect x="260" y="6" width="98" height="20" rx="4"/><rect x="360" y="6" width="98" height="20" rx="4"/>
    <rect x="60" y="36" width="98" height="20" rx="4"/><rect x="160" y="36" width="98" height="20" rx="4"/><rect x="260" y="36" width="98" height="20" rx="4"/><rect x="460" y="36" width="98" height="20" rx="4"/>
    <rect x="60" y="66" width="98" height="20" rx="4"/><rect x="160" y="66" width="98" height="20" rx="4"/><rect x="360" y="66" width="98" height="20" rx="4"/><rect x="460" y="66" width="98" height="20" rx="4"/>
    <rect x="60" y="96" width="98" height="20" rx="4"/><rect x="260" y="96" width="98" height="20" rx="4"/><rect x="360" y="96" width="98" height="20" rx="4"/><rect x="460" y="96" width="98" height="20" rx="4"/>
    <rect x="160" y="126" width="98" height="20" rx="4"/><rect x="260" y="126" width="98" height="20" rx="4"/><rect x="360" y="126" width="98" height="20" rx="4"/><rect x="460" y="126" width="98" height="20" rx="4"/>
  </g>
  <g fill="var(--color-accent)">
    <rect x="460" y="6" width="98" height="20" rx="4"/><rect x="360" y="36" width="98" height="20" rx="4"/><rect x="260" y="66" width="98" height="20" rx="4"/><rect x="160" y="96" width="98" height="20" rx="4"/><rect x="60" y="126" width="98" height="20" rx="4"/>
  </g>
  <g font-size="12" fill="var(--color-text-muted)">
    <rect x="60" y="160" width="12" height="12" rx="3" fill="var(--color-border-strong)"/><text x="78" y="171">학습 (480건)</text>
    <rect x="180" y="160" width="12" height="12" rx="3" fill="var(--color-accent)"/><text x="198" y="171">검증 (120건)</text>
    <text x="330" y="171" fill="var(--color-text-dim)">→ 정확도 5개의 평균과 표준편차</text>
  </g>
</svg>

5-fold 교차검증은 데이터를 5조각으로 나눠서, 4조각으로 학습하고 1조각으로 검증하는 걸 조각을 바꿔 가며 5번 한다. 600건 전부가 한 번씩 검증에 쓰이고, 5개 정확도의 평균과 표준편차가 나온다. 표에 붙은 ±가 그것이다. 이제 "74.8 ± 3.0"과 "81.0 ± 3.8"은 편차를 감안해도 거의 겹치지 않으니 진짜 차이라고 말할 수 있다.

### 오답 분석이 방향을 정했다

<svg viewBox="0 0 640 90" width="100%" style="max-width:640px;display:block;margin:20px auto" role="img" aria-label="오답 159건 중 중립 경계 문제 144건, 방향 뒤집힘 15건">
  <text x="0" y="16" font-size="13" fill="var(--color-text-muted)">600건 중 오답 159건의 구성</text>
  <rect x="0" y="30" width="541" height="22" rx="4" fill="var(--color-border-strong)"/>
  <rect x="543" y="30" width="57" height="22" rx="4" fill="#e5534b"/>
  <text x="8" y="46" font-size="13" fill="var(--color-text)" font-weight="600">중립 경계 문제 144 (91%)</text>
  <text x="608" y="46" font-size="13" fill="var(--color-text-muted)">15</text>
  <text x="0" y="80" font-size="12" fill="var(--color-text-dim)">오른쪽 15건(9%)만 호재↔악재를 정반대로 찍은 것. 방향은 이미 93% 맞추고 있었다</text>
</svg>

즉 문제는 방향이 아니라 "어디까지를 중립으로 볼 것이냐"였다. 이게 앞의 라벨 v2로 이어진다.

그런데 라벨을 v2로 바꿔도 FinBert의 3-class 숫자는 74.8%로 **정확히 그대로**였다. 오답의 구성만 바뀌었다. 이 모델은 600건으로는 75% 근처가 한계였던 것이다. 데이터도 라벨도 손봤는데 안 움직이면 남은 변수는 모델이다.

### 모델 교체, 그리고 며칠을 잡아먹은 인코딩

klue/roberta-large(340M)로 바꾸자 81%, 방향 97.8%로 올랐다. KR-FinBert-SC는 금융 도메인으로 사전학습된 BERT-base급 모델이고, roberta-large는 3배 크고 한국어 일반 코퍼스로 학습된 모델이다. 600건짜리 작은 데이터로 파인튜닝할 때는 도메인 특화보다 **기본 언어 이해력이 높은 큰 모델**이 더 잘 붙었다.

사실 300건 시점에 roberta-large를 시도했다가 실패했었다. 성능 문제인 줄 알고 접었는데, 나중에 보니 **PowerShell에서 파일로 출력을 받을 때 cp949 인코딩으로 "—" 문자에서 죽은 거였다.** 학습이 시작도 못 하고 죽은 걸 "안 되는 모델"로 오해했다. 이걸 늦게 발견해서 며칠을 FinBert로 씨름했다. 에러 로그 첫 줄을 제대로 읽었으면 하루면 끝났을 일이다.

## 4. 단어 편향 잡기 - "동결"이 악재?

ONNX로 내보낼 때 검증 문장 세 개를 돌려 보는데, **"한국은행이 기준금리를 현 수준에서 동결하기로 결정했다"가 −0.77 악재**로 나왔다. 동결은 예상대로면 중립, 인상 우려가 있던 상황이면 오히려 호재다. 악재일 이유가 없다.

원인은 데이터였다. gold에 있는 금리 기사가 전부 **인상 국면** 기사라, 모델이 "금리"라는 단어 자체를 악재로 배운 것이다. 학습 데이터 안에서는 "금리 = 악재"가 실제로 성립하니까 모델 입장에선 틀린 게 아니다. 세상이 그렇지 않을 뿐이다. 이런 걸 허위 상관이라고 부른다. 단어와 정답이 우연히 같이 움직여서 모델이 그 단어를 지름길로 쓰는 것이다.

고치는 방법은 규칙이 아니라 **데이터**다. 모델에 "금리는 중립으로 봐라" 같은 예외를 박을 수는 없다. 대신 반례를 먹인다.

1. `export_for_review.py --keyword "동결|인하|피벗|금통위"`로 DB에서 관련 기사를 뽑았다
2. 부족한 만큼 "기준금리 동결", "금리 인하" 검색어로 331건을 새로 수집했다
3. 그중 140건을 추가 라벨링했다

이때 라벨의 핵심은 **맥락 구분**이다. 같은 "동결"이라도 다르게 달아야 모델이 단어가 아니라 맥락을 보게 된다.

| 제목 | 라벨 | 이유 |
|---|---|---|
| 인상 국면에서 "10월 동결 전망" | 호재 | 올릴 줄 알았는데 안 올린다 |
| "매파적 동결" | 악재 | 동결했지만 다음엔 올린다는 신호 |
| "금리인하요구권 안내" | 중립 | 대출자 개인이 은행에 금리 낮춰 달라고 하는 제도. 정책금리와 무관 |

740건으로 재학습하니 같은 문장이 **+0.09(중립)**로 바뀌었다. 유가·환율 같은 다른 거시 단어도 같은 편향이 있을 수 있다. 의심되는 문장을 ONNX 내보내기 검증 세트에 계속 추가해서, 모델을 갱신할 때마다 자동으로 걸리게 관리한다.

## 5. 배포 구조

<svg viewBox="0 0 760 210" width="100%" style="max-width:760px;display:block;margin:24px auto" role="img" aria-label="학습에서 ONNX 내보내기, Spring 기동, 실시간 검색까지의 배포 흐름">
  <g font-size="13" fill="var(--color-text)" text-anchor="middle">
    <text x="130" y="16" fill="var(--color-text-dim)" font-size="11" letter-spacing="1">PYTHON · 한 번</text>
    <rect x="4" y="26" width="120" height="50" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
    <text x="64" y="48">finetune.py</text><text x="64" y="66" fill="var(--color-text-dim)" font-size="11">--final, 3 epoch</text>
    <rect x="164" y="26" width="120" height="50" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
    <text x="224" y="48">export_onnx.py</text><text x="224" y="66" fill="var(--color-text-dim)" font-size="11">FP32 → INT8 323MB</text>
    <rect x="324" y="26" width="120" height="50" rx="8" fill="var(--color-accent-soft)" stroke="var(--color-accent)"/>
    <text x="384" y="48" font-weight="600">model.onnx</text><text x="384" y="66" fill="var(--color-text-dim)" font-size="11">+ labels.json</text>
    <text x="600" y="16" fill="var(--color-text-dim)" font-size="11" letter-spacing="1">SPRING · 기동 시</text>
    <rect x="484" y="26" width="272" height="50" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
    <text x="620" y="48">SentimentAnalyzer</text><text x="620" y="66" fill="var(--color-text-dim)" font-size="11">labels.json 읽어 text_mode · band · max_length 설정</text>
    <text x="380" y="118" fill="var(--color-text-dim)" font-size="11" letter-spacing="1">실시간 검색 탭 · 요청마다</text>
    <rect x="4" y="130" width="150" height="50" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
    <text x="79" y="152">네이버 검색 결과</text><text x="79" y="170" fill="var(--color-text-dim)" font-size="11">기사 N건</text>
    <rect x="194" y="130" width="150" height="50" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
    <text x="269" y="152">DB 조회</text><text x="269" y="170" fill="var(--color-text-dim)" font-size="11">이미 감성 있으면 그 값</text>
    <rect x="384" y="130" width="150" height="50" rx="8" fill="var(--color-accent-soft)" stroke="var(--color-accent)"/>
    <text x="459" y="152" font-weight="600">ONNX 배치 추론</text><text x="459" y="170" fill="var(--color-text-dim)" font-size="11">없는 것만 모아서</text>
    <rect x="574" y="130" width="182" height="50" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
    <text x="665" y="152">Redis 캐시 10분</text><text x="665" y="170" fill="var(--color-text-dim)" font-size="11">같은 검색어는 모델 안 탐</text>
  </g>
  <g stroke="var(--color-text-dim)" stroke-width="1.5" fill="none">
    <path d="M124 51h34m-6-5l6 5-6 5"/><path d="M284 51h34m-6-5l6 5-6 5"/><path d="M444 51h34m-6-5l6 5-6 5"/>
    <path d="M154 155h34m-6-5l6 5-6 5"/><path d="M344 155h34m-6-5l6 5-6 5"/><path d="M534 155h34m-6-5l6 5-6 5"/>
  </g>
</svg>

### 학습 → ONNX → INT8

학습은 `finetune.py --final`로 gold 전체를 3에폭 돌린다. 에폭 수는 교차검증에서 정한 값이다. 최종 모델은 검증 데이터를 떼어 두지 않고 전부 학습에 쓰니, 평가 숫자는 교차검증 때 것을 믿는다.

`export_onnx.py`가 이어서 세 단계를 한다. PyTorch 모델을 FP32 ONNX로 변환하고, **INT8 동적 양자화**를 걸고(323MB), `labels.json`에 메타를 기록한다.

동적 양자화를 풀어 쓰면 이렇다. 모델의 가중치는 원래 32비트 실수인데, 이걸 8비트 정수로 바꿔 저장한다. 값 하나가 4바이트에서 1바이트가 되니 파일이 1/4로 준다. 추론할 때 중간 계산 결과(활성값)의 범위는 입력마다 다르니 그때그때 재서 정수로 맞춘다. 그래서 "동적"이다. 별도 보정 데이터가 필요 없어서 파이프라인에 넣기 쉽고, 분류처럼 출력이 확률 몇 개인 작업에서는 정확도 손실이 거의 없다.

```json
{ "labels": ["neg", "neu", "pos"], "text_mode": "title", "neu_band": 0.5, "max_length": 64 }
```

이 파일이 중요하다. 모델과 서버 사이의 **계약서**다.

### Spring 쪽 - 모델 설정을 따라간다

Spring의 `SentimentAnalyzer`는 기동 시 `labels.json`을 읽어서 **제목만 넣을지, 중립 밴드는 얼마인지, 토큰 길이는 얼마인지**를 모델 쪽 설정에 맞춘다. `application.yml`에도 같은 항목이 있는데 기본값이 −1(모델 설정 따름)이고, 필요할 때만 덮어쓴다. 모델을 본문까지 넣는 버전으로 바꿔서 교체해도 서버 설정을 건드릴 필요가 없다.

제목만 쓰니 토큰 길이 64면 충분하다. 256일 때보다 추론이 4배 가볍다. 트랜스포머 연산량은 토큰 길이에 비례해서 늘어나니(어텐션은 제곱으로), 안 쓰는 길이를 잘라 내는 게 가장 싼 최적화다.

### 실시간 검색 탭

위 그림 아래 줄이다. 네이버 검색 결과가 오면 링크로 DB를 조회해서 이미 감성이 있는 기사는 그 값을 쓰고, 없는 것만 모아서 ONNX에 배치로 넣고, 응답 전체를 Redis에 10분 캐시한다. 같은 검색어를 다시 치면 모델을 안 탄다. 모델 파일이 없으면 `ready=false`로 조용히 넘어가서, **모델 없이도 서비스는 뜬다.** 감성 없는 뉴스 목록이 감성 때문에 죽은 서비스보다 낫다.

### 수집 파이프라인 쪽

`label_pending.py`가 `sentiment IS NULL`인 기사를 같은 모델로 채운다. 수집 스크립트는 기사를 넣을 때 감성을 비워 두고, 별도 스크립트가 주기적으로 채우는 구조라 수집이 모델에 발목 잡히지 않는다. DB에 있는 감성값은 뉴스 피드, 시장 온도(일별 평균 점수 게이지), 종목별 호악재 랭킹에 쓰인다.

## 6. 삽질 목록

기록해 두면 다음에 같은 데서 안 넘어진다.

**PowerShell 인코딩.** `python x.py *> out.txt`로 받으면 파이썬 stdout이 cp949가 된다. "—", "±", "→" 하나에 스크립트가 죽는다. 세션에서 `[Console]::OutputEncoding = [Text.Encoding]::UTF8`를 한 번 실행하거나, 시스템 환경변수에 `PYTHONUTF8=1`을 걸어 두면 된다. 위에서 며칠을 날린 그 문제다.

**roberta-large 분류 헤드.** `AutoModelForSequenceClassification.from_pretrained`로 그냥 부르면 분류 헤드가 기본 2클래스로 생겨서 3클래스 라벨과 충돌한다. `num_labels=3, ignore_mismatched_sizes=True`를 주고 `id2label`을 직접 세팅해야 한다.

**학습 데이터로 평가하지 않기.** 파인튜닝한 모델을 학습에 쓴 데이터로 평가하면 당연히 점수가 부풀려진다. 분할 정보를 `split.json`으로 모델 폴더에 같이 저장하고, 평가 스크립트가 그걸 읽어 검증분만 채점하게 했다. gold 전체로 학습한 최종 모델은 아예 채점을 거부한다. 실수로 좋은 숫자를 보고 좋아할 여지를 코드로 막았다.

## 7. 남은 것

- Docker 빌드 시 DJL 토크나이저 네이티브 라이브러리 캐시 워밍. OCI 배포 시 첫 기동 지연을 막기 위해서다
- 740건 기준 교차검증 재확인. 140건을 추가한 뒤 아직 CV를 다시 안 돌렸다
- gold를 1,000건까지 늘려 보기

3-class 90%는 사람끼리 라벨을 달아도 80~90%에서 갈리는 영역이다. "이게 중립이냐 약호재냐"는 사람도 의견이 나뉜다. 그래서 목표를 3-class 정확도가 아니라 **"방향 정확도 95% 이상 유지"**로 두는 게 현실적이라고 본다. 호재를 악재로 찍는 건 사용자가 바로 알아채는 오류지만, 약호재를 중립으로 찍는 건 아무도 신경 안 쓴다.
