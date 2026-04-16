import { useEffect, useState } from "react";
import { API } from "../api";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { formatEventTimeShort, isPastEvent } from "../utils/timeFormatting";
import EventCarousel from "../components/EventCarousel";
import BlogCarousel from "../components/BlogCarousel";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [ongoingEvents, setOngoingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [bannerIndex, setBannerIndex] = useState(0);

  // 🔍 NEW
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";

  const getEventLink = (event) =>
    isPastEvent(event.date)
      ? `/events/${event._id}/summary`
      : `/events/${event._id}`;

  // 🔍 FILTER LOGIC
  const filteredEvents = events.filter((e) => {
    const matchesSearch = e.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "paid" && e.price > 0) ||
      (filter === "free" && e.price === 0) ||
      (filter === "upcoming" && new Date(e.date) > new Date()) ||
      (filter === "past" && new Date(e.date) <= new Date());

    return matchesSearch && matchesFilter;
  });

  const upcomingPopularEvents = events
    .filter((e) => new Date(e.date) > new Date() && e.attendees.length > 0)
    .sort((a, b) => b.attendees.length - a.attendees.length);

  const featuredEvent =
    upcomingPopularEvents[bannerIndex] ||
    upcomingPopularEvents[0];

  const popularEvents = filteredEvents
    .filter((e) => e.attendees.length > 0)
    .sort((a, b) => b.attendees.length - a.attendees.length)
    .slice(0, 10);

  const eventsByLocation = {};
  filteredEvents.forEach((event) => {
    const loc = event.location || "Other";
    if (!eventsByLocation[loc]) eventsByLocation[loc] = [];
    eventsByLocation[loc].push(event);
  });

  const freeEvents = filteredEvents.filter((e) => e.price === 0);
  const paidEvents = filteredEvents.filter((e) => e.price > 0);
  const upcomingEvents = filteredEvents.filter(
    (e) => new Date(e.date) > new Date()
  );
  const pastEvents = filteredEvents.filter(
    (e) => new Date(e.date) <= new Date()
  );

  useEffect(() => {
    API.get("/events")
      .then((res) => {
        setEvents(res.data);
        setOngoingEvents(res.data);
      })
      .finally(() => setLoading(false));

    API.get("/blogs")
      .then((res) => {
        const sorted = res.data.sort((a, b) => {
          if (a.featured === b.featured) {
            return new Date(b.createdAt) - new Date(a.createdAt);
          }
          return b.featured - a.featured;
        });
        setBlogs(sorted.slice(0, 12));
      })
      .catch(() => {})
      .finally(() => setBlogsLoading(false));
  }, []);

  useEffect(() => {
    if (upcomingPopularEvents.length === 0) return;
    const interval = setInterval(() => {
      setBannerIndex(
        (prev) => (prev + 1) % upcomingPopularEvents.length
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [upcomingPopularEvents.length]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await API.delete(`/events/${deleteTarget._id}`);
      setEvents((prev) =>
        prev.filter((e) => e._id !== deleteTarget._id)
      );
      setDeleteTarget(null);
    } catch (err) {
      alert(
        err.response?.data?.message || "Failed to delete event"
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)" }}>
      {/* DELETE MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full">
            <h2 className="text-xl font-bold text-center mb-4">
              Delete Event?
            </h2>
            <p className="text-center mb-6 text-sm">
              "{deleteTarget.title}" will be deleted
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 border py-2 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-500 text-white py-2 rounded-xl"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HERO */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        {featuredEvent && (
          <>
            <img
              src={featuredEvent.image}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60" />

            <div className="relative z-10 text-center text-white px-4">
              <h1 className="text-5xl font-black mb-4">
                {featuredEvent.title}
              </h1>
              <p className="mb-6">{featuredEvent.location}</p>
              <Link
                to={getEventLink(featuredEvent)}
                className="bg-yellow-500 px-6 py-3 rounded-full text-black font-bold"
              >
                View Event
              </Link>
            </div>
          </>
        )}
      </div>

      {/* SEARCH + FILTER */}
      <div className="max-w-6xl mx-auto px-4 -mt-16 mb-10">
        <div className="bg-white rounded-2xl shadow-xl p-4 flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Search events..."
            className="flex-1 border px-4 py-2 rounded-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="border px-4 py-2 rounded-lg"
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

      {/* CONTENT */}
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "48px 24px",
        }}
      >
        {/* FEATURED */}
        {!loading && ongoingEvents.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-4">
              🔴 Featured Events
            </h2>
            <EventCarousel events={ongoingEvents} />
          </div>
        )}

        {/* BLOGS */}
        {!blogsLoading && blogs.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-4">
              📰 Blogs
            </h2>
            <BlogCarousel blogs={blogs} />
          </div>
        )}

        {/* POPULAR */}
        {popularEvents.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-4">
              🔥 Popular
            </h2>
            <EventCarousel events={popularEvents} />
          </div>
        )}

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          {filteredEvents.slice(0, 6).map((event) => (
            <div
              key={event._id}
              className="bg-white rounded-xl shadow hover:shadow-lg transition"
            >
              <Link to={getEventLink(event)}>
                <img
                  src={event.image}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold">
                    {event.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formatEventTimeShort(event.date)}
                  </p>

                  <div className="flex justify-between mt-2">
                    <span className="text-green-600 font-bold">
                      {event.price > 0
                        ? `₦${event.price}`
                        : "Free"}
                    </span>
                    <span className="text-xs">
                      {event.attendees.length} going
                    </span>
                  </div>

                  {/* CTA */}
                  <button className="mt-3 w-full bg-black text-white py-2 rounded-lg">
                    {event.price > 0
                      ? "Buy Ticket"
                      : "Register"}
                  </button>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}