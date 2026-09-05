---
title: 오라클 DB 구조와 기본기, DDL 정리 - 인스턴스, 테이블스페이스, 제약조건 (오라클 학습 노트 1)
date: 2025-07-18
category: oracle
src: cover.svg
tags: [oracle, database, sql, ddl, 학습노트]
summary: 오라클 DB 기본기 정리. 인스턴스·테이블스페이스 구조, 데이터 타입, 테이블과 제약조건 같은 DDL, 실습 환경과 전체 학습 로드맵. 8부작 시리즈 첫 글.
---

## 이 시리즈에 대해

업무에서 오라클을 쓰게 되면서, 그동안 검색으로 때워온 것들을 한 번에 정리하기로 했다. 목표는 "실무에서 오라클로 SQL과 PL/SQL을 쓰는 개발자가 알아야 할 것"이다. DBA 영역(백업·복구, 파라미터 튜닝, RAC)은 필요한 만큼만 얕게 짚고 넘어간다.

전체 구성은 이렇다.

| 편 | 주제 |
| --- | --- |
| 1 | 구조와 기본기, 데이터 타입, DDL과 제약조건 |
| 2 | [SELECT와 단일행 함수](/post/oracle-02-select-functions) |
| 3 | [집계, GROUP BY, 조인](/post/oracle-03-group-join) |
| 4 | [서브쿼리, 집합 연산, WITH, MERGE](/post/oracle-04-subquery) |
| 5 | [분석 함수와 계층 질의](/post/oracle-05-analytic) |
| 6 | [DML, 트랜잭션, 락, 스키마 객체](/post/oracle-06-transaction) |
| 7 | [PL/SQL 전반](/post/oracle-07-plsql) |
| 8 | [인덱스, 실행계획, 튜닝](/post/oracle-08-tuning) |

이 시리즈의 모든 예제는 이 글 마지막에서 만드는 스키마 하나를 계속 재사용한다.

## 왜 "오라클"을 따로 공부해야 하나

SQL은 표준이 있지만, 실제로 표준만 쓰는 DB는 없다. MySQL이나 PostgreSQL을 쓰다가 오라클로 오면 다음 지점에서 반드시 걸린다.

- 빈 문자열이 NULL이다. `''`을 넣으면 NULL이 들어간다. 다른 DB에서는 길이 0인 문자열이다.
- `FROM` 절이 필수다. 상수만 조회할 때도 `SELECT 1 FROM DUAL`처럼 더미 테이블이 필요하다. (23ai부터는 생략 가능해졌지만 현장 버전은 대부분 11g~19c다.)
- `DATE`에 시·분·초가 들어있다. 날짜만 있는 타입이 아니다.
- 문자열 연결은 `||`, `CONCAT`은 인자를 두 개만 받는다.
- `LIMIT`이 없다. 12c 이전에는 `ROWNUM`, 12c부터는 `FETCH FIRST n ROWS ONLY`를 쓴다.
- NULL 정렬 기본값이 다르다. 오름차순에서 NULL이 뒤로 간다.
- 대소문자. 따옴표 없이 만든 식별자는 전부 대문자로 저장된다. `emp` 테이블을 만들면 딕셔너리에는 `EMP`로 들어간다.

이 차이들이 나중에 조용히 버그가 되기 때문에, 시작부터 오라클 기준으로 익히는 편이 낫다.

## 실습 환경 만들기

가장 부담 없는 건 Oracle Database Free(구 XE)를 컨테이너로 띄우는 방법이다.

```bash
docker run -d --name oracle-free \
  -p 1521:1521 \
  -e ORACLE_PWD=oracle \
  container-registry.oracle.com/database/free:latest
```

기동에 몇 분 걸린다. `docker logs -f oracle-free`에 `DATABASE IS READY TO USE!`가 뜨면 접속할 수 있다.

클라이언트는 세 가지 중 하나면 된다.

- SQL Developer - 오라클 공식. 실행계획, PL/SQL 디버깅까지 다 된다.
- DBeaver - 여러 DB를 같이 쓴다면 이쪽.
- SQL*Plus / SQLcl - CLI. 스크립트 자동화에는 결국 이걸 쓰게 된다.

```bash
# 컨테이너 안에서
docker exec -it oracle-free sqlplus sys/oracle@localhost:1521/FREEPDB1 as sysdba
```

## 인스턴스와 데이터베이스

오라클에서 자주 헷갈리는 첫 단어가 "데이터베이스"다. 오라클은 이 둘을 구분한다.

