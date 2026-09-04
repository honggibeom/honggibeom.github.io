---
title: Spring Boot 자동 설정 원리 - 설정을 안 했는데 왜 동작하나 (Spring 로드맵 4)
date: 2026-05-20
category: spring
src: cover.svg
tags: [spring-boot, 자동설정, 프로파일, 로드맵, 백엔드]
summary: Spring Boot 자동 설정 원리 정리. Boot는 새 프레임워크가 아니라 Spring을 자동으로 조립해 주는 껍데기다. 자동 설정 동작 방식, 설정 파일과 프로파일 관리, 자동 설정을 되돌리는 방법.
---

> Spring 공부 로드맵 시리즈 4편. 1~[3편](/post/spring-03-mvc)에서 빈 등록과 MVC 설정을 손으로 짚었다. 이번엔 그 손작업이 왜 대부분 사라졌는지, 그리고 필요할 때 어떻게 되돌리는지를 본다.

## Boot는 무엇을 대신해주는가

Spring Boot는 별개의 프레임워크가 아니다. **의존성 묶음 + 자동 설정 + 내장 서버**를 얹어서, 원래는 손으로 하던 조립을 대신해주는 층이다. 그래서 Core와 MVC를 먼저 본 다음에 Boot를 보면 "아, 이걸 안 써도 되게 해준 거구나"가 명확해진다.

## 1. 자동 설정의 원리

- `@SpringBootApplication` = `@SpringBootConfiguration` + `@EnableAutoConfiguration` + `@ComponentScan`
- `META-INF/spring/...AutoConfiguration.imports`로 후보 설정 클래스를 읽는다 (2.7 이전에는 `spring.factories`였고, 자동 설정 용도로는 3.0에서 제거됐다)
- `@Conditional` 계열이 "적용할지 말지"를 결정한다
  - `@ConditionalOnClass` — 클래스패스에 그 라이브러리가 있으면
  - `@ConditionalOnMissingBean` — 내가 직접 등록한 빈이 없으면
  - `@ConditionalOnProperty` — 설정값이 특정 값이면
- **내가 빈을 직접 등록하면 자동 설정이 물러난다**는 규칙이 핵심이다
- 무엇이 적용됐는지 확인하는 법: `--debug` 실행 시 나오는 Condition Evaluation Report

## 2. 스타터와 의존성

- `spring-boot-starter-web`, `-data-jpa`, `-security`, `-validation`, `-test`
- 스타터가 버전을 맞춰주는 방식 (BOM, `spring-boot-dependencies`)
- 필요 없는 자동 설정 제외: `@SpringBootApplication(exclude = ...)`

## 3. 설정 파일과 외부화

- `application.yml` / `application.properties`
- 설정 우선순위: 명령행 인자 > 환경 변수 > 프로파일별 파일 > 기본 파일
- `@Value` vs `@ConfigurationProperties` — 묶음 설정은 후자가 낫다
- 타입 안전 설정 + 검증 (`@Validated`)
- **민감 정보 관리** — API 키를 yml에 그대로 커밋하지 않기, 환경 변수/시크릿 사용

## 4. 프로파일

- `@Profile`로 환경별 빈 분리
- `application-local.yml`, `application-prod.yml`
- 활성화: `spring.profiles.active`
- 로컬은 H2, 운영은 MySQL 같은 구성 분리

## 5. 내장 서버와 실행

- 내장 Tomcat(또는 Undertow, Jetty) — WAR 배포와의 차이
- 실행 가능한 JAR의 구조와 `java -jar`
- 포트, 컨텍스트 패스, 커넥션·스레드 풀 설정
- 애플리케이션 기동 훅: `ApplicationRunner`, `CommandLineRunner`

## 6. 로깅

- Logback 기본 구성, 로그 레벨을 패키지별로 조정하기
- 운영에서의 파일 롤링
- `System.out.println` 대신 SLF4J를 쓰는 이유

## 7. 개발 편의

- DevTools (자동 재시작)
- Actuator 맛보기 — `/actuator/health`, `/actuator/env` (자세한 건 운영 편에서)
- Lombok과 그 한계 (과용하지 않기)

## 체크리스트

- [ ] `@SpringBootApplication`이 어떤 애노테이션들의 합인지 말할 수 있다
- [ ] 자동 설정이 물러나는 조건(`@ConditionalOnMissingBean`)을 설명할 수 있다
- [ ] `--debug`로 어떤 자동 설정이 적용됐는지 확인해봤다
- [ ] 프로파일로 로컬/운영 DB 설정을 분리해봤다
- [ ] `@ConfigurationProperties`로 설정 묶음을 타입 안전하게 받아봤다
- [ ] 실행 가능한 JAR로 빌드해서 `java -jar`로 띄워봤다

## 다음 편

다음은 데이터 계층, Spring Data JPA다. 시간을 가장 많이 쓰게 될 구간이다.
