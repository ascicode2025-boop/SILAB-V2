import React, { useState, useEffect, useMemo } from "react";
import { Container, Row, Col, Table, Modal, Form, Dropdown } from "react-bootstrap";
import { FaSearch, FaFilter, FaFilePdf, FaCheckCircle, FaTimes, FaExclamationTriangle, FaChevronDown, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import dayjs from "dayjs";
import "dayjs/locale/id";
import NavbarLoginKoordinator from "./NavbarLoginKoordinator";
import FooterSetelahLogin from "../FooterSetelahLogin";
import { getStorageUrl } from "../../config/apiConfig";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import axios from "axios";

dayjs.locale("id");

// Initial Mock Data (Bisa dihapus nanti, untuk jaga-jaga saja)
const INITIAL_LOANS_DATA = [];

// Mini Custom Calendar Component for "Atur Jadwal"
function MiniCalendarPicker({ initialDate, onSelectRange, onClose }) {
  const [currentMonth, setCurrentMonth] = useState(dayjs(initialDate || "2026-07-01"));
  const [startDate, setStartDate] = useState(dayjs("2026-07-02"));
  const [endDate, setEndDate] = useState(dayjs("2026-07-06"));

  const daysInMonth = currentMonth.daysInMonth();
  const startDayOfWeek = currentMonth.startOf("month").day();

  const handleDateClick = (dayNum) => {
    const clicked = currentMonth.date(dayNum);
    if (!startDate || (startDate && endDate)) {
      setStartDate(clicked);
      setEndDate(null);
    } else if (startDate && !endDate) {
      if (clicked.isBefore(startDate)) {
        setStartDate(clicked);
      } else {
        setEndDate(clicked);
      }
    }
  };

  const handleApply = () => {
    if (startDate && endDate) {
      onSelectRange([startDate.format("DD MMMM YYYY"), endDate.format("DD MMMM YYYY")]);
    } else if (startDate) {
      onSelectRange([startDate.format("DD MMMM YYYY"), startDate.add(3, "day").format("DD MMMM YYYY")]);
    }
    onClose();
  };

  const days = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: "16px",
        padding: "12px 14px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        border: "1px solid #E5E7EB",
        width: "250px",
        margin: "8px auto 0",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-2">
        <button
          type="button"
          onClick={() => setCurrentMonth((m) => m.subtract(1, "month"))}
          style={{ background: "none", border: "none", color: "#4B5563", cursor: "pointer", padding: "2px" }}
        >
          <FaChevronLeft size={10} />
        </button>
        <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "#1F2937" }}>{currentMonth.format("MMMM YYYY")}</span>
        <button
          type="button"
          onClick={() => setCurrentMonth((m) => m.add(1, "month"))}
          style={{ background: "none", border: "none", color: "#4B5563", cursor: "pointer", padding: "2px" }}
        >
          <FaChevronRight size={10} />
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", textAlign: "center", marginBottom: "4px" }}>
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d, i) => (
          <span key={i} style={{ fontSize: "0.65rem", fontWeight: "600", color: "#9CA3AF" }}>
            {d}
          </span>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px", textAlign: "center" }}>
        {days.map((dayNum, i) => {
          if (!dayNum) return <div key={i} />;
          const thisDate = currentMonth.date(dayNum);
          const isStart = startDate && thisDate.isSame(startDate, "day");
          const isEnd = endDate && thisDate.isSame(endDate, "day");
          const inRange = startDate && endDate && thisDate.isAfter(startDate, "day") && thisDate.isBefore(endDate, "day");

          let bg = "transparent";
          let color = "#374151";
          let borderRadius = "6px";

          if (isStart || isEnd) {
            bg = "#8D6E63";
            color = "#FFFFFF";
            borderRadius = "50%";
          } else if (inRange) {
            bg = "#F5ECE8";
            color = "#5C4033";
          }

          return (
            <button
              key={i}
              type="button"
              onClick={() => handleDateClick(dayNum)}
              style={{
                background: bg,
                color: color,
                border: "none",
                borderRadius: borderRadius,
                fontSize: "0.7rem",
                fontWeight: isStart || isEnd ? "600" : "400",
                width: "26px",
                height: "26px",
                margin: "auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                padding: 0,
              }}
            >
              {dayNum}
            </button>
          );
        })}
      </div>

      <div className="d-flex justify-content-end gap-2 mt-2 pt-2 border-top">
        <button
          type="button"
          onClick={onClose}
          style={{ background: "#F3F4F6", border: "none", borderRadius: "12px", padding: "3px 10px", fontSize: "0.7rem", color: "#4B5563" }}
        >
          Batal
        </button>
        <button
          type="button"
          onClick={handleApply}
          style={{ background: "#8D6E63", color: "#FFF", border: "none", borderRadius: "12px", padding: "3px 12px", fontSize: "0.7rem", fontWeight: "500" }}
        >
          Terapkan
        </button>
      </div>
    </div>
  );
}

