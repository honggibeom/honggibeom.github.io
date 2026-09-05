---
title: docker run 옵션과 컨테이너 생명주기, 리소스 제한 정리 (도커 학습 노트 3)
date: 2025-12-12
category: docker
src: cover.svg
tags: [docker, container, cli, 운영, 학습노트]
summary: docker run의 옵션을 갈래별로 정리하고, 컨테이너 상태 전이와 종료 시그널·종료 코드, 재시작 정책, 로그와 exec, CPU·메모리 제한과 OOM까지 실행과 운영에 필요한 것들을 정리한다.
---

> 도커 학습 노트 시리즈 3편. [2편](/post/docker-02-image-registry)에서 이미지가 레이어로 쌓이는 구조와 태그·레지스트리까지 봤다. 이번에는 그 이미지로 컨테이너를 실제로 띄우고 관리하는 쪽이다.

## 컨테이너의 상태

`docker ps -a`의 STATUS 칸에 뜨는 값들이 곧 상태다.

```
        docker create              docker start
 이미지 ─────────────▶ created ─────────────────▶ running
                                                    │  ▲
                            docker pause  ┌─────────┘  │ docker unpause
                                          ▼            │
                                        paused ────────┘

                          docker stop / 프로세스 종료
                        running ────────────────────▶ exited
                                                        │
                                          docker start  │
                                        ◀───────────────┘

                        docker rm          (완전 삭제)
```

- created - 만들어졌지만 아직 실행 전. 쓰기 레이어와 설정은 이미 잡혀 있다.
- running - 안의 프로세스가 살아 있다.
- paused - cgroup freezer로 프로세스를 얼려둔 상태. 메모리는 그대로 잡고 있다.
- restarting - 재시작 정책에 따라 다시 올라오는 중.
- exited - 안의 프로세스가 끝났다. 컨테이너는 아직 남아 있다. 파일시스템도, 로그도 그대로다.
- dead - 삭제에 실패한 비정상 상태. 드물다.

`exited` 상태가 남아 있다는 게 중요하다. 죽은 컨테이너의 로그를 읽어서 원인을 찾을 수 있다.

```bash
docker ps -a --filter status=exited
docker logs <컨테이너>
docker inspect -f '{{.State.ExitCode}} {{.State.Error}} {{.State.OOMKilled}}' <컨테이너>
```

## run은 세 명령의 합이다

```bash
docker run nginx
# ≒ docker pull nginx (없으면) + docker create nginx + docker start <id>
```

나눠서 실행할 수도 있다. 컨테이너를 만들어두고 나중에 띄우는 경우에 쓴다.

```bash
id=$(docker create -p 8080:80 --name web nginx:alpine)
docker start $id
```

중요한 점: 대부분의 설정은 `create`/`run` 시점에만 정할 수 있다. 포트, 볼륨, 네트워크, 환경변수는 이미 만들어진 컨테이너에 나중에 붙일 수 없다. 바꾸려면 지우고 다시 만들어야 한다. 컨테이너를 "고쳐 쓰는 것"이 아니라 "버리고 새로 만드는 것"으로 다루게 되는 이유다.

## run 옵션 정리

전부 외울 필요는 없고, 갈래로 묶어두면 필요할 때 찾을 수 있다.

### 실행 방식

| 옵션 | 의미 |
| --- | --- |
| `-d`, `--detach` | 백그라운드 실행. 컨테이너 ID만 출력 |
| `-i`, `--interactive` | 표준 입력을 열어둔다 |
| `-t`, `--tty` | 가상 터미널을 할당한다 |
| `--rm` | 종료되면 컨테이너를 자동 삭제 |
| `--name` | 이름 지정 |
| `--entrypoint` | 이미지의 ENTRYPOINT를 덮어쓴다 |
| `-w`, `--workdir` | 작업 디렉터리 |
| `-u`, `--user` | 실행 유저 (`1000:1000` 또는 `appuser`) |
| `--init` | PID 1 자리에 최소 init을 넣어 좀비 프로세스를 수거한다 |

`-it`를 왜 항상 같이 쓰는지 정확히 알아둘 만하다.

- `-i`만 - 파이프로 입력은 넣을 수 있지만 프롬프트가 안 보인다
- `-t`만 - 터미널은 붙지만 입력이 안 들어간다
- `-it` - 우리가 기대하는 대화형 셸

