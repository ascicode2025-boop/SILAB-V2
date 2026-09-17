import { useEffect, useRef } from "react";
import { logout, getToken } from "../services/AuthService";

/**
 * Custom Hook untuk Auto Logout
 * Akan logout otomatis setelah user tidak aktif selama waktu yang ditentukan
 * @param {number} timeoutMinutes - Durasi inaktivitas sebelum logout (default: 15 menit)
 * @param {function} onLogout - Callback function setelah logout
 */
export const useAutoLogout = (timeoutMinutes = 15, onLogout = null) => {
  const logoutTimerRef = useRef(null);
  const warningTimerRef = useRef(null);

  useEffect(() => {
    // Jika user tidak login, jangan setup auto logout
    if (!getToken()) {
      return;
    }

    const timeoutMs = timeoutMinutes * 60 * 1000;
    const warningTimeMs = (timeoutMinutes - 2) * 60 * 1000; // Warning 2 menit sebelum logout

    const resetTimer = () => {
      // Clear previous timers
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }

      // Set warning timer
      warningTimerRef.current = setTimeout(() => {
        console.warn("Auto logout akan terjadi dalam 2 menit");
        // Anda bisa tampilkan modal/toast warning di sini
      }, warningTimeMs);

      // Set logout timer
      logoutTimerRef.current = setTimeout(() => {
        console.log("User tidak aktif, melakukan auto logout...");
        logout();
        if (onLogout) {
          onLogout();
        }
        // Redirect ke login page
        window.location.href = "/login";
      }, timeoutMs);
    };

    // Event listener untuk user activity
    const handleActivity = () => {
      resetTimer();
    };

    // Monitor user activity
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keypress", handleActivity);
    window.addEventListener("click", handleActivity);
    window.addEventListener("scroll", handleActivity);
    window.addEventListener("touchstart", handleActivity);

    // Setup initial timer
    resetTimer();

    // Cleanup
    return () => {
      clearTimeout(logoutTimerRef.current);
      clearTimeout(warningTimerRef.current);
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keypress", handleActivity);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("scroll", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
    };
  }, [timeoutMinutes, onLogout]);
};
