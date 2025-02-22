import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { authStore } from "../../store/AuthStore";

const Login: React.FC = observer(() => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authStore.login(username, password);
      if (!authStore.isAuthenticated) {
        setError("Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Username:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit">Login</button>
      {error && <p>{error}</p>}
    </form>
  );
});

export default Login;