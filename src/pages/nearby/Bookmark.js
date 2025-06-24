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

const BookmarkCSS = styled.div`
  width: 100vw;
  height: 100vh;
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
  }
`;

function Bookmark() {
  const navigate = useNavigate();
  const listRef = useRef("");
  const [display, setDisplay] = useState(false);
  const [event, setEvent] = useState([]);
  const [scroll, setScroll] = useState(8);
  const [filteredEvent, setFilteredEvent] = useState([]);
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
            return <EventListComponent key={idx} id={e.id} list={listRef} />;
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
