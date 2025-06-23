// 게더링 상세 및 이벤트 상세 페이지의 댓글 아이콘을 클릭 시 보이는 화면입니다.
import React from "react";
import styled from "styled-components";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import dateIcon from "../Img/MainEventComponent/date.svg";
import locationIcon from "../Img/MainEventComponent/location.svg";
import dateBlackIcon from "../Img/MainEventComponent/dateBlack.svg";
import locationBlackIcon from "../Img/MainEventComponent/locationBlack.svg";
const color = {
  전시회: "#1593FF",
  공연: "#F3757C",
  축제: "#EFA116",
  "원데이 클래스": "#981C26",
};
//css 기본
const MainEventComponent1Css = styled.div`
  width: 200px;
  .img {
    background-image: url("${(props) => props.img}");
    background-position: center;
    background-size: cover;
    width: 200px;
    height: 267px;
  }
  .content {
    margin-top: 12px;
  }

  .category {
    font-size: 12px;
    font-weight: 600;
    margin: 5px 0;
  }

  .title {
    width: 200px;
    white-space: nowrap;
    overflow: hidden;
    color: #080708;
    text-overflow: ellipsis;
    font-size: 14px;
    font-weight: 600;
    margin: 5px 0;
  }

  .container {
    display: flex;
    align-items: center;
    margin: 5px 0;
  }
  img {
    margin-right: 4px;
  }
  .text {
    color: #080708;
    font-size: 12px;
    font-weight: 400;
    margin: 0;
  }
  .site {
    color: #525252;
  }
`;
//
export function MainEventComponent1(props) {
  const navigate = useNavigate();
  const [data, setData] = useState({});
  const [img, setImg] = useState("");
  const [startDate, setStartDate] = useState("준비중");
  const [endDate, setEndDate] = useState("마감시 종료");
  useEffect(() => {
    setData({ ...props.data });
    if (props.data.img !== null) setImg(props.data.img);
    if (props.data.start_date != null) {
      setStartDate(
        props.data.start_date.split("T")[0].replace("-", ".").replace("-", ".")
      );
    }
    if (props.data.end_date != null) {
      setEndDate(
        props.data.end_date.split("T")[0].replace("-", ".").replace("-", ".")
      );
    }
  }, []);

  return (
    <MainEventComponent1Css
      onClick={() => {
        if (data.is_sell) navigate("/EventDetail?id=" + props.id);
        else window.location.href = data.ticket_link;
      }}
      img={img}
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
              data.location.split(" ")[0] + " " + data.location.split(" ")[1]}
            {!data.is_sell && (
              <span className="text site">{" · " + data.homepage}</span>
            )}
          </p>
        </div>
        <div className="container">
          <img src={dateBlackIcon} alt="date" />
          <p className="text">{startDate + " - " + endDate}</p>
        </div>
      </div>
    </MainEventComponent1Css>
  );
}

const MainEventComponent2Css = styled.div`
  flex-shrink: 0;
  background-image: linear-gradient(
      180deg,
      rgba(38, 38, 38, 0) 69.7%,
      rgba(38, 38, 38, 0.4) 80.18%,
      #262626 109.8%
    ),
    url("${(props) => props.img}");
  width: ${window.innerWidth > 450
    ? (450 * 3) / 4
    : (window.innerWidth * 3) / 4}px;

  height: ${window.innerWidth > 450 ? 450 : window.innerWidth}px;
  background-position: center;
  background-size: cover;
  display: flex;
  align-items: end;

  .content {
    width: 90%;
    margin-left: 20px;
    margin-bottom: 20px;
  }

  .title {
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    margin: 8px 0;
    text-overflow: ellipsis;
  }

  .container {
    display: flex;
    align-items: center;
    margin: 5px 0;
    img {
      margin-right: 4px;
    }
    .text {
      font-size: 12px;
      font-weight: 400;
      color: #fff;
      margin: 0;
    }
  }
`;

