---
title: StockAnalyst 프론트 재구축 - CRA에서 Vite로, styled-components에서 Tailwind v4로, 컵앤핸들 로고
date: 2026-09-02
category: stockanalyst
src: cover.svg
tags: [stockanalyst, react, vite, tailwind, styled-components, 프론트엔드]
summary: StockAnalyst 프론트 재구축 기록. CRA를 인플레이스로 Vite 8로 옮겨 초기 로딩 471KB→182KB, styled-components 395개·7,580줄을 Tailwind v4로 전환하며 정한 규칙 세 가지, preflight가 드러낸 box-sizing 잠재 버그, 컵앤핸들 워드마크 로고.
---

> StockAnalyst는 Spring Boot + React(Vite) + Python 파이프라인으로 만든 주식 정보 서비스다. 개발기 1편은 [뉴스 감성 모델](/post/stockanalyst-sentiment-model)과 [종목 추출](/post/stockanalyst-ticker-extraction)이었고, 2편은 그것을 뺀 나머지를 주제별로 나눴다. 전체 목차는 [개발기 (2) 목차](/post/stockanalyst-dev-log-2-overview)에 있다.

한눈에 보기

- CRA → Vite 인플레이스 전환. 빌드 1.97초, 초기 로딩 gzip 471KB → 182KB, apexcharts는 지연 로드
- styled-components 395개·동적 스타일 490곳을 Tailwind v4로. 런타임 클래스 조립 금지, 연속값은 인라인, 차트 색은 `@theme`과 동일
- preflight의 전역 `border-box`가 다른 페이지의 `content-box` 렌더링을 드러냈다. 잠재 버그의 정상화
- 로고는 컵앤핸들 위에 이름. 글자·선 간격은 렌더 픽셀에서 실측

## CRA → Vite

`react-scripts` 5 기반 CRA를 새 프로젝트 없이 인플레이스로 Vite 8로 옮겼다.

| 항목 | 처리 |
|---|---|
| 개발 프록시 | `setupProxy.js`의 프록시 4개를 `vite.config.ts`로 이식 |
| 환경변수 | `process.env.REACT_APP_*` → `import.meta.env.VITE_*` |
| 코드 분할 | 라우트 단위 `React.lazy`. apexcharts(166KB)는 종목 상세에 들어갈 때만 로드 |
| 빌드 | 1.97초 |

<svg viewBox="0 0 640 104" width="100%" style="max-width:640px;display:block;margin:22px auto" role="img" aria-label="초기 로딩이 471KB에서 182KB로 줄었다">
<text x="0" y="14" font-size="13" fill="var(--color-text-muted)">초기 로딩 JS (gzip)</text>
<text x="0" y="45" font-size="13" fill="var(--color-text)">전</text>
<rect x="60" y="30" width="390" height="20" rx="4" fill="var(--color-border-strong)"/>
<text x="458" y="45" font-size="13" fill="var(--color-text-muted)">471KB</text>
<text x="0" y="85" font-size="13" fill="var(--color-text)">후</text>
<rect x="60" y="70" width="151" height="20" rx="4" fill="var(--color-accent)"/>
<text x="219" y="85" font-size="13" fill="var(--color-text-muted)">182KB</text>
</svg>

## styled-components → Tailwind v4

<svg viewBox="0 0 640 162" width="100%" style="max-width:640px;display:block;margin:22px auto" role="img" aria-label="27개 파일, styled 컴포넌트 395개, 동적 스타일 490곳, 7,580줄">
<text x="0" y="14" font-size="13" fill="var(--color-text-muted)">styled-components → Tailwind 전환 규모</text>
<text x="0" y="45" font-size="13" fill="var(--color-text)">파일</text>
<rect x="150" y="30" width="2" height="20" rx="4" fill="var(--color-border-strong)"/>
<text x="160" y="45" font-size="13" fill="var(--color-text-muted)">27</text>
<text x="0" y="77" font-size="13" fill="var(--color-text)">styled 컴포넌트</text>
<rect x="150" y="62" width="21" height="20" rx="4" fill="var(--color-border-strong)"/>
<text x="179" y="77" font-size="13" fill="var(--color-text-muted)">395</text>
<text x="0" y="109" font-size="13" fill="var(--color-text)">props 동적 스타일</text>
<rect x="150" y="94" width="26" height="20" rx="4" fill="var(--color-border-strong)"/>
<text x="184" y="109" font-size="13" fill="var(--color-text-muted)">490</text>
<text x="0" y="141" font-size="13" fill="var(--color-text)">줄 수</text>
<rect x="150" y="126" width="400" height="20" rx="4" fill="var(--color-accent)"/>
<text x="558" y="141" font-size="13" fill="var(--color-text-muted)">7,580</text>
</svg>

