import React, { useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import AddImg from "./Img/CreatForm/AddImg.svg";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/esm/locale";
import axios from "axios";
import { useEffect } from "react";
import { TfiAngleLeft } from "react-icons/tfi";
import { AiOutlinePlus, AiOutlineClose } from "react-icons/ai";
import { origin } from "./Origin/Origin";
import proj4 from "proj4";
import useDebounce from "./Hook/Debounce";

const SearchLogCss = styled.div`
  width: 90%;
  min-height: 12px;
  padding: 5px 5%;
  border-bottom: 1px solid #f5f5f5;
  display: flex;
  align-items: center;
  p {
    font-weight: 400;
    font-size: 14px;
    align-items: center;
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
    <SearchLogCss
      vh={props.vh}
      onClick={() => {
        axios
          .get("https://business.juso.go.kr/addrlink/addrCoordApi.do", {
            params: {
              confmKey: "U01TX0FVVEgyMDIyMDgyNTExMzA1OTExMjkxNjQ=",
              admCd: props.region.admCd,
              rnMgtSn: props.region.rnMgtSn,
              udrtYn: props.region.udrtYn,
              buldMnnm: Number(props.region.buldMnnm),
              buldSlno: Number(props.region.buldSlno),
              resultType: "json",
            },
          })
          .then((res) => {
            var firstProjection =
              "+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +units=m +no_defs";
            var secondProjection =
              "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
            const pos = proj4(firstProjection, secondProjection, [
              Number(res.data.results.juso[0].entX),
              Number(res.data.results.juso[0].entY),
            ]);
            props.setEventPlace({
              ...props.eventPlace,
              location: content,
              location_x: pos[1].toString(),
              location_y: pos[0].toString(),
            });
            props.setPlaceList([]);
          });
      }}
    >
      <p>{content}</p>
    </SearchLogCss>
  );
}

const EventCreateFormCss = styled.div`
  width: 100vw;
  height: 100vh;
  min-height: ${(props) => props.vh * 100}px;
  background: #fafafa;
  max-width: 450px;
  overflow: auto;
  .header {
    width: 100%;
    padding: ${(props) => props.vh * 3}px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    .close {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      width: 10%;
    }
  }
  .title {
    margin: 0;
    width: 80%;
    font-size: 24px;
    text-align: center;
  }

  .container {
    width: 90%;
    margin-left: 5%;
  }
  .white {
    background: #ffffff;
  }
  .subtitle {
    font-size: 18px;
  }

  .input1 {
    border-radius: 12px;
    width: 100%;
    height: 4vh;
    min-height: ${(props) => props.vh * 4}px;
    border: 1px solid #000000;
  }
  .input2 {
    width: 85%;
    margin: 0 auto;
    border: 0;
  }

  textarea:focus,
  .input1:focus,
  .input2:focus {
    outline: none;
  }

  textarea {
    width: 100%;
    border-radius: 12px;
    border: 1px solid #000000;
    min-height: ${(props) => props.vh * 20}px;
  }

  .select {
    width: 100%;
    height: 4vh;
    min-height: ${(props) => props.vh * 4}px;
  }

  .flexContainer {
    display: flex;
    align-items: center;
  }

  .imgContainer {
    flex-wrap: wrap;
  }

  .img,
  .img1 {
    width: 120px;
    height: 120px;
    object-fit: contain;
    margin-top: 1vh;
    margin-bottom: 1vh;
    border-radius: 12px;
  }

  .img1:nth-child(3n + 1),
  .img:nth-child(3n + 1) {
    margin-left: 2vw;
  }
  .img1:nth-child(3n + 2),
  .img:nth-child(3n + 2) {
    margin: 1vh 2vw;
  }

  .img1:nth-child(3n),
  .img:nth-child(3n) {
    margin-right: 2vw;
  }

  .warn {
    font-size: 12px;
    color: #b03131;
  }

  .hashTagContainer {
    display: flex;
    align-items: center;
    border-radius: 12px;
    height: 4vh;
    min-height: ${(props) => props.vh * 4}px;
    border: 1px solid #000000;
    background: #ffffff;
    padding: 0 2%;
  }

  .hashTag {
    display: flex;
    align-items: center;
    background: #ff7878;
    padding: 1vw 2%;
    border-radius: 12px;
    color: #ffffff;
    margin: 1vh 1%;
  }
  .next {
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    width: 100%;
    max-width: 450px;
    min-height: ${(props) => props.vh * 7}px;
    background: #b03131;
    bottom: 0;
    color: #ffffff;
  }
  .empty {
    width: 100%;
    min-height: ${(props) => props.vh * 9}px;
  }
`;
function EventCreateForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const hashTagInput = useRef("");
  const dayList = ["월", "화", "수", "목", "금", "토", "일"];
  const charge = ["무료", "유료", "부분유료"];
  const [placeList, setPlaceList] = useState([]);
  const [eventPlace, setEventPlace] = useState({
    location: "",
    location_x: "",
    location_y: "",
    place_name: "",
    homepage: "",
  });

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [noEnd, setNoEnd] = useState(false);
  const [existOpen, setExistOpen] = useState([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ]);
  const [open, setOpen] = useState({
    월: { day: 0, start_at: "10:00", close_at: "17:00" },
    화: { day: 1, start_at: "10:00", close_at: "17:00" },
    수: { day: 2, start_at: "10:00", close_at: "17:00" },
    목: { day: 3, start_at: "10:00", close_at: "17:00" },
    금: { day: 4, start_at: "10:00", close_at: "17:00" },
    토: { day: 5, start_at: "10:00", close_at: "17:00" },
    일: { day: 6, start_at: "10:00", close_at: "17:00" },
  });
  const [existFee, setExistFee] = useState([]);
  const [fee, setFee] = useState([]);
  const [existClose, setExistClose] = useState([]);
  const [close, setClose] = useState([]);
  const [event, setEvent] = useState({
    title: "",
    category: "전시회",
    description: "",
    start_date: null,
    end_ate: null,
    homepage: "",
    ticket_link: "",
    charge: 0,
    is_sell: false,
  });

  const [eventImg, setEventImg] = useState({ new: [], newObj: [], exist: [] });
  const [promotionImg, setPromotionImg] = useState({
    new: [],
    newObj: [],
    exist: [],
  });

  const [hashTag, setHasTag] = useState({ new: [], exist: [] });

  const category = ["전시회", "공연", "축제", "원데이 클래스"];

  const [size, setSize] = useState(
    window.innerHeight < 600 ? window.screen.availHeight : window.innerHeight
  );

  useEffect(() => {
    window.addEventListener("resize", () => {
      setSize(
        window.innerHeight < 600
          ? window.screen.availHeight
          : window.innerHeight
      );
    });

    if (location.search.includes("edit")) {
      const id = location.search.split("?")[1].split("&")[1].split("id=")[1];

      axios.get(origin + "event/" + id).then((res) => {
        if (res.status === 200) {
          let data = res.data.data;

          //시작일시
          const start =
            data.start_date === null ? new Date() : new Date(data.start_date);
          data.start_date = start;
          setStartDate(start);

          //종료일시
          const end = data.end_date === null ? "마감시 종료" : data.end_date;
          if (end === "마감시 종료") {
            setNoEnd(true);
          } else {
            setEndDate(new Date(end));
          }

          //티켓 가격
          setExistFee([...data.event_price_list]);

          //오픈 시간
          let openbuf = {};
          let existOpenBuf = [...existOpen];
          for (const e of data.event_open_list) {
            openbuf[dayList[e.day]] = e;
            existOpenBuf[e.day] = true;
          }
          setOpen({ ...open, ...openbuf });

          //휴일 or 부분영업
          setExistClose(data.event_close_list);

          setEventImg({ ...eventImg, exist: data.event_image_list });
          setPromotionImg({
            ...promotionImg,
            exist: data.promotion_image_list,
          });
          setHasTag({ ...hashTag, exist: [...data.event_hashtag_list] });
          setEventPlace({
            ...data.event_place,
          });
          setEvent({
            title: data.title,
            category: data.category,
            description: data.description,
            start_date: data.start_date,
            end_ate: data.endDate,
            homepage: data.homepage,
            ticket_link: data.ticket_link,
            is_sell: data.is_sell,
            charge: data.charge,
          });
        }
      });
    }
  }, []);

  function makeHashTag(ref) {
    let hashTagBuf = ref.current.value.split("#");
    hashTagBuf.splice(0, 1);
    setHasTag({ ...hashTag, new: [...hashTag.new, ...hashTagBuf] });
    ref.current.value = "";
  }

  async function deleteImg(data) {
    let res = await axios
      .post(
        origin + "image-update/delete",

        {
          data: {
            type: data.type,
            id: Number(
              location.search.split("?")[1].split("&")[1].split("id=")[1]
            ),
            img_id: data.id,
          },
        },
        {
          headers: {
            Authorization: sessionStorage.getItem("token"),
          },
        }
      )
      .catch(() => {
        alert("이미지를 삭제할 수 없습니다");
      });

    return res;
  }

  async function deleteInfomation(id, type) {
    let res = await axios
      .delete(origin + `event/${type}/delete/` + id, {
        headers: {
          Authorization: sessionStorage.getItem("token"),
        },
      })
      .catch(() => {
        alert(type + "을 삭제할 수 없습니다");
      });

    return res;
  }

  async function createEvent(data) {
    let eventData = {
      ...data,
      event_price_list: fee,
      event_close_list: [],
      event_place: eventPlace,
      event_open_list: [],
    };
    for (const e of Object.keys(open)) {
      eventData.event_open_list.push(open[e]);
    }

    for (let i = 0; i < close.length; i++) {
      eventData.event_close_list.push(close[i].data);
    }

    let eventImgData = new FormData();
    let promotionImgData = new FormData();
    let hashTagList = { hash_tag_list: [...hashTag.new] };

    let res = await axios.post(
      origin + "event",
      {
        data: {
          ...hashTagList,
          ...eventData,
        },
      },
      {
        headers: {
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let event_id = res.data.data.id;

    if (eventImg.newObj.length > 0) {
      for (let i = 0; i < eventImg.newObj.length; i++) {
        eventImgData.append("multipartFile", eventImg.newObj[i]);
      }
      let res1 = await axios.post(
        origin + "image/upload?dir=event/" + event_id,
        eventImgData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          processData: false,
          contentType: false,
        }
      );

      res1.data.data.forEach((e) => {
        axios({
          method: "post",
          url: origin + "image-update/create",
          headers: {
            "Access-Control-Allow-Origin": "*",
            Authorization: sessionStorage.getItem("token"),
          },
          data: {
            data: {
              type: "event",
              id: Number(event_id),
              src: "https://deso-spring.s3.ap-northeast-2.amazonaws.com/" + e,
            },
          },
        }).catch(() => {
          alert("이미지를 등록할 수 없습니다");
        });
      });
    }

    if (promotionImg.newObj.length > 0) {
      for (let i = 0; i < promotionImg.newObj.length; i++) {
        promotionImgData.append("multipartFile", promotionImg.newObj[i]);
      }
      let res = await axios.post(
        origin + "image/upload?dir=promotion/" + event_id,
        promotionImgData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "Access-Control-Allow-Origin": "*",
          },
          processData: false,
          contentType: false,
        }
      );

      res.data.data.forEach((e) => {
        axios({
          method: "post",
          url: origin + "image-update/create",
          headers: {
            "Access-Control-Allow-Origin": "*",
            Authorization: sessionStorage.getItem("token"),
          },
          data: {
            data: {
              type: "promotion",
              id: Number(event_id),
              src: "https://deso-spring.s3.ap-northeast-2.amazonaws.com/" + e,
            },
          },
        }).catch(() => {
          alert("이미지를 등록할 수 없습니다");
        });
      });
    }

    if (res.status === 200) {
      navigate("/EventDetail?id=" + res.data.data.id);
    }
  }

  async function editEvent(data) {
    let eventData = {
      ...data,
      event_price_list: fee,
      event_close_list: [],
      event_place: eventPlace,
      event_open_list: [],
    };
    let eventImgData = new FormData();
    let promotionImgData = new FormData();
    for (const e of Object.keys(open)) {
      eventData.event_open_list.push(open[e]);
    }

    for (let i = 0; i < close.length; i++) {
      eventData.event_close_list.push(close[i].data);
    }
    if (hashTag.new.length > 0) {
      hashTag.new.forEach((e) => {
        axios.post(
          origin + "event/hashtag",
          {
            data: {
              content: e,
              event_id: Number(
                location.search.split("?")[1].split("&")[1].split("id=")[1]
              ),
            },
          },
          {
            headers: {
              Authorization: sessionStorage.getItem("token"),
            },
          }
        );
      });
    }

    if (eventImg.newObj.length > 0) {
      for (let i = 0; i < eventImg.newObj.length; i++) {
        eventImgData.append("multipartFile", eventImg.newObj[i]);
      }
      let res = await axios.post(
        origin + "image/upload?dir=event/" + sessionStorage.getItem("id"),
        eventImgData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          processData: false,
          contentType: false,
        }
      );
      res.data.data.forEach((e) => {
        axios({
          method: "post",
          url: origin + "image-update/create",
          headers: {
            "Access-Control-Allow-Origin": "*",
            Authorization: sessionStorage.getItem("token"),
          },
          data: {
            data: {
              type: "event",
              id: Number(
                location.search.split("?")[1].split("&")[1].split("id=")[1]
              ),
              src: "https://deso-spring.s3.ap-northeast-2.amazonaws.com/" + e,
            },
          },
        }).catch(() => {
          alert("이미지를 등록할 수 없습니다");
        });
      });
    }

    if (promotionImg.newObj.length > 0) {
      for (let i = 0; i < promotionImg.newObj.length; i++) {
        promotionImgData.append("multipartFile", promotionImg.newObj[i]);
      }
      let res = await axios.post(
        origin + "image/upload?dir=promotion/" + sessionStorage.getItem("id"),
        promotionImgData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          processData: false,
          contentType: false,
        }
      );

      res.data.data.forEach((e) => {
        axios({
          method: "post",
          url: origin + "image-update/create",
          headers: {
            Authorization: sessionStorage.getItem("token"),
          },
          data: {
            data: {
              type: "promotion",
              id: Number(
                location.search.split("?")[1].split("&")[1].split("id=")[1]
              ),
              src: "https://deso-spring.s3.ap-northeast-2.amazonaws.com/" + e,
            },
          },
        }).catch(() => {
          alert("이미지를 등록할 수 없습니다");
        });
      });
    }

    let res = await axios.patch(
      origin + "event/update",
      {
        data: {
          id: location.search.split("?")[1].split("&")[1].split("id=")[1],
          ...eventData,
        },
      },
      {
        headers: {
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );

    if (res.status === 200) {
      navigate("/EventDetail?id=" + res.data.data.id);
    }
  }

  function nextProcess() {
    if (event.title.length === 0) {
      alert("제목을 입력해주세요");
      return;
    } else if (event.category.length === 0) {
      alert("카테고리를 선택해주세요");
      return;
    } else if (eventPlace.location.length === 0) {
      alert("이벤트 주소를 입력해주세요");
      return;
    } else if (eventPlace.place_name.length === 0) {
      alert("이벤트 상세주소를 입력해주세요");
      return;
    } else if (event.description.length === 0 && event.is_sell) {
      alert("이벤트 소개를 입력해주세요");
      return;
    } else if (event.start_date === null) {
      alert("날짜를 입력해주세요");
      return;
    }

    if (location.search.includes("edit")) editEvent(event);
    else createEvent(event);
  }

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
  const searchLocation = useDebounce((str) => {
    if (!checkSearchedWord(str)) {
      return;
    }

    axios
      .get("https://www.juso.go.kr/addrlink/addrLinkApi.do", {
        params: {
          confmKey: "U01TX0FVVEgyMDIyMDgyNTExMjc1MjExMjkxNTk=",
          currentPage: 1,
          countPerPage: 10,
          keyword: str,
          resultType: "json",
        },
        responsetype: "json",
      })
      .then((res) => {
        let juso = res.data.results.juso;
        if (juso === null || juso.length === 0) setPlaceList([]);
        else setPlaceList(juso);
      });
  });

  return (
    <EventCreateFormCss vh={size / 100}>
      <div className="header">
        <div className="close">
          <TfiAngleLeft />
        </div>
        <p className="title">이벤트 생성</p>
      </div>
      {/* 제목 */}
      <div className="container">
        <p className="subtitle">제목</p>
        <input
          type="text"
          className="input1"
          defaultValue={event.title}
          onChange={(e) => {
            setEvent({
              ...event,
              title: e.target.value,
            });
          }}
        />
        {event.title === "" && <p className="warn">제목을 입력해 주세요</p>}
      </div>
      {/* 카테고리 */}
      <div className="container">
        <p className="subtitle">카테고리</p>
        <select
          className="select"
          defaultValue={event.category}
          onChange={(e) => {
            setEvent({
              ...event,
              category: e.target.value,
            });
          }}
        >
          {category.map((e, idx) => {
            return (
              <option value={e} key={idx}>
                {e}
              </option>
            );
          }, [])}
        </select>
        {event.category === "" && (
          <p className="warn">카테고리를 선택해주세요</p>
        )}
      </div>
      {/* 장소 */}
      <div className="container">
        <p className="subtitle">장소</p>
        <p> {eventPlace.location}</p>
        <input
          type="text"
          className="input1"
          defaultValue={eventPlace.location}
          onChange={(e) => {
            searchLocation(e.target.value);
          }}
        />
        <div className="white">
          {placeList.map((e, num) => {
            return (
              <SearchLog
                vh={1}
                key={num}
                region={e}
                setEventPlace={setEventPlace}
                eventPlace={eventPlace}
                setPlaceList={setPlaceList}
              />
            );
          })}
        </div>
        {eventPlace.location === "" && (
          <p className="warn">장소을 입력해 주세요</p>
        )}
      </div>
      {/* 상세주소 */}
      <div className="container">
        <p className="subtitle">상세주소</p>
        <input
          type="text"
          className="input1"
          defaultValue={eventPlace.place_name}
          onChange={(e) => {
            setEventPlace({
              ...eventPlace,
              place_name: e.target.value,
            });
          }}
        />
        {eventPlace.place_name === "" && (
          <p className="warn">상세주소를 입력해 주세요</p>
        )}
      </div>
      {/*이벤트 장소 홈페이지*/}
      <div className="container">
        <p className="subtitle">이벤트 장소 홈페이지</p>
        <input
          type="text"
          className="input1"
          defaultValue={eventPlace.homepage}
          onChange={(e) => {
            setEventPlace({
              ...eventPlace,
              hompage: e.target.value,
            });
          }}
        />
      </div>

      {/* 이벤트 소개 */}
      <div className="container">
        <p className="subtitle">이벤트 소개</p>
        <textarea
          defaultValue={event.description}
          onChange={(e) => {
            setEvent({
              ...event,
              description: e.target.value,
            });
          }}
        />
        {event.description === "" && (
          <p className="warn">장소을 입력해 주세요</p>
        )}
      </div>
      {/* 입장료 */}
      <div className="container">
        <div className="flexContainer">
          <p className="subtitle">입장료</p>
        </div>
        <select
          className="select"
          defaultValue={event.charge}
          onChange={(e) => {
            setEvent({
              ...event,
              charge: e.target.value,
            });
          }}
        >
          {charge.map((e, idx) => {
            return (
              <option value={idx} key={idx}>
                {e}
              </option>
            );
          })}
        </select>
        <table border={1}>
          <tr>
            <th>대상</th>
            <th>가격</th>
            <th>
              <span
                onClick={() => {
                  setFee([...fee, { target: "", price: "" }]);
                }}
              >
                <AiOutlinePlus />
              </span>
            </th>
          </tr>
          {existFee.map((e, idx) => {
            return (
              <tr key={idx}>
                <th>
                  <input
                    type="text"
                    defaultValue={e.target}
                    style={{ width: "150px" }}
                    readOnly={true}
                  />
                </th>
                <th>
                  <input
                    type="number"
                    defaultValue={e.price}
                    style={{ width: "150px" }}
                    readOnly={true}
                  />
                </th>
                <th>
                  <span
                    onClick={() => {
                      let buf = [...existFee];
                      buf.splice(idx, 1);
                      deleteInfomation(e.id, "price");
                      setExistFee(buf);
                    }}
                  >
                    <AiOutlineClose />
                  </span>
                </th>
              </tr>
            );
          })}
          {fee.map((e, idx) => {
            return (
              <tr key={idx}>
                <th>
                  <input
                    type="text"
                    defaultValue={e.target}
                    style={{ width: "150px" }}
                    onChange={(ev) => {
                      let buf = [...fee];
                      buf[idx].target = ev.target.value;
                      setFee(buf);
                    }}
                  />
                </th>
                <th>
                  <input
                    type="number"
                    defaultValue={e.price}
                    style={{ width: "150px" }}
                    placeholder="무료일 경우 0입력"
                    onChange={(ev) => {
                      console.log(ev.target.value);
                      let buf = [...fee];
                      buf[idx].price = Number(ev.target.value);
                      setFee(buf);
                    }}
                  />
                </th>
                <th>
                  <span
                    onClick={() => {
                      let buf = [...fee];
                      buf.splice(idx, 1);
                      setFee(buf);
                    }}
                  >
                    <AiOutlineClose />
                  </span>
                </th>
              </tr>
            );
          })}
        </table>
      </div>
      {/* 시작 일시 */}
      <div className="container">
        <p className="subtitle">시작일시</p>
        <DatePicker
          selected={startDate}
          dateFormat="yyyy.MM.dd"
          minDate={"0"}
          maxDate={"+1Y"}
          selectsStart
          onChange={(date) => {
            let tmp = date;
            tmp.setHours(0);
            tmp.setMinutes(0);
            tmp.setSeconds(0);
            tmp.setMilliseconds(0);
            setStartDate(tmp);
            setEvent({
              ...event,
              start_date: tmp.toISOString().replace(".000Z", ""),
            });
          }}
          locale={ko}
          customInput={
            <input
              type="text"
              className="input1"
              style={{
                width:
                  window.innerWidth > 450
                    ? 405
                    : window.innerWidth * 0.9 + "px",
              }}
            />
          }
        />
      </div>
      {/* 종료 일시 */}
      <div className="container">
        <div className="flexContainer">
          <p className="subtitle">종료일시</p>
          <label style={{ marginLeft: "5vw" }}>
            <input
              type="checkbox"
              checked={noEnd}
              onChange={(e) => {
                setNoEnd(e.target.checked);
                setEvent({
                  ...event,
                  end_date: endDate.toISOString().replace(".000Z", ""),
                });
              }}
            />
            마감시 종료
          </label>
        </div>
        {!noEnd && (
          <DatePicker
            selected={endDate}
            dateFormat="yyyy.MM.dd"
            minDate={"0"}
            maxDate={"+1Y"}
            selectsStart
            onChange={(date) => {
              let tmp = date;
              tmp.setHours(0);
              tmp.setMinutes(0);
              tmp.setSeconds(0);
              tmp.setMilliseconds(0);
              setEndDate(tmp);
              setEvent({
                ...event,
                end_date: tmp.toISOString().replace(".000Z", ""),
              });
            }}
            locale={ko}
            customInput={
              <input
                type="text"
                className="input1"
                style={{
                  width:
                    window.innerWidth > 450
                      ? 405
                      : window.innerWidth * 0.9 + "px",
                }}
              />
            }
          />
        )}
      </div>
      {/* 운영시간 */}
      <div className="container">
        <p className="subtitle">운영 시간</p>
        <table border={1}>
          <tr>
            <th>요일</th>
            <th>시간</th>
            <th>정기 휴무</th>
          </tr>
          {dayList.map((e, idx) => {
            return (
              <tr key={idx}>
                <td>{e}</td>
                <td>
                  {open[e] !== undefined && (
                    <>
                      <input
                        style={{ margin: "5px 10px" }}
                        type="time"
                        readOnly={existOpen[idx]}
                        defaultValue={open[e].start_at}
                        onChange={(ev) => {
                          let tmp = { ...open };
                          tmp[e].start_at = ev.target.value;
                          setOpen(tmp);
                        }}
                      />
                      ~
                      <input
                        type="time"
                        style={{ margin: "5px 10px" }}
                        readOnly={existOpen[e]}
                        defaultValue={open[e].close_at}
                        onChange={(ev) => {
                          let tmp = { ...open };
                          tmp[e].close_at = ev.target.value;
                          setOpen(tmp);
                        }}
                      />
                    </>
                  )}
                </td>
                <td style={{ display: "flex", justifyContent: "center" }}>
                  {open[e] !== undefined && existOpen[open[e].day] ? (
                    <span
                      onClick={() => {
                        let tmp = [...existOpen];
                        tmp[open[e].day] = false;
                        deleteInfomation(open[e].id, "open");
                        setExistOpen(tmp);
                        let tmp1 = { ...open };
                        delete tmp[e];
                        setOpen(tmp1);
                      }}
                    >
                      <AiOutlineClose />
                    </span>
                  ) : (
                    <input
                      type="checkbox"
                      style={{
                        width: "20px",
                        height: "20px",
                      }}
                      onChange={(ev) => {
                        if (ev.target.checked) {
                          let tmp = { ...open };
                          delete tmp[e];
                          setOpen(tmp);
                        } else {
                          let tmp = { ...open };
                          tmp[e] = {
                            day: idx,
                            start_at: "10:00",
                            close_at: "17:00",
                          };
                          setOpen(tmp);
                        }
                      }}
                    />
                  )}
                </td>
              </tr>
            );
          })}
        </table>
        {event.open === "" && <p className="warn">운영시간을 입력해주세요</p>}
      </div>
      {/* 휴무 */}
      <div className="container">
        <div className="flexContainer">
          <p className="subtitle">휴무</p>
        </div>
        <table border={1}>
          <tr>
            <th>날짜</th>
            <th>부분영업</th>
            <th>기간</th>
            <th>
              <span
                onClick={() => {
                  let date = new Date();
                  date.setHours(0);
                  date.setMinutes(0);
                  date.setSeconds(0);
                  date.setMilliseconds(0);
                  setClose([
                    ...close,
                    {
                      date: date,
                      data: {
                        type: false,
                        date: new Date().toISOString().replace(".000Z", ""),
                      },
                    },
                  ]);
                }}
              >
                <AiOutlinePlus />
              </span>
            </th>
          </tr>
          {existClose.map((e, idx) => {
            return (
              <tr key={idx}>
                <td>
                  <input
                    type="text"
                    style={{ width: "10vw" }}
                    defaultValue={e.date}
                    readOnly={true}
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    style={{
                      width: "20px",
                      height: "20px",
                    }}
                    defaultChecked={e.type}
                    readOnly={true}
                  />
                </td>
                <td>
                  {e.type && (
                    <>
                      <input
                        style={{ margin: "5px 5px" }}
                        type="time"
                        readOnly={true}
                        defaultValue={e.start_at}
                      />
                      ~
                      <input
                        type="time"
                        style={{ margin: "5px 5px" }}
                        defaultValue={e.close_at}
                        readOnly={true}
                      />
                    </>
                  )}
                </td>
                <td>
                  <span
                    onClick={() => {
                      let buf = [...existClose];
                      buf.splice(idx, 1);
                      deleteInfomation(e.id, "close");
                      setExistClose(buf);
                    }}
                  >
                    <AiOutlineClose />
                  </span>
                </td>
              </tr>
            );
          })}
          {close.map((e, idx) => {
            return (
              <tr key={idx}>
                <td>
                  <DatePicker
                    selected={e.date}
                    dateFormat="yyyy.MM.dd"
                    minDate={"0"}
                    selectsStart
                    onChange={(date) => {
                      date.setHours(0);
                      date.setMinutes(0);
                      date.setSeconds(0);
                      date.setMilliseconds(0);
                      let buf = [...close];
                      buf[idx].date = date;
                      buf[idx].data.date = date
                        .toISOString()
                        .replace(".000Z", "");
                      setClose(buf);
                    }}
                    locale={ko}
                    customInput={
                      <input type="text" style={{ width: "10vw" }} />
                    }
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    style={{
                      width: "20px",
                      height: "20px",
                    }}
                    onChange={(ev) => {
                      let buf = [...close];
                      if (ev.target.checked) {
                        buf[idx].data.type = true;
                        buf[idx].data.start_at = "00:00";
                        buf[idx].data.close_at = "23:59";
                      } else {
                        buf[idx].data.type = false;
                        delete buf[idx].data.start_at;
                        delete buf[idx].data.close_at;
                      }
                      setClose(buf);
                    }}
                  />
                </td>
                <td>
                  {e.data.type && (
                    <>
                      <input
                        style={{ margin: "5px 5px" }}
                        type="time"
                        defaultValue={e.data.start_at}
                        onChange={(ev) => {
                          let tmp = [...close];
                          tmp[idx].data.start_at = ev.target.value;
                          setClose(tmp);
                        }}
                      />
                      ~
                      <input
                        type="time"
                        style={{ margin: "5px 5px" }}
                        defaultValue={e.data.close_at}
                        onChange={(ev) => {
                          let tmp = [...close];
                          tmp[idx].data.end_at = ev.target.value;
                          setClose(tmp);
                        }}
                      />
                    </>
                  )}
                </td>
                <td>
                  <span
                    onClick={() => {
                      let buf = [...close];
                      buf.splice(idx, 1);
                      setClose(buf);
                    }}
                  >
                    <AiOutlineClose />
                  </span>
                </td>
              </tr>
            );
          })}
        </table>
      </div>
      {/* 공식 홈페이지 */}
      <div className="container">
        <p className="subtitle">공식 홈페이지 링크</p>
        <input
          type="text"
          defaultValue={event.homepage}
          className="input1"
          placeholder="외부링크 연결 시 사이트 이름 ex) 인터파크 / 아닐경우 url"
          onChange={(e) => {
            setEvent({
              ...event,
              homepage: e.target.value,
            });
          }}
        />
        {event.open_chat === "" && (
          <p className="warn">공식 홈페이지 링크를 입력해 주세요(선택)</p>
        )}
      </div>
      {/*티켓판매 여부*/}
      <div className="container">
        <p className="subtitle">티켓팅 사이트 링크</p>
        <select
          className="select"
          defaultValue={event.is_sell}
          onChange={(e) => {
            console.log(e.target.value);
            setEvent({
              ...event,
              is_sell: e.target.value,
            });
          }}
        >
          <option value={true}>직접 판매</option>
          <option value={false}>외부 사이트 연결</option>
        </select>
      </div>
      {/* 티켓팅 사이트 */}
      <div className="container">
        <p className="subtitle">티켓팅 사이트 링크</p>
        <input
          type="text"
          defaultValue={event.ticket}
          className="input1"
          onChange={(e) => {
            setEvent({
              ...event,
              ticket_link: e.target.value,
            });
          }}
        />
        {event.open_chat === "" && (
          <p className="warn">티켓팅 사이트를 입력해 주세요(선택)</p>
        )}
      </div>
      {/* 이벤트 이미지 */}
      <div>
        <p className="subtitle" style={{ marginLeft: "5vw" }}>
          이벤트 이미지
        </p>
        <div className="imgContainer flexContainer">
          <label htmlFor="file">
            <img className="img" src={AddImg} alt="AddImg" />
          </label>
          {eventImg.exist.map((img, idx) => {
            return (
              <img
                className="img"
                alt="eventImg"
                src={img.src}
                key={idx}
                id={img.id}
                style={{ background: "#00000011" }}
                onClick={(e) => {
                  let existBuf = [...eventImg.exist];
                  existBuf.splice(idx, 1);
                  deleteImg({ id: e.target.id, type: "event" });
                  setEventImg({ ...eventImg, exist: existBuf });
                }}
              />
            );
          })}
          {eventImg.new.map((img, idx) => {
            return (
              <img
                className="img"
                alt="eventImg"
                src={img}
                key={idx}
                style={{ background: "#00000011" }}
                onClick={(e) => {
                  let newBuf = [...eventImg.new];
                  newBuf.splice(idx, 1);
                  let newObjBuf = [...eventImg.newObj];
                  newObjBuf.splice(idx, 1);
                  setEventImg({ ...eventImg, new: newBuf, newObj: newObjBuf });
                }}
              />
            );
          })}
        </div>
        <input
          type="file"
          multiple
          style={{ display: "none" }}
          id="file"
          className="file"
          onChange={(e) => {
            let newBuf = [...eventImg.new];
            let newObjBuf = [...eventImg.newObj];
            for (let i = 0; i < e.target.files.length; i++) {
              var reader = new FileReader();
              reader.onload = function (event) {
                newBuf.push(event.target.result);
                newObjBuf.push(e.target.files[i]);
              };
              reader.readAsDataURL(e.target.files[i]);
            }
            setTimeout(() => {
              setEventImg({ ...eventImg, new: newBuf, newObj: newObjBuf });
            }, 100);
          }}
        />
      </div>
      {/* 프로모션 이미지 */}
      <div>
        <p className="subtitle" style={{ marginLeft: "5vw" }}>
          프로모션 이미지
        </p>
        <div className="imgContainer flexContainer">
          <label htmlFor="file1">
            <img className="img" src={AddImg} alt="AddImg" />
          </label>
          {promotionImg.exist.map((img, idx) => {
            return (
              <img
                className="img"
                alt="eventImg"
                src={img.src}
                key={idx}
                id={img.id}
                style={{ background: "#00000011" }}
                onClick={(e) => {
                  let existBuf = [...promotionImg.exist];
                  existBuf.splice(idx, 1);
                  deleteImg({ id: e.target.id, type: "promotion" });
                  setPromotionImg({ ...promotionImg, exist: existBuf });
                }}
              />
            );
          })}
          {promotionImg.new.map((img, idx) => {
            return (
              <img
                className="img"
                alt="eventImg"
                src={img}
                key={idx}
                style={{ background: "#00000011" }}
                onClick={(e) => {
                  let newBuf = [...promotionImg.new];
                  newBuf.splice(idx, 1);
                  let newObjBuf = [...promotionImg.newObj];
                  newObjBuf.splice(idx, 1);
                  setPromotionImg({
                    ...promotionImg,
                    new: newBuf,
                    newObj: newObjBuf,
                  });
                }}
              />
            );
          })}
        </div>
        <input
          type="file"
          multiple
          style={{ display: "none" }}
          id="file1"
          className="file"
          onChange={(e) => {
            let newBuf = [...promotionImg.new];
            let newObjBuf = [...promotionImg.newObj];
            for (let i = 0; i < e.target.files.length; i++) {
              var reader = new FileReader();
              reader.onload = function (event) {
                newBuf.push(event.target.result);
                newObjBuf.push(e.target.files[i]);
              };
              reader.readAsDataURL(e.target.files[i]);
            }
            setTimeout(() => {
              setPromotionImg({
                ...promotionImg,
                new: newBuf,
                newObj: newObjBuf,
              });
            }, 100);
          }}
        />
      </div>
      {/* 해시태그*/}
      <div className="container">
        <p className="subtitle">해시태그</p>
        <label className="hashTagContainer">
          <input
            type="text"
            className="input2"
            onBlur={() => {
              makeHashTag(hashTagInput);
            }}
            ref={hashTagInput}
          />
          <AiOutlinePlus
            onClick={() => {
              makeHashTag(hashTagInput);
            }}
          />
        </label>
        <div className="imgContainer flexContainer">
          {hashTag.exist.map((e, idx) => {
            return (
              <div className="hashTag" key={idx}>
                {"#" + e.content}
                <AiOutlineClose
                  style={{ marginLeft: "1vw", color: "#000000" }}
                  onClick={() => {
                    let hashTagBuf = [...hashTag.exist];
                    hashTagBuf.splice(idx, 1);
                    setHasTag({ ...hashTag, exist: [...hashTagBuf] });
                    deleteInfomation(e.id, "hashtag");
                  }}
                />
              </div>
            );
          })}
          {hashTag.new.map((e, idx) => {
            return (
              <div className="hashTag" key={idx}>
                {"#" + e}
                <AiOutlineClose
                  style={{ marginLeft: "1vw", color: "#000000" }}
                  onClick={() => {
                    let hashTagBuf = [...hashTag.new];
                    hashTagBuf.splice(idx, 1);
                    setHasTag({ ...hashTag, new: [...hashTagBuf] });
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div
        className="next"
        onClick={() => {
          nextProcess();
        }}
      >
        이벤트 생성
      </div>

      <div className="empty"></div>
    </EventCreateFormCss>
  );
}

export default EventCreateForm;
