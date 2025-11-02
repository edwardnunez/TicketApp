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
  Modal,
  notification
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
  ExclamationCircleOutlined,
  CheckCircleOutlined
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
  "/avatars/avatar6.png",
];

/**
 * Edit profile page component for user profile management
 * @returns {JSX.Element} Profile editing form with avatar selection and password change
 */
const EditProfile = () => {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [showAvatarSelection, setShowAvatarSelection] = useState(false);
  const [userData, setUserData] = useState({ name: "", surname: "", email: "", username: "" });
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileError, setProfileError] = useState({});
  const [passwordError, setPasswordError] = useState({});
  
  // Estado para el modal de confirmación de contraseña
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingPasswordValues, setPendingPasswordValues] = useState(null);

  // Estado para el modal de confirmación de perfil
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [pendingProfileValues, setPendingProfileValues] = useState(null);
  const [updatedFieldsList, setUpdatedFieldsList] = useState([]);

  const navigate = useNavigate();
  
  const gatewayUrl = process.env.REACT_APP_API_ENDPOINT || "http://localhost:8000";
  
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Validar formato de email
  const validateEmailFormat = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Función para mostrar notificación de éxito personalizada
  const showSuccessNotification = (title, description, duration = 4) => {
    notification.success({
      message: title,
      description: description,
      icon: <CheckCircleOutlined style={{ color: COLORS.accent.green }} />,
      placement: 'topRight',
      duration: duration,
      style: {
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }
    });
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
            // Usar el avatar del usuario tal como está, sin asignar un valor por defecto
            // Si el usuario no tiene avatar (null), mantener null para que aparezca "Ninguno" seleccionado
            setSelectedAvatar(u.avatar ?? null);
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

  // Función para ejecutar la actualización del perfil
  const executeProfileUpdate = (values) => {
    setProfileError({});
    const updatedUser = { ...values, avatar: selectedAvatar };

    axios
      .put(gatewayUrl + `/edit-user/${userId}`, updatedUser, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        // Mostrar notificación de éxito detallada
        const fieldsText = updatedFieldsList.length > 0 
          ? `Se han actualizado: ${updatedFieldsList.join(', ')}.`
          : 'Perfil actualizado correctamente.';
        
        showSuccessNotification(
          '¡Perfil actualizado!',
          fieldsText + ' Los cambios se han guardado exitosamente.',
          5
        );

        if (values.username && values.username !== username) {
          localStorage.setItem("username", values.username);
        }

        setUserData({
          name: values.name,
          surname: values.surname,
          email: values.email,
          username: values.username,
        });

        setShowProfileModal(false);
        setPendingProfileValues(null);
        setUpdatedFieldsList([]);

        setTimeout(() => {
          navigate("/profile");
        }, 1500);
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

        // Cerrar modal en caso de error
        setShowProfileModal(false);
        setPendingProfileValues(null);
        setUpdatedFieldsList([]);
      });
  };

  // Manejar actualización de perfil (con confirmación)
  const handleProfileSubmit = (values) => {
    // Determinar qué campos se han actualizado
    const updatedFields = [];
    if (values.username !== userData.username) updatedFields.push('nombre de usuario');
    if (values.name !== userData.name) updatedFields.push('nombre');
    if (values.surname !== userData.surname) updatedFields.push('apellido');
    if (values.email !== userData.email) updatedFields.push('email');
    if (selectedAvatar !== userData.avatar) updatedFields.push('avatar');

    // Guardar los valores pendientes y mostrar modal
    setPendingProfileValues(values);
    setUpdatedFieldsList(updatedFields);
    setShowProfileModal(true);
  };

  // Confirmar cambios de perfil
  const handleConfirmProfileUpdate = () => {
    if (pendingProfileValues) {
      executeProfileUpdate(pendingProfileValues);
    }
  };

  // Cancelar cambios de perfil
  const handleCancelProfileUpdate = () => {
    setShowProfileModal(false);
    setPendingProfileValues(null);
    setUpdatedFieldsList([]);
    console.log('Actualización de perfil cancelada');
  };

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
        // Mostrar notificación de éxito para contraseña
        showSuccessNotification(
          '¡Contraseña actualizada!',
          'Tu contraseña se ha cambiado correctamente. Tu cuenta está ahora más segura.',
          6
        );
        
        passwordForm.resetFields();
        setShowPasswordModal(false);
        setPendingPasswordValues(null);

        // Redirigir a perfil después de un breve delay
        setTimeout(() => {
          navigate("/profile");
        }, 1500);
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

        // Cerrar modal en caso de error
        setShowPasswordModal(false);
        setPendingPasswordValues(null);
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
      <Content style={{ padding: isMobile ? "18px 4px" : "40px 20px" }}>
        <div style={{ maxWidth: isMobile ? "100%" : "700px", margin: "0 auto" }}>
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
                    <span style={{ color: COLORS.neutral.darker }}>Editar perfil</span>
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
                      icon={!selectedAvatar && <UserOutlined />}
                      style={{
                        border: `2px solid ${COLORS.primary.light}`,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        backgroundColor: !selectedAvatar ? COLORS.primary.light : undefined
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
                        <Space size={12} wrap>
                          {/* Opción "Ninguno" */}
                          <Radio value={null} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <Avatar
                              size={60}
                              icon={<UserOutlined />}
                              style={{
                                border: !selectedAvatar ? `2px solid ${COLORS.primary.main}` : "1px solid " + COLORS.neutral.grey3,
                                boxShadow: !selectedAvatar ? `0 0 0 2px ${COLORS.primary.light}` : "none",
                                transition: "all 0.2s ease",
                                backgroundColor: COLORS.primary.light
                              }}
                            />
                          </Radio>

                          {avatars.map((avatar, index) => (
                            <Radio key={index} value={avatar} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                              <Avatar
                                size={60}
                                src={avatar}
                                alt={`Avatar predefinido ${index + 1}`}
                                style={{
                                  border: selectedAvatar === avatar ? `2px solid ${COLORS.primary.main}` : "1px solid " + COLORS.neutral.grey3,
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
                      rules={[{ required: false }]}
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

              <Card
                title={
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <SecurityScanOutlined style={{ color: COLORS.accent.gold, marginRight: "8px" }} />
                    <span style={{ color: COLORS.neutral.grey800 }}>Cambiar contraseña</span>
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
                        backgroundColor: COLORS.accent.gold,
                        borderColor: COLORS.accent.gold,
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

          {/* Modal de confirmación de cambios de perfil */}
          <Modal
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircleOutlined style={{ color: COLORS.primary.main }} />
                <span>¿Confirmar los cambios en tu perfil?</span>
              </div>
            }
            open={showProfileModal}
            onOk={handleConfirmProfileUpdate}
            onCancel={handleCancelProfileUpdate}
            okText="Sí, guardar cambios"
            cancelText="Cancelar"
            okType="primary"
            okButtonProps={{
              style: {
                backgroundColor: COLORS.primary.main,
                borderColor: COLORS.primary.main,
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
                {updatedFieldsList.length > 0 ? (
                  <>
                    Se actualizarán los siguientes campos: <strong>{updatedFieldsList.join(', ')}</strong>.
                  </>
                ) : (
                  'Se guardará la información de tu perfil.'
                )}
              </Text>
              <br />
              <br />
              <Text style={{ color: COLORS.neutral.grey4, fontSize: '14px' }}>
                Una vez confirmado, serás redirigido a tu perfil para ver los cambios.
              </Text>
            </div>
          </Modal>

          {/* Modal de confirmación de cambio de contraseña */}
          <Modal
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ExclamationCircleOutlined style={{ color: COLORS.accent.gold }} />
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
                backgroundColor: COLORS.accent.gold,
                borderColor: COLORS.accent.gold,
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
        </div>
      </Content>
    </Layout>
  );
};

export default EditProfile;