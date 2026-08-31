---
title: Spring 공부 (0) 자바와 객체지향 - 프레임워크 이전에 깔아야 할 바닥
date: 2026-03-26
category: spring
src: cover.svg
tags: [spring, java, 객체지향, 로드맵, 백엔드]
summary: Spring이 마법처럼 보이는 이유는 대부분 자바 쪽이 비어 있어서다. 인터페이스 의존, 예외 체계, 프록시 패턴 등 Spring을 이해하는 데 실제로 쓰이는 자바 지식만 골라 정리했다.
---

> Spring 공부 로드맵 시리즈 0편. 전체 목차는 로드맵 글에 있다.

## 왜 자바부터인가

Spring을 쓰다 막히는 지점은 대부분 Spring 문제가 아니다. `@Transactional`이 안 먹는 건 프록시를 몰라서고, 순환 참조를 못 푸는 건 객체 그래프를 안 그려봐서고, 서비스 계층이 비대해지는 건 인터페이스로 나누는 감각이 없어서다.

그래서 0단계에서는 **Spring을 이해하는 데 실제로 동원되는 자바 지식만** 추린다. 자바 전체를 다시 볼 필요는 없다.

## 1. 객체지향 설계 감각

- 클래스와 인터페이스, 상속과 조합 — 상속보다 조합을 먼저 고려하는 이유
- 다형성: 같은 타입으로 다른 구현을 갈아끼운다는 것의 실제 의미
- 인터페이스에 의존한다는 것 — 구현체를 바꿔도 호출부가 안 바뀌는 구조
- SOLID 중 최소한 SRP(단일 책임)와 DIP(의존 역전)
- 패키지 구조로 계층을 나누는 감각 (controller / service / repository / domain)

DI를 배우기 전에, **Spring 없이** 인터페이스와 생성자만으로 의존성을 뒤집는 코드를 한 번 짜보는 게 가장 효율이 좋다. 그러면 나중에 `@Autowired`가 무슨 수고를 대신해주는지가 바로 보인다.

## 2. 예외 체계

- `Error` / `Exception` / `RuntimeException`의 계층
- checked 예외와 unchecked 예외의 차이
- Spring이 unchecked(런타임) 예외를 선호하는 이유 — 트랜잭션 롤백 규칙과도 직결된다
- 커스텀 예외를 만들고 의미 단위로 던지기
- `try-with-resources`

## 3. 제네릭과 컬렉션

- 제네릭 타입 파라미터, 와일드카드(`? extends`, `? super`)의 대략적 감각
- `List` / `Set` / `Map`의 특성과 선택 기준
- `equals`와 `hashCode`를 같이 재정의해야 하는 이유 — JPA 엔티티에서 다시 만난다

## 4. 람다와 Stream

- 함수형 인터페이스 (`Function`, `Supplier`, `Consumer`, `Predicate`)
- Stream의 filter / map / collect / groupingBy
- `Optional`을 쓰는 자리(반환값)와 쓰면 안 되는 자리(필드, 파라미터)

## 5. 애노테이션·리플렉션·프록시

Spring의 정체를 알려면 이 셋은 피할 수 없다.

- 애노테이션은 그 자체로 아무 일도 하지 않는다 — 읽는 쪽이 있어야 동작한다
- 리플렉션으로 클래스 정보를 런타임에 읽고 객체를 만든다는 개념
- **프록시 패턴**: 원본 객체를 감싼 대리 객체가 앞뒤로 뭔가를 끼워 넣는 구조
- 싱글턴 패턴, 팩토리 패턴

프록시 패턴은 직접 손으로 한 번 구현해보는 걸 권한다. AOP와 트랜잭션이 전부 이 위에 서 있다.

## 6. 최신 문법과 빌드

- 자바 8 이후: `var`, `record`, switch expression, text block
- Gradle(또는 Maven)의 의존성 선언, `implementation`과 `runtimeOnly` 같은 스코프 차이
- JDK 버전 선택 (LTS 기준)

## 체크리스트

- [ ] Spring 없이 인터페이스 + 생성자로 의존성을 주입하는 코드를 짜봤다
- [ ] checked / unchecked 예외를 구분해서 설명할 수 있다
- [ ] `equals`/`hashCode`를 왜 같이 재정의해야 하는지 안다
- [ ] Stream으로 필터·매핑·그룹핑을 막힘 없이 쓴다
- [ ] 프록시 패턴을 직접 구현해봤다
- [ ] `build.gradle`의 각 줄이 무슨 뜻인지 설명할 수 있다

## 다음 편

다음은 Spring Core: IoC 컨테이너와 의존성 주입이다. 여기서 만든 "직접 주입하는 코드"를 컨테이너가 어떻게 대신 해주는지 본다.
