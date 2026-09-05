---
title: 오라클 서브쿼리, 집합 연산, WITH 절, MERGE 정리 (오라클 학습 노트 4)
date: 2025-09-02
category: oracle
src: cover.svg
tags: [oracle, sql, 서브쿼리, merge, 학습노트]
summary: 단일행·다중행·인라인 뷰·스칼라·상관 서브쿼리를 자리별로 정리하고, NOT IN과 NULL의 함정, 집합 연산자, WITH 절, MERGE까지 다룬다.
---

[3편](/post/oracle-03-group-join)에서 여러 행을 세로로 묶고 가로로 붙이는 법까지 봤다. 이번 편은 쿼리 자체를 조합하는 이야기다. 서브쿼리는 "쿼리 안의 쿼리"다. 분류가 여러 갈래로 나뉘어 헷갈리는데, 어디에 놓이는가와 몇 행을 돌려주는가 두 축으로 보면 정리된다.

## 놓이는 자리에 따른 분류

| 위치 | 이름 | 특징 |
| --- | --- | --- |
| `WHERE` / `HAVING` | 중첩 서브쿼리 (Nested) | 조건 값으로 쓴다 |
| `FROM` | 인라인 뷰 (Inline View) | 테이블처럼 쓴다 |
| `SELECT` | 스칼라 서브쿼리 (Scalar) | 값 하나를 컬럼처럼 쓴다 |

여기에 바깥 쿼리의 컬럼을 참조하면 상관 서브쿼리(Correlated) 라고 부른다.

## WHERE 절 서브쿼리

### 단일행 서브쿼리

결과가 한 행일 때만 `=`, `>`, `<` 같은 단일행 연산자를 쓸 수 있다.

```sql
-- 평균보다 많이 받는 사원
SELECT emp_name, salary
FROM   employees
WHERE  salary > (SELECT AVG(salary) FROM employees);
```

서브쿼리가 두 행 이상을 돌려주면 `ORA-01427: 단일 행 하위 질의에 2개 이상의 행이 리턴되었습니다`가 난다. 개발할 때는 한 행이 나오다가 운영 데이터에서 두 행이 나오면서 터지는 게 전형적인 패턴이다. 한 행임이 보장되지 않으면 다중행 연산자를 쓴다.

### 다중행 서브쿼리

| 연산자 | 의미 |
| --- | --- |
| `IN` | 목록 중 하나와 일치 |
| `> ANY` | 최솟값보다 크면 참 |
| `< ANY` | 최댓값보다 작으면 참 |
| `> ALL` | 최댓값보다 크면 참 |
| `< ALL` | 최솟값보다 작으면 참 |
| `EXISTS` | 한 건이라도 있으면 참 |

```sql
-- 서울 부서 소속 사원
SELECT emp_name FROM employees
WHERE  department_id IN (SELECT department_id FROM departments WHERE location = '서울');

-- 개발팀 어느 누구보다도 많이 받는 사원
SELECT emp_name, salary FROM employees
WHERE  salary > ALL (SELECT salary FROM employees WHERE department_id = 20);

-- 개발팀 최저 연봉보다는 많이 받는 사원
WHERE  salary > ANY (SELECT salary FROM employees WHERE department_id = 20);
```

`ANY`/`ALL`은 읽기 어려워서 실무에서는 `> (SELECT MIN(...))`, `> (SELECT MAX(...))`로 바꿔 쓰는 편이 낫다.

### NOT IN의 NULL 함정

[2편](/post/oracle-02-select-functions)에서 본 NULL 규칙이 여기서 사고로 이어진다.

```sql
-- 부서에 아무도 배정되지 않은 부서를 찾으려는 의도
SELECT department_name FROM departments
WHERE  department_id NOT IN (SELECT department_id FROM employees);
```

