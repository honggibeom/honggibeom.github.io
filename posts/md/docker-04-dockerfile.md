---
title: 도커 학습 노트 (4) - Dockerfile 완전 정리와 빌드 캐시
date: 2025-12-28
category: docker
src: cover.svg
tags: [docker, dockerfile, buildkit, 빌드, 학습노트]
summary: Dockerfile의 모든 명령어를 용도별로 정리하고 COPY와 ADD, CMD와 ENTRYPOINT, ARG와 ENV의 차이를 짚는다. 빌드 컨텍스트와 .dockerignore, 레이어 캐시가 언제 깨지는지와 BuildKit 캐시 마운트까지 다룬다.
---

> 도커 학습 노트 시리즈 4편.

## 빌드할 때 실제로 무슨 일이 일어나나

```bash
docker build -t myapp:1.0 .
```

마지막 `.`은 **빌드 컨텍스트**다. 파일 경로가 아니라 "이 디렉터리 전체를 빌더에게 통째로 보낸다"는 뜻이다.

```
[ 내 디렉터리 ]  ──(컨텍스트 전송)──▶ [ 빌더 ]
                                        │
                                   Dockerfile 한 줄씩 실행
                                        │
                                   레이어를 쌓아 이미지 생성
```

여기서 두 가지가 따라온다.

1. **컨텍스트에 있는 것만 `COPY` 할 수 있다.** `COPY ../shared/lib .`은 동작하지 않는다. 컨텍스트 밖이기 때문이다.
2. **컨텍스트가 크면 빌드가 느려진다.** `node_modules`, `.git`, 빌드 산출물이 그대로 들어가면 수백 MB를 매번 전송하게 된다.

빌드 첫 줄에 뜨는 이 메시지가 컨텍스트 크기다.

```
=> transferring context: 312.45MB
```

이게 수백 MB면 `.dockerignore`부터 손봐야 한다.

### .dockerignore

`.gitignore`와 같은 문법이고, Dockerfile 옆에 둔다.

```gitignore
.git
.gitignore
node_modules
dist
build
*.log
.env
.env.*
coverage
.DS_Store
**/__pycache__
*.pyc
.venv
Dockerfile*
docker-compose*.yml
README.md
.vscode
.idea
```

효과가 셋이다. **컨텍스트 전송이 빨라지고, 캐시가 덜 깨지고, `.env`나 `.git` 같은 게 이미지에 실수로 들어가는 걸 막는다.**

특히 `.git`은 반드시 넣는다. 브랜치 히스토리 전체가 이미지에 들어가면 크기도 문제지만, 과거 커밋에 있던 비밀값까지 같이 들어간다.

### BuildKit

요즘 도커는 BuildKit이 기본 빌더다. 병렬 빌드, 캐시 마운트, 시크릿 마운트를 지원한다. 혹시 꺼져 있다면,

```bash
DOCKER_BUILDKIT=1 docker build -t myapp:1.0 .
```

또는 `daemon.json`에 `{"features": {"buildkit": true}}`.

## 명령어 전체

### FROM — 시작점

```dockerfile
FROM node:20.11-alpine3.19
FROM node:20.11-alpine3.19 AS builder    # 멀티스테이지용 이름
FROM scratch                             # 완전히 빈 이미지
```

한 Dockerfile에 여러 번 나올 수 있고, 그때마다 새 스테이지가 시작된다(8편).

### RUN — 빌드 시점에 명령 실행

```dockerfile
RUN apk add --no-cache curl              # 셸 형식
RUN ["apk", "add", "--no-cache", "curl"] # exec 형식
```

`RUN` 하나가 레이어 하나다. 그래서 **관련된 것끼리 묶는다.**

```dockerfile
# 나쁨 — 레이어 3개, 캐시 목록이 오래된 상태로 굳는다
RUN apt-get update
RUN apt-get install -y curl
RUN rm -rf /var/lib/apt/lists/*

# 좋음 — 레이어 1개, 정리까지 같은 레이어에서
RUN apt-get update \
 && apt-get install -y --no-install-recommends curl ca-certificates \
 && rm -rf /var/lib/apt/lists/*
```

`apt-get update`를 별도 레이어로 두면 안 되는 이유가 있다. 그 줄은 캐시되고 `install` 줄만 바뀌면, **몇 달 전의 패키지 목록으로 설치를 시도해서** 404가 난다. 이걸 캐시 무효화 문제(stale cache)라고 부른다. 항상 같은 `RUN`에 붙인다.

