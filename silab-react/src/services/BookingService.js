import axios from "axios";
import { getAuthHeader } from "./AuthService";
import { getApiBaseUrl } from "../config/apiConfig";

const API_URL = getApiBaseUrl();

// Add axios interceptor to handle 401 errors globally
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If the failing request is an auth endpoint (login/register/etc.),
      // don't force a redirect to /login — that causes the login page to
      // reload when the login request itself returns 401.
      const reqUrl = (error.config && (error.config.url || "")) || "";
      if (reqUrl.includes("/login") || reqUrl.includes("/register") || reqUrl.includes("/send-otp") || reqUrl.includes("/reset-password")) {
        return Promise.reject(error);
      }

      // Token expired or invalid - redirect to login for other requests
      console.error("Session expired. Redirecting to login...");
      alert("Sesi login Anda telah habis atau tidak valid. Silakan login kembali.");
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// --- 1. BUAT BOOKING BARU (KLIEN) ---
export const createBooking = async (bookingData) => {
  try {
    const response = await axios.post(`${API_URL}/bookings`, bookingData, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Gagal membuat booking:", error);

    if (error.response) {
      throw error.response.data;
    } else if (error.request) {
      throw new Error("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.");
    } else {
      throw new Error("Terjadi kesalahan sistem.");
    }
  }
};

// --- 2. LIHAT RIWAYAT SAYA (KLIEN) ---
export const getUserBookings = async () => {
  try {
    const response = await axios.get(`${API_URL}/bookings`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil riwayat:", error);

    if (error.response) {
      throw error.response.data;
    } else if (error.request) {
      throw new Error("Tidak dapat terhubung ke server.");
    } else {
      throw new Error("Terjadi kesalahan sistem saat mengambil data.");
    }
  }
};

// --- 3. LIHAT SEMUA BOOKING (TEKNISI) ---
export const getAllBookings = async () => {
  try {
    const response = await axios.get(`${API_URL}/bookings/all`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil semua data:", error);

    if (error.response) {
      throw error.response.data;
    } else {
      throw new Error("Gagal mengambil data verifikasi.");
    }
  }
};

// --- 3b. GET BOOKING BY ID ---
export const getBookingById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/bookings/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error(`Gagal mengambil booking id=${id}:`, error);
    if (error.response) throw error.response.data;
    throw new Error("Gagal mengambil booking.");
  }
};

// --- 4. UPDATE STATUS (SETUJU/TOLAK) ---
export const updateBookingStatus = async (id, statusOrPayload, alasan = null) => {
  try {
    let payload;
    // Always add status_updated_at (tanggal hari ini)
    const status_updated_at = new Date().toISOString();
    // Support both old (string) and new (object) usage
    if (typeof statusOrPayload === "object") {
      payload = { ...statusOrPayload, status_updated_at };
    } else {
      payload = { status: statusOrPayload, status_updated_at };
      if (alasan) {
        payload.alasan_penolakan = alasan;
      }
    }

    console.log("Sending update booking status request:", {
      id,
      payload,
      url: `${API_URL}/bookings/${id}/status`,
    });

    const response = await axios.put(`${API_URL}/bookings/${id}/status`, payload, {
      headers: getAuthHeader(),
    });
    console.log("Status update success:", response.data);
    return response.data;
  } catch (error) {
    console.error("Gagal update status:", error);
    console.error("Error response:", error.response?.data);
    console.error("Error status:", error.response?.status);
    if (error.response) {
      throw error;
    } else {
      throw new Error("Gagal update status pesanan.");
    }
  }
};

// Alias agar konsisten dengan komponen lain
export const updateStatus = updateBookingStatus;

// --- 5. UPDATE HASIL ANALISIS (SIMPAN DRAFT) ---
export const updateAnalysisResult = async (id, data) => {
  try {
    const headers = getAuthHeader();
    console.log("Update analysis result - Headers:", headers);
    console.log("Update analysis result - Data:", data);

    const response = await axios.put(`${API_URL}/bookings/${id}/results`, data, {
      headers: headers,
    });
    return response.data;
  } catch (error) {
    console.error("Gagal menyimpan hasil analisis:", error);

    if (error.response) {
      console.error("Error response:", error.response);
      console.error("Error status:", error.response.status);
      console.error("Error data:", error.response.data);

      // Jika 401, token mungkin expired
      if (error.response.status === 401) {
        console.error("Token expired atau tidak valid! User perlu login ulang.");
      }

      throw error.response.data;
    } else {
      throw new Error("Gagal menyimpan data analisis.");
    }
  }
};

// --- 6. FINALIZE ANALISIS (SELESAIKAN) ---
export const finalizeAnalysis = async (id) => {
  try {
    const response = await axios.put(
      `${API_URL}/bookings/${id}/finalize`,
      {},
      {
        headers: getAuthHeader(),
      },
    );
    return response.data;
  } catch (error) {
    console.error("Gagal menyelesaikan analisis:", error);

    if (error.response) {
      throw error.response.data;
    } else {
      throw new Error("Gagal menyelesaikan analisis.");
    }
  }
};

// --- 7. KIRIM KE KOORDINATOR ---
export const kirimKeKoordinator = async (id) => {
  try {
    const response = await axios.put(
      `${API_URL}/bookings/${id}/kirim-koordinator`,
      {},
      {
        headers: getAuthHeader(),
      },
    );
    return response.data;
  } catch (error) {
    console.error("Gagal kirim ke koordinator:", error);

    if (error.response) {
      throw error.response.data;
    } else {
      throw new Error("Gagal kirim hasil analisis ke koordinator.");
    }
  }
};

// Upload PDF generated by teknisi and send to koordinator
export const uploadPdfAndKirim = async (id, file, onUploadProgress = null) => {
  try {
    const form = new FormData();
    // Pastikan file dikirim dengan nama dan type yang benar
    const filename = file.name || "hasil_analisis.pdf";
    form.append("pdf", file, filename);

    const config = {
      headers: {
        ...getAuthHeader(),
        Accept: "application/json",
        // Jangan set Content-Type, biar browser yang set
      },
      timeout: 60000,
    };

    if (typeof onUploadProgress === "function") {
      config.onUploadProgress = (progressEvent) => {
        try {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          onUploadProgress(percentCompleted);
        } catch (e) {
          // ignore progress calc errors
        }
      };
    }

    const response = await axios.post(`${API_URL}/bookings/${id}/upload-pdf`, form, config);
    return response.data;
  } catch (error) {
    console.error("Gagal upload pdf:", error);
    if (error.response) throw error.response.data;
    throw new Error("Gagal upload PDF.");
  }
};

// --- 8. VERIFIKASI KOORDINATOR ---
export const verifikasiKoordinator = async (id) => {
  try {
    const response = await axios.put(
      `${API_URL}/bookings/${id}/verifikasi`,
      {},
      {
        headers: getAuthHeader(),
      },
    );
    return response.data;
  } catch (error) {
    console.error("Gagal verifikasi:", error);

    if (error.response) {
      throw error.response.data;
    } else {
      throw new Error("Gagal verifikasi hasil analisis.");
    }
  }
};

// --- 9. BATALKAN PESANAN (KLIEN) ---
export const cancelBooking = async (id) => {
  try {
    const response = await axios.put(
      `${API_URL}/bookings/${id}/cancel`,
      {},
      {
        headers: getAuthHeader(),
      },
    );
    return response.data;
  } catch (error) {
    console.error("Gagal membatalkan pesanan:", error);

    if (error.response) {
      throw error.response.data;
    } else {
      throw new Error("Gagal membatalkan pesanan.");
    }
  }
};

// --- 10. HAPUS BOOKING (HANYA STATUS DIBATALKAN) ---
export const deleteBooking = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/bookings/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Gagal menghapus booking:", error);
    if (error.response) {
      throw error.response.data;
    } else {
      throw new Error("Gagal menghapus booking.");
    }
  }
};

