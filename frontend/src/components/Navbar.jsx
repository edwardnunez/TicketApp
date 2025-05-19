import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge, Avatar, Typography, Menu, Dropdown } from "antd";
import { UserOutlined, ShoppingCartOutlined, TagOutlined } from "@ant-design/icons";
import { COLORS } from "./colorscheme";

const { Title } = Typography;

const Navbar = () => {
  const [cartItems, setCartItems] = useState(3); // Ejemplo, deberías obtenerlo de estado real
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);


  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("roleToken");
    localStorage.removeItem("username");
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
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 64,
        boxShadow: "0 2px 8px #f0f1f2",
      }}
    >
      <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <TagOutlined
          style={{ fontSize: 24, color: COLORS.primary.main, transform: "rotate(-20deg)" }}
        />
        <Title level={4} style={{ margin: 0, color: COLORS.neutral.white, letterSpacing: "0.5px" }}>
          TicketApp
        </Title>
      </Link>

      <nav style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <Link to="/events" style={{ color: COLORS.neutral.white, fontWeight: "500" }}>
          Eventos
        </Link>
        <Link to="/admin" style={{ color: COLORS.neutral.white, fontWeight: "500" }}>
          Panel de administrador
        </Link>
        <Badge count={cartItems} size="small" style={{ backgroundColor: COLORS.primary.main }}>
          <ShoppingCartOutlined style={{ fontSize: 24, color: COLORS.neutral.white }} />
        </Badge>

        {isLoggedIn && (
          <Dropdown overlay={menu} placement="bottomRight" trigger={["click"]}>
            <Avatar
              icon={<UserOutlined />}
              style={{ backgroundColor: COLORS.primary.main, verticalAlign: "middle", cursor: "pointer" }}
            />
          </Dropdown>
        )}
      </nav>
    </header>
  );
};

export default Navbar;