- 인스턴스(Instance) - 메모리 영역(SGA)과 백그라운드 프로세스의 집합. 휘발성이다.
- 데이터베이스(Database) - 디스크 위의 파일 집합. 데이터 파일, 컨트롤 파일, 리두 로그 파일.

즉 "DB를 재시작한다"는 건 인스턴스를 내렸다 올리는 것이고, 디스크의 파일은 그대로다.

### 메모리 구조 (개발자가 알아둘 만큼만)

- SGA (System Global Area) - 인스턴스 전체가 공유한다.
  - *버퍼 캐시*: 데이터 블록을 올려두는 곳. 여기서 읽으면 논리적 읽기, 없어서 디스크에서 읽으면 물리적 읽기다. 튜닝 이야기가 나오면 대부분 이 물리적 읽기를 줄이는 이야기다.
  - *공유 풀*: 파싱한 SQL과 실행계획을 캐시한다. 바인드 변수를 써야 하는 이유가 여기 있다. 리터럴을 그대로 박은 SQL은 값마다 다른 SQL로 인식돼 매번 하드 파싱이 일어나고 공유 풀을 오염시킨다.
  - *리두 로그 버퍼*: 변경 내역을 먼저 여기에 적는다.
- PGA (Program Global Area) - 세션마다 따로 갖는다. 정렬, 해시 조인의 작업 공간이 여기다. 이 공간이 모자라면 임시 테이블스페이스로 흘러넘치고(디스크 정렬), 눈에 띄게 느려진다.

### 저장 구조

```
테이블스페이스 (논리)  →  데이터 파일 (물리)
      └─ 세그먼트 (테이블, 인덱스 하나)
            └─ 익스텐트 (연속된 블록 묶음)
                  └─ 블록 (기본 8KB, I/O 최소 단위)
```

읽기의 최소 단위가 블록이라는 게 중요하다. 한 행만 필요해도 그 행이 든 블록 전체를 읽는다. [8편](/post/oracle-08-tuning)의 인덱스 이야기가 전부 여기서 출발한다.

## 사용자, 스키마, 그리고 접속

오라클에서 사용자(User) = 스키마(Schema) 다. 계정을 만들면 같은 이름의 스키마가 생기고, 그 계정이 만든 객체는 전부 그 스키마에 들어간다. MySQL의 "데이터베이스를 하나 더 만든다"에 해당하는 게 오라클에서는 "유저를 하나 더 만든다"이다.

12c부터는 멀티테넌트 구조라 계정을 만들 위치를 신경 써야 한다.

- CDB (Container Database) - 컨테이너 전체
- PDB (Pluggable Database) - 실제로 쓰는 데이터베이스. 위 컨테이너에서는 `FREEPDB1`

일반 계정은 PDB 안에 만든다.

```sql
-- SYSDBA로 접속한 상태
ALTER SESSION SET CONTAINER = FREEPDB1;

CREATE USER study IDENTIFIED BY study
  DEFAULT TABLESPACE users
  QUOTA UNLIMITED ON users;

GRANT CONNECT, RESOURCE TO study;
GRANT CREATE VIEW, CREATE SYNONYM TO study;
```

`CONNECT`는 접속 권한, `RESOURCE`는 테이블·시퀀스 등 자기 스키마에 객체를 만들 권한이다. 실습용이라 이 정도면 충분하다.

접속 문자열은 `계정/비밀번호@호스트:포트/서비스명` 형태다.

```bash
sqlplus study/study@localhost:1521/FREEPDB1
```

## 데이터 딕셔너리

오라클은 자기 자신에 대한 메타데이터를 뷰로 노출한다. 접두어 세 가지의 의미를 기억하면 된다.

| 접두어 | 범위 |
| --- | --- |
| `USER_` | 내가 소유한 객체 |
| `ALL_` | 내가 접근할 수 있는 객체 (남의 것 포함) |
| `DBA_` | 데이터베이스 전체 (권한 필요) |

자주 쓰는 것들.

```sql
SELECT table_name FROM user_tables;                    -- 내 테이블 목록
SELECT * FROM user_tab_columns WHERE table_name = 'EMPLOYEES';  -- 컬럼 정보
SELECT * FROM user_constraints WHERE table_name = 'EMPLOYEES';  -- 제약조건
SELECT * FROM user_indexes;                            -- 인덱스
SELECT * FROM user_source WHERE name = 'CALC_BONUS';   -- 프로시저 소스
SELECT * FROM user_objects WHERE status = 'INVALID';   -- 깨진 객체 찾기
```

