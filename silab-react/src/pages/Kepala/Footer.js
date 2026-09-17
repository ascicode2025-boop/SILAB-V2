import React from "react";
import { Container, Row, Col } from "react-bootstrap";

function FooterSetelahLogin() {
  return (
    <footer
      style={{
        backgroundColor: "#ffffff",
        padding: "20px 0",
        borderTop: "1px solid #e6e6e6",
        boxShadow: "0 -1px 8px rgba(0, 0, 0, 0.05)",
        width: "100%",
      }}
    >
      <Container>
        <Row className="align-items-center text-center text-md-start">
          <Col md={8} sm={12} className="mb-2 mb-md-0">
            <span
              style={{
                color: "#333",
                fontSize: "14px",
                fontFamily: "Poppins, sans-serif",
              }}
            >
              © {new Date().getFullYear()}{" "}
              <strong>ASCII CODE</strong> — Informatics Engineering, YARSI University.
            </span>
          </Col>
          <Col md={4} sm={12} className="text-md-end text-center" />
        </Row>
      </Container>
    </footer>
  );
}

export default FooterSetelahLogin;
