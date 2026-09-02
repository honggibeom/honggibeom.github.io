---
title: 도커 이미지와 레이어, 태그, 레지스트리 정리 - latest의 함정까지 (도커 학습 노트 2)
date: 2025-11-26
category: docker
src: cover.svg
tags: [docker, image, registry, layer, 학습노트]
summary: 이미지가 레이어로 쌓이는 구조와 Copy-on-Write, 다이제스트와 태그의 차이, latest의 함정, 베이스 이미지 선택 기준, 레지스트리 사용법과 멀티 아키텍처 이미지까지 정리한다.
---

> 도커 학습 노트 시리즈 2편. 1편에서 컨테이너가 커널을 공유하는 격리된 프로세스라는 것까지 봤다.

## 이미지는 무엇으로 이루어져 있나

"이미지 = 하나의 큰 파일"이라고 생각하면 나중에 전부 어긋난다. OCI 이미지는 **세 종류의 조각**으로 되어 있다.

```
매니페스트 (manifest)
  ├─ config 를 가리키는 다이제스트
  └─ 레이어 다이제스트 목록 (순서 있음)

config (JSON)
  ├─ 실행 정보: Entrypoint, Cmd, Env, WorkingDir, User, ExposedPorts
  ├─ 아키텍처/OS: amd64 / linux
  └─ 레이어의 diff_id 목록과 빌드 히스토리

레이어 (layer)
  └─ 파일시스템 변경분을 담은 tar 압축 파일들
```

이걸 실제로 볼 수 있다.

```bash
docker pull nginx:1.27-alpine
docker inspect nginx:1.27-alpine
```

출력에서 눈여겨볼 것.

- `RootFS.Layers` — 레이어 다이제스트 목록
- `Config.Cmd`, `Config.Entrypoint` — 컨테이너로 실행할 때 무엇이 돌아가는지
- `Config.Env` — 이미지에 박혀 있는 환경변수
- `Architecture`, `Os` — 어떤 CPU/OS용인지

특정 값만 뽑을 때는 Go 템플릿을 쓴다.

```bash
docker inspect -f '{{.Config.Cmd}}' nginx:1.27-alpine
docker inspect -f '{{range .Config.Env}}{{println .}}{{end}}' nginx:1.27-alpine
docker inspect -f '{{.Architecture}}/{{.Os}}' nginx:1.27-alpine
```

## 레이어

이미지는 **파일시스템의 변경분을 순서대로 쌓은 것**이다. Dockerfile의 명령 하나가 대체로 레이어 하나를 만든다.

```dockerfile
FROM alpine:3.20          # 레이어 1: alpine 루트 파일시스템
RUN apk add --no-cache curl   # 레이어 2: curl 설치로 생긴 파일 변경분
COPY app.sh /app.sh           # 레이어 3: app.sh 추가
```

`docker history`로 각 레이어가 무엇을 했고 얼마나 차지하는지 볼 수 있다.

```bash
docker history nginx:1.27-alpine --no-trunc
docker history --format '{{.Size}}\t{{.CreatedBy}}' myapp:1.0
```

### 레이어가 공유된다

레이어는 다이제스트로 식별되므로 **내용이 같으면 한 벌만 저장된다.**

```bash
docker pull node:20-alpine
docker pull node:20-alpine-with-something  # 같은 베이스를 쓴다면
```

두 이미지가 같은 alpine 베이스를 쓰면 그 레이어는 디스크에 하나만 있다. `docker images`의 SIZE를 다 더한 값과 실제 디스크 사용량이 다른 이유가 이것이다. 진짜 사용량은 이렇게 본다.

```bash
docker system df -v
```

pull 할 때 `Already exists`라고 뜨는 줄이 이미 갖고 있는 레이어다. **베이스 이미지를 팀 안에서 통일하면 pull 시간과 디스크가 같이 줄어든다.**

### Copy-on-Write와 삭제 레이어

이미지 레이어는 전부 읽기 전용이다. 컨테이너를 만들면 맨 위에 쓰기 가능한 레이어가 하나 얹힌다.

- 아래 레이어의 파일을 **수정**하면 → 쓰기 레이어로 복사한 뒤 수정한다. 큰 파일을 고치면 그 크기만큼 복사 비용이 든다.
- 아래 레이어의 파일을 **삭제**하면 → 실제로 지워지지 않고, 위 레이어에 "지워졌음" 표시(whiteout 파일)가 생긴다.

두 번째가 중요하다. Dockerfile에서 이렇게 쓰면 이미지가 전혀 작아지지 않는다.

