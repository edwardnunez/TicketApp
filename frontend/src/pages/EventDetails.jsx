import { useParams } from "react-router-dom";

const EventDetails = () => {
  const { id } = useParams();

  const event = {
    1: { name: "Concierto de Rock", date: "2025-06-15", location: "Madrid", price: 50 },
    2: { name: "Festival de Jazz", date: "2025-07-20", location: "Barcelona", price: 40 },
  }[id];

  if (!event) return <p>Evento no encontrado.</p>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold">{event.name}</h1>
      <p className="text-lg">{event.date} - {event.location}</p>
      <p className="text-xl font-semibold mt-4">Precio: ${event.price}</p>
    </div>
  );
};

export default EventDetails;
