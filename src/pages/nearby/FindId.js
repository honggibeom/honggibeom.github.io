import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useRef } from "react";
import { TfiAngleLeft } from "react-icons/tfi";
import { useNavigate } from "react-router-dom";
const FindIdCss = styled.div`
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
    min-height: ${(props) => props.vh * 80}px;
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
        font-size: 16px;
        letter-spacing: -0.02em;
        font-weight: 500;
        color: #222222;
      }

      .id {
        width: 80%;
      }

      .phone {
        width: 65%;
        padding-left: 2vw;
        box-sizing: border-box;
      }

      label {
        margin-top: 1vh;
        display: block;
        width: 90vw;
        max-width: 400px;
        height: 5vh;
        border: 1px solid #d2d4dc;
        margin-left: 5%;
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
        bottom: 80px;
        cursor: pointer;
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
        border: 1px solid #d2d4dc;
        margin-left: 5%;
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

function FindId() {
  const id = useRef();
  const navigate = useNavigate();
  const phone = useRef();
  const check = useRef();

  //데이터 포맷 확인
  const [phoneNumber, setPhoneNumber] = useState("");
  const [btn, setBtn] = useState({
    btn1: false,
    btn2: false,
    id: "",
    phone: "",
    checkInput: "",
  });
  const [page, setPage] = useState(0);
  const [email, setEmail] = useState("");
  const [size, setSize] = useState(
    window.innerHeight < 600 ? window.screen.availHeight : window.innerHeight
  );

  const formatPhone = (value) => {
    const digits = String(value).replace(/\D/g, "");
    if (digits.length < 4) return digits;
    if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
  };

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

  // useEffect(() => {
  //   if (page === 0) setResult({ ...result, top: "100" });
  //   else setResult({ ...result, top: "10" });
  // }, [page]);

  return (
    <FindIdCss btn={btn} page={page} vh={size / 100}>
      <div className="header">
        <div className="fa-solid fa-angle-left">
          <TfiAngleLeft
            onClick={() => {
              navigate(-1);
            }}
          />
        </div>
        <div className="step">
          <p className="step1"></p>
          <p className="step2"></p>
        </div>
      </div>
      <p className="title">아이디 찾기</p>
      <p className="guide">
        {page === 0
          ? "가입시에 사용된 전화번호를 입력해 주세요"
          : "아이디를 확인하세요"}
      </p>
      <div className="find">
        <div className="page1">
          <p className="subTitle">전화번호</p>
          <div className="first">
            <label ref={phone}>
              <input
                type="text"
                className="phone"
                placeholder="010-1234-5678"
                value={phoneNumber}
                onFocus={() => {
                  phone.current.style.border = "1px solid #B03131";
                }}
                onBlur={() => {
                  phone.current.style.border = "1px solid #D2D4DC";
                }}
                onChange={(e) => {
                  const formattedNumber = formatPhone(e.target.value);
                  setPhoneNumber(formattedNumber);
                  const rawLen = formattedNumber.replace(/\D/g, "").length;
                  setBtn({
                    ...btn,
                    btn1: rawLen === 11,
                    phone: formattedNumber,
                  });
                }}
              />

              <p
                className="btn1"
                onClick={() => {
                  if (btn.btn1) {
                    alert("인증번호를 입력한 전화번호로 보냈습니다.");
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
                className="phone"
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
                  setPage(1);
                  setEmail("nearby");
                }}
              >
                &nbsp;&nbsp;&nbsp;확인&nbsp;&nbsp;&nbsp;
              </p>
            </label>
          </div>
        </div>

        <div className="page2">
          <p className="result">{email}</p>
          <p
            className="goLogin"
            onClick={() => {
              navigate("/signin");
            }}
          >
            로그인 하기
          </p>
        </div>
      </div>
    </FindIdCss>
  );
}

export default FindId;
