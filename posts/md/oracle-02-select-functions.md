---
title: 오라클 DB 학습 노트 (2) - SELECT와 단일행 함수
date: 2025-08-04
category: oracle
src: cover.svg
tags: [oracle, sql, select, 함수, 학습노트]
summary: SELECT 문의 실행 순서부터 WHERE 조건, NULL의 함정, 문자·숫자·날짜·변환·조건 함수까지. 오라클에서 매일 쓰게 되는 문법을 한 번에 정리한다.
---

이 글의 예제는 1편에서 만든 스키마를 그대로 쓴다.

## SELECT의 논리적 실행 순서

작성 순서와 실행 순서가 다르다. 이걸 알아야 "왜 `WHERE`에서 컬럼 별칭을 못 쓰지?" 같은 의문이 풀린다.

```
작성 순서                실행 순서
SELECT      (5)   ←      (1) FROM
FROM        (1)          (2) WHERE
WHERE       (2)          (3) GROUP BY
GROUP BY    (3)          (4) HAVING
HAVING      (4)          (5) SELECT
ORDER BY    (6)          (6) ORDER BY
```

결론 두 가지.

- `SELECT`에서 붙인 별칭은 `WHERE` / `GROUP BY` / `HAVING`에서 **쓸 수 없다.** `SELECT`가 나중에 실행되기 때문이다.
- `ORDER BY`에서는 **쓸 수 있다.** `SELECT` 다음에 실행되기 때문이다.

```sql
SELECT salary * 12 AS annual_salary
FROM   employees
WHERE  annual_salary > 50000000;   -- ORA-00904: 잘못된 식별자

SELECT salary * 12 AS annual_salary
FROM   employees
WHERE  salary * 12 > 50000000      -- 이렇게 쓴다
ORDER  BY annual_salary DESC;      -- ORDER BY에서는 별칭 OK
```

## 기본 조회

```sql
SELECT * FROM employees;

SELECT employee_id, emp_name, salary FROM employees;

-- 별칭: AS는 생략 가능, 공백/대소문자 유지하려면 큰따옴표
SELECT emp_name AS 이름,
       salary   월급,
       salary * 12 "연봉(원)"
FROM   employees;

-- 중복 제거
SELECT DISTINCT department_id FROM employees;
SELECT DISTINCT department_id, job_id FROM employees;  -- 두 컬럼 조합 기준
```

`DISTINCT`는 정렬이나 해시 작업을 유발하므로 습관적으로 붙이지 않는다. 중복이 나온다면 대부분 조인 조건이 잘못된 것이다.

### 문자열 연결

```sql
SELECT emp_name || ' (' || job_id || ')' AS label FROM employees;
```

`+`는 숫자 덧셈이다. 문자열에 쓰면 `ORA-01722: 수치가 부적합합니다` 가 난다.

### 리터럴에 따옴표 넣기

```sql
SELECT 'It''s ok' FROM dual;              -- 작은따옴표 두 번
SELECT q'[It's ok]' FROM dual;            -- q 표기법 (읽기 편하다)
SELECT q'{경로: C:\temp\'a'}' FROM dual;
```

## WHERE 조건

### 비교와 논리 연산자

```sql
WHERE salary >= 5000000
WHERE job_id <> 'DEV'                 -- != , ^= 도 같다
WHERE salary BETWEEN 4000000 AND 8000000     -- 경계값 포함
WHERE department_id IN (20, 30)
WHERE emp_name LIKE '김%'
WHERE commission_pct IS NULL
```

연산 우선순위는 `NOT` > `AND` > `OR`이다. `OR`를 섞을 때는 반드시 괄호를 친다.

```sql
-- 의도: (개발팀이거나 영업팀) 이면서 연봉 500 이상
WHERE department_id = 20 OR department_id = 30 AND salary >= 5000000  -- 틀림
WHERE (department_id = 20 OR department_id = 30) AND salary >= 5000000 -- 맞음
```

### LIKE

- `%` — 0글자 이상
- `_` — 정확히 1글자

와일드카드 자체를 찾으려면 `ESCAPE`를 쓴다.

```sql
WHERE code LIKE 'A\_%' ESCAPE '\'   -- 'A_'로 시작하는 것
```

`LIKE '%foo%'`처럼 앞에 `%`가 오면 인덱스를 못 탄다. 이건 8편에서 다시 본다.

