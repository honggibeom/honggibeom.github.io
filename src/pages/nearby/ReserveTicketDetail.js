import React, { useEffect, useState } from "react";
import styled from "styled-components";

import { useLocation, useNavigate } from "react-router-dom";
import { TfiAngleLeft } from "react-icons/tfi";
import Footer from "./Component/Footer";
import locationBlackIcon from "./Img/MainEventComponent/locationBlack.svg";
import dateBlackIcon from "./Img/MainEventComponent/dateBlack.svg";
import ticketIcon from "./Img/ReserveTicket/ticket.svg";
import PopUp from "./Component/PopUp";

const ReserveTicketDetailCSS = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
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
    .reserveTicketDetail {
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
  .description {
    margin: 0 20px;
  }
  .subtitle {
    font-size: 16px;
    font-weight: 600;
  }
  .subInfo {
    display: flex;
  }
  .infoTitle {
    display: flex;
    flex-direction: column;
    font-size: 13px;
    margin-right: 35px;
    p {
      margin: 7px 0;
    }
  }
  .info {
    display: flex;
    flex-direction: column;
    font-size: 13px;
    p {
      margin: 7px 0;
    }
  }
  .ticketInfo {
    display: flex;
    font-size: 13px;
    justify-content: space-between;
    p {
      margin: 7px 0;
      white-space: nowrap;
    }
  }
  .age {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }
  .ageInfo {
    display: flex;
    flex-direction: column;
  }
  .agePrice {
    display: flex;
    flex-direction: column;
    text-align: end;
  }
  .totalPrice {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
  }
  .ticketBold,
  .priceBold {
    font-weight: 600;
  }
`;

function ReserveTicketDetail() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id");
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
    <ReserveTicketDetailCSS img={img}>
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
        <p className="reserveTicketDetail">예매상세내역</p>
      </div>
      <div className="layout">
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
      <div className="description">
        <p className="subtitle">예매정보</p>
        <div className="subInfo">
          <div className="infoTitle">
            <p>관람일시</p>
            <p>예매일</p>
            <p>예매번호</p>
            <p>예매자명</p>
            <p>예매상태</p>
            <p>수령방법</p>
          </div>
          <div className="info">
            <p>2024.01.15(월) 15:00</p>
            <p>2024.01.14(일) 15:00</p>
            <p className="ticketBold">T2351571590</p>
            <p>박장훈</p>
            <p>예매완료</p>
            <p>현장에서 티켓으로 교환</p>
          </div>
        </div>
        <p className="subtitle">결제정보</p>
        <div>
          <div className="ticketInfo">
            <div className="infoTitle">
              <p>티켓정보</p>
            </div>
            <div className="age">
              <div className="ageInfo">
                <p>성인 2명</p>
                <p>청소년 1명</p>
                <p>VIP 성인 1명</p>
              </div>
              <div className="agePrice">
                <p>8,000원</p>
                <p>4,000원</p>
                <p>17,000원</p>
              </div>
            </div>
          </div>
          <div className="totalPrice">
            <p>결제금액</p>
            <p className="priceBold">29,000원</p>
          </div>
        </div>
      </div>
      <div style={{ height: "72px", width: "100%" }}></div>
      <Footer mode={3} />
    </ReserveTicketDetailCSS>
  );
}
export default ReserveTicketDetail;
