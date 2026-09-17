import React from "react";
import { isLoggedIn, hasRole, hasAnyRole, isKoor, isTeknisi, isKepala, isKlien, canAccessAdminPage, canAccessTeknisiPage, canAccessKepalaPage, canAccessKlienPage } from "../services/AuthService";

/**
 * Komponen untuk conditional rendering berdasarkan role
 * @param {Object} props
 * @param {React.ReactNode} props.children - Komponen yang akan dirender jika akses diizinkan
 * @param {string} props.role - Role yang diperlukan
 * @param {Array<string>} props.roles - Array role yang diperlukan (salah satu harus cocok)
 * @param {React.ReactNode} props.fallback - Komponen yang ditampilkan jika akses ditolak
 */
export const RoleChecker = ({ children, role, roles, fallback = null }) => {
  if (!isLoggedIn()) {
    return fallback;
  }

  if (role && !hasRole(role)) {
    return fallback;
  }

  if (roles && !hasAnyRole(roles)) {
    return fallback;
  }

  return children;
};

// Komponen khusus untuk Koor only content
export const KoorOnly = ({ children, fallback = null }) => (
  <RoleChecker role="koordinator" fallback={fallback}>
    {children}
  </RoleChecker>
);

// Komponen khusus untuk teknisi + admin content
export const TeknisiAccess = ({ children, fallback = null }) => (
  <RoleChecker roles={["koordinator", "teknisi"]} fallback={fallback}>
    {children}
  </RoleChecker>
);

// Komponen khusus untuk kepala + admin content
export const KepalaAccess = ({ children, fallback = null }) => (
  <RoleChecker roles={["koordinator", "kepala"]} fallback={fallback}>
    {children}
  </RoleChecker>
);

// Komponen khusus untuk klien content
export const KlienOnly = ({ children, fallback = null }) => (
  <RoleChecker role="klien" fallback={fallback}>
    {children}
  </RoleChecker>
);

// Hook untuk menggunakan role checking dalam functional components
export const useRoleAccess = () => {
  return {
    isLoggedIn: isLoggedIn(),
    isKoor: isKoor(),
    isTeknisi: isTeknisi(),
    isKepala: isKepala(),
    isKlien: isKlien(),
    hasRole,
    hasAnyRole,
    canAccessAdminPage: canAccessAdminPage(),
    canAccessTeknisiPage: canAccessTeknisiPage(),
    canAccessKepalaPage: canAccessKepalaPage(),
    canAccessKlienPage: canAccessKlienPage(),
  };
};

export default RoleChecker;
