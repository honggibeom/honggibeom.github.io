import React, { useState, useEffect, useRef, memo } from "react";
import styled from "styled-components";
import Footer from "./Component/Footer";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { TfiAngleRight } from "react-icons/tfi";
import { AiOutlineDown } from "react-icons/ai";
import {
  MainEventComponent1,
  MainEventComponent2,
  MainEventComponent3,
} from "./Component/MainEventComponent";
import useInteval from "./Hook/UseInteval";
import searchWhite from "./Img/Main/searchWhite.svg";
import { origin, shortOrigin } from "./Origin/Origin";
const MainCss = styled.div`
  padding: 0;
  margin: 0;
  overflow: hidden;
  height: 100vh;
  width: 100vw;
  max-width: 450px;

  .mainContainer {
    height: 100vh;
    overflow-x: hidden;
    overflow-y: scroll;
    width: 100vw;
    max-width: 450px;
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
        height: 100%;
        background-position: center;
        background-size: cover;
        display: flex;
        align-items: end;
        justify-content: center;
        background-repeat: no-repeat;
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
    top: 0;
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
    .anchor1 {
      width: 100%;
      display: flex;
      justify-content: center;
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
        height: ${(props) => props.height}px;
        min-height: 350px;
        object-fit: contain;
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
    }

    .close {
      display: flex;
      align-items: center;
      justify-content: right;
      width: 50%;
    }
    label {
      display: flex;
    }
  }
`;
const MainEvent = (props) => {
  return (
    <div className="mainEvent">
      <div className="subHeader">
        <p className="subTitle">{props.content}</p>
        <Link
          className="moreDiv"
          to={"/EventList?theme&id=" + props.id}
          style={{ textDecoration: "none", color: "black" }}
        >
          <p className="more">
            모두보기 <TfiAngleRight style={{ marginLeft: "4px" }} />
          </p>
        </Link>
      </div>
      <div className="eventList">
        <span></span>
        {props.type === 1 &&
          props.data.map((e, idx) => {
            return (
              <MainEventComponent1 key={idx} id={e.event.id} data={e.event} />
            );
          })}
        {props.type === 2 &&
          props.data.map((e, idx) => {
            return (
              <MainEventComponent2 key={idx} id={e.event.id} data={e.event} />
            );
          })}
        {props.type === 3 && (
          <MainEventComponent3
            id={props.data[0].event.id}
            theme={props.id}
            len={props.data.length}
            data={props.data[0].event}
          />
        )}
        <span></span>
      </div>
    </div>
  );
};

