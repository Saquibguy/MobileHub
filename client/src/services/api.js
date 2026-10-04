import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
});

// Attach JWT to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("mh_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Global 401 handling
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("mh_token");
      localStorage.removeItem("mh_user");
    }

    return Promise.reject(err);
  }
);

export default api;