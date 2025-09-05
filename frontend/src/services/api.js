import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: { "Content-Type": "application/json" },
});

export const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export default api;
