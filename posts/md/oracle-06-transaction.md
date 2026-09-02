---
title: 오라클 DML과 트랜잭션, 락, 스키마 객체 정리 - 커밋, 롤백, 읽기 일관성 (오라클 학습 노트 6)
date: 2025-10-02
category: oracle
src: cover.svg
tags: [oracle, sql, 트랜잭션, 락, 학습노트]
summary: INSERT/UPDATE/DELETE부터 커밋·롤백·세이브포인트, 오라클의 읽기 일관성과 락 동작, 그리고 시퀀스·뷰·시노님 같은 스키마 객체까지 정리한다.
---

여기까지는 읽기만 했다. 이번 편은 쓰기다. 그리고 오라클의 진짜 강점이라는 **읽기 일관성** 모델을 이해하는 편이기도 하다.

## DML

### INSERT

```sql
-- 컬럼을 명시하는 형태 (권장)
INSERT INTO departments (department_id, department_name, location)
VALUES (50, '마케팅', '서울');

-- 전체 컬럼 순서대로 (테이블 구조가 바뀌면 깨진다)
INSERT INTO departments VALUES (60, '재무', '서울');

-- 서브쿼리로 여러 건
INSERT INTO emp_backup (employee_id, emp_name, salary)
SELECT employee_id, emp_name, salary FROM employees WHERE department_id = 20;
```

오라클에는 `INSERT INTO ... VALUES (...), (...)` 같은 다중 VALUES 문법이 **없다.** 여러 건을 한 문장에 넣으려면 `INSERT ALL`을 쓴다.

```sql
INSERT ALL
  INTO departments VALUES (70, '법무',   '서울')
  INTO departments VALUES (80, '디자인', '부산')
SELECT * FROM dual;
```

조건부 분배도 된다.

```sql
INSERT FIRST
  WHEN salary >= 10000000 THEN INTO emp_high  VALUES (employee_id, salary)
  WHEN salary >=  5000000 THEN INTO emp_mid   VALUES (employee_id, salary)
  ELSE                         INTO emp_low   VALUES (employee_id, salary)
SELECT employee_id, salary FROM employees;
```

`INSERT FIRST`는 처음 만족하는 조건 하나에만, `INSERT ALL`은 만족하는 모든 조건에 넣는다.

### UPDATE

```sql
UPDATE employees SET salary = salary * 1.05 WHERE department_id = 20;

-- 여러 컬럼을 서브쿼리 하나로
UPDATE employees e
SET   (e.job_id, e.salary) = (SELECT j.job_id, j.min_salary
                              FROM   jobs j WHERE j.job_id = 'DEV')
WHERE e.employee_id = 105;
```

**`WHERE`를 빼먹으면 전체 행이 바뀐다.** `UPDATE`/`DELETE`를 작성할 때는 먼저 `SELECT`로 같은 `WHERE`를 돌려 대상 건수를 확인하는 습관이 안전하다.

### DELETE

```sql
DELETE FROM employees WHERE employee_id = 109;
DELETE FROM employees;              -- 전체 삭제 (롤백 가능)
```

`FROM`은 생략할 수 있지만 쓰는 편이 읽기 좋다. 1편에서 본 `TRUNCATE`와의 차이를 기억한다.

### RETURNING

변경된 값을 바로 돌려받는다. PL/SQL과 JDBC에서 유용하다.

```sql
DECLARE
  v_new NUMBER;
BEGIN
  UPDATE employees SET salary = salary * 1.1
  WHERE  employee_id = 103
  RETURNING salary INTO v_new;
  DBMS_OUTPUT.PUT_LINE(v_new);
END;
/
```

## 트랜잭션

**오라클은 자동 커밋이 아니다.** MySQL을 쓰다 오면 여기서 가장 많이 당황한다. DML을 실행해도 명시적으로 커밋하기 전까지는 내 세션에만 보인다.

### 시작과 끝

