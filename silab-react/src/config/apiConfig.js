export const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_BASE_URL && !process.env.REACT_APP_API_BASE_URL.includes("https://api.silabntdk.com")) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
    return "http://localhost:8000/api";
  }
  return "https://api.silabntdk.com/api";
};

export const getStorageUrl = () => {
  const apiBase = getApiBaseUrl();
  return apiBase.replace(/\/api\/?$/, "");
};

export const API_URL = getApiBaseUrl();
