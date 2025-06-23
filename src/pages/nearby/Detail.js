//모듈
import styled from "styled-components";
import { Link, useLocation, useNavigate } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  NaverMap,
  NavermapsProvider,
  Marker,
  Container as MapDiv,
} from "react-naver-maps";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { DetailEventComponent } from "./Component/MainEventComponent";
import Footer from "./Component/Footer";

//이미지
import {
  TfiAngleLeft,
  TfiAngleRight,
  TfiAngleDown,
  TfiAngleUp,
} from "react-icons/tfi";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { AiOutlineEllipsis } from "react-icons/ai";
import { IoBookmark, IoBookmarkOutline } from "react-icons/io5";
import copyIcon from "./Img/Detail/Copy.svg";
import dateIcon from "./Img/Detail/date.svg";
import locationIcon from "./Img/Detail/location.svg";
import runIcon from "./Img/Detail/run.svg";
import feeIcon from "./Img/Detail/fee.svg";
import homepageIcon from "./Img/Detail/homepage.svg";
import hashtagIcon from "./Img/Detail/hashtag.svg";
import exhibitionIcon from "./Img/Map/exhibition.svg";
import popupstoreIcon from "./Img/Map/popupstore.svg";
import festivalIcon from "./Img/Map/festival.svg";
import fillstarIcon from "./Img/Detail/fillstar.svg";
import emptystarIcon from "./Img/Detail/emptyStar.svg";
import ticketIcon from "./Img/Detail/ticket.svg";
import { origin } from "./Origin/Origin";
import oneDayClassIcon from "./Img/Map/oneDayClassIcon.svg";
const DetailCss = styled.div`
  margin: 0;
  padding: 0;
  width: 100vw;
  max-width: 450px;
  height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
  .header {
    display: flex;
    align-items: center;
    width: 100vw;
    max-width: 450px;
    height: 6vh;
    padding: 5px 0 5px 0;
    position: ${(props) => (props.top > 0 ? "fixed" : "absolute")};
    top: ${(props) => (props.top > 0 ? "0" : "22")}px;
    ${(props) => props.top > 0 && "background:#ffffff"};
    z-index: 1;

    .header_back,
    .header_menu {
      width: 45vw;
      max-width: 200px;
      color: ${(props) => (props.top > 0 ? "#000000" : "#ffffff")};
      font-size: 24px;
      gap: 20px;
    }
    .header_back {
      padding-left: 5vw;

      @media (min-width: 450px) {
        padding-left: 25px;
      }
    }

    .header_menu {
      display: flex;
      justify-content: right;
    }
  }

  .ImgContainer {
    width: 100vw;
    max-width: 450px;
    height: ${window.innerWidth > 450 ? 675 : (window.innerWidth * 3) / 2}px;
    overflow: hidden;
    .slider {
      display: flex;
      width: ${(props) =>
        window.innerWidth > 450
          ? props.img.length * 450
          : props.img.length * window.innerWidth}px;
      height: ${window.innerWidth > 450 ? 675 : (window.innerWidth * 3) / 2}px;
    }
    .img {
      width: 100vw;
      max-width: 450px;
      height: 100%;
      background-position: center;
      background-size: cover;
    }
  }

  .anchor {
    width: 100%;
    display: flex;
    height: 4px;
    background: #f2f3f5;
    p {
      margin: 0;
      height: 4px;
      flex: 1;
    }
  }

  .shortly {
    position: relative;
    top: -120px;
    margin: 0 20px 40px 20px;
    margin-bottom: -60px;

    p {
      margin-top: 0;
      margin-bottom: 10px;
    }
    .field {
      width: max-content;
      padding: 4px 13px 5px 13px;
      background: #ffffff;
      border-radius: 100px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: -0.24px;
    }

    .title {
      font-family: Noto Sans;
      font-size: 20px;
      font-style: normal;
      font-weight: 600;
      color: #ffffff;
    }

    .location {
      color: #ffffff;
      font-size: 12px;
      font-weight: 600;
    }
  }
  .part1 {
    margin-bottom: 40px;

    .foldedInfo {
      display: flex;
      align-items: start;
    }
    .more {
      font-size: 12px;
      padding-top: 12px;
    }
    .text {
      color: #222;
      font-size: 12px;
      font-weight: 400;
      letter-spacing: -0.24px;
    }

    .text1 {
      font-size: 14px;
      font-weight: 600;
    }

    .line {
      padding-top: 2px;
    }
    .line1 {
      padding-top: 2px;
      font-weight: 600;
    }
    .info {
      display: flex;
      align-items: center;
      margin: 5px 20px 5px 20px;
      width: 80%;
      img {
        width: 22px;
        height: 22px;
        margin-right: 8px;
      }

      .blue {
        color: #1593ff;
        font-size: 12px;
        font-weight: 600;
        margin-right: 8px;
      }

      .red {
        color: #d01928;
        font-size: 12px;
        font-weight: 600;
        margin-right: 8px;
      }

      .hashtag {
        background: #f2f2f2;
        display: flex;
        padding: 5px 13px 5px 13px;
        justify-content: center;
        align-items: center;
        border-radius: 100px;
        font-size: 12px;
        font-weight: 400;
      }

      .hashtag_wrap {
        width: 100%;
        overflow: hidden;
      }
      .hashtag_list {
        width: max-content;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .hashtag_scroll {
        width: 100%;
        overflow: auto;
      }
    }
    .hashtagInfo {
      width: 85%;
    }
    .ticket {
      width: 50px;
      height: 50px;
      display: flex;
      justify-content: center;
      align-items: center;
      position: fixed;
      bottom: 100px;
      left: ${window.innerWidth > 450
        ? window.innerWidth / 2 + 150
        : window.innerWidth - 70}px;
      background: #981c26;
      border-radius: 100%;
      filter: drop-shadow(0px 2px 4px rgba(8, 7, 8, 0.2));
      z-index: 3;
      img {
        width: 26px;
        height: 18px;
      }
    }

    .fee {
      margin: 0px 20px 10px 50px;
      width: 80%;

      .text {
        margin: 0;
        margin-bottom: 2px;
      }
    }

    .margin_bottom0 {
      margin-bottom: 0;
    }

    .top {
      align-items: start;
    }

    .topInfo {
      margin-top: 40px;
    }

    .runInfo {
      p {
        margin: 0;
        width: max-content;
      }
    }

    .moreInfo {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 90%;
      margin: 40px 5%;
      padding: 14px 0;
      background: ${(props) => (props.info.more ? "#fff" : "#981C26")};
      border-radius: 100px;
      border: 1px solid #981c26;

      .text1 {
        color: ${(props) => (props.info.more ? "#981C26" : "#fff")};
      }

      .more {
        color: ${(props) => (props.info.more ? "#981C26" : "#fff")};
        margin-left: 10px;
        padding-top: 3px;
      }
    }
  }
  .posterContainer {
    width: 100%;
    height: ${(props) => (!props.info.more ? "500px" : "auto")};
    ${(props) => !props.info.more && "overflow:hidden"};
  }

  .poster {
    width: 100%;
    object-fit: contain;
  }
  .posterBottom {
    position: relative;
    top: -300px;
    width: 100%;
    height: 300px;
    margin-bottom: -300px;
  }
  .part2 {
    .text {
      color: #222;
      font-size: 12px;
      font-weight: 400;
      letter-spacing: -0.24px;
    }

    .description {
      margin: 0 31px 0 20px;
      font-size: 12px;
      font-weight: 400;
    }
    .map {
      span {
        display: none;
      }
      img[alt="NAVER"] {
        display: none !important;
      }
    }

    .subTitle {
      font-size: 16px;
      font-weight: 600;
      letter-spacing: -0.96px;
      margin: 60px 0 20px 5%;
    }

    .subHeader {
      display: flex;
      align-items: center;
      margin: 40px 20px;
      .subTitle1 {
        width: 60%;
        margin: 0;
      }
      .moreReview {
        font-size: 14px;
        font-weight: 400;
        width: 40%;
        display: flex;
        align-items: center;
        justify-content: right;
      }
    }

    .text {
      margin-left: 5%;
      width: 80%;
    }

    .location {
      display: flex;
      align-items: center;
      p {
        margin-top: 0;
        margin-bottom: 0;
      }

      img {
        width: 24px;
        height: 24px;
        margin-left: 8px;
      }
    }
    .starRatingContainer {
      width: 100%;
      display: flex;
      align-items: center;
      .starContainer {
        width: 50%;
        display: flex;
        align-items: center;
        flex-direction: column;
        .starRating {
          font-size: 40px;
          font-weight: 600;
          margin: 0;
        }
      }

      .line {
        width: 1px;
        height: 50px;
        background: #e5e5e5;
      }
      .starBar {
        display: flex;
        gap: 10px;
        width: 49%;
        align-items: center;
        justify-content: center;
      }
    }

    .reviewContainer {
      background: #f7f7f8;
      margin: 20px 20px;
      padding: 20px 0px;
      .reviewHeader {
        display: flex;
        margin: 0 20px;
        align-items: center;
        .writeDay {
          display: flex;
          justify-content: right;
          width: 90%;
          color: #525252;
          font-size: 10px;
          font-weight: 400;
        }
      }
      .reviewContent {
        display: flex;
        align-items: center;
        margin: 10px 20px;
        img {
          width: 60px;
          height: 80px;
          margin-right: 10px;
        }
        .text {
          font-size: 12px;
          font-weight: 400;
        }
      }
    }

    .writeReview {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 90%;
      margin: 0 5%;
      font-size: 12px;
      font-weight: 600;
      padding: 15px 0px;
      background: #981c26;
      border-radius: 100px;
      color: #fff;
    }
    .noReview {
      font-weight: 400;
      text-align: center;
      padding: 40px 0 60px 0;
      font-size: 12px;
      line-height: 30px;
    }
  }

  .nearby {
    border-top: 1px solid #c8c8c8;
    margin: 60px 7px 20px 7px;
    .subTitle {
      font-size: 16px;
      font-weight: 600;
      letter-spacing: -0.96px;
      margin: 20px 0 20px 5%;
    }
    .eventList {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
    }
  }

  .completeCopy {
    position: fixed;
    display: inline-flex;
    width: ${window.innerWidth > 450 ? 410 : window.innerWidth - 40}px;
    padding: 15px 0;

    justify-content: center;
    align-items: center;
    box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.25);
    border-radius: 100px;
    background: rgba(8, 7, 8, 0.8);
    left: ${window.innerWidth > 450 ? window.innerWidth / 2 - 205 : 20}px;
    top: ${(props) =>
      props.copy ? window.innerHeight - 150 : window.innerHeight}px;
    color: #fff;
    font-weight: 400;
    font-size: 14px;
    transition: 0.5s;
  }
  .back {
    ${(props) => !props.popup && "display:none"};
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
    bottom: ${(props) => (props.popup ? 0 : -300)}px;
    transition: 0.3s;
    z-index: 15;
    background: #fff;
    .text {
      width: ${window.innerWidth > 450 ? 410 : window.innerWidth - 40};
      margin: 0 20px;
      padding: 20px 0;
      border-bottom: 1px solid #c8c8c888;
      font-size: 14px;
      font-weight: 400;
      color: #080708;
      cursor: pointer;
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

  .imgPopup {
    position: fixed;
    z-index: 10;
    top: 0;
    width: 100vw;
    max-width: 450px;
    height: 100vh;
    background: #fff;
    .imgPopupHeader {
      padding: 15px 20px;
      font-size: 24px;
    }
    .img {
      width: 100%;
      margin-top: 60px;
      object-fit: contain;
    }
  }
`;

