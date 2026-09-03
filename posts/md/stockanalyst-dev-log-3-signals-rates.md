---
title: StockAnalyst 개발기 (3) - 실시간 신호와 사후 분석을 분리하다, 공매도 카드, 국채·금리 페이지
date: 2026-09-03
category: stockanalyst
src: cover.svg
tags: [stockanalyst, 변곡점, 공매도, 금리, 채권, react, spring-boot]
summary: StockAnalyst 개발기 3편. 매번 다시 계산돼 사라지던 매수·매도 신호를 실시간(확정)과 사후 분석으로 분리, 신호당 기사 4건 재연결, 공매도 화면을 카드로 바꾸고 색의 뜻을 명시, 국채·금리 페이지 신설과 재할인율을 기준금리로 쓰던 실수, 화면이 비어 보이던 수집 버그 다섯 개.
---

> StockAnalyst는 Spring Boot + React(Vite) + Python 파이프라인으로 만든 주식 정보 서비스다. 이 글은 2026-09-03 하루치 작업 중 핵심만 추린 기록이다. 전체 구조는 [개발기 (2) 목차](/post/stockanalyst-dev-log-2-overview)에, 신호를 만드는 모델은 [변곡점 예측 v2](/post/stockanalyst-turning-point-v2)에 있다.

**한눈에 보기**

- 매수·매도 신호를 **실시간(그날까지 데이터, 안 바뀜)**과 **사후 분석(전 구간 재계산, 최근 20일은 잠정)**으로 분리. 모양으로 구분
- 기사 연결이 769건 중 13건뿐이던 걸 조회 시마다 −3~+1일 기사 최대 4건으로
- 공매도는 카드 + **색의 뜻을 화면에 명시**(평소 대비). 비교 기준이 없는 탭은 색을 뺐다
- 국채·금리 페이지 신설. FRED 재할인율(1.00%)을 기준금리로 쓰고 있던 걸 콜금리(2.537%)로 교체. 부동산 블록은 관계가 약해서 뺐다
- "행이 있다"와 "값이 있다"는 다르다 — 공매도 잔고 T+3 버그

## 1. 매수·매도 지점 예측 - 두 판단을 분리

[v2](/post/stockanalyst-turning-point-v2)에서 남긴 숙제가 하나 있었다. 화면의 과거 신호는 후처리가 실제 고가·저가에 스냅해 주기 때문에 정확해 보이지만, 미래를 모르는 상태의 실제 예측력은 그보다 한참 낮다는 것. 그 간극을 문구로 얼버무리지 않으려면 화면이 두 가지를 구분해서 보여 줘야 했다.

여기에 문제가 하나 더 있다. 신호는 임계값을 전 구간에서 정하는 방식이라 **캔들 하나가 쌓일 때마다 과거 신호까지 다시 계산된다.** 온디맨드로 바꾼 뒤에도 이건 그대로다. 사용자 입장에선 "어제 매수라더니 오늘 보니 없다"가 된다.

둘은 사실 같은 요구였다. 그래서 하나로 뭉쳐 있던 신호를 두 종류로 나눴다.

| | 실시간 신호 | 사후 분석 |
|---|---|---|
| 판정 근거 | **그날까지의 데이터만** | 전 구간을 다시 보고 찍는다 |
| 바뀌나 | 한 번 뜨면 안 바뀐다 | 최근 20거래일 마크는 새 캔들이 쌓이면 사라질 수 있다 |
| 쓰임 | "지금 뭘 할까" | "모델이 과거에 어디를 꺾인 자리로 봤나" |

