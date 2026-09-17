import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@fontsource/poppins/800.css";

import NavbarLoginTeknisi from "./NavbarLoginTeknisi";
import PersiapkanAlat from "../../components/PengelolaanPeminjaman/PersiapkanAlat";
import SiapDiambil from "../../components/PengelolaanPeminjaman/SiapDiambil";
import SedangDipinjam from "../../components/PengelolaanPeminjaman/SedangDipinjam";
import Pengembalian from "../../components/PengelolaanPeminjaman/Pengembalian";
import { getRentals, handoverRental, returnRental, readyPickupRental } from "../../services/InstrumentRentalService";

export default function PengelolaanPeminjamanAlat() {
  const [activeTab, setActiveTab] = useState("persiapkanAlat");
  const [rentals, setRentals] = useState([]);

  const fetchRentals = async () => {
    try {
      const res = await getRentals();
      const mappedData = (res?.data || []).map(r => ({
        ...r,
        rental_number: `PJ${String(r.id).padStart(3, '0')}`,
        user: { name: r.user?.name || "Unknown" },
        items: r.instruments?.map(i => ({
          ...i,
          instrument_id: i.id,
          instrument: { name: i.nama_alat, nama_alat: i.nama_alat },
          quantity: i.pivot?.quantity || 1
        })) || [],
        groupedItems: Object.values(
          (r.instruments || []).reduce((acc, i) => {
            const name = i.nama_alat || "Alat";
            if (!acc[name]) {
              acc[name] = {
                ...i,
                instrument_id: i.id,
                instrument: { name, nama_alat: name },
                quantity: 0
              };
            }
            acc[name].quantity += (i.pivot?.quantity || 1);
            return acc;
          }, {})
        ),
        start_date: r.tanggal_peminjaman,
        end_date: r.tanggal_pengembalian,
        handover_notes: r.handover_notes,
        actual_return_date: r.client_return_date,
        return_condition: r.client_return_condition,
        return_notes: r.client_return_notes,
        return_photo: r.client_return_photo_path,
      }));
      setRentals(mappedData);
    } catch (error) {
      console.error("Failed to fetch rentals", error);
    }
  };

  useEffect(() => {
    document.title = "SILAB-NTDK - Pengelolaan Peminjaman Alat";
    fetchRentals();
  }, []);

  const persiapkanAlatRentals = rentals.filter((r) => r.status === "disetujui");
  const siapDiambilRentals = rentals.filter((r) => r.status === "siap_diambil");
  const sedangDipinjamRentals = rentals.filter((r) => r.status === "aktif");
  const pengembalianRentals = rentals.filter((r) => r.status === "menunggu_pengembalian");

  const tabs = [
    { key: "persiapkanAlat", label: "Persiapkan Alat", count: persiapkanAlatRentals.length },
    { key: "siapDiambil", label: "Siap Diambil", count: siapDiambilRentals.length },
    { key: "sedangDipinjam", label: "Sedang Dipinjam", count: sedangDipinjamRentals.length },
    { key: "pengembalian", label: "Pengembalian", count: pengembalianRentals.length },
  ];

  return (
    <NavbarLoginTeknisi>
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#FAF9F8",
          fontFamily: "Poppins, sans-serif",
          padding: "28px 32px 48px",
        }}
      >
        <Container fluid>
          {/* Top Pill Navigation Tabs */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              marginBottom: "32px",
              flexWrap: "wrap",
            }}
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    backgroundColor: isActive ? "#9E8880" : "#ffffff",
                    color: isActive ? "#ffffff" : "#424242",
                    border: isActive ? "none" : "1.5px solid #D0D0D0",
                    borderRadius: "30px",
                    padding: "8px 24px",
                    fontSize: "0.92rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: isActive
                      ? "0 4px 14px rgba(158,136,128,0.4)"
                      : "0 2px 6px rgba(0,0,0,0.04)",
                    transition: "all 0.2s ease-in-out",
                  }}
                >
                  {tab.label} ({tab.count})
                </button>
              );
            })}
          </div>

          {/* Dynamic Component Content */}
          {activeTab === "persiapkanAlat" && (
            <PersiapkanAlat
              rentals={persiapkanAlatRentals}
              onRefresh={fetchRentals}
              onReadyPickup={readyPickupRental}
            />
          )}
          {activeTab === "siapDiambil" && (
            <SiapDiambil
              rentals={siapDiambilRentals}
              onRefresh={fetchRentals}
              onHandover={handoverRental}
            />
          )}
          {activeTab === "sedangDipinjam" && (
            <SedangDipinjam rentals={sedangDipinjamRentals} />
          )}
          {activeTab === "pengembalian" && (
            <Pengembalian
              rentals={pengembalianRentals}
              onRefresh={fetchRentals}
              onReturn={returnRental}
            />
          )}
        </Container>
      </div>
    </NavbarLoginTeknisi>
  );
}

