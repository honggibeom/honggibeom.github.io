---
title: StockAnalyst 데이터 파이프라인 - 증분 수집, 실행 로그, 호출량 관리, 왜 파이썬인가
date: 2026-09-02
category: stockanalyst
src: cover.svg
tags: [stockanalyst, python, 데이터파이프라인, yfinance, 배치, 증분수집]
summary: StockAnalyst 파이썬 데이터 파이프라인 기록. run_pipeline.py 단계 구조, 왜 스프링에 합치지 않았나, 캔들·매크로·옵션의 증분 기준, pipeline_run 실행 로그, 미국 유니버스를 DB 하나로 통일, 하루 외부 호출량 표와 스로틀, JSONC 파서와 pip 삽질.
---

> StockAnalyst는 Spring Boot + React(Vite) + Python 파이프라인으로 만든 주식 정보 서비스다. 개발기 1편은 [뉴스 감성 모델](/post/stockanalyst-sentiment-model)과 [종목 추출](/post/stockanalyst-ticker-extraction)이었고, 2편은 그것을 뺀 나머지를 주제별로 나눴다. 전체 목차는 [개발기 (2) 목차](/post/stockanalyst-dev-log-2-overview)에 있다.

한눈에 보기

- `run_pipeline.py` 하나가 모든 단계를 돌린다. 설정 스위치 + `--only/--skip`. 원래 12단계였고, 변곡점 배치 둘을 지운 뒤로 10단계
- 파이썬을 스프링에 합치지 않은 이유: 생태계, 수명주기, 장애 격리, 스케줄링. 대신 스키마 주인이 둘인 건 조심
- 증분은 캔들·매크로·옵션 각각 기준이 다르고, DB가 최신이면 요청 자체를 안 보낸다. 실행 로그는 DB 테이블에
- 하루 호출 약 7,800건 중 Yahoo가 4,800. 옵션이 그 절반. 429면 90초 멈춤

## 구조

```
krx/
├─ domestic/   종목 마스터, 일봉 캔들(전 종목 + 벤치마크 ETF), 지수옵션, 공매도
├─ nasdaq/     미국 마스터, 캔들, 펀더멘털, 옵션 요약, 투자의견·공매도
├─ common/     매크로, 브라질 국채, 뉴스, 미국 유니버스 정의
├─ findPoint/  변곡점 학습·예측
├─ sentiment/  감성 모델 (1편)
└─ run_pipeline.py   단계 실행기 + 설정 + 실행 로그
```

<svg viewBox="0 0 760 124" width="100%" style="max-width:760px;display:block;margin:22px auto" role="img" aria-label="run_pipeline.py가 순서대로 돌리는 단계">
<g font-size="13" fill="var(--color-text)" text-anchor="middle">
<rect x="0" y="30" width="132" height="70" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="66" y="52">master</text>
<text x="66" y="69" fill="var(--color-text-dim)" font-size="11">종목 마스터</text>
<rect x="156" y="30" width="132" height="70" rx="8" fill="var(--color-accent-soft)" stroke="var(--color-accent)"/>
<text x="222" y="52" font-weight="600">domestic · nasdaq</text>
<text x="222" y="69" fill="var(--color-text-dim)" font-size="11">캔들 · 펀더멘털</text>
<rect x="312" y="30" width="132" height="70" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="378" y="52">macro · bonds · news</text>
<text x="378" y="69" fill="var(--color-text-dim)" font-size="11">지표 · 브라질 국채</text>
<text x="378" y="83" fill="var(--color-text-dim)" font-size="11">뉴스</text>
<rect x="468" y="30" width="132" height="70" rx="8" fill="var(--color-bg-subtle)" stroke="var(--color-border)"/>
<text x="534" y="52">short · options · opinion</text>
<text x="534" y="69" fill="var(--color-text-dim)" font-size="11">공매도 · 옵션 · 의견</text>
<rect x="624" y="30" width="132" height="70" rx="8" fill="var(--color-accent-soft)" stroke="var(--color-accent)"/>
<text x="690" y="52" font-weight="600">predict-kr · us</text>
<text x="690" y="69" fill="var(--color-text-dim)" font-size="11">변곡점 (v2에서 삭제)</text>
</g>
<path d="M132 65.0h18m-6-5l6 5-6 5" stroke="var(--color-text-dim)" stroke-width="1.5" fill="none"/>
<path d="M288 65.0h18m-6-5l6 5-6 5" stroke="var(--color-text-dim)" stroke-width="1.5" fill="none"/>
<path d="M444 65.0h18m-6-5l6 5-6 5" stroke="var(--color-text-dim)" stroke-width="1.5" fill="none"/>
<path d="M600 65.0h18m-6-5l6 5-6 5" stroke="var(--color-text-dim)" stroke-width="1.5" fill="none"/>
</svg>

