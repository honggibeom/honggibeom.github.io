import { Route, Routes, Link, useLocation } from "react-router-dom";
import "./App.css";
import Main from "./pages/blog/main";
import NearbyApp from "./pages/nearby/App";
import { IoMailOutline } from "react-icons/io5";
function App() {
  const location = useLocation();

  return (
    <div className="app">
      <header>
        <div className="header__layer">
          <div className="header__content">
            <p className="blog__name">Honggibeom's blog</p>
            <p className="blog__decription">
              Hi I'm honggibeom. I'm fullstack developer Hi I'm honggibeom. I'm
              fullstack developer
            </p>
            <ul className="menus">
              <li>
                <Link
                  to={"/"}
                  className={location.pathname === "/" ? "menu active" : "menu"}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to={"/portfolio"}
                  className={
                    location.pathname === "/portfolio" ? "menu active" : "menu"
                  }
                >
                  Portfolio
                </Link>
              </li>
              <li>
                <Link
                  to={"/posts"}
                  className={
                    location.pathname === "/posts" ? "menu active" : "menu"
                  }
                >
                  Posts
                </Link>
              </li>
              <li>
                <Link
                  to={"/about"}
                  className={
                    location.pathname === "/about" ? "menu active" : "menu"
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
      </header>
      <div id="main">
        <Routes>
          <Route exact path="/" element={<></>} />
          <Route exact path="/nearby" element={<NearbyApp />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
