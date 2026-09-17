import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import NavbarLogin from "./NavbarLoginKlien";
import FooterSetelahLogin from "../FooterSetelahLogin";
import "@fontsource/poppins";
import { useHistory } from "react-router-dom";

export default function PemesananSampelKlien() {
  React.useEffect(() => {
    document.title = "SILAB-NTDK - Pemesanan Sampel";
  }, []);

  const history = useHistory();

  const categories = [
    {
      title: "Hematologi",
      path: "/dashboard/pemesananSampelKlien/hematologi",
      symbol: "🩸", // Menggunakan Emoji sebagai pengganti ikon sementara
      desc: "Pemeriksaan sel darah lengkap dan komponennya secara mendalam.",
    },
    {
      title: "Metabolit",
      path: "/dashboard/pemesananSampelKlien/metabolit",
      symbol: "🧪",
      desc: "Analisis zat kimia hasil proses metabolisme dalam tubuh.",
    },
    {
      title: "Hematologi & Metabolit",
      path: "/dashboard/pemesananSampelKlien/hematologiDanMetabolit",
      symbol: "📋",
      desc: "Paket pemeriksaan komprehensif darah dan metabolisme.",
    },
  ];

  return (
    <NavbarLogin>
      <Container
        fluid
        className="d-flex flex-column align-items-center justify-content-center"
        style={{
          minHeight: "80vh",
          backgroundColor: "#fcfaf8",
          padding: "60px 20px",
        }}
      >
        <div className="text-center mb-5">
          <h2
            style={{
              fontWeight: "700",
              fontFamily: "Poppins, sans-serif",
              color: "#5D4037",
              fontSize: "2.5rem",
            }}
          >
            Pemesanan Sampel
          </h2>
          <div style={{ width: "60px", height: "4px", backgroundColor: "#8D6E63", margin: "10px auto" }}></div>
          <p className="text-muted mt-3">Pilih kategori layanan pemeriksaan yang Anda butuhkan</p>
        </div>

        <Row className="justify-content-center w-100" style={{ maxWidth: "1100px" }}>
          {categories.map((item, index) => (
            <Col key={index} lg={4} md={6} className="mb-4">
              <Card
                onClick={() => history.push(item.path)}
                className="h-100 shadow-sm border-0 text-center"
                style={{
                  cursor: "pointer",
                  borderRadius: "24px",
                  transition: "all 0.3s ease",
                  fontFamily: "Poppins, sans-serif",
                  overflow: "hidden",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-12px)";
                  e.currentTarget.style.boxShadow = "0 15px 30px rgba(141, 110, 99, 0.15)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <Card.Body className="p-5 d-flex flex-column">
                  <div style={{ fontSize: "3.5rem", marginBottom: "20px" }}>{item.symbol}</div>
                  <Card.Title style={{ fontWeight: "700", color: "#333", marginBottom: "15px" }}>{item.title}</Card.Title>
                  <Card.Text className="text-muted mb-4" style={{ fontSize: "0.95rem" }}>
                    {item.desc}
                  </Card.Text>
                  <div
                    className="mt-auto py-2 px-4"
                    style={{
                      backgroundColor: "#8D6E63",
                      color: "white",
                      borderRadius: "12px",
                      fontWeight: "500",
                      fontSize: "0.9rem",
                    }}
                  >
                    Pilih Kategori
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
      <FooterSetelahLogin />
    </NavbarLogin>
  );
}
