import React, { useEffect, useState } from "react";
import NavbarLogin from "./NavbarLoginKlien";
import FooterSetelahLogin from "../FooterSetelahLogin";
import { motion } from "framer-motion";
import { Copy, Clock, CheckCircle, Wallet, Upload, Building } from "lucide-react";
import { Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { getApiBaseUrl, getStorageUrl } from "../../config/apiConfig";
import axios from "axios";
import { getAuthHeader } from "../../services/AuthService";

const PembayaranKlien = () => {
  useEffect(() => {
    document.title = "SILAB-NTDK - Pembayaran";
  }, []);

  const [detailBooking, setDetailBooking] = useState(null);
  const [data, setData] = useState({
    vaNumber: "0504118998",
    expiryDate: "27 Oktober 2025, 13:00 WIB",
    method: "Bank BNI",
    total: "0",
  });
  const [invoiceIdRaw, setInvoiceIdRaw] = useState(null);
  const [invoiceProofPath, setInvoiceProofPath] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [showProofModal, setShowProofModal] = useState(false);

  const fetchInvoiceForBooking = async (useBookingId, isBackground = false) => {
    if (!useBookingId) return;
    if (!isBackground) setLoading(true);

    try {
      const apiBase = getApiBaseUrl();
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {}; // 1. Coba ambil invoice
      const res = await fetch(`${apiBase}/invoices?booking_id=${useBookingId}`, { headers });
      const json = await res.json();
      if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
        const inv = json.data[0];
        setInvoiceIdRaw(inv.id);
        setInvoiceProofPath(inv.payment_proof_path || null); // Cek status lunas
        const paid = (inv.status && inv.status.toUpperCase() === "PAID") || !!inv.paid_at;
        setPaymentSuccess(paid);
        setData({
          vaNumber: "0504118998",
          expiryDate: inv.due_date ? new Date(inv.due_date).toLocaleDateString("id-ID") : "7 hari dari sekarang",
          method: "Bank BNI",
          total: (inv.amount || 0).toLocaleString("id-ID"),
        });
        if (inv.booking) {
          const merged = { ...inv.booking, pdf_path: inv.booking.pdf_path || inv.pdf_path || inv.booking.pdfPath };
          setDetailBooking(merged); // Double check status booking jika invoice belum paid tapi booking statusnya selesai
          if (merged.is_paid || (merged.status && ["selesai", "ditandatangani", "lunas", "paid"].includes((merged.status || "").toLowerCase()))) {
            setPaymentSuccess(true);
          }
        }
      } else {
        // 2. Fallback: Ambil data dari Booking jika invoice belum ada
        const userRes = await fetch(`${apiBase}/bookings`, { headers });
        const userJson = await userRes.json();
        if (userJson && userJson.success) {
          const bookings = userJson.data || [];
          const b = bookings.find((x) => String(x.id) === String(useBookingId));
          if (b) {
            // Hitung harga
            try {
              const pricesRes = await fetch(`${apiBase}/analysis-prices`, { headers });
              const pricesJson = await pricesRes.json();
              const priceMap = {};
              if (Array.isArray(pricesJson)) {
                pricesJson.forEach((p) => {
                  priceMap[(p.jenis_analisis || p.jenisAnalisis || "").toString().toLowerCase()] = Number(p.harga || 0);
                });
              }
              const items = b.analysis_items || b.analysisItems || [];
              let sumPrices = 0;
              if (Array.isArray(items) && items.length > 0) {
                items.forEach((it) => {
                  const name = (it.nama_item || it.namaItem || it || "").toString().toLowerCase();
                  const p = priceMap[name];
                  sumPrices += typeof p === "number" && !isNaN(p) ? p : 50000;
                });
              } else {
                sumPrices = 50000;
              }
              const total = (Number(b.jumlah_sampel) || 0) * sumPrices;
              setData({
                vaNumber: "0504118998",
                expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("id-ID"),
                method: "Bank BNI",
                total: total.toLocaleString("id-ID"),
              });
            } catch (err) {
              const total = (Number(b.jumlah_sampel) || 0) * 50000;
                setData({
                vaNumber: "0504118998",
                expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("id-ID"),
                method: "Bank BNI",
                total: total.toLocaleString("id-ID"),
              });
            }
            setInvoiceIdRaw(null);
            setInvoiceProofPath(b.payment_proof_path || null);
            setPaymentSuccess(!!b.is_paid || (b.status && ["selesai", "ditandatangani", "lunas", "paid"].includes((b.status || "").toLowerCase())));
            setDetailBooking(b);
          }
        }
      }
    } catch (e) {
      console.error("Gagal memuat invoice", e);
    } finally {
      if (!isBackground) setLoading(false);
    }
  }; // --- EFFECT: Load Awal & Polling List Pending ---

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get("bookingId");
    if (bookingId) fetchInvoiceForBooking(bookingId);

    const fetchPending = async () => {
      try {
        // Jika sedang detail, jangan refresh list pending (hemat resource)
        if (params.get("bookingId")) return;
        const apiBase = getApiBaseUrl();
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const userRes = await fetch(`${apiBase}/bookings`, { headers });
        const userJson = await userRes.json();
        if (userJson && userJson.success) {
          // Tampilkan booking dengan status pembayaran relevan
          const pending = (userJson.data || []).filter((b) => {
            const st = (b.status || "").toLowerCase();
            return st.includes("pembayaran") || st === "menunggu_konfirmasi_pembayaran" || st === "lunas" || st === "paid" || st === "verified" || st === "selesai" || st === "ditandatangani";
          });
          setPendingBookings(pending);
        }
      } catch (e) {
        console.error("Gagal memuat daftar booking", e);
      }
    };
    fetchPending(); // Polling list pending setiap 10 detik (jika tidak sedang di mode detail)
    const listInterval = setInterval(() => {
      if (!new URLSearchParams(window.location.search).get("bookingId")) {
        fetchPending();
      }
    }, 10000);

    return () => clearInterval(listInterval);
  }, []); // --- EFFECT: Polling Detail (SINKRONISASI STATUS) ---

  useEffect(() => {
    const id = detailBooking ? detailBooking.id : invoiceIdRaw;
    if (!id) return; // Refresh detail setiap 5 detik dengan mode background (isBackground=true) // Ini memperbaiki masalah GLITCH loading
    const iv = setInterval(() => fetchInvoiceForBooking(id, true), 5000); // Fetch pertama kali tetap normal // fetchInvoiceForBooking(id, false); // Sudah dipanggil di handleViewProgress
    return () => clearInterval(iv);
  }, [detailBooking?.id, invoiceIdRaw]); // Update jika status berubah jadi success secara tiba-tiba

  useEffect(() => {
    if (!paymentSuccess) return;
    if (detailBooking || invoiceIdRaw) return;
    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get("bookingId");
    if (bookingId) fetchInvoiceForBooking(bookingId);
  }, [paymentSuccess, detailBooking, invoiceIdRaw]);

  const apiBase = getApiBaseUrl();
  const apiHost = getStorageUrl();

  const theme = {
    primary: "#483D3F",
    secondary: "#8D766B",
    background: "#F7F5F4",
  }; // Payment is considered successful only if paid and verified by coordinator

  const isPaid = detailBooking && (detailBooking.status === "paid" || detailBooking.status === "lunas" || detailBooking.status === "verified" || detailBooking.status === "selesai" || detailBooking.status === "ditandatangani");
  const isVerified = detailBooking && (detailBooking.verified === true || detailBooking.status === "lunas" || detailBooking.status === "verified" || detailBooking.status === "selesai" || detailBooking.status === "ditandatangani");
  const alreadyUploaded = detailBooking && (detailBooking.payment_proof_path || invoiceProofPath);
  const canUpload = !uploading && !alreadyUploaded;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(data.vaNumber);
    alert("Nomor VA berhasil disalin!");
  }; // --- PERBAIKAN TAMPILAN TOTAL (MENCEGAH GLITCH) ---

  const getDisplayedTotal = () => {
    // Prioritas 1: Jika data sudah ada, tampilkan langsung (ABAINKAN LOADING BACKGROUND)
    if (data && data.total && String(data.total).trim() !== "" && String(data.total).trim() !== "0") return data.total; // Prioritas 2: Hitung dari detailBooking jika ada
    const b = detailBooking;
    const candidates = [b && b.amount, b && b.total_amount, b && b.invoice_amount, b && b.harga, b && b.jumlah_sampel && b.jumlah_sampel * 50000];
    for (const c of candidates) {
      if (typeof c === "number" && !isNaN(c) && c > 0) return Number(c).toLocaleString("id-ID");
      if (typeof c === "string" && c.trim() !== "") {
        const n = Number(c);
        if (!isNaN(n) && n > 0) return n.toLocaleString("id-ID");
      }
    } // Prioritas 3: Baru cek loading jika data benar-benar kosong

    if (loading) return "...";
    return "0";
  };

  const handleViewProgress = (b) => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("bookingId", b.id);
      window.history.replaceState({}, "", url.toString());
    } catch (e) {
      window.location.search = `?bookingId=${b.id}`;
    }
    setDetailBooking(b);
    fetchInvoiceForBooking(b.id, false);
    setTimeout(() => {
      const el = document.getElementById("payment-info");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  }; // --- PERBAIKAN TOMBOL KEMBALI ---

  const handleBackToList = () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("bookingId");
      window.history.replaceState({}, "", url.toString());
    } catch (e) {
      window.location.search = "";
    } // Reset SEMUA state detail agar tampilan bersih kembali ke list
    setDetailBooking(null);
    setInvoiceIdRaw(null);
    setInvoiceProofPath(null);
    setPaymentSuccess(false);
    setSelectedFile(null); // Scroll ke atas
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 80);
  };

  const renderEmptyPaymentState = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="text-center py-5 px-4"
      style={{
        borderRadius: "20px",
        border: "1px dashed #e5e5e5",
        background: "#ffffff",
      }}
    >
      <div className="mb-4">
        <div
          className="d-inline-flex align-items-center justify-content-center shadow-sm"
          style={{
            width: 110,
            height: 110,
            borderRadius: "50%",
            background: "#F7F5F4",
            color: theme.primary,
          }}
        >
          <Wallet size={42} />
        </div>
      </div>

      <h4 className="fw-bold mb-2" style={{ color: theme.primary }}>
        Belum Ada Tagihan
      </h4>

      <p className="text-muted mb-4" style={{ maxWidth: 420, margin: "0 auto" }}>
        Anda belum memiliki pesanan analisis yang perlu dibayar. Silakan buat pesanan sampel terlebih dahulu untuk memulai proses laboratorium.
      </p>

      <button
        className="btn fw-semibold px-5 py-3 shadow-sm"
        style={{
          backgroundColor: theme.primary,
          color: "#fff",
          borderRadius: "999px",
        }}
        onClick={() => {
          window.location.href = "/dashboard/pemesananSampelKlien";
        }}
      >
        Buat Pesanan Sampel
      </button>

      <div className="mt-4">
        <small className="text-muted">
          Butuh bantuan? <span style={{ color: theme.secondary, cursor: "pointer" }}>Hubungi admin laboratorium</span>
        </small>
      </div>
    </motion.div>
  );

  return (
    <NavbarLogin>
      <div className="container-fluid min-vh-100 py-5" style={{ backgroundColor: "#F8F9FA" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto bg-white shadow-sm border" style={{ maxWidth: "500px", borderRadius: "24px", overflow: "hidden" }}>
          {/* Header */}
          <div className="p-4 text-center border-bottom bg-white">
            <h4 className="fw-bold mb-1">Pembayaran</h4>
            <p className="text-muted small mb-0">Selesaikan transaksi Anda agar pesanan diproses</p>
          </div>

          <div className="p-4">
            {!detailBooking ? (
              /* LIST VIEW - Minimalist Style */
              <div className="d-flex flex-column gap-3">
                {pendingBookings.map((b) => (
                  <div key={b.id} onClick={() => fetchInvoiceForBooking(b.id)} className="p-3 border rounded-4 d-flex justify-content-between align-items-center cursor-pointer hover-effect" style={{ cursor: "pointer" }}>
                    <div>
                      <div className="fw-bold">{b.kode_batch || `Order #${b.id}`}</div>
                      <div className="text-muted small">{b.status}</div>
                    </div>
                    <button className="btn btn-light btn-sm rounded-pill px-3">Detail</button>
                  </div>
                ))}
              </div>
            ) : (
              /* DETAIL VIEW - Match Image */
              <div className="text-center">
                {/* Stepper */}
                <div className="d-flex align-items-center justify-content-center mb-5 mt-2 position-relative">
                  <div className="d-flex flex-column align-items-center z-1">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center border"
                      style={{ width: "50px", height: "50px", backgroundColor: paymentSuccess ? "#E9ECEF" : "#7D6E66", color: paymentSuccess ? "#ADB5BD" : "#FFF" }}
                    >
                      <Clock size={24} />
                    </div>
                    <span className="small mt-2 fw-bold" style={{ color: paymentSuccess ? "#ADB5BD" : "#7D6E66" }}>
                      Menunggu
                    </span>
                  </div>

                  <div className="flex-grow-1 mx-2" style={{ height: "4px", backgroundColor: "#E9ECEF", maxWidth: "80px", marginTop: "-25px" }}>
                    <div style={{ width: paymentSuccess ? "100%" : "50%", height: "100%", backgroundColor: "#7D6E66" }}></div>
                  </div>

                  <div className="d-flex flex-column align-items-center z-1">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center border"
                      style={{ width: "50px", height: "50px", backgroundColor: paymentSuccess ? "#7D6E66" : "#E9ECEF", color: paymentSuccess ? "#FFF" : "#ADB5BD" }}
                    >
                      <CheckCircle size={24} />
                    </div>
                    <span className="small mt-2 fw-bold" style={{ color: paymentSuccess ? "#7D6E66" : "#ADB5BD" }}>
                      Berhasil
                    </span>
                  </div>
                </div>

                {/* VA Box */}
                <div className="border rounded-4 p-4 mb-4 text-start position-relative">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="text-muted fw-bold small">Nomor Virtual Account</span>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <Building size={18} />
                      <span className="small fw-bold" style={{ fontSize: 12 }}>BNI</span>
                    </div>
                  </div>
                  <div className="bg-light p-3 rounded-3 d-flex justify-content-between align-items-center border">
                    <span className="fs-4 fw-bold letter-spacing-2" style={{ letterSpacing: "3px" }}>
                      {data.vaNumber}
                    </span>
                    <Copy size={20} className="text-muted cursor-pointer" onClick={copyToClipboard} />
                  </div>
                </div>

                {/* Expiry Badge */}
                <div className="bg-danger-subtle text-danger py-2 px-3 rounded-pill mb-4 d-inline-flex align-items-center gap-2 small fw-bold">
                  <Clock size={16} />
                  Bayar sebelum: {data.expiryDate}
                </div>

                {/* Payment Detail Table */}
                <div className="border-top pt-3 text-start">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small">Metode Pembayaran</span>
                    <span className="fw-bold small">{data.method}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                    <span className="text-muted small">Total yang harus dibayar</span>
                    <div className="text-end">
                      <span className="fw-bold fs-4">Rp {getDisplayedTotal()}</span>
                    </div>
                  </div>
                </div>

                {alreadyUploaded && (
                  <div className="mb-3 p-3 rounded-4 border d-flex justify-content-between align-items-center bg-light">
                    <div className="d-flex align-items-center gap-2">
                      <CheckCircle size={18} className="text-success" />
                      <div className="text-start">
                        <div className="small fw-bold">Bukti Pembayaran</div>
                        <div className="text-muted" style={{ fontSize: "10px" }}>
                          Telah diunggah
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowProofModal(true)}
                      className="btn btn-sm btn-outline-secondary rounded-pill px-3 fw-bold"
                      style={{ fontSize: "12px" }}
                    >
                      Lihat Bukti
                    </button>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="d-grid gap-2 mt-4">
                  {/* Tombol Dinamis: Unggah -> Kirim */}
                  <button
                    className="btn py-3 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                    style={{
                      backgroundColor: selectedFile ? "#28a745" : "#3D3432", // Berubah hijau saat siap kirim
                      color: "#FFF",
                      borderRadius: "14px",
                      border: "none",
                      transition: "all 0.3s ease",
                    }}
                    disabled={uploading || alreadyUploaded}
                    onClick={async () => {
                      // JIKA belum pilih file, maka buka dialog file
                      if (!selectedFile) {
                        document.getElementById("file-upload").click();
                      }
                      // JIKA sudah ada file, maka jalankan fungsi upload
                      else {
                        setUploading(true);
                        try {
                          const apiBase = getApiBaseUrl();
                          const token = localStorage.getItem("token");
                          const headers = token ? { Authorization: `Bearer ${token}`, Accept: "application/json" } : { Accept: "application/json" };
                          const fd = new FormData();
                          fd.append("file", selectedFile);

                          const id = detailBooking ? detailBooking.id : new URLSearchParams(window.location.search).get("bookingId");

                          const res = await axios.post(`${apiBase}/bookings/${id}/upload-payment-proof`, fd, {
                            headers: {
                              ...getAuthHeader(),
                              'Content-Type': 'multipart/form-data'
                            }
                          });

                          if (res.data) {
                            alert("Bukti pembayaran berhasil dikirim!");
                            setSelectedFile(null);
                            if (res.data.data) setDetailBooking(res.data.data);
                          }
                        } catch (err) {
                          console.error(err);
                          if (err.response && err.response.data) {
                            alert("Gagal mengirim bukti: " + (err.response.data.message || JSON.stringify(err.response.data)));
                          } else {
                            alert("Terjadi kesalahan sistem saat mengunggah bukti.");
                          }
                        } finally {
                          setUploading(false);
                        }
                      }
                    }}
                  >
                    {uploading ? (
                      <>Tunggu sebentar...</>
                    ) : alreadyUploaded ? (
                      <>Bukti Sudah Terkirim</>
                    ) : selectedFile ? (
                      <>
                        <CheckCircle size={20} /> Kirim Bukti Sekarang
                      </>
                    ) : (
                      <>
                        <Upload size={20} /> Unggah Bukti Pembayaran
                      </>
                    )}
                  </button>

                  {/* Hidden Input File */}
                  <input type="file" id="file-upload" hidden accept="application/pdf,image/*" onChange={(e) => setSelectedFile(e.target.files[0])} />

                  {/* Tombol Cek Status */}
                  <button className="btn btn-light py-3 border-0 fw-bold d-flex align-items-center justify-content-center gap-2" style={{ borderRadius: "14px", color: "#666" }} onClick={() => fetchInvoiceForBooking(detailBooking?.id)}>
                    <span style={{ fontSize: 18 }}>↻</span>
                    Cek Status Otomatis
                  </button>
                </div>

                <button className="btn btn-link text-muted small mt-3 text-decoration-none" onClick={handleBackToList}>
                  Kembali ke daftar pesanan
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <style>{`
        .letter-spacing-2 { letter-spacing: 2px; }
        .hover-effect:hover { background-color: #F8F9FA; border-color: #DDD !important; }
        .z-1 { z-index: 1; }
      `}</style>
      {/* ─── Modal Lihat Bukti Pembayaran ─── */}
      <Modal
        show={showProofModal}
        onHide={() => setShowProofModal(false)}
        centered
        size="lg"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        <Modal.Header closeButton style={{ borderBottom: "1px solid #eee", backgroundColor: "#f8f9fa", padding: "16px 24px" }}>
          <Modal.Title style={{ fontSize: "1.1rem", fontWeight: "700", color: "#3E2723" }}>
            Bukti Pembayaran Sampel
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "24px", textAlign: "center", backgroundColor: "#fafafa" }}>
          {detailBooking?.payment_proof_path || invoiceProofPath ? (
            <div style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid #E0E0E0", backgroundColor: "#fff", padding: "12px", display: "inline-block", maxWidth: "100%" }}>
              <img
                src={`${apiHost}/storage/${detailBooking?.payment_proof_path || invoiceProofPath}`}
                alt="Bukti Pembayaran"
                style={{
                  maxWidth: "100%",
                  maxHeight: "70vh",
                  objectFit: "contain",
                  borderRadius: "8px",
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='140' viewBox='0 0 240 140'%3E%3Crect width='240' height='140' fill='%23f8f9fa'/%3E%3Ctext x='50%25' y='45%25' text-anchor='middle' dominant-baseline='middle' fill='%23777' font-family='sans-serif' font-size='14' font-weight='bold'%3EGambar Tidak Dapat Dimuat%3C/text%3E%3Ctext x='50%25' y='65%25' text-anchor='middle' dominant-baseline='middle' fill='%23999' font-family='sans-serif' font-size='11'%3EFile mungkin belum tersinkronisasi%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>
          ) : (
            <p className="text-muted">Tidak ada bukti yang dapat ditampilkan.</p>
          )}
        </Modal.Body>
        <Modal.Footer style={{ borderTop: "none", backgroundColor: "#f8f9fa", padding: "12px 24px" }}>
          <button
            className="btn btn-secondary rounded-pill px-4"
            style={{ fontWeight: "600", fontSize: "0.88rem" }}
            onClick={() => setShowProofModal(false)}
          >
            Tutup
          </button>
        </Modal.Footer>
      </Modal>

      <FooterSetelahLogin />
    </NavbarLogin>
  );
};
export default PembayaranKlien;
