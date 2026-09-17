import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Modal, Spinner, Badge, Tooltip, OverlayTrigger } from "react-bootstrap";
import { FaChevronLeft, FaSave, FaPlus, FaMinus, FaTrashAlt, FaDownload, FaUpload, FaShoppingCart, FaQuestionCircle } from "react-icons/fa";
import { useHistory, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import NavbarLoginKlien from "./NavbarLoginKlien";
import FooterSetelahLogin from "../FooterSetelahLogin";
import axios from "axios";
import { getApiBaseUrl } from "../../config/apiConfig";
import { DatePicker, ConfigProvider } from "antd";
import idID from "antd/locale/id_ID";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import "antd/dist/reset.css";
import "dayjs/locale/id";

dayjs.extend(isBetween);
dayjs.locale("id");

const PengajuanPeminjamanAlat = () => {
  const history = useHistory();
  const location = useLocation();

  // Read stored user profile from localStorage
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const userIdentitas = {
    nama: storedUser.full_name || storedUser.name || "",
    noTelp: storedUser.nomor_telpon || storedUser.no_hp || storedUser.phone || "",
    email: storedUser.email || "",
    institusi: storedUser.institusi || storedUser.instansi || "",
  };

  const queryParams = new URLSearchParams(location.search);
  const toolIdFromUrl = queryParams.get("id");

  // Load initial tools from URL or equipment_cart
  const getInitialTools = () => {
    try {
      const cartData = localStorage.getItem("equipment_cart");
      if (cartData) {
        const parsed = JSON.parse(cartData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item) => ({
            id: item.id.toString(),
            quantity: Math.max(1, parseInt(item.quantity, 10) || 1),
          }));
        }
      }
    } catch (e) { }
    return toolIdFromUrl
      ? [{ id: toolIdFromUrl.toString(), quantity: 1 }]
      : [{ id: "", quantity: 1 }];
  };

  // State
  const [availableTools, setAvailableTools] = useState([]);
  const [selectedTools, setSelectedTools] = useState(getInitialTools);
  const [tanggalPeminjaman, setTanggalPeminjaman] = useState("");
  const [tanggalPengembalian, setTanggalPengembalian] = useState("");
  const [tujuanPeminjaman, setTujuanPeminjaman] = useState("");
  const [kegiatanPenelitian, setKegiatanPenelitian] = useState("");
  const [dosenPenanggungJawab, setDosenPenanggungJawab] = useState("");
  const [suratPembimbing, setSuratPembimbing] = useState(null);
  const [suratFileName, setSuratFileName] = useState("");
  const [buktiPembayaran, setBuktiPembayaran] = useState(null);
  const [buktiFileName, setBuktiFileName] = useState("");
  const [bookedDates, setBookedDates] = useState([]);
  const [closedDatesList, setClosedDatesList] = useState([]);
  const [availableStock, setAvailableStock] = useState({}); // { instrumentId: { total_unit, max_booked, available } }

  const isAnyToolPaid = selectedTools.some((item) => {
    const tool = availableTools.find((t) => t.id.toString() === item.id.toString());
    return tool && (tool.is_paid === 1 || tool.is_paid === true);
  });

  const totalHargaSewa = selectedTools.reduce((acc, item) => {
    const tool = availableTools.find((t) => t.id.toString() === item.id.toString());
    const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
    return acc + (tool && (tool.is_paid === 1 || tool.is_paid === true) ? (parseInt(tool.harga_sewa, 10) || 0) * qty : 0);
  }, 0);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultType, setResultType] = useState("success");
  const [resultMessage, setResultMessage] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isDownloadingForm, setIsDownloadingForm] = useState(false);
  const [showDateInfoModal, setShowDateInfoModal] = useState(false);

  useEffect(() => {
    document.title = "SILAB-NTDK - Pengajuan Peminjaman Alat";
    fetchInstruments();
    fetchClosedDates();
  }, []);

  const fetchClosedDates = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/rentals/closed-dates", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "application/json",
        },
      });
      setClosedDatesList(response.data.data || []);
    } catch (error) {
      console.error("Gagal memuat tanggal ditutup", error);
    }
  };

  const fetchInstruments = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/instruments");
      const list = response.data.data || [];
      setAvailableTools(list);
      if (!toolIdFromUrl && selectedTools.length === 1 && !selectedTools[0].id && list.length > 0) {
        setSelectedTools([{ id: list[0].id.toString(), quantity: 1 }]);
      }
    } catch (error) {
      console.error("Gagal memuat daftar alat", error);
    }
  };

  const fetchBookedDates = async () => {
    try {
      const ids = [...new Set(selectedTools.map((item) => item.id).filter(Boolean))].join(",");
      const url = ids
        ? `http://localhost:8000/api/rentals/booked-dates?instrument_ids=${ids}`
        : `http://localhost:8000/api/rentals/booked-dates`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "application/json",
        },
      });
      setBookedDates(response.data.data || []);
    } catch (error) {
      console.error("Gagal memuat tanggal booking", error);
    }
  };

  useEffect(() => {
    fetchBookedDates();
  }, [selectedTools]);

  // Fetch available stock when dates or tools change
  const fetchAvailableStock = async () => {
    try {
      const ids = [...new Set(selectedTools.map((item) => item.id).filter(Boolean))].join(",");
      if (!ids || !tanggalPeminjaman || !tanggalPengembalian) {
        setAvailableStock({});
        return;
      }
      const response = await axios.get(
        `http://localhost:8000/api/rentals/available-stock?instrument_ids=${ids}&start_date=${tanggalPeminjaman}&end_date=${tanggalPengembalian}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            Accept: "application/json",
          },
        }
      );
      setAvailableStock(response.data.data || {});

      // Auto-cap quantities if they exceed available stock
      setSelectedTools((prev) => {
        const stockData = response.data.data || {};
        let changed = false;
        const updated = prev.map((item) => {
          const stock = stockData[item.id];
          if (stock && item.quantity > stock.available && stock.available > 0) {
            changed = true;
            return { ...item, quantity: stock.available };
          }
          return item;
        });
        return changed ? updated : prev;
      });
    } catch (error) {
      console.error("Gagal memuat stok tersedia", error);
    }
  };

  useEffect(() => {
    fetchAvailableStock();
  }, [selectedTools, tanggalPeminjaman, tanggalPengembalian]);

  const disabledDatePeminjaman = (current) => {
    if (!current) return false;

    // Disable weekend (Saturday & Sunday)
    const dayOfWeek = current.day();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return true;
    }

    // Disable past dates
    if (current < dayjs().startOf('day')) {
      return true;
    }

    // Disable closed dates by coordinator
    const currentFormatted = current.format("YYYY-MM-DD");
    if (closedDatesList.some((item) => dayjs(item.tanggal).format("YYYY-MM-DD") === currentFormatted)) {
      return true;
    }

    // Check against bookedDates
    for (const range of bookedDates) {
      const start = dayjs(range.start).startOf('day');
      const end = dayjs(range.end).endOf('day');
      if (current.isBetween(start, end, null, '[]')) {
        return true;
      }
    }

    // Disable if after tanggalPengembalian (if set)
    if (tanggalPengembalian && current.isAfter(dayjs(tanggalPengembalian).endOf('day'))) {
      return true;
    }

    // Disable if there's a booked date or closed date between current and tanggalPengembalian
    if (tanggalPengembalian) {
      const returnDate = dayjs(tanggalPengembalian).endOf('day');
      for (const range of bookedDates) {
        const start = dayjs(range.start).startOf('day');
        if (current.isBefore(start) && returnDate.isAfter(start)) {
          return true; // range overlaps a booked date
        }
      }
    }

    return false;
  };

  const disabledDatePengembalian = (current) => {
    if (!current) return false;

    // Disable weekend (Saturday & Sunday)
    const dayOfWeek = current.day();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return true;
    }

    // Disable past dates
    if (current < dayjs().startOf('day')) {
      return true;
    }

    // Disable closed dates by coordinator
    const currentFormatted = current.format("YYYY-MM-DD");
    if (closedDatesList.some((item) => dayjs(item.tanggal).format("YYYY-MM-DD") === currentFormatted)) {
      return true;
    }

    // Disable if before tanggalPeminjaman (if set)
    if (tanggalPeminjaman && current.isBefore(dayjs(tanggalPeminjaman).startOf('day'))) {
      return true;
    }

    // Check against bookedDates
    for (const range of bookedDates) {
      const start = dayjs(range.start).startOf('day');
      const end = dayjs(range.end).endOf('day');
      if (current.isBetween(start, end, null, '[]')) {
        return true;
      }
    }

    // Disable if there's a booked date or closed date between tanggalPeminjaman and current
    if (tanggalPeminjaman) {
      const borrowDate = dayjs(tanggalPeminjaman).startOf('day');
      for (const range of bookedDates) {
        const start = dayjs(range.start).startOf('day');
        if (borrowDate.isBefore(start) && current.isAfter(start)) {
          return true; // range overlaps a booked date
        }
      }
    }

    return false;
  };

  const handleToolChange = (index, value) => {
    const updated = [...selectedTools];
    updated[index] = { ...updated[index], id: value, quantity: 1 };
    setSelectedTools(updated);
  };

  const handleQuantityChange = (index, delta) => {
    const updated = [...selectedTools];
    const toolId = updated[index].id.toString();
    const currentTool = availableTools.find((t) => t.id.toString() === toolId);
    const stockInfo = availableStock[toolId];
    // Use available stock from API if we have date-based data, otherwise fall back to total_unit
    const maxStock = stockInfo ? stockInfo.available : (currentTool ? (currentTool.total_unit ?? 99) : 99);
    const newQty = Math.max(1, Math.min(maxStock, (parseInt(updated[index].quantity, 10) || 1) + delta));
    updated[index] = { ...updated[index], quantity: newQty };
    setSelectedTools(updated);
  };

  const handleAddTool = () => {
    if (availableTools.length > 0) {
      const unusedTool = availableTools.find((t) => !selectedTools.some((st) => st.id.toString() === t.id.toString()));
      if (unusedTool) {
        setSelectedTools([...selectedTools, { id: unusedTool.id.toString(), quantity: 1 }]);
      } else {
        alert("Semua jenis alat telah ditambahkan.");
      }
    }
  };

  const handleRemoveTool = (index) => {
    if (selectedTools.length > 1) {
      setSelectedTools(selectedTools.filter((_, i) => i !== index));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSuratPembimbing(file);
      setSuratFileName(file.name);
    }
  };

  const handleBuktiChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBuktiPembayaran(file);
      setBuktiFileName(file.name);
    }
  };

  const handleDownloadTemplate = async (e) => {
    if (e) e.preventDefault();
    setIsDownloadingForm(true);
    try {
      const response = await fetch(`${getApiBaseUrl()}/download-template?t=${new Date().getTime()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Gagal mengunduh template");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "Formulir_Peminjaman_Lab.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error("Error downloading template:", error);
      alert("Gagal mengunduh template formulir.");
    } finally {
      setIsDownloadingForm(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!tujuanPeminjaman || !kegiatanPenelitian || !dosenPenanggungJawab || !tanggalPeminjaman || !tanggalPengembalian) {
      setErrorMsg("Harap lengkapi semua isian formulir.");
      return;
    }
    const startDay = dayjs(tanggalPeminjaman).day();
    const endDay = dayjs(tanggalPengembalian).day();
    if (startDay === 0 || startDay === 6 || endDay === 0 || endDay === 6) {
      setErrorMsg("Peminjaman alat tidak dapat dilakukan pada hari Sabtu & Minggu (Hari Libur).");
      return;
    }
    const hasClosedDate = closedDatesList.some((item) => {
      const dStr = dayjs(item.tanggal).format("YYYY-MM-DD");
      return dStr === tanggalPeminjaman || dStr === tanggalPengembalian;
    });
    if (hasClosedDate) {
      setErrorMsg("Tanggal peminjaman atau pengembalian tidak dapat dilakukan pada tanggal yang ditutup oleh koordinator.");
      return;
    }

    // Validasi ketersediaan tanggal & unit alat
    for (const toolItem of selectedTools) {
      if (!toolItem.id) continue;
      const tool = availableTools.find((t) => t.id.toString() === toolItem.id.toString());
      const toolName = tool?.nama_alat || "Alat";
      const stockInfo = availableStock[toolItem.id];
      const availableQty = stockInfo ? stockInfo.available : (tool?.total_unit ?? 99);
      const requestedQty = parseInt(toolItem.quantity, 10) || 1;

      if (stockInfo && availableQty <= 0) {
        setErrorMsg(`Alat "${toolName}" sudah dipesan pada rentang tanggal yang dipilih. Anda tidak dapat memesan di tanggal yang bersamaan. Silakan pilih tanggal peminjaman yang lain.`);
        return;
      }
      if (requestedQty > (tool?.total_unit ?? 99)) {
        setErrorMsg(`Jumlah peminjaman "${toolName}" (${requestedQty} unit) melebihi kapasitas total unit laboratorium (${tool?.total_unit ?? 1} unit).`);
        return;
      }
      if (stockInfo && requestedQty > availableQty) {
        setErrorMsg(`Alat "${toolName}" pada tanggal tersebut sudah dipesan sebagian (tersisa ${availableQty} unit). Permintaan Anda (${requestedQty} unit) tidak dapat diproses di tanggal yang bersamaan.`);
        return;
      }
    }

    if (!suratPembimbing) {
      setErrorMsg("Harap unggah Formulir Peminjaman (PDF) yang sudah diisi dan ditandatangani.");
      return;
    }
    if (isAnyToolPaid && !buktiPembayaran) {
      setErrorMsg("Harap unggah Bukti Pembayaran untuk alat berbayar.");
      return;
    }
    setErrorMsg("");
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      selectedTools.forEach((item) => {
        if (item.id) {
          const qty = parseInt(item.quantity, 10) || 1;
          for (let i = 0; i < qty; i++) {
            formData.append("instrument_ids[]", item.id);
          }
        }
      });
      formData.append("tujuan_peminjaman", tujuanPeminjaman);
      formData.append("kegiatan_penelitian", kegiatanPenelitian);
      formData.append("dosen_penanggung_jawab", dosenPenanggungJawab);
      formData.append("tanggal_peminjaman", tanggalPeminjaman);
      formData.append("tanggal_pengembalian", tanggalPengembalian);
      formData.append("surat_pembimbing", suratPembimbing);
      if (isAnyToolPaid && buktiPembayaran) {
        formData.append("payment_proof", buktiPembayaran);
      }

      await axios.post("http://localhost:8000/api/rentals", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "application/json",
        }
      });

      // Clear equipment cart from localStorage on success
      try {
        localStorage.removeItem("equipment_cart");
      } catch (e) { }

      setResultType("success");
      setResultMessage("Pengajuan peminjaman alat berhasil disimpan!");
      setShowResultModal(true);
    } catch (error) {
      console.error(error);
      setResultType("error");

      let msg = error.response?.data?.message || "Terjadi kesalahan saat menyimpan pengajuan.";
      const errors = error.response?.data?.errors;
      if (errors) {
        if (errors.tanggal_peminjaman) {
          msg = errors.tanggal_peminjaman[0];
        } else if (errors.instrument_ids) {
          msg = errors.instrument_ids[0];
        } else {
          const firstKey = Object.keys(errors)[0];
          if (firstKey && errors[firstKey]?.[0]) {
            msg = errors[firstKey][0];
          }
        }
      }

      setResultMessage(msg);
      setShowResultModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <NavbarLoginKlien>
      <Container
        fluid
        className="py-5 px-3 px-md-5"
        style={{
          minHeight: "100vh",
          backgroundColor: "#e9e9e9",
          fontFamily: "Poppins, sans-serif",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "880px",
            backgroundColor: "#ffffff",
            borderRadius: "24px",
            overflow: "hidden",
            boxShadow: "0 15px 35px rgba(0, 0, 0, 0.12)",
          }}
        >
          {/* Header Banner (Dark Brown) */}
          <div
            className="text-center py-4 px-3"
            style={{
              backgroundColor: "#543D31",
              color: "#ffffff",
            }}
          >
            <h3 className="fw-bold mb-1" style={{ fontSize: "1.45rem", letterSpacing: "-0.2px" }}>
              Formulir Pengajuan Peminjaman Alat Analisis
            </h3>
            <p className="mb-0 opacity-85" style={{ fontSize: "0.92rem", color: "#F5EBE6" }}>
              Lengkapi data untuk syarat peminjaman
            </p>
          </div>

          {/* Form Content */}
          <Form onSubmit={handleSubmit} className="p-4 p-md-5">

            <Row className="g-4 mb-4">
              {/* Left Column: Identitasmu Box */}
              <Col xs={12} md={6}>
                <Card
                  className="border-0 shadow-sm"
                  style={{
                    borderRadius: "18px",
                    overflow: "hidden",
                    border: "1px solid #E0E0E0",
                  }}
                >
                  {/* Identitas Header Badge */}
                  <div
                    className="text-center py-2 fw-semibold text-white"
                    style={{
                      backgroundColor: "#A6867B",
                      fontSize: "0.95rem",
                      letterSpacing: "0.3px",
                    }}
                  >
                    Identitasmu
                  </div>

                  <Card.Body className="p-4" style={{ backgroundColor: "#ffffff" }}>
                    <Row className="g-3">
                      <Col xs={12} md={6}>
                        <div className="text-muted small fw-medium">Nama Lengkap</div>
                        <div className="fw-bold text-dark" style={{ fontSize: "0.92rem" }}>
                          {userIdentitas.nama}
                        </div>
                      </Col>

                      <Col xs={12} md={6}>
                        <div className="text-muted small fw-medium">No. Telp</div>
                        <div className="fw-bold text-dark" style={{ fontSize: "0.92rem" }}>
                          {userIdentitas.noTelp}
                        </div>
                      </Col>

                      <Col xs={12}>
                        <div className="text-muted small fw-medium">Email</div>
                        <div className="fw-bold text-dark text-nowrap overflow-hidden text-truncate" style={{ fontSize: "0.92rem" }}>
                          {userIdentitas.email}
                        </div>
                      </Col>

                      <Col xs={12}>
                        <div className="text-muted small fw-medium">Institusi</div>
                        <div className="fw-bold text-dark" style={{ fontSize: "0.92rem" }}>
                          {userIdentitas.institusi}
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>

              {/* Right Column: Alat Selector & Quantity */}
              <Col xs={12} md={6}>
                <Form.Group className="h-100 d-flex flex-column justify-content-start">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Form.Label className="fw-bold text-dark mb-0" style={{ fontSize: "1.05rem" }}>
                      Alat Yang Dipinjam
                    </Form.Label>
                    <Badge bg="secondary" style={{ fontSize: "0.75rem" }}>
                      {selectedTools.length} Alat ({selectedTools.reduce((acc, it) => acc + (parseInt(it.quantity, 10) || 1), 0)} Unit)
                    </Badge>
                  </div>

                    <div className="d-flex flex-column gap-3">
                    {selectedTools.map((toolItem, index) => {
                      const tool = availableTools.find((t) => t.id.toString() === toolItem.id.toString());
                      const stockInfo = availableStock[toolItem.id];
                      const maxStock = stockInfo ? stockInfo.available : (tool ? (tool.total_unit ?? 99) : 99);
                      const isDateBooked = Boolean(toolItem.id && tanggalPeminjaman && tanggalPengembalian && stockInfo && stockInfo.available <= 0);

                      return (
                        <div
                          key={index}
                          className="p-3 d-flex flex-column gap-2"
                          style={{
                            backgroundColor: isDateBooked ? "#FFF5F5" : "#F7F5F3",
                            border: `1.5px solid ${isDateBooked ? "#FCA5A5" : "#DED8D3"}`,
                            borderRadius: "16px",
                          }}
                        >
                          <div className="d-flex align-items-center gap-2">
                            <Form.Select
                              value={toolItem.id}
                              onChange={(e) => handleToolChange(index, e.target.value)}
                              style={{
                                backgroundColor: "#FFFFFF",
                                border: `1px solid ${isDateBooked ? "#EF4444" : "#D5D5D5"}`,
                                borderRadius: "12px",
                                padding: "8px 36px 8px 14px",
                                fontSize: "0.88rem",
                                color: isDateBooked ? "#B91C1C" : "#333333",
                                fontWeight: "600",
                                boxShadow: "none",
                              }}
                            >
                              <option value="">-- Pilih Alat --</option>
                              {availableTools.map((t) => {
                                const isSelectedElsewhere = selectedTools.some((st, i) => i !== index && st.id.toString() === t.id.toString());
                                return (
                                  <option key={t.id} value={t.id} disabled={isSelectedElsewhere}>
                                    {t.nama_alat} {t.is_paid ? `(Berbayar - Rp ${Number(t.harga_sewa).toLocaleString("id-ID")})` : "(Gratis)"} (Total: {t.total_unit ?? 1} Unit)
                                  </option>
                                );
                              })}
                            </Form.Select>

                            {selectedTools.length > 1 && (
                              <Button
                                variant="outline-danger"
                                size="sm"
                                className="rounded-circle p-2 d-flex align-items-center justify-content-center"
                                style={{ width: "34px", height: "34px", flexShrink: 0 }}
                                onClick={() => handleRemoveTool(index)}
                                title="Hapus alat"
                              >
                                <FaTrashAlt size={12} />
                              </Button>
                            )}
                          </div>

                          {/* Error Message when Booked on Selected Date */}
                          {isDateBooked && (
                            <div
                              style={{
                                backgroundColor: "#FEF2F2",
                                border: "1px solid #FCA5A5",
                                color: "#DC2626",
                                padding: "8px 12px",
                                borderRadius: "10px",
                                fontSize: "0.82rem",
                                fontWeight: "600",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              <span>🚫 Alat ini sudah dipesan pada rentang tanggal yang dipilih. Anda tidak dapat memesan di tanggal yang bersamaan. Silakan ganti tanggal peminjaman.</span>
                            </div>
                          )}

                          {/* Quantity and Price Row */}
                          <div className="d-flex align-items-center justify-content-between pt-1 px-1">
                            <div className="d-flex align-items-center gap-2">
                              <span className="text-muted" style={{ fontSize: "0.8rem", fontWeight: "600" }}>
                                Jumlah:
                              </span>
                              <Button
                                variant="light"
                                size="sm"
                                style={{
                                  width: "28px",
                                  height: "28px",
                                  borderRadius: "50%",
                                  padding: 0,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  backgroundColor: "#fff",
                                  border: "1px solid #D0D0D0",
                                }}
                                onClick={() => handleQuantityChange(index, -1)}
                                disabled={isDateBooked || (parseInt(toolItem.quantity, 10) || 1) <= 1}
                              >
                                <FaMinus size={9} />
                              </Button>
                              <span
                                style={{
                                  minWidth: "24px",
                                  textAlign: "center",
                                  fontWeight: "700",
                                  fontSize: "0.88rem",
                                  color: isDateBooked ? "#DC2626" : "#4A3933",
                                }}
                              >
                                {isDateBooked ? 0 : (toolItem.quantity || 1)}
                              </span>
                              <Button
                                variant="light"
                                size="sm"
                                style={{
                                  width: "28px",
                                  height: "28px",
                                  borderRadius: "50%",
                                  padding: 0,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  backgroundColor: "#fff",
                                  border: "1px solid #D0D0D0",
                                }}
                                onClick={() => handleQuantityChange(index, 1)}
                                disabled={isDateBooked || (parseInt(toolItem.quantity, 10) || 1) >= maxStock}
                              >
                                <FaPlus size={9} />
                              </Button>
                              <span className={isDateBooked ? "text-danger fw-bold" : "text-muted"} style={{ fontSize: "0.75rem" }}>
                                {isDateBooked ? "(Sudah Dipesan di Tanggal Ini)" : `(Kapasitas: ${tool?.total_unit ?? 1} Unit)`}
                              </span>
                            </div>

                            <div className="text-end">
                              <span className="fw-bold" style={{ color: isDateBooked ? "#999" : "#543D31", fontSize: "0.85rem" }}>
                                {tool && tool.is_paid
                                  ? `Rp ${(Number(tool.harga_sewa) * (parseInt(toolItem.quantity, 10) || 1)).toLocaleString("id-ID")}`
                                  : "Gratis"}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <Button
                      variant="link"
                      className="align-self-start text-decoration-none p-0 mt-1 fw-semibold"
                      style={{ color: "#8D6E63", fontSize: "0.85rem" }}
                      onClick={handleAddTool}
                    >
                      <FaPlus size={12} className="me-1" /> Tambah Alat Lain
                    </Button>
                  </div>
                </Form.Group>
              </Col>
            </Row>

            {/* Row 2: Tanggal Peminjaman & Tanggal Pengembalian */}
            <Row className="g-4 mb-4">
              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold text-dark mb-2" style={{ fontSize: "1.05rem" }}>
                    Tanggal Peminjaman
                    <span className="ms-2 text-muted" style={{ cursor: "pointer" }} onClick={() => setShowDateInfoModal(true)}>
                      <FaQuestionCircle size={14} />
                    </span>
                  </Form.Label>
                  <ConfigProvider locale={idID}>
                    <DatePicker
                      value={tanggalPeminjaman ? dayjs(tanggalPeminjaman) : null}
                      onChange={(val) => setTanggalPeminjaman(val ? val.format("YYYY-MM-DD") : "")}
                      disabledDate={disabledDatePeminjaman}
                      format="DD MMMM YYYY"
                      style={{
                        width: "100%",
                        backgroundColor: "#ECECEC",
                        border: "1px solid #D5D5D5",
                        borderRadius: "14px",
                        padding: "10px 16px",
                        fontSize: "0.92rem",
                        color: "#333333",
                        boxShadow: "none",
                      }}
                    />
                      </ConfigProvider>
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold text-dark mb-2" style={{ fontSize: "1.05rem" }}>
                    Tanggal Pengembalian
                    <span className="ms-2 text-muted" style={{ cursor: "pointer" }} onClick={() => setShowDateInfoModal(true)}>
                      <FaQuestionCircle size={14} />
                    </span>
                  </Form.Label>
                  <ConfigProvider locale={idID}>
                    <DatePicker
                      value={tanggalPengembalian ? dayjs(tanggalPengembalian) : null}
                      onChange={(val) => setTanggalPengembalian(val ? val.format("YYYY-MM-DD") : "")}
                      disabledDate={disabledDatePengembalian}
                      format="DD MMMM YYYY"
                      style={{
                        width: "100%",
                        backgroundColor: "#ECECEC",
                        border: "1px solid #D5D5D5",
                        borderRadius: "14px",
                        padding: "10px 16px",
                        fontSize: "0.92rem",
                        color: "#333333",
                        boxShadow: "none",
                      }}
                    />
                  </ConfigProvider>
                </Form.Group>
              </Col>
            </Row>

            {/* Row 3: Tujuan Peminjaman & Kegiatan / Judul Penelitian */}
            <Row className="g-4 mb-4">
              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold text-dark mb-2" style={{ fontSize: "1.05rem" }}>
                    Tujuan Peminjaman
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Berikan Alasan Peminjaman.."
                    value={tujuanPeminjaman}
                    onChange={(e) => setTujuanPeminjaman(e.target.value)}
                    style={{
                      backgroundColor: "#ECECEC",
                      border: "1px solid #D5D5D5",
                      borderRadius: "14px",
                      padding: "12px 16px",
                      fontSize: "0.92rem",
                      color: "#333333",
                      boxShadow: "none",
                      resize: "none",
                    }}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold text-dark mb-2" style={{ fontSize: "1.05rem" }}>
                    Kegiatan / Judul Penelitian
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Berikan Nama Kegiatan.."
                    value={kegiatanPenelitian}
                    onChange={(e) => setKegiatanPenelitian(e.target.value)}
                    style={{
                      backgroundColor: "#ECECEC",
                      border: "1px solid #D5D5D5",
                      borderRadius: "14px",
                      padding: "12px 16px",
                      fontSize: "0.92rem",
                      color: "#333333",
                      boxShadow: "none",
                      resize: "none",
                    }}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Row 4: Dosen / Penanggung Jawab & File Upload */}
            <Row className="g-4 mb-4">
              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold text-dark mb-2" style={{ fontSize: "1.05rem" }}>
                    Dosen / Penanggung Jawab
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Contoh: Prof. Dr. Budi"
                    value={dosenPenanggungJawab}
                    onChange={(e) => setDosenPenanggungJawab(e.target.value)}
                    style={{
                      backgroundColor: "#ECECEC",
                      border: "1px solid #D5D5D5",
                      borderRadius: "14px",
                      padding: "10px 16px",
                      fontSize: "0.92rem",
                      color: "#333333",
                      boxShadow: "none",
                    }}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold text-dark mb-2 d-flex justify-content-between align-items-center" style={{ fontSize: "1.05rem" }}>
                    Formulir Peminjaman
                    <Button
                      variant="link"
                      type="button"
                      className="p-0 text-decoration-none"
                      style={{ fontSize: "0.85rem", color: "#8D6E63" }}
                      onClick={handleDownloadTemplate}
                      disabled={isDownloadingForm}
                    >
                      {isDownloadingForm ? (
                        <>
                          <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" />
                          Mengunduh...
                        </>
                      ) : (
                        <>
                          <FaDownload className="me-1" /> Unduh Template
                        </>
                      )}
                    </Button>
                  </Form.Label>

                  <div
                    className="position-relative"
                    style={{
                      backgroundColor: "#ECECEC",
                      border: "1px dashed #A6867B",
                      borderRadius: "14px",
                      padding: "12px 16px",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                    onClick={() => document.getElementById("file-upload").click()}
                  >
                    <input
                      type="file"
                      id="file-upload"
                      className="d-none"
                      accept=".pdf"
                      onChange={handleFileChange}
                    />
                    {suratFileName ? (
                      <div className="text-success fw-semibold" style={{ fontSize: "0.9rem" }}>
                        <FaUpload className="me-2" /> {suratFileName}
                      </div>
                    ) : (
                      <div className="text-muted" style={{ fontSize: "0.9rem" }}>
                        <FaUpload className="me-2" /> Klik untuk unggah PDF Formulir
                      </div>
                    )}
                  </div>
                </Form.Group>
              </Col>
            </Row>

            {isAnyToolPaid && (
              <Row className="g-4 mb-4">
                <Col xs={12}>
                  <Card
                    className="border-0 shadow-sm"
                    style={{
                      borderRadius: "18px",
                      overflow: "hidden",
                      border: "1px solid #E0E0E0",
                    }}
                  >
                    <div
                      className="text-center py-2 fw-semibold text-white"
                      style={{
                        backgroundColor: "#8D6E63",
                        fontSize: "1.1rem",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Informasi Pembayaran
                    </div>
                    <div className="p-4 bg-white">
                      <p className="mb-2" style={{ fontSize: "0.95rem", color: "#555" }}>
                        Alat yang Anda pilih memiliki biaya sewa. Silakan lakukan pembayaran sesuai dengan total biaya di bawah ini.
                      </p>
                      <h4 className="fw-bold mb-4" style={{ color: "#543D31" }}>
                        Total Biaya: Rp {totalHargaSewa.toLocaleString('id-ID')}
                      </h4>
                      <div className="mb-4 p-3 rounded" style={{ backgroundColor: "#F9F9F9", borderLeft: "4px solid #A6867B" }}>
                        <div className="fw-semibold mb-1" style={{ fontSize: "0.95rem" }}>Transfer Pembayaran ke:</div>
                        <div className="fw-bold text-dark" style={{ fontSize: "1.05rem", letterSpacing: "0.5px" }}>
                          Rek. BNI 0504118998
                        </div>
                        <div className="text-muted" style={{ fontSize: "0.9rem" }}>
                          a.n Kokom Komalasari
                        </div>
                      </div>
                      <Form.Group>
                        <Form.Label className="fw-bold text-dark mb-2" style={{ fontSize: "1.05rem" }}>
                          Unggah Bukti Pembayaran
                        </Form.Label>
                        <div
                          className="position-relative"
                          style={{
                            backgroundColor: "#ECECEC",
                            border: "1px dashed #A6867B",
                            borderRadius: "14px",
                            padding: "12px 16px",
                            textAlign: "center",
                            cursor: "pointer",
                            transition: "all 0.2s ease"
                          }}
                          onClick={() => document.getElementById("bukti-upload").click()}
                        >
                          <input
                            type="file"
                            id="bukti-upload"
                            className="d-none"
                            accept="image/*"
                            onChange={handleBuktiChange}
                          />
                          {buktiFileName ? (
                            <div className="text-success fw-semibold" style={{ fontSize: "0.9rem" }}>
                              <FaUpload className="me-2" /> {buktiFileName}
                            </div>
                          ) : (
                            <div className="text-muted" style={{ fontSize: "0.9rem" }}>
                              <FaUpload className="me-2" /> Klik untuk unggah Bukti Pembayaran (JPG/PNG/WEBP)
                            </div>
                          )}
                        </div>
                      </Form.Group>
                    </div>
                  </Card>
                </Col>
              </Row>
            )}

            {errorMsg && (
              <div className="alert alert-danger rounded-4 text-center mb-4 fw-semibold">
                {errorMsg}
              </div>
            )}

            {/* Action Buttons */}
            <div className="d-flex justify-content-between align-items-center mt-5 pt-2">
              <Button
                variant="light"
                type="button"
                style={{
                  backgroundColor: "#CCCCCC",
                  borderColor: "#CCCCCC",
                  color: "#333333",
                  borderRadius: "30px",
                  padding: "10px 30px",
                  fontWeight: "600",
                  fontSize: "0.95rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                }}
                onClick={() => history.goBack()}
              >
                <FaChevronLeft size={13} /> Kembali
              </Button>

              <Button
                type="submit"
                style={{
                  backgroundColor: "#543D31",
                  borderColor: "#543D31",
                  color: "#FFFFFF",
                  borderRadius: "30px",
                  padding: "10px 36px",
                  fontWeight: "600",
                  fontSize: "0.95rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 4px 12px rgba(84,61,49,0.3)",
                }}
              >
                <FaSave size={14} /> Simpan
              </Button>
            </div>
          </Form>
        </div>

        {/* Confirmation Modal Pop Up */}
        <Modal show={showDateInfoModal} onHide={() => setShowDateInfoModal(false)} centered>
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="fw-bold" style={{ color: "#333" }}>
              <i className="bi bi-info-circle text-primary me-2"></i>
              Info Pemilihan Tanggal
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="pt-3">
            <p className="text-muted mb-0" style={{ fontSize: "0.95rem", lineHeight: "1.6" }}>
              Tanggal yang sudah dipesan oleh klien lain tidak dapat dipilih (tidak dapat memesan alat di tanggal yang sama). Selain itu, hari libur (Sabtu & Minggu) dan tanggal tutup operasional lab juga dinonaktifkan secara otomatis pada kalender.
            </p>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="primary" className="rounded-pill px-4" onClick={() => setShowDateInfoModal(false)}>
              Mengerti
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal
          show={showConfirmModal}
          onHide={() => setShowConfirmModal(false)}
          centered
          dialogClassName="modal-confirm-custom"
        >
          <div
            className="p-4 p-md-5 text-center bg-white"
            style={{
              borderRadius: "28px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
            }}
          >
            <h4
              className="fw-bold mb-3"
              style={{
                color: "#1A1A1A",
                fontSize: "1.25rem",
                fontFamily: "Poppins, sans-serif",
              }}
            >
              Apakah data yang diberikan sudah sesuai?
            </h4>

            <p
              className="mb-4 mx-auto"
              style={{
                fontSize: "0.95rem",
                lineHeight: "1.6",
                maxWidth: "340px",
                color: "#4A4A4A",
              }}
            >
              Mohon lakukan crosscheck untuk menghindari kesalahan input data
            </p>

            <div className="d-flex justify-content-center gap-3 pt-2">
              <Button
                style={{
                  backgroundColor: "#DCDCDC",
                  borderColor: "#DCDCDC",
                  color: "#222222",
                  borderRadius: "30px",
                  padding: "10px 28px",
                  fontWeight: "600",
                  fontSize: "0.92rem",
                  boxShadow: "0 3px 8px rgba(0,0,0,0.08)",
                }}
                onClick={() => setShowConfirmModal(false)}
              >
                Cek kembali
              </Button>

              <Button
                style={{
                  backgroundColor: "#4E382C",
                  borderColor: "#4E382C",
                  color: "#FFFFFF",
                  borderRadius: "30px",
                  padding: "10px 28px",
                  fontWeight: "600",
                  fontSize: "0.92rem",
                  boxShadow: "0 4px 12px rgba(78,56,44,0.35)",
                }}
                onClick={handleConfirmSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                    Menyimpan...
                  </>
                ) : (
                  "Sudah, Ajukan"
                )}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Result Modal */}
        <Modal show={showResultModal} onHide={() => { }} centered dialogClassName="modal-confirm-custom">
          <div
            className="p-4 p-md-5 text-center"
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "28px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
              position: "relative",
            }}
          >
            {/* Result Icon */}
            <div
              className="mx-auto d-flex justify-content-center align-items-center mb-4"
              style={{
                width: "72px",
                height: "72px",
                backgroundColor: resultType === "success" ? "#E8F5E9" : "#FFEBEE",
                borderRadius: "50%",
              }}
            >
              {resultType === "success" ? (
                <svg width="36" height="36" viewBox="0 0 24 24" fill="#2E7D32">
                  <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                </svg>
              ) : (
                <svg width="36" height="36" viewBox="0 0 24 24" fill="#C62828">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                </svg>
              )}
            </div>

            <h4
              className="fw-bold mb-3"
              style={{
                color: "#2C2C2C",
                fontSize: "1.25rem",
                letterSpacing: "-0.3px",
              }}
            >
              {resultType === "success" ? "Berhasil!" : "Gagal!"}
            </h4>

            <p
              className="mb-4 mx-auto"
              style={{
                fontSize: "0.95rem",
                lineHeight: "1.6",
                maxWidth: "340px",
                color: "#4A4A4A",
              }}
            >
              {resultMessage}
            </p>

            <div className="d-flex justify-content-center gap-3 pt-2">
              <Button
                style={{
                  backgroundColor: resultType === "success" ? "#4E382C" : "#C62828",
                  borderColor: resultType === "success" ? "#4E382C" : "#C62828",
                  color: "#FFFFFF",
                  borderRadius: "30px",
                  padding: "10px 28px",
                  fontWeight: "600",
                  fontSize: "0.92rem",
                  boxShadow: resultType === "success" ? "0 4px 12px rgba(78,56,44,0.35)" : "0 4px 12px rgba(198,40,40,0.35)",
                }}
                onClick={() => {
                  setShowResultModal(false);
                  if (resultType === "success") {
                    history.push("/dashboard/detailPengajuan");
                  }
                }}
              >
                {resultType === "success" ? "Ke Daftar Pengajuan" : "Tutup"}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Custom CSS for confirmation modal */}
        <style>{`
          .modal-confirm-custom {
            max-width: 440px !important;
            width: 92% !important;
            margin: 1.75rem auto !important;
          }
          .modal-confirm-custom .modal-content {
            border: none !important;
            background: transparent !important;
            border-radius: 28px !important;
            box-shadow: none !important;
          }
        `}</style>
      </Container>
      <FooterSetelahLogin />
    </NavbarLoginKlien>
  );
};

export default PengajuanPeminjamanAlat;
