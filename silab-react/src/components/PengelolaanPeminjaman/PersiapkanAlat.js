import React, { useState } from "react";
import { Table, Modal } from "react-bootstrap";
import { FaWhatsapp } from "react-icons/fa";

export default function PersiapkanAlat({ rentals, onRefresh, onReadyPickup }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOpenConfirm = (item) => {
    setSelectedItem(item);
    setShowConfirmModal(true);
  };

    const handleWhatsApp = () => {
    if (!selectedItem || !selectedItem.user) return;
    const phone = selectedItem.user.nomor_telpon;
    if (!phone) {
      alert("Nomor telepon tidak tersedia.");
      return;
    }
    let formattedPhone = phone;
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "62" + formattedPhone.substring(1);
    }
    const text = "Halo " + selectedItem.user.name + ",\n\nAlat yang Anda pinjam dengan No. Pengajuan *" + selectedItem.rental_number + "* telah disiapkan dan berstatus *Siap Diambil*.\n\nSilakan datang ke Laboratorium untuk mengambil alat tersebut pada tanggal *" + selectedItem.start_date + "*.\n\nTerima kasih.";
    const url = "https://wa.me/" + formattedPhone + "?text=" + encodeURIComponent(text);
    window.open(url, "_blank");
  };

  const handleTandaiSiapDiambil = async () => {
    if (!selectedItem) return;
    setLoading(true);
    try {
      await onReadyPickup(selectedItem.id);
      setShowConfirmModal(false);
      setShowSuccessModal(true);
      onRefresh();
    } catch (error) {
      setErrorMessage(error.message || "Gagal menandai siap diambil");
      setShowConfirmModal(false);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header Info */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
          <div style={{ width: "28px", height: "3px", backgroundColor: "#A6867B", borderRadius: "2px" }} />
          <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#4A3933", letterSpacing: "0.8px", textTransform: "uppercase" }}>
            SILAB-NTDK SYSTEM
          </span>
        </div>
        <h2 style={{ fontWeight: 800, fontSize: "1.75rem", color: "#332723", marginBottom: "6px" }}>
          Persiapkan Alat
        </h2>
        <p style={{ color: "#616161", fontSize: "0.92rem", margin: 0 }}>
          Persiapkan alat yang telah disetujui sebelum diserahkan kepada peminjam.
        </p>
      </div>

      {/* Main Table Card */}
      <div className="main-table-card" style={{
        backgroundColor: "#ffffff",
        borderRadius: "24px",
        padding: "28px 32px",
        boxShadow: "0 6px 24px rgba(0,0,0,0.05)",
        border: "1px solid #EAEAEA",
      }}>
        <div className="table-responsive" style={{ WebkitOverflowScrolling: "touch", overflowX: "auto" }}>
          <Table borderless style={{ verticalAlign: "middle", marginBottom: 0 }}>
            <thead>
              <tr style={{ color: "#212121", fontSize: "0.95rem", fontWeight: "700", borderBottom: "1px solid #EEEEEE" }}>
                <th style={{ paddingBottom: "16px", width: "60px" }}>No</th>
                <th style={{ paddingBottom: "16px" }}>No Pengajuan</th>
                <th style={{ paddingBottom: "16px" }}>Nama Peminjam</th>
                <th style={{ paddingBottom: "16px" }}>Alat</th>
                <th style={{ paddingBottom: "16px", textAlign: "center" }}>Tanggal Ambil</th>
                <th style={{ paddingBottom: "16px", textAlign: "center" }}>Status</th>
                <th style={{ paddingBottom: "16px", textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rentals && rentals.length > 0 ? (
                rentals.map((item, index) => (
                  <tr key={item.id} style={{ fontSize: "0.88rem", borderBottom: "1px solid #F5F5F5" }}>
                    <td style={{ fontWeight: "600", color: "#616161" }}>{index + 1}</td>
                    <td style={{ fontWeight: "600", color: "#212121" }}>{item.rental_number}</td>
                    <td style={{ color: "#424242" }}>{item.user?.name}</td>
                    <td style={{ color: "#424242" }}>
                      {item.groupedItems?.map((i) => `${i.instrument?.name} (${i.quantity})`).join(", ")}
                    </td>
                    <td style={{ textAlign: "center", color: "#424242" }}>{item.start_date}</td>
                    <td style={{ textAlign: "center" }}>
                      <span style={{
                        backgroundColor: "#FFF3E0",
                        color: "#E65100",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                        padding: "4px 12px",
                        borderRadius: "20px",
                      }}>
                        Disetujui
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        type="button"
                        onClick={() => handleOpenConfirm(item)}
                        style={{
                          backgroundColor: "#A6867B",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "20px",
                          padding: "6px 22px",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          boxShadow: "0 3px 10px rgba(166,134,123,0.35)",
                          transition: "all 0.2s ease",
                        }}
                      >
                        Persiapkan
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    Tidak ada pengajuan yang perlu dipersiapkan.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        @media (max-width: 768px) {
          .main-table-card {
            padding: 16px 14px !important;
            border-radius: 16px !important;
          }
        }
        .custom-modal-clean .modal-content {
          border-radius: 18px !important;
          border: none !important;
          overflow: hidden !important;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18) !important;
          background-color: #ffffff !important;
        }
        .custom-modal-narrow { max-width: 440px !important; }
      `}</style>

      {/* MODAL KONFIRMASI */}
      <Modal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        centered
        dialogClassName="custom-modal-clean custom-modal-narrow"
      >
        <div style={{ backgroundColor: "#A6867B", color: "#ffffff", padding: "14px 20px", textAlign: "center", fontWeight: "700", fontSize: "1.15rem" }}>
          Konfirmasi Persiapan
        </div>
        {selectedItem && (
          <div style={{ padding: "28px 32px 32px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", textAlign: "center", marginBottom: "20px" }}>
              <div>
                <div style={{ fontWeight: "700", color: "#757575", fontSize: "0.85rem", marginBottom: "4px" }}>Nama</div>
                <div style={{ color: "#212121", fontSize: "0.95rem", fontWeight: "600" }}>{selectedItem.user?.name}</div>
              </div>
              <div>
                <div style={{ fontWeight: "700", color: "#757575", fontSize: "0.85rem", marginBottom: "4px" }}>No. Pengajuan</div>
                <div style={{ color: "#212121", fontSize: "0.95rem", fontWeight: "600" }}>{selectedItem.rental_number}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr 1fr", gap: "12px", textAlign: "center", marginBottom: "24px" }}>
              <div>
                <div style={{ fontWeight: "700", color: "#757575", fontSize: "0.85rem", marginBottom: "4px" }}>Alat</div>
                <div style={{ color: "#212121", fontSize: "0.92rem", fontWeight: "600", lineHeight: "1.3" }}>
                  {selectedItem.groupedItems?.map((i) => i.instrument?.name).join(", ")}
                </div>
              </div>
              <div>
                <div style={{ fontWeight: "700", color: "#757575", fontSize: "0.85rem", marginBottom: "4px" }}>Jumlah</div>
                <div style={{ color: "#212121", fontSize: "0.92rem", fontWeight: "600" }}>
                  {selectedItem.groupedItems?.reduce((t, i) => t + i.quantity, 0)} Unit
                </div>
              </div>
              <div>
                <div style={{ fontWeight: "700", color: "#757575", fontSize: "0.85rem", marginBottom: "4px" }}>Tanggal Ambil</div>
                <div style={{ color: "#212121", fontSize: "0.92rem", fontWeight: "600" }}>{selectedItem.start_date}</div>
              </div>
            </div>
            <p style={{ textAlign: "center", fontSize: "0.9rem", color: "#424242", marginBottom: "28px" }}>
              Tandai peminjaman ini sebagai <strong>"Siap Diambil"</strong>?<br />
              <span style={{ fontSize: "0.82rem", color: "#757575" }}>Klien akan mendapat notifikasi bahwa alat sudah siap.</span>
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "18px" }}>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                style={{ backgroundColor: "#D8D8D8", color: "#212121", border: "none", borderRadius: "12px", padding: "8px 34px", fontWeight: "600", fontSize: "0.88rem", cursor: "pointer" }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleTandaiSiapDiambil}
                disabled={loading}
                style={{ backgroundColor: "#44352F", color: "#ffffff", border: "none", borderRadius: "12px", padding: "8px 34px", fontWeight: "600", fontSize: "0.88rem", cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 3px 10px rgba(68,53,47,0.35)", opacity: loading ? 0.7 : 1 }}
              >
                {loading ? "Memproses..." : "Tandai Siap Diambil"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL SUKSES */}
      <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)} centered dialogClassName="custom-modal-narrow custom-modal-clean">
        <div style={{ backgroundColor: "#A6867B", color: "#ffffff", padding: "14px 20px", textAlign: "center", fontWeight: "700", fontSize: "1.15rem" }}>
          Berhasil
        </div>
        <div style={{ padding: "36px 28px 32px", textAlign: "center" }}>
          <p style={{ fontSize: "1rem", fontWeight: 600, color: "#333333", lineHeight: "1.5", marginBottom: "28px" }}>
            Alat berhasil ditandai Siap Diambil,<br />klien telah dinotifikasi!
          </p>
          <button
            type="button"
            onClick={() => setShowSuccessModal(false)}
            style={{ backgroundColor: "#44352F", color: "#ffffff", border: "none", borderRadius: "12px", padding: "8px 48px", fontWeight: "600", fontSize: "0.9rem", cursor: "pointer", boxShadow: "0 3px 10px rgba(68,53,47,0.35)" }}
          >
            Ok
          </button>
        </div>
      </Modal>

      {/* MODAL ERROR */}
      <Modal show={showErrorModal} onHide={() => setShowErrorModal(false)} centered dialogClassName="custom-modal-narrow custom-modal-clean">
        <div style={{ backgroundColor: "#dc3545", color: "#ffffff", padding: "14px 20px", textAlign: "center", fontWeight: "700", fontSize: "1.15rem" }}>
          Gagal
        </div>
        <div style={{ padding: "36px 28px 32px", textAlign: "center" }}>
          <p style={{ fontSize: "1rem", fontWeight: 600, color: "#333333", lineHeight: "1.5", marginBottom: "28px" }}>{errorMessage}</p>
          <button
            type="button"
            onClick={() => setShowErrorModal(false)}
            style={{ backgroundColor: "#dc3545", color: "#ffffff", border: "none", borderRadius: "12px", padding: "8px 48px", fontWeight: "600", fontSize: "0.9rem", cursor: "pointer" }}
          >
            Tutup
          </button>
        </div>
      </Modal>
    </div>
  );
}

