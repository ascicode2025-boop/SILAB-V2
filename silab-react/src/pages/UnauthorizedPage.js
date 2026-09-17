import React, { useEffect } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import { FaExclamationTriangle, FaHome, FaSignOutAlt } from "react-icons/fa";
import { getUser, logout, logSecurityEvent } from "../services/AuthService";
import "@fontsource/poppins";

const UnauthorizedPage = () => {
  const history = useHistory();
  const user = getUser();

  useEffect(() => {
    document.title = "SILAB-NTDK - Akses Ditolak";

    // Log security event untuk access yang ditolak
    logSecurityEvent("UNAUTHORIZED_ACCESS_ATTEMPT", `User role: ${user?.role} tried to access protected page`);
  }, [user]);

  const handleGoHome = () => {
    if (user) {
      // Redirect ke dashboard sesuai role
      switch (user.role) {
        case "koordinator":
          history.push("/koordinator/dashboard");
          break;
        case "teknisi":
          history.push("/teknisi/dashboard");
          break;
        case "kepala":
          history.push("/kepala/dashboard");
          break;
        case "klien":
          history.push("/dashboard");
          break;
        default:
          history.push("/LandingPage");
      }
    } else {
      history.push("/LandingPage");
    }
  };

  const handleLogout = () => {
    logout();
    history.push("/login");
  };

  const containerStyle = {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    fontFamily: "Poppins, sans-serif",
  };

  const cardStyle = {
    borderRadius: "20px",
    border: "none",
    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
    background: "#ffffff",
    backdropFilter: "blur(10px)",
  };

  return (
    <div style={containerStyle}>
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={6} xl={5}>
            <Card style={cardStyle}>
              <Card.Body className="text-center p-5">
                {/* Icon */}
                <div
                  className="mb-4 mx-auto d-flex align-items-center justify-content-center"
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: "linear-gradient(45deg, #ff6b6b, #ee5a24)",
                    color: "white",
                    fontSize: "36px",
                  }}
                >
                  <FaExclamationTriangle />
                </div>

                {/* Title */}
                <h2 className="fw-bold mb-3" style={{ color: "#2c3e50" }}>
                  Akses Ditolak
                </h2>

                {/* Message */}
                <p className="text-muted mb-2" style={{ fontSize: "16px", lineHeight: "1.6" }}>
                  Maaf, Anda tidak memiliki akses untuk halaman ini.
                </p>

                {user && (
                  <p className="text-muted mb-4" style={{ fontSize: "14px" }}>
                    Role Anda: <strong className="text-primary">{user.role}</strong>
                    <br />
                    <small>Silakan hubungi administrator jika menurut Anda ini adalah kesalahan.</small>
                  </p>
                )}

                {/* Buttons */}
                <div className="d-flex flex-column gap-3">
                  <Button
                    onClick={handleGoHome}
                    className="btn-lg fw-semibold"
                    style={{
                      background: "linear-gradient(45deg, #667eea, #764ba2)",
                      border: "none",
                      borderRadius: "12px",
                      padding: "12px 30px",
                      transition: "all 0.3s ease",
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow = "0 8px 25px rgba(102, 126, 234, 0.3)";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "none";
                    }}
                  >
                    <FaHome className="me-2" />
                    Kembali ke Dashboard
                  </Button>

                  <Button
                    variant="outline-danger"
                    onClick={handleLogout}
                    className="fw-semibold"
                    style={{
                      borderRadius: "12px",
                      padding: "10px 30px",
                      border: "2px solid #ff6b6b",
                      color: "#ff6b6b",
                      transition: "all 0.3s ease",
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = "#ff6b6b";
                      e.target.style.color = "white";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = "transparent";
                      e.target.style.color = "#ff6b6b";
                    }}
                  >
                    <FaSignOutAlt className="me-2" />
                    Logout
                  </Button>
                </div>

                {/* Footer */}
                <hr className="my-4" />
                <small className="text-muted">SILAB-NTDK System &copy; 2026</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default UnauthorizedPage;
