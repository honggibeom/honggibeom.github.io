---
title: CRA에서 Vite로, 블로그 빌드 환경을 갈아끼운 기록
date: 2026-08-31
category: frontend
src: cover.svg
tags: [vite, react, cra, 마이그레이션, 프론트엔드]
summary: react-scripts로 굴러가던 개인 블로그를 Vite로 옮겼다. 무엇이 걸림돌이었고, 어떤 코드를 어떻게 고쳤는지 순서대로 정리한다.
---

## 왜 옮겼나

이 블로그는 `create-react-app`으로 시작했다. 처음엔 아무 불만이 없었다. 문제는 프로젝트가 커지면서 드러났다.

블로그 하나에 `nearby`(위치 기반 티켓 서비스)와 `antifake`(딥페이크 탐지) 데모까지 한 저장소에 들어있다 보니 소스 파일이 100개를 훌쩍 넘겼다. `npm start` 한 번에 수십 초, 파일 하나 고치면 HMR이 도는 데도 체감으로 몇 초가 걸렸다. 개발하다 흐름이 끊기는 게 가장 컸다.

거기에 CRA는 2025년에 공식적으로 deprecated 됐다. React 19를 쓰면서도 빌드 도구만 몇 년 전에 머물러 있는 상태였다. CRA가 왜 이렇게 됐고 그 자리를 무엇이 대체했는지는 [번들러 지도](/post/buildtool-01-bundlers)에 정리해 뒀고, 이 글은 그 이동을 실제로 해 본 기록이다.

정리하면 이유는 세 가지다.

1. dev 서버 기동과 HMR이 느리다
2. CRA가 더 이상 관리되지 않는다
3. 빌드 설정을 손대려면 `eject` 아니면 `craco` 같은 우회로가 필요하다

## 전체 작업 순서

실제로 밟은 순서는 이랬다.

1. `vite`, `@vitejs/plugin-react` 설치하고 `react-scripts` 제거
2. `public/index.html`을 프로젝트 루트로 옮기고 Vite 규칙에 맞게 수정
3. `vite.config.js` 작성 - 여기서 `.js` 안의 JSX 처리가 핵심
4. `process.env.*`를 `import.meta.env.*`로 교체
5. 환경변수 접두사를 `REACT_APP_`에서 `VITE_`로 변경
6. CRA 잔재 파일 정리 (`reportWebVitals.js`, `setupTests.js`)
7. 빌드 산출물 경로를 맞춰 `gh-pages` 배포 스크립트 유지

## 1. package.json 정리

먼저 CRA 쪽 의존성을 걷어냈다. 아래는 작업 당시(Vite 6 라인) 기준이다. 지금 새로 옮긴다면 Vite 8을 쓰면 되고, 그때는 `esbuild` 항목이 Rolldown·Oxc 쪽 옵션으로 바뀐다.

```json
{
  "type": "module",
  "scripts": {
    "dev": "vite",
    "start": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "gh-pages": "^6.3.0",
    "vite": "^6.0.7"
  }
}
```

같이 지운 것들:

- `react-scripts`
- `@testing-library/*` 네 개 (실제로 테스트를 쓰고 있지 않았다)
- `web-vitals` - `reportWebVitals.js`를 지우면서 같이
- `buffer`, `dotenv`, `js-pytorch` - `src` 전체를 grep 해보니 한 번도 import 되지 않고 있었다

`"type": "module"`을 추가하는 걸 잊지 말자. Vite 설정 파일을 ESM으로 쓰려면 필요하다.

한 가지 신경 쓴 건 `build` 스크립트다. Vite의 기본 출력 폴더는 `dist`인데, 이 저장소는 `gh-pages -d build`로 배포하고 있었다. 배포 스크립트를 그대로 두기 위해 Vite 쪽 출력 폴더를 `build`로 맞췄다.

## 2. index.html이 진입점이 된다

CRA에서 `public/index.html`은 그냥 템플릿이었다. 번들러가 만든 스크립트 태그를 알아서 꽂아줬다.

Vite에서는 다르다. `index.html`이 프로젝트 루트에 있고, 그 자체가 진입점이다. 그래서 두 가지를 바꿔야 했다.

```html
<script type="module" src="/src/index.js"></script>
```

이 한 줄을 `<body>` 안에 직접 넣어줘야 한다. 이게 없으면 앱이 아예 안 뜬다.

그리고 `%PUBLIC_URL%`은 사라졌다. CRA 전용 문법이라 Vite는 모른다. `public/` 아래 정적 파일은 그냥 `/`로 시작하는 절대 경로로 참조하면 된다.

```html
<!-- before -->
<link rel="icon" href="%PUBLIC_URL%/favicon.ico" />

<!-- after -->
<link rel="icon" href="/favicon.ico" />
```

다만 `%VAR%` 치환 문법 자체가 없어진 건 아니다. Vite도 HTML 안에서 환경변수 치환을 지원한다. 이 블로그는 카카오맵 SDK 키를 HTML에서 주입하고 있어서 이렇게 바꿨다.

```html
<script
  src="//dapi.kakao.com/v2/maps/sdk.js?appkey=%VITE_KAKAO_JAVASCRIPT_KEY%&libraries=services,clusterer"
></script>
```

## 3. 가장 크게 막힌 곳: .js 안의 JSX

여기서 제일 오래 붙잡았다.

