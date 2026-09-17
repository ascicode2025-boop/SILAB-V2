import axios from "axios";
import { getAuthHeader } from "./AuthService";
import { getApiBaseUrl } from "../config/apiConfig";

const API_URL = getApiBaseUrl();

export const getUnreadNotifications = async () => {
  const response = await axios.get(`${API_URL}/notifications/unread`, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const getAllNotifications = async (page = 1, perPage = 10) => {
  const response = await axios.get(`${API_URL}/notifications`, {
    params: { page, per_page: perPage },
    headers: getAuthHeader()
  });
  return response.data;
};

export const markNotificationAsRead = async (notificationId) => {
  const response = await axios.put(`${API_URL}/notifications/${notificationId}/read`, {}, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await axios.put(`${API_URL}/notifications/read-all`, {}, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const deleteNotification = async (notificationId) => {
  const response = await axios.delete(`${API_URL}/notifications/${notificationId}`, {
    headers: getAuthHeader()
  });
  return response.data;
};
