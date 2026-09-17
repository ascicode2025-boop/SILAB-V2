import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useHistory, useLocation } from "react-router-dom";
import NavbarLoginTeknisi from "./NavbarLoginTeknisi";
import FooterSetelahLogin from "../FooterSetelahLogin";
import { formatDataForPDF } from "../../utils/pdfHelpers";
import LoadingSpinner from "../../components/Common/LoadingSpinner";

import { message, Table, Tag, Button, Modal, Progress } from "antd";
import { EyeOutlined, SendOutlined, EditOutlined, DownloadOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { getAllBookings, uploadPdfAndKirim } from "../../services/BookingService";

export default function GeneratePdfAnalysis({ autoGenerate = false, filename = "hasil_analisis.pdf", booking: propBooking = null }) {
  useEffect(() => {
    document.title = "SILAB-NTDK - Generate PDF Analisis";
  }, []);

  // modal state and upload state for sending PDF to Koordinator
  const location = useLocation();
  const history = useHistory();
  const resolvedAutoGenerate = location.state?.autoGenerate ?? autoGenerate;
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingList, setBookingList] = useState([]);
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'detail'
  const [modalVisible, setModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Booking data possibly passed via route state (only id + resultUnits expected)
  const routeBooking = propBooking || location.state?.booking;
  // keep only id for effect dependency to avoid recreating object each render
  const routeBookingId = routeBooking?.id;
  const routeResultUnits = routeBooking?.resultUnits;

  const instituteHeader = [
    "KEMENTERIAN RISET, TEKNOLOGI DAN PENDIDIKAN TINGGI",
    "INSTITUT PERTANIAN BOGOR",
    "FAKULTAS PETERNAKAN",
    "DEPARTEMEN ILMU NUTRISI DAN TEKNOLOGI PAKAN",
    "LABORATORIUM NUTRISI TERNAK DAGING DAN KERJA",
    "Jl. Agathis Kampus IPB Darmaga, Bogor 16680",
  ];

  // --- DATA DEFAULT ---
  const defaultData = {
    header: {
      kepada: "Kepada Yth.",
      instansi: "****",
      tempat: "Di Tempat",
      tanggal: "**/**/****",
      jenis_kelamin: "****",
      umur: "**** minggu",
      status_fisiologis: "****",
      title1: "Tabel 1. Hasil Analisis Hematologi",
      title2: "Tabel 2. Hasil Analisis Metabolit",
    },
    table1: [
      ["Kode", "BDM x10^6(Butir/mm³)", "BDP x10^3 (Butir/mm³)", "HB\n(G%)", "PCV\n(%)", "Limfosit\n(%)", "Neutrofil\n(%)", "Eosinofil\n(%)", "Monosit\n(%)", "Basofil\n(%)"],
      ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-"],
    ],
    table2: [
      ["No", "Kode", "Glukosa\n(mg/dL)", "Total Protein\n(g/dL)", "Albumin\n(mg/dL)", "Kolestrol\n(mg/dL)", "Trigliserida\n(mg/dL)", "Urea/BUN\n(mg/dL)", "Kreatinin\n(mg/dL)", "Kalsium\n(mg/dL)", "HDL-kol\n(mg/dL)", "LDL-kol\n(mg/dL)"],
      [],
    ],
  };

  useEffect(() => {
    if (routeBookingId) {
      // fetch booking by id and show detail
      fetchBookingData(routeBookingId);
      setViewMode("detail");
    } else {
      fetchAllVerificationBookings();
      setViewMode("list");
    }
    // only depend on the booking id (primitive) to prevent effect-loop from recreated objects
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeBookingId]);

  // --- PATCH: Pastikan status tidak auto-kirim ---
  useEffect(() => {
    if (bookingData && (bookingData.status === "proses" || bookingData.status === "draft")) {
      // Status tetap, tidak auto update ke 'menunggu_verifikasi'
      // Hanya update status setelah teknisi klik tombol kirim
    }
  }, [bookingData]);

  // --- LOGIKA FETCH DATA UTAMA (DIPERBAIKI) ---
  const fetchAllVerificationBookings = async () => {
    try {
      setLoading(true);
      const response = await getAllBookings();
      const allBookings = response?.data || [];

      // Tambahkan status baru jika ada, misal: 'revised', 'diperbaiki', dsb
      const visibleStatuses = [
        "proses",
        "draft",
        "menunggu_verifikasi",
        "menunggu_verifikasi_kepala",
        "menunggu_ttd",
        "menunggu_ttd_koordinator",
        "menunggu_pembayaran",
        "selesai",
        "disetujui",
        "diperbaiki_teknisi",
        "revised",
        "diperbaiki",
      ];

      // FILTER: Booking yang statusnya relevan ATAU memiliki analysis_items dengan status 'revised'
      const statusForAnalysis = allBookings.filter((b) => {
        const status = (b.status || "").toLowerCase();
        // Cek apakah ada analysis_items dengan status 'revised'
        const hasRevisedItem = Array.isArray(b.analysis_items) && b.analysis_items.some((ai) => (ai.status || "").toLowerCase() === "revised");
        return (visibleStatuses.includes(status) || hasRevisedItem) && status !== "menunggu_pembayaran_awal" && status !== "pending" && status !== "dibatalkan" && status !== "rejected";
      });

      // FILTER: Hanya booking yang memiliki jenis_analisis (sudah siap untuk analisis)
      // Jika status 'proses', pastikan minimal satu item memiliki hasil atau status 'revised'
      const verificationBookings = statusForAnalysis.filter((b) => {
        if (!b.jenis_analisis || b.jenis_analisis.trim() === "") return false;
        const st = (b.status || "").toLowerCase();
        if (st === "proses") {
          // pastikan minimal satu item memiliki hasil terisi atau status 'revised'
          return Array.isArray(b.analysis_items) && b.analysis_items.some((ai) => (ai.hasil && ai.hasil.toString().trim() !== "") || (ai.status || "").toLowerCase() === "revised");
        }
        // Jika status booking bukan 'proses', tetap tampilkan jika ada item 'revised'
        if (Array.isArray(b.analysis_items) && b.analysis_items.some((ai) => (ai.status || "").toLowerCase() === "revised")) {
          return true;
        }
        return true;
      });

      // DEBUG: Log untuk melihat hasil filter
      console.log("=== DEBUG FILTER TEKNISI ===");
      console.log("All bookings count:", allBookings.length);
      console.log("After status filter:", statusForAnalysis.length);
      console.log("Final booking count (with analysis):", verificationBookings.length);

      const uniqueStatuses = [...new Set(allBookings.map((b) => b.status))];
      console.log("All unique statuses:", uniqueStatuses);

      const filteredStatuses = [...new Set(verificationBookings.map((b) => b.status))];
      console.log("Teknisi filtered statuses:", filteredStatuses);

      // Log jenis analisis yang ada
      const jenisAnalisisList = [...new Set(verificationBookings.map((b) => b.jenis_analisis))];
      console.log("Jenis analisis yang ada:", jenisAnalisisList);
      console.log("=============================");

      // Sorting: Prioritaskan yang BUTUH AKSI (menunggu_verifikasi) di paling atas
      verificationBookings.sort((a, b) => {
        const statusA = (a.status || "").toLowerCase();
        const statusB = (b.status || "").toLowerCase();

        if (statusA === "menunggu_verifikasi" && statusB !== "menunggu_verifikasi") return -1;
        if (statusA !== "menunggu_verifikasi" && statusB === "menunggu_verifikasi") return 1;

        // Sisanya urutkan berdasarkan tanggal terbaru
        return new Date(b.created_at) - new Date(a.created_at);
      });

      setBookingList(verificationBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      message.error("Gagal memuat daftar booking.");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingData = async (bookingId) => {
    try {
      setLoading(true);
      const response = await getAllBookings();
      const allBookings = response?.data || [];
      const booking = allBookings.find((b) => b.id === bookingId);

      if (booking) {
        // If route included resultUnits (from input form), merge them so PDF formatter can use per-item units
        if (routeResultUnits) {
          const merged = { ...booking, resultUnits: routeResultUnits };
          setBookingData(merged);
          setSelectedBooking(merged);
        } else {
          setBookingData(booking);
          setSelectedBooking(booking);
        }
      } else {
        message.error("Data booking tidak ditemukan!");
      }
    } catch (error) {
      console.error("Error fetching booking:", error);
      message.error("Gagal memuat data booking.");
    } finally {
      setLoading(false);
    }
  };

  const parseKodeSampel = (kodeSampel) => {
    try {
      let codes = [];
      if (typeof kodeSampel === "string") {
        const parsed = JSON.parse(kodeSampel);
        codes = Array.isArray(parsed) ? parsed : [parsed];
      } else if (Array.isArray(kodeSampel)) {
        codes = kodeSampel;
      } else {
        codes = [kodeSampel];
      }
      return codes.filter((c) => c && c.trim() !== "");
    } catch (e) {
      return [kodeSampel];
    }
  };

  const handleViewDetail = (booking) => {
    setSelectedBooking(booking);
    setBookingData(booking);
    setViewMode("detail");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedBooking(null);
    setBookingData(null);
    setPdfUrl(null);
    fetchAllVerificationBookings();
  };

  const handleEditData = () => {
    if (!selectedBooking) return;
    history.push(`/teknisi/dashboard/inputNilaiAnalisis/input-analisis/${selectedBooking.id}`);
  };

  // sending to Koordinator removed: generate PDF only

  // --- LOGIKA GENERATE PDF ---
  const payload = bookingData ? formatDataForPDF(bookingData) : defaultData;

  function generatePdfFile() {
    if (!bookingData) return null;
    const doc = new jsPDF("p", "mm", "a4");
    let kodeBatch = bookingData?.kode_batch || bookingData?.kode_sampel || "-";
    if (Array.isArray(kodeBatch)) kodeBatch = kodeBatch[0] || "-";
    const safeKodeBatch = String(kodeBatch).replace(/[^a-zA-Z0-9-_]/g, "_");
    const customFilename = `hasil_analisis - ${safeKodeBatch}.pdf`;

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
    doc.setFont("times", "bold");
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
    doc.setFont("times", "normal");
    doc.text(payload.header.kepada, leftMargin, cursorY);
    if (payload.header.tanggal) {
      doc.text(`Tanggal: ${payload.header.tanggal}`, pageWidth - rightMargin, cursorY, { align: "right" });
    }
    cursorY += 6;
    doc.text(payload.header.instansi, leftMargin, cursorY);
    cursorY += 6;
    doc.text(payload.header.tempat, leftMargin, cursorY);
    cursorY += 12;

    // Tambahkan informasi hewan
    doc.setFontSize(10);
    doc.setFont("times", "bold");
    doc.text("Informasi Hewan:", leftMargin, cursorY);
    cursorY += 5;
    doc.setFont("times", "normal");
    doc.text(`Jenis Kelamin: ${payload.header.jenis_kelamin || "-"}`, leftMargin, cursorY);
    cursorY += 4;
    doc.text(`Umur: ${payload.header.umur || "-"}`, leftMargin, cursorY);
    cursorY += 4;
    doc.text(`Status Fisiologis: ${payload.header.status_fisiologis || "-"}`, leftMargin, cursorY);
    cursorY += 12;

    if (payload.table1 && payload.table1.length > 0 && payload.header.title1) {
      doc.setFontSize(11);
      doc.setFont("times", "bold");
      const title1Lines = doc.splitTextToSize(payload.header.title1, usableWidth);
      doc.text(title1Lines, leftMargin, cursorY);
      cursorY += title1Lines.length * 5 + 2;
      const [, ...table1Body] = payload.table1;

      // Gunakan header dinamis dari payload
      const [dynamicTable1Head, ...dynamicTable1Body] = payload.table1;

      const colNoWidth = 12;
      const colKodeWidth = 30;
      const remainingWidth = usableWidth - colNoWidth - colKodeWidth;
      const paramColCount = dynamicTable1Head.length - 2; // No dan Kode sudah dikurangi
      const paramColWidth = remainingWidth / (paramColCount > 0 ? paramColCount : 1);
      let columnStylesT1 = {
        0: { cellWidth: colNoWidth },
        1: { cellWidth: colKodeWidth, whiteSpace: "nowrap", overflow: "hidden" },
      };
      // Set width untuk kolom parameter secara dinamis
      for (let i = 2; i < dynamicTable1Head.length; i++) {
        columnStylesT1[i] = { cellWidth: paramColWidth };
      }
      autoTable(doc, {
        startY: cursorY,
        head: [dynamicTable1Head],
        body: dynamicTable1Body,
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
      doc.setFont("times", "bold");
      const title2Lines = doc.splitTextToSize(payload.header.title2, usableWidth);
      doc.text(title2Lines, leftMargin, cursorY);
      cursorY += title2Lines.length * 5 + 2;
      const [table2Head, ...table2Body] = payload.table2;
      const colNoWidth = 10;
      const colKodeWidth = 35;
      const remainingWidth = usableWidth - colNoWidth - colKodeWidth;
      const paramColCount = table2Head.length - 2;
      const paramColWidth = remainingWidth / (paramColCount > 0 ? paramColCount : 1);
      let columnStylesT2 = {
        0: { cellWidth: colNoWidth },
        1: { cellWidth: colKodeWidth, whiteSpace: "nowrap", overflow: "hidden" },
      };
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
    doc.setFont("times", "normal");
    doc.text("Penanggungjawab Lab. Analisis", signatureCenterPoint, cursorY, { align: "center" });
    cursorY += 5;
    doc.text("Ilmu Nutrisi Ternak Daging dan Kerja", signatureCenterPoint, cursorY, { align: "center" });
    cursorY += 25;
    doc.setLineWidth(0.3);
    doc.setDrawColor(0, 0, 0);
    doc.line(signatureCenterPoint - 25, cursorY, signatureCenterPoint + 25, cursorY);
    cursorY += 4;
    doc.text("Prof. Dewi Apri Astuti, MS", signatureCenterPoint, cursorY, { align: "center" });

    const blob = doc.output("blob");
    return new File([blob], customFilename, { type: "application/pdf" });
  }

  function buildPDF(download = false) {
    const file = generatePdfFile();
    if (!file) return;

    if (!download) {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
    } else {
      // Logic download
      const url = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      // Pastikan node masih ada sebelum dihapus
      if (a.parentNode) {
        a.parentNode.removeChild(a);
      }
      URL.revokeObjectURL(url);
    }
  }

  // --- DO UPLOAD & KIRIM KE KOORDINATOR ---
  const doKirimKeKoordinator = async () => {
    if (!bookingData) {
      message.error("Data booking tidak ditemukan!");
      return;
    }
    try {
      setUploading(true);
      setUploadProgress(0);

      // Generate PDF as a File
      const file = generatePdfFile();
      if (!file) {
        message.error("Gagal membuat file PDF. Silakan coba lagi.");
        setUploading(false);
        setUploadProgress(0);
        return;
      }
      if (!(file instanceof File)) {
        message.error("File PDF tidak valid. Silakan coba lagi.");
        setUploading(false);
        setUploadProgress(0);
        return;
      }
      // Upload PDF ke server
      try {
        await uploadPdfAndKirim(bookingData.id, file, (percent) => {
          setUploadProgress(percent);
        });
      } catch (err) {
        console.error("Upload error response:", err?.response || err);
        const serverMsg = err?.response?.data?.message || err?.response?.statusText || err.message || "Gagal upload PDF ke server.";
        const details = err?.response?.data?.errors ? JSON.stringify(err.response.data.errors) : null;
        message.error(serverMsg + (details ? `: ${details}` : ""));
        setUploading(false);
        setUploadProgress(0);
        return;
      }

      // Fetch ulang data agar status terupdate di UI
      await fetchBookingData(bookingData.id);
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 800); // Reset progress bar setelah 0.8 detik
      message.success({ content: "Hasil analisis berhasil dikirim ke Koordinator Lab!", duration: 2 });
    } catch (error) {
      console.error("Gagal kirim ke koordinator:", error);
      message.error("Terjadi kesalahan saat mengirim ke koordinator.");
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  // Build preview PDF when entering detail view (do not change booking status)
  useEffect(() => {
    if (payload && bookingData && viewMode === "detail") {
      buildPDF(false); // hanya preview, tidak update status
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingData, viewMode]);
  // Do not auto-download even if routed with autoGenerate flag; keep preview only

  // --- KOLOM TABEL (Status Dinamis & Responsive) ---
  const columns = [
    {
      title: "Kode Sampel",
      dataIndex: "kode_batch",
      key: "kode_batch",
      width: 150, // Reduced width for mobile
      render: (text, record) => {
        const kodeBatch = text || record.kode_sampel || "-";
        const user = record.user?.full_name || record.user?.name || "-";
        const jenisAnalisis = record.jenis_analisis || "-";
        const tanggal = record.tanggal_booking || record.created_at;
        const formattedDate = tanggal
          ? new Date(tanggal).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "-";

        return (
          <div>
            <div>
              <Tag color="blue" style={{ fontSize: "12px", marginBottom: "4px" }}>
                {kodeBatch}
              </Tag>
            </div>
            {/* Mobile condensed info */}
            <div className="d-block d-md-none" style={{ fontSize: "11px", color: "#666", lineHeight: "1.3" }}>
              <div style={{ fontWeight: "500", color: "#333", marginBottom: "2px" }}>{user}</div>
              <div style={{ marginBottom: "2px" }}>{jenisAnalisis}</div>
              <div style={{ color: "#888" }}>{formattedDate}</div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Nama Lengkap",
      dataIndex: "user",
      key: "user",
      width: 150,
      className: "d-none d-md-table-cell", // Hidden on mobile
      render: (user) => user?.full_name || user?.name || "-",
    },
    {
      title: "Jenis Analisis",
      dataIndex: "jenis_analisis",
      key: "jenis_analisis",
      width: 180,
      className: "d-none d-lg-table-cell", // Hidden on mobile and tablet
      render: (text) => text || "-",
    },
    {
      title: "Tanggal Pemesanan",
      key: "tanggal_pemesanan",
      width: 120,
      className: "d-none d-lg-table-cell", // Hidden on mobile and tablet
      render: (_, record) => {
        const tanggal = record.tanggal_booking || record.created_at;
        if (!tanggal) return "-";
        return new Date(tanggal).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120, // Reduced width
      align: "center",
      render: (status) => {
        let color = "default";
        let text = status;
        let shortText = status; // For mobile

        switch (status) {
          case "proses":
          case "draft":
            color = "warning";
            text = "Perlu Kirim Koordinator";
            shortText = "Perlu Kirim";
            break;
          case "menunggu_verifikasi":
            // Already sent by teknisi, waiting Koordinator verification
            color = "processing";
            text = "Sudah Dikirim ke Koordinator";
            shortText = "Dikirim";
            break;
          case "menunggu_verifikasi_kepala":
            color = "processing";
            text = "Di Koordinator";
            shortText = "Di Koordinator";
            break;
          case "menunggu_ttd":
          case "menunggu_ttd_koordinator":
            color = "purple";
            text = "Menunggu TTD";
            shortText = "TTD";
            break;
          case "menunggu_pembayaran":
          case "selesai":
            color = "success";
            text = "Selesai";
            shortText = "Selesai";
            break;
          default:
            text = status?.replace(/_/g, " ") || "-";
            shortText = text;
        }

        return (
          <>
            {/* Desktop version */}
            <span className="d-none d-md-inline">
              <Tag color={color}>{text}</Tag>
            </span>
            {/* Mobile version - shorter text */}
            <span className="d-inline d-md-none">
              <Tag color={color} style={{ fontSize: "10px", padding: "2px 4px" }}>
                {shortText}
              </Tag>
            </span>
          </>
        );
      },
    },
    {
      title: "Aksi",
      key: "aksi",
      width: 80, // Reduced width
      align: "center",
      render: (_, record) => (
        <Button type="primary" icon={<EyeOutlined />} size="small" className="responsive-btn" onClick={() => handleViewDetail(record)}>
          <span className="d-none d-sm-inline">PDF</span>
          <span className="d-inline d-sm-none">PDF</span>
        </Button>
      ),
    },
  ];

  const sentStatuses = ["menunggu_verifikasi", "menunggu_verifikasi_kepala", "menunggu_ttd", "menunggu_ttd_koordinator", "menunggu_pembayaran", "selesai", "disetujui"];

  const isSent = bookingData && sentStatuses.includes((bookingData.status || "").toLowerCase());

  return (
    <NavbarLoginTeknisi>
      <div className="container-fluid p-4" style={{ minHeight: "calc(100vh - 160px)" }}>
        {loading && (
          <div className="text-center py-5">
            <LoadingSpinner spinning={loading} tip="Memuat data..." />
          </div>
        )}

        {!loading && viewMode === "list" && (
          <div className="card shadow-sm" style={{ borderRadius: "12px", overflow: "hidden", border: "none" }}>
            {/* Header dengan nuansa Cokelat Tua */}
            <div
              className="card-header text-white"
              style={{
                backgroundColor: "#cdb0a7", // Deep Brown
                borderBottom: "2px solid #8D6E63",
                padding: "15px 20px",
              }}
            >
              <h5 className="mb-0" style={{ fontWeight: "600", letterSpacing: "0.5px" }}>
                Daftar Hasil Analisis (Riwayat)
              </h5>
            </div>

            <div className="card-body responsive-table-container" style={{ backgroundColor: "#FAF8F6" }}>
              <Table
                columns={columns}
                dataSource={bookingList}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  style: { marginTop: "20px" },
                  showSizeChanger: false,
                  showQuickJumper: false,
                  responsive: true,
                }}
                scroll={{
                  scrollToFirstRowOnChange: true,
                  // Removed x scroll to prevent horizontal scrolling on mobile
                }}
                locale={{ emptyText: "Tidak ada data analisis" }}
                className="custom-brown-table responsive-analysis-table"
                size="small" // Use small size for mobile
              />
            </div>
          </div>
        )}

        {!loading && viewMode === "detail" && (
          <div className="d-flex flex-column gap-3">
            <div className="card shadow-sm p-3">
              <h5 className="mb-3">Preview Hasil Analisis</h5>
              <div className="d-flex gap-2 flex-wrap">
                <Button icon={<DownloadOutlined />} onClick={() => buildPDF(true)}>
                  Download PDF
                </Button>

                {/* Edit tetap boleh diklik selama booking belum dikirim ke Koordinator */}
                <Button icon={<EditOutlined />} onClick={handleEditData} disabled={!bookingData || isSent}>
                  Edit Data
                </Button>

                {/* Jika sudah dikirim, tampilkan indikator; jika belum, tampilkan tombol Kirim */}
                {(() => {
                  const sentStatuses = ["menunggu_verifikasi", "menunggu_verifikasi_kepala", "menunggu_ttd", "menunggu_ttd_koordinator", "menunggu_pembayaran", "selesai", "disetujui"];
                  const isSent = bookingData && sentStatuses.includes((bookingData.status || "").toLowerCase());
                  if (isSent) {
                    return (
                      <Button type="default" icon={<CheckCircleOutlined />} disabled style={{ background: "#f6ffed", borderColor: "#b7eb8f", color: "#52c41a" }}>
                        Sudah Dikirim ke Koordinator
                      </Button>
                    );
                  }
                  return (
                    <Button type="primary" icon={<SendOutlined />} onClick={() => setModalVisible(true)} disabled={!bookingData || uploading}>
                      Kirim Ke Koordinator Lab
                    </Button>
                  );
                })()}

                {uploading && (
                  <div style={{ minWidth: 240, marginLeft: 12 }}>
                    <Progress percent={uploadProgress} status={uploadProgress === 0 ? undefined : uploadProgress < 100 ? "active" : "success"} />
                  </div>
                )}

                <Modal
                  title="Konfirmasi Pengiriman"
                  open={modalVisible}
                  onOk={() => {
                    setModalVisible(false);
                    doKirimKeKoordinator();
                  }}
                  onCancel={() => setModalVisible(false)}
                  okText="Ya, Kirim"
                  cancelText="Batal"
                >
                  <p>Apakah Anda yakin ingin mengirim hasil analisis ke Koordinator Lab?</p>
                </Modal>
                <Button onClick={handleBackToList}>Kembali ke Daftar</Button>
              </div>
            </div>

            <div className="card shadow-sm p-0" style={{ height: "800px" }}>
              {pdfUrl && <iframe src={pdfUrl} title="PDF Preview" style={{ width: "100%", height: "100%", border: "none" }} />}
            </div>
          </div>
        )}
      </div>
      <FooterSetelahLogin />

      <style>{`
        .responsive-table-container {
          overflow-x: visible; /* Remove horizontal overflow */
          -webkit-overflow-scrolling: touch;
        }
        
        .responsive-analysis-table {
          font-size: clamp(11px, 2.5vw, 14px);
          width: 100%;
        }
        
        .responsive-analysis-table .ant-table {
          width: 100% !important;
        }
        
        .responsive-analysis-table .ant-table-thead > tr > th {
          padding: clamp(8px, 2vw, 16px) clamp(4px, 1vw, 8px);
          font-size: clamp(10px, 2.2vw, 13px);
          font-weight: 600;
          white-space: nowrap;
        }
        
        .responsive-analysis-table .ant-table-tbody > tr > td {
          padding: clamp(6px, 1.5vw, 12px) clamp(4px, 1vw, 8px);
          font-size: clamp(10px, 2vw, 12px);
        }
        
        .responsive-btn {
          font-size: clamp(10px, 2vw, 12px);
          padding: clamp(2px, 0.5vw, 4px) clamp(4px, 1vw, 8px);
        }
        
        @media (max-width: 768px) {
          .responsive-table-container {
            margin: 0;
            padding: 0;
            overflow-x: visible !important;
          }
          
          .responsive-analysis-table {
            width: 100% !important;
          }
          
          .responsive-analysis-table .ant-table {
            font-size: 11px;
            width: 100% !important;
          }
          
          .responsive-analysis-table .ant-table-thead > tr > th {
            padding: 8px 4px;
            font-size: 10px;
            line-height: 1.2;
          }
          
          .responsive-analysis-table .ant-table-tbody > tr > td {
            padding: 6px 4px;
            font-size: 10px;
            line-height: 1.3;
            word-break: break-word;
          }
          
          .responsive-analysis-table .ant-tag {
            font-size: 9px;
            padding: 2px 4px;
            line-height: 1.2;
          }
          
          .responsive-btn {
            font-size: 10px;
            padding: 2px 6px;
            height: auto;
            min-height: 24px;
          }
          
          .responsive-btn .anticon {
            font-size: 12px;
          }
          
          /* Ensure table columns distribute evenly on mobile */
          .responsive-analysis-table .ant-table-thead > tr > th:nth-child(1) {
            width: 40% !important;
          }
          
          .responsive-analysis-table .ant-table-thead > tr > th:nth-child(2) {
            width: 35% !important;
          }
          
          .responsive-analysis-table .ant-table-thead > tr > th:nth-child(3) {
            width: 25% !important;
          }
        }
        
        @media (max-width: 576px) {
          .card-header h5 {
            font-size: clamp(14px, 4vw, 18px);
          }
          
          .responsive-analysis-table .ant-table {
            font-size: 10px;
          }
          
          .responsive-analysis-table .ant-table-thead > tr > th {
            padding: 6px 2px;
            font-size: 9px;
          }
          
          .responsive-analysis-table .ant-table-tbody > tr > td {
            padding: 4px 2px;
            font-size: 9px;
            vertical-align: top;
          }
          
          .responsive-analysis-table .ant-pagination {
            margin-top: 12px !important;
          }
          
          .responsive-analysis-table .ant-pagination-item {
            min-width: 28px;
            height: 28px;
            line-height: 26px;
            font-size: 11px;
          }
        }
        
        @media (min-width: 769px) {
          .d-md-table-cell {
            display: table-cell !important;
          }
          
          .d-md-block {
            display: block !important;
          }
          
          .d-md-none {
            display: none !important;
          }
          
          .d-md-inline {
            display: inline !important;
          }
        }
        
        @media (min-width: 992px) {
          .d-lg-table-cell {
            display: table-cell !important;
          }
        }
        
        /* Ensure status column is always visible */
        .responsive-analysis-table .ant-table-thead > tr > th,
        .responsive-analysis-table .ant-table-tbody > tr > td {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        /* Fix for very small screens */
        @media (max-width: 400px) {
          .responsive-analysis-table .ant-table-thead > tr > th:nth-child(1) {
            width: 45% !important;
          }
          
          .responsive-analysis-table .ant-table-thead > tr > th:nth-child(2) {
            width: 30% !important;
          }
          
          .responsive-analysis-table .ant-table-thead > tr > th:nth-child(3) {
            width: 25% !important;
          }
        }
      `}</style>
    </NavbarLoginTeknisi>
  );
}