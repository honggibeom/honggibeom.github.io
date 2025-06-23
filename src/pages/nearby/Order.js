import React, { useEffect, useState, useRef } from "react";
import { styled } from "styled-components";
import { TfiAngleLeft, TfiClose, TfiAngleDown } from "react-icons/tfi";
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const AddressCss = styled.div`
  display: flex;
  width: 100%;
  box-sizing: border-box;
  padding: 10px 20px;
  border-bottom: 1px solid #000000;
  justify-content: space-between;
  .current {
    border: 1px solid #cccccc;
    border-radius: 4px;
    color: #981c26;
    font-size: 12px;
    padding: 5px;
    background: #ffffff;
  }
`;
function Address({ current = 0 }) {
  return (
    <AddressCss>
      <div>
        <p className="text">홍길동</p>
        <p className="text1">휴대폰번호 010-1234-5678</p>
        <p className="text1">서울특별시 송파구 백제고분로 18길 12-13, 101</p>
        <p className="text1">롯데타워 2층</p>
        <p className="text1">문앞에 놓아주세요</p>
      </div>
      <div className="info">
        {current === 1 && <span className="current">선택됨</span>}
      </div>
    </AddressCss>
  );
}
const ItemCss = styled.div`
  padding: 10px 20px;
  background: #f6f8fa;
  border-radius: 8px;
  .item_name {
    font-size: 14px;
    font-weight: 600;
  }
  .item_info {
    display: flex;
    justify-content: space-between;
    margin-top: 30px;
  }
  .item_count {
    font-size: 12px;
  }

  .item_price {
    font-weight: 600;
    font-size: 18px;
  }
  .item_discount {
    font-size: 16px;
    font-size: 400;
    color: #cccccc;
    margin-right: 8px;
    text-decoration: line-through;
  }
`;

function Item({ name, count, price, discount }) {
  return (
    <ItemCss>
      <span className="item_name">{name}</span>
      <div className="item_info">
        <span className="item_count">{count.toLocaleString()}개</span>
        <div>
          <span className="item_discount">{discount.toLocaleString()}</span>
          <span className="item_price">{price.toLocaleString()}</span>
        </div>
      </div>
    </ItemCss>
  );
}

const OrderCss = styled.div`
  margin: 0;
  padding: 0;
  width: 100vw;
  max-width: 450px;
  height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
  .form {
    margin-top: 20px;
    .flex {
      display: flex;
      justify-content: space-between;
      input {
        width: 48%;
      }
    }
    input {
      width: 100%;
      padding: 10px 15px;
      margin: 5px 0;
      box-sizing: border-box;
      background: #f6f8fa;
      border: 0;
      border-radius: 4px;
    }
    input:focus {
      outline: none;
    }
  }

  .header {
    width: 90%;
    display: flex;
    padding: 0 5%;
    align-items: center;
    justify-content: space-between;
    font-weight: 600;
  }
  .addressSelect {
    width: 100%;
    display: flex;
    background: #ffffff;
    align-items: center;
    border-radius: 8px;
    box-sizing: border-box;
  }
  .text {
    font-weight: 600;
    margin-bottom: 20px;
  }
  .text1 {
    font-size: 14px;
    margin: 0;
    margin: 8px 0;
  }
  .address {
    border: 2px solid #981c26;
    border-radius: 8px;
  }
  .addreessSelected {
    width: 100%;
    box-sizing: border-box;
    padding: 10px 20px;
  }

  .selectBtn {
    margin-left: -40px;
  }
  .addressList {
    height: ${(props) => (props.address === 0 ? 0 : 360)}px;
    overflow: ${(props) => (props.address === 0 ? "hidden" : "auto")};
    box-sizing: border-box;

    transition: ${(props) => (props.address === 0 ? 0 : 0.3)}s;
    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  }

  .box {
    width: 90%;
    margin: 0 5%;
    margin-top: 40px;
  }
  .subTitle1,
  .subTitle2 {
    width: 100%;
    padding: 10px 0;
    font-weight: 600;
    border-bottom: 1px solid #c8c8c8;
  }
  .subTitle2 {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .item {
    display: flex;
    margin-bottom: 20px;
    align-items: center;
    font-weight: 600;
    margin-right: 10px;
    word-break: break-word;
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-line-clamp: 2;
  }
  .item_img {
    width: 80px;
    height: 80px;
    margin-right: 30px;
  }
  .coupon {
    width: 100%;
    background: #f6f8fa;
    border: 0;
    font-size: 14px;
    margin-top: 20px;
    padding: 10px 15px;
    box-sizing: border-box;
    border-radius: 8px;
  }

  .newPlace {
    width: 100%;
    text-align: center;
    border-radius: 8px;
    border: 1px solid #c8c8c8;
    padding: 18px 0;
    box-sizing: border-box;
    font-weight: 600;
    font-size: 14px;
    margin-top: 20px;
  }
  .apply {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 35%;
  }
  .type {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .phone {
    width: 100%;
    height: 50px;
    padding: 5px 20px;
    box-sizing: border-box;
    font-size: 16px;
    border: 0;
    background: #f6f8fa;
    border-radius: 8px;
    margin-bottom: 60px;
  }
  .phone::placeholder {
    color: #c8c8c8;
    font-weight: 400;
  }
  .phone:focus {
    outline: none;
  }
  .text2 {
    margin-left: 5px;
    font-weight: 400;
    color: #080708;
  }
  .radio {
    padding: 10px;
    border-radius: 100%;
    appearance: none;
    border: 1px solid #525252;
  }
  .radio:focus {
    padding: 7px;
    border: 4px solid #981c26;
  }
  .tos {
    margin-top: 50px;
    font-size: 12px;
    color: #cccccc;
  }
  .button {
    width: 100%;
    background: #3182f6;
    border: 0;
    border-radius: 8px;
    padding: 14px 0;
    font-size: 18px;
    color: #ffffff;
  }
`;

