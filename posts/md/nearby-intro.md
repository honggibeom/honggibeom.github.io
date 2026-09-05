---
title: nearby - 내 주변의 전시와 공연을 찾는 위치 기반 티켓 서비스
date: 2025-07-07
category: nearby
src: cover.svg
tags: [react, 프로젝트, nearby, 지도, 상태관리]
summary: 주말에 뭘 볼지 검색하다 지친 경험에서 시작한 프로젝트. 지도 기반 탐색부터 필터, 예매, 결제까지 만들면서 부딪힌 문제들을 정리한다.
---

## 시작점

"이번 주말에 뭐 하지"를 검색하는 데 30분을 쓴 적이 있다.

전시는 전시 정보 사이트에서, 공연은 예매 사이트에서, 지역 축제는 시청 홈페이지에서. 각각 다른 곳에 흩어져 있고, 정작 알고 싶은 "지금 내 위치에서 갈 만한 게 뭐가 있나"는 어디에서도 한 번에 답해주지 않았다.

nearby는 그 질문 하나에 답하려고 만든 서비스다.

- 기간: 2023.02 ~ 2024.11
- 역할: 프론트엔드 및 백엔드 개발
- 스택: React, styled-components, Zustand, Spring, AWS, 카카오맵 SDK, 토스페이먼츠

## 무엇을 만들었나

기능은 크게 다섯 덩어리다.

| 영역 | 내용 |
| --- | --- |
| 탐색 | 지도 기반 탐색, 리스트 탐색, 검색, 추천 |
| 필터 | 카테고리 / 요금 / 진행 상태 / 기간 |
| 계정 | 회원가입, 소셜 로그인, ID·비밀번호 찾기, 탈퇴 |
| 예매 | 티켓 예매, 결제, 예매 내역 |
| 커뮤니티 | 후기 작성·조회, 북마크, 알림 |

카테고리는 네 가지로 나눴다. 전시회, 공연, 축제, 원데이 클래스. 각각에 색을 부여해서 지도 마커와 리스트에서 같은 색으로 보이게 했다.

```js
const color = {
  전시회: "#1593FF",
  공연: "#F3757C",
  축제: "#EFA116",
  "원데이 클래스": "#981C26",
};
```

작은 결정이지만 효과가 컸다. 지도에서 파란 마커를 본 사용자가 리스트로 넘어가도 같은 파란색을 보게 되니까, 별도 설명 없이도 종류가 읽힌다.

## 모바일 우선, 그리고 데스크톱에서도 모바일

nearby는 "밖에서 지금 갈 곳을 찾는" 서비스라서 처음부터 모바일 화면을 기준으로 잡았다. 다만 데스크톱에서 열었을 때 컴포넌트가 화면 전체로 늘어지면 보기 흉했다.

그래서 최대 폭을 450px로 잡고, 그보다 넓은 화면에서는 가운데 정렬된 모바일 뷰를 보여주는 방식을 택했다.

```js
width: ${window.innerWidth > 450
  ? (450 * 3) / 4
  : (window.innerWidth * 3) / 4}px;
```

지금 다시 본다면 이건 고칠 것이다. `window.innerWidth`를 스타일 정의 시점에 한 번 읽고 끝나기 때문에, 브라우저 창 크기를 바꿔도 반응하지 않는다. CSS의 `min()`이나 미디어 쿼리로 처리하는 게 맞다.

## 필터: 조건이 늘어날수록 복잡해지는 지점

필터가 이 프로젝트에서 로직이 가장 지저분해진 부분이었다.

처음엔 카테고리만 있었다. 여기에 "무료만 보기"가 붙고, "지금 진행 중인 것만"이 붙고, "특정 기간에 열리는 것"이 붙었다. 조건이 네 개가 되니 if 문이 중첩되기 시작했다.

결국 조건별로 함수를 쪼개고, 결과를 AND로 합치는 구조로 정리했다.

```js
const filtering = (filter, data) => {
  const category = displayCategory(filter.category, data.category);
  const fee = displayFee(filter.fee, data.charge);
  const run = displayRun(filter.run, data.start_date, data.end_date, true);
  const duration = displayDuration(
    filter.startDate,
    filter.endDate,
    data.start_date,
    data.end_date
  );

  const end = displayEnd(data.end_date);
  if (!end) return false;
  else return category && fee && run && duration;
};
```

새 조건을 추가할 때 `displayXxx` 함수 하나를 쓰고 마지막 줄에 `&&`로 붙이면 끝난다. 조건이 다섯 개, 여섯 개가 되어도 이 구조는 무너지지 않았다.

여기서 배운 건, 필터는 "필터 하나"가 아니라 "독립적인 술어(predicate)의 모음"으로 봐야 한다는 것이다. 처음부터 그렇게 봤다면 리팩터링할 일도 없었을 것이다.

## 날짜를 다루면서 만난 함정

이벤트 서비스라 날짜 비교가 도처에 있다. D-day 계산, 진행 중 여부, 기간 겹침 판정.

여기서 계속 미묘한 오차가 났다. 원인은 시각과 시간대였다. `new Date()`에는 시·분·초가 들어있는데, `new Date("2026-08-30")`처럼 날짜만 있는 문자열은 UTC 자정으로 해석된다. KST에서 읽으면 그날 오전 9시다. 이 둘을 그냥 빼면 "오늘 시작하는 이벤트"가 어제로도, 오늘로도 판정됐다.

