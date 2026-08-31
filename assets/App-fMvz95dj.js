import{j as e,L as v,d as b,n as ee,r as g,o as te,p as _,f as ie,g as j}from"./index-CnDGIUvQ.js";import{a as M,b as A,c as se,F as ne}from"./index-CZ7FTJNX.js";import{m as y,G as H,H as ae,D as le}from"./DemoBanner-DhWSC8q5.js";import{b as T,c as E,d as R,e as V}from"./index-Bks1FWq9.js";const B="/assets/mainBackground-DYrosDq8.svg",Z="/assets/logo-BrgVfNN8.svg",ce=b.div`
  width: 80vw;
  color: #060606;
  padding: 50px 10vw;
  @media (min-width: 1280px) and (max-width: 1920px) {
    padding: 50px calc(50vw - 640px);
  }
  .footerLogo {
    width: 230px;
    height: 40px;
  }
  .policyList {
    width: 100%;
    display: flex;
    .policy {
      margin-right: 20px;
      font-size: 18px;
      font-weight: 700;
      text-decoration: none;
      color: #060606;
    }
    .policy:hover {
      color: #1c7393;
    }
  }

  .text {
    margin: 2rem;
  }

  .info {
    display: flex;
    width: 100%;
    font-size: 15px;
    box-sizing: border-box;
    margin-top: 30px;
    min-height: 150px;
    p {
      margin: 4px 0;
    }
    .left {
      display: flex;
      align-items: center;
    }

    .right {
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      justify-content: center;
      margin-left: 50px;
    }
  }

  @media (max-width: 784px) {
    width: 90vw;
    padding: 50px 5vw;
    .info {
      display: flex;
      align-items: center;
      flex-direction: column;
      font-size: 12px;
      color: #76787b;
      .left {
        margin: 40px 0;
      }
      .right {
        width: 100%;
        align-items: center;
        margin: 0px;
      }
      p {
        text-align: center;
      }
    }
    .text {
      margin: 1rem;
    }

    .policyList {
      width: 100%;
      .policy {
        margin: 0;
        font-size: 14px;
        font-weight: 700;
        color: #76787b;
        flex-grow: 1;
        text-align: center;
      }
    }
  }
`;function N(){const t={FAQ:"/",개인정보처리방침:"/",이용약관:"/"},d=Object.keys(t);return e.jsxs(ce,{children:[e.jsx("div",{className:"policyList",children:d.map((s,o)=>e.jsx(v,{to:t[s],className:"policy",children:s},o))}),e.jsxs("div",{className:"info",children:[e.jsx("div",{className:"left",children:e.jsx("img",{src:Z,alt:"logo",className:"footerLogo"})}),e.jsxs("div",{className:"right",children:[e.jsxs("p",{children:["대표자명: 홍길동",e.jsx("span",{className:"text",children:"사업자 등록번호: 000-00-00000"})]}),e.jsx("p",{children:"(00000) 충청남도 천안시 서북구 예시로 00, 000호"}),e.jsxs("p",{children:["TEL : 000-0000-0000(토,일 휴)",e.jsx("span",{className:"text",children:"FAX : 0000-000-0000"})]}),e.jsx("p",{children:"포트폴리오 데모 — 회사 정보는 예시값으로 대체했습니다."})]})]})]})}const oe=ee(t=>({current:-1,setCurrent:d=>t({current:d})})),re=b.div`
  position: fixed;
  background: #ffffff;
  z-index: 100;
  .header {
    display: flex;
    width: 100vw;
    height: 100px;
    border-bottom: 1px solid #0e0e0e22;
    box-sizing: border-box;
    padding: 0 5%;
    @media (min-width: 1280px) and (max-width: 1920px) {
      padding: 0 calc(50vw - 640px);
    }
  }

  .flexCenter {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .logo {
    width: 20%;
  }
  .menuList {
    display: flex;
    width: 70%;
    height: 100%;
    box-sizing: border-box;
  }
  .menuIcon {
    width: 20%;
    display: none;
    align-items: center;
    justify-content: center;
  }

  .menu {
    margin: 0;
    flex-direction: column;
    cursor: pointer;
    color: #060606;
    font-size: 20px;
    font-weight: 700;
    flex-grow: 1;
    height: 100%;
    box-sizing: border-box;
  }

  .line {
    display: block;
    position: relative;
    width: 40%;
    height: 3px;
    background: #1c7393;
    top: 5px;
  }
  .detailMenuContainer {
    display: none;
    width: 100vw;
    padding: 0 5%;
    box-shadow: 0 5px 5px rgba(0, 0, 0, 0.22);
    background: #ffffff;
    box-sizing: border-box;
    @media (min-width: 1280px) and (max-width: 1920px) {
      padding: 0 calc(50vw - 640px);
    }
  }
  .detailMenuArea {
    display: none;
    display: flex;
    width: 70%;
  }
  .header:has(.menu:hover) + .detailMenuContainer {
    display: flex;
  }
  .detailMenuContainer:hover {
    display: flex;
  }

  .detailMenuList {
    width: 20%;
    border-right: 1px solid #0e0e0e22;
    text-align: center;
    padding-bottom: 20px;
  }
  .detailMenuList:nth-child(1) {
    border-left: 1px solid #0e0e0e22;
  }
  .detailMenu,
  .mobileMenu {
    width: 100%;
    display: block;
    text-decoration: none;
    color: #060606;
    font-weight: 400;
  }
  .detailMenu {
    font-size: 20px;
    color: #060606;
    padding: 20px 0;
    text-align: center;
  }
  .mobileMenu {
    padding: 20px 40px;
    background: #eef0f3;
    border-bottom: 1px solid #0e0e0e22;
    &:last-child {
      border-bottom: 0;
    }
  }
  .detailMenu:hover,
  .mobileMenu:hover {
    color: #1c7393;
    font-weight: 700;
  }
  .mobilMenuArea {
    display: none;
    border-top: 1px solid #0e0e0e22;
    border-bottom: 1px solid #0e0e0e22;
    height: calc(100vh - 60px);
    width: 100vw;
    box-sizing: border-box;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .mobileMenuTitle {
    display: flex;
    padding: 20px 40px;
    margin: 0;
    font-weight: 700;
    border-bottom: 1px solid #c6c8cb;
    justify-content: space-between;
    font-size: 18px;
  }
  .blur {
    color: #c6c8cb;
    cursor: pointer;
  }

  @media (max-width: 784px) {
    .header {
      height: 60px;
    }
    .menuList {
      margin: 0;
    }
    .logo {
      justify-content: start;
      padding-left: 15px;
    }

    .logoIcon {
      width: 100px;
      height: 50px;
    }

    .detailMenuArea,
    .menu {
      display: none;
    }
    .menuIcon {
      display: flex;
      font-size: 30px;
    }

    .mobilMenuArea {
      display: block;
    }
  }
`;function q(){const t={"기업 소개":{기업소개:"/help-call/intro"},"사업 안내":{고빌리티:"/help-call/business/go-ablity","체험/교육":"/help-call/business/education",전시회:"/help-call/business/exhibition","심리검사&상담":"/help-call/business/counseling",복지용구:"/help-call/business/equipment"},알림마당:{공지사항:"/help-call/notice",언론보도:"/help-call/article"},홍보마당:{뉴스레터:"/help-call/newsletter",행사앨범:"/help-call/event"},소통창구:{문의글:"/help-call/inquiry"}},d={"심리검사&상담":!0,복지용구:!0},s=Object.keys(t),[o,p]=g.useState(!1),{current:m,setCurrent:u}=oe();function c({data:a,current:i}){return e.jsx("div",{className:"detailMenuList",children:Object.keys(a).map((h,x)=>d[h]?e.jsx("div",{className:"detailMenu blur",children:h},x):e.jsx(v,{to:a[h],className:"detailMenu",onClick:()=>{u(i)},children:h},x))})}function l({data:a,current:i,title:h}){const[x,r]=g.useState(!1);return e.jsxs("div",{className:"mobileMenuList",children:[e.jsxs("p",{className:"mobileMenuTitle",onClick:()=>{r(!x)},children:[h,x?e.jsx(M,{}):e.jsx(A,{})]}),e.jsx("div",{style:{transition:"0.3s ease-in-out",maxHeight:x?`${70*Object.keys(a).length}px`:"0px",overflow:"hidden"},children:Object.keys(a).map((n,f)=>d[n]?e.jsx("div",{className:"mobileMenu blur",children:n},f):e.jsx(v,{to:a[n],className:"mobileMenu",onClick:()=>{u(i)},children:n},f))})]})}return e.jsxs(re,{children:[e.jsxs("div",{className:"header",children:[e.jsx(v,{to:"/help-call",className:"logo flexCenter",onClick:()=>{u(-1)},children:e.jsx("img",{src:Z,className:"logoIcon",alt:"logo"})}),e.jsx("div",{className:"menuList",children:s.map((a,i)=>m===i?e.jsxs("p",{className:"menu flexCenter",style:{color:"#1c7393",paddingTop:"3px"},children:[a,e.jsx("span",{className:"line"})]},i+" "+m):e.jsx("p",{className:"menu flexCenter",children:a},i))}),e.jsx("div",{className:"menuIcon",children:e.jsx(te,{onClick:()=>{p(!o)}})})]}),e.jsxs("div",{className:"detailMenuContainer",children:[e.jsx("div",{className:"logo"}),e.jsx("div",{className:"detailMenuArea",children:s.map((a,i)=>e.jsx(c,{data:t[a],current:i},i))})]}),o&&e.jsx("div",{className:"mobilMenuArea",children:s.map((a,i)=>e.jsx(l,{data:t[a],current:i,title:a},i))})]})}const de="data:image/svg+xml,%3csvg%20width='40'%20height='40'%20viewBox='0%200%2040%2040'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3crect%20width='40'%20height='40'%20rx='5'%20fill='white'/%3e%3cpath%20d='M33.4156%2013.1242C33.2562%2012.5192%2032.9437%2011.9675%2032.5094%2011.5243C32.075%2011.0811%2031.5341%2010.7619%2030.9406%2010.5987C28.7562%2010%2020%2010%2020%2010C20%2010%2011.2438%2010%209.05937%2010.5955C8.46569%2010.7582%207.92445%2011.0772%207.49002%2011.5205C7.05558%2011.9638%206.74325%2012.5158%206.58437%2013.121C6%2015.3503%206%2020%206%2020C6%2020%206%2024.6497%206.58437%2026.8758C6.90625%2028.1051%207.85625%2029.0732%209.05937%2029.4013C11.2438%2030%2020%2030%2020%2030C20%2030%2028.7562%2030%2030.9406%2029.4013C32.1469%2029.0732%2033.0938%2028.1051%2033.4156%2026.8758C34%2024.6497%2034%2020%2034%2020C34%2020%2034%2015.3503%2033.4156%2013.1242ZM17.2188%2024.2675V15.7325L24.4688%2019.9682L17.2188%2024.2675Z'%20fill='%23D8362A'/%3e%3c/svg%3e",xe="/assets/facebook-C6EVxnTi.svg",pe="/assets/instar--Mlzvjf7.svg",he="/assets/blog-Df-U3EhF.svg",me="/assets/cafe-B2mcYIzK.svg",I="data:image/svg+xml,%3csvg%20width='40'%20height='40'%20viewBox='0%200%2040%2040'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cg%20clip-path='url(%23clip0_3_934)'%3e%3cpath%20d='M6.62368%200H33.3812C37.0361%200%2040.0049%202.96873%2040.0049%206.62368V33.3812C40.0049%2037.0361%2037.0361%2040.0049%2033.3812%2040.0049H6.62368C2.96873%2040.0049%200%2037.0361%200%2033.3812V6.62368C0%202.96873%202.96873%200%206.62368%200Z'%20fill='%2300C73C'/%3e%3cpath%20d='M11.0963%2010.8478V6.27791C11.0963%205.71823%2011.5489%205.26562%2012.1085%205.26562C12.6682%205.26562%2013.1208%205.71823%2013.1208%206.27791V10.8478C13.1208%2014.639%2016.2064%2017.7246%2019.9976%2017.7246C23.7888%2017.7246%2026.8743%2014.639%2026.8743%2010.8478V6.27791C26.8743%205.71823%2027.3269%205.26562%2027.8866%205.26562C28.4463%205.26562%2028.8989%205.71823%2028.8989%206.27791V10.8478C28.8989%2015.7584%2024.9033%2019.7491%2019.9976%2019.7491C15.0919%2019.7491%2011.0963%2015.7535%2011.0963%2010.8478Z'%20fill='white'/%3e%3cpath%20d='M33.9506%2034.2623H31.6584L27.726%2029.4344V34.2623H25.0785V26.1348H27.3707L31.3031%2031.0551V26.1348H33.9506V34.2623Z'%20fill='white'/%3e%3c/g%3e%3cdefs%3e%3cclipPath%20id='clip0_3_934'%3e%3crect%20width='40'%20height='40'%20fill='white'/%3e%3c/clipPath%3e%3c/defs%3e%3c/svg%3e",ge=b.div`
  width: 100vw;
  height: 100px;
  @media (max-width: 784px) {
    height: 60px;
  }
`;function O(){return e.jsx(ge,{})}const fe=b.div`
  background: #ffffff;
  border-radius: 20px;
  padding: 40px 20px;
  min-width: 350px;
  box-sizing: border-box;
  height: 430px;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
  @media (max-width: 784px) {
    width: 100%;
    max-width: 300px;
    min-width: 300px;
    height: 410px;
    padding: 20px 20px;
  }
  .link {
    text-decoration: none;
    display: flex;
  }
  .gray {
    color: #c6c8cb;
  }

  .noticeHeader {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    height: 30px;
    .text,
    .detail {
      display: flex;
      align-items: center;
      margin: 0;
    }
    .text {
      font-weight: 700;
      font-size: 22px;
    }
    .detail {
      font-weight: 400;
      font-size: 12px;
    }
  }

  .noticeItem {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: black;
    margin: 5px 0;
    .noticeName,
    .date {
      margin: 10px 0;
    }
    .noticeName {
      width: 65%;
      color: #76787b;
      white-space: break-spaces;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-left: 5%;
    }

    .noticeName::before {
      content: '';
      position: absolute;
      width: 5px;
      height: 5px;
      margin-top: 7px;
      margin-left: -12px;
      background: #c6c8cb;
      border-radius: 100%;
    }
    .date {
      text-align: right;
      width: 30%;
    }
  }
`;function ue(){const[t,d]=g.useState([]);return g.useEffect(()=>{y.get("/notice/all?page=0&size=8").then(s=>{const o=[],p={id:1,title:"",create_at:"2024.06.03"};for(const m of s.data.data.result)p.id=m.id,p.title=m.title,p.create_at=m.create_at.split("T")[0].replaceAll("-","."),o.push({...p});d(o)})},[]),e.jsxs(fe,{children:[e.jsxs("div",{className:"noticeHeader",children:[e.jsx("p",{className:"text",children:"공지사항"}),e.jsx(v,{to:"/help-call/notice",className:"detail link gray",children:"자세히"})]}),e.jsx("div",{className:"noticeList",children:t.map((s,o)=>e.jsxs(v,{to:`/help-call/notice/detail/${s.id}`,className:"noticeItem link",children:[e.jsx("p",{className:"noticeName",children:s.title}),e.jsx("p",{className:"gray date",children:s.create_at})]},o))})]})}function we(t,d){const s=g.useRef();g.useEffect(()=>{s.current=t},[t]),g.useEffect(()=>{function o(){s.current()}{const p=setInterval(o,d);return()=>clearInterval(p)}},[d])}const je=b.div`
  .mainImgContainer {
    width: 100vw;
    height: 700px;
    overflow: hidden;
    .mainImgList {
      display: flex;
      width: ${t=>t.length*100}vw;
      height: 100%;
      transform: translate(${t=>-t.pos}vw);
      img {
        width: 100vw;
        height: 100%;
        object-fit: cover;
      }
    }
  }
  .mainItems {
    position: relative;
    top: -700px;
    margin-bottom: -700px;
    width: 100vw;
    height: 700px;
    box-sizing: border-box;
    .flex {
      display: flex;
      justify-content: space-between;
      height: 600px;
      padding: 100px 5%;
      @media (max-width: 784px) {
        flex-direction: column;
        align-items: center;
        justify-content: start;
        padding: 20px 5%;
      }
      @media (min-width: 1280px) and (max-width: 1920px) {
        padding: 100px calc(50vw - 640px);
      }
      box-sizing: border-box;
      .title {
        width: 100%;
        display: flex;
        align-items: end;
        font-size: 48px;
        font-weight: 700;
        color: #ffffff;
        margin: 0;
        @media (max-width: 784px) {
          text-align: left;
          font-size: 24px;
          align-items: center;
          padding-left: 5%;
          padding-bottom: 15px;
        }
      }
    }
  }
  .lists {
    position: relative;
    display: flex;
    height: max-content;
    box-sizing: border-box;
    background: #093c6299;
    margin-bottom: -100px;
    top: -100px;
    @media (min-width: 1280px) and (max-width: 1920px) {
      padding: 0 calc(50vw - 640px);
    }
    @media (max-width: 784px) {
      top: -200px;
      margin-bottom: -200px;
      display: block;
    }
  }
  .list {
    display: flex;
    justify-content: space-around;
    align-items: center;
    width: 50%;
    padding: 10px 0;
    height: 100px;
    box-sizing: border-box;
    @media (max-width: 784px) {
      width: 100%;
    }
    .items {
      position: relative;
      width: 13%;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      text-decoration: none;
      @media (max-width: 784px) {
        width: 30%;
      }
    }
    p {
      text-align: center;
      color: #ffffff;
      font-size: 14px;
      margin: 0;
      margin-top: 10px;
      font-weight: 500;
    }
  }
`;function be(){const t=g.useRef([B,I]),[d,s]=g.useState(0),[o,p]=g.useState([B,I]),m=g.useRef(null);return we(()=>{setTimeout(()=>{m.current!==null&&(m.current.style.transitionDuration="0ms"),d/100===o.length-2&&p([...o,...t.current])},800),m.current!==null&&(m.current.style.transitionDuration="800ms"),s(d+100)},1e4),e.jsxs(je,{pos:d,length:o.length,children:[e.jsx(q,{}),e.jsx(O,{}),e.jsx("div",{className:"mainImgContainer",children:e.jsx("div",{className:"mainImgList",ref:m,children:o.map((u,c)=>e.jsx("img",{src:u},c))})}),e.jsx("div",{className:"mainItems",children:e.jsxs("div",{className:"flex",children:[e.jsx("p",{className:"title",children:"주식회사 동행하는 사람들"}),e.jsx(ue,{})]})}),e.jsxs("div",{className:"lists",children:[e.jsxs("div",{className:"list",children:[e.jsxs("a",{className:"items",href:"#",children:[e.jsx("img",{src:de}),e.jsx("p",{children:"youtube"})]}),e.jsxs("a",{className:"items",href:"",children:[e.jsx("img",{src:xe}),e.jsx("p",{children:"facebook"})]}),e.jsxs("a",{className:"items",href:"#",children:[e.jsx("img",{src:pe}),e.jsx("p",{children:"instagram"})]})]}),e.jsxs("div",{className:"list",children:[e.jsxs("a",{className:"items",href:"",children:[e.jsx("img",{src:he}),e.jsx("p",{children:"공식블로그"})]}),e.jsxs("a",{className:"items",href:"",children:[e.jsx("img",{src:me}),e.jsx("p",{children:"공식카페"})]}),e.jsxs("a",{className:"items",href:"#",children:[e.jsx("img",{src:I}),e.jsx("p",{children:"스마트스토어"})]})]})]}),e.jsx(N,{})]})}const ve=b.div`
  .menuImg {
    width: 100vw;
    height: 250px;
    object-fit: cover;
    @media (max-width: 784px) {
      height: 100px;
    }
  }
  .menuTitle {
    position: relative;
    width: 100vw;
    height: 250px;
    top: -250px;
    margin-bottom: -250px;
    color: #ffffff;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background-position: center;
    background-size: cover;
    box-sizing: border-box;
    padding: 0 10%;
    @media (min-width: 1280px) and (max-width: 1920px) {
      padding: 0 calc(50vw - 640px);
    }
    @media (max-width: 784px) {
      height: 100px;
      padding: 0 5%;
      top: -100px;
      margin-bottom: -100px;
    }
  }
  .menuName {
    font-size: 20px;
    font-weight: 400px;
    margin: 0;
    @media (max-width: 784px) {
      display: none;
    }
  }
  .detailName {
    font-size: 48px;
    font-weight: 700;
    margin: 0;
    @media (max-width: 784px) {
      font-size: 24px;
    }
  }
`;function z({img:t,menu:d="",detail:s}){return e.jsxs(ve,{children:[e.jsx(q,{}),e.jsx(O,{}),e.jsx("img",{src:t,className:"menuImg"}),e.jsxs("div",{className:"menuTitle",children:[e.jsx("p",{className:"menuName",children:d}),e.jsx("p",{className:"detailName",children:s})]})]})}const ye="/assets/intro-CHotXVPs.svg",Ne="/assets/introImg-BVDDXWKl.svg",Ce="/assets/mobileIntroImg-Dgxk5QuE.svg",ze=b.div`
  .content {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 100px 10%;
    @media (min-width: 1280px) and (max-width: 1920px) {
      padding: 100px calc(50vw - 640px);
    }
    @media (max-width: 784px) {
      flex-direction: column;
      align-items: start;
      padding: 50px 5%;
    }
    .textArea {
      height: 100%;
      max-width: 550px;
      .title {
        font-size: 48px;
        font-weight: 700;
        text-align: center;
        margin-top: 10px;
        margin-bottom: 50px;
        @media (max-width: 784px) {
          font-size: 24px;
          margin-top: 50px;
          margin-bottom: 20px;
        }
      }
      .detailContent {
        font-size: 18px;
        font-weight: 400;
        margin-top: 2rem;
        line-height: 30px;
        @media (max-width: 784px) {
          font-size: 16px;
        }
      }
    }
  }
  .mobileIntroImg {
    display: none;
    @media (max-width: 784px) {
      display: block;
    }
  }

  .introImg {
    max-width: 500px;
    max-height: 700px;
    margin-left: 80px;
    @media (max-width: 784px) {
      display: none;
    }
  }

  .signatureArea {
    display: flex;
    margin-top: 50px;
    @media (max-width: 784px) {
      margin-top: 30px;
      justify-content: center;
      align-items: center;
    }
    .signature {
      font-size: 20px;
      font-weight: 600;
      @media (max-width: 784px) {
        font-size: 18px;
      }
    }
  }
`;function Le(){const t=[`안녕하세요, "동행하는 사람들"에 오신 것을 환영합니다. 저희 회사는 장애인들의 더 나은 삶과 편리한 일상을 위해 긴급출동 서비스, 장애인식 개선 강의 및 전시회, 
    심리상담 등을 제공하는 기업입니다.`,`저희는 장애인들이 긴급 상황에서 신속하게 도움을 받을 수 있도록 24시간 긴급출동 서비스를 운영하고 있습니다. 
    또한, 장애인식 개선을 위한 강의와 전시회를 통해 사회적 인식을 높이고, 심리상담 서비스를 통해 장애인들이 정신적 어려움을 극복할 수 있도록 지원합니다.`,`저희 "동행하는 사람들"은 장애인들의 든든한 동반자가 되어, 그들의 삶을 더욱 풍요롭게 만들기 위해 최선을 다하고 있습니다. 
    앞으로도 장애인들의 행복을 위해 지속적으로 노력하겠습니다. 감사합니다.`];return e.jsxs(ze,{children:[e.jsx(z,{img:ye,detail:"기업소개"}),e.jsxs("div",{className:"content",children:[e.jsx("img",{src:Ce,className:"mobileIntroImg",alt:"introduce"}),e.jsxs("div",{className:"textArea",children:[e.jsx("p",{className:"title",children:"World Without Barrier"}),e.jsx("p",{className:"detailContent",children:t[0]}),e.jsx("p",{className:"detailContent",children:t[1]}),e.jsx("p",{className:"detailContent",children:t[2]}),e.jsx("div",{className:"signatureArea",children:e.jsx("p",{className:"signature",children:"(주) 동행하는 사람들 대표 드림"})})]}),e.jsx("img",{src:Ne,className:"introImg",alt:"introduce"})]}),e.jsx(N,{})]})}const _e=b.div`
  width: 100vw;
  padding: 50px 10%;
  box-sizing: border-box;
  @media (min-width: 1280px) and (max-width: 1920px) {
    padding: 50px calc(50vw - 640px);
  }
  .name {
    font-size: 32px;
    color: #060606;
    font-weight: 700;
    padding: 0 16px;
    border-left: 5px solid #093c62;
    margin: 0;
    margin-bottom: 26px;
  }
  .description {
    margin: 0;
    font-size: 20px;
    font-weight: 400;
    letter-spacing: 1px;
  }
  @media (max-width: 784px) {
    padding: 50px 5%;
    .name {
      font-size: 20px;
    }
    .description {
      font-size: 14px;
    }
  }
`;function L({name:t,description:d=""}){return e.jsxs(_e,{children:[e.jsx("p",{className:"name",children:t}),e.jsx("p",{className:"description",children:d})]})}const ke=b.div`
  display: flex;
  align-items: center;
  padding: 15px 20px;
  box-sizing: border-box;
  width: 46%;
  border: 2px solid #eef0f3;
  margin: 25px 0;
  @media (max-width: 784px) {
    width: 90%;
    margin-top: 20px;
    padding: 15px 10px;
  }
  .text {
    padding: 0 30px;
    text-align: center;
    font-size: 20px;
    font-weight: 500;
    @media (max-width: 784px) {
      font-size: 12px;
    }
  }
  @media (max-width: 784px) {
    img {
      width: 50px;
      height: 50px;
    }
  }
`;function Fe({img:t,text:d}){return e.jsxs(ke,{children:[e.jsx("img",{src:t,alt:"Img"}),e.jsx("p",{className:"text",children:d})]})}const $e=b.div`
  .imgContainer {
    margin: 50px 10% 100px 10%;
    height: 27vw;
    width: 80vw;
    overflow: hidden;
    @media (min-width: 1280px) and (max-width: 1920px) {
      width: 1280px;
      margin: 50px calc(50vw - 640px) 100px calc(50vw - 640px);
    }
    @media (max-width: 784px) {
      width: 100vw;
      margin: 0 0 40px 0;
      height: 60vw;
    }
    .imgWrap {
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    .imgSlider {
      width: ${t=>t.length*100}%;
      height: 100%;
      transform: translate(${t=>-t.pos/t.length}%);
      transition: 0.5s;
      img {
        width: ${t=>100/t.length}%;
        height: 100%;
        object-fit: cover;
      }
    }
    .imgBtnArea {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      height: 100%;
      position: relative;
      top: -100%;
    }
    .imgBtn {
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 90px;
      background: rgba(255, 255, 255, 0.5);
      border-radius: 100%;
      cursor: pointer;
      @media (max-width: 784px) {
        margin: 0 20px;
      }
      .arrow {
        padding: 20px;
        font-size: 24px;
        @media (max-width: 784px) {
          padding: 10px;
          font-size: 18px;
        }
      }
    }
  }
  .prev {
    ${t=>t.pos===0&&"visibility:hidden; cursor: auto"};
  }
  .next {
    ${t=>t.pos===(t.length-1)*100&&" visibility:hidden; cursor:none"};
  }
  .des {
    padding: 0 10% 500px 10%;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    @media (min-width: 1280px) and (max-width: 1920px) {
      width: 1280px;
      padding: 0px calc(50vw - 640px) 300px calc(50vw - 640px);
    }
    @media (max-width: 784px) {
      padding: 0 5% 100px 5%;
      justify-content: center;
    }
  }
`;function P({imgList:t,service:d,detail:s,header:o}){const[p,m]=g.useState(0);function u(){p<100*(t.length-1)&&m(p+100)}function c(){p>0&&m(p-100)}return e.jsxs($e,{pos:p,length:t.length,children:[e.jsx(z,{img:o.src,menu:"사업 소개",detail:o.detail}),e.jsx(L,{name:s.name,description:s.description}),e.jsxs("div",{className:"imgContainer",children:[e.jsx("div",{className:"imgWrap",children:e.jsx("div",{className:"imgSlider",children:t.map((l,a)=>e.jsx("img",{src:l.src,alt:l.alt},a))})}),e.jsxs("div",{className:"imgBtnArea",children:[e.jsx("div",{className:"imgBtn prev",onClick:()=>{c()},style:{visibility:"visible"},children:e.jsx(se,{className:"arrow"})}),e.jsx("div",{className:"imgBtn next",onClick:()=>{u()},children:e.jsx(ne,{className:"arrow"})})]})]}),e.jsx("div",{className:"des",children:d.map((l,a)=>e.jsx(Fe,{img:l.src,text:l.text},a))}),e.jsx(N,{})]})}const Ie="/assets/gobility-CRFQ3HYo.svg",Me="/assets/gobility_desc_1-eykTkfLt.svg",Ae="/assets/gobility_desc_2-BQvxx6G9.svg",Pe="/assets/gobility_desc_3-oKY1YB7Z.svg",Se="/assets/gobility_desc_4-rFNZjX0D.svg";function De(){const t={src:Ie,detail:"고빌리티(Go-Ability)"},d={name:"고빌리티(Go-Ability)",description:`병원동행, 식품구매, 책 읽기 등 일상생활에서 도움이 필요한 장애인 및 
    어르신 대상으로 일시적인 활동 보조 뿐 아니라 
    응급상황 발생 시 주변 지인, 시민, 활동지원사를 연결해 긴급 출동을 지원합니다.`},s=[],o=[{src:Me,text:"병원동행, 키오스크 사용, 식사보조, 튜터링 등 일상생활 보조 지원"},{src:Ae,text:"갑자기 쓰러짐, 움직임과 호흡 불안정 등 응급상황 보조 지원"},{src:Pe,text:`장애인 활동지원사, 요양보호사, 사회복지사 등 
      자격증 소유자를 통한 긴급 및 예약 지원`},{src:Se,text:"도보 20분 이내 긴급 출동이 가능한 주변 지인, 시민, 복지관 등을 통한 긴급지원"}];return e.jsx(P,{header:t,detail:d,imgList:s,service:o})}const Be="/assets/education-CBuJCiIm.svg",He="/assets/education_desc_1-ChAVujCS.svg",Te="/assets/education_desc_2-DalCQD19.svg";function Ee(){const t={src:Be,detail:"체험/교육"},d={name:"장애인식개선 체험 키트 및 교육",description:`장애물 감지 시 진동으로 알려주는 시각장애인식개선 체험 키트, 
    점자와 한글을 함께 배우고 학습할 수 있는 한점 키트와 학습지 등을 활용하여 
    단순 강의가 아닌 실제 장애를 체험함으로 좀 더 장애를 직접적으로 이해할 수 있도록 체험과 교육을 지원합니다.`},s=[],o=[{src:He,text:"눈을 가리고 걸으면서 장애물을 감지해보는 등 체험형 키트"},{src:Te,text:"키트를 체험한 후 느낀 점을 바탕으로 장애인식개선 교육 및 강의"}];return e.jsx(P,{header:t,detail:d,imgList:s,service:o})}const Re="/assets/exhibition-BDzKgfTw.svg",Ve="/assets/exhibition_desc_1-CPBy9izD.svg",Ze="data:image/svg+xml,%3csvg%20width='100'%20height='100'%20viewBox='0%200%20100%20100'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3ccircle%20cx='50'%20cy='50'%20r='50'%20fill='%23EEF0F3'/%3e%3cg%20clip-path='url(%23clip0_37_650)'%3e%3cpath%20d='M58.6719%2039.3359C58.6719%2028.6835%2049.9884%2020%2039.3359%2020C28.6835%2020%2020%2028.6835%2020%2039.3359C20%2044.2227%2020.9141%2049.0391%2021.793%2053.7147C22.6367%2058.25%2023.5156%2063.0078%2023.5156%2067.5781C23.5156%2074.3633%2029.0352%2080%2035.8203%2080C37.0507%2080%2038.2109%2079.8242%2039.3359%2079.4725C44.3984%2077.9608%2048.125%2073.1326%2048.125%2067.5781C48.125%2066.7344%2048.0546%2065.9257%2047.8789%2065.1172C47.0352%2060.8984%2050.0937%2055.9296%2053.0118%2053.0118C56.668%2049.3554%2058.6719%2044.5038%2058.6719%2039.3359Z'%20fill='%23FED2A4'/%3e%3cpath%20d='M53.0117%2053.0117C50.0938%2055.9296%2047.0352%2060.8983%2047.8789%2065.1172C48.0547%2065.9257%2048.125%2066.7345%2048.125%2067.5781C48.125%2073.1327%2044.3984%2077.9608%2039.3359%2079.4725V20C49.9884%2020%2058.6719%2028.6835%2058.6719%2039.3359C58.6719%2044.5038%2056.668%2049.3554%2053.0117%2053.0117Z'%20fill='%23FFBD86'/%3e%3cpath%20d='M51.3593%2036.6288C50.3398%2031.8828%2046.4376%2028.1211%2041.6212%2027.2422C40.8477%2027.1017%2040.0743%2027.0312%2039.3359%2027.0312C32.6212%2027.0312%2027.0312%2032.4805%2027.0312%2039.3359C27.0312%2044.9961%2028.4725%2050.8319%2029.5275%2056.9141C30.0195%2059.9727%2032.6212%2062.1875%2035.6798%2062.1875C37.0157%2062.1875%2038.2814%2061.7305%2039.3359%2060.9569C40.5663%2060.078%2041.4805%2058.7421%2041.7969%2057.1602L42.043%2055.8242C42.8163%2051.9218%2041.6913%2048.1602%2039.3358%2045.4179C37.2266%2042.9216%2034.1328%2041.2694%2030.5819%2041.0938C30.5468%2040.496%2030.5468%2039.9335%2030.5468%2039.3359C30.5468%2034.5547%2034.4138%2030.5469%2039.3358%2030.5469C39.8633%2030.5469%2040.4257%2030.582%2040.988%2030.6874C44.3633%2031.3202%2047.2109%2034.0625%2047.9141%2037.3672C48.582%2040.4258%2047.7031%2043.3788%2045.5587%2045.5585L48.0547%2048.0547C51.0078%2045.0664%2052.2382%2040.8124%2051.3593%2036.6288Z'%20fill='%23F6A96C'/%3e%3cpath%20d='M80%2048.125H62.1875V51.6406H80V48.125Z'%20fill='%23FF9F00'/%3e%3cpath%20d='M77.3389%2072.5491L63.1592%2065.5179L64.7316%2062.373L78.9113%2069.4043L77.3389%2072.5491Z'%20fill='%23FF9F00'/%3e%3cpath%20d='M64.7316%2037.3929L63.1592%2034.248L77.3389%2027.2168L78.9113%2030.3616L64.7316%2037.3929Z'%20fill='%23FF9F00'/%3e%3cpath%20d='M39.3359%2045.418C41.6913%2048.1603%2042.8164%2051.9218%2042.0431%2055.8243L41.797%2057.1603C41.4805%2058.7422%2040.5664%2060.0781%2039.3361%2060.957L39.3359%2045.418Z'%20fill='%23EA9B58'/%3e%3cpath%20d='M48.0546%2048.0546L45.5586%2045.5584C47.7031%2043.3787%2048.582%2040.4257%2047.9139%2037.3671C47.2108%2034.0624%2044.3632%2031.3201%2040.988%2030.6873C40.4258%2030.582%2039.8634%2030.5469%2039.3359%2030.5469V27.0312C40.0743%2027.0312%2040.8477%2027.1017%2041.6212%2027.2422C46.4376%2028.1211%2050.3398%2031.8828%2051.3594%2036.6288C52.2382%2040.8124%2051.0078%2045.0664%2048.0546%2048.0546Z'%20fill='%23EA9B58'/%3e%3c/g%3e%3cdefs%3e%3cclipPath%20id='clip0_37_650'%3e%3crect%20width='60'%20height='60'%20fill='white'%20transform='translate(20%2020)'/%3e%3c/clipPath%3e%3c/defs%3e%3c/svg%3e",qe="/assets/exhibition_desc_3-B45ca3YT.svg";function Oe(){const t={src:Re,detail:"전시회"},d={name:"시청각 통합 장애인식개선 체험 전시회",description:`약시에 초점을 맞춘 시각장애 체험뿐 아니라 청각, 시청각 중복 장애를 다양한 방식으로 체험함으로 보이지 않고, 
    들리지 않는 상황에서 시각, 청각 이외 다양한 감각들에 집중하는 시간을 지원합니다.`},s=[],o=[{src:Ve,text:"약시 시각장애 체험"},{src:Ze,text:"청각장애 체험"},{src:qe,text:"시청각 장애 체험"}];return e.jsx(P,{header:t,detail:d,imgList:s,service:o})}const U="data:image/svg+xml,%3csvg%20width='12'%20height='12'%20viewBox='0%200%2012%2012'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M10.952%203.19789C10.8248%203.06593%2010.6741%203%2010.5%203H1.50008C1.32586%203%201.17525%203.06593%201.048%203.19789C0.920751%203.33%200.857178%203.48618%200.857178%203.66674C0.857178%203.84726%200.920751%204.00345%201.048%204.13545L5.54795%208.80197C5.67534%208.93393%205.82596%209%206.00003%209C6.17411%209%206.32486%208.93393%206.45201%208.80197L10.952%204.13541C11.0791%204.00345%2011.1429%203.84726%2011.1429%203.6667C11.1429%203.48618%2011.0791%203.33%2010.952%203.19789Z'%20fill='%231B1D1F'/%3e%3c/svg%3e",Ue=b.div`
  width: 23%;
  margin-bottom: 40px;
  @media (max-width: 784px) {
    width: 100%;
    margin-bottom: 30px;
    padding-bottom: 30px;
    border-bottom: 1px solid #c6c8cb;
  }
  .link {
    text-decoration: none;
    color: #000000;
  }

  img {
    width: 100%;
    height: 230px;
    background: #c6c8cb;
    object-fit: cover;
  }
  .postTitle {
    font-size: 18px;
    font-weight: 700;
    margin: 10px 0;
  }
  .container {
    display: flex;
    color: #1b1d1f;
    justify-content: space-between;
    span {
      color: #76787b;
    }
    .text {
      margin: 0;
    }
  }
`;function Ge({id:t,title:d,src:s,create_at:o,view:p,type:m}){const u=p.toLocaleString();return e.jsx(Ue,{children:e.jsxs(v,{to:`/help-call/${m}/detail/${t}`,className:"link",children:[e.jsx("img",{src:s}),e.jsx("p",{className:"postTitle",children:d}),e.jsxs("div",{className:"container",children:[e.jsxs("p",{className:"text",children:["작성일  ",e.jsx("span",{children:o})]}),e.jsxs("p",{className:"text",children:["조회수  ",e.jsx("span",{children:u})]})]})]})})}const Qe=b.div`
  .flexContainer {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .listHeader {
    display: flex;
    margin: 0 10%;
    border-bottom: 1px solid #1b1d1f;
    padding: 10px 0;
    @media (min-width: 1280px) and (max-width: 1920px) {
      margin: 0px calc(50vw - 640px);
    }
    @media (max-width: 784px) {
      flex-direction: column-reverse;
      margin: 0 5%;
    }
    .left,
    .right {
      display: flex;
      align-items: center;
      width: 50%;
      @media (max-width: 784px) {
        width: 100%;
      }
    }
    .left {
      display: flex;
      @media (max-width: 784px) {
        font-size: 12px;
        margin-top: 20px;
      }
      span {
        font-weight: 700;
      }

      .curPage {
        margin-left: 20px;
        color: #1b1d1f;
      }
    }
    .right {
      justify-content: end;
      select,
      .searchbar,
      .search {
        height: 40px;
        box-sizing: border-box;
        @media (max-width: 784px) {
          font-size: 14px;
        }
      }
      select {
        appearance: none;
        background: url(${U}) no-repeat right 15px center;
        border: 1px solid #f5f5f5;
        padding: 0px 60px 0px 16px;
        width: max-content;
        @media (max-width: 784px) {
          padding: 0px 40px 0px 16px;
          width: 30%;
          font-size: 14px;
        }
      }
      .searchbar {
        margin-left: 30px;
        padding: 2px 16px;
        border: 1px solid #f5f5f5;
        width: 30%;
        @media (max-width: 784px) {
          margin-left: 10px;
          padding: 2px 12px;
          width: 55%;
        }
        &:focus {
          outline: none;
        }
        &::placeholder {
          color: #9ea0a3;
        }
      }
      .search {
        white-space: nowrap;
        margin: 0;
        color: #ffffff;
        background: #093c62;
        width: max-content;
        width: 15%;
        padding: 16px;
        cursor: pointer;
      }
    }
  }
  .listContainer {
    display: flex;
    flex-wrap: wrap;
    padding: 40px 10%;
    gap: calc(8% / 3);
    min-height: 300 px;
    @media (min-width: 1280px) and (max-width: 1920px) {
      padding: 40px calc(50vw - 640px);
    }
    @media (max-width: 784px) {
      padding: 20px 5%;
    }
  }

  .paging {
    display: flex;
    align-items: center;
    justify-content: center;
    .icon,
    .anchor {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon {
      font-size: 24px;
      margin: 0 10px;
      cursor: pointer;
    }
    .anchor {
      width: 40px;
      height: 40px;
      border-radius: 100%;
      cursor: pointer;
    }
    .circle {
      background: #093c62;
      color: #ffffff;
    }
  }
  .toList {
    width: 85px;
    height: 50px;
    text-decoration: none;
    border: 1px solid #9ea0a3;
    color: #1b1d1f;
    margin: 20px 0;
  }
  .empty {
    width: 100%;
    height: 300px;
    border-bottom: 1px solid #c6c8cb;
  }
`;function S({header:t,detail:d,postList:s,total:o,pageNum:p,type:m,loadData:u}){function c(){const n=[],f=1+Math.floor((l-1)/5)*5;let C=f+4>=p?p:f+4;C===0&&(C+=1);for(let w=f;w<=C;w++)n.push(l===w?e.jsx("p",{className:"anchor circle",onClick:()=>{a(w)},children:w},w):e.jsx("p",{className:"anchor",onClick:()=>{a(w)},children:w},w));return n}const[l,a]=g.useState(1),[i,h]=g.useState(""),x=l+"/"+(p>0?p:1),r=g.useRef("none");return g.useEffect(()=>{u(r.current,l-1,i)},[l]),e.jsxs(Qe,{children:[e.jsx(z,{img:t.src,menu:t.menu,detail:t.detail}),e.jsx(L,{name:d.name}),e.jsxs("div",{children:[e.jsxs("div",{className:"listHeader",children:[e.jsxs("div",{className:"left",children:[e.jsxs("p",{className:"total",children:["전체  ",e.jsxs("span",{className:"bold",children:[o,"건"]})]}),e.jsxs("p",{className:"curPage",children:["현재 페이지  ",x]})]}),e.jsxs("div",{className:"right",children:[e.jsxs("select",{onChange:n=>{r.current=n.target.value},children:[e.jsx("option",{value:"all",defaultChecked:!0,children:"전체"}),e.jsx("option",{value:"title",children:"제목"}),e.jsx("option",{value:"content",children:"내용"})]}),e.jsx("input",{type:"text",className:"searchbar",placeholder:"검색어를 입력하세요",onChange:n=>{h(n.target.value)}}),e.jsx("p",{className:"search flexContainer",onClick:()=>{r.current==="none"&&(r.current="all"),u(r.current,l-1,i)},children:"검색"})]})]}),e.jsxs("div",{className:"listContainer",children:[s.map((n,f)=>e.jsx(Ge,{id:n.id,title:n.title,src:n.src,create_at:n.create_at,view:n.view,type:m},f)),s.length===0&&e.jsx("p",{className:"empty"})]}),e.jsxs("div",{className:"paging",children:[e.jsx(T,{className:"icon",onClick:()=>{a(l>=6?l-5:1)}}),e.jsx(E,{className:"icon",onClick:()=>{a(l>1?l-1:1)}}),c(),e.jsx(R,{className:"icon",onClick:()=>{a(l<p?l+1:p)}}),e.jsx(V,{className:"icon",onClick:()=>{a(l+5<=p?l+5:p)}})]})]}),e.jsx(N,{})]})}const G="/assets/article-BA4EejyZ.svg";function Ye(){const t={src:G,menu:"알림마당",detail:"언론보도"},d={name:"언론보도"},[s,o]=g.useState([]),[p,m]=g.useState(0),[u,c]=g.useState(0);function l(i,h,x){i==="none"?a("/article/all?",h).catch(r=>{console.log(r)}):i==="all"?a(`/article/search/all?title=${x}&content=${x}&`,h).catch(r=>{console.log(r)}):i==="title"?a(`/article/search/title?title=${x}&`,h).catch(r=>{console.log(r)}):i==="content"&&a(`/article/search/content?content=${x}&`,h).catch(r=>{console.log(r)})}async function a(i,h){const x=await y.get(`${i}page=${h}&size=8`);m(x.data.data.total),c(x.data.data.page);const r=[];x.data.data.result.forEach(n=>{console.log(n),n.create_at=n.create_at.split("T")[0].replaceAll("-","/"),r.push(n)}),o(r)}return e.jsx(S,{header:t,detail:d,postList:s,total:p,pageNum:u,type:"article",loadData:l})}const Q="/assets/notice-nuJFPlQJ.svg",k="/assets/hwp-DRknqsVF.svg",F="/assets/pdf-YwA3slxV.svg",$="data:image/svg+xml,%3c?xml%20version='1.0'%20encoding='iso-8859-1'?%3e%3c!--%20Generator:%20Adobe%20Illustrator%2019.0.0,%20SVG%20Export%20Plug-In%20.%20SVG%20Version:%206.00%20Build%200)%20--%3e%3csvg%20version='1.1'%20id='Layer_1'%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%20x='0px'%20y='0px'%20viewBox='0%200%20512%20512'%20style='enable-background:new%200%200%20512%20512;'%20xml:space='preserve'%3e%3cpath%20style='fill:%23518EF8;'%20d='M441.412,140.235v338.781c0,18.219-14.778,32.983-32.983,32.983H103.572%20c-18.219,0-32.983-14.764-32.983-32.983V32.983C70.588,14.764,85.352,0,103.572,0h197.605L441.412,140.235z'/%3e%3cg%3e%3crect%20x='161.18'%20y='257.054'%20style='fill:%23FFFFFF;'%20width='189.626'%20height='21.071'/%3e%3crect%20x='161.18'%20y='304.112'%20style='fill:%23FFFFFF;'%20width='189.626'%20height='21.071'/%3e%3crect%20x='161.18'%20y='351.171'%20style='fill:%23FFFFFF;'%20width='189.626'%20height='21.071'/%3e%3crect%20x='161.18'%20y='398.23'%20style='fill:%23FFFFFF;'%20width='134.855'%20height='21.071'/%3e%3c/g%3e%3cpolygon%20style='fill:%233A5BBC;'%20points='320.31,137.188%20441.412,187.079%20441.412,140.235%20372.751,119.962%20'/%3e%3cpath%20style='fill:%23ACD1FC;'%20d='M441.412,140.235H334.16c-18.22,0-32.983-14.764-32.983-32.983V0L441.412,140.235z'/%3e%3cg%3e%3c/g%3e%3cg%3e%3c/g%3e%3cg%3e%3c/g%3e%3cg%3e%3c/g%3e%3cg%3e%3c/g%3e%3cg%3e%3c/g%3e%3cg%3e%3c/g%3e%3cg%3e%3c/g%3e%3cg%3e%3c/g%3e%3cg%3e%3c/g%3e%3cg%3e%3c/g%3e%3cg%3e%3c/g%3e%3cg%3e%3c/g%3e%3cg%3e%3c/g%3e%3cg%3e%3c/g%3e%3c/svg%3e",Xe=b.div`
  .flexContainer {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .listHeader {
    display: flex;
    margin: 0 10%;
    border-bottom: 1px solid #1b1d1f;
    padding: 10px 0;
    @media (min-width: 1280px) and (max-width: 1920px) {
      margin: 0px calc(50vw - 640px);
    }
    @media (max-width: 784px) {
      flex-direction: column-reverse;
      margin: 0 5%;
    }
    .left,
    .right {
      display: flex;
      align-items: center;
      width: 50%;
      @media (max-width: 784px) {
        width: 100%;
      }
    }
    .left {
      display: flex;
      @media (max-width: 784px) {
        font-size: 12px;
        margin-top: 20px;
      }
      span {
        font-weight: 700;
      }

      .curPage {
        margin-left: 20px;
        color: #1b1d1f;
      }
    }
    .right {
      justify-content: end;
      select,
      .searchbar,
      .search {
        height: 40px;
        box-sizing: border-box;
        @media (max-width: 784px) {
          font-size: 14px;
        }
      }
      select {
        appearance: none;
        background: url(${U}) no-repeat right 15px center;
        border: 1px solid #f5f5f5;
        padding: 0px 60px 0px 16px;
        width: max-content;
        @media (max-width: 784px) {
          padding: 0px 40px 0px 16px;
          width: 30%;
          font-size: 14px;
        }
      }
      .searchbar {
        margin-left: 30px;
        padding: 2px 16px;
        border: 1px solid #f5f5f5;
        width: 30%;
        @media (max-width: 784px) {
          margin-left: 10px;
          padding: 2px 12px;
          width: 55%;
        }
        &:focus {
          outline: none;
        }
        &::placeholder {
          color: #9ea0a3;
        }
      }
      .search {
        white-space: nowrap;
        margin: 0;
        color: #ffffff;
        background: #093c62;
        width: max-content;
        width: 15%;
        padding: 16px;
        cursor: pointer;
      }
    }
  }
  .listContainer {
    display: flex;
    flex-wrap: wrap;
    padding: 40px 10%;
    gap: calc(8% / 3);
    min-height: 300 px;
    @media (min-width: 1280px) and (max-width: 1920px) {
      padding: 40px calc(50vw - 640px);
    }
    @media (max-width: 784px) {
      padding: 20px 5%;
    }
  }

  .paging {
    display: flex;
    align-items: center;
    justify-content: center;
    .icon,
    .anchor {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon {
      font-size: 24px;
      margin: 0 10px;
      cursor: pointer;
    }
    .anchor {
      width: 40px;
      height: 40px;
      border-radius: 100%;
      cursor: pointer;
    }
    .circle {
      background: #093c62;
      color: #ffffff;
    }
  }
  .toList {
    width: 85px;
    height: 50px;
    text-decoration: none;
    border: 1px solid #9ea0a3;
    color: #1b1d1f;
    margin: 20px 0;
  }

  .table {
    width: 80%;
    margin: 0 10%;
    border-collapse: collapse;
    @media (min-width: 1280px) and (max-width: 1920px) {
      width: 1280px;
      margin: 0 calc(50vw - 640px);
    }
    @media (max-width: 784px) {
      margin: 0 5%;
      width: 90%;
    }
    tr {
      border-bottom: 1px solid #c6c8cb;
    }
    th,
    .td {
      height: 40px;
      width: calc(100% / 14);
      font-weight: 400;
      text-align: center;
      @media (max-width: 784px) {
        display: none;
      }
    }
    th:nth-child(2),
    .td:nth-child(2) {
      width: calc(500% / 7);
    }
    .head {
      border-bottom: 1px solid #4e5053;
      @media (max-width: 784px) {
        display: none;
      }
    }
  }
  .col {
    cursor: pointer;
  }
  .mobileaTd {
    display: none;
    p:nth-child(1) {
      font-weight: 700;
    }
    p:nth-child(2) {
      font-size: 12px;
      color: #76787b;
    }
    @media (max-width: 784px) {
      display: block;
    }
  }

  .empty {
    width: 100%;
    height: 300px;
    border-bottom: 1px solid #c6c8cb;
  }
  .fileImg {
    width: 20px;
  }
`;function Y({header:t,detail:d,postList:s,inquiry:o=!1,total:p,pageNum:m,loadData:u}){function c(){const n=[],f=1+Math.floor((l-1)/5)*5;let C=f+4>=m?m:f+4;C===0&&(C+=1);for(let w=f;w<=C;w++)n.push(l===w?e.jsx("p",{className:"anchor circle",onClick:()=>{a(w)},children:w},w):e.jsx("p",{className:"anchor",onClick:()=>{a(w)},children:w},w));return n}const[l,a]=g.useState(1),[i,h]=g.useState(""),x=l+"/"+(m>0?m:1),r=g.useRef("none");return g.useEffect(()=>{u(r.current,l-1,i)},[l]),e.jsxs(Xe,{children:[e.jsx(z,{img:t.src,menu:t.menu,detail:t.detail}),e.jsx(L,{name:d.name}),e.jsxs("div",{children:[e.jsxs("div",{className:"listHeader",children:[e.jsxs("div",{className:"left",children:[e.jsxs("p",{className:"total",children:["전체  ",e.jsxs("span",{className:"bold",children:[p,"건"]})]}),e.jsxs("p",{className:"curPage",children:["현재 페이지  ",x]})]}),e.jsxs("div",{className:"right",children:[e.jsxs("select",{onChange:n=>{r.current=n.target.value},children:[!o&&e.jsx("option",{value:"all",defaultChecked:!0,children:"전체"}),e.jsx("option",{value:"title",defaultChecked:o,children:"제목"}),!o&&e.jsx("option",{value:"content",children:"내용"})]}),e.jsx("input",{type:"text",className:"searchbar",placeholder:"검색어를 입력하세요",onChange:n=>{h(n.target.value)}}),e.jsx("p",{className:"search flexContainer",onClick:()=>{r.current==="none"&&(r.current="all"),u(r.current,l-1,i)},children:"검색"})]})]}),e.jsxs("table",{className:"table",children:[e.jsxs("tr",{className:"head",children:[e.jsx("th",{children:"번호"}),e.jsx("th",{children:"제목"}),e.jsx("th",{children:"등록일"}),e.jsx("th",{children:"첨부파일"}),e.jsx("th",{children:o?"처리상태":"조회수"})]}),s.map((n,f)=>e.jsxs("tr",{className:"col",onClick:()=>{o||(window.location.hash=`#/help-call/notice/detail/${n.id}`)},children:[e.jsx("td",{className:"td",children:n.id}),e.jsx("td",{className:"td",children:n.title}),e.jsx("td",{className:"td",children:n.create_at}),e.jsx("td",{className:"td",children:n.src.length>0&&e.jsx("img",{src:n.src,alt:"file",className:"fileImg"})}),o?e.jsx("td",{className:"td",children:n.is_completed?"답변완료":"처리중"}):e.jsx("td",{className:"td",children:n.view}),e.jsx("td",{className:"mobileaTd",children:e.jsxs("div",{children:[e.jsxs("p",{children:[" ",n.title]}),e.jsxs("p",{children:[" ",n.create_at]})]})})]},f)),s.length===0&&e.jsx("tr",{className:"empty"})]}),e.jsxs("div",{className:"paging",children:[e.jsx(T,{className:"icon",onClick:()=>{a(l>=6?l-5:1)}}),e.jsx(E,{className:"icon",onClick:()=>{a(l>1?l-1:1)}}),c(),e.jsx(R,{className:"icon",onClick:()=>{a(l<m?l+1:m)}}),e.jsx(V,{className:"icon",onClick:()=>{a(l+5<=m?l+5:m)}})]})]}),o&&e.jsx("div",{className:"flexContainer",children:e.jsx(v,{to:"/help-call/inquiry/form",className:"toList flexContainer",children:"글쓰기"})}),e.jsx(N,{})]})}function Ke(){const t={src:Q,menu:"알림마당",detail:"공지사항"},d={name:"공지사항"},[s,o]=g.useState([]),[p,m]=g.useState(0),[u,c]=g.useState(0);function l(i,h,x){i==="none"?a("/notice/all?",h).catch(r=>{console.log(r)}):i==="all"?a(`/notice/search/all?title=${x}&content=${x}&`,h).catch(r=>{console.log(r)}):i==="title"?(console.log(),a(`/notice/search/title?title=${x}&`,h).catch(r=>{console.log(r)})):i==="content"&&a(`/notice/search/content?content=${x}&`,h).catch(r=>{console.log(r)})}async function a(i,h){const x=await y.get(`${i}page=${h}&size=8`);m(x.data.data.total),c(x.data.data.page);const r=[],n={id:-1,title:"공지사항 제목",src:"",create_at:"2020/04/05",view:1e3};x.data.data.result.forEach(f=>{n.id=f.id,n.title=f.title,n.view=f.view,f.notice_img_list.length>0?f.notice_img_list[0].src.includes("hwp")?n.src=k:f.notice_img_list[0].src.includes("pdf")?n.src=F:n.src=$:n.src="",n.create_at=f.create_at.split("T")[0].replaceAll("-","/"),r.push({...n})}),o(r)}return e.jsx(Y,{header:t,detail:d,postList:s,total:p,pageNum:u,type:"notice",loadData:l})}const X="/assets/inquiry-C2yxvIuz.svg";function Je(){const t={src:X,menu:"소통창구",detail:"문의글"},d={name:"문의글"},[s,o]=g.useState([]),[p,m]=g.useState(0),[u,c]=g.useState(0);function l(i,h,x){i==="none"?a("/inquiry/all?",h).catch(r=>{console.log(r)}):i==="title"&&a(`/inquiry/search/title?title=${x}&`,h).catch(r=>{console.log(r)})}async function a(i,h){const x=await y.get(`${i}page=${h}&size=8`);m(x.data.data.total),c(x.data.data.page);const r=[],n={id:-1,title:"공지사항 제목",src:"",create_at:"2020/04/05",view:1e3};x.data.data.result.forEach(f=>{f.create_at=f.create_at.split("T")[0],n.id=f.id,n.title=f.title,n.is_completed=f.is_completed,n.create_at=f.create_at.split("T")[0].replaceAll("-","/"),f.inquiry_img_list.length>0?f.inquiry_img_list[0].src.includes("hwp")?n.src=k:f.inquiry_img_list[0].src.includes("pdf")?n.src=F:n.src=$:n.src="",r.push({...n})}),o(r)}return e.jsx(Y,{header:t,detail:d,postList:s,inquiry:!0,total:p,pageNum:u,type:"inquiry",loadData:l})}const K="/assets/newsletter-CaB0mQ1z.svg";function We(){const t={src:K,menu:"홍보마당",detail:"뉴스레터"},d={name:"뉴스레터"},[s,o]=g.useState([]),[p,m]=g.useState(0),[u,c]=g.useState(0);function l(i,h,x){i==="none"?a("/newsletter/all?",h).catch(r=>{console.log(r)}):i==="all"?a(`/newsletter/search/all?title=${x}&content=${x}&`,h).catch(r=>{console.log(r)}):i==="title"?a(`/newsletter/search/title?title=${x}&`,h).catch(r=>{console.log(r)}):i==="content"&&a(`/newsletter/search/content?content=${x}&`,h).catch(r=>{console.log(r)})}async function a(i,h){const x=await y.get(`${i}page=${h}&size=8`);m(x.data.data.total),c(x.data.data.page);const r=[],n={id:0,title:"",view:0,src:"",create_at:""};x.data.data.result.forEach(f=>{n.id=f.id,n.title=f.title,n.view=f.view,n.src=f.newsletter_img_list.length>0?f.newsletter_img_list[0].src:"",n.create_at=f.create_at.split("T")[0].replaceAll("-","/"),r.push({...n})}),o(r)}return e.jsx(S,{header:t,detail:d,postList:s,total:p,pageNum:u,type:"newsletter",loadData:l})}const J="/assets/eventAlbum-CkjZd6lp.svg";function et(){const t={src:J,menu:"홍보마당",detail:"행사앨범"},d={name:"행사앨범"},[s,o]=g.useState([]),[p,m]=g.useState(0),[u,c]=g.useState(0);function l(i,h,x){i==="none"?a("/event/all?",h).catch(r=>{console.log(r)}):i==="all"?a(`/event/search/all?title=${x}&content=${x}&`,h).catch(r=>{console.log(r)}):i==="title"?a(`/event/search/title?title=${x}&`,h).catch(r=>{console.log(r)}):i==="content"&&a(`/event/search/content?content=${x}&`,h).catch(r=>{console.log(r)})}async function a(i,h){const x=await y.get(`${i}page=${h}&size=8`);m(x.data.data.total),c(x.data.data.page);const r=[],n={id:0,title:"",view:0,src:"",create_at:""};x.data.data.result.forEach(f=>{n.id=f.id,n.title=f.title,n.view=f.view,n.src=f.event_img_list.length>0?f.event_img_list[0].src:"",n.create_at=f.create_at.split("T")[0].replaceAll("-","/"),r.push({...n})}),o(r)}return e.jsx(S,{header:t,detail:d,postList:s,total:p,pageNum:u,type:"event",loadData:l})}function W(t){const d=t.split("T");return d[0].replaceAll("-","/")+" "+d[1].substring(0,5)}const tt=b.div`
  color: #1b1d1f;
  .container {
    padding: 0 10%;
    @media (min-width: 1280px) and (max-width: 1920px) {
      padding: 0px calc(50vw - 640px);
    }
    @media (max-width: 784px) {
      padding: 0 5%;
    }
  }
  .title {
    font-size: 28px;
    padding: 10px 0;
    margin: 0;
    border-bottom: 1px solid #1b1d1f;
    letter-spacing: -1.4px;
    text-align: center;
    @media (max-width: 784px) {
      font-size: 20px;
      text-align: left;
    }
  }
  .subHeader {
    display: flex;
    justify-content: right;
    @media (max-width: 784px) {
      justify-content: left;
    }
    .view {
      font-size: 18px;
      font-weight: 700;
      margin: 20px 0 100px 0;
      @media (max-width: 784px) {
        font-size: 12px;
        text-align: left;
        margin-bottom: 40px;
      }
      span {
        color: #76787b;
        font-weight: 400;
      }
      &:nth-child(1) {
        margin-right: 20px;
      }
    }
  }
  .content {
    margin: 80px 0 100px 0;
    @media (max-width: 784px) {
      font-size: 14px;
      margin: 20px 0 40px 0;
    }
  }
  .flexContainer {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .imgArea {
    display: flex;
    flex-direction: column;
    align-items: center;

    img {
      min-width: 40%;
      max-width: 90%;
      background: gray;
      margin-bottom: 30px;
      object-fit: contian;
    }
  }
  .toList {
    width: 85px;
    height: 50px;
    text-decoration: none;
    border: 1px solid #9ea0a3;
    color: #1b1d1f;
    margin: 20px 0;
  }
  .otherPost {
    display: flex;
    align-items: center;
    border-top: 1px solid #c6c8cb;
    text-decoration: none;
    color: #1b1d1f;
    @media (max-width: 784px) {
      font-size: 14px;
    }
    .text:nth-child(2) {
      margin-left: 10px;
    }
    .text:nth-child(3) {
      margin-left: 20px;
    }
  }
  .next {
    border-bottom: 1px solid #c6c8cb;
    margin-bottom: 200px;
  }

  .fileArea {
    display: flex;
    border-top: 1px solid #c6c8cb;
    border-bottom: 1px solid #c6c8cb;
    @media (max-width: 784px) {
      display: block;
    }
    .fileHead {
      width: 10%;
      font-weight: 700;
      font-size: 18px;
      margin-top: 10px;
      @media (max-width: 784px) {
        width: 100%;
      }
    }

    .fileList {
      width: 90%;
      @media (max-width: 784px) {
        width: 100%;
      }
    }
    .file {
      display: flex;
      align-items: center;
      padding: 10px;

      @media (max-width: 784px) {
        font-size: 12px;
      }
      .fileName {
        margin-left: 20px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        width: 70%;
        @media (max-width: 784px) {
          font-size: 12px;
          width: 50%;
        }
      }
      .img {
        width: 30px;
        height: 30px;
        @media (max-width: 784px) {
          width: 20px;
          height: 20px;
        }
      }
      .downloadArea {
        display: flex;
        flex-grow: 1;
        justify-content: end;
        cursor: pointer;
        .download {
          border: 1px solid #9ea0a3;
          padding: 5px;
          font-size: 12px;
          margin: 0;
        }
        .icon {
          margin-left: 10px;
        }
      }
    }
  }
`;function it({header:t,detail:d,post:s,listPageLink:o,file:p}){const m=s.view.toLocaleString(),u=c=>{y.get(c,{responseType:"blob"}).then(l=>{const a=window.URL.createObjectURL(new Blob([l.data])),i=document.createElement("a");i.href=a,i.download=c,document.body.appendChild(i),i.click(),window.URL.revokeObjectURL(a),document.body.removeChild(i)}).catch(l=>{console.error("파일 다운로드 오류:",l)})};return e.jsxs(tt,{children:[e.jsx(z,{img:t.src,menu:t.menu,detail:t.detail}),e.jsx(L,{name:d.name}),e.jsxs("div",{className:"container",children:[e.jsx("h1",{className:"title",children:s.title}),e.jsxs("div",{className:"subHeader",children:[e.jsxs("p",{className:"view",children:["작성일시  ",e.jsx("span",{children:W(s.create_at)})]}),e.jsxs("p",{className:"view",children:["조회수  ",e.jsx("span",{children:m})]})]}),e.jsx("div",{className:"imgArea",children:s.src.map((c,l)=>e.jsx("img",{src:c,className:"img"},l))}),e.jsx("p",{className:"content",children:s.content}),p.length>0&&e.jsxs("div",{className:"fileArea",children:[e.jsx("p",{className:"fileHead",children:"첨부파일"}),e.jsx("div",{className:"fileList",children:p.map((c,l)=>e.jsxs("div",{className:"file",children:[c.includes("hwp")?e.jsx("img",{src:k,className:"img"}):c.includes("pdf")?e.jsx("img",{src:F,className:"img"}):e.jsx("img",{src:$,className:"img"}),e.jsx("div",{className:"img"}),e.jsxs("span",{className:"fileName",children:[" ",c]}),e.jsx("div",{className:"downloadArea",onClick:()=>{u(c)},children:e.jsxs("p",{className:"download",children:["다운로드",e.jsx(H,{className:"icon"})]})})]},l))})]}),e.jsx("div",{className:"flexContainer",children:e.jsx(v,{to:o,className:"toList flexContainer",children:"목록"})}),s.prev!==null&&e.jsxs(v,{to:`${o}/detail/${s.prev}`,className:"otherPost",style:{borderBottom:s.next===null?"1px solid #c6c8cb":"0"},children:[e.jsx(M,{}),e.jsx("p",{className:"text",children:"이전글"}),e.jsx("p",{className:"text",children:"공지사항 1"})]}),s.next!==null&&e.jsxs(v,{className:"otherPost next",to:`${o}/detail/${s.next}`,children:[e.jsx(A,{}),e.jsx("p",{className:"text",children:"다음글"}),e.jsx("p",{className:"text",children:"공지사항 1"})]})]}),e.jsx(N,{})]})}function st(){const t={src:Q,menu:"알림마당",detail:"공지사항"},d={name:"공지사항"},[s,o]=g.useState({id:-1,title:"공지사항 제목",content:"",src:[],create_at:" 2024-06-27T20:18:38.193332",view:1e3,prev:-1,next:-1}),[p,m]=g.useState([]),{id:u}=_();g.useEffect(()=>{c().catch(l=>{console.log(l)})},[u]);async function c(){const a=(await y.get(`/notice/${u}`)).data.data,i=[],h=[];a.notice_img_list.forEach(x=>{/(.*?)\.(jpg|jpeg|png|gif|bmp)$/.test(x.src)?i.push(x.src):h.push(x.src)}),console.log(h),m([...h]),o({id:a.id,title:a.title,content:a.content,src:i,create_at:a.create_at,view:a.view,prev:a.prev,next:a.next})}return e.jsx(it,{header:t,detail:d,listPageLink:"/help-call/notice",post:s,file:p})}const nt=b.div`
  .flexContainer {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .toList {
    width: 85px;
    height: 50px;
    text-decoration: none;
    border: 1px solid #9ea0a3;
    color: #1b1d1f;
    margin: 20px 10px;
    cursor: pointer;
  }

  table {
    margin: 0 10%;
    width: 80%;
    border-collapse: collapse;
    @media (min-width: 1280px) and (max-width: 1920px) {
      width: 1280px;
      margin: 0 calc(50vw - 640px);
    }
    @media (max-width: 784px) {
      margin: 0 5%;
      width: 90%;
    }
    .name {
      padding-top: 20px;
      vertical-align: top;
    }
    td:nth-child(1) {
      font-weight: 700;
      width: 20%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    td {
      border-bottom: 1px solid #9ea0a3;
      padding: 10px 0;
      height: 40px;
      .title,
      .content {
        width: 85%;
        @media (max-width: 784px) {
          width: 70%;
        }
      }
      .content {
        height: 400px;
      }
      @media (max-width: 784px) {
        .email {
          width: 22%;
        }
      }
    }
    .last {
      border: 0;
    }
    .fileArea {
      padding: 10px 20px;
      @media (max-width: 784px) {
        margin-left: 10px;
      }
    }
  }

  input[type='text'],
  textarea {
    border: 1px solid #c6c8cb;
    height: 20px;
    padding: 10px 20px;
    @media (max-width: 784px) {
      margin-left: 10px;
    }
  }
  input[type='text']:focus,
  textarea {
    outline: none;
    border: 1px solid #1c7393;
  }

  .input {
    width: 40%;
  }
  #file {
    display: none;
  }
  .fileLabel {
    width: 80px;
    display: flex;
    justify-content: center;
    padding: 5px;
    border: 1px solid #9ea0a3;
    background: #dfdfe0;
    border-radius: 3px;
    @media (max-width: 784px) {
      font-size: 12px;
    }
  }
  .fileLimit {
    font-size: 16px;
    font-weight: 700;
    @media (max-width: 784px) {
      font-size: 12px;
    }
  }

  .fileInfo {
    display: flex;
    align-items: center;
    .icon {
      font-size: 18px;
      width: 10%;
    }
  }
  .fileName {
    width: 90%;
    color: #007cff;
    font-weight: 400;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    @media (max-width: 784px) {
      font-size: 12px;
    }
  }
`;function at(){const t=g.useRef({title:"",writer:"",phone:"",email:"",content:""}),d=g.useRef(""),s=g.useRef(""),[o,p]=g.useState([]),m=g.useRef([]),u=g.useRef(0),c=g.useRef([]);async function l(){const h=(await y.post("/inquiry",{data:{...t.current}})).data.data.id;if(o.length>0){const x=new FormData;for(const n of m.current)x.append("multipartFile",n);(await y.post(`/img-file/upload?dir=inquiry/${h}`,x,{headers:{"Content-Type":"multipart/form-data"}})).data.data.forEach(n=>{y.post("/img/inquiry",{data:{src:`/help-call-files/${n}`,target:h}}).catch(()=>{alert("이미지를 등록할 수 없습니다")})})}alert("등록되었습니다"),window.location.hash="#/help-call/inquiry"}function a(){t.current.title!==void 0&&t.current.title.length<2?alert("제목은 2자 이상 입력해야 합니다"):t.current.writer!==void 0&&t.current.writer.length<2?alert("작성자는 2자 이상 입력해야 합니다"):t.current.email!==void 0&&!/^[a-zA-Z0-9+-\_.]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(t.current.email)?alert("이메일 주소가 아닙니다"):t.current.phone!==void 0&&!/^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/.test(t.current.phone)?alert("핸드폰 번호를 확인해주세요"):t.current.content!==void 0&&t.current.content.length<2?alert("문의내용은 10자 이상 입력해야 합니다"):l()}return e.jsxs(nt,{children:[e.jsx(z,{img:X,detail:"문의글",menu:"소통창구"}),e.jsx(L,{name:"소통창구"}),e.jsxs("table",{children:[e.jsxs("tr",{children:[e.jsx("td",{children:"제목*"}),e.jsx("td",{children:e.jsx("input",{type:"text",className:"title",placeholder:"2자 이상 입력해주세요",onChange:i=>{t.current.title=i.target.value}})})]}),e.jsxs("tr",{children:[e.jsx("td",{children:"작성자*"}),e.jsx("td",{children:e.jsx("input",{type:"text",className:"input",placeholder:"2자 이상 입력해주세요",onChange:i=>{t.current.writer=i.target.value}})})]}),e.jsxs("tr",{children:[e.jsx("td",{children:"전화번호*"}),e.jsx("td",{children:e.jsx("input",{type:"text",className:"input",onChange:i=>{t.current.phone=i.target.value}})})]}),e.jsxs("tr",{children:[e.jsx("td",{children:"이메일*"}),e.jsxs("td",{children:[e.jsx("input",{type:"text",className:"email",onChange:i=>{d.current=i.target.value,t.current.email=d.current+"@"+s.current}}),"   @  ",e.jsx("input",{type:"text",className:"email",onChange:i=>{s.current=i.target.value,t.current.email=d.current+"@"+s.current}})]})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"name",children:"내용"}),e.jsx("td",{children:e.jsx("textarea",{placeholder:"1000자이내로 입력해주세요",className:"content",onChange:i=>{t.current.content=i.target.value}})})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"name last",children:"첨부파일"}),e.jsxs("td",{className:"last fileArea",children:[e.jsx("input",{type:"file",id:"file",accept:".hwp,.xls,.doc,.ppt,.pdf,.zip,.jpg,.gif,.png",onChange:i=>{if(i.target.files!==null&&i.target.files.length>0){const h=(u.current+i.target.files[0].size)/1048576;if(h>10){alert("전체 파일 크기가 10MB를 초과합니다");return}c.current.push(i.target.files[0].size),u.current+=i.target.files[0].size;const x=[...o];x.push(`${i.target.files[0].name} (${Math.round(h*100)/100}MB)`),p(x),m.current.push(i.target.files[0])}}}),e.jsx("label",{htmlFor:"file",className:"fileLabel",children:"파일 선택"}),o.map((i,h)=>e.jsxs("div",{className:"fileInfo",children:[e.jsx("p",{className:"fileName",children:i}),e.jsx(ae,{className:"icon flexContainer",onClick:()=>{const x=c.current.splice(h,1);u.current-=x[0],o.splice(h,1),p([...o]),m.current.splice(h,1)}})]},h)),e.jsxs("p",{className:"fileLimit",children:["*hwp,xls,doc,ppt,pdf,zip,jpg,gif,png 파일만 가능합니다. ",e.jsx("br",{}),"용량제한 10MB"]})]})]})]}),e.jsxs("div",{className:"flexContainer",children:[e.jsx("p",{className:"toList flexContainer",onClick:()=>{a()},children:"저장"}),e.jsx(v,{to:"/help-call/inquiry",className:"toList flexContainer",children:"목록"})]}),e.jsx(N,{})]})}const lt=b.div`
  color: #1b1d1f;
  .container {
    padding: 0 10%;
    @media (min-width: 1280px) and (max-width: 1920px) {
      padding: 0px calc(50vw - 640px);
    }
    @media (max-width: 784px) {
      padding: 0 5%;
    }
  }
  .title {
    font-size: 28px;
    padding: 10px 0;
    margin: 0;
    border-bottom: 1px solid #1b1d1f;
    letter-spacing: -1.4px;
    text-align: center;
    @media (max-width: 784px) {
      font-size: 20px;
      text-align: left;
    }
  }
  .subHeader {
    display: flex;
    justify-content: right;
    @media (max-width: 784px) {
      justify-content: left;
    }
    .view {
      font-size: 18px;
      font-weight: 700;
      margin: 20px 0 100px 0;
      @media (max-width: 784px) {
        font-size: 12px;
        text-align: left;
        margin-bottom: 40px;
      }
      span {
        color: #76787b;
        font-weight: 400;
      }
      &:nth-child(1) {
        margin-right: 20px;
      }
    }
  }
  .content {
    margin: 80px 0 100px 0;
    @media (max-width: 784px) {
      font-size: 14px;
      margin: 20px 0 40px 0;
    }
  }
  .flexContainer {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .imgArea {
    display: flex;
    flex-direction: column;
    align-items: center;

    img {
      min-width: 40%;
      max-width: 90%;
      background: gray;
      margin-bottom: 30px;
      object-fit: contian;
    }
  }
  .toList {
    width: 85px;
    height: 50px;
    text-decoration: none;
    border: 1px solid #9ea0a3;
    color: #1b1d1f;
    margin: 20px 0;
  }
  .otherPost {
    display: flex;
    align-items: center;
    border-top: 1px solid #c6c8cb;
    text-decoration: none;
    color: #1b1d1f;
    @media (max-width: 784px) {
      font-size: 14px;
    }
    .text:nth-child(2) {
      margin-left: 10px;
    }
    .text:nth-child(3) {
      margin-left: 20px;
    }
  }
  .next {
    border-bottom: 1px solid #c6c8cb;
    margin-bottom: 200px;
  }

  .fileArea {
    display: flex;
    border-top: 1px solid #c6c8cb;
    border-bottom: 1px solid #c6c8cb;
    @media (max-width: 784px) {
      display: block;
    }
    .fileHead {
      width: 10%;
      font-weight: 700;
      font-size: 18px;
      margin-top: 10px;
      @media (max-width: 784px) {
        width: 100%;
      }
    }

    .fileList {
      width: 90%;
      @media (max-width: 784px) {
        width: 100%;
      }
    }
    .file {
      display: flex;
      align-items: center;
      padding: 10px;

      @media (max-width: 784px) {
        font-size: 12px;
      }
      .fileName {
        margin-left: 20px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        width: 70%;
        @media (max-width: 784px) {
          font-size: 12px;
          width: 50%;
        }
      }
      .img {
        width: 30px;
        height: 30px;
        @media (max-width: 784px) {
          width: 20px;
          height: 20px;
        }
      }
      .downloadArea {
        display: flex;
        flex-grow: 1;
        justify-content: end;
        cursor: pointer;
        .download {
          border: 1px solid #9ea0a3;
          padding: 5px;
          font-size: 12px;
          margin: 0;
        }
        .icon {
          margin-left: 10px;
        }
      }
    }
  }
`;function D({header:t,detail:d,post:s,listPageLink:o,file:p=!1}){const m=s.view.toLocaleString(),u=c=>{y.get(c,{responseType:"blob"}).then(l=>{const a=window.URL.createObjectURL(new Blob([l.data])),i=document.createElement("a");i.href=a,i.download=c,document.body.appendChild(i),i.click(),window.URL.revokeObjectURL(a),document.body.removeChild(i)}).catch(l=>{console.error("파일 다운로드 오류:",l)})};return e.jsxs(lt,{children:[e.jsx(z,{img:t.src,menu:t.menu,detail:t.detail}),e.jsx(L,{name:d.name}),e.jsxs("div",{className:"container",children:[e.jsx("h1",{className:"title",children:s.title}),e.jsxs("div",{className:"subHeader",children:[e.jsxs("p",{className:"view",children:["작성일시  ",e.jsx("span",{children:W(s.create_at)})]}),e.jsxs("p",{className:"view",children:["조회수  ",e.jsx("span",{children:m})]})]}),!p&&e.jsx("div",{className:"imgArea",children:s.src.map((c,l)=>e.jsx("img",{src:c,className:"img"},l))}),e.jsx("p",{className:"content",children:s.content}),p&&s.src.length>0&&e.jsxs("div",{className:"fileArea",children:[e.jsx("p",{className:"fileHead",children:"첨부파일"}),e.jsx("div",{className:"fileList",children:s.src.map((c,l)=>e.jsxs("div",{className:"file",children:[c.includes("hwp")?e.jsx("img",{src:k,className:"img"}):c.includes("pdf")?e.jsx("img",{src:F,className:"img"}):e.jsx("img",{src:$,className:"img"}),e.jsx("div",{className:"img"}),e.jsxs("span",{className:"fileName",children:[" ",c]}),e.jsx("div",{className:"downloadArea",onClick:()=>{u(c)},children:e.jsxs("p",{className:"download",children:["다운로드",e.jsx(H,{className:"icon"})]})})]},l))})]}),e.jsx("div",{className:"flexContainer",children:e.jsx(v,{to:o,className:"toList flexContainer",children:"목록"})}),s.prev!==null&&e.jsxs(v,{to:`${o}/detail/${s.prev}`,className:"otherPost",style:{borderBottom:s.next===null?"1px solid #c6c8cb":"0"},children:[e.jsx(M,{}),e.jsx("p",{className:"text",children:"이전글"}),e.jsx("p",{className:"text",children:"공지사항 1"})]}),s.next!==null&&e.jsxs(v,{className:"otherPost next",to:`${o}/detail/${s.next}`,children:[e.jsx(A,{}),e.jsx("p",{className:"text",children:"다음글"}),e.jsx("p",{className:"text",children:"공지사항 1"})]})]}),e.jsx(N,{})]})}function ct(){const t={src:G,menu:"알림마당",detail:"언론보도"},d={name:"언론보도"},[s,o]=g.useState({id:-1,title:"공지사항 제목",content:"",src:[],create_at:" 2024-06-27T20:18:38.193332",view:1e3,prev:-1,next:-1}),{id:p}=_();g.useEffect(()=>{m().catch(u=>{console.log(u)})},[p]);async function m(){const c=(await y.get(`/article/${p}`)).data.data;console.log(c),o({id:c.id,title:c.title,content:c.content,src:[c.src],create_at:c.create_at,view:c.view,prev:c.prev,next:c.next})}return e.jsx(D,{header:t,detail:d,listPageLink:"/help-call/article",post:s})}function ot(){const t={src:K,menu:"알림마당",detail:"뉴스레터"},d={name:"뉴스레터"},[s,o]=g.useState({id:-1,title:"공지사항 제목",content:"",src:[],create_at:" 2024-06-27T20:18:38.193332",view:1e3,prev:-1,next:-1}),{id:p}=_();g.useEffect(()=>{m().catch(u=>{console.log(u)})},[p]);async function m(){const c=(await y.get(`/newsletter/${p}`)).data.data,l=[];c.newsletter_img_list.forEach(a=>{l.push(a.src)}),console.log(c),o({id:c.id,title:c.title,content:c.content,src:l,create_at:c.create_at,view:c.view,prev:c.prev,next:c.next})}return e.jsx(D,{header:t,detail:d,listPageLink:"/help-call/newsletter",post:s})}function rt(){const t={src:J,menu:"홍보마당",detail:"행사앨범"},d={name:"행사앨범"},[s,o]=g.useState({id:-1,title:"공지사항 제목",content:"",src:[],create_at:" 2024-06-27T20:18:38.193332",view:1e3,prev:-1,next:-1}),{id:p}=_();g.useEffect(()=>{m().catch(u=>{console.log(u)})},[p]);async function m(){const c=(await y.get(`/event/${p}`)).data.data,l=[];c.event_img_list.forEach(a=>{l.push(a.src)}),console.log(l),o({id:c.id,title:c.title,content:c.content,src:l,create_at:c.create_at,view:c.view,prev:c.prev,next:c.next})}return e.jsx(D,{header:t,detail:d,listPageLink:"/help-call/event",post:s})}const dt=b.div`
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: #ffffff;
  color: #000000;
`;function gt(){return e.jsxs(dt,{children:[e.jsx(le,{label:"동행하는 사람들 홈페이지"}),e.jsxs(ie,{children:[e.jsx(j,{path:"/",element:e.jsx(be,{})}),e.jsx(j,{path:"/intro",element:e.jsx(Le,{})}),e.jsx(j,{path:"/business/go-ablity",element:e.jsx(De,{})}),e.jsx(j,{path:"/business/education",element:e.jsx(Ee,{})}),e.jsx(j,{path:"/business/exhibition",element:e.jsx(Oe,{})}),e.jsx(j,{path:"/business/counseling",element:e.jsx(e.Fragment,{})}),e.jsx(j,{path:"/business/equipment",element:e.jsx(e.Fragment,{})}),e.jsx(j,{path:"/notice",element:e.jsx(Ke,{})}),e.jsx(j,{path:"/notice/detail/:id",element:e.jsx(st,{})}),e.jsx(j,{path:"/article",element:e.jsx(Ye,{})}),e.jsx(j,{path:"/article/detail/:id",element:e.jsx(ct,{})}),e.jsx(j,{path:"/newsletter",element:e.jsx(We,{})}),e.jsx(j,{path:"/newsletter/detail/:id",element:e.jsx(ot,{})}),e.jsx(j,{path:"/event",element:e.jsx(et,{})}),e.jsx(j,{path:"/event/detail/:id",element:e.jsx(rt,{})}),e.jsx(j,{path:"/inquiry",element:e.jsx(Je,{})}),e.jsx(j,{path:"/inquiry/form",element:e.jsx(at,{})})]})]})}export{gt as default};
