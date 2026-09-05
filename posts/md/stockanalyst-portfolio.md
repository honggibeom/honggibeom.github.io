---
title: StockAnalyst 포트폴리오 - 전략을 고르게 하지 말고 추천하자, 채권과 환율을 캔들처럼 다루기
date: 2026-09-02
category: stockanalyst
src: cover.svg
tags: [stockanalyst, 포트폴리오, 채권, 환율, spring-boot, react]
summary: StockAnalyst 포트폴리오 화면 기록. 전략 프리셋 12개를 고르게 하던 기획을 보유 종목 입력 + 규칙 기반 추천으로 뒤집었다. 채권과 미국 주식을 원화 가격 시리즈로 캔들 테이블에 넣어 기존 위험분석이 수정 없이 처리하게 한 설계.
---

> StockAnalyst는 Spring Boot + React(Vite) + Python 파이프라인으로 만든 주식 정보 서비스다. 개발기 1편은 [뉴스 감성 모델](/post/stockanalyst-sentiment-model)과 [종목 추출](/post/stockanalyst-ticker-extraction)이었고, 2편은 그것을 뺀 나머지를 주제별로 나눴다. 전체 목차는 [개발기 (2) 목차](/post/stockanalyst-dev-log-2-overview)에 있다.

한눈에 보기

- 전략을 고르게 하지 말고 보유 종목만 입력받아 시스템이 추천한다. 추천은 6개 규칙, 사유가 투명하다
- 채권 데이터는 국내 KIS, 브라질 Tesouro CSV, 해외는 ETF 프록시. 전부 무료 소스
- 채권·미국 주식을 원화 환산 가격 시리즈로 주식 캔들 테이블에 넣으면 VaR·상관·몬테카를로가 그대로 돈다

## 전략을 고르게 하지 말고 추천하자

처음 만든 포트폴리오 화면은 옵션 전략 프리셋 12개를 나열하고 사용자가 골라서 구성하는 방식이었다. 써 보니 아무도 그렇게 쓰지 않는다. 사용자가 아는 건 "내가 뭘 얼마에 몇 주 갖고 있는가"뿐이다.

| | 처음 | 다시 잡은 기획 |
|---|---|---|
| 시작점 | 전략 프리셋 12개 중 하나를 고른다 | 포트폴리오를 이름과 설명으로 만든다 |
| 입력 | 전략에 맞는 옵션 다리(leg) | 보유 종목의 수량·평균단가·매수금액 |
| 분석 | 전략별 손익 구조 | 보유 내역 그대로 위험분석 |
| 전략 | 사용자가 고른다 | 시스템이 추천한다 |

<svg viewBox="0 0 760 160" width="100%" style="max-width:760px;display:block;margin:22px auto" role="img" aria-label="간단 모드 다섯 칸과 고급 모드에 숨긴 파생상품 항목">
<text x="0" y="14" font-size="13" fill="var(--color-text-muted)">입력 폼 두 모드</text>
<rect x="0" y="30" width="372" height="54" rx="8" fill="var(--color-accent-soft)" stroke="var(--color-accent)"/>
<text x="186" y="52" font-size="13" fill="var(--color-text)" text-anchor="middle" font-weight="600">간단 모드</text>
<text x="186" y="69" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">유형 · 종목 · 수량 · 평균단가 · 매수금액</text>
<rect x="388" y="30" width="372" height="54" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="574" y="52" font-size="13" fill="var(--color-text)" text-anchor="middle">고급 모드</text>
<text x="574" y="69" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">옵션 · 선물 · 공매도 · 현금 · 승수 · 행사가 · IV</text>
<rect x="0" y="100" width="372" height="54" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="186" y="122" font-size="13" fill="var(--color-text)" text-anchor="middle">자동 계산</text>
<text x="186" y="139" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">금액 ↔ 단가 양방향</text>
<rect x="388" y="100" width="372" height="54" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="574" y="122" font-size="13" fill="var(--color-text)" text-anchor="middle">자동 전환</text>
<text x="574" y="139" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">기존 포지션에 파생상품이 있으면 고급 모드로</text>
</svg>

초기투자금·무위험이자율·벤치마크 같은 설정도 `<details>`로 접었다. 처음 여는 사람이 보는 칸은 다섯 개뿐이다.

## 추천은 머신러닝이 아니라 규칙

사유가 투명해야 사용자가 납득한다. "왜 이걸 추천했나"에 한 줄로 답할 수 있어야 한다.

| 규칙 | 조건 | 추천 |
|---|---|---|
| CONCENTRATION | 단일 종목 40% 이상 | 비중 축소 또는 프로텍티브 풋 |
| FEW_HOLDINGS | 종목 3개 미만 | 지수 ETF로 분산 |
| KR_ONLY / US_ONLY | 한 국가 90% 이상 | 국가 분산 / 환노출 축소 |
| NO_BONDS | 채권 5% 미만 | 채권·채권 ETF 편입 |
| HIGH_VOL | 가중 연변동성 35% 이상, 옵션 없음 | 커버드콜 |
| BALANCED | 해당 없음 | 균형 확인 메시지 |

