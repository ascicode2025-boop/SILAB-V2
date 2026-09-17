import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Card, Table, Button, Spinner, Modal, Form } from "react-bootstrap";
import NavbarLoginKepala from "./NavbarLoginKepala";
import FooterSetelahLogin from "../FooterSetelahLogin";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { getAllBookings, getInvoices } from "../../services/BookingService";
import { FileSpreadsheet, FileText, Download, X } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MentoringKepala = () => {
  useEffect(() => {
    document.title = "SILAB-NTDK - Mentoring Kepala";
  }, []);

  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState(null);
  const [rekaptulasi, setRekaptulasi] = useState([]);
  const [rekapDetail, setRekapDetail] = useState([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState("excel");
  const [exporting, setExporting] = useState(false);
  const printRef = useRef();

  const customColors = {
    brown: "#a3867a",
    lightGray: "#e9ecef",
    darkBrown: "#6b5a52",
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch bookings dan invoices
      const bookingsRes = await getAllBookings();
      const invoicesRes = await getInvoices();

      // Filter hanya status selesai
      const bookings = (bookingsRes?.data || []).filter((b) => String(b.status).toLowerCase() === "selesai");
      const invoices = invoicesRes?.data || [];

      // Process chart data - aktivitas per bulan
      const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
      const activityData = new Array(12).fill(0);

      bookings.forEach((booking) => {
        if (booking.created_at) {
          const date = new Date(booking.created_at);
          activityData[date.getMonth()]++;
        }
      });

      // Hitung persentase (max 100)
      const maxActivity = Math.max(...activityData, 1);
      const percentageData = activityData.map((val) => Math.round((val / maxActivity) * 100));

      setChartData({
        labels: months,
        datasets: [
          {
            label: "Aktivitas Lab",
            data: percentageData,
            backgroundColor: customColors.darkBrown,
            borderRadius: 4,
          },
        ],
      });

      // Process Rekaptulasi (last 2 months)
      const monthlyAnalysis = {};
      bookings.forEach((booking) => {
        if (booking.created_at) {
          const date = new Date(booking.created_at);
          const monthKey = date.toLocaleString("id-ID", { month: "long", year: "numeric" });
          if (!monthlyAnalysis[monthKey]) {
            monthlyAnalysis[monthKey] = {
              sampel: 0,
              totalWaktu: [],
              createdAt: date,
            };
          }
          monthlyAnalysis[monthKey].sampel += booking.jumlah_sampel || 1;

          // Hitung waktu pengerjaan jika ada
          if (booking.created_at && booking.updated_at) {
            const createdDate = new Date(booking.created_at);
            const updatedDate = new Date(booking.updated_at);
            const diffTime = Math.abs(updatedDate - createdDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            monthlyAnalysis[monthKey].totalWaktu.push(diffDays);
          }
        }
      });

      const rekapData = Object.entries(monthlyAnalysis)
        .sort((a, b) => b[1].createdAt - a[1].createdAt)
        .slice(0, 2)
        .map(([month, data]) => {
          const avgWaktu = data.totalWaktu.length > 0 ? (data.totalWaktu.reduce((a, b) => a + b, 0) / data.totalWaktu.length).toFixed(1) : "0";
          const status = avgWaktu < 2 ? "Stabil" : avgWaktu < 3 ? "Sedikit menurun" : "Menurun";
          return {
            bulan: month,
            sampel: data.sampel,
            rata_rata: `${avgWaktu} hari`,
            keterangan: status,
          };
        });

      setRekaptulasi(rekapData);

      // Process Tabel Rekap Detail (per bulan dengan invoice data)
      const monthlyInvoice = {};
      invoices.forEach((invoice) => {
        if (invoice.created_at) {
          const date = new Date(invoice.created_at);
          const monthKey = date.toLocaleString("id-ID", { month: "long", year: "numeric" });
          if (!monthlyInvoice[monthKey]) {
            monthlyInvoice[monthKey] = {
              transaksi: 0,
              totalPendapatan: 0,
              createdAt: date,
            };
          }
          monthlyInvoice[monthKey].transaksi++;
          monthlyInvoice[monthKey].totalPendapatan += invoice.amount || 0;
        }
      });

      const rekapDetailData = Object.entries(monthlyInvoice)
        .sort((a, b) => b[1].createdAt - a[1].createdAt)
        .slice(0, 3)
        .map(([month, data]) => {
          const prevMonth = Object.entries(monthlyInvoice)
            .sort((a, b) => b[1].createdAt - a[1].createdAt)
            .find((entry) => entry[1].createdAt < data.createdAt);

          let status = "Stabil";
          if (prevMonth && data.totalPendapatan > prevMonth[1].totalPendapatan) {
            status = "Naik";
          } else if (prevMonth && data.totalPendapatan < prevMonth[1].totalPendapatan) {
            status = "Turun";
          }

          return {
            bulan: month,
            transaksi: data.transaksi,
            total: `Rp ${data.totalPendapatan.toLocaleString("id-ID")}`,
            keterangan: status,
          };
        });

      setRekapDetail(rekapDetailData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function (value) {
            return value + "%";
          },
        },
      },
    },
  };

  const handleExportLaporan = () => {
    setShowExportModal(true);
  };

  const exportToExcel = () => {
    setExporting(true);
    try {
      // Create CSV content (compatible with Excel)
      const dateStr = new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

      let csvContent = "";

      // Header Section
      csvContent += "================================================================================\n";
      csvContent += "                    LAPORAN REKAPTULASI LABORATORIUM SILAB-NTDK\n";
      csvContent += "                           Institut Pertanian Bogor\n";
      csvContent += "================================================================================\n";
      csvContent += `Tanggal Export: ${dateStr}\n`;
      csvContent += "================================================================================\n";
      csvContent += "\n\n";

      // Rekaptulasi Analisis Section
      csvContent += "--------------------------------------------------------------------------------\n";
      csvContent += "                         REKAPTULASI ANALISIS SAMPEL\n";
      csvContent += "--------------------------------------------------------------------------------\n\n";
      csvContent += "No,Bulan,Jumlah Sampel Dianalisis,Rata-rata Waktu Pengerjaan,Keterangan\n";
      if (rekaptulasi.length > 0) {
        rekaptulasi.forEach((row, idx) => {
          csvContent += `${idx + 1},${row.bulan},${row.sampel},${row.rata_rata},${row.keterangan}\n`;
        });
      } else {
        csvContent += "-,Tidak ada data,-,-,-\n";
      }
      csvContent += "\n\n";

      // Rekap Detail Transaksi Section
      csvContent += "--------------------------------------------------------------------------------\n";
      csvContent += "                     REKAP DETAIL TRANSAKSI PER BULAN\n";
      csvContent += "--------------------------------------------------------------------------------\n\n";
      csvContent += "No,Bulan,Jumlah Transaksi,Total Pendapatan,Keterangan\n";
      if (rekapDetail.length > 0) {
        rekapDetail.forEach((row, idx) => {
          csvContent += `${idx + 1},${row.bulan},${row.transaksi},"${row.total}",${row.keterangan}\n`;
        });
      } else {
        csvContent += "-,Tidak ada data,-,-,-\n";
      }
      csvContent += "\n\n";

      // Aktivitas Bulanan Section
      if (chartData) {
        csvContent += "--------------------------------------------------------------------------------\n";
        csvContent += "                      PERSENTASE AKTIVITAS PER BULAN\n";
        csvContent += "--------------------------------------------------------------------------------\n\n";
        csvContent += "No,Bulan,Persentase Aktivitas (%)\n";
        chartData.labels.forEach((label, idx) => {
          csvContent += `${idx + 1},${label},${chartData.datasets[0].data[idx]}%\n`;
        });
        csvContent += "\n\n";
      }

      // Footer
      csvContent += "================================================================================\n";
      csvContent += "                     Dokumen ini digenerate secara otomatis\n";
      csvContent += `                    © ${new Date().getFullYear()} Laboratorium SILAB-NTDK IPB\n`;
      csvContent += "================================================================================\n";

      // Create and download file
      const BOM = "\uFEFF"; // UTF-8 BOM for Excel compatibility
      const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Laporan_SILAB_NTDK_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setShowExportModal(false);
    } catch (error) {
      console.error("Export error:", error);
      alert("Gagal mengekspor laporan. Silakan coba lagi.");
    }
    setExporting(false);
  };

  const exportToPDF = () => {
    setExporting(true);

    // Create print-friendly content
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan SILAB-NTDK</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #8D766B; padding-bottom: 20px; }
          .header h1 { color: #8D766B; margin: 0; font-size: 24px; }
          .header p { color: #666; margin: 5px 0; }
          .section { margin-bottom: 30px; }
          .section h2 { color: #6b5a52; font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-bottom: 15px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background-color: #8D766B; color: white; padding: 12px 8px; text-align: left; font-size: 12px; }
          td { padding: 10px 8px; border-bottom: 1px solid #eee; font-size: 12px; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .status-stabil { color: #198754; font-weight: 500; }
          .status-naik { color: #0d6efd; font-weight: 500; }
          .status-turun { color: #dc3545; font-weight: 500; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 11px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>LAPORAN LABORATORIUM SILAB-NTDK</h1>
          <p>Institut Pertanian Bogor</p>
          <p>Tanggal: ${new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
        </div>

        <div class="section">
          <h2>REKAPTULASI ANALISIS SAMPEL</h2>
          <table>
            <thead>
              <tr>
                <th>Bulan</th>
                <th>Jumlah Sampel Dianalisis</th>
                <th>Rata-rata Waktu Pengerjaan</th>
                <th>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              ${
                rekaptulasi.length > 0
                  ? rekaptulasi
                      .map(
                        (row) => `
                  <tr>
                    <td>${row.bulan}</td>
                    <td style="text-align: center; font-weight: bold;">${row.sampel}</td>
                    <td style="text-align: center;">${row.rata_rata}</td>
                    <td style="text-align: center;" class="${row.keterangan === "Stabil" ? "status-stabil" : "status-turun"}">${row.keterangan}</td>
                  </tr>
                `,
                      )
                      .join("")
                  : '<tr><td colspan="4" style="text-align: center;">Tidak ada data</td></tr>'
              }
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>REKAP DETAIL TRANSAKSI PER BULAN</h2>
          <table>
            <thead>
              <tr>
                <th>Bulan</th>
                <th>Jumlah Transaksi</th>
                <th>Total Pendapatan</th>
                <th>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              ${
                rekapDetail.length > 0
                  ? rekapDetail
                      .map(
                        (row) => `
                  <tr>
                    <td>${row.bulan}</td>
                    <td style="text-align: center; font-weight: bold;">${row.transaksi}</td>
                    <td style="text-align: center; font-weight: bold;">${row.total}</td>
                    <td style="text-align: center;" class="${row.keterangan === "Stabil" ? "status-stabil" : row.keterangan === "Naik" ? "status-naik" : "status-turun"}">${row.keterangan}</td>
                  </tr>
                `,
                      )
                      .join("")
                  : '<tr><td colspan="4" style="text-align: center;">Tidak ada data</td></tr>'
              }
            </tbody>
          </table>
        </div>

        ${
          chartData
            ? `
        <div class="section">
          <h2>AKTIVITAS LABORATORIUM PER BULAN</h2>
          <table>
            <thead>
              <tr>
                <th>Bulan</th>
                <th>Persentase Aktivitas</th>
              </tr>
            </thead>
            <tbody>
              ${chartData.labels
                .map(
                  (label, idx) => `
                <tr>
                  <td>${label}</td>
                  <td style="text-align: center;">${chartData.datasets[0].data[idx]}%</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </div>
        `
            : ""
        }

        <div class="footer">
          <p>Dokumen ini digenerate secara otomatis oleh sistem SILAB-NTDK</p>
          <p>© ${new Date().getFullYear()} Laboratorium SILAB-NTDK IPB</p>
        </div>
      </body>
      </html>
    `;

    // Open print window
    const printWindow = window.open("", "_blank");
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();

    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
      setExporting(false);
      setShowExportModal(false);
    }, 500);
  };

  const handleExport = () => {
    if (exportType === "excel") {
      exportToExcel();
    } else {
      exportToPDF();
    }
  };

  if (loading) {
    return (
      <NavbarLoginKepala>
        <div style={{ backgroundColor: customColors.lightGray, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Spinner animation="border" role="status" style={{ color: customColors.brown }}>
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </NavbarLoginKepala>
    );
  }

  return (
    <NavbarLoginKepala>
      <div style={{ backgroundColor: customColors.lightGray, minHeight: "100vh", paddingTop: "1rem", paddingBottom: "2rem" }}>
        <Container className="px-2 px-md-3">
          {/* CHART AKTIVITAS LAB */}
          <Row className="mb-3 mb-md-5">
            <Col lg={10} className="mx-auto">
              <Card className="border-0 shadow-sm" style={{ borderRadius: "15px", overflow: "hidden" }}>
                <Card.Body className="p-2 p-md-4">
                  <div className="mb-3">
                    <h6 className="fw-bold text-uppercase" style={{ color: customColors.brown, fontSize: "0.9rem" }}>
                      aktivitas lab
                    </h6>
                    <small className="text-muted">Persentase aktivitas per bulan</small>
                  </div>
                  <div style={{ height: "250px" }}>{chartData ? <Bar data={chartData} options={chartOptions} /> : <p>No data available</p>}</div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* REKAPTULASI */}
          <Row className="mb-3 mb-md-5">
            <Col lg={10} className="mx-auto">
              <h5 className="fw-bold mb-2 mb-md-3" style={{ color: "#333" }}>
                Rekaptulasi
              </h5>
              <Card className="border-0 shadow-sm" style={{ borderRadius: "15px", overflow: "hidden" }}>
                <Card.Body className="p-0">
                  <div className="table-responsive" style={{ overflowX: "auto" }}>
                    <Table className="mb-0" style={{ fontSize: "0.95rem", minWidth: "600px", width: "100%" }}>
                      <thead style={{ backgroundColor: "#f8f9fa" }}>
                        <tr>
                          <th className="py-2 py-md-3 px-2 px-md-4 fw-bold text-dark border-bottom" style={{ minWidth: "140px", width: "30%" }}>
                            Bulan
                          </th>
                          <th className="py-2 py-md-3 px-2 px-md-4 fw-bold text-dark border-bottom text-center" style={{ minWidth: "120px", width: "25%" }}>
                            Jumlah Sampel Dianalisis
                          </th>
                          <th className="py-2 py-md-3 px-2 px-md-4 fw-bold text-dark border-bottom text-center" style={{ minWidth: "130px", width: "25%" }}>
                            Rata-rata Waktu Pengerjaan
                          </th>
                          <th className="py-2 py-md-3 px-2 px-md-4 fw-bold text-dark border-bottom text-center" style={{ minWidth: "110px", width: "20%" }}>
                            Keterangan
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {rekaptulasi.length > 0 ? (
                          rekaptulasi.map((row, idx) => (
                            <tr key={idx}>
                              <td className="py-2 py-md-3 px-2 px-md-4 border-bottom" style={{ wordBreak: "break-word" }}>
                                {row.bulan}
                              </td>
                              <td className="py-2 py-md-3 px-2 px-md-4 border-bottom text-center fw-bold">{row.sampel}</td>
                              <td className="py-2 py-md-3 px-2 px-md-4 border-bottom text-center">{row.rata_rata}</td>
                              <td className="py-2 py-md-3 px-2 px-md-4 border-bottom text-center">
                                <span
                                  style={{
                                    color: row.keterangan === "Stabil" ? "#198754" : "#fd7e14",
                                    fontWeight: "500",
                                    fontSize: "0.85rem",
                                  }}
                                >
                                  {row.keterangan}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="py-3 py-md-4 px-2 px-md-4 text-center text-muted">
                              Tidak ada data
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* TABEL REKAP DETAIL */}
          <Row className="mb-3 mb-md-5">
            <Col lg={10} className="mx-auto">
              <h5 className="fw-bold mb-2 mb-md-3 text-center" style={{ color: "#333" }}>
                Tabel Rekap Detail (per Bulan)
              </h5>
              <Card className="border-0 shadow-sm" style={{ borderRadius: "15px", overflow: "hidden" }}>
                <Card.Body className="p-0">
                  <div className="table-responsive" style={{ overflowX: "auto" }}>
                    <Table className="mb-0" style={{ fontSize: "0.95rem", minWidth: "600px", width: "100%" }}>
                      <thead style={{ backgroundColor: "#f8f9fa" }}>
                        <tr>
                          <th className="py-2 py-md-3 px-2 px-md-4 fw-bold text-dark border-bottom" style={{ minWidth: "140px", width: "30%" }}>
                            Bulan
                          </th>
                          <th className="py-2 py-md-3 px-2 px-md-4 fw-bold text-dark border-bottom text-center" style={{ minWidth: "110px", width: "20%" }}>
                            Jumlah Transaksi
                          </th>
                          <th className="py-2 py-md-3 px-2 px-md-4 fw-bold text-dark border-bottom text-center" style={{ minWidth: "130px", width: "30%" }}>
                            Total Pendapatan
                          </th>
                          <th className="py-2 py-md-3 px-2 px-md-4 fw-bold text-dark border-bottom text-center" style={{ minWidth: "110px", width: "20%" }}>
                            Keterangan
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {rekapDetail.length > 0 ? (
                          rekapDetail.map((row, idx) => (
                            <tr key={idx}>
                              <td className="py-2 py-md-3 px-2 px-md-4 border-bottom" style={{ wordBreak: "break-word" }}>
                                {row.bulan}
                              </td>
                              <td className="py-2 py-md-3 px-2 px-md-4 border-bottom text-center fw-bold">{row.transaksi}</td>
                              <td className="py-2 py-md-3 px-2 px-md-4 border-bottom text-center fw-bold" style={{ fontSize: "0.85rem" }}>
                                {row.total}
                              </td>
                              <td className="py-2 py-md-3 px-2 px-md-4 border-bottom text-center">
                                <span
                                  style={{
                                    color: row.keterangan === "Stabil" ? "#198754" : row.keterangan === "Naik" ? "#0d6efd" : "#dc3545",
                                    fontWeight: "500",
                                    fontSize: "0.85rem",
                                  }}
                                >
                                  {row.keterangan}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="py-3 py-md-4 px-2 px-md-4 text-center text-muted">
                              Tidak ada data
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* EKSPOR LAPORAN BUTTON */}
          <Row className="mb-3 mb-md-5">
            <Col lg={10} className="mx-auto" style={{ textAlign: "center" }}>
              <Button
                onClick={handleExportLaporan}
                className="px-5 py-2 fw-bold rounded-pill shadow-sm"
                style={{
                  backgroundColor: customColors.brown,
                  color: "white",
                  border: "none",
                  fontSize: "0.95rem",
                }}
              >
                Ekspor Laporan
              </Button>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Export Modal */}
      <Modal show={showExportModal} onHide={() => setShowExportModal(false)} centered>
        <Modal.Header className="border-0 pb-0">
          <Modal.Title className="fw-bold" style={{ color: customColors.darkBrown }}>
            <Download size={20} className="me-2" />
            Ekspor Laporan
          </Modal.Title>
          <Button variant="link" className="p-0 text-muted" onClick={() => setShowExportModal(false)} style={{ textDecoration: "none" }}>
            <X size={24} />
          </Button>
        </Modal.Header>
        <Modal.Body className="pt-2">
          <p className="text-muted mb-4">Pilih format file untuk mengekspor laporan laboratorium:</p>

          <div className="d-flex flex-column gap-3">
            <Card className={`border-2 cursor-pointer ${exportType === "excel" ? "border-success" : "border-light"}`} style={{ cursor: "pointer", transition: "all 0.2s" }} onClick={() => setExportType("excel")}>
              <Card.Body className="d-flex align-items-center gap-3 py-3">
                <Form.Check type="radio" name="exportType" checked={exportType === "excel"} onChange={() => setExportType("excel")} className="m-0" />
                <div className="p-2 rounded" style={{ backgroundColor: "#E8F5E9" }}>
                  <FileSpreadsheet size={24} color="#198754" />
                </div>
                <div>
                  <h6 className="mb-0 fw-bold">Excel / CSV (.csv)</h6>
                  <small className="text-muted">Format spreadsheet, bisa dibuka di Excel</small>
                </div>
              </Card.Body>
            </Card>

            <Card className={`border-2 cursor-pointer ${exportType === "pdf" ? "border-danger" : "border-light"}`} style={{ cursor: "pointer", transition: "all 0.2s" }} onClick={() => setExportType("pdf")}>
              <Card.Body className="d-flex align-items-center gap-3 py-3">
                <Form.Check type="radio" name="exportType" checked={exportType === "pdf"} onChange={() => setExportType("pdf")} className="m-0" />
                <div className="p-2 rounded" style={{ backgroundColor: "#FFEBEE" }}>
                  <FileText size={24} color="#dc3545" />
                </div>
                <div>
                  <h6 className="mb-0 fw-bold">PDF Document (.pdf)</h6>
                  <small className="text-muted">Format dokumen siap cetak</small>
                </div>
              </Card.Body>
            </Card>
          </div>

          <div className="mt-4 p-3 rounded" style={{ backgroundColor: "#f8f9fa" }}>
            <small className="text-muted">
              <strong>Info:</strong> Laporan akan mencakup data Rekaptulasi Analisis, Rekap Detail Transaksi, dan Aktivitas Laboratorium.
            </small>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="outline-secondary" onClick={() => setShowExportModal(false)} className="rounded-pill px-4">
            Batal
          </Button>
          <Button onClick={handleExport} disabled={exporting} className="rounded-pill px-4 fw-bold" style={{ backgroundColor: customColors.brown, border: "none" }}>
            {exporting ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" /> Mengekspor...
              </>
            ) : (
              <>
                <Download size={16} className="me-2" /> Ekspor Sekarang
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <FooterSetelahLogin />
    </NavbarLoginKepala>
  );
};

export default MentoringKepala;
