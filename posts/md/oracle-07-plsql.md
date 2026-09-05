---
title: 오라클 PL/SQL 정리 - 커서, 예외 처리, 프로시저, 패키지, 트리거, BULK (오라클 학습 노트 7)
date: 2025-10-15
category: oracle
src: cover.svg
tags: [oracle, plsql, 프로시저, 트리거, 학습노트]
summary: 블록 구조와 변수, 조건·반복, 커서, 예외 처리, 프로시저·함수·패키지·트리거, 컬렉션과 BULK 연산, 동적 SQL까지. 오라클 서버 사이드 프로그래밍 한 편 정리.
---

[6편](/post/oracle-06-transaction)까지가 SQL 한 문장으로 할 수 있는 일이었다면, 이번 편은 그 문장들을 묶어 절차로 만드는 이야기다. PL/SQL은 SQL에 절차적 문법을 얹은 언어로, 반복과 분기, 예외 처리가 필요한 로직을 DB 안에서 돌린다. 6편에서 본 커밋과 락도 여기서는 프로시저·트리거 안쪽 문제로 다시 나온다. 애플리케이션과 DB 사이를 여러 번 오가지 않아도 되므로 대량 데이터 처리에서 성능 차이가 크게 나고, 예제 스키마는 계속 [1편](/post/oracle-01-basics) 것을 쓴다.

## 블록 구조

PL/SQL의 모든 코드는 블록이다.

```sql
DECLARE
  -- 선언부 (선택)
BEGIN
  -- 실행부 (필수)
EXCEPTION
  -- 예외부 (선택)
END;
/
```

이름이 없으면 익명 블록, 이름을 붙여 저장하면 프로시저·함수·패키지다.

`/`는 SQL*Plus에게 "여기까지가 한 블록이니 실행하라"는 신호다. 빼먹으면 아무 일도 일어나지 않는다.

출력을 보려면 먼저 켜야 한다.

```sql
SET SERVEROUTPUT ON;

BEGIN
  DBMS_OUTPUT.PUT_LINE('hello');
END;
/
```

## 변수와 타입

선언부에 변수·상수·타입을 적는다. 오라클에서는 컬럼 타입을 직접 적는 대신 테이블에서 따오는 방식을 더 많이 쓴다.

```sql
DECLARE
  v_name     VARCHAR2(50) := '홍길동';
  v_salary   NUMBER(9,2)  DEFAULT 0;
  c_rate     CONSTANT NUMBER := 0.05;
  v_hired    DATE         NOT NULL := SYSDATE;

  -- 앵커드 선언: 컬럼 타입을 그대로 따라간다
  v_emp_name employees.emp_name%TYPE;
  -- 행 전체
  v_emp      employees%ROWTYPE;
BEGIN
  SELECT * INTO v_emp FROM employees WHERE employee_id = 103;
  DBMS_OUTPUT.PUT_LINE(v_emp.emp_name || ' / ' || v_emp.salary);
END;
/
```

`%TYPE`과 `%ROWTYPE`은 습관으로 만들어두는 게 좋다. 테이블 컬럼 길이가 바뀌어도 코드를 안 고쳐도 된다.

대입은 `:=`, 비교는 `=`다.

### SELECT INTO

PL/SQL에서 값 하나를 읽어오는 기본 형태다. 반드시 정확히 한 행이어야 한다.

- 0행 → `NO_DATA_FOUND`
- 2행 이상 → `TOO_MANY_ROWS`

```sql
BEGIN
  SELECT salary INTO v_salary FROM employees WHERE employee_id = 999;
EXCEPTION
  WHEN NO_DATA_FOUND THEN v_salary := 0;
END;
```

## 조건과 반복

분기는 `IF`와 `CASE`, 반복은 기본 `LOOP`·`WHILE`·`FOR` 세 가지다. 다른 언어와 거의 같지만 키워드 철자에서 한 번씩 걸린다.

```sql
IF v_salary >= 10000000 THEN
  v_grade := 'A';
ELSIF v_salary >= 5000000 THEN
  v_grade := 'B';
ELSE
  v_grade := 'C';
END IF;

CASE
  WHEN v_salary >= 10000000 THEN v_grade := 'A';
  WHEN v_salary >=  5000000 THEN v_grade := 'B';
  ELSE v_grade := 'C';
END CASE;
```

