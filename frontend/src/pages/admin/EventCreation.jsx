import { useState, useEffect } from 'react';
import { Layout, Form, Input, Button, DatePicker, Select, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Content } = Layout;
const { Option } = Select;

const EventCreation = () => {
  const [loading, setLoading] = useState(false);
  const [eventType, setEventType] = useState(null);
  const [locations, setLocations] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const navigate = useNavigate();
  const gatewayUrl = process.env.REACT_APP_API_ENDPOINT || "http://localhost:8000";

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get(gatewayUrl + "/locations"); 
        setLocations(response.data);
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };
    fetchLocations();
  }, [gatewayUrl]);

  // Filtra las localizaciones según el tipo de evento
  useEffect(() => {
    if (eventType) {
      const filteredLocations = locations.filter(location => {
        // Filtra según el tipo de evento
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
    }
  }, [eventType, locations]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await axios.post(gatewayUrl + "/event", values);
      message.success('Event created successfully');
      navigate('/admin');
    } catch (error) {
      console.error("Error creating the event:", error);
      message.error('There was an error creating the event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '40px' }}>
        <h2>Create Event</h2>

        <Form
          name="create_event"
          onFinish={onFinish}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
        >
          <Form.Item
            label="Event Name"
            name="name"
            rules={[{ required: true, message: 'Please enter the event name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Date"
            name="date"
            rules={[{ required: true, message: 'Please select the event date' }]}
          >
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Event Type"
            name="eventType"
            rules={[{ required: true, message: 'Please select the event type' }]}
          >
            <Select
              placeholder="Select event type"
              onChange={(value) => setEventType(value)}
            >
              <Option value="football">Football</Option>
              <Option value="cinema">Cinema</Option>
              <Option value="concert">Concert</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Location"
            name="location"
            rules={[{ required: true, message: 'Please select the event location' }]}
          >
            <Select placeholder="Select location">
              {locationOptions.map((location) => (
                <Option key={location.id} value={location.name}>
                  {location.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }}>
              Create Event
            </Button>
          </Form.Item>
        </Form>
      </Content>
    </Layout>
  );
};

export default EventCreation;
