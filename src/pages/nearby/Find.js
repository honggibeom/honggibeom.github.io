import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { useRef } from "react";
import { TfiAngleLeft } from "react-icons/tfi";
import { useNavigate } from "react-router-dom";
import { origin } from "./Origin/Origin";
const FindCss = styled.div`
  overflow: hidden;
  width: 100vw;
  height: 100vh;
  max-width: 450px;
  min-height: ${(props) => props.vh * 100};

  .link {
    text-decoration: none;
  }
  .header {
    margin-top: ${(props) => props.vh * 3};
    display: flex;
    .fa-solid {
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 5%;
      margin-left: 5%;
      font-size: 24px;
    }
    .step {
      height: 5vh;
      min-height: ${(props) => props.vh * 5};
      display: flex;
      justify-content: center;
      align-items: center;
      width: 80%;
      .step1 {
        ${(props) =>
          props.page === 0
            ? "border-radius: 10px; width:40px; "
            : "width: 15px; opacity:0.5; border-radius: 100%;"}
        margin-right: 2%;
        height: 15px;
        background: black;
        transition: 0.5s;
      }
      .step2 {
        ${(props) =>
          props.page === 1
            ? "border-radius: 10px; width:40px; "
            : "width: 15px; opacity:0.5; border-radius: 100%;"}
        margin-right: 2%;
        height: 15px;
        background: black;
        transition: 0.5s;
      }
    }
  }
  .title {
    width: 90%;
    height: 5vh;
    min-height: ${(props) => props.vh * 5};
    font-weight: 700;
    font-size: 28px;
    margin-left: 5%;
    margin-bottom: 0;
  }
  .guide {
    width: 90%;
    height: 5vh;
    min-height: ${(props) => props.vh * 5};
    margin-left: 5%;
    color: #9698a0;
    font-weight: 400;
    font-size: 16px;
  }

  .subTitle {
    margin-top: ${(props) => props.vh * 5};
    font-weight: 700;
    font-size: 18px;
    margin-left: 5%;
  }

  .find {
    margin-top: ${(props) => props.vh * 7};
    width: 200vw;
    height: 80vh;
    max-width: 900px;
    min-height: ${(props) => props.vh * 80};
    display: flex;
    transform: translate(${(props) => props.page * -50}%);
    transition: 0.5s;
    .page1 {
      width: 100vw;
      height: 70vh;
      max-width: 450px;
      min-height: ${(props) => props.vh * 70};
      background: #ffffff;
      .first,
      .second {
        display: flex;
        margin-bottom: ${(props) => props.vh * 3};
      }
      .btn1,
      .btn2 {
        cursor: pointer;
        display: flex;
        padding: ${(props) => props.vh * 1}px 2vw;
        color: #ffffff;
        border-radius: 8px;
        font-weight: 500;
        font-size: 14px;
        align-items: center;
        justify-content: center;
        transition: 0.5s;
        margin-left: 5%;
      }
      .btn1 {
        background: ${(props) =>
          props.btn.btn1 === true ? "#B03131" : "#D2D4DC"};
      }
      .btn2 {
        background: ${(props) =>
          props.btn.btn2 === true ? "#B03131" : "#D2D4DC"};
      }
      input {
        border: none;
        width: 65%;
        font-size: 16px;
        letter-spacing: -0.02em;
        font-weight: 500;
        color: #222222;
      }

      .id {
        width: 80%;
      }

      label {
        margin-top: 1vh;
        display: block;
        width: 90vw;
        max-width: 400px;
        height: 5vh;
        min-height: ${(props) => props.vh * 5};
        border: 1px solid #d2d4dc;
        margin-left: 5%;
        padding: ${(props) => props.vh * 1} 2vw;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 12px;
      }
    }

    .page2 {
      width: 100vw;
      height: 70vh;
      max-width: 450px;
      min-height: ${(props) => props.vh * 70};
      background: #ffffff;
      .result {
        display: flex;
        margin-top: ${(props) => (props.page === 0 ? "100" : "20")}vh;
        width: 90%;
        margin-left: 5%;
        background: #ffffff;
        color: #000000;
        font-weight: 500;
        font-size: 32px;
        align-items: center;
        justify-content: center;
        transition: 1s;
        letter-spacing: 1px;
      }
      .goLogin {
        position: absolute;
        display: flex;
        width: 100vw;
        max-width: 450px;
        padding: ${(props) => props.vh * 2.5}px 0;
        justify-content: center;
        align-items: center;
        background: #b03131;
        color: #ffffff;
        font-weight: 700;
        font-size: 16px;
        opacity: ${(props) => (props.page === 0 ? "0" : "1")};
        transition: 2s;
        bottom: 0;
      }
      .first,
      .second {
        display: flex;
      }
      input {
        border: none;
        width: 90%;
        font-size: 16px;
        letter-spacing: -0.02em;
        font-weight: 500;
        color: #222222;
      }

      label {
        margin-top: ${(props) => props.vh * 1};
        display: block;
        width: 90%;
        height: 5vh;
        min-heght: ${(props) => props.vh * 3.5};
        border: 1px solid #d2d4dc;
        margin-left: 5%;
        padding: ${(props) => props.vh * 1} 2vw;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 12px;
      }
    }
  }
  .warn1,
  .warn2 {
    margin-left: 7%;
    font-size: 12px;
    color: #ff8e66;
    font-weight: 400;
  }

  input:focus {
    outline: none;
  }

  input::placeholder {
    color: #cbced7;
  }
`;

