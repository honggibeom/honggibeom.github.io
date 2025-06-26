import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import Footer from "./Component/Footer";
import { Link } from "react-router-dom";

import { TfiAngleRight } from "react-icons/tfi";
import { AiOutlineDown } from "react-icons/ai";
import {
  MainEventComponent1,
  MainEventList,
} from "./Component/MainEventComponent";
import useInteval from "./Hook/UseInteval";
import dummydata1 from "./Img/Main/dummydata1.svg";
import dummydata2 from "./Img/Main/dummydata2.svg";
import dummydata3 from "./Img/Main/dummydata3.svg";
import dummydata4 from "./Img/Main/dummydata4.svg";
import dummydata5 from "./Img/Main/dummydata5.svg";
import dummydata6 from "./Img/Main/dummydata6.svg";
import dummynotice1 from "./Img/Main/dummynotice1.png";
import dummynotice2 from "./Img/Main/dummynotice2.jpg";
const MainCss = styled.div`
  padding: 0;
  margin: 0;
  overflow: hidden;
  .mainContainer {
    height: calc(100vh - 80px);
    overflow-x: hidden;
    overflow-y: scroll;
    width: 100vw;
    max-width: 450px;
    padding-bottom: 100px;
  }

  .banner {
    overflow: hidden;
    width: 100%;
    height: ${window.innerWidth > 450 ? 600 : (window.innerWidth * 4) / 3}px;
    .bannerSlider {
      width: ${(props) => props.banner.length * 100}%;
      height: 100%;
      display: flex;
      .bannerimg {
        width: ${window.innerWidth > 450 ? 450 : window.innerWidth}px;
        background-position: center;
        background-size: cover;
        display: flex;
        align-items: end;
        justify-content: center;
        background-repeat: no-repeat;
        text-decoration: none;
      }

      .bannerContent {
        margin: 50px 20px;
      }

      .subject {
        font-size: 14px;
        font-weight: 400;
        text-align: center;
        color: #fff;
        margin: 6px 0;
      }

      .title {
        color: #fff;
        text-align: center;
        font-size: 18px;
        font-weight: 600;
        margin: 6px 0;
      }
    }
  }

  .anchor {
    width: 100%;
    display: flex;
    height: 4px;
    background: #f2f3f5;
    p {
      margin: 0;
      height: 4px;
      flex: 1;
    }
  }

  .mainEvent {
    margin-top: 60px;
    .subHeader {
      display: flex;
      align-items: center;
      margin: 20px 20px;
      p {
        margin: 0;
      }
      .subTitle {
        display: flex;
        align-items: center;
        font-size: 18px;
        font-weight: 600;
        width: 70%;
      }

      .moreDiv {
        display: block;
        width: 30%;
      }

      .more {
        display: flex;
        align-items: center;
        justify-content: right;
        font-size: 14px;
        font-weight: 400;
      }
    }
    .eventList {
      display: flex;
      gap: 10px;
      overflow-y: auto;
      span {
        padding: 0 5px;
      }
    }
  }

  .back {
    ${(props) => !props.popup && "display:none"};
    position: fixed;
    top: 80px;
    height: 100vh;
    width: 100vw;
    max-width: 450px;
    background: rgba(8, 7, 8, 0.3);
    z-index: 11;
  }
  .popup {
    position: fixed;
    width: 100vw;
    max-width: 450px;
    bottom: ${(props) => (props.popup ? 0 : -800)}px;
    transition: ${(props) => (props.popup ? 0.3 : 0)}s;
    z-index: 12;
    background: #fff;

    .popupAnchor {
      width: 100%;
      display: flex;
      justify-content: center;
    }
    .dot {
      width: 6px;
      height: 6px;
      border-radius: 100%;
      margin: 8px 6px;
    }
    .restPopup {
      background: #525252;
    }
    .curPopup {
      background: #080708;
    }
    .notice {
      width: 100%;
      overflow: hidden;
    }

    .noticeImg {
      display: flex;
      width: ${(props) => props.notice.length * 100}%;

      .noticeLink {
        width: ${window.innerWidth > 450 ? 450 : window.innerWidth}px;
      }

      .img {
        width: ${window.innerWidth > 450 ? 450 : window.innerWidth}px;
        height: ${(props) => props.popupheight}px;
        min-height: 350px;
        object-fit: cover;
      }
    }

    .popupMenu {
      display: flex;
      margin: 16px 0;
    }

    .text {
      font-size: 12px;
      font-weight: 600;
    }
    .day3 {
      width: 45%;
    }
    input {
      display: none;
    }
    .check {
      width: 18px;
      height: 18px;
      border-radius: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid ${(props) => (props.day3 ? "#981c26" : "#525252")};
      background: ${(props) => (props.day3 ? "#981c26" : "#fff")};
      margin: auto 6px auto 20px;
      cursor: pointer;
    }

    .close {
      display: flex;
      align-items: center;
      justify-content: right;
      width: 50%;
      cursor: pointer;
    }
    label {
      display: flex;
    }
  }
`;