트랜잭션은 첫 DML에서 자동으로 시작하고, 다음 중 하나로 끝난다.

- `COMMIT` — 확정
- `ROLLBACK` — 취소
- **DDL 실행** — 앞의 DML까지 암시적으로 커밋된다
- 정상 종료(`EXIT`) — 대부분의 클라이언트에서 커밋
- 비정상 종료 / 세션 강제 종료 — 롤백

세 번째가 특히 중요하다. `INSERT` 몇 건 하고 `CREATE INDEX`를 실행하면 그 `INSERT`가 커밋되어 버린다. 되돌릴 수 없다.

### SAVEPOINT

부분 롤백 지점을 만든다.

```sql
INSERT INTO departments VALUES (90, '연구소', '대전');
SAVEPOINT sp1;

UPDATE employees SET department_id = 90 WHERE employee_id = 105;
SAVEPOINT sp2;

DELETE FROM employees WHERE employee_id = 109;

ROLLBACK TO sp2;   -- DELETE만 취소. INSERT와 UPDATE는 살아있다
COMMIT;            -- 나머지 확정
```

`ROLLBACK TO`는 트랜잭션을 끝내지 않는다. 락도 유지된다.

### 커밋의 비용

배치에서 `LOOP` 안에 `COMMIT`을 넣는 코드를 자주 보는데, 대개 나쁜 선택이다.

- 커밋마다 리두 로그 파일에 동기 쓰기(`log file sync`)가 발생한다
- 중간에 실패하면 데이터가 반쯤 반영된 상태로 남는다
- 커서를 열어둔 채 커밋하면 `ORA-01555 snapshot too old`가 날 수 있다

반대로 수백만 건을 한 번에 커밋하면 UNDO 테이블스페이스가 부족해진다. 대량 작업은 수천~수만 건 단위로 끊는 게 보통이다.

## 읽기 일관성과 UNDO

오라클의 핵심 설계다. 한 문장으로 요약하면 이렇다.

> **읽기는 쓰기를 막지 않고, 쓰기는 읽기를 막지 않는다.**

동작 원리는 이렇다. 어떤 세션이 행을 수정하면, 오라클은 변경 **전** 이미지를 UNDO 세그먼트에 보관한다. 그 사이 다른 세션이 그 행을 읽으려 하면, 현재의 더러운 값이 아니라 **자기 쿼리가 시작된 시점의 값**을 UNDO에서 복원해 보여준다.

그래서 오라클에는 "읽기 락"이 없다. `SELECT`가 `UPDATE`를 기다리는 일도, `UPDATE`가 `SELECT` 때문에 막히는 일도 없다.

부작용도 있다. UNDO가 오래된 데이터를 이미 덮어썼는데 아주 긴 쿼리가 그 시점 이미지를 요구하면 `ORA-01555 snapshot too old`가 난다. 오래 도는 배치 쿼리에서 만나게 되는 오류다.

### 격리 수준

표준의 네 단계 중 오라클이 지원하는 건 두 가지다.

| 수준 | 오라클 | 설명 |
| --- | --- | --- |
| READ UNCOMMITTED | 없음 | 오라클은 더티 리드가 구조적으로 불가능 |
| **READ COMMITTED** | 기본값 | 문장 단위 읽기 일관성 |
| REPEATABLE READ | 없음 | |
| **SERIALIZABLE** | 지원 | 트랜잭션 단위 읽기 일관성 |

```sql
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
SET TRANSACTION READ ONLY;   -- 조회 전용, 트랜잭션 시작 시점 스냅샷 고정
```

기본값인 READ COMMITTED에서는 **문장 하나**가 일관된 시점을 본다. 같은 트랜잭션에서 같은 `SELECT`를 두 번 하면 그 사이 커밋된 변경이 보일 수 있다(non-repeatable read).

## 락

### 행 락 (TX Lock)

