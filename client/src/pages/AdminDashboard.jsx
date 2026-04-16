import { useEffect, useState } from "react";
import { API } from "../api";
import { Link, useNavigate } from "react-router-dom";

const STATUS_MAP = {
  ongoing:  { label: "Live",     cls: "text-emerald-400 bg-emerald-400/10 border-emerald-400/25", dot: "bg-emerald-400", pulse: true },
  upcoming: { label: "Upcoming", cls: "text-sky-400 bg-sky-400/10 border-sky-400/25",             dot: "bg-sky-400",     pulse: false },
  past:     { label: "Ended",    cls: "text-zinc-500 bg-zinc-800 border-zinc-700",                dot: "bg-zinc-500",    pulse: false },
};

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.past;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} ${s.pulse ? "animate-pulse" : ""}`} />
      {s.label}
    </span>
  );
}

function StatCard({ icon, label, value, accent }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border p-6 bg-zinc-900 ${accent}`}>
      <div className="absolute -right-3 -top-3 text-5xl opacity-10 select-none">{icon}</div>
      <p className="text-3xl font-black text-white mb-1">{value}</p>
      <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-zinc-500">{label}</p>
      <div className="mt-3 text-xl">{icon}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/events/admin/stats")
      .then(res => setStats(res.data))
      .catch(() => navigate("/"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (eventId) => {
    if (!window.confirm("Move this event to trash?")) return;
    try {
      setDeletingId(eventId);
      await API.delete(`/events/${eventId}`);
      setStats(prev => {
        if (!prev) return prev;
        const f = arr => arr.filter(e => e._id !== eventId);
        const o = f(prev.ongoingEvents), u = f(prev.upcomingEvents), p = f(prev.pastEvents);
        return { ...prev, ongoingEvents: o, upcomingEvents: u, pastEvents: p,
          ongoing: o.length, upcoming: u.length, past: p.length,
          totalEvents: o.length + u.length + p.length };
      });
    } catch (err) { alert(err.response?.data?.message || "Failed"); }
    finally { setDeletingId(null); }
  };

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
        <p className="text-zinc-600 text-xs tracking-widest uppercase">Loading</p>
      </div>
    </div>
  );
  if (!stats) return null;

  const all = [
    ...stats.ongoingEvents.map(e => ({ ...e, status: "ongoing" })),
    ...stats.upcomingEvents.map(e => ({ ...e, status: "upcoming" })),
    ...stats.pastEvents.map(e => ({ ...e, status: "past" })),
  ];
  const filtered = tab === "all" ? all : all.filter(e => e.status === tab);

  return (
    <div className="min-h-screen bg-zinc-950 text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
      <div className="h-px w-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400" />

      <div className="max-w-7xl mx-auto px-5 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-[10px] tracking-[0.35em] uppercase text-amber-400 font-bold mb-2">Control Center</p>
            <h1 className="text-5xl font-black leading-none tracking-tight">Admin</h1>
            <p className="text-zinc-600 text-sm mt-1">Platform overview & management</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link to="/" className="px-4 py-2 rounded-xl border border-zinc-800 text-zinc-400 text-sm hover:border-zinc-600 hover:text-white transition-all">📚 Events</Link>
            <Link to="/trash" className="px-4 py-2 rounded-xl border border-zinc-800 text-zinc-400 text-sm hover:border-red-500/40 hover:text-red-400 transition-all">🗑️ Trash</Link>
            <Link to="/create" className="px-5 py-2 rounded-xl bg-amber-400 text-zinc-950 text-sm font-bold hover:bg-amber-300 transition-all">+ New Event</Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard icon="🎟" label="Total Events"   value={stats.totalEvents}                         accent="border-amber-500/20" />
          <StatCard icon="👥" label="Total Users"    value={stats.totalUsers}                          accent="border-sky-500/20" />
          <StatCard icon="🎫" label="Active Tickets" value={stats.totalTickets}                        accent="border-emerald-500/20" />
          <StatCard icon="💰" label="Revenue"         value={`₦${stats.totalRevenue.toLocaleString()}`} accent="border-rose-500/20" />
        </div>

        {/* Event status pills */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { key: "ongoing",  label: "Live Now",  value: stats.ongoing  },
            { key: "upcoming", label: "Upcoming",  value: stats.upcoming },
            { key: "past",     label: "Ended",     value: stats.past     },
          ].map(s => (
            <button key={s.key} onClick={() => setTab(s.key)}
              className={`rounded-xl border p-4 text-center transition-all hover:scale-[1.01] ${
                tab === s.key ? "border-amber-400/40 bg-amber-400/5" : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"}`}>
              <p className="text-2xl font-black">{s.value}</p>
              <p className="text-[10px] tracking-widest uppercase text-zinc-500 mt-0.5">{s.label}</p>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
            <h2 className="font-bold text-sm tracking-wide">Events</h2>
            <div className="flex gap-1 bg-zinc-800 rounded-lg p-1">
              {["all", "ongoing", "upcoming", "past"].map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-3 py-1 rounded-md text-[11px] font-bold capitalize transition-all ${tab === t ? "bg-amber-400 text-zinc-950" : "text-zinc-500 hover:text-white"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-zinc-600 text-xs tracking-widest uppercase">No events found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-[10px] tracking-widest uppercase text-zinc-600 border-b border-zinc-800">
                    {["Event", "Date", "Organizer", "Seats", "Price", "Status", "Actions"].map(h => (
                      <th key={h} className="text-left px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(ev => (
                    <tr key={ev._id} className="border-b border-zinc-800/50 hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0 ring-1 ring-white/5">
                            {ev.image ? <img src={ev.image} alt="" className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center text-sm">🎟</div>}
                          </div>
                          <span className="text-sm font-semibold text-white line-clamp-1 max-w-[160px]">{ev.title}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-zinc-500">
                        {new Date(ev.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-zinc-500">{ev.createdBy?.name || "—"}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-1 bg-zinc-700 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full transition-all"
                              style={{ width: `${Math.min(((ev.attendees?.length ?? 0) / ev.capacity) * 100, 100)}%` }} />
                          </div>
                          <span className="text-[11px] text-zinc-600">{ev.attendees?.length ?? 0}/{ev.capacity}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-sm font-bold ${ev.price === 0 ? "text-emerald-400" : "text-amber-400"}`}>
                          {ev.price === 0 ? "Free" : `₦${ev.price.toLocaleString()}`}
                        </span>
                      </td>
                      <td className="px-5 py-3.5"><StatusBadge status={ev.status} /></td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-3 text-xs font-semibold">
                          <Link to={`/events/${ev._id}`} className="text-sky-400 hover:text-sky-300 transition-colors">View</Link>
                          <Link to={`/events/${ev._id}/edit`} className="text-zinc-400 hover:text-white transition-colors">Edit</Link>
                          <button onClick={() => handleDelete(ev._id)} disabled={deletingId === ev._id}
                            className="text-red-500 hover:text-red-400 transition-colors disabled:opacity-30">
                            {deletingId === ev._id ? "…" : "Delete"}
                          </button>
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
