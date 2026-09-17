import axios from "axios";
import { getAuthHeader } from "./AuthService";
import { getApiBaseUrl } from "../config/apiConfig";

const API_URL = getApiBaseUrl();

export const getRentals = async () => {
  try {
    const response = await axios.get(`${API_URL}/rentals`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil data peminjaman:", error);
    return { data: [] };
  }
};

export const handoverRental = async (id, data) => {
  try {
    const response = await axios.put(
      `${API_URL}/rentals/${id}/handover`,
      data,
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error("Gagal menyerahkan alat:", error);
    throw error?.response?.data || new Error("Gagal menyerahkan alat");
  }
};

export const readyPickupRental = async (id) => {
  try {
    const response = await axios.put(
      `${API_URL}/rentals/${id}/ready-pickup`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error("Gagal menandai siap diambil:", error);
    throw error?.response?.data || new Error("Gagal menandai siap diambil");
  }
};

export const returnRental = async (id, items, denda = 0) => {
  try {
    const response = await axios.put(
      `${API_URL}/rentals/${id}/return`,
      { items, denda },
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error("Gagal mengembalikan alat:", error);
    throw error?.response?.data || new Error("Gagal mengembalikan alat");
  }
};
