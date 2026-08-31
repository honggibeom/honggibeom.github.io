---
title: 오라클 DB 학습 노트 (8) - 인덱스, 실행계획, 그리고 튜닝
date: 2025-10-27
category: oracle
src: cover.svg
tags: [oracle, 인덱스, 실행계획, 튜닝, 학습노트]
summary: B*Tree 인덱스가 동작하는 방식부터 실행계획 읽는 법, 조인 방식 세 가지, 통계정보와 힌트, 그리고 인덱스를 죽이는 안티패턴까지. 시리즈 마지막 편.
---

마지막 편은 "느린 쿼리를 어떻게 할 것인가"다. 앞의 일곱 편이 문법이었다면 이 편은 판단이다.

## 인덱스는 왜 빠른가

1편에서 본 것처럼 오라클의 I/O 단위는 **블록**이다. 100만 건 테이블에서 한 건을 찾을 때, 인덱스가 없으면 모든 블록을 읽어야 한다. 인덱스가 있으면 몇 개 블록만 읽고 끝난다.

오라클의 기본 인덱스는 **B\*Tree**다. 구조는 이렇다.

```
                   [ 루트 블록 ]
                  /      |      \
        [브랜치]     [브랜치]     [브랜치]
        /    \        /   \        /    \
    [리프] [리프] [리프] [리프] [리프] [리프]
      │
      └─ (키 값, ROWID) 쌍이 정렬된 상태로 저장
         리프끼리는 양방향 링크로 연결
```

- 어떤 값을 찾든 **루트에서 리프까지 깊이가 같다.** 그래서 검색 비용이 균일하다.
- 리프에는 (키 값, ROWID)가 **정렬된 순서로** 들어있다. 그래서 범위 검색과 정렬에 강하다.
- **NULL은 인덱스에 저장되지 않는다.** (단일 컬럼 인덱스 기준) 그래서 `WHERE col IS NULL`은 인덱스를 못 탄다.

깊이는 보통 3~4단계다. 즉 100만 건이든 1억 건이든 인덱스 조회는 블록 몇 개 읽는 정도로 끝난다.

## 스캔 방식

실행계획에 나오는 이름들이다. 무엇을 뜻하는지 알아야 계획을 읽을 수 있다.

| 방식 | 설명 |
| --- | --- |
| `TABLE ACCESS FULL` | 테이블 전체 스캔 |
| `INDEX UNIQUE SCAN` | 유일 인덱스에서 한 건 |
| `INDEX RANGE SCAN` | 인덱스에서 범위 검색 (가장 흔하다) |
| `INDEX FULL SCAN` | 인덱스 전체를 순서대로 |
| `INDEX FAST FULL SCAN` | 인덱스 전체를 순서 무시하고 병렬로 |
| `INDEX SKIP SCAN` | 복합 인덱스 선두 컬럼을 건너뛰고 |
| `TABLE ACCESS BY INDEX ROWID` | 인덱스로 찾은 ROWID로 테이블 접근 |

### 풀 스캔이 항상 나쁜 건 아니다

인덱스로 찾은 뒤 테이블에 접근하는 것(`TABLE ACCESS BY INDEX ROWID`)은 **행마다 한 번씩** 일어난다. 반면 풀 스캔은 여러 블록을 한 번에 읽는다(multiblock read).

그래서 **전체의 상당 비율을 읽어야 한다면 풀 스캔이 더 빠르다.** 경험적으로 5~20% 정도가 분기점인데, 실제로는 데이터 분포와 클러스터링 팩터에 달려 있다.

"풀 스캔이 보이면 인덱스를 만든다"는 반사적인 대응은 자주 틀린다. 몇 건을 읽으려는 쿼리인지부터 본다.

### 커버링 인덱스

필요한 컬럼이 전부 인덱스에 있으면 테이블에 갈 필요가 없다. 실행계획에서 `TABLE ACCESS BY INDEX ROWID`가 사라진다.

```sql
CREATE INDEX ix_emp_dept_sal ON employees (department_id, salary);

-- 이 쿼리는 인덱스만 읽고 끝난다
SELECT department_id, salary FROM employees WHERE department_id = 20;
```

자주 도는 쿼리라면 `SELECT` 목록의 컬럼까지 인덱스에 포함시키는 걸 고려할 만하다.

## 복합 인덱스와 컬럼 순서

복합 인덱스에서 **컬럼 순서가 전부**다.

```sql
CREATE INDEX ix_ord ON orders (employee_id, order_date);
```

이 인덱스가 잘 동작하는 조건.

```sql
WHERE employee_id = 106                              -- 선두 컬럼만: OK
WHERE employee_id = 106 AND order_date >= DATE '2026-07-01'  -- 둘 다: 최적
WHERE order_date >= DATE '2026-07-01'                -- 선두 없음: 못 탄다 (또는 SKIP SCAN)
```

