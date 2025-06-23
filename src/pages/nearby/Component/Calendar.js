import React, { useState, useEffect } from "react";
import { styled } from "styled-components";
import { TfiAngleLeft, TfiAngleRight } from "react-icons/tfi";
const CalendarCss = styled.div`
  width: 96%;
  margin: 20px 2%;
  .caleandarHeader {
    display: flex;
    justify-content: center;
    align-items: center;
    .text {
      font-size: 14px;
      font-weight: 600;
    }
  }
  .daylist {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0 0 2px 0;
  }
  .dateList {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
  }
  .day {
    font-size: 12px;
    font-weight: 400;
    display: flex;
    align-items: center;
    justify-content: center;
    width: ${100 / 7}%;
    margin: 3px 0;
    height: 30px;
  }
  .circle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #981c26;
    border-radius: 100%;
    color: #fff;
    width: 30px;
    height: 30px;
  }
`;

function Calendar(props) {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [date, setDate] = useState([]);
  const day = ["월", "화", "수", "목", "금", "토", "일"];

  const getDateNum = () => {
    let tmp =
      (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28;
    let dateNum = [31, tmp, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return dateNum[month - 1];
  };
  const getDay = () => {
    let dateObj = new Date(year, month - 1, 1);
    return dateObj.getDay() === 0 ? 6 : dateObj.getDay() - 1;
  };

  const makeDate = () => {
    let datenum = getDateNum();
    let startDay = getDay();
    let endDay = (getDay() + datenum) % 7;

    let daybuf = [];

    for (let i = 0; i < startDay; i++) {
      daybuf.push(" ");
    }
    for (let i = 1; i <= datenum; i++) {
      daybuf.push(i);
    }

    for (let i = 6; i > endDay; i--) {
      daybuf.push(" ");
    }
    return daybuf;
  };

  const getDatePosition = (e) => {
    let datebuf = new Date(year, month - 1, e);
    let type = -1;
    if (props.startDate !== null && props.endDate !== null) {
      let startGap = props.startDate - datebuf;
      let endGap = props.endDate - datebuf;
      if (startGap === 0) type = 1;
      else if (startGap < 0 && endGap > 0) type = 0;
      else if (endGap === 0) type = 2;
    } else if (props.startDate !== null) {
      let startGap = props.startDate - datebuf;
      if (startGap === 0) type = 3;
    }
    return type;
  };

  const setDuration = (e) => {
    if (props.endDate !== null) {
      props.setStartDate(new Date(year, month - 1, e));
      props.setEndDate(null);
    } else if (props.startDate !== null) {
      let tmp = new Date(year, month - 1, e);
      if (props.startDate - tmp > 0) {
        props.setEndDate(props.startDate);
        props.setStartDate(tmp);
      } else {
        props.setEndDate(tmp);
      }
    } else {
      props.setStartDate(new Date(year, month - 1, e));
    }
  };

  useEffect(() => {
    setDate(makeDate());
  }, [month]);
  
  return (
    <CalendarCss>
      <div className="caleandarHeader">
        <TfiAngleLeft
          style={{ width: "14px", marginRight: "20px" }}
          onClick={() => {
            if (month === 1) {
              setMonth(12);
              setYear(year - 1);
            } else setMonth(month - 1);
          }}
        />
        <p className="text">{year + "." + month.toString().padStart(2, "0")}</p>
        <TfiAngleRight
          style={{ width: "14px", marginLeft: "20px" }}
          onClick={() => {
            if (month === 12) {
              setMonth(1);
              setYear(year + 1);
            } else setMonth(month + 1);
          }}
        />
      </div>
      <div className="calendar">
        <div className="daylist">
          {day.map((e, idx) => {
            return (
              <p className="day" key={idx}>
                {e}
              </p>
            );
          })}
        </div>
        <div className="dateList">
          {date.map((e, idx) => {
            if (e === " ") {
              return (
                <p className="day" key={idx}>
                  {e}
                </p>
              );
            } else {
              let style = {};
              let type = getDatePosition(e);
              if (type === 0)
                style = {
                  background: "#F5E9EA",
                };
              else if (type === 1)
                style = {
                  background:
                    "linear-gradient(90deg,#ffffff , 50%,#F5E9EA 50%)",
                };
              else if (type === 2)
                style = {
                  background:
                    "linear-gradient(90deg, #F5E9EA , 50%,#ffffff 50%)",
                };

              return (
                <p
                  className="day"
                  key={idx}
                  style={{ ...style }}
                  onClick={() => {
                    setDuration(e);
                  }}
                >
                  {type > 0 && <span className="circle">{e}</span>}
                  {type <= 0 && e}
                </p>
              );
            }
          })}
        </div>
      </div>
    </CalendarCss>
  );
}

export default Calendar;
