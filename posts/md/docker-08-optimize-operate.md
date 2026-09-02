---
title: 도커 멀티스테이지 빌드, 보안, 배포와 트러블슈팅 (도커 학습 노트 8)
date: 2026-02-24
category: docker
src: cover.svg
tags: [docker, 멀티스테이지, 보안, ci-cd, 트러블슈팅, 학습노트]
summary: 1GB짜리 이미지를 수십 MB로 줄이는 멀티스테이지 빌드, 비루트·읽기전용·시크릿 관리 같은 보안 기본기, GitHub Actions로 빌드해 배포하는 흐름, 그리고 증상별 트러블슈팅 순서를 정리하며 시리즈를 마무리한다.
---

> 도커 학습 노트 시리즈 8편(마지막).

## 이미지가 큰 게 왜 문제인가

- **배포가 느려진다** — 노드 수가 늘어날수록 pull 시간이 곱해진다
- **디스크와 전송 비용이 든다** — 레지스트리 요금, CI 캐시
- **공격 표면이 넓어진다** — 컴파일러, 패키지 매니저, 셸이 다 들어 있는 이미지는 침해당했을 때 할 수 있는 일이 많다
- **취약점 스캔 결과가 지저분해진다** — 실행에 필요 없는 패키지의 CVE까지 전부 떠서 진짜 문제가 묻힌다

크기의 대부분은 **빌드에만 필요했던 것들**이다. JDK, `node_modules`의 devDependencies, gcc, 소스 코드, git 히스토리. 실행에는 하나도 필요 없다.

## 멀티스테이지 빌드

`FROM`을 여러 번 쓰고, 마지막 스테이지에 **필요한 산출물만 복사해 온다.** 앞 스테이지는 최종 이미지에 포함되지 않는다.

```dockerfile
# syntax=docker/dockerfile:1

# ---------- 1단계: 빌드 ----------
FROM node:20.11-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .
RUN npm run build

# ---------- 2단계: 실행 ----------
FROM node:20.11-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev

COPY --from=builder /app/dist ./dist

RUN addgroup -S app && adduser -S -G app app && chown -R app:app /app
USER app

EXPOSE 8080
CMD ["node", "dist/server.js"]
```

핵심은 `COPY --from=builder`다. 빌드 스테이지의 파일시스템에서 원하는 경로만 가져온다. devDependencies도, 소스 코드도, 빌드 도구도 최종 이미지에 없다.

### 정적 사이트: React + nginx

```dockerfile
FROM node:20.11-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

빌드 결과물은 정적 파일뿐이므로 최종 이미지에 Node가 아예 없다. **1.2GB → 50MB 수준**으로 줄어든다.

SPA라면 nginx 설정에 이걸 넣어야 새로고침 시 404가 안 난다.

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### Go: scratch까지

```dockerfile
FROM golang:1.22-alpine AS builder
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /app/server ./cmd/server

FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=builder /app/server /server
USER nonroot:nonroot
EXPOSE 8080
ENTRYPOINT ["/server"]
```

`CGO_ENABLED=0`으로 정적 링크해야 `scratch`나 `distroless/static`에서 돈다. `-ldflags="-s -w"`는 디버그 심볼을 빼서 바이너리를 줄인다. 최종 이미지가 **10MB 안팎**이 된다.

`scratch`를 쓸 때 자주 걸리는 두 가지.

```dockerfile
FROM scratch
# HTTPS 를 쓰려면 루트 인증서가 필요하다
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
# 타임존을 쓰려면 tzdata 가 필요하다
COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo
COPY --from=builder /app/server /server
ENTRYPOINT ["/server"]
```

### Java: 레이어드 JAR

Spring Boot의 fat JAR을 그대로 복사하면 **코드 한 줄만 고쳐도 수십 MB 레이어가 전부 다시 만들어진다.** JAR을 계층별로 풀어서 복사하면 의존성 레이어가 캐시된다.

```dockerfile
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app
COPY gradlew build.gradle settings.gradle ./
COPY gradle ./gradle
RUN ./gradlew dependencies --no-daemon || true
COPY src ./src
RUN ./gradlew bootJar --no-daemon

