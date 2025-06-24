import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import Search from "./Search";
import Map from "./Map";
import Profile from "./Profile";
import Find from "./Find";
import Alarm from "./Alarm";
import MyPage from "./MyPage";
import Notice from "./Notice";
import UserService from "./UserService";
import Policy from "./Policy";
import AccountManage from "./AccountManage";
import DeleteAccount from "./DeleteAccount";
import Detail from "./Detail";
import Report from "./Report";
import styled from "styled-components";
import Main from "./Main";
import "./Font/Pretendard/web/static/pretendard.css";
import "./Font/Pretendard/web/static/pretendard-subset.css";
import EventList from "./EventList";
import EventReviewList from "./EventReviewList";
import Payment from "./Payment";
import ReserveTicket from "./ReserveTicket";
import Bookmark from "./Bookmark";
import ReserveTicketDetail from "./ReserveTicketDetail";
import { SuccessPage } from "./TossPayments/Success";
import { FailPage } from "./TossPayments/Fail";
import Policys from "./Policys";
import AlarmSetting from "./AlarmSetting";
import Recommend from "./Recommend";
import Order from "./Order";
import EventReviewCreateForm from "./EventReviewCreateForm";

const AppCss = styled.div`
  width: 100vw;
  display: flex;
  justify-content: center;
  margin: 0;
  padding: 0;
  @supports (-webkit-touch-callout: none) {
    height: -webkit-fill-available;
  }

  * {
    font-family: Pretendard !important;
    letter-spacing: -0.24px;
    -webkit-user-select: none !important;
    -moz-user-select: none !important;
    -ms-user-select: none !important;
    user-select: none !important;
    -webkit-tap-highlight-color: transparent !important;
    -ms-overflow-style: none;
    ::-webkit-scrollbar {
      display: none;
    }
  }
  @media (min-width: 450px) {
    .nearbyapp {
      border: 1px solid #00000022;
      border-radius: 8px;
    }
  }
`;

// ------------------------------------------------------------------ //
function App() {
  useEffect(() => {
    let flag1 = true;
    window.addEventListener("blur", (e) => {
      if (flag1) {
        flag1 = false;
      } else return;
    });
  }, []);

  return (
    <Router basename={"nearby"}>
      <AppCss>
        <div className="nearbyapp">
          <Routes>
            <Route exact path="/" element={<Main />} />
            <Route path="/signup" element={<SignUp />} /> {/*회원가입*/}
            <Route path="/map" element={<Map />} />
            <Route path="/event-review" element={<EventReviewList />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/signIn" element={<SignIn />} />
            <Route path="/eventList" element={<EventList theme={false} />} />
            {/*검색창*/}
            <Route path="/search" element={<Search />} />
            {/*비밀번호 찾기*/}
            <Route path="/find/passwrod" element={<Find mode={"pw"} />} />
            {/*아이디 찾기*/}
            <Route path="/find/id" element={<Find mode={"id"} />} />
            <Route path="/alarm" element={<Alarm />} />
            {/* 마이페이지 */}
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/notice" element={<Notice />} />
            {/* 설정 -> 공지사항 */}
            <Route path="/user-service" element={<UserService />} />
            {/* 설정 -> 고객센터 */}
            <Route path="/alarm-setting" element={<AlarmSetting />} />
            <Route path="/policys" element={<Policys />} />
            <Route path="/tos" element={<Policy tos={0} />} />
            <Route path="/policy" element={<Policy tos={1} />} />
            {/* 설정 -> 약관 및 정책 */}
            <Route path="/accountmanage" element={<AccountManage />} />
            <Route path="/delete-account" element={<DeleteAccount />} />
            <Route path="/report" element={<Report />} />
            {/* 이벤트 상세 관련 추가 파일 */}
            <Route path="/event/detail" element={<Detail />} />
            <Route path="/event-review-form" element={<EventReviewCreateForm />} />
            {/* 이벤트 상세 */}
            <Route path="/payment" element={<Payment />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/fail" element={<FailPage />} />
            {/* 결제 */}
            <Route path="/bookmark" element={<Bookmark />} />
            {/* 찜 내역 */}
            <Route path="/reserveTicket" element={<ReserveTicket />} />
            <Route path="/recommend" element={<Recommend />} />
            {/* 티켓 예매내역 */}
            <Route
              path="/ReserveTicketDetail"
              element={<ReserveTicketDetail />}
            />
            <Route path="/order" element={<Order />} />
            {/* 티켓 예매내역 */}
          </Routes>
        </div>
      </AppCss>
    </Router>
  );
}

export default App;
