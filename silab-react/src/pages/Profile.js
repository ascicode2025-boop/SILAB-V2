import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fontsource/poppins";
import Footer from "./Footer";
import "../css/Profile.css";

const Profil = [
  { nama: "Prof. Dr. Ir. Dewi Apri Astuti, MS.", jabatan: "Kepala Divisi", img: "/asset/profil/profil1.png" },
  { nama: "Prof. Dr. Sri Suharti, S.Pt, M.Si.", jabatan: "Staff Divisi", img: "/asset/profil/profil2.png" },
  { nama: "Dr. Dilla Mareistia Fassah, S.Pt, M.Sc.", jabatan: "Staff Divisi", img: "/asset/profil/profil3.png" },
  { nama: "Dr. Ir. Lilis Khotijah, M.Si.", jabatan: "Staff Divisi", img: "/asset/profil/profil5.png" },
  { nama: "Prof.Dr.Ir. I Komang Gede Wiryawan.", jabatan: "Staff Divisi", img: "/asset/profil/profil6.png" },
  { nama: "Prof. Dr.Ir. Asep Sudarman, M.Rur.Sc.", jabatan: "Staff Divisi", img: "/asset/profil/profil7.png" },
  { nama: "Dr.Ir. Didid Diapari, M.Si.", jabatan: "Staff Divisi", img: "/asset/profil/profil8.png" },
  { nama: "Kokom Komalasari, S.Pt.,M.Si.", jabatan: "Staff Divisi", img: "/asset/profil/profil4.png" },
  { nama: "Muhammad Anugrah Yudha", jabatan: "Staff Divisi", img: "/asset/profil/profil9.jpg" },
];

