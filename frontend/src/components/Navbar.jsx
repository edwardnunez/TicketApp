import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, Typography, Menu, Dropdown } from "antd";
import { UserOutlined, TagOutlined, BarChartOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { COLORS } from "./colorscheme";
import { ensureAuthFreshness, scheduleAuthExpiryTimer, clearAuthSession } from "../utils/authSession";
import useUserRole from "../hooks/useUserRole";

const { Title } = Typography;

/**
 * Navigation bar component with user authentication and role-based menu items
 * @returns {JSX.Element} Navigation bar with logo, menu items, and user dropdown
 */
const Navbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { isAdmin, isLoading } = useUserRole();


  useEffect(() => {
    ensureAuthFreshness();
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    scheduleAuthExpiryTimer();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login");
  };

  const menu = (
    <Menu>
      <Menu.Item key="profile">
        <Link to="/profile">Perfil</Link>
      </Menu.Item>
      <Menu.Item key="logout" onClick={handleLogout}>
        Cerrar sesión
      </Menu.Item>
    </Menu>
  );

  return (
    <header
      style={{
        background: COLORS.gradients.header,
        padding: isMobile ? "0 8px" : "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: isMobile ? 52 : 64,
        boxShadow: "0 2px 8px #f0f1f2",
      }}
    >
      <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <TagOutlined
          style={{ fontSize: isMobile ? 18 : 24, color: COLORS.primary.main, transform: "rotate(-20deg)" }}
        />
        <Title level={isMobile ? 5 : 4} style={{ margin: 0, color: COLORS.neutral.white, letterSpacing: "0.5px", fontSize: isMobile ? "1.1rem" : undefined }}>
          TicketApp
        </Title>
      </Link>

      <nav style={{ display: "flex", alignItems: "center", gap: isMobile ? 12 : 24 }}>
        <Link to="/" style={{ color: COLORS.neutral.white, fontWeight: "500", fontSize: isMobile ? 13 : undefined }}>
          Eventos
        </Link>
        
        {/* Opciones para todos los usuarios autenticados */}
        {isLoggedIn && (
          <Link to="/help" style={{ color: COLORS.neutral.white, fontWeight: "500", fontSize: isMobile ? 13 : undefined }}>
            <QuestionCircleOutlined style={{ marginRight: 4 }} />
            {!isMobile && "Ayuda"}
          </Link>
        )}

        {/* Opciones exclusivas para administradores */}
        {isLoggedIn && isAdmin && !isLoading && (
          <>
            <Link to="/admin" style={{ color: COLORS.neutral.white, fontWeight: "500", fontSize: isMobile ? 13 : undefined }}>
              Panel de administrador
            </Link>
            <Link to="/admin/statistics" style={{ color: COLORS.neutral.white, fontWeight: "500", fontSize: isMobile ? 13 : undefined }}>
              <BarChartOutlined style={{ marginRight: 4 }} />
              {!isMobile && "Estadísticas"}
            </Link>
          </>
        )}

        {isLoggedIn && (
          <Dropdown overlay={menu} placement="bottomRight" trigger={["click"]}>
            <Avatar
              icon={<UserOutlined />}
              style={{ backgroundColor: COLORS.primary.main, verticalAlign: "middle", cursor: "pointer", width: isMobile ? 28 : 32, height: isMobile ? 28 : 32, fontSize: isMobile ? 16 : 20 }}
            />
          </Dropdown>
        )}
      </nav>
    </header>
  );
};

export default Navbar;