테이블명은 대문자로 넣어야 한다. 앞에서 말한 "따옴표 없는 식별자는 대문자로 저장된다"가 여기서 바로 걸린다.

SQL*Plus/SQLcl에서는 `DESC` 한 줄이 더 빠르다.

```sql
DESC employees
```

## 데이터 타입

실무에서 실제로 쓰는 건 얼마 안 된다.

### 문자

| 타입 | 설명 |
| --- | --- |
| `VARCHAR2(n)` | 가변 길이. 문자열은 사실상 전부 이걸 쓴다. 최대 4000바이트(확장 시 32767) |
| `CHAR(n)` | 고정 길이. 남는 자리를 공백으로 채운다 |
| `CLOB` | 대용량 텍스트 |
| `NVARCHAR2` / `NCLOB` | 국가 문자 집합 사용 |

`CHAR`는 비교할 때 공백 패딩 때문에 사고가 난다. 코드값처럼 길이가 정확히 고정된 경우가 아니면 `VARCHAR2`를 쓴다. `VARCHAR`도 문법상 통과하지만 오라클이 "미래에 의미가 바뀔 수 있다"고 못박아둔 타입이라 쓰지 않는다.

바이트 vs 문자가 한글에서 특히 중요하다.

```sql
-- AL32UTF8 환경에서 한글 한 글자는 3바이트
name VARCHAR2(10)       -- 기본이 BYTE. 한글 3글자까지만 들어간다
name VARCHAR2(10 CHAR)  -- 한글 10글자
```

`NLS_LENGTH_SEMANTICS` 설정에 따라 기본값이 달라지므로, 한글이 들어가는 컬럼은 `CHAR`를 명시하거나 넉넉하게 잡는다.

### 숫자

```sql
NUMBER          -- 정밀도 지정 없음. 어떤 수든 들어간다
NUMBER(7)       -- 정수 7자리
NUMBER(9,2)     -- 전체 9자리, 소수점 아래 2자리
```

오라클의 `NUMBER`는 10진 기반이라 부동소수점 오차가 없다. 금액은 반드시 `NUMBER`로 잡는다. `BINARY_FLOAT` / `BINARY_DOUBLE`은 IEEE 754라 빠르지만 오차가 있어 과학 계산용이다.

스케일을 지정하면 반올림된다는 점에 주의한다. `NUMBER(9,2)` 컬럼에 `123.456`을 넣으면 `123.46`이 저장된다.

### 날짜

| 타입 | 설명 |
| --- | --- |
| `DATE` | 세기·년·월·일·시·분·초. 초 단위까지 항상 포함 |
| `TIMESTAMP` | 소수점 이하 초까지 (기본 6자리) |
| `TIMESTAMP WITH TIME ZONE` | 타임존 정보 포함 |
| `INTERVAL YEAR TO MONTH` | 기간 |
| `INTERVAL DAY TO SECOND` | 기간 |

`DATE`에 시분초가 들어있다는 사실이 가장 많은 버그를 만든다.

```sql
-- 오늘 등록된 건? 이렇게 쓰면 00:00:00인 행만 걸린다
WHERE reg_date = TRUNC(SYSDATE)          -- 틀림

-- 이렇게 쓴다
WHERE reg_date >= TRUNC(SYSDATE)
  AND reg_date <  TRUNC(SYSDATE) + 1     -- 맞음
```

`TRUNC(reg_date) = TRUNC(SYSDATE)`도 결과는 맞지만 컬럼에 함수를 씌워서 인덱스를 못 쓴다. 이 이야기는 8편에서 다시 한다.

### 그 외

- `BLOB` - 바이너리. 파일은 사실 DB 밖에 두고 경로만 저장하는 편이 낫다.
- `RAW` / `ROWID` - 원시 바이너리, 행의 물리 주소.
- `BOOLEAN` - SQL에는 없다. PL/SQL에만 있다(23ai에서 SQL에도 추가). 그래서 보통 `CHAR(1)`에 `'Y'`/`'N'`을 넣거나 `NUMBER(1)`에 1/0을 넣는다.

## DUAL

행이 하나뿐인 시스템 테이블이다. 오라클은 `SELECT`에 `FROM`이 필요하기 때문에 존재한다.

```sql
SELECT SYSDATE FROM dual;
SELECT 3 * 7 FROM dual;
SELECT 'hello' || ' ' || 'world' FROM dual;
```

