---
title: StockAdvisor 개발기 (2) 목차 - 포트폴리오, 위험분석, 데이터 파이프라인, 배포까지
date: 2026-09-02
category: stockadvisor
src: cover.svg
tags: [stockadvisor, spring-boot, react, python, 프로젝트, 개발기]
summary: StockAdvisor 개발기 2편 목차. V1 차트·뉴스, V2 포트폴리오, V3 위험분석까지 세 단계 계획이 실제로 어떻게 만들어졌는지, 주제별 9편의 글과 배포 전 남은 일을 정리한다.
---

> StockAdvisor는 Spring Boot + React(Vite) + Python 파이프라인으로 만든 주식 정보 서비스다. 시세와 뉴스, 포트폴리오, 위험분석을 한 화면에서 본다. 개발기 1편은 [뉴스 감성 모델](/post/stockadvisor-sentiment-model)과 [종목 추출](/post/stockadvisor-ticker-extraction)이었고, 이 글은 2편의 목차다.

**한눈에 보기**

- V1(차트·뉴스) → V2(포트폴리오) → V3(위험분석) 세 단계 계획. 실제 진행은 뒤섞였다
- 주제별 10편: 포트폴리오, 위험분석, 변곡점 모델(과 v2 재학습), 시황 위젯, 종목 상세 데이터, 파이프라인, 프론트 재구축, 보안, 인프라
- 가장 많이 한 일은 난수·랜덤·목업을 실데이터로 바꾸는 것이었다

## 처음 계획은 세 단계였다

| 단계 | 목표 | 실제로 만들어진 것 |
|---|---|---|
| V1 | 차트와 뉴스를 한 화면에서 | 실데이터 캔들, 변곡점 신호 마커, 매크로 지표, 뉴스 감성 점수 |
| V2 | 주식·채권·옵션으로 포트폴리오 구성과 수익률 | 보유 종목 입력 → 규칙 기반 전략 추천, 채권·미국 주식 원화 환산 |
| V3 | 델타-노말 VaR, 몬테카를로, 시나리오 분석 | EWMA 공분산, Cornish-Fisher, Kupiec 백테스트, 베타·듀레이션 시나리오, 시장 국면 판정 |

세 단계는 순서대로가 아니라 뒤섞여서 진행됐고, 그 사이에 파이프라인·프론트 재구축·보안·인프라 작업이 끼어들었다. 아래는 그 전부를 주제별로 나눈 글 목록이다. 순서는 시간순이 아니라 주제순이다.

<svg viewBox="0 0 760 176" width="100%" style="max-width:760px;display:block;margin:22px auto" role="img" aria-label="React 프론트, Spring 백엔드, MySQL/Redis, 파이썬 파이프라인, 외부 데이터 소스로 이루어진 구조">
<text x="0" y="14" font-size="13" fill="var(--color-text-muted)">전체 구조</text>
<rect x="0" y="30" width="242" height="54" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="121" y="52" font-size="13" fill="var(--color-text)" text-anchor="middle">React + Vite</text>
<text x="121" y="69" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">차트 · 포트폴리오 · 위험분석 화면</text>
<rect x="258" y="30" width="242" height="54" rx="8" fill="var(--color-accent-soft)" stroke="var(--color-accent)"/>
<text x="379" y="52" font-size="13" fill="var(--color-text)" text-anchor="middle" font-weight="600">Spring Boot</text>
<text x="379" y="69" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">API · 캐시 · 감성 추론(ONNX)</text>
<rect x="516" y="30" width="242" height="54" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="637" y="52" font-size="13" fill="var(--color-text)" text-anchor="middle">MySQL · Redis</text>
<text x="637" y="69" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">캔들 · 뉴스 · 포트폴리오 / 캐시</text>
<rect x="0" y="100" width="242" height="70" rx="8" fill="var(--color-accent-soft)" stroke="var(--color-accent)"/>
<text x="121" y="122" font-size="13" fill="var(--color-text)" text-anchor="middle" font-weight="600">Python 파이프라인</text>
<text x="121" y="139" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">run_pipeline.py · 20분 배치</text>
<rect x="258" y="100" width="242" height="70" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="379" y="122" font-size="13" fill="var(--color-text)" text-anchor="middle">변곡점 모델</text>
<text x="379" y="139" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">Keras 앙상블 · GPU</text>
<rect x="516" y="100" width="242" height="70" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="637" y="122" font-size="13" fill="var(--color-text)" text-anchor="middle">외부 데이터</text>
<text x="637" y="139" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">KIS · 네이버 · Yahoo · FRED</text>
<text x="637" y="153" font-size="11" fill="var(--color-text-dim)" text-anchor="middle">DART · KRX</text>
</svg>

