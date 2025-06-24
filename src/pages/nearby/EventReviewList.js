import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Footer from "./Component/Footer";

import dateIcon from "./Img/Detail/date.svg";
import locationIcon from "./Img/Detail/location.svg";
import fillstarIcon from "./Img/Detail/fillstar.svg";
import emptystarIcon from "./Img/Detail/emptyStar.svg";
import { TfiAngleLeft } from "react-icons/tfi";
import { BiDotsVerticalRounded } from "react-icons/bi";

const EventReviewComponentCss = styled.div`
  width: 100%;
  .flex {
    display: flex;
    align-items: center;
  }
  .name {
    font-size: 12px;
    font-weight: 600;
    width: 80%;
  }

  .date {
    font-size: 10px;
    font-weight: 400;
    color: #525252;
    width: 20%;
    justify-content: right;
    span {
      margin-right: 5px;
    }
  }

  .anchor {
    justify-content: center;
  }
  .content {
    font-size: 12px;
    font-weight: 400;
  }
  .imgWrap {
    margin-top: 12px;
    width: 100%;
    height: ${window.innerWidth > 450
      ? (410 * 4) / 3
      : ((window.innerWidth - 40) * 4) / 3}px;
    overflow: hidden;
    .imgList {
      display: flex;
      width: ${(props) => props.img.length * 100}%;
      height: ${window.innerWidth > 450
        ? (410 * 4) / 3
        : ((window.innerWidth - 40) * 4) / 3}px;
      img {
        width: ${window.innerWidth > 450 ? 410 : window.innerWidth - 40}px;
        height: 500px;
      }
    }
  }
`;

function EventReviewComponent(props) {
  const slider = useRef();
  const [starRating, setStarRating] = useState(5);
  const [img, setImg] = useState([]);
  const [startPos, setStartPos] = useState(0);
  const [curPos, setCurPos] = useState(0);
  const [date, setDate] = useState(dateFromat(new Date().toISOString()));
  const [mode, setMode] = useState(0);
  const [user, setUser] = useState({});
  const [content, setContent] = useState("");
  const StarComponent = (props) => {
    let buf = [];
    let size = props.size === null ? "14px" : props.size + "px";
    for (let i = 0; i < 5; i++) {
      buf.push(
        <img
          src={i < Math.floor(starRating) ? fillstarIcon : emptystarIcon}
          alt="fillStar"
          key={i}
          style={{ width: size, height: size }}
        />
      );
    }
    return buf;
  };
  const Anchor = () => {
    let buf = [];

    for (let i = 0; i < img.length; i++) {
      if (mode === i)
        buf.push(
          <p
            key={i}
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "100%",
              background: "#525252",
              margin: "20px 2px",
            }}
          ></p>
        );
      else
        buf.push(
          <p
            key={i}
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "100%",
              background: "#e5e5e5",
              margin: "20px 2px",
            }}
          ></p>
        );
    }

    return buf;
  };
  function dateFromat(date) {
    return date.split("T")[0].replace("-", ".").replace("-", ".");
  }

  useEffect(() => {
    setContent(props.data.content);
    setStarRating(props.data.star_rating.toFixed(2));
    setDate(
      props.data.updated_at === null
        ? dateFromat(props.data.created_at)
        : dateFromat(props.data.updated_at)
    );
    setImg(props.data.event_review_image_dto_list);
    setUser(props.data.user_id);
  }, []);

  return (
    <EventReviewComponentCss img={img}>
      <div className="flex">
        <p className="name">{user.nickname !== undefined && user.nickname}</p>
        <p className="date flex">
          <span>{date}</span>
          <BiDotsVerticalRounded
            style={{ fontSize: "18px" }}
            onClick={() => {
              props.setSelect({ id: props.id, writer: user });
            }}
          />
        </p>
      </div>

      <div className="eventReviewStar flex">
        <StarComponent />
      </div>

      {img.length > 0 && (
        <div>
          <div className="imgWrap">
            <div
              className="imgList"
              ref={slider}
              onTouchStart={(e) => {
                setStartPos(e.changedTouches[0].pageX);
              }}
              onTouchMove={(e) => {
                const offset = curPos + (e.changedTouches[0].pageX - startPos);
                const width =
                  window.innerWidth > 450 ? 410 : window.innerWidth - 40;
                const isScroll = offset % width;
                const limit = img.length;
                if (isScroll < -30 || isScroll > 30) {
                  props.container.current.style.overflow = "hidden";
                }
                if (
                  offset < 0 &&
                  offset > -width * (limit - 1) &&
                  (isScroll < -30 || isScroll > 30)
                ) {
                  slider.current.style.transform = `translate(${offset}px)`;
                  slider.current.style.transitionDuration = "0ms";
                }
              }}
              onTouchEnd={(e) => {
                const width =
                  window.innerWidth > 450 ? 410 : window.innerWidth - 40;
                const sum = curPos + (e.changedTouches[0].pageX - startPos);
                const limit = img.length;
                if (sum > 0) {
                  slider.current.style.transitionDuration = "600ms";
                  slider.current.style.transform = `translate(0px)`;
                  setTimeout(() => {
                    slider.current.style.transitionDuration = "0ms";
                  }, 600);
                } else if (sum < -width * (limit - 1)) {
                  slider.current.style.transitionDuration = "600ms";
                  slider.current.style.transform = `translate(${
                    -width * (limit - 1)
                  }px)`;
                  setTimeout(() => {
                    slider.current.style.transitionDuration = "0ms";
                  }, 600);
                } else {
                  let drag = (-sum / width) % 1;
                  let destination;
                  if (e.changedTouches[0].pageX > startPos && drag <= 0.9) {
                    destination = -Math.floor(-sum / width) * width;
                  } else if (
                    e.changedTouches[0].pageX < startPos &&
                    drag >= 0.1
                  ) {
                    destination = Math.floor(sum / width) * width;
                  } else {
                    destination = Math.round(sum / width) * width;
                  }
                  slider.current.style.transform = `translate(${destination}px)`;
                  slider.current.style.transitionDuration = "600ms";
                  setCurPos(destination);
                  setMode(-destination / width);
                  setTimeout(() => {
                    slider.current.style.transitionDuration = "0ms";
                  }, 600);
                }
                props.container.current.style.overflowY = "scroll";
                props.container.current.style.overflowX = "hidden";
              }}
            >
              {img.map((e, idx) => {
                return <img src={e} key={idx} alt="img" />;
              })}
            </div>
          </div>

          <div className="anchor flex">
            <Anchor />
          </div>
        </div>
      )}
      {content.length > 0 && <p className="content">{content}</p>}
    </EventReviewComponentCss>
  );
}