`run_pipeline.py`가 단계(master, domestic, nasdaq, macro, bonds, news, short-balance, index-options, us-options, us-opinion, predict-kr, predict-us)를 순서대로 돌리고, `pipeline_config.json`의 `execute_*` 스위치로 켜고 끈다. `--only`, `--skip` 인자가 설정보다 우선한다.

> 마지막 두 단계(`predict-kr`, `predict-us`)는 지금은 없다. 전 종목 변곡점 배치를 통째로 지우고 버튼을 눌렀을 때 백엔드가 계산하는 구조로 옮겼기 때문이다 → [변곡점 예측 v2](/post/stockanalyst-turning-point-v2). 아래 구조 설명은 12단계였던 시점 기준이고, 지금은 10단계다.

## 왜 파이썬을 스프링으로 합치지 않았나

| 관점 | 파이썬 배치 | 스프링에 합치면 |
|---|---|---|
| 생태계 | pandas · yfinance · FinanceDataReader · pykrx · PyTorch | 전부 없다. 학습 코드는 사실상 재작성 |
| 수명주기 | 20분 실행하고 끝 | API 서버는 상시 응답. 둘을 한 프로세스에 두면 배치가 API를 흔든다 |
| 장애 격리 | KRX가 차단해도 API는 멀쩡 | 같이 죽는다 |
| 스케줄링 | Windows 작업 스케줄러에 `run_pipeline.py` 직접 | 스프링에서 파이썬을 실행하는 우회가 필요 |

다만 DB 스키마의 주인이 둘이라는 점(파이썬의 `CREATE TABLE IF NOT EXISTS`와 JPA의 `ddl-auto`)은 조심해야 한다. 스키마가 안정되면 백엔드를 `validate`로 바꿔 기동 시 불일치를 잡을 생각이다.

## 증분과 실행 로그

| 데이터 | 증분 기준 |
|---|---|
| 캔들 | 종목별 `MAX(target_date)` 이후만. DB가 최근 영업일까지 있으면 요청 자체를 안 보냄(벤치마크 ETF의 마지막 캔들 날짜 기준) |
| 매크로 | 지표별 MAX 이후만 |
| 옵션 · 투자의견 | 일별 스냅샷. 오늘 이미 받은 티커는 건너뜀 |

종목별 MAX 쿼리 7,200번을 `GROUP BY` 1번으로 바꾼 것도 여기서다.

증분에는 한 가지 함정이 있다. "그 날짜 행이 있다"와 "그 날짜 값이 있다"는 다르다. 행은 먼저 만들어지고 값은 늦게 채워지는 데이터가 있는데, `MAX(날짜)`만 보는 증분은 그런 행을 "이미 받았다"로 판정하고 두 번 다시 안 온다. 그러면 그 칸은 영원히 빈다. 같은 원인의 버그를 이 시리즈에서 두 번 더 만난다 - [미국 지수 종가가 NULL로 들어오던 건](/post/stockanalyst-dow-theory)과 [공매도 잔고 T+3 건](/post/stockanalyst-dev-log-3-signals-rates)이다. 증분 조건은 날짜가 아니라 실제로 쓰는 컬럼이 채워졌는지로 잡는 게 맞다.

콘솔 출력은 창을 닫으면 사라져서 "며칠 전 무엇이 왜 실패했는지"를 알 수 없었다. `pipeline_run` 테이블에 단계마다 상태·소요·요약(성공·경고·실패 표시가 붙은 마지막 줄)·마지막 30줄을 남기고, `--status`로 단계별 마지막 실행을 본다. 기록자는 `run_pipeline.py` 한 곳뿐이고 각 수집 스크립트는 건드리지 않았다. (이 `--status`가 조회 실패를 조용히 삼키고 있던 건 [3편](/post/stockanalyst-dev-log-3-signals-rates)에서 고쳤다.)

