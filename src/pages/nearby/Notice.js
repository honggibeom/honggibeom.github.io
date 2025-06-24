// Setting에서 공지사항 옆에 아이콘을 클릭하면 보이는 페이지입니다.
import React from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { TfiAngleLeft, TfiAngleRight } from "react-icons/tfi";

const NoticeCss = styled.div`
  width: 100vw;
  height: 100vh;
  max-width: 450px;

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

  .noticeList {
    margin: 15px 20px;
  }
  .notice {
    width: 100%;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #c8c8c888;
    .content {
      width: 90%;
    }
    .right {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 10%;
    }
  }
`;

function Notice() {
  const navigate = useNavigate();
  return (
    <NoticeCss>
      <div className="header">
        <p
          className="exit"
          onClick={() => {
            navigate(-1);
          }}
        >
          <TfiAngleLeft style={{ marginLeft: "20px" }} />
        </p>
        <p className="title text1">공지사항</p>
      </div>
      <div className="noticeList">
        <div className="notice">
          <div className="content">
            <p className="text1">[공지 이용약관관련]</p>
            <p className="text">2023.10.13</p>
          </div>
          <p className="right">
            <TfiAngleRight />
          </p>
        </div>
      </div>
    </NoticeCss>
  );
}

export default Notice;