`ELSIF`다. `ELSEIF`가 아니다.

```sql
-- 기본 LOOP
LOOP
  i := i + 1;
  EXIT WHEN i > 10;
END LOOP;

-- WHILE
WHILE i <= 10 LOOP
  i := i + 1;
END LOOP;

-- FOR (범위는 정수만, REVERSE 가능)
FOR i IN 1..10 LOOP
  DBMS_OUTPUT.PUT_LINE(i);
END LOOP;

FOR i IN REVERSE 1..10 LOOP ... END LOOP;

CONTINUE WHEN MOD(i, 2) = 0;   -- 11g부터
```

`FOR` 루프의 인덱스 변수는 선언하지 않는다. 루프 안에서만 존재하고 읽기 전용이다.

## 커서

여러 행을 한 행씩 처리한다.

### 암시적 커서

`SELECT INTO`, `INSERT`, `UPDATE`, `DELETE`를 실행하면 오라클이 내부적으로 커서를 연다. 그 결과는 `SQL%` 속성으로 확인한다.

```sql
BEGIN
  UPDATE employees SET salary = salary * 1.05 WHERE department_id = 20;
  DBMS_OUTPUT.PUT_LINE(SQL%ROWCOUNT || '건 수정');

  IF SQL%NOTFOUND THEN
    DBMS_OUTPUT.PUT_LINE('대상 없음');
  END IF;
END;
/
```

| 속성 | 의미 |
| --- | --- |
| `SQL%ROWCOUNT` | 영향받은 행 수 |
| `SQL%FOUND` | 1건 이상이면 TRUE |
| `SQL%NOTFOUND` | 0건이면 TRUE |
| `SQL%ISOPEN` | 암시적 커서는 항상 FALSE |

`UPDATE`가 0건이어도 예외가 나지 않는다. `SELECT INTO`와 다른 점이다. 대상이 없는 걸 감지하려면 `SQL%ROWCOUNT`를 확인해야 한다.

### 명시적 커서

```sql
DECLARE
  CURSOR c_emp IS
    SELECT employee_id, emp_name, salary FROM employees WHERE department_id = 20;
  v_row c_emp%ROWTYPE;
BEGIN
  OPEN c_emp;
  LOOP
    FETCH c_emp INTO v_row;
    EXIT WHEN c_emp%NOTFOUND;
    DBMS_OUTPUT.PUT_LINE(v_row.emp_name || ' ' || v_row.salary);
  END LOOP;
  CLOSE c_emp;
END;
/
```

`EXIT WHEN c_emp%NOTFOUND;`를 `FETCH` 바로 다음에 두는 게 중요하다. 순서를 바꾸면 마지막 행이 두 번 처리된다.

### 커서 FOR 루프 (권장)

`OPEN`/`FETCH`/`CLOSE`를 알아서 해준다. 대부분의 경우 이걸 쓴다.

```sql
BEGIN
  FOR r IN (SELECT emp_name, salary FROM employees WHERE department_id = 20) LOOP
    DBMS_OUTPUT.PUT_LINE(r.emp_name || ' ' || r.salary);
  END LOOP;
END;
/
```

레코드 변수 선언도 필요 없다. 코드가 짧아지고 커서를 안 닫는 실수도 사라진다.

### 파라미터 커서와 FOR UPDATE

```sql
DECLARE
  CURSOR c_emp (p_dept NUMBER) IS
    SELECT employee_id, salary FROM employees
    WHERE  department_id = p_dept
    FOR UPDATE OF salary;
BEGIN
  FOR r IN c_emp(20) LOOP
    UPDATE employees SET salary = salary * 1.1
    WHERE  CURRENT OF c_emp;      -- 지금 fetch한 행
  END LOOP;
  COMMIT;
END;
/
```

## 예외 처리

### 미리 정의된 예외

