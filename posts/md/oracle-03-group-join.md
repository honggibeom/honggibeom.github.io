---
title: 오라클 DB 학습 노트 (3) - 집계, GROUP BY, 그리고 조인
date: 2025-08-15
category: oracle
src: cover.svg
tags: [oracle, sql, join, groupby, 학습노트]
summary: 집계 함수와 GROUP BY/HAVING, ROLLUP·CUBE 같은 소계 확장, 그리고 조인의 모든 형태를 ANSI 문법과 오라클 전통 문법으로 나란히 정리한다.
---

3편은 여러 행을 묶는 이야기다. 세로로 묶는 것이 집계, 가로로 붙이는 것이 조인이다. 예제 스키마는 1편에 있다.

## 집계 함수

| 함수 | 설명 | NULL |
| --- | --- | --- |
| `COUNT(*)` | 행 수 | NULL 행도 센다 |
| `COUNT(col)` | 값이 있는 행 수 | **NULL 제외** |
| `COUNT(DISTINCT col)` | 중복 제거한 값의 수 | NULL 제외 |
| `SUM` / `AVG` | 합 / 평균 | NULL 제외 |
| `MAX` / `MIN` | 최대 / 최소 | NULL 제외 |
| `STDDEV` / `VARIANCE` | 표준편차 / 분산 | NULL 제외 |
| `LISTAGG` | 문자열로 이어붙이기 | NULL 제외 |

**모든 집계 함수는 NULL을 무시한다.** 이게 평균에서 문제가 된다.

```sql
SELECT COUNT(*)              AS 전체,      -- 10
       COUNT(commission_pct) AS 인센티브자, --  3
       AVG(commission_pct)   AS 평균1,     -- 3명 기준 평균
       AVG(NVL(commission_pct, 0)) AS 평균2 -- 10명 기준 평균
FROM   employees;
```

"인센티브율 평균"이 무엇을 뜻하는지에 따라 답이 달라진다. 요구사항을 확인하지 않고 `AVG`를 쓰면 조용히 틀린다.

`COUNT(*)`와 `COUNT(1)`은 성능이 같다. 옛날부터 도는 "`COUNT(1)`이 빠르다"는 말은 사실이 아니다.

### LISTAGG

한 그룹의 값을 한 줄로 합친다. 실무에서 꽤 자주 쓴다.

```sql
SELECT department_id,
       LISTAGG(emp_name, ', ') WITHIN GROUP (ORDER BY salary DESC) AS members
FROM   employees
GROUP  BY department_id;
```

결과가 4000바이트를 넘으면 `ORA-01489`가 난다. 12.2부터는 잘라낼 수 있다.

```sql
LISTAGG(emp_name, ', ' ON OVERFLOW TRUNCATE '...') WITHIN GROUP (ORDER BY emp_name)
```

## GROUP BY

```sql
SELECT department_id,
       COUNT(*)    AS 인원,
       ROUND(AVG(salary)) AS 평균급여,
       MAX(salary) AS 최고급여
FROM   employees
GROUP  BY department_id
ORDER  BY department_id;
```

규칙 하나만 지키면 된다. **`SELECT` 목록에는 `GROUP BY`에 넣은 컬럼이거나 집계 함수만 올 수 있다.**

```sql
SELECT department_id, emp_name, COUNT(*)   -- ORA-00979
FROM employees GROUP BY department_id;
```

MySQL은 이걸 허용해서(옛 기본 설정) 임의의 값을 보여주지만, 오라클은 막는다. 막는 쪽이 맞다.

여러 컬럼으로 묶으면 조합별로 그룹이 생긴다.

```sql
SELECT department_id, job_id, COUNT(*), SUM(salary)
FROM   employees
GROUP  BY department_id, job_id;
```

표현식으로도 묶을 수 있다.

```sql
-- 입사 연도별
SELECT TO_CHAR(hire_date, 'YYYY') AS 연도, COUNT(*)
FROM   employees
GROUP  BY TO_CHAR(hire_date, 'YYYY')
ORDER  BY 1;
```

## HAVING

`WHERE`는 그룹을 만들기 **전**의 행을, `HAVING`은 그룹을 만든 **후**의 결과를 거른다.

```sql
SELECT department_id, COUNT(*) AS cnt, AVG(salary) AS avg_sal
FROM   employees
WHERE  hire_date >= DATE '2017-01-01'   -- 행 필터: 먼저
GROUP  BY department_id
HAVING COUNT(*) >= 2                     -- 그룹 필터: 나중
ORDER  BY avg_sal DESC;
```

집계 결과로 거르는 조건만 `HAVING`에 두고, 나머지는 전부 `WHERE`로 내린다. `WHERE`에서 미리 행을 줄여야 정렬·해시 작업량이 줄어든다.

## ROLLUP, CUBE, GROUPING SETS

소계와 총계를 한 번에 뽑는 확장 문법이다. 리포트 만들 때 유용하다.

### ROLLUP - 계층적 소계

