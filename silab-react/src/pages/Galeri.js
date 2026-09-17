import React from "react";
import { Container, Row, Col, Image } from "react-bootstrap";
import "../css/Galeri.css";
import Footer from "./Footer";

function Galeri() {
  React.useEffect(() => {
    document.title = "SILAB-NTDK - Galeri";
  }, []);

  const images = [
    { src: "/asset/Galeri_Landing_Page/galeriLandingPage1.png", text: "Laboratorium modern dengan teknologi terbaru" },
    { src: "/asset/Galeri_Landing_Page/galeriLandingPage6.png", text: "Tenaga ahli profesional dan berpengalaman yang siap memberikan pelayanan terbaik." },
    { src: "/asset/Galeri_Landing_Page/galeriLandingPage2.png", text: "Layanan pemeriksaan lengkap untuk berbagai kebutuhan" },
    { src: "/asset/Galeri_Landing_Page/galeriLandingPage3.png", text: "Tenaga ahli profesional dan berpengalaman yang siap memberikan pelayanan terbaik." },
  ];

  return (
    <section
      className="gallery-section"
      id="galeri"
      style={{
        backgroundColor: "#EAE7E4",
        fontFamily: "Poppins, sans-serif",
        paddingTop: "44px",
        marginTop: 0,
        minHeight: "80vh",
      }}
    >
      <Container className="mt-0 pt-0">
        <div className="text-center mb-5 mt-0 pt-0">
          <h2 className="gallery-title mt-0" style={{ color: "#45352F" }}>
            Galeri Divisi Nutrisi Ternak Daging dan Kerja
          </h2>
          <p className="text-muted mt-2">Integritas dan Kualitas dalam Setiap Layanan</p>
        </div>

        {/* --- Bagian 1: Highlight Utama --- */}
        <Row className="justify-content-center mb-5 row-gap-mobile">
          <Col lg={10}>
            <div className="custom-card shadow-sm p-3 p-md-4">
              <Row className="align-items-center">
                <Col md={6} className="mb-3 mb-md-0">
                  <div className="img-wrapper shadow-sm">
                    <Image src={images[0].src} className="img-hover" style={{ height: "300px" }} alt="Lab" />
                  </div>
                </Col>
                <Col md={6}>
                  <div className="ps-md-3">
                    <h5 style={{ color: "#45352F", fontWeight: "600" }}>Fasilitas Kami</h5>
                    <p className="desc-text">{images[0].text}</p>
                  </div>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>

        {/* --- Bagian 2: Grid 3 Kolom (Desktop) / Stacked (Mobile) --- */}
        <Row className="justify-content-center mb-5 g-4">
          <Col lg={10}>
            <Row>
              <Col md={4} className="mb-4">
                <div className="custom-card shadow-sm p-3">
                  <div className="img-wrapper mb-3">
                    <Image src={images[1].src} className="img-hover" style={{ height: "200px" }} />
                  </div>
                  <p className="desc-text text-center small mb-0">{images[1].text}</p>
                </div>
              </Col>
              <Col md={4} className="mb-4 d-flex align-items-center justify-content-center text-center">
                <div className="px-2">
                  <span style={{ fontSize: "3rem", color: "#45352F", opacity: "0.2", display: "block" }}>“</span>
                  <p className="fst-italic text-muted">Akurasi dan Kecepatan adalah Prioritas Kami.</p>
                </div>
              </Col>
              <Col md={4} className="mb-4">
                <div className="custom-card shadow-sm p-3">
                  <div className="img-wrapper mb-3">
                    <Image src={images[2].src} className="img-hover" style={{ height: "200px" }} />
                  </div>
                  <p className="desc-text text-center small mb-0">{images[2].text}</p>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>

      <Footer />
    </section>
  );
}

export default Galeri;
