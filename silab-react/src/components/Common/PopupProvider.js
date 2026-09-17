import React, { useEffect, useState } from 'react';
import CustomPopup from './CustomPopup';

// Global popup provider: overrides window.alert to show our CustomPopup
export default function PopupProvider() {
  const [popup, setPopup] = useState({ show: false, title: '', message: '', type: 'info' });

  useEffect(() => {
    const originalAlert = window.alert;

    window.alert = (msg) => {
      setPopup({ show: true, title: '', message: String(msg || ''), type: 'info' });
    };

    // Expose helper to show success/error
    window.showAppPopup = ({ title = '', message = '', type = 'info' }) => {
      setPopup({ show: true, title, message, type });
    };

    return () => {
      window.alert = originalAlert;
      try { delete window.showAppPopup; } catch (e) {}
    };
  }, []);

  return (
    <CustomPopup
      show={popup.show}
      title={popup.title}
      message={popup.message}
      type={popup.type}
      onClose={() => setPopup((p) => ({ ...p, show: false }))}
    />
  );
}