const EndEvent = (props) => {
  return (
    <div className="mainEvent">
      <div className="subHeader">
        <p className="subTitle">{props.content}</p>
        <Link
          className="moreDiv"
          to={"/EventList?end"}
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
  const navigate = useNavigate();
  const slider = useRef();
  const slider1 = useRef();
  const bannerLen = useRef();
  const container = useRef();
  const [banner, setBanner] = useState([]);
  const [startPos, setStartPos] = useState(0);
  const [curPos, setCurPos] = useState(0);
  const [mode, setMode] = useState(0);
  const [themeList, setThemeList] = useState({});
  const [endList, setEndList] = useState([]);
  const [popup, setPopup] = useState(false);
  const [day3, setDay3] = useState(false);
  const [notice, setNotice] = useState([]);
  const [recommendList, setRecommendList] = useState({});
  const [startPos1, setStartPos1] = useState(0);
  const [curPos1, setCurPos1] = useState(0);
  const [mode1, setMode1] = useState(0);
  const [height, setHeight] = useState(0);
  const [touch, setTouch] = useState(false);
  const location = useLocation();

  const scrollBanner = useInteval(
    () => {
      const width = window.innerWidth > 450 ? 450 : window.innerWidth;
      if (slider.current !== null)
        slider.current.style.transitionDuration = "600ms";
      setTimeout(() => {
        if (slider.current !== null)
          slider.current.style.transitionDuration = "0ms";
        if ((mode + 2) % bannerLen.current === 0) {
          setBanner([...banner, ...banner.slice(0, bannerLen.current)]);
        }
      }, 500);
      if (slider.current !== null)
        slider.current.style.transform = `translate(${curPos - width}px)`;
      setCurPos(curPos - width);
      setMode(mode + 1);
    },
    touch ? null : 5000
  );
 
  useEffect(() => {
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

  useEffect(() => {
    if (notice.length > 0) {
      let img = new Image();
      img.src = notice[0].src;
      let width = window.innerWidth > 450 ? 450 : window.innerWidth;
      setHeight((img.height * width) / img.width);
    }
  }, [mode1]);

  const Anchor = (props) => {
    let buf = [];
    for (let i = 0; i < bannerLen.current; i++) {
      if (props.mode % bannerLen.current === i)
        buf.push(<p key={i} style={{ background: "#080708" }}></p>);
      else buf.push(<p key={i}></p>);
    }
    return buf;
  };

  const Anchor1 = (props) => {
    let buf = [];
    for (let i = 0; i < props.data.length; i++) {
      if (props.mode === i)
        buf.push(
          <p
            key={i}
            style={{
              background: "#080708",
              width: "6px",
              height: "6px",
              borderRadius: "100%",
            }}
          ></p>
        );
      else
        buf.push(
          <p
            key={i}
            style={{
              background: "#525252",
              width: "6px",
              height: "6px",
              borderRadius: "100%",
            }}
          ></p>
        );
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
      mode1={mode1}
      height={height}
    >
      <div className="mainContainer" ref={container}>
        <div className="banner">
          <div
            className="bannerSlider"
            ref={slider}
            onTouchStart={(e) => {
              setStartPos(e.changedTouches[0].pageX);
              setTouch(true);
            }}
            onTouchMove={(e) => {
              const offset = curPos + (e.changedTouches[0].pageX - startPos);
              const width = window.innerWidth > 450 ? 450 : window.innerWidth;
              const isScroll = offset % width;
              const limit = banner.length;
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
            }}
            onTouchEnd={(e) => {
              const width = window.innerWidth > 450 ? 450 : window.innerWidth;
              const sum = curPos + (e.changedTouches[0].pageX - startPos);
              if (sum > 0) {
                slider.current.style.transitionDuration = "600ms";
                slider.current.style.transform = `translate(0px)`;
                setTimeout(() => {
                  if (slider.current !== null)
                    slider.current.style.transitionDuration = "0ms";
                }, 600);
              } else {
                let drag = (-sum / width) % 1;
                let destination;
                if (e.changedTouches[0].pageX > startPos && drag <= 0.9) {
                  destination = -Math.floor(-sum / width) * width;
                } else if (
                  e.changedTouches[0].pageX < startPos &&
                  drag >= 0.1
                ) {
                  destination = Math.floor(sum / width) * width;
                } else {
                  destination = Math.round(sum / width) * width;
                }
                slider.current.style.transform = `translate(${destination}px)`;
                slider.current.style.transitionDuration = "600ms";
                setCurPos(destination);
                setMode(-destination / width);
                setTimeout(() => {
                  if (slider.current !== null)
                    slider.current.style.transitionDuration = "0ms";
                  if ((mode + 2) % bannerLen.current === 0) {
                    setBanner([
                      ...banner,
                      ...banner.slice(0, bannerLen.current),
                    ]);
                  }
                }, 500);
              }
              setTouch(false);
              container.current.style.overflowY = "scroll";
              container.current.style.overflowX = "hidden";
            }}
          >
            {banner.map((e, idx) => {
              return (
                <div
                  onClick={() => {
                    navigate("/EventDetail?id=" + e.event_dto.id);
                  }}
                  key={idx}
                  className="bannerimg"
                  style={{
                    backgroundImage:
                      "linear-gradient(180deg, rgba(38, 38, 38, 0) 69.7%, rgba(38, 38, 38, 0.4) 80.18%,#262626 109.8%), url(" +
                      e.event_dto.src +
                      ")",
                  }}
                >
                  <div className="bannerContent">
                    <p className="subject">{e.content}</p>
                    <p className="title">{e.event_dto.title}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="anchor">
          <Anchor data={banner} mode={mode} />
        </div>
        {Object.keys(recommendList).map((e, idx) => {
          return (
            <RecommendEvent content={e} data={recommendList[e]} key={idx} />
          );
        })}
        {endList.length > 0 && (
          <EndEvent data={endList} content="종료 임박 이벤트" />
        )}
        {Object.keys(themeList).map((e, idx) => {
          return (
            <MainEvent
              id={themeList[e].id}
              type={themeList[e].type}
              data={themeList[e].data}
              content={themeList[e].content}
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
            ref={slider1}
            onTouchStart={(e) => {
              setStartPos1(e.changedTouches[0].pageX);
            }}
            onTouchMove={(e) => {
              const offset = curPos1 + (e.changedTouches[0].pageX - startPos1);
              const width = window.innerWidth > 450 ? 450 : window.innerWidth;
              const isScroll = offset % width;
              const limit = notice.length;
              if (isScroll < -30 || isScroll > 30) {
                container.current.style.overflow = "hidden";
              }
              if (
                offset < 0 &&
                offset > -width * (limit - 1) &&
                (isScroll < -30 || isScroll > 30)
              ) {
                slider1.current.style.transform = `translate(${offset}px)`;
                slider1.current.style.transitionDuration = "0ms";
              }
            }}
            onTouchEnd={(e) => {
              const width = window.innerWidth > 450 ? 450 : window.innerWidth;
              const sum = curPos1 + (e.changedTouches[0].pageX - startPos1);
              const limit = notice.length;
              if (sum > 0) {
                slider1.current.style.transitionDuration = "600ms";
                slider1.current.style.transform = `translate(0px)`;
                setTimeout(() => {
                  slider1.current.style.transitionDuration = "0ms";
                }, 600);
              } else if (sum < -width * (limit - 1)) {
                slider1.current.style.transitionDuration = "600ms";
                slider1.current.style.transform = `translate(${
                  -width * (limit - 1)
                }px)`;
                setTimeout(() => {
                  slider1.current.style.transitionDuration = "0ms";
                }, 600);
              } else {
                let drag = (-sum / width) % 1;
                let destination;
                if (e.changedTouches[0].pageX > startPos1 && drag <= 0.9) {
                  destination = -Math.floor(-sum / width) * width;
                } else if (
                  e.changedTouches[0].pageX < startPos1 &&
                  drag >= 0.1
                ) {
                  destination = Math.floor(sum / width) * width;
                } else {
                  destination = Math.round(sum / width) * width;
                }
                slider1.current.style.transform = `translate(${destination}px)`;
                slider1.current.style.transitionDuration = "600ms";
                setCurPos1(destination);
                setMode1(-destination / width);
                setTimeout(() => {
                  slider1.current.style.transitionDuration = "0ms";
                }, 600);
              }
              container.current.style.overflowY = "scroll";
              container.current.style.overflowX = "hidden";
            }}
          >
            {notice.map((e, idx) => {
              return (
                <a href={e.link} key={idx} className="noticeLink">
                  <img key={idx} src={e.src} alt="img" className="img" />
                </a>
              );
            })}
          </div>
        </div>
        {notice.length > 1 && (
          <div className="anchor1">
            <Anchor1 data={notice} mode={mode1} />
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
