import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";

import NoSearch from "../Img/Address/noSearch.svg";
import SearchImg from "../Img/Address/search.svg";
import proj4 from "proj4";
import { TfiAngleLeft } from "react-icons/tfi";
const SearchLogCss = styled.div`
  width: 100%;
  height: 6vh;
  min-height: 12px;
  display: flex;
  margin-top: 1vw;
  margin-left: 5vw;
  border-bottom: 1px solid #f5f5f5;
  p {
    margin: 0vh;
    display: flex;
    font-family: "Spoqa Han Sans Neo";
    letter-spacing: -0.02em;
    font-weight: 400;
    font-size: 14px;
    width: 70vw;
    color: #222222;
    align-items: center;
    margin-left: 5vw;
  }
`;
function SearchLog(props) {
  const content =
    props.region.roadAddrPart1 +
    " ( " +
    props.region.emdNm +
    ", " +
    props.region.bdNm.split("(")[0] +
    " )";
  return (
    <SearchLogCss vh={props.vh} onClick={() => {}}>
      <p>{content}</p>
    </SearchLogCss>
  );
}
const AddressCss = styled.div``;

function Address(props) {
  const region = useRef("");
  const [regionList, setRegionList] = useState([]);
  function getAddr(str) {
    // 적용예 (api 호출 전에 검색어 체크)
    if (!checkSearchedWord(str)) {
      return;
    }
  }

  //특수문자, 특정문자열(sql예약어의 앞뒤공백포함) 제거
  function checkSearchedWord(str) {
    if (str.length > 0) {
      //특수문자 제거
      var expText = /[%=><]/;
      if (expText.test(str) === true) {
        alert("특수문자를 입력 할수 없습니다.");
        str = str.split(expText).join("");
        return false;
      }

      //특정문자열(sql예약어의 앞뒤공백포함) 제거
      var sqlArray = [
        "OR",
        "SELECT",
        "INSERT",
        "DELETE",
        "UPDATE",
        "CREATE",
        "DROP",
        "EXEC",
        "UNION",
        "FETCH",
        "DECLARE",
        "TRUNCATE",
      ];

      var regex;
      for (var i = 0; i < sqlArray.length; i++) {
        regex = new RegExp(sqlArray[i], "gi");

        if (regex.test(str)) {
          alert(
            '"' + sqlArray[i] + '"와(과) 같은 특정문자로 검색할 수 없습니다.'
          );
          str = str.replace(regex, "");
          return false;
        }
      }
    }
    return true;
  }

  return (
    <AddressCss loc={props.loc} top={props.top}>
      <div className="searchBar">
        <TfiAngleLeft
          className="fa-solid fa-angle-left"
          onClick={() => {
            props.setLoc({ ...props.loc, display: 0 });
          }}
        />
        <label>
          <input
            type="text"
            placeholder="검색어를 입력해 주세요"
            ref={region}
            onChange={() => getAddr(region.current.value)}
          />
          <img
            src={SearchImg}
            alt="search"
            className="fa-solid fa-magnifying-glass"
          />
        </label>
      </div>
      <div className="regionList">
        {regionList.length === 0 && (
          <img src={NoSearch} alt="검색 결과 없음" className="noSearch" />
        )}
        {regionList.map((line, num) => {
          return line !== undefined ? (
            <SearchLog
              vh={1}
              key={num}
              region={line}
              setLoc={props.setLoc}
              loc={props.loc}
            />
          ) : (
            ""
          );
        })}
      </div>
    </AddressCss>
  );
}

export default Address;