export function MainEventComponent2(props) {
  const navigate = useNavigate();
  const [data, setData] = useState({});
  const [img, setImg] = useState("");
  const [startDate, setStartDate] = useState("준비중");
  const [endDate, setEndDate] = useState("마감시 종료");
  useEffect(() => {
    setData({ ...props.data });
    if (props.data.img !== null) setImg(props.data.img);
    if (props.data.start_date != null) {
      setStartDate(
        props.data.start_date.split("T")[0].replace("-", ".").replace("-", ".")
      );
    }
    if (props.data.end_date != null) {
      setEndDate(
        props.data.end_date.split("T")[0].replace("-", ".").replace("-", ".")
      );
    }
  }, []);
  return (
    <MainEventComponent2Css
      onClick={() => {
        if (data.is_sell) navigate("/EventDetail?id=" + props.id);
        else window.location.href = data.ticket_link;
      }}
      img={img}
    >
      <div className="content">
        <p className="title">{data.title}</p>
        <div className="container">
          <img src={locationIcon} alt="location" />
          <p className="text">
            {data.location !== undefined &&
              data.location.split(" ")[0] + " " + data.location.split(" ")[1]}
            {!data.is_sell && (
              <span className="text site">{" · " + data.homepage}</span>
            )}
          </p>
        </div>
        <div className="container">
          <img src={dateIcon} alt="date" />
          <p className="text">{startDate + " - " + endDate}</p>
        </div>
      </div>
    </MainEventComponent2Css>
  );
}

const MainEventComponent3Css = styled.div`
  flex-shrink: 0;
  background-image: linear-gradient(
      180deg,
      rgba(38, 38, 38, 0) 69.7%,
      rgba(38, 38, 38, 0.4) 80.18%,
      #262626 109.8%
    ),
    url("${(props) => props.img}");
  background-position: center;
  background-size: cover;
  width: ${window.innerWidth > 450 ? 405 : window.innerWidth * 0.9}px;
  height: ${window.innerWidth > 450 ? 540 : window.innerWidth * 1.2}px;
  display: flex;
  align-items: end;

  .content {
    margin-left: 20px;
    margin-bottom: 30px;
  }

  .text {
    font-size: 20px;
    font-style: normal;
    font-weight: 600;
    color: #fff;
    margin: 5px 0;
  }
`;

export function MainEventComponent3(props) {
  const [img, setImg] = useState("");
  useEffect(() => {
    if (props.data.img !== null) setImg(props.data.img);
  }, []);
  return (
    <Link
      className="moreDiv"
      to={"/EventList?theme&id=" + props.theme}
      style={{ textDecoration: "none" }}
    >
      <MainEventComponent3Css img={img}>
        <div className="content">
          <p className="text">{"에디터 추천"}</p>
          <p className="text">{"전시와 팝업 " + props.len + "곳"}</p>
        </div>
      </MainEventComponent3Css>
    </Link>
  );
}

const DetailEventComponentCss = styled.div`
  width: ${window.innerWidth > 450 ? 225 - 9.5 : window.innerWidth / 2 - 9.5}px;
  margin-bottom: 40px;
  .img {
    background-image: url("${(props) => props.img}");
    background-position: center;
    background-size: cover;
    width: ${window.innerWidth > 450
      ? 225 - 9.5
      : window.innerWidth / 2 - 9.5}px;
    height: ${window.innerWidth > 450
      ? ((225 - 9.5) * 4) / 3
      : ((window.innerWidth / 2 - 9.5) * 4) / 3}px;
  }
  .content {
    margin-top: 12px;
  }

  .category {
    font-size: 12px;
    font-weight: 600;
    margin: 5px 0;
  }

  .title {
    white-space: nowrap;
    overflow: hidden;
    color: #080708;
    text-overflow: ellipsis;
    font-size: 14px;
    font-weight: 600;
    margin: 5px 0;
  }

  .container {
    display: flex;
    align-items: center;
    margin: 5px 0;
  }
  img {
    margin-right: 4px;
  }
  .text {
    color: #080708;
    font-size: 12px;
    font-weight: 400;
    margin: 0;
  }

  .site {
    color: #525252;
  }
`;

