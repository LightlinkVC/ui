import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Layout from "./pages/Layout/Layout"
import LoginPage from "./pages/LoginPage/LoginPage"
import SignupPage from "./pages/SignupPage/SignupPage"
import MainPage from "./pages/MainPage/MainPage"
import FriendRequestPage from "./pages/FriendRequestPage/FriendRequestPage";
import VideoPage from "./pages/VideoPage/VideoPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />} >
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/main" element={<MainPage />} />
          <Route path="/add-friend" element={<FriendRequestPage />} />
          <Route path="/room/:room_id" element={<VideoPage />} />
          <Route index element={<MainPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