### NULL

오라클에서 가장 많이 실수하는 부분이다. NULL은 "값이 없음"이지 0도 빈 문자열도 아니다. **NULL과의 모든 비교 연산은 참도 거짓도 아닌 UNKNOWN**이다.

```sql
WHERE commission_pct = NULL      -- 아무것도 안 나온다
WHERE commission_pct IS NULL     -- 이렇게 써야 한다
```

파생되는 규칙들.

```sql
SELECT NULL + 100        FROM dual;  -- NULL (연산에 NULL이 끼면 결과도 NULL)
SELECT 'a' || NULL       FROM dual;  -- 'a'  (문자열 연결만 예외)
SELECT NVL(NULL, 0) + 100 FROM dual; -- 100
```

`NOT IN`에 NULL이 섞이면 결과가 아예 비어버린다. 이건 4편 서브쿼리에서 크게 문제가 되는데, 원리는 여기서 나온다.

```sql
SELECT * FROM employees WHERE department_id NOT IN (10, 20, NULL);
-- 한 건도 안 나온다. NOT IN은 <> AND <> AND <> 로 풀리는데
-- 마지막 "<> NULL"이 UNKNOWN이라 전체가 참이 될 수 없다
```

## ORDER BY

```sql
ORDER BY salary DESC, emp_name ASC       -- ASC가 기본
ORDER BY 2 DESC                          -- SELECT 목록의 2번째 (권장하지 않음)
ORDER BY salary DESC NULLS LAST          -- NULL 위치 지정
```

**오라클의 NULL 정렬 기본값**: `ASC`면 NULL이 마지막, `DESC`면 NULL이 처음이다. 다른 DB와 반대인 경우가 많아서 `NULLS FIRST` / `NULLS LAST`를 명시하는 게 안전하다.

한글은 기본적으로 유니코드 코드 포인트 순으로 정렬된다. 사전 순이 필요하면 `NLSSORT`를 쓴다.

```sql
ORDER BY NLSSORT(emp_name, 'NLS_SORT=KOREAN_M')
```

## 행 제한 - ROWNUM과 FETCH

오라클에는 `LIMIT`이 없다.

### 12c 이상

```sql
SELECT emp_name, salary
FROM   employees
ORDER  BY salary DESC
FETCH FIRST 3 ROWS ONLY;

-- 페이징
SELECT emp_name, salary
FROM   employees
ORDER  BY salary DESC
OFFSET 10 ROWS FETCH NEXT 10 ROWS ONLY;

-- 동점자까지 함께
FETCH FIRST 3 ROWS WITH TIES;
```

### 11g 이하 (ROWNUM)

`ROWNUM`은 **결과 행이 확정될 때마다 1부터 붙는 의사 컬럼**이다. 여기에 함정이 있다.

```sql
-- 연봉 상위 3명? 아니다.
SELECT emp_name, salary FROM employees
WHERE ROWNUM <= 3 ORDER BY salary DESC;
-- 아무 3명을 뽑은 다음 정렬한 결과다
```

`ROWNUM`은 `ORDER BY`보다 먼저 매겨진다. 따라서 반드시 정렬을 인라인 뷰 안에서 끝내야 한다.

```sql
SELECT * FROM (
  SELECT emp_name, salary FROM employees ORDER BY salary DESC
)
WHERE ROWNUM <= 3;
```

페이징은 한 겹 더 감싼다.

```sql
SELECT * FROM (
  SELECT a.*, ROWNUM rn FROM (
    SELECT emp_name, salary FROM employees ORDER BY salary DESC
  ) a
  WHERE ROWNUM <= 20            -- 여기서 미리 잘라야 빠르다
)
WHERE rn > 10;
```

`ROWNUM > 1` 같은 조건은 **절대 참이 될 수 없다.** 첫 행이 조건을 만족해야 1번이 확정되는데, 조건 자체가 그걸 막기 때문이다.

## 단일행 함수 - 문자

