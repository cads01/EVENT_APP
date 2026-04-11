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
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
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
        <p style={{ fontSize: "18px", color: "#bfdbfe", maxWidth: "500px", margin: "0 auto" }}>
          Find and attend the best events happening around you
        </p>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "48px 24px" }}>
        {loading && (
          <p style={{ textAlign: "center", color: "#6b7280", padding: "80px 0" }}>Loading events...</p>
        )}
        {!loading && events.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <p style={{ fontSize: "48px" }}>🎟</p>
            <p style={{ fontSize: "20px", color: "#374151", fontWeight: 600, marginTop: "16px" }}>No events yet</p>
          </div>
        )}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "32px"
        }}>
          {events.map(event => (
            <Link to={`/events/${event._id}`} key={event._id}
              style={{ textDecoration: "none", color: "inherit" }}>
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
                  <p style={{ fontSize: "14px", color: "#9ca3af", marginBottom: "16px" }}>
                    📅 {new Date(event.date).toDateString()}
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
          ))}
        </div>
      </div>
    </div>
  );
}