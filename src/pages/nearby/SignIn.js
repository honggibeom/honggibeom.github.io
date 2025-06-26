import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import Logo from "./Img/LogIn/Logo.svg";
import KakaoLogo from "./Img/LogIn/KakaoLogo.svg";
import AppleLogo from "./Img/LogIn/AppleLogo.svg";
import Background from "./Img/LogIn/Background.svg";
import { TfiAngleLeft } from "react-icons/tfi";
import { useRef } from "react";
const SignInCss = styled.div`
  width: 100vw;
  height: calc(100vh-80px);
  max-width: 450px;
  overflow: hidden;
  background-image: url(${Background});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  .link {
    text-decoration-color: #ffffff;
  }
  .wrap {
    display: flex;
    width: 200vw;
    max-width: 900px;
    overflow: hidden;
    transform: translate(${(props) => props.mode * -50}%);
    transition: 0.3s;
    .logo {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 40vh;
      margin-top: ${(props) => props.vh * 20}px;
      min-height: ${(props) => props.vh * 40}px;
      justify-content: center;
      align-items: center;
      transition: 1s;

      .objLogo {
        width: 30%;
      }
    }

    .slogan {
      width: 100%;
      display: flex;
      justify-content: center;
      font-size: 17px;
      color: #ffffff;
      letter-spacing: -0.24px;
      text-shadow: 2px 3px 2px #2f2f2f;
    }

    .container1 {
      width: 100vw;
      max-width: 450px;
      height: 95vh;
      min-height: ${(props) => props.vh * 95}px;

      .mode {
        display: flex;
        flex-direction: column;
        width: 100%;
        max-width: 450px;
        min-height: ${(props) => props.vh * 5}px;
        justify-content: center;
        align-items: center;

        img {
          width: 28px;
          height: 25.73px;
          margin-right: 4%;
        }

        .apple {
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 80%;
          height: 52px;
          margin-top: 30px;
          background: #080708;
          border-radius: 10px;
          font-family: Inter;
          font-weight: 700;
          font-size: 16px;
          color: #ffffff;
        }
        .kakao {
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 80%;
          height: 52px;
          background: #f7e600;
          border-radius: 10px;
          font-family: Inter;
          font-weight: 700;
          font-size: 16px;
          margin: 0;
        }
        .loginPage {
          text-decoration: underline;
          color: #ffffff;
          cursor: pointer;
        }
      }
    }

    .container2 {
      width: 100vw;
      max-width: 450px;
      height: 95vh;
      min-height: ${(props) => props.vh * 95}px;

      .fa-chevron-left {
        margin-top: ${(props) => props.vh * 10}px;
        margin-left: 5%;
        font-size: 24px;
        color: #ffffff;
      }
      .logo {
        margin-top: ${(props) => props.vh * 7}px;
        min-height: ${(props) => props.vh * 30}px;
        height: 30vh;
      }

      .form {
        margin: 0 2%;
        padding: 0 3%;
        .subTitle {
          margin-left: 5%;
          color: #ffffff;
          font-size: 14px;
          font-weight: 700;
        }

        .id {
          margin-bottom: ${(props) => props.vh * 2}px;
        }
      }

      .next {
        padding: 0 5%;
        margin-top: 5vh;
        .loginbtn {
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          width: 100%;
          height: 6vh;
          min-height: ${(props) => props.vh * 6}px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 16px;
          line-height: 6vh;
          color: #ffffff;
          background: #b03131;
        }

        .find {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          p {
            width: 7em;
            cursor: pointer;
            text-align: center;
            color: #ffffff;
            font-weight: 400;
            font-size: 12px;
          }
        }
      }
    }
  }

  input {
    filter: drop-shadow(#ffffff33 1px 1px 1px);
    padding: 1vh 7%;
    border: 2px solid #00000000;
    height: 4vh;
    min-height: ${(props) => props.vh * 4}px;
    width: 86%;
    font-weight: 500;
    font-size: 16px;
    background: #ffffff33;
    color: #ffffff;
    border-radius: 8px;
  }

  input::placeholder {
    color: #ffffff;
    font-size: 16px;
    opacity: 0.7;
  }

  input:focus {
    outline: 0;
    border: 2px solid #ffffff;
    background: #00000077;
  }

  .copyright {
    width: 100%;
    display: flex;
    justify-content: center;
    font-size: 12px;
    color: #ffffff;
    letter-spacing: -0.24px;
  }
`;

function SignIn() {
  const [size, setSize] = useState(
    window.innerHeight < 600 ? window.screen.availHeight : window.innerHeight
  );

  const [mode, setMode] = useState(0);
  const id = useRef("");
  const pw = useRef("");
  const navigate = useNavigate();

  const handleLogin = () => {
    const emailValue = id.current.value;
    const pwValue = pw.current.value;
    const emailReg = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

    if (!emailReg.test(emailValue)) {
      alert("올바른 이메일 형식이 아닙니다.");
      return;
    }

    alert("로그인 되었습니다");
    navigate("/");
  };

  useEffect(() => {
    window.addEventListener("resize", () => {
      setSize(
        window.innerHeight < 600
          ? window.screen.availHeight
          : window.innerHeight
      );
    });
  }, []);
  return (
    <SignInCss vh={size / 100} mode={mode}>
      <div className="wrap">
        <div className="container1">
          <div className="logo">
            <object className="objLogo" data={Logo}>
              Logo
            </object>
            <p className="slogan">새로운 문화예술의 향유, 니어바이</p>
          </div>
          <div className="mode">
            <p className="kakao" onClick={() => {}}>
              <img src={KakaoLogo} alt="kakao" />
              카카오톡으로 시작하기
            </p>

            <p
              className="apple"
              onClick={() => {
                window.location.href("/Main");
              }}
            >
              <img src={AppleLogo} alt="apple" />
              애플 로그인으로 시작하기
            </p>
            <p
              className="loginPage"
              onClick={() => {
                setMode(1);
              }}
            >
              기존 회원 로그인
            </p>
          </div>
        </div>

        <div className="container2">
          <p className="fa-solid fa-chevron-left">
            <TfiAngleLeft
              onClick={() => {
                setMode(0);
              }}
            />
          </p>
          <div className="logo">
            <object className="objLogo" data={Logo}>
              Logo
            </object>
            <p className="slogan">새로운 문화예술의 향유, 니어바이</p>
          </div>
          <div className="form">
            <p className="subTitle">이메일</p>
            <input
              type="text"
              className="id"
              placeholder="example@example.com"
              ref={id}
            />
            <p className="subTitle">비밀번호</p>
            <input
              type="password"
              className="pw"
              placeholder="비밀번호를 입력해 주세요."
              ref={pw}
            />
          </div>

          <div className="next">
            <p className="loginbtn" onClick={handleLogin}>
              로그인
            </p>
            <div className="find">
              <Link className="link" to="/find/id">
                <p className="idFind">아이디 찾기</p>
              </Link>
              <Link className="link" to="/find/password">
                <p className="pwFind">비밀번호 찾기</p>
              </Link>
              <Link className="link" to="/signup">
                <p className="signup">회원가입 하기</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <p className="copyright">Copyright ⓒODD Inc., All right reserved </p>
    </SignInCss>
  );
}

export default SignIn;