알파인이면 `apk add --no-cache`, 데비안 계열이면 `--no-install-recommends` + 목록 삭제가 기본이다.

### COPY / ADD — 파일 넣기

```dockerfile
COPY package.json package-lock.json ./
COPY src/ /app/src/
COPY --chown=appuser:appgroup . /app
COPY --from=builder /app/dist /usr/share/nginx/html   # 다른 스테이지에서
```

`ADD`는 `COPY`에 두 기능이 더 있다.

- URL에서 다운로드
- 로컬 tar 파일을 자동으로 압축 해제

그런데 URL 다운로드는 검증도 캐시 제어도 어렵고, 자동 압축 해제는 의도치 않게 동작할 때가 있다. **기본은 `COPY`, tar를 풀어야 할 때만 `ADD`**로 두면 된다. 다운로드가 필요하면 `RUN curl`이 낫다(체크섬 검증을 붙일 수 있다).

```dockerfile
# 이렇게 하면 검증도 되고 같은 레이어에서 정리도 된다
RUN curl -fsSL https://example.com/tool.tar.gz -o /tmp/tool.tar.gz \
 && echo "abc123...  /tmp/tool.tar.gz" | sha256sum -c - \
 && tar -xzf /tmp/tool.tar.gz -C /usr/local \
 && rm /tmp/tool.tar.gz
```

`COPY`에서 자주 걸리는 점.

- 소스 디렉터리를 지정하면 **디렉터리 자체가 아니라 그 내용**이 복사된다. `COPY src/ /app/`은 `/app/`에 src의 내용물이 들어간다.
- 대상 경로가 `/`로 끝나면 디렉터리로 취급한다. 헷갈리면 항상 `/`를 붙인다.
- 와일드카드는 셸이 아니라 Go의 패턴 매칭이라 동작이 조금 다르다.

### WORKDIR — 작업 디렉터리

```dockerfile
WORKDIR /app
```

없으면 만들어준다. `RUN cd /app`은 그 줄에서만 유효하고 다음 줄로 이어지지 않으므로, **디렉터리 이동은 항상 `WORKDIR`로 한다.**

### ENV / ARG — 변수

둘의 차이가 자주 헷갈린다.

| | `ARG` | `ENV` |
| --- | --- | --- |
| 유효 범위 | **빌드 시점만** | 빌드 + **런타임** |
| 이미지에 남는가 | 남지 않는다 | 남는다 (`docker inspect`에 보임) |
| 외부에서 주입 | `--build-arg` | `docker run -e` |

```dockerfile
ARG NODE_VERSION=20.11
FROM node:${NODE_VERSION}-alpine       # FROM 앞의 ARG는 FROM에서만 쓸 수 있다

ARG APP_ENV=production                  # FROM 뒤에 다시 선언해야 이후 줄에서 쓸 수 있다
ENV NODE_ENV=${APP_ENV}
ENV TZ=Asia/Seoul
```

`FROM` 앞에 선언한 `ARG`는 스테이지 안에서 안 보인다. 필요하면 `FROM` 뒤에서 **다시 선언**해야 한다. 자주 걸리는 함정이다.

**`ARG`로 비밀값을 넘기면 안 된다.** `docker history`에 그대로 남는다.

```bash
docker build --build-arg NPM_TOKEN=secret .   # 이미지 히스토리에 노출된다
docker history myapp:1.0 --no-trunc | grep -i token
```

시크릿은 BuildKit의 `--secret`을 쓴다(아래에서 다룬다).

### CMD / ENTRYPOINT — 무엇을 실행할 것인가

가장 헷갈리는 짝이다. 규칙은 두 줄로 요약된다.

- **`ENTRYPOINT`는 실행할 프로그램**, **`CMD`는 그 프로그램에 넘길 기본 인자**
- `docker run` 뒤에 붙인 명령은 **`CMD`를 덮어쓴다.** `ENTRYPOINT`는 `--entrypoint`로만 바뀐다

조합을 표로 보면 명확하다.

| Dockerfile | `docker run img` | `docker run img echo hi` |
| --- | --- | --- |
| `CMD ["node","app.js"]` | `node app.js` | `echo hi` |
| `ENTRYPOINT ["node"]` | `node` | `node echo hi` |
| `ENTRYPOINT ["node"]` + `CMD ["app.js"]` | `node app.js` | `node echo hi` |