```sql
SELECT department_id, job_id, SUM(salary)
FROM   employees
GROUP  BY ROLLUP (department_id, job_id);
```

`(dept, job)` → `(dept)` → `()` 순으로 오른쪽부터 하나씩 떼면서 소계를 만든다. n개 컬럼이면 n+1개 레벨이다.

### CUBE - 모든 조합

```sql
GROUP BY CUBE (department_id, job_id)
```

`(dept, job)`, `(dept)`, `(job)`, `()` — 2^n개 조합을 전부 만든다.

### GROUPING SETS - 원하는 조합만

```sql
GROUP BY GROUPING SETS ((department_id, job_id), (department_id), ())
```

### 소계 행 구분하기

소계 행은 해당 컬럼이 NULL로 나온다. 원래 NULL인 데이터와 구분하려면 `GROUPING` 함수를 쓴다. 소계 때문에 생긴 NULL이면 1을 반환한다.

```sql
SELECT CASE WHEN GROUPING(department_id) = 1 THEN '전체 합계'
            ELSE TO_CHAR(department_id) END AS 부서,
       CASE WHEN GROUPING(job_id) = 1 THEN '소계'
            ELSE job_id END                 AS 직무,
       SUM(salary) AS 급여합
FROM   employees
GROUP  BY ROLLUP (department_id, job_id);
```

## 조인

조인은 오라클 학습에서 가장 중요한 구간이다. 문법이 두 벌 있다는 게 처음엔 혼란스러운데, 정리하면 간단하다.

- **ANSI 표준 문법** — `JOIN ... ON`. 새로 짜는 코드는 이걸 쓴다.
- **오라클 전통 문법** — `FROM a, b WHERE a.x = b.x`. 기존 코드에 널려 있어서 읽을 줄 알아야 한다.

### 내부 조인 (INNER JOIN)

양쪽 모두 매칭되는 행만 나온다.

```sql
-- ANSI
SELECT e.emp_name, d.department_name
FROM   employees e
JOIN   departments d ON e.department_id = d.department_id;

-- 전통
SELECT e.emp_name, d.department_name
FROM   employees e, departments d
WHERE  e.department_id = d.department_id;
```

`INNER`는 생략할 수 있다.

컬럼명이 같으면 `USING`으로 줄일 수 있다. 단, `USING`에 쓴 컬럼은 **별칭을 붙이면 안 된다.**

```sql
SELECT emp_name, department_name, department_id   -- 접두어 없이 써야 한다
FROM   employees JOIN departments USING (department_id);
```

`NATURAL JOIN`은 같은 이름의 컬럼을 전부 자동으로 조인한다. 테이블 구조가 바뀌면 조용히 결과가 달라지므로 실무에서는 쓰지 않는다.

### 외부 조인 (OUTER JOIN)

한쪽에 짝이 없어도 남긴다.

```sql
-- 부서가 없는 사원도 포함
SELECT e.emp_name, d.department_name
FROM   employees e
LEFT   JOIN departments d ON e.department_id = d.department_id;

-- 사원이 없는 부서도 포함
SELECT e.emp_name, d.department_name
FROM   employees e
RIGHT  JOIN departments d ON e.department_id = d.department_id;

-- 양쪽 다
FULL JOIN departments d ON e.department_id = d.department_id;
```

오라클 전통 문법에서는 `(+)` 기호를 쓴다. **데이터가 부족한(NULL을 채워 넣을) 쪽에 붙인다**는 게 헷갈리는 지점이다.

```sql
-- LEFT JOIN과 같다: departments 쪽이 부족하니 그쪽에 (+)
SELECT e.emp_name, d.department_name
FROM   employees e, departments d
WHERE  e.department_id = d.department_id(+);
```

`(+)`의 제약이 많아서 결국 ANSI로 넘어가게 된다.

- `FULL OUTER JOIN`을 표현할 수 없다
- 한 쿼리에서 한쪽 테이블에만 붙일 수 있다
- `IN`이나 서브쿼리와 함께 쓸 수 없다

### 외부 조인에서 조건의 위치

이게 실전에서 가장 자주 틀리는 부분이다. **`ON`에 쓴 조건과 `WHERE`에 쓴 조건은 다르게 동작한다.**

```sql
-- 사원 전원 + 서울 부서인 경우에만 부서명 (사원은 다 나온다)
SELECT e.emp_name, d.department_name
FROM   employees e
LEFT   JOIN departments d
       ON e.department_id = d.department_id
      AND d.location = '서울';

-- 서울 부서 사원만 (LEFT JOIN이 사실상 INNER JOIN이 된다)
SELECT e.emp_name, d.department_name
FROM   employees e
LEFT   JOIN departments d ON e.department_id = d.department_id
WHERE  d.location = '서울';
```

조인 후에 `WHERE`가 걸리는데, 짝이 없어 NULL로 채워진 행은 `d.location = '서울'`이 UNKNOWN이라 전부 탈락한다. **외부 조인의 "남기는 쪽이 아닌" 테이블에 대한 조건은 `ON`에 둔다.**

