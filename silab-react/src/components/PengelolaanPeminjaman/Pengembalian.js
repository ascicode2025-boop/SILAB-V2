import React, { useState } from "react";
import { Table, Modal, Form, InputGroup, Dropdown } from "react-bootstrap";
import { FaSearch, FaFilter } from "react-icons/fa";
import { getStorageUrl } from "../../config/apiConfig";

export default function Pengembalian({ rentals = [], onRefresh, onReturn }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  // Modal States
  const [showCheckModal, setShowCheckModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Form States inside Modal
  const [checklist, setChecklist] = useState({
    alatTersedia: false,
    kondisiBaik: false,
    aksesoriLengkap: false,
    sudahDibersihkan: false,
    berfungsiNormal: false,
  });
  const [kondisiAlat, setKondisiAlat] = useState("Baik");
  const [catatan, setCatatan] = useState("");
  const [itemStatuses, setItemStatuses] = useState({});

  const handleStatusChange = (itemId, status) => {
    setItemStatuses((prev) => {
      const updated = { ...prev, [itemId]: status };
      if (Object.values(updated).includes("Rusak") || Object.values(updated).includes("Dalam Perawatan")) {
        setChecklist((prevCheck) => ({
          ...prevCheck,
          kondisiBaik: false,
          berfungsiNormal: false,
        }));
      }
      return updated;
    });
  };
  const [denda, setDenda] = useState("");

  const filteredData = rentals.filter(
    (item) =>
      item.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.rental_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.items?.some(i => i.instrument?.nama_alat?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenPeriksa = (item) => {
    setSelectedItem(item);
    setChecklist({
      alatTersedia: false,
      kondisiBaik: false,
      aksesoriLengkap: false,
      sudahDibersihkan: false,
      berfungsiNormal: false,
    });
    setKondisiAlat("Baik");
    setCatatan("");
    const initialStatuses = {};
    item.items?.forEach(i => {
      const itemId = i.pivot?.id || i.instrument_id;
      initialStatuses[itemId] = "Tersedia";
    });

    if (item.return_notes && item.return_notes.startsWith("Alat Rusak:")) {
      const damagedCounts = {};
      const matches = item.return_notes.matchAll(/(\d+)x\s+([^,.\n]+)/g);
      for (const match of matches) {
          damagedCounts[match[2].trim().toLowerCase()] = parseInt(match[1], 10);
      }
      
      item.items?.forEach(i => {
         const name = (i.nama_alat || i.instrument?.nama_alat || "").toLowerCase();
         const itemId = i.pivot?.id || i.instrument_id;
         if (damagedCounts[name] > 0) {
            initialStatuses[itemId] = "Rusak";
            damagedCounts[name]--;
         }
      });
    }

    setItemStatuses(initialStatuses);
    setDenda("");
    setShowCheckModal(true);
  };

  const handleSimpanPerubahan = async () => {
    try {
      if (selectedItem) {
        const payloadItems = selectedItem.items.map(i => {
          const itemId = i.pivot?.id || i.instrument_id;
          return {
            item_id: itemId,
            instrument_id: i.instrument_id || i.id, // Fallback if instrument_id is missing, but usually the item is the instrument in belongsToMany
            kondisi_kembali: itemStatuses[itemId] || "Tersedia",
            notes: catatan
          };
        });

        const hasRusak = Object.values(itemStatuses).includes("Rusak");
        const dendaString = typeof denda === 'string' ? denda : String(denda);
        const nominalDenda = parseInt(dendaString.replace(/\./g, '')) || 0;
        
        if (hasRusak && nominalDenda <= 0) {
          setErrorMessage("Jika alat rusak, nominal denda wajib diisi.");
          setShowErrorModal(true);
          return;
        }

        await onReturn(selectedItem.id, payloadItems, nominalDenda);
        setShowCheckModal(false);
        setShowSuccessModal(true);
        if (onRefresh) onRefresh();
      }
    } catch (error) {
      setErrorMessage(error.message || "Gagal menyimpan pengembalian");
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
          Daftar Pengembalian
        </h2>
        <p style={{ color: "#616161", fontSize: "0.92rem", margin: 0 }}>
          Berikut daftar alat yang sudah diajukan pengembaliannya oleh Klien.
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
        {/* Top Controls: Search (Left) & Filter (Right) */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            marginBottom: "24px",
            flexWrap: "wrap",
          }}
        >
          {/* Search Bar */}
          <div style={{ flex: "1 1 200px", maxWidth: "300px", width: "100%" }}>
            <InputGroup
              style={{
                borderRadius: "30px",
                overflow: "hidden",
                border: "1px solid #D0D0D0",
                boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
              }}
            >
              <Form.Control
                type="text"
                placeholder="Cari"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  border: "none",
                  paddingLeft: "18px",
                  fontSize: "0.9rem",
                  boxShadow: "none",
                }}
              />
              <button
                type="button"
                style={{
                  backgroundColor: "#757575",
                  border: "none",
                  color: "#ffffff",
                  padding: "0 18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FaSearch size={14} />
              </button>
            </InputGroup>
          </div>

          {/* Filter Button */}
          <Dropdown align="end">
            <Dropdown.Toggle
              variant="light"
              style={{
                backgroundColor: "transparent",
                border: "none",
                color: "#424242",
                fontWeight: 700,
                fontSize: "0.9rem",
                boxShadow: "none",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              Filter <FaFilter size={12} />
            </Dropdown.Toggle>
            <Dropdown.Menu style={{ borderRadius: "12px", border: "1px solid #E0E0E0" }}>
              <Dropdown.Item onClick={() => setSearchTerm("")}>Semua Data</Dropdown.Item>
              <Dropdown.Item onClick={() => setSearchTerm("PJ001")}>Filter PJ001</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>

        {/* Table */}
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
                  Tanggal Kembali
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
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
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
                      {item.groupedItems?.map(i => `${i.instrument?.nama_alat} (${i.quantity})`).join(', ')}
                    </td>
                    <td style={{ py: "16px", textAlign: "center", color: "#424242" }}>
                      {item.end_date}
                    </td>
                    <td style={{ py: "16px", textAlign: "center", color: "#424242", fontWeight: 500 }}>
                      Dipinjam
                    </td>
                    <td style={{ py: "16px", textAlign: "center" }}>
                      <button
                        type="button"
                        onClick={() => handleOpenPeriksa(item)}
                        style={{
                          backgroundColor: "#A6867B",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "20px",
                          padding: "6px 24px",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          boxShadow: "0 3px 10px rgba(166,134,123,0.35)",
                          transition: "all 0.2s ease",
                        }}
                      >
                        Periksa
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    Tidak ada pengajuan pengembalian.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>

      {/* ─── 1. MODAL PEMERIKSAAN PENGEMBALIAN (MATCHES IMAGE 4 MOCKUP) ─── */}
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
        show={showCheckModal}
        onHide={() => setShowCheckModal(false)}
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
          Pemeriksaan Pengembalian
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

            {/* Row 2: Alat, Jumlah, Tanggal Pengembalian Klien */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 0.8fr 1fr",
                gap: "12px",
                textAlign: "center",
                marginBottom: "20px",
              }}
            >
              <div>
                <div style={{ fontWeight: "700", color: "#757575", fontSize: "0.85rem", marginBottom: "4px" }}>
                  Alat
                </div>
                <div style={{ color: "#212121", fontSize: "0.92rem", fontWeight: "600", lineHeight: "1.3" }}>
                  {selectedItem.groupedItems?.map(i => i.instrument?.nama_alat).join(', ')}
                </div>
              </div>
              <div>
                <div style={{ fontWeight: "700", color: "#757575", fontSize: "0.85rem", marginBottom: "4px" }}>
                  Jumlah
                </div>
                <div style={{ color: "#212121", fontSize: "0.92rem", fontWeight: "600" }}>
                  {selectedItem.groupedItems?.reduce((total, i) => total + i.quantity, 0)} Unit
                </div>
              </div>
              <div>
                <div style={{ fontWeight: "700", color: "#757575", fontSize: "0.85rem", marginBottom: "4px" }}>
                  Tgl Pengajuan Klien
                </div>
                <div style={{ color: "#212121", fontSize: "0.92rem", fontWeight: "600" }}>
                  {selectedItem.actual_return_date || "-"}
                </div>
              </div>
            </div>

            {/* Row 3: Catatan Pengembalian Klien */}
            <div
              style={{
                backgroundColor: "#F9F9F9",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "28px",
                border: "1px solid #EEEEEE"
              }}
            >
              <div style={{ fontWeight: "700", color: "#4A3933", fontSize: "0.85rem", marginBottom: "8px" }}>
                Informasi dari Klien
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px", fontSize: "0.88rem" }}>
                <div style={{ color: "#757575" }}>Kondisi Alat:</div>
                <div style={{ fontWeight: "600", color: "#212121" }}>{selectedItem.client_return_condition || "-"}</div>
                
                <div style={{ color: "#757575" }}>Catatan:</div>
                <div style={{ fontWeight: "600", color: "#212121" }}>{selectedItem.client_return_notes || "-"}</div>
                
                {selectedItem.client_return_photo_path && (
                  <>
                    <div style={{ color: "#757575" }}>Foto Kerusakan:</div>
                    <div>
                      <a href={`${getStorageUrl()}/storage/${selectedItem.client_return_photo_path}`} target="_blank" rel="noopener noreferrer" style={{ color: "#4A3933", fontWeight: "600", textDecoration: "underline" }}>
                        Lihat Foto
                      </a>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 2-Column Section: Checklist & Kondisi Alat */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
                marginBottom: "24px",
              }}
            >
              {/* Column 1: Checklist */}
              <div>
                <div style={{ fontWeight: "700", color: "#757575", fontSize: "0.88rem", marginBottom: "12px" }}>
                  Checklist
                </div>
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

              {/* Column 2: Kondisi Alat */}
              <div>
                <div style={{ fontWeight: "700", color: "#757575", fontSize: "0.88rem", marginBottom: "12px" }}>
                  Kondisi Alat
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.88rem", color: "#333", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={kondisiAlat === "Baik"}
                      onChange={(e) => setKondisiAlat(e.target.checked ? "Baik" : "")}
                      style={{ width: "16px", height: "16px", accentColor: "#4A3933" }}
                    />
                    Baik
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.88rem", color: "#333", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={kondisiAlat === "Rusak Ringan"}
                      onChange={(e) => {
                        setKondisiAlat(e.target.checked ? "Rusak Ringan" : "");
                        if (e.target.checked) setChecklist({ alatTersedia: false, kondisiBaik: false, aksesoriLengkap: false, sudahDibersihkan: false, berfungsiNormal: false });
                      }}
                      style={{ width: "16px", height: "16px", accentColor: "#4A3933" }}
                    />
                    Rusak Ringan
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.88rem", color: "#333", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={kondisiAlat === "Rusak Berat"}
                      onChange={(e) => {
                        setKondisiAlat(e.target.checked ? "Rusak Berat" : "");
                        if (e.target.checked) setChecklist({ alatTersedia: false, kondisiBaik: false, aksesoriLengkap: false, sudahDibersihkan: false, berfungsiNormal: false });
                      }}
                      style={{ width: "16px", height: "16px", accentColor: "#4A3933" }}
                    />
                    Rusak Berat
                  </label>
                </div>
              </div>
            </div>

            {/* Catatan Section */}
            <div style={{ marginBottom: "20px" }}>
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

            {/* Update Status Alat Per-Item */}
            <div style={{ marginBottom: "28px" }}>
              <div style={{ fontWeight: "700", color: "#757575", fontSize: "0.88rem", marginBottom: "12px" }}>
                Update Status Alat
              </div>
              {(() => {
                const nameCounters = {};
                return selectedItem?.items?.map((item, index) => {
                  const itemId = item.pivot?.id || item.instrument_id || index;
                  const name = item.nama_alat || item.instrument?.nama_alat;
                  nameCounters[name] = (nameCounters[name] || 0) + 1;
                  return (
                  <div key={itemId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", paddingBottom: "8px", borderBottom: "1px solid #EEE" }}>
                    <div style={{ fontSize: "0.88rem", fontWeight: "600", color: "#333" }}>
                      {name} (Unit {nameCounters[name]})
                    </div>
                  <Dropdown>
                    <Dropdown.Toggle
                      variant="light"
                      style={{
                        backgroundColor: "#F9F9F9",
                        border: "1px solid #DDD",
                        color: "#333333",
                        fontWeight: 500,
                        fontSize: "0.85rem",
                        boxShadow: "none",
                        padding: "4px 12px",
                        borderRadius: "8px"
                      }}
                    >
                      {itemStatuses[itemId] || "Tersedia"}
                    </Dropdown.Toggle>
                    <Dropdown.Menu style={{ borderRadius: "12px", border: "1px solid #E0E0E0" }}>
                      <Dropdown.Item onClick={() => handleStatusChange(itemId, "Tersedia")}>Tersedia</Dropdown.Item>
                      <Dropdown.Item onClick={() => handleStatusChange(itemId, "Dalam Perawatan")}>Dalam Perawatan</Dropdown.Item>
                      <Dropdown.Item onClick={() => handleStatusChange(itemId, "Rusak")}>Rusak</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
                );
              });
              })()}
            </div>

            {/* Denda Section if any is Rusak */}
            {Object.values(itemStatuses).includes("Rusak") && (
              <div style={{ marginBottom: "28px" }}>
                <div style={{ fontWeight: "700", color: "#757575", fontSize: "0.88rem", marginBottom: "6px" }}>
                  Nominal Denda (Wajib)
                </div>
                <InputGroup>
                  <InputGroup.Text style={{ backgroundColor: "#F9F9F9", border: "1px solid #D0D0D0" }}>Rp</InputGroup.Text>
                  <Form.Control
                    type="text"
                    value={denda}
                    onChange={(e) => {
                      let rawValue = e.target.value.replace(/\D/g, "");
                      const formattedValue = rawValue ? parseInt(rawValue, 10).toLocaleString("id-ID") : "";
                      setDenda(formattedValue);
                    }}
                    placeholder="Contoh: 50.000"
                    style={{ border: "1px solid #D0D0D0", boxShadow: "none" }}
                  />
                </InputGroup>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: "flex", justifyContent: "center", gap: "18px" }}>
              <button
                type="button"
                onClick={() => setShowCheckModal(false)}
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
                onClick={handleSimpanPerubahan}
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
                Simpan Perubahan
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ─── 2. MODAL SUKSES ─── */}
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
        .custom-modal-narrow { max-width: 440px !important; }
      `}</style>
    </div>
  );
}
