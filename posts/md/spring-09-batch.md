---
title: Spring Batch와 스케줄링 정리 - Job/Step/Chunk, 재시작, 멱등성, 분산 중복 실행 (Spring 로드맵 9)
date: 2026-07-31
category: spring
src: cover.svg
tags: [spring-batch, 스케줄링, 배치, 로드맵, 백엔드]
summary: Spring Batch와 스케줄링 정리. 수십만 건 처리에 for문은 부족하다. Job/Step/Chunk 구조, 재시작과 멱등성, @Scheduled와 분산 환경의 중복 실행 문제까지 정리했다.
---

> Spring 공부 로드맵 시리즈 9편. 여기까지는 전부 요청 하나를 짧게 처리하는 세계였다. 이번엔 수십만 건을 밤새 돌리고, 중간에 끊기면 그 지점부터 다시 여는 세계다.

## 왜 배치를 따로 배우나

"매일 새벽 3시에 전 종목 시세를 수집해서 지표를 계산한다" 같은 작업은 웹 요청과 성격이 완전히 다르다. 건수가 많고, 오래 걸리고, 중간에 실패할 수 있고, **실패한 지점부터 다시 돌릴 수 있어야** 한다. 단순 반복문으로 짜면 메모리로 죽거나, 중간에 끊겼을 때 처음부터 다시 돌려야 한다.

## 1. 먼저 - 스케줄링

배치 프레임워크까지 필요 없는 작업도 많다. 가벼운 것부터 본다.

- `@EnableScheduling`과 `@Scheduled`
  - `fixedRate` / `fixedDelay` / `cron`
  - cron 표현식 읽고 쓰기
- 기본 스케줄러가 **단일 스레드**라는 점 — 작업이 밀리는 이유
- `TaskScheduler` 풀 설정
- **분산 환경의 중복 실행 문제**: 서버 2대면 같은 스케줄이 두 번 돈다
  - DB 락 / Redis 락 / ShedLock 같은 해법
- 실패 시 재시도와 알림

## 2. Spring Batch의 구조

- Job — Step — Chunk의 계층
- **청크 지향 처리**: ItemReader → ItemProcessor → ItemWriter를 N건 단위로 읽고 처리하고 쓰고 커밋
- Tasklet 방식 (단순 단발 작업)
- `JobLauncher`, `JobRepository`(메타데이터 테이블), `JobInstance` / `JobExecution` / `StepExecution`
- JobParameters로 실행을 구분한다 — 같은 파라미터로는 다시 실행되지 않는 이유

## 3. Reader / Processor / Writer

- Reader: `JdbcCursorItemReader`, `JdbcPagingItemReader`, `JpaPagingItemReader`, `FlatFileItemReader`(CSV)
- **커서 vs 페이징** — 대량 데이터에서의 메모리와 커넥션 트레이드오프
- Processor: 필터링(null 반환 시 skip), 변환
- Writer: `JdbcBatchItemWriter`, `JpaItemWriter`, 파일 출력
- 청크 사이즈 결정 감각

## 4. 실패를 다루는 법

앞의 셋은 배치를 "돌리는" 이야기였다. 배치의 진짜 주제는 실패를 다루는 여기다.

- Skip / Retry 정책 (`faultTolerant()`, `skipLimit`, `retryLimit`)
- 재시작(restart)과 `allowStartIfComplete`
- **멱등성**: 같은 배치를 두 번 돌려도 결과가 같아야 한다
- 리스너: `JobExecutionListener`, `StepExecutionListener`, `ItemReadListener`
- 실패 알림(슬랙/메일)과 로그 설계

## 5. 성능

- 멀티 스레드 Step
- 파티셔닝(Partitioning)으로 범위를 나눠 병렬 처리
- 병렬 Step, 원격 청킹
- JPA 대신 JDBC 배치 쓰기(대량 insert에서 차이가 크다)
- 벌크 연산과 영속성 컨텍스트 clear

## 6. 운영

- 배치 전용 애플리케이션으로 분리할지, 웹과 한 프로세스로 둘지
- 실행 방식: 스케줄러, 크론, Jenkins, 쿠버네티스 CronJob
- 메타데이터 테이블 관리와 정리
- 배치 실행 이력 조회 화면 필요성

## 체크리스트

- [ ] `@Scheduled`로 cron 작업을 만들어봤다
- [ ] 서버가 두 대일 때 스케줄이 중복 실행되는 문제와 해법을 안다
- [ ] Job / Step / Chunk 구조를 설명할 수 있다
- [ ] 청크 지향 처리가 왜 메모리에 유리한지 안다
- [ ] 배치를 중간에 실패시키고 재시작해봤다
- [ ] 멱등성을 고려해 배치를 설계해봤다
- [ ] 커서 리더와 페이징 리더의 차이를 안다

## 다음 편

마지막은 운영과 성능이다.