export function DetailEventComponent(props) {
  const navigate = useNavigate();
  const [data, setData] = useState({});
  const [img, setImg] = useState("");

  useEffect(() => {
    setData({ ...props.data });
    if (props.data.img !== null) setImg(props.data.img);
  }, []);

  return (
    <DetailEventComponentCss
      onClick={() => {
        if (data.is_sell) navigate("/EventDetail?id=" + props.id);
        else window.location.href = data.ticket_link;
        window.history.scrollRestoration = "manual";
        window.location.reload();
      }}
      img={img}
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
              data.location.split(" ")[0] + " " + data.location.split(" ")[1]}
            {!data.is_sell && (
              <span className="text site">{" · " + data.homepage}</span>
            )}
          </p>
        </div>
      </div>
    </DetailEventComponentCss>
  );
}
const EventListComponentCss = styled.div`
  ${(props) => !props.display && "display:none"};
  width: ${window.innerWidth > 450 ? 225 - 9.5 : window.innerWidth / 2 - 9.5}px;
  margin-bottom: 40px;
  .img {
    background-image: url("${(props) => props.img}");
    background-position: center;
    background-size: cover;
    width: ${window.innerWidth > 450
      ? 225 - 9.5
      : window.innerWidth / 2 - 9.5}px;
    height: ${window.innerWidth > 450
      ? ((225 - 9.5) * 4) / 3
      : ((window.innerWidth / 2 - 9.5) * 4) / 3}px;
  }
  .content {
    margin-top: 12px;
  }

  .chipList {
    display: flex;
    gap: 10px;
    margin: 8px 0;
  }

  .chip {
    border-radius: 100px;
    padding: 4px 9px;
    font-size: 10px;
    font-weight: 400;
  }

  .gray {
    background: #f2f3f5;
    font-size: 10px;
    font-weight: 400;
  }

  .category {
    color: #fff;
  }

  .title {
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    color: #080708;
    text-overflow: ellipsis;
    font-size: 14px;
    font-weight: 600;
    margin: 5px 0;
  }

  .container {
    display: flex;
    align-items: center;
    margin: 5px 0;
  }
  img {
    margin-right: 4px;
  }
  .text {
    color: #080708;
    font-size: 12px;
    font-weight: 400;
    margin: 0;
  }
  .site {
    color: #525252;
  }
`;
export function EventListComponent(props) {
  const navigate = useNavigate();
  const [data, setData] = useState({});
  const [img, setImg] = useState("");
  const [startDate, setStartDate] = useState("준비중");
  const [endDate, setEndDate] = useState("마감시 종료");
  const [Dday, setDday] = useState(-1);
  const [fee, setFee] = useState("무료");

  const displayRun = (startDate, endDate) => {
    if (startDate === null) {
      return -1;
    }

    let now = new Date();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    now.setMilliseconds(0);

    let start = new Date(startDate);
    start.setHours(0);
    start.setMinutes(0);
    start.setSeconds(0);
    start.setMilliseconds(0);

    if (endDate !== null && now - start >= 0) {
      let end = new Date(endDate);
      end.setHours(0);
      end.setMinutes(0);
      end.setSeconds(0);
      end.setMilliseconds(0);

      let time = end.getTime() - now.getTime();
      let gap = time / (1000 * 60 * 60 * 24);

      if (gap <= 7) return gap;
      else return -1;
    }

    return -1;
  };

  useEffect(() => {
    if (props.data.img !== null) setImg(props.data.img);
    setData(props.data);
    if (props.data.charge === 1) {
      setFee("유료");
    } else if (props.data.charge === 2) setFee("부분유료");

    if (props.data.start_date != null) {
      setStartDate(
        props.data.start_date.split("T")[0].replace("-", ".").replace("-", ".")
      );
    }
    if (props.data.end_date != null) {
      setEndDate(
        props.data.end_date.split("T")[0].replace("-", ".").replace("-", ".")
      );
    }
  }, []);

  return (
    <EventListComponentCss
      onClick={() => {
        if (data.is_sell) navigate("/EventDetail?id=" + props.id);
        else window.location.href = data.ticket_link;
      }}
      display={props.display}
      img={img}
    >
      <div className="img"></div>
      <div className="content">
        <div className="chipList">
          <span
            className="category chip"
            style={{ background: color[data.category] }}
          >
            {data.category}
          </span>
          <span className="chip gray">{fee}</span>
          {Dday > 0 && <span className="chip gray">{"종료 D -" + Dday}</span>}
          {Dday === 0 && <span className="chip gray">{"마지막 날"}</span>}
        </div>
        <p className="title">{data.title}</p>
        <div className="container">
          <img src={locationBlackIcon} alt="location" />
          <p className="text">
            {data.location !== undefined &&
              data.location.split(" ")[0] + " " + data.location.split(" ")[1]}
            {!data.is_sell && (
              <span className="text site">{" · " + data.homepage}</span>
            )}
          </p>
        </div>
        <div className="container">
          <img src={dateBlackIcon} alt="date" />
          <p className="text">{startDate + " - " + endDate}</p>
        </div>
      </div>
    </EventListComponentCss>
  );
}

