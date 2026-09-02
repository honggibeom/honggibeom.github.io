---
title: 도커 네트워크와 포트 매핑, 컨테이너 간 통신 정리 (도커 학습 노트 6)
date: 2026-01-25
category: docker
src: cover.svg
tags: [docker, network, bridge, dns, 학습노트]
summary: 컨테이너가 어떻게 네트워크를 갖는지, 포트 매핑이 실제로 무엇을 하는지, 컨테이너끼리 이름으로 통신하는 원리와 localhost 함정, 그리고 네트워크 문제를 디버깅하는 방법을 정리한다.
---

> 도커 학습 노트 시리즈 6편.

## 컨테이너는 자기만의 네트워크를 갖는다

1편에서 본 net 네임스페이스가 여기서 전부다. 컨테이너는 자기만의 네트워크 인터페이스, IP, 라우팅 테이블, 포트 공간을 갖는다.

기본 구성은 이렇다.

```
         호스트
 ┌──────────────────────────────────────────┐
 │  eth0 (192.168.0.10)                     │
 │        │                                  │
 │   [ iptables NAT ]                        │
 │        │                                  │
 │  docker0 브리지 (172.17.0.1)               │
 │     │            │                        │
 │   veth         veth       ← 가상 랜선 한 쌍  │
 │     │            │                        │
 │  ┌──┴──┐      ┌──┴──┐                     │
 │  │eth0 │      │eth0 │                     │
 │  │.0.2 │      │.0.3 │                     │
 │  │ 컨A │      │ 컨B │                     │
 │  └─────┘      └─────┘                     │
 └──────────────────────────────────────────┘
```

컨테이너를 만들면 도커가 **veth 쌍**(가상 랜선 한 쌍)을 만들어 한쪽은 컨테이너의 네임스페이스에, 다른 쪽은 호스트의 브리지에 꽂는다. 브리지는 소프트웨어 스위치다.

직접 확인해보자.

```bash
docker run -d --name a nginx:alpine
docker exec a ip addr
# eth0: 172.17.0.2/16

ip addr show docker0
# docker0: 172.17.0.1/16

ip link | grep veth      # 호스트 쪽 veth 인터페이스가 보인다
```

## 네트워크 드라이버

| 드라이버 | 용도 |
| --- | --- |
| `bridge` | 기본값. 단일 호스트에서 컨테이너끼리 통신 |
| `host` | 호스트 네트워크를 그대로 사용. 격리 없음 |
| `none` | 루프백만. 완전 격리 |
| `overlay` | 여러 호스트에 걸친 네트워크 (Swarm) |
| `macvlan` / `ipvlan` | 컨테이너에 물리 네트워크의 IP를 직접 부여 |

```bash
docker network ls
# NETWORK ID  NAME    DRIVER  SCOPE
# ...         bridge  bridge  local   ← 기본 docker0
# ...         host    host    local
# ...         none    null    local
```

일상적으로 쓰는 건 `bridge`고, 나머지는 필요할 때 꺼내 쓴다.

## 기본 브리지와 사용자 정의 브리지

여기서 실무 차이가 크게 갈린다.

| | 기본 `bridge` | 사용자 정의 브리지 |
| --- | --- | --- |
| **컨테이너 이름으로 DNS 해석** | **안 된다** | **된다** |
| 격리 | 모든 컨테이너가 한 네트워크에 | 네트워크 단위로 분리 |
| 실행 중 연결/해제 | 불가 | 가능 |
| `--link` | 레거시 방식으로만 가능 | 불필요 |

**결론: 기본 브리지는 쓰지 않는다.** 컨테이너를 두 개 이상 쓰는 순간 반드시 사용자 정의 네트워크를 만든다.

```bash
docker network create appnet

docker run -d --name api  --network appnet myapi:1.0
docker run -d --name db   --network appnet -e POSTGRES_PASSWORD=secret postgres:16-alpine

# api 컨테이너에서
docker exec api ping -c1 db          # 이름으로 바로 통한다
docker exec api sh -c 'nc -z db 5432 && echo ok'
```

`db`라는 이름이 컨테이너의 IP로 해석된다. IP를 코드에 박을 필요가 없다는 게 핵심이다. 컨테이너를 다시 만들면 IP는 바뀌지만 이름은 그대로다.

### 내장 DNS