DML이 건 행에 자동으로 걸린다. 다른 세션이 같은 행을 수정하려 하면 **무한정 기다린다.** 오라클은 락 타임아웃 기본값이 없다.

```sql
-- 세션 A
UPDATE employees SET salary = 9000000 WHERE employee_id = 103;   -- 커밋 안 함

-- 세션 B
UPDATE employees SET salary = 8000000 WHERE employee_id = 103;   -- 여기서 멈춘다
```

### SELECT FOR UPDATE

읽으면서 미리 락을 잡는다. "조회 후 판단해서 수정"하는 로직에서 중간에 값이 바뀌는 것을 막는다.

```sql
SELECT * FROM employees WHERE employee_id = 103 FOR UPDATE;
SELECT * FROM employees WHERE employee_id = 103 FOR UPDATE NOWAIT;      -- 즉시 실패
SELECT * FROM employees WHERE employee_id = 103 FOR UPDATE WAIT 5;      -- 5초 대기 후 실패
SELECT * FROM employees WHERE department_id = 20 FOR UPDATE SKIP LOCKED; -- 잠긴 행은 건너뜀
```

`SKIP LOCKED`는 여러 워커가 큐 테이블을 나눠 처리하는 패턴에 딱 맞다.

### 데드락

서로가 상대의 락을 기다리면 데드락이다. 오라클은 이를 감지해 **한쪽 문장만** 롤백하고 `ORA-00060`을 던진다. 트랜잭션 전체가 롤백되는 게 아니라서, 애플리케이션이 오류를 받고도 그냥 `COMMIT`하면 어중간한 상태가 확정된다. 데드락 오류를 잡으면 `ROLLBACK`하는 게 원칙이다.

예방책은 단순하다. **모든 트랜잭션이 같은 순서로 테이블·행에 접근하게 한다.**

### 락 상황 확인

```sql
SELECT s.sid, s.serial#, s.username, s.blocking_session,
       s.event, s.seconds_in_wait, q.sql_text
FROM   v$session s
LEFT   JOIN v$sql q ON s.sql_id = q.sql_id
WHERE  s.blocking_session IS NOT NULL;

-- 최후의 수단
ALTER SYSTEM KILL SESSION '145,32109' IMMEDIATE;
```

## 시퀀스

오라클에는 오랫동안 `AUTO_INCREMENT`가 없었다. 시퀀스라는 독립 객체를 쓴다.

```sql
CREATE SEQUENCE seq_employees
  START WITH 200
  INCREMENT BY 1
  NOCYCLE
  CACHE 20;

INSERT INTO employees (employee_id, ...) VALUES (seq_employees.NEXTVAL, ...);
SELECT seq_employees.CURRVAL FROM dual;   -- 내 세션이 NEXTVAL을 부른 뒤에만 가능
```

알아둘 점.

- `CACHE n`은 n개를 메모리에 미리 확보한다. 빠르지만 인스턴스가 죽으면 그 구간이 **날아가서 번호에 구멍이 생긴다.** 연속성이 중요하면 `NOCACHE`(느림)를 쓴다.
- 트랜잭션을 롤백해도 소비한 번호는 돌아오지 않는다.
- `CURRVAL`은 같은 세션에서 `NEXTVAL`을 한 번 호출한 뒤에만 쓸 수 있다.

12c부터는 컬럼 기본값으로 시퀀스를 쓸 수 있고, `IDENTITY` 컬럼도 생겼다.

```sql
CREATE TABLE t (
  id NUMBER GENERATED BY DEFAULT ON NULL AS IDENTITY PRIMARY KEY,
  name VARCHAR2(50)
);
```

## 뷰

쿼리에 이름을 붙여 저장한다. 데이터를 갖지 않는다.

```sql
CREATE OR REPLACE VIEW v_emp_detail AS
SELECT e.employee_id, e.emp_name, e.salary,
       d.department_name, j.job_title
FROM   employees e
JOIN   departments d ON e.department_id = d.department_id
JOIN   jobs        j ON e.job_id = j.job_id;
```

