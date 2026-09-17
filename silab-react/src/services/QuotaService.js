import axios from "axios";

import { getAuthHeader } from "./AuthService"; 
import { getApiBaseUrl } from "../config/apiConfig";

const API_URL = getApiBaseUrl();

export const getMonthlyQuota = async (month, year, jenisAnalisis) => {
  try {
    const response = await axios.get(`${API_URL}/calendar-quota`, {
      params: {
        month: month,
        year: year,
        jenis_analisis: jenisAnalisis,
        _t: new Date().getTime() // Cache busting
      },
      headers: {
        ...getAuthHeader(),
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil data kuota:", error);
    throw error;
  }
};

export const updateQuota = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/update-quota`, data, {
    
       headers: getAuthHeader() 
    });
    return response.data;
  } catch (error) {
    console.error("Gagal update kuota:", error);

  
    if (error.response && error.response.status === 401) {
        alert("Gagal: Sesi berakhir atau Token tidak valid. Silakan Logout dan Login ulang.");
    }
    
    throw error;
  }
};