import React, { useState, useEffect } from "react";
import NavbarLoginTeknisi from "./NavbarLoginTeknisi";
import { getAllBookings } from "../../services/BookingService";
import FooterSetelahLogin from "../FooterSetelahLogin";
import "../../css/DashboardTeknisi.css";
import { message, Card, Row, Col, Statistic, Input, Tag, Table } from "antd";
import { CheckCircleOutlined, SyncOutlined, HourglassOutlined, SearchOutlined, ExperimentOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const DashboardTeknisi = () => {
  useEffect(() => {
    document.title = "SILAB-NTDK - Dashboard Teknisi";
  }, []);

  const [dataBookings, setDataBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getAllBookings();
      // Tampilkan semua status booking, tanpa filter
      setDataBookings(response.data || []);
    } catch (error) {
      console.error(error);
      message.error("Gagal memuat data dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const generateSampleCodes = (booking) => {
    if (!booking.kode_sampel) return [];
    try {
      if (Array.isArray(booking.kode_sampel)) return booking.kode_sampel;
      if (typeof booking.kode_sampel === "string") {
        const parsed = JSON.parse(booking.kode_sampel);
        return Array.isArray(parsed) ? parsed : [booking.kode_sampel];
      }
      return [booking.kode_sampel];
    } catch {
      return [booking.kode_sampel];
    }
  };

  // Statistik Calculation - hitung berdasarkan status yang relevan untuk teknisi
  const stats = {
    total: dataBookings.length,
    // Proses: sampel yang sedang dikerjakan teknisi
    proses: dataBookings.filter((i) => {
      const s = (i.status || "").toLowerCase();
      return s === "proses" || s === "draft" || s === "selesai_di_analisis";
    }).length,
    // Menunggu: sampel yang menunggu diproses (disetujui tapi belum dikerjakan)
    menunggu: dataBookings.filter((i) => {
      const s = (i.status || "").toLowerCase();
      return s === "menunggu" || s === "disetujui";
    }).length,
    // Selesai: hanya status 'selesai' persis dari database
    selesai: dataBookings.filter((i) => {
      const s = (i.status || "").toLowerCase();
      return s === "selesai";
    }).length,
    // Ditolak: hanya status 'ditolak' persis dari database
    ditolak: dataBookings.filter((i) => {
      const s = (i.status || "").toLowerCase();
      return s === "ditolak";
    }).length,
  };

  const filteredData = dataBookings.filter((item) => {
    const query = search.toLowerCase();
    const userName = item.user ? (item.user.full_name || item.user.name).toLowerCase() : "";
    const sampleCodes = generateSampleCodes(item).join(" ").toLowerCase();
    return sampleCodes.includes(query) || userName.includes(query) || item.jenis_analisis.toLowerCase().includes(query) || item.status.toLowerCase().includes(query);
  });

  // Ant Design Table Columns with responsive design
  const columns = [
    {
      title: "No",
      dataIndex: "index",
      key: "index",
      render: (text, record, index) => index + 1,
      width: 60,
      responsive: ["md"], // Hide on mobile
    },
    {
      title: "Kode Batch",
      key: "kode_batch",
      render: (_, record) => (
        <div>
          <div className="fw-bold text-primary">{record.kode_batch || "-"}</div>
          {/* Show additional info on mobile */}
          <div className="d-md-none mt-1">
            <small className="text-muted">{record.user?.full_name || record.user?.name || "Guest"}</small>
            <br />
            <Tag color="blue" size="small" className="mt-1">
              {record.jenis_analisis}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: "Klien",
      key: "user",
      render: (_, record) => record.user?.full_name || record.user?.name || "Guest",
      responsive: ["md"], // Hide on mobile
    },
    {
      title: "Jenis Analisis",
      dataIndex: "jenis_analisis",
      key: "jenis_analisis",
      render: (text) => <Tag color="blue">{text}</Tag>,
      responsive: ["lg"], // Hide on mobile and tablet
    },
    {
      title: "Tanggal Kirim",
      dataIndex: "tanggal_kirim",
      key: "tanggal_kirim",
      render: (date) => <span className="d-none d-md-inline">{dayjs(date).format("DD MMM YYYY")}</span>,
      responsive: ["md"], // Hide on mobile
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status, record) => {
        let color = "default";
        let icon = <HourglassOutlined />;

        switch (status.toLowerCase()) {
          case "selesai":
            color = "success";
            icon = <CheckCircleOutlined />;
            break;
          case "proses":
            color = "processing";
            icon = <SyncOutlined spin />;
            break;
          case "menunggu":
            color = "warning";
            break;
          case "disetujui":
            color = "blue";
            break;
          default:
            color = "default";
        }

        let label = status;
        if (status.toLowerCase() === "menunggu_verifikasi_kepala") label = "Menunggu Verifikasi";
        else label = status.toUpperCase().replace("_", " ");
        return (
          <div>
            <Tag icon={icon} color={color} className="px-3 py-1 rounded-pill">
              {label}
            </Tag>
            {/* Show date on mobile */}
            <div className="d-md-none mt-1">
              <small className="text-muted">📅 {dayjs(record.tanggal_kirim).format("DD/MM/YY")}</small>
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <NavbarLoginTeknisi>
      <div style={{ background: "#f8f9fa", minHeight: "100vh", padding: "40px 20px" }}>
        <div className="container">
          {/* Header & Stats Section */}
          <div className="mb-4">
            <h3 className="fw-bold text-dark mb-1">Dashboard Teknisi</h3>
            <p className="text-muted">Pantau dan kelola analisis sampel laboratorium.</p>
          </div>

          <Row gutter={[16, 16]} className="mb-5">
            <Col xs={24} sm={12} lg={6}>
              <Card className="shadow-sm border-4">
                <Statistic title="Total Penugasan" value={stats.total} prefix={<ExperimentOutlined />} />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="shadow-sm border-4">
                <Statistic title="Menunggu Persetujuan" value={stats.menunggu} styles={{ content: { color: "#faad14" } }} />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="shadow-sm border-4">
                <Statistic title="Dalam Proses" value={stats.proses} styles={{ content: { color: "#1890ff" } }} />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="shadow-sm border-4">
                <Statistic title="Selesai" value={stats.selesai} styles={{ content: { color: "#52c41a" } }} />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="shadow-sm border-4">
                <Statistic title="Ditolak" value={stats.ditolak} styles={{ content: { color: "#ff4d4f" } }} />
              </Card>
            </Col>
          </Row>

          {/* Table Section */}
          <Card className="shadow-sm" style={{ borderRadius: "15px", border: "none" }}>
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
              <h5 className="fw-bold m-0">Daftar Analisis Sampel</h5>
              <Input
                placeholder="Cari sampel, klien, atau status..."
                prefix={<SearchOutlined className="text-muted" />}
                style={{ minWidth: 200, maxWidth: 300, width: "100%" }}
                className="rounded-pill"
                onChange={(e) => setSearch(e.target.value)}
                allowClear
              />
            </div>

            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: false,
                responsive: true,
                showQuickJumper: true,
              }}
              className="custom-responsive-table"
              scroll={isMobile ? undefined : { x: 600 }}
              size="middle"
            />
          </Card>
        </div>
      </div>
      <FooterSetelahLogin />
    </NavbarLoginTeknisi>
  );
};

export default DashboardTeknisi;
