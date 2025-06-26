import styled from "styled-components";
import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import Footer from "./Component/Footer";

//이미지
import { TfiAngleLeft, TfiAngleRight } from "react-icons/tfi";
import dateIcon from "./Img/Detail/date.svg";
import locationIcon from "./Img/Detail/location.svg";
import fillstarIcon from "./Img/Detail/fillstar.svg";
import emptystarIcon from "./Img/Detail/emptyStar.svg";
import cameraIcon from "./Img/EventReviewCreateForm/camera.svg";

const EventReviewCreateFormCss = styled.div`
  width: 100vw;
  max-width: 450px;
  height: calc(100vh-80px);
  overflow-x: hidden;
  overflow-y: auto;
  .header {
    display: flex;
    align-items: center;
    width: 100%;
    .headerTitle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 80%;
      font-size: 14px;
      font-weight: 600;
    }
  }

  .title {
    font-size: 14px;
    font-weight: 600;
  }

  .container {
    margin: 0 20px;
    padding: 20px 0 10px 0;
    border-bottom: 1px solid #c8c8c8;
    .category {
      font-size: 14px;
      font-weight: 600;
    }
    .star {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 20px 0 8px 0;
    }
    .starRating {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: 600;
      margin-top: 0;
      margin-bottom: 40px;
      .gray {
        color: #c8c8c8;
        margin-right: 3px;
      }
    }
  }
  .eventInfo {
    display: flex;
    align-items: center;
    margin: 10px 0;
    .text {
      margin-left: 8px;
      font-size: 12px;
      font-weight: 400;
    }
  }

  .container1 {
    margin: 0 20px;
    padding: 20px 0 10px 0;
    .imgList {
      display: flex;
      width: 100%;
      overflow-x: auto;
      padding: 20px 0;
      gap: 10px;
      .pictureNum {
        color: #c8c8c8;
        margin: 0;
      }
      .img {
        width: 60px;
        height: 80px;
        object-fit: cover;
      }
    }
    .addImg {
      width: 60px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      border: 1px solid #c8c8c8;
    }
    textarea {
      width: 96%;
      height: 150px;
      resize: none;
      padding: 2%;
    }
    textarea:focus {
      outline: none;
    }
    textarea::placeholder {
      color: #525252;
      font-size: 12px;
      font-weight: 400;
    }
    .limit {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: right;

      span {
        font-size: 12px;
        font-weight: 400;
      }
    }
  }
  .next {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #981c26;
    margin-top: 50px;
    width: 100%;
    height: 48px;
    border-radius: 100px;
    font-size: 14px;
    font-weight: 600;
    color: #fff;
  }
`;

function EventReviewCreateForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const content = useRef();
  const [load, setLoad] = useState(false);
  const [review, setReview] = useState({});
  const [event, setEvent] = useState({});
  const [startDate, setStartDate] = useState("준비중");
  const [endDate, setEndDate] = useState("마감시 종료");
  const [starRating, setStarRating] = useState((0).toFixed(1));
  const [newImg, setNewImg] = useState({ img: [], obj: [] });
  const [existImg, setExistImg] = useState([]);
  const [len, setLen] = useState(0);
  const [edit, setEdit] = useState(false);
  const color = {
    전시회: "#1593FF",
    공연: "#F3757C",
    축제: "#EFA116",
    "원데이 클래스": "#981C26",
  };
  function dateFromat(date) {
    return date.split("T")[0].replace("-", ".").replace("-", ".");
  }

  const StarComponent = (props) => {
    let buf = [];
    let size = props.size === null ? "14px" : props.size + "px";
    for (let i = 0; i < 5; i++) {
      buf.push(
        <img
          src={i < Math.floor(starRating) ? fillstarIcon : emptystarIcon}
          alt=""
          key={i}
          style={{ width: size, height: size }}
          onClick={() => {
            setStarRating((i + 1).toFixed(1));
          }}
        />
      );
    }
    return buf;
  };

  const next = () => {
    if (starRating <= 0) {
      alert("별점을 입력해주세요");
      return;
    }
  };

  const handleSubmitReview = () => {
    alert("후기가 성공적으로 등록되었습니다.");
    navigate("/event/detail");
  };

  return (
    <EventReviewCreateFormCss>
      <div className="header">
        <TfiAngleLeft
          style={{ fontSize: "20px", marginLeft: "20px" }}
          onClick={() => {
            navigate("/event/detail");
          }}
        />
        <p className="headerTitle">관람 후기</p>
      </div>
      <div className="container">
        <span className="category" style={{ color: color[event.category] }}>
          {event.category}
        </span>
        <p className="title">{event.title}</p>
        <div className="eventInfo">
          <img alt="date" src={dateIcon} />
          <span className="text">{startDate + " - " + endDate}</span>
        </div>
        <div className="eventInfo">
          <img alt="location" src={locationIcon} />
          {load && (
            <span className="text">
              {event.event_place.location + " " + event.event_place.place_name}
            </span>
          )}
        </div>
      </div>
      <div className="container">
        <span className="title">이벤트 만족도</span>
        <div className="star">
          <StarComponent size={30} />
        </div>
        <p className="starRating">
          <span className="gray">{starRating}</span>
          {" / 5.0"}
        </p>
      </div>
      <div className="container1">
        <span className="title">관람 후기</span>

        <div className="imgList">
          <input
            type="file"
            style={{ display: "none" }}
            id="file"
            multiple
            onChange={(e) => {
              let newBuf = [...newImg.img];
              let newObjBuf = [...newImg.obj];
              for (let i = 0; i < e.target.files.length; i++) {
                if (newImg.img.length + existImg.length < 10) {
                  var reader = new FileReader();
                  reader.onload = function (event) {
                    newBuf.push(event.target.result);
                    newObjBuf.push(e.target.files[i]);
                  };
                  reader.readAsDataURL(e.target.files[i]);
                }
              }
              setTimeout(() => {
                setNewImg({
                  ...newImg,
                  img: newBuf,
                  obj: newObjBuf,
                });
              }, 100);
            }}
          />

          <label htmlFor="file">
            <div className="addImg">
              <img src={cameraIcon} alt="camera" />
              <p className="pictureNum">
                {existImg.length + newImg.img.length + "/10"}
              </p>
            </div>
          </label>

          {existImg.map((img, idx) => {
            return (
              <img
                className="img"
                alt="img"
                src={img.src}
                key={idx}
                id={img.id}
                style={{ background: "#00000011" }}
                onClick={(e) => {
                  let existBuf = [...existImg];
                  existBuf.splice(idx, 1);
                  setExistImg(existBuf);
                }}
              />
            );
          })}

          {newImg.img.map((img, idx) => {
            return (
              <img
                className="img"
                alt="img"
                src={img}
                key={idx}
                style={{ background: "#00000011" }}
                onClick={() => {
                  let newBuf = [...newImg.img];
                  newBuf.splice(idx, 1);
                  let newObjBuf = [...newImg.obj];
                  newObjBuf.splice(idx, 1);
                  setNewImg({ ...newImg, img: newBuf, obj: newObjBuf });
                }}
              />
            );
          })}
        </div>

        <textarea
          ref={content}
          placeholder={"공유하고 싶은 이벤트 관람 후기를 작성해 주세요!"}
          onChange={(e) => {
            if (e.target.value.length)
              e.target.value = e.target.value.substring(0, 1000);
            setLen(e.target.value.length);
          }}
        ></textarea>

        <div className="limit">
          <span>{len + " / " + 1000}</span>
        </div>
        <div className="next" onClick={handleSubmitReview}>
          등록하기
        </div>
      </div>
      <div style={{ width: "100%", height: "100px" }}></div>
      <Footer mode={-1} />
    </EventReviewCreateFormCss>
  );
}

export default EventReviewCreateForm;