`employees.department_id`에 NULL이 하나라도 있으면 이 쿼리는 한 건도 반환하지 않는다. `NOT IN`은 `<> A AND <> B AND <> NULL`로 풀리고, 마지막 항이 UNKNOWN이라 전체가 절대 참이 되지 못한다.

해결책 세 가지.

```sql
-- 1) NULL을 제거
WHERE department_id NOT IN (SELECT department_id FROM employees WHERE department_id IS NOT NULL)

-- 2) NOT EXISTS (권장)
SELECT d.department_name FROM departments d
WHERE  NOT EXISTS (SELECT 1 FROM employees e WHERE e.department_id = d.department_id);

-- 3) 외부 조인 + IS NULL (안티 조인)
SELECT d.department_name
FROM   departments d LEFT JOIN employees e ON d.department_id = e.department_id
WHERE  e.employee_id IS NULL;
```

`NOT EXISTS`는 NULL에 영향을 받지 않는다. `NOT IN`을 보면 반사적으로 NULL 가능성을 확인하는 습관을 들이는 게 좋다.

### EXISTS

값을 비교하지 않고 "존재 여부"만 본다. 그래서 `SELECT` 목록에 무엇을 쓰든 상관없다. 관례적으로 `1`을 쓴다.

```sql
-- 주문을 한 건이라도 낸 사원
SELECT e.emp_name FROM employees e
WHERE  EXISTS (SELECT 1 FROM orders o WHERE o.employee_id = e.employee_id);
```

`EXISTS`는 조건을 만족하는 첫 행을 찾으면 즉시 멈춘다. 그래서 자식 테이블이 크고 부모가 작을 때 유리하다. 반대 상황이면 `IN`이 나을 수 있다. 요즘 옵티마이저는 상당 부분 알아서 변환해주지만, 원리는 알아두는 게 좋다.

### 다중 컬럼 서브쿼리

여러 컬럼을 한 번에 비교한다. 이걸 모르면 불필요한 조인을 만들게 된다.

```sql
-- 부서별 최고 연봉자
SELECT emp_name, department_id, salary
FROM   employees
WHERE  (department_id, salary) IN (
         SELECT department_id, MAX(salary) FROM employees GROUP BY department_id
       );
```

## 인라인 뷰 (FROM 절)

`FROM`에 서브쿼리를 놓으면 그 결과가 임시 테이블처럼 동작한다. 2편의 `ROWNUM` 페이징이 대표적인 예다.

```sql
-- 부서별 평균 급여가 500만 이상인 부서의 사원 목록
SELECT e.emp_name, e.salary, a.avg_sal
FROM   employees e
JOIN   (SELECT department_id, AVG(salary) AS avg_sal
        FROM   employees
        GROUP  BY department_id
        HAVING AVG(salary) >= 5000000) a
  ON   e.department_id = a.department_id;
```

인라인 뷰 안에서는 바깥 컬럼을 참조할 수 없다(`LATERAL`을 쓰지 않는 한). 12c부터는 `LATERAL`과 `CROSS APPLY` / `OUTER APPLY`가 생겨서 가능해졌다.

```sql
-- 사원별 최근 주문 2건
SELECT e.emp_name, o.order_id, o.order_date, o.amount
FROM   employees e
OUTER  APPLY (SELECT * FROM orders o
              WHERE  o.employee_id = e.employee_id
              ORDER  BY o.order_date DESC
              FETCH FIRST 2 ROWS ONLY) o;
```

## 스칼라 서브쿼리 (SELECT 절)

정확히 한 행 한 컬럼을 돌려주는 서브쿼리를 컬럼 자리에 놓는다.

```sql
SELECT e.emp_name,
       e.salary,
       (SELECT d.department_name FROM departments d
        WHERE  d.department_id = e.department_id) AS 부서,
       (SELECT COUNT(*) FROM orders o
        WHERE  o.employee_id = e.employee_id)      AS 주문건수
FROM   employees e;
```

특징 세 가지.

