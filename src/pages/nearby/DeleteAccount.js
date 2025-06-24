import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import { BsDot } from "react-icons/bs";
import { TfiAngleLeft } from "react-icons/tfi";
import checkedIcon from "./Img/Report/checked.svg";
import notCheckedIcon from "./Img/Report/notChecked.svg";

const DeleteAccountCss = styled.div`
  width: 100vw;
  height: 100vh;
  min-height: ${window.screen.availHeight}px;
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

  .content {
    margin: 0 20px;
    .text {
      display: flex;
      align-items: center;
    }
  }

  .content1 {
    margin: 40px 20px;

    .reason {
      margin: 15px 0;
    }

    label {
      display: flex;
      align-items: center;

      .text {
        margin-left: 8px;
      }
    }
    textarea {
      margin: 20px 0;
      padding: 10px 2%;
      width: 96%;
      border-radius: 6px;
      height: 92px;
      border: 1px solid #c8c8c8;
      resize: none;
      font-size: 12px;
      font-weight: 400;
    }
    textarea:focus {
      outline: 0;
    }
    textarea::placeholder {
      font-size: 12px;
      font-weight: 400;
    }
    .delete {
      margin: 100px 0;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 100px;
      color: #fff;
      padding: 20px 0;
      background: #981c26;
    }
  }
`;
function DeleteAccount() {
  const navigate = useNavigate();
  const [reason, setReason] = useState({
    "앱을 자주 사용하지 않습니다": false,
    "원하는 관심사의 이벤트가 없습니다.": false,
    "앱 사용이 어렵습니다": false,
    "가까운 지역의 이벤트가 없습니다": false,
    "다른 계정으로 재가입을 원합니다": false,
    직접입력: false,
  });

  return (
    <DeleteAccountCss>
      <div className="header">
        <p
          className="exit"
          onClick={() => {
            navigate(-1);
          }}
        >
          <TfiAngleLeft style={{ marginLeft: "20px" }} />
        </p>
        <p className="title text1">계정 삭제</p>
      </div>

      <div className="content">
        <p className="text1">떠나신다니 많이 아쉽습니다.</p>

        <p className="text">
          <BsDot style={{ fontSize: "16px" }} />
          계정 삭제 시 회원 정보 및 서비스 이용 기록이 삭제됩니다.
        </p>
        <p className="text">
          <BsDot style={{ fontSize: "16px" }} />
          재가입하더라도 기존 정보의 복구는 불가능 합니다.
        </p>
      </div>
      <div className="content1">
        <p className="text1">계정 삭제 이유</p>
        {Object.keys(reason).map((e, idx) => {
          return (
            <div className="reason" key={idx}>
              <input
                type="checkbox"
                style={{ display: "none" }}
                id={"checkbox" + idx}
                onChange={(event) => {
                  let buf = {
                    "앱을 자주 사용하지 않습니다": false,
                    "원하는 관심사의 이벤트가 없습니다.": false,
                    "앱 사용이 어렵습니다": false,
                    "가까운 지역의 이벤트가 없습니다": false,
                    "다른 계정으로 재가입을 원합니다": false,
                    직접입력: false,
                  };
                  buf[e] = event.target.checked;
                  setReason(buf);
                }}
              />
              <label htmlFor={"checkbox" + idx}>
                <img
                  src={reason[e] ? checkedIcon : notCheckedIcon}
                  alt="check"
                />
                <span className="text">{e}</span>
              </label>
            </div>
          );
        })}

        <textarea placeholder="계정 삭제 이유를 알려주시면 서비스 개선에 적극적으로 반영하겠습니다!"></textarea>

        <p className="delete" onClick={() => {}}>
          계정 삭제하기
        </p>
      </div>
    </DeleteAccountCss>
  );
}

export default DeleteAccount;
