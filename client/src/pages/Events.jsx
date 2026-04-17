import { useEffect, useState } from "react";
import { API } from "../api";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import About from "../components/About";
import FAQ from "../components/FAQ";
import Contact from "../components/Contact";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    API.get("/events")
      .then(res => setEvents(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await API.delete(`/events/${deleteTarget._id}`);
      setEvents(prev => prev.filter(e => e._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = events.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.location.toLowerCase().includes(search.toLowerCase())
  );

  const getStatus = (date) => {
    const now = new Date(), d = new Date(date);
    if (d < now) return "past";
    if (d <= new Date(now.getTime() + 86400000)) return "ongoing";
    return "upcoming";
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
      {/* Delete confirm modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 max-w-sm w-full shadow-2xl">
            <p className="text-4xl text-center mb-4">🗑️</p>
            <h2 className="text-xl font-black text-white text-center mb-2">Move to Trash?</h2>
            <p className="text-zinc-500 text-sm text-center mb-6">
              "<span className="text-white font-semibold">{deleteTarget.title}</span>" will be moved to the recycle bin.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 border border-zinc-700 text-zinc-400 py-3 rounded-xl text-sm font-bold hover:border-zinc-500 hover:text-white transition-all">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 bg-red-500 text-white py-3 rounded-xl text-sm font-bold hover:bg-red-400 transition-all disabled:opacity-40">
                {deleting ? "Moving…" : "Move to Trash"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black" />
        <div className="absolute inset-0 opacity-30"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #f59e0b33 0%, transparent 50%), radial-gradient(circle at 80% 20%, #0ea5e933 0%, transparent 50%)" }} />
        <div className="absolute inset-0"
          style={{ backgroundImage: "linear-gradient(rgba(255, 0, 0, 0.99) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="relative px-5 py-20 text-center max-w-3xl mx-auto">
          <p className="text-[10px] tracking-[0.4em] uppercase text-amber-400 font-bold mb-4">EventApp</p>
          <h1 className="text-5xl md:text-7xl font-black leading-none tracking-tight mb-4">
            Discover<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Events</span>
          </h1>
          <p className="text-zinc-500 text-base mb-8">Find and attend the best events happening around you</p>

          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search events or locations…"
              className="w-full bg-zinc-900/80 border border-zinc-700 rounded-2xl px-5 py-3.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400/50 backdrop-blur-sm transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600">🔍</span>
          </div>

          {isAdmin && (
            <div className="flex justify-center gap-3 mt-6">
              <Link to="/create"
                className="px-6 py-2.5 bg-amber-400 text-zinc-950 rounded-xl text-sm font-black hover:bg-amber-300 transition-all">
                + Create Event
              </Link>
              <Link to="/admin"
                className="px-6 py-2.5 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-xl text-sm font-bold hover:border-zinc-500 transition-all">
                Admin Dashboard
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-5 py-12">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🎟</p>
            <p className="text-zinc-500 text-sm tracking-widest uppercase">No events found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(event => {
              const status = getStatus(event.date);
              const statusMap = {
                ongoing:  { cls: "text-emerald-400 bg-emerald-400/10 border-emerald-400/25", dot: "bg-emerald-400 animate-pulse", label: "Live" },
                upcoming: { cls: "text-sky-400 bg-sky-400/10 border-sky-400/25",             dot: "bg-sky-400",                   label: "Upcoming" },
                past:     { cls: "text-zinc-500 bg-zinc-800 border-zinc-700",                dot: "bg-zinc-600",                  label: "Ended" },
              };
              const s = statusMap[status];
              return (
                <div key={event._id} className="relative group">
                  <Link to={`/events/${event._id}`} className="block">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-600 transition-all duration-300 hover:shadow-xl hover:shadow-black/50 hover:-translate-y-1">
                      {/* Image */}
                      <div className="relative h-52 bg-zinc-800 overflow-hidden">
                        {event.image ? (
                          <img src={event.image} alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-zinc-800 to-zinc-900">🎟</div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />

                        {/* Status badge */}
                        <div className="absolute top-3 left-3">
                          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border backdrop-blur-sm ${s.cls}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                            {s.label}
                          </span>
                        </div>

                        {/* Price badge */}
                        <div className="absolute top-3 right-3">
                          <span className={`text-xs font-black px-3 py-1 rounded-full backdrop-blur-sm ${event.price === 0 ? "bg-emerald-400/20 text-emerald-400 border border-emerald-400/25" : "bg-amber-400/20 text-amber-400 border border-amber-400/25"}`}>
                            {event.price === 0 ? "Free" : `₦${event.price.toLocaleString()}`}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h2 className="font-black text-white text-base mb-2 line-clamp-1">{event.title}</h2>
                        <p className="text-zinc-500 text-xs mb-1">📍 {event.location}</p>
                        <p className="text-zinc-600 text-xs mb-4">📅 {new Date(event.date).toDateString()}</p>

                        {/* Capacity bar */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
                              style={{ width: `${Math.min((event.attendees.length / event.capacity) * 100, 100)}%` }} />
                          </div>
                          <span className="text-[10px] text-zinc-600 font-semibold">{event.attendees.length} going</span>
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Admin hover buttons */}
                  {isAdmin && (
                    <div className="absolute top-14 right-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button onClick={e => { e.preventDefault(); navigate(`/events/${event._id}/edit`); }}
                        className="bg-zinc-900/90 backdrop-blur-sm border border-zinc-700 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold shadow hover:border-amber-400/50 hover:text-amber-400 transition-all">
                        ✏️ Edit
                      </button>
                      <button onClick={e => { e.preventDefault(); setDeleteTarget(event); }}
                        className="bg-zinc-900/90 backdrop-blur-sm border border-zinc-700 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold shadow hover:border-red-500/50 hover:text-red-400 transition-all">
                        🗑️ Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* About Section */}
      <About />

      {/* FAQ Section */}
      <FAQ />

      {/* Contact Section */}
      <Contact />
    </div>
  );
}
