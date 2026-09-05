---
title: Docker Compose 정리 - 여러 컨테이너를 파일 하나로 묶기 (도커 학습 노트 7)
date: 2026-02-06
category: docker
src: cover.svg
tags: [docker, docker-compose, 개발환경, 학습노트]
summary: 여러 컨테이너를 파일 하나로 정의하는 Compose. 서비스 정의 필드 전체와 depends_on의 헬스체크 조건, 환경변수 치환과 .env, 프로파일과 여러 파일 병합으로 개발·운영 환경을 나누는 방법까지 정리한다.
---

> 도커 학습 노트 시리즈 7편. [6편](/post/docker-06-network)까지 컨테이너를 하나씩 띄우고 네트워크와 볼륨을 손으로 붙여봤다. 이번에는 그 전부를 파일 하나로 묶는다.

## 왜 필요한가

6편까지 오면 명령어가 이 지경이 된다.

```bash
docker network create appnet
docker volume create pgdata
docker run -d --name db --network appnet -v pgdata:/var/lib/postgresql/data \
  -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=appdb postgres:16-alpine
docker run -d --name api --network appnet -p 8080:8080 \
  -e DATABASE_URL=postgres://postgres:secret@db:5432/appdb myapi:1.0
docker run -d --name web --network appnet -p 80:80 \
  -v ./nginx.conf:/etc/nginx/conf.d/default.conf:ro nginx:alpine
```

이걸 매번 치거나 셸 스크립트로 관리하는 대신, 선언적인 파일 하나로 적는 게 Compose다.

```bash
docker compose up -d     # 위 다섯 개 명령이 이 한 줄로
docker compose down      # 정리도 한 줄로
```

Compose가 주는 건 편의만이 아니다. 네트워크와 볼륨을 알아서 만들고, 서비스 이름으로 DNS가 통하고, 구성이 git에 커밋되는 텍스트가 된다.

### V1과 V2

- `docker-compose` (하이픈, 파이썬) - V1. 지원이 끝났다
- `docker compose` (공백, Go 플러그인) - V2. 지금의 표준

파일 이름은 `compose.yaml`이 현재의 정식 이름이지만 `docker-compose.yml`도 그대로 인식된다. 맨 위의 `version: "3.8"` 줄은 더 이상 쓰지 않는다. 넣으면 경고가 뜬다.

## 기본 구조

```yaml
name: myapp            # 프로젝트 이름 (없으면 디렉터리 이름)

services:              # 컨테이너들
  api:
    image: myapi:1.0
  db:
    image: postgres:16-alpine

volumes:               # 이름 있는 볼륨
  pgdata:

networks:              # 네트워크 (안 적으면 default 하나가 자동 생성)
  backend:
```

아무것도 안 적어도 `<프로젝트명>_default` 네트워크가 자동으로 만들어지고 모든 서비스가 거기 붙는다. 6편에서 본 "사용자 정의 네트워크를 써야 이름 해석이 된다"가 자동으로 해결된다. 서비스 이름이 곧 호스트명이다.

## 첫 예제

```yaml
name: myapp

services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: appdb
      TZ: Asia/Seoul
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app -d appdb"]
      interval: 5s
      timeout: 3s
      retries: 10
      start_period: 10s
    restart: unless-stopped

  api:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgres://app:secret@db:5432/appdb
      NODE_ENV: production
    ports:
      - "127.0.0.1:8080:8080"
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  web:
    image: nginx:1.27-alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - api
    restart: unless-stopped

volumes:
  pgdata:
```

`DATABASE_URL`의 호스트가 `db`인 것에 주목한다. 서비스 이름이다. 포트도 호스트 매핑이 아니라 컨테이너의 원래 포트 5432다.

## 명령어

```bash
docker compose up -d              # 생성 + 시작 (백그라운드)
docker compose up -d --build      # 이미지를 다시 빌드하고 시작
docker compose up -d api          # 특정 서비스만 (의존성도 같이 뜬다)
docker compose down               # 컨테이너와 네트워크 삭제
docker compose down -v            # 볼륨까지 삭제 ← 데이터가 날아간다
docker compose down --rmi local   # 이미지까지

docker compose ps                 # 상태
docker compose logs -f api        # 로그
docker compose logs -f --tail 100 # 전체 서비스
docker compose exec api sh        # 실행 중인 컨테이너에 들어가기
docker compose run --rm api npm run migrate   # 일회성 명령 (새 컨테이너)
docker compose restart api
docker compose stop / start
docker compose build --no-cache api
docker compose pull               # 이미지 갱신
docker compose config             # 병합·치환 결과를 최종 YAML로 출력
```

