---
title: Spring Security 정리 - 필터체인 구조, 인증과 인가, JWT, OAuth2 소셜 로그인 (Spring 로드맵 7)
date: 2026-07-03
category: spring
src: cover.svg
tags: [spring-security, jwt, oauth2, 인증, 인가, 로드맵]
summary: Spring Security 정리. 설정을 외우는 방식으로는 반드시 막힌다. 필터체인 구조를 먼저 잡고, 인증과 인가를 나눈 뒤 JWT와 OAuth2 소셜 로그인으로 확장하는 순서로 정리했다.
---

> Spring 공부 로드맵 시리즈 7편. [6편](/post/spring-06-transaction)까지로 "무엇을 어떻게 저장하는가"는 정리됐다. 이번엔 그 앞에 서서 "누가 요청했고 무엇을 해도 되는가"를 거르는 층이다.

## 구조를 먼저

Spring Security를 어렵게 만드는 건 문법이 아니라 **어디에 무엇이 끼어드는지 안 보인다는 점**이다. 그래서 설정 예제를 복사하기 전에 필터체인이라는 골격부터 잡아야 한다.

핵심 구조는 이렇다.

```
요청
 → DelegatingFilterProxy
 → FilterChainProxy
 → SecurityFilterChain (여러 필터가 순서대로)
     - SecurityContextHolderFilter (6.0 전 이름은 SecurityContextPersistenceFilter)
     - (커스텀) JWT 인증 필터
     - UsernamePasswordAuthenticationFilter
     - ExceptionTranslationFilter
     - AuthorizationFilter (6.0에서 FilterSecurityInterceptor 를 대체)
 → DispatcherServlet
```

정리하면 Security는 **MVC 앞단의 필터 뭉치**다. 그래서 필터 단계에서 던진 예외는 `@ControllerAdvice`로 잡히지 않고 `AuthenticationEntryPoint` / `AccessDeniedHandler`가 받는다 — 이 사실 하나만 알아도 삽질이 크게 준다. (반대로 `@PreAuthorize` 같은 메서드 보안 예외는 컨트롤러 안쪽에서 나므로 `@ControllerAdvice`로 잡힌다.)

## 1. 인증과 인가 구분

- **인증(Authentication)**: 너는 누구인가
- **인가(Authorization)**: 너는 이걸 해도 되는가
- `SecurityContextHolder` → `SecurityContext` → `Authentication` → `Principal`, `GrantedAuthority`
- `SecurityContextHolder`가 ThreadLocal 기반이라는 점과, 비동기 작업에서 컨텍스트가 안 넘어가는 문제

## 2. 폼 로그인부터

JWT로 바로 가지 말고 세션 기반 폼 로그인을 먼저 굴려보는 게 이해에 훨씬 낫다.

- `SecurityFilterChain` 빈으로 설정하기 (5.7부터 권장, `WebSecurityConfigurerAdapter`는 6.0에서 제거)
- `UserDetailsService`와 `UserDetails` 구현
- `PasswordEncoder` — BCrypt, 평문 저장 금지
- `AuthenticationManager`, `AuthenticationProvider`의 역할
- 로그인 성공/실패 핸들러
- 세션 관리, 동시 세션 제어, 로그아웃

## 3. 인가 설정

- `authorizeHttpRequests`로 경로별 권한 지정
- 역할(`ROLE_`)과 권한(authority)의 차이
- 메서드 보안: `@PreAuthorize`, `@PostAuthorize`, `@Secured`
- SpEL로 표현하는 조건 (`@PreAuthorize("#userId == authentication.name")`)
- 계층형 권한(RoleHierarchy)

## 4. JWT 기반 인증

프론트를 분리한 구조(React + Spring)에서 실제로 쓰게 되는 방식.

- 세션 방식과의 차이, 상태를 서버에 두지 않는다는 것의 의미
- JWT 구조(header.payload.signature)와 서명 검증
- 액세스 토큰 / 리프레시 토큰 전략, 만료 시간 설계
- 커스텀 필터를 `OncePerRequestFilter`로 만들어 필터체인에 끼우기
- 토큰 저장 위치 논쟁: localStorage vs HttpOnly 쿠키 (XSS/CSRF 트레이드오프)
- 로그아웃과 토큰 무효화(블랙리스트) 문제
- `@AuthenticationPrincipal`로 컨트롤러에서 사용자 꺼내기

## 5. OAuth2 소셜 로그인

- OAuth2 인가 코드 흐름(Authorization Code Grant)
- `spring-boot-starter-oauth2-client` 설정 (구글/카카오/네이버)
- `OAuth2UserService`를 커스터마이징해 우리 DB 사용자와 매핑하기
- 최초 로그인 시 회원 생성, 기존 계정 연결 처리
- 소셜 로그인 후 우리 서비스의 JWT를 발급하는 조합 패턴

## 6. 그 밖에 반드시 볼 것

- CORS와 CSRF의 차이, REST API에서 CSRF를 끄는 조건
- 예외 처리: `AuthenticationEntryPoint`(401), `AccessDeniedHandler`(403)
- 비밀번호 정책, 민감 정보 로깅 금지
- 테스트: `@WithMockUser`, `spring-security-test`

## 체크리스트

- [ ] 필터체인 구조를 그림으로 그릴 수 있다
- [ ] Security 예외가 `@ControllerAdvice`로 안 잡히는 이유를 안다
- [ ] 폼 로그인을 세션 기반으로 한 번 완성해봤다
- [ ] `UserDetailsService`와 `PasswordEncoder`를 직접 구현해봤다
- [ ] JWT 인증 필터를 만들어 필터체인에 끼워봤다
- [ ] 액세스/리프레시 토큰 전략을 설명할 수 있다
- [ ] 소셜 로그인 인가 코드 흐름을 순서대로 말할 수 있다
- [ ] 401과 403을 구분해서 응답한다

## 다음 편

다음은 테스트다. 여기까지 만든 것들이 정말 그렇게 동작하는지를 증명하는 방법으로 넘어간다.
