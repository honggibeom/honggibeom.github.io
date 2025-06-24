import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import TOS from "./Function/TOS";
import { AiOutlineCheck } from "react-icons/ai";
import { TfiAngleLeft, TfiAngleRight } from "react-icons/tfi";

const Page1Css = styled.div`
  width: 100vw;
  height: 70vh;
  max-width: 450px;
  min-height: ${(props) => props.vh * 70}px;
  overflow: hidden;
  div {
    margin-left: 7%;
    margin-top: ${(props) => props.vh * 5}px;
  }

  input {
    padding: ${(props) => props.vh * 2}px 3vw;
    border: none;
    width: 80%;
    font-size: 16px;
    letter-spacing: -0.02em;
    border-radius: 8px;
    font-weight: 500;
    color: #222222;
    border: 1px solid #91949d;
  }
  input:focus {
    outline: none;
    border: 1px solid #b03131;
  }

  input::placeholder {
    color: #91949d;
    font-weight: 500;
    font-size: 16px;
  }
  .warn1 {
    ${(props) => {
      if (
        /[a-zA-Z0-9+-\_.]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(
          props.user.id
        ) ||
        !props.blur
      )
        return "display:none;";
    }}
    margin-left: 10%;
    font-size: 12px;
    color: #ff8e66;
    font-weight: 400;
  }
`;

function Page1(props) {
  const email = useRef("");
  const [blur, setBlur] = useState(false);
  return (
    <Page1Css user={props.user} blur={blur} vh={props.vh}>
      <div className="email">
        <label>
          <input
            type="text"
            placeholder="example@example.com"
            ref={email}
            onInput={() => {
              let tmp;
              if (email.current.value.includes("@"))
                tmp = email.current.value.split("@")[0];
              else tmp = email.current.value;
              props.setUser({
                ...props.user,
                id: email.current.value,
                nickname: tmp,
              });
            }}
            onBlur={() => {
              setBlur(true);
            }}
          />
        </label>
      </div>
      <p className="warn1">올바른 이메일 형식이 아닙니다</p>
    </Page1Css>
  );
}

const Page2Css = styled.div`
  width: 100vw;
  height: 70vh;
  overflow: hidden;
  max-width: 450px;
  min-height: ${(props) => props.vh * 70}px;

  p {
    font-size: 14px;
    font-weight: 700;
    margin-left: 2%;
    color: #080708;
  }

  div {
    margin-left: 7%;
    margin-top: ${(props) => props.vh * 5}px;
  }

  input {
    padding: ${(props) => props.vh * 2}px 3vw;
    border: none;
    width: 80%;
    font-size: 16px;
    letter-spacing: -0.02em;
    border-radius: 8px;
    font-weight: 500;
    color: #222222;
    border: 1px solid #91949d;
  }
  input:focus {
    outline: none;
    border: 1px solid #b03131;
  }

  input::placeholder {
    color: #91949d;
    font-weight: 500;
    font-size: 16px;
  }
  .warn2 {
    ${(props) => {
      const regExp = /^(?=.*[a-zA-Z])(?=.*[!@#$%^~*+=-])(?=.*[0-9]).{10,20}$/;
      if (regExp.test(props.user.pw) || !props.blur.blur1)
        return "display:none;";
    }}
    margin-left: 10%;
    font-size: 12px;
    color: #ff8e66;
    font-weight: 400;
  }
  .warn3 {
    ${(props) =>
      (props.user.pw !== "" && props.user.pw === props.user.pw_check) ||
      !props.blur.blur2
        ? "display:none"
        : "color:#FF8E66"};
    margin-left: 10%;
    font-size: 12px;
    font-weight: 400;
  }
`;