## DDL - 테이블 만들기

```sql
CREATE TABLE departments (
  department_id    NUMBER(4)       NOT NULL,
  department_name  VARCHAR2(60)    NOT NULL,
  location         VARCHAR2(60),
  created_at       DATE            DEFAULT SYSDATE NOT NULL,
  CONSTRAINT pk_departments PRIMARY KEY (department_id)
);
```

컬럼 정의는 `이름 타입 [DEFAULT 값] [제약조건]` 순서다. `DEFAULT`가 `NOT NULL`보다 앞에 온다.

### 테이블 변경

```sql
ALTER TABLE employees ADD (phone VARCHAR2(20));
ALTER TABLE employees ADD (phone VARCHAR2(20), memo VARCHAR2(200));

ALTER TABLE employees MODIFY (phone VARCHAR2(30));      -- 타입/길이 변경
ALTER TABLE employees MODIFY (phone NOT NULL);           -- NULL 허용 여부

ALTER TABLE employees RENAME COLUMN phone TO tel;
ALTER TABLE employees DROP COLUMN memo;

ALTER TABLE employees SET UNUSED COLUMN memo;            -- 논리적으로만 제거 (빠름)
ALTER TABLE employees DROP UNUSED COLUMNS;               -- 나중에 실제 제거

RENAME employees TO emp;
```

컬럼 길이를 줄이는 것은 그 컬럼에 데이터가 없거나 전부 새 길이 안에 들어갈 때만 된다.

### 삭제

```sql
DROP TABLE employees;                    -- 휴지통으로
DROP TABLE employees PURGE;              -- 완전 삭제
DROP TABLE employees CASCADE CONSTRAINTS;-- 이 테이블을 참조하는 FK까지 함께 제거

TRUNCATE TABLE employees;                -- 데이터만 전부 삭제
```

`DELETE`와 `TRUNCATE`의 차이는 면접 단골이자 실무에서도 중요하다.

| | `DELETE` | `TRUNCATE` |
| --- | --- | --- |
| 분류 | DML | DDL |
| 롤백 | 가능 | 불가능 (암시적 커밋) |
| WHERE | 가능 | 불가능 |
| 속도 | 느림 | 빠름 |
| 저장 공간 | 반환 안 함 | HWM까지 초기화 |
| 트리거 | 동작 | 동작 안 함 |

DDL은 실행 즉시 커밋된다. `DROP`을 실수로 날린 뒤 `ROLLBACK`은 통하지 않는다. 다만 휴지통에서 되살릴 수는 있다.

```sql
SELECT * FROM user_recyclebin;
FLASHBACK TABLE employees TO BEFORE DROP;
PURGE RECYCLEBIN;
```

### 주석

```sql
COMMENT ON TABLE  employees IS '사원 마스터';
COMMENT ON COLUMN employees.salary IS '월 기본급 (원)';

SELECT * FROM user_col_comments WHERE table_name = 'EMPLOYEES';
```

붙여두면 나중에 본인이 가장 고마워한다.

## 제약조건

다섯 가지가 있다.

| 제약 | 의미 | 인덱스 |
| --- | --- | --- |
| `NOT NULL` | NULL 금지 | 없음 |
| `UNIQUE` | 중복 금지 (NULL은 여러 개 허용) | 자동 생성 |
| `PRIMARY KEY` | UNIQUE + NOT NULL, 테이블당 하나 | 자동 생성 |
| `FOREIGN KEY` | 다른 테이블의 PK/UK 값만 허용 | 자동 생성 안 됨 |
| `CHECK` | 조건식을 만족해야 함 | 없음 |

FK에는 인덱스가 자동으로 안 생긴다. 이것 때문에 부모 테이블을 `DELETE`할 때 자식 테이블 풀 스캔이 일어나고 락 경합이 생긴다. FK 컬럼에는 직접 인덱스를 만들어주는 게 원칙이다.

### 선언 방식

```sql
-- 컬럼 레벨
salary NUMBER(9,2) CONSTRAINT ck_emp_salary CHECK (salary > 0)

-- 테이블 레벨 (복합 키는 이 방식만 가능)
CONSTRAINT pk_emp_proj PRIMARY KEY (employee_id, project_id)
```

이름을 안 주면 `SYS_C0011234` 같은 이름이 붙는다. 오류 메시지에 이 이름이 그대로 나오기 때문에, `pk_`, `fk_`, `uk_`, `ck_` 접두어를 붙여 직접 짓는 편이 낫다.

