import { useState } from "react";
import { Route, Routes, BrowserRouter as Router, Link } from "react-router-dom";
import "./App.css";
import Main from "./pages/blog/main";
import NearbyApp from "./pages/nearby/App";
function App() {
  return (
    <div className="app">
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
          <Route exact path="/" element={<Main />} />
        </Routes>
      </Router>
      <NearbyApp />
    </div>
  );
}

export default App;
