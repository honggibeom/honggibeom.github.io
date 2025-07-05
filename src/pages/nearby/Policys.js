import React, { useState } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { TfiAngleLeft, TfiAngleRight } from "react-icons/tfi";
const PolicysCss = styled.div`
  width: 100vw;
  height: 80vh;
  @media only screen and (min-width: 1024px) {
    .mainContainer {
      height: 100vh;
    }
  }
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
`;

function Policys() {
  const [menu, setMenu] = useState([
    {
      name: "이용약관",
      url: "https://www.notion.so/fcb7ba21cca44f7ba23a376a8bae94f3?pvs=4",
    },
    {
      name: "개인정보처리방침",
      url: "https://www.notion.so/fe706f9c91504c05b0e42dff91a88564?pvs=4",
    },
    {
      name: "위치정보 서비스 이용약관",
      url: "https://www.notion.so/c9a78f19db0845eda88afe53c51fd1bc?pvs=4",
    },
    {
      name: "사업자 정보",
      url: "https://www.ftc.go.kr/bizCommPop.do?wrkr_no=8484800535",
    },
  ]);
  const navigate = useNavigate();
  const MenuElement = ({ url, name }) => {
    return (
      <div className="menuContainer">
        <Link to={url} style={{ textDecoration: "none" }}>
          <div className="menu">
            <p className="text">{name}</p>
            <p className="move">
              <TfiAngleRight style={{ color: "#000000" }} />
            </p>
          </div>
        </Link>
      </div>
    );
  };

  return (
    <PolicysCss>
      <div className="header">
        <p
          className="exit"
          onClick={() => {
            navigate(-1);
          }}
        >
          <TfiAngleLeft style={{ marginLeft: "20px" }} />
        </p>
        <p className="title text1">약관 및 정책</p>
      </div>
      <div>
        {menu.map((e, idx) => {
          return <MenuElement url={e.url} name={e.name} key={idx} />;
        })}
      </div>
    </PolicysCss>
  );
}

export default Policys;
