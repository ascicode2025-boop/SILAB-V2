import React, { useState, useEffect } from "react";
import axios from "axios";
import { Carousel, Container, Row, Col, Image, Card, Button } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/LandingPage.css";
import "@fontsource/poppins";
import Footer from "./Footer";
import { getApiBaseUrl } from "../config/apiConfig";

// --- ENV ---
const API_URL = getApiBaseUrl();

function LandingPage() {
  const history = useHistory();
  const [index, setIndex] = useState(0);

  // Tes koneksi API
  useEffect(() => {
    document.title = "SILAB-NTDK - Beranda";
    if (API_URL) {
      axios
        .get(`${API_URL}/hello`)
        .then((response) => {
          console.log("DARI API LARAVEL (Tes /hello):", response.data.message);
        })
        .catch((error) => {
          console.error("GAGAL TERHUBUNG KE API:", error);
        });
    }
  }, []);

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
  };

  const images = [
    {
      src: "/asset/Galeri_Landing_Page/galeriLandingPage1.png",
      text: "Alat Laboratorium modern dengan teknologi terbaru",
    },
    {
      src: "/asset/Galeri_Landing_Page/galeriLandingPage5.png",
      text: "Tenaga ahli profesional dan berpengalaman",
    },
    {
      src: "/asset/Galeri_Landing_Page/galeriLandingPage4.png",
      text: "Fasilitas laboratorium yang nyaman dan aman",
    },
  ];

  // State untuk daftar harga analisis dari API
  const [daftarAnalisis, setDaftarAnalisis] = useState([]);
  useEffect(() => {
    if (API_URL) {
      axios
        .get(`${API_URL}/analysis-prices`)
        .then((res) => setDaftarAnalisis(res.data))
        .catch((err) => console.error("Gagal mengambil daftar harga:", err));
    }
  }, []);

  return (
    <div id="pageWrapper">
      {/* ======================= HERO CAROUSEL ======================= */}
      <section id="beranda" className="no-overflow">
        <Carousel activeIndex={index} onSelect={handleSelect} fade interval={2000} indicators={false}>
          <Carousel.Item>
            <img className="d-block w-100 hero-img" src="/asset/Slider1.jpg" alt="Slide 1" />
          </Carousel.Item>

          <Carousel.Item>
            <img className="d-block w-100 hero-img" src="/asset/Slider2.png" alt="Slide 2" />
          </Carousel.Item>

          <Carousel.Item>
            <img className="d-block w-100 hero-img" src="/asset/Slider3.png" alt="Slide 2" />
          </Carousel.Item>
        </Carousel>

        {/* indikator custom */}
        <div className="carousel-custom-indicators">
          {[0, 1, 2].map((i) => (
            <span key={i} className={`indicator-dot ${index === i ? "active" : ""}`} onClick={() => setIndex(i)}></span>
          ))}
        </div>

        {/* ======================= GALERI ======================= */}
        <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
          <h4 className="text-center mb-5 gallery-title" style={{ marginTop: "4rem", padding: "1rem" }}>
            Galeri Divisi NTDK
          </h4>
        </div>

        <section id="galeriHeader" className="gallery-section no-overflow" style={{ backgroundColor: "#A6887D", padding: "3rem 0" }}>
          <Container>
            <Row className="g-4">
              {images.map((item, idx) => (
                <Col key={idx} md={4} sm={6} xs={12} className="d-flex justify-content-center">
                  <div className="gallery-image-wrapper text-center">
                    <Image
                      src={item.src}
                      alt={`Galeri ${idx + 1}`}
                      className="gallery-image"
                      fluid
                      style={{
                        borderRadius: "20px",
                        width: "398px",
                        height: "auto",
                      }}
                    />

                    {/* === TEKS UNIK DI BAWAH FOTO === */}
                    <p
                      className="gallery-caption"
                      style={{
                        marginTop: "10px",
                        color: "#000000",
                        fontSize: "14px",
                      }}
                    >
                      {item.text}
                    </p>
                  </div>
                </Col>
              ))}
            </Row>
          </Container>
        </section>

        {/* ======================= ANALISIS ======================= */}
        <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
          <h4 className="text-center mb-5 gallery-title" style={{ marginTop: "6rem" }}>
            Daftar Jenis dan Biaya
          </h4>
        </div>

        <Container className="py-4">
          <Row className="g-4 justify-content-start">
            {daftarAnalisis.length === 0 ? (
              <Col>
                <div>Memuat daftar harga...</div>
              </Col>
            ) : (
              daftarAnalisis.slice(0, 4).map((item, idx) => (
                <Col key={idx} xs={12} sm={6} md={4} lg={3}>
                  <Card className="h-100 text-center shadow-sm daftarAnalisis-card" style={{ backgroundColor: "" }}>
                    <Card.Img variant="top" src="/asset/DaftarAnalisis/Spektro.jpg" className="img-fluid" />
                    <Card.Body>
                      <Card.Title className="text-black">{item.jenis_analisis}</Card.Title>
                      <Card.Text className="text-black">Rp. {item.harga.toLocaleString("id-ID")}</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            )}
          </Row>
        </Container>

        <div className="d-flex justify-content-end px-3">
          <Button
            variant="light"
            className="px-4"
            style={{
              backgroundColor: "#45352F",
              color: "#F2F2F2",
              borderRadius: "5px",
              fontSize: "0.75rem",
              fontWeight: "500",
            }}
            onClick={() => {
              history.push("/daftarAnalisis");
              window.scrollTo(0, 0);
            }}
          >
            Lihat Lebih Banyak
          </Button>
        </div>

        <Footer />
      </section>
    </div>
  );
}

export default LandingPage;
