import axios from "axios";
import { getAuthHeader } from "./AuthService";
import { getApiBaseUrl } from "../config/apiConfig";

const API_URL = getApiBaseUrl();

// Get all rentals (Klien gets own, Koordinator/Teknisi gets all)
export const getRentals = async () => {
  try {
    const response = await axios.get(`${API_URL}/rentals`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil data peminjaman alat:", error);
    return { data: [] };
  }
};

// Get single rental detail
export const getRentalById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/rentals/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data?.data || null;
  } catch (error) {
    console.error("Gagal mengambil detail peminjaman:", error);
    return null;
  }
};

// Create new rental application
export const createRental = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/rentals`, formData, {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Gagal mengajukan peminjaman:", error);
    throw error?.response?.data || new Error("Gagal mengajukan peminjaman");
  }
};

// Upload payment proof
export const uploadPaymentProof = async (id, formData) => {
  try {
    const response = await axios.post(`${API_URL}/rentals/${id}/payment`, formData, {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Gagal mengunggah bukti pembayaran:", error);
    throw error?.response?.data || new Error("Gagal mengunggah bukti pembayaran");
  }
};

// Verify rental (Koordinator)
export const verifyRental = async (id, status, catatan) => {
  try {
    const response = await axios.put(
      `${API_URL}/rentals/${id}/verify`,
      { status, catatan_koordinator: catatan },
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error("Gagal memverifikasi peminjaman:", error);
    throw error?.response?.data || new Error("Gagal memverifikasi peminjaman");
  }
};

// Verify payment (Koordinator)
export const verifyPayment = async (id) => {
  try {
    const response = await axios.put(`${API_URL}/rentals/${id}/verify-payment`, {}, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Gagal memverifikasi pembayaran:", error);
    throw error?.response?.data || new Error("Gagal memverifikasi pembayaran");
  }
};

// Return instruments (Teknisi)
export const returnInstruments = async (id, items) => {
  try {
    const response = await axios.put(
      `${API_URL}/rentals/${id}/return`,
      { items },
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error("Gagal mencatat pengembalian alat:", error);
    throw error?.response?.data || new Error("Gagal mencatat pengembalian alat");
  }
};

// Client submits return request
export const submitReturnRequest = async (id, data) => {
  try {
    const headers = getAuthHeader();
    if (data instanceof FormData) {
      headers['Content-Type'] = 'multipart/form-data';
    }
    const response = await axios.post(`${API_URL}/rentals/${id}/return-request`, data, {
      headers: headers,
    });
    return response.data;
  } catch (error) {
    console.error("Gagal mengajukan pengembalian alat:", error);
    throw error?.response?.data || new Error("Gagal mengajukan pengembalian alat");
  }
};

// Client cancels rental
export const cancelRental = async (id) => {
  try {
    const response = await axios.put(`${API_URL}/rentals/${id}/cancel`, {}, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Gagal membatalkan peminjaman alat:", error);
    throw error?.response?.data || new Error("Gagal membatalkan peminjaman alat");
  }
};

// Delete rental
export const deleteRental = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/rentals/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Gagal menghapus peminjaman alat:", error);
    throw error?.response?.data || new Error("Gagal menghapus peminjaman alat");
  }
};

// Ambil daftar tanggal ditutup koordinator
export const getClosedRentalDates = async (month = null, year = null) => {
  try {
    let url = `${API_URL}/rentals/closed-dates`;
    if (month && year) {
      url += `?month=${month}&year=${year}`;
    }
    const response = await axios.get(url, {
      headers: getAuthHeader(),
    });
    return response.data?.data || [];
  } catch (error) {
    console.error("Gagal mengambil tanggal ditutup:", error);
    return [];
  }
};

// Koordinator menutup tanggal
export const closeRentalDate = async (tanggal, alasan = "") => {
  try {
    const response = await axios.post(`${API_URL}/rentals/closed-dates`, {
      tanggal,
      alasan,
    }, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Gagal menutup tanggal peminjaman:", error);
    throw error?.response?.data || new Error("Gagal menutup tanggal peminjaman");
  }
};

// Koordinator membuka kembali tanggal
export const openRentalDate = async (tanggal) => {
  try {
    const response = await axios.delete(`${API_URL}/rentals/closed-dates/${tanggal}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Gagal membuka kembali tanggal peminjaman:", error);
    throw error?.response?.data || new Error("Gagal membuka kembali tanggal peminjaman");
  }
};

