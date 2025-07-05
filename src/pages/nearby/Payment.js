import React, { useEffect, useState, useRef } from "react";
import { styled } from "styled-components";
import { TfiAngleLeft, TfiClose } from "react-icons/tfi";
import { useLocation, useNavigate } from "react-router-dom";

import locationBlackIcon from "./Img/MainEventComponent/locationBlack.svg";
import dateBlackIcon from "./Img/MainEventComponent/dateBlack.svg";
import minusBtnRed from "./Img/Payment/minusBtnRed.svg";
import minusBtn from "./Img/Payment/minusBtn.svg";
import plusBtnRed from "./Img/Payment/plusBtnRed.svg";
import plusBtn from "./Img/Payment/plusBtn.svg";
import PaymentCalendar from "./Component/PaymentCalendar";
import PopUp from "./Component/PopUp";

import { loadPaymentWidget, ANONYMOUS } from "@tosspayments/payment-widget-sdk";
import { nanoid } from "nanoid";
const PaymentCSS = styled.div`
  position: relative;
  padding: 0;
  margin: 0;
  overflow: hidden;
  height: 80vh;
  @media only screen and (min-width: 1024px) {
    .mainContainer {
      height: 100vh;
    }
  }
  width: 100vw;
  max-width: 450px;

  .layout {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }
  .top {
    flex: 1;
    display: flex;
    flex-direction: column;
    position: relative;
  }
  .top::before {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: black;
    opacity: 0.4;
    z-index: 1;
  }
  .top::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .top {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-image: url("${(props) => props.img}");
    background-position: center;
    background-size: cover;
  }
  .bottom {
    flex: 3;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }
  .header {
    display: flex;
    align-items: center;
    margin-bottom: auto;
    z-index: 1;
    height: 6vh;
    color: #ffffff;
    padding: 25px;
  }
  .headerBack {
    margin-right: auto;
    font-size: 24px;
  }
  .headerTitle {
    font-size: 20px;
    font-style: normal;
    font-weight: 600;
  }
  .headerCancel {
    margin-left: auto;
    font-size: 24px;
  }
  .info {
    z-index: 1;
    margin-top: auto;
    padding: 25px;
    .subInfo {
      display: flex;
      align-items: center;
      padding: 5px 0;

      img {
        width: 22px;
        height: 22px;
        margin-right: 8px;
        filter: invert(100%);
      }
      .text {
        color: #ffffff;
        font-size: 14px;
        font-weight: 400;
        margin: 0;
      }
    }
  }
  .selectTitle {
    font-size: 17px;
    font-style: normal;
    font-weight: 500;
    padding-bottom: 10px;
    margin: 16px 20px 0 20px;
    border-bottom: 1.5px solid #e6e6e6;
  }
  .selectDate {
    font-size: 17px;
    font-style: normal;
    font-weight: 500;
    padding-bottom: 10px;
    margin: 16px 20px 0 20px;
    color: #00000088;
  }
  .noBorder {
    border: 0;
  }
  .calender {
    padding: 0 10px;
  }
  .buttonLayout {
    position: absolute;
    left: 0;
    right: 0;
    width: 100%;
    bottom: -70px;
    max-width: 417px;
    height: 180px;
    padding: 16px;
    background: #fff;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.1);
    transition: bottom 0.3s ease;
  }

  .buttonLayout.active {
    bottom: 0; /* 스크롤 끝 도달 시 완전히 올라옴 */
  }

  .selectBtn {
    position: absolute;
    display: flex;
    justify-content: center;

    left: 50%;
    width: ${window.innerWidth > 450 ? 410 : window.innerWidth - 40}px;

    transform: translateX(-50%);
    margin-top: auto;
    box-sizing: border-box; /* 패딩/테두리 포함 계산 */
    padding: 14px 0;
    color: ${(props) => (props.isTouched ? "#ffffff" : "#981c26")};
    background: ${(props) => (props.isTouched ? "#981c26" : "#ffffff")};
    border: 1px solid #981c26;
    font-size: 14px;
    font-weight: 600;
    border-radius: 100px;
    transition: color 0.3s, background 0.3s;
  }
  .selectBtn:hover {
    color: #ffffff;
    background: #981c26;
  }
  .borderLine {
    margin: 0 20px;
    border-bottom: 1.5px solid #e6e6e6;
  }
  .timeLine {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: safe center;
    padding: 13px 20px;
  }
  .selectTime {
    flex-basis: calc(10% - 6px);
    padding: 4px 13px 5px 13px;
    display: flex;
    border-radius: 100px;
    font-size: 12px;
    font-weight: 400;
    margin-bottom: 2px;
    align-items: center;
    justify-content: center;
  }
  .selectAmount {
    padding: 17px 0;
    margin: 0 20px;
    border-bottom: 1.5px solid #e6e6e6;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .selectAmountTitle {
      .age {
        padding-bottom: 10px;
        font-size: 15px;
      }
      .price {
        font-weight: 600;
        font-size: 20px;
      }
    }
    .selectAmountBtn {
      display: flex;
      align-items: center;
      gap: 10px;

      .minusBtn,
      .plusBtn {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .count {
        width: 50px;
        text-align: center;
        font-size: 20px;
        font-weight: 600;
      }
    }
  }
  .total {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 17px 0 24px;
    margin: 0 20px;
    color: #981c26;
    .totalTitle {
      font-weight: 500;
      font-size: 17px;
    }
    .totalPrice {
      font-weight: 600;
      font-size: 20px;
    }
  }
  .reserverInfo {
    margin: 17px 20px 50px 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    input {
      padding: 15px 20px;
      border-radius: 10px;
      border: #525252 solid 1px;
      font-size: 14px;
      margin: 5px 0;
      &::placeholder {
        color: #c8c8c8;
      }
    }
  }

  .payInfo {
    margin: 17px 20px 50px 20px;
    padding: 20px;
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    /* 본문 및 리스트 양쪽정렬처럼 보이기 */
    text-align: justify;
  }

  .payInfo .subTitle {
    position: relative;
    font-size: 16px;
    font-weight: 600;
    color: #333333;
    margin: 16px 0 8px;
    padding-left: 12px;
  }
  .payInfo .subTitle::before {
    content: "";
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 16px;
    background-color: #981c26;
    border-radius: 2px;
  }

  .payInfo ul.list {
    list-style: none; /* 기본 불릿 제거 */
    margin: 0 0 16px;
    padding: 0 0 0 16px; /* 전체 들여쓰기 */
  }
  .payInfo ul.list > li {
    position: relative;
    margin-bottom: 12px; /* 항목 간 간격 */
    font-size: 12px;
    line-height: 1.5;
    color: #555555;
    text-align: justify; /* 각 항목도 양쪽정렬 */
  }

  /*1단 리스트*/
  .payInfo ul.list > li ul.nested-list {
    list-style: none;
    margin: 8px 0 16px 20px;
    padding: 0;
  }

  /*2단 리스트*/
  .payInfo ul.list > li ul.nested-list > li {
    list-style: disc inside;
    margin: 8px 0;
    font-size: 12px;
    line-height: 1.4;
    color: #333333;
  }

  .indent {
    text-indent: -11px;
    padding-left: 10px;
    margin: 0;
  }
  .paymentMethods {
    margin: 17px 20px 100px 20px;
  }
  [type="radio"] {
    accent-color: #981c26;
    width: 16px;
    height: 16px;
    margin-right: 17px;
  }
  .tosspay {
    padding-bottom: 1.5px;
  }
  .kakaoBtn {
    display: flex;
    align-items: center;
    margin-top: 3px;
  }
  .kakaopay {
    padding-top: 7px;
  }
`;

