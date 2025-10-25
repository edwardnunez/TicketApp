import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, Typography, Dropdown } from "antd";
import { UserOutlined, TagOutlined, BarChartOutlined, QuestionCircleOutlined, DashboardOutlined, LoginOutlined, UserAddOutlined } from "@ant-design/icons";
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
    // Función para actualizar el estado de login
    const updateLoginState = () => {
      ensureAuthFreshness();
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
      scheduleAuthExpiryTimer();
    };

    // Ejecutar al montar
    updateLoginState();

    // Escuchar cambios en la autenticación
    window.addEventListener('authChange', updateLoginState);

    return () => {
      window.removeEventListener('authChange', updateLoginState);
    };
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

  const menuItems = [
    {
      key: 'profile',
      label: <Link to="/profile" data-cy="profile-link">Perfil</Link>,
    },
    {
      key: 'logout',
      label: <span data-cy="logout-button">Cerrar sesión</span>,
      onClick: handleLogout,
    },
  ];

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
        <Title level={isMobile ? 5 : 4} style={{ margin: 0, color: COLORS.neutral.white, letterSpacing: "0.5px", fontSize: isMobile ? "0.9rem" : undefined, whiteSpace: "nowrap" }}>
          TicketApp
        </Title>
      </Link>

      <nav style={{ display: "flex", alignItems: "center", gap: isMobile ? 12 : 24 }}>
        <Link to="/" data-cy="home-link" style={{ color: COLORS.neutral.white, fontWeight: "500", fontSize: isMobile ? 13 : undefined }}>
          Eventos
        </Link>

        {/* Opciones para todos los usuarios autenticados */}
        {isLoggedIn && (
          <Link to="/help" data-cy="help-link" style={{ color: COLORS.neutral.white, fontWeight: "500", fontSize: isMobile ? 13 : undefined, display: 'flex', alignItems: 'center', gap: 4 }}>
            <QuestionCircleOutlined />
            {!isMobile && <span>Ayuda</span>}
          </Link>
        )}

        {/* Opciones exclusivas para administradores */}
        {isLoggedIn && isAdmin && !isLoading && (
          <>
            <Link to="/admin" data-cy="admin-link" style={{ color: COLORS.neutral.white, fontWeight: "500", fontSize: isMobile ? 13 : undefined, display: 'flex', alignItems: 'center', gap: 4 }}>
              <DashboardOutlined />
              {!isMobile && <span>Panel de administrador</span>}
            </Link>
            <Link to="/admin/statistics" data-cy="statistics-link" style={{ color: COLORS.neutral.white, fontWeight: "500", fontSize: isMobile ? 13 : undefined, display: 'flex', alignItems: 'center', gap: 4 }}>
              <BarChartOutlined />
              {!isMobile && <span>Estadísticas</span>}
            </Link>
          </>
        )}

        {/* Opciones para usuarios sin sesión activa */}
        {!isLoggedIn && (
          <>
            <Link to="/login" data-cy="login-link" style={{ color: COLORS.neutral.white, fontWeight: "500", fontSize: isMobile ? 13 : undefined, display: 'flex', alignItems: 'center', gap: 4 }}>
              <LoginOutlined />
              {!isMobile && <span>Iniciar sesión</span>}
            </Link>
            <Link to="/register" data-cy="register-link" style={{ color: COLORS.neutral.white, fontWeight: "500", fontSize: isMobile ? 13 : undefined, display: 'flex', alignItems: 'center', gap: 4 }}>
              <UserAddOutlined />
              {!isMobile && <span>Registrarse</span>}
            </Link>
          </>
        )}

        {isLoggedIn && (
          <Dropdown menu={{ items: menuItems }} placement="bottomRight" trigger={["click"]}>
            <Avatar
              data-cy="user-menu"
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