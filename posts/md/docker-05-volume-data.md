---
title: 도커 볼륨과 바인드 마운트 정리 - 컨테이너 데이터를 지키는 법 (도커 학습 노트 5)
date: 2026-01-09
category: docker
src: cover.svg
tags: [docker, volume, bind-mount, 데이터, 학습노트]
summary: 컨테이너를 지워도 데이터가 남게 하는 방법. 볼륨과 바인드 마운트와 tmpfs의 차이, node_modules가 사라지는 이유, UID 권한 문제, 볼륨 백업과 복원, DB 컨테이너 운영까지 정리한다.
---

> 도커 학습 노트 시리즈 5편. [4편](/post/docker-04-dockerfile)에서 이미지를 직접 만드는 데까지 왔다. 이번에는 그렇게 만든 컨테이너를 지워도 데이터가 남게 하는 방법이다.

## 왜 필요한가

[1편](/post/docker-01-container-basics)에서 본 대로 컨테이너의 쓰기 레이어는 컨테이너와 수명을 같이한다.

```bash
docker run -d --name db -e POSTGRES_PASSWORD=secret postgres:16-alpine
# ... 데이터를 넣고 ...
docker rm -f db          # 여기서 데이터가 전부 사라진다
```

컨테이너를 지우면 맨 위 쓰기 레이어가 통째로 삭제되기 때문이다. 재시작(`restart`)이나 정지(`stop`)로는 사라지지 않지만, 이미지를 새 버전으로 올리려면 결국 컨테이너를 다시 만들어야 한다. **컨테이너는 언제든 버릴 수 있어야 하고, 데이터는 그것과 별개로 살아남아야 한다.**

성능 문제도 있다. 유니온 파일시스템은 읽기에는 괜찮지만 **쓰기가 잦으면 Copy-on-Write 비용이 크다.** DB 데이터 디렉터리를 쓰기 레이어에 두면 눈에 띄게 느려진다.

## 세 가지 마운트

데이터를 쓰기 레이어 밖으로 빼는 방법은 셋이고, 성질이 뚜렷하게 갈린다.

| | 볼륨 (volume) | 바인드 마운트 (bind) | tmpfs |
| --- | --- | --- | --- |
| 저장 위치 | 도커가 관리하는 영역 | 호스트의 임의 경로 | 호스트 메모리 |
| 관리 주체 | 도커 (`docker volume`) | 사용자 | 도커 |
| 호스트 경로 의존 | 없음 | 있다 (경로가 있어야 함) | 없음 |
| 이식성 | 좋음 | 나쁨 | — |
| 주 용도 | **DB 데이터, 운영 영속 데이터** | **개발 중 소스 코드 마운트, 설정 파일** | 비밀값, 임시 파일 |
| 재부팅 후 | 남음 | 남음 | 사라짐 |

한 줄 기준: **운영 데이터는 볼륨, 개발 편의는 바인드 마운트, 비밀값과 스크래치는 tmpfs.**

## 문법 두 가지

```bash
# 짧은 문법
-v [소스]:[컨테이너 경로][:옵션]

# 명시적 문법 (권장)
--mount type=volume,src=pgdata,dst=/var/lib/postgresql/data
--mount type=bind,src="$(pwd)"/src,dst=/app/src,readonly
--mount type=tmpfs,dst=/tmp,tmpfs-size=64m
```

`-v`가 짧아서 많이 쓰이지만 위험한 성질이 하나 있다. **호스트 경로가 존재하지 않으면 도커가 빈 디렉터리를 만들어버린다.** 경로를 오타 냈을 때 에러가 아니라 빈 디렉터리가 마운트되고, 설정 파일이 없다며 컨테이너가 죽는 식으로 나타난다.

`--mount`는 없는 경로를 지정하면 곧바로 실패한다. 스크립트나 운영 설정에서는 `--mount`가 낫다.

## 이름 있는 볼륨

```bash
docker volume create pgdata

docker run -d --name db \
  -e POSTGRES_PASSWORD=secret \
  -v pgdata:/var/lib/postgresql/data \
  postgres:16-alpine
```

이제 컨테이너를 지웠다 다시 만들어도 데이터가 그대로다.

```bash
docker rm -f db
docker run -d --name db \
  -e POSTGRES_PASSWORD=secret \
  -v pgdata:/var/lib/postgresql/data \
  postgres:16-alpine     # 데이터 그대로
```

DB 버전 업그레이드도 같은 방식이다(다만 PostgreSQL은 메이저 업그레이드 시 `pg_upgrade`가 필요하다. 태그만 바꾸면 데이터 디렉터리 버전이 안 맞아서 기동에 실패한다).

