import { useEffect, useState } from "react";
import axios from "axios";

const Checkout = () => {
  const [tickets, setTickets] = useState([]);
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const gatewayUrl = process.env.REACT_APP_API_ENDPOINT || "http://localhost:8000";

  useEffect(() => {
    if (!userId || !token) return;

    axios
      .get(`/tickets/user/${userId}/details`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setTickets(res.data))
      .catch((err) => console.error("Error fetching tickets", err));
  }, [userId, token]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold">Carrito de compras</h1>
      <p className="text-lg mt-4">Aquí aparecerán tus entradas seleccionadas.</p>

      {tickets.length === 0 ? (
        <p className="mt-4">No tienes entradas compradas.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {tickets.map((ticket) => (
            <div key={ticket._id} className="border p-4 rounded shadow">
              <h2 className="text-xl font-semibold">{ticket.event?.name}</h2>
              <p>{new Date(ticket.event?.date).toLocaleDateString()} - {ticket.event?.location}</p>
              <p>Cantidad: {ticket.quantity}</p>
              <p>Precio por entrada: ${ticket.price}</p>
              <p>Total: ${ticket.price * ticket.quantity}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Checkout;
