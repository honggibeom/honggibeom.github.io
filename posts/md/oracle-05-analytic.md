---
title: 오라클 분석 함수(윈도우 함수)와 CONNECT BY 계층 질의, PIVOT 정리 (오라클 학습 노트 5)
date: 2025-09-14
category: oracle
src: cover.svg
tags: [oracle, sql, 분석함수, 윈도우함수, connectby, 학습노트]
summary: OVER 절의 구조부터 순위·누적·이전행 참조·이동평균까지, 그리고 CONNECT BY 계층 질의와 PIVOT/UNPIVOT을 정리한다. 오라클을 제대로 쓰기 시작하는 지점.
---

[4편](/post/oracle-04-subquery)까지가 서브쿼리를 겹겹이 쌓아 원하는 결과를 만드는 법이었다면, 이번 편은 그 겹을 걷어내는 도구다. 분석 함수(윈도우 함수)를 알기 전과 후는 SQL 실력이 다르다. 그전에는 인라인 뷰와 조인을 몇 겹씩 쌓아야 했던 것들이 한 줄로 끝난다.

## 집계 함수와 무엇이 다른가

`GROUP BY`로 집계하면 **행이 줄어든다.** 분석 함수는 **행을 그대로 두고** 옆에 계산 결과를 붙인다.

```sql
-- 집계: 부서당 1행
SELECT department_id, AVG(salary) FROM employees GROUP BY department_id;

-- 분석: 사원 10명 그대로 + 자기 부서 평균 컬럼
SELECT emp_name, department_id, salary,
       AVG(salary) OVER (PARTITION BY department_id) AS dept_avg,
       salary - AVG(salary) OVER (PARTITION BY department_id) AS diff
FROM   employees;
```

이전에는 이걸 하려면 인라인 뷰로 부서 평균을 만들고 다시 조인해야 했다. `OVER` 한 줄이 그걸 대체한다.

## OVER 절의 구조

```
함수() OVER ( [PARTITION BY 컬럼...] [ORDER BY 컬럼...] [윈도우 절] )
```

- **`PARTITION BY`** — 계산을 나눌 그룹. 생략하면 전체가 한 그룹.
- **`ORDER BY`** — 그룹 안에서의 순서. 순위·누적 계산에 필요하다.
- **윈도우 절** — 현재 행을 기준으로 계산에 포함할 범위.

`SELECT` 절과 `ORDER BY` 절에만 쓸 수 있다. **`WHERE`에는 쓸 수 없다.** 실행 순서상 `WHERE`가 먼저이기 때문이다. 순위로 거르려면 인라인 뷰로 한 겹 감싼다.

```sql
SELECT * FROM (
  SELECT emp_name, salary,
         RANK() OVER (ORDER BY salary DESC) AS rnk
  FROM   employees
)
WHERE rnk <= 3;
```

## 순위 함수

| 함수 | 동점 처리 | 예 (100, 90, 90, 80) |
| --- | --- | --- |
| `RANK()` | 같은 순위, 다음은 건너뜀 | 1, 2, 2, 4 |
| `DENSE_RANK()` | 같은 순위, 건너뛰지 않음 | 1, 2, 2, 3 |
| `ROW_NUMBER()` | 무조건 유일한 번호 | 1, 2, 3, 4 |
| `NTILE(n)` | n개 그룹으로 균등 분할 | 사분위 등 |
| `PERCENT_RANK()` | 백분위 (0~1) | |
| `CUME_DIST()` | 누적 분포 | |

```sql
SELECT emp_name, department_id, salary,
       RANK()       OVER (PARTITION BY department_id ORDER BY salary DESC) AS 부서내순위,
       DENSE_RANK() OVER (ORDER BY salary DESC)                            AS 전체순위,
       ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY salary DESC) AS rn,
       NTILE(4)     OVER (ORDER BY salary DESC)                            AS 사분위
FROM   employees;
```

`ROW_NUMBER()`는 **동점이어도 아무 기준으로나 순서를 정한다.** 실행할 때마다 결과가 달라질 수 있으므로, 페이징처럼 결과가 안정적이어야 하는 곳에서는 `ORDER BY`에 유일 컬럼(예: PK)을 마지막에 추가한다.

```sql
ROW_NUMBER() OVER (ORDER BY salary DESC, employee_id)
```

### 그룹별 상위 N건 - 가장 많이 쓰는 패턴

