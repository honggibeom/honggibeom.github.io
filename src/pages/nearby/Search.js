import React, { useState, useRef, useEffect, useTransition } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { EventListComponent } from "./Component/MainEventComponent";

import { TfiAngleLeft } from "react-icons/tfi";
import { AiOutlineClose } from "react-icons/ai";
import Footer from "./Component/Footer";
import searchIcon from "./Img/Header/search.svg";
import useDebounce from "./Hook/Debounce";

const SearchLogCss = styled.div`
  width: 100%;
  display: flex;
  border-radius: 50px;
  align-items: center;
  margin: 0 30px;
  p {
    letter-spacing: -0.02em;
    font-weight: 400;
    font-size: 14px;
    color: #080708;
    width: 95%;
  }

  .fa-x {
    font-size: 16px;
    cursor: pointer;
  }
`;
function SearchLog(props) {
  function deleteLog() {
    for (let i = props.id; true; i++) {
      if (localStorage.getItem("searchlog" + (i + 1)) === null) {
        localStorage.removeItem("searchlog" + i);
        break;
      }
      localStorage.setItem(
        "searchlog" + i,
        localStorage.getItem("searchlog" + (i + 1))
      );
    }
  }

  return (
    <SearchLogCss vh={props.vh}>
      <p
        onClick={() => {
          props.bar.current.value = localStorage.getItem(
            "searchlog" + props.id
          );
          props.search(props.bar.current.value);
          props.setResult(1);
        }}
      >
        {localStorage.getItem("searchlog" + props.id)}
      </p>
      <AiOutlineClose
        onClick={() => {
          deleteLog();
          props.logset();
        }}
        className="fa-solid fa-x"
      />
    </SearchLogCss>
  );
}

const SearchCss = styled.div`
  overflow: hidden;
  background: white;
  width: 100vw;
  max-width: 450px;
  top: 0;

  .link {
    text-decoration: none;
  }

  .searchBar {
    display: flex;
    width: 100%;
    margin: 10px 0;
    align-items: center;

    .fa-angle-left {
      width: 6%;
      margin: 0 3%;
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    label {
      margin-right: 20px;
      width: 80%;

      padding: 10px 20px;
      display: flex;
      align-items: center;
      background: #f1f2f4;
      border-radius: 100px;

      input {
        background: none;
        border: 0;
        width: 90%;
        margin-left: 2%;
        height: 22px;
      }
      input:focus {
        outline: none;
      }
    }
  }

  .searchScreen {
    transition: 0.5s;
    .lately {
      ${(props) => (props.result === 0 ? "" : "display:none;")};
      width: 100%;
      .group {
        width: 100%;
        margin-top: 30px;
        display: flex;
        align-items: center;

        .log {
          color: #080708;
          width: 45%;
          margin-left: 5%;
          text-align: left;
          font-size: 14px;
          font-weight: 600;
        }
        .delete {
          display: flex;
          justify-content: center;
          width: 45%;
          text-align: right;
          font-size: 12px;
          font-weight: 400;
        }
      }

      .logContainer {
        overflow-y: auto;
        height: 79vh;
        min-height: ${(props) => props.vh * 79}px;
        .logList {
          display: flex;
          flex-wrap: wrap;
        }
      }
    }

    .resultContainer {
      ${(props) => (props.result === 1 ? "" : "display:none;")};
      max-width: 450px;
      overflow: hidden;
      .resultMode {
        display: flex;
        p {
          cursor: pointer;
          width: 50%;
          margin: 0;
          padding-bottom: 15px;
          padding-top: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          font-weight: 600;
          font-size: 14px;
          transition: 0.3s;
        }
        .event {
          color: ${(props) => (props.mode === 0 ? "#080708" : "#c8c8c8")};
          border-bottom: 2px solid
            ${(props) => (props.mode === 0 ? "#080708" : "#c8c8c8")};
        }
        .hashtag {
          color: ${(props) => (props.mode === 1 ? "#080708" : "#c8c8c8")};
          border-bottom: 2px solid
            ${(props) => (props.mode === 1 ? "#080708" : "#c8c8c8")};
        }
      }
      .result {
        padding: 0 7px;
        height: 83vh;
        min-height: ${(props) => props.vh * 83}px;
        display: flex;
        transition: 0.3s;
        flex-wrap: wrap;
        justify-content: space-between;
        overflow-y: scroll;
        .nomeet {
          width: 100%;
          height: 75vh;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: ${(props) => props.vh * 75}px;
          font-size: 18px;
          font-weight: 400;
          color: #00000088;
        }
      }
    }
  }
`;

