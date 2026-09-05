---
title: Spring MVC 요청 흐름 정리 - DispatcherServlet부터 바인딩, 검증, 예외 처리까지 (Spring 로드맵 3)
date: 2026-05-07
category: spring
src: cover.svg
tags: [spring, mvc, rest, api, 로드맵, 백엔드]
summary: Spring MVC 요청 흐름 정리. DispatcherServlet에서 컨트롤러, 바인딩, 검증, 전역 예외 처리까지. 흐름을 그릴 수 있으면 필터와 인터셉터를 어디에 끼울지가 저절로 정해진다.
---

> Spring 공부 로드맵 시리즈 3편. [2편](/post/spring-02-aop)까지가 컨테이너 안쪽 이야기였다면, 이번엔 바깥에서 들어온 HTTP 요청이 그 안까지 어떤 경로로 도달하는지를 따라간다.

## 흐름부터 외운다

웹 계층은 기능을 하나씩 외우는 것보다 경로를 그릴 수 있는지가 훨씬 중요하다. 경로를 알면 "이 처리를 어디에 넣어야 하나"라는 질문에 매번 답이 나온다.

```
클라이언트
  → 서블릿 컨테이너(Tomcat)
  → Filter 체인
  → DispatcherServlet
  → HandlerMapping (어느 컨트롤러인가)
  → HandlerAdapter
  → Interceptor(preHandle)
  → Controller
  → (@ResponseBody 면 여기서 HttpMessageConverter 가 본문을 쓴다)
  → Interceptor(postHandle)
  → (뷰를 쓰면 여기서 ViewResolver 가 렌더링)
  → Interceptor(afterCompletion)
  → Filter 체인
  → 응답
```

## 1. 서블릿과 DispatcherServlet

- 서블릿 컨테이너(Tomcat)가 하는 일, 스레드 모델(요청당 스레드)
- 프론트 컨트롤러 패턴과 `DispatcherServlet`
- HandlerMapping / HandlerAdapter의 역할 분담
- Filter vs Interceptor: 필터는 서블릿 스펙, 스프링 빈을 못 쓰는 경우가 있고 예외 처리 흐름 밖에 있다. 인터셉터는 스프링 영역이라 빈 주입과 핸들러 정보 접근이 자유롭다

## 2. 컨트롤러 작성

- `@Controller` (뷰 반환) vs `@RestController` (본문 반환)
- 매핑: `@GetMapping`, `@PostMapping`, `@PutMapping`, `@PatchMapping`, `@DeleteMapping`
- 파라미터 바인딩
  - `@RequestParam` - 쿼리 스트링
  - `@PathVariable` - 경로 변수
  - `@RequestBody` - JSON 본문
  - `@ModelAttribute` - 폼 데이터, 객체 바인딩
  - `@RequestHeader`, `@CookieValue`
- `ResponseEntity`로 상태 코드·헤더 제어
- 파일 업로드 (`MultipartFile`)

## 3. JSON 직렬화

- Jackson의 동작 - 게터 기준 직렬화, 기본 생성자와 역직렬화
- `@JsonProperty`, `@JsonIgnore`, `@JsonInclude`
- 날짜/시간 포맷 (`@JsonFormat`, `JavaTimeModule`)
- 엔티티를 그대로 응답에 쓰면 안 되는 이유 - 지연 로딩 프록시 직렬화 오류, 스펙 결합
- DTO 분리와 매핑

## 4. 검증과 예외 처리

- Bean Validation: `@Valid` / `@Validated`, `@NotNull`, `@NotBlank`, `@Size`, `@Min`, `@Email`
- 커스텀 Validator와 커스텀 제약 애노테이션
- `@ControllerAdvice` + `@ExceptionHandler`로 전역 예외 처리
- 에러 응답 포맷 통일 (코드, 메시지, 필드 오류 목록)
- `MethodArgumentNotValidException`, `HttpMessageNotReadableException` 같은 프레임워크 예외 잡기

## 5. REST API 설계

- 리소스 중심 URI, HTTP 메서드 의미
- 상태 코드: 200 / 201 / 204 / 400 / 401 / 403 / 404 / 409 / 422 / 500
- 페이징·정렬 파라미터 규약
- CORS 설정 (`@CrossOrigin`, `WebMvcConfigurer`)
- API 문서화: springdoc-openapi(Swagger UI)
- 요청/응답 로깅

## 6. 뷰 템플릿 (필요한 경우만)

- Thymeleaf 기본 문법, 레이아웃
- 프론트를 React로 분리해서 쓴다면 이 절은 건너뛰어도 된다

## 체크리스트

- [ ] 요청부터 응답까지의 경로를 그림으로 그릴 수 있다
- [ ] 필터와 인터셉터 중 무엇을 쓸지 상황별로 판단할 수 있다
- [ ] 전역 예외 처리로 에러 응답 포맷을 통일해봤다
- [ ] 엔티티를 응답으로 내보내면 안 되는 이유를 설명할 수 있다
- [ ] `@Valid` 실패 시 어떤 예외가 나는지 알고 잡아봤다
- [ ] 상태 코드를 상황에 맞게 구분해서 쓴다

## 다음 편

다음은 Spring Boot다. 지금까지 손으로 설정하던 것들이 왜 자동으로 되는지를 본다.
