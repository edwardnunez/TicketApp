import { useEffect, useState } from 'react';
import { Layout, Typography, Button, Row, Col, Table } from 'antd';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';

const { Content } = Layout;
const { Title } = Typography;

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const gatewayUrl = process.env.REACT_APP_API_ENDPOINT || "http://localhost:8000";

  useEffect(() => {
    // Load the existing events from the API.
    setLoading(true);
    axios.get(gatewayUrl + "/events")
      .then(res => {
        setEvents(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading events", err);
        setLoading(false);
      });
  }, [gatewayUrl]);

  const columns = [
    {
      title: 'Event Name',
      dataIndex: 'name',
    },
    {
      title: 'Date',
      dataIndex: 'date',
    },
    {
      title: 'Location',
      render: (text, record) => record.location?.name || 'Unknown', // Mostrar el nombre de la ubicación
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

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '40px' }}>
        <Title level={2}>Admin Dashboard</Title>
        
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
