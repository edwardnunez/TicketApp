import { Link, useNavigate } from "react-router-dom"; // Importa useNavigate
import { Layout, Menu, Button, Avatar, Dropdown } from "antd";
import { ShoppingCartOutlined, HomeOutlined, UserOutlined } from "@ant-design/icons";

const { Header } = Layout;

const menu = (handleLogout) => (
  <Menu>
    <Menu.Item key="profile">
      <Link to="/profile">👤 My profile</Link>
    </Menu.Item>
    <Menu.Item key="logout">
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          handleLogout();
        }}
      >
        🔒 Log out
      </a>
    </Menu.Item>
  </Menu>
);

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("roleToken");

    navigate("/login");
  };

  return (
    <Header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#1890ff" }}>

      <Link to="/" style={{ color: "white", fontSize: "1.5rem", fontWeight: "bold", textDecoration: "none" }}>
        🎟️ TicketApp
      </Link>

      <Menu theme="dark" mode="horizontal" selectable={false} style={{ flex: 1, justifyContent: "center", backgroundColor: "#1890ff" }}>
        <Menu.Item key="home" icon={<HomeOutlined />}>
          <Link to="/">Home</Link>
        </Menu.Item>

        <Menu.Item key="adminDashboard" icon={<UserOutlined />}>
          <Link to="/admin">Admin dashboard</Link>
        </Menu.Item>
      </Menu>

      {/* Profile Section */}
      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        {/* Shopping Cart Button */}
        <Link to="/checkout">
          <Button type="primary" icon={<ShoppingCartOutlined />} style={{ backgroundColor: "white", color: "#1890ff" }}>
            Cart
          </Button>
        </Link>

        <Dropdown overlay={menu(handleLogout)} placement="bottomRight">
          <Avatar size="large" icon={<UserOutlined />} style={{ cursor: "pointer", backgroundColor: "white", color: "#1890ff" }} />
        </Dropdown>
      </div>
    </Header>
  );
};

export default Navbar;