---
title: Spring Data JPA 정리 - 영속성 컨텍스트, 연관관계, N+1, 페치 조인, QueryDSL (Spring 로드맵 5)
date: 2026-06-05
category: spring
src: cover.svg
tags: [spring, jpa, hibernate, orm, querydsl, 로드맵]
summary: Spring Data JPA 정리. 영속성 컨텍스트, 연관관계 매핑, N+1 문제, 페치 조인, QueryDSL까지 로드맵에서 시간을 가장 많이 잡아먹는 구간을 순서대로 짚는다.
---

> Spring 공부 로드맵 시리즈 5편. [4편](/post/spring-04-boot)까지로 요청을 받아 응답하는 껍데기는 갖췄다. 이번엔 그 아래 데이터 계층으로 내려간다. 로드맵에서 시간을 가장 많이 잡아먹는 구간이다.

## 여기서 절반이 갈린다

JPA는 "SQL을 안 써도 되는 도구"가 아니라 객체 그래프와 관계형 테이블 사이의 간극을 관리하는 도구다. 이 전제를 놓치면 반드시 N+1과 지연 로딩 예외에 발목이 잡힌다. 그러니 Repository 메서드 이름 규칙보다 영속성 컨텍스트를 먼저 이해해야 한다.

## 1. 그 전에 - JDBC와 SQL

- JDBC의 흐름(Connection → Statement → ResultSet)을 한 번은 손으로
- 커넥션 풀(HikariCP)이 왜 필요한가
- SQL: 조인, 서브쿼리, 그룹핑, 인덱스가 타는 조건
- 스키마와 제약조건(PK, FK, 유니크)
- 필요하다면 JdbcTemplate이나 MyBatis도 눈에 익혀두기 - 복잡한 통계 쿼리는 결국 여기로 온다

## 2. JPA 기본

- ORM이 해결하려는 문제 (패러다임 불일치)
- 엔티티 매핑: `@Entity`, `@Table`, `@Id`, `@GeneratedValue` 전략(IDENTITY / SEQUENCE)
- 필드 매핑: `@Column`, `@Enumerated(EnumType.STRING)`, `@Lob`, `@Embedded`
- 기본 키 선택 (자연키 vs 대리키)

## 3. 영속성 컨텍스트 - 반드시 붙잡을 것

- 1차 캐시, 동일성 보장
- 쓰기 지연과 flush 시점
- 더티 체킹 - 왜 `save()`를 안 불러도 update가 나가는가
- 엔티티 생명주기: 비영속 / 영속 / 준영속 / 삭제
- `EntityManager`와 `persist`, `merge`, `detach`, `clear`
- OSIV(Open Session In View)의 동작과 켜고 끌 때의 트레이드오프

## 4. 연관관계 매핑

- 방향(단방향/양방향)과 다중성(`@ManyToOne`, `@OneToMany`, `@OneToOne`, `@ManyToMany`)
- 연관관계의 주인 개념 - `mappedBy`가 붙는 쪽이 주인이 아니다
- `@ManyToMany`는 실무에서 쓰지 않고 중간 엔티티로 푼다
- 지연 로딩(LAZY)을 기본으로 두는 이유, `@ManyToOne`의 기본값이 EAGER라는 함정
- 영속성 전이(cascade)와 고아 객체 제거
- 상속 매핑 전략(SINGLE_TABLE / JOINED)

## 5. Spring Data JPA

- `JpaRepository` 계층 구조와 기본 제공 메서드
- 쿼리 메서드 이름 규칙 (`findByNameAndStatus`)
- `@Query`로 JPQL 직접 쓰기, 네이티브 쿼리
- 페이징과 정렬 (`Pageable`, `Slice`, `Page`)
- `@Modifying` 벌크 연산과 영속성 컨텍스트 불일치 문제
- Auditing (`@CreatedDate`, `@LastModifiedDate`)

## 6. N+1 문제 - 반드시 직접 겪어볼 것

N+1은 목록 하나를 조회했을 뿐인데 연관 엔티티를 채우느라 조회 쿼리가 N번 더 나가는 현상이다. 해결 수단은 상황마다 다르다.

- 페치 조인 (`join fetch`) - 가장 기본
- `@EntityGraph`
- 배치 사이즈 (`hibernate.default_batch_fetch_size`)
- DTO로 직접 조회(프로젝션)해서 아예 엔티티를 안 가져오기
- 컬렉션 페치 조인과 페이징을 같이 쓸 때의 함정 - 전부 읽어서 메모리에서 자른다(`HHH000104`). ToOne 페치 조인은 페이징과 같이 써도 된다. 해법은 `default_batch_fetch_size`, 또는 ToOne만 페치 조인하고 컬렉션은 배치 사이즈로

SQL 로그를 켜놓고 개발하는 습관이 이 단계의 핵심이다. `show_sql`, `p6spy` 같은 도구로 실제 나가는 쿼리를 항상 본다.

## 7. QueryDSL

- 문자열 JPQL의 한계(컴파일 타임에 오류를 못 잡음)
- Q 클래스 생성 설정
- 동적 조건 조립 (`BooleanBuilder`, `BooleanExpression`)
- DTO 프로젝션 (`Projections.constructor`, `@QueryProjection`)
- 복잡한 검색 조건이 있는 화면에서 진가가 나온다

## 8. 성능과 실무 감각

- 엔티티에서 `@Setter`를 열지 않고 의미 있는 메서드로 상태를 바꾸기
- `equals`/`hashCode`와 엔티티 식별자
- DDL 자동 생성(`ddl-auto`)은 로컬에서만, 운영은 마이그레이션 도구(Flyway/Liquibase)
- 읽기 전용 트랜잭션과 조회 최적화

## 체크리스트

- [ ] 더티 체킹으로 update가 나가는 걸 로그로 확인했다
- [ ] 연관관계의 주인을 잘못 잡아서 데이터가 안 들어가는 상황을 겪어봤다
- [ ] N+1을 재현하고 페치 조인으로 해결해봤다
- [ ] 컬렉션 페치 조인 + 페이징의 문제를 ToOne 페치 조인과 구분해서 설명할 수 있다
- [ ] DTO 프로젝션으로 조회를 최적화해봤다
- [ ] QueryDSL로 동적 검색 조건을 만들어봤다
- [ ] 운영에서 `ddl-auto=update`를 쓰면 안 되는 이유를 안다

## 다음 편

다음은 트랜잭션이다. JPA와 붙어 있는 주제라 이어서 보는 게 좋다.