## 글 목록

| # | 글 |
|---|---|
| 0 | [뉴스 감성 모델](/post/stockadvisor-sentiment-model), [종목 추출](/post/stockadvisor-ticker-extraction) (1편) |
| 1 | [StockAdvisor 포트폴리오 - 전략을 고르게 하지 말고 추천하자, 채권과 환율을 캔들처럼 다루기](/post/stockadvisor-portfolio) |
| 2 | [StockAdvisor 위험분석 - 델타-노말 VaR, 250일 보유기간 버그, 몬테카를로, 시나리오와 시장 국면](/post/stockadvisor-risk-analysis) |
| 3 | [StockAdvisor 변곡점 예측 - Keras 앙상블, 임계값 이진 탐색, 종목당 1분을 밀리초로](/post/stockadvisor-turning-point-model) |
| 4 | [StockAdvisor 시황 위젯 - 다우 이론 6국면 판정과 환율·원자재 파생 신호](/post/stockadvisor-market-widgets) |
| 5 | [StockAdvisor 종목 상세 데이터 - 공매도 IP 차단, 옵션 체인 압축, DART 공시](/post/stockadvisor-stock-detail-data) |
| 6 | [StockAdvisor 데이터 파이프라인 - 증분 수집, 실행 로그, 호출량 관리, 왜 파이썬인가](/post/stockadvisor-data-pipeline) |
| 7 | [StockAdvisor 프론트 재구축 - CRA에서 Vite로, styled-components에서 Tailwind v4로, 컵앤핸들 로고](/post/stockadvisor-frontend-rebuild) |
| 8 | [StockAdvisor 보안과 설정 - 시크릿 분리, 관리자 승격, 배치 API 키, 권한 체계](/post/stockadvisor-security-config) |
| 9 | [StockAdvisor 인프라 - S3에서 OCI로, Docker Compose, Always Free 티어 검토](/post/stockadvisor-infra-oci) |
| 10 | [StockAdvisor 변곡점 예측 v2 - 배치를 지우고 온디맨드로, PyTorch 재학습과 정밀도 상한](/post/stockadvisor-turning-point-v2) |

## 남은 것

운영 배포는 아직이다. 배포 전 필수 목록은 이렇다.

| 항목 | 이유 |
|---|---|
| `ddl-auto`를 `validate`로, 스키마는 Flyway로 | 검토 중 `create`가 그대로 남아 있는 걸 발견했다. 운영에 올리면 재시작마다 데이터가 전멸한다 |
| secret 파일 → 환경변수 주입 | 컨테이너 환경에 맞추기 위해 |
| 노출 이력 있는 키 로테이션 | 파일을 분리했다고 이미 노출된 키가 안전해지진 않는다 |
| Docker 빌드에서 DJL 토크나이저 캐시 워밍 | OCI 첫 기동 지연 방지 |

데이터 쪽은 몬테카를로의 정규 충격을 부트스트랩으로 바꾸는 것과 국내 지수옵션 UI 연결이 남았다. 변곡점 모델은 국내 372·미국 380종목으로 재학습해 [v2](/post/stockadvisor-turning-point-v2)로 교체했는데, 국내 정확도가 오르긴 했지만 가격 지표만으로는 정밀도 0.6 근처가 상한이라는 것도 함께 확인했다. 프라이빗 버킷을 쓰게 되면 PAR 발급 로직도 필요하다.

## 돌아보면

이 프로젝트에서 가장 많이 한 일은 **"가짜를 진짜로 바꾸는 것"**이었다. 난수로 그리던 지수, 랜덤으로 붙이던 뉴스, 나열만 하던 전략 프리셋, 저장만 되고 안 보이던 신호. 하나씩 실데이터로 바꾸면서 데이터 소스의 한도와 약관, 그리고 그 데이터가 틀렸을 때 화면이 어떻게 보이는지를 배웠다.
