import React, { useState, useEffect } from "react";
import CustomPopup from "../components/Common/CustomPopup";
import { Form, Button, InputGroup } from "react-bootstrap";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link, useHistory } from "react-router-dom";
import axios from "axios";
import { setSession } from "../services/AuthService";
import "../css/LoginPage.css";

import { getApiBaseUrl } from "../config/apiConfig";

// URL API
const API_URL = getApiBaseUrl();

function LoginPage() {
  useEffect(() => {
    document.title = "SILAB-NTDK - Login";
  }, []);

  const history = useHistory();
  const [showPassword, setShowPassword] = useState(false);

  // State Form
  const [formData, setFormData] = useState({
    name: "",
    password: "",
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  // State untuk popup
  const [popup, setPopup] = useState({ show: false, title: "", message: "", type: "info", onClose: null });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validasi Username
    if (!formData.name.trim()) {
      setLoading(false);
      setError("Username tidak boleh kosong.");
      return;
    }

    try {
      // POST ke Backend
      const response = await axios.post(`${API_URL}/login`, formData, {
        headers: {
          Accept: "application/json",
        },
      });

      const { access_token, user } = response.data;

      // Validasi Token
      if (!access_token) {
        throw new Error("Token tidak diterima dari server.");
      }

      console.log("Login Berhasil! Token:", access_token);
      console.log("User Role:", user.role);

      localStorage.setItem("token", access_token);
      localStorage.setItem("user", JSON.stringify(user)); // Simpan data user lengkap
      localStorage.setItem("role", user.role);

      setSession(access_token, user);

      setLoading(false);

      // ============================================================
      // 🔥 LOGIKA PENGALIHAN (REDIRECT) PROFIL BELUM LENGKAP 🔥
      // ============================================================

      // Jika role adalah 'klien' DAN (Nama Lengkap kosong ATAU Institusi kosong)
      if (user.role === "klien" && (!user.full_name || !user.institusi)) {
        setPopup({
          show: true,
          title: "Lengkapi Data Diri",
          message: "Halo! Karena Anda pengguna baru, silakan lengkapi Data Profil Anda terlebih dahulu agar bisa menggunakan layanan kami.",
          type: "info",
          onClose: () => {
            setPopup((p) => ({ ...p, show: false }));
            history.push("/dashboard/ProfileAkunKlien/EditProfileKlien");
          },
        });
        return;
      }

      // ============================================================

      // Logika Redirect Normal (Jika profil sudah lengkap)
      switch (user.role) {
        case "teknisi":
          history.push("/teknisi/dashboard");
          break;
        case "koordinator":
          history.push("/koordinator/dashboard");
          break;
        case "kepala":
          history.push("/kepala/dashboard");
          break;
        case "klien":
          history.push("/dashboard");
          break;
        default:
          history.push("/dashboard");
          break;
      }
    } catch (err) {
      setLoading(false);
      console.error("Login Error:", err);

      if (err.response) {
        if (err.response.status === 401) {
          setError("Username atau password salah.");
        } else if (err.response.status === 403) {
          // Akun dinonaktifkan - tampilkan pesan langsung tanpa kode error
          setError(err.response.data.message || "Akun Anda telah dinonaktifkan. Silakan hubungi administrator.");
        } else if (err.response.status === 422) {
          const validationErrors = err.response.data.errors;
          let errorMessage = "Data tidak valid. ";
          if (validationErrors) {
            const errorFields = Object.keys(validationErrors);
            errorMessage += errorFields.map((field) => `${field}: ${validationErrors[field].join(", ")}`).join("; ");
          } else {
            errorMessage += err.response.data.message || "Periksa input Anda.";
          }
          setError(errorMessage);
        } else if (err.response.status === 429) {
          // Throttle / Too Many Requests - show friendly message (use server message if provided)
          const retryAfter = err.response.headers && (err.response.headers['retry-after'] || err.response.headers['Retry-After']);
          let minutes = null;
          if (retryAfter) {
            const secs = Number(retryAfter);
            if (!isNaN(secs) && secs > 0) minutes = Math.ceil(secs / 60);
          }
          const serverMsg = err.response.data && err.response.data.message;
          setError(serverMsg || (minutes ? `Terlalu banyak percobaan. Silakan coba lagi dalam ${minutes} menit.` : "Terlalu banyak percobaan. Silakan coba lagi nanti."));
        } else {
          setError(`Error ${err.response.status}: ${err.response.data.message || "Terjadi kesalahan di server."}`);
        }
      } else if (err.request) {
        setError("Tidak dapat terhubung ke server. Periksa koneksi internet atau URL API.");
      } else {
        setError("Terjadi kesalahan tak terduga.");
      }
    }
  };

  return (
    <>
      <div
        className="login-page d-flex justify-content-center align-items-center"
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f3f4f6, #e5e7eb)",
          padding: "20px",
        }}
      >
        <div
          className="login-container text-center p-5 rounded shadow"
          style={{
            backgroundColor: "#fff",
            maxWidth: "400px",
            width: "100%",
            borderRadius: "12px",
          }}
        >
          <img src="/asset/gambarLogo.png" alt="IPB University" className="login-logo mb-4" style={{ width: "200px", maxWidth: "80%" }} />

          <h5 className="login-title fw-semibold mb-3" style={{ fontSize: "14px", color: "#8D6E63" }}>
            Sistem Informasi Laboratorium Nutrisi Ternak Daging dan Kerja
          </h5>

          {error && (
            <div
              style={{
                backgroundColor: "rgba(255, 0, 0, 0.1)",
                border: "1px solid red",
                color: "red",
                padding: "8px 12px",
                borderRadius: "6px",
                marginBottom: "15px",
                fontSize: "13px",
                transition: "all 0.3s ease-in-out",
              }}
            >
              {error}
            </div>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3 text-start">
              <Form.Label className="fw-medium">Username</Form.Label>
              <Form.Control type="text" placeholder="Masukkan Username" name="name" value={formData.name} onChange={handleChange} required style={{ borderRadius: "8px", padding: "10px" }} />
            </Form.Group>

            <Form.Group className="mb-4 text-start">
              <Form.Label className="fw-medium">Password</Form.Label>
              <InputGroup>
                <Form.Control type={showPassword ? "text" : "password"} placeholder="Masukkan password" name="password" value={formData.password} onChange={handleChange} required style={{ borderRadius: "8px", padding: "10px" }} />
                <Button
                  variant="light"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowPassword((s) => !s);
                  }}
                  className="border"
                  style={{
                    borderRadius: "0 8px 8px 0",
                  }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </Button>
              </InputGroup>
            </Form.Group>

            <Button
              type="submit"
              className="w-100 fw-semibold"
              disabled={loading}
              style={{
                background: "linear-gradient(90deg, #8D6E63, #8D6E63)",
                border: "none",
                color: "#fff",
                padding: "10px",
                fontSize: "15px",
                borderRadius: "8px",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
            >
              {loading ? "Memuat..." : "Login"}
            </Button>
          </Form>

          <p className="mt-3 mb-0" style={{ fontSize: "0.85rem" }}>
            Tidak Punya Akun?{" "}
            <Link to="/register" className="text-link" style={{ color: "#4f46e5" }}>
              Register Disini!
            </Link>
          </p>

          <p className="mt-3 mb-0" style={{ fontSize: "0.85rem" }}>
            <Link to="/forgetPassword" className="text-link" style={{ color: "#4f46e5" }}>
              Lupa Password?
            </Link>
          </p>
        </div>
      </div>

      <CustomPopup show={popup.show} title={popup.title} message={popup.message} type={popup.type} buttonText="Isi Data Profil" onClose={popup.onClose} />

      {/* TOMBOL FAQ WHATSAPP - FLOATING */}
      <a
        href="https://wa.me/6285691552140?text=Halo%20Admin%20SILAB-NTDK%2C%20saya%20ingin%20bertanya."
        target="_blank"
        rel="noopener noreferrer"
        className="faq-whatsapp-btn"
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          backgroundColor: "#25D366",
          color: "white",
          padding: "14px 24px",
          borderRadius: "50px",
          textDecoration: "none",
          fontWeight: "600",
          fontSize: "14px",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          boxShadow: "0 4px 15px rgba(37, 211, 102, 0.4)",
          transition: "all 0.3s ease",
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        <span>FAQ & Bantuan</span>
      </a>

      <style>
        {`
          @media (max-width: 576px) {
            .login-container {
              padding: 30px 20px !important;
              max-width: 95% !important;
              box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            }

            .login-title {
              font-size: 12px !important;
              line-height: 1.4;
            }

            .login-logo {
              width: 150px !important;
            }

            .form-label, .form-control, button, p {
              font-size: 0.9rem !important;
            }

            button[type="submit"] {
              padding: 8px 10px !important;
            }
          }

          .faq-whatsapp-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 8px 25px rgba(37, 211, 102, 0.5) !important;
          }
        `}
      </style>
    </>
  );
}

export default LoginPage;
