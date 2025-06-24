import React, { useState, useEffect, useRef, useTransition } from "react";
import { Link } from "react-router-dom";

import styled from "styled-components";
import Footer from "./Component/Footer.js";
import gpsIcon from "./Img/Map/Gps.svg";
import myloc from "./Img/Map/myloc.svg";
import Filter from "./Component/Filter.js";
import exhibitionIcon from "./Img/Map/exhibition.svg";
import popupstoreIcon from "./Img/Map/popupstore.svg";
import festivalIcon from "./Img/Map/festival.svg";
import searchIcon from "./Img/Header/search.svg";
import oneDayClassIcon from "./Img/Map/oneDayClassIcon.svg";
import filterIcon from "./Img/Header/filter.svg";
import { MapEventComponent } from "./Component/MainEventComponent.js";
import filtering from "./Function/FilterFunctions.js";
import Loading from "./Component/Loading";
const maker = {
  전시회: exhibitionIcon,
  공연: popupstoreIcon,
  축제: festivalIcon,
  "원데이 클래스": oneDayClassIcon,
};

// function CustomMarker(props) {
//   return (
//     <>
//       {props.data !== undefined && (
//         <Marker
//           position={{
//             lat: props.data.location_x,
//             lng: props.data.location_y,
//           }}
//           visible={true}
//           icon={maker[props.data.category]}
//           onClick={() => {
//             props.setTouch(true);
//             props.center.current = {
//               lat: props.data.location_x,
//               lng: props.data.location_y,
//             };
//             props.setCenter({
//               lat: props.data.location_x,
//               lng: props.data.location_y,
//             });
//             props.setEvent(props.data);
//             props.detailRef.current.style.top = "-284px";
//             props.detailRef.current.style.transitionDuration = "600ms";
//             setTimeout(() => {
//               props.detailRef.current.style.transitionDuration = "0ms";
//             }, 600);

//             setTimeout(() => {
//               props.setTouch(false);
//             }, 100);
//           }}
//         />
//       )}
//     </>
//   );
//   /*
//     <CustomMaker pos={}
//     filter={filter}
//     time={}
//     classify={}
//     my={}
//     category={}
//     setDetail={setDetail}
//     detail={detail}
//     />

//   */
// }

const MapCss = styled.div`
  overflow: hidden;
  height: 100vh;
  min-height: ${(props) => props.vh * 100}px;
  max-width: 450px;

  .header {
    width: 100%;
    max-width: 450px;
    display: flex;
    align-items: center;
    position: fixed;
    z-index: 2;
    background: #fff;
    height: 54px;
    .simpleFilter {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-left: 20px;
      width: ${window.innerWidth > 450 ? 205 : window.innerWidth - 20}px;
      .dot {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 4px 13px 5px 13px;
        border-radius: 100px;
        font-size: 12px;
        font-weight: 400;
      }
    }
    .menu {
      display: flex;
      align-items: center;
      justify-content: right;
      gap: 10px;
      width: ${window.innerWidth > 450 ? 205 : window.innerWidth - 20}px;
      margin-right: 20px;
      .dot {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 34px;
        height: 34px;
        background: #fff;
        border-radius: 100%;
        margin: 0;
      }
    }
  }

  .gps {
    position: absolute;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    top: ${window.innerHeight - 230}px;
    left: 82%;
    width: 44px;
    height: 44px;
    background: #fff;
    border-radius: 100%;
    @media (min-width: 450px) {
      left: ${window.innerWidth / 2 + 150}px;
    }
    z-index: 2;
    opacity: ${(props) => props.gps};
    transition: 0.3s;
  }

  .map {
    height: 100vh;
  }

  .detail {
    position: relative;
    width: 100vw;
    max-width: 450px;
    background: #ffffff;
    z-index: 3;
    border-radius: 10px 10px 0px 0px;
    transition: 0.6s;
    .back {
      width: 100%;
      display: flex;
      height: 200px;
    }

    .bar {
      display: flex;
      align-items: center;
      justify-content: center;

      .icon {
        border-radius: 2px;
        width: 40px;
        height: 4px;
        background: #080708;
      }
    }
  }
`;

