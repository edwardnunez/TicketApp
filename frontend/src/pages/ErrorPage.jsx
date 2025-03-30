// ErrorPage.jsx
import React from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", padding: "50px", backgroundColor: "#f0f2f5" }}>
      <h1 style={{ color: "#ff4d4f" }}>Oops! Page Not Found.</h1>
      <p>The page you are looking for does not exist.</p>
      <Button type="primary" onClick={() => navigate("/")} style={{ marginTop: "20px" }}>
        Go to Home
      </Button>
    </div>
  );
};

export default ErrorPage;
