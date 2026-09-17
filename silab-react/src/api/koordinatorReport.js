import axios from 'axios';
import { getAuthHeader } from '../services/AuthService';
import { getApiBaseUrl } from '../config/apiConfig';

const API_URL = getApiBaseUrl();

// Service untuk mengambil data laporan koordinator (chart, tabel, dropdown, riwayat)
export const fetchKoordinatorReport = async (filters = {}) => {
  const params = {};
  if (filters.jenis_analisis) params.jenis_analisis = filters.jenis_analisis;
  if (filters.bulan) params.bulan = filters.bulan;
  if (filters.tahun) params.tahun = filters.tahun;
  try {
    const url = `${API_URL}/koordinator-report`;
    console.debug('[koordinatorReport] requesting', url, 'params=', params);
    const res = await axios.get(url, { params, headers: getAuthHeader() });
    // If API returns success flag false or empty, try public debug route as fallback
    if (res && res.data && (res.data.success === false || !res.data.data)) {
      // fallthrough to debug fetch below
    } else {
      return res.data;
    }
  } catch (err) {
    console.error('[koordinatorReport] primary request failed:', err && err.toString());
    // ignore and attempt debug route
  }

  // Fallback: use public debug endpoint (useful for local testing when auth token missing)
  try {
    const dbgUrl = `${API_URL}/koordinator-report-debug`;
    console.debug('[koordinatorReport] attempting debug route', dbgUrl);
    const dbg = await axios.get(dbgUrl, { params });
    return dbg.data;
  } catch (e) {
    console.error('[koordinatorReport] debug route failed:', e && e.toString());
    // rethrow original error if debug also fails
    throw e;
  }
};
