import React, { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import NavbarLoginTeknisi from "./NavbarLoginTeknisi";
import FooterSetelahLogin from "../FooterSetelahLogin";
import { message } from "antd";
import dayjs from "dayjs";
import { Modal } from "react-bootstrap";
import LoadingSpinner from "../../components/Common/LoadingSpinner";

// Import Service API
import { getAllBookings, updateBookingStatus, deleteBooking } from "../../services/BookingService";

const VerifikasiSampel = () => {
    const handleDelete = async (row) => {
      if (!window.confirm(`Hapus booking batch ${row.kode_batch || ""}? Data akan dihapus permanen!`)) return;
      try {
        setIsProcessing(true);
        await deleteBooking(row.id); // Panggil API hapus
        // Hapus dari state lokal agar tidak muncul lagi
        setDataBookings((prev) => prev.filter((item) => item.id !== row.id));
        toast.success("Sampel berhasil dihapus.");
      } catch (error) {
        toast.error("Gagal menghapus sampel.");
      } finally {
        setIsProcessing(false);
      }
    };
  useEffect(() => {
    document.title = "SILAB-NTDK - Verifikasi Sampel";
  }, []);

  const history = useHistory();
  const [dataBookings, setDataBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showPopup, setShowPopup] = useState(false);
  const [selectedSample, setSelectedSample] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailData, setDetailData] = useState(null);

  // State untuk modal tolak kualitas sampel
  const [showTolakKualitasModal, setShowTolakKualitasModal] = useState(false);
  const [selectedKualitasSampel, setSelectedKualitasSampel] = useState(null);
  const [alasanTolakKualitas, setAlasanTolakKualitas] = useState("");

  // Memoize approved data
  const approvedData = useMemo(
    () =>
      dataBookings.filter((item) => {
        const status = (item.status || "").toLowerCase();
        return status === "disetujui";
      }),
    [dataBookings],
  );

  // Memoize process data (kualitas sampel)
  const processData = useMemo(
    () =>
      dataBookings.filter((item) => {
        const status = (item.status || "").toLowerCase();
        return status === "proses";
      }),
    [dataBookings],
  );

  // Memoize cancelled data (kualitas sampel buruk)
  // Hanya tampilkan data yang statusnya 'dibatalkan' dan memang masih ada di dataBookings (belum dihapus dari database)
  const cancelledData = useMemo(
    () =>
      dataBookings.filter((item) => {
        const status = (item.status || "").toLowerCase();
        return status === "dibatalkan";
      }),
    [dataBookings],
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getAllBookings();
      // Limit data untuk performa - bisa disesuaikan di backend
      setDataBookings(response.data || []);
    } catch (error) {
      console.error(error);
      message.error("Gagal mengambil data pesanan.");
    } finally {
      setLoading(false);
    }
  };

  const generateSampleCodes = useCallback((booking) => {
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
      return [];
    }
  }, []);

  const formatStatus = useCallback((status) => {
    const st = (status || "").toLowerCase();
    if (st === "menunggu") return "Menunggu Persetujuan";
    if (st === "menunggu persetujuan") return "Menunggu Persetujuan";
    if (st === "menunggu_pembayaran" || st === "menunggu pembayaran" || st === "menunggu-pembayaran") return "Menunggu Pembayaran";
    if (st === "menunggu_verifikasi_kepala") return "Menunggu Verifikasi";
    if (st === "disetujui") return "Disetujui";
    if (st === "proses") return "Proses";
    if (st === "selesai") return "Selesai";
    if (st === "ditolak") return "Ditolak";
    return status || "-";
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  // Memoize filtered data untuk performa
  const filteredData = useMemo(() => {
    return dataBookings.filter((item) => {
      const query = search.toLowerCase();
      const userName = item.user ? (item.user.full_name || item.user.name).toLowerCase() : "";
      const kode = (item.kode_sampel || "").toLowerCase();
      const status = (item.status || "").toLowerCase();
      const analisis = (item.jenis_analisis || "").toLowerCase();

      // Hilangkan filter status agar semua status muncul
      return kode.includes(query) || userName.includes(query) || status.includes(query) || analisis.includes(query);
    });
  }, [dataBookings, search]);

  // Pagination untuk tabel utama
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const handleDetail = (row) => {
    setDetailData(row);
    setShowDetailModal(true);
  };

  const handleSetuju = (row) => {
    setSelectedSample(row);
    setShowPopup(true);
  };

  const confirmSetuju = async () => {
    if (!selectedSample) return;
    setIsProcessing(true);
    try {
      console.log("Updating booking status to disetujui:", selectedSample.id);
      await updateBookingStatus(selectedSample.id, "disetujui");
      message.success(`Sampel ${generateSampleCodes(selectedSample)[0]} berhasil disetujui!`);
      setShowPopup(false);
      fetchData();
    } catch (error) {
      console.error("Error updating status:", error);
      message.error(error?.response?.data?.message || error?.message || "Gagal update status.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTolak = (row) => {
    const noHp = row.user ? row.user.nomor_telpon : "";
    history.push({
      pathname: "/teknisi/dashboard/verifikasiSampel/alasanMenolak",
      state: {
        bookingId: row.id,
        kodeSampel: row.kode_sampel,
        kodeBatch: row.kode_batch,
        sampleCodes: generateSampleCodes(row),
        namaKlien: row.user ? row.user.full_name || row.user.name : "-",
        nomorTelpon: noHp,
      },
    });
  };

  const handleSampelSampai = async (row) => {
    try {
      setIsProcessing(true);
      console.log("Updating booking status to proses:", row.id);
      await updateBookingStatus(row.id, "proses");
      await fetchData();
      message.success("Sampel diterima! Pindah ke Kualitas Sampel");
    } catch (err) {
      console.error("Error updating status:", err);
      message.error(err?.response?.data?.message || err?.message || "Gagal mengubah status sampel");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputAnalisis = (row) => {
    history.push({
      pathname: "/teknisi/dashboard/inputNilaiAnalisis",
      state: { booking: row },
    });
  };

  const handleTolakKualitas = (row) => {
    setSelectedKualitasSampel(row);
    setAlasanTolakKualitas("");
    setShowTolakKualitasModal(true);
  };

  const confirmTolakKualitas = async () => {
    if (!selectedKualitasSampel || !alasanTolakKualitas.trim()) {
      message.error("Alasan penolakan harus diisi!");
      return;
    }
    try {
      setIsProcessing(true);
      console.log("Updating booking status to dibatalkan with reason:", selectedKualitasSampel.id);

      // Kirim status dan alasan penolakan ke backend
      await updateBookingStatus(selectedKualitasSampel.id, {
        status: "dibatalkan",
        alasan_teknisi: alasanTolakKualitas.trim(),
      });

      await fetchData();
      setShowTolakKualitasModal(false);
      setSelectedKualitasSampel(null);
      setAlasanTolakKualitas("");
      message.success("Analisis ditolak! Alasan telah dikirim ke klien.");
    } catch (err) {
      console.error("Error updating status:", err);
      message.error(err?.response?.data?.message || err?.message || "Gagal mengubah status sampel");
    } finally {
      setIsProcessing(false);
    }
  };

  // (Sudah digantikan dengan versi yang benar di atas)

  return (
    <NavbarLoginTeknisi>
      <div className="font-poppins container py-5">
        {/* Search Bar dan Filter */}
        <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
          <h4 className="fw-bold mb-0 text-dark">Daftar Verifikasi Sampel</h4>
          <div className="d-flex gap-2">
            <div className="input-group shadow-sm" style={{ maxWidth: "300px" }}>
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input type="text" className="form-control border-start-0 ps-0" placeholder="Cari..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            <select className="form-select shadow-sm" style={{ maxWidth: "180px" }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="semua">Semua Status</option>
              <option value="menunggu">Menunggu Persetujuan</option>
              <option value="disetujui">Disetujui</option>
              <option value="proses">Proses</option>
              <option value="selesai">Selesai</option>
            </select>
          </div>
        </div>

        {/* Tabel Data Utama */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-5">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ minWidth: "600px" }}>
              <thead className="bg-dark text-white">
                <tr>
                  <th className="ps-4 py-3 text-uppercase small fw-bold d-none d-md-table-cell" style={{ width: "60px" }}>
                    No
                  </th>
                  <th className="py-3 text-uppercase small fw-bold">Kode Batch</th>
                  <th className="py-3 text-uppercase small fw-bold d-none d-lg-table-cell">Klien</th>
                  <th className="py-3 text-uppercase small fw-bold text-center d-none d-md-table-cell">Jml</th>
                  <th className="py-3 text-uppercase small fw-bold d-none d-lg-table-cell">Jenis Analisis</th>
                  <th className="py-3 text-uppercase small fw-bold text-center d-none d-md-table-cell">Tanggal</th>
                  <th className="py-3 text-uppercase small fw-bold text-center">Status</th>
                  <th className="py-3 text-uppercase small fw-bold text-center pe-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((row, index) => (
                    <tr key={row.id}>
                      <td className="ps-4 text-muted d-none d-md-table-cell">{index + 1}</td>
                      <td>
                        <span className="badge bg-primary bg-opacity-10 text-primary fw-bold px-3 py-2 rounded-pill shadow-sm" style={{ fontSize: "1rem", letterSpacing: "1px" }}>
                          {row.kode_batch || "-"}
                        </span>
                        {generateSampleCodes(row).length > 1 && (
                          <div className="text-muted" style={{ fontSize: "11px" }}>
                            +{generateSampleCodes(row).length - 1} sampel lainnya
                          </div>
                        )}
                        {/* Mobile info */}
                        <div className="d-lg-none mt-1">
                          <small className="text-muted">👤 {row.user ? row.user.full_name || row.user.name : "Guest"}</small>
                          <br />
                          <small className="text-info">📊 {row.jenis_analisis}</small>
                        </div>
                        <div className="d-md-none mt-1">
                          <small className="text-muted">
                            📦 {row.jumlah_sampel} unit • 📅 {dayjs(row.tanggal_kirim).format("DD/MM/YY")}
                          </small>
                        </div>
                      </td>
                      <td className="d-none d-lg-table-cell">
                        <div className="text-dark fw-medium">{row.user ? row.user.full_name || row.user.name : "Guest"}</div>
                      </td>
                      <td className="text-center d-none d-md-table-cell">
                        <span className="badge rounded-pill bg-light text-dark border px-3">{row.jumlah_sampel}</span>
                      </td>
                      <td className="d-none d-lg-table-cell">
                        <span className="text-muted small">{row.jenis_analisis}</span>
                      </td>
                      <td className="text-center text-secondary small d-none d-md-table-cell">{dayjs(row.tanggal_kirim).format("DD/MM/YY")}</td>
                      <td className="text-center">
                        <span
                          className={`badge rounded-pill px-3 py-2 fw-normal ${
                            (row.status || "").toLowerCase() === "menunggu"
                              ? "bg-warning text-dark"
                              : (row.status || "").toLowerCase() === "disetujui"
                                ? "bg-primary text-white"
                                : (row.status || "").toLowerCase() === "proses"
                                  ? "bg-info text-white"
                                  : (row.status || "").toLowerCase() === "selesai"
                                    ? "bg-success text-white"
                                    : "bg-secondary text-white"
                          }`}
                        >
                          {formatStatus(row.status)}
                        </span>
                      </td>
                      <td className="text-center pe-4">
                        <div className="d-flex justify-content-center gap-2">
                          <button className="btn btn-outline-secondary btn-sm rounded-3 shadow-sm" onClick={() => handleDetail(row)}>
                            <i className="bi bi-eye"></i>
                          </button>
                          {(row.status || "").toLowerCase() === "menunggu" && (
                            <>
                              <button className="btn btn-success btn-sm rounded-3 shadow-sm" onClick={() => handleSetuju(row)}>
                                <i className="bi bi-check-lg"></i>
                              </button>
                              <button className="btn btn-danger btn-sm rounded-3 shadow-sm" onClick={() => handleTolak(row)}>
                                <i className="bi bi-x-lg"></i>
                              </button>
                            </>
                          )}
                          {/* Tombol hapus hanya untuk status dibatalkan */}
                          {(row.status || "").toLowerCase() === "dibatalkan" && (
                            <button className="btn btn-danger btn-sm rounded-3 shadow-sm" onClick={() => handleDelete(row)} disabled={isProcessing} title="Hapus booking dibatalkan">
                              <i className="bi bi-trash"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                      <i className="bi bi-inbox fs-2 d-block mb-2"></i>
                      Tidak ada data pesanan ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls */}
          <div className="d-flex justify-content-between align-items-center p-3 border-top flex-wrap gap-2">
            <span className="text-muted small order-2 order-md-1" style={{ fontSize: "12px" }}>
              <span className="d-none d-md-inline">
                Menampilkan {paginatedData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredData.length)} dari {filteredData.length} data
              </span>
              <span className="d-md-none">
                {paginatedData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-{Math.min(currentPage * itemsPerPage, filteredData.length)} / {filteredData.length}
              </span>
            </span>
            <nav className="order-1 order-md-2">
              <ul className="pagination mb-0" style={{ gap: "4px" }}>
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button className="page-link px-2 py-1" style={{ fontSize: "12px", minWidth: "auto" }} onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1}>
                    <span className="d-none d-sm-inline">&larr; Sebelumnya</span>
                    <span className="d-sm-none">&larr;</span>
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .slice(Math.max(0, currentPage - 1), Math.min(totalPages, currentPage + 1))
                  .map((page) => (
                    <li key={page} className={`page-item ${currentPage === page ? "active" : ""} d-none d-sm-block`}>
                      <button className="page-link px-2 py-1" style={{ fontSize: "12px", minWidth: "32px" }} onClick={() => setCurrentPage(page)}>
                        {page}
                      </button>
                    </li>
                  ))}
                {/* Mobile page info */}
                <li className="page-item d-sm-none">
                  <span className="page-link px-2 py-1 bg-light border-0" style={{ fontSize: "12px" }}>
                    {currentPage}/{totalPages}
                  </span>
                </li>
                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                  <button className="page-link px-2 py-1" style={{ fontSize: "12px", minWidth: "auto" }} onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>
                    <span className="d-none d-sm-inline">Selanjutnya &rarr;</span>
                    <span className="d-sm-none">&rarr;</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* ================= TABEL SAMPEL DISETUJUI ================= */}
        <div className="mt-5">
          <div className="d-flex align-items-center mb-3">
            <div className="bg-success rounded-circle p-2 me-2 d-flex align-items-center justify-content-center" style={{ width: "32px", height: "32px" }}>
              <i className="bi bi-check2 text-white"></i>
            </div>
            <h5 className="fw-bold mb-0 text-dark">Sampel Sampai</h5>
          </div>

          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" style={{ minWidth: "500px" }}>
                <thead style={{ backgroundColor: "#f8f9fa" }}>
                  <tr>
                    <th className="ps-4 py-3 text-muted small fw-bold d-none d-md-table-cell" style={{ width: "60px" }}>
                      No
                    </th>
                    <th className="py-3 text-muted small fw-bold">Kode Batch</th>
                    <th className="py-3 text-muted small fw-bold d-none d-lg-table-cell">Klien</th>
                    <th className="py-3 text-muted small fw-bold text-center d-none d-md-table-cell">Jumlah</th>
                    <th className="py-3 text-muted small fw-bold d-none d-lg-table-cell">Analisis</th>
                    <th className="py-3 text-muted small fw-bold text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedData.length > 0 ? (
                    approvedData.map((row, index) => (
                      <tr key={row.id}>
                        <td className="ps-4 text-muted d-none d-md-table-cell">{index + 1}</td>
                        <td>
                          <span className="badge bg-primary bg-opacity-10 text-primary fw-bold px-3 py-2 rounded-pill shadow-sm" style={{ fontSize: "1rem", letterSpacing: "1px" }}>
                            {row.kode_batch || "-"}
                          </span>
                          {/* Mobile info */}
                          <div className="d-lg-none mt-1">
                            <small className="text-muted">👤 {row.user ? row.user.full_name || row.user.name : "-"}</small>
                            <br />
                            <small className="text-info">📊 {row.jenis_analisis}</small>
                          </div>
                          <div className="d-md-none mt-1">
                            <small className="text-muted">📦 {row.jumlah_sampel} unit</small>
                          </div>
                        </td>
                        <td className="d-none d-lg-table-cell">{row.user ? row.user.full_name || row.user.name : "-"}</td>
                        <td className="text-center d-none d-md-table-cell">
                          <span className="badge bg-light text-dark border">{row.jumlah_sampel}</span>
                        </td>
                        <td className="d-none d-lg-table-cell">
                          <small className="text-muted">{row.jenis_analisis}</small>
                        </td>
                        <td className="text-center">
                          <button className="btn btn-primary btn-sm rounded-pill px-4 shadow-sm" onClick={() => handleSampelSampai(row)} disabled={isProcessing}>
                            {isProcessing ? (
                              <span>
                                <i className="bi bi-hourglass-split me-2"></i>Memproses...
                              </span>
                            ) : (
                              <span>
                                <i className="bi bi-box-seam me-2"></i>
                              </span>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-muted small italic">
                        Belum ada sampel yang menunggu penerimaan fisik.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ================= TABEL KUALITAS SAMPEL ================= */}
        <div className="mt-5">
          <div className="d-flex align-items-center mb-3">
            <div className="bg-info rounded-circle p-2 me-2 d-flex align-items-center justify-content-center" style={{ width: "32px", height: "32px" }}>
              <i className="bi bi-clipboard-data text-white"></i>
            </div>
            <h5 className="fw-bold mb-0 text-dark">Kualitas Sampel</h5>
            <span className="badge bg-info bg-opacity-10 text-info ms-2 px-3 py-2 rounded-pill">{processData.length} Sampel</span>
          </div>

          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" style={{ minWidth: "600px" }}>
                <thead style={{ backgroundColor: "#e3f2fd" }}>
                  <tr>
                    <th className="ps-4 py-3 small fw-bold d-none d-md-table-cell" style={{ width: "60px" }}>
                      No
                    </th>
                    <th className="py-3 small fw-bold">Kode Batch</th>
                    <th className="py-3 small fw-bold d-none d-lg-table-cell">Klien</th>
                    <th className="py-3 small fw-bold text-center d-none d-md-table-cell">Jumlah</th>
                    <th className="py-3 small fw-bold d-none d-lg-table-cell">Analisis</th>
                    <th className="py-3 small fw-bold text-center d-none d-lg-table-cell">Tanggal Diterima</th>
                    <th className="py-3 small fw-bold text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {processData.length > 0 ? (
                    processData.map((row, index) => (
                      <tr key={row.id}>
                        <td className="ps-4 text-muted d-none d-md-table-cell">{index + 1}</td>
                        <td>
                          <span className="badge bg-info bg-opacity-10 text-info fw-bold px-3 py-2 rounded-pill shadow-sm" style={{ fontSize: "1rem", letterSpacing: "1px" }}>
                            {row.kode_batch || "-"}
                          </span>
                          {generateSampleCodes(row).length > 1 && (
                            <div className="text-muted" style={{ fontSize: "11px" }}>
                              +{generateSampleCodes(row).length - 1} sampel lainnya
                            </div>
                          )}
                          {/* Mobile info */}
                          <div className="d-lg-none mt-1">
                            <small className="text-muted">👤 {row.user ? row.user.full_name || row.user.name : "Guest"}</small>
                            <br />
                            <small className="text-info">📊 {row.jenis_analisis}</small>
                            <br />
                            <small className="text-muted">📅 {dayjs(row.updated_at || row.tanggal_kirim).format("DD/MM/YY HH:mm")}</small>
                          </div>
                          <div className="d-md-none mt-1">
                            <small className="text-muted">📦 {row.jumlah_sampel} unit</small>
                          </div>
                        </td>
                        <td className="d-none d-lg-table-cell">
                          <div className="text-dark fw-medium">{row.user ? row.user.full_name || row.user.name : "Guest"}</div>
                        </td>
                        <td className="text-center d-none d-md-table-cell">
                          <span className="badge bg-light text-dark border px-3">{row.jumlah_sampel}</span>
                        </td>
                        <td className="d-none d-lg-table-cell">
                          <span className="text-muted small">{row.jenis_analisis}</span>
                        </td>
                        <td className="text-center text-secondary small d-none d-lg-table-cell">{dayjs(row.updated_at || row.tanggal_kirim).format("DD/MM/YY HH:mm")}</td>
                        <td className="text-center pe-4">
                          <div className="d-flex justify-content-center gap-2">
                            <button className="btn btn-outline-info btn-sm rounded-3 shadow-sm" onClick={() => handleDetail(row)} title="Lihat Detail">
                              <i className="bi bi-eye"></i>
                            </button>
                            <button className="btn btn-warning btn-sm rounded-3 shadow-sm text-white" onClick={() => handleInputAnalisis(row)} title="Input Nilai Analisis">
                              <i className="bi bi-pencil-square me-1"></i>
                            </button>
                            <button className="btn btn-danger btn-sm rounded-3 shadow-sm" onClick={() => handleTolakKualitas(row)} title="Tolak Sampel" disabled={isProcessing}>
                              <i className="bi bi-x-lg"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-5 text-muted">
                        <i className="bi bi-clipboard-data fs-2 d-block mb-2"></i>
                        Belum ada sampel dalam tahap analisis kualitas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ================= TABEL KUALITAS SAMPEL BURUK ================= */}
        <div className="mt-5">
          <div className="d-flex align-items-center mb-3">
            <div className="bg-danger rounded-circle p-2 me-2 d-flex align-items-center justify-content-center" style={{ width: "32px", height: "32px" }}>
              <i className="bi bi-exclamation-triangle text-white"></i>
            </div>
            <h5 className="fw-bold mb-0 text-dark">Kualitas Sampel Buruk</h5>
            <span className="badge bg-danger bg-opacity-10 text-danger ms-2 px-3 py-2 rounded-pill">{cancelledData.length} Sampel</span>
          </div>

          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" style={{ minWidth: "650px" }}>
                <thead style={{ backgroundColor: "#ffebee" }}>
                  <tr>
                    <th className="ps-4 py-3 small fw-bold d-none d-md-table-cell" style={{ width: "60px" }}>
                      No
                    </th>
                    <th className="py-3 small fw-bold">Kode Batch</th>
                    <th className="py-3 small fw-bold d-none d-lg-table-cell">Klien</th>
                    <th className="py-3 small fw-bold text-center d-none d-md-table-cell">Jumlah</th>
                    <th className="py-3 small fw-bold d-none d-lg-table-cell">Analisis</th>
                    <th className="py-3 small fw-bold">Alasan Penolakan</th>
                    <th className="py-3 small fw-bold text-center d-none d-lg-table-cell">Tanggal Ditolak</th>
                    <th className="py-3 small fw-bold text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {cancelledData.length > 0 ? (
                    cancelledData.map((row, index) => (
                      <tr key={row.id} style={{ backgroundColor: "#fff5f5" }}>
                        <td className="ps-4 text-muted d-none d-md-table-cell">{index + 1}</td>
                        <td>
                          <span className="badge bg-danger bg-opacity-10 text-danger fw-bold px-3 py-2 rounded-pill shadow-sm" style={{ fontSize: "1rem", letterSpacing: "1px" }}>
                            {row.kode_batch || "-"}
                          </span>
                          {generateSampleCodes(row).length > 1 && (
                            <div className="text-muted" style={{ fontSize: "11px" }}>
                              +{generateSampleCodes(row).length - 1} sampel lainnya
                            </div>
                          )}
                          {/* Mobile info */}
                          <div className="d-lg-none mt-1">
                            <small className="text-muted">👤 {row.user ? row.user.full_name || row.user.name : "Guest"}</small>
                            <br />
                            <small className="text-info">📊 {row.jenis_analisis}</small>
                            <br />
                            <small className="text-muted">📅 {dayjs(row.updated_at || row.tanggal_kirim).format("DD/MM/YY HH:mm")}</small>
                          </div>
                          <div className="d-md-none mt-1">
                            <small className="text-muted">📦 {row.jumlah_sampel} unit</small>
                          </div>
                        </td>
                        <td className="d-none d-lg-table-cell">
                          <div className="text-dark fw-medium">{row.user ? row.user.full_name || row.user.name : "Guest"}</div>
                        </td>
                        <td className="text-center d-none d-md-table-cell">
                          <span className="badge bg-light text-dark border px-3">{row.jumlah_sampel}</span>
                        </td>
                        <td className="d-none d-lg-table-cell">
                          <span className="text-muted small">{row.jenis_analisis}</span>
                        </td>
                        <td>
                          <div className="text-danger small" style={{ maxWidth: "200px" }}>
                            <i className="bi bi-exclamation-circle me-1"></i>
                            {row.alasan_teknisi ? <span>{row.alasan_teknisi}</span> : <span className="fst-italic text-muted">Tidak ada alasan tercatat</span>}
                          </div>
                        </td>
                        <td className="text-center text-secondary small d-none d-lg-table-cell">{dayjs(row.updated_at || row.tanggal_kirim).format("DD/MM/YY HH:mm")}</td>
                        <td className="text-center pe-4">
                          <div className="d-flex justify-content-center gap-2">
                            <button className="btn btn-outline-secondary btn-sm rounded-3 shadow-sm" onClick={() => handleDetail(row)} title="Lihat Detail">
                              <i className="bi bi-eye"></i>
                            </button>
                            <button className="btn btn-danger btn-sm rounded-3 shadow-sm" onClick={() => handleDelete(row)} disabled={isProcessing} title="Hapus booking dibatalkan">
                              <i className="bi bi-trash"></i>
                            </button>
                            {/* Tombol WhatsApp untuk mengirim alasan penolakan */}
                            {row.user?.nomor_telpon && row.alasan_teknisi && (
                              <a
                                className="btn btn-success btn-sm rounded-3 shadow-sm d-flex align-items-center gap-1"
                                href={`https://wa.me/${row.user.nomor_telpon.replace(/^0/, '62')}?text=${encodeURIComponent(
                                  `Halo ${row.user.full_name || row.user.name},\n\nBooking dengan kode batch: ${row.kode_batch || '-'} telah DITOLAK karena alasan berikut:\n${row.alasan_teknisi}\n\nSilakan hubungi admin untuk informasi lebih lanjut.\nTerima kasih.\n\nSILAB-NTDK IPB`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Kirim WhatsApp ke klien"
                              >
                                <i className="bi bi-whatsapp"></i>
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center py-5 text-muted">
                        <i className="bi bi-shield-x fs-2 d-block mb-2 text-danger"></i>
                        Tidak ada sampel yang ditolak karena kualitas buruk.
                        <div className="small text-success mt-1">Semua sampel memenuhi standar kualitas! 👍</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL DETAIL --- */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg" centered className="responsive-modal">
        <Modal.Header closeButton className="border-0 pb-2">
          <Modal.Title className="fw-bold fs-5">
            <i className="bi bi-clipboard-data me-2 text-primary"></i>
            Detail Booking
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-3 p-md-4">
          {detailData && (
            <div className="row g-3 g-md-4">
              <div className="col-12 col-lg-6">
                <div className="card border-0 bg-light bg-opacity-50 h-100">
                  <div className="card-body p-3">
                    <div className="d-flex align-items-center mb-3">
                      <i className="bi bi-person-circle me-2 text-primary fs-5"></i>
                      <h6 className="text-muted small text-uppercase fw-bold mb-0">Informasi Klien</h6>
                    </div>
                    <div className="d-flex flex-column gap-2">
                      <div className="d-flex justify-content-between align-items-center border-bottom border-light pb-2">
                        <span className="text-secondary small">Nama</span>
                        <span className="fw-medium text-end" style={{ fontSize: "13px", maxWidth: "60%", wordBreak: "break-word" }}>
                          {detailData.user?.full_name || detailData.user?.name}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center border-bottom border-light pb-2">
                        <span className="text-secondary small">Kode Batch</span>
                        <span className="badge bg-primary text-white px-2 py-1 rounded-pill shadow-sm fw-bold" style={{ fontSize: "12px", letterSpacing: "0.5px" }}>
                          {detailData.kode_batch || "-"}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center border-bottom border-light pb-2">
                        <span className="text-secondary small">Tgl Kirim</span>
                        <span className="small">{dayjs(detailData.tanggal_kirim).format("DD MMM YYYY")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12 col-lg-6">
                <div className="card border-0 bg-light bg-opacity-50 h-100">
                  <div className="card-body p-3">
                    <div className="d-flex align-items-center mb-3">
                      <i className="bi bi-clipboard2-data me-2 text-success fs-5"></i>
                      <h6 className="text-muted small text-uppercase fw-bold mb-0">Spesifikasi Sampel</h6>
                    </div>
                    <div className="d-flex flex-column gap-2">
                      <div className="d-flex justify-content-between align-items-center border-bottom border-light pb-2">
                        <span className="text-secondary small">Jenis Hewan</span>
                        <span className="small text-end" style={{ maxWidth: "60%", wordBreak: "break-word" }}>
                          {detailData.jenis_hewan === "Lainnya" ? detailData.jenis_hewan_lain : detailData.jenis_hewan}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center border-bottom border-light pb-2">
                        <span className="text-secondary small">Jumlah</span>
                        <span className="badge bg-success text-white px-2 py-1 rounded-pill fw-bold small">{detailData.jumlah_sampel} Unit</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center border-bottom border-light pb-2">
                        <span className="text-secondary small">Status</span>
                        <span className="badge bg-info text-white px-2 py-1 rounded-pill small">{formatStatus(detailData.status)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12">
                <div className="card border-0 bg-warning bg-opacity-10">
                  <div className="card-body p-3">
                    <div className="d-flex align-items-center mb-3">
                      <i className="bi bi-tags me-2 text-warning fs-5"></i>
                      <h6 className="text-muted small text-uppercase fw-bold mb-0">Daftar Label Sampel</h6>
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      {generateSampleCodes(detailData).map((code, idx) => (
                        <span key={idx} className="badge bg-white border border-warning text-dark fw-normal px-2 py-1 rounded-pill shadow-sm small">
                          📋 {code}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12">
                <div className="card border-0 bg-info bg-opacity-10">
                  <div className="card-body p-3">
                    <div className="d-flex align-items-center mb-3">
                      <i className="bi bi-gear me-2 text-info fs-5"></i>
                      <h6 className="text-muted small text-uppercase fw-bold mb-0">Parameter Analisis</h6>
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      {detailData.analysis_items?.length > 0 ? (
                        detailData.analysis_items.map((item, idx) => (
                          <span key={idx} className="badge bg-white border border-info text-secondary rounded-pill px-3 py-1 shadow-sm small">
                            🔬 {item.nama_item}
                          </span>
                        ))
                      ) : (
                        <div className="alert alert-info border-0 rounded-3 mb-0 py-2 px-3">
                          <i className="bi bi-info-circle me-2"></i>
                          <span className="small">Full Package ({detailData.jenis_analisis})</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-2 pb-3">
          <button className="btn btn-secondary px-4 rounded-pill shadow-sm" onClick={() => setShowDetailModal(false)}>
            <i className="bi bi-x-circle me-2"></i>
            Tutup
          </button>
        </Modal.Footer>
      </Modal>

      {/* --- MODAL KONFIRMASI SETUJU --- */}
      {showPopup && selectedSample && (
        <div className="popup-overlay">
          <div className="popup-box border-0 shadow-lg">
            <div className="mb-3 text-success">
              <i className="bi bi-question-circle fs-1"></i>
            </div>
            <h4 className="fw-bold">Konfirmasi</h4>
            <p className="text-muted">
              Setujui <b>batch {selectedSample.kode_batch || "-"}</b>? <br />
              Klien: <b>{selectedSample.user?.full_name || selectedSample.user?.name}</b>
            </p>
            <div className="d-flex justify-content-center gap-2 mt-4">
              <button className="btn btn-success px-4 rounded-3" onClick={confirmSetuju} disabled={isProcessing}>
                {isProcessing ? "Memproses..." : "Ya, Setujui"}
              </button>
              <button className="btn btn-light px-4 rounded-3" onClick={() => setShowPopup(false)} disabled={isProcessing}>
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL TOLAK KUALITAS SAMPEL --- */}
      <Modal show={showTolakKualitasModal} onHide={() => !isProcessing && setShowTolakKualitasModal(false)} size="md" centered style={{ zIndex: 9999 }}>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold text-danger">
            <i className="bi bi-exclamation-triangle me-2"></i>
            Tolak Kualitas Sampel
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedKualitasSampel && (
            <>
              <div className="alert alert-warning border-0 rounded-3 mb-3">
                <div className="d-flex align-items-center">
                  <i className="bi bi-info-circle me-2"></i>
                  <div>
                    <strong>Batch:</strong> {selectedKualitasSampel.kode_batch || "-"} <br />
                    <strong>Klien:</strong> {selectedKualitasSampel.user?.full_name || selectedKualitasSampel.user?.name}
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold text-dark">
                  Alasan Penolakan <span className="text-danger">*</span>
                </label>
                <textarea
                  className="form-control border-2"
                  rows={4}
                  value={alasanTolakKualitas}
                  onChange={(e) => setAlasanTolakKualitas(e.target.value)}
                  placeholder="Jelaskan mengapa kualitas sampel tidak memenuhi standar analisis..."
                  disabled={isProcessing}
                  style={{ resize: "none" }}
                />
                <div className="form-text text-muted">Alasan ini akan dikirimkan ke klien sebagai feedback.</div>
              </div>

              <div className="alert alert-danger border-0 rounded-3">
                <small>
                  <i className="bi bi-exclamation-triangle me-1"></i>
                  <strong>Perhatian:</strong> Sampel yang ditolak akan dikembalikan ke klien dan status berubah menjadi "Dibatalkan".
                </small>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <button className="btn btn-light px-4 rounded-3" onClick={() => setShowTolakKualitasModal(false)} disabled={isProcessing}>
            Batal
          </button>
          <button className="btn btn-danger px-4 rounded-3" onClick={confirmTolakKualitas} disabled={isProcessing || !alasanTolakKualitas.trim()}>
            {isProcessing ? (
              <span>
                <i className="bi bi-hourglass-split me-2"></i>
                Memproses...
              </span>
            ) : (
              <span>
                <i className="bi bi-x-circle me-2"></i>
                Tolak Sampel
              </span>
            )}
          </button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .table thead th { vertical-align: middle; border: none; }
        .table tbody td { border-bottom: 1px solid #f2f2f2; }
        .table-hover tbody tr:hover { background-color: #fbfbfb; transition: 0.2s; }
        .card { border: none; }
        .badge { font-weight: 500; letter-spacing: 0.3px; }
        
        .popup-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.4); display: flex; justify-content: center; align-items: center; z-index: 9999; backdrop-filter: blur(2px); }
        .popup-box { width: 380px; background: white; padding: 30px; border-radius: 24px; text-align: center; }
        
        /* Ensure modals appear above navbar */
        .modal { z-index: 9999 !important; }
        .modal-backdrop { z-index: 9998 !important; }
        
        /* Responsive modal styles */
        .responsive-modal .modal-dialog {
          max-width: 95%;
          margin: 1rem auto;
        }
        
        @media (min-width: 768px) {
          .responsive-modal .modal-dialog {
            max-width: 700px;
            margin: 2rem auto;
          }
        }
        
        @media (max-width: 576px) {
          .responsive-modal .modal-dialog {
            margin: 0.5rem;
            max-width: calc(100% - 1rem);
          }
          
          .responsive-modal .modal-body {
            padding: 1rem !important;
          }
          
          .responsive-modal .modal-header {
            padding: 1rem 1rem 0.5rem !important;
          }
          
          .responsive-modal .modal-footer {
            padding: 0.5rem 1rem 1rem !important;
          }
          
          .responsive-modal .card-body {
            padding: 0.75rem !important;
          }
          
          .responsive-modal .badge {
            font-size: 10px !important;
            padding: 0.25rem 0.5rem !important;
          }
        }
        
        /* Responsive table styles */
        @media (max-width: 767px) {
          .table-responsive {
            font-size: 14px;
          }
          .table thead th {
            font-size: 11px;
            padding: 8px 4px;
          }
          .table tbody td {
            padding: 8px 4px;
            font-size: 12px;
            line-height: 1.4;
          }
          .badge {
            font-size: 10px;
            padding: 4px 8px;
          }
          .btn-sm {
            padding: 4px 8px;
            font-size: 11px;
          }
        }
        
        @media (max-width: 575px) {
          .table thead th {
            font-size: 10px;
            padding: 6px 2px;
          }
          .table tbody td {
            padding: 6px 2px;
            font-size: 11px;
          }
          .badge {
            font-size: 9px;
            padding: 2px 6px;
          }
        }
        
        @keyframes popupShow { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .popup-box { animation: popupShow 0.3s ease-out; }
      `}</style>

      <FooterSetelahLogin />
    </NavbarLoginTeknisi>
  );
};

export default VerifikasiSampel;
