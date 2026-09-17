import React, { useEffect, useState } from "react";
import { Table, Button, Spinner, Card, Badge, Container, Row, Col, Modal, Form } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import NavbarLoginKepala from "./NavbarLoginKepala";
import FooterSetelahLogin from "../FooterSetelahLogin";
import { getAllBookings, updateBookingStatus } from "../../services/BookingService";
import CustomPopup from "../../components/Common/CustomPopup";

// Custom responsive styles
const responsiveStyles = `
  @media (max-width: 768px) {
    .verifikasi-header-title {
      font-size: 1.25rem !important;
    }
    .verifikasi-header-subtitle {
      font-size: 0.85rem !important;
    }
    .verifikasi-count-card {
      margin-top: 1rem;
    }
    .verifikasi-table th,
    .verifikasi-table td {
      font-size: 0.8rem !important;
      padding: 0.5rem !important;
    }
    .verifikasi-action-buttons {
      flex-direction: column !important;
      gap: 0.5rem !important;
    }
    .verifikasi-action-buttons .btn {
      width: 100% !important;
      font-size: 0.75rem !important;
    }
  }
  
  @media (max-width: 576px) {
    .verifikasi-header-title {
      font-size: 1.1rem !important;
    }
    .verifikasi-table-wrapper {
      margin: 0 -0.5rem;
    }
    .verifikasi-table th,
    .verifikasi-table td {
      font-size: 0.75rem !important;
      padding: 0.4rem !important;
    }
    .verifikasi-badge {
      font-size: 0.65rem !important;
      padding: 0.3rem 0.5rem !important;
    }
  }
`;

