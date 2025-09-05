import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../pages/Auth.css";

function Register() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", form);
      setMsg("Registered successfully! You can login now.");
    } catch (err) {
      setMsg("Registration failed: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-box">
        <h2>Register</h2>
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
        {msg && <p>{msg}</p>}
        <button type="submit">Sign Up</button>
        <p>
          Already have an account? <Link to="/login" className="link">Login here</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
