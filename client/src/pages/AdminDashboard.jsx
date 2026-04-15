import { useEffect, useState } from "react";
import { API } from "../api";
import { Link, useNavigate } from "react-router-dom";

const StatCard = ({ icon, label, value, sub, color = "blue" }) => {
  const colors = {
    blue:   "bg-blue-50 text-blue-600",
    green:  "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-extrabold text-gray-800">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const map = {
    ongoing:  "bg-green-100 text-green-700",
    upcoming: "bg-blue-100 text-blue-700",
    past:     "bg-gray-100 text-gray-500",
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${map[status] || map.past}`}>
      {status === "ongoing" && "🟢 "}{status}
    </span>
  );
};

const getStatus = (date) => {
  const now = new Date();
  const d = new Date(date);
  if (d < now) return "past";
  if (d <= new Date(now.getTime() + 24 * 60 * 60 * 1000)) return "ongoing";
  return "upcoming";
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/events/admin/stats")
      .then(res => setStats(res.data))
      .catch(() => navigate("/"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!stats) return null;

  const allEvents = [
    ...stats.ongoingEvents.map(e => ({ ...e, status: "ongoing" })),
    ...stats.upcomingEvents.map(e => ({ ...e, status: "upcoming" })),
    ...stats.pastEvents.map(e => ({ ...e, status: "past" })),
  ];

  const filtered = tab === "all" ? allEvents
    : allEvents.filter(e => e.status === tab);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Platform overview and event management</p>
          </div>
          <div className="flex gap-3">
            <Link to="/trash"
              className="border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
              🗑️ Trash
            </Link>
            <Link to="/create"
              className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
              + New Event
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon="🎟" label="Total Events"   value={stats.totalEvents}   color="blue" />
          <StatCard icon="👥" label="Total Users"    value={stats.totalUsers}    color="purple" />
          <StatCard icon="🎫" label="Active Tickets" value={stats.totalTickets}  color="green" />
          <StatCard icon="💰" label="Total Revenue"
            value={`₦${stats.totalRevenue.toLocaleString()}`} color="orange" />
        </div>

        {/* Status summary pills */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Ongoing",  value: stats.ongoing,  color: "bg-green-500",  tab: "ongoing"  },
            { label: "Upcoming", value: stats.upcoming, color: "bg-blue-500",   tab: "upcoming" },
            { label: "Past",     value: stats.past,     color: "bg-gray-400",   tab: "past"     },
          ].map(s => (
            <button key={s.tab} onClick={() => setTab(s.tab)}
              className={`bg-white rounded-2xl shadow-sm p-5 text-center hover:shadow-md transition border-2 ${tab === s.tab ? "border-blue-500" : "border-transparent"}`}>
              <div className={`w-3 h-3 rounded-full ${s.color} mx-auto mb-2`} />
              <p className="text-2xl font-extrabold text-gray-800">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label} Events</p>
            </button>
          ))}
        </div>

        {/* Events table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="font-bold text-gray-800">Events</h2>
            <div className="flex gap-2">
              {["all", "ongoing", "upcoming", "past"].map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition ${tab === t ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">📭</p>
              <p>No {tab === "all" ? "" : tab} events found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-gray-400 uppercase tracking-wider border-b">
                    <th className="text-left px-6 py-3">Event</th>
                    <th className="text-left px-6 py-3">Date</th>
                    <th className="text-left px-6 py-3">Organizer</th>
                    <th className="text-left px-6 py-3">Attendees</th>
                    <th className="text-left px-6 py-3">Price</th>
                    <th className="text-left px-6 py-3">Status</th>
                    <th className="text-left px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(event => (
                    <tr key={event._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {event.image
                              ? <img src={event.image} alt="" className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center text-lg">🎟</div>}
                          </div>
                          <p className="font-semibold text-gray-800 text-sm line-clamp-1">{event.title}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {event.createdBy?.name || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                        {event.attendees?.length ?? 0} / {event.capacity}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold">
                        <span className={event.price === 0 ? "text-green-600" : "text-blue-600"}>
                          {event.price === 0 ? "Free" : `₦${event.price.toLocaleString()}`}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={event.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Link to={`/events/${event._id}`}
                            className="text-xs text-blue-600 hover:underline font-medium">View</Link>
                          <Link to={`/events/${event._id}/edit`}
                            className="text-xs text-gray-500 hover:underline font-medium">Edit</Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
