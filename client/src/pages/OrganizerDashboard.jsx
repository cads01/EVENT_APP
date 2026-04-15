import { useEffect, useState } from "react";
import { API } from "../api";
import { Link, useNavigate } from "react-router-dom";

const StatusBadge = ({ status }) => {
  const map = {
    ongoing:  "bg-green-100 text-green-700",
    upcoming: "bg-blue-100 text-blue-700",
    past:     "bg-gray-100 text-gray-500",
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${map[status]}`}>
      {status === "ongoing" && "🟢 "}{status}
    </span>
  );
};

function AttendeeModal({ event, onClose }) {
  const active    = event.tickets.filter(t => t.status === "active");
  const cancelled = event.tickets.filter(t => t.status === "cancelled");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="font-bold text-gray-800 text-lg">Attendees & Tickets</h2>
            <p className="text-sm text-gray-500 truncate">{event.title}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 px-6 py-4 border-b bg-gray-50">
          <div className="text-center">
            <p className="text-xl font-bold text-gray-800">{event.tickets.length}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-green-600">{active.length}</p>
            <p className="text-xs text-gray-500">Active</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-red-400">{cancelled.length}</p>
            <p className="text-xs text-gray-500">Cancelled</p>
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 p-4">
          {event.tickets.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No attendees yet</p>
          ) : (
            <ul className="space-y-3">
              {event.tickets.map((t, i) => (
                <li key={t._id || i}
                  className={`p-4 rounded-xl border ${t.status === "cancelled" ? "bg-red-50 border-red-100 opacity-60" : "bg-gray-50 border-gray-100"}`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                        {t.user?.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{t.user?.name}</p>
                        <p className="text-xs text-gray-400">{t.user?.email}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${t.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"}`}>
                      {t.status}
                    </span>
                  </div>
                  {/* Ticket code */}
                  <div className="flex items-center gap-2 bg-white border border-dashed border-gray-200 rounded-lg px-3 py-2">
                    <span className="text-xs text-gray-400 font-mono">TICKET</span>
                    <span className="font-mono font-bold text-blue-600 text-sm tracking-widest flex-1">
                      {t.ticketCode}
                    </span>
                    <button
                      onClick={() => navigator.clipboard.writeText(t.ticketCode)}
                      className="text-xs text-gray-400 hover:text-blue-600 transition"
                      title="Copy ticket code"
                    >
                      📋
                    </button>
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-400">
                    <span>Issued {new Date(t.issuedAt).toLocaleDateString()}</span>
                    {t.paidAmount > 0 && <span className="text-green-600 font-medium">₦{t.paidAmount.toLocaleString()} paid</span>}
                    {t.paidAmount === 0 && <span>Free ticket</span>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OrganizerDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("upcoming");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/events/organizer/my-events")
      .then(res => setEvents(res.data))
      .catch(() => navigate("/"))
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    ongoing:  events.filter(e => e.status === "ongoing").length,
    upcoming: events.filter(e => e.status === "upcoming").length,
    past:     events.filter(e => e.status === "past").length,
  };

  const filtered = events.filter(e => e.status === tab);

  const totalAttendees = events.reduce((sum, e) =>
    sum + e.tickets.filter(t => t.status === "active").length, 0);
  const totalRevenue = events.reduce((sum, e) =>
    sum + e.tickets.filter(t => t.status === "active")
      .reduce((s, t) => s + (t.paidAmount || 0), 0), 0);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      {selectedEvent && (
        <AttendeeModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}

      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800">My Events</h1>
            <p className="text-gray-500 text-sm mt-1">Manage your events and track attendance</p>
          </div>
          <Link to="/create"
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
            + Create Event
          </Link>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: "🎟", label: "Total Events",   value: events.length      },
            { icon: "👥", label: "Total Attendees", value: totalAttendees     },
            { icon: "💰", label: "Revenue",         value: `₦${totalRevenue.toLocaleString()}` },
            { icon: "🟢", label: "Live Now",        value: counts.ongoing     },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-3">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <p className="text-xl font-extrabold text-gray-800">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 mb-6">
          {[
            { key: "ongoing",  label: "🟢 Ongoing",  count: counts.ongoing  },
            { key: "upcoming", label: "📅 Upcoming", count: counts.upcoming },
            { key: "past",     label: "⏳ Past",      count: counts.past    },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition border ${
                tab === t.key
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
              {t.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                tab === t.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Event cards */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
            <p className="text-5xl mb-4">
              {tab === "ongoing" ? "🎤" : tab === "upcoming" ? "📅" : "📦"}
            </p>
            <p className="text-lg font-bold text-gray-700 mb-1">
              No {tab} events
            </p>
            <p className="text-gray-400 text-sm mb-4">
              {tab === "upcoming" ? "Create an event to get started." : `No ${tab} events yet.`}
            </p>
            {tab === "upcoming" && (
              <Link to="/create"
                className="inline-block bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
                Create Event
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(event => {
              const activeTickets = event.tickets.filter(t => t.status === "active").length;
              const fillPct = Math.min((activeTickets / event.capacity) * 100, 100);

              return (
                <div key={event._id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="flex gap-4 p-6">
                    {/* Image */}
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {event.image
                        ? <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-3xl">🎟</div>}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h2 className="font-bold text-gray-800 text-base truncate">{event.title}</h2>
                        <StatusBadge status={event.status} />
                      </div>
                      <p className="text-sm text-gray-500 mb-1">
                        📍 {event.location} · 📅 {new Date(event.date).toDateString()}
                      </p>
                      <p className="text-sm font-semibold mb-3">
                        <span className={event.price === 0 ? "text-green-600" : "text-blue-600"}>
                          {event.price === 0 ? "Free" : `₦${event.price.toLocaleString()}`}
                        </span>
                        <span className="text-gray-400 font-normal ml-2">
                          · {activeTickets} / {event.capacity} attending
                        </span>
                      </p>

                      {/* Capacity bar */}
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full transition-all bg-blue-500"
                          style={{ width: `${fillPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex border-t divide-x">
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="flex-1 py-3 text-sm text-blue-600 font-medium hover:bg-blue-50 transition flex items-center justify-center gap-1"
                    >
                      👥 Attendees ({activeTickets})
                    </button>
                    <Link to={`/events/${event._id}`}
                      className="flex-1 py-3 text-sm text-gray-600 font-medium hover:bg-gray-50 transition flex items-center justify-center gap-1">
                      👁 View
                    </Link>
                    <Link to={`/events/${event._id}/edit`}
                      className="flex-1 py-3 text-sm text-gray-600 font-medium hover:bg-gray-50 transition flex items-center justify-center gap-1">
                      ✏️ Edit
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