이 이름 해석은 도커의 내장 DNS 서버가 한다. 컨테이너 안의 `/etc/resolv.conf`를 보면 알 수 있다.

```bash
docker exec api cat /etc/resolv.conf
# nameserver 127.0.0.11
```

`127.0.0.11`이 도커의 내장 DNS다. 컨테이너 이름과 네트워크 별칭을 먼저 찾고, 없으면 호스트의 DNS로 넘긴다.

별칭을 여러 개 붙일 수도 있다.

```bash
docker run -d --name postgres-primary \
  --network appnet --network-alias db --network-alias database \
  postgres:16-alpine
```

`db`, `database`, `postgres-primary` 셋 다 통한다. 컨테이너 교체 시 이름은 바꾸되 별칭은 유지하는 식으로 쓴다.

### 네트워크 관리

```bash
docker network create --driver bridge \
  --subnet 172.28.0.0/16 --gateway 172.28.0.1 appnet

docker network inspect appnet      # 붙어 있는 컨테이너와 IP 목록
docker network connect othernet api      # 실행 중에 추가 연결
docker network disconnect appnet api
docker network rm appnet
docker network prune
```

컨테이너 하나가 여러 네트워크에 동시에 붙을 수 있다. 프런트/백엔드 망을 나누고 API만 양쪽에 붙이는 식으로 격리를 만든다.

```bash
docker network create frontnet
docker network create backnet

docker run -d --name web --network frontnet nginx:alpine
docker run -d --name api --network frontnet myapi:1.0
docker network connect backnet api
docker run -d --name db  --network backnet postgres:16-alpine

# web → db 는 통하지 않는다. api 만 양쪽에 있다
```

**DB를 백엔드 망에만 두면 웹 서버가 침해당해도 DB에 직접 접근할 수 없다.** 포트를 호스트에 열지 않고도 서비스가 돌아간다는 게 컨테이너 네트워크의 큰 장점이다.

## 포트 매핑이 실제로 하는 일

```bash
docker run -d -p 8080:80 --name web nginx:alpine
```

이 한 줄이 하는 일은 **호스트에 NAT 규칙을 넣는 것**이다.

```bash
sudo iptables -t nat -L DOCKER -n
# DNAT tcp -- 0.0.0.0/0  0.0.0.0/0  tcp dpt:8080 to:172.17.0.2:80
```

호스트의 8080으로 들어온 패킷의 목적지를 컨테이너 IP:80으로 바꿔서 넘긴다. 일부 경우에는 `docker-proxy`라는 사용자 공간 프로세스가 대신 중계하기도 한다.

문법을 정확히 알아두면 좋다.

```bash
-p 8080:80                  # 0.0.0.0:8080 → 컨테이너 80  (모든 인터페이스!)
-p 127.0.0.1:8080:80        # 로컬호스트에서만
-p 8080:80/udp              # UDP
-p 80                       # 호스트 포트를 랜덤 배정
-P                          # EXPOSE 된 포트 전부 랜덤 배정
```

순서는 항상 **`호스트:컨테이너`**다. 헷갈리면 "밖에서 안으로"라고 외운다.

```bash
docker port web             # 실제 매핑 확인
```

### 방화벽을 우회하는 문제

리눅스에서 반드시 알아야 할 함정이다. 도커는 iptables의 `DOCKER` 체인에 직접 규칙을 넣기 때문에, **`ufw`로 막아둔 포트가 도커 컨테이너에서는 열린다.**

```bash
sudo ufw deny 5432
docker run -d -p 5432:5432 postgres:16-alpine    # 외부에서 접속된다
```

`ufw`는 `INPUT` 체인을 보고, 도커의 DNAT는 그보다 앞선 `PREROUTING`에서 처리되기 때문이다. 개발 서버를 클라우드에 띄우고 "방화벽 걸어놨으니 괜찮겠지" 했다가 DB가 통째로 노출되는 사고가 여기서 난다.

대응은 셋 중 하나다.

- **`-p 127.0.0.1:5432:5432`로 바인딩을 묶는다** (가장 간단하고 확실하다)
- 애초에 포트를 호스트에 열지 않고 컨테이너 네트워크 안에서만 통신한다
- 클라우드의 보안 그룹/네트워크 ACL로 막는다 (호스트 방화벽보다 바깥이라 유효하다)

