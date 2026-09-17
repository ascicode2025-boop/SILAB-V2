import React from "react";
import { Container, Card, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fontsource/poppins";
import FooterSetelahLogin from "../FooterSetelahLogin";
import NavbarLoginKlien from "./NavbarLoginKlien";

const PanduanSampelKlien = () => {
  React.useEffect(() => {
    document.title = "SILAB-NTDK - Panduan Sampel";
  }, []);

  const panduanSteps = [
    {
      title: "Persiapan Sampel",
      text: "Pastikan sampel telah dikemas dalam wadah steril yang tertutup rapat untuk menghindari kontaminasi selama perjalanan. Pastikan sampel telah dikemas menggunakan wadah yang steril, bersih, dan tertutup rapat untuk mencegah terjadinya kontaminasi selama proses pengiriman. Wadah harus sesuai dengan jenis sampel dan tidak mudah bocor atau rusak agar kualitas sampel tetap terjaga hingga diterima oleh laboratorium.",
    },
    {
      title: "Labeling",
      text: "Berikan label yang jelas dan mudah dibaca pada setiap botol atau wadah sampel. Label wajib mencantumkan informasi penting seperti ID sampel, tanggal dan waktu pengambilan, serta jenis analisis yang diminta. Pelabelan yang tepat bertujuan untuk menghindari kesalahan identifikasi dan memastikan akurasi hasil pengujian.",
    },
    {
      title: "Suhu Penyimpanan",
      text: "Gunakan ice pack dan thermal bag apabila sampel memerlukan kondisi suhu dingin, umumnya pada rentang 4–8°C. Pengendalian suhu selama pengiriman sangat penting untuk menjaga stabilitas zat metabolit dan mencegah terjadinya degradasi yang dapat memengaruhi hasil analisis.",
    },
    {
      title: "Dokumen Pendukung",
      text: "Sertakan seluruh dokumen pendukung yang diperlukan, termasuk formulir pemesanan atau permintaan analisis yang telah dicetak dari sistem. Pastikan dokumen tersebut ditempatkan di dalam paket pengiriman dengan aman dan terlindungi agar dapat diperiksa dengan mudah oleh pihak laboratorium.",
    },
  ];

  return (
    <NavbarLoginKlien>
      <Container
        fluid
        className="py-5"
        style={{
          minHeight: "100vh",
          backgroundColor: "#f8f9fa",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        <Row className="justify-content-center">
          <Col lg={8} md={10}>
            {/* Header Section */}
            <div className="text-center mb-5">
              <h2 style={{ fontWeight: "700", color: "#4e342e" }}>Panduan Pengiriman Sampel</h2>
              <p className="text-muted">Ikuti langkah-langkah di bawah ini untuk memastikan sampel Anda diterima dalam kondisi baik</p>
              <div
                style={{
                  width: "80px",
                  height: "5px",
                  backgroundColor: "#8D6E63",
                  margin: "0 auto",
                  borderRadius: "10px",
                }}
              ></div>
            </div>

            <Card
              className="border-0 shadow-sm p-4 p-md-5"
              style={{
                borderRadius: "25px",
                backgroundColor: "#ffffff",
              }}
            >
              {panduanSteps.map((step, index) => (
                <div key={index} className="d-flex mb-4 last-child-mb-0">
                  <div className="me-4">
                    <div
                      className="d-flex align-items-center justify-content-center shadow-sm"
                      style={{
                        width: "45px",
                        height: "45px",
                        backgroundColor: "#8D6E63",
                        color: "white",
                        borderRadius: "12px",
                        fontWeight: "600",
                        fontSize: "1.2rem",
                      }}
                    >
                      {index + 1}
                    </div>
                    {index !== panduanSteps.length - 1 && (
                      <div
                        style={{
                          width: "2px",
                          height: "100%",
                          backgroundColor: "#e0e0e0",
                          margin: "10px auto",
                        }}
                      ></div>
                    )}
                  </div>
                  <div className="pb-3">
                    <h5 style={{ fontWeight: "600", color: "#333" }}>{step.title}</h5>
                    <p style={{ textAlign: "justify", color: "#666", lineHeight: "1.6" }}>{step.text}</p>
                  </div>
                </div>
              ))}

              <div
                className="mt-4 p-4 text-center"
                style={{
                  backgroundColor: "#efebe9",
                  borderRadius: "15px",
                  borderLeft: "5px solid #8D6E63",
                }}
              >
                <p className="mb-0 italic" style={{ fontSize: "0.9rem", color: "#5d4037" }}>
                  <strong>Catatan Penting:</strong> Kerusakan sampel akibat pengemasan yang tidak standar di luar tanggung jawab laboratorium.
                </p>
              </div>
            </Card>
          </Col>
        </Row>
      </Container>
      <FooterSetelahLogin />
    </NavbarLoginKlien>
  );
};

export default PanduanSampelKlien;
