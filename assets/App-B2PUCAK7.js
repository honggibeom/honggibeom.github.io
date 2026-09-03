import{k as P,p as R,o as q,j as e,d as k,r as p,L as O,G as X,l as G,f as V,g as J}from"./index-CguGqeUW.js";import{a as B,H as $,m as j,b as Z,G as K}from"./index-C3O3Wcgu.js";import{b as Q,c as Y,d as W,e as ee}from"./index-C8XJY25S.js";import{D as te}from"./DemoBanner-C_6GNuVf.js";const U=P(R(t=>({isLogin:!1,setLogin:()=>t(()=>({isLogin:!0})),setLogout:()=>{t({isLogin:!1}),window.location.assign("/help-call-admin")}}),{name:"isLogin",storage:q(()=>sessionStorage)})),ie=k.div`
  box-sizing: border-box;
  padding: 20px 0;
  .line {
    margin: 5px 0;
    width: 300px;
    height: 2px;
    background: #00000055;
  }
  .line::after {
    content: '';
    position: absolute;
    width: 300px;
    height: 2px;
    background-color: #000000;
    visibility: hidden;
    transform: scaleX(0);
    transition: all 0.3s ease-in-out;
  }

  #input:focus + .line:after {
    visibility: visible;
    transform: scaleX(1);
  }
  #input:focus ~ .text,
  #input:valid ~ .text {
    color: #686868;
    top: -4rem;
    font-weight: 700;
  }

  .text {
    font-size: 16px;
    color: #68686866;
    position: relative;
    top: -2.5rem;
    transition: 0.3s ease-in-out;
  }

  #input:focus {
    outline: none;
  }

  #input {
    font-size: 16px;
    border: 0;
    width: 300px;
  }
`;function E({title:t,data:a}){return e.jsxs(ie,{children:[e.jsx("input",{type:"text",id:"input",required:!0,onChange:l=>{a.current=l.target.value}}),e.jsx("p",{className:"line"}),e.jsx("label",{className:"text",htmlFor:"input",children:t})]})}k.div`
  box-sizing: border-box;
  padding: 20px 0;
  .line {
    position: relative;
    top: 7px;
    margin: 0;
    width: 100%;
    height: 2px;
    background: #686868;
    visibility: hidden;
    transform: scaleX(0);
    transition: all 0.3s ease-in-out;
  }
  .line1 {
    margin: 5px 0;
    width: 100%;
    height: 1px;
    background: #999;
  }
  #input:focus + .line {
    visibility: visible;
    transform: scaleX(1);
  }

  .text {
    font-size: 16px;
    color: #686868;
    font-weight: 700;
    margin-bottom: 20px;
  }

  #input:focus {
    outline: none;
  }

  #input {
    border: 0;
    color: #686868;
    font-size: 14px;
    width: ${t=>t.width};
  }
`;const ae=k.div`
  #input {
    border: 0;
    color: #485675;
    font-size: 14px;
    width: ${t=>t.width};
    background-color: #f9f9f9;
    border: 0;
    padding: 1rem 1.7rem;
    border-radius: 8px;
    font-weight: 500;
    &::placeholder {
      color: #99a1b7;
    }
    &:focus {
      outline: none;
      background: #f1f2f4;
      color: #4b5675;
    }
  }

  .text {
    font-weight: 700;
    color: #252f4a;
  }
`;function z({title:t,width:a="80%",data:l,setData:d,type:h,disabled:x=!1}){return e.jsxs(ae,{width:a,children:[e.jsx("p",{className:"text",children:t}),e.jsx("input",{type:"text",id:"input",required:!0,defaultValue:l[h],disabled:x,onChange:b=>{const n={...l};n[h]=b.target.value,d(n)}})]})}const ne=k.div`
  width: 100%;
  /* 데모 배너가 위를 차지하므로 그만큼 빼야 스크롤이 안 생긴다 */
  height: calc(100vh - var(--helpcall-banner, 0px));
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #edf1f5;
  .title {
    margin: 10px 0 50px 0;
    text-align: center;
    color: rgba(0, 0, 0, 0.5);
    box-sizing: border-box;
    font-weight: 600;
  }
  .container {
    background: #ffffff;
    padding: 50px 70px;
    box-shadow: 0px 0px 5px #00000055;
    border-radius: 8px;
    box-sizing: border-box;
  }

  .hint {
    margin: 16px 0 0 0;
    font-size: 12px;
    line-height: 1.6;
    color: #8a8a8a;
    text-align: center;
  }
  .login {
    width: 100%;
    background: #68686866;
    color: #ffffff;
    text-align: center;
    padding: 10px 0;
    box-sizing: border-box;
    border-radius: 8px;
    transition: 0.3s;
  }

  .login:hover {
    background: #686868;
  }
`,H="demo",A="demo1234";function se(){const t=p.useRef(""),a=p.useRef(""),l=U(d=>d.setLogin);return e.jsx(ne,{children:e.jsxs("div",{className:"container",children:[e.jsx("h2",{className:"title",children:"admin"}),e.jsx(E,{title:"아이디",data:t}),e.jsx(E,{title:"비밀번호",data:a}),e.jsxs("p",{className:"hint",children:["포트폴리오 데모 계정 — 아이디 ",H," / 비밀번호 ",A]}),e.jsx("p",{className:"login",onClick:()=>{H===t.current&&A===a.current?l():alert("아이디 혹은 비밀번호를 확인해주세요")},children:"로그인"})]})})}const oe=P(R(t=>({menu:-1,setMenu:a=>{t({menu:a})}}),{name:"menu",storage:q(()=>sessionStorage)})),re=k.div`
  border-bottom: 1px solid #344057;
  .menu:hover {
    background: #3d69dd;
    color: #ffffff;
  }

  .menu {
    display: block;
    box-sizing: border-box;
    width: 250px;
    padding: 12px 20px;
    font-weight: 600;
    font-size: 18px;
    color: ${t=>t.current?"#ffffff":"#7a90a9"};
    ${t=>t.current&&"background: #4B5777"};
    transition: 0.3s;
    text-decoration: none;
    white-space: nowrap;
  }
`;function le({name:t,to:a,seq:l}){const{menu:d,setMenu:h}=oe();return e.jsx(re,{current:l===d,children:e.jsx(O,{to:a,className:"menu",onClick:()=>{h(l)},children:t})})}function de(t){return X({attr:{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"},child:[{tag:"circle",attr:{cx:"12",cy:"12",r:"10"},child:[]},{tag:"circle",attr:{cx:"12",cy:"10",r:"3"},child:[]},{tag:"path",attr:{d:"M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"},child:[]}]})(t)}const ce=k.div`
  display: Flex;
  overflow: hidden;
  width: 100%;
  height: calc(100vh - var(--helpcall-banner, 0px));
  box-sizing: border-box;

  .sidebar {
    background: #2d3a58;
    height: calc(100vh - var(--helpcall-banner, 0px));
    padding-bottom: 30px;
    overflow: hidden;
    box-sizing: border-box;
    max-width: ${t=>t.sidebar?"300px ":"0px"};
    transition: 0.2s;
  }

  .menuTop {
    color: #ffffff;
    font-size: 24px;
    font-weight: 700;
    padding-bottom: 20px;
    padding: 20px;
    margin: 0;
    border-bottom: 1px solid #ffffffaa;
  }
  .container {
    display: grid;
    grid-template-rows: 100px minmax(0px, auto);
    flex-grow: 1;
  }
  .header {
    width: 100%;
    display: flex;
    background: #ffffff;
    box-sizing: border-box;
    padding-right: 30px;
  }
  .menuBtn,
  .user {
    display: flex;
    align-items: center;
    margin: 0;
  }

  .menuBtn {
    font-size: 18px;
    font-weight: 700;
    flex-grow: 1;
  }

  .user {
    text-align: right;
    font-size: 34px;
  }

  .screen {
    padding: 30px;
    background: #edf1f5;
    overflow-y: auto;
    overflow-x: hidden;
    box-sizing: border-box;
  }

  .menuIcon {
    height: 100%;
    padding: 0 30px;
    font-size: 40px;
  }
  .menuIcon:hover {
    background: #00000088;
  }

  .back {
    width: 100vw;
    height: 100vh;
    background: #00000088;
    position: fixed;
    display: none;
    z-index: 1;
  }

  @media (max-width: 512px) {
    .sidebar {
      position: fixed;
      box-sizing: border-box;
      z-index: 2;
    }
    .back {
      ${t=>t.sidebar&&"display:block"};
    }
  }
`;function fe({element:t}){const[a,l]=p.useState(!0),d={홈:"/help-call-admin",행사앨범:"/help-call-admin/event",언론보도:"/help-call-admin/article",뉴스레터:"/help-call-admin/newsletter",공지사항:"/help-call-admin/notice",문의:"/help-call-admin/inquiry"};return e.jsxs(ce,{sidebar:a,children:[e.jsxs("div",{className:"sidebar",children:[e.jsx("p",{className:"menuTop",children:"Donghangsa"}),Object.keys(d).map((h,x)=>e.jsx(le,{name:h,to:d[h],seq:x},x))]}),e.jsx("div",{className:"back",onClick:()=>{l(!a)}}),e.jsxs("div",{className:"container",children:[e.jsxs("div",{className:"header",children:[e.jsx("p",{className:"menuBtn",children:e.jsx(G,{className:"menuIcon",onClick:()=>{l(!a)}})}),e.jsx("p",{className:"user",children:e.jsx(de,{})})]}),e.jsx("div",{className:"screen",children:t})]})]})}const pe=k.div`
  #input {
    border: 0;
    color: #485675;
    font-size: 14px;
    width: ${t=>t.width};
    height: ${t=>t.height};
    background-color: #f9f9f9;
    border: 0;
    padding: 1rem 1.7rem;
    border-radius: 8px;
    font-weight: 500;
    &::placeholder {
      color: #99a1b7;
    }
    &:focus {
      outline: none;
      background: #f1f2f4;
      color: #4b5675;
    }
  }

  .text {
    font-weight: 700;
    color: #252f4a;
  }
`;function D({title:t,width:a="80%",height:l="400px",data:d,setData:h,type:x,disabled:b=!1}){return e.jsxs(pe,{width:a,height:l,children:[e.jsx("p",{className:"text",children:t}),e.jsx("textarea",{id:"input",required:!0,defaultValue:d[x],disabled:b,onChange:n=>{const s={...d};s[x]=n.target.value,h(s)}})]})}const S=P(t=>({form:!1,update:!1,selectedId:0,setForm:a=>t(()=>({form:a})),setUpdate:a=>t(()=>({update:a})),setSelectedId:a=>t(()=>({selectedId:a}))})),xe=k.div`
  .listHeader {
    width: 90%;
    display: flex;
    align-items: center;
    margin: 0 5%;
    .name {
      font-size: 20px;
      font-weight: 700;
      margin-right: 20px;
    }
    .item {
      cursor: pointer;
      display: flex;
      align-items: center;
      padding: 4px 8px;
      border: 1px solid #d9dadc;
      margin-left: 5px;
      border-radius: 4px;
      @media (max-width: 784px) {
        margin-left: 0px;
        margin-right: 5px;
      }
      span {
        margin-left: 5px;
      }

      &:hover {
        font-weight: 700;
        background: #3d69dd;
        border: 1px solid #3d69dd;
        color: #ffffff;
      }
    }
  }

  .postForm {
    width: calc(100% + 30px);
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    padding: 20vh 0;
    top: ${t=>t.form?"0":"-100vh"};
    opacity: ${t=>t.form?"1":"0"};
    left: -30px;
    transition: 0.5s opacity;
    z-index: 3;
    box-sizing: border-box;
  }
  .background {
    position: fixed;
    width: 100vw;
    height: 100vh;
    background: #00000066;
    left: 0;
    top: 0;
    z-index: 4;
    display: ${t=>t.form?"block":"none"};
  }
  .form {
    background-color: #ffffff;
    width: 40%;
    max-height: 94vh;
    border: 1px solid #f1f1f4;
    box-shadow:
      rgba(0, 0, 0, 0.2) 0px 12px 28px 0px,
      rgba(0, 0, 0, 0.1) 0px 2px 4px 0px,
      rgba(255, 255, 255, 0.05) 0px 0px 0px 1px inset;
    overflow-y: auto;
    overflow-x: hidden;
    z-index: 5;
    border-radius: 8px;
  }

  .flexContainer {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .formHeader {
    width: 90%;
    padding: 10px 5%;
    border-bottom: 1px solid #f1f1f4;
    .name {
      width: 80%;
      margin-left: 10%;
      font-weight: 600;
      font-size: 20px;
      color: #252f4a;
    }
    .icon {
      width: 10%;
      font-size: 20px;
      color: #99a1b7;
      cursor: pointer;
    }
  }
  .formContainer {
    padding: 20px 5%;
    width: 90%;
  }

  .text {
    font-weight: 700;
    color: #252f4a;
  }
  #file {
    display: none;
  }
  .fileLabel {
    width: 80px;
    display: flex;
    justify-content: center;
    padding: 2px;
    border: 1px solid #9ea0a3;
    background: #dfdfe0;
    border-radius: 3px;
    font-size: 14px;
    @media (max-width: 784px) {
      font-size: 12px;
    }
  }
  .fileInfo {
    font-size: 16px;
    font-weight: 700;
    @media (max-width: 784px) {
      font-size: 12px;
    }
  }

  .fileName {
    width: 90%;
    color: #252f4a;
    font-weight: 400;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 14px;
    @media (max-width: 784px) {
      font-size: 12px;
    }
  }

  .register {
    width: 90%;
    margin: 50px 5%;
    padding: 20px 0;
    color: #ffffff;
    background: #0d6efd;
    font-size: 18px;
    font-weight: 700;
    border-radius: 8px;
    box-sizing: border-box;
    cursor: pointer;
    border: 2px solid #0d6efd;
    @media (max-width: 784px) {
      font-size: 12px;
    }
    &:hover {
      color: #0d6efd;
      background: #ffffff;
    }
  }
  .fileInfo {
    display: flex;
    align-items: center;
    .icon {
      cursor: pointer;
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
  .fileLimit {
    width: 90%;
    margin: 20px 5%;
    font-weight: 700;
  }
`;function M({name:t,type:a}){const[l,d]=p.useState([]),{form:h,setForm:x,update:b,setUpdate:n,selectedId:s}=S(),r=p.useRef([]),[o,i]=p.useState({title:"",content:""}),f=p.useRef(0),c=p.useRef([]),[m,v]=p.useState([]);async function y(){const g=await j.post(`/${a}`,{data:{...o}});if(l.length>0){const w=new FormData;for(const I of r.current)w.append("multipartFile",I);const N=g.data.data.id;(await j.post(`/img-file/upload?dir=${a}/${N}`,w,{headers:{"Content-Type":"multipart/form-data"}})).data.data.forEach(I=>{j.post(`/img/${a}`,{data:{src:`/help-call-files/${I}`,target:N}}).catch(()=>{alert("이미지를 등록할 수 없습니다")})});return}}async function C(){if(await j.patch(`/${a}/update`,{data:{...o}}),l.length>0){const g=new FormData;for(const N of r.current)g.append("multipartFile",N);(await j.post(`/img-file/upload?dir=${a}/${s}`,g,{headers:{"Content-Type":"multipart/form-data"}})).data.data.forEach(N=>{j.post(`/img/${a}`,{data:{src:`/help-call-files/${N}`,target:s}}).catch(()=>{alert("이미지를 등록할 수 없습니다")})})}}async function F(){const g=await j.get(`/${a}/${s}`),w=g.data.data;i({id:w.id,title:w.title,content:w.content}),v([...g.data.data[a+"_img_list"]])}async function _(g){j.delete(`/img/${a}/delete/${g}`)}function u(){b?C().then(()=>{alert("수정되었습니다"),x(!1),n(!1),window.location.reload()}):y().then(()=>{alert("등록되었습니다"),x(!1),n(!1),window.location.reload()})}return p.useEffect(()=>{h||(r.current=[],v([]),i({title:"",content:""}))},[h]),p.useEffect(()=>{b&&F()},[b]),e.jsxs(xe,{form:h,children:[e.jsxs("div",{className:"listHeader",children:[e.jsx("p",{className:"name",children:t}),e.jsxs("p",{className:"item",onClick:()=>{x(!0)},children:[e.jsx(B,{}),e.jsx("span",{children:"글쓰기"})]})]}),e.jsxs("div",{className:"postForm",children:[e.jsx("div",{className:"background",onClick:()=>{x(!1),n(!1)}}),e.jsxs("div",{className:"form",children:[e.jsxs("div",{className:"formHeader flexContainer",children:[e.jsx("p",{className:"name flexContainer",children:t}),e.jsx($,{className:"icon flexContainer",onClick:()=>{x(!1),n(!1)}})]}),e.jsxs("div",{className:"formContainer",children:[e.jsx(z,{title:"제목",width:"90%",data:o,setData:i,type:"title"}),e.jsx(D,{title:"내용",width:"90%",height:"300px",data:o,setData:i,type:"content"}),e.jsx("p",{className:"text",children:"파일"}),e.jsx("input",{type:"file",id:"file",accept:a==="notice"?".hwp,.xls,.doc,.ppt,.pdf,.zip,.jpg,.gif,.png":"image/*",onChange:g=>{if(g.target.files!==null&&g.target.files.length>0){if(a!=="notice"&&!/(.*?)\.(jpg|jpeg|png|gif|bmp)$/.test(g.target.files[0].name)){alert("이미지 파일만 등록이 가능합니다");return}const w=(f.current+g.target.files[0].size)/1048576;if(w>10){alert("전체 파일 크기가 10MB를 초과합니다");return}c.current.push(g.target.files[0].size),f.current+=g.target.files[0].size;const N=[...l];N.push(`${g.target.files[0].name} (${Math.round(w*100)/100}MB)`),d(N),r.current.push(g.target.files[0])}}}),e.jsx("label",{htmlFor:"file",className:"fileLabel",children:"파일 선택"}),b&&m.map((g,w)=>e.jsxs("div",{className:"fileInfo",children:[e.jsx("p",{className:"fileName",children:g.src}),e.jsx($,{className:"icon flexContainer",onClick:()=>{_(g.id),m.splice(w,1),v([...m])}})]},w)),l.map((g,w)=>e.jsxs("div",{className:"fileInfo",children:[e.jsx("p",{className:"fileName",children:g}),e.jsx($,{className:"icon flexContainer",onClick:()=>{const N=c.current.splice(w,1);f.current-=N[0],l.splice(w,1),d([...l]),r.current.splice(w,1)}})]},w))]}),e.jsx("p",{className:"fileLimit",children:a==="notice"?"*hwp,xls,doc,ppt,pdf,zip,jpg,gif,png 파일만 가능합니다.":"이미지 파일만 업로드 가능합니다"}),e.jsx("p",{className:"register flexContainer",onClick:()=>{u()},children:"등록"})]})]})]})}const he="data:image/svg+xml,%3csvg%20width='12'%20height='12'%20viewBox='0%200%2012%2012'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M10.952%203.19789C10.8248%203.06593%2010.6741%203%2010.5%203H1.50008C1.32586%203%201.17525%203.06593%201.048%203.19789C0.920751%203.33%200.857178%203.48618%200.857178%203.66674C0.857178%203.84726%200.920751%204.00345%201.048%204.13545L5.54795%208.80197C5.67534%208.93393%205.82596%209%206.00003%209C6.17411%209%206.32486%208.93393%206.45201%208.80197L10.952%204.13541C11.0791%204.00345%2011.1429%203.84726%2011.1429%203.6667C11.1429%203.48618%2011.0791%203.33%2010.952%203.19789Z'%20fill='%231B1D1F'/%3e%3c/svg%3e",me=k.div`
  .listArea {
    min-height: 600px;
  }
  .flexContainer {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .listHeader {
    display: flex;
    margin: 0 5%;
    padding: 10px 0;
    @media (max-width: 784px) {
      flex-direction: column-reverse;
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
        background: url(${he}) no-repeat right 15px center;
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
        width: 15%;
        padding: 16px;
        cursor: pointer;
      }
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

  .table {
    width: 90%;
    margin: 0 5%;
    border-collapse: collapse;
    border: 1px solid #d9dadc;
    @media (max-width: 784px) {
      border: 0;
      border-top: 1px solid #4e5053;
      border-bottom: 1px solid #4e5053;
    }
    th {
      background: #fafafb;
    }
    th,
    .td {
      height: 40px;
      width: calc(25% / 4);
      font-weight: 400;
      text-align: center;
      border: 1px solid #d9dadc;
      @media (max-width: 784px) {
        display: none;
      }
      &:nth-child(3) {
        width: 62.5%;
      }
      &:nth-child(5),
      &:nth-child(4) {
        width: 12.5%;
      }
    }
    .head {
      @media (max-width: 784px) {
        display: none;
      }
    }
  }
  .listMenu {
    width: 100%;
    padding: 0px 20px;
    font-size: 14px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    @media (max-width: 784px) {
      padding: 0;
      border-bottom: 1px solid #4e5053;
      display: block;
    }
    .selected {
      width: 30%;
      font-weight: 700;
      padding: 20px 0;
      margin: 0;
      @media (max-width: 784px) {
        width: 100%;
      }
    }
    .items {
      width: 70%;
      display: flex;
      justify-content: end;
      @media (max-width: 784px) {
        width: 100%;
        justify-content: start;
      }
    }
    .item {
      cursor: pointer;
      display: flex;
      align-items: center;
      padding: 4px 8px;
      border: 1px solid #d9dadc;
      margin-left: 10px;
      border-radius: 5px;
      @media (max-width: 784px) {
        margin: 0 5px 10px 0;
      }
      span {
        margin-left: 5px;
      }
    }
    .process {
      margin-left: 10px;
      cursor: pointer;
      padding: 4px 8px;
      display: flex;
      align-items: center;
      color: #ffffff;
      background: #093c62;
      border-radius: 5px;
    }
  }
  .col {
    @media (max-width: 784px) {
      border-bottom: 1px solid #d9dadc;
      &:last-child {
        border-bottom: 1px solid #4e5053;
      }
    }
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
  .postTitle {
    cursor: pointer;
  }
  .red {
    color: #f00;
  }
`;function L({postList:t,inquiry:a=!1,total:l,pageNum:d,loadData:h,type:x}){function b(){const u=[],g=1+Math.floor((n-1)/5)*5;let w=g+4>=d?d:g+4;w===0&&(w+=1);for(let N=g;N<=w;N++)u.push(n===N?e.jsx("p",{className:"anchor circle",onClick:()=>{s(N)},children:N},N):e.jsx("p",{className:"anchor",onClick:()=>{s(N)},children:N},N));return u}const[n,s]=p.useState(1),[r,o]=p.useState(""),[i,f]=p.useState(new Set),{setForm:c,setUpdate:m,setSelectedId:v}=S(),y=n+"/"+(d>0?d:1),C=p.useRef("none");function F(){i.forEach(async u=>{j.delete(`/${x}/delete/${u}`).catch(g=>{alert("삭제에러"),window.location.reload()})})}async function _(){i.size===0&&alert("수정할 글을 선택해주세요");for(const u of i){const w=(await j.get(`/inquiry/${u}`)).data.data;j.patch("/inquiry/update",{data:{id:w.id,title:w.title,writer:w.writer,phone:w.phone,email:w.email,content:w.content,is_completed:!w.is_completed}})}alert("수정되었습니다"),window.location.reload()}return p.useEffect(()=>{h(C.current,n-1,r)},[n]),e.jsxs(me,{children:[e.jsxs("div",{className:"listArea",children:[e.jsxs("div",{className:"listHeader",children:[e.jsxs("div",{className:"left",children:[e.jsxs("p",{className:"total",children:["전체  ",e.jsxs("span",{className:"bold",children:[l,"건"]})]}),e.jsxs("p",{className:"curPage",children:["현재 페이지  ",y]})]}),e.jsxs("div",{className:"right",children:[e.jsxs("select",{onChange:u=>{C.current=u.target.value},children:[!a&&e.jsx("option",{value:"all",defaultChecked:!0,children:"전체"}),e.jsx("option",{value:"title",defaultChecked:a,children:"제목"}),!a&&e.jsx("option",{value:"content",children:"내용"})]}),e.jsx("input",{type:"text",className:"searchbar",placeholder:"검색어를 입력하세요",onChange:u=>{o(u.target.value)}}),e.jsx("p",{className:"search flexContainer",onClick:()=>{C.current==="none"&&(C.current="all"),h(C.current,n-1,r)},children:"검색"})]})]}),e.jsxs("table",{className:"table",children:[e.jsx("tr",{children:e.jsx("td",{colSpan:5,children:e.jsxs("div",{className:"listMenu",children:[e.jsxs("p",{className:"selected",children:[i.size,"개 선택됨"]}),e.jsxs("div",{className:"items",children:[e.jsxs("p",{className:"item",onClick:()=>{i.size===0?alert("삭제할 글을 선택해 주세요"):(F(),alert("삭제가 완료되었습니다"),window.location.reload())},children:[e.jsx(Z,{style:{color:"#FF2F00",fontSize:"18px"}}),e.jsx("span",{children:"삭제"})]}),a&&e.jsx("p",{className:"process",onClick:()=>{_()},children:e.jsx("span",{children:"처리 완료"})})]})]})})}),e.jsxs("tr",{className:"head",children:[e.jsx("th",{children:t.length>0&&e.jsx("input",{type:"checkbox",checked:i.size===t.length,onClick:()=>{if(i.size===t.length)for(const u of t)i.delete(u.id);else for(const u of t)i.add(u.id);f(new Set(i))}})}),e.jsx("th",{children:"번호"}),e.jsx("th",{children:"제목"}),e.jsx("th",{children:a?"처리상태":"조회수"}),e.jsx("th",{children:"등록일"})]}),t.map((u,g)=>e.jsxs("tr",{className:"col",children:[e.jsx("td",{className:"td",children:e.jsx("input",{type:"checkbox",className:"checkbox",checked:i.has(u.id),onClick:()=>{i.has(u.id)?i.delete(u.id):i.add(u.id),f(new Set(i))}})}),e.jsx("td",{className:"td",children:u.id}),e.jsx("td",{className:"td postTitle",onClick:()=>{v(u.id),c(!0),m(!0)},children:u.title}),a?e.jsx("td",{className:u.is_completed?"td":"td red",children:u.is_completed?"답변완료":"처리중"}):e.jsx("td",{className:"td",children:u.view}),e.jsx("td",{className:"td",children:u.create_at}),e.jsx("td",{className:"mobileaTd",children:e.jsxs("div",{children:[e.jsxs("p",{children:[" ",u.title]}),e.jsxs("p",{children:[" ",u.create_at]})]})})]},g)),t.length===0&&e.jsx("tr",{className:"empty"})]})]}),e.jsxs("div",{className:"paging",children:[e.jsx(Q,{className:"icon",onClick:()=>{s(n>=6?n-5:1)}}),e.jsx(Y,{className:"icon",onClick:()=>{s(n>1?n-1:1)}}),b(),e.jsx(W,{className:"icon",onClick:()=>{s(n<d?n+1:d)}}),e.jsx(ee,{className:"icon",onClick:()=>{s(n+5<=d?n+5:d)}})]})]})}function T(t){const a=t.split("T");return a[0].replaceAll("-","/")+" "+a[1].substring(0,5)}const ge=k.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #ffffff;
`;function ue(){const[t,a]=p.useState([]),[l,d]=p.useState(0),[h,x]=p.useState(0);function b(s,r,o){s==="none"?n("/notice/all?",r).catch(i=>{console.log(i)}):s==="all"?n(`/notice/search/all?title=${o}&content=${o}&`,r).catch(i=>{console.log(i)}):s==="title"?n(`/notice/search/title?title=${o}&`,r).catch(i=>{console.log(i)}):s==="content"&&n(`/notice/search/content?content=${o}&`,r).catch(i=>{console.log(i)})}async function n(s,r){const o=await j.get(`${s}page=${r}&size=10`);d(o.data.data.total),x(o.data.data.page);const i=[],f={id:0,title:"",view:0,src:"",create_at:" 2024-06-27T20:18:38.193332"};o.data.data.result.forEach(c=>{f.id=c.id,f.title=c.title,f.view=c.view,f.src=c.notice_img_list.length>0?c.notice_img_list[0].src:"",f.create_at=T(c.create_at),i.push({...f})}),a(i)}return e.jsxs(ge,{children:[e.jsx(M,{name:"공지사항",type:"notice"}),e.jsx(L,{postList:t,total:l,pageNum:h,type:"notice",loadData:b})]})}const we=k.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #ffffff;
`;function be(){const[t,a]=p.useState([]),[l,d]=p.useState(0),[h,x]=p.useState(0);function b(s,r,o){s==="none"?n("/newsletter/all?",r).catch(i=>{console.log(i)}):s==="all"?n(`/newsletter/search/all?title=${o}&content=${o}&`,r).catch(i=>{console.log(i)}):s==="title"?n(`/newsletter/search/title?title=${o}&`,r).catch(i=>{console.log(i)}):s==="content"&&n(`/newsletter/search/content?content=${o}&`,r).catch(i=>{console.log(i)})}async function n(s,r){const o=await j.get(`${s}page=${r}&size=10`);d(o.data.data.total),x(o.data.data.page);const i=[],f={id:0,title:"",view:0,src:"",create_at:" 2024-06-27T20:18:38.193332"};o.data.data.result.forEach(c=>{f.id=c.id,f.title=c.title,f.view=c.view,f.src=c.newsletter_img_list.length>0?c.newsletter_img_list[0].src:"",f.create_at=T(c.create_at),i.push({...f})}),a(i)}return e.jsxs(we,{children:[e.jsx(M,{name:"뉴스레터",type:"newsletter"}),e.jsx(L,{postList:t,total:l,pageNum:h,type:"newsletter",loadData:b})]})}const je=k.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #ffffff;
`;function ve(){const[t,a]=p.useState([]),[l,d]=p.useState(0),[h,x]=p.useState(0);function b(s,r,o){s==="none"?n("/event/all?",r).catch(i=>{console.log(i)}):s==="all"?n(`/event/search/all?title=${o}&content=${o}&`,r).catch(i=>{console.log(i)}):s==="title"?n(`/event/search/title?title=${o}&`,r).catch(i=>{console.log(i)}):s==="content"&&n(`/event/search/content?content=${o}&`,r).catch(i=>{console.log(i)})}async function n(s,r){const o=await j.get(`${s}page=${r}&size=10`);d(o.data.data.total),x(o.data.data.page);const i=[],f={id:0,title:"",view:0,src:"",create_at:" 2024-06-27T20:18:38.193332"};o.data.data.result.forEach(c=>{f.id=c.id,f.title=c.title,f.view=c.view,f.src=c.event_img_list.length>0?c.event_img_list[0].src:"",f.create_at=T(c.create_at),i.push({...f})}),a(i)}return e.jsxs(je,{children:[e.jsx(M,{name:"행사 앨범",type:"event"}),e.jsx(L,{postList:t,total:l,pageNum:h,type:"event",loadData:b})]})}const Ne=k.div`
  .listHeader {
    width: 90%;
    display: flex;
    align-items: center;
    margin: 0 5%;
    .name {
      font-size: 20px;
      font-weight: 700;
      margin-right: 20px;
    }
    .item {
      cursor: pointer;
      display: flex;
      align-items: center;
      padding: 4px 8px;
      border: 1px solid #d9dadc;
      margin-left: 5px;
      border-radius: 4px;
      @media (max-width: 784px) {
        margin-left: 0px;
        margin-right: 5px;
      }
      span {
        margin-left: 5px;
      }

      &:hover {
        font-weight: 700;
        background: #3d69dd;
        border: 1px solid #3d69dd;
        color: #ffffff;
      }
    }
  }

  .postForm {
    width: calc(100% + 30px);
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    padding: 20vh 0;
    top: ${t=>t.form?"0":"-100vh"};
    opacity: ${t=>t.form?"1":"0"};
    left: -30px;
    transition: 0.5s opacity;
    z-index: 3;
    box-sizing: border-box;
  }
  .background {
    position: fixed;
    width: 100vw;
    height: 100vh;
    background: #00000066;
    left: 0;
    top: 0;
    z-index: 4;
    display: ${t=>t.form?"block":"none"};
  }
  .form {
    background-color: #ffffff;
    width: 40%;
    max-height: 94vh;
    border: 1px solid #f1f1f4;
    box-shadow:
      rgba(0, 0, 0, 0.2) 0px 12px 28px 0px,
      rgba(0, 0, 0, 0.1) 0px 2px 4px 0px,
      rgba(255, 255, 255, 0.05) 0px 0px 0px 1px inset;
    overflow-y: auto;
    overflow-x: hidden;
    z-index: 5;
    border-radius: 8px;
  }

  .flexContainer {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .formHeader {
    width: 90%;
    padding: 10px 5%;
    border-bottom: 1px solid #f1f1f4;
    .name {
      width: 80%;
      margin-left: 10%;
      font-weight: 600;
      font-size: 20px;
      color: #252f4a;
    }
    .icon {
      width: 10%;
      font-size: 20px;
      color: #99a1b7;
      cursor: pointer;
    }
  }
  .formContainer {
    padding: 20px 5%;
    width: 90%;
  }

  .text {
    font-weight: 700;
    color: #252f4a;
  }
  #file {
    display: none;
  }
  .fileLabel {
    width: 80px;
    display: flex;
    justify-content: center;
    padding: 2px;
    border: 1px solid #9ea0a3;
    background: #dfdfe0;
    border-radius: 3px;
    font-size: 14px;
    @media (max-width: 784px) {
      font-size: 12px;
    }
  }
  .fileInfo {
    font-size: 16px;
    font-weight: 700;
    @media (max-width: 784px) {
      font-size: 12px;
    }
  }

  .fileName {
    width: 90%;
    color: #252f4a;
    font-weight: 400;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 14px;
    @media (max-width: 784px) {
      font-size: 12px;
    }
  }

  .register {
    width: 90%;
    margin: 50px 5%;
    padding: 20px 0;
    color: #ffffff;
    background: #0d6efd;
    font-size: 18px;
    font-weight: 700;
    border-radius: 8px;
    box-sizing: border-box;
    cursor: pointer;
    border: 2px solid #0d6efd;
    @media (max-width: 784px) {
      font-size: 12px;
    }
    &:hover {
      color: #0d6efd;
      background: #ffffff;
    }
  }
  .fileInfo {
    display: flex;
    align-items: center;
    .icon {
      cursor: pointer;
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
  .fileLimit {
    width: 90%;
    margin: 20px 5%;
    font-weight: 700;
  }
`;function ke(){const[t,a]=p.useState(""),{form:l,setForm:d,update:h,setUpdate:x,selectedId:b}=S(),n=p.useRef(new FormData),[s,r]=p.useState({title:"",content:""});async function o(){const m=await j.post("/article",{data:{...s}});if(t.length>0){const v=m.data.data.id,y=await j.post(`/img-file/upload?dir=article/${v}`,n.current,{headers:{"Content-Type":"multipart/form-data"}});await j.patch("/article/update",{data:{...s,src:y.data.data[0],id:v}});return}}async function i(){const m={...s};if(t!==""&&(m.src=t),n.current.has("multipartFile")){const v=await j.post(`/img-file/upload?dir=article/${b}`,n.current,{headers:{"Content-Type":"multipart/form-data"}});m.src=`/help-call-files/${v.data.data[0]}`}await j.patch("/article/update",{data:{...m}})}async function f(){const v=(await j.get(`/article/${b}`)).data.data;r({id:v.id,title:v.title,content:v.content}),a(v.src===null?"":v.src)}function c(){h?i().then(()=>{alert("수정되었습니다"),d(!1),x(!1),window.location.reload()}):o().then(()=>{alert("등록되었습니다"),d(!1),x(!1),window.location.reload()})}return p.useEffect(()=>{h?f():r({title:"",content:""})},[h]),p.useEffect(()=>{l||(a(""),r({title:"",content:""}))},[l]),e.jsxs(Ne,{form:l,children:[e.jsxs("div",{className:"listHeader",children:[e.jsx("p",{className:"name",children:"언론보도"}),e.jsxs("p",{className:"item",onClick:()=>{d(!0),x(!1)},children:[e.jsx(B,{}),e.jsx("span",{children:"글쓰기"})]})]}),e.jsxs("div",{className:"postForm",children:[e.jsx("div",{className:"background",onClick:()=>{d(!1),x(!1)}}),e.jsxs("div",{className:"form",children:[e.jsxs("div",{className:"formHeader flexContainer",children:[e.jsx("p",{className:"name flexContainer",children:"언론보도"}),e.jsx($,{className:"icon flexContainer",onClick:()=>{d(!1),x(!1)}})]}),e.jsxs("div",{className:"formContainer",children:[e.jsx(z,{title:"제목",width:"90%",data:s,setData:r,type:"title"}),e.jsx(D,{title:"내용",width:"90%",height:"300px",data:s,setData:r,type:"content"}),e.jsx("p",{className:"text",children:"파일"}),e.jsx("input",{type:"file",id:"file",accept:"image/*",onChange:m=>{if(m.target.files!==null&&m.target.files.length>0){if(!/(.*?)\.(jpg|jpeg|png|gif|bmp)$/.test(m.target.files[0].name)){alert("이미지 파일만 등록이 가능합니다");return}const v=m.target.files[0].size/1048576;if(v>10){alert("파일크기가 10MB를 초과합니다");return}n.current.delete("multipartFile"),a(`${m.target.files[0].name} (${Math.round(v*100)/100}MB)`),n.current.append("multipartFile",m.target.files[0])}}}),e.jsx("label",{htmlFor:"file",className:"fileLabel",children:"파일 선택"}),t.length>0&&e.jsxs("div",{className:"fileInfo",children:[e.jsx("p",{className:"fileName",children:t}),e.jsx($,{className:"icon flexContainer",onClick:()=>{n.current.delete("multipartFile"),a("")}})]})]}),e.jsx("p",{className:"fileLimit",children:"이미지 파일만 업로드 가능합니다"}),e.jsx("p",{className:"register flexContainer",onClick:()=>{c()},children:"등록"})]})]})]})}const ye=k.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #ffffff;
`;function Ce(){const[t,a]=p.useState([]),[l,d]=p.useState(0),[h,x]=p.useState(0);function b(s,r,o){s==="none"?n("/article/all?",r).catch(i=>{console.log(i)}):s==="all"?n(`/article/search/all?title=${o}&content=${o}&`,r).catch(i=>{console.log(i)}):s==="title"?n(`/article/search/title?title=${o}&`,r).catch(i=>{console.log(i)}):s==="content"&&n(`/article/search/content?content=${o}&`,r).catch(i=>{console.log(i)})}async function n(s,r){const o=await j.get(`${s}page=${r}&size=10`);d(o.data.data.total),x(o.data.data.page);const i=[];o.data.data.result.forEach(f=>{f.create_at=f.create_at.split("T")[0].replaceAll("-","/"),i.push(f)}),a(i)}return e.jsxs(ye,{children:[e.jsx(ke,{}),e.jsx(L,{postList:t,total:l,pageNum:h,type:"article",loadData:b})]})}const ze=k.div`
  .listHeader {
    width: 90%;
    display: flex;
    align-items: center;
    margin: 0 5%;
    .name {
      font-size: 20px;
      font-weight: 700;
      margin-right: 20px;
    }
    .item {
      cursor: pointer;
      display: flex;
      align-items: center;
      padding: 4px 8px;
      border: 1px solid #d9dadc;
      margin-left: 5px;
      border-radius: 4px;
      @media (max-width: 784px) {
        margin-left: 0px;
        margin-right: 5px;
      }
      span {
        margin-left: 5px;
      }

      &:hover {
        font-weight: 700;
        background: #3d69dd;
        border: 1px solid #3d69dd;
        color: #ffffff;
      }
    }
  }

  .postForm {
    width: calc(100% + 30px);
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    padding: 20vh 0;
    top: ${t=>t.form?"0":"-100vh"};
    opacity: ${t=>t.form?"1":"0"};
    left: -30px;
    transition: 0.5s opacity;
    z-index: 3;
    box-sizing: border-box;
  }
  .background {
    position: fixed;
    width: 100vw;
    height: 100vh;
    background: #00000066;
    left: 0;
    top: 0;
    z-index: 4;
    display: ${t=>t.form?"block":"none"};
  }
  .form {
    background-color: #ffffff;
    width: 40%;
    max-height: 94vh;
    border: 1px solid #f1f1f4;
    box-shadow:
      rgba(0, 0, 0, 0.2) 0px 12px 28px 0px,
      rgba(0, 0, 0, 0.1) 0px 2px 4px 0px,
      rgba(255, 255, 255, 0.05) 0px 0px 0px 1px inset;
    overflow-y: auto;
    overflow-x: hidden;
    z-index: 5;
    border-radius: 8px;
  }

  .flexContainer {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .formHeader {
    width: 90%;
    padding: 10px 5%;
    border-bottom: 1px solid #f1f1f4;
    .name {
      width: 80%;
      margin-left: 10%;
      font-weight: 600;
      font-size: 20px;
      color: #252f4a;
    }
    .icon {
      width: 10%;
      font-size: 20px;
      color: #99a1b7;
      cursor: pointer;
    }
  }
  .formContainer {
    padding: 20px 5%;
    width: 90%;
  }

  .text {
    font-weight: 700;
    color: #252f4a;
  }
  #file {
    display: none;
  }
  .fileLabel {
    width: 80px;
    display: flex;
    justify-content: center;
    padding: 2px;
    border: 1px solid #9ea0a3;
    background: #dfdfe0;
    border-radius: 3px;
    font-size: 14px;
    @media (max-width: 784px) {
      font-size: 12px;
    }
  }
  .fileInfo {
    font-size: 16px;
    font-weight: 700;
    @media (max-width: 784px) {
      font-size: 12px;
    }
  }

  .fileName {
    width: 90%;
    color: #252f4a;
    font-weight: 400;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 14px;
    @media (max-width: 784px) {
      font-size: 12px;
    }
  }

  .register {
    width: 90%;
    margin: 50px 5%;
    padding: 20px 0;
    color: #ffffff;
    background: #0d6efd;
    font-size: 18px;
    font-weight: 700;
    border-radius: 8px;
    box-sizing: border-box;
    cursor: pointer;
    border: 2px solid #0d6efd;
    @media (max-width: 784px) {
      font-size: 12px;
    }
    &:hover {
      color: #0d6efd;
      background: #ffffff;
    }
  }
  .fileInfo {
    display: flex;
    align-items: center;
    .icon {
      cursor: pointer;
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
  .radio {
    display: none;
  }
  .radioArea {
    display: flex;
    justify-content: space-between;
  }
  .label {
    cursor: pointer;
    width: 47%;
    padding: 15px 0;
    border-radius: 8px;
    background: #f9fafc;
    color: #485675;
    font-size: 14px;
    transition: 0.3s;
  }
  .radio:checked + .label {
    background: #007cff;
    color: #ffffff;
  }
`;function $e(){const{form:t,setForm:a,setUpdate:l,selectedId:d}=S(),[h,x]=p.useState({title:"",content:"",writer:"",phone:"",email:""}),[b,n]=p.useState([]),[s,r]=p.useState(!1),o=c=>{j.get(c,{responseType:"blob"}).then(m=>{const v=window.URL.createObjectURL(new Blob([m.data])),y=document.createElement("a");y.href=v,y.download=c,document.body.appendChild(y),y.click(),window.URL.revokeObjectURL(v),document.body.removeChild(y)}).catch(m=>{console.error("파일 다운로드 오류:",m)})};function i(){j.patch("/inquiry/update",{data:{...h,is_completed:s}}).then(()=>{a(!1),l(!1),alert("수정되었습니다"),window.location.reload()})}async function f(){const c=await j.get(`/inquiry/${d}`),m=c.data.data;x({id:m.id,title:m.title,content:m.content,writer:m.writer,phone:m.phone,email:m.email}),r(m.isCompleted),n([...c.data.data.inquiry_img_list])}return p.useEffect(()=>{t&&f()},[t]),e.jsxs(ze,{form:t,children:[e.jsx("div",{className:"listHeader",children:e.jsx("p",{className:"name",children:"문의글"})}),e.jsxs("div",{className:"postForm",children:[e.jsx("div",{className:"background",onClick:()=>{a(!1),l(!1)}}),e.jsxs("div",{className:"form",children:[e.jsxs("div",{className:"formHeader flexContainer",children:[e.jsx("p",{className:"name flexContainer",children:"문의글"}),e.jsx($,{className:"icon flexContainer",onClick:()=>{a(!1),l(!1)}})]}),e.jsxs("div",{className:"formContainer",children:[e.jsx(z,{title:"제목",width:"90%",data:h,setData:x,type:"title",disabled:!0}),e.jsx("p",{className:"text",children:"처리상태"}),e.jsxs("div",{className:"radioArea",children:[e.jsx("input",{type:"radio",defaultChecked:!s,className:"radio",id:"radio1",name:"isCompleted",onChange:()=>{r(!1)}}),e.jsx("label",{className:"label flexContainer",htmlFor:"radio1",children:"처리중"}),e.jsx("input",{type:"radio",defaultChecked:s,className:"radio",id:"radio2",name:"isCompleted",onChange:()=>{r(!0)}}),e.jsx("label",{className:"label flexContainer",htmlFor:"radio2",children:"처리 완료"})]}),e.jsx(z,{title:"작성자",width:"90%",data:h,setData:x,type:"writer",disabled:!0}),e.jsx(z,{title:"휴대전화",width:"90%",data:h,setData:x,type:"phone",disabled:!0}),e.jsx(z,{title:"이메일",width:"90%",data:h,setData:x,type:"email",disabled:!0}),e.jsx(D,{title:"내용",width:"90%",height:"300px",data:h,setData:x,type:"content",disabled:!0}),e.jsx("p",{className:"text",children:"파일"}),b.map((c,m)=>e.jsxs("div",{className:"fileInfo",children:[e.jsx("p",{className:"fileName",children:c.src}),e.jsx(K,{className:"icon",onClick:()=>{o(c.src)}})]},m))]}),e.jsx("p",{className:"register flexContainer",onClick:()=>{i()},children:"수정"})]})]})]})}const Le=k.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #ffffff;
`;function Se(){const[t,a]=p.useState([]),[l,d]=p.useState(0),[h,x]=p.useState(0);function b(s,r,o){s==="none"?n("/inquiry/all?",r).catch(i=>{console.log(i)}):s==="title"&&n(`/inquiry/search/title?title=${o}&`,r).catch(i=>{console.log(i)})}async function n(s,r){const o=await j.get(`${s}page=${r}&size=10`);d(o.data.data.total),x(o.data.data.page);const i=[],f={id:-1,title:"공지사항 제목",src:"",create_at:"2020/04/05",view:1e3};o.data.data.result.forEach(c=>{c.create_at=c.create_at.split("T")[0],f.id=c.id,f.title=c.title,f.is_completed=c.is_completed,f.create_at=c.create_at.split("T")[0].replaceAll("-","/"),i.push({...f})}),a(i)}return e.jsxs(Le,{children:[e.jsx($e,{}),e.jsx(L,{postList:t,inquiry:!0,total:l,pageNum:h,type:"inquiry",loadData:b})]})}const Fe=k.div`
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: #ffffff;
  color: #000000;
  font-family: "Rubik", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", sans-serif;
  /* 블로그가 다크 테마면 :root 의 color-scheme: dark 때문에
     스타일을 따로 주지 않은 input 이 검게 칠해진다. 이 앱은 흰 화면 기준이다. */
  color-scheme: light;

  input,
  textarea,
  select {
    color-scheme: light;
    background-color: #ffffff;
    color: #000000;
  }

  input::placeholder,
  textarea::placeholder {
    color: #00000066;
  }
`,_e=k.div`
  padding: 40px;

  h1 {
    margin: 0 0 12px 0;
    font-size: 26px;
    color: #222222;
  }
  p {
    margin: 6px 0;
    font-size: 15px;
    line-height: 1.7;
    color: #666666;
  }
`;function Ie(){return e.jsxs(_e,{children:[e.jsx("h1",{children:"어드민 CMS"}),e.jsx("p",{children:"동행하는 사람들 홈페이지의 게시판을 관리하는 운영자 화면입니다."}),e.jsx("p",{children:"왼쪽 메뉴에서 행사앨범 · 언론보도 · 뉴스레터 · 공지사항을 등록·수정·삭제할 수 있고, 문의 게시판에서는 답변 처리 상태를 바꿀 수 있습니다."}),e.jsx("p",{children:"이 데모의 변경 사항은 브라우저에만 저장됩니다."})]})}function He(){const t={"/":e.jsx(Ie,{}),"/article":e.jsx(Ce,{}),"/notice":e.jsx(ue,{}),"/inquiry":e.jsx(Se,{}),"/newsletter":e.jsx(be,{}),"/event":e.jsx(ve,{})},a=U(l=>l.isLogin);return e.jsxs(Fe,{children:[e.jsx(te,{label:"동행하는 사람들 어드민 CMS"}),a?e.jsx(V,{children:Object.keys(t).map((l,d)=>e.jsx(J,{path:l,element:e.jsx(fe,{element:t[l]})},d))}):e.jsx(se,{})]})}export{He as default};
