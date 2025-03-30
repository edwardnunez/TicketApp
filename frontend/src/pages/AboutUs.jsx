import React from 'react';
import { Table, Layout, Typography, Button } from 'antd';
import { Link } from 'react-router-dom';  // Para redirigir a otra página

const { Title } = Typography;

const AboutUs = () => {
  const dataSource = [
    {
      key: '1',
      name: 'Iyán Fernández Riol',
      UO: 'UO288231',
      email: 'uo288231@uniovi.es',
      github: <a href="https://github.com/iyanfdezz" target="_blank" rel="noopener noreferrer">iyanfdezz</a>,
    },
    {
      key: '2',
      name: 'Edward Rolando Núñez Álvarez',
      UO: '-',
      email: 'nunezedward@uniovi.es',
      github: <a href="https://github.com/edwardnunez" target="_blank" rel="noopener noreferrer">edwardnunez</a>,
    },
    {
      key: '3',
      name: 'Xiomarah María Guzmán Guzmán',
      UO: '-',
      email: 'guzmanxiomarah@uniovi.es',
      github: <a href="https://github.com/tutor2" target="_blank" rel="noopener noreferrer">GitHub</a>,
    }
  ];

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'UO',
      dataIndex: 'UO',
      key: 'UO',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'GitHub',
      dataIndex: 'github',
      key: 'github',
    },
  ];

  return (
    <Layout style={{ padding: '20px' }}>
      <Title level={2} style={{ textAlign: 'center' }}>About us</Title>
      <Table dataSource={dataSource} columns={columns} pagination={false} />
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <Link to="/">
          <Button type="primary">Back to home</Button>
        </Link>
      </div>
    </Layout>
  );
};

export default AboutUs;