전화번호부가 (성, 이름) 순으로 정렬돼 있으면 성으로는 빨리 찾지만 이름만으로는 못 찾는 것과 같다.

순서 정하는 기준.

1. **`=` 조건으로 쓰이는 컬럼을 앞에**, 범위(`>`, `BETWEEN`, `LIKE`) 조건은 뒤에 둔다. 범위 조건이 앞에 오면 그 뒤 컬럼은 필터링에 못 쓰인다.
2. 여러 쿼리에서 **공통으로 쓰이는 컬럼**을 앞에 둔다.
3. 선택도(카디널리티)가 높은 컬럼을 앞에 두는 게 유리한 경우가 많지만, 1번이 우선이다.

`ORDER BY`도 인덱스 순서와 맞으면 정렬 작업 자체가 사라진다.

```sql
-- ix_ord (employee_id, order_date) 를 그대로 활용, SORT 단계 없음
SELECT * FROM orders WHERE employee_id = 106 ORDER BY order_date;
```

## 인덱스를 죽이는 안티패턴

실무에서 만나는 느린 쿼리의 상당수가 여기 있다.

### 1) 인덱스 컬럼에 함수·연산 적용

```sql
-- 인덱스 못 씀
WHERE SUBSTR(emp_name, 1, 1) = '김'
WHERE TRUNC(order_date) = TRUNC(SYSDATE)
WHERE salary * 12 > 60000000
WHERE NVL(department_id, 0) = 20

-- 인덱스 사용
WHERE emp_name LIKE '김%'
WHERE order_date >= TRUNC(SYSDATE) AND order_date < TRUNC(SYSDATE) + 1
WHERE salary > 60000000 / 12
WHERE department_id = 20
```

함수를 꼭 써야 한다면 **함수 기반 인덱스**를 만든다. 단, 쿼리의 표현식과 인덱스 정의가 정확히 일치해야 한다.

```sql
CREATE INDEX fx_emp_upper ON employees (UPPER(emp_name));
WHERE UPPER(emp_name) = '홍길동';   -- 이제 탄다
```

### 2) 암시적 형변환

2편에서 본 그것이다. 문자 컬럼을 숫자와 비교하면 오라클이 컬럼 쪽에 `TO_NUMBER`를 씌운다. 결과적으로 1번과 같은 상황이 된다.

```sql
WHERE emp_no = 1001      -- emp_no가 VARCHAR2면 인덱스 사용 불가
WHERE emp_no = '1001'    -- 타입을 맞춘다
```

### 3) 앞이 열린 LIKE

```sql
WHERE emp_name LIKE '%길동'    -- 못 씀
WHERE emp_name LIKE '%길%'     -- 못 씀
WHERE emp_name LIKE '홍%'      -- RANGE SCAN
```

중간 검색이 꼭 필요하면 Oracle Text 인덱스를 검토한다.

### 4) 부정 조건

`!=`, `NOT IN`, `NOT LIKE`는 "해당하지 않는 전부"라서 인덱스로 좁힐 수 없다.

### 5) IS NULL

단일 컬럼 인덱스에는 NULL이 저장되지 않는다. NULL 조회가 잦다면 상수를 하나 끼워 복합 인덱스로 만드는 우회법이 있다.

```sql
CREATE INDEX ix_emp_dept_null ON employees (department_id, 0);
```

### 6) OR

`OR`로 묶인 조건은 인덱스 활용이 어려울 때가 많다. `UNION ALL`로 나누는 게 더 빠른 경우가 있다. 옵티마이저가 알아서 `CONCATENATION`으로 바꾸기도 한다.

## 실행계획 읽기

### 예상 계획

```sql
EXPLAIN PLAN FOR
SELECT e.emp_name, d.department_name
FROM   employees e JOIN departments d ON e.department_id = d.department_id
WHERE  e.salary > 5000000;

SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY);
```

### 실제 실행 통계 (이쪽이 훨씬 유용하다)

```sql
SELECT /*+ GATHER_PLAN_STATISTICS */ ...   -- 쿼리에 힌트를 붙여 실행

SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY_CURSOR(NULL, NULL, 'ALLSTATS LAST'));
```

`E-Rows`(예상 행 수)와 `A-Rows`(실제 행 수)를 나란히 볼 수 있다. **이 둘이 크게 어긋나는 지점이 문제의 출발점**이다. 대개 통계정보가 낡았거나 조건식이 옵티마이저를 헷갈리게 만든 것이다.

SQL*Plus에서는 `AUTOTRACE`도 편하다.

```sql
SET AUTOTRACE ON;
```

### 읽는 순서

