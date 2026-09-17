import React from "react";
import { Modal, Button } from "react-bootstrap";
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle } from "react-icons/fa";

function CustomPopup({ show, onClose, title, message, type = "info", buttonText = "OK" }) {
  // type: "info", "success", "error"
  const getIcon = () => {
    switch (type) {
      case "success":
        return <FaCheckCircle size={48} className="text-success mb-3" />;
      case "error":
        return <FaExclamationCircle size={48} className="text-danger mb-3" />;
      default:
        return <FaInfoCircle size={48} className="text-primary mb-3" />;
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered backdrop="static" keyboard={false}>
      <Modal.Body className="text-center p-4" style={{ fontFamily: "Poppins, sans-serif" }}>
        {getIcon()}
        <h4 className="fw-bold mb-2">{title}</h4>
        <div className="mb-4 text-muted" style={{ fontSize: "1.05rem" }}>{message}</div>
        <Button variant="primary" onClick={onClose} style={{ borderRadius: "8px", fontWeight: "600", padding: "8px 32px" }}>
          {buttonText}
        </Button>
      </Modal.Body>
    </Modal>
  );
}

export default CustomPopup;
