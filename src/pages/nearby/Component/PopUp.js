import React, { useState } from "react";
import { styled } from "styled-components";
import { useNavigate } from "react-router-dom";
const PopUpCss = styled.div`
  position: absolute;
  height: 100vh;
  width: 100%;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  .box {
    width: 330px;
    height: 230px;
    background-color: white;
    border-radius: 5px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .layoutPopup {
    display: flex;
    flex-direction: column;
    width: 80%;
    height: 80%;
  }
  .descriptionPopup {
    font-size: 16px;
    font-weight: 600;
    text-align: center;
    margin: 25px 0 20px 0;
  }
  .descriptionPopupOne {
    font-size: 16px;
    font-weight: 600;
    text-align: center;
    margin: 25px 0 40px 0;
  }
  .checkBtn {
    display: flex;
    justify-content: center;
    width: 100%;
  }
  button {
    padding: 12px 0;
    margin: 5px;
    font-size: 14px;
  }
  .cancel {
    flex: 1;
    background-color: #e5e5e5;
    border-radius: 5px;
    border: 1px solid #e5e5e5;
  }
  .check {
    flex: 1;
    color: white;
    background-color: #981c26;
    border-radius: 5px;
    border: 1px solid #981c26;
  }
`;

function PopUp(props) {
  const navigate = useNavigate();
  const [isClickCheck, setIsClickCheck] = useState(false);

  const handleClose = () => {
    setIsClickCheck(false);
    props.handleClose();
  };

  return (
    <PopUpCss>
      <div className="box">
        {props.type === 1 ? (
          !isClickCheck ? (
            <div className="layoutPopup">
              <div className="descriptionPopup">
                <p>취소수수료가 부과됩니다.</p>
                {/*<p>취소수수료가 부과되지 않습니다.</p>*/}
                <p>정말 취소하시겠습니까?</p>
              </div>
              <div className="checkBtn">
                <button className="cancel" onClick={handleClose}>
                  취소
                </button>
                <button
                  className="check"
                  onClick={() => {
                    setIsClickCheck(true);
                  }}
                >
                  확인
                </button>
              </div>
            </div>
          ) : (
            <div className="layoutPopup">
              <div className="descriptionPopupOne">
                <p>취소가 완료되었습니다.</p>
              </div>
              <div className="checkBtn">
                <button
                  className="check"
                  onClick={() => {
                    navigate("/reserveTicket");
                    handleClose();
                  }}
                >
                  예매내역 확인하기
                </button>
              </div>
            </div>
          )
        ) : (
          <div className="layoutPopup">
            <div className="descriptionPopupOne">
              <p>결제가 완료되었습니다.</p>
            </div>
            <div className="checkBtn">
              <button
                className="check"
                onClick={() => {
                  navigate("/reserveTicket");
                }}
              >
                예매내역 확인하기
              </button>
            </div>
          </div>
        )}
      </div>
    </PopUpCss>
  );
}

export default PopUp;