<svg viewBox="0 0 760 226" width="100%" style="max-width:760px;display:block;margin:22px auto" role="img" aria-label="가격선 위에 확정 신호는 진한 화살표, 사후 분석은 흐린 원, 최근 20거래일은 잠정 표시">
<text x="0" y="14" font-size="13" fill="var(--color-text-muted)">같은 차트 위의 두 종류 신호</text>
<rect x="560" y="30" width="180" height="120" rx="6" fill="var(--color-text)" opacity="0.06"/>
<text x="650" y="46" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">최근 20거래일 · 사후 마크는 바뀔 수 있음</text>
<polyline points="40,122.0 60,128.6 80,131.0 100,130.3 120,128.1 140,126.2 160,125.6 180,126.1 200,126.7 220,125.6 240,121.5 260,113.6 280,102.6 300,90.2 320,79.1 340,72.1 360,71.2 380,76.8 400,88.1 420,102.7 440,117.4 460,129.4 480,136.8 500,138.9 520,136.5 540,131.5 560,126.0 580,121.5 600,118.8 620,117.3 640,115.7 660,112.5 680,106.8 700,98.4 720,88.8 740,80.0 760,74.7" fill="none" stroke="var(--color-border-strong)" stroke-width="2" stroke-linejoin="round"/>
<path d="M100 152.25791132735955 l-7 10 h14 z" fill="var(--color-accent)"/><text x="100" y="178.25791132735955" font-size="11" fill="var(--color-text)" text-anchor="middle" font-weight="600">매수</text>
<circle cx="180" cy="144.11856066847378" r="7" fill="var(--color-accent)" opacity="0.6"/><text x="180" y="168.11856066847378" font-size="11" fill="var(--color-text-muted)" text-anchor="middle">매수</text>
<path d="M280 80.56397484596293 l-7 -10 h14 z" fill="#e5534b"/><text x="280" y="66.56397484596293" font-size="11" fill="var(--color-text)" text-anchor="middle" font-weight="600">매도</text>
<circle cx="360" cy="53.1511363639099" r="7" fill="#e5534b" opacity="0.6"/><text x="360" y="45.1511363639099" font-size="11" fill="var(--color-text-muted)" text-anchor="middle">매도</text>
<circle cx="480" cy="154.7872487934135" r="7" fill="var(--color-accent)" opacity="0.6"/><text x="480" y="178.7872487934135" font-size="11" fill="var(--color-text-muted)" text-anchor="middle">매수</text>
<circle cx="640" cy="97.71355818694046" r="7" fill="#e5534b" opacity="0.35"/><text x="640" y="89.71355818694046" font-size="11" fill="var(--color-text-muted)" text-anchor="middle">매도?</text>
<circle cx="720" cy="106.79763816417241" r="7" fill="var(--color-accent)" opacity="0.35"/><text x="720" y="130.7976381641724" font-size="11" fill="var(--color-text-muted)" text-anchor="middle">매수?</text>
<path d="M14 206 l-6 9 h12 z" fill="var(--color-accent)"/><text x="26" y="214" font-size="12" fill="var(--color-text-muted)">실시간(확정) — 그날까지 데이터로 판정, 안 바뀜</text>
<circle cx="330" cy="210" r="6" fill="var(--color-accent)" opacity="0.6"/><text x="342" y="214" font-size="12" fill="var(--color-text-muted)">사후 분석 — 전 구간 재계산</text>
<circle cx="560" cy="210" r="6" fill="var(--color-accent)" opacity="0.35"/><text x="572" y="214" font-size="12" fill="var(--color-text-muted)">사후(잠정) — 매수? / 매도?</text>
</svg>

차트에는 둘 다 표시하되 모양으로 구분한다.

| | 모양 | 글자 |
|---|---|---|
| 실시간(확정) | 진한 화살표 | 매수 / 매도 |
| 사후 분석 | 흐린 원 | 매수 / 매도 |
| 사후 분석(잠정) | 더 흐린 원 | 매수? / 매도? |

카드는 차트 **아래**로 옮기고 탭 2개로 나눴다. 탭을 고르면 그쪽 목록과 뉴스만 나온다. 툴팁은 가로 2단(왼쪽 정보 / 오른쪽 뉴스)이고, 오른쪽 위에 `[사후] ▼ 매도 72,100` 형태로 출처·방향·가격을 한 줄에 적는다. 한 봉에 두 출처가 겹칠 때만 칩마다 출처 배지를 붙인다. 마우스 반응 범위는 좌우 3봉으로 넓혔다.

