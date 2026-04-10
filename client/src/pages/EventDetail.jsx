import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API } from "../api";
import { useAuth } from "../context/AuthContext";

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    API.get(`/events/${id}`).then(res => setEvent(res.data));
  }, [id]);

  const handleRSVP = async () => {
    try {
      await API.post(`/events/${id}/rsvp`);
      setMessage("RSVP successful! 🎉");
    } catch (err) {
      setMessage(err.response?.data?.message || "RSVP failed");
    }
  };

  if (!event) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
      <p className="text-gray-500 mb-2">📍 {event.location}</p>
      <p className="text-gray-500 mb-2">📅 {new Date(event.date).toDateString()}</p>
      <p className="text-gray-500 mb-4">👥 {event.attendees.length} / {event.capacity} attending</p>
      <p className="text-lg mb-6">{event.description}</p>
      <p className="text-blue-600 font-semibold mb-6">
        {event.price === 0 ? "Free" : `₦${event.price.toLocaleString()}`}
      </p>
      {message && <p className="text-green-600 mb-4">{message}</p>}
      {user && (
        <button onClick={handleRSVP}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
          RSVP Now
        </button>
      )}
    </div>
  );
}