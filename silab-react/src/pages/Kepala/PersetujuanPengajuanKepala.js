 import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Button, Modal, Form, Badge } from "react-bootstrap";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import NavbarLoginKepala from "./NavbarLoginKepala";
import FooterSetelahLogin from "../FooterSetelahLogin";
import "@fontsource/poppins";

// Initial Demo Data matching the screenshot & workflow
const INITIAL_LOANS = [
  {
    id: "PJ001",
    noPengajuan: "PJ001",
    namaPeminjam: "Nadine Maulia",
    institusi: "Departemen Ilmu Nutrisi dan Teknologi Pakan",
    alat: "Micropipette",
    jumlah: "2 Unit",
    tanggalPinjam: "2 Juli 2026",
    tanggalKembali: "5 Juli 2026",
    tujuan: "Penelitian analisis sampel pakan dan metabolit laboratorium.",
    status: "Diverifikasi",
  },
  {
    id: "PJ002",
    noPengajuan: "PJ001",
    namaPeminjam: "Nadine Maulia",
    institusi: "Departemen Ilmu Nutrisi dan Teknologi Pakan",
    alat: "Micropipette",
    jumlah: "1 Unit",
    tanggalPinjam: "2 Juli 2026",
    tanggalKembali: "6 Juli 2026",
    tujuan: "Uji presisi cairan sampel ternak daging.",
    status: "Diverifikasi",
  },
  {
    id: "PJ003",
    noPengajuan: "PJ001",
    namaPeminjam: "Nadine Maulia",
    institusi: "Fakultas Peternakan IPB",
    alat: "Micropipette",
    jumlah: "2 Unit",
    tanggalPinjam: "2 Juli 2026",
    tanggalKembali: "7 Juli 2026",
    tujuan: "Praktikum analisis hematologi dan nutrisi pakan.",
    status: "Diverifikasi",
  },
  {
    id: "PJ004",
    noPengajuan: "PJ001",
    namaPeminjam: "Nadine Maulia",
    institusi: "Fakultas Peternakan IPB",
    alat: "Micropipette",
    jumlah: "3 Unit",
    tanggalPinjam: "2 Juli 2026",
    tanggalKembali: "8 Juli 2026",
    tujuan: "Preparasi ekstraksi sampel kimia laboratorium.",
    status: "Diverifikasi",
  },
];

// Data 5 Bulan untuk Bar Chart
const CHART_DATA = [
  { bulan: "Jan", total: 20 },
  { bulan: "Feb", total: 55 },
  { bulan: "Mar", total: 45 },
  { bulan: "Apr", total: 65 },
  { bulan: "Mei", total: 48 },
];

// Custom 3D-effect Bar Shape
const CustomBar = (props) => {
  const { fill, x, y, width, height } = props;
  if (!width || !height || height <= 0) return null;
  const depth = 8;
  const topColor = "#A8948C";
  const sideColor = "#5E4841";

  return (
    <g>
      {/* Front Face */}
      <rect x={x} y={y} width={width - depth} height={height} fill={fill} rx={2} />
      {/* Top Face (3D Cap) */}
      <polygon
        points={`
          ${x},${y}
          ${x + depth},${y - depth}
          ${x + width},${y - depth}
          ${x + width - depth},${y}
        `}
        fill={topColor}
      />
      {/* Right Side Face (3D Depth) */}
      <polygon
        points={`
          ${x + width - depth},${y}
          ${x + width},${y - depth}
          ${x + width},${y + height - depth}
          ${x + width - depth},${y + height}
        `}
        fill={sideColor}
      />
    </g>
  );
};

