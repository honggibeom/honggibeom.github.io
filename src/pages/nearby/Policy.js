// Setting에서 약관 및 정책 옆에 아이콘을 클릭하면 보이는 페이지입니다.
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { TfiAngleLeft } from "react-icons/tfi";
//아이콘
import TOS from "./Function/TOS";

const PolicyCss = styled.div`
  width: 100vw;
  height: 80vh;
  @media only screen and (min-width: 1024px) {
    .mainContainer {
      height: 100vh;
    }
  }
  max-width: 450px;
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

  .tos {
    padding: 0 20px;
    margin: 40px 0;
  }
`;

function Policy(props) {
  const navigate = useNavigate();
  const [tos, setTos] = useState(props.tos);
  return (
    <PolicyCss>
      <div className="header">
        <p
          className="exit"
          onClick={() => {
            navigate(-1);
          }}
        >
          <TfiAngleLeft style={{ marginLeft: "20px" }} />
        </p>
        <p className="title text1">이용약관</p>
      </div>
      <p className="tos text">
        {TOS(tos)
          .split("\n")
          .map((e, idx) => {
            return (
              <span key={idx}>
                {e}
                <br />
              </span>
            );
          })}
      </p>
    </PolicyCss>
  );
}

export default Policy;