### 신호당 관련 기사 4건

<svg viewBox="0 0 640 112" width="100%" style="max-width:640px;display:block;margin:22px auto" role="img" aria-label="신호 769건 중 기사가 연결된 것은 13건뿐이었다">
<text x="0" y="16" font-size="13" fill="var(--color-text-muted)">저장 시점에 기사가 연결된 신호 (바꾸기 전)</text>
<rect x="0" y="30" width="11" height="22" rx="4" fill="var(--color-accent)"/>
<rect x="13" y="30" width="627" height="22" rx="4" fill="var(--color-border-strong)"/>
<rect x="0" y="64" width="12" height="12" rx="3" fill="var(--color-accent)"/>
<text x="18" y="74" font-size="12" fill="var(--color-text-muted)">연결됨 13</text>
<rect x="91" y="64" width="12" height="12" rx="3" fill="var(--color-border-strong)"/>
<text x="109" y="74" font-size="12" fill="var(--color-text-muted)">기사 없음 756</text>
<text x="0" y="96" font-size="12" fill="var(--color-text-dim)">저장할 때 딱 한 번만 찾았고, 그때 기사가 없으면 영영 비어 있었다</text>
</svg>

예전에는 저장 시점에 기사 1건만 연결하고 끝이라, 그때 기사가 없으면 영영 비었다. 이제 **조회할 때마다** 신호일 −3~+1일 기사를 다시 찾아 최대 4건 붙인다. 신호 구간 전체를 한 번의 쿼리로 읽어서 신호 수만큼 DB를 왕복하지 않는다.

## 2. 공매도 화면 - 표를 카드로, 색에 뜻을 달다

이 데이터를 어떻게 모으게 됐는지(KRX IP 차단부터 화면 단위 조회까지)는 [종목 상세 데이터 글](/post/stockanalyst-stock-detail-data)에 있다. 여기서는 그걸 화면에 어떻게 놓았는지만 적는다.

국내·해외 모두 3열 카드 그리드로 바꿨다. 순위 배지, 종목명, 오른쪽에 큰 비중 숫자, 아래 3칸 지표. 상위 12위는 브랜드색으로 강조하고 관련 뉴스 한 줄을 붙인다.

| 탭 | 3칸 지표 |
|---|---|
| 국내 | 공매도 거래대금 · 40일 평균 · 증가배율 |
| 해외 일별 | 공매도 거래량 · 20일 평균 · 증가배율 |
| 해외 잔고 | 공매도 잔고 · 직전 공시 · [Days to Cover](/post/stockanalyst-stock-detail-data) |

### 색이 무슨 뜻인지 화면에 적었다

<svg viewBox="0 0 760 90" width="100%" style="max-width:760px;display:block;margin:22px auto" role="img" aria-label="기본, 파랑, 굵은 파랑 세 단계">
<text x="0" y="14" font-size="13" fill="var(--color-text-muted)">공매도 비중 색 기준 — 그 종목의 평소 대비</text>
<rect x="0" y="30" width="242" height="54" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="121" y="52" font-size="13" fill="var(--color-text)" text-anchor="middle">기본</text>
<text x="121" y="69" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">평소와 비슷</text>
<rect x="258" y="30" width="242" height="54" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="379" y="52" font-size="13" fill="var(--color-text)" text-anchor="middle">파랑</text>
<text x="379" y="69" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">40일 평균보다 30% 이상 높음</text>
<rect x="516" y="30" width="242" height="54" rx="8" fill="var(--color-accent-soft)" stroke="var(--color-accent)"/>
<text x="637" y="52" font-size="13" fill="var(--color-text)" text-anchor="middle" font-weight="600">굵은 파랑</text>
<text x="637" y="69" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">40일 평균의 2배 이상</text>
</svg>