```dockerfile
RUN wget https://example.com/big-sdk.tar.gz && tar xf big-sdk.tar.gz
RUN rm big-sdk.tar.gz        # ← 다음 레이어에서 지워봐야 소용없다
```

아래 레이어에 200MB가 그대로 남아 있고, 위 레이어에 "없음" 표시만 추가된다. 같은 `RUN` 안에서 지워야 한다.

```dockerfile
RUN wget https://example.com/big-sdk.tar.gz \
 && tar xf big-sdk.tar.gz \
 && rm big-sdk.tar.gz
```

**한 번이라도 레이어에 들어간 파일은 이미지에서 사라지지 않는다.** 비밀키를 `COPY` 했다가 다음 줄에서 지워도 이미지 안에 그대로 있다. `docker history`나 레이어 tar를 풀면 나온다. 8편의 보안 이야기에서 다시 다룬다.

## 다이제스트와 태그

두 가지 방법으로 이미지를 가리킬 수 있다.

| | 예 | 성질 |
| --- | --- | --- |
| 태그 | `nginx:1.27-alpine` | 사람이 붙인 **이동 가능한** 라벨 |
| 다이제스트 | `nginx@sha256:0f2c...` | 내용 해시. **절대 변하지 않는다** |

태그는 언제든 다른 이미지를 가리키도록 바뀔 수 있다. `nginx:1.27`은 패치가 나오면 새 이미지로 옮겨간다. 반면 다이제스트는 내용이 곧 이름이므로 불변이다.

```bash
# 지금 이 태그가 가리키는 다이제스트 확인
docker inspect -f '{{index .RepoDigests 0}}' nginx:1.27-alpine

# 다이제스트로 고정해서 받기
docker pull nginx@sha256:0f2c...
```

### `latest`의 함정

`latest`는 "최신"이라는 뜻이 **아니다.** 그냥 태그를 생략했을 때 붙는 기본 문자열일 뿐이다. 아무도 갱신하지 않으면 3년 전 이미지가 `latest`로 남아 있을 수 있다.

- `docker run nginx` = `docker run nginx:latest`
- `docker build -t myapp .` = `myapp:latest`

운영에서 `latest`를 쓰면 이런 일이 생긴다. 어제 배포한 것과 오늘 배포한 것이 같은 태그인데 내용이 다르고, 롤백할 대상이 사라지고, 어떤 커밋이 돌고 있는지 추적할 수 없다.

**태그 전략**은 이 정도면 충분하다.

```bash
myapp:1.4.2            # 시맨틱 버전 — 릴리스 식별
myapp:1.4              # 마이너 이동 태그 — 편의용
myapp:a1b2c3d          # git 커밋 SHA — 추적용, 가장 정확하다
myapp:2026-08-31       # 날짜 — 배치성 이미지에 유용
myapp:latest           # 개발 편의용으로만
```

CI에서는 커밋 SHA 태그와 버전 태그를 같이 붙이고, **배포 매니페스트에는 다이제스트나 SHA 태그를 쓰는 것**이 안전하다.

### 태그 다시 붙이기

```bash
docker tag myapp:1.4.2 ghcr.io/honggibeom/myapp:1.4.2
```

`docker tag`는 복사가 아니다. **같은 이미지에 이름표를 하나 더 다는 것**이라 디스크를 더 쓰지 않는다. `docker images`에 두 줄로 보이지만 IMAGE ID는 같다.

## 이미지 이름의 전체 구조

```
[레지스트리 호스트[:포트]/][네임스페이스/]저장소[:태그|@다이제스트]

ghcr.io/honggibeom/myapp:1.4.2
└─레지스트리─┘└─네임스페이스┘└저장소┘└─태그─┘
```

레지스트리를 생략하면 Docker Hub(`docker.io`)로 간다. 네임스페이스까지 생략하면 공식 이미지(`library`)다.

```
nginx            → docker.io/library/nginx:latest
honggibeom/app   → docker.io/honggibeom/app:latest
ghcr.io/org/app  → GitHub Container Registry
localhost:5000/app → 로컬에 띄운 사설 레지스트리
```

`myregistry.com/app`처럼 **점이나 포트가 들어가면 레지스트리 호스트로 해석**한다. 이 규칙 때문에 `myapp/web`은 Docker Hub의 `myapp` 계정으로 해석된다.

## 레지스트리