관리 명령들.

```bash
docker volume ls
docker volume inspect pgdata
docker volume rm pgdata
docker volume prune              # 아무 컨테이너도 안 쓰는 볼륨 삭제
docker volume ls -f dangling=true
```

`docker volume inspect`의 `Mountpoint`가 실제 호스트 경로다. 보통 `/var/lib/docker/volumes/pgdata/_data`. **직접 손대는 건 권장되지 않지만**, 백업 위치를 확인하거나 디스크 사용량을 볼 때는 알아둘 만하다. 맥이나 윈도우에서는 VM 안이라 호스트에서 그 경로가 보이지 않는다.

### 빈 볼륨을 처음 마운트하면

이름 있는 볼륨이 **비어 있는 상태**로 컨테이너의 어떤 경로에 마운트되면, 도커가 **이미지에 있던 그 경로의 내용을 볼륨으로 복사해준다.** 그래서 처음 실행할 때 기본 설정 파일들이 볼륨에 채워진다.

한 번 내용이 들어간 뒤에는 복사가 일어나지 않는다. **이미지를 업데이트해서 그 경로의 파일이 바뀌어도, 기존 볼륨을 쓰면 옛날 파일이 계속 보인다.** 설정 파일을 볼륨에 두면 이 함정에 걸린다.

바인드 마운트에는 이 복사가 없다. 호스트 디렉터리가 비어 있으면 컨테이너에서도 비어 있다.

### 익명 볼륨

```bash
docker run -v /var/lib/mysql mysql:8    # 이름을 안 주면 익명 볼륨
```

`Dockerfile`의 `VOLUME` 지시어로도 만들어진다. 64자리 해시 이름이 붙고, 컨테이너를 지워도 남는다. 이게 쌓여서 디스크를 먹는 일이 흔하다.

```bash
docker run --rm -v /data ...     # --rm 을 쓰면 익명 볼륨도 같이 지워진다
docker volume ls -f dangling=true    # 방치된 것 확인
docker volume prune
```

`docker system prune`은 기본적으로 볼륨을 지우지 않는다. **`--volumes`를 붙여야 포함되는데, 그만큼 위험하다.** DB 볼륨이 딸려 나갈 수 있으니 운영 서버에서는 쓰지 않는다.

## 바인드 마운트

호스트의 특정 경로를 컨테이너에 그대로 연결한다. 개발 중 소스 코드를 반영할 때 쓴다.

```bash
docker run -d --name web \
  -p 3000:3000 \
  -v "$(pwd)":/app \
  -w /app \
  node:20-alpine npm run dev
```

호스트 경로는 `/`나 `./`로 시작해야 한다. 이름처럼 보이는 문자열(`src`)을 주면 도커가 **볼륨 이름으로 해석한다.** 상대 경로(`./src`)는 Compose에서는 예전부터, CLI에서는 최근 버전부터 되지만, 스크립트에서는 `$(pwd)`로 절대 경로를 만들어 두는 편이 안전하다.

읽기 전용으로 붙일 수 있다. 설정 파일은 이렇게 두는 게 안전하다.

```bash
docker run -d -v /etc/myapp/nginx.conf:/etc/nginx/nginx.conf:ro nginx:alpine
```

### node_modules가 사라지는 문제

가장 자주 걸리는 함정이다.

```bash
# 이미지 빌드 중에 npm ci 로 /app/node_modules 를 만들어뒀는데
docker run -v "$(pwd)":/app myapp     # 호스트 디렉터리가 /app 을 덮어버린다
```

마운트는 그 경로를 **가린다.** 호스트에 `node_modules`가 없으면 컨테이너에서도 없어지고, `Cannot find module` 에러가 난다.

해법은 그 하위 경로에 **익명 볼륨을 하나 더 얹어서** 이미지의 내용을 지키는 것이다.

```bash
docker run -d \
  -v "$(pwd)":/app \
  -v /app/node_modules \
  -p 3000:3000 myapp
```

Compose에서는 이렇게 쓴다.

```yaml
volumes:
  - .:/app
  - /app/node_modules
```

파이썬의 `.venv`, Java의 `build/`, Rust의 `target/`도 같은 방식으로 처리한다. **더 나은 방법은 의존성을 프로젝트 디렉터리 밖에 설치하는 것**이다(`NODE_PATH`, `PYTHONPATH` 조정, poetry의 가상환경 위치 변경).

### 권한 문제

리눅스에서 가장 성가신 부분이다. 컨테이너가 root로 돌면서 바인드 마운트에 파일을 만들면, **호스트에 root 소유 파일이 생긴다.** 그러면 호스트 사용자가 그 파일을 못 지운다.