const VerifikasiKepala = () => {
  useEffect(() => {
    document.title = "SILAB-NTDK - Verifikasi Kepala";
  }, []);

  const history = useHistory();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null); // 'setuju' | 'tolak'
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Form State
  const [alasanTolak, setAlasanTolak] = useState("");
  const [processing, setProcessing] = useState(false);

  // Price Map State
  const [priceMap, setPriceMap] = useState({});
  const [popup, setPopup] = useState({ show: false, title: "", message: "", type: "info" });

  const parseKodeSampel = (kodeSampel) => {
    try {
      if (!kodeSampel) return "-";
      if (typeof kodeSampel === "string") {
        const parsed = JSON.parse(kodeSampel);
        const arr = Array.isArray(parsed) ? parsed : [parsed];
        return arr.filter(Boolean).join(", ");
      }
      if (Array.isArray(kodeSampel)) return kodeSampel.join(", ");
      return String(kodeSampel);
    } catch {
      return String(kodeSampel);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await getAllBookings();
      const all = res?.data || [];

      // PERBAIKAN 1: Filter harus sesuai dengan yang dikirim Koordinator
      const filtered = all.filter((b) => {
        const st = (b.status || "").toLowerCase();
        // Koordinator mengirim dengan status 'menunggu_verifikasi_kepala'
        return st === "menunggu_verifikasi_kepala";
      });

      // Sort dari terbaru
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setBookings(filtered);
    } catch (err) {
      console.error("Gagal mengambil data booking (kepala):", err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch analysis prices from API
  const fetchPrices = async () => {
    try {
      const apiBase = process.env.REACT_APP_API_BASE_URL || "https://api.silabntdk.com/api";
      const res = await fetch(`${apiBase}/analysis-prices`);
      if (res.ok) {
        const prices = await res.json();
        const map = {};
        if (Array.isArray(prices)) {
          prices.forEach((p) => {
            // Support multiple field names: jenis_analisis, nama_analisis, nama_item
            const keys = [p.jenis_analisis, p.nama_analisis, p.nama_item].filter((k) => k);
            keys.forEach((key) => {
              if (key) map[key] = Number(p.harga) || 0;
            });
          });
        }
        setPriceMap(map);
      }
    } catch (err) {
      console.error("Gagal memuat harga analisis:", err);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchPrices();
  }, []);

  const openModal = (type, item) => {
    setModalType(type);
    setSelectedBooking(item);
    setShowModal(true);
    setAlasanTolak("");
  };

  const handleSetuju = async () => {
    if (!selectedBooking) return;
    setProcessing(true);
    try {
      // Send status with timestamp so backend records when kepala approved
      await updateBookingStatus(selectedBooking.id, {
        status: "menunggu_ttd_koordinator",
        status_updated_at: new Date().toISOString(),
      });

      setShowModal(false);
      setPopup({
        show: true,
        title: "Berhasil!",
        message: "Hasil analisis telah disetujui dan dikirim ke Koordinator untuk ditandatangani.",
        type: "success",
      });
      fetchBookings(); // Refresh tabel
    } catch (err) {
      console.error(err);
      setPopup({ show: true, title: "Gagal", message: "Terjadi kesalahan saat menyetujui hasil analisis.", type: "error" });
    } finally {
      setProcessing(false);
    }
  };

  const handleTolak = async () => {
    if (!selectedBooking || !alasanTolak.trim()) return;
    setProcessing(true);
    try {
      // Jika ditolak, status jadi 'ditolak_kepala' dan simpan alasannya
      await updateBookingStatus(selectedBooking.id, {
        status: "ditolak_kepala",
        alasan_tolak: alasanTolak,
      });
      setShowModal(false);
      setPopup({
        show: true,
        title: "Ditolak",
        message: "Hasil analisis telah ditolak dan dikembalikan ke Koordinator/Teknisi.",
        type: "warning",
      });
      fetchBookings();
    } catch (err) {
      console.error(err);
      setPopup({ show: true, title: "Gagal", message: "Terjadi kesalahan saat menolak hasil analisis.", type: "error" });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <NavbarLoginKepala>
      {/* Inject responsive styles */}
      <style>{responsiveStyles}</style>
      <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Container fluid className="py-3 py-md-5 px-3 px-md-4" style={{ flex: 1 }}>
          <Row className="mb-3 mb-md-4 align-items-center">
            <Col xs={12} md={8} className="mb-2 mb-md-0">
              <h3 className="fw-bold verifikasi-header-title mb-1" style={{ color: "#45352F" }}>
                Verifikasi Akhir
              </h3>
              <p className="text-muted verifikasi-header-subtitle mb-0">Daftar hasil analisis yang menunggu persetujuan Kepala Laboratorium.</p>
            </Col>
            <Col xs={12} md={4} className="text-start text-md-end">
              <Card className="border-0 shadow-sm bg-white p-2 p-md-3 text-center d-inline-block verifikasi-count-card" style={{ minWidth: "120px", borderRadius: "12px" }}>
                <small className="text-uppercase fw-bold text-muted" style={{ fontSize: "10px", letterSpacing: "1px" }}>
                  Menunggu Aksi
                </small>
                <h2 className="mb-0 fw-bold" style={{ color: "#45352F", fontSize: "1.5rem" }}>
                  {bookings.length}
                </h2>
              </Card>
            </Col>
          </Row>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" style={{ color: "#45352F" }} />
              <p className="mt-2 text-muted">Memuat data...</p>
            </div>
          ) : (
            <Card className="border-0 shadow-sm overflow-hidden" style={{ borderRadius: "16px" }}>
              <div className="verifikasi-table-wrapper" style={{ overflowX: "auto" }}>
                <Table hover responsive className="mb-0 align-middle verifikasi-table" style={{ minWidth: "700px" }}>
                  <thead style={{ backgroundColor: "#f1f3f5" }}>
                    <tr>
                      <th className="px-3 px-md-4 py-3 border-0 text-secondary text-uppercase" style={{ fontSize: "0.75rem", fontWeight: "600", whiteSpace: "nowrap" }}>
                        Kode Batch
                      </th>
                      <th className="py-3 border-0 text-secondary text-uppercase" style={{ fontSize: "0.75rem", fontWeight: "600", whiteSpace: "nowrap" }}>
                        Pemesan
                      </th>
                      <th className="py-3 border-0 text-secondary text-uppercase" style={{ fontSize: "0.75rem", fontWeight: "600", whiteSpace: "nowrap" }}>
                        Jenis Analisis
                      </th>
                      <th className="py-3 border-0 text-secondary text-uppercase" style={{ fontSize: "0.75rem", fontWeight: "600", whiteSpace: "nowrap" }}>
                        Status
                      </th>
                      <th className="text-center py-3 border-0 text-secondary text-uppercase" style={{ fontSize: "0.75rem", fontWeight: "600", minWidth: "200px" }}>
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-5">
                          <div className="text-muted my-3">
                            <p className="mb-0">Tidak ada laporan yang menunggu verifikasi saat ini.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      bookings.map((item) => (
                        <tr key={item.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                          <td className="px-3 px-md-4 fw-bold" style={{ color: "#45352F", whiteSpace: "nowrap" }}>
                            {item.kode_batch || parseKodeSampel(item.kode_sampel)}
                          </td>
                          <td className="text-dark" style={{ maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {item.user?.full_name || item.user?.name || "-"}
                          </td>
                          <td className="text-secondary" style={{ maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {item.jenis_analisis || item.jenis || "-"}
                          </td>
                          <td>
                            <Badge bg="warning" text="dark" className="px-2 px-md-3 py-1 py-md-2 rounded-pill fw-normal verifikasi-badge" style={{ fontSize: "0.7rem" }}>
                              Perlu Verifikasi
                            </Badge>
                          </td>
                          <td className="text-center py-2">
                            <div className="d-flex justify-content-center gap-1 gap-md-2 flex-wrap verifikasi-action-buttons">
                              {/* Tombol Lihat PDF */}
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                className="px-2 px-md-3 rounded-pill"
                                style={{ fontSize: "0.75rem" }}
                                onClick={() => history.push(`/kepala/dashboard/verifikasiKepala/lihatHasilPdfKepala/${item.id}`)}
                              >
                                <span className="d-none d-sm-inline">Lihat </span>PDF
                              </Button>

                              {/* Tombol Quick Action */}
                              <Button variant="success" size="sm" className="px-2 px-md-3 rounded-pill" style={{ fontSize: "0.75rem" }} onClick={() => openModal("setuju", item)}>
                                Setuju
                              </Button>
                              <Button variant="danger" size="sm" className="px-2 px-md-3 rounded-pill" style={{ fontSize: "0.75rem" }} onClick={() => openModal("tolak", item)}>
                                Tolak
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </Card>
          )}
        </Container>

        <FooterSetelahLogin />

        <CustomPopup show={popup.show} title={popup.title} message={popup.message} type={popup.type} onClose={() => setPopup((p) => ({ ...p, show: false }))} />

        {/* Modal Konfirmasi */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered size="md" style={{ zIndex: 1060 }}>
          <Modal.Header closeButton style={{ borderBottom: "1px solid #eee" }}>
            <Modal.Title className="h5 fw-bold">{modalType === "setuju" ? "Konfirmasi Persetujuan" : "Tolak Hasil Analisis"}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="px-3 px-md-4">
            {modalType === "setuju" ? (
              <div>
                <p className="mb-2">Apakah Anda yakin hasil analisis ini sudah valid?</p>
                <p className="mb-0 text-muted small">
                  Dengan menyetujui, dokumen akan masuk ke tahap <strong>Tanda Tangan Digital</strong>.
                </p>
                {/* TABEL DETAIL ANALYSIS ITEMS */}
                {selectedBooking && Array.isArray(selectedBooking.analysis_items) && selectedBooking.analysis_items.length > 0 && (
                  <div className="mt-3">
                    <h6 className="fw-bold mb-2" style={{ fontSize: "0.9rem" }}>
                      Detail Analisis
                    </h6>
                    <div className="table-responsive">
                      <table className="table table-sm table-bordered mb-0" style={{ fontSize: "0.85rem" }}>
                        <thead className="table-light">
                          <tr>
                            <th>Nama Item</th>
                            <th className="text-nowrap">Harga Satuan</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedBooking.analysis_items.map((item, idx) => {
                            const harga = priceMap[item.nama_item] || 0;
                            const jumlahSampel = Number(selectedBooking.jumlah_sampel) || 1;
                            return (
                              <tr key={idx}>
                                <td>{item.nama_item}</td>
                                <td className="text-nowrap">Rp {harga.toLocaleString("id-ID")}</td>
                                <td className="text-nowrap">Rp {(harga * jumlahSampel).toLocaleString("id-ID")}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Form>
                <Form.Group>
                  <Form.Label className="fw-semibold" style={{ fontSize: "0.9rem" }}>
                    Alasan Penolakan <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={alasanTolak}
                    onChange={(e) => setAlasanTolak(e.target.value)}
                    placeholder="Jelaskan alasan mengapa hasil ini ditolak..."
                    disabled={processing}
                    className="bg-light"
                    style={{ fontSize: "0.9rem" }}
                  />
                  <Form.Text className="text-muted" style={{ fontSize: "0.8rem" }}>
                    Alasan ini akan dikirimkan kembali ke Koordinator/Teknisi.
                  </Form.Text>
                </Form.Group>
              </Form>
            )}
          </Modal.Body>
          <Modal.Footer className="border-top-0 pt-0">
            <Button variant="secondary" size="sm" onClick={() => setShowModal(false)} disabled={processing} className="px-3">
              Batal
            </Button>
            {modalType === "setuju" ? (
              <Button variant="success" size="sm" onClick={handleSetuju} disabled={processing} className="px-3 px-md-4">
                {processing ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : "Ya, Setujui"}
              </Button>
            ) : (
              <Button variant="danger" size="sm" onClick={handleTolak} disabled={processing || !alasanTolak.trim()} className="px-3 px-md-4">
                {processing ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : "Kirim Penolakan"}
              </Button>
            )}
          </Modal.Footer>
        </Modal>
      </div>
    </NavbarLoginKepala>
  );
};

export default VerifikasiKepala;