function Payment() {
  const widgetClientKey = "test_ck_jkYG57Eba3GgapbMmxw3pWDOxmA1";
  const customerKey = "Df723MgYCyIMJrWIDfXMz";
  const location = useLocation();
  const navigate = useNavigate();
  const scroll = useRef();
  const page1 = useRef();
  const [data, setData] = useState({});
  const [load, setLoad] = useState(false);
  const [img, setImg] = useState("#");
  const [fee, setFee] = useState([]);
  const [time, setTime] = useState();
  const [ticket, setTicket] = useState({});
  const [count, setCount] = useState({});
  const [startDate, setStartDate] = useState("준비중");
  const [endDate, setEndDate] = useState("마감시 종료");
  const [selectDate, setSelectDate] = useState();
  const [isTouched, setIsTouched] = useState(false);
  const [paymentWidget, setPaymentWidget] = useState(null);
  const paymentMethodsWidgetRef = useRef(null);
  const [price, setPrice] = useState(0);
  const [buttonActive, setButtonActive] = useState(false);
  const [info, setInfo] = useState({
    customerName: "김토스",
    customerEmail: "customer123@gmail.com",
    customerMobilePhone: "01012341234",
  });
  useEffect(() => {
    if (paymentWidget == null) {
      return;
    }

    const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
      "#payment-widget",
      { value: price },
      { variantKey: "DEFAULT" }
    );

    paymentWidget.renderAgreement("#agreement", { variantKey: "AGREEMENT" });

    paymentMethodsWidgetRef.current = paymentMethodsWidget;
  }, [paymentWidget, price]);

  useEffect(() => {
    const paymentMethodsWidget = paymentMethodsWidgetRef.current;
    if (paymentMethodsWidget == null) {
      return;
    }
    paymentMethodsWidget.updateAmount(price);
  }, [price]);

  useEffect(() => {
    const el = scroll.current;
    if (!el) return;
    const onScroll = () => {
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight;
      setButtonActive(atBottom);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // TODO: 임시 배열, 각 전시회 별 예매 가능한 시간 API로 대체
  const timeArray = [];
  for (let hour = 10; hour <= 17; hour++) {
    timeArray.push(`${hour}:00`);
    if (hour !== 17) timeArray.push(`${hour}:30`);
  }

  const handlePaymentRequest = async () => {
    // 결제를 요청하기 전에 orderId, amount를 서버에 저장하세요.
    // 결제 과정에서 악의적으로 결제 금액이 바뀌는 것을 확인하는 용도입니다.
    try {
      await paymentWidget?.requestPayment({
        orderId: nanoid(),
        orderName: data.title + " 티켓",
        successUrl: `${window.location.origin}/success`,
        failUrl: `${window.location.origin}/fail`,
        ...info,
      });
    } catch (error) {
      console.error("Error requesting payment:", error);
    }
  };
  return (
    <PaymentCSS img={img} isTouched={isTouched}>
      <div className="layout">
        <div className="top">
          <div className="header">
            <div
              className="headerBack"
              onClick={() => {
                navigate("/event/detail");
              }}
            >
              <TfiAngleLeft />
            </div>
            <p className="headerTitle">{data.title}</p>
            <div
              className="headerCancel"
              onClick={() => {
                navigate("/event/detail");
              }}
            >
              <TfiClose />
            </div>
          </div>
          <div className="info">
            <div className="subInfo">
              <img src={dateBlackIcon} alt="date" />
              <p className="text">{startDate + " - " + endDate}</p>
            </div>
            <div className="subInfo">
              <img src={locationBlackIcon} alt="location" />
              {load && (
                <span className="text">
                  {data.event_place.location +
                    " " +
                    data.event_place.place_name}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="bottom" ref={scroll}>
          <div className="page1" ref={page1}>
            <p className="selectTitle">날짜를 선택해주세요</p>
            <div className="calender">
              <PaymentCalendar
                selectDate={selectDate}
                setSelectDate={setSelectDate}
                minDate={new Date(data.start_date)}
                maxDate={
                  data.end_data === null ? null : new Date(data.end_date)
                }
              />
            </div>
            {selectDate !== undefined && (
              <div>
                <p className="borderLine"></p>
                <div className="timeLine">
                  {timeArray.map((time, index) => (
                    <span
                      key={index}
                      onClick={() => {
                        setTime(time);
                        scroll.current.scrollTop =
                          page1.current.scrollTop + page1.current.offsetHeight;
                      }}
                      className="selectTime"
                      style={{
                        background: true ? "#981c26" : "#f2f3f5",
                        color: true ? "#ffffff" : "#080708",
                      }}
                    >
                      {time}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="page2">
            <p className="selectTitle">인원/수량을 선택해주세요</p>
            {selectDate !== undefined && (
              <p className="selectDate">
                {selectDate
                  .toISOString()
                  .split("T")[0]
                  .replace("-", ".")
                  .replace("-", ".")}
                &nbsp;
                {time !== undefined && time}
              </p>
            )}
            {fee.map((e, idx) => (
              <div className="selectAmount" key={idx}>
                <div className="selectAmountTitle">
                  <div className="age">{e.target}</div>
                  <div className="price">{e.price}원</div>
                </div>
                <div className="selectAmountBtn">
                  <div
                    className="minusBtn"
                    onClick={() => {
                      if (count[e.target] > 0) {
                        let buf = { ...count };
                        buf[e.target] -= 1;
                        setCount(buf);
                        setPrice(price - e.price);
                      }
                    }}
                  >
                    <img
                      src={count[e.target] > 0 ? minusBtnRed : minusBtn}
                      alt="minusBtn"
                    />
                  </div>
                  <div className="count">{count[e.target]}</div>
                  <div
                    className="plusBtn"
                    onClick={() => {
                      if (ticket[e.target] > count[e.target]) {
                        let buf = { ...count };
                        buf[e.target] += 1;
                        setCount(buf);
                        setPrice(price + e.price);
                      }
                    }}
                  >
                    <img
                      src={
                        ticket[e.target] > count[e.target]
                          ? plusBtnRed
                          : plusBtn
                      }
                      alt="plusBtn"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="Page3">
            <p className="selectTitle noBorder">예매자 정보 입력</p>
            <div className="reserverInfo">
              <input
                type="text"
                placeholder="이름을 입력해주세요"
                onChange={(e) => {
                  let buf = { ...info };
                  buf.customerName = e.target.value;
                  setInfo(buf);
                }}
              />
              {/* <input
                type="text"
                placeholder="생년월일을 입력해주세요 ex) 971208"
                onChange={() => {
                  let buf = { ...info };
                  buf[o];
                  setInfo();
                }}
              /> */}
              <input
                type="tel"
                placeholder="연락처를 입력해주세요 ex) 01012341234"
                pattern="[0-9]{3}[0-9]{4}[0-9]{4}"
                onChange={(e) => {
                  let buf = { ...info };
                  buf.customerMobilePhone = e.target.value;
                  setInfo(buf);
                }}
              />
              <input
                type="text"
                placeholder="이메일 주소를 입력해주세요 ex) nearby@naver.com"
                onChange={(e) => {
                  let buf = { ...info };
                  buf.customerEmail = e.target.value;
                  setInfo(buf);
                }}
              />
            </div>
            <p className="selectTitle">판매 정보</p>
            <div className="payInfo">
              {/* 티켓수령 안내 */}
              <p className="subTitle">티켓수령 안내</p>
              <ul className="list">
                <li>
                  공연 당일 현장 교부처에서 예약번호 및 본인 확인 후 티켓을
                  수령하실 수 있습니다.
                </li>
                <li>
                  상단 예매확인/취소 메뉴에서 예매내역을 프린트하여 가시면
                  편리합니다.
                </li>
              </ul>

              {/* 환불 안내 */}
              <p className="subTitle">환불 안내</p>
              <ul className="list">
                <li>
                  당사의 취소 처리가 완료되고 4-5일 후 카드사의 취소가
                  확인됩니다.
                </li>
                <li>
                  예매 취소 시점과 해당 카드사의 환불 처리기준에 따라 취소금액의
                  환급방법과 환급일은 다소 차이가 있을 수 있으며, 예매 취소 시
                  기존에 결제하였던 내역을 취소하며 최초 결제하셨던 동일카드로
                  취소 시점에 따라 취소수수료를 재승인합니다.
                </li>
              </ul>

              {/* 취소수수료 안내 */}
              <p className="subTitle">취소수수료 안내</p>
              <ul className="list">
                <li>
                  예매 후 7일까지 취소 시에는 취소수수료가 없습니다. 단,
                  취소수수료가 적용되는 기간일 시 관람일 기준 동일한
                  취소수수료가 적용됩니다.
                </li>
                <li>
                  관람일 기준, 아래의 취소수수료가 적용됩니다.
                  <ul className="nested-list">
                    <li>관람일 9일전 - 7일전까지 : 티켓금액의 10%</li>
                    <li>관람일 6일전 - 3일전까지 : 티켓금액의 20%</li>
                    <li>관람일 2일전 - 1일전까지 : 티켓금액의 30%</li>
                  </ul>
                </li>
                <li>
                  상품의 특성에 따라서, 취소수수료 정책이 달라질 수 있습니다.
                </li>
              </ul>
            </div>

            <p className="selectTitle">결제수단</p>
            <div id="payment-widget" />
            <div id="agreement" />
          </div>
        </div>

        <div className={`buttonLayout${buttonActive ? " active" : ""}`}>
          <div className="total">
            <div className="totalTitle">결제 예정 금액</div>
            <div className="totalPrice">{price}원</div>
          </div>
          <p
            className="selectBtn"
            onTouchStart={() => {
              setIsTouched(true);
            }}
            onTouchEnd={() => {
              setIsTouched(false);
            }}
            onClick={() => {
              handlePaymentRequest();
            }}
          >
            결제하기
          </p>
        </div>
      </div>
    </PaymentCSS>
  );
}

export default Payment;