### 나중에 추가·변경

```sql
ALTER TABLE employees ADD CONSTRAINT fk_emp_dept
  FOREIGN KEY (department_id) REFERENCES departments (department_id);

ALTER TABLE employees DROP CONSTRAINT fk_emp_dept;

ALTER TABLE employees DISABLE CONSTRAINT fk_emp_dept;   -- 잠시 끄기
ALTER TABLE employees ENABLE  CONSTRAINT fk_emp_dept;   -- 켜면서 기존 데이터 검증
ALTER TABLE employees ENABLE NOVALIDATE CONSTRAINT fk_emp_dept;  -- 앞으로 들어올 것만 검증
```

대량 적재할 때 제약조건을 껐다 켜면 훨씬 빠르다. 다만 켤 때 기존 데이터를 다 검사하므로, 신규 데이터만 보게 하려면 `NOVALIDATE`를 쓴다.

### 참조 무결성 옵션

```sql
FOREIGN KEY (department_id) REFERENCES departments (department_id)
  ON DELETE CASCADE      -- 부모가 지워지면 자식도 지운다
  
FOREIGN KEY (department_id) REFERENCES departments (department_id)
  ON DELETE SET NULL     -- 부모가 지워지면 자식 값을 NULL로
```

옵션을 주지 않으면 자식이 있는 부모는 삭제되지 않는다(`ORA-02292`). `ON UPDATE CASCADE`는 오라클에 없다.

## 실습용 스키마

앞으로 모든 편에서 이 스키마를 쓴다. `study` 계정으로 접속해 그대로 실행하면 된다. (위 DDL 예제를 이미 실행했다면 `DROP TABLE departments PURGE;`로 지우고 시작한다.)

```sql
CREATE TABLE departments (
  department_id   NUMBER(4),
  department_name VARCHAR2(60 CHAR) NOT NULL,
  location        VARCHAR2(60 CHAR),
  CONSTRAINT pk_departments PRIMARY KEY (department_id)
);

CREATE TABLE jobs (
  job_id     VARCHAR2(20),
  job_title  VARCHAR2(60 CHAR) NOT NULL,
  min_salary NUMBER(9),
  max_salary NUMBER(9),
  CONSTRAINT pk_jobs PRIMARY KEY (job_id),
  CONSTRAINT ck_jobs_salary CHECK (max_salary >= min_salary)
);

CREATE TABLE employees (
  employee_id    NUMBER(6),
  emp_name       VARCHAR2(60 CHAR) NOT NULL,
  email          VARCHAR2(100),
  hire_date      DATE              NOT NULL,
  job_id         VARCHAR2(20)      NOT NULL,
  salary         NUMBER(9,2)       NOT NULL,
  commission_pct NUMBER(3,2),
  manager_id     NUMBER(6),
  department_id  NUMBER(4),
  CONSTRAINT pk_employees  PRIMARY KEY (employee_id),
  CONSTRAINT uk_employees_email UNIQUE (email),
  CONSTRAINT fk_emp_job    FOREIGN KEY (job_id)        REFERENCES jobs (job_id),
  CONSTRAINT fk_emp_dept   FOREIGN KEY (department_id) REFERENCES departments (department_id),
  CONSTRAINT fk_emp_mgr    FOREIGN KEY (manager_id)    REFERENCES employees (employee_id),
  CONSTRAINT ck_emp_salary CHECK (salary > 0)
);

CREATE INDEX ix_emp_dept ON employees (department_id);
CREATE INDEX ix_emp_mgr  ON employees (manager_id);
CREATE INDEX ix_emp_job  ON employees (job_id);

CREATE TABLE orders (
  order_id    NUMBER(10),
  employee_id NUMBER(6)   NOT NULL,
  order_date  DATE        NOT NULL,
  amount      NUMBER(12,2) NOT NULL,
  status      VARCHAR2(20) DEFAULT 'NEW' NOT NULL,
  CONSTRAINT pk_orders PRIMARY KEY (order_id),
  CONSTRAINT fk_ord_emp FOREIGN KEY (employee_id) REFERENCES employees (employee_id),
  CONSTRAINT ck_ord_status CHECK (status IN ('NEW','PAID','SHIPPED','CANCELLED'))
);

CREATE INDEX ix_ord_emp_date ON orders (employee_id, order_date);
```

데이터도 넣어둔다.

