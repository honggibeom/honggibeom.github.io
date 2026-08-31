import{G as T,j as e,d as w,m as z,r as d,L as k,c as E,h as P,i as O,f as Z,g as M}from"./index-gACinlY5.js";import{a as H,b as W,c as _}from"./index-DgYSHf52.js";import{F as D}from"./index-yoXnnBC-.js";import{D as G}from"./DemoBanner-CJXHj5Xz.js";function F(a){return T({attr:{viewBox:"0 0 256 256",fill:"currentColor"},child:[{tag:"path",attr:{d:"M248,114H219.06L171,47.77a14,14,0,0,0-22.16-.61L135.93,62.08a1.15,1.15,0,0,0-.14.17,10,10,0,0,1-15.58,0,1.15,1.15,0,0,0-.14-.17L107.2,47.16A14,14,0,0,0,85,47.77L36.94,114H8a6,6,0,0,0,0,12H248a6,6,0,0,0,0-12ZM94.75,54.82a2,2,0,0,1,3.15-.07l.15.17,12.86,14.92A21.88,21.88,0,0,0,128,78h0a21.88,21.88,0,0,0,17.09-8.16L158,54.92l.15-.17a2,2,0,0,1,3.15.07l43,59.18H51.77ZM180,146a34,34,0,0,0-33.94,32H109.94a34,34,0,1,0-1.44,12h39A34,34,0,1,0,180,146ZM76,202a22,22,0,1,1,22-22A22,22,0,0,1,76,202Zm104,0a22,22,0,1,1,22-22A22,22,0,0,1,180,202Z"},child:[]}]})(a)}const t={bg:"#0b0f14",bgTranslucent:"rgba(11, 15, 20, 0.92)",surface:"#131a22",surfaceHi:"#1a222c",border:"#243040",text:"#e6edf3",textMuted:"#9aa7b4",textDim:"#68757f",accent:"#38bdf8",accentStrong:"#7dd3fc",accentSoft:"rgba(56, 189, 248, 0.12)",danger:"#f87171",ok:"#4dd0b1",radius:"14px"},K=w.div`
  width: 100%;
  max-width: 260px;
  margin: 0 auto;

  svg {
    display: block;
    width: 100%;
    height: auto;
  }

  .track {
    stroke: ${t.border};
  }
  .arc {
    stroke: ${t.danger};
    transition: stroke-dasharray 0.6s ease;
  }
  .value {
    fill: ${t.text};
    font-size: 19px;
    font-weight: 700;
  }
  .caption {
    fill: ${t.textDim};
    font-size: 8.5px;
    letter-spacing: 0.08em;
  }

  .legend {
    display: flex;
    justify-content: center;
    gap: 18px;
    margin-top: 14px;
    font-size: 12.5px;
    color: ${t.textMuted};
  }
  .legend span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .legend i {
    width: 9px;
    height: 9px;
    border-radius: 3px;
    background: ${t.danger};
  }
  .legend .real i {
    background: ${t.border};
  }
`;function X({ratio:a=0,label:i="FAKE"}){const r=Math.min(100,Math.max(0,Number(a)||0)),o=42,n=2*Math.PI*o,s=n*r/100;return e.jsxs(K,{children:[e.jsxs("svg",{viewBox:"0 0 100 100",role:"img","aria-label":`딥페이크 비율 ${r.toFixed(1)}%`,children:[e.jsx("circle",{className:"track",cx:"50",cy:"50",r:o,fill:"none",strokeWidth:"10"}),e.jsx("circle",{className:"arc",cx:"50",cy:"50",r:o,fill:"none",strokeWidth:"10",strokeLinecap:r>0&&r<100?"round":"butt",strokeDasharray:`${s} ${n-s}`,transform:"rotate(-90 50 50)"}),e.jsxs("text",{className:"value",x:"50",y:"47",textAnchor:"middle",dominantBaseline:"middle",children:[r.toFixed(1),"%"]}),e.jsx("text",{className:"caption",x:"50",y:"63",textAnchor:"middle",children:i})]}),e.jsxs("div",{className:"legend",children:[e.jsxs("span",{children:[e.jsx("i",{}),"딥페이크"]}),e.jsxs("span",{className:"real",children:[e.jsx("i",{}),"정상"]})]})]})}const Q=z`
  to { transform: rotate(360deg); }
`,Y=z`
  0%, 100% { transform: scale(0.75); opacity: 0.45; }
  50% { transform: scale(1); opacity: 1; }
`,q=z`
  0% { top: 10%; opacity: 0; }
  15% { opacity: 1; }
  85% { opacity: 1; }
  100% { top: 90%; opacity: 0; }
`,J=z`
  0%, 60%, 100% { opacity: 0.2; }
  30% { opacity: 1; }
`,V=w.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  padding: 28px 0;

  .ring {
    position: relative;
    width: ${a=>a.$size}px;
    height: ${a=>a.$size}px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .ring::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 2px solid ${t.border};
  }

  .arc {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 2px solid transparent;
    border-top-color: ${t.accent};
    border-right-color: ${t.accentStrong};
    animation: ${Q} 1.1s linear infinite;
  }

  .arc.inner {
    inset: 12px;
    border-top-color: transparent;
    border-right-color: transparent;
    border-bottom-color: ${t.accentSoft};
    border-left-color: ${t.accent};
    animation-duration: 1.7s;
    animation-direction: reverse;
  }

  .core {
    width: 22%;
    height: 22%;
    border-radius: 50%;
    background: ${t.accent};
    box-shadow: 0 0 18px ${t.accent};
    animation: ${Y} 1.4s ease-in-out infinite;
  }

  .line {
    position: absolute;
    left: 14%;
    right: 14%;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      ${t.accentStrong},
      transparent
    );
    animation: ${q} 1.8s ease-in-out infinite;
  }

  .label {
    display: flex;
    align-items: baseline;
    gap: 1px;
    margin: 0;
    font-size: 14px;
    letter-spacing: 0.01em;
    color: ${t.textMuted};
  }
  .label .dot {
    animation: ${J} 1.4s ease-in-out infinite;
  }
  .label .dot:nth-child(3) {
    animation-delay: 0.2s;
  }
  .label .dot:nth-child(4) {
    animation-delay: 0.4s;
  }

  @media (prefers-reduced-motion: reduce) {
    .arc,
    .core,
    .line,
    .label .dot {
      animation: none;
    }
    .line {
      display: none;
    }
  }