```bash
docker run -it --rm alpine sh          # 대화형
echo "hello" | docker run -i --rm alpine cat   # 파이프로 넣을 때는 -i만
```

스크립트나 CI에서 `-t`를 쓰면 안 된다. TTY가 없는 환경에서 `the input device is not a TTY` 에러가 난다.

### 포트와 네트워크

| 옵션 | 의미 |
| --- | --- |
| `-p 8080:80` | 호스트 8080 → 컨테이너 80 |
| `-p 127.0.0.1:8080:80` | 로컬호스트에서만 접근 가능 |
| `-p 80` | 호스트 포트를 랜덤 배정 |
| `-P` | 이미지의 `EXPOSE` 포트를 전부 랜덤 배정 |
| `--network` | 붙일 네트워크 |
| `--network-alias` | 그 네트워크에서 쓸 DNS 별칭 |
| `--hostname` | 컨테이너 호스트명 |
| `--add-host` | `/etc/hosts`에 항목 추가 |
| `--dns` | DNS 서버 지정 |

`-p 8080:80`은 모든 인터페이스(0.0.0.0)에 바인딩된다. 방화벽 설정과 무관하게 외부에 열릴 수 있으니, 개발용 DB나 관리 도구는 `-p 127.0.0.1:5432:5432`로 묶는 습관을 들이는 게 좋다. 자세한 원리는 [6편](/post/docker-06-network)에서 본다.

### 환경변수와 설정

| 옵션 | 의미 |
| --- | --- |
| `-e KEY=value` | 환경변수 하나 |
| `-e KEY` | 호스트의 같은 이름 값을 전달 |
| `--env-file .env` | 파일에서 한 번에 |

```bash
docker run -d \
  -e POSTGRES_PASSWORD=secret \
  -e POSTGRES_DB=appdb \
  --name db postgres:16-alpine
```

우선순위는 `docker run -e` > `--env-file` > 이미지의 `ENV` 순이다.

비밀값을 `-e`로 넘기면 `docker inspect`와 호스트의 `ps`에 그대로 보인다. 로컬 개발이면 몰라도, 운영에서는 시크릿 매니저나 파일 마운트를 쓴다. [8편](/post/docker-08-optimize-operate)에서 다시 다룬다.

### 데이터

| 옵션 | 의미 |
| --- | --- |
| `-v 이름:/경로` | 이름 있는 볼륨 마운트 |
| `-v /호스트경로:/경로` | 바인드 마운트 |
| `-v /경로` | 익명 볼륨 |
| `--mount type=...` | 명시적 문법 (권장) |
| `--tmpfs /tmp` | 메모리 파일시스템 |
| `--read-only` | 루트 파일시스템을 읽기 전용으로 |

[5편](/post/docker-05-volume-data)의 주제다.

### 재시작 정책

| 값 | 동작 |
| --- | --- |
| `no` (기본) | 재시작하지 않음 |
| `on-failure[:횟수]` | 0이 아닌 종료 코드일 때만 재시작 |
| `always` | 항상 재시작. 도커 데몬 재시작 시에도 올라온다 |
| `unless-stopped` | `always`와 같지만, 내가 직접 stop 했다면 데몬 재시작 후에도 올리지 않는다 |

```bash
docker run -d --restart unless-stopped --name web nginx:alpine
docker update --restart=always web    # 나중에 변경 가능한 몇 안 되는 설정 중 하나
```

서버 재부팅 후에도 살아 있어야 하는 서비스는 `unless-stopped`가 무난하다. `always`는 "내가 꺼둔 것"까지 되살려서 곤란할 때가 있다.

재시작 정책은 크래시 루프를 숨긴다. 컨테이너가 계속 죽으면서 다시 뜨고 있으면 `docker ps`에는 `Restarting (1) 3 seconds ago`로 보인다. 이때는 `docker logs`로 원인부터 봐야 한다.

## 종료와 시그널

이 부분이 실무에서 가장 자주 문제가 된다.

```bash
docker stop web       # SIGTERM → 10초 대기 → SIGKILL
docker stop -t 30 web # 유예 시간 30초
docker kill web       # 즉시 SIGKILL
docker kill -s HUP web  # 특정 시그널 보내기
```

