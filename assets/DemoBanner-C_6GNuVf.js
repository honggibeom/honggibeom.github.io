import{r as s,j as t,d}from"./index-CguGqeUW.js";const c=d.div`
  position: sticky;
  top: 0;
  z-index: 300;
  flex-shrink: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 4px 10px;
  padding: 9px 16px;
  background: #1f2a37;
  color: #e6edf3;
  font-size: 13px;
  line-height: 1.5;
  text-align: center;

  strong {
    color: #7bf5d8;
    font-weight: 600;
  }

  a {
    color: #7bf5d8;
    text-decoration: none;
    border-bottom: 1px solid rgba(123, 245, 216, 0.4);
  }

  @media only screen and (max-width: 640px) {
    font-size: 12px;
    padding: 8px 12px;
  }
`;function a({label:i}){const o=s.useRef(null);return s.useEffect(()=>{const r=o.current;if(!r)return;const e=()=>{document.documentElement.style.setProperty("--helpcall-banner",`${r.offsetHeight}px`)};e();let n;return typeof ResizeObserver<"u"&&(n=new ResizeObserver(e),n.observe(r)),window.addEventListener("resize",e),()=>{n&&n.disconnect(),window.removeEventListener("resize",e),document.documentElement.style.removeProperty("--helpcall-banner")}},[]),t.jsxs(c,{ref:o,children:[t.jsxs("span",{children:[t.jsx("strong",{children:"포트폴리오 데모"})," · ",i," · 실제 서비스가 아니며 모든 데이터와 회사 정보는 예시값입니다"]}),t.jsx("a",{href:"/projects",children:"← 프로젝트 목록"})]})}export{a as D};
