import React from "react";
import { getStorageUrl } from "../../config/apiConfig";
import { Col, Card } from "react-bootstrap";

// Detailed SVG Vector illustration banner for laboratory equipment card & modal header
export const LabBannerSVG = ({ height = "165px" }) => (
  <div
    style={{
      width: "100%",
      height: height,
      background: "linear-gradient(180deg, #DCE6FF 0%, #E8F0FE 100%)",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderTopLeftRadius: "24px",
      borderTopRightRadius: "24px",
    }}
  >
    <svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      {/* Ceiling Lamp hanging from top */}
      <line x1="200" y1="0" x2="200" y2="16" stroke="#334155" strokeWidth="3" />
      <rect x="110" y="16" width="180" height="12" rx="4" fill="#334155" />
      <rect x="125" y="28" width="150" height="4" rx="2" fill="#94A3B8" opacity="0.6" />

      {/* Wall Shelves Left */}
      <line x1="20" y1="65" x2="100" y2="65" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
      <path d="M30 65 Q 35 52, 45 52 Q 55 52, 60 65 Z" fill="#D97706" />
      <rect x="65" y="48" width="30" height="17" rx="3" fill="#B45309" />

      <line x1="20" y1="105" x2="100" y2="105" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
      <rect x="30" y="80" width="16" height="25" rx="2" fill="#F59E0B" />
      <rect x="52" y="88" width="14" height="17" rx="2" fill="#DC2626" />
      <rect x="72" y="92" width="18" height="13" rx="2" fill="#2563EB" />

      {/* Wall Shelves Right */}
      <rect x="300" y="40" width="60" height="60" rx="4" stroke="#334155" strokeWidth="3" fill="none" />
      <line x1="300" y1="70" x2="360" y2="70" stroke="#334155" strokeWidth="3" />
      <rect x="308" y="48" width="8" height="22" rx="2" fill="#F59E0B" />
      <rect x="320" y="48" width="8" height="22" rx="2" fill="#DC2626" />
      <rect x="332" y="48" width="8" height="22" rx="2" fill="#EC4899" />
      <rect x="344" y="48" width="8" height="22" rx="2" fill="#F472B6" />
      <rect x="308" y="78" width="8" height="18" rx="2" fill="#DC2626" />
      <rect x="320" y="78" width="8" height="18" rx="2" fill="#F59E0B" />
      <rect x="332" y="78" width="8" height="18" rx="2" fill="#DC2626" />
      <rect x="344" y="78" width="8" height="18" rx="2" fill="#EC4899" />

      {/* Main Counter Table Surface */}
      <line x1="10" y1="145" x2="390" y2="145" stroke="#1E293B" strokeWidth="5" />
      
      {/* Table Drawers & Cabinet */}
      <rect x="25" y="148" width="350" height="52" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
      <line x1="140" y1="148" x2="140" y2="200" stroke="#CBD5E1" strokeWidth="2" />
      <line x1="270" y1="148" x2="270" y2="200" stroke="#CBD5E1" strokeWidth="2" />
      {/* Drawer handles */}
      <circle cx="82" cy="172" r="4" fill="#334155" />
      <circle cx="322" cy="172" r="4" fill="#334155" />
      <line x1="200" y1="165" x2="210" y2="165" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
      <line x1="200" y1="180" x2="210" y2="180" stroke="#334155" strokeWidth="3" strokeLinecap="round" />

      {/* Lab Equipment on Table Surface */}
      {/* Test Tubes Rack Left */}
      <rect x="30" y="115" width="40" height="30" rx="3" fill="#FFFFFF" stroke="#334155" strokeWidth="2" />
      <line x1="38" y1="120" x2="38" y2="140" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" />
      <line x1="46" y1="120" x2="46" y2="140" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" />
      <line x1="54" y1="120" x2="54" y2="140" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" />
      <line x1="62" y1="120" x2="62" y2="140" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" />

      {/* Round Flask */}
      <circle cx="104" cy="132" r="14" fill="#FDE047" fillOpacity="0.8" stroke="#334155" strokeWidth="2" />
      <rect x="100" y="110" width="8" height="12" fill="#E2E8F0" stroke="#334155" strokeWidth="2" />

      {/* Erlenmeyer Flask */}
      <path d="M135 145 L145 122 H153 L163 145 Z" fill="#F472B6" fillOpacity="0.8" stroke="#334155" strokeWidth="2" />
      <rect x="146" y="116" width="6" height="8" fill="#E2E8F0" stroke="#334155" strokeWidth="2" />

      {/* Microscope Center Right */}
      <path d="M220 145 H260 M240 145 V105 M240 115 L220 95 M220 95 L210 105 M235 130 H255" stroke="#334155" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="215" cy="100" r="5" fill="#64748B" />

      {/* Graduated Cylinder */}
      <rect x="275" y="105" width="14" height="40" rx="2" fill="#F59E0B" fillOpacity="0.75" stroke="#334155" strokeWidth="2" />

      {/* Storage Box Right */}
      <rect x="330" y="115" width="42" height="30" rx="4" fill="#FDBA74" stroke="#334155" strokeWidth="2" />
      <rect x="340" y="125" width="22" height="10" rx="2" fill="#FFFFFF" />
      <line x1="344" y1="130" x2="358" y2="130" stroke="#94A3B8" strokeWidth="2" />
    </svg>
  </div>
);