```sql
INSERT INTO departments VALUES (10, '경영지원', '서울');
INSERT INTO departments VALUES (20, '개발',     '서울');
INSERT INTO departments VALUES (30, '영업',     '부산');
INSERT INTO departments VALUES (40, '인사',     '서울');

INSERT INTO jobs VALUES ('CEO',      '대표이사',   10000000, 30000000);
INSERT INTO jobs VALUES ('MANAGER',  '팀장',        6000000, 12000000);
INSERT INTO jobs VALUES ('DEV',      '개발자',      3500000,  9000000);
INSERT INTO jobs VALUES ('SALES',    '영업담당',    3000000,  8000000);
INSERT INTO jobs VALUES ('STAFF',    '사무직',      2800000,  5000000);

INSERT INTO employees VALUES (100, '김대표', 'ceo@ex.com',  DATE '2015-01-05', 'CEO',     25000000, NULL, NULL, 10);
INSERT INTO employees VALUES (101, '이개발', 'dev1@ex.com', DATE '2017-03-02', 'MANAGER', 11000000, NULL, 100,  20);
INSERT INTO employees VALUES (102, '박영업', 'sal1@ex.com', DATE '2017-07-15', 'MANAGER',  9500000, 0.10, 100,  30);
INSERT INTO employees VALUES (103, '최코더', 'dev2@ex.com', DATE '2019-05-20', 'DEV',      7200000, NULL, 101,  20);
INSERT INTO employees VALUES (104, '정개발', 'dev3@ex.com', DATE '2021-09-01', 'DEV',      5400000, NULL, 101,  20);
INSERT INTO employees VALUES (105, '한신입', 'dev4@ex.com', DATE '2024-02-19', 'DEV',      4100000, NULL, 101,  20);
INSERT INTO employees VALUES (106, '오세일', 'sal2@ex.com', DATE '2020-11-11', 'SALES',    5800000, 0.15, 102,  30);
INSERT INTO employees VALUES (107, '윤세일', 'sal3@ex.com', DATE '2022-06-30', 'SALES',    4600000, 0.12, 102,  30);
INSERT INTO employees VALUES (108, '강총무', 'stf1@ex.com', DATE '2018-04-10', 'STAFF',    4200000, NULL, 100,  10);
INSERT INTO employees VALUES (109, '서총무', NULL,          DATE '2023-01-16', 'STAFF',    3300000, NULL, 108,  10);

INSERT INTO orders VALUES (1001, 106, DATE '2026-06-03', 12500000, 'PAID');
INSERT INTO orders VALUES (1002, 107, DATE '2026-06-11',  4300000, 'PAID');
INSERT INTO orders VALUES (1003, 106, DATE '2026-07-02',  8800000, 'SHIPPED');
INSERT INTO orders VALUES (1004, 102, DATE '2026-07-19', 21000000, 'PAID');
INSERT INTO orders VALUES (1005, 107, DATE '2026-08-01',  2700000, 'CANCELLED');
INSERT INTO orders VALUES (1006, 106, DATE '2026-08-14',  9900000, 'NEW');
INSERT INTO orders VALUES (1007, 102, DATE '2026-08-25', 15400000, 'NEW');

COMMIT;
```

`DATE '2015-01-05'`는 ANSI 날짜 리터럴이다. `TO_DATE('2015-01-05','YYYY-MM-DD')`와 같지만 짧고, 세션 날짜 포맷에 영향받지 않아서 안전하다.

마지막의 `COMMIT`을 빼먹으면 안 된다. 오라클은 자동 커밋이 아니다. 이 이야기는 [6편](/post/oracle-06-transaction)에서 제대로 다룬다.

## 정리

이번 편에서 잡아야 할 것.

- 인스턴스(메모리·프로세스)와 데이터베이스(파일)는 다르다
- 읽기 단위는 블록이다 - 인덱스 이야기의 출발점
- 유저 = 스키마, 계정은 PDB 안에 만든다
- `USER_` / `ALL_` / `DBA_` 딕셔너리 뷰로 메타데이터를 본다
- 문자열은 `VARCHAR2`, 한글이 들어가면 `(n CHAR)`
- 금액은 `NUMBER`, 부동소수점 타입은 쓰지 않는다
- `DATE`에는 시분초가 있다 - 범위 조건으로 비교한다
- DDL은 즉시 커밋된다, `TRUNCATE`는 롤백되지 않는다
- FK 컬럼에는 인덱스를 직접 만들어준다

다음 편에서는 `SELECT`와 단일행 함수를 정리한다.