FROM eclipse-temurin:21-jre-alpine AS extractor
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar
RUN java -Djarmode=layertools -jar app.jar extract

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S app && adduser -S -G app app

# 바뀌는 빈도가 낮은 것부터
COPY --from=extractor /app/dependencies/ ./
COPY --from=extractor /app/spring-boot-loader/ ./
COPY --from=extractor /app/snapshot-dependencies/ ./
COPY --from=extractor /app/application/ ./

USER app
EXPOSE 8080
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75"
ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]
```

### 개발용과 운영용을 한 파일에

```dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./

FROM base AS development
RUN npm ci
COPY . .
CMD ["npm", "run", "dev"]

FROM base AS builder
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
USER node
CMD ["node", "dist/server.js"]
```

```bash
docker build --target development -t myapp:dev .
docker build --target production  -t myapp:1.0 .
```

Compose에서는 `build.target`으로 지정한다(7편).

**`--target`을 지정하면 그 스테이지까지만 빌드한다.** 뒤 스테이지는 실행되지 않으므로 개발 빌드가 훨씬 빠르다.

## 크기 줄이기 체크리스트

- [ ] 멀티스테이지로 빌드 도구를 최종 이미지에서 제외했는가
- [ ] 베이스가 `-slim` 또는 `-alpine` 또는 distroless인가
- [ ] `.dockerignore`가 있는가 (`.git`, `node_modules` 포함)
- [ ] 패키지 설치와 캐시 삭제가 **같은 `RUN`**에 있는가
- [ ] `--no-install-recommends` / `--no-cache`를 썼는가
- [ ] 프로덕션 의존성만 설치했는가 (`--omit=dev`, `--production`)
- [ ] 큰 파일을 다운로드한 뒤 같은 레이어에서 지웠는가
- [ ] 언어 런타임 캐시(`__pycache__`, `.gradle`)가 이미지에 들어가지 않았는가

무엇이 자리를 차지하는지는 `dive`로 레이어별로 볼 수 있다.

```bash
docker run --rm -it \
  -v /var/run/docker.sock:/var/run/docker.sock \
  wagoodman/dive myapp:1.0
```

레이어를 하나씩 짚으며 어떤 파일이 추가됐는지 보여주고, 낭비(중복 추가 후 삭제)를 계산해준다.

## 보안

### 1. root로 실행하지 않는다

```dockerfile
RUN addgroup -S app && adduser -S -G app app
USER app
```

컨테이너의 root는 호스트 root와 완전히 같지는 않지만, 커널 취약점이나 잘못된 마운트와 겹치면 탈출 경로가 된다. **비루트가 기본값이어야 한다.**

이미지를 못 고치는 상황이면 실행 시점에 지정한다.

```bash
docker run --user 1000:1000 myapp:1.0
```

### 2. 권한을 최소로

```bash
docker run -d \
  --read-only \
  --tmpfs /tmp --tmpfs /run \
  --cap-drop ALL \
  --cap-add NET_BIND_SERVICE \
  --security-opt no-new-privileges:true \
  --pids-limit 200 \
  --memory 512m --cpus 1 \
  myapp:1.0