`daemon.json`에 `{"iptables": false}`를 넣는 방법도 있지만 컨테이너 네트워킹이 전반적으로 깨지므로 권장되지 않는다.

## localhost 함정

가장 자주 나오는 질문이다.

```bash
# 컨테이너 안에서
curl http://localhost:5432     # ← 자기 자신의 5432. DB 컨테이너가 아니다!
```

**컨테이너 안의 `localhost`는 그 컨테이너 자신이다.** 각자 네트워크 네임스페이스가 다르므로 루프백도 각자 갖는다.

상황별로 정리하면 이렇다.

| 어디서 → 어디로 | 주소 |
| --- | --- |
| 컨테이너 → 같은 네트워크의 다른 컨테이너 | **컨테이너 이름** (`db:5432`) |
| 호스트 → 컨테이너 | `localhost:호스트포트` (`-p`가 있어야 함) |
| 컨테이너 → 호스트에서 도는 서비스 | `host.docker.internal` (맥/윈도우), 리눅스는 아래 참조 |
| 컨테이너 → 외부 인터넷 | 그냥 된다 (NAT) |

컨테이너 간 통신에서는 **호스트 포트가 아니라 컨테이너의 원래 포트**를 쓴다는 점도 중요하다. `-p 5433:5432`로 띄운 DB에 다른 컨테이너가 붙을 때는 `db:5432`다. `5433`이 아니다.

### 컨테이너에서 호스트로

맥과 윈도우에서는 특수 호스트명이 준비되어 있다.

```bash
docker run --rm alpine ping -c1 host.docker.internal
```

리눅스에서는 기본 제공되지 않아서 명시적으로 추가한다.

```bash
docker run --add-host=host.docker.internal:host-gateway --rm alpine \
  ping -c1 host.docker.internal
```

`host-gateway`는 도커가 호스트 IP로 치환해주는 특수 값이다. Compose에서는 `extra_hosts`에 같은 값을 넣는다.

### 0.0.0.0으로 바인딩해야 한다

컨테이너 안의 애플리케이션이 `127.0.0.1`에만 바인딩하면, **포트 매핑을 해도 밖에서 접속되지 않는다.** 컨테이너의 루프백에만 붙어 있기 때문이다.

```
# 안 됨
app.listen(3000, '127.0.0.1')
flask run --host=127.0.0.1

# 됨
app.listen(3000, '0.0.0.0')
flask run --host=0.0.0.0
python manage.py runserver 0.0.0.0:8000
```

"포트를 열었는데 connection refused"의 절반이 이것이다. 확인은 컨테이너 안에서 한다.

```bash
docker exec web netstat -tlnp    # 또는 ss -tlnp
# 0.0.0.0:80 이어야 한다. 127.0.0.1:80 이면 밖에서 못 붙는다
```

## host 네트워크 모드

```bash
docker run -d --network host nginx:alpine
```

네트워크 네임스페이스를 만들지 않고 **호스트의 네트워크를 그대로 쓴다.** `-p`가 무의미해지고(무시된다), 컨테이너가 호스트의 80 포트를 직접 잡는다.

- 장점: NAT 오버헤드가 없다. 포트를 대량으로 여는 서비스에 유리하다
- 단점: 격리가 없다. 포트 충돌이 나고, 다른 컨테이너와 포트를 나눠 쓸 수 없다
- **맥/윈도우에서는 기대대로 동작하지 않는다.** 컨테이너가 붙는 "호스트"는 그 안의 리눅스 VM이다

성능이 정말 문제가 되는 게 아니면 브리지를 쓴다.

`none`은 반대다. 루프백만 있고 외부와 완전히 단절된다. 네트워크가 필요 없는 배치 작업에 쓴다.

```bash
docker run --rm --network none alpine ip addr    # lo 만 있다
```

## 여러 호스트에 걸친 네트워크

단일 호스트를 벗어나면 `overlay`다. Swarm 모드에서 VXLAN으로 호스트 간 가상 네트워크를 만든다.

```bash
docker swarm init
docker network create -d overlay --attachable multinet
```

다만 실무에서 여러 노드를 다뤄야 하는 시점이면 대개 쿠버네티스로 간다. `overlay`는 "이런 게 있다" 정도로 알아두면 된다.

