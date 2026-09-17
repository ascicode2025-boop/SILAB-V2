import React, { useEffect, useState, useRef } from "react";
import { Button, Spinner, Alert, Modal, Form, Badge } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import NavbarLoginKoordinator from "./NavbarLoginKoordinator";
import FooterSetelahLogin from "../FooterSetelahLogin";

// --- IMPORT YANG SUDAH DIPERBAIKI ---
import { getAllBookings, uploadPdfAndKirim, updateStatus, kirimKeKepala } from "../../services/BookingService";
import { useLocation } from "react-router-dom";
import { getAuthHeader } from "../../services/AuthService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatDataForPDF } from "../../utils/pdfHelpers";

// Note: Kirim ke Kepala action removed — Koordinator only previews, downloads, uploads signed PDF and completes to payment management.

const customColors = {
  brown: "#a3867a",
  lightGray: "#e9ecef",
  darkBrown: "#5d4037",
};

// Custom styles for modal to prevent navbar overlap
const modalStyles = `
  .modal-backdrop-high {
    z-index: 1055 !important;
  }
  .modal.show {
    z-index: 1060 !important;
  }
`;

const TandaTanganKoordinator = () => {
  useEffect(() => {
    document.title = "SILAB-NTDK - Tanda Tangan Koordinator";
  }, []);

  const history = useHistory();
  const [dataSampel, setDataSampel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State Modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [priceMap, setPriceMap] = useState({});

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

  useEffect(() => {
    fetchData();
  }, []);

  // If navigated with ?bookingId=..., auto-open upload modal for that booking
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const bookingId = params.get("bookingId");
    if (bookingId && !loading && dataSampel.length > 0) {
      const found = dataSampel.find((b) => String(b.id) === String(bookingId));
      if (found) {
        setSelectedBooking(found);
        setShowUploadModal(true);
      }
    }
  }, [location.search, loading, dataSampel]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getAllBookings();
      if (res && res.data && Array.isArray(res.data)) {
        // FILTER DATA: Hanya status yang sudah lewat verifikasi kepala
        const relevantData = res.data.filter((item) => {
          const st = (item.status || "").toLowerCase();
          // include bookings that have been approved by Kepala Lab
          const approvedStatuses = ["disetujui", "ditandatangani", "menunggu_ttd", "menunggu_ttd_koordinator", "selesai", "menunggu_pembayaran"];
          return approvedStatuses.includes(st);
        });

        // SORTING: Yang butuh TTD di paling atas
        relevantData.sort((a, b) => {
          if (a.status === "menunggu_ttd_koordinator" && b.status !== "menunggu_ttd_koordinator") return -1;
          if (a.status !== "menunggu_ttd_koordinator" && b.status === "menunggu_ttd_koordinator") return 1;
          return new Date(b.created_at) - new Date(a.created_at);
        });

        setDataSampel(relevantData);
      } else {
        setError("Gagal memuat data.");
      }
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data dari server.");
    } finally {
      setLoading(false);
    }
  };

  // Helper Parameter
  const getParameters = (item) => {
    if (item.analysis_items && item.analysis_items.length > 0) {
      return item.analysis_items.map((ai) => ai.nama_item);
    }
    return [item.jenis_analisis || "-"];
  };

  // Helper Status Badge
  const renderStatusBadge = (status) => {
    const st = (status || "").toLowerCase();
    if (st === "menunggu_ttd_koordinator") {
      return (
        <Badge bg="warning" text="dark">
          Perlu TTD
        </Badge>
      );
    } else if (st === "selesai" || st === "ditandatangani") {
      return <Badge bg="success">Selesai</Badge>;
    }
    return <Badge bg="secondary">{st}</Badge>;
  };

  // Handler Download
  const handleDownload = async (item) => {
    try {
      const blob = await fetchPdfBlob(item.id, item);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Laporan_Analisis_${item.kode_batch || item.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      alert("Gagal mengunduh PDF.");
    }
  };

  // Institute header (same as Teknisi)
  const instituteHeader = [
    "KEMENTERIAN RISET, TEKNOLOGI DAN PENDIDIKAN TINGGI",
    "INSTITUT PERTANIAN BOGOR",
    "FAKULTAS PETERNAKAN",
    "DEPARTEMEN ILMU NUTRISI DAN TEKNOLOGI PAKAN",
    "LABORATORIUM NUTRISI TERNAK DAGING DAN KERJA",
    "Jl. Agathis Kampus IPB Darmaga, Bogor 16680",
  ];

  // Generate PDF using jsPDF (same format as Teknisi)
  const generatePdfBlobFromBooking = (bookingData) => {
    const payload = formatDataForPDF(bookingData);
    if (!payload) throw new Error("Failed to format booking data for PDF");

    const doc = new jsPDF("p", "mm", "a4");
    let kodeBatch = bookingData?.kode_batch || bookingData?.kode_sampel || "-";
    if (Array.isArray(kodeBatch)) kodeBatch = kodeBatch[0] || "-";

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const leftMargin = 14;
    const rightMargin = 14;
    const usableWidth = pageWidth - leftMargin - rightMargin;

    const commonTableStyles = {
      font: "helvetica",
      fontSize: 8,
      textColor: 20,
      cellPadding: 1.5,
      valign: "middle",
      halign: "center",
      lineWidth: 0.1,
      lineColor: [200, 200, 200],
      overflow: "linebreak",
    };
    const commonHeadStyles = {
      fillColor: [0, 85, 128],
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
      valign: "middle",
      cellPadding: 2,
    };
    const commonAlternateRowStyles = {
      fillColor: [248, 248, 248],
    };

    let cursorY = 20;
    const logoWidth = 43;
    const logoHeight = 30;
    try {
      doc.addImage("/asset/Logo-IPB.png", "PNG", 12, 5, logoWidth, logoHeight);
    } catch (err) {}

    let headerY = 10;
    const offsetX = 15;
    doc.setFontSize(12);
    doc.setFont("Times New Roman", "bold");
    instituteHeader.forEach((line) => {
      doc.text(line, pageWidth / 2 + offsetX, headerY, { align: "center" });
      headerY += 6;
    });
    headerY -= 2;
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 0, 0);
    doc.line(14, headerY, pageWidth - 14, headerY);
    cursorY = headerY + 10;

    doc.setFontSize(11);
    doc.setFont("Times New Roman", "normal");
    doc.text(payload.header.kepada, leftMargin, cursorY);
    if (payload.header.tanggal) {
      doc.text(`Tanggal: ${payload.header.tanggal}`, pageWidth - rightMargin, cursorY, { align: "right" });
    }
    cursorY += 6;
    doc.text(payload.header.instansi, leftMargin, cursorY);
    cursorY += 6;
    doc.text(payload.header.tempat, leftMargin, cursorY);
    cursorY += 12;

    if (payload.table1 && payload.table1.length > 0 && payload.header.title1) {
      doc.setFontSize(11);
      doc.setFont("Times New Roman", "bold");
      const title1Lines = doc.splitTextToSize(payload.header.title1, usableWidth);
      doc.text(title1Lines, leftMargin, cursorY);
      cursorY += title1Lines.length * 5 + 2;
      const [table1Head, ...table1Body] = payload.table1;
      const colNoWidth = 10;
      const colKodeWidth = 35;
      const remainingWidth = usableWidth - colNoWidth - colKodeWidth;
      const paramColCount = table1Head.length - 2;
      const paramColWidth = remainingWidth / (paramColCount > 0 ? paramColCount : 1);
      let columnStylesT1 = { 0: { cellWidth: colNoWidth }, 1: { cellWidth: colKodeWidth } };
      for (let i = 2; i < table1Head.length; i++) {
        columnStylesT1[i] = { cellWidth: paramColWidth };
      }
      autoTable(doc, {
        startY: cursorY,
        head: [table1Head],
        body: table1Body,
        theme: "grid",
        styles: commonTableStyles,
        headStyles: commonHeadStyles,
        alternateRowStyles: commonAlternateRowStyles,
        columnStyles: columnStylesT1,
        margin: { left: leftMargin, right: rightMargin },
        tableWidth: "auto",
      });
      cursorY = doc.lastAutoTable.finalY + 12;
    }

    if (payload.table2 && payload.table2.length > 0 && payload.header.title2) {
      if (pageHeight - cursorY < 40) {
        doc.addPage();
        cursorY = 20;
      }
      doc.setFontSize(11);
      doc.setFont("Times New Roman", "bold");
      const title2Lines = doc.splitTextToSize(payload.header.title2, usableWidth);
      doc.text(title2Lines, leftMargin, cursorY);
      cursorY += title2Lines.length * 5 + 2;
      const [table2Head, ...table2Body] = payload.table2;
      const colNoWidth = 10;
      const colKodeWidth = 35;
      const remainingWidth = usableWidth - colNoWidth - colKodeWidth;
      const paramColCount = table2Head.length - 2;
      const paramColWidth = remainingWidth / (paramColCount > 0 ? paramColCount : 1);
      let columnStylesT2 = { 0: { cellWidth: colNoWidth }, 1: { cellWidth: colKodeWidth } };
      for (let i = 2; i < table2Head.length; i++) {
        columnStylesT2[i] = { cellWidth: paramColWidth };
      }
      autoTable(doc, {
        startY: cursorY,
        head: [table2Head],
        body: table2Body,
        theme: "grid",
        styles: commonTableStyles,
        headStyles: commonHeadStyles,
        alternateRowStyles: commonAlternateRowStyles,
        columnStyles: columnStylesT2,
        margin: { left: leftMargin, right: rightMargin },
        tableWidth: "auto",
      });
      cursorY = doc.lastAutoTable.finalY + 15;
    }

    if (pageHeight - cursorY < 60) {
      doc.addPage();
      cursorY = 40;
    } else {
      cursorY += 15;
    }
    const signatureCenterPoint = pageWidth - 45;
    doc.setFontSize(10);
    doc.setFont("Times New Roman", "normal");
    doc.text("Penanggungjawab Lab. Analisis", signatureCenterPoint, cursorY, { align: "center" });
    cursorY += 5;
    doc.text("Ilmu Nutrisi Ternak Daging dan Kerja", signatureCenterPoint, cursorY, { align: "center" });
    cursorY += 25;
    doc.setLineWidth(0.3);
    doc.setDrawColor(0, 0, 0);
    doc.line(signatureCenterPoint - 25, cursorY, signatureCenterPoint + 25, cursorY);

    return doc.output("blob");
  };

  // Fetch PDF blob from uploaded path or generated fallback
  const fetchPdfBlob = async (bookingId, item = null) => {
    const apiBase = process.env.REACT_APP_API_BASE_URL || "https://api.silabntdk.com/api";

    // Try stored/uploaded PDF first (original signed PDF)
    try {
      const res = await fetch(`${apiBase}/bookings/${bookingId}/pdf`, {
        headers: { ...getAuthHeader(), Accept: "application/pdf" },
      });
      if (res.ok) return await res.blob();
    } catch (e) {
      console.log("Stored PDF not found, generating with jsPDF...");
    }

    // Fallback: Generate PDF using jsPDF (same format as Teknisi)
    if (item) {
      return generatePdfBlobFromBooking(item);
    }

    throw new Error("No PDF available");
  };

  // PDF Preview modal state
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState(null);
  const [previewTanggal, setPreviewTanggal] = useState(null);

  const handlePreview = async (item) => {
    setPdfError(null);
    setPdfLoading(true);
    // cleanup previous
    if (pdfBlobUrl) {
      window.URL.revokeObjectURL(pdfBlobUrl);
      setPdfBlobUrl(null);
    }
    try {
      const blob = await fetchPdfBlob(item.id, item);
      const url = window.URL.createObjectURL(blob);
      setPdfBlobUrl(url);
      const tanggal = item.status_updated_at || item.created_at || null;
      setPreviewTanggal(tanggal ? new Date(tanggal).toLocaleDateString("id-ID") : "-");
      setShowPdfModal(true);
    } catch (err) {
      console.error(err);
      setPdfError("Gagal memuat PDF untuk preview.");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleModalDownload = () => {
    if (!pdfBlobUrl) return;
    const a = document.createElement("a");
    a.href = pdfBlobUrl;
    a.download = `Laporan_Analisis.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Handler Modal
  const handleOpenUpload = (item) => {
    // prevent opening if already in payment management
    const isInPayment = (item.status || "").toLowerCase() === "menunggu_pembayaran";
    if (isInPayment) {
      alert("Booking sudah masuk manajemen pembayaran; tidak dapat mengunggah kembali.");
      return;
    }
    setSelectedBooking(item);
    setFileToUpload(null);
    setShowUploadModal(true);
  };

  const handleSubmitUpload = async () => {
    if (!selectedBooking || !fileToUpload) {
      alert("Pilih file PDF terlebih dahulu.");
      return;
    }

    // disallow upload when already in payment management (state comes from server)
    if ((selectedBooking.status || "").toLowerCase() === "menunggu_pembayaran") {
      alert("Booking sudah masuk manajemen pembayaran; tidak dapat mengunggah kembali.");
      return;
    }

    setUploading(true);
    try {
      await uploadPdfAndKirim(selectedBooking.id, fileToUpload);
      // Setelah upload sukses, pindahkan ke proses manajemen pembayaran
      try {
        await updateStatus(selectedBooking.id, "menunggu_pembayaran");
      } catch (e) {
        console.error("Gagal memperbarui status ke menunggu_pembayaran", e);
      }
      alert("Berhasil! Dokumen telah ditandatangani. Masuk ke proses manajemen pembayaran.");
      setShowUploadModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Gagal mengunggah dokumen.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <NavbarLoginKoordinator>
      {/* Inject modal z-index styles */}
      <style>{modalStyles}</style>
      <div className="container-fluid min-vh-100 p-4" style={{ backgroundColor: customColors.lightGray }}>
        <div className="card border-0 shadow-sm" style={{ borderRadius: "20px", overflow: "hidden" }}>
          <div
            className="card-header border-0 py-3"
            style={{
              backgroundColor: customColors.brown,
              color: "white",
              borderBottomRightRadius: "50px",
              paddingLeft: "30px",
            }}
          >
            <h4 className="mb-0 fw-normal" style={{ fontFamily: "serif" }}>
              Tanda Tangan Digital
            </h4>
          </div>

          <div className="card-body p-4 bg-white">
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" style={{ color: customColors.brown }} />
              </div>
            ) : error ? (
              <Alert variant="danger">{error}</Alert>
            ) : (
              <div className="table-responsive" style={{ maxHeight: "70vh", overflowY: "auto", overflowX: "auto" }}>
                <table className="table table-hover align-middle text-center" style={{ minWidth: "1200px" }}>
                  <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                    <tr>
                      <th className="py-3" style={{ whiteSpace: "nowrap", minWidth: "150px" }}>
                        Kode Batch
                      </th>
                      <th className="py-3" style={{ minWidth: "150px" }}>
                        Nama Lengkap
                      </th>
                      <th className="py-3" style={{ minWidth: "120px" }}>
                        Jenis Analisis
                      </th>
                      <th className="py-3" style={{ minWidth: "180px" }}>
                        Parameter (Kategori)
                      </th>
                      <th className="py-3" style={{ whiteSpace: "nowrap", minWidth: "100px" }}>
                        Tanggal
                      </th>
                      <th className="py-3" style={{ minWidth: "100px" }}>
                        Status
                      </th>
                      <th className="py-3" style={{ whiteSpace: "nowrap", minWidth: "120px" }}>
                        Total Harga
                      </th>
                      <th className="py-3" style={{ minWidth: "320px" }}>
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataSampel.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-5 text-muted">
                          Belum ada data yang disetujui Kepala Lab.
                        </td>
                      </tr>
                    ) : (
                      dataSampel.map((item) => (
                        <tr key={item.id}>
                          <td className="fw-bold text-dark" style={{ whiteSpace: "nowrap" }}>
                            {item.kode_batch || "-"}
                          </td>
                          <td className="text-start ps-3">{item.user?.full_name || item.user?.name || "-"}</td>
                          <td>{item.jenis_analisis}</td>
                          <td>
                            <div className="d-flex flex-wrap justify-content-center gap-1">
                              {getParameters(item).map((param, idx) => (
                                <Badge key={idx} bg="light" text="dark" className="border fw-normal">
                                  {param}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="text-nowrap">{item.status_updated_at ? new Date(item.status_updated_at).toLocaleDateString("id-ID") : item.created_at ? new Date(item.created_at).toLocaleDateString("id-ID") : "-"}</td>
                          <td>{renderStatusBadge(item.status)}</td>
                          {/* Signature column removed as requested */}
                          <td>
                            {(() => {
                              const items = item.analysis_items || [];
                              const jumlah = Number(item.jumlah_sampel) || 1;
                              let sum = 0;
                              if (Array.isArray(items) && items.length > 0) {
                                items.forEach((ai) => {
                                  sum += priceMap[ai.nama_item] || 0;
                                });
                                sum = sum * jumlah;
                              }
                              return <span>Rp {sum.toLocaleString("id-ID")}</span>;
                            })()}
                          </td>
                          <td className="py-3">
                            <div className="d-flex justify-content-center gap-2">
                              {/* Button LIHAT */}
                              <Button size="sm" variant="outline-primary" onClick={() => handlePreview(item)}>
                                Lihat
                              </Button>

                              {/* Button DOWNLOAD */}
                              <Button size="sm" variant="outline-secondary" onClick={() => handleDownload(item)}>
                                Download
                              </Button>

                              {/* Tombol Kirim ke Kepala dihapus sesuai permintaan */}

                              {/* Button Upload & Selesaikan: only allow upload when a signature record exists and is pending */}
                              {(() => {
                                const sig = item.signature || null;
                                const isInPayment = (item.status || "").toLowerCase() === "menunggu_pembayaran";
                                const canUpload = sig && (sig.status === "pending" || sig.status === "created" || (item.status || "").toLowerCase() === "menunggu_ttd_koordinator");
                                return (
                                  <Button
                                    size="sm"
                                    style={{ backgroundColor: customColors.brown, borderColor: customColors.brown }}
                                    onClick={() => {
                                      if (isInPayment) {
                                        alert("Booking sudah masuk manajemen pembayaran; tidak dapat mengunggah kembali.");
                                        return;
                                      }
                                      if (!canUpload) {
                                        alert("Tidak ada permintaan tanda tangan dari Kepala. Pastikan Kepala telah menyetujui terlebih dahulu.");
                                        return;
                                      }
                                      handleOpenUpload(item);
                                    }}
                                    disabled={isInPayment || !canUpload}
                                  >
                                    {isInPayment ? "Masuk Pembayaran" : "Upload & Selesaikan"}
                                  </Button>
                                );
                              })()}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <FooterSetelahLogin />

      {/* MODAL PREVIEW PDF */}
      <Modal
        show={showPdfModal}
        onHide={() => {
          setShowPdfModal(false);
          if (pdfBlobUrl) {
            window.URL.revokeObjectURL(pdfBlobUrl);
            setPdfBlobUrl(null);
          }
        }}
        size="xl"
        centered
        style={{ zIndex: 1060 }}
        backdropClassName="modal-backdrop-custom"
        contentClassName="shadow-lg"
      >
        <Modal.Header closeButton style={{ backgroundColor: customColors.brown, color: "white", borderBottom: "none" }}>
          <Modal.Title>Preview Laporan Analisis</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "24px", backgroundColor: "#f8f9fa" }}>
          <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-white rounded shadow-sm">
            <div>
              <strong style={{ color: customColors.darkBrown }}>Tanggal Verifikasi:</strong>
              <span className="ms-2 text-dark">{previewTanggal || "-"}</span>
            </div>
          </div>

          {pdfLoading ? (
            <div className="text-center py-5 bg-white rounded">
              <Spinner animation="border" style={{ color: customColors.brown }} />
              <p className="mt-3 text-muted">Memuat dokumen...</p>
            </div>
          ) : pdfError ? (
            <Alert variant="danger" className="rounded">
              {pdfError}
            </Alert>
          ) : pdfBlobUrl ? (
            <div className="border rounded bg-white" style={{ height: "70vh", overflow: "hidden" }}>
              <iframe src={pdfBlobUrl} title="PDF Preview" width="100%" height="100%" style={{ border: "none" }} />
            </div>
          ) : (
            <div className="text-center text-muted py-5 bg-white rounded">
              <i className="bi bi-file-earmark-pdf" style={{ fontSize: "3rem", opacity: 0.3 }}></i>
              <p className="mt-2">Tidak ada PDF untuk ditampilkan.</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={{ borderTop: "none", backgroundColor: "#f8f9fa" }}>
          <Button
            variant="secondary"
            onClick={() => {
              setShowPdfModal(false);
              if (pdfBlobUrl) {
                window.URL.revokeObjectURL(pdfBlobUrl);
                setPdfBlobUrl(null);
              }
            }}
          >
            Tutup
          </Button>
        </Modal.Footer>
      </Modal>

      {/* MODAL UPLOAD PDF */}
      <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)} centered style={{ zIndex: 1060 }}>
        <Modal.Header closeButton>
          <Modal.Title>Upload Dokumen Ditandatangani</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Silakan unggah file PDF yang <strong>sudah Anda tandatangani</strong> untuk menyelesaikan proses ini.
          </p>
          <p className="text-muted small mb-3">
            Kode Batch: <strong>{selectedBooking?.kode_batch}</strong>
          </p>

          <Form.Group controlId="formFile" className="mb-3">
            <Form.Label>Pilih File PDF</Form.Label>
            <Form.Control type="file" accept="application/pdf" ref={fileInputRef} onChange={(e) => setFileToUpload(e.target.files[0])} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUploadModal(false)} disabled={uploading}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleSubmitUpload} disabled={uploading || !fileToUpload} style={{ backgroundColor: customColors.brown, borderColor: customColors.brown }}>
            {uploading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                Mengunggah...
              </>
            ) : (
              "Upload & Selesaikan"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </NavbarLoginKoordinator>
  );
};

export default TandaTanganKoordinator;
