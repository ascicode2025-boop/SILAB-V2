import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Table, Button, Form, InputGroup } from "react-bootstrap";
import { Search, FileText, ChevronRight, Hash, Calendar as CalendarIcon, Beaker } from "lucide-react";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import NavbarLogin from "./NavbarLoginKlien";
import FooterSetelahLogin from "../FooterSetelahLogin";
import { getApiBaseUrl, getStorageUrl } from "../../config/apiConfig";

const RiwayatAnalisisKlien = () => {
  useEffect(() => {
    document.title = "SILAB-NTDK - Riwayat Analisis";
  }, []);

  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const apiBase = getApiBaseUrl();
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`${apiBase}/bookings`, { headers });
        const json = await res.json();

        if (json && json.success) {
          const finished = (json.data || []).filter((b) => {
            const st = (b.status || "").toLowerCase();
            return ["selesai", "lunas", "paid", "ditandatangani", "verified"].includes(st);
          });

          setHistoryData(
            finished.map((b, idx) => {
              let jenisAnalisis = "-";
              if (b.analysis_items && b.analysis_items.length > 0) {
                jenisAnalisis = b.analysis_items.map((i) => i.nama_item || i.namaItem || "-").join(", ");
              }
              return {
                no: idx + 1,
                kode_batch: b.kode_batch || "-",
                jenis: jenisAnalisis,
                tanggal: b.updated_at
                  ? new Date(b.updated_at).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  : "-",
                status: (b.status || "").toLowerCase(),
                pdf_path: b.pdf_path,
                id: b.id,
              };
            }),
          );
        }
      } catch (e) {
        setHistoryData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const theme = {
    primary: "#8D766B",
    btnCokelat: "#9E8379",
    background: "#F8F9FA",
    textDark: "#2D3436",
    textMuted: "#636E72",
  };

  const getStatusBadge = (status) => {
    const config = {
      lunas: { bg: "#E3F9E5", color: "#1F922B", label: "Lunas" },
      paid: { bg: "#E3F9E5", color: "#1F922B", label: "Lunas" },
      verified: { bg: "#E3F9E5", color: "#1F922B", label: "Terverifikasi" },
      ditandatangani: { bg: "#E1F5FE", color: "#0288D1", label: "Ditandatangani" },
      default: { bg: "#F3F0EF", color: "#8D766B", label: "Selesai" },
    };
    const style = config[status] || config.default;
    return (
      <span
        style={{
          backgroundColor: style.bg,
          color: style.color,
          padding: "6px 14px",
          borderRadius: "8px",
          fontSize: "12px",
          fontWeight: "600",
          display: "inline-block",
        }}
      >
        {style.label}
      </span>
    );
  };

  // Search filter function
  const getFilteredData = () => {
    return historyData.filter((item) => {
      return item.kode_batch.toLowerCase().includes(searchTerm.toLowerCase()) || item.jenis.toLowerCase().includes(searchTerm.toLowerCase());
    });
  };

  return (
    <NavbarLogin>
      <div style={{ backgroundColor: theme.background, minHeight: "100vh", padding: "60px 0" }}>
        <Container>
          {/* Header Section */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-5">
            <h2 className="fw-bold" style={{ color: theme.textDark, fontSize: "2.2rem" }}>
              Riwayat Analisis
            </h2>
            <p style={{ color: theme.textMuted }}>Kelola dan unduh hasil sertifikat pengujian laboratorium Anda.</p>
          </motion.div>

          {/* Main Table Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-0 shadow-sm" style={{ borderRadius: "24px", overflow: "hidden" }}>
              <Card.Header className="bg-white p-4 border-0">
                <Row className="g-3 align-items-center">
                  <Col xs={12} md={8} lg={6}>
                    <InputGroup className="bg-light border-0 px-3 py-1" style={{ borderRadius: "15px" }}>
                      <InputGroup.Text className="bg-transparent border-0 text-muted">
                        <Search size={18} />
                      </InputGroup.Text>
                      <Form.Control placeholder="Cari kode batch atau jenis analisis..." className="bg-transparent border-0 shadow-none" style={{ fontSize: "14px" }} onChange={(e) => setSearchTerm(e.target.value)} />
                    </InputGroup>
                  </Col>
                  <Col xs={12} md={4} lg={6} className="d-none d-lg-block">
                    <small className="text-muted">
                      Menampilkan {getFilteredData().length} dari {historyData.length} riwayat analisis
                    </small>
                  </Col>
                </Row>
              </Card.Header>

              <div className="table-responsive">
                <Table hover className="mb-0 custom-table">
                  <thead>
                    <tr>
                      <th className="ps-4 d-none d-md-table-cell">No</th>
                      <th>
                        <Hash size={14} className="me-1 d-none d-sm-inline" />
                        <span className="d-sm-none">Kode</span>
                        <span className="d-none d-sm-inline">Kode Batch</span>
                      </th>
                      <th className="d-none d-lg-table-cell">
                        <Beaker size={14} className="me-1" /> Jenis Analisis
                      </th>
                      <th className="d-none d-md-table-cell">
                        <CalendarIcon size={14} className="me-1" /> Tanggal Selesai
                      </th>
                      <th className="text-center">Status</th>
                      <th className="text-center pe-4">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="text-center py-5">
                          Memuat data...
                        </td>
                      </tr>
                    ) : historyData.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-5">
                          Belum ada riwayat analisis.
                        </td>
                      </tr>
                    ) : getFilteredData().length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-5">
                          <div className="text-muted">
                            <Search size={40} className="mb-3 opacity-50" />
                            <p className="mb-2">Tidak ditemukan hasil</p>
                            <small>Coba ubah kata kunci pencarian Anda</small>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      getFilteredData().map((item, index) => (
                        <tr key={item.id}>
                          <td className="ps-4 text-muted d-none d-md-table-cell">{index + 1}</td>
                          <td>
                            <div className="fw-bold" style={{ color: theme.textDark }}>
                              {item.kode_batch}
                            </div>
                            {/* Mobile: Show analysis type below code */}
                            <div className="d-lg-none text-muted small mt-1" style={{ fontSize: "12px", lineHeight: "1.3" }}>
                              <Beaker size={12} className="me-1" />
                              <span className="text-truncate d-inline-block" style={{ maxWidth: "200px", verticalAlign: "middle" }}>
                                {item.jenis}
                              </span>
                            </div>
                            {/* Mobile: Show date below analysis type */}
                            <div className="d-md-none text-muted small mt-1" style={{ fontSize: "11px" }}>
                              <CalendarIcon size={10} className="me-1" />
                              {item.tanggal}
                            </div>
                          </td>
                          <td className="d-none d-lg-table-cell">
                            <div className="text-truncate" style={{ maxWidth: "250px" }}>
                              {item.jenis}
                            </div>
                          </td>
                          <td className="text-muted d-none d-md-table-cell">{item.tanggal}</td>
                          <td className="text-center">
                            <div className="d-flex justify-content-center">{getStatusBadge(item.status)}</div>
                          </td>
                          <td className="text-center pe-4">
                            {item.pdf_path ? (
                              <Button
                                as="a"
                                href={`${getStorageUrl()}/storage/${item.pdf_path}`}
                                target="_blank"
                                className="btn-lihat-new"
                                size="sm"
                              >
                                <span className="d-none d-sm-inline">Hasil</span>
                                <span className="d-sm-none">PDF</span>
                                <ChevronRight size={14} />
                              </Button>
                            ) : (
                              <span className="text-muted small italic d-block text-center" style={{ fontSize: "11px" }}>
                                Diproses
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </Card>
          </motion.div>
        </Container>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          .custom-table {
            font-family: 'Inter', sans-serif;
            border-collapse: separate;
            border-spacing: 0;
          }

          .custom-table thead th {
            background-color: #FAFAFB;
            color: #636E72;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.5px;
            padding: 20px 15px;
            border-top: none;
            border-bottom: 1px solid #F1F2F6;
          }

          .custom-table tbody td {
            padding: 20px 15px;
            vertical-align: middle;
            font-size: 14px;
            border-bottom: 1px solid #F1F2F6;
            color: #2D3436;
          }

          .custom-table tbody tr:hover {
            background-color: #F8F9FA !important;
            transition: all 0.2s ease;
          }

          .btn-lihat-new {
            background-color: ${theme.btnCokelat};
            border: none;
            border-radius: 8px;
            padding: 6px 16px;
            font-size: 12px;
            font-weight: 600;
            color: white;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: all 0.3s ease;
            box-shadow: 0 2px 4px rgba(158, 131, 121, 0.2);
            white-space: nowrap;
          }

          .btn-lihat-new:hover {
            background-color: #8D766B;
            color: white;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(158, 131, 121, 0.3);
          }

          .btn-lihat-new:active {
            transform: translateY(0);
          }

          /* Mobile specific styles */
          @media (max-width: 768px) {
            .custom-table thead th {
              padding: 12px 8px;
              font-size: 10px;
            }
            
            .custom-table tbody td {
              padding: 12px 8px;
              font-size: 13px;
            }
            
            .btn-lihat-new {
              padding: 4px 8px;
              font-size: 10px;
              gap: 4px;
              border-radius: 6px;
            }
            
            .table-responsive {
              font-size: 12px;
            }
          }

          @media (max-width: 576px) {
            .custom-table thead th {
              padding: 10px 6px;
              font-size: 9px;
            }
            
            .custom-table tbody td {
              padding: 10px 6px;
              font-size: 12px;
            }
            
            .btn-lihat-new {
              padding: 4px 6px;
              font-size: 9px;
              min-width: auto;
            }
          }

          /* Status badge responsive */
          @media (max-width: 768px) {
            .custom-table tbody td span[style*="padding: 6px 14px"] {
              padding: 4px 8px !important;
              font-size: 10px !important;
              border-radius: 6px !important;
            }
          }
        `}</style>
      </div>
      <FooterSetelahLogin />
    </NavbarLogin>
  );
};

export default RiwayatAnalisisKlien;
