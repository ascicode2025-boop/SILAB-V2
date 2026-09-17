import React from "react";
import { Modal, Button } from "react-bootstrap";

function ConfirmModal({ show, title = "Konfirmasi", message = "Apakah Anda yakin?", onConfirm, onCancel, confirmText = "Ya", cancelText = "Batal" }) {
  return (
    <Modal show={show} onHide={onCancel} centered backdrop="static" keyboard={false}>
      <Modal.Body className="text-center p-4" style={{ fontFamily: "Poppins, sans-serif" }}>
        <h5 className="fw-bold mb-2">{title}</h5>
        <div className="mb-4 text-muted">{message}</div>
        <div className="d-flex justify-content-center gap-2">
          <Button variant="secondary" onClick={onCancel} style={{ borderRadius: 8 }}>
            {cancelText}
          </Button>
          <Button variant="danger" onClick={onConfirm} style={{ borderRadius: 8 }}>
            {confirmText}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default ConfirmModal;