그래서 용도가 갈린다.

```dockerfile
# 서비스 — 인자를 통째로 갈아끼울 수 있게
CMD ["node", "server.js"]

# CLI 도구처럼 쓸 이미지 — 프로그램은 고정, 인자만 받게
ENTRYPOINT ["curl"]
CMD ["--help"]
# docker run myimg https://example.com  →  curl https://example.com
```

#### exec 형식과 셸 형식

```dockerfile
CMD ["node", "app.js"]     # exec 형식 — 앱이 PID 1
CMD node app.js            # 셸 형식 — /bin/sh -c "node app.js", sh가 PID 1
```

3편에서 본 대로 셸 형식은 **SIGTERM이 앱에 전달되지 않는다.** 기본은 exec 형식이다.

다만 exec 형식에서는 셸이 없으므로 환경변수 치환이나 파이프가 동작하지 않는다.

```dockerfile
CMD ["sh", "-c", "node app.js --port=$PORT"]   # 환경변수가 필요하면 명시적으로 sh
```

더 나은 방법은 진입 스크립트를 쓰되 마지막에 `exec`를 붙이는 것이다.

```bash
#!/bin/sh
set -e
# 마이그레이션 등 준비 작업
python manage.py migrate
# exec 로 넘겨야 PID 1 자리를 물려받아 시그널을 받는다
exec "$@"
```

```dockerfile
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
CMD ["python", "manage.py", "runserver"]
```

`exec "$@"`의 `exec`가 핵심이다. 이게 없으면 스크립트가 PID 1로 남아서 시그널을 삼킨다.

### USER — 실행 유저

기본은 root다. **컨테이너의 root는 호스트 root와 완전히 같지는 않지만, 그래도 root로 돌릴 이유가 없다.**

```dockerfile
# 데비안 계열
RUN groupadd -r app && useradd -r -g app -d /app -s /sbin/nologin app
# 알파인
RUN addgroup -S app && adduser -S -G app app

RUN chown -R app:app /app
USER app
```

`USER` 이후의 `RUN`, `CMD`, `ENTRYPOINT`가 그 유저로 실행된다. 순서가 중요하다. 패키지 설치는 `USER` 앞에, 애플리케이션 실행은 뒤에 둔다.

**1024 미만 포트는 root가 아니면 바인딩할 수 없다.** 그래서 비루트 컨테이너는 8080 같은 포트를 쓰고, 포트 매핑(`-p 80:8080`)으로 밖에서 80을 맞춘다.

### EXPOSE — 문서화

```dockerfile
EXPOSE 8080
```

**포트를 여는 게 아니다.** "이 이미지는 8080을 쓴다"는 메타데이터일 뿐이다. 실제 공개는 `docker run -p`가 한다. `-P`(대문자)를 쓰면 `EXPOSE`된 포트를 랜덤 호스트 포트에 자동 매핑한다.

### VOLUME — 마운트 지점 선언

```dockerfile
VOLUME /var/lib/postgresql/data
```

이 경로에 아무것도 마운트하지 않고 컨테이너를 만들면 **익명 볼륨이 자동 생성된다.** 편해 보이지만 이름 없는 볼륨이 계속 쌓여 디스크를 먹는 원인이 되기도 한다. 애플리케이션 이미지에는 잘 쓰지 않고, DB 같은 이미지에서 실수 방지용으로 쓰는 편이다(5편).

### HEALTHCHECK

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:8080/health || exit 1

HEALTHCHECK NONE    # 베이스 이미지의 헬스체크를 끄기
```

종료 코드 0은 healthy, 1은 unhealthy다. `--start-period`는 기동이 느린 앱(스프링 부트, JVM)에 꼭 필요하다. 그 시간 안의 실패는 재시도 횟수에 세지 않는다.

### LABEL — 메타데이터

```dockerfile
LABEL org.opencontainers.image.source="https://github.com/honggibeom/myapp" \
      org.opencontainers.image.version="1.4.2" \
      org.opencontainers.image.revision="a1b2c3d"