계획은 트리다. **가장 안쪽(들여쓰기가 깊은 곳)부터, 위에서 아래로** 읽는다.

```
-------------------------------------------------------------------
| Id | Operation                    | Name         | Rows | Cost  |
-------------------------------------------------------------------
|  0 | SELECT STATEMENT             |              |    6 |     5 |
|  1 |  NESTED LOOPS                |              |    6 |     5 |
|  2 |   TABLE ACCESS FULL          | EMPLOYEES    |    6 |     3 |
|  3 |   TABLE ACCESS BY INDEX ROWID| DEPARTMENTS  |    1 |     1 |
|* 4 |    INDEX UNIQUE SCAN         | PK_DEPARTMENTS|   1 |     0 |
-------------------------------------------------------------------
```

위 계획은 "EMPLOYEES를 풀 스캔하며 각 행마다 DEPARTMENTS를 PK로 조회한다"로 읽는다.

`Predicate Information` 섹션도 반드시 본다.

- **`access`** — 인덱스로 범위를 좁히는 데 쓴 조건. 좋다.
- **`filter`** — 읽어온 뒤 걸러낸 조건. 이게 많으면 불필요하게 읽고 버린 것이다.

`filter`에 있는 조건을 `access`로 옮기는 것이 인덱스 튜닝의 핵심이다.

## 조인 방식

옵티마이저가 고르는 세 가지다. 각각 잘 맞는 상황이 다르다.

### Nested Loops

```
바깥 테이블의 각 행마다 → 안쪽 테이블을 인덱스로 조회
```

- 바깥 결과가 **적을 때** 유리
- 안쪽 조인 컬럼에 **인덱스가 필수**
- OLTP의 기본. 부분 범위 처리(먼저 나온 행부터 반환)가 가능하다

### Hash Join

```
작은 쪽으로 해시 테이블을 만들고 → 큰 쪽을 훑으며 매칭
```

- 대량 데이터, 등가 조인(`=`)에서 강하다
- 인덱스가 없어도 된다
- PGA 메모리가 부족하면 디스크로 넘어가 느려진다
- 배치·리포트의 기본

### Sort Merge Join

```
양쪽을 정렬한 뒤 → 나란히 훑으며 매칭
```

- 부등호 조인(`>`, `BETWEEN`)에 쓸 수 있다
- 이미 정렬된 상태면 유리
- 실무에서 보는 빈도는 낮다

**"소량이면 NL, 대량이면 Hash"** 가 대략의 기준이다. 실행계획에 `HASH JOIN`이 나왔는데 실제로는 몇 건만 처리하는 쿼리라면 통계가 잘못됐을 가능성이 높다.

## 통계정보

오라클 옵티마이저는 비용 기반(CBO)이다. **비용은 통계정보로 계산한다.** 통계가 실제와 다르면 계획이 엉뚱해진다.

```sql
-- 테이블 하나
EXEC DBMS_STATS.GATHER_TABLE_STATS('STUDY', 'EMPLOYEES');

-- 스키마 전체
EXEC DBMS_STATS.GATHER_SCHEMA_STATS('STUDY');

-- 확인
SELECT table_name, num_rows, blocks, last_analyzed FROM user_tables;
SELECT column_name, num_distinct, num_nulls, histogram FROM user_tab_col_statistics
WHERE table_name = 'EMPLOYEES';
```

오라클은 기본적으로 자동 통계 수집 작업을 밤에 돌린다. 하지만 대량 적재 직후처럼 데이터가 급변한 경우에는 직접 수집해야 한다. **"어제까지 잘 돌던 쿼리가 갑자기 느려졌다"의 상당수가 통계 문제**다.

### 히스토그램

데이터가 한쪽으로 쏠려 있을 때 필요하다. 예를 들어 `status` 컬럼의 99%가 `'PAID'`이고 1%만 `'CANCELLED'`라면, 두 값의 최적 계획은 다르다. 히스토그램이 있어야 옵티마이저가 이 차이를 안다.

### 바인드 변수와 쏠림

바인드 변수는 하드 파싱을 줄여주지만, 값에 따라 최적 계획이 달라지는 컬럼에서는 **첫 실행의 계획이 재사용되어** 다른 값에서 느려질 수 있다(bind peeking). 11g의 적응적 커서 공유가 이를 완화한다. 쏠림이 심한 컬럼에 한해서는 리터럴이 나을 수도 있다는 정도로 기억해두면 된다.

## 힌트

옵티마이저에게 지시한다. 주석처럼 생겼지만 `+`가 붙는다.

```sql
SELECT /*+ INDEX(e ix_emp_dept) */ * FROM employees e WHERE department_id = 20;
```

자주 쓰는 것들.