해결은 단순하다. 비교하기 전에 양쪽을 모두 자정으로 내린다.

```js
let now = new Date();
now.setHours(0);
now.setMinutes(0);
now.setSeconds(0);
now.setMilliseconds(0);

let start = new Date(startDate);
start.setHours(0);
start.setMinutes(0);
start.setSeconds(0);
start.setMilliseconds(0);
```

날짜만 비교할 거라면 시각 정보를 아예 버리고 시작하는 게 안전하다.

## 이미지 로딩: 넣었다가 빼기까지

메인 화면에 이벤트 포스터가 수십 장 깔린다. 처음에는 스크롤을 내려야 보이는 이미지까지 전부 한 번에 요청되는 게 아까워서, `IntersectionObserver`로 지연 로딩 훅을 만들었다.

```js
const io = new IntersectionObserver(([entry], obs) => {
  if (entry.isIntersecting) {
    ref.current.style.backgroundImage = `url(${realUrl})`;
    obs.unobserve(entry.target);
  }
}, { root, rootMargin: "300px" });
```

CSS `background-image`와 `<img>` 태그 두 경우를 다 지원하려다 보니 인자 시그니처가 이렇게 됐다.

```js
useLazyBackground(ref, url);        // background 모드
useLazyBackground(url, options);    // img 모드
```

같은 함수가 첫 번째 인자의 모양을 보고 모드를 판별한다. 편해 보였지만 실제로는 호출부만 보고 무슨 일이 일어나는지 알 수 없었고, 훅 내부에서 DOM 스타일을 직접 만지는 것도 React 밖으로 나가는 일이라 디버깅이 어려웠다.

무엇보다, 스크롤 컨테이너를 자동으로 찾아 올라가는 코드가 있었는데

```js
let el = ref.current.parentElement;
while (el && el !== document.body) {
  if (/(auto|scroll)/.test(getComputedStyle(el).overflowY)) return el;
  el = el.parentElement;
}
```

레이아웃을 바꿀 때마다 이 탐색 결과가 달라져서 이미지가 안 뜨는 일이 생겼다.

결국 이 훅은 걷어냈다. 브라우저의 네이티브 `loading="lazy"`가 같은 일을 훨씬 적은 코드로 해준다.

```jsx
<img className="poster" src={src} alt="poster" loading="lazy" />
```

직접 만들기 전에 플랫폼이 이미 제공하는지 확인하자. 이 훅을 만들던 시점에도 `loading="lazy"`는 이미 쓸 수 있었다.

## 상태 관리는 Zustand로

로그인 정보, 필터 조건, 북마크처럼 화면을 가로질러 공유되는 상태가 있었다. Redux는 이 규모에 비해 보일러플레이트가 과했다.

Zustand는 store 하나가 함수 하나다.

```js
export const useFilterStore = create(
  persist(
    (set) => ({
      category: [],
      fee: null,
      run: false,
      setCategory: (category) => set({ category }),
      reset: () => set({ category: [], fee: null, run: false }),
    }),
    { name: "nearby-filter" }
  )
);
```

`persist` 미들웨어를 씌우면 localStorage 동기화까지 공짜다. 새로고침해도 필터 조건이 유지되는 걸 별도 코드 없이 얻었다.

## 결제 연동

토스페이먼츠 SDK를 붙였다. 결제 자체보다 어려웠던 건 성공과 실패 이후의 흐름이었다.

결제창은 외부 페이지로 나갔다가 리다이렉트로 돌아온다. 이때 앱의 상태는 초기화된 상태다. 그래서 `/payment/success`와 `/payment/fail` 라우트를 따로 두고, 돌아온 뒤 쿼리 파라미터로 주문을 다시 조회하는 구조로 만들었다.

여기서도 하나 배웠다. 외부 결제 연동은 "결제를 호출하는 코드"보다 "돌아온 뒤를 처리하는 코드"가 더 길다.

## 다시 만든다면

첫째, 지도와 리스트의 상태를 처음부터 하나로 묶었을 것이다.
지도를 먼저 만들고 리스트를 나중에 붙였더니, 같은 필터 상태를 두 곳에서 따로 관리하는 시기가 있었다. 지도에서 필터를 걸고 리스트로 가면 초기화되는 버그를 여러 번 잡았다.

둘째, 날짜 처리를 한 파일로 모았을 것이다.
`setHours(0)` 패턴이 파일 여러 곳에 흩어져 있다. 유틸 하나로 모았다면 시간대 버그를 한 번에 잡을 수 있었다.

셋째, 성능 최적화를 나중으로 미뤘을 것이다.
지연 로딩 훅에 쓴 시간이 아깝다. 실제로 느린지 측정하기 전에 최적화부터 했고, 결과적으로 유지보수 부담만 남겼다.

## 마무리

nearby는 기능 목록으로 보면 평범한 서비스다. 지도, 리스트, 필터, 예매, 결제. 하지만 이 다섯 개를 하나의 흐름으로 이어붙이는 일이 각각을 만드는 것보다 훨씬 어려웠다.

지도에서 본 이벤트를 눌렀을 때 상세 화면이 뜨고, 거기서 예매를 누르면 로그인 여부를 확인하고, 결제가 끝나면 예매 내역으로 돌아오는 이 한 줄기 경로. 화면 다섯 개를 각각 완성하는 것과, 그 다섯 개를 끊김 없이 잇는 것은 전혀 다른 작업이었다.

데모는 [프로젝트 페이지](/#/nearby)에서 볼 수 있다.
