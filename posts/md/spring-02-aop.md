---
title: Spring AOP와 프록시 정리 - 내가 안 짠 코드가 왜 끼어드나 (Spring 로드맵 2)
date: 2026-04-20
category: spring
src: cover.svg
tags: [spring, aop, proxy, 로드맵, 백엔드]
summary: Spring AOP와 프록시 정리. 트랜잭션, 보안, 캐시가 전부 AOP 위에 서 있다. 프록시 기반이라는 사실 하나만 제대로 알아도 Spring에서 겪는 이상 현상의 절반이 설명된다.
---

> Spring 공부 로드맵 시리즈 2편. [1편](/post/spring-01-core-di)에서 컨테이너가 빈을 만들어 넣어준다는 걸 봤다. 이번엔 그 빈이 사실 내가 짠 객체가 아닐 수도 있다는 이야기다.

## 왜 따로 한 편을 쓰나

AOP는 "로깅 편하게 하는 기능" 정도로 배우고 넘어가기 쉽다. 그런데 Spring에서 자주 겪는 미스터리 - `@Transactional`이 안 먹는다, `@Cacheable`이 무시된다, 스택 트레이스에 낯선 클래스명이 나온다 - 는 전부 여기서 설명된다.

## 1. 횡단 관심사

- 로깅, 트랜잭션, 보안, 캐시, 성능 측정처럼 여러 계층에 흩어지는 공통 관심사
- 이걸 비즈니스 코드에서 떼어내는 게 AOP의 목적
- 용어 정리: Aspect(관점), JoinPoint(끼어들 수 있는 지점), Pointcut(어디에), Advice(무엇을), Weaving(엮기)

## 2. Advice 종류

- `@Before`, `@AfterReturning`, `@AfterThrowing`, `@After`
- `@Around` - 가장 강력하다. `ProceedingJoinPoint.proceed()`로 원본 호출을 감싼다
- 실행 순서와 `@Order`

## 3. 포인트컷 표현식

- `execution(...)` 표현식 읽는 법 - 접근제어자, 반환타입, 패키지, 클래스, 메서드, 파라미터
- `@annotation(...)`으로 특정 애노테이션이 붙은 메서드만 잡기
- `within(...)`, `bean(...)`
- 커스텀 애노테이션을 만들고 그것만 잡는 방식이 실무에서 가장 깔끔하다

## 4. 프록시 - 여기가 핵심

Spring AOP는 런타임 프록시 기반이다. AspectJ처럼 바이트코드를 짜넣는 게 아니라, 컨테이너가 원본 빈 대신 감싼 객체를 등록한다.

- JDK 동적 프록시: 인터페이스가 있을 때, 인터페이스 기반으로 생성
- CGLIB 프록시: 클래스를 상속해서 생성 (Spring Boot의 기본값)
- CGLIB의 제약: `final` 클래스/메서드, `private`·`static` 메서드에는 못 건다 (기본 생성자가 필요하던 제약은 Spring 4.0의 Objenesis 도입으로 사라졌다)

이 구조에서 나오는 대표적 함정 두 가지:

self-invocation (자기 호출)

```java
@Service
public class OrderService {
    public void outer() {
        inner();
    }

    @Transactional
    public void inner() {
    }
}
```

`outer()`를 호출하면 `inner()`의 트랜잭션은 걸리지 않는다. 프록시를 거치지 않고 `this.inner()`가 호출되기 때문이다. 해법은 클래스를 분리하거나, 자기 자신을 주입받거나, `AopContext`를 쓰는 것.

private / final 메서드

프록시가 오버라이드할 수 없으므로 AOP가 적용되지 않는다.

## 5. 직접 만들어보기

- 실행 시간 측정 Aspect
- 커스텀 애노테이션 + `@Around` 조합으로 API 호출 로그 남기기
- Spring이 제공하는 AOP 기반 기능들 확인: `@Transactional`, `@Cacheable`, `@Async`, `@PreAuthorize`

## 체크리스트

- [ ] Aspect / Pointcut / Advice를 각각 설명할 수 있다
- [ ] `@Around`로 실행 시간 측정 Aspect를 직접 만들어봤다
- [ ] JDK 프록시와 CGLIB 프록시의 차이를 안다
- [ ] self-invocation 문제를 재현하고 원인을 설명할 수 있다
- [ ] `@Transactional`, `@Async`, `@Cacheable`이 전부 프록시로 동작한다는 걸 안다

## 다음 편

다음은 Spring MVC다. 요청 하나가 들어와 응답이 나갈 때까지의 경로를 따라간다.
