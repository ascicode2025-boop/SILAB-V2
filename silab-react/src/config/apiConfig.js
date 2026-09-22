export const getApiBaseUrl = () => {
  const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  if (!isLocal) {
    return "https://api.silabntdk.com/api";
  }

  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  return "http://localhost:8000/api";
};

export const getStorageUrl = () => {
  const apiBase = getApiBaseUrl();
  return apiBase.replace(/\/api\/?$/, "");
};

export const API_URL = getApiBaseUrl();
