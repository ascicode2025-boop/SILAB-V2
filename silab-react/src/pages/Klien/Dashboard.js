import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import NavbarLoginKlien from "./NavbarLoginKlien";
import "@fontsource/poppins";
import { getUser } from "../../services/AuthService";
import { getUserBookings } from "../../services/BookingService";
import { getRentals } from "../../services/RentalService";
import FooterSetelahLogin from "../FooterSetelahLogin";

function Dashboard() {
  useEffect(() => {
    document.title = "SILAB-NTDK - Dashboard Klien";
  }, []);

  const history = useHistory();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, inProgress: 0, completed: 0 });
  const [toolStats, setToolStats] = useState({ pending: 0, approved: 0, inUse: 0, completed: 0, rejected: 0 });

  const colors = {
    background: "#FDFBF7",
    cardBg: "#FFFFFF",
    primary: "#8D6E63",
    accent: "#A1887F",
    soft: "#D7CCC8",
    text: "#4E342E",
    muted: "#8D6E63",
  };

  useEffect(() => {
    const user = getUser();
    setUsername(user?.name || user?.username || user?.email || "Pengguna");
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await getUserBookings();
        const data = Array.isArray(res) ? res : res?.data || [];

        const valid = data.filter((b) => !["ditolak", "dibatalkan"].includes((b.status || "").toLowerCase()));

        setStats({
          total: valid.length,
          inProgress: valid.filter((b) => (b.status || "").toLowerCase() === "proses").length,
          completed: valid.filter((b) => ["selesai", "ditandatangani"].includes((b.status || "").toLowerCase())).length,
        });

        // Fetch tool rentals
        const rentalsRes = await getRentals();
        const rentalsData = Array.isArray(rentalsRes?.data)
          ? rentalsRes.data
          : Array.isArray(rentalsRes)
          ? rentalsRes
          : [];

        const pendingCount = rentalsData.filter((r) => r.status === "pending" || r.status === "menunggu_pengembalian").length;
        const approvedCount = rentalsData.filter((r) => r.status === "disetujui" || r.status === "siap_diambil").length;
        const inUseCount = rentalsData.filter((r) => r.status === "aktif").length;
        const completedCount = rentalsData.filter((r) => r.status === "selesai").length;
        const rejectedCount = rentalsData.filter((r) => r.status === "ditolak" || r.status === "dibatalkan").length;

        setToolStats({
          pending: pendingCount,
          approved: approvedCount,
          inUse: inUseCount,
          completed: completedCount,
          rejected: rejectedCount,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon, bg }) => (
    <div className="col-12 col-md-4 mb-4">
      <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 18 }}>
        <div className="card-body d-flex align-items-center gap-3 p-4">
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              backgroundColor: bg,
              color: "#fff",
              fontSize: 22,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </div>
          <div>
            <small style={{ color: colors.muted }}>{title}</small>
            <h4 className="fw-bold mb-0" style={{ color: colors.text }}>
              {loading ? "—" : value}
            </h4>
          </div>
        </div>
      </div>
    </div>
  );

  const Step = ({ number, title, desc }) => (
    <div className="d-flex gap-3 mb-4">
      <div
        className="fw-bold d-flex align-items-center justify-content-center"
        style={{
          minWidth: 46,
          height: 46,
          borderRadius: "50%",
          border: `2px solid ${colors.soft}`,
          color: colors.primary,
          background: "#FAFAFA",
        }}
      >
        {number}
      </div>
      <div>
        <h6 className="fw-bold mb-1" style={{ color: colors.text }}>
          {title}
        </h6>
        <p className="small mb-0" style={{ color: colors.muted }}>
          {desc}
        </p>
      </div>
    </div>
  );

  return (
    <NavbarLoginKlien>
      <div
        style={{
          fontFamily: "Poppins, sans-serif",
          minHeight: "100vh",
          background: colors.background,
          padding: "3rem 0 4rem",
        }}
      >
        <div className="container">
          {/* Header */}
          <div className="row align-items-center mb-5">
            <div className="col-md-8 text-center text-md-start mb-3 mb-md-0">
              <h3 className="fw-light mb-1" style={{ color: colors.text }}>
                Jumpa lagi,
                <span className="fw-bold ms-1" style={{ color: colors.primary }}>
                  {username}
                </span>{" "}
                👋
              </h3>
              <p className="mb-0" style={{ color: colors.muted }}>
                Selamat datang di pusat kendali layanan laboratorium Anda
              </p>
            </div>
            <div className="col-md-4 text-center text-md-end">
              <button
                className="btn px-4 py-2 text-white shadow-sm"
                style={{
                  borderRadius: 14,
                  background: colors.primary,
                  transition: "0.3s",
                }}
                onMouseEnter={(e) => (e.target.style.background = colors.accent)}
                onMouseLeave={(e) => (e.target.style.background = colors.primary)}
                onClick={() => (window.location.href = "/dashboard/pemesananSampelKlien")}
              >
                + Buat Pesanan Baru
              </button>
            </div>
          </div>

          {/* Statistik */}
          <div className="row">
            <StatCard title="Total Pemesanan" value={stats.total} icon="📄" bg="#BCAAA4" />
            <StatCard title="Proses Analisis" value={stats.inProgress} icon="⏳" bg="#D7CCC8" />
            <StatCard title="Hasil Selesai" value={stats.completed} icon="✅" bg="#8D6E63" />
          </div>

          {/* Alur Pemesanan Analisis */}
          <div className="card border-0 shadow-sm mt-4" style={{ borderRadius: 22 }}>
            <div className="card-body p-4 p-md-5">
              <h5 className="fw-bold mb-4" style={{ color: colors.text }}>
                Alur Pemesanan Analisis
              </h5>

              <Step number="01" title="Isi Formulir Pemesanan" desc="Lengkapi data sampel melalui tombol Buat Pemesanan Baru." />
              <Step number="02" title="Kirim Sampel ke Laboratorium" desc="Kirim sampel fisik beserta kode pendaftaran." />
              <Step number="03" title="Pantau & Unduh Hasil" desc="Hasil tersedia setelah pengujian selesai." />
            </div>
          </div>

          {/* Ringkasan Peminjaman Alat (Responsive matching screenshot) */}
          <div className="card border-0 shadow-sm mt-4 tool-summary-card" style={{ borderRadius: 24, backgroundColor: "#FFFFFF" }}>
            <div className="card-body p-3 p-sm-4 p-md-5">
              {/* Header Card */}
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4 mb-md-5">
                <div className="d-flex align-items-center">
                  <h5 className="fw-bold mb-0" style={{ color: "#4E342E", fontSize: "1.25rem" }}>
                    Ringkasan Peminjaman Alat
                  </h5>
                  <span
                    className="d-none d-sm-inline-block"
                    style={{
                      width: "36px",
                      height: "2px",
                      backgroundColor: "#BCAAA4",
                      marginLeft: "14px",
                      borderRadius: "2px",
                    }}
                  ></span>
                </div>
                <button
                  className="btn text-white fw-semibold shadow-sm px-4 py-2 align-self-start align-self-sm-auto"
                  style={{
                    borderRadius: 30,
                    backgroundColor: "#9A7A6D",
                    fontSize: "0.85rem",
                    transition: "all 0.3s ease",
                    border: "none",
                  }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = "#836355")}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = "#9A7A6D")}
                  onClick={() => history.push("/dashboard/pengajuanPeminjaman")}
                >
                  + Ajukan Peminjaman
                </button>
              </div>

              {/* Status Items Row */}
              <div className="row g-3 g-md-4 justify-content-center align-items-center my-2 my-md-3">
                {/* Item 1: Menunggu Verifikasi */}
                <div className="col-12 col-md-4 col-xl">
                  <div className="tool-status-item d-flex align-items-center justify-content-start gap-3">
                    <div
                      className="tool-status-badge d-flex flex-column align-items-center justify-content-between p-3 text-white shadow-sm flex-shrink-0"
                      style={{
                        width: "105px",
                        height: "135px",
                        borderRadius: "18px",
                        background: "linear-gradient(180deg, #9C7A6B 0%, #836355 100%)",
                        boxShadow: "0 8px 18px rgba(131, 99, 85, 0.25)",
                      }}
                    >
                      {/* Silver Glossy Clock Graphic */}
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "50%",
                          background: "radial-gradient(circle at 35% 35%, #FFFFFF 0%, #E0E0E0 50%, #B0B0B0 100%)",
                          boxShadow: "0 4px 8px rgba(0,0,0,0.25), inset 0 2px 2px #FFF",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="9" />
                          <path d="M12 7v5l3 2" />
                        </svg>
                      </div>
                      <h2 className="fw-bold mb-0 text-white" style={{ fontSize: "2rem", lineHeight: 1 }}>
                        {loading ? "—" : toolStats.pending}
                      </h2>
                    </div>
                    <h6 className="tool-status-label fw-bold mb-0" style={{ color: "#5A483E", fontSize: "1rem", lineHeight: "1.3" }}>
                      Menunggu Verifikasi
                    </h6>
                  </div>
                </div>

                {/* Item 2: Disetujui */}
                <div className="col-12 col-md-4 col-xl">
                  <div className="tool-status-item d-flex align-items-center justify-content-start gap-3">
                    <div
                      className="tool-status-badge d-flex flex-column align-items-center justify-content-between p-3 text-white shadow-sm flex-shrink-0"
                      style={{
                        width: "105px",
                        height: "135px",
                        borderRadius: "18px",
                        background: "linear-gradient(180deg, #9C7A6B 0%, #836355 100%)",
                        boxShadow: "0 8px 18px rgba(131, 99, 85, 0.25)",
                      }}
                    >
                      {/* Document & Pencil Graphic */}
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "12px",
                          background: "#F5F5F5",
                          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "20px",
                        }}
                      >
                        📝
                      </div>
                      <h2 className="fw-bold mb-0 text-white" style={{ fontSize: "2rem", lineHeight: 1 }}>
                        {loading ? "—" : toolStats.approved}
                      </h2>
                    </div>
                    <h6 className="tool-status-label fw-bold mb-0" style={{ color: "#5A483E", fontSize: "1rem", lineHeight: "1.3" }}>
                      Disetujui
                    </h6>
                  </div>
                </div>

                {/* Item 3: Sedang Dipinjam */}
                <div className="col-12 col-md-4 col-xl">
                  <div className="tool-status-item d-flex align-items-center justify-content-start gap-3">
                    <div
                      className="tool-status-badge d-flex flex-column align-items-center justify-content-between p-3 text-white shadow-sm flex-shrink-0"
                      style={{
                        width: "105px",
                        height: "135px",
                        borderRadius: "18px",
                        background: "linear-gradient(180deg, #9C7A6B 0%, #836355 100%)",
                        boxShadow: "0 8px 18px rgba(131, 99, 85, 0.25)",
                      }}
                    >
                      {/* Bar Chart Graphic (Green, Red, Blue) */}
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "10px",
                          background: "#FFFFFF",
                          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                          display: "flex",
                          alignItems: "flex-end",
                          justifyContent: "center",
                          padding: "8px",
                          gap: "4px",
                        }}
                      >
                        <div style={{ width: "7px", height: "18px", backgroundColor: "#2ECC71", borderRadius: "2px" }}></div>
                        <div style={{ width: "7px", height: "12px", backgroundColor: "#E74C3C", borderRadius: "2px" }}></div>
                        <div style={{ width: "7px", height: "25px", backgroundColor: "#2980B9", borderRadius: "2px" }}></div>
                      </div>
                      <h2 className="fw-bold mb-0 text-white" style={{ fontSize: "2rem", lineHeight: 1 }}>
                        {loading ? "—" : toolStats.inUse}
                      </h2>
                    </div>
                    <h6 className="tool-status-label fw-bold mb-0" style={{ color: "#5A483E", fontSize: "1rem", lineHeight: "1.3" }}>
                      Sedang Dipinjam
                    </h6>
                  </div>
                </div>

                {/* Item 4: Selesai */}
                <div className="col-12 col-md-4 col-xl">
                  <div className="tool-status-item d-flex align-items-center justify-content-start gap-3">
                    <div
                      className="tool-status-badge d-flex flex-column align-items-center justify-content-between p-3 text-white shadow-sm flex-shrink-0"
                      style={{
                        width: "105px",
                        height: "135px",
                        borderRadius: "18px",
                        background: "linear-gradient(180deg, #9C7A6B 0%, #836355 100%)",
                        boxShadow: "0 8px 18px rgba(131, 99, 85, 0.25)",
                      }}
                    >
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "12px",
                          background: "#F5F5F5",
                          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "20px",
                        }}
                      >
                        ✅
                      </div>
                      <h2 className="fw-bold mb-0 text-white" style={{ fontSize: "2rem", lineHeight: 1 }}>
                        {loading ? "—" : toolStats.completed}
                      </h2>
                    </div>
                    <h6 className="tool-status-label fw-bold mb-0" style={{ color: "#5A483E", fontSize: "1rem", lineHeight: "1.3" }}>
                      Selesai
                    </h6>
                  </div>
                </div>

                {/* Item 5: Ditolak */}
                <div className="col-12 col-md-4 col-xl">
                  <div className="tool-status-item d-flex align-items-center justify-content-start gap-3">
                    <div
                      className="tool-status-badge d-flex flex-column align-items-center justify-content-between p-3 text-white shadow-sm flex-shrink-0"
                      style={{
                        width: "105px",
                        height: "135px",
                        borderRadius: "18px",
                        background: "linear-gradient(180deg, #9C7A6B 0%, #836355 100%)",
                        boxShadow: "0 8px 18px rgba(131, 99, 85, 0.25)",
                      }}
                    >
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "12px",
                          background: "#F5F5F5",
                          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "20px",
                        }}
                      >
                        ❌
                      </div>
                      <h2 className="fw-bold mb-0 text-white" style={{ fontSize: "2rem", lineHeight: 1 }}>
                        {loading ? "—" : toolStats.rejected}
                      </h2>
                    </div>
                    <h6 className="tool-status-label fw-bold mb-0" style={{ color: "#5A483E", fontSize: "1rem", lineHeight: "1.3" }}>
                      Ditolak
                    </h6>
                  </div>
                </div>
              </div>

              {/* Footer Row */}
              <div className="tool-footer d-flex flex-column flex-sm-row justify-content-center align-items-center gap-2 gap-sm-3 mt-4 pt-3 border-top border-light">
                <span className="text-center text-sm-start" style={{ color: "#6A564C", fontSize: "0.9rem", fontWeight: "500" }}>
                  Lihat riwayat peminjaman alat anda disini
                </span>
                <button
                  className="btn text-white fw-semibold shadow-sm px-4 py-2"
                  style={{
                    borderRadius: 30,
                    backgroundColor: "#9A7A6D",
                    fontSize: "0.85rem",
                    transition: "all 0.3s ease",
                    border: "none",
                  }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = "#836355")}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = "#9A7A6D")}
                  onClick={() => history.push("/dashboard/detailPengajuan")}
                >
                  Riwayat Peminjaman Alat
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }
        
        @media (max-width: 767.98px) {
          .tool-summary-card {
            border-radius: 18px !important;
          }
          .tool-status-item {
            background-color: #FAF8F6;
            padding: 10px 14px;
            border-radius: 16px;
            border: 1px solid #F0ECE8;
          }
          .tool-status-badge {
            width: 90px !important;
            height: 120px !important;
            border-radius: 14px !important;
          }
          .tool-status-badge h2 {
            font-size: 1.6rem !important;
          }
          .tool-status-label {
            font-size: 0.95rem !important;
          }
        }

        @media (min-width: 768px) and (max-width: 991.98px) {
          .tool-status-badge {
            width: 95px !important;
            height: 125px !important;
          }
          .tool-status-label {
            font-size: 0.9rem !important;
          }
        }
      `}</style>
      <FooterSetelahLogin />
    </NavbarLoginKlien>
  );
}

export default Dashboard;