```sql
-- 부서별 연봉 상위 2명
SELECT * FROM (
  SELECT emp_name, department_id, salary,
         ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY salary DESC, employee_id) AS rn
  FROM   employees
)
WHERE rn <= 2;
```

동점자를 모두 포함하고 싶으면 `RANK()`를 쓴다. 이 패턴 하나만 익혀도 실무에서 매우 자주 쓰인다.

### 최신 이력 한 건 뽑기

```sql
-- 사원별 가장 최근 주문
SELECT * FROM (
  SELECT o.*, ROW_NUMBER() OVER (PARTITION BY employee_id ORDER BY order_date DESC, order_id DESC) rn
  FROM   orders o
)
WHERE rn = 1;
```

## 집계 함수의 분석 함수 버전

`SUM`, `AVG`, `COUNT`, `MAX`, `MIN` 전부 `OVER`를 붙일 수 있다.

```sql
SELECT emp_name, department_id, salary,
       COUNT(*)    OVER (PARTITION BY department_id) AS 부서인원,
       SUM(salary) OVER (PARTITION BY department_id) AS 부서급여합,
       ROUND(salary / SUM(salary) OVER (PARTITION BY department_id) * 100, 1) AS 비중,
       ROUND(salary / SUM(salary) OVER () * 100, 1)                           AS 전체비중
FROM   employees;
```

`OVER ()`처럼 비워두면 전체 행이 한 윈도우가 된다. "각 행이 전체에서 차지하는 비중"을 구할 때 이 형태를 쓴다.

### ORDER BY를 붙이면 누적이 된다

여기가 중요한 지점이다. `OVER` 안에 `ORDER BY`가 들어가면 **기본 윈도우가 "처음부터 현재 행까지"**로 바뀐다.

```sql
SELECT order_date, amount,
       SUM(amount) OVER (ORDER BY order_date, order_id) AS 누적매출
FROM   orders
ORDER  BY order_date, order_id;
```

`ORDER BY`가 없으면 파티션 전체가 대상이라 그냥 총합이 나온다. 이 차이 때문에 "왜 누적이 안 되지" 혹은 "왜 다 같은 값이지"로 헤매는 경우가 많다.

## 윈도우 절

계산 범위를 직접 지정한다.

```
{ROWS | RANGE} BETWEEN 시작 AND 끝
```

- `ROWS` — **물리적 행 개수** 기준
- `RANGE` — **값** 기준 (동일 값 행을 하나로 묶는다)

경계에 쓸 수 있는 키워드.

| 키워드 | 의미 |
| --- | --- |
| `UNBOUNDED PRECEDING` | 파티션 시작 |
| `n PRECEDING` | n행(값) 앞 |
| `CURRENT ROW` | 현재 행 |
| `n FOLLOWING` | n행(값) 뒤 |
| `UNBOUNDED FOLLOWING` | 파티션 끝 |

```sql
-- 3건 이동평균 (현재 행 + 직전 2건)
SELECT order_date, amount,
       ROUND(AVG(amount) OVER (ORDER BY order_date
                               ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)) AS 이동평균3
FROM   orders;

-- 전체 누적 (기본값과 동일)
SUM(amount) OVER (ORDER BY order_date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)

-- 앞뒤 1행씩
AVG(amount) OVER (ORDER BY order_date ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING)
```

`ORDER BY`만 쓰고 윈도우 절을 생략하면 기본값은 `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`다. 정렬 키에 동점이 있으면 그 동점 행들이 한꺼번에 더해진다. 행 단위 누적을 원하면 `ROWS`를 명시하는 게 안전하다.

## 행 간 참조 - LAG, LEAD

이전 행, 다음 행의 값을 가져온다. 증감률 계산의 핵심이다.

```sql
LAG(컬럼, 오프셋, 기본값)  OVER (PARTITION BY ... ORDER BY ...)
LEAD(컬럼, 오프셋, 기본값) OVER (...)
```

```sql
SELECT order_date, amount,
       LAG(amount)  OVER (ORDER BY order_date) AS 이전건,
       LEAD(amount) OVER (ORDER BY order_date) AS 다음건,
       amount - LAG(amount, 1, 0) OVER (ORDER BY order_date) AS 증감,
       ROUND((amount - LAG(amount) OVER (ORDER BY order_date))
             / LAG(amount) OVER (ORDER BY order_date) * 100, 1) AS 증감률
FROM   orders;
```

월별 매출 증감처럼 리포트에서 늘 요구되는 계산이 이걸로 끝난다.

