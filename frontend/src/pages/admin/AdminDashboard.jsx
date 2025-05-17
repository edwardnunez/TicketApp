import { useEffect, useState } from 'react';
import { Layout, Typography, Button, Row, Col, Table, Alert } from 'antd';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';

const { Content } = Layout;
const { Title } = Typography;

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null); // estado para errores
  const gatewayUrl = process.env.REACT_APP_API_ENDPOINT || "http://localhost:8000";

  useEffect(() => {
    setLoading(true);
    setErrorMessage(null); // limpia error previo
    axios.get(gatewayUrl + "/events")
      .then(res => {
        setEvents(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading events", err);
        setErrorMessage("Failed to load events. Please try again.");
        setLoading(false);
      });
  }, [gatewayUrl]);

  const columns = [
    {
      title: 'Event name',
      dataIndex: 'name',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: 'Location',
      render: (text, record) => record.location?.name || 'Unknown',
    },
    {
      title: 'Actions',
      render: (text, record) => (
        <Button type="primary">
          <Link to={`/event/${record._id}`}>View Details</Link>
        </Button>
      ),
    },
  ];

  console.log("Eventos en estado:", events);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '40px' }}>
        <Title level={2}>Admin Dashboard</Title>

        {errorMessage && (
          <Alert
            message="Error"
            description={errorMessage}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        <Row justify="space-between" style={{ marginBottom: '20px' }}>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => window.location.href = '/create-event'}
            >
              Create new event
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={events}
          rowKey="_id"
          loading={loading}
        />
      </Content>
    </Layout>
  );
};

export default AdminDashboard;