function Page2(props) {
  const password = useRef("");
  const check = useRef("");
  const [blur, setBlur] = useState({
    blur1: false,
    blur2: false,
  });
  return (
    <Page2Css user={props.user} vh={props.vh} blur={blur}>
      <div className="pw">
        <p>비밀번호</p>
        <label>
          <input
            type="password"
            placeholder="특수문자 포함 10자 이상"
            ref={password}
            onInput={() => {
              props.setUser({ ...props.user, pw: password.current.value });
            }}
            onBlur={() => {
              setBlur({ ...blur, blur1: true });
            }}
          />
        </label>
      </div>

      <p className="warn2">특수문자 포함 10자 이상 작성해주세요</p>
      <div className="pwcheck">
        <p>비밀번호 확인</p>
        <label>
          <input
            type="password"
            placeholder="특수문자 포함 10자 이상"
            ref={check}
            onInput={() => {
              props.setUser({ ...props.user, pw_check: check.current.value });
            }}
            onBlur={() => {
              setBlur({ ...blur, blur2: true });
            }}
          />
        </label>
      </div>

      <p className="warn3">{"비밀번호가 일치하지 않습니다"}</p>
    </Page2Css>
  );
}

const Page3Css = styled.div`
  width: 100vw;
  height: 70vh;
  overflow: hidden;
  max-width: 450px;
  min-height: ${(props) => props.vh * 70}px;
  p {
    font-size: 14px;
    letter-spacing: -0.02em;
    font-weight: 700;
    color: #080708;
    margin-left: 2%;
  }

  div {
    margin-left: 7vw;
    margin-top: ${(props) => props.vh * 5}px;
  }
  label {
    display: block;
    width: 90%;
    border: 1px solid #91949d;
    border-radius: 8px;
    margin: 0;
  }
  input {
    padding: ${(props) => props.vh * 2}px 3%;
    border: none;
    font-size: 16px;
    letter-spacing: -0.02em;
    border-radius: 8px;
    font-weight: 500;
    color: #222222;
  }

  .input1 {
    width: 60%;
  }

  .input2 {
    width: 55%;
  }

  input:focus {
    outline: none;
  }

  input::placeholder {
    color: #91949d;
    font-weight: 500;
    font-size: 16px;
  }
  button {
    cursor: pointer;
    position: relative;
    border: 0;
    ontline: 0;
    padding: ${(props) => props.vh * 1}px 2%;
    border-radius: 8px;
    margin: 0 auto;
    transition: 0.5s;
  }
  .phone {
    margin-left: 10%;
    background: ${(props) =>
      /^01([0|1|6|7|8|9])-?([0-9]{4})-?([0-9]{4})$/.test(props.user.phone)
        ? "#B03131"
        : "#D2D4DC"};
    color: #ffffff;
  }

  .check {
    margin-left: 6%;
    background: ${(props) =>
      props.isSend && props.check.length === 4 ? "#B03131" : "#D2D4DC"};
    color: white;
  }
`;

function Page3(props) {
  const phone = useRef("");
  const check = useRef("");
  const [isSend, setIsSend] = useState(false);
  const [checkAble, setCheckAble] = useState("");
  return (
    <Page3Css user={props.user} check={checkAble} isSend={isSend} vh={props.vh}>
      <div>
        <p>휴대폰 번호</p>

        <label>
          <input
            type="text"
            className="input1"
            placeholder="예) 01012345678"
            ref={phone}
            onInput={() => {
              props.setUser({ ...props.user, phone: phone.current.value });
            }}
          />
          <button type="button" className="phone">
            인증요청
          </button>
        </label>
      </div>

      <div>
        <p>인증번호</p>
        <label>
          <input
            type="text"
            className="input2"
            placeholder="인증번호 4자리"
            ref={check}
            onChange={() => setCheckAble(check.current.value)}
          />

          <button type="button" className="check" onClick={() => {}}>
            인증번호 확인
          </button>
        </label>
      </div>
    </Page3Css>
  );
}

