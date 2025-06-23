import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import React, { useState, useEffect, useRef } from "react";
import Footer from "./Component/Footer";
import proFileImg from "./Img/ProfileSet/ProfileImg.svg";
import axios from "axios";
import { TfiAngleRight } from "react-icons/tfi";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken } from "firebase/messaging";
import { origin } from "./Origin/Origin";
const MyPageCss = styled.div`
  width: 100vw;
  height: 100vh;
  max-width: 450px;
  overflow: auto;

  .header {
    padding: 10px 0;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
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

  .userInfo {
    margin-top: 30px;
    margin-bottom: 40px;
    padding: 0 20px;
    display: flex;
    align-items: center;
    .content {
      margin-left: 20px;
      width: 70%;
    }
  }

  .menuContainer {
    padding: 10px 0;
    margin: 0 20px;
    border-top: 1px solid #c8c8c8;
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

function MyPage() {
  const navigate = useNavigate();
  const token = useRef("");
  const [data, setData] = useState({});
  const [popup, setPopup] = useState(false);
  const [menu, setMenu] = useState({
    일반: [
      {
        name: "아이디 찾기",
        url: "/FindId",
      },
      {
        name: "비밀번호 찾기",
        url: "/FindId",
      },
    ],
    정보: [
      { name: "공지사항", url: "/Notice" },
      { name: "약관 및 정책", url: "/Policys" },
      { name: "고객센터", url: "/UserService" },
      { name: "알림설정", url: "/AlarmSetting" },
    ],
  });

  const firebaseConfig = {
    apiKey: "AIzaSyC_fYRs6WzGLTnyuOoKYvURuZw0ZbEJPrk",
    authDomain: "desoadmin.firebaseapp.com",
    projectId: "desoadmin",
    storageBucket: "desoadmin.appspot.com",
    messagingSenderId: "260314271589",
    appId: "1:260314271589:web:39990dc95432e73d595b8c",
    measurementId: "G-F98D6CBHN4",
  };

  // const app = initializeApp(firebaseConfig);
  // const analytics = getAnalytics(app);
  // const messaging = getMessaging(app);
  function getOs() {
    var varUA = navigator.userAgent.toLowerCase(); //userAgent 값 얻기

    if (varUA.indexOf("android") > -1) {
      //안드로이드
      return "android";
    } else if (
      varUA.indexOf("iphone") > -1 ||
      varUA.indexOf("ipad") > -1 ||
      varUA.indexOf("ipod") > -1
    ) {
      //IOS
      return "ios";
    } else {
      //아이폰, 안드로이드 외
      return "other";
    }
  }
  useEffect(() => {
    if (sessionStorage.getItem("id") || false) {
      setMenu({
        ...menu,
        일반: [
          {
            name: "관심 분야 설정",
            url: "/Recommend",
          },

          {
            name: "찜 내역",
            url: "/Bookmark",
          },
          {
            name: "티켓 예매내역",
            url: "/ReserveTicket",
          },
          {
            name: "관람후기",
            url: "/",
          },
          {
            name: "계정 관리",
            url: "/Accountmanage",
          },
        ],
      });
      axios
        .get(origin + "account/" + sessionStorage.getItem("id"))
        .then((res) => {
          setData(res.data.data);
        })
        .catch((e) => {
          console.log(e);
        });
    } else {
      setMenu({
        ...menu,
        일반: [
          {
            name: "아이디 찾기",
            url: "/FindId",
          },
          {
            name: "비밀번호 찾기",
            url: "/FindPw",
          },
        ],
      });
    }
  }, []);

  const logout = () => {
    sessionStorage.removeItem("id");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user_id");
    localStorage.removeItem("deso_id");
    localStorage.removeItem("deso_pw");
    alert("로그아웃 되었습니다");
    navigate("/");
  };

  const MenuElement = (props) => {
    return (
      <div className="menuContainer">
        <p className="text1">{props.title}</p>
        <div>
          {props.menu.map((e, idx) => {
            return (
              <Link to={e.url} style={{ textDecoration: "none" }} key={idx}>
                <div className="menu">
                  <p className="text">{e.name}</p>
                  <p className="move">
                    <TfiAngleRight style={{ color: "#080708" }} />
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <MyPageCss popup={popup}>
      <p className="header text1">마이 페이지</p>
      <div className="userInfo">
        <img
          src={
            sessionStorage.getItem("id") !== null &&
            sessionStorage.getItem("id") !== undefined &&
            data.profile_image !== undefined &&
            data.profile_image !== null
              ? data.profile_image
              : proFileImg
          }
          alt="profileImg"
        />
        <div className="content">
          <p className="nickname text1">
            {sessionStorage.getItem("id") !== null &&
            sessionStorage.getItem("id") !== undefined
              ? data.nickname
              : "로그인 해주세요"}
          </p>
          <p className="nickname text">
            {sessionStorage.getItem("id") !== null &&
            sessionStorage.getItem("id") !== undefined &&
            data.description !== undefined &&
            data.description !== null
              ? data.description
              : "나만의 소개글을 작성해 보세요"}
          </p>
        </div>
        <Link
          to={
            sessionStorage.getItem("id") !== null &&
            sessionStorage.getItem("id") !== undefined
              ? "/ProfileSet?edit"
              : "/SignIn"
          }
          style={{ textDecoration: "none" }}
        >
          <TfiAngleRight style={{ fontSize: "24px", color: "#080708" }} />
        </Link>
      </div>
      <div>
        {Object.keys(menu).map((e, idx) => {
          return <MenuElement title={e} menu={menu[e]} key={idx} />;
        })}
      </div>
      <div className="menuContainer">
        {sessionStorage.getItem("id") !== null &&
        sessionStorage.getItem("id") !== undefined ? (
          <p
            className="menu text1"
            onClick={() => {
              logout();
            }}
          >
            로그아웃
          </p>
        ) : (
          <Link to={"/SignIn"} style={{ textDecoration: "none" }}>
            <p className="menu text1">로그인</p>
          </Link>
        )}
      </div>

      <div style={{ height: "60px", width: "100%" }}></div>
      <Footer mode={3} />
    </MyPageCss>
  );
}

export default MyPage;
