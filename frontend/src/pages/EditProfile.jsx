import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Layout, 
  Typography, 
  Form, 
  Input, 
  Button, 
  Avatar, 
  message, 
  Radio, 
  Space, 
  Card,
  Divider,
  Tooltip,
  Skeleton
} from "antd";
import { 
  UserOutlined, 
  MailOutlined, 
  LockOutlined, 
  SaveOutlined,
  ArrowLeftOutlined
} from "@ant-design/icons";
import axios from "axios";

// Importamos el esquema de colores
import { COLORS } from "../components/colorscheme";

const { Content } = Layout;
const { Title, Text } = Typography;

// Avatares predefinidos
const avatars = [
  "/avatars/avatar1.png",
  "/avatars/avatar2.png",
  "/avatars/avatar3.png",
  "/avatars/avatar4.png",
  "/avatars/avatar5.png",
];

const EditProfile = () => {
  const [form] = Form.useForm();
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]); // Avatar predeterminado
  const [showAvatarSelection, setShowAvatarSelection] = useState(false); // Alternar selección de avatares
  const [userData, setUserData] = useState({ name: "", email: "", username: "" });
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  
  const gatewayUrl = process.env.REACT_API_ENDPOINT || "http://localhost:8000";
  
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  // Obtener datos del usuario al montar el componente
  useEffect(() => {
    if (username && token) {
      setLoading(true);
      axios
        .get(gatewayUrl + `/users`)
        .then((res) => {
          const u = res.data.find((u) => u.username === username);
  
          if (u) {
            setUserData({
              name: u.name,
              email: u.email,
              username: u.username,
            });
            setUserId(u._id);
            setSelectedAvatar(u.avatar || avatars[0]);
          } else {
            message.error("Usuario no encontrado.");
          }
        })
        .catch((err) => {
          console.error("Error al obtener datos del usuario:", err);
          message.error("No se pudieron cargar los datos del usuario.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [username, token, gatewayUrl]);

  // Manejar selección de avatar
  const handleAvatarChange = (e) => {
    setSelectedAvatar(e.target.value);
  };

const handleSubmit = (values) => {
  const updatedUser = { ...values, avatar: selectedAvatar };

  axios
    .put(gatewayUrl + `/edit-user/${userId}`, updatedUser, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => {
      message.success("¡Perfil actualizado correctamente!");

      if (values.username && values.username !== username) {
        localStorage.setItem("username", values.username);
      }

      navigate("/profile");
    })
    .catch((err) => {
      console.error("Error al actualizar el perfil:", err);
      message.error("No se pudo actualizar el perfil.");
    });
};

  return (
    <Layout style={{ backgroundColor: COLORS.neutral.grey1, minHeight: "100vh" }}>
      <Content style={{ maxWidth: "800px", margin: "40px auto", padding: "0 20px" }}>
        {loading ? (
          <Card 
            style={{ 
              borderRadius: "12px", 
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              border: "none"
            }}
          >
            <Skeleton active avatar={{ size: 100, shape: "circle" }} paragraph={{ rows: 4 }} />
          </Card>
        ) : (
          <Card
            title={
              <div style={{ display: "flex", alignItems: "center" }}>
                <Tooltip title="Volver al Perfil">
                  <Link to="/profile" style={{ color: COLORS.neutral.darker, marginRight: "12px" }}>
                    <ArrowLeftOutlined />
                  </Link>
                </Tooltip>
                <span style={{ color: COLORS.neutral.darker }}>Editar Perfil</span>
              </div>
            }
            style={{
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              border: "none",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              {/* Sección de Avatar */}
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <Avatar 
                  size={100} 
                  src={selectedAvatar} 
                  style={{
                    border: `2px solid ${COLORS.primary.light}`,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                  }}
                />
                <br />
                <Button 
                  type="link" 
                  onClick={() => setShowAvatarSelection(!showAvatarSelection)}
                  style={{ color: COLORS.primary.main, marginTop: "8px" }}
                >
                  {showAvatarSelection ? "Ocultar Avatares" : "Elegir un Avatar"}
                </Button>
              </div>

              {/* Selección de Avatar (Oculta hasta que se hace clic en el botón) */}
              {showAvatarSelection && (
                <div style={{ textAlign: "center", marginBottom: "24px" }}>
                  <Radio.Group value={selectedAvatar} onChange={handleAvatarChange}>
                    <Space size={12}>
                      {avatars.map((avatar, index) => (
                        <Radio key={index} value={avatar} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                          <Avatar 
                            size={60} 
                            src={avatar} 
                            style={{
                              border: selectedAvatar === avatar ? `2px solid ${COLORS.primary.main}` : "none",
                              boxShadow: selectedAvatar === avatar ? `0 0 0 2px ${COLORS.primary.light}` : "none",
                              transition: "all 0.2s ease"
                            }} 
                          />
                        </Radio>
                      ))}
                    </Space>
                  </Radio.Group>
                </div>
              )}
              
              <Divider style={{ margin: "0 0 24px" }} />

              {/* Formulario de edición de perfil */}
              <Form 
                layout="vertical" 
                form={form} 
                onFinish={handleSubmit} 
                initialValues={userData}
                style={{ width: "100%", maxWidth: "400px" }}
              >
                <Form.Item
                  name="username"
                  label={<Text style={{ color: COLORS.neutral.dark }}>Nombre de usuario</Text>}
                  initialValue={userData.username}
                  rules={[{ required: true, message: "¡Por favor, introduce tu nombre de usuario!" }]}
                >
                  <Input 
                    prefix={<UserOutlined style={{ color: COLORS.neutral.grey4 }} />} 
                    placeholder={userData.username}
                    style={{ borderRadius: "6px" }}
                  />
                </Form.Item>

                <Form.Item
                  name="name"
                  label={<Text style={{ color: COLORS.neutral.dark }}>Nombre completo</Text>}
                  initialValue={userData.name}
                  rules={[{ required: true, message: "¡Por favor, introduce tu nombre!" }]}
                >
                  <Input 
                    prefix={<UserOutlined style={{ color: COLORS.neutral.grey4 }} />} 
                    placeholder={userData.name} 
                    style={{ borderRadius: "6px" }}
                  />
                </Form.Item>

                <Form.Item
                  name="email"
                  label={<Text style={{ color: COLORS.neutral.dark }}>Correo electrónico</Text>}
                  initialValue={userData.email}
                  rules={[{ required: true, type: "email", message: "¡Por favor, introduce un correo electrónico válido!" }]}
                >
                  <Input 
                    prefix={<MailOutlined style={{ color: COLORS.neutral.grey4 }} />} 
                    placeholder={userData.email} 
                    style={{ borderRadius: "6px" }}
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label={<Text style={{ color: COLORS.neutral.dark }}>Nueva contraseña</Text>}
                  rules={[{ min: 6, message: "¡La contraseña debe tener al menos 6 caracteres!" }]}
                >
                  <Input.Password 
                    prefix={<LockOutlined style={{ color: COLORS.neutral.grey4 }} />} 
                    placeholder="Introduce nueva contraseña" 
                    style={{ borderRadius: "6px" }}
                  />
                </Form.Item>

                <Form.Item style={{ marginTop: "24px" }}>
                  <Space>
                    <Link to="/profile">
                      <Button 
                        style={{ 
                          borderRadius: "6px",
                          boxShadow: "0 2px 0 rgba(0, 0, 0, 0.045)"
                        }}
                      >
                        Cancelar
                      </Button>
                    </Link>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      icon={<SaveOutlined />}
                      style={{ 
                        backgroundColor: COLORS.primary.main,
                        borderColor: COLORS.primary.main,
                        borderRadius: "6px",
                        boxShadow: "0 2px 0 rgba(0, 0, 0, 0.045)"
                      }}
                    >
                      Guardar cambios
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </div>
          </Card>
        )}
      </Content>
    </Layout>
  );
};

export default EditProfile;