import { useState } from "react";
import { Route, Routes, BrowserRouter as Router, Link } from "react-router-dom";
import "./App.css";
import Main from "./pages/blog/main";
function App() {
  const data = {
    nearby: {
      "/": <></>,
    },
    donghangsa: { "/": <></> },
  };

  return (
    <>
      <Router>
        <header>
          <p className="blogName">honggibeom's blog</p>
          <div className="menus">
            <Link to={"/"} className="menu">
              home
            </Link>
            <Link className="menu">portfolio</Link>
            <Link className="menu">posts</Link>
          </div>
        </header>
        <Routes>
          <Route path="/" element={<Main />} />
        </Routes>
      </Router>
      <Router basename={"/nearby"}>
        <Routes>
          <Route path="/" element={<div>hi</div>} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
