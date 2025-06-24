import { Route, Routes, BrowserRouter as Router, Link } from "react-router-dom";
import "./App.css";
import Main from "./pages/blog/main";
import NearbyApp from "./pages/nearby/App";
function App() {
  return (
    <div className="app">
      <header>
        <p className="blogName">honggibeom's blog</p>
        <div className="menus">
          <a href={"/"} className="menu">
            home
          </a>
          <a className="menu">portfolio</a>
          <a className="menu">posts</a>
        </div>
      </header>
      <Router>
        <Routes>
          <Route exact path="/" element={<Main />} />
        </Routes>
      </Router>
      <NearbyApp />
    </div>
  );
}

export default App;