두 가지를 구분해두면 좋다.

- `exec` - 이미 도는 컨테이너 안에서 실행. 로그 확인, 디버깅
- `run` - 새 컨테이너를 하나 더 만들어 실행. 마이그레이션, 배치 작업. `--rm`을 붙이지 않으면 컨테이너가 계속 쌓인다

`docker compose config`는 디버깅에 아주 유용하다. 환경변수 치환과 파일 병합이 끝난 최종 결과를 보여주므로, "왜 이 값이 안 들어갔지"를 곧바로 확인할 수 있다.

`down -v`는 조심한다. 개발 환경을 초기화할 때는 편하지만 DB 볼륨이 통째로 사라진다.

## 서비스 정의 필드

자주 쓰는 것들을 갈래로 묶으면 이렇다.

### 이미지와 빌드

```yaml
services:
  api:
    image: ghcr.io/honggibeom/myapi:1.4.2   # 쓸 이미지 (build와 같이 쓰면 빌드 결과에 붙는 태그)
    build:
      context: .
      dockerfile: Dockerfile
      target: production          # 멀티스테이지의 특정 스테이지까지만
      args:                       # Dockerfile 의 ARG
        NODE_VERSION: "20.11"
      cache_from:
        - ghcr.io/honggibeom/myapi:buildcache
    pull_policy: always
```

### 실행

```yaml
    command: ["node", "server.js"]    # CMD 덮어쓰기
    entrypoint: ["/entrypoint.sh"]
    working_dir: /app
    user: "1000:1000"
    init: true                         # PID 1 에 init 삽입 (좀비 수거)
    stop_grace_period: 30s             # SIGKILL 까지의 유예
    stop_signal: SIGQUIT
    tty: true
    stdin_open: true                   # -it 에 해당
```

### 환경변수

```yaml
    environment:
      NODE_ENV: production
      DATABASE_URL: postgres://app:secret@db:5432/appdb
      API_KEY: ${API_KEY}              # 호스트 환경 또는 .env 에서
    env_file:
      - .env
      - .env.local
```

### 포트와 네트워크

```yaml
    ports:
      - "8080:8080"
      - "127.0.0.1:5432:5432"
      - "3000"                # 호스트 포트 랜덤
    expose:
      - "9090"                # 문서화용 (다른 컨테이너에서만 접근)
    networks:
      - frontend
      - backend
    extra_hosts:
      - "host.docker.internal:host-gateway"
    dns:
      - 8.8.8.8
```

### 볼륨

```yaml
    volumes:
      - pgdata:/var/lib/postgresql/data        # 이름 있는 볼륨
      - ./src:/app/src                          # 바인드 마운트 (상대 경로 가능!)
      - ./nginx.conf:/etc/nginx/nginx.conf:ro   # 읽기 전용
      - /app/node_modules                       # 익명 볼륨 (덮어쓰기 방지)
      - type: bind                              # 긴 문법
        source: ./data
        target: /data
        read_only: true
    tmpfs:
      - /tmp
```

Compose에서는 `./` 상대 경로를 쓸 수 있다. 기준은 compose 파일이 있는 디렉터리다. CLI와 다른 점이다.

### 의존성과 헬스체크

```yaml
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 20s
    depends_on:
      db:
        condition: service_healthy
      migrator:
        condition: service_completed_successfully
```

여기가 Compose에서 가장 중요한 부분이다.

`depends_on`만 쓰면 "시작 순서"만 보장한다. DB 컨테이너가 뜨자마자 다음 서비스를 시작하는데, PostgreSQL은 그때 아직 접속을 받을 준비가 안 되어 있다. 그래서 API가 `connection refused`로 죽는다.

`condition: service_healthy`를 붙이면 헬스체크가 통과할 때까지 기다린다. 조건은 셋이다.

| condition | 의미 |
| --- | --- |
| `service_started` | 컨테이너가 시작되면 (기본값) |
| `service_healthy` | 헬스체크가 healthy가 되면 |
| `service_completed_successfully` | 종료 코드 0으로 끝나면 (마이그레이션용) |

다만 이것도 완벽하지 않다. 운영 중에 DB가 잠깐 죽었다 살아나는 경우는 여전히 있으므로, 애플리케이션에 재연결·재시도 로직을 넣는 것이 근본 해법이다. Compose의 조건은 개발 환경에서의 편의로 본다.

### 재시작과 리소스