v4는 CSS 우선 설정이라 `tailwind.config.js`가 없고 토큰은 `index.css`의 `@theme`에 있다. 전환하면서 규칙을 세 가지로 정했다.

| 상황 | 규칙 | 이유 |
|---|---|---|
| 동적 스타일 | `clsx` 조건부 클래스. `` `text-${x}` `` 같은 런타임 조립 금지 | Tailwind는 소스를 스캔해서 클래스를 만든다. 조립된 문자열은 스캔에 안 걸려 CSS가 안 나온다 |
| 퍼센트 폭 같은 연속값 | 인라인 `style` | 값이 무한하니 클래스로 못 만든다 |
| 차트 라이브러리 색 | `theme.ts` 객체 유지, 단 `@theme`과 반드시 같은 값 | 라이브러리는 색상 값을 받아야 한다 |

### 전환 뒤 유일한 차이 - box-sizing

전환 후 Playwright로 라우트별 스크린샷을 비교했는데 한 가지 차이가 있었다. 전환 전에는 `box-sizing: border-box`가 메인 페이지의 `createGlobalStyle`에만 있어서 다른 페이지들은 `content-box`로 렌더링되고 있었다. Tailwind preflight가 전역으로 `border-box`를 적용하면서 일부 페이지 컨테이너 폭이 padding만큼 좁아졌는데, 이건 잠재 버그의 정상화다. CSS 산출물은 gzip 8.4KB다.

## 로고

컵앤핸들 그래프 안에 이름이 들어간 워드마크로 정했다.

<svg viewBox="0 0 640 220" width="100%" style="max-width:640px;display:block;margin:22px auto" role="img" aria-label="상승 직선, 전고점, U자 컵, 얕은 손잡이, 돌파 화살표로 이루어진 컵앤핸들 로고 골격">
<text x="0" y="14" font-size="13" fill="var(--color-text-muted)">로고의 골격 - 컵앤핸들 패턴</text>
<path d="M40 190 L170 90" fill="none" stroke="var(--color-accent)" stroke-width="3" stroke-linecap="round"/>
<path d="M170 90 C 200 200, 330 200, 380 92" fill="none" stroke="var(--color-accent)" stroke-width="3" stroke-linecap="round"/>
<path d="M380 92 C 395 118, 420 118, 440 96" fill="none" stroke="var(--color-accent)" stroke-width="3" stroke-linecap="round"/>
<path d="M440 96 L520 40" fill="none" stroke="var(--color-accent)" stroke-width="3" stroke-linecap="round"/>
<path d="M512 38 L522 38 L521 48" fill="none" stroke="var(--color-accent)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
<line x1="170" y1="90" x2="440" y2="90" stroke="var(--color-text-dim)" stroke-width="1" stroke-dasharray="4 3"/>
<text x="275" y="172" font-size="26" font-weight="800" fill="var(--color-text)" text-anchor="middle" letter-spacing="-1">StockAnalyst</text>
<g font-size="11" fill="var(--color-text-dim)">
<text x="150" y="178" text-anchor="middle">상승 트렌드</text>
<text x="170" y="78" text-anchor="middle">전고점</text>
<text x="412" y="140" text-anchor="middle">손잡이</text>
<text x="490" y="32" text-anchor="middle">돌파</text>
<text x="275" y="205" text-anchor="middle">U자 컵이 이름을 아래에서 받친다</text>
</g>
</svg>

차트는 SVG에 `preserveAspectRatio="none"`으로 글자 블록에 맞춰 늘어나고, 선 두께만 `em` + `vector-effect: non-scaling-stroke`로 고정된다. 글자와 선의 겹침은 눈대중이 아니라 렌더한 픽셀에서 최단거리를 측정해 4.7px 이상을 확보했다. 파비콘은 16·32·48px에 마크만, 64·128px에 마크+풀네임을 넣은 다중 사이즈 ICO다.

## 삽질 하나

`node_modules`는 Windows에서 직접 설치해야 한다. 원격 브리지(리눅스 VM)로 설치하면 rolldown/oxide 네이티브 바이너리가 뒤섞인다. 같은 이유로 `vite build`는 Windows에서만, `tsc --noEmit`은 어디서나.