- 결과가 없으면 오류가 아니라 NULL이다. 외부 조인처럼 동작한다.
- 두 행 이상이면 `ORA-01427`이다.
- 오라클은 스칼라 서브쿼리 결과를 캐시한다(입력값 → 결과). 그래서 값의 종류가 적으면 매우 빠르고, 값이 다양하면 행마다 실행돼 느려진다.

행 수가 많고 값의 카디널리티가 높으면 조인으로 바꾸는 게 낫다.

## 상관 서브쿼리

서브쿼리가 바깥 쿼리의 컬럼을 참조하면 상관 서브쿼리다. 바깥 행마다 한 번씩 평가된다는 개념이다(실제로는 옵티마이저가 조인으로 바꾸는 경우가 많다).

```sql
-- 자기 부서 평균보다 많이 받는 사원
SELECT e.emp_name, e.department_id, e.salary
FROM   employees e
WHERE  e.salary > (SELECT AVG(s.salary) FROM employees s
                   WHERE  s.department_id = e.department_id);
```

`UPDATE`에서도 자주 쓴다.

```sql
-- 각 사원 급여를 자기 직무 최저 연봉 이상으로 끌어올린다
UPDATE employees e
SET    e.salary = (SELECT j.min_salary FROM jobs j WHERE j.job_id = e.job_id)
WHERE  e.salary < (SELECT j.min_salary FROM jobs j WHERE j.job_id = e.job_id);
```

`WHERE`를 빼먹으면 조건에 안 맞는 행은 NULL로 덮여버린다. 상관 서브쿼리 `UPDATE`에서 가장 흔한 사고다.

## 집합 연산자

두 결과 집합을 세로로 합친다. 컬럼 개수와 타입이 맞아야 한다.

| 연산자 | 의미 | 중복 | 정렬 |
| --- | --- | --- | --- |
| `UNION` | 합집합 | 제거 | 정렬 발생 |
| `UNION ALL` | 합집합 | 유지 | 없음 |
| `INTERSECT` | 교집합 | 제거 | 정렬 발생 |
| `MINUS` | 차집합 | 제거 | 정렬 발생 |

```sql
SELECT employee_id, emp_name FROM employees WHERE department_id = 20
UNION ALL
SELECT employee_id, emp_name FROM employees WHERE department_id = 30;
```

중복이 없다는 걸 아는 상황이면 반드시 `UNION ALL`을 쓴다. `UNION`은 중복 제거를 위해 전체를 정렬하거나 해시한다. 습관적으로 `UNION`을 쓰는 것만 고쳐도 체감 성능이 달라지는 경우가 많다.

`MINUS`는 표준의 `EXCEPT`에 해당하는 오라클 방언이다. 21c부터는 `EXCEPT`도 지원한다.

```sql
-- 부서는 있는데 사원이 없는 부서
SELECT department_id FROM departments
MINUS
SELECT department_id FROM employees;
```

주의할 점.

- `ORDER BY`는 마지막 쿼리에만 한 번 쓴다.
- 컬럼명은 첫 번째 쿼리 기준이다.
- 타입이 다르면 `ORA-01790`. 자리를 맞추려고 넣는 더미는 `NULL` 대신 `TO_CHAR(NULL)`처럼 캐스팅해두는 게 안전하다.

## WITH 절 (CTE)

인라인 뷰에 이름을 붙여 앞으로 빼는 문법이다. 같은 서브쿼리를 여러 번 쓰거나, 쿼리가 길어져 읽기 어려울 때 쓴다.

```sql
WITH dept_stat AS (
  SELECT department_id, AVG(salary) AS avg_sal, COUNT(*) AS cnt
  FROM   employees
  GROUP  BY department_id
),
high_dept AS (
  SELECT * FROM dept_stat WHERE avg_sal >= 5000000
)
SELECT d.department_name, h.cnt, ROUND(h.avg_sal) AS avg_sal
FROM   high_dept h
JOIN   departments d ON d.department_id = h.department_id
ORDER  BY h.avg_sal DESC;
```