```yaml
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: "1.5"
          memory: 512M
        reservations:
          memory: 256M
```

`deploy`는 원래 Swarm용 필드였지만, `resources.limits`는 `docker compose up`에서도 적용된다.

### 로깅과 보안

```yaml
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
    read_only: true
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
    security_opt:
      - no-new-privileges:true
```

[3편](/post/docker-03-run-lifecycle)에서 본 로그 크기 제한을 여기서 서비스별로 걸어둘 수 있다. 보안 옵션은 [8편](/post/docker-08-optimize-operate)에서 다룬다.

## 환경변수와 .env

Compose는 파일과 같은 디렉터리의 `.env`를 자동으로 읽어서 YAML 안의 `${...}`를 치환한다.

`.env`:

```bash
POSTGRES_PASSWORD=secret
API_PORT=8080
IMAGE_TAG=1.4.2
```

`compose.yaml`:

```yaml
services:
  api:
    image: ghcr.io/honggibeom/myapi:${IMAGE_TAG}
    ports:
      - "${API_PORT}:8080"
    environment:
      DB_PASSWORD: ${POSTGRES_PASSWORD:?POSTGRES_PASSWORD 가 필요합니다}
      LOG_LEVEL: ${LOG_LEVEL:-info}
```

치환 문법이 몇 가지 있다.

| 문법 | 의미 |
| --- | --- |
| `${VAR}` | 없으면 빈 문자열 |
| `${VAR:-기본값}` | 비었거나 없으면 기본값 |
| `${VAR-기본값}` | 없을 때만 기본값 (빈 문자열은 그대로) |
| `${VAR:?메시지}` | 비었거나 없으면 에러로 중단 |

필수 값에 `:?`를 걸어두면 설정 누락을 실행 시점에 곧바로 잡을 수 있다.

`.env`와 `env_file`을 혼동하지 않는 게 중요하다.

- `.env` - Compose 파일 자체의 변수 치환에 쓰인다
- `env_file:` - 컨테이너 안으로 전달할 환경변수 목록이다

`.env`는 반드시 `.gitignore`에 넣고, `.env.example`만 커밋한다.

## 프로파일

특정 서비스를 평소에는 띄우지 않게 한다.

```yaml
services:
  api:
    image: myapi:1.0

  adminer:
    image: adminer
    ports: ["8081:8080"]
    profiles: ["debug"]

  seed:
    build: .
    command: ["npm", "run", "seed"]
    profiles: ["tools"]
```

```bash
docker compose up -d                      # api 만
docker compose --profile debug up -d      # api + adminer
docker compose run --rm seed              # 프로파일 서비스는 run 으로 바로 실행 가능
```

DB 관리 도구, 부하 테스트 도구, 시드 스크립트처럼 가끔만 필요한 것을 여기에 둔다.

## 파일 나누기

개발과 운영을 한 파일에 다 담으면 지저분해진다. Compose는 여러 파일을 병합한다.

`compose.yaml` (공통):

```yaml
services:
  api:
    build: .
    environment:
      DATABASE_URL: postgres://app:secret@db:5432/appdb
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: appdb
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app"]
      interval: 5s
      retries: 10
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

`compose.override.yaml` (개발용, 자동으로 병합된다):

```yaml
services:
  api:
    build:
      target: development
    command: ["npm", "run", "dev"]
    environment:
      NODE_ENV: development
    volumes:
      - ./src:/app/src
      - /app/node_modules
    ports:
      - "8080:8080"
      - "9229:9229"        # 디버거

  db:
    ports:
      - "127.0.0.1:5432:5432"   # 개발 중엔 DB 툴로 붙을 수 있게
```

`compose.prod.yaml` (운영용, 명시적으로 지정):

```yaml
services:
  api:
    image: ghcr.io/honggibeom/myapi:${IMAGE_TAG}
    build: !reset null        # 운영에서는 빌드하지 않고 이미지를 받는다
    restart: always
    deploy:
      resources:
        limits:
          memory: 512M
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
```

```bash
docker compose up -d                                   # compose.yaml + override (개발)
docker compose -f compose.yaml -f compose.prod.yaml up -d   # 운영
```

병합 규칙에서 헷갈리기 쉬운 부분.

- 스칼라 값(`image`, `command`)은 뒤 파일이 덮어쓴다
- 리스트(`ports`, `volumes`, `environment`의 배열 형태)는 합쳐진다. 지우려면 `!reset`을 쓴다
- 매핑 형태의 `environment`는 키 단위로 덮어쓴다

`docker compose -f a.yaml -f b.yaml config`로 결과를 항상 확인하는 습관이 안전하다.

### YAML 앵커로 중복 줄이기

```yaml
x-common: &common
  restart: unless-stopped
  logging:
    driver: json-file
    options:
      max-size: "10m"
      max-file: "3"