const Page4Css = styled.div`
  width: 100vw;
  height: 70vh;
  min-height: ${(props) => props.vh * 70}px;
  max-width: 450px;
  p {
    font-size: 14px;
    font-weight: 700;
    color: #080708;
    margin-left: 2%;
  }

  div {
    margin-left: 7%;
    margin-top: ${(props) => props.vh * 4}px;
  }

  input {
    padding: ${(props) => props.vh * 2}px 3vw;
    border: none;
    width: 80%;
    font-size: 16px;
    letter-spacing: -0.02em;
    border-radius: 8px;
    font-weight: 500;
    color: #222222;
    border: 1px solid #91949d;
  }

  input:focus {
    outline: none;
    border: 1px solid #b03131;
  }

  input::placeholder {
    color: #91949d;
    font-weight: 500;
    font-size: 16px;
  }

  .warn1 {
    ${(props) =>
      props.user.nickname.length > 1 || !props.blur ? "display:none;" : ""}
    margin-left: 9%;
    font-size: 12px;
    color: #ff8e66;
    font-weight: 400;
  }
`;

function Page4(props) {
  const name = useRef("");
  const [blur, setBlur] = useState(false);
  return (
    <Page4Css user={props.user} blur={blur} vh={props.vh}>
      <div>
        <p>닉네임</p>
        <label>
          <input
            placeholder="예) carter"
            type="text"
            ref={name}
            defaultValue={props.user.nickname}
            onChange={() => {
              props.setUser({ ...props.user, nickname: name.current.value });
            }}
            onBlur={() => {
              setBlur(true);
            }}
          />
        </label>
      </div>
      <p className="warn1">닉네임은 한자리 이상 입력해 주세요</p>
    </Page4Css>
  );
}

const Page5Css = styled.div`
  width: 100vw;
  height: 70vh;
  max-width: 450px;
  min-height: ${(props) => props.vh * 70}px;
  overflow-y: auto;

  pre {
    color: #91949d;
  }

  input {
    border: 1px solid #cbced7;
    border-radius: 4px;
  }

  .all {
    width: 80%;
    height: 5vh;
    min-height: ${(props) => props.vh * 5}px;
    margin-left: 10%;
    margin-top: ${(props) => props.vh * 5}px;
    border: 1px solid
      ${(props) =>
        props.tos[0] && props.tos[1] && props.tos[2]
          ? "#B03131"
          : "rgba(0,0,0,0.1)"};
    border-radius: 8px;
    display: flex;
    align-items: center;
    label {
      margin-left: 3%;
      display: flex;
      input {
        accent-color: #080708;
        width: 20px;
        height: 20px;
      }
      .text0 {
        margin: 0;
        margin-left: ${(props) => props.vh * 1.5}px;
        font-weight: 400;
        font-size: 16px;
        color: ${(props) =>
          props.tos[0] && props.tos[1] && props.tos[2] ? "#080708" : "#91949D"};
      }
    }
  }
  .group {
    display: flex;
    flex-direction: column;
    margin-left: 10%;
    margin-top: ${(props) => props.vh * 5}px;
    margin-bottom: ${(props) => props.vh * 10}px;
    width: 80%;
    height: auto;
    min-height: ${(props) => props.vh * 18}px;
    background: ${(props) =>
      props.tos[0] && props.tos[1] ? "#ffffff" : "#F5F5F5"};
    ${(props) =>
      props.tos[0] && props.tos[1]
        ? "border: 1px solid #B03131;"
        : "border: 1px solid #ffffff"};
    border-radius: 8px;
    label {
      margin-top: ${(props) => props.vh * 3}px;
      margin-left: 7%;
      display: flex;
      position: relative;
      input {
        display: none;
      }
      .fa-check {
        cursor: pointer;
        margin-right: 5%;
      }

      .tos0 {
        color: ${(props) => (props.tos[0] ? "#080708" : "#E1E1E1")};
      }

      .tos1 {
        color: ${(props) => (props.tos[1] ? "#080708" : "#E1E1E1")};
      }

      .tos2 {
        color: ${(props) => (props.tos[2] ? "#080708" : "#E1E1E1")};
        margin-bottom: ${(props) => props.vh * 3}px;
      }

      p {
        width: 70%;
        margin: 0;
        font-size: 14px;
        line-height: ${(props) => props.vh * 2}px;
      }

      .text1 {
        color: ${(props) => (props.tos[0] ? "#080708" : "#91949D")};
      }

      .text2 {
        color: ${(props) => (props.tos[1] ? "#080708" : "#91949D")};
      }

      .text3 {
        color: ${(props) => (props.tos[2] ? "#080708" : "#91949D")};
      }

      .tosDetail {
        font-size: 14px;
        font-weight: 500;
        color: #9698a0;
        letter-spacing: -0.02em;
        text-decoration: underline #9698a0;
        text-decoration-thickness: 0.5px;
        text-underline-position: under;
      }
    }
    .tos0Detail,
    .tos1Detail {
      font-size: 12px;
      margin-left: 2%;
      width: 96%;
      height: 30vh;
      min-height: ${(props) => props.vh * 30}px;
      background: white;
      white-space: -moz-pre-wrap;
      white-space: -pre-wrap;
      white-space: -o-pre-wrap;
      white-space: pre-wrap;
      word-wrap: break-word;
      overflow-y: auto;
    }
    .tos0Detail {
      display: ${(props) => (props.detail.tos0 === true ? "block" : "none")};
    }
    .tos1Detail {
      display: ${(props) => (props.detail.tos1 === true ? "block" : "none")};
    }
  }
`;

