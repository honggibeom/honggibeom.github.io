---
title: StockAnalyst 위험분석 - 델타-노말 VaR, 250일 보유기간 버그, 몬테카를로, 시나리오와 시장 국면
date: 2026-09-02
category: stockanalyst
src: cover.svg
tags: [stockanalyst, VaR, 몬테카를로, 위험분석, 시나리오분석, spring-boot]
summary: StockAnalyst 위험분석 기록. EWMA 공분산 델타-노말 VaR, Cornish-Fisher 보정, Kupiec 백테스트, 보유기간 250일에서 VaR가 원금을 넘던 버그와 GBM 손실 모델, 베타·듀레이션 시나리오, SPY-금리 상관으로 시장 국면 판정까지.
---

> StockAnalyst는 Spring Boot + React(Vite) + Python 파이프라인으로 만든 주식 정보 서비스다. 개발기 1편은 [뉴스 감성 모델](/post/stockanalyst-sentiment-model)과 [종목 추출](/post/stockanalyst-ticker-extraction)이었고, 2편은 그것을 뺀 나머지를 주제별로 나눴다. 전체 목차는 [개발기 (2) 목차](/post/stockanalyst-dev-log-2-overview)에 있다.

**한눈에 보기**

- 델타-노말 VaR는 EWMA 공분산 + Cornish-Fisher 보정 + Kupiec 백테스트로 보강
- 보유기간 250일에 VaR가 원금을 넘었다 → 롱온리는 **GBM 손실 모델** `1 − exp(−zσ√h)`로 100%에 점근
- 시나리오는 자산별 **베타**와 채권 **듀레이션**으로 차등 적용, SPY-금리 60일 상관으로 **시장 국면** 판정
- 환율 필드 하나가 복사에서 빠져 미국 자산 손익이 통째로 오염됐던 버그

## 숫자가 틀리면 다 틀린다

위험분석은 세 방법을 같이 보여 준다. 각각 가정이 다르고, 가정이 다르니 틀리는 방식도 다르다.

| 방법 | 가정 | 장점 | 약점 |
|---|---|---|---|
| 델타-노말 VaR | 수익률이 정규분포, 손익이 노출에 선형 | 빠르다. 공분산 하나면 된다 | 꼬리가 얇다. 옵션 같은 비선형 자산에 약하다 |
| Cornish-Fisher VaR | 정규분포를 왜도·첨도로 보정 | 두꺼운 꼬리를 일부 반영 | 여전히 근사 |
| 몬테카를로 | 상관을 유지한 GBM 경로 + 전체 재평가 | 셋 중 가장 믿을 만하다 | 느리다. 충격이 정규라는 가정은 남는다 |
| 시나리오 | "이런 일이 나면" 직접 충격 | 설명하기 쉽다 | 충격을 어떻게 나눠 줄지가 전부다 |

### 델타-노말 VaR

공분산은 표본 공분산에서 **EWMA(λ=0.94, RiskMetrics)**로 바꿨다. 지수 가중 이동평균은 최근 수익률에 더 큰 가중치를 주기 때문에 변동성이 갑자기 커지면 그걸 빨리 반영한다. 표본 공분산은 1년 전 조용했던 날과 어제 급락한 날을 같은 무게로 보니 반응이 느리다.

정규분포 가정을 보정하려고 **Cornish-Fisher VaR**를 추가했다. 현재 노출 벡터로 과거 일간 손익 시계열을 재생해 왜도(한쪽으로 치우친 정도)와 초과첨도(꼬리가 두꺼운 정도)를 구하고, 그걸로 z값을 보정한다.

같은 손익 시계열로 **Kupiec POF 백테스트**도 한다. "99% VaR면 100일 중 1일만 초과해야 한다"는 약속이 지켜졌는지 보는 검정이다. 1일 VaR를 초과한 날 수를 세서 이론값과 χ²(1) 검정을 하고, 화면에 판정 박스를 띄운다.

## 보유기간 250일을 넣으니 VaR가 원금을 넘었다

보유기간을 프리셋(1/5/10/20/60일) 외에 직접 입력할 수 있게 하자마자 나온 버그다. 140만 원짜리 포트폴리오에 250일을 넣으니 VaR가 140만 원을 넘었다. 손실이 원금보다 크다는 얘기인데, 롱온리 포트폴리오에서는 있을 수 없는 일이다.

