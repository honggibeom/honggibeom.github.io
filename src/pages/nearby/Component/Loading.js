import React from "react";
import { styled } from "styled-components";
import dualBall from '../Img/Loading/dualBall.gif';
const LoadingCss = styled.div`  
  position: absolute;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const LoadingText = styled.div`
  text-align: center;
  font-size: 12px;
  font-weight: 400;
  color: #080708;
`;

function Loading() {
    return (
        <LoadingCss>
            <LoadingText>잠시만 기다려 주세요.</LoadingText>
            <img src={dualBall} alt="로딩중" width="5%" />
        </LoadingCss>
    );
}

export default Loading;
