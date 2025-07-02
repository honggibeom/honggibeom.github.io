// Setting에서 고객센터 옆에 아이콘을 클릭하면 보이는 페이지입니다.
import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
//이미지
//아이콘
import { TfiAngleLeft } from "react-icons/tfi";
import kakao from "./Img/UserService/kakaoLogo.svg";
import userServiceIcon from "./Img/UserService/userService.svg";
// ----------------------------------------- Header -----------------------------------------

const UserServiceCss = styled.div`
  width: 100vw;
  max-width: 450px;
  height: 100vh;
  overflow: auto;

  .header {
    padding: 10px 0;
    width: 100%;
    display: flex;
    align-items: center;

    .title {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 80%;
    }

    .exit {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 10%;
      font-size: 20px;
    }
  }

  .kakao {
    display: flex;
    align-items: center;
    width: ${window.innerWidth > 450 ? 410 : window.innerWidth - 40}px;
    height: 55px;
    margin: 0 20px;
    justify-content: center;
    border-radius: 8px;
    background-color: #f7e600;
    text-decoration: none;
    margin-top: 40px;

    img {
      margin-right: 8px;
    }
  }
  .text0 {
    font-size: 12px;
    font-weight: 600;
    color: #080708;
  }

  .text {
    font-size: 12px;
    font-weight: 400;
    color: #080708;
  }

  .text1 {
    font-size: 14px;
    font-weight: 600;
    color: #080708;
  }
  .text2 {
    font-size: 16px;
    font-weight: 400;
    color: #080708;
  }

  .text3 {
    font-size: 16px;
    font-weight: 600;
    color: #080708;
  }

  .gray {
    margin-top: 20px;
    color: #525252;
  }

  .margin {
    margin-left: 14px;
  }
  .content {
    margin: 100px 20px 80px 20px;
  }
  .img {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 60px 0;
  }
`;

function UserService() {
  const navigate = useNavigate();

  return (
    <UserServiceCss>
      <div className="header">
        <p
          className="exit"
          onClick={() => {
            navigate(-1);
          }}
        >
          <TfiAngleLeft style={{ marginLeft: "20px" }} />
        </p>
        <p className="title text1">고객 센터</p>
      </div>
      <div className="content">
        <p className="text2">
          <span className="text3"> 궁금한점</span>이 있으신가요?
        </p>
        <p className="text2">
          <span className="text3">고객센터</span>에서 답변해 드리겠습니다.
        </p>
        <div className="img">
          <img src={userServiceIcon} alt="userServiceIcon" />
        </div>
        <p className="text1">운영시간 안내</p>
        <p className="text">
          <span className="text0"> 접수시간</span>
          <span className="margin">24시간 접수 가능</span>
        </p>
        <p className="text">
          <span className="text0">답변 시간</span>
          <span className="margin">
            평일 09:00 ~ 18:00 ( 토·일 공휴일 제외 )
          </span>
        </p>
        <p className="text gray">
          답변 시간 이후 접수건은 운영시간 내 순차적으로 답변해 드립니다.
        </p>
      </div>
      <a href="https://pf.kakao.com/_nVnYxj" className="kakao text1">
        <img src={kakao} alt={"kakao"} />
        카카오톡 채널로 문의하기
      </a>
    </UserServiceCss>
  );
}

export default UserService;