```

OCI 표준 라벨을 쓰면 GHCR이 저장소와 이미지를 자동으로 연결해준다. CI에서 커밋 SHA와 빌드 시각을 넣어두면 나중에 "지금 도는 이미지가 어느 커밋인지" 추적할 수 있다.

### 나머지

```dockerfile
STOPSIGNAL SIGQUIT     # docker stop 시 보낼 시그널 (nginx는 SIGQUIT가 graceful)
SHELL ["/bin/bash", "-eo", "pipefail", "-c"]   # 셸 형식 RUN이 쓸 셸 교체
ONBUILD COPY . /app    # 이 이미지를 FROM 으로 쓰는 하위 빌드에서 실행 (거의 안 씀)
```

`SHELL`로 `pipefail`을 켜두면 파이프 중간의 실패를 놓치지 않는다. 기본 `sh -c`는 마지막 명령의 종료 코드만 보기 때문에, `RUN curl ... | tar x` 에서 curl이 실패해도 빌드가 성공해버린다.

## 빌드 캐시

여기가 빌드 시간을 좌우한다.

### 캐시가 깨지는 규칙

- 각 명령을 순서대로 실행하면서, **이전 레이어가 같고 명령도 같으면** 캐시를 재사용한다
- **한 줄이 깨지면 그 아래는 전부 다시 실행된다**
- `RUN`은 **명령 문자열**이 같은지만 본다. 문자열이 같으면 결과가 달라질 수 있어도 캐시를 쓴다 (`apt-get update` 문제의 원인)
- `COPY`/`ADD`는 **복사 대상 파일의 내용 체크섬**을 본다. 내용이 바뀌면 캐시가 깨진다

세 번째 규칙 때문에 강제로 다시 받고 싶을 때는 `--no-cache`를 쓴다.

```bash
docker build --no-cache -t myapp:1.0 .
docker build --pull -t myapp:1.0 .     # 베이스 이미지도 최신으로 다시 받기
```

### 순서를 바꾸는 것만으로 몇 분이 줄어든다

```dockerfile
# 나쁨 — 소스 한 줄만 고쳐도 npm ci 를 다시 한다
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci
CMD ["node", "server.js"]
```

```dockerfile
# 좋음 — 의존성 파일이 안 바뀌면 npm ci 는 캐시에서
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
CMD ["node", "server.js"]
```

원칙은 하나다. **자주 바뀌지 않는 것을 위에, 자주 바뀌는 것을 아래에.** 소스 코드는 거의 항상 맨 아래다.

같은 원칙이 다른 생태계에도 그대로 적용된다.

| 언어 | 먼저 복사할 파일 | 그다음 명령 |
| --- | --- | --- |
| Node | `package.json`, `package-lock.json` | `npm ci` |
| Python | `requirements.txt` 또는 `pyproject.toml`+`poetry.lock` | `pip install -r` |
| Java (Gradle) | `build.gradle`, `settings.gradle`, `gradle/` | `gradle dependencies` |
| Java (Maven) | `pom.xml` | `mvn -B dependency:go-offline` |
| Go | `go.mod`, `go.sum` | `go mod download` |
| Rust | `Cargo.toml`, `Cargo.lock` | 더미 `main.rs`로 의존성만 빌드 |

### BuildKit 캐시 마운트

의존성 캐시를 레이어에 넣지 않고 빌더에 보관한다. 이미지는 안 커지는데 재빌드는 빨라진다.

```dockerfile
# syntax=docker/dockerfile:1

FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci
```

```dockerfile
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && apt-get install -y --no-install-recommends curl
```

```dockerfile
RUN --mount=type=cache,target=/root/.m2 \
    mvn -B package -DskipTests
```

첫 줄의 `# syntax=docker/dockerfile:1` 주석이 있어야 최신 문법이 활성화된다.

### 빌드 시크릿

`ARG`로 토큰을 넘기면 이미지에 남는다고 했다. BuildKit의 `--secret`은 **빌드 중에만 파일로 마운트되고 레이어에 남지 않는다.**

```dockerfile
RUN --mount=type=secret,id=npmtoken \
    NPM_TOKEN=$(cat /run/secrets/npmtoken) npm ci
```

```bash
docker build --secret id=npmtoken,src=./npm_token.txt -t myapp:1.0 .
```

사설 git 저장소를 받아야 하면 SSH 에이전트를 그대로 넘길 수도 있다.

```dockerfile
RUN --mount=type=ssh git clone git@github.com:org/private.git
```

```bash
docker build --ssh default -t myapp:1.0 .
```

### 캐시를 CI에서 공유하기

CI 러너는 매번 새 머신이라 로컬 캐시가 없다. 레지스트리에 캐시를 올려두고 받아 쓴다.

