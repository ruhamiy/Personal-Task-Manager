import axios from "axios";

// custom Axios instance called API - avoid repeating base URL and token logic in every request
const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Add token automatically to requests if user is logged in
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;