정상 종료(graceful shutdown)를 하려면 애플리케이션이 SIGTERM을 받아서 처리 중인 요청을 마치고 커넥션을 닫아야 한다. 그런데 시그널이 애플리케이션까지 도달하지 못하는 경우가 흔하다.

### 셸 형식 CMD의 함정

```dockerfile
CMD npm start          # 셸 형식 → /bin/sh -c "npm start"
```

이렇게 쓰면 PID 1은 `sh`가 되고, `sh`는 받은 SIGTERM을 자식에게 전달하지 않는다. 결과적으로 앱은 시그널을 못 받고 10초 뒤 SIGKILL로 강제 종료된다. 처리 중이던 요청은 끊기고, 트랜잭션은 롤백되고, 종료 코드는 137이 된다.

```dockerfile
CMD ["npm", "start"]   # exec 형식 → 앱이 직접 PID 1
```

exec 형식(JSON 배열)을 쓰는 것이 첫 번째 해법이다. [4편](/post/docker-04-dockerfile)에서 자세히 본다.

### 종료 코드 읽기

| 코드 | 의미 |
| --- | --- |
| `0` | 정상 종료 |
| `1` | 애플리케이션 오류 (일반) |
| `125` | 도커 데몬 자체의 오류 (잘못된 옵션 등) |
| `126` | 명령을 실행할 수 없음 (실행 권한 없음) |
| `127` | 명령을 찾을 수 없음 (경로 오타, alpine에 bash 없음) |
| `137` | SIGKILL - `docker kill` 또는 OOM Killer |
| `139` | SIGSEGV |
| `143` | SIGTERM - 정상적인 `docker stop` |

`128 + 시그널번호` 규칙이다. `137 = 128 + 9`, `143 = 128 + 15`.

137을 봤다면 두 가지를 구분해야 한다.

```bash
docker inspect -f '{{.State.OOMKilled}}' <컨테이너>
# true  → 메모리 부족. 한도를 올리거나 앱의 메모리 사용을 줄인다
# false → stop 유예 시간 안에 안 끝났거나 누가 kill 했다
```

`127`은 alpine 기반 이미지에서 `docker exec -it app bash`를 칠 때 자주 만난다. alpine에는 bash가 없다. `sh`를 쓴다.

## 로그

컨테이너의 로그는 PID 1의 표준 출력과 표준 에러다. 파일에 쓰는 로그는 `docker logs`에 나오지 않는다.

```bash
docker logs web
docker logs -f web              # 실시간
docker logs --tail 100 web
docker logs --since 10m web
docker logs -t web              # 타임스탬프 붙이기
docker logs -f --tail 0 web     # 지금 이후만
```

그래서 컨테이너용 애플리케이션의 원칙은 "파일이 아니라 stdout으로 로그를 쓴다"이다. 로그 파일을 컨테이너 안에 쌓으면 로테이션도, 수집도 곤란해진다.

### 로그 파일이 디스크를 다 먹는 문제

기본 로그 드라이버 `json-file`은 제한이 없다. 오래 돌아가는 컨테이너가 디스크를 가득 채우는 사고가 여기서 난다.

컨테이너별로 걸거나,

```bash
docker run -d \
  --log-opt max-size=10m --log-opt max-file=3 \
  --name web nginx:alpine
```

데몬 기본값으로 걸어둔다(`/etc/docker/daemon.json`).

```json
{
  "log-driver": "json-file",
  "log-opts": { "max-size": "10m", "max-file": "3" }
}
```

설정 후 `sudo systemctl restart docker`. 기존 컨테이너에는 적용되지 않으니 다시 만들어야 한다.

로그 파일의 실제 위치는 `/var/lib/docker/containers/<id>/<id>-json.log`다. 디스크가 꽉 찼을 때 여기부터 확인한다.

## 안에 들어가서 보기

```bash
docker exec -it web sh              # 새 프로세스로 셸 실행 — 기본 수단
docker exec -u root -it web sh      # root로
docker exec web env                 # 환경변수 확인
docker exec web cat /etc/nginx/nginx.conf
```

`attach`와 헷갈리지 않는 게 좋다.

| | `exec` | `attach` |
| --- | --- | --- |
| 하는 일 | 컨테이너 안에서 새 프로세스 실행 | 이미 도는 PID 1의 입출력에 연결 |
| 나갈 때 | `exit` 해도 컨테이너는 계속 돈다 | `Ctrl+C`를 누르면 컨테이너가 죽는다 |