```bash
docker buildx build \
  --cache-from type=registry,ref=ghcr.io/honggibeom/myapp:buildcache \
  --cache-to   type=registry,ref=ghcr.io/honggibeom/myapp:buildcache,mode=max \
  -t ghcr.io/honggibeom/myapp:1.4.2 --push .
```

GitHub Actions에서는 `type=gha`를 쓰면 더 간단하다.

## 실전 예제

### Node.js

```dockerfile
# syntax=docker/dockerfile:1
FROM node:20.11-alpine3.19

ENV NODE_ENV=production TZ=Asia/Seoul

WORKDIR /app

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

COPY . .

RUN addgroup -S app && adduser -S -G app app && chown -R app:app /app
USER app

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD wget -qO- http://localhost:8080/health || exit 1

CMD ["node", "server.js"]
```

### Spring Boot

```dockerfile
# syntax=docker/dockerfile:1
FROM eclipse-temurin:21-jre-alpine

RUN addgroup -S app && adduser -S -G app app
WORKDIR /app

COPY build/libs/*.jar app.jar
RUN chown -R app:app /app
USER app

EXPOSE 8080
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75 -XX:+UseContainerSupport"

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

`MaxRAMPercentage`를 지정하는 이유는 3편에서 본 대로다. 컨테이너 메모리 한도를 기준으로 힙을 잡게 한다.

### Python

```dockerfile
# syntax=docker/dockerfile:1
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

RUN apt-get update \
 && apt-get install -y --no-install-recommends libpq5 \
 && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r requirements.txt

COPY . .

RUN useradd -r -u 1001 app && chown -R app:app /app
USER app

EXPOSE 8000
CMD ["gunicorn", "-b", "0.0.0.0:8000", "app:application"]
```

`PYTHONUNBUFFERED=1`은 반드시 넣는다. 없으면 파이썬이 출력을 버퍼링해서 **`docker logs`에 로그가 한참 뒤에 몰려서 나온다.**

## 자주 하는 실수

- **`.dockerignore`가 없다** — 컨텍스트가 수백 MB가 되고 캐시가 매번 깨진다
- **`COPY . .`을 맨 위에 둔다** — 의존성 설치 캐시가 항상 무효화된다
- **`RUN apt-get update`를 따로 둔다** — 오래된 패키지 목록으로 설치가 실패한다
- **`CMD`를 셸 형식으로 쓴다** — SIGTERM이 앱에 안 간다
- **비밀값을 `ARG`나 `COPY`로 넣는다** — 히스토리와 레이어에 영구히 남는다
- **root로 실행한다** — 사고 시 피해 범위가 커진다
- **`EXPOSE`만 하고 포트가 열렸다고 생각한다** — 실제 공개는 `-p`가 한다
- **`latest` 베이스 이미지를 쓴다** — 어제 되던 빌드가 오늘 깨진다
- **컨테이너 안에 로그 파일을 쌓는다** — stdout으로 내보낸다
- **`ENV`에 비밀값을 넣는다** — `docker inspect`에 그대로 보인다

## 정리

이번 편에서 잡아야 할 것.

- 빌드 컨텍스트는 통째로 전송된다. `.dockerignore`는 선택이 아니다
- `COPY`가 기본, `ADD`는 tar 풀 때만, 다운로드는 `RUN curl` + 체크섬
- `ENTRYPOINT`는 프로그램, `CMD`는 기본 인자. `docker run`의 인자는 `CMD`를 덮는다
- exec 형식(JSON 배열)이 기본. 진입 스크립트는 마지막에 `exec "$@"`
- `ARG`는 빌드 시점만, `ENV`는 런타임까지. 둘 다 비밀값을 담으면 안 된다
- `FROM` 앞의 `ARG`는 스테이지 안에서 다시 선언해야 보인다
- 캐시는 위에서 아래로 깨진다 → 의존성 파일 먼저, 소스는 마지막에
- `RUN`은 문자열만 비교한다 → `apt-get update && install`은 한 줄에
- BuildKit의 `--mount=type=cache`로 의존성 캐시를, `--secret`으로 토큰을 다룬다
- `EXPOSE`는 문서일 뿐이고, `USER`로 비루트 실행을 기본으로 삼는다

다음 편에서는 컨테이너를 지워도 데이터가 남게 하는 방법 — 볼륨과 바인드 마운트를 정리한다.