const RecommendEvent = (props) => {
  return (
    <div className="mainEvent">
      <div className="subHeader">
        <p className="subTitle">{"#" + props.content}</p>
        <Link
          className="moreDiv"
          to={"/EventList?hashTag=" + props.content}
          style={{ textDecoration: "none", color: "black" }}
        >
          <p className="more">
            모두보기 <TfiAngleRight style={{ marginLeft: "4px" }} />
          </p>
        </Link>
      </div>
      <div className="eventList">
        <span></span>
        {props.data.map((e, idx) => {
          return <MainEventComponent1 key={idx} id={e.id} data={e} />;
        })}
        <span></span>
      </div>
    </div>
  );
};
function Main() {
  const container = useRef();

  const bannerSlider = useRef();
  const bannerData = useRef([
    {
      src: dummydata1,
      content: "웨스 앤더슨 감독 영화 <그랜드 부다페스트 호텔",
      title: "맥스달튼, 영화의 순간들 63",
    },
    {
      src: dummydata2,
      content: "매듭과 매듭 사이 펼쳐진 무한한 우주, 박성림",
      title: "박성림  : KNOTTED STRUCTURE",
    },
    {
      src: dummydata3,
      content: "하나의 우주안에서 모든것은 연결되어있다",
      title: "서울올림픽 35주년 기념전 : Futuredays: One is All, All is One",
    },
    {
      src: dummydata4,
      content: "우리는 그렇게 바위가 된다.",
      title: "김범 : 바위가 되는 법",
    },
    {
      src: dummydata5,
      content: "산길, 물길, 바람길의 도시, 서울의 100년 후를 그리다",
      title: "제4회 서울도시건축비엔날레 ",
    },
    {
      src: dummydata6,
      content: "텅 빈 공간 속 힐링과 이완",
      title: "아름다운 선물 展",
    },
  ]);
  const [banner, setBanner] = useState([
    {
      src: dummydata1,
      content: "웨스 앤더슨 감독 영화 <그랜드 부다페스트 호텔",
      title: "맥스달튼, 영화의 순간들 63",
    },
    {
      src: dummydata2,
      content: "매듭과 매듭 사이 펼쳐진 무한한 우주, 박성림",
      title: "박성림  : KNOTTED STRUCTURE",
    },
    {
      src: dummydata3,
      content: "하나의 우주안에서 모든것은 연결되어있다",
      title: "서울올림픽 35주년 기념전 : Futuredays: One is All, All is One",
    },
    {
      src: dummydata4,
      content: "우리는 그렇게 바위가 된다.",
      title: "김범 : 바위가 되는 법",
    },
    {
      src: dummydata5,
      content: "산길, 물길, 바람길의 도시, 서울의 100년 후를 그리다",
      title: "제4회 서울도시건축비엔날레 ",
    },
    {
      src: dummydata6,
      content: "텅 빈 공간 속 힐링과 이완",
      title: "아름다운 선물 展",
    },
  ]);
  //banner scroll
  const [bannerStartPos, setBannerStartPos] = useState(0);
  const [bannerPos, setBannerPos] = useState(0);
  const [bannerPage, setBannerPage] = useState(0);

  const [themeList, setThemeList] = useState([
    {
      type: 1,
      data: [
        {
          src: dummydata1,
          category: "전시회",
          content: "웨스 앤더슨 감독 영화 <그랜드 부다페스트 호텔",
          title: "맥스달튼, 영화의 순간들 63",
          location: "서울특별시 강남구 테헤란로 518",
          start_date: "2021-04-16",
          end_date: "2021-7-11",
        },
      ],
      content: "사진 이벤트",
    },
    {
      type: 2,
      data: [
        {
          src: dummydata1,
          category: "전시회",
          content: "웨스 앤더슨 감독 영화 <그랜드 부다페스트 호텔",
          title: "맥스달튼, 영화의 순간들 63",
          location: "서울특별시 강남구 테헤란로 518",
          start_date: "2021-04-16",
          end_date: "2021-7-11",
        },
      ],
      content: "사진 이벤트",
    },
    {
      type: 3,
      data: [
        {
          src: dummydata1,
          category: "전시회",
          content: "웨스 앤더슨 감독 영화 <그랜드 부다페스트 호텔",
          title: "맥스달튼, 영화의 순간들 63",
          location: "서울특별시 강남구 테헤란로 518",
          start_date: "2021-04-16",
          end_date: "2021-7-11",
        },
      ],
      content: "사진 이벤트",
    },
  ]);
  const [popup, setPopup] = useState(true);
  const [day3, setDay3] = useState(false);
  const [notice, setNotice] = useState([
    { src: dummynotice1 },
    { src: dummynotice2 },
  ]);
  const [recommendList, setRecommendList] = useState([]);

  //popup scroll
  const popupSlider = useRef();
  const [popupStartPos, setPopupStartPos] = useState(0);
  const [popupPos, setPopupPos] = useState(0);
  const [popupPage, setPopupPage] = useState(0);

  const [popupheight, setpopupheight] = useState(0);
  const [touch, setTouch] = useState(false);

  const scrolledBanner = useInteval(
    () => {
      if (bannerSlider.current === null) return;
      const width = window.innerWidth > 450 ? 450 : window.innerWidth;
      bannerSlider.current.style.transitionDuration = "600ms";

      setTimeout(() => {
        if (bannerSlider.current === null) return;
        bannerSlider.current.style.transitionDuration = "0ms";
        if ((bannerPage + 2) % bannerData.current.length === 0) {
          setBanner([...banner, ...bannerData.current]);
        }
      }, 500);
      bannerSlider.current.style.transform = `translate(${
        bannerPos - width
      }px)`;
      setBannerPos(bannerPos - width);
      setBannerPage(bannerPage + 1);
    },
    touch ? null : 5000
  );
  const touchStartEvent = (e, setStartPos) => {
    setStartPos(e.changedTouches[0].pageX);
  };
  const touchMoveEvent = (e, slider, limit, startPos, curPos) => {
    const offset = curPos + (e.changedTouches[0].pageX - startPos);
    const width = window.innerWidth > 450 ? 450 : window.innerWidth;
    const isScroll = offset % width;
    if (isScroll < -30 || isScroll > 30) {
      container.current.style.overflow = "hidden";
    }
    if (
      offset < 0 &&
      offset > -width * (limit - 1) &&
      (isScroll < -30 || isScroll > 30)
    ) {
      slider.current.style.transform = `translate(${offset}px)`;
      slider.current.style.transitionDuration = "0ms";
    }
  };
  const bannerTouchEndEvent = (
    e,
    slider,
    startPos,
    curPos,
    setCurPos,
    setPage,
    callback
  ) => {
    const width = window.innerWidth > 450 ? 450 : window.innerWidth;
    const sum = curPos + (e.changedTouches[0].pageX - startPos);
    if (sum > 0) {
      slider.current.style.transitionDuration = "600ms";
      slider.current.style.transform = `translate(0px)`;
      setTimeout(() => {
        if (slider.current === null) return;
        slider.current.style.transitionDuration = "0ms";
      }, 600);
    } else {
      let drag = (-sum / width) % 1;
      let destination;
      if (e.changedTouches[0].pageX > startPos && drag <= 0.9) {
        destination = -Math.floor(-sum / width) * width;
      } else if (e.changedTouches[0].pageX < startPos && drag >= 0.1) {
        destination = Math.floor(sum / width) * width;
      } else {
        destination = Math.round(sum / width) * width;
      }
      slider.current.style.transform = `translate(${destination}px)`;
      slider.current.style.transitionDuration = "600ms";
      setCurPos(destination);
      setPage(-destination / width);
      setTimeout(callback, 500);
    }
    container.current.style.overflowY = "scroll";
    container.current.style.overflowX = "hidden";
  };
  const popupTouchEndEvent = (
    e,
    slider,
    startPos,
    curPos,
    setCurPos,
    setPage,
    callback
  ) => {
    const width = window.innerWidth > 450 ? 450 : window.innerWidth;
    const sum = curPos + (e.changedTouches[0].pageX - startPos);
    const limit = notice.length;
    if (sum > 0) {
      slider.current.style.transitionDuration = "600ms";
      slider.current.style.transform = `translate(0px)`;
      setTimeout(() => {
        slider.current.style.transitionDuration = "0ms";
      }, 600);
    } else if (sum < -width * (limit - 1)) {
      slider.current.style.transitionDuration = "600ms";
      slider.current.style.transform = `translate(${-width * (limit - 1)}px)`;
      setTimeout(() => {
        slider.current.style.transitionDuration = "0ms";
      }, 600);
    } else {
      let drag = (-sum / width) % 1;
      let destination;
      if (e.changedTouches[0].pageX > startPos && drag <= 0.9) {
        destination = -Math.floor(-sum / width) * width;
      } else if (e.changedTouches[0].pageX < startPos && drag >= 0.1) {
        destination = Math.floor(sum / width) * width;
      } else {
        destination = Math.round(sum / width) * width;
      }
      slider.current.style.transform = `translate(${destination}px)`;
      slider.current.style.transitionDuration = "600ms";
      setCurPos(destination);
      setPage(-destination / width);
      setTimeout(callback, 600);
    }
    container.current.style.overflowY = "scroll";
    container.current.style.overflowX = "hidden";
  };

  useEffect(() => {
    if (notice.length > 0) {
      let img = new Image();
      img.src = notice[0].src;
      let width = window.innerWidth > 450 ? 450 : window.innerWidth;
      setpopupheight((img.height * width) / img.width);
    }

    if (localStorage.getItem("notice") !== null) {
      let d = new Date(localStorage.getItem("notice"));
      let now = new Date();
      if (now - d >= 0) {
        localStorage.removeItem("notice");
        setPopup(true);
      }
    }
    return;
  }, []);

  const BannerAnchor = (props) => {
    let buf = [];
    for (let i = 0; i < bannerData.current.length; i++) {
      if (props.page % bannerData.current.length === i)
        buf.push(<p key={i} style={{ background: "#080708" }}></p>);
      else buf.push(<p key={i}></p>);
    }
    return buf;
  };

  const PopupAnchor = (props) => {
    let buf = [];
    for (let i = 0; i < props.len; i++) {
      if (props.page === i) buf.push(<p className="dot curPopup" key={i}></p>);
      else buf.push(<p className="dot restPopup" key={i}></p>);
    }
    return buf;
  };

  const closePopup = () => {
    if (day3) {
      let d = new Date();
      d.setDate(d.getDate() + 3);
      localStorage.setItem("notice", d.toISOString());
      setPopup(false);
    } else setPopup(false);
  };

  return (
    <MainCss
      banner={banner}
      popup={popup}
      day3={day3}
      notice={notice}
      popupheight={popupheight}
    >
      <div className="mainContainer" ref={container}>
        <div className="banner">
          <div
            className="bannerSlider"
            ref={bannerSlider}
            onDragStart={(e) => {
              e.preventDefault();
            }}
            onTouchStart={(e) => {
              setTouch(true);
              touchStartEvent(e, setBannerStartPos);
            }}
            onTouchMove={(e) => {
              touchMoveEvent(
                e,
                bannerSlider,
                banner.length,
                bannerStartPos,
                bannerPos
              );
            }}
            onTouchEnd={(e) => {
              setTouch(false);
              bannerTouchEndEvent(
                e,
                bannerSlider,
                bannerStartPos,
                bannerPos,
                setBannerPos,
                setBannerPage,
                () => {
                  if (bannerSlider.current === null) return;
                  bannerSlider.current.style.transitionDuration = "0ms";
                  if ((bannerPage + 2) % bannerData.current.length === 0) {
                    setBanner([
                      ...banner,
                      ...banner.slice(0, bannerData.current.length),
                    ]);
                  }
                }
              );
            }}
          >
            {banner.map((e, idx) => {
              return (
                <Link
                  to="/event/detail"
                  key={idx}
                  className="bannerimg"
                  style={{
                    backgroundImage:
                      "linear-gradient(180deg, rgba(38, 38, 38, 0) 69.7%, rgba(38, 38, 38, 0.4) 80.18%,#262626 109.8%), url(" +
                      e.src +
                      ")",
                  }}
                >
                  <div className="bannerContent">
                    <p className="subject">{e.content}</p>
                    <p className="title">{e.title}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
        <div className="anchor">
          <BannerAnchor data={banner} page={bannerPage} />
        </div>
        {recommendList.map((e, idx) => {
          return <RecommendEvent data={e} key={idx} />;
        })}

        {themeList.map((e, idx) => {
          return (
            <MainEventList
              type={e.type}
              data={e.data}
              content={e.content}
              key={idx}
            />
          );
        })}

        <div style={{ height: "100px" }}></div>
      </div>
      <div
        className="back"
        onClick={() => {
          setPopup(false);
        }}
      ></div>
      <div className="popup">
        <div className="notice">
          <div
            className="noticeImg"
            ref={popupSlider}
            onDragStart={(e) => {
              e.preventDefault();
            }}
            onTouchStart={(e) => {
              touchStartEvent(e, setPopupStartPos);
            }}
            onTouchMove={(e) => {
              touchMoveEvent(
                e,
                popupSlider,
                notice.length,
                popupStartPos,
                popupPos
              );
            }}
            onTouchEnd={(e) => {
              popupTouchEndEvent(
                e,
                popupSlider,
                popupStartPos,
                popupPos,
                setPopupPos,
                setPopupPage,
                () => {
                  popupSlider.current.style.transitionDuration = "0ms";
                }
              );
            }}
          >
            {notice.map((e, idx) => {
              return (
                <div key={idx} className="noticeLink">
                  <img key={idx} src={e.src} alt="img" className="img" />
                </div>
              );
            })}
          </div>
        </div>
        {notice.length > 1 && (
          <div className="popupAnchor">
            <PopupAnchor len={notice.length} page={popupPage} />
          </div>
        )}
        <div className="popupMenu">
          <div className="day3">
            <input
              type="checkbox"
              id="check"
              onChange={(e) => {
                setDay3(e.target.checked);
              }}
            />
            <label htmlFor="check">
              <p className="check">
                <AiOutlineDown
                  style={{
                    fontSize: "14px",
                    color: day3 ? "#fff" : "#525252",
                  }}
                />
              </p>
              <p className="text">3일 동안 보지않기</p>
            </label>
          </div>
          <p
            className="close text"
            onClick={() => {
              closePopup();
            }}
          >
            닫기
          </p>
        </div>
      </div>
      <Footer mode={0} />
    </MainCss>
  );
}

export default Main;