읽는 순서가 위에서 아래로 흘러서 인라인 뷰보다 훨씬 낫다. 두 번 이상 참조하면 오라클이 임시 테이블로 한 번만 실행하기도 한다(`MATERIALIZE` 힌트로 강제할 수 있다).

### 재귀 CTE

11gR2부터 표준 재귀 문법도 쓸 수 있다. 오라클 고유의 `CONNECT BY`는 [5편](/post/oracle-05-analytic)에서 다룬다.

```sql
WITH org (employee_id, emp_name, manager_id, lvl) AS (
  SELECT employee_id, emp_name, manager_id, 1
  FROM   employees WHERE manager_id IS NULL
  UNION ALL
  SELECT e.employee_id, e.emp_name, e.manager_id, o.lvl + 1
  FROM   employees e JOIN org o ON e.manager_id = o.employee_id
)
SELECT LPAD(' ', (lvl - 1) * 3) || emp_name AS 조직도, lvl
FROM   org;
```

## MERGE

한 문장으로 "있으면 UPDATE, 없으면 INSERT"를 처리한다. UPSERT다.

```sql
MERGE INTO employees t
USING (SELECT 110 AS employee_id, '신규자' AS emp_name, 'DEV' AS job_id,
              4000000 AS salary, 20 AS department_id FROM dual) s
   ON (t.employee_id = s.employee_id)
WHEN MATCHED THEN
  UPDATE SET t.salary = s.salary,
             t.department_id = s.department_id
WHEN NOT MATCHED THEN
  INSERT (employee_id, emp_name, hire_date, job_id, salary, department_id)
  VALUES (s.employee_id, s.emp_name, SYSDATE, s.job_id, s.salary, s.department_id);
```

포인트.

- `ON` 절의 컬럼은 `UPDATE SET`에서 변경할 수 없다.
- `WHEN MATCHED THEN UPDATE ... DELETE WHERE ...`로 조건부 삭제도 붙일 수 있다.
- `WHEN MATCHED`와 `WHEN NOT MATCHED` 중 하나만 써도 된다.
- `USING`에 서브쿼리를 놓으면 대량 데이터를 한 번에 반영할 수 있다. 배치에서 이 형태를 가장 많이 쓴다.

```sql
MERGE INTO emp_summary t
USING (SELECT department_id, COUNT(*) cnt, SUM(salary) tot
       FROM   employees GROUP BY department_id) s
   ON (t.department_id = s.department_id)
WHEN MATCHED THEN UPDATE SET t.cnt = s.cnt, t.tot = s.tot
WHEN NOT MATCHED THEN INSERT VALUES (s.department_id, s.cnt, s.tot);
```

애플리케이션에서 `SELECT` 후 분기해서 `INSERT`/`UPDATE`를 날리는 코드는 동시성 문제(둘 다 없다고 판단해 둘 다 INSERT)를 만든다. `MERGE`는 한 문장이라 그 창이 좁다.

## 정리

- 서브쿼리는 위치(`WHERE`/`FROM`/`SELECT`)와 반환 행 수로 나눠 본다
- 단일행 연산자에 다중행이 오면 `ORA-01427` - 확신 없으면 `IN`을 쓴다
- `NOT IN` + NULL = 공집합. `NOT EXISTS`나 안티 조인으로 바꾼다
- 스칼라 서브쿼리는 결과 없으면 NULL, 캐시가 잘 들으면 빠르다
- 중복이 없다면 `UNION`이 아니라 `UNION ALL`
- 복잡한 쿼리는 `WITH`로 이름을 붙여 위에서 아래로 읽히게 만든다
- UPSERT는 `MERGE` 한 문장으로

다음 편은 분석 함수와 계층 질의다. 여기서부터 쿼리로 할 수 있는 일의 범위가 크게 넓어진다.