`macvlan`은 컨테이너에 물리 LAN의 IP를 직접 주는 방식이다. 레거시 애플리케이션이 자기 IP를 가져야 할 때 쓰는데, 스위치 설정과 promiscuous 모드가 필요해서 손이 많이 간다.

## 디버깅

네트워크 문제는 **어느 구간에서 끊기는지**를 좁히는 게 전부다.

```bash
# 1) 컨테이너가 그 네트워크에 붙어 있나
docker inspect -f '{{json .NetworkSettings.Networks}}' api | python3 -m json.tool

# 2) 이름이 해석되나
docker exec api getent hosts db
docker exec api nslookup db      # 없으면 아래 netshoot 사용

# 3) 포트가 열려 있나
docker exec api nc -zv db 5432

# 4) 애플리케이션이 0.0.0.0 에 바인딩했나
docker exec db ss -tlnp

# 5) 호스트에서 매핑이 걸려 있나
docker port web
ss -tlnp | grep 8080
```

셸이나 도구가 없는 이미지라면 3편에서 본 netshoot을 붙인다.

```bash
docker run -it --rm --network container:api nicolaka/netshoot
# 안에서 dig db / curl -v http://db:8080 / tcpdump -i any port 5432
```

`--network container:api`는 **대상 컨테이너의 네트워크 네임스페이스를 그대로 공유**한다. 그래서 api 컨테이너에서 보는 것과 완전히 같은 시야를 얻는다.

## 자주 만나는 문제

**컨테이너 이름으로 접속이 안 된다**
: 기본 `bridge` 네트워크를 쓰고 있는 것이다. 사용자 정의 네트워크를 만들어 양쪽을 붙인다. Compose는 자동으로 만들어주므로 이 문제가 없다.

**connection refused**
: 앱이 `127.0.0.1`에 바인딩했거나, 포트 번호가 틀렸거나(컨테이너 간에는 원래 포트), 앱이 아직 안 떴다. `docker logs`부터 본다.

**connection timeout**
: 다른 네트워크에 있거나 방화벽/보안 그룹이 막고 있다. `refused`와 `timeout`은 원인이 다르니 구분해서 읽는다.

**DB가 아직 준비되지 않았는데 앱이 먼저 붙는다**
: 컨테이너가 "떴다"와 "준비됐다"는 다르다. 헬스체크와 재시도 로직이 필요하다. 7편에서 다룬다.

**컨테이너에서 외부 인터넷이 안 된다**
: 호스트의 IP 포워딩이 꺼져 있거나(`net.ipv4.ip_forward`), 사내 DNS 문제일 수 있다. `docker run --rm alpine ping -c1 8.8.8.8`(IP)과 `ping -c1 google.com`(도메인)을 나눠서 시험하면 네트워크 문제인지 DNS 문제인지 갈린다.

**VPN을 켜면 도커 네트워크가 안 된다**
: 도커 기본 서브넷(`172.17.0.0/16`)이 사내망과 충돌한 경우다. `daemon.json`의 `default-address-pools`로 대역을 옮긴다.

```json
{
  "default-address-pools": [
    { "base": "10.201.0.0/16", "size": 24 }
  ]
}
```

## 정리

이번 편에서 잡아야 할 것.

- 컨테이너는 veth로 브리지에 연결된 자기만의 네트워크 네임스페이스를 갖는다
- **기본 `bridge`에는 이름 해석이 없다.** 항상 사용자 정의 네트워크를 만든다
- 컨테이너 이름이 곧 호스트명이다. IP를 코드에 박지 않는다
- 포트 매핑은 iptables DNAT다. `-p 호스트:컨테이너` 순서
- `-p 8080:80`은 모든 인터페이스에 연다. 내부용은 `-p 127.0.0.1:...`로 묶는다
- **도커는 `ufw`를 우회한다.** 방화벽만 믿으면 안 된다
- 컨테이너 안의 `localhost`는 자기 자신이다
- 컨테이너 간 통신은 호스트 포트가 아니라 **원래 포트**를 쓴다
- 앱은 `0.0.0.0`에 바인딩해야 밖에서 붙는다
- 네트워크를 나눠서 DB를 백엔드 망에만 두면 격리가 생긴다
- 디버깅은 이름 해석 → 포트 → 바인딩 주소 순으로 좁힌다

다음 편에서는 지금까지 손으로 붙인 것들을 파일 하나로 묶는 Docker Compose를 정리한다.