// --- 11. DOWNLOAD PDF ---
export const downloadBookingPdf = async (id) => {
  try {
    // Try stored PDF first
    try {
      const response = await axios.get(`${API_URL}/bookings/${id}/pdf`, {
        headers: getAuthHeader(),
        responseType: "blob",
      });
      return { data: response.data, generated: false };
    } catch (err) {
      // If stored PDF missing, fallback to generated
      const gen = await axios.get(`${API_URL}/bookings/${id}/pdf-generated`, {
        headers: getAuthHeader(),
        responseType: "blob",
      });
      return { data: gen.data, generated: true };
    }
  } catch (error) {
    console.error("Gagal mendownload PDF:", error);
    if (error.response) throw error.response.data;
    throw new Error("Gagal mendownload PDF.");
  }
};

// --- 12. KIRIM KE KEPALA (DARI KOORDINATOR) ---
export const kirimKeKepala = async (id) => {
  try {
    const response = await axios.put(
      `${API_URL}/bookings/${id}/kirim-kepala`,
      {},
      {
        headers: getAuthHeader(),
      },
    );
    return response.data;
  } catch (error) {
    console.error("Gagal kirim ke kepala:", error);
    if (error.response) throw error.response.data;
    throw new Error("Gagal kirim ke kepala.");
  }
};

