import React from 'react';
import { Layout, Row, Col, Typography } from 'antd';
import { Link } from 'react-router-dom';

const { Text } = Typography;

const Footer = () => {
  return (
    <Layout.Footer style={{ backgroundColor: '#f0f2f5', padding: '20px 0', marginTop: 'auto' }}>
      <Row justify="center" align="middle">
        <Col xs={24} sm={12} md={8} style={{ textAlign: 'center' }}>
          <Link to="/about-us">
            <Text strong style={{ fontSize: '16px' }}>About us</Text>
          </Link>
        </Col>

        <Col xs={24} sm={12} md={8} style={{ textAlign: 'center' }}>
          <Text style={{ fontSize: '20px', fontWeight: 'bold' }}>TicketApp</Text>
          <p style={{ marginTop: '10px', color: '#888' }}>© 2025 TicketApp. All rights reserved.</p>
        </Col>
      </Row>
    </Layout.Footer>
  );
};

export default Footer;