| 예외 | 오류 |
| --- | --- |
| `NO_DATA_FOUND` | ORA-01403 |
| `TOO_MANY_ROWS` | ORA-01422 |
| `DUP_VAL_ON_INDEX` | ORA-00001 |
| `ZERO_DIVIDE` | ORA-01476 |
| `INVALID_NUMBER` | ORA-01722 |
| `VALUE_ERROR` | ORA-06502 |
| `OTHERS` | 나머지 전부 |

```sql
BEGIN
  ...
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    DBMS_OUTPUT.PUT_LINE('없음');
  WHEN DUP_VAL_ON_INDEX THEN
    DBMS_OUTPUT.PUT_LINE('중복');
  WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE(SQLCODE || ' : ' || SQLERRM);
    DBMS_OUTPUT.PUT_LINE(DBMS_UTILITY.FORMAT_ERROR_BACKTRACE);
    RAISE;   -- 다시 던진다
END;
```

`WHEN OTHERS THEN NULL;`은 최악의 코드다. 모든 오류를 삼켜서 문제를 숨긴다. `OTHERS`를 잡았다면 최소한 로그를 남기고 `RAISE`로 다시 던진다.

`DBMS_UTILITY.FORMAT_ERROR_BACKTRACE`는 오류가 발생한 라인 번호를 알려준다. 디버깅에 필수다.

### 사용자 정의 예외

```sql
DECLARE
  e_invalid_salary EXCEPTION;
  v_salary NUMBER := -100;
BEGIN
  IF v_salary < 0 THEN
    RAISE e_invalid_salary;          -- 직접 선언한 예외를 던진다
  END IF;
EXCEPTION
  WHEN e_invalid_salary THEN
    RAISE_APPLICATION_ERROR(-20001, '급여는 음수일 수 없습니다: ' || v_salary);
END;
```

`RAISE_APPLICATION_ERROR`의 번호는 -20000 ~ -20999 범위만 쓸 수 있다. 애플리케이션이 받는 메시지가 여기서 결정되므로, 무엇이 잘못됐는지 값까지 넣어주면 운영에서 큰 도움이 된다.

`PRAGMA EXCEPTION_INIT`으로 오라클 오류 번호에 이름을 붙일 수도 있다.

```sql
DECLARE
  e_child_found EXCEPTION;
  PRAGMA EXCEPTION_INIT(e_child_found, -2292);   -- FK 위반
BEGIN
  DELETE FROM departments WHERE department_id = 20;
EXCEPTION
  WHEN e_child_found THEN
    RAISE_APPLICATION_ERROR(-20010, '소속 사원이 있어 삭제할 수 없습니다.');
END;
```

## 프로시저와 함수

### 프로시저

```sql
CREATE OR REPLACE PROCEDURE raise_salary (
  p_emp_id   IN  employees.employee_id%TYPE,
  p_pct      IN  NUMBER DEFAULT 5,
  p_new_sal  OUT employees.salary%TYPE
) IS
BEGIN
  UPDATE employees
  SET    salary = salary * (1 + p_pct / 100)
  WHERE  employee_id = p_emp_id
  RETURNING salary INTO p_new_sal;

  IF SQL%ROWCOUNT = 0 THEN
    RAISE_APPLICATION_ERROR(-20002, '사원 없음: ' || p_emp_id);
  END IF;
END raise_salary;
/
```

파라미터 모드는 세 가지다.

- `IN` (기본) - 읽기 전용
- `OUT` - 결과를 돌려줌. 들어올 때는 NULL
- `IN OUT` - 받아서 바꿔 돌려줌

호출은 위치 지정과 이름 지정 둘 다 된다. 파라미터가 많으면 이름 지정(`=>`)이 안전하다.

```sql
DECLARE
  v_sal NUMBER;
BEGIN
  raise_salary(p_emp_id => 103, p_pct => 10, p_new_sal => v_sal);
  DBMS_OUTPUT.PUT_LINE(v_sal);
END;
/
```

### 함수

값을 하나 반환한다. `RETURN`이 필수다.

```sql
CREATE OR REPLACE FUNCTION get_annual_salary (
  p_emp_id IN employees.employee_id%TYPE
) RETURN NUMBER
IS
  v_total NUMBER;
BEGIN
  SELECT salary * 12 * (1 + NVL(commission_pct, 0))
  INTO   v_total
  FROM   employees
  WHERE  employee_id = p_emp_id;
  RETURN v_total;
EXCEPTION
  WHEN NO_DATA_FOUND THEN RETURN NULL;
END;
/

SELECT emp_name, get_annual_salary(employee_id) FROM employees;
```