```

- `--cap-drop ALL` 후 필요한 것만 추가한다. 대부분의 웹 앱은 아무것도 필요 없다
- `no-new-privileges`는 setuid 바이너리로 권한이 올라가는 걸 막는다
- `--read-only` + `tmpfs`는 5편에서 본 구성이다

### 3. 절대 하지 말 것

```bash
docker run --privileged ...                              # 모든 안전장치 해제
docker run -v /var/run/docker.sock:/var/run/docker.sock ... # 사실상 호스트 root
docker run -v /:/host ...                                 # 호스트 파일시스템 전체
docker run --pid=host --net=host --ipc=host ...           # 격리 포기
```

`docker.sock` 마운트는 CI 러너나 Watchtower 같은 도구가 흔히 요구한다. **그 컨테이너가 침해되면 호스트 전체가 넘어간다**는 걸 이해하고 쓰거나, 소켓 프록시(`tecnativa/docker-socket-proxy`)로 허용 API를 제한한다.

### 4. 시크릿을 이미지에 넣지 않는다

2편과 4편에서 본 대로, 레이어에 한 번 들어간 것은 지워도 남는다.

| 방법 | 안전한가 |
| --- | --- |
| `COPY .env /app/` | **아니다.** 레이어에 영구히 남는다 |
| `ARG TOKEN=...` | **아니다.** `docker history`에 남는다 |
| `ENV PASSWORD=...` | **아니다.** `docker inspect`에 보인다 |
| `docker run -e PASSWORD=...` | 이미지에는 안 남지만 `inspect`와 `ps`에 보인다 |
| 파일을 읽기 전용으로 마운트 | 낫다 |
| BuildKit `--secret` (빌드 시) | 좋다 |
| Swarm/K8s 시크릿, Vault, 클라우드 시크릿 매니저 | 가장 좋다 |

실무에서 가장 흔한 절충은 **비밀 파일을 읽기 전용으로 마운트하고 애플리케이션이 파일에서 읽게 하는 것**이다.

```yaml
services:
  api:
    volumes:
      - /etc/myapp/secrets/db_password:/run/secrets/db_password:ro
    environment:
      DB_PASSWORD_FILE: /run/secrets/db_password
```

많은 공식 이미지가 이 관례를 지원한다. PostgreSQL은 `POSTGRES_PASSWORD_FILE`, MySQL은 `MYSQL_ROOT_PASSWORD_FILE`을 읽는다.

**실수로 커밋한 뒤라면** 이미지를 다시 빌드하는 것만으로는 부족하다. 이미 push 된 이미지를 지우고, 노출된 자격 증명을 **폐기하고 재발급**해야 한다.

### 5. 이미지를 검증한다

```bash
docker scout cves myapp:1.0
trivy image --severity HIGH,CRITICAL myapp:1.0
```

CI에 넣어서 HIGH 이상이 있으면 빌드를 실패시키는 게 일반적이다. 다만 **처음부터 엄격하게 걸면 아무것도 배포하지 못한다.** 베이스 이미지를 최신 패치로 유지하는 것부터 시작해서 점진적으로 조인다.

SBOM 생성과 서명도 도구가 잘 갖춰져 있다.

```bash
docker buildx build --sbom=true --provenance=true -t myapp:1.0 --push .
cosign sign --yes ghcr.io/honggibeom/myapp:1.0
cosign verify ghcr.io/honggibeom/myapp:1.0 ...
```

### 보안 체크리스트

- [ ] `USER`로 비루트 실행
- [ ] 베이스 이미지 태그 고정 + 정기 갱신
- [ ] `.dockerignore`에 `.git`, `.env`
- [ ] 시크릿은 빌드 시 `--secret`, 런타임은 마운트나 시크릿 매니저
- [ ] `--cap-drop ALL`, `no-new-privileges`
- [ ] `--read-only` + 필요한 경로만 tmpfs/볼륨
- [ ] 메모리·CPU·PID 제한
- [ ] `--privileged`와 `docker.sock` 마운트 금지
- [ ] DB 포트는 `127.0.0.1`에만 바인딩
- [ ] 이미지 스캔을 CI에 포함

## CI/CD

GitHub Actions로 빌드해서 GHCR에 올리는 기본형이다.

```yaml
name: build-and-push

on:
  push:
    branches: [main]
    tags: ["v*"]

permissions:
  contents: read
  packages: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: docker/setup-buildx-action@v3

      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/${{ github.repository }}
          tags: |
            type=ref,event=branch
            type=semver,pattern={{version}}
            type=sha,format=short

      - uses: docker/build-push-action@v6
        with:
          context: .
          platforms: linux/amd64,linux/arm64
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

`metadata-action`이 2편에서 본 태그 전략(버전 태그 + 커밋 SHA 태그)을 자동으로 만들어준다. `cache-from/to: type=gha`는 Actions 캐시를 빌드 캐시로 쓴다.