function Page5(props) {
  const all = useRef(null);
  const [detail, setDetail] = useState({ tos0: false, tos1: false });
  const checkAll = () => {
    if (all.current.checked === true) props.setTos([true, true, true]);
    else props.setTos([false, false, false]);
  };
  const checkTos = (num) => {
    if (num === 0) props.setTos([!props.tos[0], props.tos[1], props.tos[2]]);
    else if (num === 1)
      props.setTos([props.tos[0], !props.tos[1], props.tos[2]]);
    else if (num === 2)
      props.setTos([props.tos[0], props.tos[1], !props.tos[2]]);
    all.current.checked = false;
  };
  return (
    <Page5Css tos={props.tos} vh={props.vh} detail={detail}>
      <div className="all">
        <label>
          <input type="checkbox" ref={all} onClick={checkAll} />
          <p className="text0">전체 이용약관에 동의합니다</p>
        </label>
      </div>

      <div className="group">
        <label>
          <AiOutlineCheck
            className="fa-solid fa-check tos0"
            onClick={() => checkTos(0)}
          />
          <input type="checkbox" />
          <p className="text1"> 개인정보 약관동의(필수) </p>
          <span
            className="tosDetail"
            onClick={() => {
              setDetail({ ...detail, tos0: !detail.tos0 });
            }}
          >
            {detail.tos0 === false ? "자세히" : "접기"}
          </span>
        </label>

        <pre className="tos0Detail">{TOS(0)}</pre>

        <label>
          <AiOutlineCheck
            className="fa-solid fa-check tos1"
            onClick={() => checkTos(1)}
          />
          <input type="checkbox" />
          <p className="text2"> 사용자 이용약관(필수) </p>
          <span
            className="tosDetail"
            onClick={() => {
              setDetail({ ...detail, tos1: !detail.tos1 });
            }}
          >
            {detail.tos1 === false ? "자세히" : "접기"}
          </span>
        </label>

        <pre className="tos1Detail">{TOS(1)}</pre>

        <label>
          <AiOutlineCheck
            className="fa-solid fa-check tos2"
            onClick={() => checkTos(2)}
          />
          <input type="checkbox" />
          <p className="text3"> 푸쉬 알림 동의(선택) </p>
        </label>
      </div>
    </Page5Css>
  );
}

