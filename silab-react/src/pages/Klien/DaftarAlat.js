import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, InputGroup, Modal, Badge } from "react-bootstrap";
import {
  FaSearch,
  FaTools,
  FaShoppingCart,
  FaCartPlus,
  FaPlus,
  FaMinus,
  FaTrashAlt,
  FaArrowRight,
  FaCheckCircle,
} from "react-icons/fa";
import { useHistory } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import axios from "axios";
import NavbarLoginKlien from "./NavbarLoginKlien";
import FooterSetelahLogin from "../FooterSetelahLogin";
import DaftarAlatComponent, { LabBannerSVG } from "../../components/DaftarAlat/DaftarAlatComponent";
import { getStorageUrl, getApiBaseUrl } from "../../config/apiConfig";

const DaftarAlat = () => {
  const history = useHistory();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTool, setSelectedTool] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [tools, setTools] = useState([]);
  const [quantity, setQuantity] = useState(1);

  // Cart State
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("equipment_cart");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [showCartModal, setShowCartModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    document.title = "SILAB-NTDK - Daftar Alat Analisis";
    fetchTools();
  }, []);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("equipment_cart", JSON.stringify(cart));
    } catch (e) {
      console.error("Gagal menyimpan keranjang ke localStorage", e);
    }
  }, [cart]);

  const fetchTools = async () => {
    try {
      const response = await axios.get(`${getApiBaseUrl()}/instruments`);
      setTools(response.data.data || []);
    } catch (error) {
      console.error("Gagal mengambil data alat", error);
    }
  };

  const handleOpenModal = (tool) => {
    setSelectedTool(tool);
    setQuantity(1);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTool(null);
    setQuantity(1);
  };

  // Add item to cart
  const handleAddToCart = () => {
    if (!selectedTool) return;

    if (selectedTool.status === "rusak" || selectedTool.status === "perawatan") {
      setToastMessage(`Maaf, alat "${selectedTool.nama_alat}" saat ini tidak tersedia (dalam perbaikan).`);
      setShowToast(true);
      return;
    }

    const totalUnit = selectedTool.total_unit ?? 1;
    if (totalUnit <= 0) {
      setToastMessage(`Maaf, unit alat "${selectedTool.nama_alat}" saat ini tidak tersedia.`);
      setShowToast(true);
      return;
    }

    const existingIndex = cart.findIndex((item) => item.id === selectedTool.id);
    let newCart = [...cart];

    if (existingIndex > -1) {
      const newQty = Math.min(totalUnit, newCart[existingIndex].quantity + quantity);
      newCart[existingIndex] = {
        ...newCart[existingIndex],
        quantity: newQty,
        total_unit: totalUnit,
      };
    } else {
      newCart.push({
        id: selectedTool.id,
        nama_alat: selectedTool.nama_alat,
        deskripsi: selectedTool.deskripsi,
        harga_sewa: selectedTool.harga_sewa || 0,
        is_paid: selectedTool.is_paid,
        total_unit: totalUnit,
        quantity: Math.min(totalUnit, quantity),
      });
    }

    setCart(newCart);
    handleCloseModal();
    setToastMessage(`"${selectedTool.nama_alat}" (${quantity} unit) berhasil ditambahkan ke keranjang.`);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3500);
  };

  // Cart actions
  const handleUpdateCartQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const max = item.total_unit ?? 99;
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return { ...item, quantity: Math.min(max, newQty) };
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const handleRemoveFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleProceedToCheckout = () => {
    setShowCartModal(false);
    history.push("/dashboard/pengajuanPeminjaman");
  };

  const totalCartUnits = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const totalCartPrice = cart.reduce(
    (acc, item) => acc + (item.is_paid ? (item.harga_sewa || 0) * (item.quantity || 1) : 0),
    0
  );

  const filteredTools = tools.filter(
    (tool) =>
      (tool.nama_alat || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tool.deskripsi || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentMaxStock = selectedTool ? (selectedTool.total_unit ?? 1) : 1;

  return (
    <NavbarLoginKlien>
      <style>{`
        .daftar-alat-title {
          font-size: 2rem;
        }
        .floating-cart-wrapper {
          position: fixed;
          bottom: 30px;
          right: 30px;
          z-index: 1000;
          animation: bounceIn 0.4s ease;
        }
        .floating-cart-btn {
          padding: 12px 24px;
          font-size: 0.92rem;
        }
        @media (max-width: 768px) {
          .daftar-alat-title {
            font-size: 1.5rem !important;
          }
          .floating-cart-wrapper {
            bottom: 16px !important;
            right: 16px !important;
          }
          .floating-cart-btn {
            padding: 10px 16px !important;
            font-size: 0.82rem !important;
            gap: 8px !important;
          }
          .modal-custom-detail {
            margin: 10px;
          }
          .modal-custom-detail .modal-content {
            border-radius: 20px !important;
          }
        }
      `}</style>
      <Container
        fluid
        className="py-4 px-3 px-md-5 position-relative"
        style={{
          minHeight: "100vh",
          backgroundColor: "#fafafa",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        {/* Floating Notification Toast */}
        {showToast && (
          <div
            style={{
              position: "fixed",
              top: "90px",
              right: "24px",
              zIndex: 9999,
              backgroundColor: "#2E7D32",
              color: "#ffffff",
              padding: "12px 20px",
              borderRadius: "14px",
              boxShadow: "0 8px 24px rgba(46, 125, 50, 0.35)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "0.88rem",
              fontWeight: "600",
              animation: "fadeInDown 0.3s ease-in-out",
            }}
          >
            <FaCheckCircle size={16} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header Title Section & Cart Button */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div>
            <div
              style={{
                width: "45px",
                height: "4px",
                backgroundColor: "#8D6E63",
                borderRadius: "2px",
                marginBottom: "8px",
              }}
            />
            <span
              className="fw-semibold text-uppercase"
              style={{
                color: "#8D6E63",
                fontSize: "0.8rem",
                letterSpacing: "1.2px",
              }}
            >
              SILAB-NTDK SYSTEM
            </span>
            <h2
              className="fw-bold text-dark mt-1 mb-1 daftar-alat-title"
              style={{
                color: "#2D3436",
              }}
            >
              Daftar Alat-Alat Analisis
            </h2>
            <p className="text-muted mb-0" style={{ fontSize: "0.95rem" }}>
              Klik alat untuk melihat detail dan menambahkannya ke keranjang peminjaman.
            </p>
          </div>

          {/* Cart Header Button */}
          <Button
            onClick={() => setShowCartModal(true)}
            style={{
              backgroundColor: "#543D31",
              borderColor: "#543D31",
              color: "#ffffff",
              borderRadius: "30px",
              padding: "10px 22px",
              fontWeight: "600",
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              boxShadow: "0 4px 15px rgba(84, 61, 49, 0.25)",
              position: "relative",
            }}
          >
            <FaShoppingCart size={16} />
            <span>Keranjang Alat</span>
            {cart.length > 0 && (
              <span
                style={{
                  backgroundColor: "#E53935",
                  color: "#fff",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  borderRadius: "12px",
                  padding: "2px 8px",
                  marginLeft: "2px",
                }}
              >
                {totalCartUnits}
              </span>
            )}
          </Button>
        </div>

        {/* Search Bar */}
        <Row className="mb-4">
          <Col xs={12} sm={8} md={6} lg={4}>
            <Form onSubmit={(e) => e.preventDefault()}>
              <InputGroup className="shadow-sm rounded-pill overflow-hidden bg-white">
                <Form.Control
                  type="text"
                  placeholder="Cari alat.."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    border: "none",
                    paddingLeft: "20px",
                    paddingTop: "10px",
                    paddingBottom: "10px",
                    fontSize: "0.95rem",
                    boxShadow: "none",
                  }}
                />
                <Button
                  variant="custom"
                  type="button"
                  style={{
                    backgroundColor: "#8D6E63",
                    color: "#ffffff",
                    border: "none",
                    paddingLeft: "22px",
                    paddingRight: "25px",
                    fontWeight: "600",
                    fontSize: "0.95rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <FaSearch size={14} /> Cari
                </Button>
              </InputGroup>
            </Form>
          </Col>
        </Row>

        {/* Equipment Cards Grid */}
        <Row className="g-4 mb-5">
          {filteredTools.length > 0 ? (
            filteredTools.map((tool) => (
              <DaftarAlatComponent key={tool.id} tool={tool} onClick={handleOpenModal} />
            ))
          ) : (
            <Col xs={12}>
              <div className="text-center py-5 bg-white rounded-4 shadow-sm">
                <FaTools size={48} className="text-muted mb-3" />
                <h5 className="fw-semibold text-secondary">Alat tidak ditemukan</h5>
                <p className="text-muted">Coba kata kunci pencarian yang lain.</p>
              </div>
            </Col>
          )}
        </Row>

        {/* Floating Cart Button (Bottom Right) */}
        {cart.length > 0 && (
          <div className="floating-cart-wrapper">
            <Button
              className="floating-cart-btn"
              onClick={() => setShowCartModal(true)}
              style={{
                backgroundColor: "#543D31",
                borderColor: "#543D31",
                color: "#FFFFFF",
                borderRadius: "35px",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                boxShadow: "0 10px 30px rgba(84, 61, 49, 0.45)",
                border: "2px solid #fff",
              }}
            >
              <div style={{ position: "relative" }}>
                <FaShoppingCart size={18} />
                <span
                  style={{
                    position: "absolute",
                    top: "-10px",
                    right: "-12px",
                    backgroundColor: "#E53935",
                    color: "#fff",
                    fontSize: "0.72rem",
                    fontWeight: "800",
                    borderRadius: "50%",
                    width: "20px",
                    height: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                  }}
                >
                  {totalCartUnits}
                </span>
              </div>
              <span>Keranjang ({cart.length} Alat)</span>
              {totalCartPrice > 0 && (
                <span style={{ backgroundColor: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: "12px", fontSize: "0.82rem" }}>
                  Rp {totalCartPrice.toLocaleString("id-ID")}
                </span>
              )}
            </Button>
          </div>
        )}

        {/* ─── Modal Detail Ketersediaan Alat & Tambah Keranjang ─── */}
        <Modal
          show={showModal}
          onHide={handleCloseModal}
          centered
          dialogClassName="modal-custom-detail"
        >
          {selectedTool && (
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "24px",
                overflow: "hidden",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.18)",
              }}
            >
              {/* Top Banner / Photo */}
              {selectedTool.foto_path ? (
                <div
                  style={{
                    width: "100%",
                    height: "175px",
                    backgroundColor: "#F8FAFC",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    padding: "16px",
                    borderBottom: "1px solid #F1F5F9",
                  }}
                >
                  <img
                    src={`${getStorageUrl()}/storage/${selectedTool.foto_path}`}
                    alt={selectedTool.nama_alat}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>
              ) : (
                <LabBannerSVG height="165px" />
              )}

              {/* Modal Inner Content */}
              <div className="px-4 pt-3 pb-4 text-center">
                {/* Equipment Title */}
                <h3
                  className="fw-bold mb-2"
                  style={{
                    color: "#3E2723",
                    fontFamily: "Poppins, sans-serif",
                    fontSize: "1.35rem",
                    letterSpacing: "-0.3px",
                  }}
                >
                  {selectedTool.nama_alat}
                </h3>

                {/* Status Badge */}
                <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
                  <span
                    className="px-3 py-1 fw-bold text-uppercase"
                    style={{
                      backgroundColor: selectedTool.status === "tersedia" ? "#A8E6CF" : "#FFD3B6",
                      color: selectedTool.status === "tersedia" ? "#1E5E27" : "#D35400",
                      borderRadius: "20px",
                      fontSize: "0.8rem",
                    }}
                  >
                    {selectedTool.status}
                  </span>
                </div>

                {/* Two Columns: Tipe & Harga Sewa */}
                <Row className="mb-3 text-center">
                  <Col xs={6}>
                    <div className="fw-bold mb-1" style={{ color: "#3E2723", fontSize: "0.9rem" }}>
                      Tipe Layanan
                    </div>
                    <div className="text-secondary fw-semibold" style={{ fontSize: "0.82rem" }}>
                      {selectedTool.is_paid ? (
                        <span className="text-danger">Berbayar</span>
                      ) : (
                        <span className="text-success">Gratis</span>
                      )}
                    </div>
                  </Col>
                  <Col xs={6}>
                    <div className="fw-bold mb-1" style={{ color: "#3E2723", fontSize: "0.9rem" }}>
                      Harga Sewa
                    </div>
                    <div className="text-secondary fw-semibold" style={{ fontSize: "0.82rem" }}>
                      {selectedTool.is_paid ? `Rp ${Number(selectedTool.harga_sewa).toLocaleString("id-ID")}` : "-"}
                    </div>
                  </Col>
                </Row>

                <Row className="mb-3 text-center">
                  <Col xs={6}>
                    <div className="fw-bold mb-1" style={{ color: "#3E2723", fontSize: "0.9rem" }}>
                      Total Unit
                    </div>
                    <div className="text-secondary fw-semibold" style={{ fontSize: "0.82rem" }}>
                      {selectedTool.total_unit ?? 1} Unit
                    </div>
                  </Col>
                  <Col xs={6}>
                    <div className="fw-bold mb-1" style={{ color: "#3E2723", fontSize: "0.9rem" }}>
                      Status Alat
                    </div>
                    <div className="text-secondary fw-semibold" style={{ fontSize: "0.82rem" }}>
                      <span className={selectedTool.status === "tersedia" ? "text-success fw-bold" : "text-warning fw-bold"}>
                        {selectedTool.status === "tersedia" ? "Tersedia untuk Dipinjam" : selectedTool.status}
                      </span>
                    </div>
                  </Col>
                </Row>

                {/* Info Note */}
                <div
                  className="mb-3 p-2 rounded text-center"
                  style={{ backgroundColor: "#F5EFEA", fontSize: "0.78rem", color: "#6D4C41", border: "1px dashed #D7CCC8" }}
                >
                  ℹ️ Ketersediaan tanggal peminjaman akan diverifikasi pada formulir pengajuan. Alat yang sudah dipesan klien lain tidak dapat dipinjam di tanggal bersamaan.
                </div>

                {/* Deskripsi Section */}
                <div className="mb-3">
                  <div className="fw-bold mb-1" style={{ color: "#3E2723", fontSize: "0.9rem" }}>
                    Deskripsi
                  </div>
                  <p
                    className="mb-0 px-2"
                    style={{
                      color: "#5D4037",
                      fontSize: "0.82rem",
                      lineHeight: "1.5",
                      textAlign: "center",
                    }}
                  >
                    {selectedTool.deskripsi || "-"}
                  </p>
                </div>

                {/* Quantity Selector Section */}
                {currentMaxStock > 0 && (
                  <div
                    className="p-3 mb-4"
                    style={{
                      backgroundColor: "#F9F6F3",
                      borderRadius: "16px",
                      border: "1px solid #ECE4DE",
                    }}
                  >
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="fw-bold" style={{ color: "#4A3933", fontSize: "0.86rem" }}>
                        Jumlah Unit:
                      </span>
                      <div className="d-flex align-items-center gap-2">
                        <Button
                          variant="light"
                          size="sm"
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            padding: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#fff",
                            border: "1px solid #D0D0D0",
                            color: "#543D31",
                          }}
                          onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                          disabled={quantity <= 1}
                        >
                          <FaMinus size={10} />
                        </Button>
                        <Form.Control
                          type="number"
                          min="1"
                          max={currentMaxStock}
                          value={quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (isNaN(val) || val < 1) setQuantity(1);
                            else if (val > currentMaxStock) setQuantity(currentMaxStock);
                            else setQuantity(val);
                          }}
                          style={{
                            width: "56px",
                            textAlign: "center",
                            fontWeight: "700",
                            fontSize: "0.92rem",
                            border: "1px solid #D0D0D0",
                            borderRadius: "10px",
                            padding: "4px 6px",
                            boxShadow: "none",
                          }}
                        />
                        <Button
                          variant="light"
                          size="sm"
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            padding: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#fff",
                            border: "1px solid #D0D0D0",
                            color: "#543D31",
                          }}
                          onClick={() => setQuantity((prev) => Math.min(currentMaxStock, prev + 1))}
                          disabled={quantity >= currentMaxStock}
                        >
                          <FaPlus size={10} />
                        </Button>
                      </div>
                    </div>

                    {selectedTool.is_paid && (
                      <div className="d-flex justify-content-between align-items-center pt-2 border-top" style={{ borderColor: "#E5DDD6 !important" }}>
                        <span className="text-muted" style={{ fontSize: "0.8rem" }}>
                          Estimasi Biaya:
                        </span>
                        <span className="fw-bold" style={{ color: "#543D31", fontSize: "0.92rem" }}>
                          Rp {(Number(selectedTool.harga_sewa) * quantity).toLocaleString("id-ID")}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="d-flex justify-content-center gap-3 pt-1">
                  <Button
                    style={{
                      backgroundColor: "#9E9E9E",
                      borderColor: "#9E9E9E",
                      color: "#FFFFFF",
                      borderRadius: "28px",
                      padding: "8px 24px",
                      fontWeight: "600",
                      fontSize: "0.86rem",
                      boxShadow: "0 3px 8px rgba(0,0,0,0.12)",
                    }}
                    onClick={handleCloseModal}
                  >
                    Tutup
                  </Button>
                  <Button
                    style={{
                      backgroundColor: (selectedTool.status === "rusak" || selectedTool.status === "perawatan" || currentMaxStock <= 0) ? "#D3D3D3" : "#543D31",
                      borderColor: (selectedTool.status === "rusak" || selectedTool.status === "perawatan" || currentMaxStock <= 0) ? "#D3D3D3" : "#543D31",
                      color: "#FFFFFF",
                      borderRadius: "28px",
                      padding: "8px 22px",
                      fontWeight: "600",
                      fontSize: "0.86rem",
                      boxShadow: (selectedTool.status === "rusak" || selectedTool.status === "perawatan" || currentMaxStock <= 0) ? "none" : "0 4px 12px rgba(84,61,49,0.35)",
                      cursor: (selectedTool.status === "rusak" || selectedTool.status === "perawatan" || currentMaxStock <= 0) ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                    disabled={selectedTool.status === "rusak" || selectedTool.status === "perawatan" || currentMaxStock <= 0}
                    onClick={handleAddToCart}
                  >
                    <FaCartPlus size={14} />
                    {(selectedTool.status === "rusak" || selectedTool.status === "perawatan" || currentMaxStock <= 0) ? "Tidak Tersedia" : "Tambah Keranjang"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* ─── Modal Keranjang Peminjaman ─── */}
        <Modal
          show={showCartModal}
          onHide={() => setShowCartModal(false)}
          centered
          size="lg"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          <Modal.Header closeButton style={{ borderBottom: "1px solid #F0F0F0", padding: "18px 24px" }}>
            <div className="d-flex align-items-center gap-2">
              <FaShoppingCart style={{ color: "#543D31", fontSize: "1.2rem" }} />
              <Modal.Title style={{ fontSize: "1.2rem", fontWeight: "700", color: "#3E2723" }}>
                Keranjang Peminjaman Alat ({cart.length})
              </Modal.Title>
            </div>
          </Modal.Header>

          <Modal.Body style={{ padding: "20px 24px" }}>
            {cart.length === 0 ? (
              <div className="text-center py-5">
                <FaShoppingCart size={48} className="text-muted mb-3" style={{ opacity: 0.4 }} />
                <h5 className="fw-semibold text-secondary mb-2">Keranjang Peminjaman Kosong</h5>
                <p className="text-muted mb-4" style={{ fontSize: "0.9rem" }}>
                  Pilih alat analisis yang Anda butuhkan dari daftar alat dan tambahkan ke keranjang.
                </p>
                <Button
                  style={{
                    backgroundColor: "#543D31",
                    borderColor: "#543D31",
                    color: "#FFFFFF",
                    borderRadius: "24px",
                    padding: "8px 24px",
                    fontWeight: "600",
                    fontSize: "0.88rem",
                  }}
                  onClick={() => setShowCartModal(false)}
                >
                  Pilih Alat Sekarang
                </Button>
              </div>
            ) : (
              <div>
                {/* List Item Keranjang */}
                <div className="d-flex flex-column gap-3 mb-4" style={{ maxHeight: "380px", overflowY: "auto" }}>
                  {cart.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 d-flex flex-wrap align-items-center justify-content-between gap-3"
                      style={{
                        backgroundColor: "#FDFBF9",
                        border: "1px solid #EBE4DF",
                        borderRadius: "16px",
                      }}
                    >
                      <div style={{ flex: "1 1 200px" }}>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: "0.95rem" }}>
                            {item.nama_alat}
                          </h6>
                          <Badge
                            bg={item.is_paid ? "danger" : "success"}
                            style={{ fontSize: "0.72rem", fontWeight: "600" }}
                          >
                            {item.is_paid ? "Berbayar" : "Gratis"}
                          </Badge>
                        </div>
                        <div className="text-muted" style={{ fontSize: "0.82rem" }}>
                          Harga Satuan: {item.is_paid ? `Rp ${Number(item.harga_sewa).toLocaleString("id-ID")}` : "Gratis"}
                        </div>
                      </div>

                      {/* Quantity Controller */}
                      <div className="d-flex align-items-center gap-2">
                        <Button
                          variant="light"
                          size="sm"
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            padding: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#fff",
                            border: "1px solid #D0D0D0",
                          }}
                          onClick={() => handleUpdateCartQty(item.id, -1)}
                        >
                          <FaMinus size={10} />
                        </Button>
                        <span
                          style={{
                            minWidth: "32px",
                            textAlign: "center",
                            fontWeight: "700",
                            fontSize: "0.92rem",
                            color: "#333",
                          }}
                        >
                          {item.quantity}
                        </span>
                        <Button
                          variant="light"
                          size="sm"
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            padding: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#fff",
                            border: "1px solid #D0D0D0",
                          }}
                          onClick={() => handleUpdateCartQty(item.id, 1)}
                          disabled={item.quantity >= (item.total_unit ?? 99)}
                        >
                          <FaPlus size={10} />
                        </Button>
                      </div>

                      {/* Subtotal & Delete */}
                      <div className="d-flex align-items-center gap-3">
                        <div className="text-end" style={{ minWidth: "110px" }}>
                          <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                            Subtotal
                          </div>
                          <div className="fw-bold" style={{ color: "#543D31", fontSize: "0.92rem" }}>
                            {item.is_paid
                              ? `Rp ${(Number(item.harga_sewa) * item.quantity).toLocaleString("id-ID")}`
                              : "Rp 0"}
                          </div>
                        </div>

                        <Button
                          variant="outline-danger"
                          size="sm"
                          style={{
                            borderRadius: "50%",
                            width: "32px",
                            height: "32px",
                            padding: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          onClick={() => handleRemoveFromCart(item.id)}
                          title="Hapus dari keranjang"
                        >
                          <FaTrashAlt size={12} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary Card */}
                <div
                  className="p-3 mb-3"
                  style={{
                    backgroundColor: "#F5ECE6",
                    borderRadius: "16px",
                    border: "1px solid #E2D1C5",
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                      Total Jenis Alat:
                    </span>
                    <span className="fw-semibold text-dark" style={{ fontSize: "0.88rem" }}>
                      {cart.length} Jenis ({totalCartUnits} Unit)
                    </span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center pt-2 border-top" style={{ borderColor: "#D8C3B5 !important" }}>
                    <span className="fw-bold" style={{ color: "#3E2723", fontSize: "0.95rem" }}>
                      Total Estimasi Biaya Sewa:
                    </span>
                    <span className="fw-bold" style={{ color: "#543D31", fontSize: "1.15rem" }}>
                      Rp {totalCartPrice.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </Modal.Body>

          {cart.length > 0 && (
            <Modal.Footer
              style={{
                borderTop: "1px solid #F0F0F0",
                padding: "16px 24px",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Button
                variant="outline-secondary"
                style={{
                  borderRadius: "24px",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  padding: "8px 18px",
                }}
                onClick={handleClearCart}
              >
                Kosongkan Keranjang
              </Button>

              <div className="d-flex gap-2">
                <Button
                  variant="light"
                  style={{
                    borderRadius: "24px",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    padding: "8px 18px",
                    backgroundColor: "#EAE7E4",
                    border: "none",
                  }}
                  onClick={() => setShowCartModal(false)}
                >
                  + Tambah Alat Lain
                </Button>

                <Button
                  style={{
                    backgroundColor: "#543D31",
                    borderColor: "#543D31",
                    color: "#FFFFFF",
                    borderRadius: "24px",
                    padding: "8px 24px",
                    fontWeight: "600",
                    fontSize: "0.88rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 4px 12px rgba(84,61,49,0.3)",
                  }}
                  onClick={handleProceedToCheckout}
                >
                  Lanjut Pengajuan <FaArrowRight size={12} />
                </Button>
              </div>
            </Modal.Footer>
          )}
        </Modal>

        {/* Custom CSS */}
        <style>{`
          .modal-custom-detail {
            max-width: 420px !important;
            width: 92% !important;
            margin: 1.75rem auto !important;
            transform: translateY(35px) !important;
          }
          .modal-custom-detail .modal-content {
            border: none !important;
            background: transparent !important;
            border-radius: 24px !important;
            box-shadow: none !important;
          }
          @keyframes fadeInDown {
            from { opacity: 0; transform: translateY(-15px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes bounceIn {
            0% { transform: scale(0.8); opacity: 0; }
            70% { transform: scale(1.05); }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </Container>
      <FooterSetelahLogin />
    </NavbarLoginKlien>
  );
};

export default DaftarAlat;
