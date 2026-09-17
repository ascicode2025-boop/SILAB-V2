import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Form, Button, Modal, Spinner, Badge } from "react-bootstrap";
import { FaFilePdf, FaFileExcel, FaSearch, FaMedal, FaCheckCircle, FaDownload, FaTimes, FaFileAlt } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import NavbarLoginKepala from "./NavbarLoginKepala";
import FooterSetelahLogin from "../FooterSetelahLogin";
import { getRentals } from "../../services/InstrumentRentalService";
import { getInstruments } from "../../services/InstrumentService";
import "@fontsource/poppins";

export default function LaporanPeminjamanKepala() {
  const [activeTab, setActiveTab] = useState("peminjaman"); // 'peminjaman' | 'pengembalian' | 'kondisi' | 'favorit'
  const [searchTerm, setSearchTerm] = useState("");
  const [periode, setPeriode] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");

  const [exportModal, setExportModal] = useState({ show: false, format: "PDF" });
  const [successPopup, setSuccessPopup] = useState({ show: false, title: "", message: "", filename: "" });
  const [isExporting, setIsExporting] = useState(false);
  
  const [rentals, setRentals] = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "SILAB-NTDK - Laporan Peminjaman";
    
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [rentalsData, instrumentsData] = await Promise.all([
          getRentals(),
          getInstruments()
        ]);
        setRentals(rentalsData.data || []);
        setInstruments(instrumentsData.data || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Map rentals to table format
  const mappedRentals = rentals.map((item) => {
    // Calculate status text
    const statusText = item.status === "menunggu_pengembalian" 
      ? "Menunggu Pengembalian" 
      : item.status === "siap_diambil"
      ? "Siap Diambil"
      : item.status.charAt(0).toUpperCase() + item.status.slice(1);

    return {
      noPengajuan: `PJ${String(item.id).padStart(3, "0")}`,
      namaPeminjam: item.user?.name || "Unknown",
      alat: item.instruments?.map(i => i.nama_alat).join(", ") || "-",
      jumlah: item.instruments?.length || 0,
      tglPinjam: item.tanggal_peminjaman,
      tglKembali: item.tanggal_pengembalian,
      status: statusText,
      rawStatus: item.status,
    };
  });

  const filteredPeminjaman = mappedRentals.filter((item) => {
    const matchSearch =
      item.namaPeminjam.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.alat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.noPengajuan.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "Semua" || item.rawStatus.toLowerCase().includes(statusFilter.toLowerCase());
    return matchSearch && matchStatus;
  });

  const filteredPengembalian = mappedRentals.filter((item) => {
    // Only show returned or pending return rentals in pengembalian
    if (!["selesai", "dikembalikan", "diproses", "menunggu_pengembalian"].includes(item.rawStatus.toLowerCase())) return false;
    
    const matchSearch =
      item.namaPeminjam.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.alat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.noPengajuan.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "Semua" || item.rawStatus.toLowerCase().includes(statusFilter.toLowerCase());
    return matchSearch && matchStatus;
  });

  const mappedKondisi = instruments.map((item) => ({
    kodeAlat: `ALT-${String(item.id).padStart(3, "0")}`,
    namaAlat: item.nama_alat,
    statusKesiapan: item.status === "tersedia" ? "Tersedia" : "Dipinjam",
  }));

  const filteredKondisi = mappedKondisi.filter((item) => {
    return (
      item.namaAlat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kodeAlat.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Calculate favorite instruments
  const alatCount = {};
  rentals.forEach(r => {
    r.instruments?.forEach(i => {
      alatCount[i.nama_alat] = (alatCount[i.nama_alat] || 0) + 1;
    });
  });

  const mappedFavorit = Object.keys(alatCount).map((namaAlat, idx) => ({
    id: idx + 1,
    namaAlat,
    totalPeminjaman: alatCount[namaAlat]
  })).sort((a, b) => b.totalPeminjaman - a.totalPeminjaman);

  const filteredFavorit = mappedFavorit.filter((item) => {
    return item.namaAlat.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  const TOP_3_ALAT = mappedFavorit.slice(0, 3).map((item, idx) => ({
    rank: idx + 1,
    name: item.namaAlat,
    count: item.totalPeminjaman,
    color: idx === 0 ? "#D4AF37" : idx === 1 ? "#A6B2BA" : "#CD7F32",
    ribbon: idx === 0 ? "#E74C3C" : idx === 1 ? "#4A90E2" : "#E67E22",
  }));

  // Get current active data count and title
  const getActiveDataInfo = () => {
    let title = "Tabel Peminjaman";
    let count = filteredPeminjaman.length;
    if (activeTab === "pengembalian") {
      title = "Tabel Pengembalian";
      count = filteredPengembalian.length;
    } else if (activeTab === "kondisi") {
      title = "Tabel Kondisi Alat";
      count = filteredKondisi.length;
    } else if (activeTab === "favorit") {
      title = "Tabel Alat Terfavorit";
      count = filteredFavorit.length;
    }
    return { title, count };
  };

  // Open Export Modal
  const handleOpenExportModal = (format) => {
    setExportModal({ show: true, format });
  };

  // Execute PDF Export
  const executeExportPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("LAPORAN PEMINJAMAN ALAT LABORATORIUM", 14, 18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Kategori: ${activeTab.toUpperCase()} | Periode: ${periode} | Dicetak: ${new Date().toLocaleDateString("id-ID")}`, 14, 25);

    if (activeTab === "peminjaman") {
      const tableRows = filteredPeminjaman.map((row, idx) => [
        idx + 1,
        row.noPengajuan,
        row.namaPeminjam,
        row.alat,
        row.jumlah,
        row.tglPinjam,
        row.tglKembali,
        row.status,
      ]);
      autoTable(doc, {
        head: [["No", "No Pengajuan", "Nama Peminjam", "Alat", "Jumlah", "Tgl Pinjam", "Tgl Kembali", "Status"]],
        body: tableRows,
        startY: 32,
        theme: "grid",
        headStyles: { fillColor: [158, 136, 128] },
      });
    } else if (activeTab === "pengembalian") {
      const tableRows = filteredPengembalian.map((row, idx) => [
        idx + 1,
        row.noPengajuan,
        row.namaPeminjam,
        row.alat,
        row.jumlah,
        row.tglKembali,
        row.status,
      ]);
      autoTable(doc, {
        head: [["No", "No Pengajuan", "Nama Peminjam", "Alat", "Jumlah", "Tgl Kembali", "Status"]],
        body: tableRows,
        startY: 32,
        theme: "grid",
        headStyles: { fillColor: [158, 136, 128] },
      });
    } else if (activeTab === "kondisi") {
      const tableRows = filteredKondisi.map((row, idx) => [
        idx + 1,
        row.namaAlat,
        row.statusKesiapan,
      ]);
      autoTable(doc, {
        head: [["No", "Nama Alat", "Status Ketersediaan"]],
        body: tableRows,
        startY: 32,
        theme: "grid",
        headStyles: { fillColor: [158, 136, 128] },
      });
    } else {
      const tableRows = filteredFavorit.map((row, idx) => [idx + 1, row.namaAlat, row.totalPeminjaman]);
      autoTable(doc, {
        head: [["No", "Nama Alat", "Total Peminjaman"]],
        body: tableRows,
        startY: 32,
        theme: "grid",
        headStyles: { fillColor: [158, 136, 128] },
      });
    }

    const filename = `Laporan_Peminjaman_${activeTab}_${Date.now()}.pdf`;
    doc.save(filename);
    return filename;
  };

  // Confirm and Execute Export
  const handleConfirmExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      let generatedFile = executeExportPDF();
      
      setIsExporting(false);
      setExportModal({ show: false, format: "PDF" });
      setSuccessPopup({
        show: true,
        title: "Ekspor Berhasil!",
        message: `File laporan peminjaman alat dengan format PDF telah berhasil dibuat dan diunduh ke perangkat Anda.`,
        filename: generatedFile,
      });
    }, 400);
  };

  return (
    <NavbarLoginKepala>
      <div
        style={{
          backgroundColor: "#FAF8F7",
          minHeight: "calc(100vh - 70px)",
          padding: "24px 32px 48px",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        <Container fluid className="px-0">
          {/* ===== 1. TOP BAR: EXPORT BUTTONS & DROPDOWN FILTERS ===== */}
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div className="d-flex align-items-center gap-2">
              <Button
                onClick={() => handleOpenExportModal("PDF")}
                style={{
                  backgroundColor: "#9E8880",
                  borderColor: "#9E8880",
                  color: "#FFFFFF",
                  borderRadius: "8px",
                  padding: "8px 18px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 2px 6px rgba(158, 136, 128, 0.3)",
                }}
              >
                <FaFilePdf size={16} />
                Ekspor PDF
              </Button>
            </div>

            {/* Filters on Right */}
            <div className="d-flex align-items-center gap-3">
              {/* Periode Filter */}
              <div className="d-flex align-items-center gap-2">
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#4A3F3B" }}>Periode</span>
                <Form.Select
                  value={periode}
                  onChange={(e) => setPeriode(e.target.value)}
                  style={{
                    borderRadius: "20px",
                    fontSize: "0.85rem",
                    padding: "6px 28px 6px 14px",
                    borderColor: "#D6C7C2",
                    backgroundColor: "#FFFFFF",
                    color: "#3E2723",
                    fontWeight: 500,
                    width: "auto",
                  }}
                >
                  <option value="Hari ini">Hari ini</option>
                  <option value="Minggu ini">Minggu ini</option>
                  <option value="Bulan ini">Bulan ini</option>
                  <option value="Tahun ini">Tahun ini</option>
                  <option value="Semua">Semua</option>
                </Form.Select>
              </div>

              {/* Status Filter */}
              <div className="d-flex align-items-center gap-2">
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#4A3F3B" }}>Status</span>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    borderRadius: "20px",
                    fontSize: "0.85rem",
                    padding: "6px 28px 6px 14px",
                    borderColor: "#D6C7C2",
                    backgroundColor: "#FFFFFF",
                    color: "#3E2723",
                    fontWeight: 500,
                    width: "auto",
                  }}
                >
                  <option value="Semua">Semua</option>
                  {activeTab === "peminjaman" && (
                    <>
                      <option value="Disetujui">Disetujui</option>
                      <option value="Diverifikasi">Diverifikasi</option>
                      <option value="Menunggu">Menunggu</option>
                      <option value="Ditolak">Ditolak</option>
                    </>
                  )}
                  {activeTab === "pengembalian" && (
                    <>
                      <option value="Selesai">Selesai</option>
                      <option value="Diproses">Diproses</option>
                    </>
                  )}
                  {activeTab !== "peminjaman" && activeTab !== "pengembalian" && (
                    <>
                      <option value="Disetujui">Disetujui</option>
                      <option value="Selesai">Selesai</option>
                    </>
                  )}
                </Form.Select>
              </div>
            </div>
          </div>

          {/* ===== 2. TAB PILLS ===== */}
          <div className="d-flex flex-wrap gap-2 mb-4">
            {[
              { key: "peminjaman", label: "Peminjaman" },
              { key: "pengembalian", label: "Pengembalian" },
              { key: "kondisi", label: "Kondisi Alat" },
              { key: "favorit", label: "Alat terfavorit" },
            ].map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.key);
                    setSearchTerm("");
                  }}
                  style={{
                    backgroundColor: isActive ? "#D5CDC9" : "#FFFFFF",
                    color: isActive ? "#2E2421" : "#5A4E4A",
                    border: isActive ? "none" : "1px solid #E0D7D3",
                    borderRadius: "24px",
                    padding: "6px 22px",
                    fontSize: "0.88rem",
                    fontWeight: isActive ? 700 : 500,
                    cursor: "pointer",
                    transition: "all 0.2s ease-in-out",
                    boxShadow: isActive ? "0 2px 8px rgba(158, 136, 128, 0.3)" : "none",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ===== 3. TAB 1: TABEL PEMINJAMAN ===== */}
          {activeTab === "peminjaman" && (
            <Card className="border-0 shadow-sm p-4" style={{ borderRadius: "18px", backgroundColor: "#FFFFFF" }}>
              <div className="mb-3">
                <h5 style={{ fontWeight: 800, color: "#3E2723", fontSize: "1.25rem", marginBottom: "4px" }}>
                  Tabel Peminjaman
                </h5>
                <p className="text-muted mb-3" style={{ fontSize: "0.88rem" }}>
                  Tabel Yang Berisi Daftar Seluruh Peminjaman Alat Lab.
                </p>

                {/* Search Bar */}
                <div style={{ position: "relative", width: "220px", marginBottom: "16px" }}>
                  <Form.Control
                    type="text"
                    placeholder="Cari..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      borderRadius: "24px",
                      fontSize: "0.85rem",
                      padding: "6px 36px 6px 16px",
                      borderColor: "#DCD0CB",
                    }}
                  />
                  <FaSearch
                    size={13}
                    style={{
                      position: "absolute",
                      right: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#A8958F",
                      pointerEvents: "none",
                    }}
                  />
                </div>
              </div>

              <div className="table-responsive">
                <Table hover className="mb-0 align-middle text-center" style={{ minWidth: "750px" }}>
                  <thead style={{ borderBottom: "2px solid #F0ECE9" }}>
                    <tr>
                      <th className="py-3" style={{ fontWeight: 700, color: "#2E2421", fontSize: "0.92rem", width: "50px" }}>No</th>
                      <th className="py-3" style={{ fontWeight: 700, color: "#2E2421", fontSize: "0.92rem" }}>No Pengajuan</th>
                      <th className="py-3" style={{ fontWeight: 700, color: "#2E2421", fontSize: "0.92rem" }}>Nama Peminjam</th>
                      <th className="py-3" style={{ fontWeight: 700, color: "#2E2421", fontSize: "0.92rem" }}>Alat</th>
                      <th className="py-3" style={{ fontWeight: 700, color: "#2E2421", fontSize: "0.92rem" }}>jumlah</th>
                      <th className="py-3" style={{ fontWeight: 700, color: "#2E2421", fontSize: "0.92rem" }}>Tanggal Pinjam</th>
                      <th className="py-3" style={{ fontWeight: 700, color: "#2E2421", fontSize: "0.92rem" }}>Tanggal Kembali</th>
                      <th className="py-3" style={{ fontWeight: 700, color: "#2E2421", fontSize: "0.92rem" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPeminjaman.map((item, idx) => {
                      let badgeBg = "#EFE3DC";
                      let textColor = "#75564D";
                      if (item.status === "Diverifikasi") {
                        badgeBg = "#64B5F6";
                        textColor = "#FFFFFF";
                      } else if (item.status === "Disetujui") {
                        badgeBg = "#85D88B";
                        textColor = "#1B5E20";
                      }

                      return (
                        <tr key={item.id} style={{ borderBottom: "1px solid #F8F5F4" }}>
                          <td className="py-3" style={{ color: "#4A3F3B", fontSize: "0.9rem" }}>{idx + 1}</td>
                          <td className="py-3 fw-medium" style={{ color: "#4A3F3B", fontSize: "0.9rem" }}>{item.noPengajuan}</td>
                          <td className="py-3" style={{ color: "#4A3F3B", fontSize: "0.9rem" }}>{item.namaPeminjam}</td>
                          <td className="py-3" style={{ color: "#4A3F3B", fontSize: "0.9rem" }}>{item.alat}</td>
                          <td className="py-3" style={{ color: "#4A3F3B", fontSize: "0.9rem" }}>{item.jumlah}</td>
                          <td className="py-3" style={{ color: "#4A3F3B", fontSize: "0.9rem" }}>{item.tglPinjam}</td>
                          <td className="py-3" style={{ color: "#4A3F3B", fontSize: "0.9rem" }}>{item.tglKembali}</td>
                          <td className="py-3">
                            <span
                              style={{
                                backgroundColor: badgeBg,
                                color: textColor,
                                borderRadius: "20px",
                                padding: "4px 18px",
                                fontSize: "0.8rem",
                                fontWeight: 600,
                                display: "inline-block",
                              }}
                            >
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            </Card>
          )}

          {/* ===== 4. TAB 2: TABEL PENGEMBALIAN ===== */}
          {activeTab === "pengembalian" && (
            <Card className="border-0 shadow-sm p-4" style={{ borderRadius: "18px", backgroundColor: "#FFFFFF" }}>
              <div className="mb-3">
                <h5 style={{ fontWeight: 800, color: "#3E2723", fontSize: "1.25rem", marginBottom: "4px" }}>
                  Tabel Pengembalian
                </h5>
                <p className="text-muted mb-3" style={{ fontSize: "0.88rem" }}>
                  Tabel Yang Menampilkan histori pengembalian alat.
                </p>

                {/* Search Bar */}
                <div style={{ position: "relative", width: "220px", marginBottom: "16px" }}>
                  <Form.Control
                    type="text"
                    placeholder="Cari..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      borderRadius: "24px",
                      fontSize: "0.85rem",
                      padding: "6px 36px 6px 16px",
                      borderColor: "#DCD0CB",
                    }}
                  />
                  <FaSearch
                    size={13}
                    style={{
                      position: "absolute",
                      right: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#A8958F",
                      pointerEvents: "none",
                    }}
                  />
                </div>
              </div>

              <div className="table-responsive">
                <Table hover className="mb-0 align-middle text-center" style={{ minWidth: "750px" }}>
                  <thead style={{ borderBottom: "2px solid #F0ECE9" }}>
                    <tr>
                      <th className="py-3" style={{ fontWeight: 700, color: "#2E2421", fontSize: "0.92rem", width: "50px" }}>No</th>
                      <th className="py-3" style={{ fontWeight: 700, color: "#2E2421", fontSize: "0.92rem" }}>No Pengajuan</th>
                      <th className="py-3" style={{ fontWeight: 700, color: "#2E2421", fontSize: "0.92rem" }}>Nama Peminjam</th>
                      <th className="py-3" style={{ fontWeight: 700, color: "#2E2421", fontSize: "0.92rem" }}>Alat</th>
                      <th className="py-3" style={{ fontWeight: 700, color: "#2E2421", fontSize: "0.92rem" }}>jumlah</th>
                      <th className="py-3" style={{ fontWeight: 700, color: "#2E2421", fontSize: "0.92rem" }}>Tanggal Kembali</th>
                      <th className="py-3" style={{ fontWeight: 700, color: "#2E2421", fontSize: "0.92rem" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPengembalian.map((item, idx) => {
                      const isSelesai = item.status.toLowerCase() === "selesai" || item.status.toLowerCase() === "dikembalikan";
                      return (
                        <tr key={idx} style={{ borderBottom: "1px solid #F8F5F4" }}>
                          <td className="py-3" style={{ color: "#4A3F3B", fontSize: "0.9rem" }}>{idx + 1}</td>
                          <td className="py-3 fw-medium" style={{ color: "#4A3F3B", fontSize: "0.9rem" }}>{item.noPengajuan}</td>
                          <td className="py-3" style={{ color: "#4A3F3B", fontSize: "0.9rem" }}>{item.namaPeminjam}</td>
                          <td className="py-3" style={{ color: "#4A3F3B", fontSize: "0.9rem" }}>{item.alat}</td>
                          <td className="py-3" style={{ color: "#4A3F3B", fontSize: "0.9rem" }}>{item.jumlah}</td>
                          <td className="py-3" style={{ color: "#4A3F3B", fontSize: "0.9rem" }}>{item.tglKembali}</td>
                          <td className="py-3">
                            <span
                              style={{
                                backgroundColor: isSelesai ? "#E8F8F5" : "#FFF3E0",
                                color: isSelesai ? "#27AE60" : "#E67E22",
                                borderRadius: "20px",
                                padding: "4px 18px",
                                fontSize: "0.8rem",
                                fontWeight: 600,
                                display: "inline-block",
                              }}
                            >
                              {item.status === "menunggu_pengembalian" ? "Menunggu Pengembalian" : item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            </Card>
          )}

          {/* ===== 5. TAB 3: TABEL KONDISI ALAT ===== */}
          {activeTab === "kondisi" && (
            <Card className="border-0 shadow-sm p-4" style={{ borderRadius: "18px", backgroundColor: "#FFFFFF" }}>
              <div className="mb-3">
                <h5 style={{ fontWeight: 800, color: "#3E2723", fontSize: "1.25rem", marginBottom: "4px" }}>
                  Tabel Kondisi Alat
                </h5>
                <p className="text-muted mb-3" style={{ fontSize: "0.88rem" }}>
                  Tabel Yang Menampilkan status kondisi seluruh alat laboratorium.
                </p>

                {/* Search Bar */}
                <div style={{ position: "relative", width: "220px", marginBottom: "16px" }}>
                  <Form.Control
                    type="text"
                    placeholder="Cari..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      borderRadius: "24px",
                      fontSize: "0.85rem",
                      padding: "6px 36px 6px 16px",
                      borderColor: "#DCD0CB",
                    }}
                  />
                  <FaSearch
                    size={13}
                    style={{
                      position: "absolute",
                      right: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#A8958F",
                      pointerEvents: "none",
                    }}
                  />
                </div>
              </div>

              <div className="table-responsive">
                <Table hover className="mb-0 align-middle text-center" style={{ minWidth: "750px" }}>
                  <thead style={{ borderBottom: "2px solid #F0ECE9" }}>
                    <tr>
                      <th className="py-3" style={{ fontWeight: 700, color: "#2E2421", fontSize: "0.92rem", width: "50px" }}>No</th>
                      <th className="py-3" style={{ fontWeight: 700, color: "#2E2421", fontSize: "0.92rem" }}>Kode Alat</th>
                      <th className="py-3" style={{ fontWeight: 700, color: "#2E2421", fontSize: "0.92rem" }}>Nama Alat</th>
                      <th className="py-3" style={{ fontWeight: 700, color: "#2E2421", fontSize: "0.92rem" }}>Status Kesiapan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredKondisi.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #F8F5F4" }}>
                        <td className="py-3" style={{ color: "#4A3F3B", fontSize: "0.9rem" }}>{idx + 1}</td>
                        <td className="py-3 fw-medium" style={{ color: "#4A3F3B", fontSize: "0.9rem" }}>{item.kodeAlat}</td>
                        <td className="py-3" style={{ color: "#4A3F3B", fontSize: "0.9rem" }}>{item.namaAlat}</td>
                        <td className="py-3">
                          <span
                            style={{
                              backgroundColor: item.statusKesiapan === "Tersedia" ? "#E8F8F5" : "#FDEAEA",
                              color: item.statusKesiapan === "Tersedia" ? "#27AE60" : "#C0392B",
                              borderRadius: "20px",
                              padding: "4px 16px",
                              fontSize: "0.8rem",
                              fontWeight: 600,
                              display: "inline-block",
                            }}
                          >
                            {item.statusKesiapan}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card>
          )}

          {/* ===== 6. TAB 4: TABEL ALAT TERFAVORIT ===== */}
          {activeTab === "favorit" && (
            <Row className="g-4">
              {/* Left Side: Table */}
              <Col xs={12} lg={8}>
                <Card className="border-0 shadow-sm p-4 h-100" style={{ borderRadius: "18px", backgroundColor: "#FFFFFF" }}>
                  <div className="mb-3">
                    <h5 style={{ fontWeight: 800, color: "#3E2723", fontSize: "1.25rem", marginBottom: "4px" }}>
                      Tabel Alat Terfavorit
                    </h5>
                    <p className="text-muted mb-3" style={{ fontSize: "0.88rem" }}>
                      Tabel Yang Menampilkan Alat yang paling sering dipinjam
                    </p>

                    {/* Search Bar */}
                    <div style={{ position: "relative", width: "220px", marginBottom: "16px" }}>
                      <Form.Control
                        type="text"
                        placeholder="Cari..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                          borderRadius: "24px",
                          fontSize: "0.85rem",
                          padding: "6px 36px 6px 16px",
                          borderColor: "#DCD0CB",
                        }}
                      />
                      <FaSearch
                        size={13}
                        style={{
                          position: "absolute",
                          right: "14px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#A8958F",
                          pointerEvents: "none",
                        }}
                      />
                    </div>
                  </div>

                  <div className="table-responsive">
                    <Table hover className="mb-0 align-middle text-center" style={{ minWidth: "500px" }}>
                      <thead style={{ borderBottom: "2px solid #F0ECE9" }}>
                        <tr>
                          <th className="py-3" style={{ fontWeight: 700, color: "#2E2421", fontSize: "0.92rem", width: "50px" }}>No</th>
                          <th className="py-3 text-start ps-4" style={{ fontWeight: 700, color: "#2E2421", fontSize: "0.92rem" }}>Nama Alat</th>
                          <th className="py-3" style={{ fontWeight: 700, color: "#2E2421", fontSize: "0.92rem" }}>Total Unit</th>
                          <th className="py-3" style={{ fontWeight: 700, color: "#2E2421", fontSize: "0.92rem" }}>Total Peminjaman</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredFavorit.map((item, idx) => (
                          <tr key={item.id} style={{ borderBottom: "1px solid #F8F5F4" }}>
                            <td className="py-3" style={{ color: "#4A3F3B", fontSize: "0.9rem" }}>{idx + 1}</td>
                            <td className="py-3 text-start ps-4 fw-medium" style={{ color: "#4A3F3B", fontSize: "0.9rem" }}>{item.namaAlat}</td>
                            <td className="py-3" style={{ color: "#4A3F3B", fontSize: "0.9rem" }}>{item.totalUnit}</td>
                            <td className="py-3 fw-bold" style={{ color: "#3E2723", fontSize: "0.95rem" }}>{item.totalPeminjaman}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Card>
              </Col>

              {/* Right Side: Top 3 Alat Ranking Cards */}
              <Col xs={12} lg={4}>
                <div className="ps-lg-2">
                  <h5 style={{ fontWeight: 800, color: "#3E2723", fontSize: "1.25rem", marginBottom: "16px" }}>
                    Top 3 Alat
                  </h5>

                  <div className="d-flex flex-column gap-3">
                    {TOP_3_ALAT.map((top) => (
                      <Card
                        key={top.rank}
                        className="border-0 shadow-sm p-3"
                        style={{
                          borderRadius: "16px",
                          backgroundColor: "#FFFFFF",
                          transition: "transform 0.2s ease-in-out",
                        }}
                      >
                        <div className="d-flex align-items-center">
                          {/* Medal Badge */}
                          <div
                            style={{
                              width: "48px",
                              height: "48px",
                              borderRadius: "50%",
                              backgroundColor: "#EFE8E5",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              position: "relative",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                            }}
                          >
                            <div
                              style={{
                                width: "30px",
                                height: "30px",
                                borderRadius: "50%",
                                backgroundColor: top.color,
                                color: "#FFFFFF",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 800,
                                fontSize: "0.95rem",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                              }}
                            >
                              {top.rank}
                            </div>
                          </div>

                          {/* Info */}
                          <div className="ms-3">
                            <h6 className="mb-0" style={{ fontWeight: 700, color: "#3E2723", fontSize: "0.95rem" }}>
                              {top.name}
                            </h6>
                            <span className="text-muted" style={{ fontSize: "0.8rem" }}>
                              {top.count}x dipinjam
                            </span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </Col>
            </Row>
          )}
        </Container>
      </div>

      {/* ===== MODAL KONFIRMASI EKSPOR ===== */}
      <Modal
        show={exportModal.show}
        onHide={() => setExportModal({ show: false, format: "PDF" })}
        centered
        size="md"
        style={{ paddingTop: "60px" }}
      >
        <Modal.Header closeButton style={{ backgroundColor: "#F9F6F5", borderBottom: "1px solid #EAE3DF" }}>
          <Modal.Title style={{ fontWeight: 700, color: "#3E2723", fontSize: "1.15rem", display: "flex", alignItems: "center", gap: "8px" }}>
            {exportModal.format === "PDF" ? <FaFilePdf color="#D32F2F" /> : <FaFileExcel color="#2E7D32" />}
            Konfirmasi Ekspor {exportModal.format}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4" style={{ fontFamily: "Poppins, sans-serif" }}>
          <p style={{ color: "#4A3F3B", fontSize: "0.92rem", marginBottom: "16px" }}>
            Anda akan mengekspor data laporan peminjaman alat dengan rincian konfigurasi berikut:
          </p>

          <div className="p-3 mb-3" style={{ backgroundColor: "#FAF7F5", borderRadius: "12px", border: "1px solid #EFE8E5" }}>
            <Row className="g-2">
              <Col xs={5} className="text-muted" style={{ fontSize: "0.85rem" }}>
                Format Berkas
              </Col>
              <Col xs={7}>
                <Badge
                  bg={exportModal.format === "PDF" ? "danger" : "success"}
                  style={{ fontSize: "0.82rem", padding: "4px 12px", borderRadius: "12px" }}
                >
                  {exportModal.format === "PDF" ? "PDF Document (.pdf)" : "Excel Spreadsheet (.xlsx)"}
                </Badge>
              </Col>

              <Col xs={5} className="text-muted" style={{ fontSize: "0.85rem" }}>
                Kategori Tabel
              </Col>
              <Col xs={7} className="fw-semibold" style={{ color: "#3E2723", fontSize: "0.88rem" }}>
                {getActiveDataInfo().title}
              </Col>

              <Col xs={5} className="text-muted" style={{ fontSize: "0.85rem" }}>
                Periode Terpilih
              </Col>
              <Col xs={7} className="fw-semibold" style={{ color: "#3E2723", fontSize: "0.88rem" }}>
                {periode}
              </Col>

              <Col xs={5} className="text-muted" style={{ fontSize: "0.85rem" }}>
                Filter Status
              </Col>
              <Col xs={7} className="fw-semibold" style={{ color: "#3E2723", fontSize: "0.88rem" }}>
                {statusFilter}
              </Col>

              <Col xs={5} className="text-muted" style={{ fontSize: "0.85rem" }}>
                Total Baris Data
              </Col>
              <Col xs={7} className="fw-bold text-primary" style={{ fontSize: "0.88rem" }}>
                {getActiveDataInfo().count} Data
              </Col>
            </Row>
          </div>

          <small className="text-muted d-block">
            * Berkas akan diunduh secara otomatis setelah Anda menekan tombol <strong>Unduh Sekarang</strong>.
          </small>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: "#F9F6F5", borderTop: "1px solid #EAE3DF" }}>
          <Button
            variant="outline-secondary"
            onClick={() => setExportModal({ show: false, format: "PDF" })}
            disabled={isExporting}
            style={{ borderRadius: "20px", padding: "6px 18px", fontSize: "0.85rem" }}
          >
            Batal
          </Button>
          <Button
            onClick={handleConfirmExport}
            disabled={isExporting}
            style={{
              backgroundColor: "#9E8880",
              borderColor: "#9E8880",
              color: "#FFFFFF",
              borderRadius: "20px",
              padding: "6px 22px",
              fontSize: "0.85rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {isExporting ? (
              <>
                <Spinner size="sm" animation="border" /> Memproses...
              </>
            ) : (
              <>
                <FaDownload size={13} /> Unduh Sekarang
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ===== MODAL SUKSES EKSPOR ===== */}
      <Modal
        show={successPopup.show}
        onHide={() => setSuccessPopup({ show: false, title: "", message: "", filename: "" })}
        centered
        style={{ paddingTop: "60px" }}
      >
        <Modal.Body className="text-center p-4" style={{ fontFamily: "Poppins, sans-serif" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "#E8F8F5",
              color: "#2ECC71",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              fontSize: "1.8rem",
            }}
          >
            <FaCheckCircle />
          </div>

          <h5 className="fw-bold mb-2" style={{ color: "#2E2421" }}>
            {successPopup.title}
          </h5>
          <p className="text-muted mb-3" style={{ fontSize: "0.9rem", lineHeight: "1.4" }}>
            {successPopup.message}
          </p>

          {successPopup.filename && (
            <div
              className="p-2 px-3 mb-4 text-truncate"
              style={{
                backgroundColor: "#F7F4F2",
                borderRadius: "8px",
                fontSize: "0.82rem",
                color: "#6D5D57",
                fontWeight: 500,
              }}
            >
              📄 {successPopup.filename}
            </div>
          )}

          <Button
            onClick={() => setSuccessPopup({ show: false, title: "", message: "", filename: "" })}
            style={{
              backgroundColor: "#3A3330",
              borderColor: "#3A3330",
              color: "#FFFFFF",
              borderRadius: "20px",
              padding: "7px 32px",
              fontWeight: 600,
              fontSize: "0.88rem",
            }}
          >
            Tutup
          </Button>
        </Modal.Body>
      </Modal>

      <FooterSetelahLogin />
    </NavbarLoginKepala>
  );
}