| 함수 | 설명 | 예 |
| --- | --- | --- |
| `UPPER` / `LOWER` / `INITCAP` | 대소문자 | `INITCAP('hello world')` → `Hello World` |
| `LENGTH` / `LENGTHB` | 문자 수 / 바이트 수 | `LENGTHB('한글')` → 6 |
| `SUBSTR(s, pos, len)` | 부분 문자열, **1부터 시작** | `SUBSTR('20260831', 5, 2)` → `08` |
| `INSTR(s, sub, pos, n)` | 위치 찾기, 없으면 0 | `INSTR('a@b.com','@')` → 2 |
| `REPLACE(s, from, to)` | 치환 | `REPLACE('a-b-c','-','')` → `abc` |
| `TRANSLATE(s, from, to)` | 문자 1:1 치환 | `TRANSLATE('abc','ab','xy')` → `xyc` |
| `TRIM` / `LTRIM` / `RTRIM` | 공백·문자 제거 | `LTRIM('000123','0')` → `123` |
| `LPAD` / `RPAD(s, n, ch)` | 자릿수 채우기 | `LPAD('7', 3, '0')` → `007` |
| `CONCAT(a, b)` | 연결 (인자 2개) | `\|\|`를 쓰는 게 낫다 |
| `REGEXP_SUBSTR` / `REGEXP_REPLACE` / `REGEXP_LIKE` | 정규식 | |

`SUBSTR`의 음수 위치는 뒤에서부터 센다.

```sql
SELECT SUBSTR('20260831', -2) FROM dual;   -- '31'
```

`INSTR`은 없을 때 0을 반환하므로 `IS NULL` 대신 `> 0`으로 판정한다.

```sql
-- 이메일 도메인 추출
SELECT email,
       SUBSTR(email, INSTR(email, '@') + 1) AS domain
FROM   employees
WHERE  email IS NOT NULL;
```

정규식도 자주 쓴다.

```sql
SELECT REGEXP_REPLACE('010-1234-5678', '[^0-9]', '') FROM dual;  -- 01012345678
SELECT * FROM employees WHERE REGEXP_LIKE(emp_name, '^[김이박]');
```

## 단일행 함수 - 숫자

| 함수 | 설명 |
| --- | --- |
| `ROUND(n, d)` | 반올림. `d` 생략 시 0 |
| `TRUNC(n, d)` | 버림 |
| `CEIL(n)` / `FLOOR(n)` | 올림 / 내림 |
| `MOD(m, n)` | 나머지 |
| `ABS(n)` | 절댓값 |
| `POWER(m, n)` / `SQRT(n)` | 거듭제곱 / 제곱근 |
| `SIGN(n)` | 부호 (-1, 0, 1) |

`d`에 음수를 주면 정수부에서 자른다. 실무에서 은근히 자주 쓴다.

```sql
SELECT ROUND(1234.5678,  2) FROM dual;  -- 1234.57
SELECT ROUND(1234.5678, -2) FROM dual;  -- 1200
SELECT TRUNC(1234.5678, -3) FROM dual;  -- 1000
```

`MOD`는 0으로 나눠도 오류가 아니라 원래 값을 돌려준다. 반면 `/ 0`은 `ORA-01476`이다.

## 단일행 함수 - 날짜

`DATE`끼리 빼면 **일 수(숫자)** 가 나온다. 여기에 소수점이 붙는다는 게 포인트다.

```sql
SELECT SYSDATE - hire_date FROM employees;   -- 근무 일수 (소수 포함)
SELECT TRUNC(SYSDATE - hire_date) FROM employees;
```

| 함수 | 설명 |
| --- | --- |
| `SYSDATE` | DB 서버 시각 (DATE) |
| `SYSTIMESTAMP` | DB 서버 시각 (TIMESTAMP, 타임존 포함) |
| `CURRENT_DATE` | **세션** 타임존 기준 시각 |
| `ADD_MONTHS(d, n)` | n개월 후 |
| `MONTHS_BETWEEN(d1, d2)` | 개월 차 (소수 포함) |
| `NEXT_DAY(d, '월요일')` | 다음 요일 |
| `LAST_DAY(d)` | 그 달의 말일 |
| `TRUNC(d, fmt)` | 날짜 절삭 |
| `ROUND(d, fmt)` | 날짜 반올림 |
| `EXTRACT(YEAR FROM d)` | 구성 요소 추출 |

`TRUNC`의 포맷이 특히 유용하다.

```sql
SELECT TRUNC(SYSDATE)          FROM dual;  -- 오늘 00:00:00
SELECT TRUNC(SYSDATE, 'MM')    FROM dual;  -- 이번 달 1일
SELECT TRUNC(SYSDATE, 'YYYY')  FROM dual;  -- 올해 1월 1일
SELECT TRUNC(SYSDATE, 'IW')    FROM dual;  -- 이번 주 월요일
SELECT TRUNC(SYSDATE, 'HH')    FROM dual;  -- 정시
```

