import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import noAlarm from "./Img/Alarm/noAlarm.svg";

import userimg from "./Img/ProfileSet/ProfileImg.svg";
import { TfiAngleLeft } from "react-icons/tfi";

const AlarmElementCss = styled.div`
  display: flex;
  width: 90vw;
  height: auto;
  margin-left: 5vw;
  padding-top: 1vh;
  border-bottom: 1px solid #f5f5f5;
  p,
  span {
    font-family: "Spoqa Han Sans Neo";
    letter-spacing: -0.02em;
  }
  img {
    width: 42px;
    height: 42px;
    border-radius: 100%;
    margin-top: 2vh;
  }

  .info {
    margin-top: 1vh;
    margin-left: 3vw;
    width: 80vw;
    height: auto;
    padding-bottom: 2vh;
    .name {
      font-weight: 700;
      font-size: 16px;
    }
    .content {
      display: flex;
      padding: 1vh 0;
      flex-wrap: wrap;
      span {
        font-weight: 500;
        font-size: 14px;
        color: #080708;
      }
      .Highlight {
        display: inline-block;
        padding-left: 1vw;
        font-weight: 400;
        font-size: 14px;
        color: #ff8e66;
      }
    }
    .time {
      margin-top: 0.5vh;
      font-weight: 400;
      font-size: 12px;
      color: #9698a0;
    }
  }
`;
function AlarmElement(props) {
  const [data, setData] = useState({});
  const Content = (kind) => {
    if (kind === "댓글")
      return (
        <>
          <span>님이 회원님의 게시물에</span>
          <span className="Highlight">댓글</span>
          <span>을&nbsp;</span>
          <span>달</span>
          <span>았</span>
          <span>습</span>
          <span>니</span>
          <span>다.</span>
        </>
      );
    else if (kind === "댓글좋아요")
      return (
        <>
          <span>님이 회원님의</span>
          <span className="Highlight">댓글</span>
          <span>을&nbsp;</span>
          <span>좋</span>
          <span>아</span>
          <span>합</span>
          <span>니</span>
          <span>다.</span>
          <span></span>
        </>
      );
    else if (kind === "게더링신청")
      return (
        <>
          <span>님이 회원님이 개설한</span>
          <span className="Highlight">게더링</span>
          <span>에&nbsp;</span>
          <span>참</span>
          <span>여</span>
          <span>를&nbsp;</span>
          <span>신</span>
          <span>청</span>
          <span>했</span>
          <span>습</span>
          <span>니</span>
          <span>다.</span>
        </>
      );
    else if (kind === "게더링승인")
      return (
        <>
          <span>님이 회원님이 참여요청한</span>
          <span className="Highlight">게더링</span>
          <span>에&nbsp;</span>
          <span>참</span>
          <span>여</span>
          <span>가&nbsp;</span>
          <span>승</span>
          <span>인</span>
          <span>되</span>
          <span>었</span>
          <span>습</span>
          <span>니</span>
          <span>다.</span>
        </>
      );
    else if (kind === "이벤트신청")
      return (
        <>
          <span>님이 회원님이 개설한</span>
          <span className="Highlight">이벤트</span>
          <span>에&nbsp;</span>
          <span>참</span>
          <span>여</span>
          <span>를&nbsp;</span>
          <span>신</span>
          <span>청</span>
          <span>했</span>
          <span>습</span>
          <span>니</span>
          <span>다.</span>
        </>
      );
    else if (kind === "이벤트승인")
      return (
        <>
          <span>님이 회원님이 참여요청한</span>
          <span className="Highlight">이벤트</span>
          <span>에&nbsp;</span>
          <span>참</span>
          <span>여</span>
          <span>가&nbsp;</span>
          <span>승</span>
          <span>인</span>
          <span>되</span>
          <span>었</span>
          <span>습</span>
          <span>니</span>
          <span>다.</span>
        </>
      );
    else if (kind === "팔로우")
      return (
        <>
          <span>님이 회원님께</span>
          <span className="Highlight">친구 요청을</span>
          <span>보</span>
          <span>냈</span>
          <span>습</span>
          <span>니</span>
          <span>다</span>
        </>
      );

    // else if(kind==='채널')
    // return( <>
    // <span>님이 회원님이 개설한</span>
    // <span className='Highlight'>채널</span>
    // <span>에&nbsp;</span><span>가</span><span>입</span><span>을 </span><span>신</span><span>청</span><span>했</span><span>습</span><span>니</span><span>다</span>.
    // </>)
  };
  return (
    <AlarmElementCss>
      <img
        src={
          data.profile_image === null || data.profile_image === undefined
            ? userimg
            : data.profile_image
        }
        alt="img"
      />
      <div className="info">
        <p className="name">
          {data.nickname === null || data.nickname === undefined
            ? data.email
            : data.nickname}
        </p>
        <div className="content">{Content(props.data.content)}</div>
        <p className="time">{props.data.created_at.split("T")[0]}</p>
      </div>
    </AlarmElementCss>
  );
}
const AlarmCss = styled.div`
  overflow: hidden;
  width: 100vw;
  height: 100vh;
  p {
    margin: 0;
    font-family: "Spoqa Han Sans Neo";
    letter-spacing: -0.02em;
  }
  .header {
    width: 100vw;
    height: 7vh;
    display: flex;
    border-bottom: 1px solid #f5f5f5;
    .fa-solid {
      cursor: pointer;
      display: flex;
      width: 6vw;
      padding: 0 2vw;
      height: 7vh;
      align-items: center;
      justify-content: center;
    }

    p {
      display: flex;
      width: 80vw;
      height: 7vh;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 16px;
      color: #080708;
    }
  }

  .alarmContainer {
    width: 100vw;
    height: 93vh;
    overflow-y: auto;
    .scroll {
      width: 100vw;
      height: auto;

      .noAlarm {
        width: 40vw;
        height: 20vh;
        margin-left: 30vw;
        margin-top: 31vh;
      }
    }
  }
`;
function Alarm() {
  const navigate = useNavigate();
  const [alarm, setAlarm] = useState([]);

  return (
    <AlarmCss>
      <div className="header">
        <TfiAngleLeft
          className="fa-solid fa-angle-left"
          onClick={() => navigate(-1)}
        />
        <p>알림</p>
      </div>

      <div className="alarmContainer">
        <div className="scroll">
          {alarm.length === 0 && (
            <img src={noAlarm} alt="noAlarm" className="noAlarm" />
          )}
          {/* <AlarmElement />
                <AlarmElement  />
                <AlarmElement  />
                <AlarmElement  />
                <AlarmElement  />
                <AlarmElement data={e}/> */}
          {alarm.map((e, idx) => {
            return <AlarmElement key={idx} id={e.target} data={e} />;
          })}
        </div>
      </div>
    </AlarmCss>
  );
}

export default Alarm;