const Wrap = styled.form`

    width: 100vw;
    height: 100vh;
    max-width:450px;
    min-height:${(props) => props.vh * 100}px;
    background: #ffffff;
    overflow:hidden;

    *{
        font-family: 'Spoqa Han Sans Neo';
        letter-spacing: -0.02em;
    }

    .icon{

        margin:${(props) => props.vh * 2}px 0;
        display:flex;

        .fa-angle-left{
            cursor:pointer;
            width:10%;
            display:flex;
            align-items:center;
            justify-conetent:center;
            color::#080708;
            font-size: 24px;
            margin-left:5%;
            margin-top:${(props) => props.vh * 2}px;
        }

        .step{
            margin-top: ${(props) => props.vh * 2}px;
            width:70%;
            display: flex;
            justify-content:center;
            .step1,.step2,.step3,.step4,.step5{

                height:15px;
                background: #080708;
                transition: 0.5s;
                margin: auto 2%;

            }
            .step1
            {
                
                ${(props) =>
                  props.mode === 0
                    ? "border-radius: 10px; width:40px;"
                    : "border-radius: 100%; opacity:0.3; width:15px;"}

            }
            .step2
            {

                ${(props) =>
                  props.mode === 1
                    ? "border-radius: 10px; width:40px;"
                    : "border-radius: 100%; opacity:0.3; width:15px;"}

            }
            .step3
            {
                
                ${(props) =>
                  props.mode === 2
                    ? "border-radius: 10px; width:40px;"
                    : "border-radius: 100%; opacity:0.3; width:15px;"}

            }
            .step4
            {

                ${(props) =>
                  props.mode === 3
                    ? "border-radius: 10px; width:40px;"
                    : "border-radius: 100%; opacity:0.3; width:15px;"}

            }
            .step5
            {

                ${(props) =>
                  props.mode === 4
                    ? "border-radius: 10px; width:40px;"
                    : "border-radius: 100%; opacity:0.3; width:15px;"}

            }
        }
    }
    
    .text{

        margin-top:${(props) => props.vh * 8}px;

        .text1{
           
            color :#080708;
            margin-left: 8%;
            font-size:  24px;
            font-weight: 700;
        
        }

        .text2{
            margin-bottom:0;
            margin-left: 8%;
            margin-right: 8%;    
            font-size: 16px;
            color: #91949D;
        }

    }
    .container{

        display: flex;
        background:white;
        margin-top: ${(props) => props.vh * 5}px;;
        width: 500vw;
        height: 70vh;
        max-width:2250px;
        min-height:${(props) => props.vh * 70}px;
        transform: translate(${(props) => props.mode * -20}%);
        transition: 0.5s;
        overflow:hidden;
    }

    .next{
        margin:0;
        display: flex;
        cursor: pointer;
        position: fixed;
        top: ${(props) => props.vh * 94}px;
        width: 100vw;
        height: 6vh;
        max-width:450px;
        min-height: ${(props) => props.vh * 6}px;
        background: ${(props) => {
          const regExp =
            /^(?=.*[a-zA-Z])(?=.*[!@#$%^~*+=-])(?=.*[0-9]).{10,20}$/;

          if (
            props.mode === 0 &&
            /[a-zA-Z0-9+-\_.]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(
              props.user.id
            )
          )
            return "#B03131;";
          else if (
            props.mode === 1 &&
            props.user.pw === props.user.pw_check &&
            regExp.test(props.user.pw)
          )
            return "#B03131;";
          else if (props.mode === 2 && props.user.phone_check === true)
            return "#B03131;";
          else if (props.mode === 3 && props.user.nickname.length > 1)
            return "#B03131;";

          if (
            props.mode === 4 &&
            (JSON.stringify(props.tos) === JSON.stringify([true, true, true]) ||
              JSON.stringify(props.tos) === JSON.stringify([true, true, false]))
          )
            return "#B03131;";
          else return "#CBCED7;";
        }};

        font-size: 24px;
        font-weight: 700;
        color: #ffffff;
        align-items:center;
        justify-content: center;
        transition:0.3s;
    }
    
`;