function Detail() {
  const location = useLocation();
  const slider = useRef();
  const container = useRef();
  const color = {
    전시회: "#1593FF",
    공연: "#F3757C",
    축제: "#EFA116",
    "원데이 클래스": "#981C26",
  };
  const navigate = useNavigate();
  const day = ["월", "화", "수", "목", "금", "토", "일"];
  const [loading, setLoading] = useState(false);
  const [img, setImg] = useState([]);
  const [top, setTop] = useState(0);
  const [data, setData] = useState({});
  const [info, setInfo] = useState({
    run: false,
    fee: false,
    more: false,
  });
  const [isOpen, setIsOpen] = useState(0);
  const [open, setOpen] = useState({
    월: null,
    화: null,
    수: null,
    목: null,
    금: null,
    토: null,
    일: null,
  });
  const [run, setRun] = useState({});
  const [close, setClose] = useState([]);
  const [fee, setFee] = useState([]);
  const [startDate, setStartDate] = useState("준비중");
  const [endDate, setEndDate] = useState("마감시 종료");
  const [startPos, setStartPos] = useState(0);
  const [curPos, setCurPos] = useState(0);
  const [mode, setMode] = useState(0);
  const [nearBy, setNearBy] = useState([]);
  const [copy, setCopy] = useState(false);
  const [popup, setPopup] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [review, setReview] = useState([]);
  const [simpleReview, setSimpleReview] = useState({});
  const [starRating, setStarRating] = useState([0, 0, 0, 0, 0]);
  const [starAvg, setStarAvg] = useState((0).toFixed(1));
  // const [imgPopup, setImgPopup] = useState(false);
  // const [imgSrc, setImgSrc] = useState("#");
  const [promotion, setPromotion] = useState([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [currentBookmarkId, setCurrentBookmarkId] = useState("");
  const maker = {
    전시회: exhibitionIcon,
    공연: popupstoreIcon,
    축제: festivalIcon,
    "원데이 클래스": oneDayClassIcon,
  };

  function dateFromat(date) {
    if (typeof date === "string") return date;
    else
      return date
        .toISOString()
        .split("T")[0]
        .replace("-", ".")
        .replace("-", ".");
  }

  async function deleteEvent() {
    let res = await axios.delete(
      "https://deso-us.com/api/v1/event/delete/" + data.id,
      {
        headers: {
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );

    if (res.status === 200) {
      alert("삭제가 완료되었습니다");
      navigate("/");
    }
  }

  const isOpened = () => {
    let now = new Date();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    now.setMilliseconds(0);
    let str = now.toISOString().toString().split(".")[0];
    if (startDate === "준비중" || startDate - now > 0) {
      return 2;
    } else if (endDate - now < 0) {
      return 1;
    }
    if (close[str] !== undefined) {
      if (close[str].type) {
        let cur = new Date();
        let s = new Date();
        let e = new Date();
        s.setTime(close[str].start_at);
        e.setTime(close[str].close_at);

        if (cur >= s && cur <= e) {
          return 0;
        } else if (cur < s) {
          return 2;
        } else if (cur > e) {
          return 1;
        }
      } else {
        return 1;
      }
    }

    let today = now.getDay() === 0 ? 6 : now.getDay() - 1;

    if (open[day[today]]) {
      let cur = new Date();
      let s = new Date();
      let e = new Date();
      s.setTime(open[day[today]].start_at);
      e.setTime(open[day[today]].close_at);
      if (cur >= s && cur <= e) {
        return 0;
      } else if (cur < s) {
        return 2;
      } else if (cur > e) {
        return 1;
      }
    }

    return true;
  };

  const timeFormat = (start_at) => {
    const tok = start_at.split(":");
    return tok[0] + ":" + tok[1];
  };
  async function share() {
    const shareData = {
      title: data.title,
      text: data.description,
      url: window.location.href,
    };
    try {
      await navigator.share(shareData);
    } catch (err) {
      console.log("공유 실패");
    }
  }

  function setRunInfo(open, close) {
    let buf = {};
    for (const e of open) {
      e.text = timeFormat(e.start_at) + " - " + timeFormat(e.close_at);
      buf[day[e.day]] = e;
    }
    setOpen({ ...open, ...buf });
    buf = {};
    for (const e of close) {
      buf[e.date] = e;
    }
    setClose(buf);

    // let now = new Date();
    // let monday = new Date();
    // now.setDate();
  }

  async function init(id) {
    let res = await axios.get(origin + "event/" + id);
    console.log(res);
    setImg([...res.data.data.event_image_list]);
    setPromotion([...res.data.data.promotion_image_list]);
    setData({ ...res.data.data });
    setRunInfo(res.data.data.event_open_list, res.data.data.event_close_list);
    setFee([...res.data.data.event_price_list]);

    if (res.data.data.start_date !== null) {
      let buf = new Date(res.data.data.start_date);
      setStartDate(buf);
    }

    if (res.data.data.end_date !== null) {
      let buf = new Date(res.data.data.end_date);
      setEndDate(buf);
    }

    if (
      res.data.data.event_review_list !== null &&
      res.data.data.event_review_list.length > 0
    ) {
      let reviewList = [];
      let starBuf = [0, 0, 0, 0, 0];
      let sum = 0;
      for (const e of res.data.data.event_review_list) {
        sum += e.star_rating;
        starBuf[5 - e.star_rating] += 1;
        reviewList.push(e.id);
      }

      setStarAvg((sum / res.data.data.event_review_list.length).toFixed(1));
      setStarRating(starBuf);
      setReview(reviewList);
      let reviewId = reviewList[Math.floor(Math.random() * reviewList.length)];
      axios.get(origin + "event/review/" + reviewId).then((res) => {
        setSimpleReview(res.data.data);
      });
    }

    axios.get(origin + "search/event/4").then((res) => {
      setNearBy(res.data.data);
    });
  }

  const Anchor = () => {
    let buf = [];
    for (let i = 0; i < Math.ceil(img.length); i++) {
      if (mode === i)
        buf.push(
          <p key={i} className="dot" style={{ background: "#080708" }}></p>
        );
      else buf.push(<p key={i} className="dot"></p>);
    }
    return buf;
  };

  const StarComponent = (props) => {
    let buf = [];
    let size = props.size === null ? "14px" : props.size + "px";
    for (let i = 0; i < 5; i++) {
      buf.push(
        <img
          src={i < Math.floor(props.star) ? fillstarIcon : emptystarIcon}
          alt="fillStar"
          key={i}
          style={{ width: size, height: size }}
        />
      );
    }
    return buf;
  };

  const StarBarComponent = () => {
    let buf = [];
    let people = 0;
    let max = 0;
    for (let i = 0; i < 5; i++) {
      people += starRating[i];
      if (starRating[i] > starRating[max]) max = i;
    }

    for (let i = 0; i < 5; i++) {
      buf.push(
        <div key={i}>
          <div
            style={{
              background: "#f2f3f5",
              width: "8px",
              height: "50px",
              borderRadius: "100px",
              display: "flex",
              alignItems: "end",
            }}
          >
            <p
              style={{
                width: "8px",
                height: (starRating[i] * 100) / people + "%",
                margin: "0",
                background: i === max ? "#981c26" : "#c8c8c8",
                borderRadius: "100px",
              }}
            ></p>
          </div>
          <p style={{ margin: "3px 0", fontSize: "12px", fontWeight: "400" }}>
            {5 - i}
          </p>
        </div>
      );
    }

    return buf;
  };

  useEffect(() => {
    const id = location.search.split("?")[1].split("id=")[1];
    init(id)
      .then(() => {
        setLoading(true);
        let flag = isOpened();
        setIsOpen(flag);
      })
      .catch((e) => {
        console.log(e);
        alert("삭제된 이벤트입니다.");
      });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const userId = parseInt(sessionStorage.getItem("id"), 10) || null;
      if (userId == null) return;
      const eventId = data.id;

      try {
        const res = await axios.get(origin + "bookmark/" + userId);
        const bookMarkList = res.data.data;

        if (bookMarkList && bookMarkList.length > 0) {
          const bookmark = bookMarkList.find(
            (bookmark) => bookmark.event_id === eventId
          );
          if (bookmark) {
            setIsBookmarked(bookmark);
            setCurrentBookmarkId(bookmark.id);
          } else {
            setIsBookmarked(false);
            setCurrentBookmarkId(null);
          }
        } else {
          setIsBookmarked(false);
          setCurrentBookmarkId(null);
        }
      } catch (error) {
        console.error("Checking Bookmark status:", error);
      }
    };
    fetchData();
  }, []);

  const handleBookmarkClick = async () => {
    const userId = parseInt(sessionStorage.getItem("id"), 10) || null;
    const eventId = data.id;
    try {
      const bookmarkApiEndpoint = isBookmarked
        ? origin + "bookmark/delete/" + currentBookmarkId
        : origin + "bookmark";

      const requestMethod = isBookmarked ? "delete" : "post";

      const response = await axios[requestMethod](bookmarkApiEndpoint, {
        data: {
          user_id: userId,
          event_id: eventId,
        },
        headers: {
          Authorization: sessionStorage.getItem("token"),
        },
      });
      if (response.status === 200) {
        setIsBookmarked((prev) => !prev);
      }
      axios
        .get(origin + "search/bookmark/" + userId)
        .then((res) => {
          const lastBookmark = res.data.data[res.data.data.length - 1];
          if (
            lastBookmark &&
            lastBookmark.event_id === eventId &&
            lastBookmark.user_id === userId
          ) {
            setCurrentBookmarkId(lastBookmark.id);
          } else {
            setCurrentBookmarkId(null);
          }
        })
        .catch((error) => {
          console.error("Bookmark data: ", error);
          setCurrentBookmarkId(null);
        });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <DetailCss
      top={top}
      img={img}
      info={info}
      mode={mode}
      copy={copy}
      popup={popup}
      onScroll={(e) => {
        setTop(e.target.scrollTop);
      }}
      ref={container}
    >
      <div className="header">
        <div
          className="header_back"
          onClick={() => {
            navigate("/");
          }}
        >
          <TfiAngleLeft />
        </div>
        <div className="header_menu">
          {isBookmarked ? (
            <IoBookmark onClick={handleBookmarkClick} />
          ) : (
            <IoBookmarkOutline onClick={handleBookmarkClick} />
          )}
          <AiOutlineEllipsis
            onClick={() => {
              setPopup(true);
            }}
          />
        </div>
      </div>

      <div className="ImgContainer">
        <div
          className="slider"
          ref={slider}
          onTouchStart={(e) => {
            setStartPos(e.changedTouches[0].pageX);
          }}
          onTouchMove={(e) => {
            const offset = curPos + (e.changedTouches[0].pageX - startPos);
            const width = window.innerWidth > 450 ? 450 : window.innerWidth;
            const isScroll = offset % width;
            const limit = img.length;
            if (isScroll < -30 || isScroll > 30) {
              container.current.style.overflow = "hidden";
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
            const width = window.innerWidth > 450 ? 450 : window.innerWidth;
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
              } else if (e.changedTouches[0].pageX < startPos && drag >= 0.1) {
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
            container.current.style.overflowY = "scroll";
            container.current.style.overflowX = "hidden";
          }}
        >
          {img.map((e, idx) => {
            return (
              <div
                style={{
                  backgroundImage:
                    'linear-gradient(180deg, rgba(38, 38, 38, 0.00) 69.7%, rgba(38, 38, 38, 0.40) 80.18%, #262626 109.8%), url("' +
                    e.src +
                    '")',
                }}
                key={idx}
                className="img"
              ></div>
            );
          })}
        </div>
      </div>
      {img.length > 1 && (
        <div className="anchor">
          <Anchor />
        </div>
      )}

      {loading && (
        <div className="shortly">
          <p className="title">{data.title}</p>
          <div className="location">
            <span>{data.event_place.location.split(" ")[0]}</span>
            <span style={{ whiteSpace: "pre-wrap" }}>{"  ·  "}</span>
            <span>{data.event_place.location.split(" ")[1]}</span>
          </div>
        </div>
      )}

      <div className="part1">
        <div className="info topInfo">
          <img src={dateIcon} alt={"dateIcon"} />
          <span className="text">
            {dateFromat(startDate) + " - " + dateFromat(endDate)}
          </span>
        </div>

        <div className="info">
          <img src={locationIcon} alt={"locationIcon"} />
          {loading && (
            <span className="text">
              {data.event_place.location + " " + data.event_place.place_name}
            </span>
          )}
        </div>

        <div className="foldedInfo">
          <div className="info top margin_bottom0">
            <img src={runIcon} alt={"runIcon"} />
            {isOpen === 0 && <span className="blue line1">운영 중</span>}
            {isOpen === 1 && <span className="red line1">운영 종료</span>}
            {isOpen === 2 && <span className="red line1">오픈 전</span>}
            <div className="runInfo line">
              <p className="text" style={{ whiteSpace: "pre-wrap" }}>
                {"월요일   " +
                  (open["월"] === null || open["월"] === undefined
                    ? "운영정보 없음"
                    : open["월"].text)}
              </p>

              {info.run &&
                day.map((e, idx) => {
                  if (e !== "월")
                    return (
                      <p
                        key={idx}
                        className="text"
                        style={{ whiteSpace: "pre-wrap" }}
                      >
                        {e +
                          "요일   " +
                          (open[e] === null ? "운영정보 없음" : open[e].text)}
                      </p>
                    );
                })}
            </div>
          </div>
          <div
            className="more"
            onClick={() => {
              setInfo({
                ...info,
                run: !info.run,
              });
            }}
          >
            {!info.run && <TfiAngleDown />}
            {info.run && <TfiAngleUp />}
          </div>
        </div>

        <div className="foldedInfo">
          <div className="info top margin_bottom0">
            <img src={feeIcon} alt={"feeIcon"} />
            <span className="text line">
              {data.charge === 0 && "무료"}
              {data.charge === 1 && "유료"}
              {data.charge === 2 && "부분유료"}
            </span>
          </div>
          {fee.length > 0 && (
            <div
              className="more"
              onClick={() => {
                setInfo({
                  ...info,
                  fee: !info.fee,
                });
              }}
            >
              {!info.fee && <TfiAngleDown />}
              {info.fee && <TfiAngleUp />}
            </div>
          )}
        </div>

        {info.fee && (
          <div className="fee">
            {fee.map((e, idx) => {
              return (
                <p
                  className="text"
                  style={{ whiteSpace: "pre-wrap" }}
                  key={idx}
                >
                  {e.target + "   " + e.price + "원"}
                </p>
              );
            })}
          </div>
        )}

        {data.homepage !== null && (
          <div className="info">
            <img src={homepageIcon} alt={"homepageIcon"} />
            <a className="blue" href={data.homepage}>
              공식 홈페이지 바로가기
            </a>
          </div>
        )}
        {loading && data.isSell ? (
          <a href={data.ticket_link}>
            <div className="ticket">
              <img src={ticketIcon} alt={"ticketIcon"} />
            </div>
          </a>
        ) : (
          <Link to={"/Payment?id=" + data.id}>
            <div className="ticket">
              <img src={ticketIcon} alt={"ticketIcon"} />
            </div>
          </Link>
        )}

        <div className="info hashtagInfo">
          <img src={hashtagIcon} alt={"hashtagIcon"} />
          <div className="hashtag_wrap">
            <div className="hashtag_scroll">
              <div className="hashtag_list">
                <span
                  className="hashtag"
                  style={{
                    background: color[data.category],
                    color: "#ffffff",
                  }}
                >
                  {data.category}
                </span>
                {data.event_hashtag_list !== undefined &&
                  data.event_hashtag_list.map((e, idx) => {
                    return (
                      <span key={idx} className="hashtag">
                        {e.content}
                      </span>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>

        {promotion.length > 0 && (
          <div className="posterContainer">
            {promotion.map((e, idx) => {
              return (
                <img className="poster" src={e.src} alt="poster" key={idx} />
              );
            })}
          </div>
        )}
        {promotion.length > 0 && (
          <>
            {!info.more && (
              <div
                className="posterBottom"
                style={{
                  backgroundImage:
                    "linear-gradient(180deg, rgba(255, 252, 252, 0.00) 0%, rgba(255, 252, 252, 0.40) 26.56%, #FFF 100%)",
                }}
              ></div>
            )}

            <div
              className="moreInfo"
              onClick={() => {
                setInfo({
                  ...info,
                  more: !info.more,
                });
              }}
            >
              <span className="text1">이벤트 정보 더 알아보기</span>
              <div className="more">
                {!info.more && <FiChevronDown style={{ fontSize: "24px" }} />}
                {info.more && <FiChevronUp style={{ fontSize: "24px" }} />}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="part2">
        <p className="description">
          {data.description !== undefined &&
            data.description.split("\n").map((e, idx) => {
              return (
                <span key={idx}>
                  {e}
                  <br />
                </span>
              );
            })}
        </p>

        <div className="map">
          <p className="subTitle">이벤트 장소</p>
          <NavermapsProvider
            ncpClientId="pvhem24pi2"
            error={<p>Maps Load Error</p>}
            loading={<p>Maps Loading...</p>}
          >
            <MapDiv
              id={"nearby"}
              style={{
                width: "90%",
                height:
                  window.innerWidth > 450
                    ? "270px"
                    : window.innerWidth * 0.6 + "px",
                margin: "5%",
                borderRadius: "12px",
              }}
            >
              {loading && (
                <NaverMap
                  defaultZoom={17}
                  center={{
                    lat: data.event_place.location_x,
                    lng: data.event_place.location_y,
                  }}
                >
                  {data.category !== null && data.category !== undefined && (
                    <Marker
                      position={{
                        lat: data.event_place.location_x,
                        lng: data.event_place.location_y,
                      }}
                      icon={maker[data.category]}
                    />
                  )}
                </NaverMap>
              )}
            </MapDiv>
          </NavermapsProvider>
          {loading && (
            <div className="location">
              <p className="text">
                {data.event_place.location + " " + data.event_place.place_name}
              </p>

              <CopyToClipboard
                className="clip"
                text={
                  data.event_place.location + " " + data.event_place.place_name
                }
                onCopy={() => {
                  setCopy(true);
                  setTimeout(() => {
                    setCopy(false);
                  }, 800);
                }}
              >
                <img src={copyIcon} alt="copy" />
              </CopyToClipboard>
            </div>
          )}
        </div>

        <div className="review">
          <div className="subHeader">
            <p className="subTitle subTitle1">관람 후기</p>
            <p
              className="moreReview"
              onClick={() => {
                navigate("/EventReview?id=" + data.id);
              }}
            >
              모두 보기
              <TfiAngleRight />
            </p>
          </div>
          <div className="reviewList">
            <div>
              <div className="starRatingContainer">
                <div className="starContainer">
                  <p className="starRating">{starAvg}</p>
                  <div>
                    <StarComponent star={starAvg} />
                  </div>
                </div>
                <p className="line"></p>
                <div className="starBar">
                  <StarBarComponent />
                </div>
              </div>
              {review.length > 0 && (
                <div className="reviewContainer">
                  <div className="reviewHeader">
                    <StarComponent size={12} star={simpleReview.star_rating} />
                    <p className="writeDay">3일전</p>
                  </div>
                  <div className="reviewContent">
                    {simpleReview.event_review_image_dto_list !== null &&
                      simpleReview.event_review_image_dto_list !== undefined &&
                      simpleReview.event_review_image_dto_list.length > 0 && (
                        <img
                          alt="reviewImg"
                          src={simpleReview.event_review_image_dto_list[0].src}
                        />
                      )}
                    <p className="text">{simpleReview.content}</p>
                  </div>
                </div>
              )}
              {review.length === 0 && (
                <div className="noReview">
                  <span>아직 관람 후기가 없어요</span>
                  <br />
                  <span>가장 먼저 관람 후기를 작성해 보세요!</span>
                </div>
              )}
            </div>
          </div>
          <Link
            to={"/CreateForm/EventReview?event_id=" + data.id}
            style={{ textDecoration: "none" }}
          >
            <p className="writeReview">관람 후기 작성하기</p>
          </Link>
        </div>
      </div>

      <div className="nearby">
        <p className="subTitle">주변 이벤트</p>
        <div className="eventList">
          {nearBy.map((e, idx) => {
            return <DetailEventComponent id={e.id} key={idx} data={e} />;
          })}
        </div>
      </div>

      <p className="completeCopy">주소가 복사되었습니다.</p>

      <div
        className="back"
        onClick={() => {
          setPopup(false);
          setConfirm(false);
        }}
      ></div>

      <div className="popup">
        <p
          className="text"
          onClick={() => {
            share();
          }}
        >
          공유하기
        </p>
        {data.user_id === Number(sessionStorage.getItem("id")) && (
          <>
            <Link
              to={"/CreateForm/Event?mode=edit&id=" + data.id}
              style={{ textDecoration: "none" }}
            >
              <p className="text">수정하기</p>
            </Link>

            <p
              className="text red"
              onClick={() => {
                setConfirm(true);
              }}
            >
              {!confirm && "삭제하기"}
              {confirm && (
                <span
                  className="confirm red "
                  onClick={() => {
                    deleteEvent();
                  }}
                >
                  한번더 누르면 삭제됩니다
                </span>
              )}
            </p>
          </>
        )}
        <p
          className="cancle"
          onClick={() => {
            setPopup(false);
            setConfirm(false);
          }}
        >
          취소
        </p>
      </div>
      {/* {imgPopup && (
        <div className="imgPopup">
          <div className="imgPopupHeader">
            <TfiAngleLeft
              onClick={() => {
                setImgPopup(false);
              }}
            />
          </div>
          <img src={imgSrc} alt="img" className="img" />
        </div>
      )} */}
      <p style={{ height: "50px" }}></p>
      <Footer mode={-1} />
    </DetailCss>
  );
}

export default Detail;
