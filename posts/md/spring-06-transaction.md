---
title: Spring 공부 (6) 트랜잭션 - 언제 커밋되고 언제 롤백되나
date: 2026-06-21
category: spring
src: cover.svg
tags: [spring, transaction, jpa, 로드맵, 백엔드]
summary: "@Transactional 한 줄 뒤에 숨은 것들. 전파 속성, 격리 수준, 롤백 규칙, 그리고 애노테이션을 붙였는데도 트랜잭션이 안 걸리는 대표적인 경우를 정리했다."
---

> Spring 공부 로드맵 시리즈 6편.

## 애노테이션 하나의 무게

`@Transactional`은 붙이기는 쉬운데 **정확히 어디서 시작해 어디서 끝나는지**를 모르면 데이터 정합성이 조용히 깨진다. 게다가 이건 AOP 프록시로 동작하므로, 2편에서 본 프록시 이야기가 그대로 다시 나온다.

## 1. 기본 개념

- ACID와 트랜잭션의 경계
- 선언적 트랜잭션(`@Transactional`) vs 프로그래밍 방식(`TransactionTemplate`)
- 트랜잭션은 보통 **서비스 계층**에 건다 — 왜 컨트롤러나 리포지토리가 아닌지
- `PlatformTransactionManager`, JPA에서는 `JpaTransactionManager`

## 2. 전파 속성 (propagation)

이미 트랜잭션이 진행 중일 때 새 트랜잭션 메서드를 만나면 어떻게 할 것인가.

| 속성 | 동작 |
| --- | --- |
| REQUIRED (기본) | 있으면 참여, 없으면 새로 시작 |
| REQUIRES_NEW | 항상 새 트랜잭션, 기존 것은 잠시 보류 |
| SUPPORTS | 있으면 참여, 없으면 트랜잭션 없이 |
| NOT_SUPPORTED | 트랜잭션 없이 실행 |
| MANDATORY | 없으면 예외 |
| NEVER | 있으면 예외 |
| NESTED | 세이브포인트 기반 중첩 |

- 로그 기록처럼 **본 작업이 롤백돼도 남겨야 하는 것**에 REQUIRES_NEW를 쓴다
- 내부 트랜잭션에서 예외가 나면 외부까지 rollback-only로 마킹되는 현상 (`UnexpectedRollbackException`)

## 3. 격리 수준 (isolation)

- READ_UNCOMMITTED / READ_COMMITTED / REPEATABLE_READ / SERIALIZABLE
- 각 수준에서 막히는 현상: dirty read, non-repeatable read, phantom read
- DB 기본값(MySQL은 REPEATABLE_READ)과 애플리케이션 설정의 관계
- 낙관적 락(`@Version`)과 비관적 락(`@Lock`)의 선택 기준

## 4. 롤백 규칙 - 자주 틀리는 부분

- 기본적으로 **unchecked(RuntimeException)와 Error만 롤백**된다
- checked 예외는 기본적으로 롤백되지 않는다 → `rollbackFor` 지정 필요
- 예외를 `try-catch`로 삼켜버리면 롤백은 일어나지 않는다
- `readOnly = true`의 의미와 이점(플러시 생략, 성능)

## 5. 트랜잭션이 안 걸리는 경우

- **self-invocation**: 같은 클래스 내부 호출은 프록시를 거치지 않는다
- `private` / `final` 메서드에 붙인 경우
- 빈이 아닌 객체에서 호출한 경우
- 트랜잭션 매니저가 여러 개인데 지정하지 않은 경우
- 비동기(`@Async`)와 섞였을 때 스레드가 달라지면서 컨텍스트가 넘어가지 않는 경우

## 6. 실무 감각

- 트랜잭션 범위는 **짧게**. 외부 API 호출을 트랜잭션 안에 넣지 않기
- 커넥션 풀 고갈과 긴 트랜잭션의 관계
- 이벤트 기반 후처리: `@TransactionalEventListener(phase = AFTER_COMMIT)`
- 배치성 작업에서의 청크 단위 커밋

## 체크리스트

- [ ] 전파 속성 REQUIRED와 REQUIRES_NEW의 차이를 예시로 설명할 수 있다
- [ ] checked 예외가 기본적으로 롤백되지 않는다는 걸 실험으로 확인했다
- [ ] self-invocation으로 트랜잭션이 안 걸리는 상황을 재현해봤다
- [ ] `readOnly = true`가 무엇을 바꾸는지 안다
- [ ] 낙관적 락과 비관적 락 중 무엇을 쓸지 판단할 수 있다
- [ ] 트랜잭션 안에서 외부 API를 호출하면 안 되는 이유를 안다

## 다음 편

다음은 Spring Security다.
