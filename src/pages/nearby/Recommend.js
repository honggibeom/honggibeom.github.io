import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { TfiAngleLeft } from "react-icons/tfi";
import { useNavigate } from "react-router-dom";

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

  useEffect(() => {
    localStorage.setItem("recommend", "true");
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