원인은 산술수익률 정규 가정 `VaR = z · σ · √h · 노출`이 h가 크면 100%를 넘는 것이다. 연변동성 70%, 99% 신뢰수준(z = 2.326), 250일이면 2.326 × 0.70 = **163%**가 나온다.

<svg viewBox="0 0 640 260" width="100%" style="max-width:640px;display:block;margin:22px auto" role="img" aria-label="보유기간이 길어질수록 산술 근사는 원금 100%를 넘어가고 GBM은 100%에 점근한다">
<text x="0" y="14" font-size="13" fill="var(--color-text-muted)">보유기간에 따른 99% VaR 손실률 (연변동성 70%)</text>
<line x1="50" y1="220.0" x2="620" y2="220.0" stroke="var(--color-border)" stroke-width="1"/>
<text x="42" y="224.0" font-size="11" fill="var(--color-text-dim)" text-anchor="end">0%</text>
<line x1="50" y1="167.2" x2="620" y2="167.2" stroke="var(--color-border)" stroke-width="1"/>
<text x="42" y="171.2" font-size="11" fill="var(--color-text-dim)" text-anchor="end">50%</text>
<line x1="50" y1="114.4" x2="620" y2="114.4" stroke="var(--color-border)" stroke-width="1"/>
<text x="42" y="118.4" font-size="11" fill="var(--color-text-dim)" text-anchor="end">100%</text>
<line x1="50" y1="61.7" x2="620" y2="61.7" stroke="var(--color-border)" stroke-width="1"/>
<text x="42" y="65.7" font-size="11" fill="var(--color-text-dim)" text-anchor="end">150%</text>
<text x="52.3" y="238" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">1일</text>
<text x="164.0" y="238" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">50일</text>
<text x="278.0" y="238" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">100일</text>
<text x="392.0" y="238" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">150일</text>
<text x="506.0" y="238" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">200일</text>
<text x="620.0" y="238" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">250일</text>
<line x1="50" y1="114.4" x2="620" y2="114.4" stroke="#e5534b" stroke-width="1" stroke-dasharray="4 3" opacity="0.7"/>
<text x="620" y="108.4" font-size="11" fill="#e5534b" text-anchor="end">원금 100%</text>
<polyline points="52.3,209.1 61.4,195.7 72.8,185.6 95.6,171.4 141.2,151.3 186.8,135.8 255.2,116.9 323.6,100.9 414.8,82.5 506.0,66.3 620.0,48.1" fill="none" stroke="#e5534b" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
<circle cx="620.0" cy="48.1" r="4" fill="#e5534b" stroke="var(--color-bg-elevated)" stroke-width="2"/>
<text x="612.0" y="38.1" font-size="12" fill="var(--color-text)" text-anchor="end">산술(정규) 163%</text>
<polyline points="52.3,209.7 61.4,198.3 72.8,190.7 95.6,181.0 141.2,169.5 186.8,162.0 255.2,154.2 323.6,148.6 414.8,143.1 506.0,139.0 620.0,135.2" fill="none" stroke="var(--color-accent)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
<circle cx="620.0" cy="135.2" r="4" fill="var(--color-accent)" stroke="var(--color-bg-elevated)" stroke-width="2"/>
<text x="612.0" y="125.2" font-size="12" fill="var(--color-text)" text-anchor="end">GBM(로그정규) 80%</text>
<text x="0" y="256" font-size="11" fill="var(--color-text-dim)">1일: 산술 10.3% vs GBM 9.8% · 250일: 산술 163% vs GBM 80%</text>
</svg>

해결은 롱온리 선형 포트폴리오에 한해 몬테카를로와 같은 **GBM(로그정규) 가정**을 쓰는 것이다. 손실률을 `1 − exp(−z · σ_p · √h)`로 계산하면 h가 아무리 커져도 100%에 점근한다. 1일은 산술과 거의 같고(10.3% 대 9.8%), 250일은 163%가 80%로 내려온다.

| 조건 | 손실 모델 | 이유 |
|---|---|---|
| 롱온리, 선형 자산만 | GBM (`1 − exp(−zσ√h)`) | 손실 상한이 원금이다 |
| 숏 노출이 하나라도 있음 | 산술 (`zσ√h`) 유지 | 숏은 손실 상한이 없다 |

