import { Route, Routes, Link, useLocation } from "react-router-dom";
import Main from "./pages/blog/main";
import Projects from "./pages/blog/projects";
import NearbyApp from "./pages/nearby/App";
import { IoMailOutline } from "react-icons/io5";
import Posts from "./pages/blog/posts";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { IoClose } from "react-icons/io5";
import { IoMenu } from "react-icons/io5";
import headerImg from "./assets/img/headerImg.jpg";
const AppCss = styled.div`
  overflow: hidden;

  * ::selection {
    color: #ffffff;
    background-color: #a2ded0;
  }

  header {
    max-height: 20vh;
    background: url(${headerImg});
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }
  .header__layer {
    background: linear-gradient(
      to bottom,
      rgba(22, 27, 33, 0) 0,
      rgba(22, 27, 33, 0.01) 1%,
      rgba(22, 27, 33, 0.7) 70%,
      rgba(22, 27, 33, 0.7) 100%
    );
    height: 100%;
  }

  .header__content {
    padding: 40px 20px;
  }

  .blog__name {
    color: #ffffff;
    margin: 0;
    font-size: 32px;
  }
  .blog__description {
    margin-top: 10px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 16px;
    letter-spacing: 0;
    line-height: 1.5;
  }

  .toggle {
    position: fixed;
    top: 40px;
    right: 24px;
    font-size: 36px;
    transition: all 0.2s ease-in-out;
  }
  .open__menu {
    color: rgba(255, 255, 255, 0.7);
    opacity: ${(props) => (props.menu === 0 ? 1 : 0)};
    visibility: ${(props) => (props.menu === 0 ? "visible" : "hidden")};
    z-index: 10;
  }
  .close__menu {
    color: #ffffff;
    z-index: 13;
  }
  .header__content2 {
    position: fixed;
    z-index: 11;
    background: rgba(22, 27, 33, 0.95);
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    transition: all 0.2s ease-in-out;
    padding: 12px 20px;
  }

  .blog__menus {
    font-size: 30px;
    margin: 0;
    padding: 0;
    color: rgba(255, 255, 255, 0.7);
    list-style: none;
  }

  .close__menu,
  .header__content2 {
    opacity: ${(props) => (props.menu === 0 ? 0 : 1)};
    visibility: ${(props) => (props.menu === 0 ? "hidden" : "visible")};
  }

  .blog__menu {
    display: block;
    cursor: pointer;
    text-decoration: none;
    color: inherit;
    padding: 7px 0;
  }
  .blog__menu.active {
    color: #ffffff;
  }
  .blog__menu:hover {
    color: #ffffff;
  }

  .mail {
    text-align: center;
    width: 100%;
    border-radius: 4px;
    padding: 10px 0;
    text-decoration: none;
    cursor: pointer;
    background-color: rgba(255, 255, 255, 0.8);
    color: #000000;
    margin-top: 30px;
  }
  .mail__link {
    color: #000000;
    font-size: 20px;
  }
  .mail__link:visited {
    color: inherit;
  }
  .mail:hover {
    background-color: #ffffff;
  }

  #main {
    height: 80vh;
    display: flex;
    justify-content: center;
  }

  @media only screen and (min-width: 1024px) {
    header {
      max-height: 100vh;
      position: fixed;
      z-index: 10;
      top: 0;
      bottom: 0;
      left: 0;
      width: 30%;
    }
    #main {
      height: 100vh;
      position: static;
      width: 70%;
      padding-left: 30%;
    }
    .header__content {
      position: absolute;
      bottom: 0;
      padding: 40px 40px 34px 40px;
      top: auto;
    }
    .header__content2 {
      visibility: visible;
      opacity: 1;
      padding: 0;
      position: static;
      background: none;
    }
    .blog__menus {
      font-size: 18px;
    }

    .toggle {
      display: none;
    }
    .blog__description {
      font-size: 18px;
      margin-top: 20px;
    }
  }

  @media only screen and (min-width: 1600px) {
    header {
      width: 25%;
    }

    #main {
      width: 75%;
      padding-left: 25%;
    }

    .header__content {
      padding: 40px 70px 34px 60px;
    }
  }
`;
function App() {
  const location = useLocation();
  const description = `Hi I'm honggibeom. I'mfullstack developer`;
  const [menu, setMenu] = useState(0);
  useEffect(() => {
    setMenu(0);
  }, [location]);
  return (
    <AppCss menu={menu}>
      <header>
        <div className="header__layer">
          <div className="header__content">
            <p className="blog__name">Honggibeom's blog</p>
            <p className="blog__description">{description}</p>
            <IoMenu
              className="open__menu toggle"
              onClick={() => {
                setMenu(1);
              }}
            />
            <IoClose
              className="close__menu toggle"
              onClick={() => {
                setMenu(0);
              }}
            />
            <div className="header__content2">
              <ul className="blog__menus">
                <li>
                  <Link
                    to={"/"}
                    className={
                      location.pathname === "/"
                        ? "blog__menu active"
                        : "blog__menu"
                    }
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to={"/projects"}
                    className={
                      location.pathname === "/projects"
                        ? "blog__menu active"
                        : "blog__menu"
                    }
                  >
                    projects
                  </Link>
                </li>
                <li>
                  <Link
                    to={"/posts"}
                    className={
                      location.pathname === "/posts"
                        ? "blog__menu active"
                        : "blog__menu"
                    }
                  >
                    Posts
                  </Link>
                </li>
                <li>
                  <Link
                    to={"/about"}
                    className={
                      location.pathname === "/about"
                        ? "blog__menu active"
                        : "blog__menu"
                    }
                  >
                    About
                  </Link>
                </li>
              </ul>
              <p className="mail">
                <a className="mail__link" href="mailto:hkb8129@gmail.com">
                  <IoMailOutline className="mail__icon" />
                </a>
              </p>
            </div>
          </div>
        </div>
      </header>
      <div id="main">
        <Routes>
          <Route exact path="/Posts" element={<Posts />} />
          <Route exact path="/projects" element={<Projects />} />
          <Route exact path="/nearby/*" element={<NearbyApp />} />
        </Routes>
      </div>
    </AppCss>
  );
}

export default App;
