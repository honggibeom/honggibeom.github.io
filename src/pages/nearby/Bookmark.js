import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";

import { Link, useNavigate } from "react-router-dom";
import { TfiAngleLeft } from "react-icons/tfi";
import searchIcon from "./Img/Header/search.svg";
import filterIcon from "./Img/Header/filter.svg";
import filtering from "./Function/FilterFunctions";
import { EventListComponent } from "./Component/MainEventComponent";
import Footer from "./Component/Footer";
import Filter from "./Component/Filter";

import dummydata1 from "./Img/Main/dummydata1.svg";
import dummyimgBookmark1 from "./Img/Main/dummyimgBookmark1.png";
import dummyimgBookmark2 from "./Img/Main/dummyimgBookmark2.jpg";
import dummyimgBookmark3 from "./Img/Main/dummyimgBookmark3.jpg";
import dummyimgBookmark4 from "./Img/Main/dummyimgBookmark4.gif";
import dummyimgBookmark5 from "./Img/Main/dummyimgBookmark5.jpg";
import dummyimgBookmark6 from "./Img/Main/dummyimgBookmark6.jpg";
import dummyimgBookmark7 from "./Img/Main/dummyimgBookmark7.jpeg";
import dummyimgBookmark8 from "./Img/Main/dummyimgBookmark8.jpg";
import dummyimgBookmark9 from "./Img/Main/dummyimgBookmark9.jpg";

const dummyEvents = [
  {
    id: 1, // 고유 식별자
    img: dummydata1, // 이미지 URL 또는 null
    charge: 1, // 0=무료,1=유료,2=부분유료
    category: "전시회", // “전시회” | “공연” | …
    title: "뮤지컬 〈브로드웨이 42번가〉",
    location: "서울특별시 송파구 잠실동 40-1",
    homepage: "https://tickets.interpark.com/goods/25007451",
    start_date: "2026-01-02T00:00:00",
    end_date: "2026-01-03T00:00:00",
    is_sell: false, // true → 자체판매, false → 외부링크
    event_open_list: [],
    event_close_list: [],
  },
  {
    id: 2,
    img: dummyimgBookmark1,
    charge: 1,
    category: "전시회",
    title: "아르누보의 꽃: 알폰스 무하 원화전",
    location: "서울특별시 강남구 테헤란로 518 B1, 마이아트뮤지엄",
    homepage: "https://tickets.interpark.com/goods/25001911",
    start_date: "2025-03-20T00:00:00",
    end_date: "2025-07-13T00:00:00",
    is_sell: false,
    event_open_list: [],
    event_close_list: [],
  },
  {
    id: 3,
    img: dummyimgBookmark2,
    charge: 1,
    category: "공연",
    title: "뮤지컬 〈차미〉",
    location: "서울특별시 종로구 대학로8가길 85, TOM(티오엠) 1관",
    homepage: "https://tickets.interpark.com/goods/25005848",
    start_date: "2025-05-29T00:00:00",
    end_date: "2025-08-24T00:00:00",
    is_sell: false,
    event_open_list: [],
    event_close_list: [],
  },
  {
    id: 4,
    img: dummyimgBookmark3,
    charge: 1,
    category: "전시회",
    title: "Christian Dior: Designer of Dreams",
    location: "서울특별시 중구 을지로 281, 동대문디자인플라자(DDP)",
    homepage: "https://tickets.interpark.com/goods/25009016",
    start_date: "2025-04-19T00:00:00",
    end_date: "2025-07-13T00:00:00",
    is_sell: false,
    event_open_list: [],
    event_close_list: [],
  },
  {
    id: 5,
    img: dummyimgBookmark4,
    charge: 1,
    category: "전시회",
    title: "문도 픽사: 픽사, 상상의 세계로",
    location: "서울특별시 성동구 연무장5길 16, 성수문화예술마당",
    homepage: "https://tickets.interpark.com/goods/25004987",
    start_date: "2025-05-05T00:00:00",
    end_date: "2025-07-31T00:00:00",
    is_sell: false,
    event_open_list: [],
    event_close_list: [],
  },
  {
    id: 6,
    img: dummyimgBookmark5,
    charge: 1,
    category: "공연",
    title: "뮤지컬 〈팬텀〉",
    location: "서울특별시 종로구 세종대로 175, 세종문화회관 대극장",
    homepage: "https://tickets.interpark.com/goods/P0004249",
    start_date: "2025-05-31T00:00:00",
    end_date: "2025-08-11T00:00:00",
    is_sell: false,
    event_open_list: [],
    event_close_list: [],
  },
  {
    id: 7,
    img: dummyimgBookmark6,
    charge: 1,
    category: "공연",
    title: "뮤지컬 〈멤피스〉",
    location: "서울특별시 중구 퇴계로 387, 충무아트센터 대극장",
    homepage:
      "https://www.shownote.com/Ticket/Performance/Details?performanceId=371",
    start_date: "2025-06-17T00:00:00",
    end_date: "2025-09-21T00:00:00",
    is_sell: false,
    event_open_list: [],
    event_close_list: [],
  },
  {
    id: 8,
    img: dummyimgBookmark7,
    charge: 1,
    category: "공연",
    title: "뮤지컬 〈민들레 피리〉",
    location: "서울특별시 종로구 대학로12길 21, 예스24스테이지 2관",
    homepage: "https://tickets.interpark.com/goods/25006036",
    start_date: "2025-06-15T00:00:00",
    end_date: "2025-09-07T00:00:00",
    is_sell: false,
    event_open_list: [],
    event_close_list: [],
  },
  {
    id: 9,
    img: dummyimgBookmark8,
    charge: 0, // 무료
    category: "전시회",
    title: "말하는 머리들",
    location: "서울특별시 중구 덕수궁길 61, 서울시립미술관 서소문본관",
    homepage:
      "https://sema.seoul.go.kr/kr/whatson/exhibition/detail?exNo=1395747",
    start_date: "2025-05-01T00:00:00",
    end_date: "2025-07-06T00:00:00",
    is_sell: false,
    event_open_list: [],
    event_close_list: [],
  },
  {
    id: 10,
    img: dummyimgBookmark9,
    charge: 0, // 무료
    category: "전시회",
    title: "스토리지 스토리",
    location: "서울특별시 도봉구 마들로13길 68, 서울시립 사진미술관",
    homepage:
      "https://sema.seoul.go.kr/kr/whatson/exhibition/detail?exNo=1410085",
    start_date: "2025-05-29T00:00:00",
    end_date: "2025-10-12T00:00:00",
    is_sell: false,
    event_open_list: [],
    event_close_list: [],
  },
];

