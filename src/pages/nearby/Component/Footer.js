import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import HomeEmpty from "../Img/Footer/HomeEmpty.svg";
import HomeFill from "../Img/Footer/HomeFill.svg";
import MapEmpty from "../Img/Footer/MapEmpty.svg";
import MapFill from "../Img/Footer/MapFill.svg";
import SearchEmpty from "../Img/Footer/SearchEmpty.svg";
import SearchFill from "../Img/Footer/SearchFill.svg";
import UserEmpty from "../Img/Footer/UserEmpty.svg";
import UserFill from "../Img/Footer/UserFill.svg";

const FooterCss = styled.div`
  position: fixed;
  width: 100vw;
  max-width: 450px;
  height: 48px;
  display: flex;
  padding: 12px 0;
  justify-content: center;
  align-items: center;
  background: #ffffff;
  bottom: 0;
  box-shadow: 0px 1px 1px 0px rgba(82, 82, 82, 0.16) inset;
  z-index: 10;
  .footerMenu {
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration-line: none;
    width: 25%;
  }
`;
function Footer(props) {
  return (
    <>
      <FooterCss>
        <Link to="/" className="footerMenu Home">
          <img src={props.mode === 0 ? HomeFill : HomeEmpty} alt="Home" />
        </Link>

        <Link to="/map" className="footerMenu Map">
          <img src={props.mode === 1 ? MapFill : MapEmpty} alt="Map" />
        </Link>

        <Link to="/eventList" className="footerMenu Search">
          <img src={props.mode === 2 ? SearchFill : SearchEmpty} alt="Event" />
        </Link>

        <Link to="/mypage" className="footerMenu User">
          <img src={props.mode === 3 ? UserFill : UserEmpty} alt="MyPage" />
        </Link>
      </FooterCss>
    </>
  );
}

export default Footer;
