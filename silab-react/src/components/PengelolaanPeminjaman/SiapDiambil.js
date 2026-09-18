import React, { useState } from "react";
import { Table, Modal } from "react-bootstrap";

export default function SiapDiambil({ rentals, onRefresh, onHandover }) {
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Modal States
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Form State inside Modal 1
  const [checklist, setChecklist] = useState({
    alatTersedia: false,
    kondisiBaik: false,
    aksesoriLengkap: false,
    sudahDibersihkan: false,
    berfungsiNormal: false,
  });
  const [catatan, setCatatan] = useState("");

  const handleOpenModal = (item) => {
    setSelectedItem(item);
    setChecklist({
      alatTersedia: false,
      kondisiBaik: false,
      aksesoriLengkap: false,
      sudahDibersihkan: false,
      berfungsiNormal: false,
    });
    setCatatan("");
    setShowDetailModal(true);
  };

  const handleSerahkanAlat = async () => {
    try {
      if (selectedItem) {
        const payload = {
          handover_checklist: JSON.stringify(checklist),
          handover_notes: catatan
        };
        await onHandover(selectedItem.id, payload);
        setShowDetailModal(false);
        setShowSuccessModal(true);
        onRefresh();
      }
    } catch (error) {
      setErrorMessage(error.message || "Gagal menyerahkan alat");
      setShowErrorModal(true);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
  };

  return (
    <div>
      {/* Header Info */}
      <div style={{ marginBottom: "28px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "6px",
          }}
        >
          <div
            style={{
              width: "28px",
              height: "3px",
              backgroundColor: "#A6867B",
              borderRadius: "2px",
            }}
          />
          <span
            style={{
              fontSize: "0.78rem",
              fontWeight: 800,
              color: "#4A3933",
              letterSpacing: "0.8px",
              textTransform: "uppercase",
            }}
          >
            SILAB-NTDK SYSTEM
          </span>
        </div>
        <h2
          style={{
            fontWeight: 800,
            fontSize: "1.75rem",
            color: "#332723",
            marginBottom: "6px",
          }}
        >
          Konfirmasi Serah Terima
        </h2>
        <p style={{ color: "#616161", fontSize: "0.92rem", margin: 0 }}>
          Konfirmasi Persiapan Penyerahan Alat kepada peminjam disini.
        </p>
      </div>

      {/* Main Table Card */}
      <div
        className="main-table-card"
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "24px",
          padding: "28px 32px",
          boxShadow: "0 6px 24px rgba(0,0,0,0.05)",
          border: "1px solid #EAEAEA",
        }}
      >
        <div className="table-responsive" style={{ WebkitOverflowScrolling: "touch", overflowX: "auto" }}>
          <Table borderless style={{ verticalAlign: "middle", marginBottom: 0 }}>
            <thead>
              <tr
                style={{
                  color: "#212121",
                  fontSize: "0.95rem",
                  fontWeight: "700",
                  borderBottom: "1px solid #EEEEEE",
                }}
              >
                <th style={{ paddingBottom: "16px", width: "60px" }}>No</th>
                <th style={{ paddingBottom: "16px" }}>No Pengajuan</th>
                <th style={{ paddingBottom: "16px" }}>Nama Peminjam</th>
                <th style={{ paddingBottom: "16px" }}>Alat</th>
                <th style={{ paddingBottom: "16px", textAlign: "center" }}>
                  Tanggal Ambil
                </th>
                <th style={{ paddingBottom: "16px", textAlign: "center" }}>
                  Status
                </th>
                <th style={{ paddingBottom: "16px", textAlign: "center" }}>
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {rentals && rentals.length > 0 ? (
                rentals.map((item, index) => (
                  <tr
                    key={item.id}
                    style={{
                      fontSize: "0.88rem",
                      borderBottom: "1px solid #F5F5F5",
                    }}
                  >
                    <td style={{ py: "16px", fontWeight: "600", color: "#616161" }}>
                      {index + 1}
                    </td>
                    <td style={{ py: "16px", fontWeight: "600", color: "#212121" }}>
                      {item.rental_number}
                    </td>
                    <td style={{ py: "16px", color: "#424242" }}>
                      {item.user?.name}
                    </td>
                    <td style={{ py: "16px", color: "#424242" }}>
                      {item.groupedItems?.map((i) => `${i.instrument?.name} (${i.quantity})`).join(", ")}
                    </td>
                    <td style={{ py: "16px", textAlign: "center", color: "#424242" }}>
                      {item.start_date}
                    </td>
                    <td style={{ py: "16px", textAlign: "center", color: "#424242", fontWeight: 500 }}>
                      {item.status}
                    </td>
                    <td style={{ py: "16px", textAlign: "center" }}>
                      <button
                        type="button"
                        onClick={() => handleOpenModal(item)}
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
                    Tidak ada pengajuan siap diambil.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>

      {/* ─── 1. MODAL DETAIL ALAT (SERAH TERIMA) ─── */}
      <style>{`
        @media (max-width: 768px) {
          .main-table-card {
            padding: 16px 14px !important;
            border-radius: 16px !important;
          }
          .custom-modal-clean {
            margin: 10px !important;
          }
        }
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
        dialogClassName="custom-modal-clean"
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
          Detail Alat
        </div>

        {selectedItem && (
          <div style={{ padding: "26px 32px 32px" }}>
            {/* Row 1: Nama & No. Pengajuan */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                textAlign: "center",
                marginBottom: "20px",
              }}
            >
              <div>
                <div style={{ fontWeight: "700", color: "#757575", fontSize: "0.85rem", marginBottom: "4px" }}>
                  Nama
                </div>
                <div style={{ color: "#212121", fontSize: "0.95rem", fontWeight: "600" }}>
                  {selectedItem.user?.name}
                </div>
              </div>
              <div>
                <div style={{ fontWeight: "700", color: "#757575", fontSize: "0.85rem", marginBottom: "4px" }}>
                  No. Pengajuan
                </div>
                <div style={{ color: "#212121", fontSize: "0.95rem", fontWeight: "600" }}>
                  {selectedItem.rental_number}
                </div>
              </div>
            </div>

            {/* Row 2: Alat, Jumlah, Tanggal Pengambilan */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 0.8fr 1fr",
                gap: "12px",
                textAlign: "center",
                marginBottom: "28px",
              }}
            >
              <div>
                <div style={{ fontWeight: "700", color: "#757575", fontSize: "0.85rem", marginBottom: "4px" }}>
                  Alat
                </div>
                <div style={{ color: "#212121", fontSize: "0.92rem", fontWeight: "600", lineHeight: "1.3" }}>
                  {selecteditem.groupedItems?.map((i) => i.instrument?.name).join(", ")}
                </div>
              </div>
              <div>
                <div style={{ fontWeight: "700", color: "#757575", fontSize: "0.85rem", marginBottom: "4px" }}>
                  Jumlah
                </div>
                <div style={{ color: "#212121", fontSize: "0.92rem", fontWeight: "600" }}>
                  {selecteditem.groupedItems?.reduce((total, i) => total + i.quantity, 0)} Unit
                </div>
              </div>
              <div>
                <div style={{ fontWeight: "700", color: "#757575", fontSize: "0.85rem", marginBottom: "4px" }}>
                  Tanggal Pengambilan
                </div>
                <div style={{ color: "#212121", fontSize: "0.92rem", fontWeight: "600" }}>
                  {selectedItem.start_date}
                </div>
              </div>
            </div>

            {/* Checklist Section */}
            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontWeight: "700", color: "#757575", fontSize: "0.88rem", marginBottom: "12px" }}>
                Checklist
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px 24px",
                }}
              >
                {/* Column 1 */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.88rem", color: "#333", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={checklist.alatTersedia}
                      onChange={(e) => setChecklist({ ...checklist, alatTersedia: e.target.checked })}
                      style={{ width: "16px", height: "16px", accentColor: "#4A3933" }}
                    />
                    Alat tersedia
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.88rem", color: "#333", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={checklist.kondisiBaik}
                      onChange={(e) => setChecklist({ ...checklist, kondisiBaik: e.target.checked })}
                      style={{ width: "16px", height: "16px", accentColor: "#4A3933" }}
                    />
                    Kondisi baik
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.88rem", color: "#333", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={checklist.aksesoriLengkap}
                      onChange={(e) => setChecklist({ ...checklist, aksesoriLengkap: e.target.checked })}
                      style={{ width: "16px", height: "16px", accentColor: "#4A3933" }}
                    />
                    Aksesori lengkap
                  </label>
                </div>

                {/* Column 2 */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.88rem", color: "#333", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={checklist.sudahDibersihkan}
                      onChange={(e) => setChecklist({ ...checklist, sudahDibersihkan: e.target.checked })}
                      style={{ width: "16px", height: "16px", accentColor: "#4A3933" }}
                    />
                    Sudah dibersihkan
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.88rem", color: "#333", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={checklist.berfungsiNormal}
                      onChange={(e) => setChecklist({ ...checklist, berfungsiNormal: e.target.checked })}
                      style={{ width: "16px", height: "16px", accentColor: "#4A3933" }}
                    />
                    Berfungsi normal
                  </label>
                </div>
              </div>
            </div>

            {/* Catatan Section */}
            <div style={{ marginBottom: "28px" }}>
              <div style={{ fontWeight: "700", color: "#757575", fontSize: "0.88rem", marginBottom: "8px" }}>
                Catatan
              </div>
              <textarea
                rows={3}
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                style={{
                  width: "100%",
                  borderRadius: "16px",
                  border: "1px solid #D0D0D0",
                  padding: "12px 16px",
                  fontSize: "0.88rem",
                  outline: "none",
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.03)",
                  resize: "none",
                }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", justifyContent: "center", gap: "18px" }}>
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                style={{
                  backgroundColor: "#D8D8D8",
                  color: "#212121",
                  border: "none",
                  borderRadius: "12px",
                  padding: "8px 34px",
                  fontWeight: "600",
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSerahkanAlat}
                style={{
                  backgroundColor: "#44352F",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "12px",
                  padding: "8px 34px",
                  fontWeight: "600",
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  boxShadow: "0 3px 10px rgba(68,53,47,0.35)",
                }}
              >
                Serahkan Alat
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ─── 2. MODAL SUKSES (DATABERHASIL DISIMPAN) ─── */}
      <Modal
        show={showSuccessModal}
        onHide={() => setShowSuccessModal(false)}
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
          }}
        >
          Detail Alat
        </div>

        <div style={{ padding: "36px 28px 32px", textAlign: "center" }}>
          <p
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              color: "#333333",
              lineHeight: "1.5",
              marginBottom: "28px",
            }}
          >
            Data Berhasil disimpan,
            <br />
            status telah diperbaharui!
          </p>

          <button
            type="button"
            onClick={handleCloseSuccess}
            style={{
              backgroundColor: "#44352F",
              color: "#ffffff",
              border: "none",
              borderRadius: "12px",
              padding: "8px 48px",
              fontWeight: "600",
              fontSize: "0.9rem",
              cursor: "pointer",
              boxShadow: "0 3px 10px rgba(68,53,47,0.35)",
            }}
          >
            Ok
          </button>
        </div>
      </Modal>

      {/* ─── 3. MODAL ERROR ─── */}
      <Modal
        show={showErrorModal}
        onHide={() => setShowErrorModal(false)}
        centered
        dialogClassName="custom-modal-narrow custom-modal-clean"
      >
        <div
          style={{
            backgroundColor: "#dc3545",
            color: "#ffffff",
            padding: "14px 20px",
            textAlign: "center",
            fontWeight: "700",
            fontSize: "1.15rem",
          }}
        >
          Gagal
        </div>
        <div style={{ padding: "36px 28px 32px", textAlign: "center" }}>
          <p
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              color: "#333333",
              lineHeight: "1.5",
              marginBottom: "28px",
            }}
          >
            {errorMessage}
          </p>
          <button
            type="button"
            onClick={() => setShowErrorModal(false)}
            style={{
              backgroundColor: "#dc3545",
              color: "#ffffff",
              border: "none",
              borderRadius: "12px",
              padding: "8px 48px",
              fontWeight: "600",
              fontSize: "0.9rem",
              cursor: "pointer",
            }}
          >
            Tutup
          </button>
        </div>
      </Modal>
    </div>
  );
}
