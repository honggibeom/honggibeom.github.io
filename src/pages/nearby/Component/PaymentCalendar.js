import React, { useState, useEffect } from "react";
import { styled } from "styled-components";
import { TfiAngleLeft, TfiAngleRight } from "react-icons/tfi";
const PaymentCalendarCss = styled.div`
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

function PaymentCalendar({ selectDate, setSelectDate, minDate, maxDate }) {
  const day = ["월", "화", "수", "목", "금", "토", "일"];
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [date, setDate] = useState([]);
  const [limit, setLimit] = useState([1, 31]);
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
    let tmp = [0, 0];

    let min = new Date(year, month - 1, 1, 0, 0, 0, 0);
    let max = new Date(year, month - 1, datenum, 0, 0, 0, 0);
    for (let i = 0; i < startDay; i++) {
      daybuf.push(" ");
    }

    for (let i = 1; i <= datenum; i++) {
      daybuf.push(i);
    }

    for (let i = 6; i > endDay; i--) {
      daybuf.push(" ");
    }

    if (minDate > date) {
      tmp[0] = datenum + 1;
    } else if (minDate - date === 0) {
      tmp[0] = minDate.getDate();
    }
    if (maxDate !== null && maxDate < date) {
    }

    return daybuf;
  };

  const getDatePosition = (e) => {
    let datebuf = new Date(year, month - 1, e);
    let type = -1;
    if (selectDate !== null) {
      let gap = selectDate - datebuf;
      if (gap === 0) type = 1;
    }
    return type;
  };

  const clickDate = (e) => {
    setSelectDate(new Date(year, month - 1, e));
  };
  useEffect(() => {
    setDate(makeDate());
  }, [month]);

  return (
    <PaymentCalendarCss>
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
              let type = getDatePosition(e);
              return (
                <p
                  className="day"
                  key={idx}
                  onClick={() => {
                    clickDate(e);
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
    </PaymentCalendarCss>
  );
}

export default PaymentCalendar;
