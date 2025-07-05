// Setting에서 계정 관리 옆에 아이콘을 클릭하면 보이는 페이지입니다.
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { TfiAngleLeft, TfiAngleRight } from "react-icons/tfi";

const AccountManageCss = styled.div`
  width: 100vw;
  max-width: 450px;
  height: 80vh;
  @media only screen and (min-width: 1024px) {
    height: 100vh;
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

  .content {
    margin: 40px 20px;
  }
  .menu {
    display: flex;
    align-items: center;
    margin-top: 5%;
  }
  .delete {
    width: 90%;
  }
  .right {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 10%;
  }

  label {
    display: flex;
    border-bottom: 1px solid #c8c8c8;
    width: 100%;
    padding: 10px 0px;
    font-size: 12px;
    justify-content: space-between;
  }

  input {
    border: 0;
    background-color: #ffffff00;
    width: 80%;
  }
  .resetpw {
    text-decoration: none;
    color: #ffffff;
    padding: 4px 12px;
    background-color: #981c26;
    border-radius: 100px;
  }
`;

function AccountManage() {
  const navigate = useNavigate();
  const [data, setData] = useState({ email: "" });
  return (
    <AccountManageCss>
      <div className="header">
        <p
          className="exit"
          onClick={() => {
            navigate(-1);
          }}
        >
          <TfiAngleLeft style={{ marginLeft: "20px" }} />
        </p>
        <p className="title text1">계정 관리</p>
      </div>
      <div className="content">
        <div>
          <p className="idpw">아이디(이메일)</p>
          <label>
            <input type="text" disabled={true} value={data.email} />
          </label>
          <p className="idpw">비밀번호</p>
          <label>
            <input type="password" disabled={true} value={1234567890} />
            <Link className="resetpw" to="/find/password">
              재설정
            </Link>
          </label>
        </div>

        <Link
          to="/delete-account"
          className="menu"
          style={{ textDecoration: "none" }}
        >
          <p className="delete text1"> 계정 삭제</p>
          <p className="right">
            <TfiAngleRight />
          </p>
        </Link>
      </div>
    </AccountManageCss>
  );
}

export default AccountManage;
