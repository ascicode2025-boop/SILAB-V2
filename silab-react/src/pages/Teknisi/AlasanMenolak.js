import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import NavbarLoginTeknisi from "./NavbarLoginTeknisi";
import FooterSetelahLogin from "../FooterSetelahLogin";
import { Modal } from "react-bootstrap";
import { useHistory, useLocation } from "react-router-dom";
import { updateBookingStatus } from "../../services/BookingService";

export default function AlasanMenolak() {
  useEffect(() => {
    document.title = "SILAB-NTDK - Alasan Menolak";
  }, []);

  const history = useHistory();
  const location = useLocation();

  // 1. AMBIL DATA (TERMASUK NO TELPON, KODE BATCH, KODE SAMPEL ARRAY)
  const { bookingId, kodeSampel, kodeBatch, sampleCodes, namaKlien, nomorTelpon } = location.state || {};

  const [alasan, setAlasan] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Modal states
  const [showEmptyModal, setShowEmptyModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Cek Keamanan Akses
  useEffect(() => {
    if (!bookingId) {
      history.push("/teknisi/dashboard/verifikasiSampel");
    }
  }, [bookingId, history]);

  // Fungsi Format Nomor WA (08xx -> 628xx)
  const formatWA = (number) => {
    if (!number) return "";
    let formatted = number.replace(/\D/g, ""); // Hapus karakter non-angka
    if (formatted.startsWith("0")) {
      formatted = "62" + formatted.slice(1);
    }
    return formatted;
  };

  // Fungsi Generate Link WA
  const handleWAConfirmation = () => {
    if (!nomorTelpon) {
      alert("Nomor telepon klien tidak ditemukan di database.");
      return;
    }
    const phone = formatWA(nomorTelpon);
    let text = `Halo Kak ${namaKlien},\n\n`;
    text += `Kami dari Laboratorium SILAB menginformasikan bahwa *Batch* dengan kode:\n`;
    text += `🆔 *${kodeBatch || "-"}*\n`;
    if (Array.isArray(sampleCodes) && sampleCodes.length > 0) {
      text += `\nDaftar kode sampel:\n`;
      sampleCodes.forEach((code, idx) => {
        text += `- ${code}\n`;
      });
    } else if (kodeSampel) {
      text += `\nKode Sampel: *${kodeSampel}*\n`;
    }
    text += `\nMohon maaf statusnya kami *TOLAK* dengan alasan:\n`;
    text += `_"${alasan}"_\n\n`;
    text += `Mohon diperbaiki/dikirim ulang sesuai catatan tersebut. Terima kasih.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleSaveClick = () => {
    if (!alasan.trim()) {
      setShowEmptyModal(true);
    } else {
      setShowConfirmModal(true);
    }
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      // Update status dengan lowercase dan kirim alasan
      await updateBookingStatus(bookingId, {
        status: "ditolak",
        alasan_penolakan: alasan,
      });
      setShowConfirmModal(false);
      setShowSuccessModal(true); // Tampilkan modal sukses + Tombol WA
    } catch (error) {
      console.error("Gagal menolak:", error);
      setShowConfirmModal(false);
      setShowErrorModal(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    history.push("/teknisi/dashboard/verifikasiSampel");
  };

  // Fallback for kodeBatch and sampleCodes if not passed (for backward compatibility)
  const kodeBatchDisplay = kodeBatch || "-";
  let sampleCodeList = [];
  if (Array.isArray(sampleCodes)) {
    sampleCodeList = sampleCodes;
  } else if (kodeSampel) {
    try {
      // Try parse if stringified array
      const parsed = JSON.parse(kodeSampel);
      if (Array.isArray(parsed)) sampleCodeList = parsed;
      else sampleCodeList = [kodeSampel];
    } catch {
      sampleCodeList = [kodeSampel];
    }
  }

  if (!bookingId) return null;

  return (
    <NavbarLoginTeknisi>
      <div className="min-h-screen bg-[#eee9e6] font-poppins container py-5 justify-content-center d-flex">
        <div className="card shadow-lg p-0" style={{ width: "650px", borderRadius: "25px" }}>
          {/* Header: Kode Batch as Title */}
          <div className="card-header text-center text-white" style={{ background: "#4b3a34", borderTopLeftRadius: "25px", borderTopRightRadius: "25px" }}>
            <div className="d-flex flex-column align-items-center gap-1">
              <span className="badge bg-primary bg-opacity-10 text-primary fw-bold px-4 py-2 rounded-pill shadow-sm mb-2" style={{ fontSize: "1.2rem", letterSpacing: "1px" }}>
                {kodeBatchDisplay}
              </span>
              <h5 className="m-0">Alasan Penolakan Sampel</h5>
              <p className="m-0 small opacity-75">Klien: {namaKlien}</p>
            </div>
          </div>

          <div className="card-body" style={{ background: "#e7e7e7", borderBottomLeftRadius: "25px", borderBottomRightRadius: "25px" }}>
            {/* Daftar Kode Sampel */}
            <div className="mb-3">
              <div className="text-muted small text-uppercase fw-bold mb-1">Daftar Kode Sampel</div>
              <div className="d-flex flex-wrap gap-2">
                {sampleCodeList.length > 0 ? (
                  sampleCodeList.map((code, idx) => (
                    <span key={idx} className="badge bg-light text-dark border fw-normal">
                      {code}
                    </span>
                  ))
                ) : (
                  <span className="text-muted fst-italic">Tidak ada kode sampel</span>
                )}
              </div>
            </div>
            <textarea
              className="form-control mb-4"
              rows="6"
              placeholder="Masukkan alasan penolakan secara jelas..."
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              style={{ resize: "none", background: "white", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
            ></textarea>

            <div className="d-flex justify-content-center gap-3">
              <button className="btn btn-secondary px-4 py-2 rounded-pill" onClick={() => history.goBack()}>
                Batal
              </button>
              <button className="btn btn-primary px-4 py-2 rounded-pill" style={{ background: "#8e6b60", border: "none" }} onClick={handleSaveClick}>
                Simpan & Tolak
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-6xl mt-6">
        <FooterSetelahLogin />
      </div>

      {/* --- MODALS --- */}

      {/* 1. Modal Kosong */}
      <Modal show={showEmptyModal} onHide={() => setShowEmptyModal(false)} centered dialogClassName="custom-popup">
        <div className="popup-body">
          <div className="popup-icon error">✖</div>
          <div className="popup-title">Alasan Kosong</div>
          <div className="popup-message">Wajib diisi agar klien tahu penyebab penolakan.</div>
          <button className="popup-button" onClick={() => setShowEmptyModal(false)}>
            Tutup
          </button>
        </div>
      </Modal>

      {/* 2. Modal Konfirmasi */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered dialogClassName="custom-popup">
        <div className="popup-body">
          <div className="popup-icon" style={{ background: "#6c5b4c" }}>
            ?
          </div>
          <div className="popup-title">Konfirmasi Penolakan</div>
          <div className="popup-message">Yakin ingin menolak sampel ini?</div>
          <div className="p-3 mb-3 rounded bg-light border text-start fst-italic">"{alasan}"</div>
          <div className="d-flex justify-content-center gap-3">
            <button className="popup-button bg-secondary" onClick={() => setShowConfirmModal(false)} disabled={isProcessing}>
              Batal
            </button>
            <button className="popup-button" onClick={handleConfirm} disabled={isProcessing}>
              {isProcessing ? "Menyimpan..." : "Ya, Tolak"}
            </button>
          </div>
        </div>
      </Modal>

      {/* 3. Modal Sukses + TOMBOL WA (FITUR BARU) */}
      <Modal show={showSuccessModal} onHide={handleCloseSuccess} centered dialogClassName="custom-popup">
        <div className="popup-body">
          <div className="popup-icon success">✔</div>
          <div className="popup-title">Berhasil Ditolak</div>
          <div className="popup-message">Status diperbarui. Beritahu klien via WhatsApp?</div>

          <div className="d-flex flex-column gap-2 mt-4">
            {/* Tombol WA */}
            {nomorTelpon ? (
              <button className="btn text-white fw-bold py-2" style={{ background: "#25D366", borderRadius: "12px" }} onClick={handleWAConfirmation}>
                <i className="bi bi-whatsapp me-2"></i> Kirim Alasan ke WA
              </button>
            ) : (
              <div className="alert alert-warning py-1 small">No. HP Klien tidak tersedia.</div>
            )}

            <button className="btn btn-outline-secondary py-2" style={{ borderRadius: "12px" }} onClick={handleCloseSuccess}>
              Kembali ke Tabel
            </button>
          </div>
        </div>
      </Modal>

      {/* 4. Modal Error */}
      <Modal show={showErrorModal} onHide={() => setShowErrorModal(false)} centered dialogClassName="custom-popup">
        <div className="popup-body">
          <div className="popup-icon error">!</div>
          <div className="popup-title">Gagal</div>
          <div className="popup-message">Terjadi kesalahan koneksi.</div>
          <button className="popup-button" onClick={() => setShowErrorModal(false)}>
            Tutup
          </button>
        </div>
      </Modal>

      <style>{`
             .custom-popup .modal-content { border-radius: 25px !important; padding: 0; overflow: hidden; }
             .popup-body { text-align: center; padding: 25px; background: #ffffff; }
             .popup-icon { font-size: 50px; width: 80px; height: 80px; margin: 0 auto 15px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; }
             .popup-icon.success { background: #4caf50; box-shadow: 0 4px 12px rgba(76,175,80,0.4); }
             .popup-icon.error { background: #e53935; box-shadow: 0 4px 12px rgba(229,57,53,0.4); }
             .popup-title { font-size: 20px; font-weight: 600; margin-bottom: 8px; }
             .popup-message { font-size: 15px; color: #666; margin-bottom: 15px; }
             .popup-button { background: #8e6b60; border: none; color: white; padding: 8px 20px; font-size: 14px; border-radius: 12px; transition: 0.2s; }
             .popup-button:hover { background: #6e5148; }
             .popup-button.bg-secondary:hover { background: #5a6268; }
      `}</style>
    </NavbarLoginTeknisi>
  );
}