// --- 13. APPROVE BY KEPALA ---
export const approveByKepala = async (id) => {
  try {
    const response = await axios.put(
      `${API_URL}/bookings/${id}/approve-by-kepala`,
      {},
      {
        headers: getAuthHeader(),
      },
    );
    return response.data;
  } catch (error) {
    console.error("Gagal approve by kepala:", error);
    if (error.response) throw error.response.data;
    throw new Error("Gagal approve by kepala.");
  }
};

// --- 14. UPLOAD PAYMENT PROOF (CLIENT) ---
export const uploadPaymentProof = async (id, file) => {
  try {
    const fd = new FormData();
    fd.append("file", file, file.name || "bukti_pembayaran");
    const response = await axios.post(`${API_URL}/bookings/${id}/upload-payment-proof`, fd, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Gagal upload bukti pembayaran:", error);
    if (error.response) throw error.response.data;
    throw new Error("Gagal upload bukti pembayaran.");
  }
};

// Invoices
export const getInvoices = async () => {
  try {
    const response = await axios.get(`${API_URL}/invoices`, { headers: getAuthHeader() });
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil invoices:", error);
    if (error.response) throw error.response.data;
    throw new Error("Gagal mengambil invoices.");
  }
};

export const createInvoice = async (payload) => {
  try {
    const response = await axios.post(`${API_URL}/invoices`, payload, { headers: getAuthHeader() });
    return response.data;
  } catch (error) {
    console.error("Gagal membuat invoice:", error);
    if (error.response) throw error.response.data;
    throw new Error("Gagal membuat invoice.");
  }
};

export const uploadInvoicePaymentProof = async (id, file) => {
  try {
    const fd = new FormData();
    fd.append("file", file, file.name);
    const response = await axios.post(`${API_URL}/invoices/${id}/upload-payment-proof`, fd, { headers: getAuthHeader() });
    return response.data;
  } catch (error) {
    console.error("Gagal upload invoice proof:", error);
    if (error.response) throw error.response.data;
    throw new Error("Gagal upload invoice proof.");
  }
};

// --- 15. SEND INVOICE PDF VIA EMAIL ---
export const sendInvoiceEmail = async (invoiceId) => {
  try {
    const response = await axios.post(
      `${API_URL}/invoices/${invoiceId}/send-email`,
      {},
      {
        headers: getAuthHeader(),
      },
    );
    return response.data;
  } catch (error) {
    console.error("Gagal mengirim invoice via email:", error);
    if (error.response) throw error.response.data;
    throw new Error("Gagal mengirim invoice via email.");
  }
};

export const createInvoiceFromBooking = async (bookingId) => {
  try {
    const response = await axios.post(`${API_URL}/invoices/from-booking`, { booking_id: bookingId }, { headers: getAuthHeader() });
    return response.data;
  } catch (error) {
    console.error("Gagal membuat invoice dari booking:", error);
    if (error.response) throw error.response.data;
    throw new Error("Gagal membuat invoice dari booking.");
  }
};

export const confirmInvoicePayment = async (id) => {
  try {
    const response = await axios.put(`${API_URL}/invoices/${id}/confirm-payment`, {}, { headers: getAuthHeader() });
    return response.data;
  } catch (error) {
    console.error("Gagal konfirmasi payment invoice:", error);
    if (error.response) throw error.response.data;
    throw new Error("Gagal konfirmasi payment invoice.");
  }
};

export const sendBookingResultEmail = async (bookingId) => {
  try {
    const response = await axios.post(`${API_URL}/bookings/${bookingId}/send-result-email`, {}, { headers: getAuthHeader() });
    return response.data;
  } catch (error) {
    console.error("Gagal mengirim email hasil analisis:", error);
    if (error.response) throw error.response.data;
    throw new Error("Gagal mengirim email hasil analisis.");
  }
};
