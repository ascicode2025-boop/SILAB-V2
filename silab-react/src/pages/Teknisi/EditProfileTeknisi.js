import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Image, Spinner } from "react-bootstrap";
import FooterSetelahLogin from "../FooterSetelahLogin";
import NavbarProfile from "../Klien/NavbarProfile";
import CustomPopup from "../../components/Common/CustomPopup";
import { FaUserCircle, FaCamera } from "react-icons/fa";
import { useHistory } from "react-router-dom";
import axios from "axios";
import "@fontsource/poppins";

import { getApiBaseUrl, getStorageUrl } from "../../config/apiConfig";

const API_URL = getApiBaseUrl();
const STORAGE_URL = getStorageUrl();

function EditProfileTeknisi() {
  useEffect(() => {
    document.title = "SILAB-NTDK - Edit Profil Teknisi";
  }, []);

  const history = useHistory();
  const token = localStorage.getItem("token");

  // State Form
  const [formData, setFormData] = useState({
    name: "",
    full_name: "",
    email: "",
    institusi: "Teknisi Lab IPB", // Default dan tidak dapat diubah
    nomor_telpon: "",
    role: "",
    bio: "",
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);

  // State untuk popup
  const [popup, setPopup] = useState({ show: false, title: "", message: "", type: "info", onClose: null });

  // 1. LOAD DATA DARI DATABASE
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
        const user = res.data.user;

        // Deteksi User Baru (Jika Nama Lengkap masih kosong)
        if (!user.full_name) {
          setIsFirstTime(true);
        } else {
          setIsFirstTime(false);
        }

        // Isi form dengan data yang ada (Username & Email dari Register pasti masuk sini)
        setFormData({
          name: user.name || "",
          full_name: user.full_name || "",
          email: user.email || "",
          institusi: user.institusi || "Teknisi Lab IPB",
          nomor_telpon: user.nomor_telpon || "",
          role: user.role || "",
          bio: user.bio || "",
        });

        if (user.avatar) {
          setPreviewAvatar(`${STORAGE_URL}/storage/${user.avatar}`);
        }
      })
      .catch((err) => {
        console.error("Gagal ambil data:", err);
      })
      .finally(() => setLoading(false));
  }, [history, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Institusi tidak dapat diubah
    if (name === "institusi") return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setPreviewAvatar(URL.createObjectURL(file));
    }
  };

  // 2. FUNGSI SIMPAN DENGAN VALIDASI WAJIB ISI
  const handleSave = async () => {
    // --- [VALIDASI FRONTEND] ---
    if (!formData.full_name.trim()) {
      setPopup({
        show: true,
        title: "Nama Lengkap wajib diisi!",
        message: "Mohon isi nama lengkap Anda sebelum menyimpan profil.",
        type: "error",
        onClose: () => setPopup((p) => ({ ...p, show: false })),
      });
      return;
    }
    if (!formData.nomor_telpon.trim()) {
      setPopup({
        show: true,
        title: "Nomor Telepon wajib diisi!",
        message: "Mohon isi nomor telepon Anda sebelum menyimpan profil.",
        type: "error",
        onClose: () => setPopup((p) => ({ ...p, show: false })),
      });
      return;
    }

    setSaving(true);
    const dataToSend = new FormData();
    dataToSend.append("name", formData.name);
    dataToSend.append("full_name", formData.full_name);
    dataToSend.append("institusi", formData.institusi || "");
    dataToSend.append("nomor_telpon", formData.nomor_telpon);
    dataToSend.append("bio", formData.bio || "");
    dataToSend.append("email", formData.email);
    if (avatarFile) {
      dataToSend.append("avatar", avatarFile);
    }

    try {
      const response = await axios.post(`${API_URL}/profile/update`, dataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Update LocalStorage agar NavbarLogin tahu data sudah lengkap
      const updatedUser = response.data.user;
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // --- LOGIKA REDIRECT ---
      if (isFirstTime) {
        setPopup({
          show: true,
          title: "Profil Lengkap!",
          message: "Selamat! Profil Anda sudah lengkap. Anda akan diarahkan ke Dashboard.",
          type: "success",
          onClose: () => {
            setPopup((p) => ({ ...p, show: false }));
            history.push("/teknisi/dashboard");
          },
        });
      } else {
        setPopup({
          show: true,
          title: "Profil berhasil diperbarui!",
          message: "Data profil Anda telah berhasil disimpan.",
          type: "success",
          onClose: () => {
            setPopup((p) => ({ ...p, show: false }));
            history.push("/teknisi/dashboard/profile");
          },
        });
      }
    } catch (error) {
      console.error("Gagal update:", error.response);
      const msg = error.response?.data?.message || "Terjadi kesalahan saat menyimpan.";
      const validationErrors = error.response?.data?.errors;

      if (validationErrors) {
        if (validationErrors.avatar) {
          setPopup({
            show: true,
            title: "Gagal upload avatar",
            message: `${validationErrors.avatar[0]}\nPastikan file adalah gambar (JPG, PNG, GIF, BMP, WEBP, TIFF)`,
            type: "error",
            onClose: () => setPopup((p) => ({ ...p, show: false })),
          });
        } else if (validationErrors.name) {
          setPopup({
            show: true,
            title: "Gagal menyimpan profil",
            message: validationErrors.name[0],
            type: "error",
            onClose: () => setPopup((p) => ({ ...p, show: false })),
          });
        } else if (validationErrors.full_name) {
          setPopup({
            show: true,
            title: "Gagal menyimpan profil",
            message: validationErrors.full_name[0],
            type: "error",
            onClose: () => setPopup((p) => ({ ...p, show: false })),
          });
        } else {
          setPopup({
            show: true,
            title: "Gagal menyimpan profil",
            message: msg,
            type: "error",
            onClose: () => setPopup((p) => ({ ...p, show: false })),
          });
        }
      } else {
        setPopup({
          show: true,
          title: "Gagal menyimpan profil",
          message: msg,
          type: "error",
          onClose: () => setPopup((p) => ({ ...p, show: false })),
        });
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5" style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  const userForNavbar = {
    name: formData.name,
    role: formData.role,
    avatar: previewAvatar,
  };

  return (
    <>
      <NavbarProfile user={userForNavbar} />

      <div className="container mt-5 mb-5 font-poppins">
        <div className="row justify-content-center">
          <div className="col-md-8">
            {/* FOTO PROFIL (Opsional) */}
            <div className="text-center mb-4">
              <div className="position-relative d-inline-block">
                {previewAvatar ? <Image src={previewAvatar} roundedCircle width={150} height={150} className="shadow-sm border" style={{ objectFit: "cover" }} /> : <FaUserCircle size={150} className="text-secondary" />}
                <label htmlFor="avatarInput" className="position-absolute bottom-0 end-0 bg-primary text-white p-2 rounded-circle shadow" style={{ cursor: "pointer" }}>
                  <FaCamera size={18} />
                </label>
              </div>
              <div className="mt-3">
                <h4 className="fw-bold mb-0">{formData.full_name || formData.name}</h4>
                <p className="text-muted small">@{formData.name}</p>
              </div>
              <input type="file" accept="image/*" id="avatarInput" style={{ display: "none" }} onChange={handleAvatarChange} />
            </div>
            {/* FORM DATA */}
            <div className="card shadow-sm border-0" style={{ borderRadius: "15px" }}>
              <div className="card-body p-4">
                {/* USERNAME (Wajib, Unik) */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Username <span className="text-danger">*</span> <small className="text-muted">(Unik)</small>
                  </label>
                  <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                {/* NAMA LENGKAP (Wajib) */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Nama Lengkap <span className="text-danger">*</span>
                  </label>
                  <input type="text" className="form-control" name="full_name" value={formData.full_name} onChange={handleChange} placeholder="Contoh: Aryanto Pratama, S.Kom" required />
                </div>
                {/* EMAIL (Bisa diedit) */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Email <span className="text-danger">*</span>
                  </label>
                  <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required />
                </div>
                {/* INSTITUSI (Read Only - Teknisi Lab IPB) */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Institusi</label>
                  <input type="text" className="form-control bg-light" name="institusi" value={formData.institusi} disabled style={{ cursor: "not-allowed" }} />
                  <small className="text-muted">Institusi tidak dapat diubah untuk akun teknisi.</small>
                </div>
                {/* NO TELPON (Wajib) */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Nomor Telepon <span className="text-danger">*</span>
                  </label>
                  <input type="text" className="form-control" name="nomor_telpon" value={formData.nomor_telpon} onChange={handleChange} placeholder="Contoh: 08123456789" required />
                </div>
                {/* ROLE (Read Only) */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Role</label>
                  <input type="text" className="form-control bg-light" name="role" value={formData.role ? formData.role.toUpperCase() : ""} disabled />
                </div>
                {/* BIO (Opsional - Tidak ada tanda bintang) */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Bio</label>
                  <textarea className="form-control" name="bio" value={formData.bio} onChange={handleChange} rows={4} placeholder="Tulis bio singkat (opsional)..." />
                </div>
                <div className="d-flex gap-2 mt-4">
                  <button className="btn btn-primary px-4 fw-bold" onClick={handleSave} disabled={saving}>
                    {saving ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : "Simpan Profil"}
                  </button>
                  {/* Tombol Batal disembunyikan jika User Baru agar mereka fokus mengisi */}
                  {!isFirstTime && (
                    <button className="btn btn-outline-secondary px-4 fw-bold" onClick={() => history.goBack()} disabled={saving}>
                      Batal
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <CustomPopup show={popup.show} title={popup.title} message={popup.message} type={popup.type} buttonText="OK" onClose={popup.onClose} />
      <FooterSetelahLogin />
    </>
  );
}

export default EditProfileTeknisi;