function SignUp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [size, setSize] = useState(
    window.innerHeight < 600 ? window.screen.availHeight : window.innerHeight
  );
  const [tos, setTos] = useState([false, false, false]);
  const [user, setUser] = useState({
    id: "",
    pw: "",
    pw_check: "",
    phone: "",
    phone_check: false,
    nickname: "",
  });
  const [mode, setMode] = useState(0);

  useEffect(() => {
    window.addEventListener("resize", () => {
      setSize(
        window.innerHeight < 600
          ? window.screen.availHeight
          : window.innerHeight
      );
    });
  }, []);

  const next = () => {
    if (mode === 0) {
      if (/[a-zA-Z0-9+-\_.]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(user.id))
        setMode(mode + 1);
    } else if (mode === 1) {
      const regExp = /^(?=.*[a-zA-Z])(?=.*[!@#$%^~*+=-])(?=.*[0-9]).{10,20}$/;
      if (user.pw === user.pw_check && regExp.test(user.pw)) setMode(mode + 1);
    } else if (mode === 2) {
      if (user.phone_check === true) {
        setMode(mode + 1);
      }
    } else if (mode === 3) {
      if (user.nickname.length > 1) setMode(mode + 1);
    } else if (mode === 4) {
      if (
        JSON.stringify(tos) === JSON.stringify([true, true, true]) ||
        JSON.stringify(tos) === JSON.stringify([true, true, false])
      ) {
      } else {
        alert("필수 이용약관에 동의해주세요");
      }
    }
  };

  const prev = () => {
    if (mode !== 0) setMode(mode - 1);
    else if (mode === 0) navigate("/?Login");
  };

  return (
    <Wrap mode={mode} tos={tos} user={user} vh={size / 100}>
      <div className="icon">
        <TfiAngleLeft className="fa-solid fa-angle-left" onClick={prev} />
        <div className="step">
          <p className="step1"></p>
          <p className="step2"></p>
          <p className="step3"></p>
          <p className="step4"></p>
          <p className="step5"></p>
        </div>
      </div>

      <div className="text">
        {mode === 0 && (
          <>
            <p className="text1">이메일을 입력해 주세요.</p>
            <p className="text2">로그인 시 사용할 이메일을 입력해주세요.</p>
          </>
        )}
        {mode === 1 && (
          <>
            <p className="text1">비밀번호를 입력해 주세요</p>
            <p className="text2">
              영문, 숫자, 특수문자를 조합하여 8자리 이상 작성해주세요.
            </p>
          </>
        )}
        {mode === 2 && (
          <>
            <p className="text1">전화번호를 인증해 주세요.</p>
            <p className="text2">
              서비스를 이용하려면 전화번호 인증이 필요해요.
            </p>
          </>
        )}
        {mode === 3 && (
          <>
            <p className="text1">닉네임을 입력해주세요.</p>
            <p className="text2">서비스에서 사용하실 닉네임이 필요해요.</p>
          </>
        )}
        {mode === 4 && (
          <>
            <p className="text1">약관에 동의해 주세요.</p>
            <p className="text2">서비스를 이용하려면 약관 동의가 필요해요.</p>
          </>
        )}
      </div>
      <div className="container">
        <Page1 user={user} setUser={setUser} vh={size / 100} />
        <Page2 user={user} setUser={setUser} vh={size / 100} />
        <Page3 user={user} setUser={setUser} vh={size / 100} />
        <Page4 user={user} setUser={setUser} vh={size / 100} />
        <Page5 setTos={setTos} tos={tos} vh={size / 100} />
      </div>
      {mode === 4 && (
        <div className="next" onClick={next}>
          <AiOutlineCheck className="fa-solid fa-check" />
        </div>
      )}
      {mode !== 4 && (
        <div className="next" onClick={next}>
          <TfiAngleRight className="fa-solid fa-angle-right" />
        </div>
      )}
    </Wrap>
  );
}

export default SignUp;
