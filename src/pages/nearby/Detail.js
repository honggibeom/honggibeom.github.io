//모듈
import styled from "styled-components";
import { Link, useLocation, useNavigate } from "react-router-dom";
import React, { useState, useRef, useEffect } from "react";

import { DetailEventComponent } from "./Component/MainEventComponent";
import Footer from "./Component/Footer";
import { Map, MapMarker } from "react-kakao-maps-sdk";
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
import dummyMusicalImg1 from "./Img/Detail/dummyMusicalImg1.svg";
import dummyMusicalImg2 from "./Img/Detail/dummyMusicalImg2.svg";
import dummyMusicalImg3 from "./Img/Detail/dummyMusicalImg3.svg";
import dummyMusicalImg4 from "./Img/Detail/dummyMusicalImg4.svg";
import dummyMusicalImg5 from "./Img/Detail/dummyMusicalImg5.svg";
import dummyMusicalImg6 from "./Img/Detail/dummyMusicalImg6.svg";
import dummyReviewImg1 from "./Img/Detail/dummyReviewImg1.webp";
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
    padding: 5px 0;
    position: ${(props) => (props.top > 0 ? "fixed" : "absolute")};
    top: 0;
    ${(props) => props.top > 0 && "background:#ffffff"};
    z-index: 10;
    text-decoration: none;
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

      cursor: pointer;

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
        cursor: pointer;
      }
    }

    .text {
      margin-left: 5%;
      width: 80%;
    }

    .location {
      margin-top: 20px;
      display: flex;
      align-items: center;
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
    top: 160px;
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
  .clip {
    cursor: pointer;
  }
`;

function Detail() {
  const maker = {
    전시회: exhibitionIcon,
    공연: popupstoreIcon,
    축제: festivalIcon,
    "원데이 클래스": oneDayClassIcon,
  };

  const color = {
    전시회: "#1593FF",
    공연: "#F3757C",
    축제: "#EFA116",
    "원데이 클래스": "#981C26",
  };

  const navigate = useNavigate();
  const day = ["월", "화", "수", "목", "금", "토", "일"];
  const [img, setImg] = useState([dummyMusicalImg1, dummyMusicalImg3]);
  const [promotion, setPromotion] = useState([
    dummyMusicalImg6,
    dummyMusicalImg2,
    dummyMusicalImg5,
    dummyMusicalImg4,
  ]);
  const [top, setTop] = useState(0);
  const [data, setData] = useState({
    title: "뮤지컬 〈브로드웨이 42번가〉",
    category: "공연",
    location: "서울특별시 송파구 잠실동 40-1",
    place_name: "샤롯데씨어터",
    location_x: 37.5112866236555,
    location_y: 127.097939034042,
    homepage: "https://tickets.interpark.com/goods/25007451",
    description: `국내 초연 21주년, 브로드웨이 스테디셀러 뮤지컬
    브로드웨이 5,000회 이상 정기공연 기록!
    1996년 국내 초연 이후 21년 동안 써내려간 흥행불패의 신화
    2016년 20주년 공연의 성공적인 피날레에 힘입어
    격이 다른 뮤지컬의 진화판 ‘21년산’으로 되돌아오다.

    경쾌하고 짜릿한 쇼 뮤지컬의 진수, 더욱 완벽해진 무대로 찾아오다!

    20주년 기념공연에서 새롭게 선보인 장면들의 안무, 세트, 조명을 보완해
    압도적인 입체감과 역대 최고 레벨의 탭댄스를 선보인다.
    올 여름 누구나 즐길 수 있는 짜릿한 퍼포먼스와 차원이 다른 고품격 무대가 펼쳐진다.

    BEST CASTING MATCH, 믿고 보는 배우들의 환상적인 조합
    카리스마 넘치는 ‘외강내유’ 형 줄리안 마쉬, 김석훈!
    시크하면서도 반전 있는 ‘외유내강’형 줄리안마쉬, 이종혁!
    21년 만에 뭉친 초연콤비, 최정원, 전수경!
    새롭게 합류한 NEW CAST, 배해선, 오소연!
    환상호흡의 최정예 멤버, 전예지, 에녹, 전재홍!
    새롭고 품격 있는 캐스트로 차원이 다른 21주년 무대를 선보인다.`,
    start_date: "2024-01-02T00:00:00", //시작 일시
    end_date: "2024-01-03T00:00:00", //종료 일시
    open: "오픈 시간",
    close: "휴관 일",
    charge: 1,
    view: 10, //조회수
    wraning: 0, // 신고 횟수
    created_at: "2025-07-10T00:00:00", //작성 일시
    updated_at: "2025-09-14T00:00:00", //마지막 수정 일시
    hashtag_list: ["#신나는", "#탭댄스"], // 해시태그
    event_review_list: [], //이벤트 리뷰 응답형식 참고
  });
  const [info, setInfo] = useState({
    run: false,
    fee: false,
    more: false,
  });
  const [isOpen, setIsOpen] = useState(0);
  const [open, setOpen] = useState({
    월: "공연없음",
    화: "19:30",
    수: "14:30, 19:30",
    목: "19:30",
    금: "19:30",
    토: "14:00, 18:30",
    일: "14:00",
  });
  const [close, setClose] = useState([]);
  const [fee, setFee] = useState([
    { target: "VIP", price: 130000 },
    { target: "OP석", price: 110000 },
    { target: "R석", price: 110000 },
    { target: "S석", price: 80000 },
    { target: "A선", price: 60000 },
  ]);

  //TouchScroll
  const slider = useRef();
  const container = useRef();
  const [startPos, setStartPos] = useState(0);
  const [curPos, setCurPos] = useState(0);
  const [page, setPage] = useState(0);

  const [nearBy, setNearBy] = useState([]);
  const [copy, setCopy] = useState(false);
  const [popup, setPopup] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [review, setReview] = useState([
    {
      star_rating: 5,
      event_review_image_dto_list: [dummyReviewImg1],
      content: "기대 안하고 갔었는데 재밌게 잘봤어요!",
    },
  ]);

  //starRation
  const [starRating, setStarRating] = useState([1, 2, 5, 3, 7]);
  const [starAvg, setStarAvg] = useState((0).toFixed(1));

  //bookmark
  const [isBookmarked, setIsBookmarked] = useState(false);

  function dateFromat(date) {
    return date.split("T")[0].replace("-", ".").replace("-", ".");
  }

  const isOpened = (startDate, endDate) => {
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
  function share() {
    const shareData = {
      title: data.title,
      text: data.description,
      url: window.location.href,
    };
    try {
      navigator.share(shareData);
    } catch (err) {
      navigator.clipboard.writeText(window.location.href);
      alert("주소가 복사되었습니다");
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
  }
  const Anchor = () => {
    let buf = [];
    for (let i = 0; i < Math.ceil(img.length); i++) {
      if (page === i)
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
  const touchStartEvent = (e) => {
    setStartPos(e.changedTouches[0].pageX);
  };
  const touchMoveEvent = (e) => {
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
  };
  const touchEndEvent = (e) => {
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
      slider.current.style.transform = `translate(${-width * (limit - 1)}px)`;
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
      setPage(-destination / width);
      setTimeout(() => {
        slider.current.style.transitionDuration = "0ms";
      }, 600);
    }
    container.current.style.overflowY = "scroll";
    container.current.style.overflowX = "hidden";
  };

  useEffect(() => {
    const rate = [1, 2, 5, 3, 7];
    setStarRating(rate);
    let avg = 0;
    let total = 0;
    for (let i = 0; i < 5; i++) {
      avg += (i + 1) * rate[i];
      total += rate[i];
    }
    setStarAvg((avg / total).toFixed(1));
  }, []);

  return (
    <DetailCss
      top={top}
      img={img}
      info={info}
      copy={copy}
      popup={popup}
      onScroll={(e) => {
        setTop(e.target.scrollTop);
      }}
      ref={container}
    >
      <div className="header">
        <Link className="header_back" to="/">
          <TfiAngleLeft />
        </Link>
        <div className="header_menu">
          {isBookmarked ? (
            <IoBookmark
              style={{ cursor: "pointer" }}
              onClick={() => {
                setIsBookmarked(false);
              }}
            />
          ) : (
            <IoBookmarkOutline
              style={{ cursor: "pointer" }}
              onClick={() => {
                setIsBookmarked(true);
              }}
            />
          )}
          <AiOutlineEllipsis
            style={{ cursor: "pointer" }}
            onClick={() => {
              setPopup(!popup);
            }}
          />
        </div>
      </div>
      <div className="ImgContainer">
        <div
          className="slider"
          ref={slider}
          onTouchStart={(e) => {
            touchStartEvent(e);
          }}
          onTouchMove={(e) => {
            touchMoveEvent(e);
          }}
          onTouchEnd={(e) => {
            touchEndEvent(e);
          }}
        >
          {img.map((e, idx) => {
            return (
              <div
                style={{
                  backgroundImage:
                    'linear-gradient(180deg, rgba(38, 38, 38, 0.00) 69.7%, rgba(38, 38, 38, 0.40) 80.18%, #262626 109.8%), url("' +
                    e +
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

      <div className="shortly">
        <p className="title">{data.title}</p>
        <div className="location">
          <span>{data.location.split(" ")[0]}</span>
          <span style={{ whiteSpace: "pre-wrap" }}>{"  ·  "}</span>
          <span>{data.location.split(" ")[1]}</span>
        </div>
      </div>

      <div className="part1">
        <div className="info topInfo">
          <img src={dateIcon} alt={"dateIcon"} />
          <span className="text">
            {dateFromat(data.start_date) + " - " + dateFromat(data.end_date)}
          </span>
        </div>

        <div className="info">
          <img src={locationIcon} alt={"locationIcon"} />

          <span className="text">{data.location + " " + data.place_name}</span>
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
                    : open["월"])}
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
                          (open[e] === null ? "운영정보 없음" : open[e])}
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

        <Link to={"/payment"}>
          <div className="ticket">
            <img src={ticketIcon} alt={"ticketIcon"} />
          </div>
        </Link>

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

                {data.hashtag_list.map((e, idx) => {
                  return (
                    <span key={idx} className="hashtag">
                      {e}
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
              return <img className="poster" src={e} alt="poster" key={idx} />;
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

          <Map
            center={{ lat: data.location_x, lng: data.location_y }}
            style={{ width: "100%", height: "360px" }}
          >
            <MapMarker
              position={{ lat: data.location_x, lng: data.location_y }}
              image={{
                src: maker[data.category],
                size: { width: 40, height: 40 },
              }}
            ></MapMarker>
          </Map>

          <div className="location">
            <p className="text">{data.location + " " + data.place_name}</p>

            <div
              className="clip"
              onClick={() => {
                setCopy(true);
                setTimeout(() => {
                  setCopy(false);
                }, 800);
                navigator.clipboard.writeText(
                  data.location + " " + data.place_name
                );
              }}
            >
              <img src={copyIcon} alt="copy" />
            </div>
          </div>
        </div>

        <div className="review">
          <div className="subHeader">
            <p className="subTitle subTitle1">관람 후기</p>
            <p
              className="moreReview"
              onClick={() => {
                navigate("/event/review");
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
                    <StarComponent size={12} star={review[0].star_rating} />
                    <p className="writeDay">3일전</p>
                  </div>
                  <div className="reviewContent">
                    {review[0].event_review_image_dto_list.length > 0 && (
                      <img
                        alt="reviewImg"
                        src={review[0].event_review_image_dto_list[0]}
                      />
                    )}
                    <p className="text">{review[0].content}</p>
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
          <Link to={"/event/review-create"} style={{ textDecoration: "none" }}>
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
                <span className="confirm red " onClick={() => {}}>
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
      <p style={{ height: "50px" }}></p>
      <Footer mode={-1} />
    </DetailCss>
  );
}

export default Detail;
