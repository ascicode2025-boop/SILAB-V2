import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Image, Dropdown, Spinner } from "react-bootstrap";
import FooterSetelahLogin from "../FooterSetelahLogin";
import NavbarProfileKepala from "./NavbarProfileKepala";
import { FaUserCircle, FaClipboardCheck, FaSignInAlt, FaMedal, FaAward, FaCertificate } from "react-icons/fa";
import { useHistory } from "react-router-dom";
import axios from "axios";
import "@fontsource/poppins";
import { getApiBaseUrl, getStorageUrl } from "../../config/apiConfig";

const API_URL = getApiBaseUrl();
const STORAGE_URL = getStorageUrl();

function ProfileAkunKepala() {
  useEffect(() => {
    document.title = "SILAB-NTDK - Profil Akun Kepala";
  }, []);

  const history = useHistory();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ total_verifikasi: 0, total_login: 0, total_achievements: 0 });
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
        setUser(res.data.user);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
        if (res.data.achievements_list) {
          setAchievementsList(res.data.achievements_list.filter((a) => a.type !== "orders" && a.type !== "analysis"));
        }
      })
      .catch((err) => {
        console.error(err);
        localStorage.clear();
        history.push("/login");
      })
      .finally(() => setLoading(false));
  }, [history, token]);

  const renderAchievementIcon = (type) => {
    switch (type) {
      case "login":
        return <FaSignInAlt className="text-warning mb-2" size={32} />;
      case "verifikasi":
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

  const avatarUrl = user?.avatar ? `${STORAGE_URL}/storage/${user.avatar}` : null;

  return (
    <>
      <NavbarProfileKepala user={user} />
      <div className="container mt-5 mb-5 font-poppins">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card mb-4 shadow-sm border-0" style={{ borderRadius: "15px" }}>
              <div className="card-body d-flex align-items-center flex-wrap p-4">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="rounded-circle me-4 mb-3 mb-md-0 shadow-sm" width="120" height="120" style={{ objectFit: "cover" }} />
                ) : (
                  <FaUserCircle size={120} className="me-4 text-secondary mb-3 mb-md-0" />
                )}
                <div>
                  <h3 className="fw-bold">{user?.full_name || user?.name}</h3>
                  <span className="badge bg-info mb-2">Kepala Lab IPB</span>
                  <p className="text-muted mb-0">{user?.email}</p>
                </div>
              </div>
            </div>
            <div className="row text-center mb-4 g-3">
              <div className="col-4">
                <div className="card py-3 shadow-sm border-0 h-100" style={{ background: "#f8f9fa", borderRadius: "12px" }}>
                  <div className="card-body">
                    <FaClipboardCheck className="text-success mb-2" size={24} />
                    <h4 className="fw-bold mb-0">{stats.total_verifikasi}</h4>
                    <small className="text-muted">Total Verifikasi</small>
                  </div>
                </div>
              </div>
              <div className="col-4">
                <div className="card py-3 shadow-sm border-0 h-100" style={{ background: "#f8f9fa", borderRadius: "12px" }}>
                  <div className="card-body">
                    <FaSignInAlt className="text-warning mb-2" size={24} />
                    <h4 className="fw-bold mb-0">{stats.total_login}</h4>
                    <small className="text-muted">Keaktifan (Login)</small>
                  </div>
                </div>
              </div>
              <div className="col-4">
                <div className="card py-3 shadow-sm border-0 h-100" style={{ background: "#f8f9fa", borderRadius: "12px" }}>
                  <div className="card-body">
                    <FaAward className="text-success mb-2" size={24} />
                    <h4 className="fw-bold mb-0">{stats.total_achievements}</h4>
                    <small className="text-muted">Achievements</small>
                  </div>
                </div>
              </div>
            </div>
            <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: "15px" }}>
              <div className="card-header bg-white border-0 pt-4 pb-0">
                <h5 className="fw-bold text-dark">
                  <FaAward className="text-warning me-2" /> Koleksi Penghargaan
                </h5>
              </div>
              <div className="card-body">
                {achievementsList.length > 0 ? (
                  <div className="row g-3">
                    {achievementsList.map((item, index) => (
                      <div className="col-4 col-md-3 text-center" key={index}>
                        <div className="p-2 border rounded bg-light h-100">
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
                    <small>Tingkatkan verifikasi dan login Anda!</small>
                  </div>
                )}
              </div>
            </div>
            <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: "15px" }}>
              <div className="card-body p-4">
                <h5 className="card-title fw-bold mb-3">Bio</h5>
                <p className="card-text text-muted">{user?.bio ? user.bio : <span className="fst-italic">Pengguna ini belum menulis bio.</span>}</p>
              </div>
            </div>
            <div className="mt-4 mb-5 d-flex gap-2">
              <button className="btn btn-primary fw-bold px-4 py-2" style={{ borderRadius: "8px" }} onClick={() => history.push("/kepala/dashboard/profile/edit")}>
                Edit Profile
              </button>
              <button className="btn btn-outline-secondary fw-bold px-4 py-2" style={{ borderRadius: "8px" }} onClick={() => history.push("/kepala/dashboard")}>
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

export default ProfileAkunKepala;
