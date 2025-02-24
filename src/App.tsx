import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Layout from "./pages/Layout/Layout"
import LoginPage from "./pages/LoginPage/LoginPage"
import SignupPage from "./pages/SignupPage/SignupPage"
import MainPage from "./pages/MainPage/MainPage"
import FriendRequestPage from "./pages/FriendRequestPage/FriendRequestPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />} >
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/main" element={<MainPage />} />
          <Route path="/add-friend" element={<FriendRequestPage />} />
          <Route index element={<MainPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