### 배포

단일 서버라면 Compose로 충분하다.

```bash
# 서버에서
export IMAGE_TAG=1.4.2
docker compose -f compose.yaml -f compose.prod.yaml pull
docker compose -f compose.yaml -f compose.prod.yaml up -d
docker image prune -f
```

- **`pull` 먼저** — 새 이미지를 미리 받아두면 교체 시간이 짧아진다
- **태그를 고정** — `latest`로 배포하면 롤백할 대상이 없다
- **롤백은 `IMAGE_TAG`를 이전 값으로 두고 다시 `up -d`**

무중단이 필요하면 앞단에 리버스 프록시를 두고 새 컨테이너가 healthy가 된 뒤 트래픽을 옮긴다. Traefik이나 nginx + 스크립트 조합으로 하는데, 이 요구가 커지는 시점이 대개 오케스트레이터를 검토할 때다.

DB 마이그레이션은 별도 단계로 분리하는 게 안전하다.

```bash
docker compose run --rm api npm run migrate
docker compose up -d api
```

## 트러블슈팅

증상에서 원인으로 가는 순서를 정해두면 헤매지 않는다.

```
컨테이너가 안 뜬다
 └─ docker ps -a 로 상태와 종료 코드 확인
     ├─ Exited (0)    → 프로세스가 정상 종료. 포그라운드로 도는 명령인지 확인
     ├─ Exited (1)    → 앱 오류. docker logs
     ├─ Exited (125)  → 도커 옵션 오류. 명령어 자체를 확인
     ├─ Exited (126)  → 실행 권한 없음. chmod +x
     ├─ Exited (127)  → 명령을 못 찾음. 경로 오타, alpine 에 bash 없음
     ├─ Exited (137)  → SIGKILL. inspect 의 OOMKilled 확인
     └─ Restarting    → 크래시 루프. docker logs 로 원인부터
```

증상별로 정리하면 이렇다.

| 증상 | 먼저 볼 것 |
| --- | --- |
| 뜨자마자 종료 | PID 1이 끝났다. 데몬 모드로 돌고 있지 않은지 (`nginx -g "daemon off;"`) |
| `Exited (137)` | `docker inspect -f '{{.State.OOMKilled}}'` → true면 메모리 부족 |
| 접속이 refused | 앱이 `0.0.0.0`에 바인딩했는지 (`docker exec ... ss -tlnp`) |
| 접속이 timeout | 다른 네트워크이거나 방화벽. `refused`와 구분해서 읽는다 |
| 컨테이너 이름 해석 실패 | 기본 bridge를 쓰고 있는 것. 사용자 정의 네트워크로 |
| 이미지가 안 바뀐다 | `--build`, `--no-cache`, `--pull`. 태그가 그대로면 pull이 안 된다 |
| 디스크가 꽉 참 | `docker system df` → `docker builder prune` → 로그 파일 확인 |
| 빌드가 매번 느림 | `.dockerignore`, 레이어 순서, 캐시 마운트 |
| 파일 권한 오류 | 호스트 UID와 컨테이너 UID 확인 (`id -u`, `ls -ln`) |
| 로그가 안 나옴 | 앱이 파일에 쓰고 있거나 출력 버퍼링 (`PYTHONUNBUFFERED=1`) |
| `exec format error` | 아키텍처 불일치. `--platform` 또는 buildx |
| 시간이 UTC | `-e TZ=Asia/Seoul` 또는 애플리케이션에서 처리 |

### 도구 한 벌

```bash
docker logs --tail 200 -t <c>          # 무엇이 찍혔나
docker inspect <c>                     # 어떤 설정으로 떴나
docker stats --no-stream               # 자원을 얼마나 쓰나
docker diff <c>                        # 어디에 쓰고 있나
docker events --since 30m              # 무슨 일이 있었나
docker exec -it <c> sh                 # 안에서 직접 확인
docker run -it --rm --network container:<c> nicolaka/netshoot   # 네트워크 도구
docker run --rm -it -v /var/run/docker.sock:/var/run/docker.sock wagoodman/dive <img>
```

