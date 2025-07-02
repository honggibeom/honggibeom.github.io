import React, { useState, useEffect, useRef } from "react";
import { styled } from "styled-components";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AiOutlinePlus, AiOutlineClose } from "react-icons/ai";
import { TfiAngleLeft } from "react-icons/tfi";
import { GrPowerReset } from "react-icons/gr";
import Calendar from "./Calendar";
import "react-calendar/dist/Calendar.css";
const FilterCss = styled.div`
  width: 100vw;
  height: 100vh;
  max-width: 450px;
  overflow: auto;
  position: fixed;
  background: #ffffff;
  top: ${(props) => (props.display ? "80px" : "100vh")};
  z-index: 100;
  .filterHeader {
    display: flex;
    width: 90%;
    align-items: center;
    border-bottom: 1px solid rgba(8, 7, 8, 0.1);
    margin: 0 5%;
    padding: 10px 0;
    .close {
      width: 10%;
      display: flex;
      justify-content: center;
      font-size: 20px;
      cursor: pointer;
    }
    .title {
      display: flex;
      justify-content: center;
      width: 75%;
      font-size: 14px;
      font-weight: 600;
    }
    .reset {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 15%;
      font-size: 12px;
      font-weight: 400;
      cursor: pointer;
    }
  }
  .subTitle {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 20px;
  }
  .container {
    width: 90%;
    margin-left: 5%;
    .list {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 20px;
      .btn {
        display: flex;
        padding: 4px 13px 5px 13px;
        justify-content: center;
        align-items: center;
        border-radius: 100px;
        font-size: 12px;
        font-weight: 400;
        cursor: pointer;
      }
    }
  }

  .filter {
    display: flex;
    justify-content: center;
    width: ${window.innerWidth > 450 ? 410 : window.innerWidth - 40}px;
    padding: 14px 0;
    color: #ffffff;
    background: #981c26;
    margin: 50px 20px 0 20px;
    font-size: 14px;
    font-weight: 600;
    border-radius: 100px;
  }
`;

function Filter(props) {
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
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const enter = useRef(0);
  useEffect(() => {
    if (enter.current === 0) {
      enter.current++;
      return;
    }
    let buf = { ...filter };
    buf.startDate = startDate;
    buf.endDate = endDate;
    setFilter(filter);
    props.setFilter({ ...buf });
  }, [startDate, endDate]);

  useEffect(() => {
    if (props.filter !== undefined) {
      setFilter(props.filter);
    } else return;
  }, [props.filter]);

  return (
    <FilterCss display={props.display}>
      <div className="filterHeader">
        <div
          className="close"
          onClick={() => {
            props.setDisplay(false);
          }}
        >
          <TfiAngleLeft />
        </div>

        <p className="title">필터</p>
        <p
          className="reset"
          onClick={() => {
            setStartDate(null);
            setEndDate(null);
            setFilter({
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
            props.setFilter({
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
          }}
        >
          <GrPowerReset style={{ width: "16px", height: "16px" }} />
          재설정
        </p>
      </div>
      <div className="container">
        <p className="subTitle">기간</p>
        <Calendar
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />
        <p className="subTitle">카테고리</p>
        <div className="list">
          {Object.keys(filter.category).map((e, idx) => {
            return (
              <span
                key={idx}
                className="btn"
                style={{
                  background: filter.category[e] ? "#981C26" : "#F2F3F5",
                  color: filter.category[e] ? "#fff" : "#080708",
                }}
                onClick={() => {
                  let buf = { ...filter };
                  buf.category[e] = !buf.category[e];
                  setFilter({ ...buf });
                  props.setFilter({ ...buf });
                }}
              >
                {e}
              </span>
            );
          })}
        </div>
        <p className="subTitle">티켓 정보</p>
        <div className="list">
          {Object.keys(filter.fee).map((e, idx) => {
            return (
              <span
                key={idx}
                className="btn"
                style={{
                  background: filter.fee[e] ? "#981C26" : "#F2F3F5",
                  color: filter.fee[e] ? "#fff" : "#080708",
                }}
                onClick={() => {
                  let buf = { ...filter };
                  buf.fee[e] = !buf.fee[e];
                  setFilter({ ...buf });
                  props.setFilter({ ...buf });
                }}
              >
                {e}
              </span>
            );
          })}
        </div>
        <p className="subTitle">전시 정보</p>
        <div className="list">
          {Object.keys(filter.run).map((e, idx) => {
            return (
              <span
                key={idx}
                className="btn"
                style={{
                  background: filter.run[e] ? "#981C26" : "#F2F3F5",
                  color: filter.run[e] ? "#fff" : "#080708",
                }}
                onClick={() => {
                  let buf = { ...filter };
                  buf.run[e] = !buf.run[e];
                  setFilter({ ...buf });
                  props.setFilter({ ...buf });
                }}
              >
                {e}
              </span>
            );
          })}
        </div>
      </div>
      <p
        className="filter"
        onClick={() => {
          props.setDisplay(false);
        }}
      >
        적용하기
      </p>
    </FilterCss>
  );
}

export default Filter;