## 미국 유니버스는 DB 하나로

미국 종목 목록이 설정 파일의 `nasdaq_tickers` 25개, `extra_us_tickers`, `us_option_tickers`, 유니버스 프리셋으로 흩어져 있었고 스크립트마다 다른 키를 읽었다.

| | 전 | 후 |
|---|---|---|
| 종목 목록 | 설정 파일 4곳, 스크립트마다 다른 키 | stock 테이블 하나 |
| 범위 | 손으로 적은 25개 | S&P500 + 나스닥100 + 추가 종목 + SPY·QQQ ≈ 610종목. nasdaqtraded 1만 종목 중 유니버스만, ETF는 `sector='ETF'` |
| 소비자 | 각자 설정을 읽음 | 캔들·펀더멘털·옵션·투자의견·예측·뉴스 검색어 전부 DB의 미국 종목을 읽음 |

손으로 적는 목록은 없앴다.

## 호출량 관리

KRX 차단 이후 전체 호출 지점을 표로 만들어 관리한다.

<svg viewBox="0 0 640 214" width="100%" style="max-width:640px;display:block;margin:22px auto" role="img" aria-label="하루 외부 호출량: 네이버 fchart 2,900, Yahoo 4,800, NAVER 검색 107, pykrx 10, KRX Open API 3">
<text x="0" y="14" font-size="13" fill="var(--color-text-muted)">전부 켰을 때 하루 외부 호출 (대략)</text>
<text x="0" y="45" font-size="13" fill="var(--color-text)">네이버 fchart (국내 캔들)</text>
<rect x="150" y="30" width="242" height="20" rx="4" fill="var(--color-border-strong)"/>
<text x="400" y="45" font-size="13" fill="var(--color-text-muted)">2,900건</text>
<text x="0" y="77" font-size="13" fill="var(--color-text)">Yahoo (미국)</text>
<rect x="150" y="62" width="400" height="20" rx="4" fill="var(--color-accent)"/>
<text x="558" y="77" font-size="13" fill="var(--color-text-muted)">4,800건</text>
<text x="0" y="109" font-size="13" fill="var(--color-text)">NAVER 검색 (뉴스)</text>
<rect x="150" y="94" width="9" height="20" rx="4" fill="var(--color-border-strong)"/>
<text x="167" y="109" font-size="13" fill="var(--color-text-muted)">107건</text>
<text x="0" y="141" font-size="13" fill="var(--color-text)">KRX pykrx</text>
<rect x="150" y="126" width="2" height="20" rx="4" fill="var(--color-border-strong)"/>
<text x="160" y="141" font-size="13" fill="var(--color-text-muted)">10건</text>
<text x="0" y="173" font-size="13" fill="var(--color-text)">KRX Open API</text>
<rect x="150" y="158" width="2" height="20" rx="4" fill="var(--color-border-strong)"/>
<text x="160" y="173" font-size="13" fill="var(--color-text-muted)">3건</text>
<text x="0" y="198" font-size="12" fill="var(--color-text-dim)">Yahoo 4,800 = 캔들 610 + 펀더멘털 600 + 옵션 2,400 + 투자의견 1,200</text>
</svg>