이 프로젝트는 JSX를 전부 `.jsx`가 아닌 `.js` 확장자로 쓰고 있었다. CRA는 babel로 전부 처리하니까 아무 문제가 없다. 그런데 Vite 7까지는 변환에 esbuild를 쓰고, esbuild는 기본적으로 `.js` 파일에 JSX가 들어있을 거라고 가정하지 않는다. (Vite 8은 Oxc로 바뀌었지만 확장자로 판단한다는 전제는 같다.)

그래서 첫 빌드에서 이런 에러를 만난다.

```
The JSX syntax extension is not currently enabled
```

파일 100여 개를 전부 `.jsx`로 바꾸는 것도 방법이지만, import 경로까지 줄줄이 손봐야 해서 설정으로 해결했다.

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/",
  plugins: [react({ include: /\.(js|jsx)$/ })],
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: { ".js": "jsx" },
    },
  },
  build: {
    outDir: "build",
    chunkSizeWarningLimit: 1500,
  },
  server: {
    port: 3000,
    open: true,
  },
});
```

세 군데를 다 건드려야 한다는 게 포인트다.

- `plugins`의 `include` - 플러그인이 `.js`도 React 파일로 취급하게
- `esbuild.loader` - 빌드 시 `src` 아래 `.js`를 JSX로 파싱하게
- `optimizeDeps.esbuildOptions.loader` - dev 서버의 의존성 사전 번들링 단계에서도 동일하게

하나라도 빠지면 "dev는 되는데 build가 깨지거나", 반대로 "build는 되는데 dev 서버가 안 뜨는" 상황이 생긴다.

## 4. process.env를 import.meta.env로

CRA는 webpack `DefinePlugin`으로 `process.env`를 코드에 심어줬다. Vite는 브라우저 표준에 가깝게 `import.meta.env`를 쓴다.

이 블로그는 마크다운 글을 `public/posts/md/` 아래에 두고 fetch로 읽어오기 때문에 `PUBLIC_URL`을 쓰고 있었다.

```js
// before
const fileInfos = mdLink.map((key) => ({
  filename: key,
  url: process.env.PUBLIC_URL + "/posts/md/" + key,
}));

// after
const fileInfos = mdLink.map((key) => ({
  filename: key,
  url: import.meta.env.BASE_URL + "posts/md/" + key,
}));
```

여기서 실수하기 쉬운 부분이 있다. `PUBLIC_URL`은 뒤에 슬래시가 없고, `BASE_URL`은 뒤에 슬래시가 있다. 루트 배포면 `PUBLIC_URL`은 빈 문자열, `BASE_URL`은 `"/"`다. 그대로 `+ "/posts/..."`를 붙이면 `//posts/...`가 되어버린다. 앞 슬래시를 빼야 한다.

개발/프로덕션 분기도 바꿨다.

```js
// before
if (process.env.NODE_ENV === "development") return loadDevServerPost();

// after
if (import.meta.env.DEV) return loadDevServerPost();
```

## 5. 환경변수 접두사

Vite는 `VITE_`로 시작하는 변수만 클라이언트 코드에 노출한다. 실수로 서버 비밀키가 번들에 딸려 들어가는 걸 막는 장치다.

```diff
- REACT_APP_KAKAO_JAVASCRIPT_KEY=xxxxx
+ VITE_KAKAO_JAVASCRIPT_KEY=xxxxx
```

`.env` 파일 자체의 위치나 로딩 방식은 그대로다. 접두사만 바꾸면 된다.

## 6. 지운 파일들

```
public/index.html   → 루트의 index.html로 대체
src/reportWebVitals.js
src/setupTests.js
src/App.test.js
```

`src/index.js`에서 `reportWebVitals` import와 호출도 같이 제거했다.

## HashRouter는 그대로 두었다

GitHub Pages는 SPA 라우팅을 지원하지 않는다. `/about`으로 직접 접속하면 404가 뜬다. 이 블로그는 원래 `HashRouter`를 쓰고 있었고, Vite로 옮기면서도 그대로 두었다.

`BrowserRouter` + `404.html` 리다이렉트 트릭으로 바꾸는 것도 가능하지만, 이번 작업의 목적은 빌드 도구 교체였다. 한 번에 여러 개를 바꾸면 무언가 깨졌을 때 원인을 찾기 어려워진다.

## 결과

- dev 서버 기동이 수십 초에서 1초 미만으로 줄었다. dev에서 앱 코드를 번들링하지 않고 요청이 들어온 파일만 변환하기 때문이다(`node_modules`는 예외로 미리 묶는다 - 위 `optimizeDeps` 설정이 그 단계다).
- HMR이 즉각적이다. 수정한 모듈만 교체하기 때문에 프로젝트 크기가 커져도 거의 일정하다.
- `npm install`에서 쏟아지던 취약점 경고가 거의 사라졌다. 의존성 트리 자체가 훨씬 얕아졌다.

## 되돌아보며

작업 전에 "설정 파일 몇 개 바꾸면 되겠지"라고 생각했는데, 실제로 시간을 잡아먹은 건 CRA가 조용히 해주던 일들이었다. `%PUBLIC_URL%` 치환, `.js` 안의 JSX 처리, `process.env` 주입. 전부 명시적으로 설정해야 하는 것들로 바뀌었다.

거꾸로 말하면 이제 빌드 파이프라인에서 무슨 일이 일어나는지 눈에 보인다. `eject` 없이 설정을 고칠 수 있다는 것도 크다.

CRA 프로젝트를 옮길 계획이 있다면, `.js` 안의 JSX 문제부터 확인해보길 권한다. 이게 전체 작업의 절반이었다.
