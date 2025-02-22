import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Layout from "./pages/Layout/Layout"
import LoginPage from "./pages/LoginPage/LoginPage"
import SignupPage from "./pages/SignupPage/SignupPage"
import MainPage from "./pages/MainPage/MainPage"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />} >
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route index element={<MainPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
