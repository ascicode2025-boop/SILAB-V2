import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Modal } from "react-bootstrap";
import { FaTools } from "react-icons/fa";
import { useHistory } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import Footer from "./Footer";
import DaftarAlatComponent, { LabBannerSVG } from "../components/DaftarAlat/DaftarAlatComponent";
import { getStorageUrl } from "../config/apiConfig";
import axios from "axios";

const DaftarAlatSebelumLogin = () => {
  const history = useHistory();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTool, setSelectedTool] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [tools, setTools] = useState([]);

  useEffect(() => {
    document.title = "SILAB-NTDK - Daftar Alat Analisis";
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/instruments");
      setTools(response.data.data);
    } catch (error) {
      console.error("Gagal mengambil data alat", error);
    }
  };

  const handleOpenModal = (tool) => {
    setSelectedTool(tool);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTool(null);
  };

  const handleAjukanPeminjaman = () => {
    handleCloseModal();
    history.push("/login");
  };

  const filteredTools = tools.filter(
    (tool) =>
      (tool.nama_alat || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tool.deskripsi || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Header Banner (Khusus Halaman Sebelum Login) */}
      <div
        style={{
          backgroundColor: "#EAE7E4",
          padding: "44px 20px",
          textAlign: "center",
          fontFamily: "Poppins, sans-serif",
          width: "100%",
          borderBottom: "1px solid #E0DDD9",
        }}
      >
        <Container style={{ maxWidth: "800px" }}>
          {/* Centered Subtitle with Lines on Left & Right */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "14px",
              marginBottom: "14px",
            }}
          >
            <div
              style={{
                width: "45px",
                height: "2px",
                backgroundColor: "#8D6E63",
                borderRadius: "2px",
              }}
            />
            <span
              style={{
                fontSize: "0.82rem",
                fontWeight: "800",
                color: "#3E2723",
                letterSpacing: "1.2px",
                textTransform: "uppercase",
              }}
            >
              SILAB-NTDK SYSTEM
            </span>
            <div
              style={{
                width: "45px",
                height: "2px",
                backgroundColor: "#8D6E63",
                borderRadius: "2px",
              }}
            />
          </div>

          {/* Main Title */}
          <h1
            style={{
              fontWeight: 800,
              fontSize: "2.2rem",
              color: "#332723",
              marginBottom: "10px",
              letterSpacing: "-0.5px",
            }}
          >
            Daftar Peminjaman Alat Analisis
          </h1>

          {/* Subtitle Description */}
          <p
            style={{
              color: "#555555",
              fontSize: "0.95rem",
              margin: 0,
              fontWeight: 400,
            }}
          >
            Silahkan lihat jenis alat analisis yang anda butuhkan disini.
          </p>
        </Container>
      </div>

      <Container
        fluid
        className="py-4 px-3 px-md-5"
        style={{
          minHeight: "80vh",
          backgroundColor: "#EAE7E4",
          fontFamily: "Poppins, sans-serif",
        }}
      >

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

        {/* Modal Detail Ketersediaan Alat */}
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
                      backgroundColor: selectedTool.status === 'tersedia' ? "#A8E6CF" : "#FFD3B6",
                      color: selectedTool.status === 'tersedia' ? "#1E5E27" : "#D35400",
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
                      {selectedTool.is_paid && selectedTool.harga_sewa ? `Rp ${Number(selectedTool.harga_sewa).toLocaleString('id-ID')}` : "-"}
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
                <div className="mb-4">
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
                    {selectedTool.deskripsi}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="d-flex justify-content-center gap-3 pt-1">
                  <Button
                    style={{
                      backgroundColor: "#9E9E9E",
                      borderColor: "#9E9E9E",
                      color: "#FFFFFF",
                      borderRadius: "28px",
                      padding: "8px 28px",
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
                      backgroundColor: (selectedTool.status === "rusak" || selectedTool.status === "perawatan" || (selectedTool.total_unit ?? 1) <= 0) ? "#D3D3D3" : "#A6867B",
                      borderColor: (selectedTool.status === "rusak" || selectedTool.status === "perawatan" || (selectedTool.total_unit ?? 1) <= 0) ? "#D3D3D3" : "#A6867B",
                      color: "#FFFFFF",
                      borderRadius: "28px",
                      padding: "8px 22px",
                      fontWeight: "600",
                      fontSize: "0.86rem",
                      boxShadow: (selectedTool.status === "rusak" || selectedTool.status === "perawatan" || (selectedTool.total_unit ?? 1) <= 0) ? "none" : "0 3px 8px rgba(166,134,123,0.35)",
                      cursor: (selectedTool.status === "rusak" || selectedTool.status === "perawatan" || (selectedTool.total_unit ?? 1) <= 0) ? "not-allowed" : "pointer"
                    }}
                    disabled={selectedTool.status === "rusak" || selectedTool.status === "perawatan" || (selectedTool.total_unit ?? 1) <= 0}
                    onClick={handleAjukanPeminjaman}
                  >
                    {(selectedTool.status === "rusak" || selectedTool.status === "perawatan" || (selectedTool.total_unit ?? 1) <= 0) ? "Tidak Tersedia" : "Ajukan Peminjaman"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* Custom CSS for modal width, centering, and downward position */}
        <style>{`
          .modal-custom-detail {
            max-width: 400px !important;
            width: 92% !important;
            margin: 1.75rem auto !important;
            transform: translateY(57px) !important;
          }
          .modal-custom-detail .modal-content {
            border: none !important;
            background: transparent !important;
            border-radius: 24px !important;
            box-shadow: none !important;
          }
        `}</style>
      </Container>
      <Footer />
    </>
  );
};

export default DaftarAlatSebelumLogin;
