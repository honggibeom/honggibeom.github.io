import styled from "styled-components";
import AWS from "../../assets/img/AWS.svg";
import CSS from "../../assets/img/CSS3.svg";
import FLASK from "../../assets/img/Flask.svg";
import HTML5 from "../../assets/img/HTML5.svg";
import JAVA from "../../assets/img/Java.svg";
import JAVASCRIPT from "../../assets/img/JavaScript.svg";
import MYSQL from "../../assets/img/MySQL.svg";
import NODEJS from "../../assets/img/Node.js.svg";
import PYTHON from "../../assets/img/Python.svg";
import TYPESCRIPT from "../../assets/img/TypeScript.svg";
import REACT from "../../assets/img/React.svg";
import SPRING from "../../assets/img/Spring.svg";
const MainCss = styled.div`
  .banner {
    width: 100%;
    padding-top: 80px;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: #9bc7f3;
    color: #000000;
  }

  .name {
    font-size: 80px;
  }

  .stacks {
    display: flex;
    align-items: center;
    justify-content: space-around;
    width: 100%;
  }

  .stack {
    color: #000000;
    text-align: center;
    background: #ffffff;
    padding: 10px 20px;
    border-radius: 12px;
  }

  .stack > img {
    width: 50px;
    height: 50px;
  }

  .stack > p {
    margin: 0;
    margin-top: 5px;
  }
`;

function Main() {
  const stacks = {
    Java: JAVA,
    Python: PYTHON,
    SpringBoot: SPRING,
    NodeJS: NODEJS,
    Aws: AWS,
    MySql: MYSQL,
    HTML5: HTML5,
    CSS: CSS,
    JavaScript: JAVASCRIPT,
    React: REACT,
    TypeScript: TYPESCRIPT,
    Flask: FLASK,
  };
  return (
    <MainCss>
      <div className="banner">
        <p className="name">WELCOME I'M GIBEOM HONG</p>
        <p className="name">FULL STACK DEVELOPER</p>
        <div className="stacks">
          {Object.keys(stacks).map((e, idx) => {
            return (
              <div className="stack">
                <img src={stacks[e]} key={idx} />
                <p>{e}</p>
              </div>
            );
          })}
        </div>
      </div>
    </MainCss>
  );
}

export default Main;
