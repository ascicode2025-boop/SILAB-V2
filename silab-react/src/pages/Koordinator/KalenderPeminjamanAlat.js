import React, { useState, useEffect, useMemo } from "react";
import { Container, Row, Col, Modal, Form } from "react-bootstrap";
import { Calendar, ConfigProvider, DatePicker, Button } from "antd";
import { FaChevronLeft, FaChevronRight, FaCalendarAlt } from "react-icons/fa";
import idID from "antd/locale/id_ID";
import dayjs from "dayjs";
import "dayjs/locale/id";
import updateLocale from "dayjs/plugin/updateLocale";
import "antd/dist/reset.css";
import axios from "axios";
import NavbarLoginKoordinator from "./NavbarLoginKoordinator";
import { getClosedRentalDates, closeRentalDate, openRentalDate } from "../../services/RentalService";
import "../../css/BookingCalenderKlien.css";

dayjs.extend(updateLocale);
dayjs.updateLocale("id", {
  weekStart: 1,
  weekdaysShort: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
  months: [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ],
});
dayjs.locale("id");

export default function KalenderPeminjamanAlat() {
  const [mockLoans, setMockLoans] = useState([]);
  const [closedDatesMap, setClosedDatesMap] = useState({});
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeReason, setCloseReason] = useState("");
  const [isSubmittingClose, setIsSubmittingClose] = useState(false);
  const [showOpenConfirmModal, setShowOpenConfirmModal] = useState(false);
  const [actionNotice, setActionNotice] = useState(null);

  const fetchClosedDates = async () => {
    try {
      const list = await getClosedRentalDates();
      const map = {};
      list.forEach((item) => {
        const dStr = dayjs(item.tanggal).format("YYYY-MM-DD");
        map[dStr] = item;
      });
      setClosedDatesMap(map);
    } catch (err) {
      console.error("Gagal memuat tanggal ditutup:", err);
    }
  };

  const fetchRentals = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/rentals", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const rentals = response.data.data;
      const mappedLoans = [];
      rentals.forEach(rental => {
        if (rental.instruments) {
          rental.instruments.forEach(instrument => {
            mappedLoans.push({
              id: `${rental.id}-${instrument.id}`,
              rentalId: rental.id,
              noPengajuan: `PJ${rental.id.toString().padStart(3, '0')}`,
              namaPeminjam: rental.user?.name || 'Peminjam',
              alat: instrument.nama_alat,
              jumlah: `1 Unit`,
              tanggalPinjam: dayjs(rental.tanggal_peminjaman).format("DD MMMM YYYY"),
              tanggalKembali: dayjs(rental.tanggal_pengembalian).format("DD MMMM YYYY"),
              status: rental.status,
              catatan: rental.tujuan_peminjaman,
              dateStr: dayjs(rental.tanggal_peminjaman).format("YYYY-MM-DD"),
              rawTanggalPinjam: rental.tanggal_peminjaman,
              rawTanggalKembali: rental.tanggal_pengembalian,
            });
          });
        }
      });
      setMockLoans(mappedLoans);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    document.title = "SILAB-NTDK - Kalender Peminjaman Alat";
    fetchRentals();
    fetchClosedDates();
  }, []);

  const [selectedDate, setSelectedDate] = useState(null);
  const [viewDate, setViewDate] = useState(dayjs());
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Group loan items by YYYY-MM-DD for all dates in their range
  const loansMap = useMemo(() => {
    const map = {};
    mockLoans.forEach((item) => {
      let current = dayjs(item.rawTanggalPinjam).startOf('day');
      const end = dayjs(item.rawTanggalKembali).startOf('day');

      while (current.isBefore(end) || current.isSame(end, 'day')) {
        const dStr = current.format("YYYY-MM-DD");
        if (!map[dStr]) map[dStr] = [];
        map[dStr].push(item);
        current = current.add(1, 'day');
      }
    });
    return map;
  }, [mockLoans]);

  // Filter loans for selected date
  const activeDate = selectedDate || dayjs();
  const selectedDateStr = activeDate.format("YYYY-MM-DD");
  const loansForSelectedDate = loansMap[selectedDateStr] || [];

  const [detailViewLoan, setDetailViewLoan] = useState(null);
  const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false);
  const [editStartDate, setEditStartDate] = useState(null);
  const [editEndDate, setEditEndDate] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleDateSelect = (val) => {
    setSelectedDate(val);
    setViewDate(val);
    setDetailViewLoan(null);
    if (!isPanelOpen) {
      setIsPanelOpen(true);
    }
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setDetailViewLoan(null);
  };

  const handleOpenDetail = (item) => {
    setDetailViewLoan(item);
    setEditStartDate(dayjs(item.rawTanggalPinjam));
    setEditEndDate(dayjs(item.rawTanggalKembali));
  };

  const handleUpdateDates = async () => {
    if (!detailViewLoan || !editStartDate || !editEndDate) return;

    setIsUpdating(true);
    try {
      await axios.put(`http://localhost:8000/api/rentals/${detailViewLoan.rentalId}/update-dates`, {
        tanggal_peminjaman: editStartDate.format("YYYY-MM-DD"),
        tanggal_pengembalian: editEndDate.format("YYYY-MM-DD"),
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setShowSaveConfirmModal(false);
      setDetailViewLoan(null);
      fetchRentals(); // Refresh data
    } catch (error) {
      console.error("Gagal update tanggal", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCloseDateSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!activeDate) return;
    setIsSubmittingClose(true);
    try {
      await closeRentalDate(selectedDateStr, closeReason);
      setShowCloseModal(false);
      setCloseReason("");
      setActionNotice({ type: "success", text: `Tanggal ${activeDate.format("DD MMMM YYYY")} berhasil ditutup.` });
      await fetchClosedDates();
    } catch (err) {
      alert(err.message || "Gagal menutup tanggal peminjaman.");
    } finally {
      setIsSubmittingClose(false);
    }
  };

  const handleOpenDateSubmit = async () => {
    if (!activeDate) return;
    setIsSubmittingClose(true);
    try {
      await openRentalDate(selectedDateStr);
      setShowOpenConfirmModal(false);
      setActionNotice({ type: "success", text: `Tanggal ${activeDate.format("DD MMMM YYYY")} berhasil dibuka kembali.` });
      await fetchClosedDates();
    } catch (err) {
      alert(err.message || "Gagal membuka tanggal peminjaman.");
    } finally {
      setIsSubmittingClose(false);
    }
  };

  // Custom cell rendering for Calendar days
  const dateCellRender = (value) => {
    const dateStr = value.format("YYYY-MM-DD");
    const dayOfWeek = value.day(); // 0: Sun, 6: Sat
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isSelected = selectedDate ? value.isSame(selectedDate, "day") : false;
    const isToday = value.isSame(dayjs(), "day");
    const isSameMonth = value.month() === viewDate.month();
    const items = loansMap[dateStr] || (isSelected ? loansForSelectedDate : []);
    const isClosedByKoordinator = !!closedDatesMap[dateStr];
    const closedDetail = closedDatesMap[dateStr];

    if (isSelected) {
      return (
        <div
          style={{
            backgroundColor: isClosedByKoordinator ? "#991B1B" : "#4E3C36",
            borderRadius: "14px",
            color: "#ffffff",
            padding: "6px 4px",
            textAlign: "center",
            boxShadow: isClosedByKoordinator ? "0 4px 12px rgba(153,27,27,0.4)" : "0 4px 12px rgba(78,60,54,0.35)",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "2px",
            border: isToday ? "2px solid #FFD54F" : "none",
          }}
        >
          {isToday && (
            <span
              style={{
                backgroundColor: "#FFD54F",
                color: "#3E2723",
                fontSize: "0.58rem",
                fontWeight: "800",
                borderRadius: "6px",
                padding: "0px 5px",
                textTransform: "uppercase",
                letterSpacing: "0.3px",
              }}
            >
              ★ Hari Ini
            </span>
          )}
          <div style={{ fontSize: "0.88rem", fontWeight: "700", lineHeight: "1.2" }}>
            {value.date()}
          </div>
          <span
            style={{
              backgroundColor: isClosedByKoordinator ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.25)",
              color: "#ffffff",
              fontSize: "0.65rem",
              fontWeight: "700",
              borderRadius: "8px",
              padding: "1px 6px",
              display: "inline-block",
              lineHeight: "1.3",
            }}
          >
            {isClosedByKoordinator ? "DITUTUP" : isWeekend ? "TUTUP" : "Tersedia"}
          </span>
          <span
            style={{
              backgroundColor: "rgba(0,0,0,0.28)",
              color: "#ffffff",
              fontSize: "0.50rem",
              fontWeight: "500",
              borderRadius: "8px",
              padding: "1px 6px",
              whiteSpace: "nowrap",
              lineHeight: "1.3",
            }}
          >
            {items.length > 0 ? `${items.length} Peminjaman` : "0 Peminjaman"}
          </span>
        </div>
      );
    }

    if (isWeekend) {
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "2px",
            opacity: isSameMonth ? 1 : 0.35,
          }}
        >
          <div
            style={{
              fontSize: "0.85rem",
              color: "#E53935",
              fontWeight: "700",
              backgroundColor: isToday ? "rgba(229, 57, 53, 0.12)" : "transparent",
              borderRadius: "50%",
              width: isToday ? "24px" : "auto",
              height: isToday ? "24px" : "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: isToday ? "1.5px solid #E53935" : "none",
            }}
          >
            {value.date()}
          </div>
          <span
            style={{
              color: "#E53935",
              fontSize: "0.68rem",
              fontWeight: "700",
              letterSpacing: "0.5px",
            }}
          >
            TUTUP
          </span>
        </div>
      );
    }

    if (isClosedByKoordinator) {
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "2px",
            opacity: isSameMonth ? 1 : 0.35,
            backgroundColor: isSameMonth ? "#FFF5F5" : "transparent",
            borderRadius: "12px",
          }}
          title={closedDetail?.alasan ? `Ditutup Koordinator: ${closedDetail.alasan}` : "Ditutup oleh Koordinator"}
        >
          <div
            style={{
              fontSize: "0.85rem",
              color: "#DC2626",
              fontWeight: "700",
              backgroundColor: isToday ? "rgba(220, 38, 38, 0.12)" : "transparent",
              borderRadius: "50%",
              width: isToday ? "24px" : "auto",
              height: isToday ? "24px" : "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: isToday ? "1.5px solid #DC2626" : "none",
            }}
          >
            {value.date()}
          </div>
          <span
            style={{
              color: "#DC2626",
              fontSize: "0.65rem",
              fontWeight: "700",
              letterSpacing: "0.3px",
              backgroundColor: "#FEE2E2",
              padding: "1px 6px",
              borderRadius: "6px",
            }}
          >
            DITUTUP
          </span>
        </div>
      );
    }

    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "2px",
          opacity: isSameMonth ? 1 : 0.35,
        }}
      >
        {isToday ? (
          <div
            style={{
              backgroundColor: "#8D6E63",
              color: "#ffffff",
              borderRadius: "50%",
              width: "26px",
              height: "26px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.85rem",
              fontWeight: "700",
              boxShadow: "0 2px 6px rgba(141,110,99,0.35)",
            }}
            title="Hari Ini"
          >
            {value.date()}
          </div>
        ) : (
          <div style={{ fontSize: "0.85rem", color: isSameMonth ? "#333333" : "#9E9E9E", fontWeight: "600" }}>
            {value.date()}
          </div>
        )}

        <span
          style={{
            color: isSameMonth ? "#2E7D32" : "#A5D6A7",
            fontSize: "0.68rem",
            fontWeight: "600",
          }}
        >
          Tersedia
        </span>
      </div>
    );
  };

  return (
    <NavbarLoginKoordinator>
      {/* CSS Overrides & Smooth Animations */}
      <style>{`
        .kalender-koordinator-clean .ant-picker-cell {
          padding: 3px !important;
        }
        .kalender-koordinator-clean .ant-picker-cell-inner {
          min-height: 76px !important;
          height: 76px !important;
          padding: 0 !important;
          margin: 0 !important;
          border-radius: 14px !important;
        }
        .kalender-koordinator-clean .ant-picker-calendar-date {
          min-height: 76px !important;
          height: 76px !important;
          margin: 0 !important;
          padding: 0 !important;
          border-radius: 14px !important;
        }
        .kalender-koordinator-clean .ant-picker-calendar-date-content {
          height: 100% !important;
        }
        .kalender-koordinator-clean .ant-picker-calendar-full .ant-picker-cell-selected .ant-picker-cell-inner {
          background: transparent !important;
        }

        .calendar-transition-wrapper {
          transition: flex 0.4s cubic-bezier(0.4, 0, 0.2, 1), max-width 0.4s cubic-bezier(0.4, 0, 0.2, 1), width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes panelSlideIn {
          from {
            opacity: 0;
            transform: translateX(35px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        .panel-slide-animated {
          animation: panelSlideIn 0.42s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>

      <div style={{ backgroundColor: "#FAF9F8", minHeight: "100vh", paddingBottom: "48px" }}>
        {/* Subtitle Header Banner */}
        <div style={{ padding: "28px 24px 16px", textAlign: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              marginBottom: "8px",
            }}
          >
            <div style={{ width: "40px", height: "2px", backgroundColor: "#8D6E63" }} />
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: "800",
                color: "#3E2723",
                letterSpacing: "1.2px",
                textTransform: "uppercase",
              }}
            >
              SILAB-NTDK SYSTEM
            </span>
            <div style={{ width: "40px", height: "2px", backgroundColor: "#8D6E63" }} />
          </div>

          <h2
            style={{
              fontWeight: 800,
              fontSize: "2rem",
              color: "#332723",
              marginBottom: "6px",
            }}
          >
            Kalender Peminjaman
          </h2>
          <p style={{ color: "#616161", fontSize: "0.92rem", margin: 0 }}>
            Lihat data peminjaman sesuai kalender disini.
          </p>
        </div>

        {/* Main Content Grid: Smooth Layout Transition Container */}
        <Container fluid className="px-3 px-md-5">
          <div
            style={{
              display: "flex",
              gap: "24px",
              alignItems: "flex-start",
              width: "100%",
            }}
          >
            {/* Left Column: Ant Design Calendar (Width shrinks smoothly when panel is open) */}
            <div
              className="calendar-transition-wrapper"
              style={{
                flex: isPanelOpen ? "0 0 58%" : "0 0 100%",
                maxWidth: isPanelOpen ? "58%" : "100%",
                width: isPanelOpen ? "58%" : "100%",
              }}
            >
              <div
                className="kalender-koordinator-clean"
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "20px",
                  padding: "24px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                  border: "1px solid #EAEAEA",
                }}
              >
                <ConfigProvider locale={idID}>
                  <Calendar
                    value={viewDate}
                    onChange={(val) => handleDateSelect(val)}
                    headerRender={({ value, onChange }) => {
                      const currentMonth = value.format("MMMM YYYY");
                      return (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: "20px",
                            paddingBottom: "12px",
                            borderBottom: "1px solid #EEEEEE",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <Button
                              onClick={() => {
                                const today = dayjs();
                                handleDateSelect(today);
                              }}
                              style={{
                                borderRadius: "18px",
                                borderColor: "#D0D0D0",
                                color: "#333",
                                fontSize: "0.82rem",
                                fontWeight: 500,
                              }}
                            >
                              Today
                            </Button>
                            <button
                              type="button"
                              onClick={() => onChange(value.clone().subtract(1, "month"))}
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                border: "1px solid #E0E0E0",
                                backgroundColor: "#ffffff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                              }}
                            >
                              <FaChevronLeft size={10} color="#555" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onChange(value.clone().add(1, "month"))}
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                border: "1px solid #E0E0E0",
                                backgroundColor: "#ffffff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                              }}
                            >
                              <FaChevronRight size={10} color="#555" />
                            </button>

                            <span
                              style={{
                                fontWeight: 700,
                                fontSize: "1.05rem",
                                color: "#332723",
                                marginLeft: "8px",
                              }}
                            >
                              {currentMonth}
                            </span>
                          </div>

                          <DatePicker
                            value={value}
                            format="DD/MM/YYYY"
                            onChange={(date) => {
                              if (date) {
                                handleDateSelect(date);
                              }
                            }}
                            style={{
                              borderRadius: "12px",
                              borderColor: "#E0E0E0",
                              fontSize: "0.85rem",
                              width: "135px",
                            }}
                          />
                        </div>
                      );
                    }}
                    fullCellRender={(value) => dateCellRender(value)}
                  />
                </ConfigProvider>
              </div>
            </div>

            {/* Right Column: Total Pinjaman Panel (Slides in when isPanelOpen is true) */}
            {isPanelOpen && (
              <div
                className="panel-slide-animated"
                style={{
                  flex: "0 0 40%",
                  maxWidth: "40%",
                  width: "40%",
                }}
              >
                <div
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "20px",
                    overflow: "hidden",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                    border: "1px solid #EAEAEA",
                  }}
                >
                  {/* Header Bar */}
                  <div
                    style={{
                      backgroundColor: "#A6867B",
                      color: "#ffffff",
                      padding: "14px 20px",
                      textAlign: "center",
                      fontWeight: "700",
                      fontSize: "1.1rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <FaCalendarAlt size={18} />
                      <span>{activeDate.format("DD MMMM YYYY")}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleClosePanel}
                      style={{
                        backgroundColor: "rgba(255,255,255,0.2)",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "50%",
                        width: "26px",
                        height: "26px",
                        fontSize: "0.9rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      title="Tutup Panel"
                    >
                      ✕
                    </button>
                  </div>

                  {detailViewLoan ? (
                    /* Detail Jadwal View */
                    <div style={{ padding: "24px 24px 28px", textAlign: "center" }}>
                      <h4
                        style={{
                          fontWeight: 800,
                          fontSize: "1.2rem",
                          color: "#3E2723",
                          marginBottom: "16px",
                        }}
                      >
                        Detail Jadwal
                      </h4>

                      <hr style={{ borderTop: "1px solid #E0E0E0", width: "90%", margin: "0 auto 20px" }} />

                      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                        <div>
                          <div style={{ color: "#757575", fontSize: "0.85rem", marginBottom: "2px" }}>No Pengajuan</div>
                          <div style={{ color: "#3E2723", fontSize: "1.02rem", fontWeight: 800 }}>{detailViewLoan.noPengajuan}</div>
                        </div>

                        <div>
                          <div style={{ color: "#757575", fontSize: "0.85rem", marginBottom: "2px" }}>Nama</div>
                          <div style={{ color: "#3E2723", fontSize: "1.02rem", fontWeight: 800 }}>{detailViewLoan.namaPeminjam}</div>
                        </div>

                        <div>
                          <div style={{ color: "#757575", fontSize: "0.85rem", marginBottom: "2px" }}>Alat</div>
                          <div style={{ color: "#3E2723", fontSize: "1.02rem", fontWeight: 800 }}>{detailViewLoan.alat}</div>
                        </div>

                        <div>
                          <div style={{ color: "#757575", fontSize: "0.85rem", marginBottom: "2px" }}>Jumlah</div>
                          <div style={{ color: "#3E2723", fontSize: "1.02rem", fontWeight: 800 }}>{detailViewLoan.jumlah}</div>
                        </div>

                        <div>
                          <div style={{ color: "#757575", fontSize: "0.85rem", marginBottom: "4px" }}>Tanggal Pinjam</div>
                          <div style={{ color: "#3E2723", fontSize: "1.02rem", fontWeight: 800 }}>
                            {detailViewLoan.rawTanggalPinjam ? dayjs(detailViewLoan.rawTanggalPinjam).format("DD MMMM YYYY") : detailViewLoan.tanggalPinjam}
                          </div>
                        </div>

                        <div>
                          <div style={{ color: "#757575", fontSize: "0.85rem", marginBottom: "4px" }}>Tanggal Kembali</div>
                          <div style={{ color: "#3E2723", fontSize: "1.02rem", fontWeight: 800 }}>
                            {detailViewLoan.rawTanggalKembali ? dayjs(detailViewLoan.rawTanggalKembali).format("DD MMMM YYYY") : "-"}
                          </div>
                        </div>

                        <div>
                          <div style={{ color: "#757575", fontSize: "0.85rem", marginBottom: "6px" }}>Status</div>
                          <div>
                            <span
                              style={{
                                backgroundColor: "#DCFCE7",
                                color: "#166534",
                                borderRadius: "20px",
                                padding: "4px 18px",
                                fontSize: "0.85rem",
                                fontWeight: "700",
                                display: "inline-block",
                              }}
                            >
                              {detailViewLoan.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      <hr style={{ borderTop: "1px solid #E0E0E0", width: "90%", margin: "24px auto 20px" }} />
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "14px" }}>
                        <button
                          type="button"
                          onClick={() => setDetailViewLoan(null)}
                          style={{
                            backgroundColor: "#44352F",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "20px",
                            padding: "8px 28px",
                            fontWeight: "700",
                            fontSize: "0.88rem",
                            cursor: "pointer",
                            boxShadow: "0 3px 8px rgba(68,53,47,0.3)",
                          }}
                        >
                          Tutup
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Total Pinjaman List View */
                    <div style={{ padding: "24px 24px 16px", textAlign: "center" }}>
                      {/* Notice Banner */}
                      {actionNotice && (
                        <div
                          style={{
                            backgroundColor: actionNotice.type === "success" ? "#F0FDF4" : "#FEF2F2",
                            color: actionNotice.type === "success" ? "#166534" : "#991B1B",
                            border: `1px solid ${actionNotice.type === "success" ? "#BBF7D0" : "#FCA5A5"}`,
                            borderRadius: "12px",
                            padding: "10px 14px",
                            fontSize: "0.85rem",
                            marginBottom: "16px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            textAlign: "left",
                          }}
                        >
                          <span>{actionNotice.text}</span>
                          <button
                            type="button"
                            onClick={() => setActionNotice(null)}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", fontWeight: "bold", fontSize: "1rem" }}
                          >
                            ×
                          </button>
                        </div>
                      )}

                      {/* Status Layanan Card */}
                      <div
                        style={{
                          backgroundColor: closedDatesMap[selectedDateStr] ? "#FEF2F2" : (activeDate.day() === 0 || activeDate.day() === 6) ? "#FFFBEB" : "#F0FDF4",
                          border: `1.5px solid ${closedDatesMap[selectedDateStr] ? "#FCA5A5" : (activeDate.day() === 0 || activeDate.day() === 6) ? "#FDE68A" : "#BBF7D0"}`,
                          borderRadius: "16px",
                          padding: "16px 18px",
                          marginBottom: "20px",
                          textAlign: "left",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: closedDatesMap[selectedDateStr]?.alasan ? "6px" : "10px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div
                              style={{
                                width: "10px",
                                height: "10px",
                                borderRadius: "50%",
                                backgroundColor: closedDatesMap[selectedDateStr] ? "#EF4444" : (activeDate.day() === 0 || activeDate.day() === 6) ? "#F59E0B" : "#10B981",
                              }}
                            />
                            <span
                              style={{
                                fontWeight: 800,
                                fontSize: "0.92rem",
                                color: closedDatesMap[selectedDateStr] ? "#991B1B" : (activeDate.day() === 0 || activeDate.day() === 6) ? "#92400E" : "#166534",
                              }}
                            >
                              {closedDatesMap[selectedDateStr]
                                ? "Layanan Ditutup Koordinator"
                                : (activeDate.day() === 0 || activeDate.day() === 6)
                                ? "Hari Libur Rutin (Akhir Pekan)"
                                : "Layanan Peminjaman Buka"}
                            </span>
                          </div>
                        </div>

                        {closedDatesMap[selectedDateStr]?.alasan && (
                          <div style={{ fontSize: "0.82rem", color: "#7F1D1D", marginBottom: "12px", backgroundColor: "#FEE2E2", padding: "6px 10px", borderRadius: "8px" }}>
                            <strong>Alasan:</strong> {closedDatesMap[selectedDateStr].alasan}
                          </div>
                        )}

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "6px" }}>
                          {closedDatesMap[selectedDateStr] ? (
                            <button
                              type="button"
                              onClick={() => setShowOpenConfirmModal(true)}
                              disabled={isSubmittingClose}
                              style={{
                                backgroundColor: "#166534",
                                color: "#ffffff",
                                border: "none",
                                borderRadius: "10px",
                                padding: "6px 16px",
                                fontSize: "0.82rem",
                                fontWeight: 700,
                                cursor: "pointer",
                                boxShadow: "0 2px 6px rgba(22,101,52,0.25)",
                              }}
                            >
                              Buka Tanggal Ini
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setCloseReason("");
                                setShowCloseModal(true);
                              }}
                              disabled={isSubmittingClose}
                              style={{
                                backgroundColor: "#DC2626",
                                color: "#ffffff",
                                border: "none",
                                borderRadius: "10px",
                                padding: "6px 16px",
                                fontSize: "0.82rem",
                                fontWeight: 700,
                                cursor: "pointer",
                                boxShadow: "0 2px 6px rgba(220,38,38,0.25)",
                              }}
                            >
                              Tutup Tanggal Peminjaman
                            </button>
                          )}
                        </div>
                      </div>

                      <div
                        style={{
                          fontSize: "1.25rem",
                          fontWeight: 800,
                          color: "#3E2723",
                          marginBottom: "4px",
                        }}
                      >
                        Total Pinjaman
                      </div>
                      <div
                        style={{
                          fontSize: "2.4rem",
                          fontWeight: 800,
                          color: "#212121",
                          lineHeight: "1.2",
                        }}
                      >
                        {loansForSelectedDate.length}
                      </div>

                      <hr style={{ borderTop: "1px solid #E0E0E0", width: "90%", margin: "20px auto 24px" }} />

                      {/* List of Loan Cards */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxHeight: "480px", overflowY: "auto", paddingRight: "4px" }}>
                        {loansForSelectedDate.map((item) => (
                          <div
                            key={item.id}
                            style={{
                              backgroundColor: "#ffffff",
                              borderRadius: "16px",
                              border: "1px solid #EBEBEB",
                              boxShadow: "0 3px 12px rgba(0,0,0,0.04)",
                              padding: "18px 20px",
                              textAlign: "left",
                              transition: "transform 0.2s ease, box-shadow 0.2s ease",
                            }}
                          >
                            {/* Header: No Pengajuan */}
                            <div style={{ fontWeight: 800, color: "#212121", fontSize: "0.95rem", marginBottom: "8px" }}>
                              {item.noPengajuan}
                            </div>

                            {/* Peminjam */}
                            <div style={{ color: "#333333", fontSize: "0.92rem", fontWeight: 500, marginBottom: "6px" }}>
                              {item.namaPeminjam}
                            </div>

                            {/* Alat */}
                            <div style={{ color: "#555555", fontSize: "0.88rem", marginBottom: "4px" }}>
                              {item.alat}
                            </div>

                            {/* Jumlah */}
                            <div style={{ color: "#555555", fontSize: "0.88rem", marginBottom: "14px" }}>
                              {item.jumlah}
                            </div>

                            {/* Footer: Status Pill & Lihat Detail Button */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span style={{ fontSize: "0.85rem", color: "#616161" }}>Status</span>
                                <span
                                  style={{
                                    backgroundColor: "#DCFCE7",
                                    color: "#166534",
                                    borderRadius: "20px",
                                    padding: "3px 14px",
                                    fontSize: "0.8rem",
                                    fontWeight: "700",
                                  }}
                                >
                                  {item.status}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleOpenDetail(item)}
                                style={{
                                  backgroundColor: "#44352F",
                                  color: "#ffffff",
                                  border: "none",
                                  borderRadius: "20px",
                                  padding: "6px 20px",
                                  fontWeight: "600",
                                  fontSize: "0.82rem",
                                  cursor: "pointer",
                                  boxShadow: "0 3px 8px rgba(68,53,47,0.3)",
                                }}
                              >
                                Lihat Detail
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Container>

        {/* Modal Detail Peminjaman */}
        <style>{`
          .custom-modal-clean .modal-content {
            border-radius: 18px !important;
            border: none !important;
            overflow: hidden !important;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18) !important;
            background-color: #ffffff !important;
          }
          .custom-modal-narrow {
            max-width: 440px !important;
          }
        `}</style>
        <Modal
          show={showDetailModal}
          onHide={() => setShowDetailModal(false)}
          centered
          dialogClassName="custom-modal-narrow custom-modal-clean"
        >
          {/* Header Bar */}
          <div
            style={{
              backgroundColor: "#A6867B",
              color: "#ffffff",
              padding: "14px 20px",
              textAlign: "center",
              fontWeight: "700",
              fontSize: "1.15rem",
              letterSpacing: "0.2px",
            }}
          >
            Detail Peminjaman
          </div>

          {selectedLoan && (
            <div style={{ padding: "24px 28px 28px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 600, color: "#616161", fontSize: "0.9rem" }}>No Pengajuan</span>
                  <span style={{ fontWeight: 700, color: "#212121", fontSize: "0.9rem" }}>{selectedLoan.noPengajuan}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 600, color: "#616161", fontSize: "0.9rem" }}>Nama</span>
                  <span style={{ fontWeight: 700, color: "#212121", fontSize: "0.9rem" }}>{selectedLoan.namaPeminjam}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 600, color: "#616161", fontSize: "0.9rem" }}>Alat</span>
                  <span style={{ fontWeight: 700, color: "#212121", fontSize: "0.9rem" }}>{selectedLoan.alat}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 600, color: "#616161", fontSize: "0.9rem" }}>Tanggal Pinjam</span>
                  <span style={{ fontWeight: 700, color: "#212121", fontSize: "0.9rem" }}>{selectedLoan.tanggalPinjam}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 600, color: "#616161", fontSize: "0.9rem" }}>Tanggal Kembali</span>
                  <span style={{ fontWeight: 700, color: "#212121", fontSize: "0.9rem" }}>{selectedLoan.tanggalKembali}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 600, color: "#616161", fontSize: "0.9rem" }}>Status</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#4CAF50" }} />
                    <span style={{ fontWeight: 700, color: "#2E7D32", fontSize: "0.9rem" }}>{selectedLoan.status}</span>
                  </div>
                </div>

                <div style={{ marginTop: "4px" }}>
                  <span style={{ fontWeight: 600, color: "#616161", fontSize: "0.9rem", display: "block", marginBottom: "6px" }}>
                    Catatan
                  </span>
                  <div
                    style={{
                      backgroundColor: "#F5F5F5",
                      borderRadius: "12px",
                      padding: "10px 14px",
                      fontSize: "0.88rem",
                      color: "#424242",
                      border: "1px solid #E0E0E0",
                    }}
                  >
                    {selectedLoan.catatan || "Tidak ada catatan tambahan."}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: "center" }}>
                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  style={{
                    backgroundColor: "#44352F",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "14px",
                    padding: "8px 44px",
                    fontWeight: "600",
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    boxShadow: "0 3px 10px rgba(68,53,47,0.35)",
                  }}
                >
                  Tutup
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* Modal Konfirmasi Simpan Perubahan */}
        <style>{`
          .confirm-save-modal .modal-content {
            border-radius: 22px !important;
            border: none !important;
            padding: 24px 28px !important;
            text-align: center !important;
            box-shadow: 0 12px 32px rgba(0,0,0,0.18) !important;
            background-color: #ffffff !important;
          }
        `}</style>
        <Modal
          show={showSaveConfirmModal}
          onHide={() => setShowSaveConfirmModal(false)}
          centered
          dialogClassName="custom-modal-narrow confirm-save-modal"
        >
          <div style={{ padding: "12px 8px 8px" }}>
            <h5
              style={{
                fontWeight: "800",
                color: "#3E2723",
                fontSize: "1.1rem",
                marginBottom: "28px",
                lineHeight: "1.5",
              }}
            >
              Apakah anda yakin ingin menyimpan perubahan?
            </h5>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px" }}>
              <button
                type="button"
                onClick={() => setShowSaveConfirmModal(false)}
                style={{
                  backgroundColor: "#9E9E9E",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "14px",
                  padding: "8px 28px",
                  fontWeight: "700",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
                }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleUpdateDates}
                disabled={isUpdating}
                style={{
                  backgroundColor: "#44352F",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "14px",
                  padding: "8px 32px",
                  fontWeight: "700",
                  fontSize: "0.9rem",
                  cursor: isUpdating ? "not-allowed" : "pointer",
                  boxShadow: "0 3px 10px rgba(68,53,47,0.35)",
                  opacity: isUpdating ? 0.7 : 1,
                }}
              >
                {isUpdating ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </Modal>

        {/* Modal Tutup Tanggal Peminjaman */}
        <Modal
          show={showCloseModal}
          onHide={() => setShowCloseModal(false)}
          centered
          dialogClassName="custom-modal-narrow custom-modal-clean"
        >
          <div
            style={{
              backgroundColor: "#DC2626",
              color: "#ffffff",
              padding: "16px 20px",
              textAlign: "center",
              fontWeight: "700",
              fontSize: "1.1rem",
            }}
          >
            Tutup Tanggal Peminjaman Alat
          </div>
          <Form onSubmit={handleCloseDateSubmit} style={{ padding: "24px 28px" }}>
            <div style={{ marginBottom: "16px", textAlign: "left" }}>
              <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "4px" }}>Tanggal yang dipilih:</div>
              <div style={{ fontSize: "1.05rem", fontWeight: "800", color: "#212121" }}>
                {activeDate.format("dddd, DD MMMM YYYY")}
              </div>
            </div>

            {loansForSelectedDate.length > 0 && (
              <div
                style={{
                  backgroundColor: "#FFFBEB",
                  border: "1px solid #FDE68A",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  fontSize: "0.82rem",
                  color: "#92400E",
                  marginBottom: "16px",
                  textAlign: "left",
                }}
              >
                ⚠️ <strong>Perhatian:</strong> Sudah ada {loansForSelectedDate.length} peminjaman pada tanggal ini. Penutupan tanggal akan memblokir pengajuan peminjaman baru dari klien.
              </div>
            )}

            <Form.Group className="mb-4 text-start">
              <Form.Label style={{ fontSize: "0.88rem", fontWeight: "700", color: "#333" }}>
                Alasan Penutupan (Opsional)
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Contoh: Pemeliharaan rutin / Kalibrasi alat / Libur Lab..."
                value={closeReason}
                onChange={(e) => setCloseReason(e.target.value)}
                style={{ borderRadius: "12px", fontSize: "0.88rem" }}
              />
            </Form.Group>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                type="button"
                onClick={() => setShowCloseModal(false)}
                disabled={isSubmittingClose}
                style={{
                  backgroundColor: "#E5E7EB",
                  color: "#374151",
                  border: "none",
                  borderRadius: "12px",
                  padding: "8px 20px",
                  fontWeight: "600",
                  fontSize: "0.88rem",
                  cursor: "pointer",
                }}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmittingClose}
                style={{
                  backgroundColor: "#DC2626",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "12px",
                  padding: "8px 22px",
                  fontWeight: "700",
                  fontSize: "0.88rem",
                  cursor: isSubmittingClose ? "not-allowed" : "pointer",
                  boxShadow: "0 2px 8px rgba(220,38,38,0.3)",
                }}
              >
                {isSubmittingClose ? "Menyimpan..." : "Tutup Tanggal Ini"}
              </button>
            </div>
          </Form>
        </Modal>

        {/* Modal Konfirmasi Buka Kembali Tanggal */}
        <Modal
          show={showOpenConfirmModal}
          onHide={() => setShowOpenConfirmModal(false)}
          centered
          dialogClassName="custom-modal-narrow custom-modal-clean"
        >
          <div
            style={{
              backgroundColor: "#166534",
              color: "#ffffff",
              padding: "16px 20px",
              textAlign: "center",
              fontWeight: "700",
              fontSize: "1.1rem",
            }}
          >
            Buka Tanggal Peminjaman
          </div>
          <div style={{ padding: "24px 28px", textAlign: "center" }}>
            <p style={{ fontSize: "0.95rem", color: "#374151", marginBottom: "20px" }}>
              Apakah Anda yakin ingin membuka kembali layanan peminjaman alat pada tanggal{" "}
              <strong>{activeDate.format("DD MMMM YYYY")}</strong>?
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "14px" }}>
              <button
                type="button"
                onClick={() => setShowOpenConfirmModal(false)}
                disabled={isSubmittingClose}
                style={{
                  backgroundColor: "#E5E7EB",
                  color: "#374151",
                  border: "none",
                  borderRadius: "12px",
                  padding: "8px 24px",
                  fontWeight: "600",
                  fontSize: "0.88rem",
                  cursor: "pointer",
                }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleOpenDateSubmit}
                disabled={isSubmittingClose}
                style={{
                  backgroundColor: "#166534",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "12px",
                  padding: "8px 24px",
                  fontWeight: "700",
                  fontSize: "0.88rem",
                  cursor: isSubmittingClose ? "not-allowed" : "pointer",
                  boxShadow: "0 2px 8px rgba(22,101,52,0.3)",
                }}
              >
                {isSubmittingClose ? "Membuka..." : "Ya, Buka Tanggal"}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </NavbarLoginKoordinator>
  );
}
