import { useEffect, useState } from "react";
import { API } from "../api";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { formatEventTimeShort, isPastEvent } from "../utils/timeFormatting";
import EventCarousel from "../components/EventCarousel";
import BlogCarousel from "../components/BlogCarousel";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const { user } = useAuth();

  const getEventLink = (event) =>
    isPastEvent(event.date) ? `/events/${event._id}/summary` : `/events/${event._id}`;

  const filteredEvents = events.filter((e) => {
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "paid" && e.price > 0) ||
      (filter === "free" && e.price === 0) ||
      (filter === "upcoming" && new Date(e.date) > new Date()) ||
      (filter === "past" && new Date(e.date) <= new Date());

    return matchesSearch && matchesFilter;
  });

  useEffect(() => {
    API.get("/events").then(res => setEvents(res.data));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HERO */}
      <div className="h-[60vh] bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white text-center px-4">
        <div>
          <h1 className="text-4xl md:text-6xl font-black mb-4">Discover Events</h1>
          <p className="opacity-90">Find, book and attend amazing experiences</p>
        </div>
      </div>

      {/* SEARCH + FILTER */}
      <div className="max-w-6xl mx-auto px-4 -mt-10 mb-10">
        <div className="bg-white rounded-2xl shadow-lg p-4 flex flex-col md:flex-row gap-3">

          <input
            type="text"
            placeholder="Search events..."
            className="flex-1 border rounded-lg px-4 py-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="border rounded-lg px-4 py-2"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="paid">Paid</option>
            <option value="free">Free</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>

        </div>
      </div>

      {/* GRID */}
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-16">
        {filteredEvents.map(event => (
          <div key={event._id} className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden">
            <Link to={getEventLink(event)}>
              <img src={event.image} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="font-semibold mb-1">{event.title}</h3>
                <p className="text-sm text-gray-500">{formatEventTimeShort(event.date)}</p>

                <div className="flex justify-between items-center mt-3">
                  <span className="text-green-600 font-bold">
                    {event.price > 0 ? `₦${event.price}` : "Free"}
                  </span>
                  <span className="text-xs text-gray-500">{event.attendees.length} going</span>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}


/* =========================
   EVENT DETAILS (STICKY BUY)
========================= */
export function EventDetails({ events = [] }) {
  const { id } = useParams();
  const event = events.find(e => e._id === id);

  if (!event) return <div className="p-10">Event not found</div>;

  return (
    <div className="bg-gray-50 min-h-screen pb-24">

      {/* IMAGE */}
      <img src={event.image} className="w-full h-[300px] object-cover" />

      <div className="max-w-5xl mx-auto px-4 py-6">

        <h1 className="text-2xl md:text-3xl font-bold mb-2">{event.title}</h1>
        <p className="text-gray-500 mb-4">
          {formatEventTimeShort(event.date)} • {event.location}
        </p>

        <p className="text-gray-700 mb-6">
          {event.description || "No description provided."}
        </p>

      </div>

      {/* STICKY BUY BAR (DOES NOT TOUCH PAYSTACK LOGIC) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">Price</p>
          <p className="text-lg font-bold text-green-600">
            {event.price > 0 ? `₦${event.price}` : "Free"}
          </p>
        </div>

        <button
          className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
        >
          {event.price > 0 ? "Buy Ticket" : "Register"}
        </button>
      </div>

    </div>
  );
}
