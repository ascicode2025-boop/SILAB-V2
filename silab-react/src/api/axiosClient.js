import axios from "axios";
import { getToken } from "../services/AuthService";
import { getApiBaseUrl } from "../config/apiConfig";

const axiosClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default axiosClient;

// Interceptor untuk response: jika 401 (Unauthorized), tampilkan pop up sesi habis
import { logout } from "../services/AuthService";

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.log('401 detected, showAppPopup:', !!window.showAppPopup);
      // Tampilkan pop up menggunakan window.showAppPopup jika tersedia
      if (window.showAppPopup) {
        window.showAppPopup({
          title: "Sesi Login Habis",
          message: "Sesi login Anda telah habis. Silakan login kembali untuk melanjutkan.",
          type: "error",
        });
        // Setelah user menutup pop up, logout dan redirect ke login
        const handleClose = () => {
          logout();
          window.location.href = "/login";
        };
        // Patch: inject handler ke onClose CustomPopup
        // Tunggu pop up tertutup, lalu redirect
        // Solusi: polling state popup
        let interval = setInterval(() => {
          const popup = document.querySelector(".modal.show");
          if (!popup) {
            clearInterval(interval);
            handleClose();
          }
        }, 300);
      } else {
        // Fallback: alert biasa
        alert("Sesi login Anda telah habis. Silakan login kembali.");
        logout();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);