SQL에서 호출하려면 DML을 하지 않아야 한다(자율 트랜잭션 제외).

주의: `SELECT` 안에서 함수를 부르면 행마다 실행된다. 함수 안에 또 쿼리가 있으면 10만 행 조회에 10만 번 쿼리가 나간다. 조인으로 풀 수 있으면 조인이 낫다. `DETERMINISTIC`을 붙이면 같은 입력에 대한 결과를 캐시하도록 힌트를 줄 수 있다.

### 컴파일 오류 확인

```sql
SHOW ERRORS;
SELECT * FROM user_errors WHERE name = 'RAISE_SALARY';
SELECT object_name, status FROM user_objects WHERE status = 'INVALID';
```

## 패키지

관련된 프로시저·함수·변수·타입을 묶는다. 명세(spec)와 본문(body)으로 나뉜다.

```sql
-- 명세: 외부에 공개할 것
CREATE OR REPLACE PACKAGE emp_pkg IS
  g_min_salary CONSTANT NUMBER := 2800000;

  PROCEDURE hire (p_name VARCHAR2, p_job VARCHAR2, p_sal NUMBER, p_dept NUMBER);
  FUNCTION  get_annual_salary (p_emp_id NUMBER) RETURN NUMBER;
END emp_pkg;
/

-- 본문: 구현
CREATE OR REPLACE PACKAGE BODY emp_pkg IS

  -- 명세에 없으니 패키지 내부에서만 쓰인다 (private)
  FUNCTION next_id RETURN NUMBER IS
    v NUMBER;
  BEGIN
    SELECT seq_employees.NEXTVAL INTO v FROM dual;   -- 6편에서 만든 시퀀스
    RETURN v;
  END next_id;

  PROCEDURE hire (p_name VARCHAR2, p_job VARCHAR2, p_sal NUMBER, p_dept NUMBER) IS
  BEGIN
    IF p_sal < g_min_salary THEN
      RAISE_APPLICATION_ERROR(-20003, '최저 급여 미만');
    END IF;
    INSERT INTO employees (employee_id, emp_name, hire_date, job_id, salary, department_id)
    VALUES (next_id(), p_name, SYSDATE, p_job, p_sal, p_dept);
  END hire;

  FUNCTION get_annual_salary (p_emp_id NUMBER) RETURN NUMBER IS
    v NUMBER;
  BEGIN
    SELECT salary * 12 INTO v FROM employees WHERE employee_id = p_emp_id;
    RETURN v;
  END get_annual_salary;

END emp_pkg;
/

EXEC emp_pkg.hire('신입사원', 'DEV', 4000000, 20);
```

패키지를 쓰는 이유.

- 캡슐화 - 명세에 없는 것은 밖에서 못 쓴다
- 의존성 격리 - 본문만 고치면 이 패키지를 참조하는 다른 객체가 무효화되지 않는다
- 오버로딩 - 같은 이름에 다른 시그니처를 여러 개 둘 수 있다
- 세션 상태 - 패키지 변수는 세션 동안 값을 유지한다

프로시저를 여러 개 만들 일이 생기면 처음부터 패키지로 묶는 편이 낫다.

## 트리거

특정 이벤트에 자동으로 실행된다.

```sql
CREATE OR REPLACE TRIGGER trg_emp_audit
  BEFORE INSERT OR UPDATE OR DELETE ON employees
  FOR EACH ROW
DECLARE
  v_action VARCHAR2(10);
BEGIN
  v_action := CASE WHEN INSERTING THEN 'INSERT'
                   WHEN UPDATING  THEN 'UPDATE'
                   ELSE 'DELETE' END;

  INSERT INTO emp_audit (audit_id, emp_id, action, old_salary, new_salary, changed_at, changed_by)
  VALUES (seq_audit.NEXTVAL,
          NVL(:NEW.employee_id, :OLD.employee_id),
          v_action, :OLD.salary, :NEW.salary, SYSDATE, USER);
END;
/
```

