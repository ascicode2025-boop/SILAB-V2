import React, { useState, useEffect } from "react";
import { Image, Nav, Dropdown, Badge } from "react-bootstrap";
import { useHistory, useLocation } from "react-router-dom";
import { FaThLarge, FaFileAlt, FaCalendarAlt, FaClipboardList, FaClock, FaFlask, FaHistory, FaBars, FaTimes, FaUserCircle, FaBell, FaClipboardCheck, FaBoxOpen } from "react-icons/fa";
import { getUnreadNotifications, getAllNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "../../services/NotificationService";
import "@fontsource/poppins";
import ConfirmModal from "../../components/Common/ConfirmModal";
import { getStorageUrl } from "../../config/apiConfig";

function NavbarLoginTeknisi({ children }) {
  const history = useHistory();
  const location = useLocation();

  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notifCount, setNotifCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUser(storedUser);
  }, []);

  // Fetch notifications dengan polling (ambil semua untuk tetap menampilkan read)
  const fetchNotifications = async () => {
    try {
      const allResp = await getAllNotifications(1, 50);
      const allData = allResp && allResp.data && allResp.data.data ? allResp.data.data : [];

      const unreadResp = await getUnreadNotifications();
      const unreadCount = unreadResp && unreadResp.count ? unreadResp.count : 0;

      setNotifications(allData || []);
      setNotifCount(unreadCount || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = async (notif) => {
    try {
      await markNotificationAsRead(notif.id);

      setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n)));
      setNotifCount((c) => Math.max(0, c - 1));

      fetchNotifications().catch((e) => console.error("Background fetch error:", e));

      if (notif.booking_id) {
        history.push("/teknisi/dashboard/verifikasiSampel");
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const menuSections = [
    {
      title: "Analisis Sampel",
      items: [
        { key: "dashboard", label: "Dasbor", icon: <FaThLarge /> },
        { key: "aturTanggalTeknisi", label: "Atur Kuota Harian", icon: <FaFileAlt /> },
        { key: "jadwalSampel", label: "Jadwal Penerimaan Sampel", icon: <FaCalendarAlt /> },
        { key: "verifikasiSampel", label: "Verifikasi & Update Status Sampel", icon: <FaClipboardList /> },
        { key: "inputNilaiAnalisis", label: "Input Hasil Analisis & Rumus Otomatis", icon: <FaClock /> },
        { key: "generatePdfAnalysis", label: "Generate Laporan Hasil Analisis (PDF)", icon: <FaFlask /> },
        { key: "riwayat", label: "Riwayat Analisis", icon: <FaHistory /> },
      ],
    },
    {
      title: "Peminjaman Alat",
      items: [
        { key: "inventarisAlat", label: "Inventaris Alat", icon: <FaClipboardCheck /> },
        { key: "pengelolaanPeminjaman", label: "Pengelolaan Peminjaman", icon: <FaBoxOpen /> },
      ],
    },
  ];

  const allMenus = menuSections.flatMap((section) => section.items);

  const avatarSrc = user?.avatar ? (user.avatar.startsWith("http") || user.avatar.startsWith("blob") ? user.avatar : `${getStorageUrl()}/storage/${user.avatar}`) : null;

  // sinkronkan activeMenu berdasarkan URL
  useEffect(() => {
    const path = location.pathname.replace("/teknisi/dashboard/", "");
    const found = allMenus.find((m) => path.startsWith(m.key));
    if (found) {
      setActiveMenu(found.key);
    }
  }, [location.pathname]);

  const currentTitle = (() => {
    return allMenus.find((m) => m.key === activeMenu)?.label || "Dasbor";
  })();

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    history.push("/LandingPage");
  };

  const [showLogout, setShowLogout] = useState(false);

  return (
    <div className="dashboard-layout" style={{ fontFamily: "Poppins, sans-serif" }}>
      {/* Header */}
      <header className="dashboard-header d-flex justify-content-between align-items-center px-4 py-2 shadow-sm bg-white border-bottom sticky-top">
        {/* Bagian Kiri: Burger Menu & Logo */}
        <div className="d-flex align-items-center">
          <button className="btn btn-light border-0 me-3 d-lg-none rounded-circle" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle sidebar">
            {sidebarOpen ? <FaTimes size={20} className="text-secondary" /> : <FaBars size={20} className="text-secondary" />}
          </button>

          <div className="d-flex align-items-center gap-3">
            <Image src="/asset/gambarLogo.png" alt="IPB Logo" className="navbar-logo" style={{ width: "120px", height: "auto" }} />
            <div className="vr d-none d-md-block mx-2 text-muted opacity-25" style={{ height: "30px" }}></div>
            <div className="d-none d-md-flex flex-column justify-content-center">
              <span className="fw-bold text-dark mb-0" style={{ fontSize: "0.85rem", lineHeight: "1.2" }}>
                Sistem Informasi Laboratorium
              </span>
              <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                Nutrisi Ternak Daging Dan Kerja
              </span>
            </div>
          </div>
        </div>

        {/* Bagian Kanan: Notifikasi & User */}
        <div className="d-flex align-items-center gap-2">
          {/* Notification Dropdown */}
          <Dropdown show={showNotifDropdown} onToggle={(isOpen) => setShowNotifDropdown(isOpen)} align="end">
            <Dropdown.Toggle variant="light" className="border-0 bg-transparent position-relative p-2 rounded-circle" style={{ width: "40px", height: "40px" }}>
              <FaBell size={18} className="text-secondary" />
              {notifCount > 0 && (
                <Badge
                  bg="danger"
                  pill
                  className="position-absolute border border-white"
                  style={{
                    top: "4px",
                    right: "4px",
                    fontSize: "0.6rem",
                    padding: "3px 5px",
                  }}
                >
                  {notifCount}
                </Badge>
              )}
            </Dropdown.Toggle>

            <Dropdown.Menu className="shadow-lg border-0 mt-2" style={{ width: "320px", borderRadius: "12px", overflow: "hidden" }}>
              <div className="d-flex justify-content-between align-items-center px-3 py-3 bg-light">
                <h6 className="mb-0 fw-bold">Notifikasi</h6>
                {notifCount > 0 && (
                  <button className="btn btn-sm btn-link text-decoration-none p-0 fw-semibold" onClick={handleMarkAllAsRead}>
                    Tandai Semua
                  </button>
                )}
              </div>

              <div style={{ maxHeight: "350px", overflowY: "auto" }}>
                {notifications.length === 0 ? (
                  <div className="text-center text-muted py-5">
                    <FaBell size={30} className="mb-2 opacity-25" />
                    <p className="small mb-0">Tidak ada notifikasi baru</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <Dropdown.Item
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className="py-3 px-3 border-bottom"
                      style={{
                        whiteSpace: "normal",
                        backgroundColor: notif.is_read ? "#ffffff" : "#f0f7ff",
                      }}
                    >
                      <div className="d-flex flex-column gap-1">
                        <div className={`small fw-bold ${notif.is_read ? "text-secondary" : "text-dark"}`}>{notif.title}</div>
                        <div className="text-muted" style={{ fontSize: "0.8rem", lineHeight: "1.4" }}>
                          {notif.message}
                        </div>
                        <div className="text-uppercase fw-medium" style={{ fontSize: "0.65rem", color: "#adb5bd" }}>
                          {new Date(notif.created_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                        </div>
                      </div>
                    </Dropdown.Item>
                  ))
                )}
              </div>
            </Dropdown.Menu>
          </Dropdown>

          {/* User Profile Dropdown */}
          <Dropdown align="end">
            <Dropdown.Toggle variant="light" className="d-flex align-items-center border-0 bg-light rounded-pill px-2 px-md-3 py-1 gap-2" style={{ transition: "0.3s" }}>
              {avatarSrc ? (
                <Image src={avatarSrc} roundedCircle className="navbar-avatar" width={28} height={28} style={{ width: "28px", height: "28px", objectFit: "cover", flexShrink: 0 }} />
              ) : (
                <FaUserCircle size={24} className="text-primary flex-shrink-0" />
              )}
              <span className="fw-semibold d-none d-md-inline" style={{ fontSize: "0.85rem" }}>
                {user?.name || "User"}
              </span>
            </Dropdown.Toggle>

            <Dropdown.Menu className="shadow-lg border-0 mt-2" style={{ borderRadius: "10px" }}>
              <Dropdown.Item className="py-2" onClick={() => history.push("/teknisi/dashboard/profile")}>
                <i className="bi bi-person me-2"></i> Profil Akun
              </Dropdown.Item>
              <hr className="dropdown-divider opacity-50" />
              <Dropdown.Item className="py-2 text-danger" onClick={() => setShowLogout(true)}>
                <i className="bi bi-box-arrow-right me-2"></i> Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`dashboard-sidebar bg-white px-2 py-3 shadow-sm ${sidebarOpen ? "open" : ""}`}>
        <Nav className="flex-column">
          {menuSections.map((section, sIdx) => (
            <div key={section.title} className={sIdx > 0 ? "mt-3" : ""}>
              <div className="sidebar-section-title px-3 py-1 text-muted fw-semibold" style={{ fontSize: "0.78rem", color: "#6c757d" }}>
                {section.title}
              </div>
              {section.items.map((menu) => (
                <Nav.Link
                  key={menu.key}
                  onClick={() => {
                    setActiveMenu(menu.key);
                    if (menu.key === "riwayat") {
                      history.push("/teknisi/dashboard/riwayat");
                    } else {
                      history.push(`/teknisi/dashboard/${menu.key}`);
                    }
                    setSidebarOpen(false);
                  }}
                  className={`d-flex align-items-center mb-1 py-2 px-3 rounded ${activeMenu === menu.key ? "active" : ""}`}
                  style={{
                    color: activeMenu === menu.key ? "#111" : "#333",
                    fontSize: "0.875rem",
                    transition: "background 0.2s, color 0.2s",
                    cursor: "pointer",
                  }}
                >
                  <span className="me-3 d-flex align-items-center" style={{ fontSize: "1.05rem" }}>
                    {menu.icon}
                  </span>
                  <span>{menu.label}</span>
                </Nav.Link>
              ))}
            </div>
          ))}
        </Nav>
      </aside>

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Konten */}
      <main className="dashboard-content">
        <div className="page-title-bar">
          <h5 className="m-0 px-4 py-2">{currentTitle}</h5>
        </div>

        <div className="dashboard-inner">{children}</div>
      </main>
      <ConfirmModal
        show={showLogout}
        title="Konfirmasi Logout"
        message="Anda yakin ingin keluar dari akun?"
        onConfirm={() => {
          handleLogout();
          setShowLogout(false);
        }}
        onCancel={() => setShowLogout(false)}
      />

      {/* CSS */}
      <style>{`
        .dashboard-layout { display: flex; min-height: 100vh; flex-direction: column; }
        .dashboard-header { position: fixed; top: 0; left: 0; right: 0; height: 70px; z-index: 1060; background: #fff; display: flex; align-items: center; }
        .dashboard-sidebar { width: 250px; position: fixed; top: 70px; left: 0; height: calc(100vh - 70px); overflow-y: auto; transform: translateX(-100%); transition: transform 0.3s ease; z-index: 1055; border-right: 1px solid #e5e5e5; background: #fff; }
        .dashboard-sidebar.open { transform: translateX(0); }
        .dashboard-sidebar .nav-link { color: #333; border-radius: 4px; }
        .dashboard-sidebar .nav-link:hover { background-color: #f2f2f2; }
        .dashboard-sidebar .nav-link.active { background-color: #e0e0e0; font-weight: 600; color: #111; }
        .sidebar-section-title { font-family: Poppins, sans-serif; font-weight: 600; }
        .dashboard-content { flex: 1; background-color: #fafafa; min-height: calc(100vh - 70px); margin-top: 70px; margin-left: 0; padding: 0 !important; transition: margin-left 0.3s ease; }
        .dashboard-inner { padding: 0 !important; margin: 0 !important; }
        .page-title-bar { background-color: #a6867b; color: #fff; font-weight: 500; font-size: 1.25rem; letter-spacing: 0.5px; box-shadow: 0 -4px 8px rgba(0,0,0,0.25) inset; border-bottom-left-radius: 30px; border-bottom-right-radius:30px; }
        .sidebar-overlay { position: fixed; top: 70px; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); z-index: 1050; }
        .subtitle-text { font-size: 0.8rem; white-space: normal; }
        .modal { z-index: 1070 !important; }
        .modal-backdrop { z-index: 1065 !important; }
        @keyframes bellRing {
            0% { transform: rotate(0); }
            15% { transform: rotate(10deg); }
            30% { transform: rotate(-10deg); }
            45% { transform: rotate(6deg); }
            60% { transform: rotate(-6deg); }
            75% { transform: rotate(3deg); }
            100% { transform: rotate(0); }
          }

          .bell-animate {
            animation: bellRing 1.2s ease-in-out infinite;
            transform-origin: top center;
          }
            
        @media (min-width: 992px) {
          .dashboard-sidebar { transform: translateX(0); }
          .dashboard-content { margin-left: 250px; margin-top: 70px; }
        }

        .dashboard-header .navbar-avatar {
          width: 28px !important;
          height: 28px !important;
          min-width: 28px !important;
          min-height: 28px !important;
          max-width: 28px !important;
          max-height: 28px !important;
          border-radius: 50% !important;
          object-fit: cover !important;
          flex-shrink: 0 !important;
        }

        @media (max-width: 991.98px) {
          .dashboard-sidebar { padding-top: 1rem; width: 75%; max-width: 260px; box-shadow: 2px 0 8px rgba(0,0,0,0.15); }
          .dashboard-header .navbar-logo { width: 100px; height: auto; }
          .dashboard-header .subtitle-text { font-size: 0.4rem !important; white-space: nowrap !important; text-overflow: ellipsis; max-width: 180px; }
          .dashboard-sidebar .nav-link { font-size: 0.9rem; }
        }

        @media (max-width: 576px) {
          .dashboard-header .navbar-logo { width: 85px; height: auto; }
          .dashboard-header { padding-left: 0.8rem !important; padding-right: 0.8rem !important; }
        }
      `}</style>
    </div>
  );
}

export default NavbarLoginTeknisi;
