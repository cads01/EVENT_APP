import { useEffect, useState } from "react";
import { API } from "../api";
import { Link } from "react-router-dom";

export default function Events() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    API.get("/events").then(res => setEvents(res.data));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Upcoming Events</h1>
      {events.length === 0 && <p className="text-gray-500">No events yet.</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => (
          <Link to={`/events/${event._id}`} key={event._id}
            className="bg-white rounded-lg shadow hover:shadow-md transition overflow-hidden">
            {event.image ? (
              <img src={event.image} alt={event.title} className="w-full h-48 object-cover" />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}
            <div className="p-5">
              <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
              <p className="text-gray-500 text-sm mb-2">📍 {event.location}</p>
              <p className="text-gray-400 text-sm mb-4">
                📅 {new Date(event.date).toDateString()}
              </p>
              <p className="text-blue-600 font-medium">
                {event.price === 0 ? "Free" : `₦${event.price.toLocaleString()}`}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}