export default function PersetujuanPengajuanKepala() {
  const [loans, setLoans] = useState(() => {
    const saved = localStorage.getItem("silab_kepala_peminjaman_alat");
    return saved ? JSON.parse(saved) : INITIAL_LOANS;
  });

  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [alertInfo, setAlertInfo] = useState(null);

  useEffect(() => {
    document.title = "SILAB-NTDK - Persetujuan Pengajuan";
  }, []);

  const saveLoans = (updatedLoans) => {
    setLoans(updatedLoans);
    localStorage.setItem("silab_kepala_peminjaman_alat", JSON.stringify(updatedLoans));
  };

  const handleOpenDetail = (item) => {
    setSelectedLoan(item);
    setShowDetailModal(true);
  };

  const handleApprove = () => {
    if (!selectedLoan) return;
    const updated = loans.map((item) => (item.id === selectedLoan.id ? { ...item, status: "Disetujui" } : item));
    saveLoans(updated);
    setShowDetailModal(false);
    setAlertInfo({ type: "success", message: `Pengajuan ${selectedLoan.noPengajuan} (${selectedLoan.alat}) berhasil disetujui!` });
    setTimeout(() => setAlertInfo(null), 4000);
  };

  const handleRejectConfirm = () => {
    if (!selectedLoan) return;
    const updated = loans.map((item) => (item.id === selectedLoan.id ? { ...item, status: "Ditolak", alasanTolak: rejectReason } : item));
    saveLoans(updated);
    setShowRejectModal(false);
    setShowDetailModal(false);
    setRejectReason("");
    setAlertInfo({ type: "danger", message: `Pengajuan ${selectedLoan.noPengajuan} telah ditolak.` });
    setTimeout(() => setAlertInfo(null), 4000);
  };

  const stats = {
    total: 23,
    menunggu: 8,
    disetujui: 11,
    ditolak: 5,
  };

  return (
    <NavbarLoginKepala>
      <div
        style={{
          backgroundColor: "#FAF8F7",
          minHeight: "calc(100vh - 70px)",
          padding: "24px 32px 48px",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        <Container fluid className="px-0">
          {/* Notification Alert */}
          {alertInfo && (
            <div
              className={`alert alert-${alertInfo.type} alert-dismissible fade show shadow-sm mb-4`}
              role="alert"
              style={{ borderRadius: "12px", fontWeight: 500 }}
            >
              {alertInfo.message}
              <button type="button" className="btn-close" onClick={() => setAlertInfo(null)} aria-label="Close"></button>
            </div>
          )}

          {/* ===== 1. TOP STATISTIC CARDS ===== */}
          <Row className="g-3 mb-4">
            {/* Card 1: Total Pengajuan */}
            <Col xs={12} sm={6} lg={3}>
              <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "16px", backgroundColor: "#FFFFFF" }}>
                <Card.Body className="d-flex align-items-center p-3">
                  <div
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "50%",
                      backgroundColor: "#B39D94",
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.35rem",
                      fontWeight: 700,
                      flexShrink: 0,
                      boxShadow: "0 4px 10px rgba(179, 157, 148, 0.4)",
                    }}
                  >
                    {stats.total}
                  </div>
                  <div className="ms-3">
                    <h6 className="mb-1" style={{ fontWeight: 700, color: "#2E2421", fontSize: "1.02rem" }}>
                      Total Pengajuan
                    </h6>
                    <p className="mb-0 text-muted" style={{ fontSize: "0.76rem", lineHeight: 1.3 }}>
                      Pengajuan peminjaman alat per-bulan ini.
                    </p>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Card 2: Menunggu Approval */}
            <Col xs={12} sm={6} lg={3}>
              <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "16px", backgroundColor: "#FFFFFF" }}>
                <Card.Body className="d-flex align-items-center p-3">
                  <div
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "50%",
                      backgroundColor: "#B39D94",
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.35rem",
                      fontWeight: 700,
                      flexShrink: 0,
                      boxShadow: "0 4px 10px rgba(179, 157, 148, 0.4)",
                    }}
                  >
                    {stats.menunggu}
                  </div>
                  <div className="ms-3">
                    <h6 className="mb-1" style={{ fontWeight: 700, color: "#2E2421", fontSize: "1.02rem" }}>
                      Menunggu Approval
                    </h6>
                    <p className="mb-0 text-muted" style={{ fontSize: "0.76rem", lineHeight: 1.3 }}>
                      Total Pengguna yang menunggu persetujuan.
                    </p>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Card 3: Disetujui */}
            <Col xs={12} sm={6} lg={3}>
              <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "16px", backgroundColor: "#FFFFFF" }}>
                <Card.Body className="d-flex align-items-center p-3">
                  <div
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "50%",
                      backgroundColor: "#B39D94",
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.35rem",
                      fontWeight: 700,
                      flexShrink: 0,
                      boxShadow: "0 4px 10px rgba(179, 157, 148, 0.4)",
                    }}
                  >
                    {stats.disetujui}
                  </div>
                  <div className="ms-3">
                    <h6 className="mb-1" style={{ fontWeight: 700, color: "#2E2421", fontSize: "1.02rem" }}>
                      Disetujui
                    </h6>
                    <p className="mb-0 text-muted" style={{ fontSize: "0.76rem", lineHeight: 1.3 }}>
                      Peminjaman alat yang disetujui per-bulan ini.
                    </p>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Card 4: Ditolak */}
            <Col xs={12} sm={6} lg={3}>
              <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "16px", backgroundColor: "#FFFFFF" }}>
                <Card.Body className="d-flex align-items-center p-3">
                  <div
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "50%",
                      backgroundColor: "#B39D94",
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.35rem",
                      fontWeight: 700,
                      flexShrink: 0,
                      boxShadow: "0 4px 10px rgba(179, 157, 148, 0.4)",
                    }}
                  >
                    {stats.ditolak}
                  </div>
                  <div className="ms-3">
                    <h6 className="mb-1" style={{ fontWeight: 700, color: "#2E2421", fontSize: "1.02rem" }}>
                      Ditolak
                    </h6>
                    <p className="mb-0 text-muted" style={{ fontSize: "0.76rem", lineHeight: 1.3 }}>
                      Total Pengajuan alat yang ditolak
                    </p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* ===== 2. MIDDLE SECTION: BAR CHART & TITLE ===== */}
          <div
            className="mb-4 p-4"
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "20px",
              boxShadow: "0 2px 14px rgba(0,0,0,0.04)",
            }}
          >
            <Row className="align-items-center g-4">
              {/* Left Column: Soft Pinkish Card with Bar Chart */}
              <Col xs={12} lg={7} xl={8}>
                <div
                  style={{
                    backgroundColor: "#F9F3F0",
                    borderRadius: "18px",
                    padding: "20px 16px 12px",
                    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.02)",
                  }}
                >
                  <div style={{ width: "100%", height: "260px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={CHART_DATA} margin={{ top: 20, right: 20, left: -15, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8DFDC" />
                        <XAxis dataKey="bulan" tickLine={false} axisLine={{ stroke: "#D6C7C2" }} tick={{ fill: "#6D5D57", fontSize: 12, fontWeight: 500 }} />
                        <YAxis
                          domain={[0, 100]}
                          ticks={[10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
                          tickLine={false}
                          axisLine={{ stroke: "#D6C7C2" }}
                          tick={{ fill: "#8C7A74", fontSize: 11 }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#3A3330",
                            borderRadius: "8px",
                            border: "none",
                            color: "#FFFFFF",
                            fontSize: "0.85rem",
                          }}
                          itemStyle={{ color: "#F5ECE8" }}
                          formatter={(value) => [`${value} Peminjaman`, "Total"]}
                        />
                        <Bar dataKey="total" shape={<CustomBar />} fill="#7A5E55" barSize={34} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Col>

              {/* Right Column: Title and Description */}
              <Col xs={12} lg={5} xl={4}>
                <div className="ps-lg-3">
                  <h3
                    style={{
                      color: "#3E2723",
                      fontWeight: 800,
                      fontSize: "1.9rem",
                      lineHeight: "1.25",
                      letterSpacing: "-0.5px",
                    }}
                  >
                    Bar Chart
                    <br />
                    Peminjaman
                    <br />
                    Alat
                  </h3>
                  <p
                    style={{
                      color: "#6D5D57",
                      fontSize: "1rem",
                      marginTop: "16px",
                      fontWeight: 500,
                      lineHeight: "1.4",
                    }}
                  >
                    Total Peminjaman
                    <br />
                    Alat Lab per- 5 Bulan
                  </p>
                </div>
              </Col>
            </Row>
          </div>

          {/* ===== 3. BOTTOM SECTION: DAFTAR PENGAJUAN ALAT TABLE ===== */}
          <div className="mt-4">
            <h5
              style={{
                color: "#3E2723",
                fontWeight: 700,
                fontSize: "1.2rem",
                marginBottom: "16px",
                paddingLeft: "4px",
              }}
            >
              Daftar Pengajuan Alat
            </h5>

            <Card className="border-0 shadow-sm" style={{ borderRadius: "18px", backgroundColor: "#FFFFFF", overflow: "hidden" }}>
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table hover className="mb-0 align-middle text-center" style={{ minWidth: "750px" }}>
                    <thead style={{ backgroundColor: "#FFFFFF", borderBottom: "2px solid #F0ECE9" }}>
                      <tr>
                        <th className="py-3 px-3" style={{ fontWeight: 700, color: "#2E2421", fontSize: "0.92rem", width: "60px" }}>
                          No
                        </th>
                        <th className="py-3 px-3" style={{ fontWeight: 700, color: "#2E2421", fontSize: "0.92rem" }}>
                          No Pengajuan
                        </th>
                        <th className="py-3 px-3" style={{ fontWeight: 700, color: "#2E2421", fontSize: "0.92rem" }}>
                          Nama Peminjam
                        </th>
                        <th className="py-3 px-3" style={{ fontWeight: 700, color: "#2E2421", fontSize: "0.92rem" }}>
                          Alat
                        </th>
                        <th className="py-3 px-3" style={{ fontWeight: 700, color: "#2E2421", fontSize: "0.92rem" }}>
                          Tanggal Pinjam
                        </th>
                        <th className="py-3 px-3" style={{ fontWeight: 700, color: "#2E2421", fontSize: "0.92rem" }}>
                          Status
                        </th>
                        <th className="py-3 px-3" style={{ fontWeight: 700, color: "#2E2421", fontSize: "0.92rem" }}>
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {loans.map((item, index) => {
                        let badgeBg = "#54A0FF";
                        if (item.status === "Disetujui") badgeBg = "#2ECC71";
                        if (item.status === "Ditolak") badgeBg = "#E74C3C";
                        if (item.status === "Menunggu Approval") badgeBg = "#F39C12";

                        return (
                          <tr key={item.id || index} style={{ borderBottom: "1px solid #F7F4F2" }}>
                            <td className="py-3" style={{ color: "#4A3F3B", fontSize: "0.9rem" }}>
                              {index + 1}
                            </td>
                            <td className="py-3 fw-medium" style={{ color: "#4A3F3B", fontSize: "0.9rem" }}>
                              {item.noPengajuan}
                            </td>
                            <td className="py-3" style={{ color: "#4A3F3B", fontSize: "0.9rem" }}>
                              {item.namaPeminjam}
                            </td>
                            <td className="py-3" style={{ color: "#4A3F3B", fontSize: "0.9rem" }}>
                              {item.alat}
                            </td>
                            <td className="py-3" style={{ color: "#4A3F3B", fontSize: "0.9rem" }}>
                              {item.tanggalPinjam}
                            </td>
                            <td className="py-3">
                              <span
                                style={{
                                  backgroundColor: badgeBg,
                                  color: "#FFFFFF",
                                  borderRadius: "20px",
                                  padding: "4px 16px",
                                  fontSize: "0.8rem",
                                  fontWeight: 500,
                                  display: "inline-block",
                                }}
                              >
                                {item.status}
                              </span>
                            </td>
                            <td className="py-3">
                              <button
                                type="button"
                                onClick={() => handleOpenDetail(item)}
                                style={{
                                  backgroundColor: "#3A3330",
                                  color: "#FFFFFF",
                                  border: "none",
                                  borderRadius: "20px",
                                  padding: "5px 18px",
                                  fontSize: "0.82rem",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  transition: "0.2s all ease-in-out",
                                  boxShadow: "0 2px 6px rgba(58, 51, 48, 0.2)",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = "#5A4E4A";
                                  e.currentTarget.style.transform = "translateY(-1px)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = "#3A3330";
                                  e.currentTarget.style.transform = "translateY(0)";
                                }}
                              >
                                Detail
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </div>
        </Container>
      </div>

      {/* ===== MODAL DETAIL PENGAJUAN ===== */}
      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        centered
        size="lg"
        style={{ paddingTop: "60px" }}
      >
        <Modal.Header closeButton style={{ backgroundColor: "#F9F6F5", borderBottom: "1px solid #EAE3DF" }}>
          <Modal.Title style={{ fontWeight: 700, color: "#3E2723", fontSize: "1.15rem" }}>
            Detail Persetujuan Peminjaman Alat
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4" style={{ fontFamily: "Poppins, sans-serif" }}>
          {selectedLoan && (
            <div className="d-flex flex-column gap-3">
              <div className="p-3" style={{ backgroundColor: "#FAF7F5", borderRadius: "12px" }}>
                <Row className="g-3">
                  <Col xs={12} sm={6}>
                    <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                      No Pengajuan
                    </div>
                    <div className="fw-bold" style={{ color: "#3E2723", fontSize: "1rem" }}>
                      {selectedLoan.noPengajuan}
                    </div>
                  </Col>
                  <Col xs={12} sm={6}>
                    <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                      Status Pengajuan
                    </div>
                    <div>
                      <Badge
                        bg={
                          selectedLoan.status === "Disetujui"
                            ? "success"
                            : selectedLoan.status === "Ditolak"
                            ? "danger"
                            : "primary"
                        }
                        style={{ fontSize: "0.85rem", padding: "6px 14px", borderRadius: "20px" }}
                      >
                        {selectedLoan.status}
                      </Badge>
                    </div>
                  </Col>
                </Row>
              </div>

              <Row className="g-3">
                <Col xs={12} sm={6}>
                  <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                    Nama Peminjam
                  </div>
                  <div className="fw-semibold" style={{ color: "#2E2421" }}>
                    {selectedLoan.namaPeminjam}
                  </div>
                </Col>
                <Col xs={12} sm={6}>
                  <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                    Institusi / Unit Kerja
                  </div>
                  <div className="fw-semibold" style={{ color: "#2E2421" }}>
                    {selectedLoan.institusi}
                  </div>
                </Col>
                <Col xs={12} sm={6}>
                  <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                    Nama Alat Lab
                  </div>
                  <div className="fw-semibold" style={{ color: "#2E2421" }}>
                    {selectedLoan.alat}
                  </div>
                </Col>
                <Col xs={12} sm={6}>
                  <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                    Jumlah Unit
                  </div>
                  <div className="fw-semibold" style={{ color: "#2E2421" }}>
                    {selectedLoan.jumlah}
                  </div>
                </Col>
                <Col xs={12} sm={6}>
                  <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                    Tanggal Mulai Pinjam
                  </div>
                  <div className="fw-semibold" style={{ color: "#2E2421" }}>
                    {selectedLoan.tanggalPinjam}
                  </div>
                </Col>
                <Col xs={12} sm={6}>
                  <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                    Tanggal Rencana Pengembalian
                  </div>
                  <div className="fw-semibold" style={{ color: "#2E2421" }}>
                    {selectedLoan.tanggalKembali}
                  </div>
                </Col>
                <Col xs={12}>
                  <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                    Tujuan & Keperluan Peminjaman
                  </div>
                  <div className="p-3 mt-1" style={{ backgroundColor: "#F7F4F2", borderRadius: "8px", color: "#423733", fontSize: "0.9rem" }}>
                    {selectedLoan.tujuan}
                  </div>
                </Col>
                {selectedLoan.alasanTolak && (
                  <Col xs={12}>
                    <div className="text-danger fw-semibold" style={{ fontSize: "0.8rem" }}>
                      Alasan Penolakan:
                    </div>
                    <div className="p-3 mt-1" style={{ backgroundColor: "#FDEAEA", borderRadius: "8px", color: "#C0392B", fontSize: "0.9rem" }}>
                      {selectedLoan.alasanTolak}
                    </div>
                  </Col>
                )}
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: "#F9F6F5", borderTop: "1px solid #EAE3DF" }}>
          <Button variant="outline-secondary" onClick={() => setShowDetailModal(false)} style={{ borderRadius: "20px", padding: "6px 18px" }}>
            Tutup
          </Button>
          {selectedLoan && selectedLoan.status !== "Disetujui" && (
            <>
              <Button
                variant="outline-danger"
                onClick={() => setShowRejectModal(true)}
                style={{ borderRadius: "20px", padding: "6px 20px", fontWeight: 600 }}
              >
                Tolak Pengajuan
              </Button>
              <Button
                onClick={handleApprove}
                style={{
                  backgroundColor: "#3A3330",
                  borderColor: "#3A3330",
                  color: "#FFFFFF",
                  borderRadius: "20px",
                  padding: "6px 22px",
                  fontWeight: 600,
                }}
              >
                Setujui Pengajuan
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>

      {/* ===== MODAL ALASAN PENOLAKAN ===== */}
      <Modal
        show={showRejectModal}
        onHide={() => setShowRejectModal(false)}
        centered
        style={{ paddingTop: "60px" }}
      >
        <Modal.Header closeButton style={{ backgroundColor: "#FDEAEA" }}>
          <Modal.Title style={{ fontWeight: 700, color: "#C0392B", fontSize: "1.1rem" }}>
            Konfirmasi Tolak Pengajuan
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4" style={{ fontFamily: "Poppins, sans-serif" }}>
          <p style={{ color: "#423733", fontSize: "0.9rem" }}>
            Berikan alasan penolakan peminjaman alat untuk pengajuan <strong>{selectedLoan?.noPengajuan}</strong>:
          </p>
          <Form.Group>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Contoh: Alat sedang dalam proses perbaikan/kalibrasi berkala..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              style={{ borderRadius: "10px", fontSize: "0.9rem" }}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)} style={{ borderRadius: "20px" }}>
            Batal
          </Button>
          <Button variant="danger" onClick={handleRejectConfirm} style={{ borderRadius: "20px", fontWeight: 600 }}>
            Konfirmasi Tolak
          </Button>
        </Modal.Footer>
      </Modal>

      <FooterSetelahLogin />
    </NavbarLoginKepala>
  );
}
