import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import NavbarLogin from "./NavbarLoginKlien";
import FooterSetelahLogin from "../FooterSetelahLogin";
import "../../css/MenungguPersetujuan.css";
import { getUserBookings, cancelBooking } from "../../services/BookingService";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import { useHistory } from "react-router-dom";
import dayjs from "dayjs";
import { Spin, message, Modal } from "antd";

const MenungguPersetujuan = () => {
  useEffect(() => {
    document.title = "SILAB-NTDK - Menunggu Persetujuan";
  }, []);

  const history = useHistory();
  const [bookingList, setBookingList] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(2);
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await getUserBookings();
        const bookings = response.data; // Pastikan ini array

        if (!bookings || bookings.length === 0) {
          setLoading(false);
          return;
        }

        const filtered = bookings.filter((b) => {
          const status = (b.status || "").toLowerCase();
          return status === "menunggu" || status === "menunggu persetujuan" || status === "disetujui" || status === "ditolak";
        });

        // PERBAIKAN DI SINI:
        // Cek struktur data user dari relasi Laravel (booking.user.full_name)
        if (bookings.length > 0) {
          const firstBooking = bookings[0];
          // Prioritas: user.full_name -> user.name -> user_fullname (legacy) -> localStorage
          const detectedName = firstBooking.user?.full_name || firstBooking.user?.name || firstBooking.user_fullname || "Pelanggan";

          setFullName(detectedName);
        }

        setBookingList(filtered);
      } catch (error) {
        console.error("Gagal memuat data:", error);
        message.error("Gagal mengambil data pesanan.");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleSelectBooking = (booking) => {
    setSelectedBooking(booking);
    const status = (booking.status || "").toLowerCase();
    if (status === "disetujui") {
      setCurrentStep(3);
    } else {
      setCurrentStep(2);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    Modal.confirm({
      title: "Batalkan Pesanan",
      content: "Apakah Anda yakin ingin membatalkan pesanan ini?",
      okText: "Ya, Batalkan",
      cancelText: "Tidak",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          setLoading(true);
          await cancelBooking(bookingId);
          message.success("Pesanan berhasil dibatalkan");
          // Refresh data
          const response = await getUserBookings();
          const filtered = response.data.filter((b) => {
            const status = (b.status || "").toLowerCase();
            return status === "menunggu" || status === "menunggu persetujuan" || status === "disetujui" || status === "ditolak";
          });
          setBookingList(filtered);
          setSelectedBooking(null);
        } catch (error) {
          message.error("Gagal membatalkan pesanan");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const getStatusBadge = (status) => {
    const lowerStatus = (status || "").toLowerCase();
    switch (lowerStatus) {
      case "proses":
        return "bg-info text-white";
      case "disetujui":
        return "bg-success text-white";
      case "ditolak":
        return "bg-danger text-white";
      default:
        return "bg-warning text-dark";
    }
  };

  const formatStatus = (status) => {
    const lower = (status || "").toLowerCase();
    if (lower === "menunggu") return "Menunggu Persetujuan";
    if (lower === "menunggu persetujuan") return "Menunggu Persetujuan";
    if (lower === "disetujui") return "Disetujui";
    if (lower === "ditolak") return "Ditolak";
    return status || "-";
  };

  const generateSampleCodes = (booking) => {
    if (!booking) return [];
    try {
      let codes = [];
      if (typeof booking.kode_sampel === "string") {
        try {
          codes = JSON.parse(booking.kode_sampel);
          if (Array.isArray(codes)) return codes;
        } catch (e) {
          codes = [booking.kode_sampel];
        }
      } else if (Array.isArray(booking.kode_sampel)) {
        codes = booking.kode_sampel;
      }
      return codes;
    } catch (error) {
      return ["Error loading codes"];
    }
  };

  const getBatchPrefix = (codes) => {
    // Jika booking punya kode_batch, gunakan itu
    if (Array.isArray(codes) && codes.booking && codes.booking.kode_batch) {
      return codes.booking.kode_batch;
    }
    // Fallback ke cara lama jika tidak ada kode_batch
    if (!codes || codes.length === 0) return "-";
    const first = codes[0] || "";
    const idx = first.lastIndexOf("-");
    if (idx > 0) return first.substring(0, idx);
    return first;
  };

  // PERBAIKAN DI SINI: Logika WA Link
  const getWALink = () => {
    if (!selectedBooking) return "#";
    const phone = "+628128910251";
    const allCodes = generateSampleCodes(selectedBooking);

    // Ambil nama spesifik dari booking yang dipilih (jika ada relasi user), atau gunakan state global
    const specificName = selectedBooking.user?.full_name || selectedBooking.user?.name || fullName || "Pelanggan";

    let text = `Halo Admin SILAB, konfirmasi pesanan:\n\n`;
    text += `👤 *Nama:* ${specificName}\n`;
    text += `📦 *Jumlah:* ${selectedBooking.jumlah_sampel} Sampel\n`;
    text += `🏷️ *Daftar Kode Sampel:*\n${allCodes.join("\n")}\n\n`;
    text += `🔬 *Layanan:* ${selectedBooking.jenis_analisis}\n`;
    text += `📅 *Tanggal:* ${dayjs(selectedBooking.tanggal_kirim).format("DD-MM-YYYY")}\n`;
    text += `📊 *Status:* ${selectedBooking.status}\n\n`;
    text += `Mohon diproses. Terima kasih.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

  const renderDetail = () => {
    if (!selectedBooking) return null;
    const sampleCodes = generateSampleCodes(selectedBooking);
    const status = (selectedBooking.status || "").toLowerCase();
    const isRejected = status === "ditolak";
    const isApproved = status === "disetujui";

    return (
      <div className="fade-in pb-5">
        <button className="btn btn-link text-decoration-none text-secondary p-0 mb-4" onClick={() => setSelectedBooking(null)}>
          <i className="bi bi-arrow-left me-2"></i> Kembali ke Daftar
        </button>

        <div className="progress-wrapper mb-5">
          <div className="step">
            <div className="icon-wrapper active big-step">
              <i className="bi bi-list-check"></i>
            </div>
            <p className="label active-text">Mengisi Form</p>
          </div>
          <div className="progress-line big-line filled"></div>
          <div className="step">
            <div className={`icon-wrapper active ${currentStep === 2 ? "pulse-active" : ""} big-step`}>{isRejected ? <i className="bi bi-x-lg"></i> : <i className="bi bi-clock"></i>}</div>
            <p className="label active-text">{isRejected ? "Ditolak" : "Verifikasi"}</p>
          </div>
          <div className={`progress-line big-line ${currentStep >= 3 ? "filled" : ""}`}></div>
          <div className="step">
            <div className={`icon-wrapper ${currentStep === 3 ? "active pulse-active" : ""} big-step`}>
              <i className="bi bi-check2"></i>
            </div>
            <p className={`label ${currentStep === 3 ? "active-text" : ""}`}>Disetujui</p>
          </div>
        </div>

        <div className="card border-0 shadow-sm mx-auto" style={{ maxWidth: "500px", borderRadius: "16px", overflow: "hidden" }}>
          <div style={{ height: "5px", backgroundColor: isRejected ? "#dc3545" : isApproved ? "#198754" : "#ffc107" }}></div>

          <div className="card-body p-4">
            <div className="text-center mb-3">
              {isRejected ? (
                <div className="text-danger mb-2">
                  <i className="bi bi-x-circle-fill" style={{ fontSize: "2.5rem" }}></i>
                  <h4 className="fw-bold mb-0">Pesanan Ditolak</h4>
                </div>
              ) : isApproved ? (
                <div className="text-success mb-2">
                  <i className="bi bi-check-circle-fill" style={{ fontSize: "2.5rem" }}></i>
                  <h4 className="fw-bold mb-0">Disetujui</h4>
                </div>
              ) : (
                <div className="text-warning mb-2">
                  <i className="bi bi-hourglass-split" style={{ fontSize: "2.5rem" }}></i>
                  <h4 className="fw-bold mb-0 text-dark">{formatStatus(selectedBooking.status)}</h4>
                </div>
              )}
            </div>

            {isRejected && (
              <div className="alert alert-danger border-0 rounded-3 p-2 mb-3" style={{ fontSize: "0.85rem" }}>
                <strong className="d-block text-uppercase" style={{ fontSize: "0.7rem" }}>
                  Alasan:
                </strong>
                {selectedBooking.alasan_penolakan || "Hubungi Admin."}
              </div>
            )}

            <div className="bg-light rounded-3 p-3 mb-3">
              <h6 className="fw-bold mb-2" style={{ fontSize: "0.9rem" }}>
                <i className="bi bi-info-circle me-2 text-primary"></i>Rincian Pesanan
              </h6>
              <div className="row g-2 shadow-none">
                <div className="col-6">
                  <small className="text-muted d-block" style={{ fontSize: "0.75rem" }}>
                    Jenis Analisis
                  </small>
                  <span className="fw-semibold" style={{ fontSize: "0.85rem" }}>
                    {selectedBooking.jenis_analisis}
                  </span>
                </div>
                <div className="col-6">
                  <small className="text-muted d-block" style={{ fontSize: "0.75rem" }}>
                    Tanggal Kirim
                  </small>
                  <span className="fw-semibold" style={{ fontSize: "0.85rem" }}>
                    {dayjs(selectedBooking.tanggal_kirim).format("DD MMM YYYY")}
                  </span>
                </div>
                <div className="col-12 mt-2">
                  <small className="text-muted d-block mb-1" style={{ fontSize: "0.75rem" }}>
                    Kode Label ({sampleCodes.length})
                  </small>
                  <div className="d-flex flex-wrap gap-1" style={{ maxHeight: "100px", overflowY: "auto" }}>
                    {sampleCodes.map((code, idx) => (
                      <span key={idx} className="badge bg-white text-dark border fw-normal" style={{ fontSize: "0.7rem" }}>
                        {code}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="d-grid gap-2">
              <a href={getWALink()} target="_blank" rel="noopener noreferrer" className="btn btn-success btn-sm rounded-pill py-2">
                <i className="bi bi-whatsapp me-2"></i> Hubungi Admin
              </a>
              {(status === "menunggu" || status === "menunggu persetujuan" || status === "disetujui") && (
                <button onClick={() => handleCancelBooking(selectedBooking.id)} className="btn btn-link text-danger btn-sm text-decoration-none">
                  Batalkan Pesanan
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <NavbarLogin>
      <div className="container py-5 min-vh-100">
        {!selectedBooking && (
          <div className="text-center mb-5">
            <h2 className="fw-bold text-dark">Persetujuan Pesanan</h2>
            <p className="text-muted">Pantau status pengajuan sampel Anda secara real-time</p>
          </div>
        )}

        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
            <LoadingSpinner text="Memuat data Pesanan..." />
          </div>
        ) : bookingList.length === 0 ? (
          <div className="container">
            <div
              className="text-center py-5 px-4 shadow-sm mt-4"
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "24px",
                border: "1px dashed #dee2e6",
              }}
            >
              {/* Visual Element */}
              <div className="mb-4">
                <div
                  className="d-inline-flex align-items-center justify-content-center mb-3"
                  style={{
                    width: "120px",
                    height: "120px",
                    backgroundColor: "#FDFBF7",
                    borderRadius: "50%",
                    color: "#8D6E63",
                  }}
                >
                  <i className="bi bi-clipboard2-x" style={{ fontSize: "3.5rem" }}></i>
                </div>
              </div>

              {/* Text Content */}
              <h4 className="fw-bold mb-2" style={{ color: "#4E342E" }}>
                Belum Ada Riwayat Pesanan
              </h4>
              <p className="text-muted mx-auto mb-4" style={{ maxWidth: "400px", fontSize: "0.95rem" }}>
                Sepertinya Anda belum mengajukan permohonan analisis sampel. Mulai pemesanan pertama Anda dengan menekan tombol di bawah ini.
              </p>

              {/* Action Button */}
              <button
                className="btn px-5 py-3 text-white shadow-sm fw-bold"
                style={{
                  backgroundColor: "#8D6E63",
                  borderRadius: "16px",
                  transition: "all 0.3s ease",
                  border: "none",
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#A1887F")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "#8D6E63")}
                onClick={() => history.push("/dashboard/pemesananSampelKlien")}
              >
                <i className="bi bi-plus-lg me-2"></i>
                Buat Pesanan Sekarang
              </button>

              {/* Help Link (Optional) */}
              <div className="mt-4">
                <small className="text-muted">
                  Butuh bantuan?{" "}
                  <a href="#" className="text-decoration-none" style={{ color: "#8D6E63" }} onClick={() => (window.location.href = "/dashboard/panduanSampelKlien")}>
                    Baca panduan layanan
                  </a>
                </small>
              </div>
            </div>
          </div>
        ) : selectedBooking ? (
          renderDetail()
        ) : (
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="row g-3">
                {bookingList.map((item) => {
                  const codes = generateSampleCodes(item);
                  // Inject booking ke codes agar getBatchPrefix bisa akses kode_batch
                  codes.booking = item;
                  const batchPrefix = getBatchPrefix(codes);
                  return (
                    <div key={item.id} className="col-12">
                      <div className="card border-0 shadow-sm hover-card-modern p-2" style={{ cursor: "pointer", borderRadius: "15px" }} onClick={() => handleSelectBooking(item)}>
                        <div className="card-body d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                          <div className="d-flex align-items-center">
                            <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3 d-none d-sm-block">
                              <i className="bi bi-flask text-primary h4 mb-0"></i>
                            </div>
                            <div>
                              <h6 className="fw-bold mb-1">
                                {batchPrefix}
                                {codes.length > 1 && <span className="text-primary small"> (+{codes.length} sampel)</span>}
                              </h6>
                              <div className="text-muted small">
                                <i className="bi bi-calendar-event me-1"></i> {dayjs(item.tanggal_kirim).format("DD MMM YYYY")}
                                <span className="mx-2">|</span>
                                <i className="bi bi-gear me-1"></i> {item.jenis_analisis}
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 mt-md-0 text-end d-flex flex-row flex-md-column align-items-center align-items-md-end justify-content-between">
                            <span className={`badge ${getStatusBadge(item.status)} px-3 py-2 rounded-pill shadow-sm mb-md-2`}>{formatStatus(item.status)}</span>
                            <span className="text-primary small fw-bold d-none d-md-block">
                              Detail <i className="bi bi-chevron-right"></i>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
      <FooterSetelahLogin />
    </NavbarLogin>
  );
};

export default MenungguPersetujuan;
