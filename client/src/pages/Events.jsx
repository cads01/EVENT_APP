import { useEffect, useState } from "react";
import { API } from "../api";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { formatEventTimeShort } from "../utils/timeFormatting";
import EventCarousel from "../components/EventCarousel";
import BlogCarousel from "../components/BlogCarousel";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [ongoingEvents, setOngoingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null); // event to confirm delete
  const [deleting, setDeleting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    // Fetch events
    API.get("/events")
      .then(res => {
        setEvents(res.data);

        // Calculate current and past events
        const now = new Date();
        const currentAndPast = res.data.filter(e => {
          const eventDate = new Date(e.date);
          return eventDate <= now;
        });
        setOngoingEvents(currentAndPast);
      })
      .finally(() => setLoading(false));

    // Fetch featured blogs
    API.get("/blogs")
      .then(res => {
        // Sort by featured and recent
        const sorted = res.data.sort((a, b) => {
          if (a.featured === b.featured) {
            return new Date(b.createdAt) - new Date(a.createdAt);
          }
          return b.featured - a.featured;
        });
        setBlogs(sorted.slice(0, 12)); // Get top 12 blogs
      })
      .catch(err => console.log("Blogs not available yet"))
      .finally(() => setBlogsLoading(false));
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await API.delete(`/events/${deleteTarget._id}`);
      setEvents(prev => prev.filter(e => e._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete event");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full">
            <div className="text-4xl mb-4 text-center">🗑️</div>
            <h2 className="text-xl font-bold text-gray-800 text-center mb-2">Delete Event?</h2>
            <p className="text-gray-500 text-sm text-center mb-6">
              <span className="font-semibold text-gray-700">"{deleteTarget.title}"</span> will be permanently deleted.
              This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-xl font-medium hover:bg-red-600 transition text-sm disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #2563eb, #4f46e5)",
        padding: "80px 24px",
        textAlign: "center",
        color: "white"
      }}>
        <h1 style={{ fontSize: "48px", fontWeight: 800, marginBottom: "16px", color: "white" }}>
          Discover Events
        </h1>
        <p style={{ fontSize: "18px", color: "#bfdbfe", maxWidth: "500px", margin: "0 auto 24px" }}>
          Find and attend the best events happening around you
        </p>
        {isAdmin && (
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button
              onClick={() => navigate("/create")}
              className="inline-flex items-center gap-2 bg-white text-blue-600 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition text-sm"
            >
              + Create New Event
            </button>
            <button
              onClick={() => navigate("/trash")}
              className="inline-flex items-center gap-2 bg-white text-gray-700 font-bold px-6 py-3 rounded-xl hover:bg-gray-100 transition text-sm"
            >
              🗑️ Trash
            </button>
          </div>
        )}
      </div>

      {/* Grid */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "48px 24px" }}>
        {/* Ongoing Events Carousel */}
        {!loading && ongoingEvents.length > 0 && (
          <div className="mb-16">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">🔴 Current & Past Events</h2>
              <p className="text-gray-600">Showing events that are happening now or already took place</p>
            </div>
            <EventCarousel events={ongoingEvents} />
          </div>
        )}

        {/* Blogs & Comments Carousel */}
        {!blogsLoading && blogs.length > 0 && (
          <div className="mb-16">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">📰 Latest Blogs & Comments</h2>
              <p className="text-gray-600">What the community is saying about events</p>
            </div>
            <BlogCarousel blogs={blogs} />
          </div>
        )}

        {/* All Events Section */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">All Events</h2>
        </div>
        {loading && (
          <p style={{ textAlign: "center", color: "#6b7280", padding: "80px 0" }}>Loading events...</p>
        )}
        {!loading && events.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <p style={{ fontSize: "48px" }}>🎟</p>
            <p style={{ fontSize: "20px", color: "#374151", fontWeight: 600, marginTop: "16px" }}>No events yet</p>
            {isAdmin && (
              <button onClick={() => navigate("/create")}
                className="mt-4 bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
                Create your first event
              </button>
            )}
           
          </div>
        )}

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "32px"
        }}>
          {events.map(event => (
            <div key={event._id} className="relative group">
              <Link to={`/events/${event._id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{
                  backgroundColor: "white",
                  borderRadius: "16px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                  overflow: "hidden",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  cursor: "pointer"
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.08)";
                  }}>
                  {event.image ? (
                    <img src={event.image} alt={event.title}
                      style={{ width: "100%", height: "200px", objectFit: "cover" }} />
                  ) : (
                    <div style={{
                      width: "100%", height: "200px",
                      background: "linear-gradient(135deg, #dbeafe, #e0e7ff)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "48px"
                    }}>🎟</div>
                  )}
                  <div style={{ padding: "20px" }}>
                    <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111827", marginBottom: "8px" }}>
                      {event.title}
                    </h2>
                    <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "4px" }}>
                      📍 {event.location}
                    </p>
                    <p style={{ fontSize: "14px", color: "#9ca3af", marginBottom: "4px" }}>
                      📅 {formatEventTimeShort(event.date, event.timezone || 'UTC')}
                    </p>
                    <p style={{ fontSize: "12px", color: "#d1d5db", marginBottom: "16px" }}>
                      🌍 {event.timezone || 'UTC'}
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{
                        fontSize: "18px", fontWeight: 700,
                        color: event.price === 0 ? "#16a34a" : "#2563eb"
                      }}>
                        {event.price === 0 ? "Free" : `₦${event.price.toLocaleString()}`}
                      </span>
                      <span style={{ fontSize: "13px", color: "#9ca3af" }}>
                        {event.attendees.length} attending
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Admin action buttons — float over card */}
              {isAdmin && (
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={(e) => { e.preventDefault(); navigate(`/events/${event._id}/edit`); }}
                    className="bg-white text-blue-600 border border-blue-100 px-3 py-1.5 rounded-lg text-xs font-semibold shadow hover:bg-blue-50 transition"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); setDeleteTarget(event); }}
                    className="bg-white text-red-500 border border-red-100 px-3 py-1.5 rounded-lg text-xs font-semibold shadow hover:bg-red-50 transition"
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
