import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Table, InputGroup, Form, Button, Modal } from "react-bootstrap";
import { Search, Hash, Beaker, Calendar as CalendarIcon, Eye, FileText, ChevronRight, User } from "lucide-react";
import { motion } from "framer-motion";
import NavbarLoginTeknisi from "./NavbarLoginTeknisi";
import FooterSetelahLogin from "../FooterSetelahLogin";
import { getApiBaseUrl, getStorageUrl } from "../../config/apiConfig";

// Helper tetap sama (logika tidak berubah)
function parseHasilToTable(namaItem, hasilString) {
  if (!hasilString) return [];
  const parts = hasilString.split(" | ");
  return parts.map((p) => {
    const codeMatch = p.match(/\[(.*?)\]/);
    const code = codeMatch ? codeMatch[1] : "-";
    let std = "",
      spl = "",
      input = "",
      hasil = "",
      unit = "",
      detail = "";
    if (p.includes("STD=") && p.includes("SPL=")) {
      std = (p.match(/STD=([\d.]+)/) || [])[1] || "";
      spl = (p.match(/SPL=([\d.]+)/) || [])[1] || "";
      hasil = (p.match(/HASIL=([\d.]+)/) || [])[1] || "";
      unit = (p.match(/HASIL=[\d.]+\s*([a-zA-Z%/]+)/) || [])[1] || "";
      return { code, std, spl, hasil, unit: unit && unit !== "(" ? unit : "" };
    } else if (p.includes("INPUT=") && p.includes("HASIL=")) {
      input = (p.match(/INPUT=([\d.]+)/) || [])[1] || "";
      hasil = (p.match(/HASIL=([\d.]+)/) || [])[1] || "";
      let unitMatch = p.match(/HASIL=[\d.]+\s*\(([^)]+)\)/);
      unit = unitMatch && unitMatch[1] ? unitMatch[1] : "";
      return { code, input, hasil, unit };
    } else if (p.includes("Lim:") && p.includes("%")) {
      detail = p.replace(/\[.*?\]:\s*/, "");
      return { code, detail };
    } else {
      return { code, raw: p };
    }
  });
}

