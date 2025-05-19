import { useState, useEffect } from 'react';
import { 
  Layout, 
  Form, 
  Input, 
  Button, 
  DatePicker, 
  Select, 
  message, 
  Alert,
  Card,
  Row,
  Col,
  Typography,
  Space,
  Divider,
  Breadcrumb,
  Tooltip,
  Tag
} from 'antd';
import { 
  CalendarOutlined, 
  EnvironmentOutlined, 
  TagOutlined, 
  SaveOutlined,
  ArrowLeftOutlined,
  InfoCircleOutlined,
  AppstoreOutlined,
  FormOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';

// Importamos el esquema de colores (asumiendo que está disponible)
import { COLORS } from "../../components/colorscheme";

const { Content } = Layout;
const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

const EventCreation = () => {
  const [loading, setLoading] = useState(false);
  const [eventType, setEventType] = useState(null);
  const [locations, setLocations] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const gatewayUrl = process.env.REACT_APP_API_ENDPOINT || "http://localhost:8000";

  const categoryColors = {
    football: COLORS?.categories?.deportes || "#52c41a",
    cinema: COLORS?.categories?.cine || "#eb2f96",
    concert: COLORS?.categories?.conciertos || "#1890ff"
  };

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get(gatewayUrl + "/locations");
        setLocations(response.data);
      } catch (error) {
        console.error("Error fetching locations:", error);
        setErrorMessage("Failed to load locations");
      }
    };
    fetchLocations();
  }, [gatewayUrl]);

  useEffect(() => {
    if (eventType) {
      const filteredLocations = locations.filter(location => {
        if (eventType === 'football') {
          return location.category === 'stadium';
        } else if (eventType === 'cinema') {
          return location.category === 'cinema';
        } else if (eventType === 'concert') {
          return location.category === 'concert';
        }
        return false;
      });
      setLocationOptions(filteredLocations);
    } else {
      setLocationOptions(locations);
    }
  }, [eventType, locations]);

  const onFinish = async (values) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const payload = {
        name: values.name,
        date: values.date.valueOf(),
        location: values.location,
        eventType: values.eventType,
        description: values.description,
        capacity: values.capacity,
        price: values.price
      };
      await axios.post(gatewayUrl + "/event", payload);
      message.success({
        content: 'Event created successfully',
        icon: <CheckCircleOutlined style={{ color: COLORS?.status?.success || 'green' }} />
      });
      navigate('/admin');
    } catch (error) {
      console.error("Error creating the event:", error);
      if (error.response && error.response.data && error.response.data.error) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage('There was an error creating the event');
      }
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeLabel = (type) => {
    switch(type) {
      case 'football': return 'Football match';
      case 'cinema': return 'Cinema';
      case 'concert': return 'Concert';
      default: return type;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: COLORS?.neutral?.white || '#ffffff' }}>
      <Content style={{ padding: '40px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* Header with breadcrumb */}
          <Row style={{ marginBottom: '24px' }}>
            <Col span={24}>
              <Breadcrumb 
                items={[
                  { 
                    title: <Link to="/admin">Admin</Link> 
                  },
                  { 
                    title: 'Create Event' 
                  }
                ]}
                style={{ marginBottom: '8px' }}
              />
              <Title 
                level={2} 
                style={{ 
                  margin: 0, 
                  color: COLORS?.neutral?.darker || "#262626",
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <FormOutlined style={{ marginRight: '12px', color: COLORS?.primary?.main || "#1890ff" }} />
                Create New Event
              </Title>
              <Paragraph type="secondary" style={{ marginTop: '8px' }}>
                Fill in the details below to create a new event in the system
              </Paragraph>
            </Col>
          </Row>

          {errorMessage && (
            <Alert
              message="Error"
              description={errorMessage}
              type="error"
              showIcon
              icon={<CloseCircleOutlined />}
              style={{ marginBottom: 24, borderRadius: '6px' }}
              closable
            />
          )}

          <Card 
            style={{ 
              borderRadius: '8px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.07)'
            }}
          >
            <Form
              form={form}
              name="create_event"
              onFinish={onFinish}
              layout="vertical"
              requiredMark="optional"
              onValuesChange={() => setErrorMessage(null)}
              initialValues={{
                date: dayjs().add(2, 'day'),
              }}
            >
              <Row gutter={24}>
                <Col xs={24} md={16}>
                  <Form.Item
                    label="Event name"
                    name="name"
                    rules={[{ required: true, message: 'Please enter the event name' }]}
                  >
                    <Input 
                      placeholder="Enter event name" 
                      size="large" 
                      prefix={<AppstoreOutlined style={{ color: COLORS?.neutral?.grey3 || '#d9d9d9' }} />} 
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={8}>
                  <Form.Item
                    label="Event type"
                    name="eventType"
                    rules={[{ required: true, message: 'Please select the event type' }]}
                  >
                    <Select
                      placeholder="Select event type"
                      onChange={(value) => setEventType(value)}
                      size="large"
                      suffixIcon={<TagOutlined style={{ color: COLORS?.primary?.main || '#1890ff' }} />}
                    >
                      <Option value="football">
                        <Tag color={categoryColors.football} style={{ marginRight: '8px' }}>
                          Football
                        </Tag>
                        Football match
                      </Option>
                      <Option value="cinema">
                        <Tag color={categoryColors.cinema} style={{ marginRight: '8px' }}>
                          Cinema
                        </Tag>
                        Cinema
                      </Option>
                      <Option value="concert">
                        <Tag color={categoryColors.concert} style={{ marginRight: '8px' }}>
                          Concert
                        </Tag>
                        Concert
                      </Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Date and time"
                    name="date"
                    rules={[{ required: true, message: 'Please select the event date and time' }]}
                  >
                    <DatePicker 
                      showTime 
                      format="YYYY-MM-DD HH:mm"
                      style={{ width: '100%' }} 
                      size="large"
                      suffixIcon={<CalendarOutlined style={{ color: COLORS?.primary?.main || '#1890ff' }} />}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label="Location"
                    name="location"
                    rules={[{ required: true, message: 'Please select the event location' }]}
                  >
                    <Select 
                      placeholder="Select location"
                      size="large"
                      suffixIcon={<EnvironmentOutlined style={{ color: COLORS?.primary?.main || '#1890ff' }} />}
                      disabled={!eventType}
                      showSearch
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      notFoundContent={
                        !eventType ? 
                          <div style={{ textAlign: 'center', padding: '8px' }}>
                            <InfoCircleOutlined style={{ marginRight: '8px' }} />
                            Please select an event type first
                          </div> : 
                          <div style={{ textAlign: 'center', padding: '8px' }}>
                            No locations found
                          </div>
                      }
                    >
                      {locationOptions.map((location) => (
                        <Option key={location._id} value={location._id}>
                          {location.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col xs={24}>
                  <Form.Item
                    label="Description"
                    name="description"
                    rules={[{ required: true, message: 'Please enter event description' }]}
                  >
                    <Input.TextArea 
                      placeholder="Enter event description" 
                      autoSize={{ minRows: 4, maxRows: 6 }} 
                      showCount 
                      maxLength={500} 
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Capacity"
                    name="capacity"
                    rules={[
                      { required: true, message: 'Please enter the capacity' },
                      { type: 'number', min: 1, message: 'Capacity must be at least 1', transform: (value) => Number(value) }
                    ]}
                  >
                    <Input 
                      type="number" 
                      placeholder="Enter capacity" 
                      suffix={<span style={{ color: COLORS?.neutral?.grey3 || '#d9d9d9' }}>seats</span>} 
                    />
                  </Form.Item>
                </Col>
                
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Price"
                    name="price"
                    rules={[
                      { required: true, message: 'Please enter the price' },
                      { type: 'number', min: 0, message: 'Price must be at least 0', transform: (value) => Number(value) }
                    ]}
                  >
                    <Input 
                      type="number" Qp
                      placeholder="Enter price" 
                      prefix="€" 
                      suffix={
                        <Tooltip title="Base price per ticket">
                          <InfoCircleOutlined style={{ color: COLORS?.neutral?.grey3 || '#d9d9d9' }} />
                        </Tooltip>
                      } 
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              {/* Preview of selected event type */}
              {eventType && (
                <Row style={{ marginBottom: '24px' }}>
                  <Col span={24}>
                    <div style={{ 
                      padding: '16px', 
                      backgroundColor: `${categoryColors[eventType]}10`, 
                      borderRadius: '8px',
                      border: `1px solid ${categoryColors[eventType]}30`
                    }}>
                      <Space align="start">
                        <div style={{ 
                          backgroundColor: categoryColors[eventType], 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: COLORS?.neutral?.white || '#ffffff'
                        }}>
                          {eventType === 'football' && <i className="fas fa-futbol"></i>}
                          {eventType === 'cinema' && <i className="fas fa-film"></i>}
                          {eventType === 'concert' && <i className="fas fa-music"></i>}
                        </div>
                        <div>
                          <Text strong style={{ fontSize: '16px' }}>
                            Selected event type: {getEventTypeLabel(eventType)}
                          </Text>
                          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                            {eventType === 'football' && 'Football matches require stadium locations and have designated seating.'}
                            {eventType === 'cinema' && 'Cinema events require cinema locations and have limited capacity based on the screening room.'}
                            {eventType === 'concert' && 'Concerts can be held in various venues with either seated or standing arrangements.'}
                          </Paragraph>
                        </div>
                      </Space>
                    </div>
                  </Col>
                </Row>
              )}

              <Row gutter={16} justify="space-between">
                <Col>
                  <Button 
                    icon={<ArrowLeftOutlined />} 
                    onClick={() => navigate('/admin')}
                    style={{ borderRadius: '6px' }}
                  >
                    Cancel
                  </Button>
                </Col>
                <Col>
                  <Space>
                    <Button 
                      type="default" 
                      onClick={() => form.resetFields()}
                      style={{ borderRadius: '6px' }}
                    >
                      Reset
                    </Button>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={loading} 
                      icon={<SaveOutlined />}
                      style={{ 
                        backgroundColor: COLORS?.primary?.main || "#1890ff",
                        borderColor: COLORS?.primary?.main || "#1890ff",
                        borderRadius: '6px'
                      }}
                    >
                      Create Event
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Form>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default EventCreation;