- `:OLD` - 변경 전 값 (`INSERT`에서는 NULL)
- `:NEW` - 변경 후 값 (`DELETE`에서는 NULL)
- `FOR EACH ROW`를 빼면 문장당 한 번만 실행된다(문장 트리거)
- `BEFORE`에서만 `:NEW` 값을 바꿀 수 있다

```sql
-- 등록일시·등록자 자동 세팅
CREATE OR REPLACE TRIGGER trg_emp_default
  BEFORE INSERT ON employees FOR EACH ROW
BEGIN
  :NEW.hire_date := NVL(:NEW.hire_date, SYSDATE);
END;
/
```

### 변경 테이블 오류

행 트리거 안에서 자기 테이블을 조회하면 `ORA-04091: table is mutating`이 난다. 트리거가 도는 도중이라 테이블 상태가 불확정이기 때문이다.

해결은 복합 트리거(11g)를 쓰거나, 애초에 그 로직을 트리거가 아니라 프로시저에 두는 것이다.

트리거는 아껴 쓰는 게 좋다. 코드를 읽어도 어디서 값이 바뀌는지 보이지 않아서 디버깅이 어렵다. 감사 로그처럼 부수 효과가 명확한 용도로 제한하는 편이 낫다.

## 컬렉션

### 연관 배열 (해시맵)

```sql
DECLARE
  TYPE t_sal IS TABLE OF NUMBER INDEX BY VARCHAR2(50);
  v_sal t_sal;
BEGIN
  v_sal('김대표') := 25000000;
  v_sal('이개발') := 11000000;

  DBMS_OUTPUT.PUT_LINE(v_sal('이개발'));
  DBMS_OUTPUT.PUT_LINE(v_sal.COUNT);
END;
/
```

### 중첩 테이블 / VARRAY

```sql
DECLARE
  TYPE t_names IS TABLE OF VARCHAR2(50);   -- 중첩 테이블
  v_names t_names := t_names('A', 'B', 'C');
BEGIN
  v_names.EXTEND;
  v_names(4) := 'D';

  FOR i IN 1..v_names.COUNT LOOP
    DBMS_OUTPUT.PUT_LINE(v_names(i));
  END LOOP;
END;
/
```

주요 메서드: `COUNT`, `FIRST`, `LAST`, `NEXT(i)`, `PRIOR(i)`, `EXISTS(i)`, `EXTEND`, `TRIM`, `DELETE`.

## BULK COLLECT와 FORALL

PL/SQL에서 성능이 갈리는 지점이다.

PL/SQL 엔진과 SQL 엔진은 서로 다르고, 둘 사이를 오갈 때마다 컨텍스트 스위치 비용이 든다. 루프 안에서 한 행씩 `INSERT`하면 10만 번 왕복한다. 이걸 한 번으로 줄이는 게 벌크 연산이다.

```sql
DECLARE
  TYPE t_emp IS TABLE OF employees%ROWTYPE;
  v_emps t_emp;
BEGIN
  -- 여러 행을 컬렉션으로 한 번에 읽기
  SELECT * BULK COLLECT INTO v_emps FROM employees WHERE department_id = 20;

  -- 여러 행을 한 번에 쓰기
  FORALL i IN 1..v_emps.COUNT
    UPDATE employees SET salary = v_emps(i).salary * 1.1
    WHERE  employee_id = v_emps(i).employee_id;

  COMMIT;
END;
/
```

건수가 많으면 메모리를 다 쓸 수 있으므로 `LIMIT`으로 끊는다.

```sql
DECLARE
  CURSOR c IS SELECT * FROM employees;
  TYPE t_emp IS TABLE OF employees%ROWTYPE;
  v_emps t_emp;
BEGIN
  OPEN c;
  LOOP
    FETCH c BULK COLLECT INTO v_emps LIMIT 1000;
    EXIT WHEN v_emps.COUNT = 0;

    FORALL i IN 1..v_emps.COUNT
      INSERT INTO emp_backup VALUES v_emps(i);

    COMMIT;
  END LOOP;
  CLOSE c;
END;
/
```