services:
  api:
    <<: *common
    image: myapi:1.0
  worker:
    <<: *common
    image: myapi:1.0
    command: ["node", "worker.js"]
```

`x-`로 시작하는 최상위 키는 Compose가 무시하므로 조각을 정의해두는 용도로 쓴다.

## 개발 환경에서의 파일 동기화

바인드 마운트 대신 Compose가 파일 변경을 감지해 동기화하는 기능도 있다.

```yaml
services:
  api:
    build: .
    develop:
      watch:
        - action: sync
          path: ./src
          target: /app/src
        - action: rebuild
          path: package.json
```

```bash
docker compose watch
```

`src`가 바뀌면 컨테이너 안으로 복사하고, `package.json`이 바뀌면 이미지를 다시 빌드한다. 맥/윈도우에서 바인드 마운트가 느릴 때 대안이 된다.

## 스케일과 이름 규칙

```bash
docker compose up -d --scale worker=3
```

컨테이너 이름은 `<프로젝트>-<서비스>-<번호>` 형태다(`myapp-worker-1`). `container_name:`을 지정하면 스케일이 불가능해진다. 이름이 충돌하기 때문이다. 꼭 필요한 게 아니면 지정하지 않는다.

스케일한 서비스는 서비스 이름으로 조회하면 여러 IP가 돌아온다(DNS 라운드로빈). 다만 클라이언트가 DNS를 캐시하면 분산이 잘 안 되므로, 진지한 로드밸런싱이 필요하면 앞에 nginx나 Traefik을 둔다.

프로젝트 이름은 디렉터리 이름에서 온다. 같은 디렉터리 이름을 가진 프로젝트가 여럿이면 충돌하므로 `name:` 필드나 `-p` 옵션으로 지정한다.

```bash
docker compose -p myapp-staging up -d
```

## 자주 만나는 문제

`.env`를 고쳤는데 반영이 안 된다
: `docker compose up -d`를 다시 실행해야 컨테이너가 재생성된다. `restart`는 기존 설정 그대로 다시 시작할 뿐이다.

`docker compose down` 후 데이터가 사라졌다
: `-v`를 붙였거나 익명 볼륨을 쓰고 있었다. 이름 있는 볼륨은 `down`만으로는 사라지지 않는다.

이미지를 새로 빌드했는데 옛날 코드가 돈다
: `up -d --build`를 쓴다. `up`만으로는 이미지가 이미 있으면 다시 빌드하지 않는다.

포트가 충돌한다
: 다른 프로젝트의 Compose가 같은 포트를 쓰고 있다. `docker compose ls`로 떠 있는 프로젝트를 확인한다.

서비스 이름으로 접속이 안 된다
: 서로 다른 네트워크에 있거나, 오타이거나, 아직 안 떴다. `docker compose exec api getent hosts db`로 확인한다.

빌드 컨텍스트가 매번 오래 걸린다
: [4편](/post/docker-04-dockerfile)의 `.dockerignore`를 확인한다.

## 정리

이번 편에서 잡아야 할 것.

- `docker compose`(V2)를 쓴다. `version:` 필드는 이제 안 쓴다
- Compose는 네트워크를 자동으로 만들고 서비스 이름으로 DNS가 통한다
- `depends_on`만으로는 순서만 보장한다. 준비 상태는 `condition: service_healthy`
- 그래도 애플리케이션에 재시도 로직을 넣는 게 근본 해법이다
- `exec`는 도는 컨테이너에, `run --rm`은 일회성 작업에
- `.env`는 YAML 치환용, `env_file:`은 컨테이너 환경변수용
- `${VAR:?메시지}`로 필수 값 누락을 즉시 잡는다
- `compose.override.yaml`은 자동 병합된다 → 개발용 설정을 여기에
- 운영은 `-f compose.yaml -f compose.prod.yaml`로 명시
- 무엇이 최종 적용되는지는 `docker compose config`로 확인한다
- `container_name`을 지정하면 스케일이 막힌다
- `down -v`는 볼륨을 지운다

다음 편에서는 이미지를 작게 만드는 멀티스테이지 빌드, 보안 설정, 그리고 배포와 트러블슈팅을 정리하며 시리즈를 마무리한다.
