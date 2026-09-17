import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import Footer from "./Footer";
import LoadingSpinner from "../components/Common/LoadingSpinner";
import "bootstrap/dist/css/bootstrap.min.css";
import { getApiBaseUrl } from "../config/apiConfig";

function DaftarAnalisis() {
  const [groupedAnalisis, setGroupedAnalisis] = useState({});
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const API_URL = getApiBaseUrl();

  useEffect(() => {
    document.title = "SILAB-NTDK - Daftar Analisis";
    if (API_URL && !hasLoaded) {
      setHasLoaded(true);
      fetch(`${API_URL}/analysis-prices-grouped`)
        .then((res) => res.json())
        .then((data) => {
          // Hapus duplikat berdasarkan jenis_analisis
          const cleanedData = {};
          Object.entries(data).forEach(([kategori, items]) => {
            const uniqueItems = items.filter((item, index, self) => index === self.findIndex((t) => t.jenis_analisis === item.jenis_analisis));
            cleanedData[kategori] = uniqueItems;
          });
          console.log("Data setelah hapus duplikat:", cleanedData);
          setGroupedAnalisis(cleanedData);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Gagal mengambil daftar analisis:", err);
          setLoading(false);
        });
    }
  }, [API_URL, hasLoaded]);

  const renderKategori = (title, data) => (
    <>
      <h4
        className="fw-bold mb-4 text-center text-md-start"
        style={{
          color: "#4E342E",
          marginTop: "3rem",
          marginLeft: "2rem",
          marginRight: "2rem",
        }}
      >
        {title}
      </h4>

      <Container className="py-2">
        <Row className="g-4 justify-content-center justify-content-md-start">
          {data.map((item, index) => (
            <Col key={`${item.jenis_analisis}-${item.harga}-${index}`} xs={12} sm={6} md={4} lg={3}>
              <Card
                className="h-100 shadow-sm border-0 daftarAnalisis-card"
                style={{
                  background: "linear-gradient(160deg, #8D6E63, #8D6E63)",
                  borderRadius: "16px",
                  overflow: "hidden",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.03)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <Card.Img
                  variant="top"
                  src={`/asset/DaftarAnalisis/${item.jenis_analisis.replace(/\s+/g, "_").replace(/[^\w_]/g, "")}.png`}
                  onError={(e) => {
                    e.target.src = "/asset/DaftarAnalisis/Spektro.jpg";
                  }}
                  style={{ objectFit: "cover", height: "180px" }}
                />
                <Card.Body className="text-white">
                  <Card.Title style={{ fontSize: "1rem", fontWeight: "600" }}>{item.jenis_analisis}</Card.Title>
                  <Card.Text style={{ fontSize: "0.9rem" }}>Rp. {item.harga.toLocaleString("id-ID")}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );

  return (
    <>
      <section
        id="daftarAnalisis"
        style={{
          fontFamily: "Poppins, sans-serif",
          backgroundColor: "#EAE7E4",
          padding: "50px 0 0 0",
          marginTop: 0,
          minHeight: "500px",
        }}
      >
        {loading ? (
          <LoadingSpinner />
        ) : Object.keys(groupedAnalisis).length === 0 ? (
          <div className="text-center py-5">Tidak ada data analisis tersedia.</div>
        ) : (
          Object.entries(groupedAnalisis).map(([kategori, data], index) => <div key={`kategori-${kategori}-${index}`}>{renderKategori(kategori, data)}</div>)
        )}
      </section>

      <Footer />
    </>
  );
}

export default DaftarAnalisis;