<svg viewBox="0 0 640 90" width="100%" style="max-width:640px;display:block;margin:22px auto" role="img" aria-label="Yahoo 호출은 옵션이 절반">
<text x="0" y="16" font-size="13" fill="var(--color-text-muted)">Yahoo 호출 4,800건의 구성</text>
<rect x="0" y="30" width="316" height="22" rx="4" fill="var(--color-accent)"/>
<rect x="318" y="30" width="158" height="22" rx="4" fill="var(--color-border-strong)"/>
<rect x="478" y="30" width="80" height="22" rx="4" fill="#5aa9ff"/>
<text x="486" y="46" font-size="12" fill="#ffffff" font-weight="600">캔들 610</text>
<rect x="560" y="30" width="79" height="22" rx="4" fill="#d29922"/>
<rect x="0" y="64" width="12" height="12" rx="3" fill="var(--color-accent)"/>
<text x="18" y="74" font-size="12" fill="var(--color-text-muted)">옵션 2,400</text>
<rect x="100" y="64" width="12" height="12" rx="3" fill="var(--color-border-strong)"/>
<text x="118" y="74" font-size="12" fill="var(--color-text-muted)">투자의견 1,200</text>
<rect x="224" y="64" width="12" height="12" rx="3" fill="#5aa9ff"/>
<text x="242" y="74" font-size="12" fill="var(--color-text-muted)">캔들 610</text>
<rect x="310" y="64" width="12" height="12" rx="3" fill="#d29922"/>
<text x="328" y="74" font-size="12" fill="var(--color-text-muted)">펀더멘털 600</text>
</svg>

각 단계에 전역 스로틀(국내 0.25초, 미국 0.5초)이 있고, 야후가 429를 주면 전체가 90초 멈췄다 이어간다. 백엔드는 `@Scheduled`가 하나도 없어서 아무도 안 쓰면 외부 호출이 0이고, 사용자 요청 시 호출은 전부 캐시를 공유한다(KIS 토큰버킷 15건/초, 지수 60초, DART 10분 등).

## 운영 메모 몇 가지

- 미국 마스터 단계가 유니버스(S&P500 + 나스닥100 + 추가 + SPY·QQQ) 밖의 미국 종목을 stock·캔들에서 정리(prune)한다. 지수 목록을 하나라도 못 읽으면 prune을 건너뛴다 - 목록 조회 실패로 멀쩡한 종목이 지워지는 사고를 막기 위해서다
- 나스닥100 목록은 nasdaq.com API → 위키 → slickcharts → 인베스코 순으로 시도하고 `data/nasdaq100_cache.txt`에 캐시한다. 심볼 디렉터리도 `data/nasdaqtraded_cache.txt`에 캐시
- 미국 캔들 백필은 `addStockCandleData.py --backfill`. 첫 캔들이 2015-01-01보다 45일 이상 늦은 종목만 채우고, 상장 전 구간의 400 응답은 정상으로 본다
- `run_pipeline.py`가 자식 스크립트에 `PYTHONUNBUFFERED=1`을 넣어 진행 로그가 실시간으로 보인다. DB 현황은 `python common/dbStatus.py`

## 삽질 목록

JSONC 파서를 만들었는데 셋이 안 쓰고 있었다. `pipeline_config.json`에 주석을 허용하려고 JSONC 파서를 만들었는데, 이 파일을 읽는 스크립트가 다섯 개였고 그중 셋(뉴스, 미국 캔들, 미국 펀더멘털)이 여전히 `json.load`를 쓰고 있었다. 셋 다 조용히 실패하고 기본값으로 떨어져서 검색어 5개, 미국 종목 25개, 펀더멘털 7종목만 돌고 있었다. 수집량이 안 늘 때 설정 파서부터 의심하자. 설정을 읽는 함수는 한 곳에 두고 다 그걸 쓰게 하는 게 맞다.

PowerShell 인코딩. `python x.py *> out.txt`로 받으면 파이썬 stdout이 cp949가 되어 " - " 하나에 죽는다. 이 하나로 며칠을 날린 이야기는 [감성 모델 글](/post/stockanalyst-sentiment-model)에 있다.

`pip install -U`가 TensorFlow를 깨뜨렸다. 의존성을 전부 최신으로 올려서 numpy/protobuf가 튀었다. `constraints.txt`를 두고 `pip install -c constraints.txt`로만 설치한다. numpy는 numba와 TF의 교집합인 1.26.x만 됐다 - TF를 걷어낸 [지금](/post/stockanalyst-turning-point-v2)은 이 제약이 없다.

미국 마스터가 한 번도 안 돌았다. 아침 8시 스케줄에만 있어서 개발 환경에선 미국 주식 검색이 안 됐다. 기동 시 0건이면 백그라운드 데몬 스레드로 자동 동기화한다. 코드 검색이 대소문자를 구분해 `aapl`이 안 잡히던 것도 같이 고쳤다.
