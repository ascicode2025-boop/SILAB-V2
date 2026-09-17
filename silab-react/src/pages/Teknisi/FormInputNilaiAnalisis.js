import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import NavbarLoginTeknisi from "./NavbarLoginTeknisi";
import FooterSetelahLogin from "../FooterSetelahLogin";
import { getAllBookings, getBookingById, updateAnalysisResult, finalizeAnalysis } from "../../services/BookingService";
import { Button, Spin, message, Card, Input, Typography, Divider, Tag, Space, Alert, Checkbox, Modal } from "antd";
import { SaveOutlined, ExperimentOutlined, UserOutlined, BarcodeOutlined, SettingOutlined, CheckCircleFilled } from "@ant-design/icons";
import "@fontsource/poppins";

const { Title, Text } = Typography;

function FormInputNilaiAnalisis() {
  const { id } = useParams();
  const history = useHistory();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [nilaiAnalisis, setNilaiAnalisis] = useState({});
  const [groupedItems, setGroupedItems] = useState({});
  const [jenisBDP, setJenisBDP] = useState("unggas"); // unggas | ruminansia
  const [jenisDL, setJenisDL] = useState("unggas"); // unggas | ruminansia
  const [lastSaved, setLastSaved] = useState(null); // Timestamp simpanan terakhir

  // State untuk satuan per-item (independen)
  const [resultUnits, setResultUnits] = useState({});

  // Set default satuan mg/dL untuk semua metabolit saat booking berubah
  useEffect(() => {
    if (booking && booking.analysis_items) {
      setResultUnits((prev) => {
        const updated = { ...prev };
        booking.analysis_items.forEach((item) => {
          // Deteksi metabolit (Kimia Klinik) dari stdConc
          if (stdConc[item.nama_item] !== undefined && !updated[item.nama_item]) {
            updated[item.nama_item] = "mg/dL";
          }
        });
        return updated;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking]);

  // Helper untuk set satuan per item
  const setResultUnitForItem = (itemName, unit) => {
    setResultUnits((prev) => ({ ...prev, [itemName]: unit }));
  };

  // Helper untuk get satuan per item (default mg/dL)
  const getResultUnitForItem = (itemName) => {
    return resultUnits[itemName] || "mg/dL";
  };

  // === 1. STATE KONSENTRASI STANDAR ===
  const [stdConc, setStdConc] = useState({
    Glukosa: 109,
    Kolestrol: 196,
    Trigliserida: 218,
    "Total Protein": 7.98,
    Albumin: 4.0,
    "Urea/BUN": 50,
    Kreatinin: 2.0,
    Kalsium: 10.0,
    "HDL-kol": 50,
    "LDL-kol": 100,
    "Asam Urat": 6.0,
    SGOT: 0,
    SGPT: 0,
  });

  const handleStdChange = (namaItem, val) => {
    setStdConc((prev) => ({ ...prev, [namaItem]: val }));
  };

  // === 2. HELPER KALKULASI (Logic tetap sama) ===
  const calculateResult = (namaItem, rawVal1, rawVal2 = null) => {
    if (stdConc[namaItem] !== undefined) {
      const absStd = parseFloat(rawVal1);
      const absSpl = parseFloat(rawVal2);
      const concStd = parseFloat(stdConc[namaItem]);
      if (!absStd || !absSpl || isNaN(absStd) || isNaN(absSpl) || !concStd) return "-";
      return ((absSpl / absStd) * concStd).toFixed(2);
    }
    if (rawVal1 === "" || isNaN(parseFloat(rawVal1))) return "-";
    const val = parseFloat(rawVal1);
    if (namaItem === "Hemoglobin" || namaItem === "Hemoglobin Darah") return val.toFixed(1);
    if (namaItem === "Hematokrit") return val.toFixed(0);
    if (namaItem === "BDM") return `${((val * 10000) / 1000000).toFixed(2)} (10⁶/µL)`;
    if (namaItem === "BDP") return `${((val * 125) / 1000).toFixed(2)} (10³/µL)`;
    return val;
  };

  const hitungDiferensiasi = (v) => {
    const toNum = (x) => Number(x) || 0;

    const Limfosit = toNum(v.Limfosit);
    const Heterofil = toNum(v.Heterofil);
    const Eosinofil = toNum(v.Eosinofil);
    const Monosit = toNum(v.Monosit);
    const Basofil = toNum(v.Basofil);

    const Total = Limfosit + Heterofil + Eosinofil + Monosit + Basofil;

    const persen = (x) => (Total > 0 ? ((x / Total) * 100).toFixed(1) : "0.0");

    return {
      Total,
      LimfositPersen: persen(Limfosit),
      HeterofilPersen: persen(Heterofil),
      EosinofilPersen: persen(Eosinofil),
      MonositPersen: persen(Monosit),
      BasofilPersen: persen(Basofil),

      // 🔴 TOTAL %
      TotalPersen: Total > 0 ? (persen(Limfosit) * 1 + persen(Heterofil) * 1 + persen(Eosinofil) * 1 + persen(Monosit) * 1 + persen(Basofil) * 1).toFixed(1) : "0.0",
    };
  };

  // === FETCH DATA ===
  useEffect(() => {
    fetchBooking();
  }, [id]); // Re-fetch ketika ID berubah

  const fetchBooking = async () => {
    try {
      setLoading(true);
      // Reset form ke state kosong setiap kali fetch booking baru
      setNilaiAnalisis({});

      // Ambil booking terbaru dari backend berdasarkan ID agar data tersinkronisasi
      try {
        const resp = await getBookingById(id);
        const detail = resp?.data || resp; // backend mungkin mengemas di { data: ... }
        setBooking(detail);

        if (detail?.analysis_items) {
          const groups = {};
          detail.analysis_items.forEach((item) => {
            const nama = item.nama_analisis || detail?.jenis_analisis || "Analisis";
            if (!groups[nama]) groups[nama] = [];
            groups[nama].push(item);
          });
          setGroupedItems(groups);
          // Parse existing result hanya jika ada data tersimpan
          parseExistingResult(detail);
        }
        return;
      } catch (e) {
        // Fallback ke getAllBookings jika endpoint by-id gagal
        const data = await getAllBookings();
        const all = data?.data || [];
        const detail = all.find((b) => String(b.id) === String(id));
        setBooking(detail);
        if (detail?.analysis_items) {
          const groups = {};
          detail.analysis_items.forEach((item) => {
            const nama = item.nama_analisis || detail?.jenis_analisis || "Analisis";
            if (!groups[nama]) groups[nama] = [];
            groups[nama].push(item);
          });
          setGroupedItems(groups);
          parseExistingResult(detail);
        }
      }
    } catch (error) {
      message.error("Terjadi kesalahan saat memuat data.");
    } finally {
      setLoading(false);
    }
  };

  const parseExistingResult = (detail) => {
    if (!detail?.analysis_items) return;

    const parsed = {};
    let hasData = false; // Track apakah ada data yang perlu dipopulate

    console.log("=== PARSE EXISTING RESULT ===");
    console.log("Booking ID:", detail.id);
    console.log("Analysis items:", detail.analysis_items);

    detail.analysis_items.forEach((item) => {
      // Skip jika hasil kosong atau hanya whitespace
      if (!item.hasil || item.hasil.trim() === "") {
        console.log(`Skipping ${item.nama_item} - no hasil`);
        return;
      }

      console.log(`Parsing ${item.nama_item}: "${item.hasil}"`);

      const parts = item.hasil.split(" | ");

      parts.forEach((p) => {
        const match = p.match(/\[(.*?)\]:\s*(.*)/);
        if (!match) return;

        const code = match[1];
        const value = match[2];

        // ===============================
        // BDM & BDP
        // ===============================
        if (item.nama_item === "BDM" || item.nama_item === "BDP") {
          // Format baru: INPUT=10 HASIL=0.10 (unit)
          const inputMatch = value.match(/INPUT=([\d.]+)/);
          if (inputMatch) {
            parsed[`${item.nama_item}-jumlah-${code}`] = inputMatch[1];
            hasData = true;
          } else {
            // Fallback untuk format lama (ambil angka pertama)
            const num = value.match(/[\d.]+/);
            if (num) {
              parsed[`${item.nama_item}-jumlah-${code}`] = num[0];
              hasData = true;
            }
          }
          return;
        }

        // ===============================
        // Diferensiasi Leukosit
        // ===============================
        if (item.nama_item === "Diferensiasi Leukosit") {
          const regex = /(\w+)=([\d.]+)/g;
          let m;
          while ((m = regex.exec(value)) !== null) {
            const labelMap = {
              Lim: "Limfosit",
              Het: "Heterofil",
              Eos: "Eosinofil",
              Mon: "Monosit",
              Bas: "Basofil",
            };
            const key = labelMap[m[1]];
            if (key) {
              parsed[`DL-${code}-${key}`] = m[2];
              hasData = true;
            }
          }
          return;
        }

        // ===============================
        // Kimia Klinik
        // ===============================
        if (stdConc[item.nama_item] !== undefined) {
          // Format baru: STD=0.123 SPL=0.456 HASIL=78.9 mg/dL
          const stdMatch = value.match(/STD=([\d.]+)/);
          const splMatch = value.match(/SPL=([\d.]+)/);

          if (stdMatch && splMatch) {
            parsed[`${item.nama_item}-std-${code}`] = stdMatch[1];
            parsed[`${item.nama_item}-spl-${code}`] = splMatch[1];
            hasData = true;
          } else {
            // Fallback untuk format lama (hanya hasil tanpa input)
            // Simpan ke spl saja
            const cleanValue = value.split(" ")[0];
            parsed[`${item.nama_item}-spl-${code}`] = cleanValue;
            hasData = true;
          }
          return;
        }

        // ===============================
        // Hemoglobin / Hematokrit
        // ===============================
        // Format baru: INPUT=10 HASIL=10.0 G%
        const inputMatch = value.match(/INPUT=([\d.]+)/);
        if (inputMatch) {
          parsed[`${item.nama_item}-${code}`] = inputMatch[1];
          hasData = true;
        } else {
          // Fallback untuk format lama
          const cleanValue = value.split(" ")[0];
          parsed[`${item.nama_item}-${code}`] = cleanValue;
          hasData = true;
        }
      });
    });

    // Hanya set state jika ada data yang valid
    if (hasData) {
      console.log("Setting nilaiAnalisis dengan data parsed:", parsed);
      console.log("Total keys parsed:", Object.keys(parsed).length);
      setNilaiAnalisis(parsed);
    } else {
      console.log("No data to populate - form will remain empty");
      // Fallback: coba isi secara heuristik jika format hasil berbeda
      const fallback = {};
      // Parse kode_sampel dari booking
      let codes = [];
      try {
        if (typeof detail.kode_sampel === "string") {
          const maybe = JSON.parse(detail.kode_sampel);
          codes = Array.isArray(maybe) ? maybe : [detail.kode_sampel];
        } else if (Array.isArray(detail.kode_sampel)) {
          codes = detail.kode_sampel;
        }
      } catch (e) {
        codes = typeof detail.kode_sampel === "string" ? [detail.kode_sampel] : [];
      }

      detail.analysis_items.forEach((item) => {
        if (!item.hasil || item.hasil.trim() === "") return;
        const parts = item.hasil.split(" | ");
        // Jika jumlah parts sama dengan jumlah kode, map satu-per-satu
        if (codes.length > 0 && parts.length === codes.length) {
          parts.forEach((p, idx) => {
            const num = p.match(/[\d.,]+/);
            if (!num) return;
            const cleaned = num[0].replace(/,/g, ".");
            const code = codes[idx];
            if (stdConc[item.nama_item] !== undefined) {
              // assign to sample value
              fallback[`${item.nama_item}-spl-${code}`] = cleaned;
            } else if (item.nama_item === "BDM") {
              fallback[`BDM-jumlah-${code}`] = cleaned;
            } else if (item.nama_item === "BDP") {
              fallback[`BDP-jumlah-${code}`] = cleaned;
            } else {
              fallback[`${item.nama_item}-${code}`] = cleaned;
            }
          });
        }
      });

      if (Object.keys(fallback).length > 0) {
        console.log("Applying fallback parsed values:", fallback);
        setNilaiAnalisis(fallback);
      }
    }
  };

  const handleInputChange = (key, value) => {
    setNilaiAnalisis((prev) => ({ ...prev, [key]: value }));
  };

  const generateSampleCodes = (booking) => {
    if (!booking) return [];

    try {
      let codes = [];

      if (typeof booking.kode_sampel === "string") {
        try {
          const parsed = JSON.parse(booking.kode_sampel);
          if (Array.isArray(parsed)) {
            codes = parsed;
          } else if (typeof parsed === "string") {
            codes = [parsed];
          } else {
            codes = [booking.kode_sampel];
          }
        } catch (e) {
          codes = [booking.kode_sampel];
        }
      } else if (Array.isArray(booking.kode_sampel)) {
        codes = booking.kode_sampel;
      }

      // extract codes from analysis_items hasil (format: [CODE]: ...)
      const fromItems = [];
      if (Array.isArray(booking.analysis_items)) {
        booking.analysis_items.forEach((it) => {
          if (!it?.hasil) return;
          const parts = it.hasil.split(" | ");
          parts.forEach((p) => {
            const m = p.match(/\[(.*?)\]/);
            if (m && m[1]) {
              if (!fromItems.includes(m[1])) fromItems.push(m[1]);
            }
          });
        });
      }

      // merge and dedupe
      const merged = Array.from(new Set([...(Array.isArray(codes) ? codes : []), ...fromItems]));
      return merged;
    } catch (error) {
      console.error("Error parsing kode_sampel:", error);
      return [];
    }
  };

  const handleBack = async () => {
    history.push("/teknisi/dashboard/inputNilaiAnalisis");
  };

  const handleResetForm = () => {
    Modal.confirm({
      title: "Reset Semua Input?",
      content: "Data yang belum disimpan akan hilang. Lanjutkan reset form?",
      okText: "Ya, Reset",
      okType: "danger",
      cancelText: "Batal",
      onOk: () => {
        setNilaiAnalisis({});
        message.info("Form telah direset");
      },
    });
  };

  // === HELPER: BUILD PAYLOAD (hanya simpan yang terisi) ===
  const buildItemsPayload = () => {
    return booking.analysis_items.map((item) => {
      const namaItem = item.nama_item;
      const codes = generateSampleCodes(booking);
      let hasilString = "";

      // === 1. KIMIA KLINIK (METABOLIT) ===
      if (stdConc[namaItem] !== undefined) {
        const itemUnit = getResultUnitForItem(namaItem);
        const results = codes
          .map((code) => {
            const valStd = nilaiAnalisis[`${namaItem}-std-${code}`] || "";
            const valSpl = nilaiAnalisis[`${namaItem}-spl-${code}`] || "";

            // Skip jika tidak ada input sama sekali
            if (!valStd && !valSpl) return null;

            const hasilMg = calculateResult(namaItem, valStd, valSpl);
            const hasilFinal = hasilMg === "-" || hasilMg === "" ? hasilMg : itemUnit === "g/dL" && !(namaItem === "Total Protein" || namaItem === "Albumin") ? (parseFloat(hasilMg) / 1000).toFixed(3) : hasilMg;
            // Format: [CODE]: STD=valStd SPL=valSpl HASIL=hasilFinal unit
            return `[${code}]: STD=${valStd} SPL=${valSpl} HASIL=${hasilFinal} ${itemUnit}`;
          })
          .filter(Boolean); // Hapus yang null
        hasilString = results.join(" | ");
      }
      // === 2. BDM ===
      else if (namaItem === "BDM") {
        const results = codes
          .map((code) => {
            const rawVal = nilaiAnalisis[`BDM-jumlah-${code}`] || "";

            // Skip jika tidak ada input
            if (!rawVal) return null;

            const akhr = ((parseFloat(rawVal) * 10000) / 1_000_000).toFixed(2);
            // Format: [CODE]: INPUT=rawVal HASIL=akhr (unit)
            return `[${code}]: INPUT=${rawVal} HASIL=${akhr} (10⁶/µL)`;
          })
          .filter(Boolean);
        hasilString = results.join(" | ");
      }
      // === 3. BDP ===
      else if (namaItem === "BDP") {
        const results = codes
          .map((code) => {
            const rawVal = nilaiAnalisis[`BDP-jumlah-${code}`] || "";

            // Skip jika tidak ada input
            if (!rawVal) return null;

            const factor = jenisBDP === "unggas" ? 125 : 50;
            const akhr = ((parseFloat(rawVal) * factor) / 1000).toFixed(2);
            // Format: [CODE]: INPUT=rawVal HASIL=akhr (unit)
            return `[${code}]: INPUT=${rawVal} HASIL=${akhr} (10³/µL)`;
          })
          .filter(Boolean);
        hasilString = results.join(" | ");
      }
      // === 4. DIFERENSIASI LEUKOSIT ===
      else if (namaItem === "Diferensiasi Leukosit") {
        const results = codes
          .map((code) => {
            const base = `DL-${code}`;
            const v = {
              Limfosit: nilaiAnalisis[`${base}-Limfosit`] || "",
              Heterofil: nilaiAnalisis[`${base}-Heterofil`] || "",
              Eosinofil: nilaiAnalisis[`${base}-Eosinofil`] || "",
              Monosit: nilaiAnalisis[`${base}-Monosit`] || "",
              Basofil: nilaiAnalisis[`${base}-Basofil`] || "",
            };

            // Skip jika tidak ada input sama sekali
            if (!v.Limfosit && !v.Heterofil && !v.Eosinofil && !v.Monosit && !v.Basofil) return null;

            // Simpan inputan (jumlah sel), bukan persentase
            return `[${code}]: Lim=${v.Limfosit}, Het=${v.Heterofil}, Eos=${v.Eosinofil}, Mon=${v.Monosit}, Bas=${v.Basofil}, Jenis=${jenisDL}`;
          })
          .filter(Boolean);
        hasilString = results.join(" | ");
      }
      // === 5. HEMOGLOBIN / HEMATOKRIT ===
      else if (namaItem === "Hemoglobin Darah" || namaItem === "Hematokrit") {
        // Gunakan key sesuai namaItem agar konsisten dengan input
        const key = namaItem; // "Hemoglobin Darah" atau "Hematokrit"
        const unit = namaItem.includes("Hemo") ? "G%" : "%";
        const results = codes
          .map((code) => {
            const val = nilaiAnalisis[`${key}-${code}`] || "";
            // Skip jika tidak ada input
            if (!val) return null;
            const hasil = calculateResult(key, val);
            // Format: [CODE]: INPUT=val HASIL=hasil unit
            return `[${code}]: INPUT=${val} HASIL=${hasil} ${unit}`;
          })
          .filter(Boolean);
        hasilString = results.join(" | ");
      }

      return {
        id: item.id,
        hasil: hasilString,
        metode: "Spectrophotometer",
        nama_analisis: item.nama_analisis || booking.jenis_analisis,
      };
    });
  };

  const handleSimpan = async () => {
    try {
      setLoading(true);

      const itemsPayload = buildItemsPayload();

      console.log("=== SIMPAN DRAFT ===");
      console.log("Items payload:", itemsPayload);
      console.log("Jumlah items:", itemsPayload.length);

      // Hitung berapa banyak yang terisi
      const filledItems = itemsPayload.filter((item) => item.hasil && item.hasil.trim() !== "");
      console.log("Items terisi:", filledItems.length);

      const response = await updateAnalysisResult(booking.id, { items: itemsPayload });

      console.log("Response dari backend:", response);

      // Update timestamp simpanan terakhir
      setLastSaved(new Date());

      message.success(`Draft berhasil disimpan! ${filledItems.length} item tersimpan.`);

      // Redirect ke daftar input nilai analisis setelah simpan draft
      history.push("/teknisi/dashboard/inputNilaiAnalisis");
    } catch (error) {
      console.error("Gagal menyimpan:", error);
      message.error("Terjadi kesalahan saat menyimpan data.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelesaikan = async () => {
    try {
      setLoading(true);

      // Cek apakah ada token
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("Sesi Anda telah berakhir. Silakan login kembali.");
        setTimeout(() => {
          history.push("/login");
        }, 2000);
        return;
      }

      // 1. Simpan data dulu sebelum finalize
      const itemsPayload = buildItemsPayload();

      console.log("=== SELESAIKAN ANALISIS ===");
      console.log("Payload yang akan dikirim:", itemsPayload);

      // Validasi: pastikan ada data yang terisi
      const filledItems = itemsPayload.filter((item) => item.hasil && item.hasil.trim() !== "");
      if (filledItems.length === 0) {
        message.warning("Tidak ada data yang tersimpan. Silakan isi minimal satu sampel.");
        return;
      }

      console.log("Items terisi:", filledItems.length);

      // Simpan data dulu
      const saveResponse = await updateAnalysisResult(booking.id, { items: itemsPayload });
      console.log("Save response:", saveResponse);

      // 2. Lalu finalize dan refresh data dari server untuk memastikan hasil tersimpan
      await finalizeAnalysis(booking.id);

      // Refresh booking dari backend agar UI menggunakan data paling baru
      try {
        const fresh = await getBookingById(booking.id);
        const detail = fresh?.data || fresh;
        if (detail) {
          setBooking(detail);
          if (detail?.analysis_items) {
            const groups = {};
            detail.analysis_items.forEach((item) => {
              const nama = item.nama_analisis || detail?.jenis_analisis || "Analisis";
              if (!groups[nama]) groups[nama] = [];
              groups[nama].push(item);
            });
            setGroupedItems(groups);
          }
        }
      } catch (e) {
        // Jika fetch by-id gagal, swallow and continue — user tetap berada di form
        console.warn("Gagal memuat booking terbaru setelah finalize:", e);
      }

      // Tampilkan pesan sukses dan arahkan ke generator PDF untuk meng-generate file
      setLastSaved(new Date());
      message.success("Analisis ditandai selesai (server). Mengarahkan untuk generate PDF...");

      // Redirect ke halaman generate PDF (preview only, tidak otomatis download atau kirim)
      history.push({
        pathname: "/teknisi/dashboard/generatePdfAnalysis",
        state: { booking: { id: booking.id, resultUnits: { ...resultUnits } }, autoGenerate: false },
      });
    } catch (error) {
      console.error("Gagal menyelesaikan:", error);

      // Handle 401 specifically
      if (error?.status === 401 || error?.message?.includes("401")) {
        message.error("Sesi Anda telah berakhir. Silakan login kembali.");
        setTimeout(() => {
          localStorage.clear();
          history.push("/login");
        }, 2000);
      } else {
        message.error("Terjadi kesalahan saat menyelesaikan analisis. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Pengiriman ke Koordinator dihapus - gunakan tombol Selesaikan untuk generate PDF

  if (loading && !booking)
    return (
      <NavbarLoginTeknisi>
        <div className="py-5 text-center">
          <Spin size="large" />
        </div>
      </NavbarLoginTeknisi>
    );
  if (!booking) return null;

  return (
    <NavbarLoginTeknisi>
      <div style={{ backgroundColor: "#f0f2f5", minHeight: "100vh", paddingBottom: "50px", fontFamily: "'Poppins', sans-serif" }}>
        {/* Header Section */}
        <div className="bg-white border-bottom mb-4 p-4 shadow-sm">
          <div className="container">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <Title level={3} className="mb-1">
                  <ExperimentOutlined className="text-primary me-2" /> Input Hasil Analisis
                </Title>
                <Text type="secondary">Silakan masukkan data mentah laboratorium di bawah ini.</Text>
              </div>
              {lastSaved && <div className="text-end"></div>}
            </div>
          </div>
        </div>

        <div className="container">
          {/* Booking Info Card */}
          <Card className="shadow-sm border-0 mb-4" style={{ borderRadius: "12px" }}>
            <div className="row">
              <div className="col-md-4 border-end">
                <Space direction="vertical" size={0}>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    <BarcodeOutlined /> Kode Batch
                  </Text>
                  <Title level={5} className="m-0 text-primary">
                    {booking.kode_batch || "-"}
                  </Title>
                </Space>
              </div>
              <div className="col-md-4 border-end">
                <Space direction="vertical">
                  <Text type="secondary">
                    <UserOutlined /> Nama Klien
                  </Text>
                  <Text strong className="d-block">
                    {booking.user?.full_name || booking.user?.nama_lengkap || booking.user?.name}
                  </Text>
                </Space>
              </div>
              <div className="col-md-4">
                <Space direction="vertical">
                  <Text type="secondary">Jenis Analisis</Text>
                  <Tag color="blue" style={{ fontSize: "14px", padding: "4px 12px" }}>
                    {booking.jenis_analisis}
                  </Tag>
                </Space>
              </div>
            </div>
          </Card>

          {/* (debug panel removed) */}

          {/* Form items */}
          {Object.values(groupedItems)
            .flat()
            .map((item) => (
              <Card
                key={item.id}
                className="shadow-sm border-0 mb-4"
                style={{ borderRadius: "12px" }}
                title={
                  <span className="text-primary">
                    <ExperimentOutlined /> {item.nama_item}
                  </span>
                }
              >
                {/* Case 1: Kimia Klinik (Metabolit) */}
                {stdConc[item.nama_item] !== undefined && (
                  <div>
                    <Alert
                      className="mb-3"
                      message={
                        <div className="d-flex align-items-center gap-3">
                          <SettingOutlined />
                          <Text strong>Konsentrasi Standar (Cstd):</Text>
                          <Input type="number" size="small" className="fw-bold text-center" style={{ width: "100px", borderRadius: "6px" }} value={stdConc[item.nama_item]} onChange={(e) => handleStdChange(item.nama_item, e.target.value)} />
                          <Text type="secondary" italic className="small">
                            *Sesuaikan dengan botol reagen
                          </Text>
                        </div>
                      }
                      type="info"
                    />

                    {/* === PILIHAN SATUAN === */}
                    <div className="d-flex gap-4 mb-3">
                      <Checkbox checked={getResultUnitForItem(item.nama_item) === "mg/dL"} onChange={() => setResultUnitForItem(item.nama_item, "mg/dL")}>
                        Hasil (mg/dL)
                      </Checkbox>

                      <Checkbox checked={getResultUnitForItem(item.nama_item) === "g/dL"} onChange={() => setResultUnitForItem(item.nama_item, "g/dL")}>
                        Hasil (g/dL)
                      </Checkbox>
                    </div>

                    <div className="table-responsive">
                      <table className="table table-hover align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>Label Sampel</th>
                            <th className="text-center">Abs Standar</th>
                            <th className="text-center">Abs Sampel</th>
                            <th className="text-center bg-light">Hasil ({getResultUnitForItem(item.nama_item)})</th>
                          </tr>
                        </thead>
                        <tbody>
                          {generateSampleCodes(booking).map((code, i) => {
                            const valStd = nilaiAnalisis[`${item.nama_item}-std-${code}`] || "";
                            const valSpl = nilaiAnalisis[`${item.nama_item}-spl-${code}`] || "";

                            const hasilMg = calculateResult(item.nama_item, valStd, valSpl);
                            // Nilai hasil tidak berubah, hanya label satuan yang berubah
                            const hasilFinal = hasilMg;

                            return (
                              <tr key={i}>
                                <td>
                                  <Tag>{code}</Tag>
                                </td>
                                <td>
                                  <Input type="number" step="0.001" className="text-center" placeholder="0.000" value={valStd} onChange={(e) => handleInputChange(`${item.nama_item}-std-${code}`, e.target.value)} />
                                </td>
                                <td>
                                  <Input type="number" step="0.001" className="text-center" placeholder="0.000" value={valSpl} onChange={(e) => handleInputChange(`${item.nama_item}-spl-${code}`, e.target.value)} />
                                </td>
                                <td className="bg-light">
                                  <Input className="text-center fw-bold text-primary" value={hasilFinal} disabled addonAfter={getResultUnitForItem(item.nama_item)} />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Case 2: Hematologi (BDM) */}
                {item.nama_item === "BDM" && (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Label Sampel</th>
                          <th className="text-center">Input (N)</th>
                          <th className="text-center">Hasil (butir/mm³)</th>
                          <th className="text-center bg-light">Total (10⁶/µL)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generateSampleCodes(booking).map((code, i) => {
                          const rawVal = nilaiAnalisis[`BDM-jumlah-${code}`] || "";
                          const tngh = rawVal ? parseFloat(rawVal) * 10000 : "-";
                          const akhr = rawVal ? (tngh / 1_000_000).toFixed(2) : "-";

                          return (
                            <tr key={i}>
                              <td>
                                <Tag>{code}</Tag>
                              </td>
                              <td>
                                <Input type="number" className="text-center" value={rawVal} onChange={(e) => handleInputChange(`BDM-jumlah-${code}`, e.target.value)} />
                              </td>
                              <td className="text-center text-muted">{tngh}</td>
                              <td className="bg-light">
                                <Input className="text-center fw-bold text-success" value={akhr} disabled />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Case 2: Hematologi (BDP) */}
                {item.nama_item === "BDP" && (
                  <>
                    {/* Pilihan Jenis Hewan */}
                    <div className="mb-3 d-flex gap-4 align-items-center">
                      <Text strong>Jenis Hewan:</Text>
                      <Checkbox checked={jenisBDP === "unggas"} onChange={() => setJenisBDP("unggas")}>
                        Unggas (×125)
                      </Checkbox>
                      <Checkbox checked={jenisBDP === "ruminansia"} onChange={() => setJenisBDP("ruminansia")}>
                        Ruminansia (×50)
                      </Checkbox>
                    </div>

                    {/* Tabel BDP */}
                    <div className="table-responsive">
                      <table className="table table-hover align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>Label Sampel</th>
                            <th className="text-center">Input (N)</th>
                            <th className="text-center">Hasil (butir/mm³)</th>
                            <th className="text-center bg-light">Total (10³/µL)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {generateSampleCodes(booking).map((code, i) => {
                            const rawVal = nilaiAnalisis[`BDP-jumlah-${code}`] || "";
                            const factor = jenisBDP === "unggas" ? 125 : 50;
                            const tngh = rawVal ? parseFloat(rawVal) * factor : "-";
                            const akhr = rawVal ? (tngh / 1000).toFixed(2) : "-";

                            return (
                              <tr key={i}>
                                <td>
                                  <Tag>{code}</Tag>
                                </td>
                                <td>
                                  <Input type="number" className="text-center" value={rawVal} onChange={(e) => handleInputChange(`BDP-jumlah-${code}`, e.target.value)} />
                                </td>
                                <td className="text-center text-muted">{tngh}</td>
                                <td className="bg-light">
                                  <Input className="text-center fw-bold text-success" value={akhr} disabled />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                {/* Case 3: Diferensiasi Leukosit */}
                {item.nama_item === "Diferensiasi Leukosit" && (
                  <>
                    {/* Pilihan Jenis Hewan */}
                    <div className="mb-3 d-flex gap-4 align-items-center">
                      <Text strong>Jenis Hewan:</Text>

                      <Checkbox checked={jenisDL === "unggas"} onChange={() => setJenisDL("unggas")}>
                        Unggas
                      </Checkbox>

                      <Checkbox checked={jenisDL === "ruminansia"} onChange={() => setJenisDL("ruminansia")}>
                        Ruminansia
                      </Checkbox>
                    </div>

                    <div className="table-responsive">
                      <table className="table table-bordered align-middle text-center small">
                        <thead className="table-light">
                          <tr>
                            <th rowSpan="2">Label</th>
                            <th colSpan="5">Hitung Jenis (Input N)</th>
                            <th rowSpan="2" className="bg-light">
                              Total
                            </th>
                            <th colSpan="6" className="bg-light">
                              Persentase (%)
                            </th>
                          </tr>
                          <tr style={{ fontSize: "10px" }}>
                            <th>Limfosit</th>
                            <th>{jenisDL === "ruminansia" ? "Neutrofil" : "Heterofil"}</th>
                            <th>Eosinofil</th>
                            <th>Monosit</th>
                            <th>Basofil</th>

                            <th>Limfosit%</th>
                            <th>{jenisDL === "ruminansia" ? "Neutrofil%" : "Heterofil%"}</th>
                            <th>Eosinofil%</th>
                            <th>Monosit%</th>
                            <th>Basofil%</th>
                            <th>Total%</th>
                          </tr>
                        </thead>

                        <tbody>
                          {generateSampleCodes(booking).map((code, i) => {
                            const base = `DL-${code}`;
                            const v = {
                              Limfosit: nilaiAnalisis[`${base}-Limfosit`] || "",
                              Heterofil: nilaiAnalisis[`${base}-Heterofil`] || "",
                              Eosinofil: nilaiAnalisis[`${base}-Eosinofil`] || "",
                              Monosit: nilaiAnalisis[`${base}-Monosit`] || "",
                              Basofil: nilaiAnalisis[`${base}-Basofil`] || "",
                            };

                            const h = hitungDiferensiasi(v);

                            return (
                              <tr key={i}>
                                <td>
                                  <Tag>{code}</Tag>
                                </td>

                                <td>
                                  <Input size="small" className="text-center px-1" value={v.Limfosit} onChange={(e) => handleInputChange(`${base}-Limfosit`, e.target.value)} />
                                </td>

                                {/* NEUTROFIL / HETEROFIL */}
                                <td>
                                  <Input size="small" className="text-center px-1" value={v.Heterofil} onChange={(e) => handleInputChange(`${base}-Heterofil`, e.target.value)} />
                                </td>

                                <td>
                                  <Input size="small" className="text-center px-1" value={v.Eosinofil} onChange={(e) => handleInputChange(`${base}-Eosinofil`, e.target.value)} />
                                </td>

                                <td>
                                  <Input size="small" className="text-center px-1" value={v.Monosit} onChange={(e) => handleInputChange(`${base}-Monosit`, e.target.value)} />
                                </td>

                                <td>
                                  <Input size="small" className="text-center px-1" value={v.Basofil} onChange={(e) => handleInputChange(`${base}-Basofil`, e.target.value)} />
                                </td>

                                <td className="bg-light">{h.Total}</td>
                                <td className="bg-light text-primary">{h.LimfositPersen}</td>
                                <td className="bg-light text-primary">{h.HeterofilPersen}</td>
                                <td className="bg-light text-primary">{h.EosinofilPersen}</td>
                                <td className="bg-light text-primary">{h.MonositPersen}</td>
                                <td className="bg-light text-primary">{h.BasofilPersen}</td>
                                <td className="text-center fw-bold text-success">{h.TotalPersen}%</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                {/* Case 4: Hemoglobin / Hematokrit */}
                {(item.nama_item === "Hemoglobin Darah" || item.nama_item === "Hematokrit") && (
                  <div className="table-responsive" style={{ maxWidth: "600px" }}>
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Label</th>
                          <th className="text-center">Input (N)</th>
                          <th className="text-center bg-light">Hasil {item.nama_item.includes("Hemo") ? "(G%)" : "(%)"}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generateSampleCodes(booking).map((code, i) => {
                          // Gunakan item.nama_item langsung agar konsisten dengan buildItemsPayload
                          const key = `${item.nama_item}-${code}`;
                          return (
                            <tr key={i}>
                              <td>
                                <Tag>{code}</Tag>
                              </td>
                              <td>
                                <Input type="number" className="text-center" value={nilaiAnalisis[key] || ""} onChange={(e) => handleInputChange(key, e.target.value)} />
                              </td>
                              <td className="bg-light">
                                <Input className="text-center fw-bold" value={calculateResult(item.nama_item, nilaiAnalisis[key])} disabled />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            ))}

          {/* Action Footer */}
          <div
            className="d-flex flex-wrap flex-md-nowrap justify-content-between align-items-center mt-5 p-4 bg-white shadow-sm gap-3 gap-md-0"
            style={{
              borderRadius: "12px",
              position: "sticky",
              bottom: 0,
              zIndex: 10,
              rowGap: "16px",
            }}
          >
            <div className="flex-grow-1 flex-basis-100 mb-2 mb-md-0" style={{ maxWidth: "220px" }}>
              <Button
                size="large"
                block
                onClick={handleBack}
                style={{
                  minWidth: "120px",
                  height: "48px",
                  borderRadius: "8px",
                  fontWeight: 500,
                  border: "1px solid #d9d9d9",
                }}
              >
                Kembali
              </Button>
            </div>

            <div className="d-flex flex-wrap flex-md-nowrap justify-content-end flex-grow-1 gap-2 gap-md-3" style={{ minWidth: 0 }}>
              <Button
                type="default"
                size="large"
                icon={<SaveOutlined />}
                loading={loading}
                onClick={handleSimpan}
                block
                style={{
                  minWidth: "160px",
                  height: "48px",
                  borderRadius: "8px",
                  fontWeight: 500,
                  borderColor: "#1890ff",
                  color: "#1890ff",
                  flex: 1,
                  maxWidth: "220px",
                }}
              >
                Simpan Draft
              </Button>

              <Button
                danger
                size="large"
                loading={loading}
                onClick={handleResetForm}
                block
                style={{
                  minWidth: "140px",
                  height: "48px",
                  borderRadius: "8px",
                  fontWeight: 500,
                  flex: 1,
                  maxWidth: "180px",
                }}
              >
                Reset Form
              </Button>

              <Button
                type="primary"
                size="large"
                icon={<CheckCircleFilled />}
                loading={loading}
                onClick={handleSelesaikan}
                block
                style={{
                  minWidth: "200px",
                  height: "48px",
                  borderRadius: "8px",
                  fontWeight: 500,
                  background: "#52c41a",
                  borderColor: "#52c41a",
                  boxShadow: "0 2px 8px rgba(82, 196, 26, 0.2)",
                  flex: 2,
                  maxWidth: "260px",
                }}
              >
                Selesaikan Analisis
              </Button>
              {/* Pengiriman ke Koordinator dihapus; gunakan tombol Selesaikan untuk generate PDF */}
            </div>
          </div>
        </div>
      </div>
      <FooterSetelahLogin />
    </NavbarLoginTeknisi>
  );
}

export default FormInputNilaiAnalisis;
