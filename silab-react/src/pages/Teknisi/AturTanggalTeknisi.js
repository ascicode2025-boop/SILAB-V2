import React, { useState, useEffect, useCallback } from "react";
import { Calendar, ConfigProvider, DatePicker, Button, Modal, message } from "antd";
import idID from "antd/locale/id_ID";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import dayjs from "dayjs";
import "dayjs/locale/id";
import updateLocale from "dayjs/plugin/updateLocale";
import "antd/dist/reset.css";
import NavbarLoginTeknisi from "./NavbarLoginTeknisi";
import FooterSetelahLogin from "../FooterSetelahLogin";
import "../../css/AturTanggalTeknisi.css";

// IMPORT SERVICE API
import { getMonthlyQuota, updateQuota as updateQuotaApi } from "../../services/QuotaService";

dayjs.extend(updateLocale);
dayjs.updateLocale("id", {
  weekStart: 1,
  weekdaysShort: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
  months: ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"],
});
dayjs.locale("id");

export default function AturTanggalTeknisi() {
  useEffect(() => {
    document.title = "SILAB-NTDK - Atur Tanggal Teknisi";
  }, []);

  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [viewDate, setViewDate] = useState(dayjs());
  const [category, setCategory] = useState("metabolit");
  const [formCategory, setFormCategory] = useState("metabolit");
  const [kuota, setKuota] = useState("");
  const [applyAll, setApplyAll] = useState(false);
  const [quotaData, setQuotaData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");
  const [modalIsError, setModalIsError] = useState(false);

  const isUnlimitedService = (serviceType) => serviceType === "metabolit";
  const getDefaultQuota = (serviceType) => (isUnlimitedService(serviceType) ? 999 : 30);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const month = viewDate.month() + 1;
      const year = viewDate.year();
      const response = await getMonthlyQuota(month, year, category);
      setQuotaData(response.data || []);
    } catch (error) {
      console.error("Gagal ambil data:", error);
    } finally {
      setLoading(false);
    }
  }, [viewDate, category]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showModal = (title, content, isError = false) => {
    setModalTitle(title);
    setModalContent(content);
    setModalIsError(isError);
    setModalOpen(true);
  };

  const isStandardHoliday = (date, type) => {
    const day = date.day();
    if (type === "hematologi") return day === 5 || day === 6 || day === 0;
    return day === 6 || day === 0;
  };

  const handleSaveKuota = async () => {
    if (selectedDate.isBefore(dayjs(), "day")) {
      return showModal("Gagal", "Tidak dapat mengubah kuota untuk tanggal yang sudah lewat.", true);
    }
    if (isStandardHoliday(selectedDate, formCategory)) {
      return showModal("Gagal", `Hari ini adalah jadwal libur standar untuk ${formCategory}.`, true);
    }
    if (kuota === "" || kuota === null) return showModal("Gagal", "Isi jumlah kuota.", true);
    const kuotaNum = Number(kuota);
    if (kuotaNum < 0) return showModal("Gagal", "Kuota tidak boleh negatif.", true);

    try {
      setLoading(true);
      await updateQuotaApi({
        tanggal: selectedDate.format("YYYY-MM-DD"),
        jenis_analisis: formCategory,
        kuota_maksimal: kuotaNum,
        terapkan_semua: applyAll,
      });
      message.success("Kuota berhasil diperbarui!");
      setKuota("");
      setApplyAll(false);
      fetchData();
    } catch (error) {
      showModal("Gagal", "Terjadi kesalahan saat menyimpan data.", true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <NavbarLoginTeknisi>
      <ConfigProvider locale={idID}>
        <div className="min-h-screen bg-[#eee9e6] font-poppins flex flex-col items-center p-3">
          <div className="w-full max-w-6xl bg-white shadow-xl rounded-2xl p-8 border border-gray-200">
            {/* Header Kategori */}
            <div className="flex justify-end mb-6 mt-5 m-lg-4">
              <select
                className="custom-select-clean border-b border-gray-300"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setFormCategory(e.target.value);
                }}
              >
                <option value="metabolit">Metabolit</option>
                <option value="hematologi">Hematologi</option>
              </select>
            </div>

            {/* Container Kalender dengan Efek Blur */}
            <div style={{ position: "relative" }}>
              <div className="calendar-wrapper mt-1" style={loading ? { filter: "blur(2px)", pointerEvents: "none" } : {}}>
                <Calendar
                  fullscreen={true}
                  value={viewDate}
                  onChange={(v) => {
                    if (!v.isSame(viewDate, "month")) {
                      setViewDate(v);
                    } else {
                      if (v.isBefore(dayjs(), "day")) return;
                      setSelectedDate(v);
                      setViewDate(v);
                    }
                  }}
                  onPanelChange={(value) => setViewDate(value)}
                  className="custom-calendar"
                  headerRender={({ value, onChange }) => {
                    const month = value.format("MMMM");
                    const year = value.format("YYYY");
                    return (
                      <div className="calendar-custom-header">
                        <div className="left-controls" style={{ display: "flex", alignItems: "center" }}>
                          <Button
                            onClick={() => {
                              const today = dayjs();
                              onChange(today);
                              setViewDate(today);
                              setSelectedDate(today);
                            }}
                            className="btn-today"
                            style={{ marginRight: "10px" }}
                          >
                            Today
                          </Button>
                          <div className="center-title" style={{ fontSize: "18px", fontWeight: "500" }}>
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
                  fullCellRender={(date, info) => {
                    if (info.type !== "date") return info.originNode;
                    const dateStr = date.format("YYYY-MM-DD");
                    const dayData = quotaData.find((item) => item.date === dateStr);

                    let isAvailable = true;
                    let remaining = getDefaultQuota(category);
                    let max = getDefaultQuota(category);
                    let isStrict = !isUnlimitedService(category);

                    if (dayData) {
                      isAvailable = dayData.is_available;
                      remaining = dayData.remaining_quota;
                      max = dayData.max_quota;
                      isStrict = dayData.is_strict;
                    } else if (isStandardHoliday(date, category)) {
                      isAvailable = false;
                      remaining = 0;
                    }

                    const isFull = isAvailable && isStrict && remaining === 0 && max > 0;
                    const isCurrentMonth = date.isSame(viewDate, "month");
                    const isPast = date.isBefore(dayjs(), "day");
                    const isToday = date.isSame(dayjs(), "day");
                    const isSelected = date.isSame(selectedDate, "day");

                    let cellClass = "calendar-cell-custom";
                    if (!isCurrentMonth) cellClass += " outside-month";
                    else if (isPast) cellClass += " past-date";
                    else if (isSelected) cellClass += " selected";
                    else if (isToday) cellClass += " today";
                    else if (isFull) cellClass += " fully-booked";
                    else if (!isAvailable) cellClass += " not-available";
                    else cellClass += " available";

                    return (
                      <div className={cellClass}>
                        <div className="date-number">{date.date()}</div>
                        {isCurrentMonth && !isPast && (
                          <>
                            {isFull && <div className="full-badge">PENUH</div>}
                            {!isAvailable && !isFull && <div className="tutup-badge">TUTUP</div>}
                            {isAvailable && !isFull && <div className="quota-badge">{isUnlimitedService(category) ? "Tersedia" : `Sisa: ${remaining}`}</div>}
                          </>
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

            {/* Legenda Warna */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "32px", marginTop: "24px", marginBottom: "16px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: "#52c41a", border: "1px solid #389e0d" }}></div>
                <span style={{ fontSize: 14, color: "#595959", fontWeight: 500 }}>Tersedia</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: "#fa8c16", border: "1px solid #d46b08" }}></div>
                <span style={{ fontSize: 14, color: "#595959", fontWeight: 500 }}>Penuh</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: "#ff4d4f", border: "1px solid #cf1322" }}></div>
                <span style={{ fontSize: 14, color: "#595959", fontWeight: 500 }}>Tutup / Libur</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: "#d9d9d9", border: "1px solid #bfbfbf" }}></div>
                <span style={{ fontSize: 14, color: "#595959", fontWeight: 500 }}>Lewat</span>
              </div>
            </div>
          </div>

          {/* Bagian Input Kuota (Tetap Ada) */}
          <div className="w-full max-w-6xl quota-container mt-8 bg-white shadow-lg rounded-2xl p-8 mb-10 border border-gray-200">
            <h2 className="text-center font-bold text-xl mb-6 text-gray-800">Atur Kuota Harian</h2>
            {/* ... Form input Anda tetap sama seperti sebelumnya ... */}
            <div className="quota-form grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Tanggal</label>
                <DatePicker
                  disabled={applyAll}
                  value={selectedDate}
                  disabledDate={(c) => c && c < dayjs().endOf("day").subtract(1, "day")}
                  onChange={(d) => d && (setSelectedDate(d), setViewDate(d))}
                  format="DD/MM/YYYY"
                  allowClear={false}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Kuota</label>
                <input type="number" min="0" className="w-full p-2 border rounded-lg" placeholder={isUnlimitedService(formCategory) ? "999 (Tersedia)" : "30 (Default)"} value={kuota} onChange={(e) => setKuota(e.target.value)} />
              </div>
              {/* Sisanya sesuaikan dengan preferensi UI Anda */}
            </div>
            <div className="mt-6 flex flex-col items-center">
              <Button type="primary" size="large" className="bg-blue-600 w-full md:w-64" onClick={handleSaveKuota} loading={loading}>
                Simpan Kuota
              </Button>
            </div>
          </div>
          <FooterSetelahLogin />
        </div>

        <Modal title={modalIsError ? "Terjadi Kesalahan" : modalTitle || "Berhasil"} open={modalOpen} onOk={() => setModalOpen(false)} onCancel={() => setModalOpen(false)} centered>
          <p style={{ whiteSpace: "pre-wrap" }}>{modalContent}</p>
        </Modal>
      </ConfigProvider>
    </NavbarLoginTeknisi>
  );
}
