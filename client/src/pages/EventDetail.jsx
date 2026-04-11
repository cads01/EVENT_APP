import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API } from "../api";
import { useAuth } from "../context/AuthContext";
import { usePaystackPayment } from "react-paystack";

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    API.get(`/events/${id}`).then(res => setEvent(res.data));
  }, [id]);

  const config = {
    reference: new Date().getTime().toString(),
    email: user?.email || "",
    amount: event ? event.price * 100 : 0, // Paystack uses kobo
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
  };

  const initializePayment = usePaystackPayment(config);

  const handleRSVP = async () => {
    try {
      await API.post(`/events/${id}/rsvp`);
      setMessage("RSVP successful! 🎉 Check your email for confirmation.");
    } catch (err) {
      setMessage(err.response?.data?.message || "RSVP failed");
    }
  };

  const handlePayment = () => {
    initializePayment({
      onSuccess: () => {
        handleRSVP();
      },
      onClose: () => {
        setMessage("Payment cancelled.");
      },
    });
  };

  if (!event) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {event.image && (
        <img src={event.image} alt={event.title}
          className="w-full h-64 object-cover rounded-lg mb-6" />
      )}
      <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
      <p className="text-gray-500 mb-2">📍 {event.location}</p>
      <p className="text-gray-500 mb-2">📅 {new Date(event.date).toDateString()}</p>
      <p className="text-gray-500 mb-4">👥 {event.attendees.length} / {event.capacity} attending</p>
      <p className="text-lg mb-6">{event.description}</p>
      <p className="text-blue-600 font-semibold text-xl mb-6">
        {event.price === 0 ? "Free" : `₦${event.price.toLocaleString()}`}
      </p>
      {message && (
        <p className={`mb-4 font-medium ${message.includes("successful") ? "text-green-600" : "text-red-500"}`}>
          {message}
        </p>
      )}
      {user && (
        event.price > 0 ? (
          <button onClick={handlePayment}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium">
            Pay ₦{event.price.toLocaleString()} & RSVP
          </button>
        ) : (
          <button onClick={handleRSVP}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium">
            RSVP Now (Free)
          </button>
        )
      )}
      {!user && (
        <p className="text-gray-500">Please <a href="/login" className="text-blue-600">login</a> to RSVP.</p>
      )}
    </div>
  );
}