`attach`에서 안전하게 빠져나오려면 `Ctrl+P`, `Ctrl+Q`를 누른다. 실무에서 `attach`를 쓸 일은 거의 없다.

### 셸이 없는 이미지라면

distroless나 scratch 기반 이미지에는 셸이 없어서 `exec`로 들어갈 수 없다. 이럴 때는 디버그용 컨테이너를 대상 컨테이너의 네임스페이스에 붙인다.

```bash
docker run -it --rm \
  --pid=container:web --network=container:web \
  --cap-add SYS_PTRACE \
  nicolaka/netshoot
```

`nicolaka/netshoot`에는 `curl`, `dig`, `tcpdump`, `ss` 등이 들어 있어 네트워크 문제를 볼 때 편하다.

## 파일 주고받기

```bash
docker cp web:/etc/nginx/nginx.conf ./nginx.conf   # 컨테이너 → 호스트
docker cp ./nginx.conf web:/etc/nginx/nginx.conf   # 호스트 → 컨테이너
docker cp web:/var/log/. ./logs/                   # 디렉터리 내용 전부
```

컨테이너가 멈춰 있어도 동작한다. 죽은 컨테이너에서 로그나 덤프를 꺼낼 때 유용하다.

다만 `docker cp`로 넣은 변경은 컨테이너를 지우면 사라진다. 설정 변경이 필요하면 이미지를 다시 빌드하거나 볼륨을 쓴다.

## 상태 보기

```bash
docker stats                 # CPU/메모리/네트워크/IO 실시간
docker stats --no-stream     # 한 번만 (스크립트용)
docker top web               # 컨테이너 안 프로세스 목록
docker inspect web           # 설정 전부 (JSON)
docker events                # 데몬 이벤트 실시간 스트림
docker port web              # 포트 매핑 확인
docker diff web              # 이미지 대비 파일시스템 변경분
```

`docker diff`가 재미있다. `A`는 추가, `C`는 변경, `D`는 삭제다. 컨테이너가 어디에 쓰기를 하고 있는지 알 수 있고, 그게 곧 "볼륨으로 빼야 할 경로"의 후보다.

`docker events`는 컨테이너가 왜 갑자기 죽었는지 추적할 때 쓴다.

```bash
docker events --filter 'container=web' --since 1h
```

## 리소스 제한

제한을 안 걸면 컨테이너 하나가 호스트 자원을 전부 가져갈 수 있다.

### 메모리

```bash
docker run -d --memory=512m --memory-swap=512m --name app myapp:1.0
```

- `--memory` - 최대 메모리
- `--memory-swap` - 메모리 + 스왑의 합. `--memory`와 같은 값을 주면 스왑을 못 쓴다
- `--memory-reservation` - 소프트 리밋. 호스트가 여유 있으면 넘겨 쓸 수 있다
- `--oom-kill-disable` - 위험하다. 호스트 전체가 멈출 수 있으니 쓰지 않는다

한도를 넘으면 컨테이너 안에서 가장 메모리를 많이 쓰는 프로세스가 죽는다. 대개 PID 1이므로 컨테이너가 종료 코드 137로 끝난다.

JVM을 쓴다면 반드시 확인할 것이 있다. 최신 JVM은 cgroup 한도를 인식하지만, 구버전은 호스트의 전체 메모리를 보고 힙을 잡아서 곧바로 OOM으로 죽는다.

```bash
docker run --memory=512m eclipse-temurin:21-jre \
  java -XX:MaxRAMPercentage=75 -jar app.jar
```

Node도 마찬가지로 `--max-old-space-size`를 컨테이너 한도에 맞춰 잡아준다.

### CPU

```bash
docker run -d --cpus=1.5 --name app myapp:1.0        # 코어 1.5개 분량
docker run -d --cpuset-cpus="0,1" --name app myapp:1.0  # 0,1번 코어에만
docker run -d --cpu-shares=512 --name app myapp:1.0     # 상대 가중치 (기본 1024)
```

`--cpus`는 절대적인 상한이고, `--cpu-shares`는 경합이 있을 때만 의미가 있는 상대 비율이다. 한가한 호스트에서는 shares를 낮게 줘도 100%까지 쓴다.

