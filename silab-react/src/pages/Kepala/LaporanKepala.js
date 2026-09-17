import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Button, Form, InputGroup } from "react-bootstrap";
import { Search, FileText, Download } from "lucide-react";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import NavbarLoginKepala from "./NavbarLoginKepala";
import FooterSetelahLogin from "../FooterSetelahLogin";
import axios from "axios";
import { getAuthHeader, getToken } from "../../services/AuthService";
import { getApiBaseUrl } from "../../config/apiConfig";

const LaporanKepala = () => {
  useEffect(() => {
    document.title = "SILAB-NTDK - Laporan Kepala";
  }, []);

  // Dynamic report data from backend
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unauthenticated, setUnauthenticated] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterJenis, setFilterJenis] = useState("");
  const [filterBulan, setFilterBulan] = useState("");
  const [filterTahun, setFilterTahun] = useState("");

  useEffect(() => {
    fetchReport();
  }, []);

  const API_URL = getApiBaseUrl();

  const fetchReport = async () => {
    setLoading(true);
    // require token for protected endpoint
    if (!getToken()) {
      setReportData([]);
      setUnauthenticated(true);
      setLoading(false);
      return;
    }

    try {
      // prefer the debug route if present on server
      const url = new URL(`${API_URL}/koordinator-report-debug`);
      if (filterJenis) url.searchParams.append("jenis_analisis", filterJenis);
      if (filterBulan) url.searchParams.append("bulan", filterBulan);
      if (filterTahun) url.searchParams.append("tahun", filterTahun);
      const res = await axios.get(url.toString(), { headers: getAuthHeader() });
      // Response shape: prefer res.data.data.bookings (contains user info) then tableData
      let raw = [];
      if (res && res.data && res.data.data) {
        if (res.data.data.bookings && Array.isArray(res.data.data.bookings) && res.data.data.bookings.length) {
          raw = res.data.data.bookings;
        } else if (res.data.data.tableData && Array.isArray(res.data.data.tableData)) {
          raw = res.data.data.tableData;
        }
      }
      // normalize to expected columns
      const mapped = raw.map((r) => ({
        id: r.id || r.booking_id || r.bookingId || null,
        kode: r.kode || r.kode_batch || (r.id ? String(r.id) : "-"),
        // Prefer explicit full_name from nested user object, fall back to other fields
        klien: (r.user && (r.user.full_name || r.user.name)) || r.user_name || r.klien || "-",
        jenis: r.jenis_analisis || r.jenis || r.jenisAnalisis || "-",
        status: r.status || "-",
        pdf_path: r.pdf_path || r.pdfPath || null,
        pdf_url: r.pdf_url || r.pdfUrl || null,
      }));
      setReportData(mapped);
      setUnauthenticated(false);
    } catch (err) {
      console.error("Gagal fetch laporan:", err);
      if (err && err.response && err.response.status === 401) {
        setUnauthenticated(true);
      }
      setReportData([]);
    }
    setLoading(false);
  };

  const handleDownload = async (item) => {
    if (!item) return;
    try {
      let blob;
      const fileName = `Hasil_Analisis_${item.kode || item.kode_batch || item.id || "hasil"}.pdf`;

      if (item.pdf_url) {
        const resp = await fetch(item.pdf_url);
        if (!resp.ok) throw new Error("Network error");
        blob = await resp.blob();
      } else if (item.id) {
        const url = `${API_URL}/bookings/${item.id}/pdf`;
        const resp = await axios.get(url, { headers: getAuthHeader(), responseType: "blob" });
        const contentType = resp.headers["content-type"] || "application/pdf";
        blob = new Blob([resp.data], { type: contentType });
      } else {
        alert("File hasil analisis tidak tersedia untuk item ini.");
        return;
      }

      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error("Download gagal:", err);
      alert("Gagal mengunduh file. Periksa koneksi atau login Anda.");
    }
  };

  const handlePreview = async (item) => {
    if (!item) return;
    try {
      if (item.pdf_url) {
        window.open(item.pdf_url, "_blank");
        return;
      }
      if (!item.id) {
        alert("File preview tidak tersedia untuk item ini.");
        return;
      }
      const url = `${API_URL}/bookings/${item.id}/pdf`;
      const resp = await axios.get(url, { headers: getAuthHeader(), responseType: "blob" });
      const blob = new Blob([resp.data], { type: resp.headers["content-type"] || "application/pdf" });
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
      // revoke later
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60 * 1000);
    } catch (err) {
      console.error("Preview gagal:", err);
      alert("Gagal menampilkan preview. Periksa koneksi atau login Anda.");
    }
  };

  const theme = {
    primary: "#8D766B", // Cokelat SILAB
    btnCokelat: "#9E8379", // Cokelat tombol dari gambar
    btnAbu: "#7F8C8D", // Abu-abu tombol Arsip
    background: "#F7F5F4",
    white: "#FFFFFF",
  };

  // Static month options for filter
  const bulanOptions = [
    { value: "1", label: "Januari" },
    { value: "2", label: "Februari" },
    { value: "3", label: "Maret" },
    { value: "4", label: "April" },
    { value: "5", label: "Mei" },
    { value: "6", label: "Juni" },
    { value: "7", label: "Juli" },
    { value: "8", label: "Agustus" },
    { value: "9", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" },
  ];

  // Generate year options (current year and 5 years back)
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 5; i--) {
      years.push(i);
    }
    return years;
  };

  return (
    <NavbarLoginKepala>
      <div style={{ backgroundColor: theme.background, minHeight: "100vh", padding: "20px 0" }}>
        <Container className="px-2 px-md-3">
          {/* Filter Section (Berdasarkan Gambar d14b0c) */}
          <Card className="border-0 shadow-sm p-2 p-md-4 mb-3 mb-md-4" style={{ borderRadius: "20px" }}>
            <Row className="align-items-end g-3">
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="small fw-bold text-muted">Jenis Analisis:</Form.Label>
                  <Form.Select value={filterJenis} onChange={(e) => setFilterJenis(e.target.value)} className="custom-input shadow-sm">
                    <option value="">Semua</option>
                    <option value="hematologi">Hematologi</option>
                    <option value="metabolit">Metabolit</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="small fw-bold text-muted">Bulan:</Form.Label>
                  <Form.Select value={filterBulan} onChange={(e) => setFilterBulan(e.target.value)} className="custom-input shadow-sm">
                    <option value="">Semua Bulan</option>
                    {bulanOptions.map((b) => (
                      <option key={b.value} value={b.value}>
                        {b.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="small fw-bold text-muted">Tahun:</Form.Label>
                  <Form.Select value={filterTahun} onChange={(e) => setFilterTahun(e.target.value)} className="custom-input shadow-sm">
                    <option value="">Semua Tahun</option>
                    {getYearOptions().map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Button className="w-100 btn-tampilkan" onClick={fetchReport}>
                  Tampilkan
                </Button>
              </Col>
            </Row>
          </Card>

          {/* Search & Table Section */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <div className="mb-3 d-flex justify-content-start">
              <InputGroup className="rounded-pill border px-2 bg-white shadow-sm" style={{ maxWidth: "400px" }}>
                <Form.Control value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Cari berdasarkan kode, klien, atau jenis..." className="bg-transparent border-0 py-2 shadow-none small" />
                <InputGroup.Text className="bg-transparent border-0 text-muted">
                  <Search size={16} />
                </InputGroup.Text>
              </InputGroup>
            </div>

            <Card className="border-0 shadow-sm overflow-hidden" style={{ borderRadius: "20px" }}>
              <div className="table-responsive" style={{ overflowX: "auto" }}>
                <Table hover className="mb-0 custom-table-style text-center align-middle" style={{ minWidth: "700px", width: "100%" }}>
                  <thead>
                    <tr>
                      <th style={{ width: "18%", minWidth: "120px" }}>Kode Sampel</th>
                      <th style={{ width: "20%", minWidth: "130px" }}>Klien</th>
                      <th style={{ width: "22%", minWidth: "140px" }}>Jenis Analisis</th>
                      <th style={{ width: "18%", minWidth: "110px" }}>Status</th>
                      <th style={{ width: "22%", minWidth: "180px" }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      <tr>
                        <td colSpan={5} className="py-3 py-md-4 text-center">
                          Memuat data...
                        </td>
                      </tr>
                    )}
                    {!loading && unauthenticated && (
                      <tr>
                        <td colSpan={5} className="py-3 py-md-4 text-center text-muted">
                          Silakan login untuk melihat laporan.
                        </td>
                      </tr>
                    )}
                    {!loading && !unauthenticated && reportData.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-3 py-md-4 text-center text-muted">
                          Tidak ada data laporan
                        </td>
                      </tr>
                    )}
                    {!loading &&
                      reportData
                        .filter((item) => String(item.status).toLowerCase() === "selesai")
                        .filter((item) => {
                          if (!searchTerm) return true;
                          const q = searchTerm.toLowerCase();
                          return (
                            String(item.kode || "")
                              .toLowerCase()
                              .includes(q) ||
                            String(item.klien || "")
                              .toLowerCase()
                              .includes(q) ||
                            String(item.jenis || "")
                              .toLowerCase()
                              .includes(q)
                          );
                        })
                        .map((item, index) => (
                          <tr key={index}>
                            <td className="py-2 py-md-4 border-end" style={{ wordBreak: "break-word" }}>
                              {item.kode}
                            </td>
                            <td className="py-2 py-md-4 border-end" style={{ wordBreak: "break-word" }}>
                              {item.klien}
                            </td>
                            <td className="py-2 py-md-4 border-end" style={{ wordBreak: "break-word" }}>
                              {item.jenis}
                            </td>
                            <td className="py-2 py-md-4 border-end" style={{ fontSize: "0.85rem" }}>
                              {item.status}
                            </td>
                            <td className="py-2 py-md-4">
                              <div className="d-flex justify-content-center gap-1 gap-md-2 flex-wrap">
                                <Button className="btn-action-unduh btn-responsive" onClick={() => handleDownload(item)} disabled={!item.id && !item.pdf_url} size="sm">
                                  <span className="d-none d-md-inline">Unduh</span>
                                  <span className="d-md-none">📄</span>
                                </Button>
                                <Button className="btn-action-arsip btn-responsive" onClick={() => handlePreview(item)} disabled={!item.id && !item.pdf_url} size="sm">
                                  <span className="d-none d-md-inline">Preview</span>
                                  <span className="d-md-none">👁</span>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </Table>
              </div>
            </Card>
          </motion.div>
        </Container>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
          
          body { font-family: 'Plus Jakarta Sans', sans-serif; }

          .custom-input {
            border-radius: 20px !important;
            padding: 0.6rem 1rem !important;
            font-size: 14px;
          }

          .icon-calendar-bg {
            background-color: ${theme.btnCokelat};
            padding: 5px;
            border-radius: 8px;
            display: flex;
            align-items: center;
          }

          .btn-tampilkan {
            background-color: ${theme.btnCokelat} !important;
            border: none !important;
            border-radius: 50px !important;
            padding: 10px !important;
            font-weight: 600 !important;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          }

          .custom-table-style thead th {
            font-weight: 800;
            padding: 15px 8px;
            background-color: #FFFFFF;
            border-bottom: 1px solid #F0F0F0;
            font-size: 0.9rem;
          }

          @media (min-width: 768px) {
            .custom-table-style thead th {
              padding: 20px;
              font-size: 1rem;
            }
          }

          .btn-action-unduh {
            background-color: ${theme.btnCokelat} !important;
            border: none !important;
            padding: 4px 12px !important;
            border-radius: 50px !important;
            font-size: 12px !important;
            box-shadow: 0 3px 8px rgba(0,0,0,0.15);
            min-width: 60px;
          }

          .btn-action-arsip {
            background-color: ${theme.btnAbu} !important;
            border: none !important;
            padding: 4px 12px !important;
            border-radius: 50px !important;
            font-size: 12px !important;
            box-shadow: 0 3px 8px rgba(0,0,0,0.15);
            min-width: 60px;
          }

          @media (min-width: 768px) {
            .btn-action-unduh, .btn-action-arsip {
              padding: 6px 25px !important;
              font-size: 14px !important;
              min-width: auto;
            }
          }

          .border-end { border-right: 1px solid #F0F0F0 !important; }
        `}</style>
      </div>
      <FooterSetelahLogin />
    </NavbarLoginKepala>
  );
};

export default LaporanKepala;
