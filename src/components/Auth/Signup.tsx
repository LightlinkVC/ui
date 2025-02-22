import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { authStore } from "../../store/AuthStore";

const Register: React.FC = observer(() => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Вызываем метод регистрации
      await authStore.register(username, password);
      if (!authStore.isAuthenticated) {
        setError("Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("Registration failed");
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
      <button type="submit">Register</button>
      {error && <p>{error}</p>}
    </form>
  );
});

export default Register;