| 레지스트리 | 특징 |
| --- | --- |
| Docker Hub | 기본값. 익명 pull에 IP 기준 횟수 제한이 있다 |
| GHCR (`ghcr.io`) | GitHub 저장소와 권한이 연동된다. 퍼블릭은 무료 |
| AWS ECR / GCP Artifact Registry / Azure ACR | 클라우드에 배포한다면 사실상 기본 선택 |
| Harbor | 사내 설치형. 스캔·복제·정책 기능 |
| `registry:2` | 도커가 제공하는 최소 레지스트리. 테스트용으로 충분 |

### 로그인과 push

```bash
# Docker Hub
docker login

# GHCR (Personal Access Token 사용, write:packages 권한 필요)
echo $GH_TOKEN | docker login ghcr.io -u honggibeom --password-stdin

docker tag myapp:1.4.2 ghcr.io/honggibeom/myapp:1.4.2
docker push ghcr.io/honggibeom/myapp:1.4.2
```

`--password-stdin`을 쓰는 이유는 명령행에 비밀번호를 적으면 셸 히스토리와 프로세스 목록에 남기 때문이다.

`docker login`의 자격 증명은 기본적으로 `~/.docker/config.json`에 **base64로 (암호화가 아니라 인코딩만 되어) 저장된다.** 개인 머신이면 credential helper(`docker-credential-osxkeychain`, `pass` 등)를 붙이고, CI 서버라면 잡이 끝날 때 `docker logout`으로 지운다.

### Docker Hub pull 제한

익명 사용자는 IP 기준으로 pull 횟수 제한이 걸린다. CI가 공용 IP를 쓰면 `toomanyrequests` 에러를 만나게 된다. 대응은 셋 중 하나다.

- CI에서 `docker login`으로 인증된 pull 사용
- 베이스 이미지를 사내 레지스트리에 **미러링**해두고 그쪽을 참조
- 레지스트리 캐시(pull-through cache) 구성

### 사설 레지스트리 띄워보기

```bash
docker run -d -p 5000:5000 --name registry registry:2

docker tag myapp:1.4.2 localhost:5000/myapp:1.4.2
docker push localhost:5000/myapp:1.4.2

curl http://localhost:5000/v2/_catalog
curl http://localhost:5000/v2/myapp/tags/list
```

HTTPS가 아니면 도커가 push를 거부한다. 로컬 테스트라면 데몬 설정(`/etc/docker/daemon.json`)에 예외를 넣는다.

```json
{ "insecure-registries": ["localhost:5000"] }
```

`localhost`는 기본 허용이지만 다른 호스트라면 이 설정이 필요하다. **운영에서는 쓰지 않는다.** 실제로는 TLS 인증서를 붙인다.

## 멀티 아키텍처 이미지

Apple Silicon과 ARM 서버가 흔해지면서 반드시 부딪히는 지점이다.

이미지 태그 하나가 여러 아키텍처를 가리킬 수 있다. 이때 매니페스트는 **매니페스트 리스트(=이미지 인덱스)**가 되고, 그 안에 아키텍처별 매니페스트가 들어간다.

```bash
docker manifest inspect nginx:1.27-alpine | head -40
# linux/amd64, linux/arm64, linux/arm/v7 ... 목록이 보인다
```

pull 하면 도커가 **호스트 아키텍처에 맞는 것을 알아서 고른다.** 여기서 전형적인 사고가 난다.

- M1 맥에서 `docker build` → `linux/arm64` 이미지가 만들어진다
- 그걸 amd64 서버에 배포 → `exec format error`

강제로 지정할 수 있다.

```bash
docker run --platform linux/amd64 myapp:1.4.2
docker build --platform linux/amd64 -t myapp:1.4.2 .
```

다만 이건 에뮬레이션(QEMU)이라 느리다. 제대로 하려면 buildx로 여러 아키텍처를 한 번에 만들어 push 한다.

```bash
docker buildx create --name multi --use --bootstrap

docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t ghcr.io/honggibeom/myapp:1.4.2 \
  --push .
```

`--push`가 붙는 이유는, 멀티 아키텍처 결과물은 로컬 이미지 저장소에 그대로 담을 수 없어서 레지스트리로 바로 올려야 하기 때문이다.

## 베이스 이미지 고르기

이미지 크기와 취약점 수의 절반은 **첫 줄에서 결정된다.**

| 종류 | 크기 감각 | 성격 |
| --- | --- | --- |
| `ubuntu` / `debian` | 70~120MB | 도구가 다 있다. 디버깅 편함 |
| `-slim` (`python:3.12-slim`) | 40~80MB | 문서·불필요 패키지 제거. 대개 무난한 기본값 |
| `-alpine` | 5~20MB | musl libc 기반. 매우 작지만 호환 문제 가능 |
| `distroless` | 2~20MB | 셸도 패키지 매니저도 없다. 런타임만 |
| `scratch` | 0 | 완전히 빈 이미지. 정적 링크 바이너리용 |

