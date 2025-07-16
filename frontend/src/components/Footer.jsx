import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Typography, Divider } from "antd";
import { TagOutlined } from "@ant-design/icons";
import { COLORS } from "./colorscheme";

const { Title, Paragraph, Text } = Typography;

const Footer = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <footer
      style={{
        background: COLORS.neutral.white,
        padding: isMobile ? "24px 8px" : "40px 24px",
        borderTop: `1px solid ${COLORS.neutral.grey2}`,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: isMobile ? 12 : 24,
        }}
      >
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <TagOutlined style={{ fontSize: isMobile ? 22 : 28, color: COLORS.primary.main }} />
          <Title level={isMobile ? 4 : 3} style={{ margin: 0, color: COLORS.primary.main }}>
            TicketApp
          </Title>
        </Link>

        <Paragraph style={{ color: COLORS.neutral.grey4, maxWidth: 600, textAlign: "center", fontSize: isMobile ? 13 : undefined }}>
          La plataforma líder para la venta de entradas a eventos. Fácil, rápido y seguro.
        </Paragraph>

        <Divider style={{ margin: isMobile ? "16px 0" : "24px 0" }} />

        <div style={{ display: "flex", gap: isMobile ? 8 : 16, flexDirection: isMobile ? "column" : "row", alignItems: "center" }}>
          <Link to="/about-us" style={{ color: COLORS.primary.main, fontWeight: "500" }}>
            Sobre nosotros
          </Link>
          <Link to="/contact" style={{ color: COLORS.primary.main, fontWeight: "500" }}>
            Contacto
          </Link>
          <Link to="/terms" style={{ color: COLORS.primary.main, fontWeight: "500" }}>
            Términos y condiciones
          </Link>
        </div>

        <Text style={{ color: COLORS.neutral.grey3, fontSize: isMobile ? 12 : 14 }}>
          © 2025 TicketApp. Todos los derechos reservados.
        </Text>
      </div>
    </footer>
  );
};

export default Footer;