function Find(props) {
  const id = useRef();
  const navigate = useNavigate();
  const phone = useRef();
  const check = useRef();
  const [btn, setBtn] = useState({
    btn1: false,
    btn2: false,
    id: "",
    phone: "",
    checkInput: "",
  });
  const [page, setPage] = useState(0);
  const [result, setResult] = useState({
    result: "",
    email: "",
    pw: "",
    pwCheck: "",
    top: "",
  });
  const [blur, setBlur] = useState({ blur1: false, blur2: false });
  const [size, setSize] = useState(
    window.innerHeight < 600 ? window.screen.availHeight : window.innerHeight
  );
  const regExp = /^(?=.*[a-zA-Z])(?=.*[!@#$%^~*+=-])(?=.*[0-9]).{10,20}$/;
  useEffect(() => {
    window.addEventListener("resize", () => {
      setSize(
        window.innerHeight < 600
          ? window.screen.availHeight
          : window.innerHeight
      );
    });
  }, []);
  useEffect(() => {
    if (page === 0) setResult({ ...result, top: "100" });
    else setResult({ ...result, top: "10" });
  }, [page]);

  return (
    <FindCss btn={btn} page={page} result={result} blur={blur} vh={size / 100}>
      <div className="header">
        <div className="fa-solid fa-angle-left">
          <TfiAngleLeft
            onClick={() => {
              if (page === 0) navigate("/?Login");
              else setPage(page - 1);
            }}
          />
        </div>
        <div className="step">
          <p className="step1"></p>
          <p className="step2"></p>
        </div>
      </div>
      <p className="title">
        {props.mode === "id" ? "아이디 찾기" : "비밀번호 찾기"}
      </p>
      <p className="guide">
        {props.mode === "id" &&
          (page === 0
            ? "가입시에 사용된 전화번호를 입력해 주세요"
            : "아이디를 확인하세요")}
        {props.mode === "pw" &&
          (page === 0
            ? "가입시에 사용된 아이디를 입력해 주세요"
            : "비밀번호를 재설정 해주세요")}
      </p>
      <div className="find">
        <div className="page1">
          {props.mode === "pw" && (
            <>
              <p className="subTitle">아이디</p>
              <div className="first">
                <label ref={id}>
                  <input
                    type="text"
                    className="id"
                    placeholder="아이디를 입력해 주세요"
                    onFocus={() => {
                      id.current.style.border = "1px solid #B03131";
                    }}
                    onBlur={() => {
                      id.current.style.border = "1px solid #D2D4DC";
                    }}
                    onChange={(e) => {
                      if (
                        btn.phone.length === 11 &&
                        e.target.value.length > 5
                      ) {
                        setBtn({ ...btn, btn1: true, id: e.target.value });
                      } else {
                        setBtn({ ...btn, btn1: false, id: e.target.value });
                      }
                    }}
                  />
                </label>
              </div>
            </>
          )}
          <p className="subTitle">전화번호</p>
          <div className="first">
            <label ref={phone}>
              <input
                type="text"
                placeholder="010-1234-5678"
                onFocus={() => {
                  phone.current.style.border = "1px solid #B03131";
                }}
                onBlur={() => {
                  phone.current.style.border = "1px solid #D2D4DC";
                }}
                onChange={(e) => {
                  if (props.mode === "id") {
                    if (e.target.value.length === 11)
                      setBtn({ ...btn, btn1: true, phone: e.target.value });
                    else {
                      setBtn({ ...btn, btn1: false, phone: e.target.value });
                    }
                  } else {
                    if (e.target.value.length === 11 && btn.id.length > 5)
                      setBtn({ ...btn, btn1: true, phone: e.target.value });
                    else {
                      setBtn({ ...btn, btn1: false, phone: e.target.value });
                    }
                  }
                }}
              />

              <p
                className="btn1"
                onClick={() => {
                  if (btn.btn1 === true) {
                    axios({
                      method: "post",
                      url: origin + "find/send",
                      headers: {
                        "Access-Control-Allow-Origin": "*",
                      },

                      data: {
                        type: "PASSWORD",
                        phone: btn.phone,
                      },
                    })
                      .then((res) => {
                        if (
                          res.status === 200 &&
                          res.data !== "UNREGISTERED USER"
                        )
                          alert("인증번호가 전송되었습니다.");
                        else alert("전화번호를 확인해주세요");
                      })
                      .catch(() => {
                        alert("전화번호를 확인해주세요");
                      });
                  }
                }}
              >
                인증번호
              </p>
            </label>
          </div>
          <p className="subTitle">인증번호</p>
          <div className="second">
            <label ref={check}>
              <input
                type="text"
                placeholder="인증번호를 입력해주세요"
                onFocus={() => {
                  check.current.style.border = "1px solid #B03131";
                }}
                onBlur={() => {
                  check.current.style.border = "1px solid #D2D4DC";
                }}
                onChange={(e) => {
                  if (e.target.value.length === 4)
                    setBtn({ ...btn, btn2: true, checkInput: e.target.value });
                }}
              />

              <p
                className="btn2"
                onClick={() => {
                  if (btn.btn2 === true && btn.checkInput.length === 4) {
                    axios({
                      method: "post",

                      url: origin + "find/check",

                      headers: {
                        "Access-Control-Allow-Origin": "*",
                      },
                      data: {
                        type: "PASSWORD",
                        phone: btn.phone,
                        check_str: btn.checkInput,
                      },
                    })
                      .then(function (res) {
                        if (
                          props.mode === "pw" &&
                          res.headers.email !== btn.email
                        ) {
                          alert("존재하지 않는 이메일 입니다");
                          return;
                        }

                        if (res.status === 200 && res.data !== "ERROR") {
                          setPage(1);
                          axios
                            .get(origin + "account/" + res.data)
                            .then((res) => {
                              setResult({
                                ...result,
                                result: res.data.data.id,
                                email: res.data.data.email,
                              });
                            });
                        } else {
                          alert("인증번호를 확인해주세요");
                        }
                      })
                      .catch(() => {
                        alert("전화번호를 확인해주세요");
                      });
                  }
                }}
              >
                &nbsp;&nbsp;&nbsp;확인&nbsp;&nbsp;&nbsp;
              </p>
            </label>
          </div>
        </div>

        <div className="page2">
          {props.mode === "id" && <p className="result">{result.email}</p>}

          {props.mode === "pw" && (
            <>
              <p className="subTitle">새로운 비밀번호</p>
              <div className="first">
                <label>
                  <input
                    type="password"
                    placeholder="인증번호를 입력해주세요"
                    onChange={(e) => {
                      setResult({ ...result, pw: e.target.value });
                    }}
                    onBlur={() => {
                      setBlur({ ...blur, blur1: true });
                    }}
                  />
                </label>
              </div>
              {!regExp.test(result.pw) && blur.blur1 && (
                <p className="warn1">특수문자 포함 10자 이상 작성해주세요</p>
              )}
              <p className="subTitle">비밀번호 확인</p>
              <div className="second">
                <label>
                  <input
                    type="password"
                    placeholder="인증번호를 입력해주세요"
                    onChange={(e) => {
                      setResult({ ...result, pwCheck: e.target.value });
                    }}
                    onBlur={() => {
                      setBlur({ ...blur, blur2: true });
                    }}
                  />
                </label>
              </div>
              {result.pw !== result.pwCheck && blur.blur2 && (
                <p className="warn2">비밀번호 불일치</p>
              )}
            </>
          )}
          <p
            className="goLogin"
            onClick={() => {
              if (props.mode === "id") navigate("/?Login");
              else {
                const regExp =
                  /^(?=.*[a-zA-Z])(?=.*[!@#$%^~*+=-])(?=.*[0-9]).{10,20}$/;

                if (
                  result.pw !== "" &&
                  regExp.test(result.pw) &&
                  result.pw === result.pwCheck
                ) {
                  axios
                    .patch(
                      origin + "account/password/update",
                      {
                        data: {
                          id: Number(localStorage.getItem("user_id")),
                          password: result.pw,
                        },
                      },
                      {
                        headers: {
                          "Access-Control-Allow-Origin": "*",
                        },
                      }
                    )
                    .then(function (res) {
                      if (res.status === 200) {
                        alert("비밀번호 변경이 완료되었습니다.");
                        navigate("/?Login");
                      }
                    });
                } else {
                  if (result.pw !== result.pwCheck)
                    alert("입력하신 두 비밀번호가 다릅니다");
                  else
                    alert("비밀번호는 특수문자가 들어간 10자리이어야 합니다");
                }
              }
            }}
          >
            {props.mode === "id" ? "로그인 하기" : "비밀번호 변경"}
          </p>
        </div>
      </div>
    </FindCss>
  );
}

export default Find;