### 그 밖

```bash
--pids-limit 100          # 프로세스 수 제한 (fork 폭탄 방어)
--ulimit nofile=65535:65535  # 파일 디스크립터
--blkio-weight 500        # 블록 IO 가중치
```

### 실제로 걸리는지 확인

```bash
docker run --rm -it --memory=64m --memory-swap=64m alpine sh
# 컨테이너 안에서
cat /sys/fs/cgroup/memory.max        # cgroup v2
```

`docker stats`의 MEM USAGE / LIMIT 칸에서도 확인할 수 있다.

## 헬스체크

컨테이너가 "떠 있는 것"과 "정상인 것"은 다르다. 프로세스는 살아 있는데 응답을 못 하는 경우가 있다.

```bash
docker run -d --name web \
  --health-cmd='curl -f http://localhost/ || exit 1' \
  --health-interval=30s \
  --health-timeout=3s \
  --health-retries=3 \
  --health-start-period=10s \
  nginx:alpine

docker ps    # STATUS에 (healthy) / (unhealthy) 표시
docker inspect -f '{{json .State.Health}}' web
```

보통은 이걸 Dockerfile의 `HEALTHCHECK`에 넣거나 Compose에 적는다(4편, [7편](/post/docker-07-compose)).

주의: 도커 단독에서는 unhealthy가 되어도 컨테이너를 자동으로 재시작해주지 않는다. 상태 표시만 한다. 그 판단을 하는 건 Compose의 `depends_on: condition` 이나 오케스트레이터다.

## 자주 만나는 상황

컨테이너가 뜨자마자 종료된다
: PID 1이 곧바로 끝난 것이다. `docker run -it ubuntu bash`처럼 대화형 프로세스를 붙이거나, 실제 서비스라면 포그라운드로 도는 명령인지 확인한다. nginx는 `daemon off;`, Apache는 `-DFOREGROUND`가 필요하다. 데몬으로 백그라운드에 보내면 PID 1이 즉시 끝나 컨테이너도 끝난다.

포트가 이미 쓰이고 있다
: `bind: address already in use`. `docker ps`로 같은 포트를 쓰는 컨테이너를 찾거나 호스트 프로세스를 확인한다(`ss -tlnp | grep 8080`).

이름이 중복된다
: `Conflict. The container name "/web" is already in use`. 종료된 컨테이너가 그 이름을 잡고 있다. `docker rm web` 후 다시 만든다.

컨테이너 안에서 `localhost`로 다른 컨테이너에 접속이 안 된다
: 컨테이너 안의 `localhost`는 그 컨테이너 자신이다. 6편의 주제다.

시간대가 UTC로 나온다
: 대부분의 이미지가 UTC다. `-e TZ=Asia/Seoul`을 주거나 `/etc/localtime`을 읽기 전용으로 마운트한다. 다만 애플리케이션 레벨에서 타임존을 다루는 편이 더 안전하다.

## 정리

이번 편에서 잡아야 할 것.

- `exited`는 컨테이너가 사라진 게 아니다. 로그와 파일시스템이 남아 있다
- 포트·볼륨·네트워크·환경변수는 `create` 시점에만 정한다. 바꾸려면 다시 만든다
- `-it`는 stdin(`-i`)과 TTY(`-t`)다. CI에서는 `-t`를 빼야 한다
- `docker stop`은 SIGTERM 후 10초 뒤 SIGKILL이다. 앱이 시그널을 받게 하려면 `CMD`를 exec 형식으로
- 종료 코드 137은 SIGKILL - `OOMKilled` 값으로 원인을 구분한다. 143은 정상 종료
- 재시작 정책은 `unless-stopped`가 무난하고, 크래시 루프를 숨기니 로그를 본다
- 로그는 stdout으로 쓴다. `json-file` 드라이버에 `max-size`를 반드시 걸어둔다
- `exec`는 안전하고 `attach`는 Ctrl+C에 컨테이너가 죽는다
- 메모리 제한을 걸면 JVM/Node의 힙 설정도 같이 맞춘다
- 헬스체크는 상태만 표시한다. 자동 복구는 오케스트레이터의 몫이다

다음 편에서는 Dockerfile의 모든 명령어와 빌드 캐시를 정리한다.