function Search() {
  const navigate = useNavigate();
  const [result, setResult] = useState(0);
  const [event, setEvent] = useState([]);
  const [hashtag, setHashtag] = useState([]);
  const [size, setSize] = useState(
    window.innerHeight < 600 ? window.screen.availHeight : window.innerHeight
  );
  const [log, setLog] = useState([]);
  const searchBar = useRef(null);
  const [onSearch, setOnSearch] = useState(false);
  const [mode, setMode] = useState(0);
  const searchResult = () => {
    if (searchBar.current.value.replace(/\s/g, "").length === 0) {
      setResult(0);
      searchBar.current.value = "";
    } else {
      for (let i = 0; true; i++) {
        if (localStorage.getItem("searchlog" + i) === searchBar.current.value) {
          deleteLog(i);
        }

        if (localStorage.getItem("searchlog" + i) === null) {
          localStorage.setItem("searchlog" + i, searchBar.current.value);
          break;
        }
      }
      logset();
    }
  };
  const searchEvent = useDebounce((e) => {
    if (searchBar.current.value.replace(/\s/g, "").length === 0) {
      setEvent([]);
      setHashtag([]);
      return;
    }
    if (e.target.value !== "") {
    } else setEvent([]);
  }, 500);

  function logset() {
    let slog = [];
    for (let i = 0; true; i++) {
      if (localStorage.getItem("searchlog" + i) === null) {
        break;
      }

      slog.push(i);
    }

    setLog(slog.reverse());
  }

  function deleteLogAll() {
    for (let i = 0; true; i++) {
      if (localStorage.getItem("searchlog" + i) === null) {
        break;
      }
      localStorage.removeItem("searchlog" + i);
    }
    setLog([]);
  }

  function deleteLog(id) {
    for (let i = id; true; i++) {
      if (localStorage.getItem("searchlog" + (i + 1)) === null) {
        localStorage.removeItem("searchlog" + i);
        break;
      }

      localStorage.setItem(
        "searchlog" + i,
        localStorage.getItem("searchlog" + (i + 1))
      );
    }
  }

  useEffect(() => {
    window.addEventListener("resize", () => {
      setSize(
        window.innerHeight < 600
          ? window.screen.availHeight
          : window.innerHeight
      );
    });
    logset();
  }, []);

  return (
    <SearchCss result={result} vh={size / 100} mode={mode}>
      <div className="searchBar">
        <div
          className="fa-solid fa-angle-left"
          onClick={() => {
            if (result === 0) navigate(-1);
            else {
              setResult(0);
              searchBar.current.value = "";
            }
          }}
        >
          <TfiAngleLeft />
        </div>
        <label>
          <input
            type="text"
            placeholder="이벤트, 장소를 검색하세요"
            ref={searchBar}
            onFocus={() => {
              setResult(1);
              setOnSearch(true);
            }}
            onBlur={() => {
              searchResult();
              setOnSearch(false);
            }}
            onChange={(e) => {
              searchEvent(e);
            }}
          />
          {!onSearch && <img src={searchIcon} alt="search" />}
          {onSearch && (
            <AiOutlineClose
              onMouseDown={() => {
                searchBar.current.value = "";
              }}
            />
          )}
        </label>
      </div>
      <div className="searchScreen">
        <div className="lately">
          <div className="group">
            <p className="log">최근 검색어</p>
            <p
              className="delete"
              onClick={() => {
                deleteLogAll();
              }}
            >
              모두삭제
            </p>
          </div>

          <div className="logContainer">
            <div className="logList">
              {log.map((e, idx) => {
                return (
                  <SearchLog
                    key={idx}
                    id={e}
                    logset={logset}
                    bar={searchBar}
                    setResult={setResult}
                    vh={size / 100}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <div className="resultContainer">
          <div className="resultMode">
            <p
              className="event"
              onClick={() => {
                setMode(0);
              }}
            >
              이벤트
            </p>
            <p
              className="hashtag"
              onClick={() => {
                setMode(1);
              }}
            >
              해시태그
            </p>
          </div>

          {mode === 0 && (
            <div className="result">
              {event.map((e, idx) => {
                return <EventListComponent id={e.id} key={idx} />;
              })}
              {event.length === 0 && (
                <p className="nomeet">검색결과가 없습니다</p>
              )}
            </div>
          )}
          {mode === 1 && (
            <div className="result">
              {hashtag.map((e, idx) => {
                return <EventListComponent id={e.id} key={idx} />;
              })}
              {hashtag.length === 0 && (
                <p className="nomeet">검색결과가 없습니다</p>
              )}
            </div>
          )}
        </div>
        <div style={{ width: "100%", height: "150px" }}></div>
      </div>

      <Footer mode={2} />
    </SearchCss>
  );
}

export default Search;
