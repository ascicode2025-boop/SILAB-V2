import axios from "axios";
import { getAuthHeader } from "./AuthService";
import { getApiBaseUrl } from "../config/apiConfig";

const API_URL = getApiBaseUrl();

export const getInstruments = async () => {
  try {
    const response = await axios.get(`${API_URL}/instruments`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil data alat:", error);
    return { data: [] };
  }
};

export const getInstrumentById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/instruments/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil detail alat:", error);
    throw error?.response?.data || new Error("Gagal mengambil detail alat");
  }
};

export const createInstrument = async (formData) => {
  try {
    // If formData has a file, use multipart/form-data. Otherwise, application/json.
    const isFormData = formData instanceof FormData;
    const headers = {
      ...getAuthHeader(),
      ...(isFormData ? { "Content-Type": "multipart/form-data" } : { "Content-Type": "application/json" }),
    };

    const response = await axios.post(`${API_URL}/instruments`, formData, { headers });
    return response.data;
  } catch (error) {
    console.error("Gagal menambah alat:", error);
    throw error?.response?.data || new Error("Gagal menambah alat");
  }
};

export const updateInstrument = async (id, data) => {
  try {
    const isFormData = data instanceof FormData;
    
    // In Laravel, PUT requests with multipart/form-data often need a workaround. 
    // We can POST to the endpoint and append _method=PUT to the FormData.
    let url = `${API_URL}/instruments/${id}`;
    let method = 'put';
    let payload = data;
    let headers = getAuthHeader();

    if (isFormData) {
      method = 'post';
      data.append('_method', 'PUT');
      headers['Content-Type'] = 'multipart/form-data';
    } else {
      headers['Content-Type'] = 'application/json';
    }

    const response = await axios({
      method: method,
      url: url,
      data: payload,
      headers: headers,
    });
    return response.data;
  } catch (error) {
    console.error("Gagal mengupdate alat:", error);
    throw error?.response?.data || new Error("Gagal mengupdate alat");
  }
};

export const deleteInstrument = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/instruments/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Gagal menghapus alat:", error);
    throw error?.response?.data || new Error("Gagal menghapus alat");
  }
};

export const cancelRental = async (id) => {
  try {
    const response = await axios.put(`${API_URL}/rentals/${id}/cancel`, {}, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Gagal membatalkan peminjaman:", error);
    throw error?.response?.data || new Error("Gagal membatalkan peminjaman");
  }
};