```bash
docker run --rm -v "$(pwd)":/app alpine touch /app/newfile
ls -l newfile     # -rw-r--r-- root root   ← 내가 못 지운다
```

해법 몇 가지.

```bash
# 1) 실행 유저를 내 UID/GID 로 맞춘다 (가장 간단)
docker run --rm -u "$(id -u):$(id -g)" -v "$(pwd)":/app alpine touch /app/newfile

# 2) 이미지에 고정 UID 유저를 만들고 호스트 디렉터리 소유권을 맞춘다
#    Dockerfile: RUN useradd -u 1000 app  /  USER app
```

반대 방향의 문제도 있다. 이미지 안의 유저 UID(예: 1001)와 호스트 디렉터리 소유자 UID(1000)가 안 맞으면 **컨테이너가 그 디렉터리에 쓰지 못한다.** `Permission denied`가 뜨면 양쪽 UID를 먼저 확인한다.

```bash
docker run --rm -v "$(pwd)":/app alpine ls -ln /app   # UID 숫자로 보기
id -u; id -g
```

이름 있는 볼륨은 이 문제가 훨씬 덜하다. 도커가 초기 소유권을 이미지 기준으로 맞춰주기 때문이다. **운영에서 볼륨을 권장하는 이유 중 하나다.**

### SELinux

RHEL, CentOS, Fedora에서 바인드 마운트가 `Permission denied`로 막히면 SELinux 라벨 문제다.

```bash
-v /host/path:/container/path:z    # 여러 컨테이너가 공유 (라벨 공유)
-v /host/path:/container/path:Z    # 이 컨테이너 전용 (라벨 배타)
```

`:Z`는 호스트 디렉터리의 라벨을 바꾸므로, `/home`이나 시스템 디렉터리에 걸면 안 된다.

### 맥·윈도우 성능

1편에서 본 대로 컨테이너가 VM 안에서 돌기 때문에 바인드 마운트는 파일시스템 경계를 넘는다. 파일 수가 많은 프로젝트(`node_modules`!)에서 특히 느리다.

- 맥: Docker Desktop 설정에서 **VirtioFS** 사용, `:cached` / `:delegated` 옵션
- 윈도우: 소스를 `/mnt/c/...`가 아니라 **WSL2 파일시스템 안**에 두는 것이 가장 효과가 크다
- 공통: 의존성 디렉터리는 바인드 마운트에서 빼고 볼륨으로 처리

## tmpfs

메모리에만 존재하고 컨테이너가 끝나면 사라진다.

```bash
docker run -d --tmpfs /tmp:size=64m,mode=1777 myapp
docker run -d --mount type=tmpfs,dst=/run,tmpfs-size=16m myapp
```

용도는 둘이다.

- 비밀값을 디스크에 남기지 않고 다루기
- 임시 파일 I/O 성능

`--read-only`와 조합하면 견고한 구성이 된다.

```bash
docker run -d --read-only \
  --tmpfs /tmp --tmpfs /run \
  -v applogs:/var/log/app \
  myapp:1.0
```

루트 파일시스템 전체가 읽기 전용이라 침해가 나도 바이너리를 심을 수 없다. 쓰기가 필요한 경로만 명시적으로 열어준다. [8편](/post/docker-08-optimize-operate)의 보안 이야기에서 다시 나온다.

## 볼륨 백업과 복원

볼륨은 도커가 관리하는 영역이라 `cp`로 바로 못 가져온다. **임시 컨테이너에 볼륨과 호스트 디렉터리를 같이 마운트해서 tar로 옮기는 것**이 표준 패턴이다.

```bash
# 백업: pgdata 볼륨 → 현재 디렉터리의 pgdata.tar.gz
docker run --rm \
  -v pgdata:/data:ro \
  -v "$(pwd)":/backup \
  alpine tar czf /backup/pgdata.tar.gz -C /data .

# 복원: pgdata2 볼륨으로 풀기
docker volume create pgdata2
docker run --rm \
  -v pgdata2:/data \
  -v "$(pwd)":/backup \
  alpine sh -c "tar xzf /backup/pgdata.tar.gz -C /data"
```

**DB는 이 방법으로 백업하기 전에 반드시 컨테이너를 멈춘다.** 돌고 있는 DB의 데이터 파일을 그대로 복사하면 일관성이 깨진 스냅샷이 나온다. 안전한 순서는 이렇다.