const BookmarkCSS = styled.div`
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
    .bookmark {
      width: 80%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
    }
  }
  .filterMenu {
    display: flex;
    gap: 6px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    padding: 0 20px;
    .filter {
      padding: 4px 13px 5px 13px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 100px;
      font-size: 12px;
      font-weight: 400;
    }
    .icon {
      margin: 0 4px;
    }
  }
  .eventList {
    overflow: auto;
    padding: 0 7px;
    max-width: 436px;
    height: 80%;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;

    .container .site {
      display: inline-block;
      max-width: calc(50% - 20px); /* 카드 하나의 가로폭에서 여백 뺀 너비 */
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      vertical-align: bottom;
    }
  }
`;

function Bookmark() {
  const navigate = useNavigate();
  const listRef = useRef("");
  const [display, setDisplay] = useState(false);
  const [scroll, setScroll] = useState(8);

  const [img, setImg] = useState([dummydata1, dummydata1]);
  const [event, setEvent] = useState(dummyEvents);
  const [filteredEvent, setFilteredEvent] = useState(dummyEvents);

  const [filter, setFilter] = useState({
    category: {
      전시회: false,
      공연: false,
      축제: false,
      "원데이 클래스": false,
    },
    fee: { 무료: false, 유료: false, 부분유료: false },
    run: {
      "곧 오픈": false,
      "현재 운영중": false,
      "곧 종료": false,
    },
    startDate: null,
    endDate: null,
  });

  useEffect(() => {
    setFilteredEvent([]);
    let buf = [];
    listRef.current.scrollTop = 0;

    if (event && event.length > 0) {
      for (const e of event) {
        if (filtering(filter, e)) buf.push(e);
      }
      setTimeout(() => {
        setFilteredEvent([...buf]);
      }, 50);
    }
  }, [event, filter]);

  return (
    <BookmarkCSS>
      <div className="header">
        <p
          className="exit"
          onClick={() => {
            navigate(-1);
          }}
        >
          <TfiAngleLeft />
        </p>
        <p className="bookmark">찜 내역</p>
      </div>
      <div className="filterMenu">
        <span
          onClick={() => {
            let buf = { ...filter };
            buf.fee["무료"] = !buf.fee["무료"];
            setFilter({ ...buf });
          }}
          className="filter"
          style={{
            background: filter.fee["무료"] ? "#981c26" : "#f2f3f5",
            color: filter.fee["무료"] ? "#ffffff" : "#080708",
          }}
        >
          무료
        </span>
        <span
          onClick={() => {
            let buf = { ...filter };
            buf.run["곧 오픈"] = !buf.run["곧 오픈"];
            setFilter({ ...buf });
          }}
          className="filter"
          style={{
            background: filter.run["곧 오픈"] ? "#981C26" : "#f2f3f5",
            color: filter.run["곧 오픈"] ? "#fff" : "#080708",
          }}
        >
          곧 오픈
        </span>
        <span
          onClick={() => {
            let buf = { ...filter };
            buf.run["현재 운영중"] = !buf.run["현재 운영중"];
            setFilter({ ...buf });
          }}
          className="filter"
          style={{
            background: filter.run["현재 운영중"] ? "#981C26" : "#f2f3f5",
            color: filter.run["현재 운영중"] ? "#fff" : "#080708",
          }}
        >
          현재 운영중
        </span>
        <span
          onClick={() => {
            let buf = { ...filter };
            buf.run["곧 종료"] = !buf.run["곧 종료"];
            setFilter({ ...buf });
          }}
          className="filter"
          style={{
            background: filter.run["곧 종료"] ? "#981C26" : "#f2f3f5",
            color: filter.run["곧 종료"] ? "#fff" : "#080708",
          }}
        >
          곧 종료
        </span>
        <Link to={"/search"} style={{ textDecoration: "none" }} key={"search"}>
          <img alt="filter" src={searchIcon} className="icon" />
        </Link>
        <img
          alt="filter"
          className="icon"
          src={filterIcon}
          onClick={() => {
            setDisplay(true);
          }}
        />
      </div>
      <div
        className="eventList"
        ref={listRef}
        onScroll={(e) => {
          if (e.target.scrollTop + window.innerHeight > e.target.scrollHeight) {
            setScroll(scroll + 8);
          }
        }}
      >
        {filteredEvent.map((e, idx) => {
          if (idx < scroll)
            return (
              <EventListComponent
                key={idx}
                id={e.id}
                data={e}
                display={true}
                list={listRef}
              />
            );
        })}
        <div style={{ height: "60px", width: "100%" }}></div>
      </div>
      <Filter
        display={display}
        setDisplay={setDisplay}
        filter={filter}
        setFilter={setFilter}
      />
      <Footer mode={2} />
    </BookmarkCSS>
  );
}
export default Bookmark;
