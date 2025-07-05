import React, { useEffect, useState } from "react";
import styled from "styled-components";

import { useNavigate } from "react-router-dom";
import { TfiAngleLeft } from "react-icons/tfi";
import Footer from "./Component/Footer";
import locationBlackIcon from "./Img/MainEventComponent/locationBlack.svg";
import dateBlackIcon from "./Img/MainEventComponent/dateBlack.svg";
import ticketIcon from "./Img/ReserveTicket/ticket.svg";
import PopUp from "./Component/PopUp";
const ReserveTicketCSS = styled.div`
  position: relative;
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
    position: sticky;
    top: 0;
    z-index: 1;
    background-color: white;
    padding: 10px 20px;
    display: flex;
    align-items: center;
    .exit {
      width: 10%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    }
    .reserveTicket {
      width: 80%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
    }
  }
  .borderLine {
    margin: 0 20px;
    border-bottom: 1.5px solid #e6e6e6;
  }
  .layout {
    display: flex;
    cursor: pointer;
    overflow: auto;
  }
  .img {
    background-image: url("${(props) => props.img}");
    background-position: center;
    background-size: cover;
    height: 155px;
    width: 111px;
    margin: 10px 20px 10px 20px;
  }
  .content {
    margin: 10px 20px 10px 0px;
    width: 260px;
    display: flex;
    flex-direction: column;
  }
  .category {
    font-size: 13px;
    font-weight: 600;
    margin: 5px 0 0 0;
  }
  .title {
    width: 200px;
    white-space: nowrap;
    overflow: hidden;
    color: #080708;
    text-overflow: ellipsis;
    font-size: 16px;
    font-weight: 600;
    margin: 5px 0 10px 0;
  }
  .container {
    display: flex;
    align-items: center;
    margin-top: 5px;
  }
  img {
    margin-right: 4px;
  }
  .text {
    color: #080708;
    font-size: 13px;
    font-weight: 400;
    margin: 0;
  }
  .text2 {
    color: #080708;
    font-size: 13px;
    font-weight: 500;
    margin: 0;
  }
  .button {
    display: flex;
    gap: 8px;
    margin-top: auto;
  }
  .button1 {
    width: 110px;
    height: 25px;
    font-size: 13px;
    color: #981c26;
    background-color: white;
    border-radius: 0;
    border: 1px solid black;
  }
  .button2 {
    width: 110px;
    height: 25px;
    font-size: 13px;
    color: white;
    background-color: #981c26;
    border-radius: 0;
    border: 1px solid #981c26;
  }
`;

function ReserveTicket() {
  const id = 7; // 임시 이벤트 id
  const navigate = useNavigate();
  const [data, setData] = useState({});
  const [img, setImg] = useState("");
  const [endDate, setEndDate] = useState("마감시 종료"); // 관람일시로 변경할 것
  const [isPopupOpen, setPopupOpen] = useState(false);
  const togglePopup = () => {
    setPopupOpen(!isPopupOpen);
  };
  const handleCancelClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    togglePopup();
  };
  const handleClose = () => {
    setPopupOpen(false);
  };
  const color = {
    전시회: "#1593FF",
    공연: "#F3757C",
    축제: "#EFA116",
    "원데이 클래스": "#981C26",
  };
  const state = {
    예매완료: "#981C26",
    예매취소: "#1593FF",
  };

  return (
    <ReserveTicketCSS img={img}>
      {isPopupOpen && <PopUp type={1} handleClose={handleClose} />}
      <div className="header">
        <p
          className="exit"
          onClick={() => {
            navigate(-1);
          }}
        >
          <TfiAngleLeft />
        </p>
        <p className="reserve-ticket">티켓 예매내역</p>
      </div>
      <div
        className="layout"
        onClick={() => navigate("/reserve-ticket/etail?id=" + id)}
      >
        <div className="img"></div>
        <div className="content">
          <p className="category" style={{ color: color[data.category] }}>
            {data.category}
          </p>
          <p className="title">{data.title}</p>
          <div className="container">
            <img src={locationBlackIcon} alt="location" />
            <p className="text">
              {data.location !== undefined &&
                data.location.split(" ")[0] +
                  " · " +
                  data.location.split(" ")[1]}
            </p>
          </div>
          <div className="container">
            <img src={dateBlackIcon} alt="date" />
            <p className="text">{endDate}</p>
          </div>

          {/*TODO: 예매취소한 경우에 따라서 다르게 구현*/}
          <div className="container">
            <img src={ticketIcon} alt="ticket" />
            <p className="text2">T2351571590 ·&nbsp;</p>
            <p className="text2" style={{ color: state["예매완료"] }}>
              예매완료
            </p>
            {/*<p className="text2" style={{ color: state["예매취소"] }}>예매취소</p>*/}
          </div>

          {/*TODO: 관람일시 지난 경우(현재 시각과 관람 일시 비교), 예매취소한 경우 고려하여 구현*/}
          <div className="container button">
            <button
              className="button1"
              type="button"
              onClick={handleCancelClick}
            >
              예매취소
            </button>
            <button
              className="button2"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(`/CreateForm/EventReview?event_id=${id}`);
              }}
            >
              관람후기 작성
            </button>
            {/*<button className="button1" type="button" onClick={undefined}>문의하기</button>*/}
          </div>
        </div>
      </div>
      <p className="borderLine"></p>
      <div style={{ height: "72px", width: "100%" }}></div>
      <Footer mode={3} />
    </ReserveTicketCSS>
  );
}
export default ReserveTicket;
