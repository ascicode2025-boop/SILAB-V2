import React, { useState, useEffect } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const API_URL = process.env.REACT_APP_API_BASE_URL || "https://api.silabntdk.com/api";

function ForgetPassword() {
  useEffect(() => {
    document.title = "SILAB-NTDK - Lupa Password";
  }, []);

  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const history = useHistory();

  const cardStyle = {
    maxWidth: "420px",
    margin: "60px auto",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
    backgroundColor: "#ffffff",
  };

  const labelStyle = {
    fontWeight: 600,
    fontSize: "14px",
    color: "#4E342E",
  };

  const inputWrapper = {
    position: "relative",
    width: "100%",
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 40px 10px 12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    marginTop: "6px",
  };

  const buttonStyle = {
    width: "100%",
    padding: "12px",
    marginTop: "5px",
    backgroundColor: "#8D6E63",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
  };

  const iconStyle = {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    color: "#6d6d6d",
  };

  const sendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await axios.post(`${API_URL}/send-otp`, { email });
      setMessage("OTP telah dikirim ke email Anda");
      setStep("otp");
    } catch (err) {
      setError(err.response?.data?.message || "Email tidak ditemukan");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = (e) => {
    e.preventDefault();
    if (otp.length === 6) {
      setStep("password");
      setError("");
    } else {
      setError("OTP harus 6 digit");
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Password tidak cocok");
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${API_URL}/reset-password`, {
        email,
        otp,
        password,
        password_confirmation: confirmPassword,
      });
      setMessage("Password berhasil direset");
      setTimeout(() => history.push("/login"), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={cardStyle}>
      <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#5D4037" }}>Lupa Password</h2>

      {message && <div style={{ color: "green", marginBottom: "15px", textAlign: "center" }}>{message}</div>}
      {error && <div style={{ color: "red", marginBottom: "15px", textAlign: "center" }}>{error}</div>}

      {step === "email" && (
        <form onSubmit={sendOtp}>
          <label style={labelStyle}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? "Mengirim..." : "Kirim OTP"}
          </button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={verifyOtp}>
          <label style={labelStyle}>Kode OTP (6 digit)</label>
          <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} required style={inputStyle} />

          <button type="submit" style={buttonStyle}>
            Verifikasi OTP
          </button>
        </form>
      )}

      {step === "password" && (
        <form onSubmit={resetPassword}>
          <label style={labelStyle}>Password Baru</label>
          <div style={inputWrapper}>
            <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
            <span style={iconStyle} onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <label style={{ ...labelStyle, marginTop: "15px" }}>Konfirmasi Password</label>
          <div style={inputWrapper}>
            <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required style={inputStyle} />
            <span style={iconStyle} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? "Menyimpan..." : "Reset Password"}
          </button>
        </form>
      )}

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button onClick={() => history.push("/login")} style={{ background: "none", border: "none", color: "#6A4F4B", textDecoration: "underline", cursor: "pointer" }}>
          Kembali ke Login
        </button>
      </div>
    </div>
  );
}

export default ForgetPassword;
