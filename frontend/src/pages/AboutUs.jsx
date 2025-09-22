import React, { useState, useEffect } from "react";
import { 
  Table, 
  Layout, 
  Typography, 
  Button, 
  Card, 
  Row, 
  Col, 
  Space, 
  Avatar, 
  Divider
} from "antd";
import {
  useNavigate 
} from "react-router-dom";
import { 
  UserOutlined, 
  GithubOutlined, 
  MailOutlined, 
  HomeOutlined, 
  TeamOutlined,
  IdcardOutlined
} from "@ant-design/icons";

import { COLORS } from "../components/colorscheme";

const { Title, Paragraph, Text } = Typography;
const { Content } = Layout;

const AboutUs = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const teamMembers = [
    {
      key: "1",
      name: "Iyán Fernández Riol",
      UO: "UO288231",
      email: "uo288231@uniovi.es",
      github: "iyanfdezz",
      githubUrl: "https://github.com/iyanfdezz",
      avatar: null
    },
    {
      key: "2",
      name: "Edward Rolando Núñez Álvarez",
      UO: "-",
      email: "nunezedward@uniovi.es",
      github: "edwardnunez",
      githubUrl: "https://github.com/edwardnunez",
      avatar: null
    },
    {
      key: "3",
      name: "Xiomarah María Guzmán Guzmán",
      UO: "-",
      email: "guzmanxiomarah@uniovi.es",
      github: "tutor2",
      githubUrl: "https://github.com/tutor2",
      avatar: null
    }
  ];

  const columns = [
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Space>
          <Avatar 
            icon={<UserOutlined />} 
            style={{ 
              backgroundColor: COLORS?.primary?.main || "#1890ff",
              color: "#fff"
            }} 
            src={record.avatar} 
          />
          <span>{text}</span>
        </Space>
      )
    },
    {
      title: "UO",
      dataIndex: "UO",
      key: "UO",
      responsive: ["md"]
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      responsive: ["lg"]
    },
    {
      title: "GitHub",
      dataIndex: "github",
      key: "github",
      render: (text, record) => (
        <a 
          href={record.githubUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ 
            color: COLORS?.primary?.main || "#1890ff",
            display: "flex",
            alignItems: "center" 
          }}
        >
          <GithubOutlined style={{ marginRight: 8 }} /> {text}
        </a>
      )
    }
  ];

  return (
    <Layout style={{ backgroundColor: COLORS?.neutral?.white || "#fff", minHeight: "100vh" }}>
      <Content>
        <div style={{ 
          background: COLORS?.gradients?.primary || "linear-gradient(135deg, #1890ff 0%, #722ed1 100%)",
          padding: isMobile ? "32px 8px" : "60px 20px",
          textAlign: "center",
          color: "#fff"
        }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <Title level={isMobile ? 2 : 1} style={{ color: "#fff", marginBottom: isMobile ? "8px" : "16px" }}>
              Nuestro equipo
            </Title>
            <Paragraph style={{ 
              fontSize: isMobile ? "15px" : "18px", 
              maxWidth: "700px", 
              margin: isMobile ? "0 auto 16px" : "0 auto 32px",
              color: "rgba(255, 255, 255, 0.85)"
            }}>
              Conozca a las personas detrás del desarrollo de esta plataforma de eventos.
            </Paragraph>
          </div>
        </div>

        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: isMobile ? "18px 4px" : "40px 20px" }}>
          <Card 
            className="team-card"
            style={{ 
              marginBottom: "40px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              borderRadius: "8px",
              border: "none"
            }}
          >
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <div style={{ textAlign: "center" }}>
                <TeamOutlined style={{ 
                  fontSize: "48px", 
                  color: COLORS?.primary?.main || "#1890ff", 
                  marginBottom: "16px" 
                }} />
                <Title level={3} style={{ 
                  color: COLORS?.neutral?.dark || "#262626",
                  marginTop: 0
                }}>
                  Acerca de nosotros
                </Title>
                <Paragraph style={{ 
                  color: COLORS?.neutral?.grey4 || "#8c8c8c",
                  fontSize: "16px"
                }}>
                  Somos un equipo dedicado al desarrollo de soluciones web innovadoras.
                  Nuestra plataforma de eventos está diseñada para proporcionar una experiencia
                  fluida y agradable para los usuarios que buscan descubrir y asistir a eventos.
                </Paragraph>
              </div>

              <Divider style={{ margin: "24px 0" }} />

              <div className="mobile-cards" style={{ display: "block", marginBottom: "24px" }}>
                <Row gutter={[24, 24]}>
                  {teamMembers.map(member => (
                    <Col xs={24} sm={12} md={8} key={member.key}>
                      <Card 
                        style={{ 
                          height: "100%", 
                          borderRadius: "8px",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                          border: "1px solid #f0f0f0"
                        }}
                        hoverable
                      >
                        <div style={{ textAlign: "center", marginBottom: "16px" }}>
                          <Avatar 
                            size={80} 
                            icon={<UserOutlined />} 
                            src={member.avatar}
                            style={{ 
                              backgroundColor: COLORS?.primary?.light || "#69c0ff",
                              marginBottom: "16px" 
                            }}
                          />
                          <Title level={4} style={{ margin: "8px 0" }}>
                            {member.name}
                          </Title>
                        </div>

                        <Space direction="vertical" size="small" style={{ width: "100%" }}>
                          {member.UO !== "-" && (
                            <div style={{ display: "flex", alignItems: "center" }}>
                              <IdcardOutlined style={{ marginRight: "8px", color: COLORS?.neutral?.grey4 || "#8c8c8c" }} />
                              <Text>{member.UO}</Text>
                            </div>
                          )}
                          
                          <div style={{ display: "flex", alignItems: "center" }}>
                            <MailOutlined style={{ marginRight: "8px", color: COLORS?.neutral?.grey4 || "#8c8c8c" }} />
                            <Text>{member.email}</Text>
                          </div>
                          
                          <div style={{ display: "flex", alignItems: "center" }}>
                            <GithubOutlined style={{ marginRight: "8px", color: COLORS?.neutral?.grey4 || "#8c8c8c" }} />
                            <a 
                              href={member.githubUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ color: COLORS?.primary?.main || "#1890ff" }}
                            >
                              {member.github}
                            </a>
                          </div>
                        </Space>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>

              <div className="desktop-table" style={{ overflowX: "auto" }}>
                <Table 
                  dataSource={teamMembers} 
                  columns={columns} 
                  pagination={false}
                  style={{ marginBottom: "24px" }}
                  className="team-table"
                  rowClassName={() => "team-table-row"}
                />
              </div>
            </Space>
          </Card>

          <div style={{ textAlign: "center", marginTop: "24px" }}>
            <Button 
              type="primary" 
              icon={<HomeOutlined />}
              onClick={() => navigate("/")}
              size="large"
              style={{
                backgroundColor: COLORS?.primary?.main || "#1890ff",
                borderColor: COLORS?.primary?.main || "#1890ff",
                height: "46px",
                borderRadius: "8px",
                boxShadow: "0 2px 0 rgba(0, 0, 0, 0.045)"
              }}
            >
              Volver al inicio
            </Button>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default AboutUs;