숫자에 마우스를 올리면 `40일 평균 2.31% 대비 1.8배`처럼 실제 값이 뜬다. **절대 수치가 아니라 그 종목의 평소 대비**라는 걸 화면에 그대로 썼다.

**해외 잔고 탭은 색을 뺐다.** 비교할 평균이 없어서 조건 없이 늘 파란색이었는데, 그건 아무 뜻도 없으면서 위험해 보이기만 한다. 뜻이 없는 색은 없는 게 낫다.

### 뉴스 실시간 보완

DB에 기사가 없는 종목은 네이버에서 즉석으로 채운다. 상위 12개까지, 전체 3초 예산, 못 끝나면 기사 없이 순위만 내보낸다. 검색 결과는 캐시·DB에 쌓이므로 다음 조회부터 외부 호출이 줄어든다.

투자자별 공매도 그래프는 쌓기(stacked)에서 개인·기관·외국인 **나란히**로 바꿨다. 쌓으면 합계는 보이는데 각각의 변화가 안 보인다. 종목 상세의 공매도 섹션은 데이터가 없으면 통째로 사라지던 것을 고쳐, 이유를 적은 빈 상태를 보여 준다. 잔고와 거래량은 공시 시점이 달라 기준일이 다를 수 있어 그것도 함께 표기한다.

## 3. 국채·금리 - 새 메뉴 `/rates`

개별 국채의 무료 일별 시세가 없다. 그래서 종목 화면 대신 **"금리가 지금 어디 있고 어디로 가는가"**를 보는 화면으로 만들었다.

<svg viewBox="0 0 760 124" width="100%" style="max-width:760px;display:block;margin:22px auto" role="img" aria-label="국채·금리 페이지의 위에서 아래 구성">
<g font-size="13" fill="var(--color-text)" text-anchor="middle">
<rect x="0" y="30" width="132" height="70" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="66" y="52">역전 경고</text>
<text x="66" y="69" fill="var(--color-text-dim)" font-size="11">10년 &lt; 2년이면 배너</text>
<rect x="156" y="30" width="132" height="70" rx="8" fill="var(--color-accent-soft)" stroke="var(--color-accent)"/>
<text x="222" y="52" font-weight="600">금리 카드</text>
<text x="222" y="69" fill="var(--color-text-dim)" font-size="11">10년 · 2년</text>
<text x="222" y="83" fill="var(--color-text-dim)" font-size="11">금리차 · 한국 기준금리</text>
<rect x="312" y="30" width="132" height="70" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="378" y="52">한·미 10년</text>
<text x="378" y="69" fill="var(--color-text-dim)" font-size="11">시계열 + 한미 금리차</text>
<rect x="468" y="30" width="132" height="70" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="534" y="52">채권 ETF</text>
<text x="534" y="69" fill="var(--color-text-dim)" font-size="11">SHY → IEF →</text>
<text x="534" y="83" fill="var(--color-text-dim)" font-size="11">TLT → LQD → …</text>
<rect x="624" y="30" width="132" height="70" rx="8" fill="var(--color-accent-soft)" stroke="var(--color-accent)"/>
<text x="690" y="52" font-weight="600">분석 3종</text>
<text x="690" y="69" fill="var(--color-text-dim)" font-size="11">듀레이션 · 4분면</text>
<text x="690" y="83" fill="var(--color-text-dim)" font-size="11">환율 상관</text>
</g>
<path d="M132 65.0h18m-6-5l6 5-6 5" stroke="var(--color-text-dim)" stroke-width="1.5" fill="none"/>
<path d="M288 65.0h18m-6-5l6 5-6 5" stroke="var(--color-text-dim)" stroke-width="1.5" fill="none"/>
<path d="M444 65.0h18m-6-5l6 5-6 5" stroke="var(--color-text-dim)" stroke-width="1.5" fill="none"/>
<path d="M600 65.0h18m-6-5l6 5-6 5" stroke="var(--color-text-dim)" stroke-width="1.5" fill="none"/>
</svg>

분석 3종은 이렇다.

