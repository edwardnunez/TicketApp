import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const gatewayUrl = process.env.REACT_APP_API_ENDPOINT || "http://localhost:8000";

  useEffect(() => {
    axios.get(gatewayUrl+`/events/${id}`)
      .then((res) => setEvent(res.data))
      .catch((err) => console.error("Error loading event", err));
  }, [id]);

  if (!event) return <p>Evento no encontrado o cargando...</p>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold">{event.name}</h1>
      <p className="text-lg">{new Date(event.date).toLocaleDateString()} - {event.location}</p>
      <p className="text-xl font-semibold mt-4">Precio: ${event.price}</p>
    </div>
  );
};

export default EventDetails;