`ADD_MONTHS`는 말일 보정을 해준다. `2026-01-31`에 1개월을 더하면 `2026-02-28`이다.

날짜 산술의 단위는 **일**이다.

```sql
SYSDATE + 1          -- 하루 뒤
SYSDATE + 1/24       -- 1시간 뒤
SYSDATE + 10/1440    -- 10분 뒤
SYSDATE + 30/86400   -- 30초 뒤
```

### 기간 조회의 정석

```sql
-- 8월 주문
SELECT * FROM orders
WHERE  order_date >= DATE '2026-08-01'
  AND  order_date <  DATE '2026-09-01';
```

`BETWEEN '2026-08-01' AND '2026-08-31'`은 8월 31일 00:00:00 이후 데이터를 놓친다. 컬럼이 `DATE`면 항상 `>= 시작` / `< 다음 시작` 패턴으로 쓴다.

## 변환 함수

암시적 변환에 기대지 말고 항상 명시적으로 변환한다.

### TO_CHAR - 날짜

```sql
SELECT TO_CHAR(SYSDATE, 'YYYY-MM-DD HH24:MI:SS') FROM dual;
SELECT TO_CHAR(SYSDATE, 'YYYY"년" MM"월" DD"일"') FROM dual;
SELECT TO_CHAR(SYSDATE, 'DAY', 'NLS_DATE_LANGUAGE=KOREAN') FROM dual;
```

| 포맷 | 의미 |
| --- | --- |
| `YYYY` / `RRRR` | 4자리 연도 |
| `MM` / `MON` / `MONTH` | 월 |
| `DD` / `DDD` / `D` | 일 / 연중 일 / 요일 번호 |
| `DAY` / `DY` | 요일명 |
| `HH24` / `HH12` | 24시간 / 12시간 |
| `MI` / `SS` | 분 / 초 |
| `Q` / `WW` / `IW` | 분기 / 주 / ISO 주 |

**`MM`과 `MI`를 헷갈리면 안 된다.** `HH:MM:SS`로 쓰면 분 자리에 월이 나온다. 실제로 자주 나오는 버그다.

### TO_CHAR - 숫자

```sql
SELECT TO_CHAR(1234567.891, '999,999,999.99')  FROM dual;  -- ' 1,234,567.89'
SELECT TO_CHAR(1234567,     'FM999,999,999')   FROM dual;  -- '1,234,567' (공백 제거)
SELECT TO_CHAR(1234567,     'L999,999,999')    FROM dual;  -- 통화 기호
SELECT TO_CHAR(0.35,        'FM990.00')        FROM dual;  -- '0.35'
```

- `9` — 자리 없으면 공백
- `0` — 자리 없으면 0으로 채움
- `FM` — 앞뒤 공백 제거 (양수 부호 자리)

### TO_DATE / TO_NUMBER

```sql
SELECT TO_DATE('2026-08-31 14:30', 'YYYY-MM-DD HH24:MI') FROM dual;
SELECT TO_NUMBER('1,234,567', '999,999,999') FROM dual;
```

12c 이상에서는 변환 실패를 예외 대신 NULL로 받을 수 있다. 데이터 정제할 때 아주 편하다.

```sql
SELECT TO_NUMBER('abc' DEFAULT NULL ON CONVERSION ERROR) FROM dual;  -- NULL
SELECT TO_DATE('20261332','YYYYMMDD' DEFAULT NULL ON CONVERSION ERROR) FROM dual;
```

### 암시적 변환의 위험

```sql
-- emp_no가 VARCHAR2인데 숫자로 비교하면
WHERE emp_no = 1001
-- 오라클은 TO_NUMBER(emp_no) = 1001 로 바꾼다
-- 컬럼에 함수가 씌워져 인덱스를 못 타고, 숫자가 아닌 값이 하나라도 있으면 ORA-01722
WHERE emp_no = '1001'   -- 이렇게 타입을 맞춘다
```

문자와 숫자를 비교하면 **문자 쪽이 숫자로 변환**된다. 이 방향을 기억해두면 인덱스가 안 먹는 원인을 빨리 찾을 수 있다.

## NULL 처리 함수

