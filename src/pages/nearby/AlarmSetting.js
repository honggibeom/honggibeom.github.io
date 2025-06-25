import React, { useRef, useState } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { TfiAngleLeft, TfiAngleRight } from "react-icons/tfi";
const AlarmSettingCss = styled.div`
  width: 100vw;
  height: calc(100vh - 80px);
  max-width: 450px;

  .text {
    font-size: 16px;
    font-weight: 500;
    color: #080708;
  }

  .text1 {
    font-size: 14px;
    font-weight: 600;
    color: #080708;
  }

  .text2 {
    font-size: 12px;
    font-weight: 400;
    color: #9da3ae;
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

  .menuContainer {
    padding: 10px 0;
    margin: 0 20px;
    .menu {
      display: flex;
      align-items: center;
    }
    .text {
      display: flex;
      align-items: center;
      width: 50%;
    }
    .move {
      display: flex;
      align-items: center;
      justify-content: right;
      width: 50%;
      margin: 0;
    }
  }

  input[type="checkbox"] {
    display: none;
  }

  .onOff {
    display: flex;
    width: 54px;
    height: 32px;
    border-radius: 30px;
    background: #ff6827;
    justify-content: right;
    transition: 0.5s;
    .wheel {
      width: 26px;
      height: 26px;
      margin: 3px;
      background: #ffffff;
      border-radius: 100%;
    }
  }

  .onOff1 {
    ${(props) => !props.onOff1 && "justify-content:left"};
    ${(props) => !props.onOff1 && "background: #c8c8c8"};
  }

  .onOff2 {
    ${(props) => !props.onOff2 && "justify-content:left"};
    ${(props) => !props.onOff2 && "background: #c8c8c8"};
  }
`;

function AlarmSetting(props) {
  const navigate = useNavigate();
  const [onOff1, setOnOff1] = useState(false);
  const [onOff2, setOnOff2] = useState(false);
  return (
    <AlarmSettingCss onOff1={onOff1} onOff2={onOff2}>
      <div className="header">
        <p
          className="exit"
          onClick={() => {
            navigate(-1);
          }}
        >
          <TfiAngleLeft style={{ marginLeft: "20px" }} />
        </p>
        <p className="title text1">알림설정</p>
      </div>
      <div>
        <div className="menuContainer">
          <div className="menu">
            <p className="text">앱 푸시 알림</p>
            <div className="move">
              <label htmlFor="btn1" className="onOff onOff1">
                <p className="wheel" />
              </label>
              <input
                type="checkbox"
                id="btn1"
                onClick={(e) => {
                  setOnOff1(e.target.checked);
                }}
              />
            </div>
          </div>
          <p className="text2">
            {
              "알람이 오지 않을 경우 [설정>알림] 에서 니어바이 앱 알림 설정을 허용해주세요"
            }
          </p>
          {sessionStorage.getItem("id") !== null && (
            <div className="menu">
              <p className="text">마케팅 활용 동의</p>
              <div className="move">
                <label htmlFor="btn2" className="onOff onOff2">
                  <p className="wheel" />
                </label>
                <input
                  type="checkbox"
                  id="btn2"
                  onClick={(e) => {
                    setOnOff2(e.target.checked);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </AlarmSettingCss>
  );
}

export default AlarmSetting;
