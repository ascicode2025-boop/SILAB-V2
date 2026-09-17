import React, { useEffect, useState } from "react";
import { Container, Nav, Button, Image, Offcanvas } from "react-bootstrap";
import { useHistory, useLocation } from "react-router-dom";
import "@fontsource/poppins";

function NavbarLandingPage() {
  const history = useHistory();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("");
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [scrollTarget, setScrollTarget] = useState(null);

  const handleClose = () => setShowOffcanvas(false);
  const handleShow = () => setShowOffcanvas(true);

  const sections = [
    { key: "beranda", label: "Beranda", path: "/LandingPage" },
    { key: "galeri", label: "Galeri", path: "/galeri"},
    { key: "profil", label: "Profil", path: "/profile" },
    { key: "daftarAnalisis", label: "Daftar Harga Analisis", path: "/daftarAnalisis" },
    { key: "daftarAlat", label: "Daftar Peminjaman Alat", path: "/DaftarAlatSebelumLogin"},
    { key: "kontak", label: "Contact", path: "/LandingPage", scroll: "kontak" },
    ];

  // --- Update active section berdasarkan path saat refresh ---
  useEffect(() => {
    const path = location.pathname.toLowerCase();
    if (path === "/landingpage" || path === "/") setActiveSection("beranda");
    else if (path === "/profile") setActiveSection("profil");
    else if (path === "/galeri") setActiveSection("galeri");
    else if (path === "/daftaranalisis") setActiveSection("daftarAnalisis");
    else if (path === "/daftaralat" || path === "/daftaralatsebelumlogin") setActiveSection("daftarAlat");
    else setActiveSection("");
  }, [location.pathname]);

  // --- Efek scroll otomatis setelah pindah halaman ---
  useEffect(() => {
    const target = location.state?.scrollTo || scrollTarget;
    if (target) {
      const timer = setTimeout(() => {
        const element = document.getElementById(target);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
          setActiveSection(target);
        }
        history.replace({ ...location, state: {} });
        setScrollTarget(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [location, history, scrollTarget]);

  const handleNavClick = (section, path, scrollTo) => {
    setActiveSection(section);

    if (path === "/LandingPage" && scrollTo) {
      if (location.pathname === "/LandingPage") {
        handleClose();
        setTimeout(() => {
          const element = document.getElementById(scrollTo);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
            setActiveSection(scrollTo);
          }
        }, 300);
      } else {
        handleClose();
        history.push(path, { scrollTo });
      }
    } else {
      handleClose();
      history.push(path);
    }
  };

  return (
    <div style={{ fontFamily: "Poppins, sans-serif" }}>
      {/* Navbar atas */}
      <div style={{ padding: "12px 0" }}>
        <Container className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            {/* Hamburger mobile */}
            <button className="hamburger d-lg-none me-3" onClick={handleShow}>
              <span></span><span></span><span></span>
            </button>

            {/* Logo desktop */}
            <div className="d-none d-lg-flex flex-column">
              <Image src="/asset/gambarLogo.png" alt="IPB Logo" className="logo mb-2" />
              <div className="text-muted description">
                Sistem Informasi Laboratorium Nutrisi Ternak Daging dan Kerja
              </div>
            </div>

            {/* Logo mobile */}
            <Image src="/asset/gambarLogo.png" alt="IPB Logo" className="logo d-lg-none me-2" />
          </div>

          {/* Tombol Login */}
          <Button
            variant="light"
            className="btn-login"
            onClick={() => history.push("/login")}
          >
            Login
          </Button>
        </Container>
      </div>

      {/* Navbar desktop */}
      <div className="d-none d-lg-block" style={{ backgroundColor: "white", borderBottom: "1px solid #ddd" }}>
        <Container>
          <Nav className="d-flex flex-wrap justify-content-center fw-medium py-2 mt-1" style={{ gap: "1px" }}>
            {sections.map((sec) => (
              <Nav.Link
                key={sec.key}
                onClick={() => handleNavClick(sec.key, sec.path, sec.scroll)}
                className={`nav-item-link text-dark ${
                  activeSection === sec.key ? "active-link" : ""
                }`}
              >
                {sec.label}
              </Nav.Link>
            ))}
          </Nav>
        </Container>
      </div>

      {/* Offcanvas mobile */}
      <Offcanvas show={showOffcanvas} onHide={handleClose} placement="start">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            <div className="d-flex flex-column align-items-start">
              <Image src="/asset/gambarLogo.png" alt="IPB Logo" className="logo mb-2" />
              <div className="text-muted description">
                Sistem Informasi Laboratorium Nutrisi Ternak Daging dan Kerja
              </div>
            </div>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column">
            {sections.map((sec) => (
              <Nav.Link
                key={sec.key}
                onClick={() => handleNavClick(sec.key, sec.path, sec.scroll)}
                className={`nav-item-link text-dark ${
                  activeSection === sec.key ? "active-link" : ""
                }`}
              >
                {sec.label}
              </Nav.Link>
            ))}
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>

      {/* CSS inline */}
      <style>{`
        .logo { width: 230px; height: auto; }
        .description { font-size: 0.8rem; color: #8D6E63; }
        .btn-login {
          background-color: #D9D9D9 !important;
          color: black !important;
          border-radius: 10px;
          padding: 8px 25px;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .hamburger {
          background: transparent;
          border: none;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          width: 25px;
          height: 20px;
          padding: 0;
          cursor: pointer;
        }
        .hamburger span {
          display: block;
          height: 3px;
          width: 100%;
          background-color: #333;
          border-radius: 2px;
        }

        .nav-item-link {
          font-size: 1.1rem;
          margin: 0 6px;
          transition: color 0.3s ease, border-bottom 0.3s ease;
          border-bottom: 2px solid transparent;
          padding-bottom: 4px;
        }
        .nav-item-link:hover { color: #8B6B61 !important; }
        .active-link {
          border-bottom: 2px solid #8D6E63;
          font-weight: 600;
          color: #8B6B61 !important;
        }

        .offcanvas .nav-item-link {
          display: block;
          border-radius: 8px;
          padding: 10px 15px;
          margin-bottom: 6px;
          transition: background 0.3s ease, color 0.3s ease;
        }
        .offcanvas .nav-item-link:hover {
          background-color: #F5EDE6;
          color: #8B6B61 !important;
        }
        .offcanvas .nav-item-link.active-link {
          background-color: #E8D6CD;
          font-weight: bold;
          color: #8B6B61 !important;
        }

        @media (max-width: 992px) {
          .logo { width: 200px; }
          .description { font-size: 0.7rem; }
          .btn-login { font-size: 0.85rem; padding: 6px 20px; }
          .nav-item-link { font-size: 1rem; margin: 0 4px; }
        }

        @media (max-width: 576px) {
          .logo { width: 160px; }
          .description { font-size: 0.6rem; }
          .btn-login { font-size: 0.8rem; padding: 6px 18px; }
          .offcanvas .nav-item-link { font-size: 0.95rem; }
        }
      `}</style>
    </div>
  );
}

export default NavbarLandingPage;