`SAVE EXCEPTIONS`를 붙이면 중간에 오류가 나도 끝까지 진행하고, 실패 건은 `SQL%BULK_EXCEPTIONS`에서 확인한다.

```sql
FORALL i IN 1..v_emps.COUNT SAVE EXCEPTIONS
  INSERT INTO emp_backup VALUES v_emps(i);
EXCEPTION
  WHEN OTHERS THEN
    FOR i IN 1..SQL%BULK_EXCEPTIONS.COUNT LOOP
      DBMS_OUTPUT.PUT_LINE(SQL%BULK_EXCEPTIONS(i).ERROR_INDEX || ' : ' ||
                           SQLERRM(-SQL%BULK_EXCEPTIONS(i).ERROR_CODE));
    END LOOP;
END;
```

다만 가장 좋은 건 애초에 한 문장으로 처리하는 것이다. `INSERT ... SELECT`나 `MERGE`로 되는 일을 PL/SQL 루프로 푸는 건 거의 항상 손해다. 순서가 있다.

1. 한 문장 SQL로 되는가?
2. 안 되면 벌크 연산으로
3. 그래도 안 되면 행 단위 루프

## 동적 SQL

컴파일 시점에 문장이 정해지지 않을 때 쓴다. 테이블명이 변수이거나, 조건이 런타임에 조립되는 경우다.

```sql
DECLARE
  v_cnt NUMBER;
  v_sql VARCHAR2(200);
BEGIN
  v_sql := 'SELECT COUNT(*) FROM employees WHERE department_id = :b1';
  EXECUTE IMMEDIATE v_sql INTO v_cnt USING 20;
  DBMS_OUTPUT.PUT_LINE(v_cnt);

  EXECUTE IMMEDIATE 'CREATE INDEX ix_tmp ON employees (hire_date)';  -- DDL도 가능
END;
/
```

값은 반드시 바인드 변수(`USING`)로 넘긴다. 문자열을 이어붙이면 SQL 인젝션이 열리고, 하드 파싱이 매번 일어나 공유 풀이 오염된다.

```sql
-- 위험
v_sql := 'SELECT * FROM employees WHERE emp_name = ''' || p_name || '''';

-- 안전
v_sql := 'SELECT * FROM employees WHERE emp_name = :b1';
```

테이블명·컬럼명은 바인드 변수로 넘길 수 없으므로 이어붙일 수밖에 없는데, 이때는 `DBMS_ASSERT.SIMPLE_SQL_NAME` 같은 함수로 검증하거나 화이트리스트로 제한한다.

## 자율 트랜잭션

바깥 트랜잭션과 독립적으로 커밋한다. 오류 로그를 남길 때 쓴다. 본 트랜잭션이 롤백되어도 로그는 남아야 하기 때문이다.

```sql
CREATE OR REPLACE PROCEDURE log_error (p_msg VARCHAR2) IS
  PRAGMA AUTONOMOUS_TRANSACTION;
BEGIN
  INSERT INTO error_log (log_id, msg, logged_at) VALUES (seq_log.NEXTVAL, p_msg, SYSDATE);
  COMMIT;
END;
/
```

용도가 뚜렷한 기능이다. 일반 업무 로직에 쓰면 트랜잭션 경계가 무너진다.

## 정리

- 모든 코드는 `DECLARE / BEGIN / EXCEPTION / END` 블록
- `%TYPE`, `%ROWTYPE`으로 타입을 테이블에 묶어둔다
- `SELECT INTO`는 정확히 한 행 - 아니면 예외
- `UPDATE`가 0건이어도 예외는 없다. `SQL%ROWCOUNT`로 확인
- 커서는 대부분 커서 FOR 루프로 충분하다
- `WHEN OTHERS THEN NULL`은 쓰지 않는다. 로그 남기고 `RAISE`
- 프로시저가 늘어나면 패키지로 묶는다
- 트리거는 감사 로그 정도로 제한한다
- 루프 안 단건 DML은 `BULK COLLECT` + `FORALL`로, 그전에 한 문장 SQL로 되는지 먼저 본다
- 동적 SQL의 값은 반드시 바인드 변수

마지막 편은 인덱스와 실행계획, 튜닝이다.
