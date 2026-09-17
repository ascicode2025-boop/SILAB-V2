import React from "react";

const LoadingSpinner = ({ text = "Loading data..." }) => {
  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center"
    >
      <div
        className="spinner-border"
        role="status"
        style={{
          width: "3rem",
          height: "3rem",
          color: "#8D6E63",
        }}
      >
        <span className="visually-hidden">Loading...</span>
      </div>

      <p className="mt-3 text-muted fw-medium">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