| 힌트 | 의미 |
| --- | --- |
| `FULL(t)` | 풀 스캔 강제 |
| `INDEX(t idx)` | 특정 인덱스 사용 |
| `NO_INDEX(t idx)` | 특정 인덱스 배제 |
| `LEADING(a b)` | 조인 순서 지정 |
| `USE_NL(t)` / `USE_HASH(t)` | 조인 방식 지정 |
| `PARALLEL(t, 4)` | 병렬 처리 |
| `APPEND` | 직접 경로 삽입 |
| `GATHER_PLAN_STATISTICS` | 실제 실행 통계 수집 |
| `MATERIALIZE` | WITH 절을 임시 테이블로 |

주의할 점 두 가지.

- **테이블 별칭을 썼으면 힌트에도 별칭을 써야 한다.** 테이블명을 쓰면 힌트가 조용히 무시된다.
- 힌트는 임시방편이다. 데이터가 늘거나 분포가 바뀌면 그 힌트가 오히려 발목을 잡는다. 통계·인덱스·쿼리 구조로 해결되지 않을 때 마지막에 쓴다.

`APPEND`는 대량 적재에서 유용하다. 기존 블록의 빈 공간을 찾지 않고 HWM 위에 바로 붙인다. 대신 그 세션에서 테이블 전체에 락이 걸리고, 커밋 전에는 조회할 수 없다.

```sql
INSERT /*+ APPEND */ INTO emp_backup SELECT * FROM employees;
COMMIT;
```

## 파티셔닝

큰 테이블을 논리적으로 하나, 물리적으로 여러 조각으로 나눈다. 로그·이력처럼 계속 쌓이는 테이블에 쓴다.

```sql
CREATE TABLE orders_part (
  order_id   NUMBER,
  order_date DATE,
  amount     NUMBER
)
PARTITION BY RANGE (order_date) (
  PARTITION p2026q1 VALUES LESS THAN (DATE '2026-04-01'),
  PARTITION p2026q2 VALUES LESS THAN (DATE '2026-07-01'),
  PARTITION p2026q3 VALUES LESS THAN (DATE '2026-10-01'),
  PARTITION pmax    VALUES LESS THAN (MAXVALUE)
);
```

얻는 것.

- **파티션 프루닝** — `WHERE order_date >= DATE '2026-07-01'`이면 해당 파티션만 읽는다
- **관리 편의** — 오래된 데이터를 `DROP PARTITION` 한 번으로 삭제(`DELETE`보다 압도적으로 빠르다)

종류는 `RANGE`(날짜), `LIST`(코드값), `HASH`(균등 분산), 그리고 이들의 조합인 컴포지트가 있다. 11g의 `INTERVAL` 파티션을 쓰면 파티션이 자동 생성된다.

파티셔닝은 Enterprise Edition 옵션이라는 점도 알아둬야 한다.

## 튜닝의 순서

느린 쿼리를 만났을 때 밟는 순서를 정리하면 이렇다.

1. **정말 필요한 데이터만 읽는가** — `SELECT *` 대신 필요한 컬럼만, 조건을 최대한 앞에서 건다
2. **실행계획을 본다** — `E-Rows`와 `A-Rows`의 차이, `access`와 `filter`의 비율
3. **통계정보를 확인한다** — `last_analyzed`가 언제인가
4. **인덱스를 검토한다** — 안티패턴에 걸리지 않았는가, 복합 인덱스 순서가 맞는가
5. **쿼리를 다시 쓴다** — 불필요한 서브쿼리, `UNION` → `UNION ALL`, 1:N 조인 후 집계 구조
6. **그래도 안 되면 힌트** — 마지막 수단

가장 흔한 원인부터 보면, 인덱스가 없어서가 아니라 **있는데 못 타게 쿼리를 써서** 느린 경우가 많다.

## 시리즈를 마치며

여덟 편에 걸쳐 정리한 내용을 되짚으면 이렇다.

1. 구조와 DDL — 오라클이 데이터를 어디에 어떻게 두는가
2. SELECT와 함수 — 한 행을 어떻게 다루는가
3. 집계와 조인 — 여러 행을 어떻게 묶는가
4. 서브쿼리 — 쿼리를 어떻게 조합하는가
5. 분석 함수 — 행을 유지하면서 어떻게 계산하는가
6. 트랜잭션 — 쓰기를 어떻게 안전하게 하는가
7. PL/SQL — 절차적 로직을 DB 안에서 어떻게 돌리는가
8. 튜닝 — 왜 느린지 어떻게 판단하는가

앞으로 더 파고들 만한 것들은 파티셔닝 실무 적용, `DBMS_SCHEDULER` 기반 배치, AWR/ASH 리포트 읽기, 그리고 19c 이후의 자동 인덱싱 같은 기능들이다. 이건 실제로 부딪히면서 따로 정리할 생각이다.
