import React, { useState, useEffect } from "react";
import { Image, Dropdown, Badge } from "react-bootstrap";
import { FaUserCircle, FaBell } from "react-icons/fa";
import { useHistory } from "react-router-dom";
import { getUnreadNotifications, getAllNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "../../services/NotificationService";
import "@fontsource/poppins";
import ConfirmModal from "../../components/Common/ConfirmModal";

function NavbarProfileKoordinator({ user }) {
  const history = useHistory();

  const [notifications, setNotifications] = useState([]);
  const [notifCount, setNotifCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const fetchNotifications = async () => {
    try {
      const allResp = await getAllNotifications(1, 50);
      const allData = allResp && allResp.data && allResp.data.data ? allResp.data.data : [];
      const unreadResp = await getUnreadNotifications();
      const unreadCount = unreadResp && unreadResp.count ? unreadResp.count : 0;
      setNotifications(allData || []);
      setNotifCount(unreadCount);
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
        history.push("/koordinator/dashboard/verifikasiSampelKoordinator");
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

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    history.push("/LandingPage");
  };

  const [showLogout, setShowLogout] = useState(false);

  const avatarSrc = user?.avatar ? (user.avatar.startsWith("http") || user.avatar.startsWith("blob") ? user.avatar : `https://api.silabntdk.com/storage/${user.avatar}`) : null;

  return (
    <>
      <header className="d-flex justify-content-between align-items-center px-4 py-2 shadow-sm bg-white border-bottom sticky-top" style={{ fontFamily: "Poppins, sans-serif" }}>
        <div className="d-flex align-items-center gap-3">
          <Image src="/asset/gambarLogo.png" alt="IPB Logo" style={{ width: "120px", height: "auto" }} />
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

        <div className="d-flex align-items-center gap-2">
          <Dropdown show={showNotifDropdown} onToggle={(isOpen) => setShowNotifDropdown(isOpen)} align="end">
            <Dropdown.Toggle variant="light" className="border-0 bg-transparent position-relative p-2 rounded-circle" style={{ width: "40px", height: "40px" }}>
              <FaBell size={18} className="text-secondary" />
              {notifCount > 0 && (
                <Badge bg="danger" pill className="position-absolute border border-white" style={{ top: "4px", right: "4px", fontSize: "0.6rem", padding: "3px 5px" }}>
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
                    <Dropdown.Item key={notif.id} onClick={() => handleNotificationClick(notif)} className="py-3 px-3 border-bottom" style={{ whiteSpace: "normal", backgroundColor: notif.is_read ? "#ffffff" : "#f0f7ff" }}>
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

          <Dropdown align="end">
            <Dropdown.Toggle variant="light" className="d-flex align-items-center border-0 bg-light rounded-pill px-3 py-1 gap-2" style={{ transition: "0.3s" }}>
              {avatarSrc ? <Image src={avatarSrc} roundedCircle width={28} height={28} style={{ objectFit: "cover" }} /> : <FaUserCircle size={24} className="text-primary" />}
              <span className="fw-semibold d-none d-md-inline" style={{ fontSize: "0.85rem" }}>
                {user?.name || "User"}
              </span>
            </Dropdown.Toggle>
            <Dropdown.Menu className="shadow-lg border-0 mt-2" style={{ borderRadius: "10px" }}>
              <Dropdown.Item className="py-2" onClick={() => history.push("/koordinator/dashboard/profile")}>
                Profil Akun
              </Dropdown.Item>
              <hr className="dropdown-divider opacity-50" />
              <Dropdown.Item className="py-2 text-danger" onClick={() => setShowLogout(true)}>
                Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </header>
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
    </>
  );
}

export default NavbarProfileKoordinator;
