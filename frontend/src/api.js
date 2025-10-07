import axios from "axios";

// Use relative base URL so the same frontend works across tenant domains/subdomains
const API_BASE_URL = "/api";

export const getAuthToken = () => localStorage.getItem("admin_token") || "";
export const setAuthToken = (token) => {
  localStorage.setItem("admin_token", token);
  // also set default header for immediate requests
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};
export const clearAuthToken = () => {
  localStorage.removeItem("admin_token");
  delete api.defaults.headers.common["Authorization"];
};

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;