const MapEventComponentCss = styled.div`
  width: 100%;
  display: flex;
  padding-bottom: 30px;
  .img {
    margin: 0 20px;
    display: flex;
    img {
      width: 120px;
      object-fit: contain;
    }
  }
  .content {
    width: calc(100% - 180px);
    margin: 20px 10px;
  }

  .category {
    font-size: 14px;
    font-weight: 600;
    margin: 10px 0;
  }

  .title {
    width: 90%;
    white-space: nowrap;
    overflow: hidden;
    color: #080708;
    text-overflow: ellipsis;
    font-size: 14px;
    font-weight: 600;
    margin: 10px 0;
  }

  .container {
    display: flex;
    align-items: center;
    margin: 10px 0;
  }
  img {
    margin-right: 4px;
  }
  .text {
    color: #080708;
    font-size: 12px;
    font-weight: 400;
    margin: 0;
  }

  .site {
    color: #525252;
  }
`;

export function MapEventComponent(props) {
  const navigate = useNavigate();
  const [data, setData] = useState({});
  const [img, setImg] = useState("");
  const [startDate, setStartDate] = useState("준비중");
  const [endDate, setEndDate] = useState("마감시 종료");

  useEffect(() => {
    setData({ ...props.data });
    if (props.data.img !== null) {
      setImg(props.data.img);
    }
    setStartDate(
      props.data.start_date.split("T")[0].replace("-", ".").replace("-", ".")
    );
    if (props.data.end_date != null) {
      setEndDate(
        props.data.end_date.split("T")[0].replace("-", ".").replace("-", ".")
      );
    }
  }, []);

  return (
    <MapEventComponentCss
      onClick={() => {
        if (data.is_sell) navigate("/EventDetail?id=" + props.id);
        else window.location.href = data.ticket_link;
      }}
    >
      <div className="img">
        <img src={img} alt="img" />
      </div>
      <div className="content">
        <p className="category" style={{ color: color[data.category] }}>
          {data.category}
        </p>
        <p className="title">{data.title}</p>
        <div className="container">
          <img src={dateBlackIcon} alt="date" />
          <p className="text">{startDate + " - " + endDate}</p>
        </div>
        <div className="container">
          <img src={locationBlackIcon} alt="location" />
          <p className="text">
            {data.location !== undefined &&
              data.location.split(" ")[0] + " " + data.location.split(" ")[1]}
            {!data.is_sell && (
              <span className="text site">{" · " + data.homepage}</span>
            )}
          </p>
        </div>
      </div>
    </MapEventComponentCss>
  );
}