function Profile() {
  React.useEffect(() => {
    document.title = "SILAB-NTDK - Profil";
  }, []);
  return (
    <section id="profil" style={{ fontFamily: "Poppins, sans-serif", padding: "50px 0 0 0", marginTop: 0, backgroundColor: "#EAE7E4" }}>
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={10} className="text-center">
            {/* Judul MANDAT */}
            <h2
              className="fw-bold mb-4"
              style={{
                color: "#4a3a2e",
                letterSpacing: "2px",
                fontSize: "2rem",
              }}
            >
              MANDAT
            </h2>

            {/* Kontainer dengan tanda kutip */}
            <div className="position-relative px-5 py-3">
              {/* Tanda Kutip Buka */}
              <span
                style={{
                  position: "absolute",
                  left: "0",
                  top: "-10px",
                  fontSize: "4rem",
                  color: "#4a3a2e",
                  fontFamily: "serif",
                  lineHeight: "1",
                }}
              >
                “
              </span>

              {/* Isi Mandat */}
              <p
                className="mb-0"
                style={{
                  color: "#333",
                  fontSize: "1.1rem",
                  lineHeight: "1.6",
                  fontWeight: "400",
                }}
              >
                mengembangkan dan mengaplikasikan ilmu pengetahuan serta teknologi pakan dalam pengembangan industri ternak daging dan kerja di daerah tropis.
              </p>

              {/* Tanda Kutip Tutup */}
              <span
                style={{
                  position: "absolute",
                  right: "0",
                  bottom: "-30px",
                  fontSize: "4rem",
                  color: "#4a3a2e",
                  fontFamily: "serif",
                  lineHeight: "1",
                }}
              >
                ”
              </span>
            </div>

            {/* Garis Horizontal Bawah */}
            <hr
              style={{
                width: "80%",
                margin: "50px auto 0",
                borderTop: "1px solid #ccc",
                opacity: "0.5",
              }}
            />
          </Col>
        </Row>
      </Container>
      {/* =======================
          Struktur Divisi 
      ======================= */}
      <h4
        className="text-center mb-5"
        style={{
          marginTop: "4rem",
          fontFamily: "Poppins, sans-serif",
          fontWeight: "700",
          color: "#2c2c2c",
        }}
      >
        Struktur Organisasi Divisi NTDK
      </h4>

      <Container style={{ paddingBottom: "4rem" }}>
        <Row className="g-5 justify-content-center">
          {Profil.slice(0, 1).map((p, index) => (
            <Col key={index} xs={12} sm={6} md={4} lg={3}>
              <Card
                className="text-center shadow-sm"
                style={{
                  borderRadius: "18px",
                  overflow: "hidden",
                  transition: "0.3s",
                  backgroundColor: "#8D6E63",
                }}
              >
                {/* Gambar ter-crop rapi */}
                <div
                  style={{
                    height: "300px",
                    width: "100%",
                    overflow: "hidden",
                  }}
                >
                  <Card.Img
                    src={p.img}
                    alt={p.nama}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "top",
                    }}
                  />
                </div>

                <Card.Body style={{ textAlign: "center" }}>
                  <Card.Title
                    title={p.nama}
                    style={{
                      fontWeight: "400",
                      fontSize: "13px",
                      color: "#fff",
                      minHeight: "45px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {p.nama}
                  </Card.Title>

                  <Card.Text
                    style={{
                      fontSize: "13px",
                      color: "#fff",
                      marginTop: "-1.7rem",
                    }}
                  >
                    {p.jabatan}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
        <Row className="g-5 justify-content-center" style={{ marginTop: "2rem" }}>
          {Profil.slice(1, 4).map((p, index) => (
            <Col key={index} xs={12} sm={6} md={4} lg={3}>
              <Card
                className="text-center shadow-sm"
                style={{
                  borderRadius: "18px",
                  overflow: "hidden",
                  transition: "0.3s",
                  backgroundColor: "#8D6E63",
                }}
              >
                {/* Gambar ter-crop rapi */}
                <div
                  style={{
                    height: "300px",
                    width: "100%",
                    overflow: "hidden",
                  }}
                >
                  <Card.Img
                    src={p.img}
                    alt={p.nama}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "top",
                    }}
                  />
                </div>

                <Card.Body>
                  <Card.Title
                    title={p.nama}
                    style={{
                      fontWeight: "400",
                      fontSize: "12px",
                      color: "#fff",
                      minHeight: "45px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {p.nama}
                  </Card.Title>

                  <Card.Text
                    style={{
                      fontSize: "13px",
                      color: "#fff",
                      marginTop: "-1.7rem",
                    }}
                  >
                    {p.jabatan}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
        <Row className="g-5 justify-content-center" style={{ marginTop: "2rem" }}>
          {Profil.slice(4, 7).map((p, index) => (
            <Col key={index} xs={12} sm={6} md={4} lg={3}>
              <Card
                className="text-center shadow-sm"
                style={{
                  borderRadius: "18px",
                  overflow: "hidden",
                  transition: "0.3s",
                  backgroundColor: "#8D6E63",
                }}
              >
                {/* Gambar ter-crop rapi */}
                <div
                  style={{
                    height: "300px",
                    width: "100%",
                    overflow: "hidden",
                  }}
                >
                  <Card.Img
                    src={p.img}
                    alt={p.nama}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "top",
                    }}
                  />
                </div>

                <Card.Body>
                  <Card.Title
                    title={p.nama}
                    style={{
                      fontWeight: "400",
                      fontSize: "12px",
                      color: "#fff",
                      minHeight: "45px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {p.nama}
                  </Card.Title>

                  <Card.Text
                    style={{
                      fontSize: "13px",
                      color: "#fff",
                      marginTop: "-1.7rem",
                    }}
                  >
                    {p.jabatan}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
        <Row className="g-5 justify-content-center" style={{ marginTop: "2rem" }}>
          {Profil.slice(7, 9).map((p, index) => (
            <Col key={index} xs={12} sm={6} md={4} lg={3}>
              <Card
                className="text-center shadow-sm"
                style={{
                  borderRadius: "18px",
                  overflow: "hidden",
                  transition: "0.3s",
                  backgroundColor: "#8D6E63",
                }}
              >
                {/* Gambar ter-crop rapi */}
                <div
                  style={{
                    height: "300px",
                    width: "100%",
                    overflow: "hidden",
                  }}
                >
                  <Card.Img
                    src={p.img}
                    alt={p.nama}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "top",
                    }}
                  />
                </div>

                <Card.Body>
                  <Card.Title
                    title={p.nama}
                    style={{
                      fontWeight: "400",
                      fontSize: "12px",
                      color: "#fff",
                      minHeight: "45px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {p.nama}
                  </Card.Title>

                  <Card.Text
                    style={{
                      fontSize: "13px",
                      color: "#fff",
                      marginTop: "-1.7rem",
                    }}
                  >
                    {p.jabatan}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
      <Footer style={{ margin: 0, padding: 0 }} />
    </section>
  );
}

export default Profile;