전통 문법에서도 마찬가지로 `(+)`를 붙여야 한다.

```sql
WHERE e.department_id = d.department_id(+)
  AND d.location(+) = '서울';
```

### 셀프 조인

같은 테이블을 두 번 부른다. 계층 데이터를 한 단계만 펼칠 때 쓴다.

```sql
SELECT e.emp_name AS 사원, m.emp_name AS 관리자
FROM   employees e
LEFT   JOIN employees m ON e.manager_id = m.employee_id;
```

`LEFT JOIN`을 써야 관리자가 없는 대표이사도 나온다. 여러 단계를 재귀적으로 펼치는 건 5편의 `CONNECT BY`다.

### 카티션 곱과 CROSS JOIN

조인 조건을 빼먹으면 모든 조합이 나온다. 10명 × 4부서 = 40행.

```sql
SELECT * FROM employees, departments;        -- 사고
SELECT * FROM employees CROSS JOIN departments;  -- 의도한 경우
```

의도적으로 쓰는 경우도 있다. 날짜 축을 만들어 빈 구간을 채우는 패턴이 대표적이다.

```sql
-- 부서 × 월 조합을 먼저 만들고, 실적을 외부 조인으로 붙인다
WITH months AS (
  SELECT ADD_MONTHS(DATE '2026-01-01', LEVEL - 1) AS mon
  FROM   dual CONNECT BY LEVEL <= 12
)
SELECT d.department_name, TO_CHAR(m.mon, 'YYYY-MM') AS 월, NVL(SUM(o.amount), 0) AS 매출
FROM   departments d
CROSS  JOIN months m
LEFT   JOIN employees e ON e.department_id = d.department_id
LEFT   JOIN orders o    ON o.employee_id = e.employee_id
                       AND o.order_date >= m.mon
                       AND o.order_date <  ADD_MONTHS(m.mon, 1)
GROUP  BY d.department_name, m.mon
ORDER  BY 1, 2;
```

### 비등가 조인

`=`가 아닌 조건으로도 조인할 수 있다.

```sql
SELECT e.emp_name, e.salary, j.job_title
FROM   employees e
JOIN   jobs j ON e.salary BETWEEN j.min_salary AND j.max_salary;
```

### 다중 테이블 조인

```sql
SELECT e.emp_name,
       d.department_name,
       j.job_title,
       m.emp_name AS manager
FROM   employees e
JOIN   departments d ON e.department_id = d.department_id
JOIN   jobs        j ON e.job_id        = j.job_id
LEFT   JOIN employees m ON e.manager_id = m.employee_id
WHERE  d.location = '서울'
ORDER  BY e.salary DESC;
```

한 번 `LEFT JOIN`이 들어가면 그 뒤에 이어지는 조인도 대부분 `LEFT`여야 한다. 중간에 `INNER`가 끼면 앞에서 살려둔 행이 다시 사라진다.

## 조인과 집계를 같이 쓸 때의 함정

조인으로 행이 불어난 상태에서 집계하면 값이 부풀려진다.

```sql
-- 사원별 주문 건수와 급여 합계? salary가 주문 건수만큼 중복 합산된다
SELECT e.emp_name, COUNT(*), SUM(e.salary)
FROM   employees e JOIN orders o ON e.employee_id = o.employee_id
GROUP  BY e.emp_name;
```

해결책은 두 가지다.

```sql
-- 1) 미리 집계한 인라인 뷰와 조인
SELECT e.emp_name, e.salary, NVL(o.cnt, 0) AS 주문건수, NVL(o.amt, 0) AS 주문금액
FROM   employees e
LEFT   JOIN (SELECT employee_id, COUNT(*) cnt, SUM(amount) amt
             FROM   orders GROUP BY employee_id) o
       ON e.employee_id = o.employee_id;

-- 2) 스칼라 서브쿼리 (4편에서 다룬다)
SELECT e.emp_name, e.salary,
       (SELECT COUNT(*) FROM orders o WHERE o.employee_id = e.employee_id) AS 주문건수
FROM   employees e;
```

1:N 조인 뒤에 `SUM`이 나오면 일단 의심하는 습관이 필요하다.

## 정리

- 집계 함수는 NULL을 무시한다. `COUNT(*)`만 예외다
- `GROUP BY`에 없는 컬럼은 `SELECT`에 못 쓴다
- `WHERE`는 그룹 전, `HAVING`은 그룹 후. 가능한 조건은 전부 `WHERE`로
- 소계·총계는 `ROLLUP`/`CUBE`, 소계 행 구분은 `GROUPING`
- 새 코드는 ANSI 조인, 옛 코드의 `(+)`는 "부족한 쪽에 붙인다"로 읽는다
- 외부 조인에서 상대 테이블 조건은 `WHERE`가 아니라 `ON`에 둔다
- 1:N 조인 후 집계는 값이 부풀려진다 — 미리 집계하고 조인한다

다음 편은 서브쿼리와 집합 연산이다.
