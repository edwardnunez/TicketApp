import { useState } from 'react';
import { Layout, Form, Input, Button, DatePicker, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Content } = Layout;

const EventCreation = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const gatewayUrl = process.env.REACT_APP_API_ENDPOINT || "http://localhost:8000";

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await axios.post(gatewayUrl + "/event", values);
      message.success('Event created successfully');
      navigate('/admin'); // Redirect to the admin dashboard after event creation
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
        <h2>Create event</h2>

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
            label="Location"
            name="location"
            rules={[{ required: true, message: 'Please enter the event location' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }}>
              Create event
            </Button>
          </Form.Item>
        </Form>
      </Content>
    </Layout>
  );
};

export default EventCreation;