const EventReviewListCss = styled.div`
  width: 100vw;
  height: 100vh;
  max-width: 450px;
  overflow: auto;
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

  .reviewList {
    margin: 0 20px;
    padding: 20px 0 10px 0;
    max-width: 436px;
    height: 90%;
  }
  .back {
    ${(props) => props.select.id < 0 && !props.confirm && "display:none"};
    position: fixed;
    top: 0;
    height: 100vh;
    width: 100vw;
    max-width: 450px;
    background: rgba(8, 7, 8, 0.3);
    z-index: 2;
  }
  .popup {
    position: fixed;
    width: 100vw;
    border-radius: 10px 10px 0px 0px;
    max-width: 450px;
    bottom: ${(props) => (props.select.id >= 0 && !props.confirm ? 0 : -300)}px;
    transition: 0.3s;
    z-index: 11;
    background: #fff;
    .text {
      width: ${window.innerWidth > 450 ? 410 : window.innerWidth - 40};
      margin: 0 20px;
      padding: 20px 0;
      font-size: 14px;
      font-weight: 400;
      color: #080708;
      cursor: pointer;
    }
    .border {
      border-bottom: 1px solid #c8c8c888;
    }

    .cancle {
      width: 100%;
      text-align: center;
      font-size: 14px;
      font-weight: 400;
      color: #080708;
    }
    .red {
      color: #981c26;
    }
  }

  .popup1 {
    position: fixed;
    width: 100vw;
    border-radius: 10px 10px 0px 0px;
    max-width: 450px;
    bottom: ${(props) => (props.confirm ? 0 : -300)}px;
    transition: 0.3s;
    z-index: 3;
    background: #fff;
    .text {
      padding: 30px 0;
      width: 100%;
      text-align: center;
      font-size: 14px;
      font-weight: 400;
    }

    .delete {
      border-radius: 100px;
      text-align: center;
      background: #981c26;
      width: 90%;
      margin: 10px 5%;
      color: #fff;
      padding: 15px 0;
    }
    .cancle {
      border-radius: 100px;
      border: 1px solid #981c26;
      text-align: center;
      background: #fff;
      width: 90%;
      margin: 10px 5% 20px 5%;
      color: #981c26;
      padding: 15px 0;
    }
  }
`;
function EventReviewList() {
  const location = useLocation();
  const navigate = useNavigate();
  const container = useRef();
  const listRef = useRef();
  const [scroll, setScroll] = useState(4);
  const [review, setReview] = useState([]);
  const [startDate, setStartDate] = useState("준비중");
  const [endDate, setEndDate] = useState("마감시 종료");
  const [starRating, setStarRating] = useState((0).toFixed(1));
  const [event, setEvent] = useState({
    event_place: { location: "", place_name: "" },
    category: "",
    title: "",
  });
  const [select, setSelect] = useState({ id: -1, writer: -1 });

  const [confirm, setConfirm] = useState(false);
  const color = {
    전시회: "#1593FF",
    공연: "#F3757C",
    축제: "#EFA116",
    "원데이 클래스": "#981C26",
  };
  function dateFromat(date) {
    return date.split("T")[0].replace("-", ".");
  }
  const deleteEventReview = () => {
    alert("삭제되었습니다");
    window.location.reload();
  };

  const StarComponent = (props) => {
    let buf = [];
    let size = props.size === null ? "14px" : props.size + "px";
    for (let i = 0; i < 5; i++) {
      buf.push(
        <img
          src={i < Math.floor(starRating) ? fillstarIcon : emptystarIcon}
          alt="fillStar"
          key={i}
          style={{ width: size, height: size }}
        />
      );
    }
    return buf;
  };

  return (
    <EventReviewListCss
      ref={container}
      select={select}
      confirm={confirm}
      onScroll={(e) => {
        if (e.target.scrollTop + window.innerHeight > e.target.scrollHeight)
          setScroll(scroll + 2);
        console.log(1);
      }}
    >
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
          <span className="text">
            {event.event_place.location + " " + event.event_place.place_name}
          </span>
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
      <div className="reviewList" ref={listRef}>
        <span className="title">전체 관람 후기</span>
        {review.map((e, idx) => {
          if (idx < scroll)
            return (
              <EventReviewComponent
                container={container}
                id={e.id}
                data={e}
                setSelect={setSelect}
              />
            );
          else return <></>;
        })}
        <div style={{ height: "120px", width: "100%" }}></div>
      </div>
      <div
        className="back"
        onClick={() => {
          setSelect({ id: -1, writer: -1 });
          setConfirm(false);
        }}
      ></div>

      <div className="popup">
        {select.writer === (Number(sessionStorage.getItem("id")) || -1) && (
          <>
            <Link
              to={
                //해당 부분 수정 필요
                "/CreateForm/EventReview?event_id=" +
                event.id +
                "&mode=edit&id=" +
                select.id
              }
              style={{ textDecoration: "none" }}
            >
              <p className="text">관람 후기 수정</p>
            </Link>

            <p
              className="text red border"
              onClick={() => {
                setConfirm(true);
              }}
            >
              관람 후기 삭제
            </p>
          </>
        )}
        {select.writer !== (Number(sessionStorage.getItem("id")) || -1) && (
          <Link to={"/report"} style={{ textDecoration: "none" }}>
            <p className="text red border">신고하기</p>
          </Link>
        )}
        <p
          className="cancle"
          onClick={() => {
            setSelect({ id: -1, writer: -1 });
          }}
        >
          취소
        </p>
      </div>

      <div className="popup1">
        <p className="text">관람 후기를 삭제하시겠어요?</p>
        <p
          className="delete"
          onClick={() => {
            deleteEventReview();
          }}
        >
          관람 후기 삭제
        </p>

        <p
          className="cancle"
          onClick={() => {
            setSelect({ id: -1, writer: -1 });
            setConfirm(false);
          }}
        >
          취소
        </p>
      </div>

      <Footer mode={-1} />
    </EventReviewListCss>
  );
}

export default EventReviewList;
