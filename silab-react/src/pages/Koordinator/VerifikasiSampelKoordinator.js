import React, { useEffect, useState } from "react";
import { Table, Button, Spinner, Card, Container, Modal, Form } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import { getAllBookings, updateBookingStatus } from "../../services/BookingService";
import NavbarLoginKoordinator from "./NavbarLoginKoordinator";
import FooterSetelahLogin from "../FooterSetelahLogin";
import { getApiBaseUrl } from "../../config/apiConfig";

const VerifikasiSampelKoordinator = () => {
  useEffect(() => {
    document.title = "SILAB-NTDK - Verifikasi Sampel";

    // Add responsive styles
    const style = document.createElement("style");
    style.textContent = `
      @media (min-width: 768px) {
        .btn-responsive {
          font-size: 0.8rem !important;
          padding: 6px 16px !important;
          min-width: 100px !important;
        }
        .btn-responsive-action {
          font-size: 0.8rem !important;
          padding: 6px 16px !important;
          min-width: 120px !important;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const history = useHistory();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  // State for Confirmation Modal (Send to Head)
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedItemToConfirm, setSelectedItemToConfirm] = useState(null);

  // State for Rejection Modal (Send back to Technician)
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedItemToReject, setSelectedItemToReject] = useState(null);
  const [alasanTeknisi, setAlasanTeknisi] = useState("");

  const [processing, setProcessing] = useState(false);

  const [priceMap, setPriceMap] = useState({});

  const fetchPrices = async () => {
    try {
      const apiBase = getApiBaseUrl();
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

  // Custom Colors
  const customColors = {
    brown: "#a3867a",
    textDark: "#45352F",
    lightGray: "#f4f4f4",
  };

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
      // Filter relevant statuses for Koordinator verification
      // Koordinator should specifically act on items awaiting their verification (BEFORE sending to Kepala)
      // Note: "menunggu_ttd_koordinator" is handled in TandaTanganKoordinator (AFTER Kepala approval)
      const filtered = all.filter((b) => {
        const st = (b.status || "").toLowerCase();
        return [
          "menunggu_verifikasi", // teknisi mengirim -> koordinator harus verifikasi
          "menunggu_verifikasi_kepala", // already sent to kepala (view-only)
          "ditolak_kepala", // ditolak kepala, perlu dikirim balik ke teknisi
        ].includes(st);
      });
      // Sort by newest
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setBookings(filtered);
    } catch (err) {
      console.error("Gagal mengambil data booking:", err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // --- Handlers for Sending to Head ---
  const handleOpenConfirm = (item) => {
    setSelectedItemToConfirm(item);
    setShowConfirmModal(true);
  };

  const handleConfirmSend = async () => {
    if (!selectedItemToConfirm) return;
    try {
      setProcessing(true);
      await updateBookingStatus(selectedItemToConfirm.id, { status: "menunggu_verifikasi_kepala" });
      setShowConfirmModal(false);
      fetchBookings();
    } catch (err) {
      console.error("Gagal kirim ke kepala:", err);
      alert("Gagal mengirim data.");
    } finally {
      setProcessing(false);
      setSelectedItemToConfirm(null);
    }
  };

  // --- Handlers for Sending back to Technician ---
  const handleKirimTeknisi = (item) => {
    setSelectedItemToReject(item);
    setAlasanTeknisi("");
    setShowRejectModal(true);
  };

  const submitKirimTeknisi = async () => {
    if (!selectedItemToReject || !alasanTeknisi.trim()) return;
    setProcessing(true);
    try {
      await updateBookingStatus(selectedItemToReject.id, { status: "dikirim_ke_teknisi", alasan_teknisi: alasanTeknisi });
      setShowRejectModal(false);
      fetchBookings();
    } catch (err) {
      alert("Gagal mengirim ke teknisi.");
    } finally {
      setProcessing(false);
      setSelectedItemToReject(null);
    }
  };

  return (
    <NavbarLoginKoordinator>
      <div
        style={{
          backgroundColor: "#e9ecef",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Modal style fix: prevent modal from overlapping navbar */}
        <style>{`
          .modal.show .modal-dialog {
            margin-top: 70px !important;
          }
          @media (max-width: 768px) {
            .modal.show .modal-dialog {
              margin-top: 56px !important;
            }
          }
        `}</style>
        <div style={{ flex: "1" }}>
          <Container fluid className="py-3 py-md-5 px-2 px-md-4 px-lg-5">
            <Card className="border-0 shadow-sm" style={{ borderRadius: "20px", overflow: "hidden" }}>
              <div
                className="card-header border-0 py-2 py-md-3"
                style={{
                  backgroundColor: customColors.brown,
                  color: "white",
                  borderBottomRightRadius: "50px",
                  paddingLeft: "20px",
                  paddingRight: "15px",
                }}
              >
                <h4 className="mb-0 fw-normal" style={{ fontFamily: "serif", fontSize: "1.1rem" }}>
                  <span className="d-none d-md-inline">Verifikasi Hasil Analisis</span>
                  <span className="d-md-none">Verifikasi Analisis</span>
                </h4>
              </div>

              <div className="card-body p-2 p-md-4 bg-white">
                {loading ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" style={{ color: customColors.brown }} />
                    <p className="mt-2 text-muted">Mengambil data...</p>
                  </div>
                ) : (
                  <div className="table-responsive" style={{ overflowX: "auto" }}>
                    <Table bordered hover className="align-middle text-center mb-0" style={{ minWidth: "800px", width: "100%" }}>
                      <thead className="table-light">
                        <tr>
                          <th className="py-3 fw-bold text-nowrap" style={{ width: "18%", minWidth: "140px" }}>
                            Kode Batch
                          </th>
                          <th className="py-3 fw-bold text-nowrap" style={{ width: "16%", minWidth: "120px" }}>
                            Pemesan
                          </th>
                          <th className="py-3 fw-bold text-nowrap" style={{ width: "18%", minWidth: "140px" }}>
                            Jenis Analisis
                          </th>
                          <th className="py-3 fw-bold text-nowrap" style={{ width: "12%", minWidth: "100px" }}>
                            Tanggal
                          </th>
                          <th className="py-3 fw-bold text-nowrap" style={{ width: "18%", minWidth: "140px" }}>
                            Status
                          </th>
                          <th className="py-3 fw-bold text-nowrap" style={{ width: "18%", minWidth: "160px" }}>
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-4 py-md-5 text-muted" style={{ fontSize: "0.9rem" }}>
                              <div className="d-none d-md-block">Tidak ada sampel yang menunggu verifikasi saat ini.</div>
                              <div className="d-md-none">Tidak ada sampel yang perlu diverifikasi.</div>
                            </td>
                          </tr>
                        ) : (
                          bookings.map((item) => (
                            <tr key={item.id}>
                              <td className="py-2 py-md-3 fw-bold text-dark" style={{ wordBreak: "break-word" }}>
                                {parseKodeSampel(item.kode_batch || item.kode_sampel)}
                              </td>
                              <td className="py-2 py-md-3" style={{ wordBreak: "break-word" }}>
                                {item.user?.full_name || item.user?.name || "-"}
                              </td>
                              <td className="py-2 py-md-3" style={{ lineHeight: "1.2", wordBreak: "break-word" }}>
                                {item.jenis_analisis}
                              </td>
                              <td className="py-2 py-md-3 text-nowrap" style={{ fontSize: "0.85rem" }}>
                                {item.created_at ? new Date(item.created_at).toLocaleDateString("id-ID") : "-"}
                              </td>
                              <td className="py-2 py-md-3 text-secondary" style={{ fontSize: "0.85rem", lineHeight: "1.3" }}>
                                {/* Friendly status labels mapped from DB values */}
                                {(() => {
                                  const st = item.status || "";
                                  switch (st) {
                                    case "menunggu_verifikasi":
                                      return "Menunggu Verifikasi Koordinator";
                                    case "menunggu_ttd_koordinator":
                                      return "Menunggu TTD Koordinator";
                                    case "menunggu_verifikasi_kepala":
                                      return "Dikirim ke Kepala (Menunggu Verifikasi)";
                                    case "menunggu_ttd":
                                      return "Menunggu TTD";
                                    case "menunggu_sign":
                                      return "Menunggu Sign";
                                    case "ditolak_kepala":
                                      return "Ditolak Kepala";
                                    default:
                                      return String(st).replace(/_/g, " ");
                                  }
                                })()}

                                {item.status === "ditolak_kepala" && item.alasan_tolak && <div className="text-danger mt-2 small">Ditolak Kepala: {item.alasan_tolak}</div>}
                              </td>
                              <td className="py-2 py-md-3">
                                <div className="d-flex justify-content-center align-items-center gap-1 gap-md-2 flex-wrap">
                                  {/* Tombol Lihat PDF */}
                                  <Button
                                    size="sm"
                                    className="border-0 shadow-sm text-nowrap btn-responsive"
                                    style={{
                                      backgroundColor: customColors.brown,
                                      borderRadius: "6px",
                                      fontSize: "0.75rem",
                                      padding: "4px 8px",
                                      minWidth: "70px",
                                    }}
                                    onClick={() => history.push(`/koordinator/dashboard/verifikasiSampelKoordinator/lihatHasilPdfKoordinator/${item.id}`)}
                                  >
                                    <span className="d-none d-md-inline">Lihat PDF</span>
                                    <span className="d-md-none">PDF</span>
                                  </Button>

                                  {/* Tombol Kirim ke Teknisi (Jika Ditolak Kepala) */}
                                  {item.status === "ditolak_kepala" && (
                                    <Button
                                      variant="danger"
                                      size="sm"
                                      className="rounded-pill text-nowrap btn-responsive"
                                      style={{
                                        fontSize: "0.75rem",
                                        padding: "4px 8px",
                                        minWidth: "80px",
                                      }}
                                      onClick={() => handleKirimTeknisi(item)}
                                    >
                                      <span className="d-none d-md-inline">Kirim ke Teknisi</span>
                                      <span className="d-md-none">Kirim</span>
                                    </Button>
                                  )}

                                  {/* Tombol Sudah Dikirim (DISABLED) */}
                                  {item.status === "menunggu_verifikasi_kepala" && (
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      className="rounded-pill text-nowrap btn-responsive"
                                      style={{
                                        fontSize: "0.75rem",
                                        padding: "4px 8px",
                                        cursor: "not-allowed",
                                        minWidth: "80px",
                                      }}
                                      disabled
                                    >
                                      <span className="d-none d-md-inline">Sudah Dikirim</span>
                                      <span className="d-md-none">Terkirim</span>
                                    </Button>
                                  )}

                                  {/* Tombol Kirim ke Kepala (ACTIVE) - when Koordinator completed verification (menunggu_verifikasi) */}
                                  {item.status === "menunggu_verifikasi" && (
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      className="rounded-pill shadow-sm text-nowrap btn-responsive-action"
                                      style={{
                                        fontSize: "0.75rem",
                                        padding: "4px 8px",
                                        backgroundColor: "#0d6efd",
                                        borderColor: "#0d6efd",
                                        minWidth: "90px",
                                      }}
                                      onClick={() => handleOpenConfirm(item)}
                                    >
                                      <span className="d-none d-md-inline">Kirim ke Kepala</span>
                                      <span className="d-md-none">Kirim</span>
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </div>
                )}
              </div>
            </Card>
          </Container>
        </div>

        <FooterSetelahLogin />

        {/* MODAL KONFIRMASI KIRIM KE KEPALA */}
        <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Konfirmasi Pengiriman</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              Apakah Anda yakin data ini sudah benar dan ingin mengirimnya ke <strong>Kepala Laboratorium</strong> untuk persetujuan akhir?
            </p>
            <div className="text-muted small">
              Kode Batch: <strong>{selectedItemToConfirm ? parseKodeSampel(selectedItemToConfirm.kode_batch || selectedItemToConfirm.kode_sampel) : "-"}</strong>
            </div>

            {/* Detail analysis_items dengan harga */}
            {selectedItemToConfirm && Array.isArray(selectedItemToConfirm.analysis_items) && selectedItemToConfirm.analysis_items.length > 0 && (
              <div className="mt-3">
                <h6 className="fw-bold mb-2">Detail Analisis</h6>
                <table className="table table-sm table-bordered">
                  <thead>
                    <tr>
                      <th>Nama Item</th>
                      <th>Harga Satuan</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedItemToConfirm.analysis_items.map((it, idx) => {
                      const harga = priceMap[it.nama_item] || 0;
                      const jumlah = Number(selectedItemToConfirm.jumlah_sampel) || 1;
                      return (
                        <tr key={idx}>
                          <td>{it.nama_item}</td>
                          <td>Rp {harga.toLocaleString("id-ID")}</td>
                          <td>Rp {(harga * jumlah).toLocaleString("id-ID")}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowConfirmModal(false)} disabled={processing}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleConfirmSend} disabled={processing} style={{ backgroundColor: "#0d6efd", borderColor: "#0d6efd" }}>
              {processing ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                  Mengirim...
                </>
              ) : (
                "Ya, Kirim Sekarang"
              )}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* MODAL KIRIM BALIK KE TEKNISI */}
        <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Kirim Kembali ke Teknisi</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group>
                <Form.Label>Alasan Pengembalian</Form.Label>
                <Form.Control as="textarea" rows={3} value={alasanTeknisi} onChange={(e) => setAlasanTeknisi(e.target.value)} placeholder="Masukkan alasan revisi atau instruksi ke teknisi..." disabled={processing} />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowRejectModal(false)} disabled={processing}>
              Batal
            </Button>
            <Button variant="danger" onClick={submitKirimTeknisi} disabled={processing || !alasanTeknisi.trim()}>
              {processing ? "Mengirim..." : "Kirim ke Teknisi"}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </NavbarLoginKoordinator>
  );
};

export default VerifikasiSampelKoordinator;