응답에 어느 모델을 썼는지(`lossModel`)를 실어서 보유기간 20일 이상이면 화면에 한 줄 표기한다.

## 몬테카를로

상관을 유지한 GBM으로 경로를 만들고 전체 재평가를 하는 구조라 세 방법 중 가장 믿을 만하다. 남은 개선 여지는 정규 충격을 과거 수익률 **부트스트랩**(실제 있었던 일간 수익률을 복원 추출)으로 바꿔 두꺼운 꼬리를 반영하는 것이다.

## 시나리오 - 충격을 어떻게 나눠 줄 것인가

시나리오 분석은 손을 가장 많이 탔다. 처음엔 "지수 −20%"를 전 자산에 똑같이 적용했다. 채권도 −20%, 레버리지 ETF도 −20%. 말이 안 된다.

| 시나리오 종류 | 처음 | 바꾼 뒤 |
|---|---|---|
| 지수 충격 | 전 자산 동일 비율 | 자산별 **베타**로 차등. 국내는 KODEX200, 미국은 SPY 대비 400일 회귀, [−3, 3] 클램프 |
| 금리 충격 | 채권이 전혀 안 움직임 | **수정듀레이션**으로 `1 − D_mod × Δy` 적용. 액면 가정 맥컬리 근사, 무이표는 만기, 셀릭은 0 |
| 역사 사건 | 28건 | 51건 + 분류(위기 / 미국 금리 사이클 / 원자재·달러 / 경기·고용·물가 / 국내 / 상승). 매크로 지표가 있으면 사건 기간의 미국채 10년 변동(bp)을 실측해 금리 충격에 반영 |

베타로 바꾸자 레버리지 ETF는 데이터상 베타 2 근처로 자동 증폭되고, 채권은 0 근처로 잠잠해졌다. 규칙을 따로 짜지 않아도 데이터가 알아서 갈라 준다.

### 시장 국면 자동 판정

여기서 말하는 "국면"은 [다우 이론 위젯의 국면](/post/stockanalyst-dow-theory)과 다른 것이다. 저쪽이 추세의 단계라면 이쪽은 **금리와 주가가 어떤 관계에 있는 시기인가**다.

가장 재미있었던 부분이다. 같은 "고용 호조"라도 긴축기에는 주식이 떨어지고 침체 우려기에는 오른다. **"좋은 뉴스가 나쁜 뉴스"가 되는 구간**이 있다.

<svg viewBox="0 0 760 124" width="100%" style="max-width:760px;display:block;margin:22px auto" role="img" aria-label="SPY와 미국채 10년 금리의 60일 상관으로 시장 국면을 판정해 시나리오 방향을 가른다">
<g font-size="13" fill="var(--color-text)" text-anchor="middle">
<rect x="0" y="30" width="160" height="70" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="80" y="52">최근 60거래일</text>
<text x="80" y="69" fill="var(--color-text-dim)" font-size="11">SPY 달러 수익률 · 미국채</text>
<text x="80" y="83" fill="var(--color-text-dim)" font-size="11">10년 일간 변동</text>
<rect x="200" y="30" width="160" height="70" rx="8" fill="var(--color-accent-soft)" stroke="var(--color-accent)"/>
<text x="280" y="52" font-weight="600">상관계수</text>
<text x="280" y="69" fill="var(--color-text-dim)" font-size="11">두 시계열의 상관</text>
<rect x="400" y="30" width="160" height="70" rx="8" fill="var(--color-accent-soft)" stroke="var(--color-accent)"/>
<text x="480" y="52" font-weight="600">국면 판정</text>
<text x="480" y="69" fill="var(--color-text-dim)" font-size="11">≤ −0.15 금리 민감기</text>
<text x="480" y="83" fill="var(--color-text-dim)" font-size="11">≥ +0.15 성장 민감기</text>
<rect x="600" y="30" width="160" height="70" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="680" y="52">프리셋 방향 분기</text>
<text x="680" y="69" fill="var(--color-text-dim)" font-size="11">지수 · 변동성 · 환율</text>
</g>
<path d="M160 65.0h34m-6-5l6 5-6 5" stroke="var(--color-text-dim)" stroke-width="1.5" fill="none"/>
<path d="M360 65.0h34m-6-5l6 5-6 5" stroke="var(--color-text-dim)" stroke-width="1.5" fill="none"/>
<path d="M560 65.0h34m-6-5l6 5-6 5" stroke="var(--color-text-dim)" stroke-width="1.5" fill="none"/>
</svg>

