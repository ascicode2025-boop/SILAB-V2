import React from "react";
import { Container, Button } from "react-bootstrap";
import { FaFacebookF, FaLinkedinIn, FaYoutube, FaInstagram } from "react-icons/fa";
import { useHistory } from "react-router-dom";

function Footer() {
  const history = useHistory();

  return (
    <footer id="kontak" className="py-5" style={{ marginTop: 0}}>
      <Container>
        {/* Bagian atas */}
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
          <h5 className="fw-semibold m-0">SOP Analisis Lab</h5>

          <Button
            variant="light"
            style={{
              backgroundColor: "#45352F",
              color: "#F2F2F2",
              borderRadius: "6px",
              fontSize: "0.85rem",
              fontWeight: "500",
              padding: "6px 16px",
            }}
              onClick={() => {
              history.push("/panduanSampel");
              window.scrollTo(0, 0);
            }}
            
          >
            Analisis Lab
          </Button>
        </div>

        <hr style={{ borderTop: "2px solid #45352F" }} />

        {/* Bagian bawah */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-4 mt-4">
          <div>
            <h6 className="fw-bold mb-3" style={{ fontSize: "1.2rem" }}>
              Contacts
            </h6>
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <a href="#" style={{ color: "#45352F" }}>
                <FaFacebookF size={18} />
              </a>
              <a href="#" style={{ color: "#45352F" }}>
                <FaLinkedinIn size={18} />
              </a>
              <a href="#" style={{ color: "#45352F" }}>
                <FaYoutube size={18} />
              </a>
              <a href="#" style={{ color: "#45352F" }}>
                <FaInstagram size={18} />
              </a>
            </div>
          </div>

          <div
            style={{
              fontSize: "0.9rem",
              textAlign: "left",
              maxWidth: "550px",
            }}
          >
            <p className="mb-1">
              Divisi Nutrisi Ternak Daging dan Kerja
              <br />Departeman Ilmu Nutrisi dan Teknologi Pakan Fakultas Peternakan IPB</p>
            <p className="mb-1">
              Jl. Agatis Kampus IPB Darmaga Bogor, 16680 Jawa Barat - Indonesia
            </p>
            <p className="mb-1">Phone: +62251-8626213, 8622842</p>
            <p className="mb-0">Email: sekretariatintp@gmail.com</p>
          </div>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;