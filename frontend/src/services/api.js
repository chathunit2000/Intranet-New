import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
});

// Attach the bearer token (stored after login) to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the token expires/is invalid, bounce back to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export async function login(serviceNo, password) {
  const { data } = await api.post("/login", {
    service_no: serviceNo,
    password,
  });
  localStorage.setItem("token", data.token);
  return data;
}

export async function logout() {
  await api.post("/logout");
  localStorage.removeItem("token");
}

export async function fetchDashboard() {
  const { data } = await api.get("/dashboard");
  return data;
}

export async function fetchAttendanceHistory(page = 1) {
  const { data } = await api.get(`/attendance/history?page=${page}`);
  return data;
}

export default api;