거시 프리셋의 지수·변동성·환율 방향을 국면에 따라 갈라 적용하고, 화면에는 🧭 국면 배지와 함께 **반대 국면일 때의 반응**도 보여 준다. 사용자가 "지금이 어느 국면인지"에 동의하지 않을 수 있으니 양쪽을 다 보여 주는 게 맞다.

## 컨텍스트 복사에서 환율 한 줄이 빠졌다

시나리오·몬테카를로·손익구조·수익률 곡선에서 미국 자산 손익이 전부 거대한 플러스로 나왔다. 모든 시나리오가 +, 1일 기대손익이 수백만 원.

[포트폴리오 글](/post/stockanalyst-portfolio)에서 미국 자산을 원화로 환산해 저장하기로 했는데, 그 환율이 위험분석 쪽에서 빠졌다. 원인은 `MarketContext.copyWithDate()`가 `fxUsdKrw`를 복사하지 않아서였다. 날짜만 바꾼 복사본의 환율이 0이나 기본값이 되면서 달러 자산이 통째로 오염됐다. 복사 함수에 한 줄을 추가해 고쳤고, **"컨텍스트에 필드를 추가하면 복사 함수도 반드시 고칠 것"**을 문서 맨 위에 적어 뒀다. 복사 생성자가 필드를 손으로 나열하는 구조면 언젠가 반드시 하나가 빠진다.

## 상관행렬, 리밸런싱, PDF

국가 간 분산과 섹터 헷징은 VaR의 공분산 행렬에 이미 숫자로 들어 있었다. 그걸 **상관행렬**과 **분산효과**(개별 VaR 합 → 포트폴리오 VaR, 절감률)로 가시화했다.

<svg viewBox="0 0 760 90" width="100%" style="max-width:760px;display:block;margin:22px auto" role="img" aria-label="상관계수 구간별 색">
<text x="0" y="14" font-size="13" fill="var(--color-text-muted)">상관행렬 색 규칙</text>
<rect x="0" y="30" width="242" height="54" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="121" y="52" font-size="13" fill="var(--color-text)" text-anchor="middle">0.7 이상</text>
<text x="121" y="69" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">빨강 · 분산효과 낮음</text>
<rect x="258" y="30" width="242" height="54" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="379" y="52" font-size="13" fill="var(--color-text)" text-anchor="middle">0.2 ~ 0.7</text>
<text x="379" y="69" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">회색 · 보통</text>
<rect x="516" y="30" width="242" height="54" rx="8" fill="var(--color-accent-soft)" stroke="var(--color-accent)"/>
<text x="637" y="52" font-size="13" fill="var(--color-text)" text-anchor="middle" font-weight="600">0.2 이하</text>
<text x="637" y="69" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">초록 · 헷징 유리</text>
</svg>

리밸런싱은 목표비중을 직접 넣는 모드와 최적비중 추천이 있다. 같은 EWMA 공분산에서 두 가지를 롱온리로 푼다.

| 방식 | 계산 | 특징 |
|---|---|---|
| 최소분산 | Σ⁻¹1을 정규화, 음수 클램프, 리지로 수치 안정 | 변동성이 가장 낮은 조합 |
| 리스크패리티 | 위험기여를 균등하게, 곱셈 갱신 200회 | 각 자산이 전체 위험에 똑같이 기여 |

매매 수량은 최소단위·수수료·세금을 반영하지 않은 근사라고 화면에 명시했다.

PDF 내보내기는 `window.print`인데 생각보다 삽질이 많았다.

| 문제 | 처리 |
|---|---|
| 접힌 시나리오 아코디언이 인쇄에 안 나옴 | 인쇄 직전에 자동으로 펼쳤다가 복원 |
| 브라우저가 페이지를 축소함 | `@page A4 landscape` |
| 10~13px 글씨가 인쇄하면 안 보임 | 인쇄 시 12~14px로 올림 |
| ResponsiveContainer가 인쇄 직전 폭을 못 잼 | 인쇄용 차트는 고정폭 1000px 컴포넌트를 따로 만듦 |
