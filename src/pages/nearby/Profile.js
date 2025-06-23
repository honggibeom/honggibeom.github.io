import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import ProfileImg from "./Img/ProfileSet/ProfileImg.svg";
import FormData from "form-data";
import { TfiAngleLeft } from "react-icons/tfi";
import { origin } from "./Origin/Origin";
const Page1Css = styled.div`
  width: 100vw;
  max-width: 450px;
  .inputContainer {
    margin: 20px;
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

  input[type="text"] {
    border: 0;
    padding: 10px 0;
    width: 100%;
    border-bottom: 1px solid #c8c8c8;
  }

  input:focus {
    outline: none;
  }

  input::placeholder {
    color: #080708;
    font-size: 12px;
    font-weight: 400;
  }

  input[type="file"] {
    display: none;
  }
  .img {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 60px;
  }

  .subHeader {
    display: flex;
  }
  .subTitle,
  .length {
    display: flex;
    align-items: center;
    width: 50%;
  }

  .length {
    justify-content: right;
  }
`;
function Page1(props) {
  const Picture = useRef("");

  return (
    <Page1Css vh={props.vh}>
      <label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            var reader = new FileReader();
            reader.onload = function (event) {
              Picture.current.src = event.target.result;
              props.setPage1({
                ...props.page1,
                img: event.target.result,
                imgObj: e.target.files[0],
              });
            };
            reader.readAsDataURL(e.target.files[0]);
          }}
        />

        <div className="img">
          <img
            src={props.page1.img === null ? ProfileImg : props.page1.img}
            alt="ProfileImg"
            ref={Picture}
          />
        </div>
      </label>

      <div className="inputContainer">
        <div className="subHeader text1">
          <p className="subTitle text1">프로필 이름</p>
          <p className="length text">{props.page1.nickName.length + "/25"}</p>
        </div>
        <input
          type="text"
          placeholder="사용자 닉네임을 입력해 주세요"
          defaultValue={props.page1.nickName}
          onChange={(e) => {
            if (e.target.value.length > 25)
              e.target.value = e.target.value.substring(0, 25);

            props.setPage1({
              ...props.page1,
              nickName: e.target.value,
            });
          }}
        />
      </div>

      <div className="inputContainer">
        <div className="subHeader text1">
          <p className="subTitle text1">소개</p>
          <p className="length text">{props.page1.introduce.length + "/225"}</p>
        </div>
        <input
          type="text"
          placeholder="나만의 소개글을 작성해 보세요"
          defaultValue={props.page1.introduce}
          onChange={(e) => {
            if (e.target.value.length > 225)
              e.target.value = e.target.value.substring(0, 225);

            props.setPage1({ ...props.page1, introduce: e.target.value });
          }}
        />
      </div>
    </Page1Css>
  );
}

const ProfileCss = styled.form`
  overflow: hidden;
  width: 100vw;
  height: 100vh;
  max-width: 450px;
  min-height: ${(props) => props.vh * 100}px;

  .link {
    text-decoration-line: none;
  }

  .layout {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  .header {
    flex: 1;
    display: flex;
    padding: 10px 20px;
    align-items: center;
    .exit {
      width: 10%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    }

    .title {
      width: 80%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
    }
  }
  .container {
    flex: 9;
    display: flex;
    margin-top: 60px;
  }

  .next {
    display: flex;
    justify-content: center;
    width: ${window.innerWidth > 450 ? 410 : window.innerWidth - 40}px;
    padding: 14px 0;
    color: #ffffff;
    background: #981c26;
    margin-top: auto;
    margin-left: 20px;
    margin-right: 20px;
    font-size: 14px;
    font-weight: 600;
    border-radius: 100px;
  }
`;

function Profile() {
  const navigate = useNavigate();
  const [size, setSize] = useState(
    window.innerHeight < 600 ? window.screen.availHeight : window.innerHeight
  );
  const [page1, setPage1] = useState({
    img: ProfileImg,
    nickName: "",
    introduce: "",
    imgObj: "",
  });

  useEffect(() => {
    window.addEventListener("resize", () => {
      setSize(
        window.innerHeight < 600
          ? window.screen.availHeight
          : window.innerHeight
      );
    });
    axios
      .get(origin + "account/" + sessionStorage.getItem("id"))
      .then((res) => {
        let data = res.data.data;
        setPage1({
          ...page1,
          img: data.profile_image,
          nickName: data.nickname === null ? "" : data.nickname,
          introduce: data.description === null ? "" : data.description,
        });
      });
  }, []);

  async function profileSet() {
    var imgdata = new FormData();

    let res = await axios.get(
      "https://deso-us.com/api/v1/account/" + sessionStorage.getItem("id")
    );

    const userData = res.data.data;

    if (page1.imgObj !== "") {
      imgdata.append("multipartFile", page1.imgObj);
      let res1 = await axios.post(
        "https://deso-us.com/api/v1/image/upload?dir=profile/" +
          sessionStorage.getItem("id"),
        { data: imgdata },
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );

      const imgurl =
        "https://deso-spring.s3.ap-northeast-2.amazonaws.com/" +
        res1.data.data[0];

      await axios.patch("https://deso-us.com/api/v1/account/update", {
        data: {
          ...userData,
          nickname: page1.nickName,
          profile_image: imgurl,
          description: page1.introduce,
        },
      });

      alert("프로필이 설정되었습니다");
      navigate("/");
    } else {
      await axios.patch(
        "https://deso-us.com/api/v1/account/update",
        {
          data: {
            ...userData,
            nickname: page1.nickName,
            profile_image: page1.img,
            description: page1.introduce,
          },
        },
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        }
      );

      alert("프로필이 설정되었습니다");
      navigate("/MyPage");
    }
  }
  const next = () => {
    if (page1.nickName.length > 1) profileSet();
    else alert("닉네임은 한글자 이상이어야 합니다.");
  };
  return (
    <ProfileCss vh={size / 100}>
      <div className="layout">
        <div className="header">
          <p
            className="exit"
            onClick={() => {
              navigate(-1);
            }}
          >
            <TfiAngleLeft />
          </p>
          <p className="title">프로필 관리</p>
        </div>
        <div className="container">
          <Page1 page1={page1} setPage1={setPage1} vh={size / 100} />
        </div>
        <p
          className="next"
          onClick={() => {
            next();
          }}
        >
          저장하기
        </p>
      </div>
    </ProfileCss>
  );
}

export default Profile;
