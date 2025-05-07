import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Layout from "./pages/Layout/Layout"
import LoginPage from "./pages/LoginPage/LoginPage"
import SignupPage from "./pages/SignupPage/SignupPage"
// import MainPage from "./pages/MainPage/MainPage"
import FriendRequestPage from "./pages/FriendRequestPage/FriendRequestPage";
// import VideoPage from "./pages/VideoPage/VideoPage";

import ChatWithVideo from "./pages/MainPage/ChatWithVideo"

import TestMainPage from "./pages/MainPage/TestMainPage"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />} >
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/main" element={<TestMainPage />} /> 
          <Route path="/add-friend" element={<FriendRequestPage />} />
          {/* <Route path="/room/:room_id" element={<VideoPage />} /> */}
          <Route path="/chat/:groupId" element={<ChatWithVideo centrifugoUrl="ws://localhost:8000/connection/websocket" />} />
          <Route index element={<TestMainPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
