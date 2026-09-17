const TOKEN_KEY = "token";
const USER_KEY = "user";
const USER_NAME_KEY = "user_name";

export const setSession = (token, user) => {
  if (!token) {
    console.error("AuthService Error: Mencoba menyimpan token kosong");
    return;
  }

  token = token.replace(/"/g, "");

  // Simpan token & user
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));

  if (user && user.name) {
    localStorage.setItem(USER_NAME_KEY, user.name);
  }

  if (user && user.role) {
    localStorage.setItem("role", user.role);
  }
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getUser = () => {
  const userStr = localStorage.getItem(USER_KEY);
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      console.error("Gagal parsing data user:", e);
      return null;
    }
  }
  return null;
};

export const getUserRole = () => {
  const user = getUser();
  return user ? user.role : null;
};

export const isLoggedIn = () => {
  return !!getToken();
};

export const getAuthHeader = () => {
  const token = getToken();
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
};

// === ROLE CHECKING FUNCTIONS ===
export const hasRole = (requiredRole) => {
  const userRole = getUserRole();
  return userRole === requiredRole;
};

export const hasAnyRole = (requiredRoles) => {
  const userRole = getUserRole();
  return requiredRoles.includes(userRole);
};

export const isKoor = () => {
  return hasRole("koordinator"); // Koordinator = Admin dalam sistem ini
};

export const isTeknisi = () => {
  return hasRole("teknisi");
};

export const isKepala = () => {
  return hasRole("kepala");
};

export const isKlien = () => {
  return hasRole("klien");
};

// === ACCESS CONTROL FUNCTIONS ===
export const canAccessAdminPage = () => {
  return isLoggedIn() && isKoor();
};

export const canAccessTeknisiPage = () => {
  return isLoggedIn() && (isKoor() || isTeknisi());
};

export const canAccessKepalaPage = () => {
  return isLoggedIn() && (isKoor() || isKepala());
};

export const canAccessKlienPage = () => {
  return isLoggedIn() && isKlien();
};

// === SECURITY FUNCTIONS ===
export const logSecurityEvent = (event, details = "") => {
  const timestamp = new Date().toISOString();
  const user = getUser();
  const securityLog = {
    timestamp,
    event,
    user: user ? { id: user.id, role: user.role, name: user.name } : "Anonymous",
    details,
    userAgent: navigator.userAgent,
  };

  // Log ke console untuk debugging (di production bisa dikirim ke server)
  console.warn(`[SECURITY] ${event}:`, securityLog);

  // Simpan ke localStorage untuk audit trail lokal
  const logs = JSON.parse(localStorage.getItem("security_logs") || "[]");
  logs.push(securityLog);
  // Hanya simpan 50 log terakhir untuk menghemat storage
  if (logs.length > 50) logs.splice(0, logs.length - 50);
  localStorage.setItem("security_logs", JSON.stringify(logs));
};

export const logout = () => {
  logSecurityEvent("LOGOUT", "User logged out");
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(USER_NAME_KEY);
  localStorage.removeItem("role");
};