### alpine을 조심해야 할 때

Alpine은 glibc가 아니라 **musl libc**를 쓴다. 대부분은 문제가 없지만 다음에서 걸린다.

- 네이티브 확장이 있는 파이썬 패키지(`numpy`, `pandas`, `psycopg2`) — glibc용 휠을 못 써서 소스 빌드로 넘어가고, 빌드 시간이 몇 분씩 늘어난다
- glibc 전용으로 배포되는 상용 바이너리, 일부 JDK 배포판
- DNS 리졸버 동작 차이, 스레드 스택 크기 차이로 인한 미묘한 버그

**파이썬은 `-slim`이 대체로 낫고, Go는 `scratch`나 `distroless`가 가장 잘 맞는다.** Node는 alpine이 무난한 편이다.

### 태그를 얼마나 고정할 것인가

```dockerfile
FROM node                 # 나쁨 — 언제 어떤 메이저 버전이 올지 모른다
FROM node:20              # 그럭저럭 — 마이너·패치는 움직인다
FROM node:20.11-alpine3.19  # 좋음 — 재현 가능성이 높다
FROM node@sha256:abcd...    # 가장 엄격 — 완전 고정, 갱신은 수동
```

실무에서는 `node:20.11-alpine3.19` 수준으로 두고, Renovate나 Dependabot으로 갱신 PR을 받는 방식이 균형이 좋다.

## 이미지 옮기기: save / load, export / import

레지스트리를 못 쓰는 폐쇄망에서 쓴다. 둘은 다르다.

```bash
# 이미지 단위 — 레이어와 메타데이터를 전부 보존한다
docker save -o myapp.tar myapp:1.4.2
docker load -i myapp.tar

# 컨테이너 파일시스템 단위 — 레이어와 실행 설정이 사라진다
docker export mycontainer -o fs.tar
docker import fs.tar myapp:flat
```

`export/import`는 히스토리를 뭉개서 이미지를 납작하게 만들 때만 쓴다. `CMD`, `ENTRYPOINT`, `ENV`가 전부 날아가므로 `import` 시 `--change`로 다시 넣어줘야 한다. **기본은 `save/load`다.**

## 취약점 스캔과 정리

```bash
docker scout quickview myapp:1.4.2
docker scout cves myapp:1.4.2
```

외부 도구로는 Trivy가 널리 쓰인다.

```bash
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image myapp:1.4.2
```

취약점의 상당수는 애플리케이션이 아니라 **베이스 이미지에서 온다.** 베이스를 최신 패치로 올리는 것만으로 대부분 사라진다.

### 정리 명령

```bash
docker images                    # 목록
docker images -f dangling=true   # <none>:<none> — 태그를 잃은 이미지
docker image prune               # dangling 이미지만 삭제
docker image prune -a            # 컨테이너가 안 쓰는 이미지 전부 삭제
docker rmi myapp:1.4.2           # 특정 이미지 삭제
docker builder prune             # 빌드 캐시 삭제 (여기가 제일 많이 차 있다)
```

`<none>` 이미지는 대개 같은 태그로 다시 빌드했을 때 생긴다. 이전 이미지가 태그를 뺏기고 이름을 잃은 것이다. 디스크가 모자랄 때 `docker builder prune`이 가장 극적으로 줄어든다.

## 정리

이번 편에서 잡아야 할 것.

- 이미지 = 매니페스트 + config + 레이어들. config에 실행 정보가 들어 있다
- 레이어는 다이제스트로 공유된다 → 베이스 이미지를 통일하면 이득이 크다
- 레이어에 한 번 들어간 파일은 뒤에서 지워도 이미지에서 사라지지 않는다 (비밀키 주의)
- 태그는 움직이고 다이제스트는 불변이다. `latest`는 "최신"이 아니다
- 운영 배포는 버전 태그 + 커밋 SHA, 가능하면 다이제스트로 고정
- 이미지 이름은 `레지스트리/네임스페이스/저장소:태그` 구조다
- M1에서 빌드해 amd64 서버에 올리면 `exec format error` → `--platform` 또는 buildx
- 파이썬은 `-slim`, Go는 `distroless`/`scratch`, alpine은 musl 문제를 알고 쓴다
- 디스크가 부족하면 `docker system df` → `docker builder prune`

다음 편에서는 컨테이너를 실제로 실행하고 관리하는 방법, `run` 옵션과 생명주기, 리소스 제한을 정리한다.
