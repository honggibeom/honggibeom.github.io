import React, { useState, useEffect, useRef, useTransition } from "react";
import styled from "styled-components";
import { Link, useLocation } from "react-router-dom";
import Footer from "./Component/Footer";
import axios from "axios";
import Filter from "./Component/Filter";
import { EventListComponent } from "./Component/MainEventComponent";
import filterIcon from "./Img/Header/filter.svg";
import searchIcon from "./Img/Header/search.svg";
import filtering from "./Function/FilterFunctions";
import useDebounce from "./Hook/Debounce";
import { origin } from "./Origin/Origin";
const EventListCss = styled.div`
  width: 100vw;
  height: 100vh;
  max-width: 450px;

  .header {
    display: flex;
    gap: 6px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    padding: 13px 20px;
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
    height: 90%;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
  }
`;
function EventList(props) {
  const listRef = useRef("");
  const location = useLocation();
  const [event, setEvent] = useState([]);
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

  const [display, setDisplay] = useState(false);
  const [theme, setTheme] = useState(props.theme);
  const [scroll, setScroll] = useState(30);
  function LoadTheme() {
    setTheme(true);
    const id = location.search.split("id=")[1];
    axios.get(origin + "theme/" + id).then((res) => {
      let buf = [];
      res.data.data.theme_event_list.forEach((e) => {
        buf.push(e.event);
      });
      setEvent(buf);
    });
  }
  function LoadEndEvent() {
    setTheme(true);
    axios.get(origin + "search/event/end").then((res) => {
      setEvent(res.data.data);
    });
  }
  function LoadEventByHashTag() {
    setTheme(true);
    axios
      .get(origin + "search/event/hashtag/" + location.search.split("=")[1])
      .then((res) => {
        setEvent(res.data.data);
      });
  }
  function LoadAllEvent() {
    axios.get(origin + "search/event/all").then((res) => {
      let buf = [];
      for (const e of res.data.data) {
        buf.push(e);
      }
      setEvent(buf);
    });
  }
  useEffect(() => {
    if (location.search.includes("theme")) {
      setTheme(true);
      LoadTheme();
    } else if (location.search.includes("end")) {
      setTheme(true);
      LoadEndEvent();
    } else if (location.search.includes("hashTag")) {
      LoadEventByHashTag();
    } else {
      LoadAllEvent();
    }
  }, [theme]);

  return (
    <EventListCss>
      <div className="header">
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
        <Link to={"/Search"} style={{ textDecoration: "none" }} key={"search"}>
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
            setScroll(scroll + 10);
          }
        }}
      >
        {event.map((e, idx) => {
          return (
            <EventListComponent
              key={idx}
              id={e.id}
              list={listRef}
              data={e}
              display={scroll > idx && filtering(filter, e)}
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
      <Footer mode={2} setTheme={setTheme} />
    </EventListCss>
  );
}

export default EventList;