옵션 전략을 추천하는 카드에는 "구성하러 가기" 버튼이 있어서 기존 프리셋 설정 폼이 그 자리에서 열린다. 프리셋 인프라는 그대로 두고 노출 경로만 추천 카드로 좁힌 셈이다.

## 채권을 어떻게 넣었나

채권이 들어가면서 데이터 소스 문제가 생겼다. 원칙은 무료 데이터만 쓰는 것이다.

| 자산 | 소스 | 비고 |
|---|---|---|
| 국내 장내 국채·회사채 | 한국투자증권(KIS) API | 발행정보 `CTPF1101R`, 기간별 시세 `FHKBJ773701C0`. TR ID는 공식 예제 저장소에서 확인 |
| 브라질 국채 | Tesouro Transparente 공식 CSV | 무인증, ODbL. 한-브라질 조세협약으로 비과세라 화면에 배지 |
| 해외 개별 회사채·미국 개별 국채 | 없음 → ETF 프록시 | LQD · HYG · EMB로 대신. 무료 일별 가격 소스가 없다 |

KIS는 호출 제한 때문에 포트폴리오에 담긴 채권만 동기화한다. 처음 담은 채권도 위험분석 표본(30일 이상)이 바로 나오도록 KIS의 연속조회(`tr_cont` 헤더)를 구현해 최대 8페이지까지 과거를 끌어온다.

### 채권은 "자체 가격 시리즈를 가진 선형 자산"

설계에서 가장 중요했던 결정이다. 채권 일별 가격을 주식 캔들 테이블에 채권 코드로 넣으면, 기존 VaR·상관행렬·몬테카를로가 수정 없이 채권을 소화한다. 채권용 코드를 따로 짤 필요가 없다.

<svg viewBox="0 0 760 110" width="100%" style="max-width:760px;display:block;margin:22px auto" role="img" aria-label="채권과 미국 주식 가격을 원화로 바꿔 주식 캔들 테이블에 넣으면 기존 위험분석이 그대로 처리한다">
<g font-size="13" fill="var(--color-text)" text-anchor="middle">
<rect x="0" y="30" width="160" height="56" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="80" y="52">채권 일별 가격</text>
<text x="80" y="69" fill="var(--color-text-dim)" font-size="11">KIS · Tesouro CSV</text>
<rect x="200" y="30" width="160" height="56" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="280" y="52">원화 환산</text>
<text x="280" y="69" fill="var(--color-text-dim)" font-size="11">× 그날의 환율</text>
<rect x="400" y="30" width="160" height="56" rx="8" fill="var(--color-accent-soft)" stroke="var(--color-accent)"/>
<text x="480" y="52" font-weight="600">주식 캔들 테이블</text>
<text x="480" y="69" fill="var(--color-text-dim)" font-size="11">채권 코드로 그대로 저장</text>
<rect x="600" y="30" width="160" height="56" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="680" y="52">VaR · 상관행렬 · MC</text>
<text x="680" y="69" fill="var(--color-text-dim)" font-size="11">수정 없이 채권을 소화</text>
</g>
<path d="M160 58.0h34m-6-5l6 5-6 5" stroke="var(--color-text-dim)" stroke-width="1.5" fill="none"/>
<path d="M360 58.0h34m-6-5l6 5-6 5" stroke="var(--color-text-dim)" stroke-width="1.5" fill="none"/>
<path d="M560 58.0h34m-6-5l6 5-6 5" stroke="var(--color-text-dim)" stroke-width="1.5" fill="none"/>
</svg>

브라질 국채는 헤알 가격에 BRL/KRW 환율을 곱해 원화로 저장한다. 이렇게 하면 환율 리스크가 수익률에 자연히 들어간다. 채권 가격은 안 움직였는데 헤알이 떨어지면 원화 가격이 떨어지고, 그게 그대로 변동성과 상관에 반영된다.

### 미국 주식도 같은 방식

미국 주식도 일별 종가에 그 날짜의 USD/KRW를 곱해 정렬한다. 환율 변동이 공분산에 자동으로 들어가고, 포지션을 만들 때 그 시점 환율을 `entry_fx_rate`로 저장해 미실현손익에 환차손익이 포함된다. "달러로는 올랐는데 원화로는 손해"가 화면에 그대로 보인다.

환율을 가격에 녹이는 이 설계에는 대가가 있었다. 환율 필드 하나가 복사에서 빠지자 미국 자산 손익이 통째로 오염됐다 - [위험분석 글](/post/stockanalyst-risk-analysis)에 적었다.
