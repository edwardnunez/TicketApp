import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layout, Typography, Card, Row, Col, Button, DatePicker, Input, Divider, List } from "antd";
import { CalendarOutlined, EnvironmentOutlined, SearchOutlined } from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";

const { Content } = Layout;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const Home = () => {
  const [allEvents, setAllEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8000/events")
      .then((res) => {
        const events = res.data.map(event => ({
          ...event,
          date: dayjs(event.date).format("YYYY-MM-DD"),
          image: "/images/default.jpg" // O usa una lógica para decidir imágenes según el tipo
        }));
        setAllEvents(events);
        setFilteredEvents(events);
      })
      .catch((err) => console.error("Error loading events", err));
  }, []);

  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setFilteredEvents(
      allEvents.filter((event) => event.name.toLowerCase().includes(searchTerm))
    );
  };

  const handleDateFilter = (dates) => {
    if (!dates) return setFilteredEvents(allEvents);
    const [start, end] = dates;
    setFilteredEvents(
      allEvents.filter((event) =>
        dayjs(event.date).isBetween(start, end, null, "[]")
      )
    );
  };

  const addToMyEvents = (event) => {
    if (!myEvents.some((e) => e._id === event._id)) {
      setMyEvents([...myEvents, event]);
    }
  };

  return (
    <Layout style={{ backgroundColor: "#f0f2f5", minHeight: "100vh", padding: "40px" }}>
      <Content>
        <Title level={2} style={{ textAlign: "center", color: "#1890ff" }}>
          🎟️ TicketApp 🎟️
        </Title>
        <Title level={3} style={{ textAlign: "center", color: "#1890ff" }}>
          Upcoming events
        </Title>

        <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginBottom: "20px" }}>
          <Input
            placeholder="🔍 Search events..."
            prefix={<SearchOutlined />}
            onChange={handleSearch}
            style={{ width: "250px" }}
          />
          <RangePicker onChange={handleDateFilter} style={{ width: "280px" }} />
        </div>

        <Divider />

        <Title level={3} style={{ color: "#fa541c" }}>🎭 Available events</Title>
        <Row gutter={[16, 16]} justify="center">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <Col xs={24} sm={12} md={8} lg={6} key={event._id}>
                <Card
                  hoverable
                  cover={<img alt={event.name} src={event.image} style={{ height: "200px", objectFit: "cover" }} />}
                  style={{ border: "1px solid #1890ff" }}
                >
                  <Title level={4}>{event.name}</Title>
                  <Text><CalendarOutlined /> {event.date}</Text><br />
                  <Text><EnvironmentOutlined /> {event.location}</Text><br />
                  <Button type="primary" block style={{ marginTop: "10px" }}>
                    <Link to={`/event/${event._id}`}>View details</Link>
                  </Button>
                  <Button type="default" block onClick={() => addToMyEvents(event)} style={{ marginTop: "10px" }}>
                    ➕ Save to My Events
                  </Button>
                </Card>
              </Col>
            ))
          ) : (
            <Text>No events found.</Text>
          )}
        </Row>

        <Divider />

        <Title level={3} style={{ color: "#52c41a" }}>🎟️ My events</Title>
        {myEvents.length > 0 ? (
          <List
            bordered
            dataSource={myEvents}
            renderItem={(event) => (
              <List.Item>
                <Text strong>{event.name}</Text> - <Text>{event.date}</Text>
              </List.Item>
            )}
          />
        ) : (
          <Text>You haven't saved any events yet.</Text>
        )}
      </Content>
    </Layout>
  );
};

export default Home;