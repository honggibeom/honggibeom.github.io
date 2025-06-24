import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { IoIosArrowBack } from "react-icons/io";

const HeaderCss = styled.div`
  width: 100%;
  height: ${(props) => props.vh * 6}px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid #00000022;
  .arrowBackIcon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 10%;
    font-size: 24px;
  }
  p {
    text-align: center;
    width: 80%;
    margin-right: 10%;
    font-weight: bold;
    font-size: 17px;
  }
`;

function Header(props) {
  const navigate = useNavigate();

  return (
    <HeaderCss vh={props.vh}>
      <div
        className="arrowBackIcon"
        onClick={() => {
          navigate(-1);
        }}
      >
        <IoIosArrowBack color="black" />
      </div>
      <p>신고하기</p>
    </HeaderCss>
  );
}

const ReportCss = styled.div`
  width: 100vw;
  height: ${(props) => props.vh * 100}px;
  max-width: 450px;

  .text {
    margin-top: ${(props) => props.vh * 3}px;
    width: 90%;
    margin-left: 5%;
  }
  .text1 {
    font-size: 16px;
    font-weight: 700;
    letter-spacing: -0.32px;
  }
  .text2 {
    font-size: 12px;
    font-weight: 400;
    color: #9698a0;
  }
  label {
    display: flex;
    align-items: center;
    margin-left: 5%;
    p {
      margin-left: 3%;
      color: gray;
    }
  }

  textarea {
    width: 84%;
    border-radius: 8px;
    border: 1px solid #00000033;
    height: ${(props) => props.vh * 20}px;
    margin: ${(props) => props.vh * 3}px 5%;
    padding: 1% 3%;
  }
  textarea:focus {
    outline: none;
    border: 1px solid #b03131;
  }
  textarea::placeholder {
    color: #00000088;
    font-size: 14px;
  }
  input[type="checkbox"] {
    width: 24px;
    height: 24px;
    border: 1px solid #999;
    appearance: none;
    cursor: pointer;
    border-radius: 100%;
  }
  input[type="checkbox"]:checked {
    border: 0;
  }
  .report {
    position: fixed;
    display: flex;
    align-items: center;
    justify-content: center;
    bottom: 0;
    width: 100%;
    max-width: 450px;
    margin: 0;
    height: ${(props) => props.vh * 6}px;
    background: #b03131;
    color: #ffffff;
  }
`;
function Report() {
  const navigate = useNavigate();
  const content = useRef("");
  const location = useLocation();
  const [mode, setMode] = useState("");
  const [size, setSize] = useState(
    window.innerHeight < 600 ? window.screen.availHeight : window.innerHeight
  );
  const [reason, setReason] = useState({
    스팸: false,
    "사기 또는 거짓": false,
    "지식 재산권 침해": false,
    "불법 또는 규제 상품 판매": false,
    "음란/유해 게시물": false,
    기타: false,
  });
  useEffect(() => {
    window.addEventListener("resize", () => {
      setSize(
        window.innerHeight < 600
          ? window.screen.availHeight
          : window.innerHeight
      );
    });
    setMode(location.search.split("mode=")[1]);
  }, []);
  return (
    <ReportCss vh={size / 100}>
      <Header vh={size / 100} />
      <div className="text">
        <p className="text1">신고하는 이유를 작성해주세요</p>
        <p className="text2">
          지식재산권 침해를 신고하는 경우를 제외하고 회원님의 신고는 익명으로
          처리됩니다. 누군가 위급한 상황에 있다고 생각된다면 즉시 현지 응급
          서비스 기관에 연락하시기 바랍니다.
        </p>
      </div>
      <div>
        {Object.keys(reason).map((element, idx) => {
          return (
            <label key={idx}>
              <input
                type="checkbox"
                onChange={(e) => {
                  let buf = { ...reason };
                  buf[element] = e.target.checked;
                  setReason({ ...buf });
                }}
              />
              <p>{element}</p>
            </label>
          );
        })}
      </div>
      <textarea
        placeholder="신고 상세 내용을 입력해주세요 (선택)"
        ref={content}
      ></textarea>
      <p className="report">신고하기</p>
    </ReportCss>
  );
}

export default Report;
