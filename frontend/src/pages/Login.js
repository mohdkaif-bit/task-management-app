import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom"; // ✅ import useNavigate
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import "../pages/Auth.css";

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate(); // ✅ initialize navigate
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", form);
      console.log("Login response:", res.data);

      const token = res.data.access_token || res.data.token;
      if (!token) throw new Error("Token not found in response");

      login(token); // store token in context/localStorage

      navigate("/dashboard"); // ✅ navigate to dashboard after login
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message);
      setError("Invalid username or password");
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-box">
        <h2>Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        {error && <p className="error">{error}</p>}
        <button type="submit">Sign In</button>
        <p>
          Don’t have an account? <Link to="/register" className="link">Register here</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
