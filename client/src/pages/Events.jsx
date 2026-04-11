import { useEffect, useState } from "react";
import { API } from "../api";
import { Link } from "react-router-dom";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/events")
      .then(res => setEvents(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 px-4 text-center">
        <h1 className="text-5xl font-extrabold mb-4">Discover Events</h1>
        <p className="text-blue-100 text-lg max-w-xl mx-auto">
          Find and attend the best events happening around you
        </p>
      </div>

      {/* Events Grid */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {loading && (
          <div className="text-center text-gray-400 py-20">Loading events...</div>
        )}
        {!loading && events.length === 0 && (
          <div className="text-center text-gray-400 py-20">
            <p className="text-5xl mb-4">🎟</p>
            <p className="text-xl font-medium">No events yet</p>
            <p className="text-sm mt-2">Check back soon!</p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map(event => (
            <Link to={`/events/${event._id}`} key={event._id}
              className="bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden group">
              {event.image ? (
                <img src={event.image} alt={event.title}
                  className="w-full h-52 object-cover group-hover:scale-105 transition duration-300" />
              ) : (
                <div className="w-full h-52 bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center text-4xl">
                  🎟
                </div>
              )}
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">{event.title}</h2>
                <p className="text-gray-500 text-sm mb-1">📍 {event.location}</p>
                <p className="text-gray-400 text-sm mb-4">📅 {new Date(event.date).toDateString()}</p>
                <div className="flex justify-between items-center">
                  <span className={`font-bold text-lg ${event.price === 0 ? "text-green-600" : "text-blue-600"}`}>
                    {event.price === 0 ? "Free" : `₦${event.price.toLocaleString()}`}
                  </span>
                  <span className="text-xs text-gray-400">
                    {event.attendees.length} attending
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}