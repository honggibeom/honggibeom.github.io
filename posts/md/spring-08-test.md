---
title: Spring 공부 (8) 테스트 - 이 코드가 맞다는 걸 어떻게 증명하나
date: 2026-07-19
category: spring
src: cover.svg
tags: [spring, test, junit, mockito, testcontainers, 로드맵]
summary: 단위 테스트, 슬라이스 테스트, 통합 테스트를 어떻게 나누고 무엇을 어디까지 검증할 것인가. Mockito와 Testcontainers까지 실전 순서로 정리했다.
---

> Spring 공부 로드맵 시리즈 8편.

## 테스트를 나누는 기준

Spring에서 테스트가 어려워지는 이유는 대부분 **모든 테스트를 통합 테스트로 만들기 때문**이다. 컨텍스트를 통째로 띄우면 느리고, 느리면 안 돌리게 되고, 안 돌리면 없는 것과 같다.

기준은 단순하다. **스프링이 필요 없는 로직은 스프링 없이 테스트한다.**

| 종류 | 범위 | 속도 | 도구 |
| --- | --- | --- | --- |
| 단위 테스트 | 클래스 하나 | 매우 빠름 | JUnit5, Mockito |
| 슬라이스 테스트 | 웹 계층 또는 JPA 계층만 | 중간 | `@WebMvcTest`, `@DataJpaTest` |
| 통합 테스트 | 전체 컨텍스트 | 느림 | `@SpringBootTest` |

## 1. JUnit 5 기본

- `@Test`, `@BeforeEach`, `@AfterEach`, `@DisplayName`
- `@ParameterizedTest`로 여러 케이스 돌리기
- `@Nested`로 상황별 그룹화
- AssertJ (`assertThat(...).isEqualTo(...)`, `assertThatThrownBy`)
- given / when / then 구조로 쓰기

## 2. Mockito

- `@Mock`, `@InjectMocks`, `@ExtendWith(MockitoExtension.class)`
- `when(...).thenReturn(...)`, `doThrow(...)`
- `verify`로 호출 여부·횟수 검증
- `ArgumentCaptor`로 넘어간 인자 확인
- **과도한 목킹의 위험** — 목이 많아지면 구현 세부사항을 테스트하게 된다

## 3. 슬라이스 테스트

- `@WebMvcTest` + `MockMvc` — 컨트롤러, 바인딩, 검증, 예외 처리 확인
  - 서비스는 `@MockBean`으로 대체
  - Security가 끼어들 때 `@WithMockUser`
- `@DataJpaTest` — 리포지토리와 쿼리 검증, 기본적으로 롤백
  - 임베디드 DB 대신 실제 DB로 돌리려면 `@AutoConfigureTestDatabase(replace = NONE)`
- `@RestClientTest`, `@JsonTest`

## 4. 통합 테스트

- `@SpringBootTest`의 webEnvironment 옵션
- `TestRestTemplate` / `WebTestClient`로 실제 HTTP 호출
- `@Transactional` 테스트의 롤백과, 그로 인해 실제 커밋 동작을 못 보는 함정
- 테스트용 프로파일과 설정 분리

## 5. 테스트 환경 만들기

- H2로 대체할 때의 한계(방언 차이로 실제 DB에서만 터지는 쿼리)
- **Testcontainers**로 실제 MySQL/Redis를 띄워 테스트하기
- 외부 API는 WireMock이나 MockWebServer로 대체
- 테스트 데이터 빌더/픽스처를 만들어 중복 줄이기

## 6. 습관

- 버그를 고치기 전에 **그 버그를 재현하는 테스트**를 먼저 쓴다
- 커버리지 수치보다 "무엇이 깨지면 알아차리는가"를 기준으로 본다
- CI에서 테스트를 자동으로 돌린다 (GitHub Actions)

## 체크리스트

- [ ] 서비스 로직을 스프링 없이 단위 테스트로 검증해봤다
- [ ] `@WebMvcTest` + `MockMvc`로 컨트롤러 검증을 해봤다
- [ ] `@DataJpaTest`로 쿼리 메서드를 검증해봤다
- [ ] Mockito로 예외 상황을 시뮬레이션해봤다
- [ ] Testcontainers로 실제 DB 기반 테스트를 돌려봤다
- [ ] 버그 재현 테스트를 먼저 쓰고 고쳐본 적이 있다

## 다음 편

다음은 Spring Batch와 스케줄링이다.