export default function ManajemenPengajuanKoordinator() {
  useEffect(() => {
    document.title = "SILAB-NTDK - Manajemen Pengajuan Peminjaman";
  }, []);

  const [loans, setLoans] = useState([]);

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/rentals", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const data = response.data.data.map(rental => {
        let statusTab = "menunggu";
        if (["disetujui", "siap_diambil", "aktif", "menunggu_pengembalian", "selesai", "menunggu_pembayaran_denda"].includes(rental.status)) statusTab = "disetujui";
        if (["ditolak", "dibatalkan"].includes(rental.status)) statusTab = "ditolak";

        // Asumsi data alat digabung jadi 1 string, dummy logic untuk frontend
        let namaAlat = "Alat";
        if (rental.instruments && rental.instruments.length > 0) {
          const groups = {};
          rental.instruments.forEach(inst => {
            const nama = inst.nama_alat || "Alat";
            groups[nama] = (groups[nama] || 0) + 1;
          });
          namaAlat = Object.entries(groups).map(([nama, count]) => `${count}x ${nama}`).join(', ');
        }

        const totalBiaya = rental.instruments && rental.instruments.length > 0
          ? rental.instruments.reduce((acc, inst) => acc + (inst.is_paid ? parseInt(inst.harga_sewa) || 0 : 0), 0)
          : 0;

        let statusTeknisi = "Belum Mengambil Alat";
        if (rental.status === "siap_diambil") {
          statusTeknisi = "Alat Siap Diambil";
        } else if (rental.status === "aktif") {
          statusTeknisi = "Alat Sedang Dipinjam";
        } else if (rental.status === "menunggu_pengembalian") {
          statusTeknisi = "Menunggu Konfirmasi Pengembalian";
        } else if (rental.status === "selesai") {
          statusTeknisi = "Selesai Dikembalikan";
        }

        let statusPeminjaman = rental.status;
        if (rental.status === "pending") statusPeminjaman = "Menunggu";
        else if (rental.status === "disetujui") statusPeminjaman = "Disetujui";
        else if (rental.status === "siap_diambil") statusPeminjaman = "Siap Diambil";
        else if (rental.status === "aktif") statusPeminjaman = "Sedang Dipinjam";
        else if (rental.status === "menunggu_pengembalian") statusPeminjaman = "Menunggu Pengembalian";
        else if (rental.status === "ditolak") statusPeminjaman = "Ditolak";
        else if (rental.status === "selesai") statusPeminjaman = "Selesai";
        else if (rental.status === "menunggu_pembayaran_denda") statusPeminjaman = "Menunggu Bayar Denda";
        else if (rental.status === "dibatalkan") statusPeminjaman = "Dibatalkan";

        return {
          id: rental.id,
          noPengajuan: `PJ${rental.id.toString().padStart(3, '0')}`,
          namaPeminjam: rental.user?.name || "Peminjam",
          nim: rental.user?.nim || "-",
          programStudi: rental.user?.prodi || "-",
          alat: namaAlat,
          jumlah: `${rental.instruments ? rental.instruments.length : 0} Unit`,
          tanggalPinjam: dayjs(rental.tanggal_peminjaman).format("DD MMMM YYYY"),
          tanggalPinjamRange: `${dayjs(rental.tanggal_peminjaman).format("DD MMMM YYYY")} - ${dayjs(rental.tanggal_pengembalian).format("DD MMMM YYYY")}`,
          keperluan: rental.kegiatan_penelitian || rental.tujuan_peminjaman,
          suratFile: rental.final_document_path ? rental.final_document_path.split('/').pop() : (rental.surat_pembimbing_path ? rental.surat_pembimbing_path.split('/').pop() : "-"),
          suratUrl: rental.final_document_path ? (rental.final_document_path.startsWith('http') ? rental.final_document_path : `${getStorageUrl()}/storage/${rental.final_document_path}`) : (rental.surat_pembimbing_path ? (rental.surat_pembimbing_path.startsWith('http') ? rental.surat_pembimbing_path : `${getStorageUrl()}/storage/${rental.surat_pembimbing_path}`) : "#"),
          biaya: totalBiaya,
          statusTab: statusTab,
          statusPeminjaman: statusPeminjaman,
          hasConflict: false, // Boleh tambahkan logic check conflict dari BE kalau perlu
          conflictNote: "",
          catatan: rental.catatan_koordinator || "",
          approvalDate: rental.updated_at ? dayjs(rental.updated_at).format("DD MMMM YYYY") : null,
          rejectionDate: null,
          rejectionReason: "",
          statusTeknisi: statusTeknisi,
          statusPembayaran: rental.status_pembayaran === "belum_lunas" ? "belum_bayar" : rental.status_pembayaran,
          buktiPembayaran: rental.payment_proof_path ? rental.payment_proof_path.split('/').pop() : null,
          buktiUrl: rental.payment_proof_path ? (rental.payment_proof_path.startsWith('http') ? rental.payment_proof_path : `${getStorageUrl()}/storage/${rental.payment_proof_path}`) : "#",
          tglKonfirmasiBayar: null,
          denda: rental.denda || 0,
          statusDenda: rental.status_denda || "tidak_ada",
          buktiDendaUrl: rental.denda_payment_proof_path ? (rental.denda_payment_proof_path.startsWith('http') ? rental.denda_payment_proof_path : `${getStorageUrl()}/storage/${rental.denda_payment_proof_path}`) : null,
          buktiDenda: rental.denda_payment_proof_path ? rental.denda_payment_proof_path.split('/').pop() : null,
        };
      });
      setLoans(data);
    } catch (error) {
      console.error("Gagal mengambil data pengajuan", error);
    }
  };

  const [activeTab, setActiveTab] = useState("menunggu");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPaymentFilter, setSelectedPaymentFilter] = useState("Semua");
  const [selectedAlatFilter, setSelectedAlatFilter] = useState("Semua");

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [catatanInput, setCatatanInput] = useState("");
  const [isAdjustingSchedule, setIsAdjustingSchedule] = useState(false);
  const [tempAdjustedDates, setTempAdjustedDates] = useState(null);

  const [showConfirmRejectModal, setShowConfirmRejectModal] = useState(false);
  const [showRejectSuccessModal, setShowRejectSuccessModal] = useState(false);
  const [rejectReasonInput, setRejectReasonInput] = useState("");

  const [showPaymentConfirmModal, setShowPaymentConfirmModal] = useState(false);
  const [showPaymentSuccessModal, setShowPaymentSuccessModal] = useState(false);

  const [showPaymentRejectModal, setShowPaymentRejectModal] = useState(false);
  const [paymentRejectReason, setPaymentRejectReason] = useState("");

  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Modal Preview Bukti Pembayaran State
  const [showProofModal, setShowProofModal] = useState(false);
  const [proofModalUrl, setProofModalUrl] = useState("");
  const [proofModalTitle, setProofModalTitle] = useState("Bukti Pembayaran");

  const handleOpenProofModal = (url, title = "Bukti Pembayaran") => {
    if (!url || url === "#") {
      alert("Bukti pembayaran belum diunggah atau tidak ditemukan.");
      return;
    }
    setProofModalUrl(url);
    setProofModalTitle(title);
    setShowProofModal(true);
  };

  // Dual Scroll Controller: Synchronize inside pop up and outside background page scrolling
  useEffect(() => {
    const isAnyModalOpen =
      showDetailModal || showConfirmRejectModal || showPaymentConfirmModal || showPaymentSuccessModal || showProofModal || showRejectSuccessModal;

    if (isAnyModalOpen) {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
    }

    const handleWheelOutsideModal = (e) => {
      if (!isAnyModalOpen) return;

      // Find the active modal card content
      const modalBox = document.querySelector(".clean-rounded-modal-content");
      if (modalBox && !modalBox.contains(e.target)) {
        window.scrollBy({
          top: e.deltaY,
          behavior: "auto",
        });
      }
    };

    window.addEventListener("wheel", handleWheelOutsideModal, { passive: true });
    return () => {
      window.removeEventListener("wheel", handleWheelOutsideModal);
    };
  }, [showDetailModal, showConfirmRejectModal, showPaymentConfirmModal, showPaymentSuccessModal, showProofModal, showRejectSuccessModal]);

  const countMenunggu = useMemo(() => loans.filter((l) => l.statusTab === "menunggu").length, [loans]);
  const countDisetujui = useMemo(() => loans.filter((l) => l.statusTab === "disetujui").length, [loans]);
  const countDitolak = useMemo(() => loans.filter((l) => l.statusTab === "ditolak").length, [loans]);
  const countPembayaran = useMemo(
    () => loans.filter((l) => l.statusPembayaran && l.statusPembayaran !== "tidak_perlu").length,
    [loans]
  );

  const filteredData = useMemo(() => {
    let dataset = [];

    if (activeTab === "menunggu") {
      dataset = loans.filter((l) => l.statusTab === "menunggu");
    } else if (activeTab === "disetujui") {
      dataset = loans.filter((l) => l.statusTab === "disetujui");
    } else if (activeTab === "ditolak") {
      dataset = loans.filter((l) => l.statusTab === "ditolak");
    } else if (activeTab === "pembayaran") {
      dataset = loans.filter((l) => l.statusPembayaran && l.statusPembayaran !== "tidak_perlu");

      if (selectedPaymentFilter === "Belum Bayar") {
        dataset = dataset.filter((l) => l.statusPembayaran === "belum_bayar");
      } else if (selectedPaymentFilter === "Menunggu") {
        dataset = dataset.filter((l) => l.statusPembayaran === "menunggu");
      } else if (selectedPaymentFilter === "Lunas") {
        dataset = dataset.filter((l) => l.statusPembayaran === "lunas");
      }
    }

    if (selectedAlatFilter !== "Semua") {
      dataset = dataset.filter((l) => l.alat.toLowerCase().includes(selectedAlatFilter.toLowerCase()));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      dataset = dataset.filter(
        (l) =>
          l.noPengajuan.toLowerCase().includes(q) ||
          l.namaPeminjam.toLowerCase().includes(q) ||
          l.alat.toLowerCase().includes(q) ||
          l.tanggalPinjam.toLowerCase().includes(q)
      );
    }

    return dataset;
  }, [loans, activeTab, selectedPaymentFilter, selectedAlatFilter, searchQuery]);

  const handleOpenDetail = (item) => {
    setSelectedItem(item);
    setCatatanInput(item.catatan || "");
    setIsAdjustingSchedule(false);
    setTempAdjustedDates(null);
    setShowDetailModal(true);
  };

  const handleApprove = async () => {
    if (!selectedItem) return;

    try {
      await axios.put(`http://localhost:8000/api/rentals/${selectedItem.id}/verify`, {
        status: "disetujui",
        catatan_koordinator: catatanInput
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      fetchRentals();
    } catch (error) {
      console.error("Gagal menyetujui pengajuan", error);
      alert("Gagal menyetujui pengajuan");
    }

    setShowDetailModal(false);
  };

  const handleOpenRejectPrompt = () => {
    setRejectReasonInput("");
    setShowConfirmRejectModal(true);
  };

  const handleExecuteReject = async () => {
    if (!selectedItem) return;
    const reason = rejectReasonInput.trim() || catatanInput.trim() || "Tanggal yang diajukan tidak tersedia";

    try {
      await axios.put(`http://localhost:8000/api/rentals/${selectedItem.id}/verify`, {
        status: "ditolak",
        catatan_koordinator: reason
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      fetchRentals();
      setShowConfirmRejectModal(false);
      setShowDetailModal(false);
      setShowRejectSuccessModal(true);
    } catch (error) {
      console.error("Gagal menolak pengajuan", error);
      alert("Gagal menolak pengajuan");
    }
  };

  const handleOpenPaymentConfirm = () => {
    setShowPaymentConfirmModal(true);
  };

  const handleExecutePaymentConfirm = async () => {
    if (!selectedItem) return;

    try {
      await axios.put(`http://localhost:8000/api/rentals/${selectedItem.id}/verify-payment`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      fetchRentals();
      setShowPaymentConfirmModal(false);
      setShowDetailModal(false);
      setShowPaymentSuccessModal(true);
    } catch (error) {
      console.error("Gagal verifikasi pembayaran", error);
      alert("Gagal memverifikasi pembayaran");
    }
  };

  const handleOpenPaymentReject = () => {
    setPaymentRejectReason("");
    setShowPaymentRejectModal(true);
  };

  const handleExecutePaymentReject = async () => {
    if (!selectedItem) return;
    const reason = paymentRejectReason.trim() || "Pembayaran ditolak/tidak valid";

    try {
      await axios.put(`http://localhost:8000/api/rentals/${selectedItem.id}/reject-payment`, {
        alasan: reason
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      fetchRentals();
      setShowPaymentRejectModal(false);
      setShowDetailModal(false);
    } catch (error) {
      console.error("Gagal menolak pembayaran", error);
      alert("Gagal menolak pembayaran");
    }
  };

  const handleExecuteDendaConfirm = async () => {
    if (!selectedItem) return;

    try {
      await axios.put(`http://localhost:8000/api/rentals/${selectedItem.id}/verify-denda`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      fetchRentals();
      setShowDetailModal(false);
      alert("Pembayaran denda berhasil diverifikasi");
    } catch (error) {
      console.error("Gagal verifikasi pembayaran denda", error);
      alert("Gagal memverifikasi pembayaran denda");
    }
  };

  const colors = {
    headerBrown: "#A6867B",
    badgeGreenBg: "#86EFAC",
    badgeGreenText: "#166534",
    badgeRedBg: "#FCA5A5",
    badgeRedText: "#991B1B",
    badgeBlueBg: "#93C5FD",
    badgeBlueText: "#1E40AF",
    btnDark: "#372926",
    bgGray: "#FAF9F8",
  };

  return (
    <NavbarLoginKoordinator>
      <style>{`
        @media (max-width: 768px) {
          .manajemen-pengajuan-page {
            padding: 16px 12px 40px !important;
          }
          .manajemen-main-card {
            padding: 16px 14px !important;
            border-radius: 14px !important;
          }
          .manajemen-tabs-bar {
            overflow-x: auto;
            padding-bottom: 8px;
            scrollbar-width: none;
          }
          .manajemen-tabs-bar::-webkit-scrollbar { display: none; }
          .manajemen-topbar-row > div {
            width: 100%;
          }
          .manajemen-topbar-row .d-flex {
            justify-content: flex-start !important;
          }
        }
      `}</style>
      <div
        className="manajemen-pengajuan-page"
        style={{
          backgroundColor: "#FAF9F8",
          minHeight: "calc(100vh - 70px)",
          fontFamily: "Poppins, sans-serif",
          padding: "24px 32px 48px",
        }}
      >
        <Container fluid className="px-0">
          {/* Main Card Container */}
          <div
            className="manajemen-main-card"
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "18px",
              boxShadow: "0 2px 14px rgba(0,0,0,0.04)",
              border: "1px solid #EDEDED",
              padding: "24px 28px",
            }}
          >
            {/* Top Bar: Search and Filter */}
            <Row className="manajemen-topbar-row align-items-center mb-4 g-3">
              <Col xs={12} sm={6} md={5} lg={4}>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <input
                    type="text"
                    placeholder="Cari..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 36px 8px 16px",
                      borderRadius: "20px",
                      border: "1px solid #D5D5D5",
                      fontSize: "0.88rem",
                      backgroundColor: "#FAFAFA",
                      outline: "none",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = colors.headerBrown)}
                    onBlur={(e) => (e.target.style.borderColor = "#D5D5D5")}
                  />
                  <FaSearch size={14} style={{ position: "absolute", right: "14px", color: "#888888", pointerEvents: "none" }} />
                </div>
              </Col>

              <Col xs={12} sm={6} md={7} lg={8} className="d-flex justify-content-sm-end align-items-center gap-2">
                <Dropdown show={showFilterDropdown} onToggle={(isOpen) => setShowFilterDropdown(isOpen)}>
                  <Dropdown.Toggle
                    as="button"
                    style={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #D5D5D5",
                      borderRadius: "20px",
                      padding: "7px 18px",
                      fontSize: "0.88rem",
                      fontWeight: "500",
                      color: "#424242",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                    }}
                  >
                    <span>Filter</span>
                    <FaFilter size={12} color="#616161" />
                  </Dropdown.Toggle>

                  <Dropdown.Menu align="end" className="p-3 shadow-lg border-0" style={{ minWidth: "220px", borderRadius: "16px" }}>
                    <h6 className="fw-bold mb-2" style={{ fontSize: "0.85rem" }}>
                      Filter Berdasarkan Alat
                    </h6>
                    {["Semua", "Micropipette", "Spectrophotometer", "Centrifuge", "Timbangan"].map((item) => (
                      <Dropdown.Item
                        key={item}
                        active={selectedAlatFilter === item}
                        onClick={() => {
                          setSelectedAlatFilter(item);
                          setShowFilterDropdown(false);
                        }}
                        style={{ fontSize: "0.85rem", borderRadius: "8px", marginBottom: "2px" }}
                      >
                        {item}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </Col>
            </Row>

            {/* Navigation Tabs */}
            <div
              className="manajemen-tabs-bar d-flex align-items-center mb-4"
              style={{
                gap: "12px",
                borderBottom: "1px solid #EEEEEE",
                paddingBottom: "12px",
              }}
            >
              {[
                { key: "menunggu", label: `Menunggu (${countMenunggu})` },
                { key: "disetujui", label: `Disetujui (${countDisetujui})` },
                { key: "ditolak", label: `Ditolak (${countDitolak})` },
                { key: "pembayaran", label: `Pembayaran (${countPembayaran})` },
              ].map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    style={{
                      border: isActive ? "1px solid #7D645B" : "1px solid #D5D5D5",
                      backgroundColor: isActive ? "#F5ECE8" : "#FFFFFF",
                      color: isActive ? "#5C4033" : "#555555",
                      borderRadius: "20px",
                      padding: "7px 20px",
                      fontSize: "0.88rem",
                      fontWeight: isActive ? "600" : "500",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      transition: "all 0.2s ease-in-out",
                      boxShadow: isActive ? "0 2px 6px rgba(166, 134, 123, 0.2)" : "none",
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Subtitle & Filter on Tab Pembayaran */}
            {activeTab === "pembayaran" && (
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3 mt-1">
                <div>
                  <h6 className="fw-bold mb-1" style={{ color: "#212121", fontSize: "1rem" }}>
                    Data Pembayaran
                  </h6>
                  <p className="text-muted mb-0" style={{ fontSize: "0.82rem" }}>
                    Lihat data peserta peminjaman alat berbayar disini.
                  </p>
                </div>

                <Dropdown>
                  <Dropdown.Toggle
                    as="button"
                    style={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #D5D5D5",
                      borderRadius: "16px",
                      padding: "5px 16px",
                      fontSize: "0.82rem",
                      color: "#424242",
                      fontWeight: "500",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span>{selectedPaymentFilter}</span>
                    <FaChevronDown size={10} color="#757575" />
                  </Dropdown.Toggle>

                  <Dropdown.Menu align="end" style={{ borderRadius: "12px" }}>
                    {["Semua", "Belum Bayar", "Menunggu", "Lunas"].map((opt) => (
                      <Dropdown.Item
                        key={opt}
                        active={selectedPaymentFilter === opt}
                        onClick={() => setSelectedPaymentFilter(opt)}
                        style={{ fontSize: "0.85rem" }}
                      >
                        {opt}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            )}

            {/* Main Table */}
            <div className="table-responsive" style={{ WebkitOverflowScrolling: "touch", overflowX: "auto" }}>
              <Table hover className="align-middle mb-0" style={{ borderCollapse: "separate", borderSpacing: "0" }}>
                <thead>
                  <tr style={{ backgroundColor: "#F9FAFB", borderBottom: "1.5px solid #E5E7EB" }}>
                    <th style={{ fontSize: "0.85rem", fontWeight: "600", color: "#4B5563", padding: "12px 14px", width: "50px" }}>No</th>
                    <th style={{ fontSize: "0.85rem", fontWeight: "600", color: "#4B5563", padding: "12px 14px" }}>No Pengajuan</th>
                    <th style={{ fontSize: "0.85rem", fontWeight: "600", color: "#4B5563", padding: "12px 14px" }}>Nama Peminjam</th>
                    <th style={{ fontSize: "0.85rem", fontWeight: "600", color: "#4B5563", padding: "12px 14px" }}>Alat</th>
                    <th style={{ fontSize: "0.85rem", fontWeight: "600", color: "#4B5563", padding: "12px 14px" }}>Tanggal Pinjam</th>
                    <th style={{ fontSize: "0.85rem", fontWeight: "600", color: "#4B5563", padding: "12px 14px" }}>Status</th>
                    <th style={{ fontSize: "0.85rem", fontWeight: "600", color: "#4B5563", padding: "12px 14px", textAlign: "center", width: "100px" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-5 text-muted" style={{ fontSize: "0.9rem" }}>
                        Tidak ada data pengajuan peminjaman untuk kriteria ini.
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item, index) => {
                      let badgeElement = null;

                      if (activeTab === "menunggu") {
                        badgeElement = (
                          <span
                            style={{
                              backgroundColor: "#E5E7EB",
                              color: "#374151",
                              padding: "4px 14px",
                              borderRadius: "20px",
                              fontSize: "0.78rem",
                              fontWeight: "600",
                              display: "inline-block",
                            }}
                          >
                            Menunggu
                          </span>
                        );
                      } else if (activeTab === "disetujui") {
                        badgeElement = (
                          <span
                            style={{
                              backgroundColor: colors.badgeGreenBg,
                              color: colors.badgeGreenText,
                              padding: "4px 14px",
                              borderRadius: "20px",
                              fontSize: "0.78rem",
                              fontWeight: "600",
                              display: "inline-block",
                            }}
                          >
                            Disetujui
                          </span>
                        );
                      } else if (activeTab === "ditolak") {
                        badgeElement = (
                          <span
                            style={{
                              backgroundColor: colors.badgeRedBg,
                              color: colors.badgeRedText,
                              padding: "4px 14px",
                              borderRadius: "20px",
                              fontSize: "0.78rem",
                              fontWeight: "600",
                              display: "inline-block",
                            }}
                          >
                            Ditolak
                          </span>
                        );
                      } else if (activeTab === "pembayaran") {
                        if (item.statusPembayaran === "lunas") {
                          badgeElement = (
                            <span
                              style={{
                                backgroundColor: colors.badgeBlueBg,
                                color: colors.badgeBlueText,
                                padding: "4px 14px",
                                borderRadius: "20px",
                                fontSize: "0.78rem",
                                fontWeight: "600",
                                display: "inline-block",
                              }}
                            >
                              Lunas
                            </span>
                          );
                        } else if (item.statusPembayaran === "menunggu") {
                          badgeElement = (
                            <span
                              style={{
                                backgroundColor: "#FEF08A",
                                color: "#854D0E",
                                padding: "4px 14px",
                                borderRadius: "20px",
                                fontSize: "0.78rem",
                                fontWeight: "600",
                                display: "inline-block",
                              }}
                            >
                              Menunggu
                            </span>
                          );
                        } else {
                          badgeElement = (
                            <span
                              style={{
                                backgroundColor: "#E5E7EB",
                                color: "#4B5563",
                                padding: "4px 14px",
                                borderRadius: "20px",
                                fontSize: "0.78rem",
                                fontWeight: "600",
                                display: "inline-block",
                              }}
                            >
                              Belum Bayar
                            </span>
                          );
                        }
                      }

                      return (
                        <tr key={item.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                          <td style={{ fontSize: "0.85rem", padding: "12px 14px", color: "#6B7280" }}>{index + 1}</td>
                          <td style={{ fontSize: "0.85rem", padding: "12px 14px", fontWeight: "600", color: "#1F2937" }}>{item.noPengajuan}</td>
                          <td style={{ fontSize: "0.85rem", padding: "12px 14px", color: "#1F2937" }}>{item.namaPeminjam}</td>
                          <td style={{ fontSize: "0.85rem", padding: "12px 14px", color: "#374151" }}>{item.alat}</td>
                          <td style={{ fontSize: "0.85rem", padding: "12px 14px", color: "#4B5563" }}>{item.tanggalPinjam}</td>
                          <td style={{ fontSize: "0.85rem", padding: "12px 14px" }}>{badgeElement}</td>
                          <td style={{ fontSize: "0.85rem", padding: "12px 14px", textAlign: "center" }}>
                            <button
                              type="button"
                              onClick={() => handleOpenDetail(item)}
                              style={{
                                backgroundColor: "#382E2B",
                                color: "#FFFFFF",
                                border: "none",
                                borderRadius: "20px",
                                padding: "5px 18px",
                                fontSize: "0.8rem",
                                fontWeight: "500",
                                cursor: "pointer",
                                transition: "all 0.2s",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.15)")}
                              onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
                            >
                              Detail
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </Table>
            </div>
          </div>
        </Container>

        {/* ========================================================================= */}
        {/* 1. MODAL DETAIL PEMINJAMAN (TAB MENUNGGU) - Screenshot Page 2, 3, 4       */}
        {/* ========================================================================= */}
        {activeTab === "menunggu" && selectedItem && (
          <Modal
            show={showDetailModal}
            onHide={() => setShowDetailModal(false)}
            centered
            dialogClassName="clean-rounded-modal-dialog"
            contentClassName="clean-rounded-modal-content"
          >
            <div className="clean-modal-header">
              Detail Peminjaman
              <button type="button" onClick={() => setShowDetailModal(false)} className="clean-modal-close-btn">
                <FaTimes size={16} />
              </button>
            </div>

            <div className="clean-modal-body">
              <Row className="mb-2">
                <Col xs={6}>
                  <small className="text-muted d-block" style={{ fontSize: "0.75rem" }}>
                    Nama
                  </small>
                  <span className="fw-semibold" style={{ fontSize: "0.85rem", color: "#212121" }}>
                    {selectedItem.namaPeminjam}
                  </span>
                </Col>
                <Col xs={6} className="text-end">
                  <small className="text-muted d-block" style={{ fontSize: "0.75rem" }}>
                    No. Pengajuan
                  </small>
                  <span className="fw-semibold" style={{ fontSize: "0.85rem", color: "#212121" }}>
                    {selectedItem.noPengajuan}
                  </span>
                </Col>
              </Row>

              <Row className="mb-2">
                <Col xs={6}>
                  <small className="text-muted d-block" style={{ fontSize: "0.75rem" }}>
                    Program Studi
                  </small>
                  <span className="fw-medium" style={{ fontSize: "0.85rem", color: "#424242" }}>
                    {selectedItem.programStudi}
                  </span>
                </Col>
                <Col xs={6} className="text-end">
                  <small className="text-muted d-block" style={{ fontSize: "0.75rem" }}>
                    NIM
                  </small>
                  <span className="fw-medium" style={{ fontSize: "0.85rem", color: "#424242" }}>
                    {selectedItem.nim}
                  </span>
                </Col>
              </Row>

              <hr style={{ borderColor: "#EAEAEA", margin: "10px 0" }} />

              <Row className="mb-2">
                <Col xs={6}>
                  <small className="text-muted d-block" style={{ fontSize: "0.75rem" }}>
                    Alat
                  </small>
                  <span className="fw-medium" style={{ fontSize: "0.85rem", color: "#424242" }}>
                    {selectedItem.alat}
                  </span>
                </Col>
                <Col xs={6} className="text-end">
                  <small className="text-muted d-block" style={{ fontSize: "0.75rem" }}>
                    Jumlah
                  </small>
                  <span className="fw-medium" style={{ fontSize: "0.85rem", color: "#424242" }}>
                    {selectedItem.jumlah}
                  </span>
                </Col>
              </Row>

              <Row className="mb-2">
                <Col xs={6}>
                  <small className="text-muted d-block" style={{ fontSize: "0.75rem" }}>
                    Keperluan
                  </small>
                  <span className="fw-medium" style={{ fontSize: "0.85rem", color: "#424242" }}>
                    {selectedItem.keperluan}
                  </span>
                </Col>
                <Col xs={6} className="text-end">
                  <small className="text-muted d-block" style={{ fontSize: "0.75rem" }}>
                    Tanggal Peminjaman
                  </small>
                  <span className="fw-medium" style={{ fontSize: "0.85rem", color: "#424242" }}>
                    {tempAdjustedDates ? `${tempAdjustedDates[0]} - ${tempAdjustedDates[1]}` : selectedItem.tanggalPinjamRange}
                  </span>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col xs={4}>
                  <small className="text-muted d-block" style={{ fontSize: "0.75rem" }}>
                    Surat Pengajuan
                  </small>
                  <a
                    href={selectedItem.suratUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: "#3B82F6",
                      fontSize: "0.82rem",
                      textDecoration: "underline",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <FaFilePdf size={12} color="#EF4444" />
                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "90px" }}>
                      {selectedItem.suratFile}
                    </span>
                  </a>
                </Col>
                <Col xs={4} className="text-center">
                  <small className="text-muted d-block" style={{ fontSize: "0.75rem" }}>
                    Bukti Bayar
                  </small>
                  {selectedItem.buktiPembayaran && selectedItem.buktiPembayaran !== null ? (
                    <button
                      type="button"
                      onClick={() => handleOpenProofModal(selectedItem.buktiUrl, "Bukti Pembayaran Sewa")}
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        color: "#3B82F6",
                        fontSize: "0.82rem",
                        textDecoration: "underline",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "4px",
                        cursor: "pointer",
                      }}
                    >
                      <FaFilePdf size={12} color="#EF4444" />
                      <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "90px" }}>
                        {selectedItem.buktiPembayaran}
                      </span>
                    </button>
                  ) : (
                    <span style={{ fontSize: "0.82rem", color: "#9CA3AF" }}>-</span>
                  )}
                </Col>
                <Col xs={4} className="text-end">
                  <small className="text-muted d-block" style={{ fontSize: "0.75rem" }}>
                    Biaya
                  </small>
                  <span className="fw-bold" style={{ fontSize: "0.92rem", color: "#1F2937" }}>
                    Rp {selectedItem.biaya ? selectedItem.biaya.toLocaleString("id-ID") : "0"}
                  </span>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col xs={12} className="text-end">
                  <small className="text-muted d-block" style={{ fontSize: "0.75rem" }}>
                    Status Pembayaran
                  </small>
                  {selectedItem.statusPembayaran === "lunas" ? (
                    <span style={{ fontSize: "0.82rem", fontWeight: "600", color: "#16A34A" }}>Lunas</span>
                  ) : selectedItem.statusPembayaran === "menunggu" ? (
                    <span style={{ fontSize: "0.82rem", fontWeight: "600", color: "#D97706" }}>Menunggu Konfirmasi</span>
                  ) : selectedItem.statusPembayaran === "belum_bayar" ? (
                    <span style={{ fontSize: "0.82rem", fontWeight: "600", color: "#DC2626" }}>Belum Bayar</span>
                  ) : (
                    <span style={{ fontSize: "0.82rem", color: "#9CA3AF" }}>Tidak Perlu Pembayaran</span>
                  )}
                </Col>
              </Row>

              {/* Jadwal Penggunaan Section */}
              <div
                style={{
                  backgroundColor: "#FAF9F8",
                  borderRadius: "14px",
                  padding: "12px 14px",
                  marginBottom: "14px",
                  border: "1px solid #EAEAEA",
                }}
              >
                <div className="text-center mb-2">
                  <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "#374151" }}>
                    Jadwal Penggunaan
                  </span>
                </div>

                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
                  <div style={{ flex: 1, minWidth: "120px" }}>
                    {selectedItem.hasConflict && !tempAdjustedDates && (
                      <small style={{ color: "#DC2626", fontSize: "0.72rem", lineHeight: "1.2", display: "block" }}>
                        {selectedItem.conflictNote}
                      </small>
                    )}
                  </div>

                  <div className="d-flex align-items-center gap-2 ms-auto">
                    <span className="fw-medium" style={{ fontSize: "0.82rem", color: "#1F2937" }}>
                      {selectedItem.tanggalPinjamRange}
                    </span>
                  </div>
                </div>

                <div className="text-center mt-2">
                  {selectedItem.hasConflict && !tempAdjustedDates ? (
                    <span
                      style={{
                        backgroundColor: "#FEE2E2",
                        color: "#DC2626",
                        padding: "3px 12px",
                        borderRadius: "20px",
                        fontSize: "0.72rem",
                        fontWeight: "600",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <FaExclamationTriangle size={10} /> Jadwal Bentrok
                    </span>
                  ) : (
                    <span
                      style={{
                        backgroundColor: "#DCFCE7",
                        color: "#16A34A",
                        padding: "3px 12px",
                        borderRadius: "20px",
                        fontSize: "0.72rem",
                        fontWeight: "600",
                        display: "inline-block",
                      }}
                    >
                      Tidak Ada Bentrok
                    </span>
                  )}
                </div>
              </div>

              {/* Catatan Setuju */}
              <div className="mb-4">
                <label className="fw-medium mb-1" style={{ fontSize: "0.8rem", color: "#374151" }}>
                  Catatan Setuju
                </label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Tambahkan catatan jika diperlukan..."
                  value={catatanInput}
                  onChange={(e) => setCatatanInput(e.target.value)}
                  style={{
                    borderRadius: "12px",
                    border: "1px solid #D1D5DB",
                    fontSize: "0.82rem",
                    padding: "8px 12px",
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className="d-flex justify-content-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  className="clean-btn-secondary"
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={handleOpenRejectPrompt}
                  className="clean-btn-danger"
                >
                  Tolak
                </button>

                <button
                  type="button"
                  onClick={handleApprove}
                  className="clean-btn-primary"
                >
                  Setujui
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* ========================================================================= */}
        {/* 2. MODAL DETAIL STATUS (TAB DISETUJUI) - Screenshot Page 6               */}
        {/* ========================================================================= */}
        {activeTab === "disetujui" && selectedItem && (
          <Modal
            show={showDetailModal}
            onHide={() => setShowDetailModal(false)}
            centered
            dialogClassName="clean-rounded-modal-dialog"
            contentClassName="clean-rounded-modal-content"
          >
            <div className="clean-modal-header">
              Detail Status
              <button type="button" onClick={() => setShowDetailModal(false)} className="clean-modal-close-btn">
                <FaTimes size={16} />
              </button>
            </div>

            <div className="clean-modal-body">
              <div className="mb-3" style={{ fontSize: "0.85rem" }}>
                <div className="d-flex mb-2">
                  <div style={{ width: "90px", color: "#4B5563" }}>Nama</div>
                  <div style={{ color: "#1F2937", fontWeight: "500" }}>: {selectedItem.namaPeminjam}</div>
                </div>
                <div className="d-flex mb-2">
                  <div style={{ width: "90px", color: "#4B5563" }}>Alat</div>
                  <div style={{ color: "#1F2937", fontWeight: "500" }}>: {selectedItem.alat}</div>
                </div>
                <div className="d-flex mb-2">
                  <div style={{ width: "90px", color: "#4B5563" }}>Tanggal</div>
                  <div style={{ color: "#1F2937", fontWeight: "500" }}>: {selectedItem.tanggalPinjamRange || selectedItem.tanggalPinjam}</div>
                </div>
              </div>

              <hr style={{ borderColor: "#EAEAEA", margin: "14px 0" }} />

              <div className="mb-3">
                <small className="text-muted d-block mb-1" style={{ fontSize: "0.75rem" }}>
                  Status
                </small>
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <span
                    style={{
                      backgroundColor: colors.badgeGreenBg,
                      color: colors.badgeGreenText,
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                    }}
                  >
                    Telah Disetujui
                  </span>

                  <div className="text-end">
                    <small className="text-muted d-block" style={{ fontSize: "0.7rem" }}>
                      Tanggal Persetujuan
                    </small>
                    <span style={{ fontSize: "0.8rem", fontWeight: "500", color: "#374151" }}>
                      {selectedItem.approvalDate || "02 Juli 2026"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <small className="text-muted d-block mb-1" style={{ fontSize: "0.75rem" }}>
                  Teknisi
                </small>
                <span style={{ fontSize: "0.85rem", fontWeight: "500", color: "#4B5563" }}>
                  {selectedItem.statusTeknisi || "Belum Mengambil Alat"}
                </span>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  className="clean-btn-primary"
                  style={{ padding: "7px 36px" }}
                >
                  Oke
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* ========================================================================= */}
        {/* 3. MODAL DETAIL STATUS (TAB DITOLAK) - Screenshot Page 8                  */}
        {/* ========================================================================= */}
        {activeTab === "ditolak" && selectedItem && (
          <Modal
            show={showDetailModal}
            onHide={() => setShowDetailModal(false)}
            centered
            dialogClassName="clean-rounded-modal-dialog"
            contentClassName="clean-rounded-modal-content"
          >
            <div className="clean-modal-header">
              Detail Status
              <button type="button" onClick={() => setShowDetailModal(false)} className="clean-modal-close-btn">
                <FaTimes size={16} />
              </button>
            </div>

            <div className="clean-modal-body">
              <div className="mb-3" style={{ fontSize: "0.85rem" }}>
                <div className="d-flex mb-2">
                  <div style={{ width: "90px", color: "#4B5563" }}>Nama</div>
                  <div style={{ color: "#1F2937", fontWeight: "500" }}>: {selectedItem.namaPeminjam}</div>
                </div>
                <div className="d-flex mb-2">
                  <div style={{ width: "90px", color: "#4B5563" }}>Alat</div>
                  <div style={{ color: "#1F2937", fontWeight: "500" }}>: {selectedItem.alat}</div>
                </div>
                <div className="d-flex mb-2">
                  <div style={{ width: "90px", color: "#4B5563" }}>Tanggal</div>
                  <div style={{ color: "#1F2937", fontWeight: "500" }}>: {selectedItem.tanggalPinjamRange || selectedItem.tanggalPinjam}</div>
                </div>
              </div>

              <hr style={{ borderColor: "#EAEAEA", margin: "14px 0" }} />

              <div className="mb-3">
                <small className="text-muted d-block mb-1" style={{ fontSize: "0.75rem" }}>
                  Status
                </small>
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <span
                    style={{
                      backgroundColor: colors.badgeRedBg,
                      color: colors.badgeRedText,
                      padding: "4px 14px",
                      borderRadius: "20px",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                    }}
                  >
                    Ditolak
                  </span>

                  <div className="text-end">
                    <small className="text-muted d-block" style={{ fontSize: "0.7rem" }}>
                      Tanggal Penolakan
                    </small>
                    <span style={{ fontSize: "0.8rem", fontWeight: "500", color: "#374151" }}>
                      {selectedItem.rejectionDate || "02 Juli 2026"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <small className="text-muted d-block mb-1" style={{ fontSize: "0.75rem" }}>
                  Alasan
                </small>
                <span style={{ fontSize: "0.85rem", color: "#4B5563" }}>
                  {selectedItem.rejectionReason || "Tanggal yang diajukan tidak tersedia"}
                </span>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  className="clean-btn-primary"
                  style={{ padding: "7px 36px" }}
                >
                  Oke
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* ========================================================================= */}
        {/* 4. MODAL DETAIL PEMBAYARAN (TAB PEMBAYARAN) - Page 10, 13, 14              */}
        {/* ========================================================================= */}
        {activeTab === "pembayaran" && selectedItem && (
          <Modal
            show={showDetailModal}
            onHide={() => setShowDetailModal(false)}
            centered
            dialogClassName="clean-rounded-modal-dialog"
            contentClassName="clean-rounded-modal-content"
          >
            <div className="clean-modal-header">
              Detail Pembayaran
              <button type="button" onClick={() => setShowDetailModal(false)} className="clean-modal-close-btn">
                <FaTimes size={16} />
              </button>
            </div>

            <div className="clean-modal-body">
              <Row className="mb-2">
                <Col xs={6}>
                  <small className="text-muted d-block" style={{ fontSize: "0.75rem" }}>
                    Nama
                  </small>
                  <span className="fw-semibold" style={{ fontSize: "0.85rem", color: "#212121" }}>
                    {selectedItem.namaPeminjam}
                  </span>
                </Col>
                <Col xs={6} className="text-end">
                  <small className="text-muted d-block" style={{ fontSize: "0.75rem" }}>
                    No. Pengajuan
                  </small>
                  <span className="fw-semibold" style={{ fontSize: "0.85rem", color: "#212121" }}>
                    {selectedItem.noPengajuan}
                  </span>
                </Col>
              </Row>

              <Row className="mb-2">
                <Col xs={6}>
                  <small className="text-muted d-block" style={{ fontSize: "0.75rem" }}>
                    Alat
                  </small>
                  <span className="fw-medium" style={{ fontSize: "0.85rem", color: "#424242" }}>
                    {selectedItem.alat}
                  </span>
                </Col>
                <Col xs={6} className="text-end">
                  <small className="text-muted d-block" style={{ fontSize: "0.75rem" }}>
                    Jumlah
                  </small>
                  <span className="fw-medium" style={{ fontSize: "0.85rem", color: "#424242" }}>
                    {selectedItem.jumlah}
                  </span>
                </Col>
              </Row>

              <hr style={{ borderColor: "#EAEAEA", margin: "12px 0" }} />

              {/* Total Pembayaran Banner */}
              <div className="text-center my-3">
                <small className="text-muted d-block mb-1" style={{ fontSize: "0.78rem" }}>
                  Total Pembayaran
                </small>
                <h4 className="fw-bold mb-2" style={{ color: "#1F2937", fontSize: "1.35rem" }}>
                  Rp {selectedItem.biaya ? selectedItem.biaya.toLocaleString("id-ID") : "40.000"}
                </h4>

                {selectedItem.statusPembayaran === "lunas" && (
                  <div>
                    <span
                      style={{
                        backgroundColor: colors.badgeBlueBg,
                        color: colors.badgeBlueText,
                        padding: "4px 16px",
                        borderRadius: "20px",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        display: "inline-block",
                      }}
                    >
                      Lunas
                    </span>
                    <small className="text-muted d-block mt-1" style={{ fontSize: "0.72rem" }}>
                      dikonfirmasi pada {selectedItem.tglKonfirmasiBayar || "11/08/2026"}
                    </small>
                  </div>
                )}

                {selectedItem.statusPembayaran === "menunggu" && (
                  <span
                    style={{
                      backgroundColor: "#FEF08A",
                      color: "#854D0E",
                      padding: "4px 16px",
                      borderRadius: "20px",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      display: "inline-block",
                    }}
                  >
                    Menunggu Konfirmasi
                  </span>
                )}

                {selectedItem.statusPembayaran === "belum_bayar" && (
                  <span
                    style={{
                      backgroundColor: "#E5E7EB",
                      color: "#4B5563",
                      padding: "4px 16px",
                      borderRadius: "20px",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      display: "inline-block",
                    }}
                  >
                    Belum Melakukan Pembayaran
                  </span>
                )}
              </div>

              {/* Bukti Pembayaran */}
              {selectedItem.statusPembayaran !== "belum_bayar" && (
                <div className="mb-3 text-start">
                  <small className="text-muted d-block mb-1" style={{ fontSize: "0.75rem" }}>
                    Bukti Pembayaran
                  </small>
                  {selectedItem.buktiUrl && selectedItem.buktiUrl !== "#" ? (
                    <button
                      type="button"
                      onClick={() => handleOpenProofModal(selectedItem.buktiUrl, "Bukti Pembayaran Sewa Alat")}
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        color: "#3B82F6",
                        fontSize: "0.82rem",
                        textDecoration: "underline",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        cursor: "pointer",
                      }}
                    >
                      <FaFilePdf size={13} color="#EF4444" />
                      {selectedItem.buktiPembayaran || "Bukti_Transfer.pdf"}
                    </button>
                  ) : (
                    <span style={{ fontSize: "0.82rem", color: "#9CA3AF" }}>Belum ada bukti</span>
                  )}
                </div>
              )}

              {/* Denda Keterlambatan/Kerusakan */}
              {selectedItem.denda > 0 && (
                <>
                  <hr style={{ borderColor: "#EAEAEA", margin: "16px 0" }} />
                  <div className="text-center my-3">
                    <small className="text-muted d-block mb-1" style={{ fontSize: "0.78rem" }}>
                      Total Denda Keterlambatan / Kerusakan
                    </small>
                    <h4 className="fw-bold mb-2" style={{ color: "#DC2626", fontSize: "1.2rem" }}>
                      Rp {selectedItem.denda.toLocaleString("id-ID")}
                    </h4>

                    {selectedItem.statusDenda === "lunas" && (
                      <span
                        style={{
                          backgroundColor: colors.badgeBlueBg,
                          color: colors.badgeBlueText,
                          padding: "4px 16px",
                          borderRadius: "20px",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          display: "inline-block",
                        }}
                      >
                        Denda Lunas
                      </span>
                    )}

                    {(selectedItem.statusDenda === "menunggu" || (selectedItem.statusDenda === "belum_dibayar" && selectedItem.buktiDendaUrl)) && (
                      <span
                        style={{
                          backgroundColor: "#FEF08A",
                          color: "#854D0E",
                          padding: "4px 16px",
                          borderRadius: "20px",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          display: "inline-block",
                        }}
                      >
                        Menunggu Verifikasi Denda
                      </span>
                    )}

                    {selectedItem.statusDenda === "belum_dibayar" && !selectedItem.buktiDendaUrl && (
                      <span
                        style={{
                          backgroundColor: "#E5E7EB",
                          color: "#4B5563",
                          padding: "4px 16px",
                          borderRadius: "20px",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          display: "inline-block",
                        }}
                      >
                        Belum Melakukan Pembayaran Denda
                      </span>
                    )}
                  </div>

                  {selectedItem.statusDenda !== "tidak_ada" && selectedItem.buktiDendaUrl && (
                    <div className="mb-3 text-start">
                      <small className="text-muted d-block mb-1" style={{ fontSize: "0.75rem" }}>
                        Bukti Pembayaran Denda
                      </small>
                      <button
                        type="button"
                        onClick={() => handleOpenProofModal(selectedItem.buktiDendaUrl, "Bukti Pembayaran Denda")}
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          color: "#3B82F6",
                          fontSize: "0.82rem",
                          textDecoration: "underline",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          cursor: "pointer",
                        }}
                      >
                        <FaFilePdf size={13} color="#EF4444" />
                        {selectedItem.buktiDenda || "Bukti_Denda.pdf"}
                      </button>
                    </div>
                  )}

                  {(selectedItem.statusDenda === "menunggu" || (selectedItem.statusDenda === "belum_dibayar" && selectedItem.buktiDendaUrl)) && (
                    <div className="d-flex justify-content-center gap-2 mb-4">
                      <button
                        type="button"
                        onClick={handleExecuteDendaConfirm}
                        className="clean-btn-primary"
                        style={{ backgroundColor: "#059669" }}
                      >
                        Verifikasi Denda
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Catatan Field */}
              {selectedItem.statusPembayaran === "menunggu" && (
                <div className="mb-4 text-start">
                  <label className="fw-medium mb-1" style={{ fontSize: "0.78rem", color: "#374151" }}>
                    Catatan
                  </label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Tambahkan catatan jika diperlukan..."
                    style={{
                      borderRadius: "12px",
                      border: "1px solid #D1D5DB",
                      fontSize: "0.82rem",
                    }}
                  />
                </div>
              )}

              {/* Actions */}
              {selectedItem.statusPembayaran === "menunggu" ? (
                <div className="d-flex justify-content-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDetailModal(false)}
                    className="clean-btn-secondary"
                  >
                    Batal
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenPaymentReject}
                    className="clean-btn-danger"
                  >
                    Tolak
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenPaymentConfirm}
                    className="clean-btn-primary"
                  >
                    Konfirmasi
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowDetailModal(false)}
                    className="clean-btn-primary"
                    style={{ padding: "7px 36px" }}
                  >
                    Oke
                  </button>
                </div>
              )}
            </div>
          </Modal>
        )}

        {/* ========================================================================= */}
        {/* 5. POPUP KONFIRMASI TOLAK ("Apakah anda yakin menolak?")                  */}
        {/* ========================================================================= */}
        <Modal
          show={showConfirmRejectModal}
          onHide={() => setShowConfirmRejectModal(false)}
          centered
          dialogClassName="clean-rounded-modal-dialog-sm"
          contentClassName="clean-rounded-modal-content"
        >
          <div className="clean-modal-header">
            Detail Peminjaman
            <button type="button" onClick={() => setShowConfirmRejectModal(false)} className="clean-modal-close-btn">
              <FaTimes size={16} />
            </button>
          </div>

          <div className="clean-modal-body text-center">
            <h6 className="fw-bold mb-2" style={{ color: "#1F2937", fontSize: "0.95rem" }}>
              Apakah Anda yakin menolak?
            </h6>
            <p className="text-muted mb-3" style={{ fontSize: "0.78rem" }}>
              Pengajuan dari <b>{selectedItem?.namaPeminjam}</b> ({selectedItem?.noPengajuan}) akan ditolak.
            </p>

            <Form.Control
              as="textarea"
              rows={2}
              placeholder="Alasan penolakan (opsional)..."
              value={rejectReasonInput}
              onChange={(e) => setRejectReasonInput(e.target.value)}
              className="mb-3 text-start"
              style={{ borderRadius: "12px", fontSize: "0.8rem" }}
            />

            <div className="d-flex justify-content-center gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmRejectModal(false)}
                className="clean-btn-secondary"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteReject}
                className="clean-btn-danger"
              >
                Tolak
              </button>
            </div>
          </div>
        </Modal>

        {/* ========================================================================= */}
        {/* 6. POPUP KONFIRMASI PEMBAYARAN - Screenshot Page 11                       */}
        {/* ========================================================================= */}
        <Modal
          show={showPaymentConfirmModal}
          onHide={() => setShowPaymentConfirmModal(false)}
          centered
          dialogClassName="clean-rounded-modal-dialog-sm"
          contentClassName="clean-rounded-modal-content"
        >
          <div className="clean-modal-header">
            Detail Pembayaran
            <button type="button" onClick={() => setShowPaymentConfirmModal(false)} className="clean-modal-close-btn">
              <FaTimes size={16} />
            </button>
          </div>

          <div className="clean-modal-body text-center">
            <h6 className="fw-bold mb-2" style={{ color: "#1F2937", fontSize: "0.95rem" }}>
              Konfirmasi Pembayaran?
            </h6>
            <small className="text-muted d-block mb-1" style={{ fontSize: "0.75rem" }}>
              Total
            </small>
            <h5 className="fw-bold mb-4" style={{ color: "#1F2937" }}>
              Rp {selectedItem?.biaya ? selectedItem.biaya.toLocaleString("id-ID") : "40.000"}
            </h5>

            <div className="d-flex justify-content-center gap-2">
              <button
                type="button"
                onClick={() => setShowPaymentConfirmModal(false)}
                className="clean-btn-secondary"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecutePaymentConfirm}
                className="clean-btn-primary"
              >
                Konfirmasi
              </button>
            </div>
          </div>
        </Modal>

        {/* ========================================================================= */}
        {/* 7. POPUP SUKSES KONFIRMASI PEMBAYARAN - Screenshot Page 12                */}
        {/* ========================================================================= */}
        <Modal
          show={showPaymentSuccessModal}
          onHide={() => setShowPaymentSuccessModal(false)}
          centered
          dialogClassName="clean-rounded-modal-dialog-sm"
          contentClassName="clean-rounded-modal-content"
        >
          <div className="clean-modal-header">
            Detail Pembayaran
          </div>

          <div className="clean-modal-body text-center py-4">
            <div className="mb-3">
              <FaCheckCircle size={42} color="#16A34A" />
            </div>

            <p className="fw-semibold mb-4" style={{ color: "#1F2937", fontSize: "0.92rem" }}>
              Pembayaran berhasil dikonfirmasi.
            </p>

            <button
              type="button"
              onClick={() => setShowPaymentSuccessModal(false)}
              className="clean-btn-primary"
              style={{ padding: "6px 36px" }}
            >
              Oke
            </button>
          </div>
        </Modal>
        {/* ========================================================================= */}
        {/* POPUP SUKSES PENOLAKAN PENGAJUAN                                          */}
        {/* ========================================================================= */}
        <Modal
          show={showRejectSuccessModal}
          onHide={() => setShowRejectSuccessModal(false)}
          centered
          dialogClassName="clean-rounded-modal-dialog-sm"
          contentClassName="clean-rounded-modal-content"
        >
          <div className="clean-modal-header" style={{ backgroundColor: "#DC2626" }}>
            Status Pengajuan
          </div>

          <div className="clean-modal-body text-center py-4">
            <div className="mb-3">
              <FaCheckCircle size={42} color="#DC2626" />
            </div>

            <p className="fw-semibold mb-4" style={{ color: "#1F2937", fontSize: "0.92rem" }}>
              Pengajuan berhasil ditolak.
            </p>

            <button
              type="button"
              onClick={() => setShowRejectSuccessModal(false)}
              className="clean-btn-primary"
              style={{ padding: "6px 36px" }}
            >
              Oke
            </button>
          </div>
        </Modal>
        {/* ========================================================================= */}
        {/* MODAL KONFIRMASI TOLAK PEMBAYARAN                                         */}
        {/* ========================================================================= */}
        <Modal
          show={showPaymentRejectModal}
          onHide={() => setShowPaymentRejectModal(false)}
          centered
          dialogClassName="clean-rounded-modal-dialog"
          contentClassName="clean-rounded-modal-content"
        >
          <div className="clean-modal-header" style={{ borderBottom: "none", paddingBottom: 0 }}>
            <button type="button" onClick={() => setShowPaymentRejectModal(false)} className="clean-modal-close-btn">
              <FaTimes size={16} />
            </button>
          </div>
          <div className="clean-modal-body px-4 pb-4 pt-1">
            <div className="text-center mb-3">
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  backgroundColor: "#FEE2E2",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <FaTimes size={22} color="#DC2626" />
              </div>
              <h5 className="fw-bold mb-2" style={{ color: "#1F2937", fontSize: "1.1rem" }}>
                Tolak Pembayaran
              </h5>
              <p className="text-muted" style={{ fontSize: "0.85rem", lineHeight: "1.5" }}>
                Tuliskan alasan penolakan pembayaran.
              </p>
            </div>

            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Misal: Bukti transfer buram/nominal tidak sesuai..."
              value={paymentRejectReason}
              onChange={(e) => setPaymentRejectReason(e.target.value)}
              style={{
                borderRadius: "12px",
                border: "1px solid #D1D5DB",
                fontSize: "0.85rem",
                resize: "none",
              }}
            />

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setShowPaymentRejectModal(false)}
                className="clean-btn-secondary me-2"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecutePaymentReject}
                className="clean-btn-danger"
              >
                Tolak Pembayaran
              </button>
            </div>
          </div>
        </Modal>

        {/* ========================================================================= */}
        {/* MODAL PREVIEW BUKTI PEMBAYARAN                                            */}
        {/* ========================================================================= */}
        <Modal
          show={showProofModal}
          onHide={() => setShowProofModal(false)}
          centered
          size="lg"
          style={{ zIndex: 1080, fontFamily: "Poppins, sans-serif" }}
        >
          <div className="clean-rounded-modal-content" style={{ maxWidth: "600px", margin: "auto" }}>
            <div className="clean-modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px" }}>
              <span style={{ margin: "0 auto", paddingLeft: "20px", fontWeight: "600" }}>{proofModalTitle}</span>
              <button
                type="button"
                onClick={() => setShowProofModal(false)}
                className="clean-modal-close-btn"
                style={{ position: "static" }}
              >
                <FaTimes size={16} />
              </button>
            </div>
            <div className="clean-modal-body" style={{ textAlign: "center", padding: "20px", backgroundColor: "#FAFAFA" }}>
              {proofModalUrl && proofModalUrl !== "#" ? (
                <div style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid #E0E0E0", backgroundColor: "#FFF", padding: "12px", display: "inline-block", maxWidth: "100%" }}>
                  <img
                    src={proofModalUrl}
                    alt={proofModalTitle}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "68vh",
                      objectFit: "contain",
                      borderRadius: "8px",
                      display: "block",
                      margin: "0 auto",
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='160' viewBox='0 0 280 160'%3E%3Crect width='280' height='160' fill='%23f8f9fa'/%3E%3Ctext x='50%25' y='45%25' text-anchor='middle' dominant-baseline='middle' fill='%23777' font-family='sans-serif' font-size='14' font-weight='bold'%3EGambar Tidak Dapat Dimuat%3C/text%3E%3Ctext x='50%25' y='65%25' text-anchor='middle' dominant-baseline='middle' fill='%23999' font-family='sans-serif' font-size='11'%3EFile bukti mungkin berformat PDF atau belum tersedia%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  {proofModalUrl.toLowerCase().endsWith(".pdf") && (
                    <div className="mt-3">
                      <a
                        href={proofModalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm btn-outline-primary"
                        style={{ borderRadius: "20px", fontSize: "0.8rem", padding: "4px 16px" }}
                      >
                        Buka Dokumen PDF di Tab Baru
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-muted py-4">Tidak ada bukti yang dapat ditampilkan.</div>
              )}
            </div>
            <div style={{ padding: "12px 20px", backgroundColor: "#F9FAFB", borderTop: "1px solid #F3F4F6", textAlign: "right", borderBottomLeftRadius: "28px", borderBottomRightRadius: "28px" }}>
              <button
                type="button"
                onClick={() => setShowProofModal(false)}
                className="clean-btn-secondary"
              >
                Tutup
              </button>
            </div>
          </div>
        </Modal>
      </div>

      <FooterSetelahLogin />

      {/* Global & Scoped Modal Styles for Perfect Center Alignment & Dual Scroll */}
      <style>{`
        /* 1. Outer / Background Page & Modal Backdrop Scrolling */
        body.modal-open {
          overflow-y: auto !important;
          padding-right: 0 !important;
        }

        .modal {
          overflow-x: hidden !important;
          overflow-y: auto !important;
          padding: 0 !important;
          z-index: 1065 !important;
        }

        /* Perfectly position and dead-center the modal inside the main dashboard workspace area */
        @media (min-width: 992px) {
          .modal {
            left: 240px !important;
            top: 70px !important;
            width: calc(100vw - 240px) !important;
            height: calc(100vh - 70px) !important;
          }
        }

        @media (max-width: 991.98px) {
          .modal {
            left: 0 !important;
            top: 70px !important;
            width: 100vw !important;
            height: calc(100vh - 70px) !important;
          }
        }

        .modal.show {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .clean-rounded-modal-dialog {
          max-width: 450px !important;
          width: 90% !important;
          margin: auto !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .clean-rounded-modal-dialog-sm {
          max-width: 370px !important;
          width: 88% !important;
          margin: auto !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .clean-rounded-modal-content {
          background-color: #FFFFFF !important;
          border-radius: 28px !important;
          border: none !important;
          overflow: hidden !important;
          box-shadow: 0 20px 55px rgba(0, 0, 0, 0.28) !important;
          max-height: 80vh !important;
          display: flex !important;
          flex-direction: column !important;
          width: 100% !important;
          margin: auto !important;
        }

        .clean-modal-header {
          background-color: #A6867B !important;
          color: #FFFFFF !important;
          padding: 13px 20px !important;
          text-align: center !important;
          font-weight: 600 !important;
          font-size: 1.02rem !important;
          position: relative !important;
          border-top-left-radius: 28px !important;
          border-top-right-radius: 28px !important;
          flex-shrink: 0 !important;
          width: 100% !important;
          margin: 0 !important;
          line-height: 1.3 !important;
        }

        .clean-modal-close-btn {
          position: absolute !important;
          right: 16px !important;
          top: 13px !important;
          background: transparent !important;
          border: none !important;
          color: #FFFFFF !important;
          cursor: pointer !important;
          opacity: 0.85 !important;
          transition: opacity 0.2s !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        .clean-modal-close-btn:hover {
          opacity: 1 !important;
        }

        /* 2. Inner Modal Body Scrolling */
        .clean-modal-body {
          padding: 18px 22px 22px !important;
          overflow-y: auto !important;
          max-height: calc(82vh - 50px) !important;
          background: #FFFFFF !important;
          border-bottom-left-radius: 28px !important;
          border-bottom-right-radius: 28px !important;
          flex: 1 1 auto !important;
          overscroll-behavior: contain !important;
        }

        /* Custom buttons matching design */
        .clean-btn-secondary {
          background-color: #E5E7EB !important;
          color: #374151 !important;
          border: none !important;
          border-radius: 24px !important;
          padding: 7px 22px !important;
          font-size: 0.84rem !important;
          font-weight: 500 !important;
          cursor: pointer !important;
          transition: all 0.2s !important;
        }
        .clean-btn-secondary:hover {
          filter: brightness(0.95);
        }

        .clean-btn-danger {
          background-color: #DC2626 !important;
          color: #FFFFFF !important;
          border: none !important;
          border-radius: 24px !important;
          padding: 7px 22px !important;
          font-size: 0.84rem !important;
          font-weight: 500 !important;
          cursor: pointer !important;
          transition: all 0.2s !important;
        }
        .clean-btn-danger:hover {
          filter: brightness(1.1);
        }

        .clean-btn-primary {
          background-color: #382E2B !important;
          color: #FFFFFF !important;
          border: none !important;
          border-radius: 24px !important;
          padding: 7px 24px !important;
          font-size: 0.84rem !important;
          font-weight: 500 !important;
          cursor: pointer !important;
          transition: all 0.2s !important;
        }
        .clean-btn-primary:hover {
          filter: brightness(1.15);
        }

        /* Custom smooth scrollbar for inner pop up */
        .clean-modal-body::-webkit-scrollbar {
          width: 5px;
        }
        .clean-modal-body::-webkit-scrollbar-track {
          background: #F9FAFB;
        }
        .clean-modal-body::-webkit-scrollbar-thumb {
          background: #D1D5DB;
          border-radius: 10px;
        }

        /* Custom smooth scrollbar for outer page/modal backdrop */
        .modal::-webkit-scrollbar {
          width: 6px;
        }
        .modal::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.05);
        }
        .modal::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.25);
          border-radius: 10px;
        }
      `}</style>
    </NavbarLoginKoordinator>
  );
}