| 분석 | 무엇을 보나 | 어떻게 |
|---|---|---|
| 금리가 움직인 만큼 국채 값이 반대로 움직였나 | 실측 듀레이션 | ETF 가격 변화 ÷ 금리 변화를 명목 듀레이션과 비교 |
| 수익률 곡선이 어느 쪽 때문에 움직였나 | 불/베어 × 스티프닝/플래트닝 | 아래 4분면 |
| 한미 금리차와 원/달러 | 변화량끼리의 상관 | 약하면 약하다고 그대로 표시 |

<svg viewBox="0 0 640 300" width="100%" style="max-width:640px;display:block;margin:22px auto" role="img" aria-label="불/베어와 스티프닝/플래트닝을 조합한 수익률 곡선 4분면">
<text x="0" y="14" font-size="13" fill="var(--color-text-muted)">수익률 곡선이 어느 쪽 때문에 움직였나</text>
<rect x="80" y="50" width="230" height="100" rx="8" fill="var(--color-accent-soft)" stroke="var(--color-accent)"/>
<text x="195" y="78" font-size="14" fill="var(--color-text)" text-anchor="middle" font-weight="600">불 스티프닝</text>
<text x="195" y="102" font-size="12" fill="var(--color-text-muted)" text-anchor="middle">단기 금리 ↓↓ · 장기 ↓</text>
<text x="195" y="124" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">완화 기대. 단기가 더 빨리 내린다</text>
<rect x="330" y="50" width="230" height="100" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="445" y="78" font-size="14" fill="var(--color-text)" text-anchor="middle" font-weight="600">베어 스티프닝</text>
<text x="445" y="102" font-size="12" fill="var(--color-text-muted)" text-anchor="middle">장기 금리 ↑↑ · 단기 ↑</text>
<text x="445" y="124" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">인플레·공급 우려. 장기가 더 빨리 오른다</text>
<rect x="80" y="170" width="230" height="100" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="195" y="198" font-size="14" fill="var(--color-text)" text-anchor="middle" font-weight="600">불 플래트닝</text>
<text x="195" y="222" font-size="12" fill="var(--color-text-muted)" text-anchor="middle">장기 금리 ↓↓ · 단기 ↓</text>
<text x="195" y="244" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">경기 둔화 기대. 장기가 더 빨리 내린다</text>
<rect x="330" y="170" width="230" height="100" rx="8" fill="var(--color-accent-soft)" stroke="var(--color-accent)"/>
<text x="445" y="198" font-size="14" fill="var(--color-text)" text-anchor="middle" font-weight="600">베어 플래트닝</text>
<text x="445" y="222" font-size="12" fill="var(--color-text-muted)" text-anchor="middle">단기 금리 ↑↑ · 장기 ↑</text>
<text x="445" y="244" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">긴축. 단기가 더 빨리 오른다. 역전 직전</text>
<text x="195" y="164" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">← 금리 하락(불)</text>
<text x="445" y="164" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">금리 상승(베어) →</text>
<text x="320" y="44" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">↑ 장단기 금리차 확대(스티프닝)</text>
<text x="320" y="288" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">↓ 장단기 금리차 축소(플래트닝)</text>
</svg>

용어 설명(듀레이션 / 장단기 금리차 / bp / 한미 금리차 / 스티프닝·플래트닝 / 불·베어)을 화면 아래에 붙였다.

### "한국 기준금리"가 재할인율이었다

| | 지표 | FRED 코드 | 값 |
|---|---|---|---|
| 전 | 재할인율 | `INTDSRKRM193N` | 1.00% |
| 후 | 콜금리 (한은이 기준금리로 유도하는 금리) | `IRSTCI01KRM156N` | 2.537% |

실제 기준금리는 2.5%대인데 화면에는 1.00%가 "한국 기준금리"로 떠 있었다. FRED에서 이름만 보고 고른 게 원인이다. 한국은행이 기준금리로 유도하는 **콜금리**로 교체했다.

### 금리와 부동산 블록은 만들었다가 뺐다