```sql
WITH m AS (
  SELECT TRUNC(order_date, 'MM') AS mon, SUM(amount) AS amt
  FROM   orders GROUP BY TRUNC(order_date, 'MM')
)
SELECT TO_CHAR(mon, 'YYYY-MM') AS 월,
       amt                     AS 매출,
       LAG(amt) OVER (ORDER BY mon) AS 전월,
       ROUND((amt - LAG(amt) OVER (ORDER BY mon)) / LAG(amt) OVER (ORDER BY mon) * 100, 1) AS "전월대비(%)"
FROM   m ORDER BY mon;
```

## FIRST_VALUE, LAST_VALUE

윈도우 안의 첫 값과 마지막 값이다.

```sql
SELECT emp_name, department_id, salary,
       FIRST_VALUE(emp_name) OVER (PARTITION BY department_id ORDER BY salary DESC) AS 최고연봉자,
       LAST_VALUE(emp_name)  OVER (PARTITION BY department_id ORDER BY salary DESC
                                   ROWS BETWEEN UNBOUNDED PRECEDING
                                            AND UNBOUNDED FOLLOWING) AS 최저연봉자
FROM   employees;
```

**`LAST_VALUE`는 윈도우 절을 반드시 써야 한다.** 기본 윈도우가 "현재 행까지"(`RANGE`)라서, 그냥 쓰면 자기 자신 — 정렬 키에 동점이 있으면 그 동점 그룹의 마지막 행 — 이 나온다. 처음 만나면 반드시 한 번 당하는 함정이다.

`IGNORE NULLS` 옵션도 있다. 결측치를 직전 값으로 채우는 데 유용하다.

```sql
LAST_VALUE(price IGNORE NULLS) OVER (ORDER BY dt ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)
```

## RATIO_TO_REPORT

`SUM(...) OVER (...)`로 나누던 비중 계산을 한 함수로 줄인다. 윈도우 전체 합에 대한 각 행의 비율을 돌려주므로, `PARTITION BY`를 어떻게 주느냐가 "전체 대비"인지 "그룹 내"인지를 결정한다.

```sql
SELECT emp_name, salary,
       ROUND(RATIO_TO_REPORT(salary) OVER (PARTITION BY department_id) * 100, 2) AS 부서내비중
FROM   employees;
```

## KEEP - 집계와 순위의 결합

`GROUP BY` 안에서 "최댓값을 가진 행의 다른 컬럼"을 뽑는다. 서브쿼리 없이 처리할 수 있어 편하다.

```sql
SELECT department_id,
       MAX(salary)                                              AS 최고급여,
       MAX(emp_name) KEEP (DENSE_RANK FIRST ORDER BY salary DESC) AS 최고급여자,
       MIN(emp_name) KEEP (DENSE_RANK LAST  ORDER BY salary DESC) AS 최저급여자
FROM   employees
GROUP  BY department_id;
```

## 계층 질의 - CONNECT BY

조직도, 카테고리 트리, 댓글 스레드처럼 자기 자신을 참조하는 데이터를 펼친다. 오라클 고유 문법이다.

```sql
SELECT LEVEL,
       LPAD(' ', (LEVEL - 1) * 3) || emp_name AS 조직도,
       employee_id, manager_id
FROM   employees
START  WITH manager_id IS NULL          -- 루트
CONNECT BY PRIOR employee_id = manager_id  -- 부모 → 자식 연결
ORDER  SIBLINGS BY emp_name;
```

핵심은 `PRIOR`의 위치다. **`PRIOR`가 붙은 쪽이 "이전(부모) 행"** 이다.

```sql
CONNECT BY PRIOR employee_id = manager_id   -- 하향식: 위에서 아래로
CONNECT BY employee_id = PRIOR manager_id   -- 상향식: 아래에서 위로
```

### 관련 의사 컬럼과 함수

| 이름 | 의미 |
| --- | --- |
| `LEVEL` | 깊이 (루트가 1) |
| `CONNECT_BY_ROOT 컬럼` | 루트 행의 값 |
| `SYS_CONNECT_BY_PATH(컬럼, 구분자)` | 루트부터의 경로 |
| `CONNECT_BY_ISLEAF` | 리프면 1 |
| `CONNECT_BY_ISCYCLE` | 순환이면 1 (`NOCYCLE` 필요) |
| `ORDER SIBLINGS BY` | 같은 부모 아래 정렬 |

