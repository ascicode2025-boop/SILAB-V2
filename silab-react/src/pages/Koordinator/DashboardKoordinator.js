import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";
import { FaFlask, FaClipboardCheck, FaCheckCircle, FaBell } from "react-icons/fa";
import { useHistory } from "react-router-dom";
import NavbarLoginKoordinator from "./NavbarLoginKoordinator";
import "@fontsource/poppins";
import FooterSetelahLogin from "../FooterSetelahLogin";
import { getAllBookings } from "../../services/BookingService";

const DashboardKoordinator = () => {
  useEffect(() => {
    document.title = "SILAB-NTDK - Dashboard Koordinator";
  }, []);

  const history = useHistory();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [totalSampelMasukHariIni, setTotalSampelMasukHariIni] = useState(0);
  const [totalMenungguTTD, setTotalMenungguTTD] = useState(0);
  const [totalSampelSelesai, setTotalSampelSelesai] = useState(0);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  const fetchMetrics = async () => {
    try {
      setLoadingMetrics(true);
      const res = await getAllBookings();
      const all = res?.data || [];

      // 1. Setup Tanggal Hari Ini (Start of Day)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Fungsi Helper untuk cek tanggal
      const isSameDate = (dateString) => {
        if (!dateString) return false;
        const dateToCheck = new Date(dateString);
        dateToCheck.setHours(0, 0, 0, 0);
        return dateToCheck.getTime() === today.getTime();
      };

      // 2. Hitung "Sampel Masuk Hari Ini"
      // Definisikan apa yang dimaksud "Masuk". Apakah Booking dibuat hari ini?
      // Atau Sampel yang statusnya "menunggu_verifikasi" hari ini?
      // Di sini kita hitung semua booking yang DIBUAT (created_at) HARI INI
      const masukHariIni = all.filter((b) => isSameDate(b.created_at)).length;

      // 3. Hitung "Menunggu TTD / Verifikasi" (Tugas Aktif Koordinator)
      // Ini menghitung total sample yang MEMBUTUHKAN aksi koordinator SAAT INI
      // Status yang relevan:
      // - menunggu_verifikasi (Baru dikirim teknisi)
      // - menunggu_ttd (Sudah disetujui kepala, menunggu TTD koordinator)
      // - menunggu_ttd_koordinator (Variasi status TTD)
      // - menunggu_sign (Variasi status TTD)
      const statusPending = ["menunggu_verifikasi", "menunggu_ttd", "menunggu_ttd_koordinator", "menunggu_sign"];

      // Catatan: 'menunggu_verifikasi_kepala' TIDAK dihitung di sini karena itu tugas Kepala Lab,
      // bukan tugas aktif koordinator saat ini.

      const menungguTTD = all.filter((b) => statusPending.includes((b.status || "").toLowerCase())).length;

      // 4. Hitung "Sampel Selesai"
      // Sampel yang proses analisis dan administrasinya sudah tuntas
      const statusDone = [
        "menunggu_pembayaran", // Biasanya setelah TTD selesai, masuk ke pembayaran
        "selesai",
        "disetujui", // Jika ini berarti final approval
        "lunas", // Jika sudah bayar
      ];

      const selesai = all.filter((b) => statusDone.includes((b.status || "").toLowerCase())).length;

      // Update State
      setTotalSampelMasukHariIni(masukHariIni);
      setTotalMenungguTTD(menungguTTD);
      setTotalSampelSelesai(selesai);
    } catch (err) {
      console.error("Gagal mengambil metrik:", err);
    } finally {
      setLoadingMetrics(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <NavbarLoginKoordinator>
      <div
        className="dashboard-page p-4"
        style={{
          fontFamily: "Poppins, sans-serif",
          backgroundColor: "#f1efed",
          minHeight: "85vh",
        }}
      >
        <Container fluid>
          {/* HEADER */}
          <div className="p-4 mb-4 shadow-sm" style={{ backgroundColor: "#fff", borderRadius: 24 }}>
            <h4 className="fw-semibold mb-1" style={{ color: "#4e342e" }}>
              Selamat Datang, {user.name || "Koordinator"} 👋
            </h4>
            <p className="mb-0" style={{ color: "#7b6f6a" }}>
              Ringkasan aktivitas laboratorium hari ini
            </p>
          </div>

          {/* CARD METRICS */}
          <Row className="mb-4">
            {/* CARD 1: Sampel Masuk Hari Ini */}
            <Col md={4} className="mb-3">
              <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: 22 }}>
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="p-3 rounded-circle me-3" style={{ backgroundColor: "#efebe9" }}>
                      <FaFlask size={24} color="#6d4c41" />
                    </div>
                    <div>
                      <Card.Title className="mb-0 fw-bold" style={{ fontSize: "1.5rem" }}>
                        {loadingMetrics ? <Spinner size="sm" animation="border" /> : totalSampelMasukHariIni}
                      </Card.Title>
                      <Card.Text style={{ color: "#8d6e63", fontSize: "0.9rem" }}>Sampel Baru Hari Ini</Card.Text>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* CARD 2: Menunggu Verifikasi/TTD */}
            <Col md={4} className="mb-3">
              <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: 22 }}>
                <Card.Body>
                  <div className="d-flex align-items-center mb-3">
                    <div className="p-3 rounded-circle me-3" style={{ backgroundColor: "#fff3e0" }}>
                      <FaClipboardCheck size={24} color="#ef6c00" />
                    </div>
                    <div>
                      <Card.Title className="mb-0 fw-bold" style={{ fontSize: "1.5rem" }}>
                        {loadingMetrics ? <Spinner size="sm" animation="border" /> : totalMenungguTTD}
                      </Card.Title>
                      <Card.Text style={{ color: "#ef6c00", fontSize: "0.9rem" }}>Perlu Aksi Koordinator</Card.Text>
                    </div>
                  </div>
                  <Button
                    className="w-100"
                    style={{
                      backgroundColor: "#8d6e63",
                      border: "none",
                      borderRadius: 18,
                    }}
                    onClick={() => history.push("/koordinator/dashboard/verifikasiSampelKoordinator")}
                  >
                    Proses Sekarang
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            {/* CARD 3: Sampel Selesai */}
            <Col md={4} className="mb-3">
              <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: 22 }}>
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="p-3 rounded-circle me-3" style={{ backgroundColor: "#e8f5e9" }}>
                      <FaCheckCircle size={24} color="#2e7d32" />
                    </div>
                    <div>
                      <Card.Title className="mb-0 fw-bold" style={{ fontSize: "1.5rem" }}>
                        {loadingMetrics ? <Spinner size="sm" animation="border" /> : totalSampelSelesai}
                      </Card.Title>
                      <Card.Text style={{ color: "#2e7d32", fontSize: "0.9rem" }}>Sampel Selesai</Card.Text>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* NOTIFICATION CARD */}
          <Row>
            <Col md={12}>
              <Card
                className="border-0 shadow-sm"
                style={{
                  borderRadius: 26,
                  backgroundColor: "#d7ccc8",
                }}
              >
                <Card.Body className="d-flex justify-content-between align-items-center flex-wrap p-4">
                  <div className="d-flex align-items-center mb-2 mb-md-0">
                    <div
                      style={{
                        backgroundColor: "#fff",
                        padding: 14,
                        borderRadius: 18,
                      }}
                    >
                      <FaBell size={26} color="#6d4c41" />
                    </div>
                    <div className="ms-3">
                      <h6 className="fw-semibold mb-1" style={{ color: "#3e2723" }}>
                        Halo Koordinator!
                      </h6>
                      <small style={{ color: "#5d4037" }}>Ada {totalMenungguTTD} dokumen yang memerlukan verifikasi atau tanda tangan Anda saat ini.</small>
                    </div>
                  </div>

                  <Button
                    onClick={() => history.push("/koordinator/dashboard/verifikasiSampelKoordinator")}
                    style={{
                      backgroundColor: "#5d4037",
                      border: "none",
                      borderRadius: 20,
                      padding: "10px 28px",
                      fontWeight: "500",
                    }}
                  >
                    Verifikasi Sekarang
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
      <FooterSetelahLogin />
    </NavbarLoginKoordinator>
  );
};

export default DashboardKoordinator;
