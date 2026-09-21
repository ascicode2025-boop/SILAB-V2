import React, { useState } from "react";
import { Table, Modal, Form, InputGroup, Dropdown } from "react-bootstrap";
import { FaSearch, FaFilter } from "react-icons/fa";

export default function SedangDipinjam({ rentals = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const filteredData = rentals.filter(
    (item) =>
      item.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.rental_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.groupedItems?.some(i => i.instrument?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenDetail = (item) => {
    setSelectedItem(item);
    setShowModal(true);
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
          Daftar Peminjaman
        </h2>
        <p style={{ color: "#616161", fontSize: "0.92rem", margin: 0 }}>
          Lihat daftar Peminjaman disini.
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
                      {item.groupedItems?.map((i) => `${i.instrument?.name} (${i.quantity})`).join(", ")}
                    </td>
                    <td style={{ py: "16px", textAlign: "center", color: "#424242" }}>
                      {item.start_date}
                    </td>
                    <td style={{ py: "16px", textAlign: "center", color: "#424242", fontWeight: 500 }}>
                      Dipinjam
                    </td>
                    <td style={{ py: "16px", textAlign: "center" }}>
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(item)}
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
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    Tidak ada data peminjaman aktif.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>

      {/* ─── MODAL DETAIL PEMINJAMAN (MATCHES IMAGE 3 MOCKUP) ─── */}
      <style>{`
        .custom-modal-clean .modal-content {
          border-radius: 18px !important;
          border: none !important;
          overflow: hidden !important;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18) !important;
          background-color: #ffffff !important;
        }
        .custom-modal-narrow {
          max-width: 380px !important;
        }
      `}</style>
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
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
            letterSpacing: "0.2px",
          }}
        >
          Detail Peminjaman
        </div>

        {selectedItem && (
          <div style={{ padding: "26px 24px 28px", textAlign: "center" }}>
            {/* No Pengajuan */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontWeight: "700", color: "#757575", fontSize: "0.85rem", marginBottom: "3px" }}>
                No Pengajuan
              </div>
              <div style={{ color: "#212121", fontSize: "0.95rem", fontWeight: "600" }}>
                {selectedItem.rental_number}
              </div>
            </div>

            {/* Nama */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontWeight: "700", color: "#757575", fontSize: "0.85rem", marginBottom: "3px" }}>
                Nama
              </div>
              <div style={{ color: "#212121", fontSize: "0.95rem", fontWeight: "600" }}>
                {selectedItem.user?.name}
              </div>
            </div>

            {/* Alat */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontWeight: "700", color: "#757575", fontSize: "0.85rem", marginBottom: "3px" }}>
                Alat
              </div>
              <div style={{ color: "#212121", fontSize: "0.95rem", fontWeight: "600", lineHeight: "1.3" }}>
                {selectedItem.groupedItems?.map((i) => `${i.instrument?.name} (${i.quantity})`).join(", ")}
              </div>
            </div>

            {/* Tanggal Pinjam */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontWeight: "700", color: "#757575", fontSize: "0.85rem", marginBottom: "3px" }}>
                Tanggal Pinjam
              </div>
              <div style={{ color: "#212121", fontSize: "0.95rem", fontWeight: "600" }}>
                {selectedItem.start_date}
              </div>
            </div>

            {/* Tanggal Kembali */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontWeight: "700", color: "#757575", fontSize: "0.85rem", marginBottom: "3px" }}>
                Tanggal Kembali
              </div>
              <div style={{ color: "#212121", fontSize: "0.95rem", fontWeight: "600" }}>
                {selectedItem.end_date}
              </div>
            </div>

            {/* Status */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontWeight: "700", color: "#757575", fontSize: "0.85rem", marginBottom: "6px" }}>
                Status
              </div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#212121",
                  fontWeight: "600",
                  fontSize: "0.95rem",
                }}
              >
                <div
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    backgroundColor: "#A5D6A7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      backgroundColor: "#4CAF50",
                    }}
                  />
                </div>
                {selectedItem.status}
              </div>
            </div>

            {/* Catatan */}
            <div style={{ marginBottom: "28px" }}>
              <div style={{ fontWeight: "700", color: "#757575", fontSize: "0.85rem", marginBottom: "4px" }}>
                Catatan
              </div>
              <div style={{ color: "#333333", fontSize: "0.92rem", fontWeight: "500", lineHeight: "1.4" }}>
                {selectedItem.handover_notes || "-"}
              </div>
            </div>

            {/* Tutup Button */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button
                type="button"
                onClick={() => setShowModal(false)}
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
                Tutup
              </button>
            </div>
          </div>
        )}
      </Modal>
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
    </div>
  );
}