```sql
NVL(expr, 대체값)                 -- expr이 NULL이면 대체값
NVL2(expr, NULL아닐때, NULL일때)  -- 3항
NULLIF(a, b)                      -- a = b면 NULL, 아니면 a
COALESCE(a, b, c, ...)            -- 처음 만나는 NULL 아닌 값
```

```sql
SELECT emp_name,
       salary,
       NVL(commission_pct, 0)                        AS comm,
       salary * (1 + NVL(commission_pct, 0))         AS total,
       NVL2(commission_pct, '인센티브', '고정급')     AS pay_type,
       COALESCE(email, '(미등록)')                    AS email
FROM   employees;
```

`NVL`은 두 인자의 타입이 같아야 하고 둘 다 평가한다. `COALESCE`는 필요한 만큼만 평가하고 인자 개수 제한이 없어서, 인자가 두 개여도 `COALESCE`를 쓰는 습관이 나쁘지 않다.

## 조건 함수

### DECODE

오라클 전용. 등가 비교만 가능하다.

```sql
SELECT emp_name,
       DECODE(department_id,
              10, '경영지원',
              20, '개발',
              30, '영업',
                  '기타') AS dept
FROM   employees;
```

`DECODE`는 NULL도 비교할 수 있다는 독특한 성질이 있다. `DECODE(col, NULL, '없음', col)`이 동작한다.

### CASE

표준 문법이고 범위 비교가 된다. 새로 짜는 코드는 `CASE`를 쓴다.

```sql
-- 단순 CASE
CASE department_id WHEN 10 THEN '경영지원' WHEN 20 THEN '개발' ELSE '기타' END

-- 검색 CASE
SELECT emp_name, salary,
       CASE WHEN salary >= 10000000 THEN 'A'
            WHEN salary >=  6000000 THEN 'B'
            WHEN salary >=  4000000 THEN 'C'
            ELSE 'D'
       END AS grade
FROM employees;
```

`ELSE`를 생략하면 조건에 안 걸린 행은 NULL이 된다. 의도한 게 아니라면 항상 `ELSE`를 넣는다.

`CASE`는 위에서부터 순서대로 평가하고 처음 참인 곳에서 멈춘다. 조건 순서가 결과를 바꾼다.

## 실전 조합 예제

지금까지 나온 걸 묶어보면 이런 쿼리가 된다.

```sql
SELECT e.employee_id,
       RPAD(e.emp_name, 10)                                AS 이름,
       TO_CHAR(e.hire_date, 'YYYY-MM-DD')                  AS 입사일,
       TRUNC(MONTHS_BETWEEN(SYSDATE, e.hire_date) / 12)    AS 근속년수,
       TO_CHAR(e.salary, 'FM999,999,999')                  AS 월급,
       TO_CHAR(e.salary * 12 * (1 + NVL(e.commission_pct, 0)),
               'FM999,999,999')                            AS 예상연봉,
       CASE WHEN e.commission_pct IS NULL THEN '고정급'
            ELSE TO_CHAR(e.commission_pct * 100) || '%'
       END                                                 AS 인센티브,
       NVL(SUBSTR(e.email, 1, INSTR(e.email, '@') - 1), '-') AS 계정
FROM   employees e
WHERE  e.hire_date < ADD_MONTHS(TRUNC(SYSDATE), -12)
ORDER  BY e.salary DESC NULLS LAST;
```

## 정리

- 실행 순서는 `FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY`. 별칭은 `ORDER BY`에서만 쓸 수 있다
- NULL 비교는 `IS NULL`, 연산에 NULL이 끼면 결과도 NULL, `NOT IN (…, NULL)`은 항상 공집합
- 오라클은 `ASC`에서 NULL이 뒤로 간다 — `NULLS FIRST/LAST`를 명시하자
- 행 제한은 12c부터 `FETCH FIRST`, 이전에는 인라인 뷰 + `ROWNUM`
- `DATE` 비교는 `>= 시작 AND < 다음시작`
- 날짜 포맷의 분은 `MI`다 (`MM`은 월)
- 타입이 다른 비교는 암시적 변환을 부르고 인덱스를 죽인다
- 조건 분기는 `CASE`, 오라클 코드에서 만나는 `DECODE`는 읽을 줄만 알면 된다

다음 편은 집계 함수와 `GROUP BY`, 그리고 조인이다.
