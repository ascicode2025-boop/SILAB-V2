import React, { useState, useEffect, useMemo } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Modal, Spinner } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import NavbarLoginKlien from "./NavbarLoginKlien";
import FooterSetelahLogin from "../FooterSetelahLogin";
import { getRentalById, submitReturnRequest, cancelRental } from "../../services/RentalService";
import { getApiBaseUrl, getStorageUrl } from "../../config/apiConfig";
import axios from "axios";
import { getAuthHeader } from "../../services/AuthService";

const DetailPengajuanAlat = () => {
  const history = useHistory();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [rental, setRental] = useState(null);
  const [showModalReturn, setShowModalReturn] = useState(false);
  const [tanggalPengembalian, setTanggalPengembalian] = useState(
    new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })
  );
  const [kondisiAlat, setKondisiAlat] = useState("Baik");
  const [catatan, setCatatan] = useState("");
  const [fotoKerusakan, setFotoKerusakan] = useState(null);
  const [brokenQuantities, setBrokenQuantities] = useState({});

  const groupedInstruments = useMemo(() => {
    if (!rental?.instruments) return [];
    const groups = {};
    rental.instruments.forEach((item) => {
      const name = item.nama_alat || item.instrument?.nama_alat || "Alat Analisis";
      if (!groups[name]) groups[name] = 0;
      groups[name]++;
    });
    return Object.entries(groups).map(([name, count]) => ({ name, count }));
  }, [rental]);
  const [statusPengembalian, setStatusPengembalian] = useState("BELUM DIKEMBALIKAN");

  const [selectedPaymentFile, setSelectedPaymentFile] = useState(null);
  const [uploadingPayment, setUploadingPayment] = useState(false);

  // State untuk Surat Bebas Lab
  const [showModalBebasLab, setShowModalBebasLab] = useState(false);
  const [isMahasiswa, setIsMahasiswa] = useState(true);
  const [semesterBebasLab, setSemesterBebasLab] = useState("");
  const [departemenBebasLab, setDepartemenBebasLab] = useState("");
  const [loadingBebasLab, setLoadingBebasLab] = useState(false);

  // State untuk Modal Konfirmasi Pembatalan Peminjaman
  const [showModalCancel, setShowModalCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // State untuk Modal Lihat Bukti Pembayaran
  const [showProofModal, setShowProofModal] = useState(false);
  const [proofModalUrl, setProofModalUrl] = useState("");
  const [proofModalTitle, setProofModalTitle] = useState("Bukti Pembayaran");

  const handleOpenProofModal = (path, title = "Bukti Pembayaran") => {
    if (!path) return;
    const fullUrl = `${getStorageUrl()}/storage/${path}`;
    setProofModalUrl(fullUrl);
    setProofModalTitle(title);
    setShowProofModal(true);
  };

  useEffect(() => {
    document.title = "SILAB-NTDK - Detail Progress Pengajuan Alat";
    fetchRentalDetail();
  }, [id]);

  const fetchRentalDetail = async () => {
    try {
      setLoading(true);
      const data = await getRentalById(id);
      setRental(data);
    } catch (err) {
      console.error("Gagal mengambil detail peminjaman:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPengembalian = async () => {
    try {
      setLoading(true);
      // Ensure date format is YYYY-MM-DD
      const dateParts = tanggalPengembalian.split(" ");
      let formattedDate = "";

      if (dateParts.length === 3) {
        const months = {
          "Januari": "01", "Februari": "02", "Maret": "03", "April": "04", "Mei": "05", "Juni": "06",
          "Juli": "07", "Agustus": "08", "September": "09", "Oktober": "10", "November": "11", "Desember": "12"
        };
        const day = dateParts[0].padStart(2, '0');
        const month = months[dateParts[1]];
        const year = dateParts[2];
        formattedDate = `${year}-${month}-${day}`;
      } else {
        // Fallback if formatting is weird
        formattedDate = new Date().toISOString().split('T')[0];
      }

      const formData = new FormData();
      formData.append("tanggal_pengembalian_aktual", formattedDate);
      formData.append("kondisi_alat", kondisiAlat);

      let finalCatatan = catatan;
      if (kondisiAlat === "Ada Kerusakan") {
        const brokenList = Object.entries(brokenQuantities)
          .filter(([name, qty]) => qty > 0)
          .map(([name, qty]) => `${qty}x ${name}`);
        if (brokenList.length > 0) {
          finalCatatan = `Alat Rusak: ${brokenList.join(", ")}.\n\n${catatan}`;
        }
      }
      formData.append("catatan", finalCatatan);

      if (kondisiAlat === "Ada Kerusakan" && fotoKerusakan) {
        formData.append("foto_kerusakan", fotoKerusakan);
      }

      await submitReturnRequest(id, formData);
      alert("Pengajuan pengembalian berhasil dikirim!");
      setShowModalReturn(false);
      fetchRentalDetail();
    } catch (err) {
      alert("Gagal mengajukan pengembalian: " + (err.message || "Kesalahan sistem"));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRental = async () => {
    try {
      setCancelling(true);
      await cancelRental(id);
      setShowModalCancel(false);
      alert("Peminjaman alat berhasil dibatalkan.");
      fetchRentalDetail();
    } catch (error) {
      alert("Gagal membatalkan peminjaman: " + (error.message || ""));
    } finally {
      setCancelling(false);
      setLoading(false);
    }
  };

  const handlePaymentUpload = async () => {
    if (!selectedPaymentFile) return;
    setUploadingPayment(true);
    try {
      const formData = new FormData();
      formData.append("payment_proof", selectedPaymentFile);

      const res = await axios.post(`${getApiBaseUrl()}/rentals/${id}/payment`, formData, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data) {
        alert("Bukti pembayaran berhasil diunggah!");
        fetchRentalDetail();
        setSelectedPaymentFile(null);
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        alert("Gagal mengunggah bukti pembayaran: " + (err.response.data.message || JSON.stringify(err.response.data)));
      } else {
        alert("Terjadi kesalahan sistem saat upload pembayaran.");
      }
    } finally {
      setUploadingPayment(false);
    }
  };

  const handleGenerateBebasLab = async () => {
    try {
      setLoadingBebasLab(true);
      const token = localStorage.getItem("token");

      const res = await axios.post(`${getApiBaseUrl()}/lab-clearance/generate`, {
        is_mahasiswa: isMahasiswa,
        semester: semesterBebasLab,
        departemen: departemenBebasLab
      }, {
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json"
        }
      });

      const data = res.data;
      if (data) {
        if (data.pdf_url) {
          window.open(data.pdf_url, '_blank');
        } else {
          alert("Surat Bebas Lab berhasil digenerate.");
        }
        setShowModalBebasLab(false);
      } else {
        alert("Gagal: " + (data.message || JSON.stringify(data)));
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat generate Surat Bebas Lab.");
    } finally {
      setLoadingBebasLab(false);
    }
  };


  const calculateStep = (status) => {
    switch (status) {
      case "pending":
        return 1;
      case "ditolak":
        return 2;
      case "disetujui_koordinator":
      case "disetujui":
        return 2;
      case "siap_diambil":
        return 3;
      case "aktif":
        return 4;
      case "menunggu_pengembalian":
      case "menunggu_pembayaran_denda":
      case "selesai":
        return 5;
      default:
        return 1;
    }
  };

  const dataDetail = rental
    ? {
      noPengajuan: `PJ-${String(rental.id).padStart(3, "0")}`,
      tanggalPengajuan: rental.created_at
        ? new Date(rental.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })
        : "-",
      statusPeminjaman:
        rental.status === "pending"
          ? "Menunggu Verifikasi"
          : rental.status === "disetujui_koordinator" || rental.status === "disetujui"
            ? "Disetujui Koordinator"
            : rental.status === "siap_diambil"
              ? "Siap Diambil"
              : rental.status === "aktif"
                ? "Alat Sedang Dipinjam"
                : rental.status === "menunggu_pengembalian"
                  ? "Menunggu Konfirmasi Pengembalian"
                  : rental.status === "ditolak"
                    ? "Ditolak"
                    : rental.status === "menunggu_pembayaran_denda"
                      ? "Menunggu Pembayaran Denda"
                      : rental.status === "dibatalkan"
                        ? "Dibatalkan"
                        : rental.status === "selesai"
                          ? "Selesai"
                          : rental.status,
      alat: groupedInstruments.length > 0
        ? groupedInstruments.map(g => `${g.count}x ${g.name}`).join(", ")
        : "Alat Analisis",
      jumlah: `${rental.instruments?.length || 1} Unit`,
      keperluan: rental.tujuan_peminjaman || rental.kegiatan_penelitian || "-",
      tanggalPinjam: rental.tanggal_peminjaman || "-",
      tanggalKembali: rental.tanggal_pengembalian || "-",
      statusPengembalian:
        rental.status === "selesai"
          ? "SUDAH DIKEMBALIKAN"
          : rental.status === "menunggu_pengembalian"
            ? "MENUNGGU VERIFIKASI"
            : statusPengembalian,
      statusBebasLab:
        rental.status === "selesai" && (!rental.denda || rental.denda === 0 || rental.status_denda === "lunas" || rental.status_denda === "tidak_ada")
          ? "Tersedia untuk diunduh."
          : "Belum tersedia.",
      activeStep: calculateStep(rental.status),
    }
    : {
      noPengajuan: id ? `PJ-${String(id).padStart(3, "0")}` : "PJ-2026-001",
      tanggalPengajuan: "-",
      statusPeminjaman: "Menunggu Verifikasi",
      alat: "Micropipette 20–200 µL",
      jumlah: "1 Unit",
      keperluan: "-",
      tanggalPinjam: "-",
      tanggalKembali: "-",
      statusPengembalian: statusPengembalian,
      statusBebasLab: "Belum tersedia.",
      activeStep: 1,
    };

  const steps = [
    {
      title: "Pengajuan\nDikirim",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
          <path d="M2 21L23 12 2 3v7l15 2-15 2v7z" />
        </svg>
      ),
    },
    {
      title: rental?.status === "ditolak" ? "Pengajuan\nDitolak" : "Diverifikasi\nKoordinator",
      icon: rental?.status === "ditolak" ? (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
      ) : (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
          <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
        </svg>
      ),
    },
    {
      title: "Siap\nDiambil",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
          <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3-9H9V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2z" />
        </svg>
      ),
    },
    {
      title: "Alat\nDipinjam",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
          <path d="M20 7H15V4c0-1.1-.9-2-2-2h-2c-1.1 0-2 .9-2 2v3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-7 0H11V4h2v3z" />
        </svg>
      ),
    },
    {
      title: rental?.status === "menunggu_pembayaran_denda" ? "Menunggu\nDenda" : "Pengembalian",
      icon: rental?.status === "menunggu_pembayaran_denda" ? (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
      ) : (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
          <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
        </svg>
      ),
    },
  ];

  const CIRCLE_SIZE = 60;
  const ACTIVE_COLOR = "#2C2C2C";
  const INACTIVE_COLOR = "#B0B0B0";
  const LINE_COLOR_ACTIVE = "#2C2C2C";
  const LINE_COLOR_INACTIVE = "#CFCFCF";

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
      case "menunggu_verifikasi":
      case "menunggu verifikasi":
      case "menunggu_pembayaran_denda":
        return { bg: "#F5E6CC", color: "#E65100" };
      case "disetujui":
      case "aktif":
        return { bg: "#B9EEC0", color: "#1B5E20" };
      case "ditolak":
      case "dibatalkan":
        return { bg: "#FFCDD2", color: "#B71C1C" };
      case "selesai":
        return { bg: "#E0E0E0", color: "#424242" };
      default:
        return { bg: "#B9EEC0", color: "#1B5E20" };
    }
  };

  const styles = {
    page: {
      minHeight: "100vh",
      backgroundColor: "#EBEBEB",
      fontFamily: "Poppins, sans-serif",
      padding: "24px 0 40px",
    },
    inner: {
      maxWidth: "640px",
      margin: "0 auto",
      padding: "0 16px",
    },
    backBtn: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      background: "#fff",
      border: "none",
      borderRadius: "20px",
      padding: "6px 16px",
      fontFamily: "Poppins, sans-serif",
      fontWeight: 600,
      fontSize: "0.82rem",
      color: "#4A3B32",
      cursor: "pointer",
      marginBottom: "16px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    },
    card: {
      backgroundColor: "#fff",
      borderRadius: "20px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
      marginBottom: "16px",
      overflow: "hidden",
    },
    cardBody: {
      padding: "20px 24px",
    },
    labelSmall: {
      fontSize: "0.8rem",
      color: "#9E9E9E",
      fontWeight: 500,
      marginBottom: "4px",
    },
    valueNormal: {
      fontSize: "0.98rem",
      fontWeight: 700,
      color: "#212121",
    },
    pill: {
      display: "inline-block",
      padding: "5px 20px",
      borderRadius: "20px",
      backgroundColor: "#F0EBE7",
      color: "#3E2723",
      fontWeight: 700,
      fontSize: "0.9rem",
    },
    dynamicBadge: (status) => {
      const badgeStyle = getStatusBadge(status);
      return {
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 16px",
        borderRadius: "20px",
        backgroundColor: badgeStyle.bg,
        color: badgeStyle.color,
        fontWeight: 700,
        fontSize: "0.88rem",
      };
    },
    dynamicDot: (status) => {
      const badgeStyle = getStatusBadge(status);
      return {
        width: "10px",
        height: "10px",
        borderRadius: "50%",
        backgroundColor: badgeStyle.color,
        display: "inline-block",
      };
    },
    sectionTitle: {
      fontSize: "1rem",
      fontWeight: 700,
      color: "#212121",
      marginBottom: "16px",
    },
    redBadge: {
      display: "inline-block",
      padding: "5px 14px",
      borderRadius: "6px",
      backgroundColor: "#F44336",
      color: "#fff",
      fontWeight: 700,
      fontSize: "0.8rem",
      letterSpacing: "0.4px",
    },
    darkBtn: {
      display: "block",
      width: "100%",
      padding: "12px",
      borderRadius: "10px",
      backgroundColor: "#2C2C2C",
      color: "#fff",
      fontWeight: 700,
      fontSize: "0.92rem",
      border: "none",
      cursor: "pointer",
      fontFamily: "Poppins, sans-serif",
      marginTop: "16px",
    },
    infoBannerWrap: {
      display: "flex",
      justifyContent: "center",
      paddingTop: "0",
    },
    infoBanner: {
      backgroundColor: "#3E2723",
      color: "#fff",
      fontWeight: 700,
      fontSize: "1rem",
      padding: "10px 40px",
      borderRadius: "0 0 16px 16px",
      display: "inline-block",
      letterSpacing: "0.3px",
    },
  };

  return (
    <NavbarLoginKlien>
      <style>{`
        .info-grid-row1 {
          display: grid;
          grid-template-columns: 1.4fr 0.7fr 1.5fr;
          gap: 8px 16px;
          margin-bottom: 20px;
        }
        .info-grid-row2 {
          display: flex;
          flex-wrap: wrap;
          gap: 24px;
        }
        .info-grid-row2 > div {
          flex: 1 1 120px;
        }
        .bottom-cards-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          align-items: start;
        }
        @media (max-width: 768px) {
          .info-grid-row1 {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .info-grid-row2 {
            grid-template-columns: 1fr !important;
          }
          .stepper-circle {
            width: 40px !important;
            height: 40px !important;
          }
          .stepper-circle svg {
            width: 16px !important;
            height: 16px !important;
          }
          .stepper-line {
            top: 28px !important;
          }
          .stepper-label {
            font-size: 0.65rem !important;
            max-width: 80px !important;
          }
          .stepper-wrapper {
            overflow-x: auto;
            padding-bottom: 12px;
          }
          .stepper-inner {
            min-width: 480px; /* Ensure labels and circles don't squish */
          }
          .bottom-cards-grid {
            grid-template-columns: 1fr !important;
          }
          .header-actions {
            justify-content: center !important;
            flex-direction: column;
          }
          .header-actions button {
            width: 100%;
          }
        }
      `}</style>
      <div style={styles.page}>
        <div style={styles.inner}>
          {/* Back Button */}
          <button
            style={styles.backBtn}
            onClick={() => history.push("/dashboard/detailPengajuan")}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#4A3B32">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
            Kembali ke Daftar Pengajuan
          </button>

          {/* ─── Card 1: Header Info ─── */}
          <div style={styles.card}>
            <div style={{ ...styles.cardBody, padding: "18px 24px" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))",
                  alignItems: "flex-start",
                  textAlign: "center",
                  gap: "12px",
                }}
              >
                {/* No. Pengajuan */}
                <div>
                  <div style={styles.labelSmall}>No. Pengajuan</div>
                  <span style={styles.pill}>{dataDetail.noPengajuan}</span>
                </div>
                {/* Tanggal Pengajuan */}
                <div>
                  <div style={styles.labelSmall}>Tanggal Pengajuan</div>
                  <span style={styles.pill}>{dataDetail.tanggalPengajuan}</span>
                </div>
                {/* Status Peminjaman */}
                <div>
                  <div style={styles.labelSmall}>Status Peminjaman</div>
                  <span style={styles.dynamicBadge(dataDetail.statusPeminjaman)}>
                    <span style={styles.dynamicDot(dataDetail.statusPeminjaman)} />
                    {dataDetail.statusPeminjaman}
                  </span>
                </div>
              </div>

              {/* Action Buttons in Header */}
              {rental?.status === "pending" && (
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-end", marginTop: "16px", gap: "10px" }}>
                  <button
                    onClick={() => {
                      const text = `Halo Koordinator SILAB-NTDK, saya ingin verifikasi pengajuan peminjaman alat dengan nomor ${dataDetail.noPengajuan}. Mohon diproses, terima kasih.`;
                      window.open(`https://wa.me/6285691552140?text=${encodeURIComponent(text)}`, "_blank");
                    }}
                    style={{
                      backgroundColor: "#10b981",
                      color: "#fff",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontWeight: "600",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      boxShadow: "0 2px 4px rgba(16, 185, 129, 0.2)",
                    }}
                  >
                    Hubungi via WhatsApp
                  </button>
                  <button
                    onClick={() => setShowModalCancel(true)}
                    style={{
                      backgroundColor: "#ef4444",
                      color: "#fff",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontWeight: "600",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      boxShadow: "0 2px 4px rgba(239, 68, 68, 0.2)",
                    }}
                  >
                    Batalkan Peminjaman
                  </button>
                </div>
              )}
              {rental?.status === "ditolak" && (
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-end", marginTop: "16px", gap: "10px" }}>
                  <button
                    onClick={() => history.push("/dashboard/pengajuanPeminjaman")}
                    style={{
                      backgroundColor: "#f59e0b",
                      color: "#fff",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontWeight: "600",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      boxShadow: "0 2px 4px rgba(245, 158, 11, 0.2)",
                    }}
                  >
                    Ajukan Ulang
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ─── Card Penolakan (Jika ada) ─── */}
          {rental?.status === "ditolak" && rental?.alasan_penolakan && (
            <div style={{
              backgroundColor: "#FFF0F0",
              borderLeft: "4px solid #F44336",
              padding: "16px",
              marginBottom: "16px",
              borderRadius: "8px",
              color: "#B71C1C",
              fontSize: "0.9rem",
            }}>
              <strong>Alasan Penolakan:</strong>
              <div style={{ marginTop: "4px" }}>{rental.alasan_penolakan}</div>
            </div>
          )}

          {/* ─── Card 2: Informasi Peminjaman Alat ─── */}
          <div style={styles.card}>
            {/* Dark brown header banner */}
            <div style={styles.infoBannerWrap}>
              <span style={styles.infoBanner}>Informasi Peminjaman Alat</span>
            </div>

            <div style={{ padding: "20px 24px 24px" }}>
              {/* Row 1: Alat, Jumlah, Keperluan */}
              <div
                className="info-grid-row1"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.4fr 0.7fr 1.5fr",
                  gap: "8px 16px",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <div style={styles.labelSmall}>Alat</div>
                  <div style={styles.valueNormal}>{dataDetail.alat}</div>
                </div>
                <div>
                  <div style={styles.labelSmall}>Jumlah</div>
                  <div style={styles.valueNormal}>{dataDetail.jumlah}</div>
                </div>
                <div>
                  <div style={styles.labelSmall}>Keperluan</div>
                  <div style={styles.valueNormal}>{dataDetail.keperluan}</div>
                </div>
              </div>
              {/* Row 2: Tanggal Pinjam, Tanggal Kembali */}
              <div
                className="info-grid-row2"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px 16px",
                }}
              >
                <div>
                  <div style={styles.labelSmall}>Tanggal Pinjam</div>
                  <div style={styles.valueNormal}>{dataDetail.tanggalPinjam}</div>
                </div>
                <div>
                  <div style={styles.labelSmall}>Tanggal Kembali</div>
                  <div style={styles.valueNormal}>{dataDetail.tanggalKembali}</div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Card 3: Tahapan Pengajuan (Stepper) ─── */}
          <div style={styles.card}>
            <div style={{ ...styles.cardBody, padding: "24px" }}>
              <div style={styles.sectionTitle}>Tahapan Pengajuan</div>

              {/* Stepper Container */}
              <div
                className="stepper-wrapper"
                style={{
                  position: "relative",
                  width: "100%",
                  padding: "16px 0 8px",
                }}
              >
                <div className="stepper-inner" style={{ position: "relative", width: "100%" }}>
                {/* Inactive Base Line */}
                <div
                  className="stepper-line"
                  style={{
                    position: "absolute",
                    top: `${CIRCLE_SIZE / 2 + 8}px`,
                    left: `calc(${100 / (steps.length * 2)}% )`,
                    right: `calc(${100 / (steps.length * 2)}% )`,
                    height: "5px",
                    backgroundColor: LINE_COLOR_INACTIVE,
                    zIndex: 0,
                    borderRadius: "3px",
                  }}
                />
                {/* Active Line */}
                <div
                  className="stepper-line"
                  style={{
                    position: "absolute",
                    top: `${CIRCLE_SIZE / 2 + 8}px`,
                    left: `calc(${100 / (steps.length * 2)}% )`,
                    width: `calc(${((dataDetail.activeStep - 1) / (steps.length - 1)) * 100}% * ${(steps.length - 1) / steps.length})`,
                    height: "5px",
                    backgroundColor: LINE_COLOR_ACTIVE,
                    zIndex: 0,
                    borderRadius: "3px",
                    transition: "width 0.4s ease",
                  }}
                />

                {/* Steps Row */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  {steps.map((step, idx) => {
                    const stepNum = idx + 1;
                    const isActive = stepNum <= dataDetail.activeStep;
                    return (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          flex: 1,
                        }}
                      >
                        {/* Circle */}
                        <div
                          className="stepper-circle"
                          style={{
                            width: `${CIRCLE_SIZE}px`,
                            height: `${CIRCLE_SIZE}px`,
                            borderRadius: "50%",
                            backgroundColor: isActive 
                              ? (rental?.status === "ditolak" && stepNum === 2 
                                  ? "#DC2626" 
                                  : (rental?.status === "menunggu_pembayaran_denda" && stepNum === 5
                                      ? "#E65100" // Orange for denda
                                      : ACTIVE_COLOR)) 
                              : INACTIVE_COLOR,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: isActive
                              ? "0 4px 12px rgba(0,0,0,0.25)"
                              : "0 2px 6px rgba(0,0,0,0.1)",
                            transition: "background-color 0.3s ease",
                            marginBottom: "10px",
                          }}
                        >
                          {step.icon}
                        </div>
                        {/* Label */}
                        <div
                          className="stepper-label"
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 600,
                            color: "#333",
                            textAlign: "center",
                            whiteSpace: "pre-line",
                            lineHeight: "1.35",
                            maxWidth: "72px",
                          }}
                        >
                          {step.title}
                        </div>
                      </div>
                    );
                  })}
                </div>
                </div>
              </div>
            </div>
          </div>

          {rental?.denda > 0 && (
            <div style={styles.card}>
              <div style={{ ...styles.cardBody, padding: "20px 24px" }}>
                <div style={styles.sectionTitle}>Pembayaran Denda Keterlambatan / Kerusakan</div>
                <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <div style={styles.labelSmall}>Status Denda</div>
                    <span
                      style={
                        rental.status_denda === "lunas" || rental.status === "selesai"
                          ? styles.greenBadge
                          : rental.status_denda === "menunggu" || (rental.status_denda === "belum_dibayar" && rental.denda_payment_proof_path)
                            ? { ...styles.greenBadge, backgroundColor: "#FFF3E0", color: "#E65100" }
                            : styles.redBadge
                      }
                    >
                      {rental.status_denda === "lunas" || rental.status === "selesai"
                        ? "Lunas"
                        : rental.status_denda === "menunggu" || (rental.status_denda === "belum_dibayar" && rental.denda_payment_proof_path)
                          ? "Menunggu Verifikasi"
                          : "Belum Dibayar"}
                    </span>
                    <div style={{ marginTop: "8px", fontSize: "0.85rem", fontWeight: "bold" }}>
                      Nominal: Rp {rental.denda.toLocaleString("id-ID")}
                    </div>
                  </div>

                  {rental.denda_payment_proof_path && (
                    <div style={{ flex: 1, minWidth: "150px" }}>
                      <button
                        type="button"
                        onClick={() => handleOpenProofModal(rental.denda_payment_proof_path, "Bukti Pembayaran Denda")}
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          fontSize: "0.88rem",
                          fontWeight: 600,
                          color: "#2E7D32",
                          textDecoration: "underline",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        Lihat Bukti Terunggah
                      </button>
                    </div>
                  )}

                  {(rental.status_denda === "belum_dibayar" && !rental.denda_payment_proof_path) && (
                    <div style={{ flex: 2, display: "flex", flexDirection: "column", gap: "8px", minWidth: "250px" }}>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg,image/webp"
                        onChange={(e) => setSelectedPaymentFile(e.target.files[0])}
                        style={{ fontSize: "0.85rem" }}
                      />
                      <button
                        onClick={async () => {
                          if (!selectedPaymentFile) return;
                          setUploadingPayment(true);
                          try {
                            const formData = new FormData();
                            formData.append("denda_payment_proof", selectedPaymentFile);
                            const res = await axios.post(`${getApiBaseUrl()}/rentals/${id}/denda`, formData, {
                              headers: {
                                ...getAuthHeader(),
                                'Content-Type': 'multipart/form-data'
                              }
                            });
                            if (res.data) {
                              alert("Bukti denda berhasil diunggah!");
                              fetchRentalDetail();
                              setSelectedPaymentFile(null);
                            }
                          } catch (err) {
                            if (err.response && err.response.data) {
                              alert("Gagal mengunggah bukti denda: " + (err.response.data.message || JSON.stringify(err.response.data)));
                            } else {
                              alert("Terjadi kesalahan sistem saat mengunggah bukti denda.");
                            }
                          } finally {
                            setUploadingPayment(false);
                          }
                        }}
                        disabled={!selectedPaymentFile || uploadingPayment}
                        style={{
                          ...styles.darkBtn,
                          marginTop: 0,
                          padding: "8px 12px",
                          width: "auto",
                          alignSelf: "flex-start",
                          opacity: !selectedPaymentFile || uploadingPayment ? 0.6 : 1,
                        }}
                      >
                        {uploadingPayment ? "Mengunggah..." : "Unggah Bukti Denda"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ─── Card 4 & 5: Bottom Row ─── */}
          <div className="bottom-cards-grid">
            {/* Pengembalian */}
            <div style={styles.card}>
              <div style={{ ...styles.cardBody, padding: "20px" }}>
                <div
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "#212121",
                    marginBottom: "14px",
                  }}
                >
                  Pengembalian
                </div>
                <div
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 500,
                    color: "#9E9E9E",
                    marginBottom: "8px",
                  }}
                >
                  Status
                </div>
                <span
                  style={
                    rental?.status === "aktif" && statusPengembalian === "BELUM DIKEMBALIKAN"
                      ? styles.redBadge
                      : (rental?.status === "selesai" || statusPengembalian !== "BELUM DIKEMBALIKAN")
                        ? styles.greenBadge
                        : { ...styles.redBadge, backgroundColor: "#E0E0E0", color: "#757575" }
                  }
                >
                  {rental?.status === "selesai"
                    ? "SUDAH DIKEMBALIKAN"
                    : (rental?.status === "aktif" || rental?.status === "menunggu_pengembalian")
                      ? dataDetail.statusPengembalian
                      : "BELUM DIAMBIL"}
                </span>
                <button
                  style={{
                    ...styles.darkBtn,
                    backgroundColor:
                      rental?.status !== "aktif" || dataDetail.statusPengembalian !== "BELUM DIKEMBALIKAN"
                        ? "#9E9E9E"
                        : "#2C2C2C",
                    cursor:
                      rental?.status !== "aktif" || dataDetail.statusPengembalian !== "BELUM DIKEMBALIKAN"
                        ? "not-allowed"
                        : "pointer",
                  }}
                  disabled={rental?.status !== "aktif" || dataDetail.statusPengembalian !== "BELUM DIKEMBALIKAN"}
                  onClick={() => setShowModalReturn(true)}
                >
                  {rental?.status === "selesai" || dataDetail.statusPengembalian !== "BELUM DIKEMBALIKAN"
                    ? "Pengembalian Diajukan"
                    : rental?.status === "aktif"
                      ? "Ajukan Pengembalian"
                      : "Menunggu Pengambilan"}
                </button>

                {/* Show Return Info if already submitted */}
                {rental?.client_return_date && (
                  <div style={{ marginTop: "16px", padding: "12px", backgroundColor: "#F9F9F9", borderRadius: "12px", border: "1px solid #E0E0E0" }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "#333", marginBottom: "8px" }}>Detail yang Diajukan:</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "0.8rem", color: "#616161" }}>
                      <div>
                        <strong>Tanggal:</strong><br />
                        <span style={{ color: "#000" }}>{rental.client_return_date}</span>
                      </div>
                      <div>
                        <strong>Kondisi:</strong><br />
                        <span style={{ color: "#000" }}>{rental.client_return_condition || "-"}</span>
                      </div>
                    </div>
                    {rental.client_return_notes && (
                      <div style={{ marginTop: "8px", fontSize: "0.8rem", color: "#616161", whiteSpace: "pre-line" }}>
                        <strong>Catatan:</strong><br />
                        <span style={{ color: "#000" }}>{rental.client_return_notes}</span>
                      </div>
                    )}
                    {rental.client_return_photo_path && (
                      <div style={{ marginTop: "8px" }}>
                        <button
                          onClick={() => handleOpenProofModal(rental.client_return_photo_path, "Foto Kerusakan (Saat Pengembalian)")}
                          style={{
                            background: "none", border: "none", padding: 0,
                            fontSize: "0.8rem", fontWeight: 600, color: "#2E7D32", textDecoration: "underline", cursor: "pointer"
                          }}
                        >
                          Lihat Foto Kerusakan
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Status Bebas Lab */}
            <div style={styles.card}>
              <div
                style={{
                  ...styles.cardBody,
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "#212121",
                    marginBottom: "14px",
                  }}
                >
                  Status Bebas Lab
                </div>
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#9E9E9E",
                    fontWeight: 500,
                    fontSize: "0.88rem",
                    textAlign: "center",
                    flexDirection: "column"
                  }}
                >
                  {dataDetail.statusBebasLab === "Tersedia untuk diunduh." ? (
                    <>
                      <div className="text-success mb-2 fw-bold">Tersedia</div>
                      <button
                        className="btn btn-sm btn-outline-success rounded-pill px-3"
                        onClick={() => setShowModalBebasLab(true)}
                      >
                        <i className="bi bi-download me-1"></i> Unduh Surat
                      </button>
                    </>
                  ) : (
                    dataDetail.statusBebasLab
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Modal Generate Bebas Lab ─── */}
      <Modal
        show={showModalBebasLab}
        onHide={() => setShowModalBebasLab(false)}
        centered
      >
        <Modal.Header closeButton style={{ borderBottom: "1px solid #eee", backgroundColor: "#f8f9fa" }}>
          <Modal.Title style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#3E2723" }}>
            Unduh Surat Bebas Lab
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "24px" }}>
          <div className="mb-4">
            <div className="form-check form-switch mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="mahasiswaSwitch"
                checked={!isMahasiswa}
                onChange={(e) => setIsMahasiswa(!e.target.checked)}
              />
              <label className="form-check-label fw-bold text-dark" htmlFor="mahasiswaSwitch">
                Saya bukan mahasiswa
              </label>
            </div>
            {!isMahasiswa && (
              <small className="text-muted">Data NIM, Semester, dan Departemen akan diisi tanda strip (-).</small>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold text-secondary">Semester</label>
            <input
              type="text"
              className="form-control"
              value={isMahasiswa ? semesterBebasLab : "-"}
              onChange={(e) => setSemesterBebasLab(e.target.value)}
              disabled={!isMahasiswa}
              placeholder="Contoh: 8"
              style={{ borderRadius: "8px" }}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold text-secondary">Departemen</label>
            <input
              type="text"
              className="form-control"
              value={isMahasiswa ? departemenBebasLab : "-"}
              onChange={(e) => setDepartemenBebasLab(e.target.value)}
              disabled={!isMahasiswa}
              placeholder="Contoh: Ilmu Nutrisi dan Teknologi Pakan"
              style={{ borderRadius: "8px" }}
            />
          </div>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: "none", backgroundColor: "#f8f9fa", padding: "16px 24px" }}>
          <button
            className="btn btn-light rounded-pill px-4"
            onClick={() => setShowModalBebasLab(false)}
            disabled={loadingBebasLab}
          >
            Batal
          </button>
          <button
            className="btn rounded-pill px-4 text-white"
            style={{ backgroundColor: "#8D6E63", border: "none" }}
            onClick={handleGenerateBebasLab}
            disabled={loadingBebasLab}
          >
            {loadingBebasLab ? (
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
            ) : (
              "Generate & Unduh PDF"
            )}
          </button>
        </Modal.Footer>
      </Modal>

      {/* ─── Modal Pengajuan Pengembalian ─── */}
      <Modal
        show={showModalReturn}
        onHide={() => setShowModalReturn(false)}
        centered
        dialogClassName="modal-pengembalian-custom"
      >
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
          }}
        >
          {/* Header Bar */}
          <div
            style={{
              backgroundColor: "#4A3933",
              color: "#ffffff",
              padding: "16px 20px",
              textAlign: "center",
              fontWeight: "700",
              fontSize: "1.15rem",
              letterSpacing: "0.2px",
            }}
          >
            Pengajuan Pengembalian
          </div>

          {/* Modal Content */}
          <div style={{ padding: "24px 26px 28px" }}>
            {/* Info Box */}
            <div
              style={{
                border: "1px solid #E0E0E0",
                borderRadius: "18px",
                padding: "18px 20px",
                backgroundColor: "#ffffff",
                boxShadow: "0 3px 12px rgba(0,0,0,0.06)",
                marginBottom: "22px",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1.2fr",
                  gap: "14px 16px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#616161",
                      fontWeight: 600,
                      marginBottom: "2px",
                    }}
                  >
                    No. Pengajuan
                  </div>
                  <div
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 800,
                      color: "#000",
                    }}
                  >
                    {dataDetail.noPengajuan}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#616161",
                      fontWeight: 600,
                      marginBottom: "2px",
                    }}
                  >
                    Alat
                  </div>
                  <div
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 800,
                      color: "#000",
                    }}
                  >
                    {dataDetail.alat}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#616161",
                      fontWeight: 600,
                      marginBottom: "2px",
                    }}
                  >
                    Tanggal Pinjam
                  </div>
                  <div
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 800,
                      color: "#000",
                    }}
                  >
                    {dataDetail.tanggalPinjam}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#616161",
                      fontWeight: 600,
                      marginBottom: "2px",
                    }}
                  >
                    Tanggal Kembali
                  </div>
                  <div
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 800,
                      color: "#000",
                    }}
                  >
                    {dataDetail.tanggalKembali}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#616161",
                      fontWeight: 600,
                      marginBottom: "2px",
                    }}
                  >
                    Jumlah
                  </div>
                  <div
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 800,
                      color: "#000",
                    }}
                  >
                    {dataDetail.jumlah}
                  </div>
                </div>
              </div>
            </div>

            {/* Tanggal Pengembalian Input */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: "700",
                  color: "#212121",
                  marginBottom: "8px",
                }}
              >
                Tanggal Pengembalian
              </label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "#F2F2F2",
                  border: "1px solid #E0E0E0",
                  borderRadius: "10px",
                  padding: "10px 16px",
                  color: "#616161",
                  fontSize: "0.88rem",
                  fontWeight: "500",
                }}
              >
                <span>{tanggalPengembalian}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#616161">
                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
                </svg>
              </div>
            </div>

            {/* Kondisi Alat Radio Buttons */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: "700",
                  color: "#212121",
                  marginBottom: "8px",
                }}
              >
                Kondisi Alat
              </label>
              <div
                style={{ display: "flex", gap: "28px", alignItems: "center" }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    fontSize: "0.88rem",
                    fontWeight: "600",
                    color: "#212121",
                  }}
                >
                  <input
                    type="radio"
                    name="kondisiAlat"
                    value="Baik"
                    checked={kondisiAlat === "Baik"}
                    onChange={(e) => setKondisiAlat(e.target.value)}
                    style={{
                      accentColor: "#4A3933",
                      width: "18px",
                      height: "18px",
                      cursor: "pointer",
                    }}
                  />
                  Baik
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    fontSize: "0.88rem",
                    fontWeight: "600",
                    color: "#212121",
                  }}
                >
                  <input
                    type="radio"
                    name="kondisiAlat"
                    value="Ada Kerusakan"
                    checked={kondisiAlat === "Ada Kerusakan"}
                    onChange={(e) => setKondisiAlat(e.target.value)}
                    style={{
                      accentColor: "#4A3933",
                      width: "18px",
                      height: "18px",
                      cursor: "pointer",
                    }}
                  />
                  Ada Kerusakan
                </label>
              </div>
            </div>

            {/* Catatan Textarea */}
            <div style={{ marginBottom: "28px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: "700",
                  color: "#212121",
                  marginBottom: "8px",
                }}
              >
                Catatan
              </label>
              <textarea
                rows={3}
                placeholder="Apakah ada kerusakan?"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                style={{
                  width: "100%",
                  border: "1px solid #D0D0D0",
                  borderRadius: "14px",
                  padding: "12px 16px",
                  fontSize: "0.88rem",
                  color: "#333",
                  outline: "none",
                  resize: "none",
                  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.04)",
                  marginBottom: kondisiAlat === "Ada Kerusakan" ? "16px" : "0",
                }}
              />

              {kondisiAlat === "Ada Kerusakan" && (
                <div style={{ marginBottom: "16px", textAlign: "left" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.9rem",
                      fontWeight: "700",
                      color: "#212121",
                      marginBottom: "8px",
                    }}
                  >
                    Pilih Alat yang Rusak
                  </label>
                  {groupedInstruments.map((group) => (
                    <div key={group.name} style={{ display: "flex", alignItems: "center", marginBottom: "8px", gap: "10px" }}>
                      <label style={{ fontSize: "0.88rem", minWidth: "150px", color: "#333", marginBottom: 0 }}>
                        {group.name} (Total: {group.count})
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={group.count}
                        value={brokenQuantities[group.name] === undefined ? "" : brokenQuantities[group.name]}
                        onChange={(e) => {
                          let val = parseInt(e.target.value);
                          if (isNaN(val)) val = "";
                          else {
                            if (val < 0) val = 0;
                            if (val > group.count) val = group.count;
                          }
                          setBrokenQuantities(prev => ({ ...prev, [group.name]: val }));
                        }}
                        style={{
                          width: "60px",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          border: "1px solid #D0D0D0",
                          fontSize: "0.88rem"
                        }}
                      />
                      <span style={{ fontSize: "0.88rem", color: "#555" }}>rusak</span>
                    </div>
                  ))}
                </div>
              )}

              {kondisiAlat === "Ada Kerusakan" && (
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.9rem",
                      fontWeight: "700",
                      color: "#212121",
                      marginBottom: "8px",
                    }}
                  >
                    Foto Kerusakan
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFotoKerusakan(e.target.files[0])}
                    style={{
                      width: "100%",
                      fontSize: "0.88rem",
                      color: "#333",
                    }}
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "16px",
              }}
            >
              <button
                type="button"
                onClick={() => setShowModalReturn(false)}
                style={{
                  backgroundColor: "#D8D8D8",
                  color: "#333333",
                  border: "none",
                  borderRadius: "12px",
                  padding: "8px 36px",
                  fontWeight: "600",
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSubmitPengembalian}
                style={{
                  backgroundColor: "#4A3933",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "12px",
                  padding: "8px 36px",
                  fontWeight: "600",
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  boxShadow: "0 2px 6px rgba(74,57,51,0.3)",
                }}
              >
                Ajukan
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* ─── Modal Konfirmasi Pembatalan Peminjaman ─── */}
      <Modal
        show={showModalCancel}
        onHide={() => !cancelling && setShowModalCancel(false)}
        centered
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        <Modal.Header closeButton={!cancelling} style={{ borderBottom: "1px solid #eee", backgroundColor: "#f8f9fa", padding: "16px 24px" }}>
          <Modal.Title style={{ fontSize: "1.1rem", fontWeight: "700", color: "#3E2723" }}>
            Batalkan Peminjaman
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "24px", textAlign: "center" }}>
          <div className="mb-3">
            <div
              className="mx-auto bg-danger bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: "80px", height: "80px" }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="#dc3545">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
          </div>
          <h5 className="fw-bold mb-2">Apakah Anda yakin?</h5>
          <p className="text-muted mb-0" style={{ fontSize: "0.92rem" }}>
            Apakah Anda yakin ingin membatalkan peminjaman alat{" "}? Tindakan ini tidak dapat dibatalkan.
          </p>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: "none", backgroundColor: "#f8f9fa", padding: "16px 24px", justifyContent: "center", gap: "12px" }}>
          <button
            className="btn btn-light rounded-pill px-4"
            onClick={() => setShowModalCancel(false)}
            disabled={cancelling}
            style={{ fontWeight: "600", fontSize: "0.88rem", minWidth: "120px" }}
          >
            Tidak
          </button>
          <button
            className="btn btn-danger rounded-pill px-4 text-white"
            onClick={handleCancelRental}
            disabled={cancelling}
            style={{ fontWeight: "600", fontSize: "0.88rem", minWidth: "140px", border: "none" }}
          >
            {cancelling ? (
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
            ) : (
              "Ya, Batalkan"
            )}
          </button>
        </Modal.Footer>
      </Modal>

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
            {proofModalTitle}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "24px", textAlign: "center", backgroundColor: "#fafafa" }}>
          {proofModalUrl ? (
            <div style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid #E0E0E0", backgroundColor: "#fff", padding: "12px", display: "inline-block", maxWidth: "100%" }}>
              <img
                src={proofModalUrl}
                alt={proofModalTitle}
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

      {/* Custom CSS for Modal centering, position, and z-index */}
      <style>{`
        .modal-pengembalian-custom {
          max-width: 440px !important;
          width: 92% !important;
          margin: 50px auto 1.75rem !important;
        }
        .modal-pengembalian-custom .modal-content {
          border: none !important;
          background: transparent !important;
          border-radius: 16px !important;
          box-shadow: none !important;
        }
        .modal {
          z-index: 1070 !important;
        }
        .modal-backdrop {
          z-index: 1065 !important;
        }
      `}</style>
      <FooterSetelahLogin />
    </NavbarLoginKlien>
  );
};

export default DetailPengajuanAlat;