### 디스크 정리 순서

```bash
docker system df -v                    # 무엇이 얼마나 쓰는지 먼저 본다
docker builder prune                   # 빌드 캐시 (보통 여기가 가장 크다)
docker image prune -a                  # 안 쓰는 이미지
docker container prune                 # 종료된 컨테이너
docker volume ls -f dangling=true      # 볼륨은 눈으로 확인하고
docker volume rm <이름>                #   개별로 지운다
```

`docker system prune -a --volumes`는 한 번에 정리되지만 **운영에서는 쓰지 않는다.** 롤백용 이미지와 DB 볼륨이 같이 날아갈 수 있다.

## 여기서 더 가면

도커 하나로 감당되지 않는 시점이 온다. 대체로 이런 신호다.

- 서버가 여러 대가 되고 어디에 무엇이 떠 있는지 관리가 안 된다
- 무중단 배포와 자동 롤백이 필요하다
- 부하에 따라 컨테이너 수를 자동으로 조절해야 한다
- 컨테이너가 죽으면 자동으로 다른 노드에서 살아나야 한다

그 지점의 답이 오케스트레이션이고, 실질적인 표준은 쿠버네티스다. 도커 Swarm은 훨씬 단순하지만 생태계가 얇다.

다만 순서가 중요하다. **여기까지의 내용(이미지, 볼륨, 네트워크, 프로세스와 시그널)을 모른 채 쿠버네티스로 가면 전부 마법으로 보인다.** 파드는 컨테이너의 묶음이고, 퍼시스턴트 볼륨은 5편의 볼륨이고, 서비스는 6편의 DNS다. 개념이 그대로 확장된다.

단일 서버로 충분한 규모라면 Compose로 운영하는 것도 충분히 정당한 선택이다.

## 시리즈 정리

여덟 편에서 잡은 것들을 한 장으로 모으면 이렇다.

**개념**
- 컨테이너는 커널을 공유하는 격리된 프로세스다 (네임스페이스 + cgroup + 유니온 FS)
- 이미지는 레이어의 스택이고, 레이어에 들어간 것은 지워도 남는다
- 컨테이너의 쓰기 레이어는 컨테이너와 함께 사라진다

**만들 때**
- `.dockerignore`를 먼저 쓴다
- 의존성 파일 → 설치 → 소스 순서로 캐시를 살린다
- `CMD`는 exec 형식, 진입 스크립트는 `exec "$@"`
- 멀티스테이지로 빌드 도구를 최종 이미지에서 뺀다
- `USER`로 비루트 실행

**돌릴 때**
- 데이터는 볼륨으로, 개발 소스는 바인드 마운트로
- 사용자 정의 네트워크를 쓰고 서비스 이름으로 통신한다
- 내부용 포트는 `127.0.0.1`에 묶는다
- 메모리·CPU 제한과 로그 크기 제한을 반드시 건다
- 로그는 stdout으로 낸다

**운영할 때**
- 태그를 고정하고 커밋 SHA로 추적한다
- 시크릿은 이미지 밖에 둔다
- 헬스체크를 붙이고, 앱에는 재시도 로직을 넣는다
- 문제는 상태 → 종료 코드 → 로그 → inspect 순으로 좁힌다

마지막으로 하나만 덧붙이면, 이 시리즈의 내용은 **직접 깨뜨려봐야 남는다.** 특히 셋은 손으로 해보길 권한다.

- 볼륨 없이 DB 컨테이너를 띄우고 데이터를 넣은 뒤 `docker rm -f` 해보기
- `CMD`를 셸 형식으로 쓴 컨테이너에 `docker stop`을 걸고, 종료 코드가 143이 아니라 137로 나오는 걸 확인하기
- 기본 bridge에서 컨테이너 이름으로 ping이 안 되는 걸 확인한 뒤, 사용자 정의 네트워크로 옮겨서 되는 걸 보기

이 셋을 겪고 나면 도커가 명령어 모음이 아니라 구조라는 게 보인다.
