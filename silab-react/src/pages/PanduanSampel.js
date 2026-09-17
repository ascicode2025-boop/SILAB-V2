import React from "react";
import { Container, Card, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fontsource/poppins";
import Footer from "./Footer";

const PanduanSampel = () => {
  React.useEffect(() => {
    document.title = "SILAB-NTDK - Panduan Sampel";
  }, []);

  return (
    <>
      <Container fluid className="d-flex justify-content-center align-items-start py-5" style={{ minHeight: "100vh", backgroundColor: "#f1f1f1" }}>
        <Card
          className="p-4 p-md-5"
          style={{
            maxWidth: "700px",
            width: "100%",
            borderRadius: "20px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
            fontFamily: "Poppins",
          }}
        >
          <h4 className="text-center mb-4">Panduan Pengiriman Sampel Analisis</h4>

          <div style={{ textAlign: "justify", fontSize: "14px", color: "#333" }}>
            <p>
              <strong>1. Persiapan Sampel</strong>
              <br />
              Pastikan sampel telah dikemas dalam wadah steril yang tertutup rapat untuk menghindari kontaminasi selama perjalanan. Pastikan sampel telah dikemas menggunakan wadah yang steril, bersih, dan tertutup rapat untuk mencegah
              terjadinya kontaminasi selama proses pengiriman. Wadah harus sesuai dengan jenis sampel dan tidak mudah bocor atau rusak agar kualitas sampel tetap terjaga hingga diterima oleh laboratorium.
            </p>

            <p>
              <strong>2. Labeling</strong>
              <br />
              Berikan label yang jelas dan mudah dibaca pada setiap botol atau wadah sampel. Label wajib mencantumkan informasi penting seperti ID sampel, tanggal dan waktu pengambilan, serta jenis analisis yang diminta. Pelabelan yang
              tepat bertujuan untuk menghindari kesalahan identifikasi dan memastikan akurasi hasil pengujian.
            </p>

            <p>
              <strong>3. Suhu Penyimpanan</strong>
              <br />
              Gunakan ice pack dan thermal bag apabila sampel memerlukan kondisi suhu dingin, umumnya pada rentang 4–8°C. Pengendalian suhu selama pengiriman sangat penting untuk menjaga stabilitas zat metabolit dan mencegah terjadinya
              degradasi yang dapat memengaruhi hasil analisis.
            </p>

            <p>
              <strong>4. Dokumen Pendukung</strong>
              <br />
              Sertakan seluruh dokumen pendukung yang diperlukan, termasuk formulir pemesanan atau permintaan analisis yang telah dicetak dari sistem. Pastikan dokumen tersebut ditempatkan di dalam paket pengiriman dengan aman dan
              terlindungi agar dapat diperiksa dengan mudah oleh pihak laboratorium.
            </p>

            <p style={{ color: "#8B0000", fontWeight: "500" }}>
              <strong>Catatan Penting:</strong> Kerusakan sampel akibat pengemasan yang tidak standar di luar tanggung jawab laboratorium.
            </p>
          </div>

          <div className="text-end mt-4 pe-2">
            <Button
              style={{
                backgroundColor: "#6c5245",
                borderRadius: "20px",
                padding: "8px 30px",
                border: "none",
              }}
              onClick={() => window.history.back()}
            >
              Kembali
            </Button>
          </div>
        </Card>
      </Container>
      <Footer />
    </>
  );
};

export default PanduanSampel;
