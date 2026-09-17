import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import NavbarLoginKoordinator from "./NavbarLoginKoordinator";
import FooterSetelahLogin from "../FooterSetelahLogin";
import { getAllBookings, kirimKeKepala } from "../../services/BookingService";
import { getAuthHeader } from "../../services/AuthService";
import { Button, Spinner, Container, Card, Modal, Row, Col, Table } from "react-bootstrap";

export default function LihatHasilPdfKoordinator() {
  useEffect(() => {
    document.title = "SILAB-NTDK - Lihat Hasil PDF";
  }, []);

  const { id } = useParams();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfError, setPdfError] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [priceMap, setPriceMap] = useState({});

  // Fungsi Fetch Harga
  const fetchPrices = async () => {
    try {
      const apiBase = process.env.REACT_APP_API_BASE_URL || "https://api.silabntdk.com/api";
      const res = await fetch(`${apiBase}/analysis-prices`);
      if (res.ok) {
        const prices = await res.json();
        const map = {};
        if (Array.isArray(prices)) {
          prices.forEach((p) => {
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
    fetchPrices();
  }, []);

  // Penentuan Nama File PDF
  const getFilename = () => {
    let kodeBatch = "unknown";
    if (bookingData) {
      if (bookingData.kode_batch) {
        kodeBatch = bookingData.kode_batch;
      } else if (bookingData.kode_sampel) {
        try {
          if (typeof bookingData.kode_sampel === "string" && bookingData.kode_sampel.trim().startsWith("[")) {
            const parsed = JSON.parse(bookingData.kode_sampel);
            if (Array.isArray(parsed) && parsed.length > 0) kodeBatch = parsed[0];
          } else {
            kodeBatch = bookingData.kode_sampel;
          }
        } catch (e) {
          kodeBatch = bookingData.kode_sampel;
        }
      }
    }
    const safeKode = String(kodeBatch).replace(/[^a-zA-Z0-9\-_]/g, "_");
    return `Laporan_Analisis_${safeKode}.pdf`;
  };

  useEffect(() => {
    if (id) fetchBookingById(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchBookingById = async (bookingId) => {
    try {
      setLoading(true);
      const res = await getAllBookings();
      const all = res?.data || [];
      const booking = all.find((b) => String(b.id) === String(bookingId));
      setBookingData(booking || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getStoredPdfUrl = () => {
    if (!bookingData) return null;
    const apiBase = process.env.REACT_APP_API_BASE_URL || "https://api.silabntdk.com/api";
    const storageBase = apiBase.replace(/\/api\/?$/, "");

    if (bookingData.file_ttd_path) return `${storageBase}/storage/${bookingData.file_ttd_path}`;
    if (bookingData.pdf_path) return `${storageBase}/storage/${bookingData.pdf_path}`;
    return null;
  };

  const fetchPdfBlob = async (bookingId) => {
    const apiBase = process.env.REACT_APP_API_BASE_URL || "https://api.silabntdk.com/api";
    try {
      const res = await fetch(`${apiBase}/bookings/${bookingId}/pdf`, {
        headers: { ...getAuthHeader(), Accept: "application/pdf" },
      });
      if (res.ok) return await res.blob();
    } catch (e) {}
    try {
      const genRes = await fetch(`${apiBase}/bookings/${bookingId}/pdf-generated`, {
        headers: { ...getAuthHeader(), Accept: "application/pdf" },
      });
      if (genRes.ok) return await genRes.blob();
    } catch (e) {}
    throw new Error("No PDF available");
  };

  useEffect(() => {
    const fetchPdf = async () => {
      if (!bookingData) return;
      setPdfLoading(true);
      setPdfError(null);
      try {
        const blob = await fetchPdfBlob(bookingData.id);
        if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (e) {
        setPdfUrl(null);
        setPdfError("PDF belum tersedia. Kemungkinan teknisi belum meng-upload hasil analisis.");
      } finally {
        setPdfLoading(false);
      }
    };
    fetchPdf();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingData]);

  const handleSetuju = async () => {
    if (!bookingData) return;
    setProcessing(true);
    try {
      const st = (bookingData.status || "").toLowerCase();
      if (st === "menunggu_ttd_koordinator" || st === "menunggu_ttd") {
        history.push(`/koordinator/dashboard/tandaTanganKoordinator?bookingId=${bookingData.id}`);
      } else {
        await kirimKeKepala(bookingData.id);
        setBookingData({ ...bookingData, status: "menunggu_verifikasi_kepala" });
      }
      setShowConfirmModal(false);
      setTimeout(() => {
        alert("Berhasil dikirim! Data telah dikirim ke Kepala Laboratorium.");
        history.push("/koordinator/dashboard/verifikasiSampelKoordinator");
      }, 300);
    } catch (err) {
      alert("Terjadi kesalahan sistem saat menyimpan data.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
    const fileName = getFilename();
    const apiBase = process.env.REACT_APP_API_BASE_URL || "https://api.silabntdk.com/api";
    try {
      let blob;
      if (bookingData?.id) {
        const response = await fetch(`${apiBase}/bookings/${bookingData.id}/pdf`, {
          headers: { ...getAuthHeader(), Accept: "application/pdf" },
        });
        if (response.ok) blob = await response.blob();
      }
      if (!blob) {
        const stored = getStoredPdfUrl();
        if (stored) {
          const response = await fetch(stored, { headers: getAuthHeader(), mode: "cors" });
          if (response.ok) blob = await response.blob();
        }
      }
      if (!blob) {
        alert("PDF tidak tersedia.");
        return;
      }
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert("Gagal mengunduh PDF.");
    }
  };

  return (
    <NavbarLoginKoordinator>
      <Container fluid className="p-2 p-md-4" style={{ minHeight: "calc(100vh - 160px)" }}>
        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        )}

        {!loading && (
          <>
            {/* Header Section Responsif */}
            <Card className="shadow-sm border-0 mb-3">
              <Card.Body>
                <Row className="align-items-center">
                  <Col xs={12} lg={6} className="mb-3 mb-lg-0">
                    <h5 className="mb-1 text-primary">Preview Hasil Analisis</h5>
                    <p className="mb-0 text-muted small">
                      Kode Batch: <strong>{bookingData?.kode_batch || "-"}</strong> | 
                      Status: <strong className="text-uppercase text-info">{bookingData?.status?.replace(/_/g, " ") || "-"}</strong>
                    </p>
                  </Col>
                  <Col xs={12} lg={6}>
                    <div className="d-grid d-md-flex gap-2 justify-content-lg-end">
                      <Button variant="outline-secondary" size="sm" onClick={() => history.push("/koordinator/dashboard/verifikasiSampelKoordinator")}>
                        Kembali
                      </Button>
                      <Button variant="primary" size="sm" onClick={handleDownload}>
                        Download PDF
                      </Button>
                      {bookingData && (bookingData.status || "").toLowerCase() === "menunggu_verifikasi" && (
                        <Button variant="success" size="sm" onClick={() => setShowConfirmModal(true)} disabled={processing}>
                          {processing ? <Spinner animation="border" size="sm" /> : "Setuju & Kirim"}
                        </Button>
                      )}
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Bagian Detail Harga */}
            {bookingData && Array.isArray(bookingData.analysis_items) && bookingData.analysis_items.length > 0 && (
              <Card className="mb-3 shadow-sm border-0">
                <Card.Body className="p-3">
                  <h6 className="fw-bold mb-3"><i className="bi bi- cash-stack me-2"></i>Rincian Biaya Analisis</h6>
                  <div className="table-responsive">
                    <Table hover size="sm" className="align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Item Analisis</th>
                          <th className="text-center">Jumlah</th>
                          <th>Harga Satuan</th>
                          <th className="text-end">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookingData.analysis_items.map((it, idx) => {
                          const harga = priceMap[it.nama_item] || 0;
                          const jumlah = Number(bookingData.jumlah_sampel) || 1;
                          return (
                            <tr key={idx}>
                              <td className="small">{it.nama_item}</td>
                              <td className="text-center small">{jumlah}</td>
                              <td className="small">Rp {harga.toLocaleString("id-ID")}</td>
                              <td className="text-end fw-bold small">Rp {(harga * jumlah).toLocaleString("id-ID")}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            )}

            {/* PDF Viewer Container */}
            <div
              className="pdf-viewer-container"
              style={{
                width: "100%",
                minHeight: "500px",
                height: "calc(100vh - 200px)",
                border: "1px solid #ddd",
                borderRadius: "12px",
                overflow: "hidden",
                backgroundColor: "#525659",
                position: "relative"
              }}
            >
              {pdfLoading ? (
                <div className="position-absolute top-50 start-50 translate-middle text-white text-center">
                  <Spinner animation="grow" variant="light" className="mb-2" /><br/>
                  <span>Menyiapkan Dokumen...</span>
                </div>
              ) : pdfUrl ? (
                <object
                  data={pdfUrl}
                  type="application/pdf"
                  width="100%"
                  height="100%"
                >
                  <div className="text-center p-5 text-white">
                    <p>Browser Anda tidak mendukung preview PDF langsung.</p>
                    <Button variant="light" href={pdfUrl} target="_blank">Buka PDF di Tab Baru</Button>
                  </div>
                </object>
              ) : (
                <div className="text-center p-5 text-white">
                  <p className="text-warning">{pdfError || "Dokumen belum siap."}</p>
                </div>
              )}
            </div>
          </>
        )}
      </Container>

      {/* Modal Konfirmasi */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered size="sm">
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="h6">Konfirmasi Verifikasi</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <p>Kirim hasil analisis ini ke <b>Kepala Laboratorium</b> untuk tahap tanda tangan?</p>
        </Modal.Body>
        <Modal.Footer className="border-0 flex-column">
          <Button variant="success" className="w-100 mb-2" onClick={handleSetuju} disabled={processing}>
            Ya, Kirim Sekarang
          </Button>
          <Button variant="link" className="text-muted w-100" onClick={() => setShowConfirmModal(false)}>
            Batal
          </Button>
        </Modal.Footer>
      </Modal>

      <FooterSetelahLogin />
    </NavbarLoginKoordinator>
  );
}