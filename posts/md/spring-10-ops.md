---
title: Spring Boot 운영과 성능 - 모니터링, 로깅, 캐시, 커넥션 풀, JVM, 배포 (Spring 로드맵 10)
date: 2026-08-17
category: spring
src: cover.svg
tags: [spring-boot, actuator, 성능, 캐시, 배포, 로드맵]
summary: Spring Boot 운영과 성능 정리. Actuator 모니터링과 로깅, 캐시와 비동기, 커넥션 풀과 JVM 설정, 배포까지 기능을 다 만든 뒤 실제로 손대게 되는 것들.
---

> Spring 공부 로드맵 시리즈 10편(마지막). [0편](/post/spring-00-java)부터 [9편](/post/spring-09-batch)까지가 "만드는 법"이었다면 이번은 "굴리는 법"이다. 끝이 있는 단계가 아니라 계속 쌓아가는 영역이다.

## 만드는 것과 굴리는 것

여기까지 오면 기능은 만들 수 있다. 그다음 질문은 다르다. 사용자가 늘면 어디가 먼저 터지는가, 느려졌을 때 무엇부터 확인하는가, 장애가 났을 때 원인을 어떻게 찾는가. 이 단계는 한 번에 끝나지 않고 계속 쌓아가는 영역이다.

## 1. 관측 - 보이지 않으면 고칠 수 없다

- **Actuator**: `/actuator/health`, `/actuator/metrics`, `/actuator/info`, `/actuator/env`, `/actuator/loggers`
  - 운영에서 어떤 엔드포인트를 열고 닫을지, 보안 설정
- Micrometer와 메트릭 수집 → Prometheus + Grafana
- 로깅
  - 레벨 설계(ERROR/WARN/INFO/DEBUG)와 무엇을 남길지
  - 구조적 로깅(JSON)과 로그 수집
  - **요청 추적**: MDC에 traceId를 넣어 요청 단위로 로그 묶기
- 분산 추적 개념 (Micrometer Tracing / Zipkin)

## 2. 성능 병목 찾기

느릴 때 보는 순서가 대체로 정해져 있다.

1. **쿼리** — 슬로우 쿼리 로그, 실행 계획, 인덱스 유무, N+1
2. **커넥션 풀** — HikariCP 풀 사이즈, 대기 시간, 누수
3. **외부 API 호출** — 타임아웃 설정 여부, 직렬 호출
4. **JVM** — 힙 사용량, GC 로그, 메모리 누수
5. **스레드 풀** — 톰캣 max-threads, 요청 대기 큐

- 부하 테스트 도구(k6, JMeter)로 수치를 만들어놓고 개선하기
- 프로파일링: JFR, VisualVM

## 3. 캐시

- `@EnableCaching`, `@Cacheable`, `@CacheEvict`, `@CachePut`
- 로컬 캐시(Caffeine) vs 분산 캐시(Redis)
- TTL 설계와 캐시 무효화 — 어려운 건 무효화 쪽이다
- 캐시 스탬피드, 캐시 워밍
- 외부 API 호출 제한이 있는 서비스라면 캐시가 곧 기능이다

## 4. 비동기와 동시성

- `@Async`와 스레드 풀 직접 설정 (기본 설정 그대로 쓰지 않기)
- `CompletableFuture`
- 이벤트 기반 처리와 `@TransactionalEventListener`
- 메시지 큐 도입 시점 (Kafka / RabbitMQ) — 강한 결합을 끊고 처리량을 흡수
- 동시성 이슈: 재고 차감 같은 경합, 락 전략(DB 락, 낙관적 락, Redis 분산 락)

## 5. 외부 연동

- `RestTemplate`, `WebClient`, Spring 6의 `RestClient` / HTTP Interface
- **타임아웃은 반드시 설정한다** — 안 걸면 스레드가 물린다
- 재시도(Resilience4j Retry), 서킷 브레이커
- Rate limit이 있는 API를 다룰 때의 큐잉·백오프 전략

## 6. 배포와 인프라

- 프로파일별 설정, 환경 변수·시크릿 관리
- Docker 이미지 만들기, 멀티 스테이지 빌드
- CI/CD (GitHub Actions로 빌드·테스트·배포)
- 무중단 배포 개념(롤링, 블루/그린), 헬스체크와 그레이스풀 셧다운
- DB 마이그레이션(Flyway/Liquibase)을 배포 파이프라인에 넣기
- 리버스 프록시(Nginx), HTTPS

## 7. 코드 품질

- 계층 간 의존 방향 지키기, 도메인에 로직 모으기
- DTO / 엔티티 / 도메인 분리
- 예외 설계와 에러 코드 체계
- 정적 분석과 포매터

## 체크리스트

- [ ] Actuator로 헬스체크와 메트릭을 노출해봤다
- [ ] MDC로 요청별 traceId를 로그에 남겨봤다
- [ ] 슬로우 쿼리를 찾아 인덱스로 개선해본 적이 있다
- [ ] HikariCP 풀 사이즈가 무엇에 영향을 주는지 안다
- [ ] `@Cacheable`로 외부 API 호출을 줄여봤다
- [ ] `@Async` 스레드 풀을 직접 설정해봤다
- [ ] 외부 API 호출에 타임아웃과 재시도를 걸어봤다
- [ ] Docker 이미지로 빌드해 배포해봤다

## 시리즈를 마치며

0편부터 10편까지 열한 편을 관통하는 이야기는 하나다. **Spring은 마법이 아니라 컨테이너와 프록시로 이루어진 구조물이다.** 어떤 애노테이션이 동작하지 않을 때 "왜 안 되지"에서 멈추지 않고 "누가 이걸 읽어서 무엇을 감싸고 있나"까지 내려갈 수 있으면, 나머지는 문서를 찾아 읽는 문제로 바뀐다.
