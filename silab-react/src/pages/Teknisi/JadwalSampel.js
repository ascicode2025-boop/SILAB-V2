import React, { useState, useEffect, useCallback } from "react";
import { Calendar, ConfigProvider, DatePicker, Button, message, Spin } from "antd";
import idID from "antd/locale/id_ID";
import dayjs from "dayjs";
import "dayjs/locale/id";
import updateLocale from "dayjs/plugin/updateLocale";
import "antd/dist/reset.css";
import NavbarLoginTeknisi from "./NavbarLoginTeknisi";
import FooterSetelahLogin from "../FooterSetelahLogin";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import "../../css/JadwalSampel.css";

import { getMonthlyQuota, updateQuota } from "../../services/QuotaService";

dayjs.extend(updateLocale);
dayjs.updateLocale("id", {
  weekStart: 1,
  weekdaysShort: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
  months: ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"],
});
dayjs.locale("id");

export default function JadwalSampel() {
  useEffect(() => {
    document.title = "SILAB-NTDK - Jadwal Sampel";
  }, []);

  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [viewDate, setViewDate] = useState(dayjs());
  const [category, setCategory] = useState("metabolit");

  const [quotaData, setQuotaData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const [status, setStatus] = useState("Tersedia");
  const [isLocked, setIsLocked] = useState(false);

  // 1. FETCH DATA
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const month = viewDate.month() + 1;
      const year = viewDate.year();
      const response = await getMonthlyQuota(month, year, category);
      setQuotaData(response.data || []);
    } catch (error) {
      message.error("Gagal memuat jadwal.");
    } finally {
      setLoading(false);
    }
  }, [viewDate, category]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isStandardHolidayDay = (date) => {
    const day = date.day();
    if (category === "metabolit") return day === 6 || day === 0;
    if (category === "hematologi") return day === 5 || day === 6 || day === 0;
    return false;
  };

  const updatePanelInfo = (date) => {
    const dateStr = date.format("YYYY-MM-DD");
    const dayData = quotaData.find((item) => item.date === dateStr);
    const isHoliday = isStandardHolidayDay(date);

    let currentStatus = "Tersedia";
    let locked = false;

    if (dayData) {
      if (dayData.max_quota === 0 || !dayData.is_available) {
        currentStatus = "Tak Tersedia";
      } else {
        currentStatus = "Tersedia";
      }
      if (isHoliday) {
        currentStatus = "Tak Tersedia";
        locked = true;
      }
    } else {
      if (isHoliday) {
        currentStatus = "Tak Tersedia";
        locked = true;
      }
    }

    setStatus(currentStatus);
    setIsLocked(locked);
  };

  const onSelectDate = (date) => {
    setSelectedDate(date);
    updatePanelInfo(date);
  };

  const handleSave = async () => {
    if (isLocked) return;

    setSaveLoading(true);
    try {
      const finalQuota = status === "Tak Tersedia" ? 0 : category === "hematologi" ? 30 : 999;
      const payload = {
        tanggal: selectedDate.format("YYYY-MM-DD"),
        jenis_analisis: category,
        kuota_maksimal: finalQuota,
        terapkan_semua: false,
      };

      await updateQuota(payload);
      message.success(`Jadwal diperbarui!`);
      fetchData();
    } catch (error) {
      message.error("Gagal menyimpan.");
    } finally {
      setSaveLoading(false);
    }
  };

  const formattedDate = selectedDate.format("D MMMM YYYY");
  const selectedCategoryLabel = category === "metabolit" ? "Metabolit" : "Hematologi";

  return (
    <NavbarLoginTeknisi>
      <ConfigProvider locale={idID}>
        <div className="min-h-screen bg-[#eee9e6] p-6 font-poppins flex justify-center gap-10 p-3">
          {/* KIRI: KALENDER (Tampilan Disamakan dengan Klien) */}
          <div className="w-full max-w-4xl bg-white shadow-xl rounded-2xl p-8 border border-gray-200">
            <div className="flex justify-end mb-6 mt-5 m-lg-4">
              <select
                className="custom-select-clean border-b border-gray-300"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setViewDate(dayjs(viewDate));
                }}
              >
                <option value="metabolit">Metabolit</option>
                <option value="hematologi">Hematologi</option>
              </select>
            </div>

            <div style={{ position: "relative" }}>
              <div className="calendar-wrapper mt-1" style={loading ? { filter: "blur(2px)", pointerEvents: "none" } : {}}>
                <Calendar
                  fullscreen={true}
                  value={viewDate}
                  onSelect={(date) => {
                    if (!date.isSame(viewDate, "month")) {
                      setViewDate(date);
                    } else {
                      onSelectDate(date);
                    }
                  }}
                  headerRender={({ value, onChange }) => {
                    const month = value.format("MMMM");
                    const year = value.format("YYYY");
                    return (
                      <div className="calendar-custom-header">
                        <div className="left-controls" style={{ display: "flex", alignItems: "center" }}>
                          <Button
                            onClick={() => {
                              const t = dayjs();
                              onChange(t);
                              setViewDate(t);
                              setSelectedDate(t);
                              onSelectDate(t);
                            }}
                            className="btn-today"
                            style={{ marginRight: "10px" }}
                          >
                            Today
                          </Button>
                          <div className="center-title" style={{ fontSize: "18px", fontWeight: "600" }}>
                            {month} {year}
                          </div>
                        </div>
                        <div className="right-controls">
                          <DatePicker
                            value={selectedDate}
                            onChange={(d) => {
                              if (d) {
                                setSelectedDate(d);
                                setViewDate(d);
                                onSelectDate(d);
                                onChange(d);
                              }
                            }}
                            format="DD/MM/YYYY"
                            allowClear={false}
                            className="date-picker-header"
                          />
                        </div>
                      </div>
                    );
                  }}
                  fullCellRender={(date) => {
                    const dateStr = date.format("YYYY-MM-DD");
                    const dayData = quotaData.find((item) => item.date === dateStr);
                    const isHoliday = isStandardHolidayDay(date);

                    let isAvailable = true;
                    let remaining = category === "hematologi" ? 30 : 999;

                    if (dayData) {
                      isAvailable = dayData.is_available && dayData.max_quota > 0;
                      remaining = dayData.remaining_quota;
                    } else if (isHoliday) {
                      isAvailable = false;
                      remaining = 0;
                    }

                    const isCurrentMonth = date.isSame(viewDate, "month");
                    const isPast = date.isBefore(dayjs(), "day");
                    const isToday = date.isSame(dayjs(), "day");
                    const isSelected = date.isSame(selectedDate, "day");

                    let cellClass = "calendar-cell-custom";
                    if (!isCurrentMonth) cellClass += " outside-month";
                    else if (isPast) cellClass += " past-date";
                    else if (isSelected) cellClass += " selected";
                    else if (isToday) cellClass += " today";
                    else if (!isAvailable) cellClass += " not-available";
                    else cellClass += " available";

                    return (
                      <div className={cellClass}>
                        <div className="date-number">{date.date()}</div>
                        {isCurrentMonth && !isPast && (
                          <div className="badge-container">{!isAvailable ? <div className="tutup-badge">TUTUP</div> : <div className="quota-badge">{category === "metabolit" ? "Tersedia" : `Sisa: ${remaining}`}</div>}</div>
                        )}
                      </div>
                    );
                  }}
                />
              </div>

              {/* Spinner di Tengah */}
              {loading && (
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 10 }}>
                  <LoadingSpinner text="Memuat data kalender..." />
                </div>
              )}
            </div>

            {/* LEGENDA WARNA */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "32px", marginTop: "24px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: "#52c41a", border: "1px solid #389e0d" }}></div>
                <span style={{ fontSize: 14, color: "#595959", fontWeight: 500 }}>Tersedia</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: "#ff4d4f", border: "1px solid #cf1322" }}></div>
                <span style={{ fontSize: 14, color: "#595959", fontWeight: 500 }}>Tutup / Libur</span>
              </div>
            </div>
          </div>

          {/* KANAN: INFO PANEL (Tetap Sama) */}
          <div className="info-panel-wrapper mt-5">
            <div className="info-card">
              <div className="info-row">
                <span className="info-label">Tanggal</span>
                <span className="info-value">{formattedDate}</span>
              </div>

              <div className="info-row">
                <span className="info-label">Jenis Analisis</span>
                <span className="info-value">{selectedCategoryLabel}</span>
              </div>

              <div className="info-row">
                <span className="info-label">Status</span>
                <select className="info-select" value={status} onChange={(e) => setStatus(e.target.value)} disabled={isLocked} style={isLocked ? { backgroundColor: "#f0f0f0", color: "#999", cursor: "not-allowed" } : {}}>
                  <option value="Tersedia">Tersedia</option>
                  <option value="Tak Tersedia">Tak Tersedia</option>
                </select>
              </div>

              {isLocked && <div className="mb-3 text-center text-xs text-red-500 font-semibold">*Hari Libur Standar tidak dapat diubah.</div>}

              <button className="btn-save" onClick={handleSave} disabled={saveLoading || isLocked} style={isLocked ? { backgroundColor: "#ccc", cursor: "not-allowed" } : {}}>
                {saveLoading ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>

        <div className="w-full max-w-6xl mt-6">
          <FooterSetelahLogin />
        </div>
      </ConfigProvider>
    </NavbarLoginTeknisi>
  );
}
