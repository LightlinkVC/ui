import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { authStore } from "../../store/AuthStore";
import { Link, useNavigate  } from "react-router-dom";
import "./styles/Auth.css";

const Register: React.FC = observer(() => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authStore.register(username, password);
      
      navigate('/');
    } catch (err) {
      console.error("Registration error:", err);
      
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    }
  };

  return (
    <div className="content_wrapper">
      <div className="login_window">
        <form onSubmit={handleSubmit} className="form_wrapper">
          {error && <div className="error_message">{error}</div>}
          
          <span className="login_header">Sign Up</span>

          <div className="form_text_input_wrapper">
            <input
              type="text"
              className="form_text_input"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form_text_input_wrapper">
            <input
              type="password"
              className="form_text_input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="login_button_wrapper">
            <button type="submit" className="login_button">
              CREATE ACCOUNT
            </button>
          </div>

          <div className="have_no_acc_wrapper">
            <span className="have_no_acc_text">
              Already have an account?{" "}
              <Link to="/login" className="non_ref signup_link">
                Sign In
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
});

export default Register;