function Map() {
  const detailRef = useRef();
  const barRef = useRef();
  const [size, setSize] = useState(
    window.innerHeight < 600 ? window.screen.availHeight : window.innerHeight
  );
  const [gps, setGps] = useState(1);
  const center = useRef({
    lat: 37.554722,
    lng: 126.970833,
  });
  const [centerState, setCenter] = useState({
    lat: 37.554722,
    lng: 126.970833,
  });
  const [eventList, seteventList] = useState([]);
  const [my, setMy] = useState({
    vis: false,
    pos: { lat: 37.554722, lng: 126.970833 },
  });
  const [event, setEvent] = useState();
  const [filter, setFilter] = useState({
    category: {
      전시회: false,
      공연: false,
      축제: false,
      "원데이 클래스": false,
    },
    fee: { 무료: false, 유료: false, 부분유료: false },
    run: {
      "곧 오픈": false,
      "현재 운영중": false,
      "곧 종료": false,
    },
    startDate: null,
    endDate: null,
  });
  const [display, setDisplay] = useState(false);
  const [touch, setTouch] = useState(false);
  const [isPending, startTransition] = useTransition();
  const getMyLoc = () => {
    function success(position) {
      center.current = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      setCenter({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });

      setMy({
        vis: true,
        pos: { lat: position.coords.latitude, lng: position.coords.longitude },
      });
    }

    function error() {
      alert("Sorry, no position available.");
    }

    const options = {
      enableHighAccuracy: true,
      maximumAge: 30000,
      timeout: 27000,
    };
    navigator.geolocation.getCurrentPosition(success, error, options);
  };

  useEffect(() => {
    window.addEventListener("resize", () => {
      setSize(
        window.innerHeight < 600
          ? window.screen.availHeight
          : window.innerHeight
      );
    });
  }, []);

  useEffect(() => {}, [filter]);

  return (
    <MapCss gps={gps} vh={size / 100}>
      <div className="header">
        <div className="simpleFilter">
          <span
            className="dot"
            style={{
              color: filter.run["현재 운영중"] ? "#fff" : "#080708",
              background: filter.run["현재 운영중"] ? "#981C26" : "#f2f3f5",
            }}
            onClick={() => {
              let buf = { ...filter };
              buf.run["현재 운영중"] = !buf.run["현재 운영중"];
              setFilter(buf);
            }}
          >
            현재 운영중
          </span>
          <span
            className="dot"
            style={{
              color: filter.fee["무료"] ? "#fff" : "#080708",
              background: filter.fee["무료"] ? "#981C26" : "#f2f3f5",
            }}
            onClick={() => {
              let buf = { ...filter };
              buf.fee["무료"] = !buf.fee["무료"];
              setFilter(buf);
            }}
          >
            무료
          </span>
        </div>
        <div className="menu">
          <Link to={"/search"} style={{ textDecoration: "none" }}>
            <p className="dot">
              <img alt="search" src={searchIcon} />
            </p>
          </Link>
          <p
            className="dot"
            onClick={() => {
              setDisplay(true);
            }}
          >
            <img alt="filter" src={filterIcon} />
          </p>
        </div>
      </div>
      <div className="map">
        <div className="gps">
          <img
            src={gpsIcon}
            alt="gps"
            onMouseDown={() => setGps(0.5)}
            onMouseUp={() => {
              getMyLoc();
              setGps(1);
            }}
          />
        </div>
        {/* {center.current !== undefined && (
          <NavermapsProvider
            ncpClientId="pvhem24pi2"
            error={<p>Maps Load Error</p>}
            loading={<p>Maps Loading...</p>}
          >
            <MapDiv
              id="nearby"
              style={{
                width: "100vw",
                maxWidth: "450px",
                height: "100%",
                minHeight: size * 0.8 + "px",
              }}
              onTouchStart={() => {
                detailRef.current.style.top = "-108px";
                detailRef.current.style.transitionDuration = "600ms";
                setTimeout(() => {
                  if (detailRef.current !== null)
                    detailRef.current.style.transitionDuration = "0ms";
                }, 600);
              }}
            >
              <NaverMap
                defaultZoom={15}
                center={centerState}
                onCenterChanged={(e) => {
                  center.current = {
                    lat: e.y,
                    lng: e.x,
                  };
                }}
              >
                <Marker position={my.pos} visible={my.vis} icon={myloc} />
                {!isPending &&
                  eventList.map((e, idx) => {
                    if (filtering(filter, e))
                      return (
                        <CustomMarker
                          key={idx}
                          data={e}
                          setEvent={setEvent}
                          detailRef={detailRef}
                          center={center}
                          setCenter={setCenter}
                          setTouch={setTouch}
                        />
                      );
                  })}
              </NaverMap>
            </MapDiv>
          </NavermapsProvider>
        )} */}
        {isPending && <Loading />}
      </div>
      <div className="detail" ref={detailRef}>
        <div ref={barRef}>
          <div
            className="bar"
            onClick={(e) => {
              detailRef.current.style.transitionDuration = "600ms";
              if (detailRef.current.style.top === "-108px")
                detailRef.current.style.top = "-284px";
              else detailRef.current.style.top = "-108px";
              setTimeout(() => {
                if (detailRef.current !== null)
                  detailRef.current.style.transitionDuration = "0ms";
              }, 600);
            }}
          >
            <p className="icon"></p>
          </div>
        </div>
        {!touch && event !== null && event !== undefined ? (
          <MapEventComponent id={event.id} data={event} />
        ) : (
          <div className="back"></div>
        )}
      </div>
      <Filter display={display} setDisplay={setDisplay} setFilter={setFilter} />
      <Footer mode={1} />
    </MapCss>
  );
}

export default Map;
