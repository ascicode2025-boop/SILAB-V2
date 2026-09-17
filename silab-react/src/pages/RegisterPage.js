import React, { useState, useEffect } from "react";
import { Form, Button, InputGroup } from "react-bootstrap";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import "../css/RegisterPage.css";
import { getApiBaseUrl } from "../config/apiConfig";

const API_URL = getApiBaseUrl();

function RegisterPage() {
  useEffect(() => {
    document.title = "SILAB-NTDK - Daftar";
  }, []);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    institusi: "",
    nomor_telpon: "",
    password: "",
    password_confirmation: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (formData.password.length < 8) {
      setError("Password minimal 8 karakter.");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      setError("Password dan Konfirmasi Password tidak cocok.");
      setLoading(false);
      return;
    }

    if (!formData.institusi) {
      setError("Silakan pilih tipe institusi Anda.");
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${API_URL}/register`, formData);
      setLoading(false);
      setSuccess("Registrasi berhasil! Anda akan dialihkan ke halaman Login...");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (err) {
      setLoading(false);
      const errors = err.response?.data?.errors;
      const message = err.response?.data?.message || "";

      console.error("Validation error response:", err.response?.data);

      if (errors && typeof errors === "object" && Object.keys(errors).length > 0) {
        const errorList = Object.values(errors).flat();
        setError(errorList.length > 1 ? errorList : errorList[0]);
      } else if (message) {
        setError(message);
      } else {
        setError("Registrasi gagal. Tidak bisa terhubung ke server.");
      }
    }
  };

  return (
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
          maxWidth: "450px",
          width: "100%",
          borderRadius: "12px",
        }}
      >
        {/* Logo */}
        <img src="/asset/gambarLogo.png" alt="IPB University" className="login-logo mb-4" style={{ width: "200px", maxWidth: "80%" }} />

        {/* Judul */}
        <h5 className="login-title fw-semibold mb-3" style={{ fontSize: "14px", color: "#8D6E63" }}>
          Sistem Informasi Laboratorium Nutrisi Ternak Daging dan Kerja
        </h5>

        {/* Pesan Error / Success */}
        {error && (
          <div
            style={{
              backgroundColor: "#fef2f2",
              border: "1px solid #ef4444",
              color: "#b91c1c",
              padding: "10px 14px",
              borderRadius: "8px",
              marginBottom: "15px",
              fontSize: "13px",
              textAlign: "left",
            }}
          >
            {Array.isArray(error) ? (
              <ul className="mb-0 ps-3">
                {error.map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
            ) : (
              <div>{error}</div>
            )}
          </div>
        )}
        {success && (
          <div
            style={{
              backgroundColor: "rgba(0,128,0,0.1)",
              border: "1px solid green",
              color: "green",
              padding: "8px 12px",
              borderRadius: "6px",
              marginBottom: "15px",
              fontSize: "13px",
            }}
          >
            {success}
          </div>
        )}

        {/* Form Register */}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3 text-start">
            <Form.Label className="fw-medium">Username</Form.Label>
            <Form.Control type="text" placeholder="Masukkan username" name="name" value={formData.name} onChange={handleChange} required style={{ borderRadius: "8px", padding: "10px" }} />
          </Form.Group>

          <Form.Group className="mb-3 text-start">
            <Form.Label className="fw-medium">Email</Form.Label>
            <Form.Control type="email" placeholder="Masukkan email" name="email" value={formData.email} onChange={handleChange} required style={{ borderRadius: "8px", padding: "10px" }} />
          </Form.Group>

          <Form.Group className="mb-3 text-start">
            <Form.Label className="fw-medium">Institusi</Form.Label>
            <Form.Select name="institusi" value={formData.institusi} onChange={handleChange} required style={{ borderRadius: "8px", padding: "10px" }}>
              <option value="" disabled>
                -- Pilih Jenis Institusi --
              </option>

              {/* GROUP EKSTERNAL */}
              <optgroup label="Eksternal">
                <option value="Umum">Umum / Instansi Luar</option>
              </optgroup>

              {/* GROUP INTERNAL IPB */}
              <optgroup label="Internal IPB">
                <option value="Mahasiswa IPB">Mahasiswa IPB</option>
                <option value="Dosen IPB">Dosen IPB</option>
                <option value="Tendik IPB">Tendik IPB</option>
              </optgroup>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3 text-start">
            <Form.Label className="fw-medium">Nomor Telpon</Form.Label>
            <Form.Control type="text" placeholder="Masukkan nomor telpon" name="nomor_telpon" value={formData.nomor_telpon} onChange={handleChange} required style={{ borderRadius: "8px", padding: "10px" }} />
          </Form.Group>

          <Form.Group className="mb-4 text-start">
            <Form.Label className="fw-medium">Password</Form.Label>
            <InputGroup>
              <Form.Control type={showPassword ? "text" : "password"} placeholder="Masukkan password (min. 8 karakter)" name="password" value={formData.password} onChange={handleChange} required style={{ borderRadius: "8px", padding: "10px" }} />
              <Button variant="light" onClick={() => setShowPassword(!showPassword)} className="border" style={{ borderRadius: "0 8px 8px 0" }}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </Button>
            </InputGroup>
            <Form.Text className="text-muted" style={{ fontSize: "12px" }}>
              Minimal 8 karakter.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-4 text-start">
            <Form.Label className="fw-medium">Konfirmasi Password</Form.Label>
            <InputGroup>
              <Form.Control
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Konfirmasi password"
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                required
                style={{ borderRadius: "8px", padding: "10px" }}
              />
              <Button variant="light" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="border" style={{ borderRadius: "0 8px 8px 0" }}>
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
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
            {loading ? "Mendaftar..." : "Register"}
          </Button>
        </Form>

        <p className="mt-3 mb-0" style={{ fontSize: "0.85rem" }}>
          Sudah punya akun?{" "}
          <a href="/login" style={{ color: "#4f46e5" }}>
            Login di sini
          </a>
        </p>
      </div>

      {/* ✅ Tambahan CSS Responsif */}
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
        `}
      </style>
    </div>
  );
}

export default RegisterPage;
