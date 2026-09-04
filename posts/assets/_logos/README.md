# 커버용 로고

`<카테고리>.svg` 를 넣으면 그 카테고리의 커버 47장이 이 마크를 가운데에 쓴다.
없으면 블로그 HG 마크로 떨어진다.

- 파일은 `viewBox` 가 있어야 하고, 색은 `currentColor` 로 두면 카테고리 액센트가 적용된다
- 지금 있는 것: stockanalyst(컵앤핸들), nearby(핀)
- 넣으면 되는 것: docker.svg, oracle.svg, spring.svg, frontend.svg
  각 프로젝트가 배포하는 공식 브랜드 SVG 를 받아서 이 이름으로 저장하면 된다

넣은 뒤 `python /tmp/gencover.py` 재실행.