const RiwayatAnalisisTeknisi = () => {
  useEffect(() => {
    document.title = "SILAB-NTDK - Riwayat Analisis Teknisi";
  }, []);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const theme = {
    primary: "#8D766B",
    btnCokelat: "#9E8379",
    background: "#F8F9FA",
    textDark: "#2D3436",
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const apiBase = getApiBaseUrl();
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`${apiBase}/bookings/all`, { headers });
        const json = await res.json();
        if (json && json.success) {
          const filtered = (json.data || []).filter((item) => {
            if (item.status !== "selesai") return false;
            return item.analysis_items?.some((ai) => ai.hasil && ai.hasil.trim() !== "");
          });
          setData(filtered);
        }
      } catch (e) {
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredData = data.filter((item) => item.kode_batch?.toLowerCase().includes(searchTerm.toLowerCase()) || item.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <NavbarLoginTeknisi>
      <div style={{ backgroundColor: theme.background, minHeight: "100vh", padding: "60px 0" }}>
        <Container>
          {/* Header Section */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-5">
            <div className="d-flex align-items-center gap-2 mb-2">
              <div style={{ width: "30px", height: "3px", backgroundColor: theme.primary }}></div>
              <span className="text-uppercase fw-bold" style={{ color: theme.primary, fontSize: "12px", letterSpacing: "1px" }}>
                Technician Dashboard
              </span>
            </div>
            <h2 className="fw-bold" style={{ color: theme.textDark, fontSize: "2.2rem" }}>
              Riwayat Analisis Selesai
            </h2>
            <p className="text-muted">Pantau hasil validasi pengujian laboratorium yang telah tuntas.</p>
          </motion.div>

          {/* Table Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-0 shadow-sm" style={{ borderRadius: "24px", overflow: "hidden" }}>
              <Card.Header className="bg-white p-4 border-0">
                <Row className="g-3 align-items-center">
                  <Col md={5}>
                    <InputGroup className="bg-light border-0 px-3 py-1" style={{ borderRadius: "15px" }}>
                      <InputGroup.Text className="bg-transparent border-0 text-muted">
                        <Search size={18} />
                      </InputGroup.Text>
                      <Form.Control placeholder="Cari kode batch atau nama klien..." className="bg-transparent border-0 shadow-none" style={{ fontSize: "14px" }} onChange={(e) => setSearchTerm(e.target.value)} />
                    </InputGroup>
                  </Col>
                </Row>
              </Card.Header>

              <div className="table-responsive">
                <div className="responsive-table-wrapper">
                  <Table hover className="mb-0 custom-table responsive-riwayat-table">
                    <thead>
                      <tr>
                        <th className="ps-4">No</th>
                        <th>
                          <Hash size={14} className="me-1" /> Kode Batch
                        </th>
                        <th className="d-none d-md-table-cell">
                          <User size={14} className="me-1" /> Nama Klien
                        </th>
                        <th className="d-none d-lg-table-cell">
                          <Beaker size={14} className="me-1" /> Jenis Analisis
                        </th>
                        <th className="d-none d-lg-table-cell">
                          <CalendarIcon size={14} className="me-1" /> Tanggal Selesai
                        </th>
                        <th className="text-center d-none d-sm-table-cell">Status</th>
                        <th className="text-center pe-4">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={7} className="text-center py-5 text-muted">
                            Memuat data...
                          </td>
                        </tr>
                      ) : filteredData.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-5 text-muted">
                            Tidak ada riwayat ditemukan.
                          </td>
                        </tr>
                      ) : (
                        filteredData.map((item, idx) => (
                          <tr key={item.id}>
                            <td className="ps-4 text-muted">{idx + 1}</td>
                            <td className="fw-bold responsive-main-cell" style={{ color: theme.textDark }}>
                              <div className="d-flex flex-column">
                                <span className="main-code">{item.kode_batch || "-"}</span>
                                {/* Mobile condensed info */}
                                <div className="d-block d-md-none mobile-condensed-info">
                                  <small className="text-muted d-block">
                                    <User size={12} className="me-1" />
                                    {item.user?.full_name || "-"}
                                  </small>
                                  <small className="text-muted d-block d-sm-none">
                                    <span
                                      style={{
                                        backgroundColor: "#E3F9E5",
                                        color: "#1F922B",
                                        padding: "2px 8px",
                                        borderRadius: "6px",
                                        fontSize: "10px",
                                        fontWeight: "600",
                                      }}
                                    >
                                      Selesai
                                    </span>
                                  </small>
                                </div>
                              </div>
                            </td>
                            <td className="d-none d-md-table-cell">{item.user?.full_name || "-"}</td>
                            <td className="d-none d-lg-table-cell">
                              <div className="text-truncate" style={{ maxWidth: "250px" }}>
                                {item.analysis_items?.map((i) => i.jenis_analisis || i.nama_item || "-").join(", ")}
                              </div>
                            </td>
                            <td className="d-none d-lg-table-cell text-muted">{item.updated_at ? new Date(item.updated_at).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }) : "-"}</td>
                            <td className="text-center d-none d-sm-table-cell">
                              <span style={{ backgroundColor: "#E3F9E5", color: "#1F922B", padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: "600" }}>Selesai</span>
                            </td>
                            <td className="text-center pe-4">
                              <div className="d-flex justify-content-center gap-1 responsive-action-buttons">
                                <Button
                                  variant="light"
                                  size="sm"
                                  className="d-inline-flex align-items-center gap-1 rounded-pill px-2 px-md-3 responsive-btn"
                                  onClick={() => {
                                    setSelectedBooking(item);
                                    setShowModal(true);
                                  }}
                                >
                                  <Eye size={14} /> <span className="d-none d-sm-inline">Detail</span>
                                </Button>
                                {item.pdf_path && (
                                  <Button
                                    as="a"
                                    href={`${getStorageUrl()}/storage/${item.pdf_path}`}
                                    target="_blank"
                                    className="btn-hasil-teknisi responsive-btn"
                                    size="sm"
                                  >
                                    <FileText size={14} className="d-inline d-sm-none" />
                                    <span className="d-none d-sm-inline">Hasil</span>
                                    <ChevronRight size={14} className="d-none d-sm-inline" />
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
              </div>
            </Card>
          </motion.div>
        </Container>

        {/* Modal Detail Analisis */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered className="custom-modal">
          <Modal.Header closeButton className="border-0 pb-0 px-4 pt-4">
            <Modal.Title className="fw-bold">Detail Laporan Analisis</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            {selectedBooking && (
              <>
                <div className="p-3 bg-light rounded-4 mb-4 border d-flex flex-wrap gap-4">
                  <div>
                    <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: "10px" }}>
                      Kode Batch
                    </small>
                    <span className="fw-bold text-primary">{selectedBooking.kode_batch}</span>
                  </div>
                  <div>
                    <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: "10px" }}>
                      Klien
                    </small>
                    <span className="fw-bold">
                      <User size={14} className="me-1" />
                      {selectedBooking.user?.full_name || "N/A"}
                    </span>
                  </div>
                  <div>
                    <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: "10px" }}>
                      No. Telepon
                    </small>
                    <span className="fw-bold">
                      {selectedBooking.user?.nomor_telpon || selectedBooking.user?.nomor_telpon || selectedBooking.user?.nomor_telpon || selectedBooking.user?.nomor_telpon || selectedBooking.user?.nomor_telpon || "-"}
                    </span>
                  </div>
                  <div>
                    <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: "10px" }}>
                      Email
                    </small>
                    <span className="fw-bold">{selectedBooking.user?.email || "-"}</span>
                  </div>
                  <div>
                    <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: "10px" }}>
                      Selesai Pada
                    </small>
                    <span className="fw-bold">{new Date(selectedBooking.updated_at).toLocaleDateString("id-ID")}</span>
                  </div>
                </div>

                {selectedBooking.analysis_items?.map((ai, i) => (
                  <Card key={ai.id || i} className="border-0 shadow-sm mb-3" style={{ borderRadius: "15px", overflow: "hidden" }}>
                    <Card.Header className="bg-white fw-bold py-3 border-bottom d-flex align-items-center gap-2">
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: theme.primary }}></div>
                      {ai.nama_item || ai.jenis_analisis}
                    </Card.Header>
                    <Card.Body>
                      {ai.hasil ? (
                        <div className="table-responsive rounded-3 border">
                          {/* Render tabel dinamis (Logika internal disederhanakan untuk tampilan) */}
                          <Table size="sm" className="mb-0">
                            {/* Konten tabel parsing Anda tetap ada di sini */}
                            <thead className="bg-light">
                              <tr style={{ fontSize: "12px" }}>
                                {ai.hasil.includes("STD=") ? (
                                  <>
                                    <th>Kode</th>
                                    <th>Abs Std</th>
                                    <th>Abs Sampel</th>
                                    <th>Hasil</th>
                                  </>
                                ) : (
                                  <>
                                    <th>Kode Sampel</th>
                                    <th>Data Analisis</th>
                                  </>
                                )}
                              </tr>
                            </thead>
                            <tbody style={{ fontSize: "13px" }}>
                              {parseHasilToTable(ai.nama_item, ai.hasil).map((row, idx) => (
                                <tr key={idx}>
                                  <td>{row.code}</td>
                                  {row.std ? (
                                    <>
                                      {<td>{row.std}</td>}
                                      <td>{row.spl}</td>
                                      <td>
                                        {row.hasil} {row.unit}
                                      </td>
                                    </>
                                  ) : (
                                    <td>{row.detail || row.hasil || row.raw}</td>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      ) : (
                        <span className="text-muted italic small">Hasil belum diinputkan.</span>
                      )}
                      <div className="mt-2 text-muted" style={{ fontSize: "12px" }}>
                        Metode: <b>{ai.metode || "-"}</b>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </>
            )}
          </Modal.Body>
        </Modal>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          .custom-table {
            font-family: 'Inter', sans-serif;
            border-collapse: separate;
            border-spacing: 0;
            font-size: clamp(12px, 2.5vw, 14px);
          }

          .custom-table thead th {
            background-color: #FAFAFB;
            color: #636E72;
            font-weight: 600;
            text-transform: uppercase;
            font-size: clamp(10px, 2vw, 11px);
            letter-spacing: 0.5px;
            padding: clamp(12px, 3vw, 20px) clamp(8px, 2vw, 15px);
            border-bottom: 1px solid #F1F2F6;
            white-space: nowrap;
          }

          .custom-table tbody td {
            padding: clamp(12px, 3vw, 20px) clamp(8px, 2vw, 15px);
            vertical-align: middle;
            font-size: clamp(12px, 2.5vw, 14px);
            border-bottom: 1px solid #F1F2F6;
          }
          
          .responsive-riwayat-table {
            min-width: 100%;
          }
          
          .responsive-table-wrapper {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
          
          .responsive-main-cell {
            min-width: 120px;
          }
          
          .main-code {
            white-space: nowrap;
            font-weight: 700;
            font-size: clamp(13px, 2.8vw, 15px);
          }
          
          .mobile-condensed-info {
            margin-top: 4px;
            line-height: 1.3;
          }
          
          .mobile-condensed-info small {
            font-size: clamp(10px, 2vw, 12px);
            margin-bottom: 2px;
          }
          
          .responsive-action-buttons {
            gap: clamp(2px, 1vw, 8px) !important;
          }
          
          .responsive-btn {
            font-size: clamp(10px, 2.2vw, 13px) !important;
            padding: clamp(4px, 1vw, 6px) clamp(8px, 2vw, 16px) !important;
            border-radius: clamp(6px, 1.5vw, 10px) !important;
            min-height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .btn-hasil-teknisi {
            background-color: ${theme.btnCokelat};
            border: none;
            border-radius: clamp(6px, 1.5vw, 10px);
            padding: clamp(4px, 1vw, 6px) clamp(8px, 2vw, 16px);
            font-size: clamp(10px, 2.2vw, 13px);
            font-weight: 600;
            color: white;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: clamp(2px, 0.5vw, 6px);
            transition: 0.3s;
            min-height: 32px;
          }

          .btn-hasil-teknisi:hover {
            background-color: #8D766B;
            color: white;
            transform: translateY(-1px);
          }

          .custom-modal .modal-content {
            border-radius: 25px;
            border: none;
          }
          
          /* Mobile optimizations */
          @media (max-width: 768px) {
            .responsive-table-wrapper {
              margin: 0 -15px;
              border-radius: 0;
            }
            
            .custom-table {
              font-size: 12px;
            }
            
            .custom-table thead th {
              padding: 12px 8px;
              font-size: 10px;
            }
            
            .custom-table tbody td {
              padding: 12px 8px;
              font-size: 12px;
            }
            
            .responsive-main-cell {
              min-width: 140px;
            }
            
            .main-code {
              font-size: 13px;
            }
            
            .mobile-condensed-info small {
              font-size: 11px;
            }
            
            .responsive-btn {
              font-size: 11px !important;
              padding: 6px 10px !important;
              min-height: 30px;
            }
            
            .btn-hasil-teknisi {
              font-size: 11px;
              padding: 6px 10px;
              min-height: 30px;
            }
          }
          
          /* Tablet adjustments */
          @media (min-width: 769px) and (max-width: 1024px) {
            .custom-table tbody td {
              font-size: 13px;
            }
            
            .responsive-btn {
              font-size: 12px !important;
            }
            
            .btn-hasil-teknisi {
              font-size: 12px;
            }
          }
          
          /* Small mobile phones */
          @media (max-width: 480px) {
            .responsive-table-wrapper {
              margin: 0 -10px;
            }
            
            .custom-table thead th,
            .custom-table tbody td {
              padding: 10px 6px;
            }
            
            .responsive-main-cell {
              min-width: 120px;
            }
            
            .main-code {
              font-size: 12px;
            }
            
            .mobile-condensed-info small {
              font-size: 10px;
            }
            
            .responsive-btn {
              font-size: 10px !important;
              padding: 5px 8px !important;
              min-height: 28px;
            }
            
            .btn-hasil-teknisi {
              font-size: 10px;
              padding: 5px 8px;
              min-height: 28px;
            }
          }
          
          /* Desktop display classes */
          @media (min-width: 768px) {
            .d-md-table-cell {
              display: table-cell !important;
            }
            .d-md-none {
              display: none !important;
            }
          }
          
          @media (min-width: 992px) {
            .d-lg-table-cell {
              display: table-cell !important;
            }
          }
          
          @media (min-width: 576px) {
            .d-sm-table-cell {
              display: table-cell !important;
            }
            .d-sm-inline {
              display: inline !important;
            }
            .d-sm-none {
              display: none !important;
            }
          }
        `}</style>
      </div>
      <FooterSetelahLogin />
    </NavbarLoginTeknisi>
  );
};

export default RiwayatAnalisisTeknisi;
