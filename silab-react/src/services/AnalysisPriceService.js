import axios from "axios";
import { getApiBaseUrl } from "../config/apiConfig";

const API_URL = getApiBaseUrl();

// Mendapatkan daftar harga analisis dari backend
export const getAnalysisPrices = async () => {
  const response = await axios.get(`${API_URL}/analysis-prices-grouped`);
  return response.data;
};
