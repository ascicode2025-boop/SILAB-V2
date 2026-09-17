import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, InputGroup, Table, Modal, Dropdown } from "react-bootstrap";
import { getStorageUrl } from "../../config/apiConfig";
import { FaSearch, FaPlus, FaEye, FaPencilAlt, FaTrashAlt, FaImage } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import NavbarLoginTeknisi from "./NavbarLoginTeknisi";
import FooterSetelahLogin from "../FooterSetelahLogin";
import { getInstruments, createInstrument, updateInstrument, deleteInstrument } from "../../services/InstrumentService";

export default function InventarisAlat() {
  const storageUrl = getStorageUrl();
  const [equipmentList, setEquipmentList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [isLoading, setIsLoading] = useState(true);

  // ponytail: simple width hook; upgrade to shared hook if reused elsewhere
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const isMobile = windowWidth < 768;

  // Modal States
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Form State
  const [formData, setFormData] = useState({
    nama_alat: "",
    deskripsi: "",
    is_paid: false,
    harga_sewa: 0,
    total_unit: 1,
    unit_rusak: 0,
    unit_perawatan: 0,
  });
  // State for selected photo file
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    document.title = "SILAB-NTDK - Inventaris Alat";
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await getInstruments();
      setEquipmentList(Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Gagal mengambil data alat:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered Equipment List
  const filteredList = equipmentList.filter((item) => {
    const namaMatch = item.nama_alat ? item.nama_alat.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const descMatch = item.deskripsi ? item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const matchesSearch = namaMatch || descMatch;

    let matchesStatus = true;
    if (statusFilter === "tersedia") {
      const isTersedia = (item.total_unit || 1) - (item.unit_rusak || 0) - (item.unit_perawatan || 0) - (item.active_rentals_count || 0) > 0;
      matchesStatus = isTersedia;
    } else if (statusFilter === "dipinjam") {
      matchesStatus = (item.active_rentals_count || 0) > 0;
    } else if (statusFilter === "perawatan") {
      matchesStatus = (item.unit_perawatan || 0) > 0;
    } else if (statusFilter === "rusak") {
      matchesStatus = (item.unit_rusak || 0) > 0;
    }

    return matchesSearch && matchesStatus;
  });

  // Calculate stats based on units
  const totalAlat = equipmentList.reduce((acc, i) => acc + (parseInt(i.total_unit, 10) || 0), 0);
  const dipinjam = equipmentList.reduce((acc, i) => acc + (parseInt(i.active_rentals_count, 10) || 0), 0);
  const maintenance = equipmentList.reduce((acc, i) => acc + (parseInt(i.unit_perawatan, 10) || 0) + (parseInt(i.unit_rusak, 10) || 0), 0);
  const unitRusak = equipmentList.reduce((acc, i) => acc + (parseInt(i.unit_rusak, 10) || 0), 0);
  const tersedia = Math.max(0, totalAlat - dipinjam - maintenance);

  // Open Detail Modal
  const handleOpenDetail = (item) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  // Open Form Modal (Add or Edit)
  const handleOpenForm = (item = null) => {
    setFormErrors({});
    if (item) {
      setIsEditing(true);
      setSelectedItem(item);
      setFormData({
        nama_alat: item.nama_alat || "",
        deskripsi: item.deskripsi || "",
        is_paid: item.is_paid ? true : false,
        harga_sewa: item.harga_sewa || 0,
        total_unit: item.total_unit || 1,
        unit_rusak: item.unit_rusak || 0,
        unit_perawatan: item.unit_perawatan || 0,
      });
    } else {
      setIsEditing(false);
      setSelectedItem(null);
      setFormData({
        nama_alat: "",
        deskripsi: "",
        is_paid: false,
        harga_sewa: 0,
        total_unit: 1,
        unit_rusak: 0,
        unit_perawatan: 0,
      });
    }
    setShowFormModal(true);
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.nama_alat || !formData.nama_alat.trim()) {
      errors.nama_alat = "Nama alat wajib diisi.";
    }
    if (
      formData.total_unit === "" ||
      formData.total_unit === null ||
      parseInt(formData.total_unit, 10) < 1 ||
      isNaN(parseInt(formData.total_unit, 10))
    ) {
      errors.total_unit = "Total unit harus diisi minimal 1.";
    }
    if (formData.is_paid && (!formData.harga_sewa || parseInt(formData.harga_sewa, 10) <= 0)) {
      errors.harga_sewa = "Harga sewa wajib diisi lebih dari 0 untuk alat berbayar.";
    }
    if (!formData.deskripsi || !formData.deskripsi.trim()) {
      errors.deskripsi = "Deskripsi alat wajib diisi.";
    }
    const ur = parseInt(formData.unit_rusak, 10) || 0;
    const up = parseInt(formData.unit_perawatan, 10) || 0;
    const tu = parseInt(formData.total_unit, 10) || 1;
    if (ur < 0) errors.unit_rusak = "Tidak boleh negatif.";
    if (up < 0) errors.unit_perawatan = "Tidak boleh negatif.";
    if (ur + up > tu) {
      errors.unit_rusak = "Total rusak & perawatan melebihi total unit.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save Form (Add or Edit)
  const handleSaveForm = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    let payload;
    if (selectedFile) {
      payload = new FormData();
      payload.append('nama_alat', formData.nama_alat.trim());
      payload.append('deskripsi', formData.deskripsi.trim());
      payload.append('is_paid', formData.is_paid ? 1 : 0);
      payload.append('harga_sewa', formData.is_paid ? (parseInt(formData.harga_sewa, 10) || 0) : 0);
      payload.append('total_unit', parseInt(formData.total_unit, 10) || 1);
      payload.append('unit_rusak', parseInt(formData.unit_rusak, 10) || 0);
      payload.append('unit_perawatan', parseInt(formData.unit_perawatan, 10) || 0);
      payload.append('foto', selectedFile);
    } else {
      payload = {
        nama_alat: formData.nama_alat.trim(),
        deskripsi: formData.deskripsi.trim(),
        is_paid: formData.is_paid ? 1 : 0,
        harga_sewa: formData.is_paid ? (parseInt(formData.harga_sewa, 10) || 0) : 0,
        total_unit: parseInt(formData.total_unit, 10) || 1,
        unit_rusak: parseInt(formData.unit_rusak, 10) || 0,
        unit_perawatan: parseInt(formData.unit_perawatan, 10) || 0,
      };
    }

    try {
      if (isEditing && selectedItem) {
        await updateInstrument(selectedItem.id, payload);
        setSuccessMessage("Data alat berhasil diubah.");
      } else {
        await createInstrument(payload);
        setSuccessMessage("Data alat berhasil ditambahkan.");
      }
      setShowFormModal(false);
      setShowSuccessModal(true);
      fetchData(); // Refresh list
    } catch (error) {
      console.error("Error saving form:", error);
      const backendErrors = error?.response?.data?.errors;
      if (backendErrors) {
        const mappedErrors = {};
        Object.keys(backendErrors).forEach((key) => {
          mappedErrors[key] = Array.isArray(backendErrors[key]) ? backendErrors[key][0] : backendErrors[key];
        });
        setFormErrors(mappedErrors);
      }
      const msg = error?.response?.data?.message || (backendErrors ? Object.values(backendErrors).flat().join(", ") : "Gagal menyimpan data alat.");
      setErrorMessage(msg);
      setShowErrorModal(true);
    }
  };

  // Open Delete Modal
  const handleOpenDelete = (item) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedItem) {
      try {
        await deleteInstrument(selectedItem.id);
        setShowDeleteModal(false);
        setSuccessMessage("Data alat berhasil dihapus.");
        setShowSuccessModal(true);
        fetchData(); // Refresh list
      } catch (error) {
        console.error("Error deleting item:", error);
        setShowDeleteModal(false);
        setErrorMessage("Gagal menghapus alat.");
        setShowErrorModal(true);
      }
    }
  };

  // Helper Format Rupiah
  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  return (
    <NavbarLoginTeknisi>
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#FAF9F8",
          fontFamily: "Poppins, sans-serif",
          padding: isMobile ? "16px 12px 32px" : "24px 28px 40px",
        }}
      >
        <Container fluid>
          {/* ─── Top 4 Summary Cards ─── */}
          <Row className="g-3 mb-4">
            {/* Card 1: Total Alat */}
            <Col xs={12} sm={6} md={3}>
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "20px",
                  padding: "16px 20px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    backgroundColor: "#A6867B",
                    opacity: 0.85,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      backgroundColor: "#ffffff",
                      opacity: 0.8,
                    }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: "0.82rem", color: "#616161", fontWeight: 600 }}>
                    Total Alat
                  </div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#212121", lineHeight: "1.2" }}>
                    {totalAlat}
                  </div>
                </div>
              </div>
            </Col>

            {/* Card 2: Tersedia */}
            <Col xs={12} sm={6} md={3}>
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "20px",
                  padding: "16px 20px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    backgroundColor: "#66BB6A",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      backgroundColor: "#ffffff",
                      opacity: 0.8,
                    }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: "0.82rem", color: "#616161", fontWeight: 600 }}>
                    Tersedia
                  </div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#212121", lineHeight: "1.2" }}>
                    {tersedia}
                  </div>
                </div>
              </div>
            </Col>

            {/* Card 3: Dipinjam */}
            <Col xs={12} sm={6} md={3}>
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "20px",
                  padding: "16px 20px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    backgroundColor: "#EF5350",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      backgroundColor: "#ffffff",
                      opacity: 0.8,
                    }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: "0.82rem", color: "#616161", fontWeight: 600 }}>
                    Dipinjam
                  </div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#212121", lineHeight: "1.2" }}>
                    {dipinjam}
                  </div>
                </div>
              </div>
            </Col>

            {/* Card 4: Maintenance */}
            <Col xs={12} sm={6} md={3}>
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "20px",
                  padding: "16px 20px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    backgroundColor: "#D4E157",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      backgroundColor: "#ffffff",
                      opacity: 0.8,
                    }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: "0.82rem", color: "#616161", fontWeight: 600 }}>
                    Maintenance
                  </div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#212121", lineHeight: "1.2" }}>
                    {maintenance}
                  </div>
                </div>
              </div>
            </Col>
          </Row>

          {/* ─── Main Content Box (Card & Table View) ─── */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: isMobile ? "16px" : "24px",
              padding: isMobile ? "16px 14px" : "28px 32px",
              boxShadow: "0 6px 24px rgba(0,0,0,0.06)",
              border: "1px solid #EAEAEA",
            }}
          >
            {/* Top Bar: Search Box (Left) & Controls (Right) */}
            <div
              style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
                alignItems: isMobile ? "stretch" : "center",
                gap: isMobile ? "12px" : "16px",
                marginBottom: isMobile ? "20px" : "28px",
              }}
            >
              {/* Search Bar (Left) */}
              <div style={{ maxWidth: isMobile ? "100%" : "320px", width: "100%" }}>
                <InputGroup
                  style={{
                    borderRadius: "30px",
                    overflow: "hidden",
                    border: "1px solid #CCCCCC",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                  }}
                >
                  <Form.Control
                    type="text"
                    placeholder="Cari alat..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      border: "none",
                      paddingLeft: "18px",
                      fontSize: "0.9rem",
                      boxShadow: "none",
                    }}
                  />
                  <Button
                    style={{
                      backgroundColor: "#757575",
                      borderColor: "#757575",
                      color: "#ffffff",
                      paddingLeft: "18px",
                      paddingRight: "18px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FaSearch size={14} />
                  </Button>
                </InputGroup>
              </div>

              {/* Controls Right (Status Dropdown + Tambah Alat Button) */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", justifyContent: isMobile ? "space-between" : "flex-end" }}>
                {/* Status Dropdown */}
                <style>{`
                  .status-dropdown-menu {
                    background-color: transparent !important;
                    border: none !important;
                    box-shadow: none !important;
                    padding: 0 !important;
                    min-width: 170px !important;
                    margin-top: 6px !important;
                  }
                  .status-dropdown-item {
                    background-color: #ffffff !important;
                    border: 1.5px solid #757575 !important;
                    border-radius: 14px !important;
                    padding: 9px 20px !important;
                    text-align: center !important;
                    font-weight: 500 !important;
                    font-size: 0.95rem !important;
                    color: #111111 !important;
                    margin-bottom: 8px !important;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06) !important;
                    transition: all 0.2s ease-in-out !important;
                    cursor: pointer !important;
                  }
                  .status-dropdown-item:last-child {
                    margin-bottom: 0 !important;
                  }
                  .status-dropdown-item:hover, .status-dropdown-item:focus {
                    background-color: #F5EFEA !important;
                    border-color: #4A3933 !important;
                    color: #4A3933 !important;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12) !important;
                  }
                  .status-dropdown-item.active-status {
                    background-color: #4A3933 !important;
                    color: #ffffff !important;
                    border-color: #4A3933 !important;
                  }
                `}</style>
                <Dropdown align="end">
                  <Dropdown.Toggle
                    variant="light"
                    id="dropdown-status-filter"
                    style={{
                      backgroundColor: "transparent",
                      border: "none",
                      color: "#424242",
                      fontWeight: 600,
                      fontSize: "0.95rem",
                      boxShadow: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "4px 8px",
                    }}
                  >
                    Status {statusFilter !== "Semua" ? `(${statusFilter})` : ""}
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="status-dropdown-menu">
                    {[
                      { label: "Semua", value: "Semua" },
                      { label: "Tersedia", value: "tersedia" },
                      { label: "Sedang Dipinjam", value: "dipinjam" },
                      { label: "Ada Perawatan", value: "perawatan" },
                      { label: "Ada Rusak", value: "rusak" },
                    ].map((opt) => (
                      <Dropdown.Item
                        key={opt.value}
                        onClick={() => setStatusFilter(statusFilter === opt.value ? "Semua" : opt.value)}
                        className={`status-dropdown-item ${statusFilter === opt.value ? "active-status" : ""}`}
                      >
                        {opt.label}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>

                {/* + Tambah Alat Button */}
                <Button
                  onClick={() => handleOpenForm(null)}
                  style={{
                    backgroundColor: "#A6867B",
                    borderColor: "#A6867B",
                    color: "#ffffff",
                    borderRadius: "30px",
                    padding: "8px 24px",
                    fontWeight: 600,
                    fontSize: "0.88rem",
                    boxShadow: "0 3px 10px rgba(166,134,123,0.35)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <FaPlus size={12} /> Tambah Alat
                </Button>
              </div>
            </div>

            {/* Equipment Data Table / Mobile Cards */}
            {isMobile ? (
              /* ── Mobile Card View ── */
              <div>
                {isLoading ? (
                  <div className="text-center py-5 text-muted">Memuat data alat...</div>
                ) : filteredList.length > 0 ? (
                  filteredList.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        backgroundColor: "#FAFAFA",
                        borderRadius: "14px",
                        padding: "14px 16px",
                        marginBottom: "12px",
                        border: "1px solid #F0F0F0",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                      }}
                    >
                      {/* Top: Foto + Nama + Status */}
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                        {item.foto_path ? (
                          <img
                            src={`${storageUrl}/storage/${item.foto_path}`}
                            alt="Foto Alat"
                            style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                          />
                        ) : (
                          <div style={{ width: "44px", height: "44px", borderRadius: "50%", backgroundColor: "#F0F0F0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <FaImage size={18} color="#cccccc" />
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "#212121", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {item.nama_alat}
                          </div>
                          <span
                            style={{
                              padding: "2px 10px",
                              borderRadius: "12px",
                              fontSize: "0.72rem",
                              fontWeight: 600,
                              textTransform: "capitalize",
                              backgroundColor:
                                item.status === "tersedia" ? "#E8F5E9" :
                                item.status === "dipinjam" ? "#E3F2FD" :
                                item.status === "perawatan" ? "#FEF3C7" : "#FFEBEE",
                              color:
                                item.status === "tersedia" ? "#2E7D32" :
                                item.status === "dipinjam" ? "#1565C0" :
                                item.status === "perawatan" ? "#B45309" : "#C62828",
                            }}
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>

                      {/* Info grid */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", fontSize: "0.78rem", marginBottom: "10px" }}>
                        <div>
                          <div style={{ color: "#9E9E9E", fontWeight: 600 }}>Biaya</div>
                          <div style={{ color: "#424242", fontWeight: 600 }}>{item.is_paid ? formatRupiah(item.harga_sewa) : "Gratis"}</div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ color: "#9E9E9E", fontWeight: 600 }}>Stok</div>
                          <div style={{ color: "#424242", fontWeight: 700 }}>{item.stok_tersedia ?? (item.total_unit ?? 1)}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ color: "#9E9E9E", fontWeight: 600 }}>Unit</div>
                          <div style={{ color: "#424242", fontWeight: 600 }}>{item.total_unit ?? 1}</div>
                        </div>
                      </div>

                      {/* Deskripsi */}
                      <div style={{ fontSize: "0.78rem", color: "#757575", marginBottom: "10px", lineHeight: 1.4 }}>
                        {item.deskripsi?.substring(0, 80) || "-"}
                        {item.deskripsi?.length > 80 ? "..." : ""}
                      </div>

                      {/* Aksi buttons */}
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                        <button type="button" onClick={() => handleOpenDetail(item)} title="Lihat Detail"
                          style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#757575", border: "none", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                          <FaEye size={14} />
                        </button>
                        <button type="button" onClick={() => handleOpenForm(item)} title="Edit Alat"
                          style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#4CAF50", border: "none", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                          <FaPencilAlt size={13} />
                        </button>
                        <button type="button" onClick={() => handleOpenDelete(item)} title="Hapus Alat"
                          style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#E53935", border: "none", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                          <FaTrashAlt size={13} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-5 text-muted">Tidak ada data alat ditemukan.</div>
                )}
              </div>
            ) : (
            /* ── Desktop Table View ── */
            <div className="table-responsive">
              <Table borderless style={{ verticalAlign: "middle", marginBottom: "0" }}>
                <thead>
                  <tr
                    style={{
                      color: "#212121",
                      fontSize: "0.95rem",
                      fontWeight: "700",
                      borderBottom: "1px solid #EEEEEE",
                    }}
                  >
                    <th style={{ paddingBottom: "16px" }}>Nama Alat</th>
                    <th style={{ paddingBottom: "16px" }}>Foto</th>
                    <th style={{ paddingBottom: "16px" }}>Deskripsi</th>
                    <th style={{ paddingBottom: "16px", textAlign: "center" }}>Biaya Sewa</th>
                    <th style={{ paddingBottom: "16px", textAlign: "center" }}>Stok Tersedia</th>
                    <th style={{ paddingBottom: "16px", textAlign: "center" }}>Total Unit</th>
                    <th style={{ paddingBottom: "16px", textAlign: "center" }}>Status</th>
                    <th style={{ paddingBottom: "16px", textAlign: "center" }}>Terakhir Diupdate</th>
                    <th style={{ paddingBottom: "16px", textAlign: "center" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-5 text-muted">
                        Memuat data alat...
                      </td>
                    </tr>
                  ) : filteredList.length > 0 ? (
                    filteredList.map((item) => (
                      <tr
                        key={item.id}
                        style={{
                          fontSize: "0.88rem",
                          borderBottom: "1px solid #F5F5F5",
                        }}
                      >
                        {/* Nama Alat */}
                        <td style={{ py: "14px", fontWeight: "600", color: "#212121" }}>
                          {item.nama_alat}
                        </td>
                        <td style={{ py: "14px", textAlign: "center" }}>
                          {item.foto_path ? (
                            <img
                              src={`${storageUrl}/storage/${item.foto_path}`}
                              alt="Foto Alat"
                              style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }}
                            />
                          ) : (
                            <FaImage size={24} color="#cccccc" />
                          )}
                        </td>

                        {/* Deskripsi */}
                        <td style={{ py: "14px", color: "#424242", maxWidth: "200px" }}>
                          {item.deskripsi?.substring(0, 50) || "-"}
                          {item.deskripsi?.length > 50 ? "..." : ""}
                        </td>

                        {/* Harga Sewa */}
                        <td style={{ py: "14px", textAlign: "center", color: "#424242" }}>
                          {item.is_paid ? formatRupiah(item.harga_sewa) : "Gratis"}
                        </td>

                        {/* Stok Tersedia */}
                        <td style={{ py: "14px", textAlign: "center", color: "#424242", fontWeight: "bold" }}>
                          {item.stok_tersedia ?? (item.total_unit ?? 1)}
                        </td>

                        {/* Total Unit */}
                        <td style={{ py: "14px", textAlign: "center", color: "#424242" }}>
                          {item.total_unit ?? 1}
                        </td>

                        <td style={{ py: "14px", textAlign: "center", display: "flex", flexDirection: "column", gap: "4px", alignItems: "center" }}>
                          {((item.stok_tersedia ?? (item.total_unit ?? 1)) > 0) && (
                            <span style={{ padding: "2px 8px", borderRadius: "12px", fontSize: "0.75rem", backgroundColor: "#E8F5E9", color: "#2E7D32" }}>
                              Tersedia
                            </span>
                          )}
                          {(item.active_rentals_count > 0) && (
                            <span style={{ padding: "2px 8px", borderRadius: "12px", fontSize: "0.75rem", backgroundColor: "#E3F2FD", color: "#1565C0" }}>
                              Dipinjam: {item.active_rentals_count}
                            </span>
                          )}
                          {(item.unit_perawatan > 0) && (
                            <span style={{ padding: "2px 8px", borderRadius: "12px", fontSize: "0.75rem", backgroundColor: "#FEF3C7", color: "#B45309" }}>
                              Perawatan: {item.unit_perawatan}
                            </span>
                          )}
                          {(item.unit_rusak > 0) && (
                            <span style={{ padding: "2px 8px", borderRadius: "12px", fontSize: "0.75rem", backgroundColor: "#FFEBEE", color: "#C62828" }}>
                              Rusak: {item.unit_rusak}
                            </span>
                          )}
                          {((item.stok_tersedia ?? (item.total_unit ?? 1)) === 0 && !item.active_rentals_count && !item.unit_perawatan && !item.unit_rusak) && (
                            <span style={{ padding: "2px 8px", borderRadius: "12px", fontSize: "0.75rem", backgroundColor: "#F5F5F5", color: "#616161" }}>
                              Habis
                            </span>
                          )}
                        </td>

                        {/* Terakhir Diupdate */}
                        <td style={{ py: "14px", textAlign: "center", color: "#424242" }}>
                          {new Date(item.updated_at).toLocaleDateString("id-ID", {
                            day: "2-digit", month: "short", year: "numeric"
                          })}
                        </td>

                        {/* Aksi Icons */}
                        <td style={{ py: "14px", textAlign: "center" }}>
                          <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
                            {/* Detail / View (Gray) */}
                            <button
                              type="button"
                              onClick={() => handleOpenDetail(item)}
                              title="Lihat Detail"
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "8px",
                                backgroundColor: "#757575",
                                border: "none",
                                color: "#ffffff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
                              }}
                            >
                              <FaEye size={14} />
                            </button>

                            {/* Edit (Green) */}
                            <button
                              type="button"
                              onClick={() => handleOpenForm(item)}
                              title="Edit Alat"
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "8px",
                                backgroundColor: "#4CAF50",
                                border: "none",
                                color: "#ffffff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                boxShadow: "0 2px 5px rgba(76,175,80,0.3)",
                              }}
                            >
                              <FaPencilAlt size={13} />
                            </button>

                            {/* Delete (Red) */}
                            <button
                              type="button"
                              onClick={() => handleOpenDelete(item)}
                              title="Hapus Alat"
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "8px",
                                backgroundColor: "#E53935",
                                border: "none",
                                color: "#ffffff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                boxShadow: "0 2px 5px rgba(229,57,53,0.3)",
                              }}
                            >
                              <FaTrashAlt size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="text-center py-5 text-muted">
                        Tidak ada data alat ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
            )}
          </div>
        </Container>
      </div>

      {/* ─── 1. Modal Edit / Tambah Alat (Matches Image 1 Mockup) ─── */}
      <Modal
        show={showFormModal}
        onHide={() => setShowFormModal(false)}
        centered
        dialogClassName="modal-custom-inventaris"
      >
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.18)",
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: "#A48479",
              color: "#ffffff",
              padding: "14px 20px",
              textAlign: "center",
              fontWeight: "700",
              fontSize: "1.15rem",
              letterSpacing: "0.2px",
            }}
          >
            {isEditing ? "Edit Alat" : "Tambah Alat"}
          </div>

          {/* Form Body */}
          <form onSubmit={handleSaveForm} noValidate style={{ padding: isMobile ? "16px 16px 20px" : "22px 28px 28px" }}>
            {/* Top Error Alert Banner if any errors exist */}
            {Object.keys(formErrors).length > 0 && (
              <div
                style={{
                  backgroundColor: "#FFEBEE",
                  color: "#C62828",
                  padding: "10px 16px",
                  borderRadius: "12px",
                  marginBottom: "16px",
                  fontSize: "0.83rem",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  border: "1px solid #FFCDD2",
                }}
              >
                <span>⚠️</span>
                <span>Harap lengkapi semua isian kolom yang wajib diisi dengan benar.</span>
              </div>
            )}

            {/* Nama Alat */}
            <div style={{ marginBottom: "14px" }}>
              <label
                style={{
                  display: "block",
                  fontWeight: "700",
                  fontSize: "0.85rem",
                  color: "#616161",
                  marginBottom: "6px",
                }}
              >
                Nama Alat <span style={{ color: "#E53935" }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Micropipette 20–200 µL"
                value={formData.nama_alat}
                onChange={(e) => {
                  setFormData({ ...formData, nama_alat: e.target.value });
                  if (formErrors.nama_alat) setFormErrors({ ...formErrors, nama_alat: "" });
                }}
                style={{
                  width: "100%",
                  borderRadius: "20px",
                  border: formErrors.nama_alat ? "1.5px solid #E53935" : "1px solid #D0D0D0",
                  padding: "8px 16px",
                  fontSize: "0.88rem",
                  color: "#333",
                  outline: "none",
                  backgroundColor: formErrors.nama_alat ? "#FFF8F8" : "#fff",
                  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.03)",
                }}
              />
              {/* Photo Upload */}
              <div style={{ marginBottom: "14px", marginTop: "10px" }}>
                <label
                  style={{
                    display: "block",
                    fontWeight: "700",
                    fontSize: "0.85rem",
                    color: "#616161",
                    marginBottom: "6px",
                  }}
                >
                  Foto Alat {" "}
                  <span style={{ color: "#E53935" }}>*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setSelectedFile(file);
                      // optional preview URL
                      const previewUrl = URL.createObjectURL(file);
                      setFormData({ ...formData, preview: previewUrl });
                    }
                  }}
                  style={{
                    width: "100%",
                    border: selectedFile ? "1px solid #4A3933" : "1px solid #D0D0D0",
                    borderRadius: "20px",
                    padding: "8px 16px",
                  }}
                />
                {selectedFile && (
                  <div style={{ marginTop: "8px", textAlign: "center" }}>
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="preview"
                      style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: "8px" }}
                    />
                  </div>
                )}
                {formErrors.foto && (
                  <div style={{ color: "#E53935", fontSize: "0.78rem", marginTop: "4px" }}>{formErrors.foto}</div>
                )}
              </div>
              {formErrors.nama_alat && (
                <div style={{ color: "#E53935", fontSize: "0.78rem", marginTop: "4px", paddingLeft: "6px", fontWeight: "500" }}>
                  {formErrors.nama_alat}
                </div>
              )}
            </div>

            {/* Total Unit */}
            <div style={{ marginBottom: "14px" }}>
              <label
                style={{
                  display: "block",
                  fontWeight: "700",
                  fontSize: "0.85rem",
                  color: "#616161",
                  marginBottom: "6px",
                }}
              >
                Total Unit <span style={{ color: "#E53935" }}>*</span>
              </label>
              <input
                type="number"
                min="1"
                placeholder="1"
                value={formData.total_unit}
                onChange={(e) => {
                  setFormData({ ...formData, total_unit: e.target.value });
                  if (formErrors.total_unit) setFormErrors({ ...formErrors, total_unit: "" });
                }}
                style={{
                  width: "100%",
                  borderRadius: "20px",
                  border: formErrors.total_unit ? "1.5px solid #E53935" : "1px solid #D0D0D0",
                  padding: "8px 16px",
                  fontSize: "0.88rem",
                  color: "#333",
                  outline: "none",
                  backgroundColor: formErrors.total_unit ? "#FFF8F8" : "#fff",
                  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.03)",
                }}
              />
              {formErrors.total_unit && (
                <div style={{ color: "#E53935", fontSize: "0.78rem", marginTop: "4px", paddingLeft: "6px", fontWeight: "500" }}>
                  {formErrors.total_unit}
                </div>
              )}
            </div>

            {/* Berbayar & Harga Sewa */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px", marginBottom: "14px" }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: "700",
                    fontSize: "0.85rem",
                    color: "#616161",
                    marginBottom: "6px",
                  }}
                >
                  Berbayar
                </label>
                <select
                  value={formData.is_paid ? "1" : "0"}
                  onChange={(e) => {
                    const isPaid = e.target.value === "1";
                    setFormData({ ...formData, is_paid: isPaid, harga_sewa: isPaid ? formData.harga_sewa : 0 });
                    if (!isPaid && formErrors.harga_sewa) {
                      setFormErrors({ ...formErrors, harga_sewa: "" });
                    }
                  }}
                  style={{
                    width: "100%",
                    borderRadius: "20px",
                    border: "1px solid #D0D0D0",
                    padding: "8px 16px",
                    fontSize: "0.88rem",
                    color: "#333",
                    outline: "none",
                  }}
                >
                  <option value="0">Gratis</option>
                  <option value="1">Berbayar</option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: "700",
                    fontSize: "0.85rem",
                    color: "#616161",
                    marginBottom: "6px",
                  }}
                >
                  Harga Sewa {formData.is_paid && <span style={{ color: "#E53935" }}>*</span>}
                </label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    borderRadius: "20px",
                    border: formErrors.harga_sewa ? "1.5px solid #E53935" : "1px solid #D0D0D0",
                    backgroundColor: formData.is_paid ? (formErrors.harga_sewa ? "#FFF8F8" : "#fff") : "#f5f5f5",
                    overflow: "hidden",
                    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.03)",
                  }}
                >
                  <span
                    style={{
                      padding: "8px 14px",
                      fontSize: "0.88rem",
                      fontWeight: "700",
                      color: formData.is_paid ? (formErrors.harga_sewa ? "#C62828" : "#543D31") : "#9E9E9E",
                      backgroundColor: formData.is_paid ? (formErrors.harga_sewa ? "#FFEBEE" : "#F5ECE6") : "#EBEBEB",
                      borderRight: formErrors.harga_sewa ? "1px solid #FFCDD2" : "1px solid #D0D0D0",
                      userSelect: "none",
                    }}
                  >
                    Rp
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={formData.harga_sewa ? Number(formData.harga_sewa).toLocaleString("id-ID") : (formData.is_paid ? "" : "0")}
                    disabled={!formData.is_paid}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      setFormData({
                        ...formData,
                        harga_sewa: raw ? parseInt(raw, 10) : 0,
                      });
                      if (formErrors.harga_sewa) setFormErrors({ ...formErrors, harga_sewa: "" });
                    }}
                    style={{
                      flex: 1,
                      width: "100%",
                      border: "none",
                      padding: "8px 14px",
                      fontSize: "0.88rem",
                      color: "#333",
                      outline: "none",
                      backgroundColor: "transparent",
                    }}
                  />
                </div>
                {formErrors.harga_sewa && (
                  <div style={{ color: "#E53935", fontSize: "0.78rem", marginTop: "4px", paddingLeft: "6px", fontWeight: "500" }}>
                    {formErrors.harga_sewa}
                  </div>
                )}
              </div>
            </div>

            {/* Deskripsi */}
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontWeight: "700",
                  fontSize: "0.85rem",
                  color: "#616161",
                  marginBottom: "6px",
                }}
              >
                Deskripsi <span style={{ color: "#E53935" }}>*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Digunakan untuk mengambil cairan dengan volume 20–200 µL."
                value={formData.deskripsi}
                onChange={(e) => {
                  setFormData({ ...formData, deskripsi: e.target.value });
                  if (formErrors.deskripsi) setFormErrors({ ...formErrors, deskripsi: "" });
                }}
                style={{
                  width: "100%",
                  borderRadius: "20px",
                  border: formErrors.deskripsi ? "1.5px solid #E53935" : "1px solid #D0D0D0",
                  padding: "10px 16px",
                  fontSize: "0.85rem",
                  color: "#333",
                  outline: "none",
                  resize: "none",
                  backgroundColor: formErrors.deskripsi ? "#FFF8F8" : "#fff",
                  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.03)",
                }}
              />
              {formErrors.deskripsi && (
                <div style={{ color: "#E53935", fontSize: "0.78rem", marginTop: "4px", paddingLeft: "6px", fontWeight: "500" }}>
                  {formErrors.deskripsi}
                </div>
              )}
            </div>

            {/* Status Unit (Rusak / Perawatan) */}
            <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 calc(33.333% - 16px)", minWidth: "100px" }}>
                <label style={{ display: "block", fontWeight: "700", fontSize: "0.85rem", color: "#616161", marginBottom: "6px" }}>Unit Rusak</label>
                <input
                  type="number"
                  min="0"
                  value={formData.unit_rusak}
                  onChange={(e) => {
                    setFormData({ ...formData, unit_rusak: e.target.value });
                    if (formErrors.unit_rusak) setFormErrors({ ...formErrors, unit_rusak: "" });
                  }}
                  style={{ width: "100%", borderRadius: "20px", border: formErrors.unit_rusak ? "1.5px solid #E53935" : "1px solid #D0D0D0", padding: "10px 16px", fontSize: "0.85rem" }}
                />
                {formErrors.unit_rusak && <div style={{ color: "#E53935", fontSize: "0.78rem", marginTop: "4px" }}>{formErrors.unit_rusak}</div>}
              </div>
              <div style={{ flex: "1 1 calc(33.333% - 16px)", minWidth: "100px" }}>
                <label style={{ display: "block", fontWeight: "700", fontSize: "0.85rem", color: "#616161", marginBottom: "6px" }}>Dalam Perawatan</label>
                <input
                  type="number"
                  min="0"
                  value={formData.unit_perawatan}
                  onChange={(e) => {
                    setFormData({ ...formData, unit_perawatan: e.target.value });
                    if (formErrors.unit_perawatan) setFormErrors({ ...formErrors, unit_perawatan: "" });
                  }}
                  style={{ width: "100%", borderRadius: "20px", border: formErrors.unit_perawatan ? "1.5px solid #E53935" : "1px solid #D0D0D0", padding: "10px 16px", fontSize: "0.85rem" }}
                />
                {formErrors.unit_perawatan && <div style={{ color: "#E53935", fontSize: "0.78rem", marginTop: "4px" }}>{formErrors.unit_perawatan}</div>}
              </div>
              <div style={{ flex: "1 1 calc(33.333% - 16px)", minWidth: "100px" }}>
                <label style={{ display: "block", fontWeight: "700", fontSize: "0.85rem", color: "#616161", marginBottom: "6px" }}>Unit Dipinjam</label>
                <input
                  type="number"
                  value={selectedItem?.active_rentals_count || 0}
                  disabled
                  style={{ width: "100%", borderRadius: "20px", border: "1px solid #D0D0D0", padding: "10px 16px", fontSize: "0.85rem", backgroundColor: "#f0f0f0" }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                style={{
                  backgroundColor: "#D8D8D8",
                  color: "#333333",
                  border: "none",
                  borderRadius: "12px",
                  padding: "8px 34px",
                  fontWeight: "600",
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                }}
              >
                Batal
              </button>
              <button
                type="submit"
                style={{
                  backgroundColor: "#4A3933",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "12px",
                  padding: "8px 34px",
                  fontWeight: "600",
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  boxShadow: "0 2px 6px rgba(74,57,51,0.3)",
                }}
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* ─── 2. Modal Detail Alat (Matches Image 2 Mockup) ─── */}
      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        centered
        dialogClassName="modal-custom-inventaris"
      >
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.18)",
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: "#A48479",
              color: "#ffffff",
              padding: "14px 20px",
              textAlign: "center",
              fontWeight: "700",
              fontSize: "1.15rem",
              letterSpacing: "0.2px",
            }}
          >
            Detail Alat
          </div>

          {/* Body Content */}
          {selectedItem && (
            <div style={{ padding: "26px 28px 28px" }}>
              {/* Row 1: Nama Alat & Kategori */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: "16px",
                  textAlign: "center",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <div style={{ fontWeight: "700", color: "#616161", fontSize: "0.88rem", marginBottom: "4px" }}>
                    Nama Alat
                  </div>
                  <div style={{ color: "#212121", fontSize: "0.95rem", fontWeight: "600" }}>
                    {selectedItem.nama_alat}
                  </div>
                </div>
              </div>

              {/* Photo Display */}
              {selectedItem.foto_path && (
                <div style={{ marginBottom: "20px", textAlign: "center" }}>
                  <img
                    src={`${process.env.REACT_APP_API_BASE_URL}/storage/${selectedItem.foto_path}`}
                    alt="Foto Alat"
                    style={{ maxWidth: "100%", maxHeight: "250px", borderRadius: "8px" }}
                  />
                </div>
              )}

              {/* Row 2: Biaya Sewa, Total Unit, Stok Tersedia */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "12px",
                  textAlign: "center",
                  marginBottom: "24px",
                }}
              >
                <div>
                  <div style={{ fontWeight: "700", color: "#616161", fontSize: "0.88rem", marginBottom: "4px" }}>
                    Biaya Sewa
                  </div>
                  <div style={{ color: "#212121", fontSize: "0.95rem", fontWeight: "600" }}>
                    {selectedItem.is_paid ? formatRupiah(selectedItem.harga_sewa) : "Gratis"}
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: "700", color: "#616161", fontSize: "0.88rem", marginBottom: "4px" }}>
                    Total Unit
                  </div>
                  <div style={{ color: "#212121", fontSize: "0.95rem", fontWeight: "600" }}>
                    {selectedItem.total_unit ?? 1}
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: "700", color: "#616161", fontSize: "0.88rem", marginBottom: "4px" }}>
                    Stok Tersedia
                  </div>
                  <div style={{ color: "#212121", fontSize: "0.95rem", fontWeight: "600" }}>
                    {selectedItem.stok_tersedia ?? (selectedItem.total_unit ?? 1)}
                  </div>
                </div>
              </div>

              {/* Row 3: Status & Deskripsi */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1.3fr",
                  gap: "16px",
                  marginBottom: "28px",
                  alignItems: "start",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: "700", color: "#616161", fontSize: "0.88rem", marginBottom: "8px" }}>
                    Status
                  </div>
                  <div
                    style={{
                      display: "inline-flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                      color: "#212121",
                      fontWeight: "600",
                      fontSize: "0.88rem",
                      textTransform: "capitalize",
                    }}
                  >
                    {((selectedItem.stok_tersedia ?? (selectedItem.total_unit ?? 1)) > 0) && (
                      <span style={{ padding: "2px 8px", borderRadius: "12px", fontSize: "0.75rem", backgroundColor: "#E8F5E9", color: "#2E7D32" }}>
                        Tersedia
                      </span>
                    )}
                    {(selectedItem.active_rentals_count > 0) && (
                      <span style={{ padding: "2px 8px", borderRadius: "12px", fontSize: "0.75rem", backgroundColor: "#E3F2FD", color: "#1565C0" }}>
                        Dipinjam: {selectedItem.active_rentals_count}
                      </span>
                    )}
                    {(selectedItem.unit_perawatan > 0) && (
                      <span style={{ padding: "2px 8px", borderRadius: "12px", fontSize: "0.75rem", backgroundColor: "#FEF3C7", color: "#B45309" }}>
                        Perawatan: {selectedItem.unit_perawatan}
                      </span>
                    )}
                    {(selectedItem.unit_rusak > 0) && (
                      <span style={{ padding: "2px 8px", borderRadius: "12px", fontSize: "0.75rem", backgroundColor: "#FFEBEE", color: "#C62828" }}>
                        Rusak: {selectedItem.unit_rusak}
                      </span>
                    )}
                    {((selectedItem.stok_tersedia ?? (selectedItem.total_unit ?? 1)) === 0 && !selectedItem.active_rentals_count && !selectedItem.unit_perawatan && !selectedItem.unit_rusak) && (
                      <span style={{ padding: "2px 8px", borderRadius: "12px", fontSize: "0.75rem", backgroundColor: "#F5F5F5", color: "#616161" }}>
                        Habis
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: "700", color: "#616161", fontSize: "0.88rem", marginBottom: "4px", textAlign: "center" }}>
                    Deskripsi
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "#424242", textAlign: "center", lineHeight: "1.4" }}>
                    {selectedItem.deskripsi || "-"}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  style={{
                    backgroundColor: "#D8D8D8",
                    color: "#333333",
                    border: "none",
                    borderRadius: "12px",
                    padding: "8px 34px",
                    fontWeight: "600",
                    fontSize: "0.88rem",
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                  }}
                >
                  Tutup
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* ─── 3. Modal Hapus Alat (Matches Image 3 Mockup) ─── */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
        dialogClassName="modal-custom-inventaris"
      >
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "20px",
            padding: "36px 24px 28px",
            textAlign: "center",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.18)",
          }}
        >
          <div
            style={{
              color: "#4A3933",
              fontWeight: "700",
              fontSize: "1.1rem",
              lineHeight: "1.4",
              marginBottom: "24px",
            }}
          >
            Apakah anda yakin ingin
            <br />
            menghapus alat ini?
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              style={{
                backgroundColor: "#D8D8D8",
                color: "#333333",
                border: "none",
                borderRadius: "12px",
                padding: "8px 34px",
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
              onClick={handleConfirmDelete}
              style={{
                backgroundColor: "#4A3933",
                color: "#ffffff",
                border: "none",
                borderRadius: "12px",
                padding: "8px 34px",
                fontWeight: "600",
                fontSize: "0.88rem",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(74,57,51,0.3)",
              }}
            >
              Hapus
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Success */}
      <Modal
        show={showSuccessModal}
        onHide={() => setShowSuccessModal(false)}
        centered
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        <Modal.Header closeButton style={{ borderBottom: "none" }} />
        <Modal.Body className="text-center pb-5">
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "#d4edda",
              color: "#155724",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              margin: "0 auto 16px",
            }}
          >
            ✓
          </div>
          <h5 className="fw-bold text-dark mb-2">Berhasil!</h5>
          <p className="text-muted">{successMessage}</p>
          <Button
            variant="success"
            className="px-4 mt-2"
            style={{
              borderRadius: "10px",
              fontWeight: 600,
              backgroundColor: "#28a745",
              border: "none",
            }}
            onClick={() => setShowSuccessModal(false)}
          >
            Tutup
          </Button>
        </Modal.Body>
      </Modal>

      {/* Modal Error */}
      <Modal
        show={showErrorModal}
        onHide={() => setShowErrorModal(false)}
        centered
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        <Modal.Header closeButton style={{ borderBottom: "none" }} />
        <Modal.Body className="text-center pb-5">
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "#f8d7da",
              color: "#721c24",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              margin: "0 auto 16px",
            }}
          >
            ✗
          </div>
          <h5 className="fw-bold text-dark mb-2">Terjadi Kesalahan</h5>
          <p className="text-muted">{errorMessage}</p>
          <Button
            variant="danger"
            className="px-4 mt-2"
            style={{
              borderRadius: "10px",
              fontWeight: 600,
              backgroundColor: "#dc3545",
              border: "none",
            }}
            onClick={() => setShowErrorModal(false)}
          >
            Tutup
          </Button>
        </Modal.Body>
      </Modal>

      {/* Custom CSS for Modal size and offset below top header */}
      <style>{`
        .modal-custom-inventaris {
          max-width: 440px !important;
          width: 92% !important;
          margin: 50px auto 1.75rem !important;
        }
        .modal-custom-inventaris .modal-content {
          border: none !important;
          background: transparent !important;
          border-radius: 16px !important;
          box-shadow: none !important;
        }
        @media (max-width: 767px) {
          .modal-custom-inventaris {
            max-width: 100% !important;
            width: 95% !important;
            margin: 20px auto 1rem !important;
          }
        }
      `}</style>
      <FooterSetelahLogin />
    </NavbarLoginTeknisi>
  );
}
