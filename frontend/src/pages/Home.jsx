import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout, Typography, Card, Row, Col, Button, DatePicker, Input, Divider, List } from "antd";
import { CalendarOutlined, EnvironmentOutlined, SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Content } = Layout;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const Home = () => {
  // List of available events
  const allEvents = [
    { id: 1, name: "Rock Concert", date: "2025-06-15", location: "Madrid", image: "/images/concert.jpg" },
    { id: 2, name: "Jazz Festival", date: "2025-07-20", location: "Barcelona", image: "/images/jazz.jpg" },
    { id: 3, name: "Electronic Party", date: "2025-08-10", location: "Ibiza", image: "/images/electronic.jpg" },
    { id: 4, name: "Classical Theater", date: "2025-09-05", location: "Barcelona", image: "/images/theater.jpg" },
  ];

  const [filteredEvents, setFilteredEvents] = useState(allEvents);
  const [myEvents, setMyEvents] = useState([]);

  // Search filter
  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setFilteredEvents(
      allEvents.filter((event) => event.name.toLowerCase().includes(searchTerm))
    );
  };

  // Date filter
  const handleDateFilter = (dates) => {
    if (!dates) {
      setFilteredEvents(allEvents);
      return;
    }
    const [start, end] = dates;
    setFilteredEvents(
      allEvents.filter((event) =>
        dayjs(event.date).isBetween(start, end, null, "[]")
      )
    );
  };

  // Add event to "My Events"
  const addToMyEvents = (event) => {
    if (!myEvents.some((e) => e.id === event.id)) {
      setMyEvents([...myEvents, event]);
    }
  };

  return (
    <Layout style={{ backgroundColor: "#f0f2f5", minHeight: "100vh", padding: "40px" }}>
      <Content>
        {/* Main Title */}
        <Title level={2} style={{ textAlign: "center", color: "#1890ff" }}>
          🎟️ TicketApp 🎟️
        </Title>
        <Title level={3} style={{ textAlign: "center", color: "#1890ff" }}>
          Upcoming events
        </Title>

        {/* Filters */}
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

        {/* Event List */}
        <Title level={3} style={{ color: "#fa541c" }}>🎭 Available events</Title>
        <Row gutter={[16, 16]} justify="center">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <Col xs={24} sm={12} md={8} lg={6} key={event.id}>
                <Card
                  hoverable
                  cover={<img alt={event.name} src={event.image} style={{ height: "200px", objectFit: "cover" }} />}
                  style={{ border: "1px solid #1890ff" }}
                >
                  <Title level={4}>{event.name}</Title>
                  <Text><CalendarOutlined /> {event.date}</Text>
                  <br />
                  <Text><EnvironmentOutlined /> {event.location}</Text>
                  <br />
                  <Button type="primary" block style={{ marginTop: "10px" }}>
                    <Link to={`/event/${event.id}`}>View details</Link>
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

        {/* "My Events" Section */}
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



