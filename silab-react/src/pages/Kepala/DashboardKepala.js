import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import React, { useEffect, useState } from "react";
import { Row, Col, Card, Table, Button, Spinner } from "react-bootstrap";
import { FaClock, FaCheckCircle, FaFileAlt, FaExclamationTriangle } from "react-icons/fa";
import { useHistory } from "react-router-dom";
import NavbarLoginKepala from "./NavbarLoginKepala";
import { getAllBookings } from "../../services/BookingService";

function DashboardKepala() {
  useEffect(() => {
    document.title = "SILAB-NTDK - Dashboard Kepala";
  }, []);

  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    menungguVerifikasi: 0,
    sudahDisetujui: 0,
    laporanBulanIni: 0,
  });
  const [pendingBookings, setPendingBookings] = useState([]);
  const [dataAktivitas, setDataAktivitas] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await getAllBookings();
      const all = res?.data || [];

      // Hitung statistik
      const menungguVerifikasi = all.filter((b) => (b.status || "").toLowerCase() === "menunggu_verifikasi_kepala").length;

      const sudahDisetujui = all.filter((b) => (b.status || "").toLowerCase() === "selesai").length;

      // Laporan bulan ini
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      const laporanBulanIni = all.filter((b) => {
        const createdAt = new Date(b.created_at);
        return createdAt.getMonth() === thisMonth && createdAt.getFullYear() === thisYear;
      }).length;

      setStats({
        menungguVerifikasi,
        sudahDisetujui,
        laporanBulanIni,
      });

      // Ambil booking yang menunggu verifikasi kepala (max 5)
      const pending = all.filter((b) => (b.status || "").toLowerCase() === "menunggu_verifikasi_kepala").slice(0, 5);
      setPendingBookings(pending);

      // Generate data aktivitas bulanan
      const monthlyData = generateMonthlyData(all);
      setDataAktivitas(monthlyData);
    } catch (err) {
      console.error("Gagal mengambil data dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyData = (bookings) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const now = new Date();
    const currentMonth = now.getMonth();

    // Ambil 4 bulan terakhir
    const result = [];
    for (let i = 3; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const count = bookings.filter((b) => {
        const createdAt = new Date(b.created_at);
        return createdAt.getMonth() === monthIndex;
      }).length;
      result.push({ bulan: months[monthIndex], total: count });
    }
    return result;
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

  if (loading) {
    return (
      <NavbarLoginKepala>
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Memuat data...</p>
        </div>
      </NavbarLoginKepala>
    );
  }

  return (
    <NavbarLoginKepala>
      <div className="dashboard-wrapper">
        <h5 className="mb-4 fw-semibold">Selamat Datang!</h5>

        {/* ===== SUMMARY ===== */}
        <Row className="g-4 mb-4">
          <Col md={4}>
            <Card className="summary-card">
              <FaClock className="icon" />
              <p>Menunggu Verifikasi</p>
              <h3>{stats.menungguVerifikasi}</h3>
              <span>Laporan</span>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="summary-card">
              <FaCheckCircle className="icon" />
              <p>Sudah Disetujui</p>
              <h3>{stats.sudahDisetujui}</h3>
              <span>Hasil</span>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="summary-card">
              <FaFileAlt className="icon" />
              <p>Laporan Bulan Ini</p>
              <h3>{stats.laporanBulanIni}</h3>
              <span>Dokumen</span>
            </Card>
          </Col>
        </Row>

        {/* ===== ALERT / VERIFIKASI ===== */}
        {pendingBookings.length > 0 && (
          <div className="verifikasi-wrapper">
            <Card className="verifikasi-card">
              <FaExclamationTriangle className="verifikasi-icon" />
              <div className="verifikasi-content">
                <p>
                  Hasil analisis <strong>{pendingBookings[0]?.kode_batch || parseKodeSampel(pendingBookings[0]?.kode_sampel)}</strong> siap diverifikasi
                </p>
                <Button size="sm" className="verifikasi-btn" onClick={() => history.push("/kepala/dashboard/verifikasiKepala")}>
                  Verifikasi Sekarang
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* ===== CHART ===== */}
        <Card className="chart-card mb-5">
          <h6 className="fw-semibold mb-3">Statistik Aktivitas Laboratorium</h6>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dataAktivitas}>
              <XAxis dataKey="bulan" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#8d6e63" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* ===== TABLE ===== */}
        <Card className="table-card shadow-sm">
          <Card.Header className="table-header">Sampel Menunggu Verifikasi Akhir</Card.Header>

          <Table hover responsive className="mb-0 custom-table">
            <thead>
              <tr>
                <th>Kode Batch</th>
                <th>Jenis Analisis</th>
                <th>Tanggal Masuk</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {pendingBookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-muted">
                    Tidak ada sampel yang menunggu verifikasi akhir
                  </td>
                </tr>
              ) : (
                pendingBookings.map((item) => (
                  <tr key={item.id}>
                    <td className="fw-semibold">{item.kode_batch || parseKodeSampel(item.kode_sampel)}</td>
                    <td>{item.jenis_analisis || item.jenis || "-"}</td>
                    <td>{item.created_at ? new Date(item.created_at).toLocaleDateString("id-ID") : "-"}</td>
                    <td>
                      <span className="status-badge menunggu">Menunggu Verifikasi</span>
                    </td>
                    <td>
                      <Button size="sm" variant="primary" style={{ backgroundColor: "#45352F", borderColor: "#45352F" }} onClick={() => history.push(`/kepala/dashboard/verifikasiKepala/lihatHasilPdfKepala/${item.id}`)}>
                        Lihat Detail
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card>

        {/* ===== INLINE CSS (NYATU) ===== */}
        <style>{`
          .dashboard-wrapper {
            padding: 32px 40px;
            max-width: 1200px;
            margin: 0 auto;
          }

          .summary-card {
            text-align: center;
            padding: 32px 20px;
            border-radius: 20px;
            border: none;
            background: #ffffff;
            box-shadow: 0 8px 18px rgba(0,0,0,0.08);
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }

          .summary-card .icon {
            font-size: 42px;
            color: #5d4037;
            margin-bottom: 16px;
          }

          .summary-card h3 {
            margin: 6px 0;
            color: #3e2723;
            font-size: 1.8rem;
          }

          .alert-card {
            display: flex;
            align-items: center;
            gap: 18px;
            padding: 24px;
            border-radius: 18px;
            background: #fff3e0;
            border: none;
            box-shadow: 0 6px 16px rgba(0,0,0,0.08);
          }

          .chart-card {
            padding: 24px;
            border-radius: 20px;
            border: none;
            box-shadow: 0 6px 16px rgba(0,0,0,0.08);
          }

          .table-card {
            border-radius: 20px;
            overflow: hidden;
          }
          .verifikasi-wrapper {
            display: flex;
            justify-content: center;
            margin-bottom: 24px; 
            }


            .verifikasi-card {
            width: 100%;
            max-width: 500px;
            padding: 28px 32px;
            border-radius: 22px;
            border: none;
            background: linear-gradient(135deg, #8d6e63, #6d4c41);
            color: #fff;
            box-shadow: 0 10px 24px rgba(0,0,0,0.18);
            display: flex;
            align-items: center;
            gap: 20px;
            }

        .verifikasi-icon {
        font-size: 34px;
        color: #ffe0b2;
        flex-shrink: 0;
        }

        .verifikasi-content p {
        margin-bottom: 12px;
        font-size: 0.95rem;
        }

        .verifikasi-btn {
        background: #3e2723 !important;
        border: none !important;
        padding: 6px 16px;
        border-radius: 20px;
        font-weight: 500;
        }

        .verifikasi-btn:hover {
        background: #2e1b18 !important;
        }
        /* ===== TABLE COKLAT ===== */
        .table-card {
        border-radius: 20px;
        overflow: hidden;
        border: none;
        }

        .table-header {
        background: linear-gradient(135deg, #6d4c41, #4e342e);
        color: #fff;
        font-weight: 600;
        padding: 18px 24px;
        border-bottom: none;
        }

        .custom-table {
        background: #fff;
        }

        .custom-table thead th {
        background: #efebe9;
        color: #4e342e;
        font-weight: 600;
        border: none;
        padding: 14px 18px;
        }

        .custom-table tbody td {
        padding: 14px 18px;
        vertical-align: middle;
        border-top: 1px solid #d7ccc8;
        color: #4e342e;
        }

        .custom-table tbody tr:hover {
        background: #f3ece9;
        }

        /* ===== STATUS BADGE ===== */
        .status-badge {
        padding: 6px 14px;
        border-radius: 14px;
        font-size: 0.75rem;
        font-weight: 600;
        display: inline-block;
        }

        .status-badge.selesai {
        background: #a1887f;
        color: #3e2723;
        }

        .status-badge.menunggu {
        background: #d7ccc8;
        color: #4e342e;
        }


        `}</style>
      </div>
    </NavbarLoginKepala>
  );
}

export default DashboardKepala;