2015~2026 표본에서 어느 시차에서도 관계가 뚜렷하지 않았다. 한국 집값은 이 기간 공급·규제·전세제도가 지배한다. 약한 상관을 시나리오 표로 보여 주면 **없는 관계를 있는 것처럼 읽히게** 만든다고 판단했다. 상관이 커 보이는 조합을 찾아 설정을 바꾸는 일은 하지 않았다. 데이터 수집은 유지했으므로 되살리기는 쉽다.

## 4. 작은 것들

| 항목 | 내용 |
|---|---|
| 옵션 표 ([데이터 쪽](/post/stockanalyst-stock-detail-data)) | 만기를 가운데 두고 **콜은 왼쪽, 풋은 오른쪽**으로 막대가 자란다. 막대 길이는 모든 만기 중 최댓값 기준이라 만기끼리도 비교된다. PCR · 최대고통가 · ATM IV는 막대 아래 한 줄 |
| 투자 고지 | 예측·분석 기능의 고지를 `Disclaimer` 컴포넌트로 통일. 화면별 개별 한계(백테스트 결과, 갱신 주기)는 공통 문구 앞에 그대로 덧붙인다 — 뭉뚱그리지 않는다 |
| 로딩 | 막대 5개가 캔들처럼 오르내리는 스피너로 통일. 상승/하락 색은 안 쓴다 — 로딩 중인데 뭔가 오르내리는 걸로 읽힌다 |

## 5. 화면이 비어 보이던 진짜 원인들

기능이 아니라 수집 쪽 버그인데, 화면에서는 "데이터가 없네"로만 보이던 것들이다.

| 증상 | 원인 | 처리 |
|---|---|---|
| 공매도 잔고가 전부 비어 있음 | 잔고는 거래량보다 늦게(T+3) 공시되는데 "그 날짜에 행이 있으면 받은 것"으로 판단해 다시 안 받음 | 잔고가 **실제로 채워졌을 때만** 완료. 공시 전 날짜는 요청 자체를 건너뜀 |
| 상위 50 종목명이 항상 비어 있음 | 수집 코드가 종목명을 읽지 않고 `None`을 넣음 | 응답에서 읽되 없으면 종목 마스터로 채움. 기존 502행도 메움 |
| 40일 평균 비중이 안 뜸 | KRX 컬럼명 어순이 다름(`직전40일공매도평균비중`) | 별칭을 맞추고, 어순이 또 바뀌어도 잡히도록 보루 |
| `bonds` 단계 실패, 브라질 국채 0건 | 환율을 하루치만 받아 [원화 환산](/post/stockanalyst-portfolio)이 성립하지 않음 | 교차환율로 계산 |
| 뉴스 진단 줄이 계속 사라짐 | [`--status`](/post/stockanalyst-data-pipeline)가 조회 실패를 조용히 삼킴. 컬럼명 오타 | 실패를 드러내고, 지표별 적재·뉴스·신호 연결 건수·상위50 컬럼별 채움 비율을 찍음 |

첫 번째가 이 날의 교훈이다. **"행이 있다"와 "값이 있다"는 다르다.** 공시 시점이 다른 두 데이터를 한 날짜 키로 묶으면 늦게 오는 쪽은 영영 빈 채로 "완료"가 된다. 같은 원인을 [미국 지수 종가](/post/stockanalyst-market-widgets)에서 이미 한 번 밟았는데도 또 밟았다 — 증분 설계의 함정으로 [파이프라인 글](/post/stockanalyst-data-pipeline)에 정리해 뒀다.

## 남은 것

- `us-short-volume` HTTP 403 (FINRA)
- 국내 주택담보대출 금리 — 한국은행 ECOS 키를 받으면 가능
- 브라질 국채 가격을 국채·금리 화면에 붙이기 (적재 확인 후)
- 배포 환경(라이젠 7530U / 16GB) 검토 — 컨테이너 메모리 제한이 없고, 감성 모델(RoBERTa-large)이 저전력 CPU에서 가장 무거운 부분
