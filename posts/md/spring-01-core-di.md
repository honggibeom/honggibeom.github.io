---
title: Spring IoC 컨테이너와 의존성 주입(DI) 정리 - 빈 등록, 스코프, 생명주기, 순환 참조 (Spring 로드맵 1)
date: 2026-04-07
category: spring
src: cover.svg
tags: [spring, di, ioc, bean, 로드맵, 백엔드]
summary: Spring IoC 컨테이너와 의존성 주입 정리. 빈 등록과 주입 방식, 스코프와 생명주기, 순환 참조까지 웹도 JPA도 그 위에 얹혀 있는 Spring Core의 핵심을 짚는다.
---

> Spring 공부 로드맵 시리즈 1편. [0편](/post/spring-00-java)에서 인터페이스와 생성자만으로 의존성을 직접 뒤집어봤다. 이번엔 그 일을 대신해 주는 컨테이너 이야기다.

## 이 단계가 본체다

Spring의 정체는 사실 **객체를 대신 만들어 관리해주는 컨테이너**다. MVC도, Data JPA도, Security도 전부 이 컨테이너 위에 얹힌 모듈이다. 여기를 대충 넘기면 "빈이 왜 두 개지", "왜 null이지" 앞에서 손을 놓게 된다.

## 1. IoC와 컨테이너

- **제어의 역전(IoC)**: 객체 생성과 조립의 권한을 내 코드가 아니라 컨테이너가 갖는다
- `BeanFactory`와 `ApplicationContext`의 관계 — 실제로 쓰는 건 후자
- 컨테이너가 하는 일: 빈 정의 읽기 → 인스턴스 생성 → 의존성 주입 → 초기화 콜백 → 사용 → 소멸
- 빈(Bean)이란 무엇인가 — 그냥 컨테이너가 관리하는 객체

## 2. 빈 등록하는 세 가지 방법

1. **컴포넌트 스캔**: `@Component`와 그 파생인 `@Service`, `@Repository`, `@Controller`
2. **자바 설정**: `@Configuration` 클래스 안의 `@Bean` 메서드 — 외부 라이브러리 객체를 등록할 때 필수
3. **XML**: 레거시 프로젝트를 읽을 때만 필요

`@ComponentScan`의 기본 범위가 어디인지(= `@SpringBootApplication`이 붙은 패키지 하위)를 반드시 알아둬야 한다. 빈을 못 찾는 문제의 절반이 여기서 나온다.

`@Configuration` 클래스가 프록시로 감싸져서 `@Bean` 메서드를 여러 번 호출해도 같은 객체가 나오는 것(`proxyBeanMethods`)도 확인해볼 만하다.

## 3. 의존성 주입 방식

세 가지가 있지만 실무에서 고민할 여지는 거의 없다. 생성자 주입을 기본으로 두고 나머지는 예외로 취급한다.

| 방식 | 권장 | 이유 |
| --- | --- | --- |
| 생성자 주입 | O | 불변성 보장, 필수 의존성 명시, 테스트 쉬움, 순환 참조를 기동 시점에 잡아줌 |
| 세터 주입 | 선택적 의존성에만 | 런타임에 바뀔 수 있는 값 |
| 필드 주입 | X | 테스트에서 갈아끼우기 어렵고 의존성이 숨는다 |

- 생성자가 하나면 `@Autowired`를 생략할 수 있다 → Lombok `@RequiredArgsConstructor`와 조합
- 같은 타입 빈이 여러 개일 때: `@Qualifier`, `@Primary`
- 리스트/맵으로 같은 타입 빈을 전부 주입받는 패턴 (전략 패턴 구현에 유용)
- `@Value`로 설정값 주입, `@ConfigurationProperties`로 묶어서 받기

## 4. 스코프와 생명주기

- **스코프**: singleton(기본), prototype, request, session, application
- 싱글턴 빈에 **상태를 두면 안 되는 이유** — 모든 요청이 같은 인스턴스를 공유한다
- 싱글턴이 프로토타입을 주입받을 때 생기는 문제와 해법 (`ObjectProvider`, `@Lookup`)
- 생명주기 콜백: `@PostConstruct` / `@PreDestroy`, `InitializingBean` / `DisposableBean`
- `@Lazy`가 필요한 경우

## 5. 순환 참조

A가 B를, B가 A를 주입받으면 생성자 주입에서는 기동 자체가 실패한다. 이건 Spring의 결함이 아니라 **설계가 잘못됐다는 신호**다.

- 왜 생기는지 (양방향 의존)
- 푸는 법: 공통 로직을 제3의 빈으로 분리, 이벤트(`ApplicationEventPublisher`)로 뒤집기, 정말 급하면 `@Lazy`
- `spring.main.allow-circular-references=true`는 해결이 아니라 유예다

## 6. 그 밖에

- `ApplicationEventPublisher`와 `@EventListener` — 모듈 간 결합을 낮추는 도구
- `Environment`와 프로파일별 빈 등록 (`@Profile`)
- `@Conditional` 계열 — Boot 자동 설정의 기반이 된다

## 체크리스트

- [ ] 왜 필드 주입을 쓰지 말라고 하는지 설명할 수 있다
- [ ] 같은 타입 빈이 둘일 때 구분하는 방법을 안다
- [ ] 싱글턴 빈에 상태를 두면 왜 위험한지 예시로 설명할 수 있다
- [ ] 순환 참조를 일부러 만들어 에러 메시지를 읽어봤다
- [ ] `@Bean`과 `@Component`를 각각 언제 쓰는지 안다
- [ ] 리스트 주입으로 같은 타입 빈 여러 개를 받아 전략 패턴을 만들어봤다

## 다음 편

다음은 AOP와 프록시다. 컨테이너가 관리하는 빈이 "내가 짠 그 객체가 아닐 수도 있다"는 이야기를 한다.