export const INITIAL_TOOLS = [
  {
    id: 1,
    nama: "Mikropipet 20–200 µL",
    ringkasan: "mengambil sampel atau reagen.",
    deskripsi:
      "Mikropipet digunakan untuk mengambil dan memindahkan cairan dalam volume 20–200 µL dengan tingkat presisi tinggi. Alat ini umum digunakan pada proses preparasi sampel darah dan pencampuran reagen.",
    jumlah: 10,
    status: "Tersedia",
    lokasi: "Lab Analisis Darah",
    kategori: "Preparasi Sampel",
  },
  {
    id: 2,
    nama: "Centrifuge",
    ringkasan: "memisahkan serum atau plasma darah.",
    deskripsi:
      "Centrifuge digunakan untuk memisahkan komponen cairan dan padatan pada sampel darah atau reagen melalui proses pemutaran berkecepatan tinggi dengan kecepatan terukur.",
    jumlah: 4,
    status: "Tersedia",
    lokasi: "Lab Analisis Darah",
    kategori: "Pemisahan Sampel",
  },
  {
    id: 3,
    nama: "Vortex Mixer",
    ringkasan: "mencampur sampel darah dan reagen.",
    deskripsi:
      "Vortex Mixer digunakan untuk mencampur larutan atau suspensi sel dalam tabung uji secara homogen dengan getaran frekuensi tinggi.",
    jumlah: 5,
    status: "Tersedia",
    lokasi: "Lab Analisis Darah",
    kategori: "Pencampuran Reagen",
  },
  {
    id: 4,
    nama: "Mikroskop",
    ringkasan: "pengamatan preparat darah.",
    deskripsi:
      "Mikroskop laboratorium digunakan untuk melakukan pengamatan mikroskopis pada sel darah, preparat jaringan, serta mikroorganisme pendukung analisis.",
    jumlah: 6,
    status: "Tersedia",
    lokasi: "Lab Analisis Darah",
    kategori: "Pengamatan Optik",
  },
  {
    id: 5,
    nama: "Analytical Balance",
    ringkasan: "Menimbang bahan kimia atau reagen.",
    deskripsi:
      "Analytical Balance digunakan untuk menimbang reagen dan bahan kimia uji dengan tingkat ketelitian hingga 0.0001 gram (4 desimal).",
    jumlah: 3,
    status: "Tersedia",
    lokasi: "Lab Analisis Darah",
    kategori: "Penimbangan Presisi",
  },
  {
    id: 6,
    nama: "Water Bath",
    ringkasan: "Inkubasi atau pemanasan sampel.",
    deskripsi:
      "Water Bath berfungsi untuk menjaga suhu konstan pada sampel yang memerlukan kondisi inkubasi atau pemanasan terkontrol selama pengujian.",
    jumlah: 4,
    status: "Tersedia",
    lokasi: "Lab Analisis Darah",
    kategori: "Inkubasi & Pemanasan",
  },
  {
    id: 7,
    nama: "Incubator",
    ringkasan: "Digunakan pada beberapa pengujian tertentu.",
    deskripsi:
      "Incubator digunakan untuk pengondisian suhu dan kelembaban ruangan yang stabil untuk berbagai keperluan fermentasi dan uji laboratorium.",
    jumlah: 2,
    status: "Tersedia",
    lokasi: "Lab Analisis Darah",
    kategori: "Inkubasi Pengujian",
  },
];

const DaftarAlatComponent = ({ tool, onClick }) => {
  const storageUrl = getStorageUrl();
  const [imgError, setImgError] = React.useState(false);

  return (
    <Col xs={12} sm={6} lg={4} key={tool.id}>
      <Card
        className="h-100 border-0 shadow-sm tool-card"
        style={{
          borderRadius: "24px",
          backgroundColor: "#ffffff",
          transition: "transform 0.25s ease, box-shadow 0.25s ease",
          cursor: "pointer",
          overflow: "hidden",
        }}
        onClick={() => onClick && onClick(tool)}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-6px)";
          e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.12)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";
        }}
      >
        {tool.foto_path && !imgError ? (
          <div
            style={{
              width: "100%",
              height: "175px",
              backgroundColor: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              padding: "16px",
              borderBottom: "1px solid #F1F5F9",
            }}
          >
            <img
              src={`${storageUrl}/storage/${tool.foto_path}`}
              alt={tool.nama_alat || "Foto Alat"}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
              onError={() => setImgError(true)}
            />
          </div>
        ) : (
          <LabBannerSVG height="175px" />
        )}

        <Card.Body className="p-4 d-flex flex-column align-items-center text-center">
          <Card.Title
            className="fw-bold mb-2 text-dark"
            style={{
              fontSize: "1.15rem",
              fontFamily: "Poppins, sans-serif",
              color: "#2D3436",
            }}
          >
            {tool.nama_alat}
          </Card.Title>
          <Card.Text
            className="text-muted mb-3 flex-grow-1"
            style={{
              fontSize: "0.85rem",
              lineHeight: "1.4",
            }}
          >
            {tool.deskripsi ? (tool.deskripsi.length > 50 ? tool.deskripsi.substring(0, 50) + "..." : tool.deskripsi) : "-"}
          </Card.Text>
          <div className="w-100 mt-auto pt-2 border-top">
            <div className="mb-2">
              {tool.is_paid ? (
                <span className="badge bg-danger">Berbayar</span>
              ) : (
                <span className="badge bg-success">Gratis</span>
              )}
            </div>
            <div className="d-flex justify-content-around align-items-center text-muted" style={{ fontSize: "0.82rem" }}>
              <span>Total Unit: <strong>{tool.total_unit ?? 1}</strong></span>
              <span style={{ color: "#CBD5E1" }}>|</span>
              <span>Status: <strong className={tool.status === "tersedia" ? "text-success" : "text-danger"}>{tool.status === "tersedia" ? "Tersedia" : tool.status}</strong></span>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default DaftarAlatComponent;
