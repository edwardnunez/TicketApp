import React from "react";
import { Link } from "react-router-dom";
import { Typography, Divider } from "antd";
import { TagOutlined } from "@ant-design/icons";
import { COLORS } from "./colorscheme";

const { Title, Paragraph, Text } = Typography;

const Footer = () => {
  return (
    <footer
      style={{
        background: COLORS.neutral.white,
        padding: "40px 24px",
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
          gap: 24,
        }}
      >
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <TagOutlined style={{ fontSize: 28, color: COLORS.primary.main }} />
          <Title level={3} style={{ margin: 0, color: COLORS.primary.main }}>
            TicketApp
          </Title>
        </Link>

        <Paragraph style={{ color: COLORS.neutral.grey4, maxWidth: 600, textAlign: "center" }}>
          La plataforma líder para la venta de entradas a eventos. Fácil, rápido y seguro.
        </Paragraph>

        <Divider style={{ margin: "24px 0" }} />

        <div style={{ display: "flex", gap: 16 }}>
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

        <Text style={{ color: COLORS.neutral.grey3, fontSize: 14 }}>
          © 2025 TicketApp. Todos los derechos reservados.
        </Text>
      </div>
    </footer>
  );
};

export default Footer;