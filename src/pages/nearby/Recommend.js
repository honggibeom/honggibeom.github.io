import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { TfiAngleLeft } from "react-icons/tfi";
import { useNavigate } from "react-router-dom";
import { origin } from "./Origin/Origin";
import axios from "axios";
import { func } from "prop-types";
const RecommendCss = styled.div`
  width: 100vw;
  height: 100vh;
  max-width: 450px;
  .back {
    font-size: 24px;
    margin: 30px 0 0 10px;
  }

  .title {
    font-size: 24px;
    font-weight: 700;
    margin-left: 16px;
  }

  .subtitle {
    font-size: 14px;
    color: #656060;
    margin-left: 16px;
  }
  .subjectList {
    margin: 40px 80px 0 10px;
    display: flex;
    flex-wrap: wrap;
  }

  .subject {
    background: #f2f3f5;
    border-radius: 100px;
    font-size: 14px;
    margin: 6px 6px;
    padding: 3px 10px;
    font-weight: 400;
  }

  .selected {
    background: #981c26;
    color: #ffffff;
  }

  .bottom {
    position: fixed;
    bottom: 0;
    width: 100%;
  }

  .next {
    background: #981c26;
    color: #ffffff;
    border-radius: 100px;
    font-size: 18px;
    margin: 10px 20px;
    width: ${window.innerWidth > 450 ? 410 : window.innerWidth - 40}px;
    text-align: center;
    padding: 14px 0;
  }

  .later {
    font-size: 12px;
    width: ${window.innerWidth > 450 ? 410 : window.innerWidth - 40}px;
    text-decoration: underline;
    margin: 10px 20px;
    color: #72787f;
    text-align: center;
  }
`;

function Recommend() {
  const [subject, setSubject] = useState({});
  const navigate = useNavigate();

  async function init() {
    const res1 = await axios.get(origin + "event/hashtag/type");
    let tmp = {};
    res1.data.data.forEach((e) => {
      tmp[e] = 0;
    });

    const res2 = await axios.get(
      origin + "log/user/" + sessionStorage.getItem("id")
    );
    res2.data.data.forEach((e) => {
      tmp[e.type] = e.id;
    });
    setSubject(tmp);
  }

  async function addLog(type) {
    await axios.post(origin + "log", {
      data: { type: type, user_id: sessionStorage.getItem("id") },
    });
  }

  async function deleteLog(id) {
    await axios.delete(origin + "log/delete/" + id);
  }

  useEffect(() => {
    localStorage.setItem("recommend", "true");
    init();
  }, []);

  return (
    <RecommendCss>
      <TfiAngleLeft
        className="back"
        onClick={() => {
          navigate(-1);
        }}
      />
      <p className="title">관심분야를</p>
      <p className="title">선택해보세요</p>
      <p className="subtitle">관심분야 위주로 추천해드릴게요!!</p>
      <div className="subjectList">
        {Object.keys(subject).map((e, idx) => {
          return (
            <span
              key={idx}
              className={subject[e] > 0 ? "subject selected" : "subject"}
              onClick={() => {
                let tmp = { ...subject };
                tmp[e] = !tmp[e];
                setSubject(tmp);
                if (subject[e] > 0) deleteLog(subject[e]);
                else addLog(e);
              }}
            >
              {"#" + e}
            </span>
          );
        })}
      </div>
      <div className="bottom">
        <p className="next">선택했어요</p>
        <p
          className="later"
          onClick={() => {
            navigate("/");
          }}
        >
          다음에 선택할게요
        </p>
      </div>
    </RecommendCss>
  );
}

export default Recommend;
