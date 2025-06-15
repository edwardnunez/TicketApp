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
  Skeleton,
  Alert,
  Modal
} from "antd";
import { 
  UserOutlined, 
  MailOutlined, 
  LockOutlined, 
  SaveOutlined,
  ArrowLeftOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  SecurityScanOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import axios from "axios";

// Importamos el esquema de colores
import { COLORS } from "../components/colorscheme";

const { Content } = Layout;
const { Text } = Typography;

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
  const [passwordForm] = Form.useForm();
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);
  const [showAvatarSelection, setShowAvatarSelection] = useState(false);
  const [userData, setUserData] = useState({ name: "", surname: "", email: "", username: "" });
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileError, setProfileError] = useState({});
  const [passwordError, setPasswordError] = useState({});
  
  // Estado para el modal de confirmación
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingPasswordValues, setPendingPasswordValues] = useState(null);

  const navigate = useNavigate();
  
  const gatewayUrl = process.env.REACT_API_ENDPOINT || "http://localhost:8000";
  
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  // Validar formato de email
  const validateEmailFormat = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

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
              surname: u.surname || "", // Incluir surname
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

  // Manejar actualización de perfil (sin contraseña)
  const handleProfileSubmit = (values) => {
    setProfileError({});
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
        
        if (err.response?.data) {
          const { error: errorMessage, field } = err.response.data;
          setProfileError({ 
            field: field || "general", 
            message: errorMessage || "No se pudo actualizar el perfil." 
          });
        } else {
          message.error("No se pudo actualizar el perfil.");
        }
      });
  };

  // Función para ejecutar el cambio de contraseña
  const executePasswordChange = (values) => {
    setPasswordError({});
    setPasswordLoading(true);
    
    const passwordData = {
      currentPassword: values.currentPassword,
      password: values.newPassword
    };

    axios
      .put(gatewayUrl + `/edit-user/${userId}`, passwordData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        message.success("¡Contraseña actualizada correctamente!");
        passwordForm.resetFields();
        setShowPasswordModal(false);
        setPendingPasswordValues(null);
      })
      .catch((err) => {
        console.error("Error al actualizar la contraseña:", err);
        
        if (err.response?.data) {
          const { error: errorMessage, field } = err.response.data;
          setPasswordError({ 
            field: field || "general", 
            message: errorMessage || "No se pudo actualizar la contraseña." 
          });
        } else {
          setPasswordError({ 
            field: "general", 
            message: "No se pudo actualizar la contraseña." 
          });
        }
      })
      .finally(() => {
        setPasswordLoading(false);
      });
  };

  // Manejar cambio de contraseña con confirmación
  const handlePasswordSubmit = (values) => {
    setPendingPasswordValues(values);
    setShowPasswordModal(true);
  };

  // Confirmar cambio de contraseña
  const handleConfirmPasswordChange = () => {
    if (pendingPasswordValues) {
      executePasswordChange(pendingPasswordValues);
    }
  };

  // Cancelar cambio de contraseña
  const handleCancelPasswordChange = () => {
    setShowPasswordModal(false);
    setPendingPasswordValues(null);
    console.log('Cambio de contraseña cancelado');
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
          <Space direction="vertical" size={24} style={{ width: "100%" }}>
            {/* Card principal del perfil */}
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

                {/* Selección de Avatar */}
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
                  onFinish={handleProfileSubmit} 
                  initialValues={userData}
                  style={{ width: "100%", maxWidth: "400px" }}
                >
                  <Form.Item
                    name="username"
                    label={<Text style={{ color: COLORS.neutral.dark }}>Nombre de usuario</Text>}
                    initialValue={userData.username}
                    rules={[{ required: true, message: "¡Por favor, introduce tu nombre de usuario!" }]}
                    validateStatus={profileError.field === "username" ? "error" : ""}
                    help={profileError.field === "username" ? profileError.message : ""}
                  >
                    <Input 
                      prefix={<UserOutlined style={{ color: COLORS.neutral.grey4 }} />} 
                      placeholder={userData.username}
                      style={{ borderRadius: "6px" }}
                    />
                  </Form.Item>

                  <Form.Item
                    name="name"
                    label={<Text style={{ color: COLORS.neutral.dark }}>Nombre</Text>}
                    initialValue={userData.name}
                    rules={[{ required: true, message: "¡Por favor, introduce tu nombre!" }]}
                  >
                    <Input 
                      prefix={<UserOutlined style={{ color: COLORS.neutral.grey4 }} />} 
                      placeholder={userData.name} 
                      style={{ borderRadius: "6px" }}
                    />
                  </Form.Item>

                  {/* NUEVO CAMPO: Apellido */}
                  <Form.Item
                    name="surname"
                    label={<Text style={{ color: COLORS.neutral.dark }}>Apellido</Text>}
                    initialValue={userData.surname}
                    rules={[{ required: false }]} // Opcional, puedes cambiarlo a required: true si quieres que sea obligatorio
                  >
                    <Input 
                      prefix={<UserOutlined style={{ color: COLORS.neutral.grey4 }} />} 
                      placeholder={userData.surname || "Introduce tu apellido"} 
                      style={{ borderRadius: "6px" }}
                    />
                  </Form.Item>

                  <Form.Item
                    name="email"
                    label={<Text style={{ color: COLORS.neutral.dark }}>Correo electrónico</Text>}
                    initialValue={userData.email}
                    rules={[
                      { required: true, message: "Por favor ingresa tu email" },
                      {
                        validator: (_, value) => {
                          if (!value || validateEmailFormat(value)) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('Por favor ingresa un email válido'));
                        },
                      }
                    ]}
                    validateStatus={profileError.field === "email" ? "error" : ""}
                    help={profileError.field === "email" ? profileError.message : ""}
                  >
                    <Input 
                      prefix={<MailOutlined style={{ color: COLORS.neutral.grey4 }} />} 
                      placeholder={userData.email} 
                      style={{ borderRadius: "6px" }}
                    />
                  </Form.Item>

                  {profileError.field === "general" && (
                    <Alert
                      message="Error"
                      description={profileError.message}
                      type="error"
                      showIcon
                      style={{ marginBottom: "16px" }}
                    />
                  )}

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

            {/* Card separado para cambio de contraseña */}
            <Card
              title={
                <div style={{ display: "flex", alignItems: "center" }}>
                  <SecurityScanOutlined style={{ color: COLORS.status.warning, marginRight: "8px" }} />
                  <span style={{ color: COLORS.neutral.darker }}>Cambiar Contraseña</span>
                </div>
              }
              style={{
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                border: "none",
              }}
            >
              <Alert
                message="Seguridad de la contraseña"
                description="Tu contraseña debe tener al menos 8 caracteres, incluir al menos una letra mayúscula y un número."
                type="info"
                showIcon
                style={{ marginBottom: "24px" }}
              />

              <Form 
                layout="vertical" 
                form={passwordForm} 
                onFinish={handlePasswordSubmit}
                style={{ maxWidth: "400px", margin: "0 auto" }}
              >
                <Form.Item
                  name="currentPassword"
                  label={<Text style={{ color: COLORS.neutral.dark }}>Contraseña actual</Text>}
                  rules={[{ required: true, message: "¡Introduce tu contraseña actual!" }]}
                  validateStatus={passwordError.field === "currentPassword" ? "error" : ""}
                  help={passwordError.field === "currentPassword" ? passwordError.message : ""}
                >
                  <Input.Password 
                    prefix={<LockOutlined style={{ color: COLORS.neutral.grey4 }} />} 
                    placeholder="Contraseña actual" 
                    style={{ borderRadius: "6px" }}
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  />
                </Form.Item>

                <Form.Item
                  name="newPassword"
                  label={<Text style={{ color: COLORS.neutral.dark }}>Nueva contraseña</Text>}
                  rules={[
                    { required: true, message: "¡Introduce la nueva contraseña!" },
                    {
                      pattern: /^(?=.*[A-Z])(?=.*\d).{8,}$/,
                      message: "La contraseña debe tener al menos 8 caracteres, una letra mayúscula y un número",
                    }
                  ]}
                  validateStatus={passwordError.field === "password" ? "error" : ""}
                  help={passwordError.field === "password" ? passwordError.message : ""}
                >
                  <Input.Password 
                    prefix={<LockOutlined style={{ color: COLORS.neutral.grey4 }} />} 
                    placeholder="Nueva contraseña" 
                    style={{ borderRadius: "6px" }}
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  />
                </Form.Item>

                <Form.Item
                  name="confirmNewPassword"
                  label={<Text style={{ color: COLORS.neutral.dark }}>Confirmar nueva contraseña</Text>}
                  dependencies={['newPassword']}
                  rules={[
                    { required: true, message: "¡Confirma la nueva contraseña!" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('newPassword') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Las contraseñas no coinciden'));
                      },
                    }),
                  ]}
                >
                  <Input.Password 
                    prefix={<LockOutlined style={{ color: COLORS.neutral.grey4 }} />} 
                    placeholder="Confirmar nueva contraseña" 
                    style={{ borderRadius: "6px" }}
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  />
                </Form.Item>

                {passwordError.field === "general" && (
                  <Alert
                    message="Error"
                    description={passwordError.message}
                    type="error"
                    showIcon
                    style={{ marginBottom: "16px" }}
                  />
                )}

                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={passwordLoading}
                    icon={<LockOutlined />}
                    block
                    style={{ 
                      backgroundColor: COLORS.status.warning,
                      borderColor: COLORS.status.warning,
                      borderRadius: "6px",
                      height: "44px"
                    }}
                  >
                    Cambiar contraseña
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Space>
        )}

        {/* Modal de confirmación de cambio de contraseña */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ExclamationCircleOutlined style={{ color: COLORS.status.warning }} />
              <span>¿Estás seguro de que quieres cambiar tu contraseña?</span>
            </div>
          }
          open={showPasswordModal}
          onOk={handleConfirmPasswordChange}
          onCancel={handleCancelPasswordChange}
          okText="Sí, cambiar contraseña"
          cancelText="Cancelar"
          okType="primary"
          confirmLoading={passwordLoading}
          okButtonProps={{
            style: {
              backgroundColor: COLORS.status.warning,
              borderColor: COLORS.status.warning,
            }
          }}
          cancelButtonProps={{
            style: {
              borderColor: COLORS.neutral.grey3,
              color: COLORS.neutral.dark,
            }
          }}
          centered
          maskClosable={false}
          width={480}
        >
          <div style={{ marginTop: '16px' }}>
            <Text style={{ color: COLORS.neutral.dark }}>
              Esta acción cambiará tu contraseña actual. Asegúrate de recordar la nueva contraseña.
            </Text>
            <br />
            <br />
            <Text style={{ color: COLORS.neutral.grey4, fontSize: '14px' }}>
              Se cerrará tu sesión automáticamente en otros dispositivos por seguridad.
            </Text>
          </div>
        </Modal>
      </Content>
    </Layout>
  );
};

export default EditProfile;