용도는 세 가지다. 복잡한 조인을 감추기, 권한 통제(민감 컬럼 제외하고 뷰만 노출), 그리고 인터페이스 고정(테이블 구조가 바뀌어도 뷰 정의만 고치면 된다).

뷰를 통해 DML을 할 수도 있는데 조건이 까다롭다. `DISTINCT`, 집계, `GROUP BY`, 집합 연산이 들어가면 안 되고, 조인 뷰라면 키 보존 테이블 쪽만 수정 가능하다. 실무에서는 뷰를 조회 전용으로 쓰는 편이 깔끔하다.

```sql
CREATE VIEW v_dept20 AS
SELECT * FROM employees WHERE department_id = 20
WITH CHECK OPTION;    -- 조건을 벗어나는 DML 차단

CREATE VIEW v_readonly AS SELECT * FROM employees WITH READ ONLY;
```

### 머티리얼라이즈드 뷰

결과를 **실제로 저장**하는 뷰다. 집계가 무거운 리포트에 쓴다.

```sql
CREATE MATERIALIZED VIEW mv_dept_sales
  BUILD IMMEDIATE
  REFRESH COMPLETE ON DEMAND
AS
SELECT d.department_id, d.department_name, SUM(o.amount) AS total
FROM   departments d
JOIN   employees e ON e.department_id = d.department_id
JOIN   orders    o ON o.employee_id   = e.employee_id
GROUP  BY d.department_id, d.department_name;

EXEC DBMS_MVIEW.REFRESH('MV_DEPT_SALES');
```

갱신 방식은 `COMPLETE`(전체 재계산)와 `FAST`(변경분만, MV 로그 필요), 시점은 `ON DEMAND`와 `ON COMMIT`이 있다. 최신성이 어디까지 필요한지가 선택 기준이다.

## 시노님

객체의 별명이다. 다른 스키마의 테이블을 자기 것처럼 부를 때 쓴다.

```sql
CREATE SYNONYM emp FOR hr.employees;          -- 내 스키마에서만
CREATE PUBLIC SYNONYM emp FOR hr.employees;   -- 전체 사용자
```

스키마 이름을 코드에 박지 않아도 되므로 개발/운영 환경 전환이 쉬워진다.

## 인덱스 (개요)

자세한 건 8편에서 다루고, 여기서는 만드는 법만 본다.

```sql
CREATE INDEX ix_emp_name ON employees (emp_name);
CREATE UNIQUE INDEX ux_emp_email ON employees (email);
CREATE INDEX ix_emp_dept_sal ON employees (department_id, salary);   -- 복합
CREATE INDEX fx_emp_upper ON employees (UPPER(emp_name));            -- 함수 기반

ALTER INDEX ix_emp_name REBUILD;
DROP INDEX ix_emp_name;
```

`PRIMARY KEY`와 `UNIQUE` 제약조건은 인덱스를 자동으로 만든다. FK는 만들지 않는다(1편).

## 정리

- 오라클은 자동 커밋이 아니다. DML 뒤에는 `COMMIT`이 필요하다
- DDL은 앞의 DML까지 암시적으로 커밋해버린다
- 다중 행 삽입은 `INSERT ALL`, `VALUES (...), (...)` 문법은 없다
- 읽기는 UNDO에서 이전 이미지를 복원한다 — 읽기와 쓰기가 서로를 막지 않는다
- 기본 격리 수준은 READ COMMITTED, 문장 단위 일관성
- 행 락은 무한 대기한다. `NOWAIT` / `WAIT n` / `SKIP LOCKED`를 활용한다
- 데드락은 문장만 롤백된다 — 오류를 받으면 반드시 `ROLLBACK`
- 시퀀스 번호는 `CACHE`와 롤백 때문에 연속성이 보장되지 않는다

다음 편은 PL/SQL이다.