```sql
SELECT emp_name,
       LEVEL,
       CONNECT_BY_ROOT emp_name              AS 최상위,
       SYS_CONNECT_BY_PATH(emp_name, ' > ')  AS 경로,
       CONNECT_BY_ISLEAF                     AS 리프여부
FROM   employees
START  WITH manager_id IS NULL
CONNECT BY PRIOR employee_id = manager_id;
```

데이터에 순환 참조가 있으면 `ORA-01436`이 난다. `CONNECT BY NOCYCLE`을 붙이면 순환 지점에서 멈춘다.

### 특정 노드의 하위 전체 / 상위 전체

```sql
-- 101번 사원 밑의 모든 사원
START WITH employee_id = 101 CONNECT BY PRIOR employee_id = manager_id

-- 105번 사원의 모든 상위 관리자
START WITH employee_id = 105 CONNECT BY employee_id = PRIOR manager_id
```

### 숫자·날짜 생성

`CONNECT BY LEVEL`은 계층과 상관없이 연속된 행을 만드는 데 쓰인다. [3편](/post/oracle-03-group-join)의 월 축 만들기가 이 용법이었다.

```sql
SELECT LEVEL AS n FROM dual CONNECT BY LEVEL <= 10;

-- 8월 날짜 전체
SELECT DATE '2026-08-01' + LEVEL - 1 AS d
FROM   dual
CONNECT BY LEVEL <= LAST_DAY(DATE '2026-08-01') - DATE '2026-08-01' + 1;
```

`CONNECT BY`와 4편의 재귀 `WITH` 중 무엇을 쓸지는, 오라클 전용이어도 되면 `CONNECT BY`(문법이 짧고 부가 함수가 많다), 이식성이 필요하면 재귀 CTE다.

## PIVOT / UNPIVOT

행을 열로, 열을 행으로 돌린다. 11g부터 문법이 생겼다.

```sql
SELECT * FROM (
  SELECT department_id, job_id, salary FROM employees
)
PIVOT (
  SUM(salary) AS sal, COUNT(*) AS cnt
  FOR job_id IN ('DEV' AS dev, 'SALES' AS sales, 'STAFF' AS staff)
)
ORDER BY department_id;
```

- 인라인 뷰에서 **필요한 컬럼만 남겨야 한다.** `PIVOT`은 명시되지 않은 나머지 컬럼 전부를 암묵적 `GROUP BY` 키로 쓰기 때문에, `SELECT *`로 넘기면 결과가 산산조각 난다.
- `FOR ... IN`의 값 목록은 **정적**이다. 동적 컬럼이 필요하면 PL/SQL로 SQL 문자열을 만들어야 한다.

`PIVOT` 문법 이전에는 `CASE` + 집계로 처리했고, 지금도 이 방식이 더 유연해서 자주 쓰인다.

```sql
SELECT department_id,
       SUM(CASE WHEN job_id = 'DEV'   THEN salary ELSE 0 END) AS dev,
       SUM(CASE WHEN job_id = 'SALES' THEN salary ELSE 0 END) AS sales,
       SUM(CASE WHEN job_id = 'STAFF' THEN salary ELSE 0 END) AS staff
FROM   employees
GROUP  BY department_id;
```

`UNPIVOT`은 반대 방향이다. 가로로 퍼진 컬럼(1월, 2월, …)을 세로로 펴서 정규화할 때 쓴다.

```sql
SELECT * FROM monthly_sales
UNPIVOT (amount FOR mon IN (jan AS '01', feb AS '02', mar AS '03'));
```

기본적으로 NULL 행은 제외한다. 남기려면 `UNPIVOT INCLUDE NULLS`를 쓴다.

## 정리

- 분석 함수는 행을 줄이지 않고 계산 결과를 붙인다
- `OVER`는 `SELECT`와 `ORDER BY`에만 쓸 수 있다 — 조건으로 쓰려면 인라인 뷰로 감싼다
- 그룹별 상위 N건 = `ROW_NUMBER() OVER (PARTITION BY ... ORDER BY ...)` + 바깥 `WHERE`
- `OVER`에 `ORDER BY`를 넣으면 누적이 된다. 행 단위 누적은 `ROWS`를 명시
- `LAST_VALUE`는 윈도우 절 없이 쓰면 자기 자신이 나온다
- 증감·전월대비는 `LAG`/`LEAD`
- 계층은 `CONNECT BY PRIOR`, `PRIOR`가 붙은 쪽이 부모
- `PIVOT`에 넘기는 인라인 뷰에는 필요한 컬럼만 남긴다

다음 편은 DML과 트랜잭션, 락이다.
