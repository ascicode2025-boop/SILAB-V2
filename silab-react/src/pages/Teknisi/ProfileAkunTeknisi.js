import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Image, Dropdown, Spinner } from "react-bootstrap";
import FooterSetelahLogin from "../FooterSetelahLogin";
import NavbarProfile from "../Klien/NavbarProfile";
// Import Icon tambahan untuk visualisasi achievement
import { FaUserCircle, FaShoppingBag, FaSignInAlt, FaMedal, FaTrophy, FaStar, FaFlask, FaClipboardCheck, FaCertificate, FaAward } from "react-icons/fa";
import { useHistory } from "react-router-dom";
import axios from "axios";
import "@fontsource/poppins";
import { getApiBaseUrl, getStorageUrl } from "../../config/apiConfig";

const API_URL = getApiBaseUrl();
const STORAGE_URL = getStorageUrl();

function ProfileAkunTeknisi() {
  useEffect(() => {
    document.title = "SILAB-NTDK - Profil Akun Teknisi";
  }, []);

  const history = useHistory();
  const [user, setUser] = useState(null);

  // State untuk menampung data statistik & list achievement
  const [stats, setStats] = useState({ total_orders: 0, total_login: 0, total_achievements: 0 });
  const [achievementsList, setAchievementsList] = useState([]);

  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      history.push("/login");
      return;
    }

    axios
      .get(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        // 1. Simpan Data User
        setUser(res.data.user);

        // 2. Simpan Data Statistik
        if (res.data.stats) {
          setStats(res.data.stats);
        }

        // 3. Simpan Daftar Achievement
        if (res.data.achievements_list) {
          setAchievementsList(res.data.achievements_list);
        }
      })
      .catch((err) => {
        console.error(err);
        localStorage.clear();
        history.push("/login");
      })
      .finally(() => setLoading(false));
  }, [history, token]);

  // Helper untuk menentukan Ikon Achievement berdasarkan tipe
  const renderAchievementIcon = (type) => {
    switch (type) {
      case "login":
        return <FaSignInAlt className="text-warning mb-2" size={32} />;
      case "orders":
        return <FaShoppingBag className="text-info mb-2" size={32} />;
      case "analysis":
        return <FaFlask className="text-primary mb-2" size={32} />;
      case "verification":
        return <FaClipboardCheck className="text-success mb-2" size={32} />;
      case "certification":
        return <FaCertificate className="text-danger mb-2" size={32} />;
      case "award":
        return <FaAward className="text-warning mb-2" size={32} />;
      default:
        return <FaMedal className="text-success mb-2" size={32} />;
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5" style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  const avatarUrl = user.avatar ? `${STORAGE_URL}/storage/${user.avatar}` : null;

  return (
    <>
      {/* ===== NAVBAR ===== */}
      <NavbarProfile user={user} />

      {/* ===== MAIN CONTENT ===== */}
      <div className="container mt-5 mb-5 font-poppins">
        <div className="row justify-content-center">
          <div className="col-md-8">
            {/* PROFILE HEADER */}
            <div className="card mb-4 shadow-sm border-0" style={{ borderRadius: "15px" }}>
              <div className="card-body d-flex align-items-center flex-wrap p-4">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="rounded-circle me-4 mb-3 mb-md-0 shadow-sm" width="120" height="120" style={{ objectFit: "cover" }} />
                ) : (
                  <FaUserCircle size={120} className="me-4 text-secondary mb-3 mb-md-0" />
                )}

                <div>
                  <h3 className="fw-bold">{user.full_name || user.name}</h3>
                  <span className="badge bg-success mb-2">Teknisi Lab IPB</span>
                  <p className="text-muted mb-0">{user.email}</p>
                </div>
              </div>
            </div>

            {/* STATS (DATA NYATA) */}
            <div className="row text-center mb-4 g-3">
              <div className="col-4">
                <div className="card py-3 shadow-sm border-0 h-100" style={{ background: "#f8f9fa", borderRadius: "12px" }}>
                  <div className="card-body">
                    <FaFlask className="text-primary mb-2" size={24} />
                    {/* TAMPILKAN ANGKA TOTAL ANALISIS */}
                    <h4 className="fw-bold mb-0">{stats.total_orders}</h4>
                    <small className="text-muted">Total Analisis</small>
                  </div>
                </div>
              </div>
              <div className="col-4">
                <div className="card py-3 shadow-sm border-0 h-100" style={{ background: "#f8f9fa", borderRadius: "12px" }}>
                  <div className="card-body">
                    <FaSignInAlt className="text-warning mb-2" size={24} />
                    {/* TAMPILKAN ANGKA TOTAL LOGIN */}
                    <h4 className="fw-bold mb-0">{stats.total_login}</h4>
                    <small className="text-muted">Keaktifan (Login)</small>
                  </div>
                </div>
              </div>
              <div className="col-4">
                <div className="card py-3 shadow-sm border-0 h-100" style={{ background: "#f8f9fa", borderRadius: "12px" }}>
                  <div className="card-body">
                    <FaTrophy className="text-success mb-2" size={24} />
                    {/* TAMPILKAN ANGKA TOTAL ACHIEVEMENT */}
                    <h4 className="fw-bold mb-0">{stats.total_achievements}</h4>
                    <small className="text-muted">Achievements</small>
                  </div>
                </div>
              </div>
            </div>

            {/* KOLEKSI PENGHARGAAN / ACHIEVEMENT LIST */}
            <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: "15px" }}>
              <div className="card-header bg-white border-0 pt-4 pb-0">
                <h5 className="fw-bold text-dark">
                  <FaStar className="text-warning me-2" /> Koleksi Penghargaan
                </h5>
              </div>
              <div className="card-body">
                {achievementsList.filter((a) => a.type !== "orders").length > 0 ? (
                  <div className="row g-3">
                    {achievementsList
                      .filter((a) => a.type !== "orders")
                      .map((item, index) => (
                        <div className="col-4 col-md-3 text-center" key={index}>
                          <div className="p-2 border rounded bg-light h-100">
                            {/* Render Icon Sesuai Tipe */}
                            {renderAchievementIcon(item.type)}
                            <h6 className="fw-bold" style={{ fontSize: "14px", marginBottom: "4px" }}>
                              {item.name}
                            </h6>
                            <small className="text-muted d-block" style={{ fontSize: "10px", lineHeight: "1.2" }}>
                              {item.description}
                            </small>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted">
                    <small>Belum ada penghargaan yang diraih.</small>
                    <br />
                    <small>Tingkatkan analisis dan login Anda!</small>
                  </div>
                )}
              </div>
            </div>

            {/* BIO */}
            <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: "15px" }}>
              <div className="card-body p-4">
                <h5 className="card-title fw-bold mb-3">Bio</h5>
                <p className="card-text text-muted">{user.bio ? user.bio : <span className="fst-italic">Pengguna ini belum menulis bio.</span>}</p>
              </div>
            </div>

            <div className="mt-4 mb-5 d-flex gap-2">
              <button className="btn btn-primary fw-bold px-4 py-2" style={{ borderRadius: "8px" }} onClick={() => history.push("/teknisi/dashboard/profile/edit")}>
                Edit Profile
              </button>
              <button className="btn btn-outline-secondary fw-bold px-4 py-2" style={{ borderRadius: "8px" }} onClick={() => history.push("/teknisi/dashboard")}>
                Kembali
              </button>
            </div>
          </div>
        </div>
      </div>

      <FooterSetelahLogin />
    </>
  );
}

export default ProfileAkunTeknisi;