function Order() {
  const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";
  const customerKey = "1rE8ksH2atEQQcYTT3dJw";
  const [address, setAddress] = useState(0);
  const [newPlace, setNewPlace] = useState({});
  const [newPlaceForm, setNewPlaceForm] = useState(0);
  const [amount, setAmount] = useState({
    currency: "KRW",
    value: 50_000,
  });
  const [ready, setReady] = useState(false);
  const [widgets, setWidgets] = useState(null);

  useEffect(() => {
    async function fetchPaymentWidgets() {
      // ------  결제위젯 초기화 ------
      const tossPayments = await loadTossPayments(clientKey);
      // 회원 결제
      const widgets = tossPayments.widgets({
        customerKey,
      });
      // 비회원 결제
      // const widgets = tossPayments.widgets({ customerKey: ANONYMOUS });

      setWidgets(widgets);
    }

    fetchPaymentWidgets();
  }, [clientKey, customerKey]);

  useEffect(() => {
    async function renderPaymentWidgets() {
      if (widgets === null) {
        return;
      }
      // ------ 주문의 결제 금액 설정 ------
      await widgets.setAmount(amount);

      await Promise.all([
        // ------  결제 UI 렌더링 ------
        widgets.renderPaymentMethods({
          selector: "#payment-method",
          variantKey: "DEFAULT",
        }),
        // ------  이용약관 UI 렌더링 ------
        widgets.renderAgreement({
          selector: "#agreement",
          variantKey: "AGREEMENT",
        }),
      ]);

      setReady(true);
    }

    renderPaymentWidgets();
  }, [widgets]);

  useEffect(() => {
    if (widgets === null) {
      return;
    }
    widgets.setAmount(amount);
  }, [widgets, amount]);

  return (
    <OrderCss address={address}>
      <div className="header">
        <TfiAngleLeft />
        <p>주문/결제</p>
        <TfiClose />
      </div>
      <div className="box">
        <p className="subTitle1">주문 상품</p>
        <div className="item">
          <span>
            [서울] 홍대/합정 내맘대로 수제쿠키 원데이클래스 공방데이트
            베이킹클래스 동아리
          </span>
        </div>
        <Item
          name={"도자기 원데이 클래스"}
          discount={95000}
          price={105000}
          count={1}
        />
      </div>
      <div className="box">
        <p className="subTitle1">배송지</p>
        <div className="address">
          <div className="addressSelect">
            <div
              className="addreessSelected"
              onClick={() => {
                setAddress(address === 0 ? 1 : 0);
              }}
            >
              <p className="text">홍길동</p>
              <p className="text1">휴대폰번호 010-1234-5678</p>
              <p className="text1">
                서울특별시 송파구 백제고분로 18길 12-13, 101
              </p>
              <p className="text1">롯데타워 2층</p>
              <p className="text1">문앞에 놓아주세요</p>
            </div>
            <TfiAngleDown className="selectBtn" />
          </div>
          <div className="addressList">
            <Address current={1} />
            <Address />
            <Address />
            <Address />
            <Address />
            <Address />
            <Address />
            <Address />
          </div>
        </div>

        {newPlaceForm === 0 ? (
          <div
            className="newPlace"
            onClick={() => {
              setNewPlaceForm(1);
            }}
          >
            + 배송지 추가
          </div>
        ) : (
          <div className="form">
            <div className="flex">
              <input type="text" placeholder="이름" />
              <input type="text" placeholder="휴대폰 번호" />
            </div>
            <input type="text" placeholder="주소" />
            <input type="text" placeholder="상세주소" />
            <input type="text" placeholder="요청사항" />
            <div
              className="newPlace"
              onClick={() => {
                setNewPlaceForm(0);
              }}
            >
              배송지 등록
            </div>
          </div>
        )}
      </div>
      <div className="box">
        <div className="subTitle2">
          <span className="name">할인</span>
          <span>2000</span>
        </div>
        <select className="coupon">
          <option>니어바이 오픈 기념 할인쿠폰</option>
          <option>니어바이 오픈 기념 할인쿠폰</option>
          <option>니어바이 오픈 기념 할인쿠폰</option>
        </select>
      </div>
      <div className="box">
        <div className="subTitle2">
          <span className="name">결제수단</span>
          <span>2000</span>
        </div>
      </div>
      <div className="wrapper">
        <div className="box_section">
          <div id="payment-method" />
          <div id="agreement" />
          <div className="box">
            <div className="subTitle2">
              <span className="name">현금영수증</span>
              <div className="apply">
                <div className="type">
                  <input type="radio" className="radio" name="apply" />
                  <span className="text2">신청</span>
                </div>
                <div className="type">
                  <input
                    type="radio"
                    className="radio"
                    name="apply"
                    defaultChecked={true}
                  />
                  <span className="text2">미신청</span>
                </div>
              </div>
            </div>
            <div className="type">
              <div className="type">
                <input
                  type="radio"
                  className="radio"
                  name="type"
                  defaultChecked={true}
                />
                <p className="text2">개인 소득공제용</p>
              </div>
              <div className="type">
                <input type="radio" className="radio" name="type" />
                <p className="text2">사업자 지출 증빙용(세금계산서 대용)</p>
              </div>
            </div>
            <input
              className="phone"
              type="text"
              placeholder="연락처를 입력해주세요 ex)01030001234"
            />
            <button
              className="button"
              disabled={!ready}
              onClick={async () => {
                try {
                  await widgets.requestPayment({
                    orderId: "PoIQ2j6XxTk__sNRPFR9F",
                    orderName: "토스 티셔츠 외 2건",
                    successUrl: window.location.origin + "/success",
                    failUrl: window.location.origin + "/fail",
                    customerEmail: "customer123@gmail.com",
                    customerName: "김토스",
                    customerMobilePhone: "01012341234",
                  });
                } catch (error) {
                  console.error(error);
                }
              }}
            >
              결제하기
            </button>
          </div>
        </div>
      </div>

      <div className="box">
        <div className="subTitle2" />
        <p className="tos">
          개인정보처리방침 | 개인정보처리방침 오드(주)는 전자결제서비스제공자 및
          통신판매중개자이며 통신판매의 당사자가 아닙니다. 상품, 상품정보 및
          거래에 관한 의무와 책임은 판매자에게 있습니다.
        </p>
      </div>
    </OrderCss>
  );
}

export default Order;