`;function I({label:a="분석 중",size:i=92}){return e.jsxs(V,{$size:i,children:[e.jsxs("div",{className:"ring",children:[e.jsx("span",{className:"arc"}),e.jsx("span",{className:"arc inner"}),e.jsx("span",{className:"line"}),e.jsx("span",{className:"core"})]}),a&&e.jsxs("p",{className:"label",children:[e.jsx("span",{children:a}),e.jsx("span",{className:"dot",children:"."}),e.jsx("span",{className:"dot",children:"."}),e.jsx("span",{className:"dot",children:"."})]})]})}const S=a=>new Promise(i=>setTimeout(i,a));function v(a){let i=0;for(let r=0;r<a.length;r+=1)i=i*31+a.charCodeAt(r)>>>0;return i}const ee=["fake","deep","swap","gan","gen","ai","sd","midj"],te=["real","orig","raw","cam","photo","img_"];function ae(a){const i=(a.name||"").toLowerCase(),r=v(`${i}:${a.size}`);if(ee.some(n=>i.includes(n)))return .55+r%36/100;if(te.some(n=>i.includes(n)))return 0;const o=r%100;return o<45?0:.18+(o-45)/55*.68}function ne(a,i){const r=v(`${a.name}:${a.size}:frames`),o=32+r%17,n=Math.round(o*i),s=n>0?r%Math.max(1,o-n):0;return Array.from({length:o},(l,h)=>h>=s&&h<s+n)}async function re(a,i){const r=Date.now(),o=ae(a);if(i==="video"){await S(1500+v(a.name)%900);const s=ne(a,o),l=s.filter(Boolean).length;return{data:s,fake:l,real:s.length-l,elapsed:Date.now()-r}}await S(900+v(a.name)%600);const n=Math.round(o*100);return{data:[],fake:n,real:100-n,elapsed:Date.now()-r}}async function ie(a){const i=Date.now(),r=URL.createObjectURL(a);try{const o=await new Promise((p,j)=>{const f=new Image;f.onload=()=>p(f),f.onerror=()=>j(new Error("이미지를 불러오지 못했습니다.")),f.src=r}),s=Math.min(1,1280/Math.max(o.width,o.height)),l=Math.max(1,Math.round(o.width*s)),h=Math.max(1,Math.round(o.height*s)),c=document.createElement("canvas");c.width=l,c.height=h;const m=c.getContext("2d");m.drawImage(o,0,0,l,h);const u=m.getImageData(0,0,l,h),x=u.data;let g=v(`${a.name}:${a.size}`)||1;for(let p=0;p<x.length;p+=4){g^=g<<13,g^=g>>>17,g^=g<<5,g>>>=0;const j=g%13-6|0;x[p]=Math.min(255,Math.max(0,x[p]+j)),x[p+1]=Math.min(255,Math.max(0,x[p+1]-j)),x[p+2]=Math.min(255,Math.max(0,x[p+2]+j))}return m.putImageData(u,0,0),await S(700),{data:c.toDataURL("image/jpeg",.92),elapsed:Date.now()-i}}finally{URL.revokeObjectURL(r)}}const oe=w.div`
  width: 100%;
  min-height: 100%;
  box-sizing: border-box;
  padding: 48px 20px 80px 20px;

  .main {
    width: 100%;
    max-width: 760px;
    margin: 0 auto;
  }

  .container {
    margin-bottom: 32px;
    .title {
      margin: 0 0 10px 0;
      font-size: 30px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: ${t.text};
    }
    .explain {
      margin: 0;
      font-size: 15px;
      line-height: 1.7;
      color: ${t.textMuted};
    }
  }

  #file {
    display: none;
  }
  #label1 {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 70px 20px;
    box-sizing: border-box;
    border: 1px dashed ${t.border};
    border-radius: ${t.radius};
    background: ${t.surface};
    cursor: pointer;
    transition: border-color 0.2s ease, background 0.2s ease;
    .imgAdd {
      font-size: 42px;
      color: ${t.accent};
    }
    .inputContainer {
      text-align: center;
    }
    .addText {
      margin: 14px 0 0 0;
      font-size: 15px;
      color: ${t.textMuted};
    }
    .addHint {
      margin: 6px 0 0 0;
      font-size: 13px;
      color: ${t.textDim};
    }
  }
  #label1:hover {
    border-color: ${t.accent};
    background: ${t.surfaceHi};
  }

  .mediaHead {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 8px 12px;
    margin: 0 0 12px 0;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 11px;
    border-radius: 999px;
    font-size: 12.5px;
    font-weight: 600;
    color: ${t.accentStrong};
    background: ${t.accentSoft};
  }
  .badge.frame {
    color: ${t.ok};
    background: rgba(77, 208, 177, 0.12);
  }
  .badge.frame.fake {
    color: ${t.danger};
    background: rgba(248, 113, 113, 0.12);
  }

  .media {
    display: block;
    width: 100%;
    max-height: 520px;
    border-radius: ${t.radius};
    border: 1px solid ${t.border};
    margin: 0 0 24px 0;
    box-sizing: border-box;
    background: #000000;
  }
  img.media {
    object-fit: contain;
  }

  .resultContainer {
    width: 100%;
    margin: 0 0 16px 0;
    padding: 32px 24px;
    box-sizing: border-box;
    border: 1px solid ${t.border};
    border-radius: ${t.radius};
    background: ${t.surface};
    text-align: center;

    .result {
      margin: 22px 0 0 0;
      font-size: 18px;
      font-weight: 600;
      line-height: 1.6;
      color: ${t.text};
    }
    .time {
      margin: 8px 0 0 0;
      font-size: 13px;
      color: ${t.textDim};
    }
    .error {
      margin: 0;
      font-size: 15px;
      color: ${t.danger};
    }
  }

  .actions {
    display: flex;
    gap: 10px;
  }

  .home {
    flex: 1;
    margin: 0;
    padding: 14px 0;
    text-align: center;
    font-size: 15px;
    font-weight: 600;
    border-radius: 10px;
    border: 1px solid ${t.border};
    background: ${t.surface};
    color: ${t.textMuted};
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .home:hover {
    border-color: ${t.accent};
    color: ${t.accentStrong};
  }

  .link {
    flex: 1;
    text-decoration: none;
  }

  @media only screen and (min-width: 860px) {
    padding: 72px 32px 100px 32px;
    .container .title {
      font-size: 34px;
    }
  }
`,se=10*1024*1024;function ce(){const[a,i]=d.useState("#"),[r,o]=d.useState("video"),[n,s]=d.useState("idle"),[l,h]=d.useState(0),[c,m]=d.useState({data:[],real:0,fake:0}),[u,x]=d.useState(0),[g,p]=d.useState(!1),j=d.useRef(null);d.useEffect(()=>()=>{j.current&&URL.revokeObjectURL(j.current)},[]);const f=r==="image",L=f?"사진":"영상";async function U(y){const b=y.target.files[0];if(!b)return;if(b.size>se){alert("업로드 가능한 최대 용량은 10MB입니다. "),y.target.value="";return}const N=b.type.startsWith("video/")?"video":b.type.startsWith("image/")?"image":"";if(!N){alert("사진 또는 영상 파일만 업로드할 수 있습니다."),y.target.value="";return}const C=URL.createObjectURL(b);j.current=C,o(N),i(C),s("loading");try{const $=await re(b,N);m({data:$.data,fake:$.fake,real:$.real}),h($.elapsed);const A=$.fake+$.real;x(A>0?$.fake/A*100:0),s("done")}catch{s("error")}}function B(y){const b=y.target;if(!c.data.length||!b.duration)return;const N=Math.floor(b.currentTime/b.duration*c.data.length);p(!!c.data[Math.min(N,c.data.length-1)])}return e.jsx(oe,{children:e.jsxs("div",{className:"main",children:[e.jsxs("div",{className:"container",children:[e.jsx("p",{className:"title",children:"딥페이크 탐지"}),e.jsx("p",{className:"explain",children:"x-exception 방식을 통해 사진과 영상의 딥페이크 여부를 구분합니다. 영상은 프레임 단위로, 사진은 이미지 한 장을 기준으로 분석합니다."})]}),a==="#"?e.jsxs(e.Fragment,{children:[e.jsx("input",{type:"file",id:"file",accept:"image/*,video/*",onChange:U}),e.jsx("label",{htmlFor:"file",id:"label1",children:e.jsxs("div",{className:"inputContainer",children:[e.jsx(H,{className:"imgAdd"}),e.jsx("p",{className:"addText",children:"사진 또는 영상 선택"}),e.jsx("p",{className:"addHint",children:"최대 10MB · 브라우저 밖으로 전송되지 않습니다"})]})})]}):e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"mediaHead",children:[e.jsx("span",{className:"badge",children:f?"사진 분석":"영상 분석"}),!f&&n==="done"&&c.data.length>0&&e.jsxs("span",{className:`badge frame${g?" fake":""}`,children:["현재 프레임 · ",g?"조작 의심":"정상"]})]}),f?e.jsx("img",{src:a,className:"media",alt:"분석 대상 이미지"}):e.jsx("video",{controls:!0,className:"media",autoPlay:!0,muted:!0,loop:!0,playsInline:!0,preload:"auto",src:a,onTimeUpdate:B}),e.jsxs("div",{className:"resultContainer",children:[n==="loading"&&e.jsx(I,{label:`${L} 분석 중`}),n==="error"&&e.jsx("p",{className:"error",children:"분석에 실패했습니다. 다른 파일로 다시 시도해 주세요."}),n==="done"&&e.jsxs(e.Fragment,{children:[e.jsx(X,{ratio:u}),u===0?e.jsxs("p",{className:"result",children:["해당 ",L,"은 딥페이크가 아닙니다."]}):f?e.jsxs("p",{className:"result",children:["해당 사진은 ",u.toFixed(1),"% 확률로 딥페이크로 판별되었습니다."]}):e.jsxs("p",{className:"result",children:["전체 ",c.data.length,"개 프레임 중 ",c.fake,"개(",u.toFixed(1),"%)가 딥페이크로 판별되었습니다."]}),e.jsxs("p",{className:"time",children:[l,"ms 소요됨"]})]})]}),e.jsxs("div",{className:"actions",children:[e.jsx("p",{className:"home",onClick:()=>{window.location.reload()},children:"다시 시도"}),e.jsx(k,{to:"/deepfake-detection",className:"link",children:e.jsx("p",{className:"home",children:"홈으로"})})]})]})]})})}const de=w.div`
  width: 100%;
  min-height: 100%;
  box-sizing: border-box;
  padding: 48px 20px 80px 20px;

  .main {
    width: 100%;
    max-width: 760px;
    margin: 0 auto;
  }

  .container {
    margin-bottom: 32px;
    .title {
      margin: 0 0 10px 0;
      font-size: 30px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: ${t.text};
    }
    .explain {
      margin: 0 0 10px 0;
      font-size: 15px;
      line-height: 1.7;
      color: ${t.textMuted};
    }
  }

  .warn {
    margin: 0;
    padding: 10px 14px;
    border-radius: 10px;
    border: 1px solid rgba(248, 113, 113, 0.35);
    background: rgba(248, 113, 113, 0.08);
    font-size: 13px;
    color: ${t.danger};
  }

  #file {
    display: none;
  }
  #label1 {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 70px 20px;
    box-sizing: border-box;
    border: 1px dashed ${t.border};
    border-radius: ${t.radius};
    background: ${t.surface};
    cursor: pointer;
    transition: border-color 0.2s ease, background 0.2s ease;
    .imgAdd {
      font-size: 42px;
      color: ${t.accent};
    }
    .inputContainer {
      text-align: center;
    }
    .addText {
      margin: 14px 0 0 0;
      font-size: 15px;
      color: ${t.textMuted};
    }
    .addHint {
      margin: 6px 0 0 0;
      font-size: 13px;
      color: ${t.textDim};
    }
  }
  #label1:hover {
    border-color: ${t.accent};
    background: ${t.surfaceHi};
  }

  .imgArea {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 20px;
  }
  .imgContainer {
    padding: 16px;
    border: 1px solid ${t.border};
    border-radius: ${t.radius};
    background: ${t.surface};
    text-align: center;
  }
  .img {
    display: block;
    width: 100%;
    max-height: 380px;
    object-fit: contain;
    border-radius: 10px;
    background: #000000;
  }
  .imgState {
    margin: 12px 0 0 0;
    font-size: 13px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: ${t.textDim};
  }

  .empty {
    font-size: 14px;
    color: ${t.textDim};
  }

  .loadingBox {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 180px;
  }

  .error {
    margin: 0 0 16px 0;
    padding: 12px 15px;
    border-radius: 10px;
    border: 1px solid rgba(248, 113, 113, 0.35);
    background: rgba(248, 113, 113, 0.08);
    font-size: 14px;
    color: ${t.danger};
  }

  .download {
    display: block;
    width: 100%;
    margin: 0 0 10px 0;
    padding: 14px 0;
    text-align: center;
    font-size: 15px;
    font-weight: 600;
    border-radius: 10px;
    border: 1px solid ${t.accent};
    background: ${t.accentSoft};
    color: ${t.accentStrong};
    text-decoration: none;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .download:hover {
    background: ${t.surfaceHi};
  }

  .home {
    width: 100%;
    margin: 0;
    padding: 14px 0;
    text-align: center;
    font-size: 15px;
    font-weight: 600;
    border-radius: 10px;
    border: 1px solid ${t.border};
    background: ${t.surface};
    color: ${t.textMuted};
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .home:hover {
    border-color: ${t.accent};
    color: ${t.accentStrong};
  }

  .link {
    display: block;
    margin-top: 10px;
    text-decoration: none;
  }

  @media only screen and (min-width: 860px) {
    padding: 72px 32px 100px 32px;
    .container .title {
      font-size: 34px;
    }
    .imgArea {
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }
  }
`;function le(){const[a,i]=d.useState("#"),[r,o]=d.useState("#"),[n,s]=d.useState("idle"),l=d.useRef(null);d.useEffect(()=>()=>{l.current&&URL.revokeObjectURL(l.current)},[]);async function h(c){const m=c.target.files[0];if(!m)return;if(m.size>10*1024*1024){alert("업로드 가능한 최대 용량은 10MB입니다. "),c.target.value="";return}if(!m.type.startsWith("image/")){alert("사진 파일만 업로드할 수 있습니다."),c.target.value="";return}const u=URL.createObjectURL(m);l.current=u,i(u),s("loading");try{const x=await ie(m);o(x.data),s("done")}catch{s("error")}}return e.jsx(de,{children:e.jsxs("div",{className:"main",children:[e.jsxs("div",{className:"container",children:[e.jsx("p",{className:"title",children:"이미지 보호"}),e.jsx("p",{className:"explain",children:"사람 눈에는 보이지 않는 노이즈를 입혀, 사진이 딥페이크 학습에 쓰이더라도 결과가 무너지도록 만듭니다."}),e.jsx("p",{className:"warn",children:"노이즈 생성은 이미지 크기에 따라 시간이 걸릴 수 있습니다."})]}),a==="#"?e.jsxs(e.Fragment,{children:[e.jsx("input",{type:"file",id:"file",accept:"image/*",onChange:h}),e.jsx("label",{htmlFor:"file",id:"label1",children:e.jsxs("div",{className:"inputContainer",children:[e.jsx(H,{className:"imgAdd"}),e.jsx("p",{className:"addText",children:"사진 선택"}),e.jsx("p",{className:"addHint",children:"최대 10MB · 브라우저 밖으로 전송되지 않습니다"})]})})]}):e.jsxs(e.Fragment,{children:[n==="error"&&e.jsx("p",{className:"error",children:"노이즈 생성에 실패했습니다. 다른 사진으로 다시 시도해 주세요."}),e.jsxs("div",{className:"imgArea",children:[e.jsxs("div",{className:"imgContainer",children:[e.jsx("img",{src:a,className:"img",alt:"원본 이미지"}),e.jsx("p",{className:"imgState",children:"before"})]}),e.jsxs("div",{className:"imgContainer",children:[n==="done"?e.jsx("img",{src:r,className:"img",loading:"lazy",alt:"노이즈가 적용된 이미지"}):e.jsx("div",{className:"loadingBox",children:n==="loading"?e.jsx(I,{label:"노이즈 생성 중",size:80}):e.jsx("span",{className:"empty",children:"결과 없음"})}),e.jsx("p",{className:"imgState",children:"after"})]})]}),n==="done"&&e.jsx("a",{className:"download",href:r,download:"noise.jpg",children:"보호된 이미지 내려받기"}),e.jsx("p",{className:"home",onClick:()=>{window.location.reload()},children:"재시도"}),e.jsx(k,{to:"/deepfake-detection",className:"link",children:e.jsx("p",{className:"home",children:"홈으로"})})]})]})})}const xe=w.div`
  min-height: 100%;
  padding: 56px 20px 80px 20px;
  box-sizing: border-box;

  .inner {
    width: 100%;
    max-width: 860px;
    margin: 0 auto;
  }

  .mark {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 74px;
    height: 74px;
    margin-bottom: 26px;
    border-radius: 20px;
    border: 1px solid ${t.border};
    background: ${t.accentSoft};
    color: ${t.accent};
    font-size: 40px;
  }

  h1 {
    margin: 0 0 14px 0;
    font-size: 38px;
    font-weight: 700;
    letter-spacing: -0.03em;
    color: ${t.text};
  }

  .lead {
    margin: 0 0 8px 0;
    font-size: 17px;
    line-height: 1.75;
    color: ${t.textMuted};
  }

  .note {
    margin: 22px 0 0 0;
    padding: 12px 15px;
    border-radius: 10px;
    border: 1px solid ${t.border};
    background: ${t.surface};
    font-size: 13.5px;
    line-height: 1.7;
    color: ${t.textDim};
  }

  .cards {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
    margin-top: 40px;
  }

  .card {
    display: block;
    padding: 24px;
    border-radius: ${t.radius};
    border: 1px solid ${t.border};
    background: ${t.surface};
    text-decoration: none;
    transition: border-color 0.2s ease, transform 0.2s ease;
  }
  .card:hover {
    border-color: ${t.accent};
    transform: translateY(-2px);
  }

  .card .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    margin-bottom: 16px;
    border-radius: 11px;
    background: ${t.surfaceHi};
    color: ${t.accent};
    font-size: 24px;
  }

  .card h2 {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 8px 0;
    font-size: 18px;
    font-weight: 700;
    color: ${t.text};
  }
  .card h2 svg {
    font-size: 13px;
    color: ${t.textDim};
  }

  .card p {
    margin: 0;
    font-size: 14.5px;
    line-height: 1.7;
    color: ${t.textMuted};
  }

  @media only screen and (min-width: 860px) {
    padding: 88px 32px 100px 32px;

    h1 {
      font-size: 48px;
    }
    .cards {
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }
  }
`;function pe(){return e.jsx(xe,{children:e.jsxs("div",{className:"inner",children:[e.jsx("div",{className:"mark",children:e.jsx(F,{})}),e.jsx("h1",{children:"Antifake"}),e.jsx("p",{className:"lead",children:"AI 모델로 딥페이크 영상·이미지를 탐지하고, 내 사진이 학습 데이터로 쓰이지 않도록 보호합니다."}),e.jsxs("div",{className:"cards",children:[e.jsxs(k,{to:"/deepfake-detection/detection",className:"card",children:[e.jsx("div",{className:"icon",children:e.jsx(W,{})}),e.jsxs("h2",{children:["딥페이크 탐지 ",e.jsx(D,{})]}),e.jsx("p",{children:"Xception 기반 분류 모델로 사진 한 장부터 영상 프레임까지 분석하고, 조작이 의심되는 비율을 보여줍니다."})]}),e.jsxs(k,{to:"/deepfake-detection/protection",className:"card",children:[e.jsx("div",{className:"icon",children:e.jsx(_,{})}),e.jsxs("h2",{children:["이미지 보호 ",e.jsx(D,{})]}),e.jsx("p",{children:"사람 눈에는 보이지 않는 노이즈를 입혀, 사진이 딥페이크 학습에 쓰이더라도 결과가 무너지도록 만듭니다."})]})]}),e.jsx("p",{className:"note",children:"포트폴리오 데모입니다. 실제 추론 서버 대신 준비된 예시 결과를 보여주며, 업로드한 파일은 브라우저 밖으로 전송되지 않습니다."})]})})}const me=w.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: ${t.bg};
  color: ${t.text};

  .header {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    height: 62px;
    padding: 0 20px;
    border-bottom: 1px solid ${t.border};
    background: ${t.bgTranslucent};
    backdrop-filter: blur(8px);
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 9px;
    font-size: 19px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: ${t.text};
    text-decoration: none;
  }
  .logo .icon {
    display: flex;
    font-size: 25px;
    color: ${t.accent};
  }

  .nav {
    display: none;
    align-items: center;
    gap: 4px;
  }
  .nav a {
    padding: 8px 14px;
    border-radius: 8px;
    font-size: 14.5px;
    color: ${t.textMuted};
    text-decoration: none;
    transition: all 0.15s ease;
  }
  .nav a:hover {
    color: ${t.text};
    background: ${t.surfaceHi};
  }
  .nav a.active {
    color: ${t.accentStrong};
    background: ${t.accentSoft};
  }

  .toggle {
    display: flex;
    font-size: 25px;
    color: ${t.textMuted};
    cursor: pointer;
  }

  .drawer {
    display: ${a=>a.$open?"block":"none"};
    padding: 8px 20px 18px 20px;
    border-bottom: 1px solid ${t.border};
    background: ${t.surface};
  }
  .drawer a {
    display: block;
    padding: 12px 4px;
    font-size: 15px;
    color: ${t.textMuted};
    text-decoration: none;
  }
  .drawer a.active {
    color: ${t.accentStrong};
  }

  .mainArea {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }

  @media only screen and (min-width: 860px) {
    .header {
      padding: 0 32px;
    }
    .nav {
      display: flex;
    }
    .toggle,
    .drawer {
      display: none;
    }
  }
`,R=[{name:"홈",url:"/deepfake-detection"},{name:"딥페이크 탐지",url:"/deepfake-detection/detection"},{name:"이미지 보호",url:"/deepfake-detection/protection"}];function be(){const[a,i]=d.useState(!1),r=E(),o=n=>e.jsx(k,{to:n.url,className:r.pathname===n.url?"active":"",onClick:()=>i(!1),children:n.name},n.url);return e.jsxs(me,{$open:a,children:[e.jsx(G,{label:"Antifake (졸업작품)"}),e.jsxs("div",{className:"header",children:[e.jsxs(k,{to:"/deepfake-detection",className:"logo",children:[e.jsx("span",{className:"icon",children:e.jsx(F,{})}),"Antifake"]}),e.jsx("nav",{className:"nav",children:R.map(o)}),e.jsx("span",{className:"toggle",onClick:()=>i(!a),children:a?e.jsx(P,{}):e.jsx(O,{})})]}),e.jsx("div",{className:"drawer",children:R.map(o)}),e.jsx("div",{className:"mainArea",children:e.jsxs(Z,{children:[e.jsx(M,{path:"/",element:e.jsx(pe,{})}),e.jsx(M,{path:"/detection",element:e.jsx(ce,{})}),e.jsx(M,{path:"/protection",element:e.jsx(le,{})})]})})]})}export{be as default};