```bash
docker stop db
docker run --rm -v pgdata:/data:ro -v "$(pwd)":/backup alpine \
  tar czf /backup/pgdata.tar.gz -C /data .
docker start db
```

멈출 수 없다면 DB가 제공하는 논리 백업을 쓴다. 이쪽이 사실 더 안전하고 이식성도 좋다.

```bash
docker exec db pg_dump -U postgres appdb | gzip > appdb.sql.gz
docker exec db mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" appdb | gzip > appdb.sql.gz

# 복원
gunzip -c appdb.sql.gz | docker exec -i db psql -U postgres appdb
```

`docker exec -i`의 `-i`가 중요하다. 표준 입력을 넘겨야 하므로 `-t`는 붙이지 않는다.

### 볼륨 사이 복사

```bash
docker run --rm -v old:/from -v new:/to alpine \
  sh -c "cd /from && cp -a . /to"
```

`cp -a`는 소유권과 권한을 보존한다. DB 데이터라면 이게 반드시 필요하다.

## DB 컨테이너 실전

지금까지 본 것들을 한 줄에 모으면 대략 이런 모양이 된다.

```bash
docker run -d --name pg \
  -e POSTGRES_PASSWORD=secret \
  -e POSTGRES_DB=appdb \
  -e POSTGRES_USER=app \
  -e TZ=Asia/Seoul \
  -p 127.0.0.1:5432:5432 \
  -v pgdata:/var/lib/postgresql/data \
  -v "$(pwd)"/initdb:/docker-entrypoint-initdb.d:ro \
  --restart unless-stopped \
  postgres:16-alpine
```

몇 가지 관행이 들어 있다.

- **`-p 127.0.0.1:5432:5432`** — 로컬에서만 접근 가능하게 묶는다. `-p 5432:5432`는 인터넷에 DB를 여는 것과 같다
- **`/docker-entrypoint-initdb.d`** — 이 디렉터리의 `.sql`, `.sh` 파일을 **볼륨이 비어 있는 최초 기동에만** 실행한다. 두 번째부터는 무시되므로, 스키마를 바꿨는데 반영이 안 된다면 볼륨이 이미 초기화된 상태라는 뜻이다
- **데이터 경로는 이미지마다 다르다** — PostgreSQL은 `/var/lib/postgresql/data`, MySQL/MariaDB는 `/var/lib/mysql`, MongoDB는 `/data/db`, Redis는 `/data`. 이미지 문서에서 확인한다
- **DB 데이터를 바인드 마운트에 두지 않는다** — 권한 문제와 파일시스템 호환성 문제가 계속 생긴다. 맥/윈도우에서는 특히 그렇다

Redis처럼 기본이 인메모리인 것도 영속화를 켜려면 명시해야 한다.

```bash
docker run -d --name redis \
  -v redisdata:/data \
  redis:7-alpine redis-server --appendonly yes
```

## 어디에 무엇을 마운트할지 정하기

컨테이너가 어느 경로에 쓰고 있는지는 [3편](/post/docker-03-run-lifecycle)의 `docker diff`로 확인할 수 있다.

```bash
docker diff mycontainer | grep -v '^C /proc' | head -30
```

여기 나오는 경로 중 **재시작 후에도 남아야 하는 것**이 볼륨 후보다. 로그, 업로드 파일, DB 데이터, 캐시가 보통 여기 해당한다.

## 정리

이번 편에서 잡아야 할 것.

- 컨테이너를 지우면 쓰기 레이어가 사라진다. 남아야 할 데이터는 반드시 볼륨으로
- 운영 데이터는 **볼륨**, 개발 소스는 **바인드 마운트**, 비밀값·임시 파일은 **tmpfs**
- `-v`는 없는 호스트 경로를 만들어버린다. 운영 스크립트에는 `--mount`
- 빈 볼륨을 처음 마운트하면 이미지의 내용이 복사된다. 두 번째부터는 안 된다
- 바인드 마운트는 그 경로를 가린다 → `node_modules`는 익명 볼륨으로 덮어 보호
- 리눅스에서 UID/GID가 안 맞으면 권한 문제가 난다. `-u $(id -u):$(id -g)`
- 볼륨 백업은 임시 컨테이너 + tar. DB는 멈춘 뒤 백업하거나 논리 백업(`pg_dump`)을 쓴다
- `/docker-entrypoint-initdb.d`는 최초 기동에만 실행된다
- DB 포트는 `127.0.0.1:`을 붙여 묶는다
- `docker system prune --volumes`는 운영에서 쓰지 않는다

다음 편에서는 컨테이너끼리 어떻게 통신하는지, 포트 매핑이 실제로 무슨 일을 하는지 정리한다.
