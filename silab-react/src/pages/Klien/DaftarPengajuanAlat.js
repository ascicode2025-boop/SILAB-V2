import React, { useState, useEffect } from "react";
import { Container, Card, Badge, Spinner, Nav, Modal, Button } from "react-bootstrap";
import { FaChevronRight, FaTools, FaTrash, FaShoppingCart, FaArrowRight } from "react-icons/fa";
import { useHistory } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import NavbarLoginKlien from "./NavbarLoginKlien";
import FooterSetelahLogin from "../FooterSetelahLogin";
import { getRentals, deleteRental } from "../../services/RentalService";

const DaftarPengajuanAlat = () => {
  const history = useHistory();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("semua"); // semua, aktif, riwayat
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    document.title = "SILAB-NTDK - Daftar Pengajuan Peminjaman Alat";
    fetchData();
    try {
      const savedCart = JSON.parse(localStorage.getItem("equipment_cart") || "[]");
      setCartCount(Array.isArray(savedCart) ? savedCart.length : 0);
    } catch (e) {}
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getRentals();
      setRentals(Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Gagal mengambil daftar peminjaman:", err);
      setRentals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = (id) => {
    history.push(`/dashboard/detailPengajuan/step/${id}`);
  };

  const handleDeleteClick = (e, id) => {
    e.stopPropagation();
    setSelectedDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedDeleteId) return;
    try {
      await deleteRental(selectedDeleteId);
      setShowDeleteModal(false);
      setSelectedDeleteId(null);
      fetchData(); // Reload data
    } catch (error) {
      alert("Gagal menghapus riwayat.");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return { label: "Menunggu Verifikasi", bg: "#A6867B" };
      case "disetujui":
        return { label: "Disetujui", bg: "#2E7D32" };
      case "siap_diambil":
        return { label: "Siap Diambil", bg: "#2E7D32" };
      case "aktif":
        return { label: "Sedang Dipinjam", bg: "#2E7D32" };
      case "menunggu_pengembalian":
        return { label: "Menunggu Pengembalian", bg: "#A6867B" };
      case "menunggu_pembayaran_denda":
        return { label: "Menunggu Pembayaran Denda", bg: "#E65100" };
      case "ditolak":
        return { label: "Ditolak", bg: "#C62828" };
      case "selesai":
        return { label: "Selesai", bg: "#616161" };
      default:
        return { label: status || "Diproses", bg: "#A6867B" };
    }
  };

  const countSemua = rentals.length;
  const countAktif = rentals.filter((r) => !["selesai", "ditolak", "dibatalkan"].includes(r.status)).length;
  const countRiwayat = rentals.filter((r) => ["selesai", "ditolak", "dibatalkan"].includes(r.status)).length;

  return (
    <NavbarLoginKlien>
      <style>{`
        .pengajuan-title { font-size: 1.9rem; }
        .tab-btn { padding: 8px 24px; font-size: 0.9rem; }
        .cart-banner { flex-direction: row; }
        @media (max-width: 768px) {
          .pengajuan-title { font-size: 1.4rem !important; }
          .tab-btn { padding: 6px 14px !important; font-size: 0.8rem !important; }
          .cart-banner { flex-direction: column !important; align-items: stretch !important; text-align: center; }
          .cart-banner > div { align-items: center !important; flex-direction: column !important; gap: 8px !important; }
          .cart-banner button { align-self: stretch !important; justify-content: center; margin-top: 8px; }
          .pengajuan-card .card-body { flex-direction: column !important; align-items: flex-start !important; gap: 16px !important; }
          .pengajuan-card .card-body > div:last-child { 
            width: 100%; 
            flex-direction: column-reverse !important; 
            align-items: flex-end !important; 
            gap: 16px !important; 
          }
          .pengajuan-card .card-body > div:last-child > button {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
      <Container
        fluid
        className="py-5 px-3 px-md-5"
        style={{
          minHeight: "100vh",
          backgroundColor: "#e9e9e9",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        <div className="mx-auto" style={{ maxWidth: "920px" }}>
          {/* Header Subtitle */}
          <div className="mb-4">
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
              className="fw-bold text-dark mt-1 mb-1 pengajuan-title"
              style={{
                color: "#2D3436",
              }}
            >
              Detail Pengajuan Peminjaman Alat
            </h2>
            <p className="text-muted mb-0" style={{ fontSize: "0.92rem" }}>
              Klik pada pengajuan alat untuk melihat status progress peminjaman secara lengkap.
            </p>
          </div>

          {/* Cart Reminder Banner */}
          {cartCount > 0 && (
            <div
              className="p-3 mb-4 d-flex flex-wrap align-items-center justify-content-between gap-3 cart-banner"
              style={{
                backgroundColor: "#543D31",
                color: "#ffffff",
                borderRadius: "18px",
                boxShadow: "0 6px 18px rgba(84, 61, 49, 0.25)",
              }}
            >
              <div className="d-flex align-items-center gap-3">
                <div
                  style={{
                    backgroundColor: "rgba(255,255,255,0.15)",
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.1rem",
                  }}
                >
                  <FaShoppingCart />
                </div>
                <div>
                  <div className="fw-bold" style={{ fontSize: "0.95rem" }}>
                    Ada {cartCount} jenis alat di keranjang peminjaman Anda
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "#F5EBE6" }}>
                    Lanjutkan formulir pengajuan peminjaman untuk menyelesaikan peminjaman alat.
                  </div>
                </div>
              </div>

              <Button
                style={{
                  backgroundColor: "#A6867B",
                  borderColor: "#A6867B",
                  color: "#FFFFFF",
                  borderRadius: "24px",
                  padding: "8px 20px",
                  fontWeight: "600",
                  fontSize: "0.85rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
                onClick={() => history.push("/dashboard/pengajuanPeminjaman")}
              >
                Lanjutkan Pengajuan <FaArrowRight size={12} />
              </Button>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="d-flex flex-wrap gap-2 mb-4">
            {[
              { key: "semua", label: `Semua (${countSemua})` },
              { key: "aktif", label: `Aktif (${countAktif})` },
              { key: "riwayat", label: `Riwayat (${countRiwayat})`, title: "Selesai, Ditolak, atau Batal" },
            ].map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  title={tab.title}
                  className="tab-btn"
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    backgroundColor: isActive ? "#8D6E63" : "#FFFFFF",
                    color: isActive ? "#FFFFFF" : "#424242",
                    border: isActive ? "none" : "1.5px solid #D0D0D0",
                    borderRadius: "30px",
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: isActive
                      ? "0 4px 14px rgba(141, 110, 99, 0.35)"
                      : "0 2px 6px rgba(0, 0, 0, 0.04)",
                    transition: "all 0.2s ease-in-out",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = "#F5F0EE";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = "#FFFFFF";
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* List of Submission Cards */}
          <div className="d-flex flex-column gap-3 mb-5">
            {loading ? (
              <div className="text-center py-5 bg-white rounded-4 shadow-sm">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2 text-muted">Memuat data pengajuan...</p>
              </div>
            ) : (() => {
                const filteredRentals = rentals.filter((item) => {
                  if (activeTab === "semua") return true;
                  const isHistory = ["selesai", "ditolak", "dibatalkan"].includes(item.status);
                  if (activeTab === "riwayat") return isHistory;
                  if (activeTab === "aktif") return !isHistory;
                  return true;
                });
                
                if (filteredRentals.length === 0) {
                  return (
                    <div className="text-center py-5 bg-white rounded-4 shadow-sm">
                      <FaTools size={48} className="text-muted mb-3" />
                      <h5 className="fw-semibold text-secondary">Belum Ada Pengajuan</h5>
                      <p className="text-muted mb-3">Tidak ada pengajuan pada tab ini.</p>
                      <button
                        className="btn text-white fw-semibold px-4 py-2"
                        style={{ backgroundColor: "#8D6E63", borderRadius: "20px" }}
                        onClick={() => history.push("/dashboard/pengajuanPeminjaman")}
                      >
                        + Ajukan Peminjaman
                      </button>
                    </div>
                  );
                }

                const renderCard = (item) => {
                  const toolNames = item.instruments?.map((i) => i.nama_alat).join(", ") || "Peminjaman Alat";
                  const kodeStr = `PJ-${String(item.id).padStart(3, "0")} – ${toolNames}`;
                  const tanggalStr = item.created_at
                    ? new Date(item.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })
                    : item.tanggal_peminjaman || "-";
                  const badgeInfo = getStatusBadge(item.status);

                  return (
                    <Card
                      key={item.id}
                      className="border-0 shadow-sm pengajuan-card mb-3"
                      style={{
                        borderRadius: "20px",
                        backgroundColor: "#ffffff",
                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                        cursor: "pointer",
                      }}
                      onClick={() => handleOpenDetail(item.id)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-3px)";
                        e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.08)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";
                      }}
                    >
                      <Card.Body className="px-4 py-3.5 d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2">
                        {/* Left Info: Code & Date */}
                        <div>
                          <h5
                            className="fw-bold mb-1 text-dark"
                            style={{
                              fontSize: "1.05rem",
                              fontFamily: "Poppins, sans-serif",
                              letterSpacing: "-0.2px",
                            }}
                          >
                            {kodeStr}
                          </h5>
                          <div
                            className="text-muted"
                            style={{
                              fontSize: "0.88rem",
                              color: "#6C757D",
                            }}
                          >
                            {tanggalStr}
                          </div>
                        </div>

                        {/* Right Info: Status Pill & Lihat Progress */}
                        <div className="d-flex align-items-center gap-3">
                          {["selesai", "ditolak", "dibatalkan"].includes(item.status) && (
                            <button
                              className="btn btn-outline-danger btn-sm px-3 rounded-pill"
                              onClick={(e) => handleDeleteClick(e, item.id)}
                              style={{ fontWeight: "600" }}
                            >
                              <FaTrash size={12} className="me-2 mb-1" /> Hapus
                            </button>
                          )}
                          <div className="d-flex flex-column align-items-end gap-1">
                            <span
                              className="badge"
                              style={{
                                backgroundColor: badgeInfo.bg,
                                color: "#ffffff",
                                borderRadius: "20px",
                                padding: "6px 18px",
                                fontSize: "0.82rem",
                                fontWeight: "600",
                                letterSpacing: "0.2px",
                              }}
                            >
                              {badgeInfo.label}
                            </span>
                            <div
                              className="fw-bold mt-1 d-flex align-items-center"
                              style={{
                                fontSize: "0.85rem",
                                color: "#4A3B32",
                                cursor: "pointer",
                              }}
                            >
                              Lihat Progress <FaChevronRight size={10} className="ms-1" />
                              <FaChevronRight size={10} style={{ marginLeft: "-3px" }} />
                            </div>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  );
                };

                if (activeTab === "riwayat") {
                  const selesai = filteredRentals.filter((i) => i.status === "selesai");
                  const ditolak = filteredRentals.filter((i) => i.status === "ditolak");
                  const dibatalkan = filteredRentals.filter((i) => i.status === "dibatalkan");
                  
                  return (
                    <>
                      {selesai.length > 0 && (
                        <div className="mb-4">
                          <h6 className="fw-bold text-muted mb-3 px-2">Selesai</h6>
                          {selesai.map(renderCard)}
                        </div>
                      )}
                      {ditolak.length > 0 && (
                        <div className="mb-4">
                          <h6 className="fw-bold text-muted mb-3 px-2">Ditolak</h6>
                          {ditolak.map(renderCard)}
                        </div>
                      )}
                      {dibatalkan.length > 0 && (
                        <div className="mb-4">
                          <h6 className="fw-bold text-muted mb-3 px-2">Dibatalkan</h6>
                          {dibatalkan.map(renderCard)}
                        </div>
                      )}
                    </>
                  );
                }
                
                return filteredRentals.map(renderCard);
              })()}
          </div>
        </div>
      </Container>
      <FooterSetelahLogin />

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
        </Modal.Header>
        <Modal.Body className="text-center pt-0 pb-4 px-4">
          <div className="mb-3">
            <div
              className="mx-auto bg-danger bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: "80px", height: "80px" }}
            >
              <FaTrash className="text-danger" size={32} />
            </div>
          </div>
          <h4 className="fw-bold mb-2">Hapus Riwayat?</h4>
          <p className="text-muted mb-4">
            Apakah Anda yakin ingin menghapus riwayat pengajuan ini? Data yang sudah dihapus tidak dapat dikembalikan.
          </p>
          <div className="d-flex justify-content-center gap-2">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)} className="px-4 rounded-pill fw-semibold" style={{ minWidth: "120px" }}>
              Batal
            </Button>
            <Button variant="danger" onClick={confirmDelete} className="px-4 rounded-pill fw-semibold" style={{ minWidth: "120px" }}>
              Hapus
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </NavbarLoginKlien>
  );
};

export default DaftarPengajuanAlat;
