import React, { useEffect, useState } from "react";
import { Container, Row, Col, Form, Button, Table, Card, Spinner, InputGroup } from "react-bootstrap";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { Calendar, Download, FileText, Filter, Hash, Beaker, User, Eye, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import NavbarLoginKoordinator from "./NavbarLoginKoordinator";
import FooterSetelahLogin from "../FooterSetelahLogin";
import { fetchKoordinatorReport } from "../../api/koordinatorReport";
import axios from "axios";
import { getAuthHeader } from "../../services/AuthService";
import { getApiBaseUrl } from "../../config/apiConfig";

const API_URL = getApiBaseUrl();

const LaporanKoordinator = () => {
  useEffect(() => {
    document.title = "SILAB-NTDK - Laporan Koordinator";
  }, []);
  const [chartData, setChartData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [filters, setFilters] = useState({ jenisAnalisis: [], bulan: [], tahun: [] });
  const [filterForm, setFilterForm] = useState({ jenis_analisis: "", bulan: "", tahun: "" });
  const [reportHistory, setReportHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

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

  const theme = {
    primary: "#8D766B",
    btnCokelat: "#9E8379",
    background: "#F8F9FA",
    textDark: "#2D3436",
    textMuted: "#636E72",
  };

  const loadData = async (params = {}) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetchKoordinatorReport(params);
      if (res.success) {
        setChartData(res.data.chartData || []);
        let initialTable = res.data.bookings || res.data.tableData || [];

        if (!initialTable || initialTable.length === 0) {
          try {
            const bk = await axios.get(`${API_URL}/bookings/all`, { headers: getAuthHeader() });
            const raw = bk?.data?.data || bk?.data || [];
            initialTable = raw.map((b) => ({
              tgl: b.tanggal_kirim ? new Date(b.tanggal_kirim).toLocaleDateString("id-ID") : "-",
              kode_batch: b.kode_batch || "-",
              user_name: b.user?.full_name || b.user?.name || "-",
              jenis_analisis: b.jenis_analisis || "-",
              analysis_items: Array.isArray(b.analysis_items) ? b.analysis_items : [],
              jumlah_sampel: b.jumlah_sampel || 1,
              total_harga: Number(b.total_harga) || Number(b.jumlah_sampel || 1) * 50000,
              status: b.status || "-",
              pdf_path: b.pdf_path || null,
            }));
          } catch (e) {
            console.error(e);
          }
        }
        setTableData(initialTable);
        setFilters({
          jenisAnalisis: res.data.filters?.jenisAnalisis || [],
          bulan: res.data.filters?.bulan || [],
          tahun: (res.data.filters?.tahun || []).slice().sort((a, b) => b - a),
        });
        setReportHistory(res.data.reportHistory || []);
      }
    } catch (e) {
      setErrorMsg("Gagal memuat data laporan.");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => setFilterForm({ ...filterForm, [e.target.name]: e.target.value });
  const handleFilter = (e) => {
    e.preventDefault();
    loadData(filterForm);
  };

  return (
    <NavbarLoginKoordinator>
      <div style={{ backgroundColor: theme.background, minHeight: "100vh", padding: "30px 0" }}>
        <Container className="px-2 px-md-3">
          {/* Header Section */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-5">
            <div className="d-flex align-items-center gap-2 mb-2">
              <div style={{ width: "30px", height: "3px", backgroundColor: theme.primary }}></div>
              <span className="text-uppercase fw-bold" style={{ color: theme.primary, fontSize: "12px", letterSpacing: "1px" }}>
                Coordinator Insights
              </span>
            </div>
            <h2 className="fw-bold" style={{ color: theme.textDark, fontSize: "2.2rem" }}>
              Laporan Analisis
            </h2>
            <p style={{ color: theme.textMuted }}>Pantau performa aktivitas laboratorium dan kelola dokumen laporan bulanan.</p>
          </motion.div>

          {/* Filter Section */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-0 shadow-sm p-4 mb-5" style={{ borderRadius: "24px" }}>
              <Form onSubmit={handleFilter}>
                <Row className="g-3 align-items-end">
                  <Col lg={4}>
                    <Form.Label className="small fw-bold text-muted text-uppercase ms-1">Jenis Analisis</Form.Label>
                    <InputGroup className="bg-light border-0 px-2 py-1" style={{ borderRadius: "12px" }}>
                      <InputGroup.Text className="bg-transparent border-0">
                        <Filter size={16} />
                      </InputGroup.Text>
                      <Form.Select name="jenis_analisis" value={filterForm.jenis_analisis} onChange={handleChange} className="bg-transparent border-0 shadow-none">
                        <option value="">Semua Analisis</option>
                        {filters.jenisAnalisis.map((j, i) => (
                          <option key={i} value={j}>
                            {j}
                          </option>
                        ))}
                      </Form.Select>
                    </InputGroup>
                  </Col>
                  <Col lg={3}>
                    <Form.Label className="small fw-bold text-muted text-uppercase ms-1">Bulan</Form.Label>
                    <Form.Select name="bulan" value={filterForm.bulan} onChange={handleChange} className="bg-light border-0 py-2 shadow-none" style={{ borderRadius: "12px" }}>
                      <option value="">Semua Bulan</option>
                      {bulanOptions.map((b) => (
                        <option key={b.value} value={b.value}>
                          {b.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col lg={3}>
                    <Form.Label className="small fw-bold text-muted text-uppercase ms-1">Tahun</Form.Label>
                    <Form.Select name="tahun" value={filterForm.tahun} onChange={handleChange} className="bg-light border-0 py-2 shadow-none" style={{ borderRadius: "12px" }}>
                      <option value="">Semua Tahun</option>
                      {getYearOptions().map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col lg={2}>
                    <Button type="submit" className="w-100 border-0 py-2 fw-bold" style={{ backgroundColor: theme.primary, borderRadius: "12px" }}>
                      {loading ? <Spinner size="sm" animation="border" /> : "Tampilkan"}
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card>
          </motion.div>

          {/* Chart Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="mb-5 border-0 shadow-sm overflow-hidden" style={{ borderRadius: "24px" }}>
              <Card.Header className="bg-white border-0 pt-4 px-4 pb-0">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <TrendingUp size={20} className="text-primary" />
                  <h5 className="fw-bold mb-0">Statistik Aktivitas Lab</h5>
                </div>
                <p className="small text-muted mb-0">Visualisasi jumlah pesanan per kuartal</p>
              </Card.Header>
              <Card.Body className="p-4">
                <div style={{ width: "100%", height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={chartData}>
                      <Tooltip cursor={{ fill: "#f8f9fa" }} contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#999", fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "#999", fontSize: 12 }} />
                      <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={45}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? "#3E322E" : theme.primary} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card.Body>
            </Card>
          </motion.div>

          {/* Main Table Section */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <div className="d-flex align-items-center justify-content-between mb-3 px-1">
              <h5 className="fw-bold mb-0">Rincian Laporan Analisis</h5>
              <span className="text-muted small">Total {tableData.length} data ditemukan</span>
            </div>
            <Card className="border-0 shadow-sm overflow-hidden mb-5" style={{ borderRadius: "24px" }}>
              <div className="table-responsive" style={{ overflowX: "auto" }}>
                <Table hover className="mb-0 custom-table" style={{ minWidth: "900px", width: "100%" }}>
                  <thead>
                    <tr>
                      <th className="ps-2 ps-md-4" style={{ minWidth: "100px", width: "12%" }}>Tanggal</th>
                      <th style={{ minWidth: "120px", width: "15%" }}>
                        <Hash size={14} className="me-1" /> Batch
                      </th>
                      <th style={{ minWidth: "140px", width: "18%" }}>
                        <User size={14} className="me-1" /> Pemesan
                      </th>
                      <th style={{ minWidth: "160px", width: "25%" }}>
                        <Beaker size={14} className="me-1" /> Analisis
                      </th>
                      <th className="text-end" style={{ minWidth: "120px", width: "15%" }}>Total Biaya</th>
                      <th className="text-center" style={{ minWidth: "100px", width: "10%" }}>Status</th>
                      <th className="text-center pe-2 pe-md-4" style={{ minWidth: "100px", width: "10%" }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-4 py-md-5 text-muted">
                          Data tidak tersedia
                        </td>
                      </tr>
                    ) : (
                      tableData.map((item, i) => (
                        <tr key={i}>
                          <td className="ps-2 ps-md-4 text-muted small">{item.tgl}</td>
                          <td className="fw-bold text-dark" style={{ wordBreak: "break-word" }}>{item.kode_batch}</td>
                          <td style={{ wordBreak: "break-word" }}>{item.user_name}</td>
                          <td>
                            <div className="small fw-medium">{item.jenis_analisis}</div>
                            <div className="d-flex gap-1 mt-1 flex-wrap">
                              {item.analysis_items?.map((ai, idx) => (
                                <span key={idx} className="badge-param">
                                  {ai.nama_item || ai.nama}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="text-end fw-bold" style={{ color: theme.primary }}>
                            Rp {item.total_harga?.toLocaleString("id-ID")}
                          </td>
                          <td className="text-center">
                            <span className="badge-status-finished">{item.status}</span>
                          </td>
                          <td className="text-center pe-2 pe-md-4">
                            {item.pdf_path && (
                              <Button as="a" target="_blank" href={`${API_URL.replace(/\/api$/, "")}/storage/${item.pdf_path}`} className="btn-table-action" size="sm">
                                <Eye size={14} /> 
                                <span className="d-none d-md-inline ms-1">Preview</span>
                                <span className="d-md-none">📄</span>
                              </Button>
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

          {/* Report History Table */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <h5 className="fw-bold mb-3 px-1">Riwayat Dokumen Laporan Bulanan</h5>
            <Card className="border-0 shadow-sm overflow-hidden" style={{ borderRadius: "24px" }}>
              <div className="table-responsive" style={{ overflowX: "auto" }}>
                <Table hover className="mb-0 custom-table" style={{ minWidth: "700px", width: "100%" }}>
                  <thead>
                    <tr>
                      <th className="ps-2 ps-md-4" style={{ minWidth: "140px", width: "25%" }}>Bulan / Periode</th>
                      <th style={{ minWidth: "180px", width: "35%" }}>Dokumen Tersedia</th>
                      <th style={{ minWidth: "120px", width: "20%" }}>Dibuat Pada</th>
                      <th className="text-center pe-2 pe-md-4" style={{ minWidth: "100px", width: "20%" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportHistory.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-4 py-md-5 text-muted">
                          Belum ada riwayat dokumen
                        </td>
                      </tr>
                    ) : (
                      reportHistory.map((item, i) => (
                        <tr key={i}>
                          <td className="ps-2 ps-md-4 fw-bold" style={{ wordBreak: "break-word" }}>{item.bulan}</td>
                          <td>
                            <div className="d-flex flex-column gap-1">
                              {item.files?.map((f, idx) => (
                                <a key={idx} href={f.url} target="_blank" rel="noreferrer" className="text-primary text-decoration-none small d-flex align-items-center gap-2">
                                  <FileText size={14} /> {f.label}
                                </a>
                              ))}
                            </div>
                          </td>
                          <td className="text-muted small">{item.tanggal_buat}</td>
                          <td className="text-center pe-2 pe-md-4">
                            <span className="badge-status-info">{item.status}</span>
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
          
          body { font-family: 'Inter', sans-serif; }

          .custom-table thead th {
            background-color: #FAFAFB;
            color: #636E72;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.5px;
            padding: 15px 10px;
            border-bottom: 1px solid #F1F2F6;
          }

          @media (min-width: 768px) {
            .custom-table thead th {
              padding: 20px 15px;
              font-size: 11px;
            }
          }

          .custom-table tbody td {
            padding: 12px 10px;
            vertical-align: middle;
            font-size: 14px;
            border-bottom: 1px solid #F1F2F6;
            color: #2D3436;
          }

          @media (min-width: 768px) {
            .custom-table tbody td {
              padding: 18px 15px;
            }
          }

          .badge-param {
            background-color: #F1F2F6;
            color: #636E72;
            padding: 3px 6px;
            border-radius: 6px;
            font-size: 9px;
            font-weight: 500;
          }

          @media (min-width: 768px) {
            .badge-param {
              padding: 3px 8px;
              font-size: 10px;
            }
          }

          .badge-status-finished {
            background-color: #E3F9E5;
            color: #1F922B;
            padding: 6px 12px;
            border-radius: 8px;
            font-size: 11px;
            font-weight: 600;
            text-transform: capitalize;
          }

          .badge-status-info {
            background-color: #E1F5FE;
            color: #0288D1;
            padding: 6px 12px;
            border-radius: 8px;
            font-size: 11px;
            font-weight: 600;
          }

          .btn-table-action {
            background-color: transparent;
            color: ${theme.primary};
            border: 1px solid ${theme.primary};
            border-radius: 8px;
            font-size: 12px;
            padding: 5px 12px;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s;
          }

          .btn-table-action:hover {
            background-color: ${theme.primary};
            color: white;
          }
        `}</style>
      </div>
      <FooterSetelahLogin />
    </NavbarLoginKoordinator>
  );
};

export default LaporanKoordinator;
