import { useEffect, useState, useRef } from "react";
import { API } from "../api";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import About from "../components/About";
import FAQ from "../components/FAQ";
import Contact from "../components/Contact";

const EVENT_TYPE_COLORS = {
  Wedding:     "text-pink-400 bg-pink-400/10 border-pink-400/25",
  Birthday:    "text-purple-400 bg-purple-400/10 border-purple-400/25",
  Concert:     "text-rose-400 bg-rose-400/10 border-rose-400/25",
  Conference:  "text-sky-400 bg-sky-400/10 border-sky-400/25",
  Festival:    "text-orange-400 bg-orange-400/10 border-orange-400/25",
  Corporate:   "text-blue-400 bg-blue-400/10 border-blue-400/25",
  Sports:      "text-green-400 bg-green-400/10 border-green-400/25",
  Religious:   "text-amber-400 bg-amber-400/10 border-amber-400/25",
  Graduation:  "text-yellow-400 bg-yellow-400/10 border-yellow-400/25",
  Workshop:    "text-teal-400 bg-teal-400/10 border-teal-400/25",
  default:     "text-zinc-400 bg-zinc-800 border-zinc-700",
};

const getStatus = (date) => {
  const now = new Date(), d = new Date(date);
  if (d < now) return "past";
  if (d <= new Date(now.getTime() + 86400000)) return "ongoing";
  return "upcoming";
};

// ── Spotlight card (7XMovies style) ─────────────────────────────────────────
function SpotlightCard({ event }) {
  if (!event) return null;
  const status = getStatus(event.date);
  const typeCls = EVENT_TYPE_COLORS[event.eventType] || EVENT_TYPE_COLORS.default;

  return (
    <div className="mx-5 md:mx-10 mb-8 rounded-3xl overflow-hidden relative"
      style={{ minHeight: "340px", background: "#111" }}>

      {/* Background — event image fills right side */}
      {event.image && (
        <>
          <img src={event.image} alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/85 to-zinc-950/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent" />
        </>
      )}

      <div className="relative flex items-center gap-6 p-6 md:p-10">
        {/* LEFT — host/organizer image (circular) */}
        <div className="flex-shrink-0">
          {event.hostImage ? (
            <img src={event.hostImage} alt="Host"
              className="w-36 h-36 md:w-52 md:h-52 rounded-2xl object-cover ring-4 ring-amber-400/30 shadow-2xl shadow-black/60" />
          ) : event.image ? (
            <img src={event.image} alt={event.title}
              className="w-36 h-36 md:w-52 md:h-52 rounded-2xl object-cover ring-4 ring-amber-400/30 shadow-2xl shadow-black/60" />
          ) : (
            <div className="w-36 h-36 md:w-52 md:h-52 rounded-2xl bg-zinc-800 ring-4 ring-amber-400/20 flex items-center justify-center text-6xl">
              🎟
            </div>
          )}
        </div>

        {/* RIGHT — event details */}
        <div className="flex-1 min-w-0">
          {/* Status + type badges */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {status === "ongoing" && (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border text-emerald-400 bg-emerald-400/10 border-emerald-400/25">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Live Now
              </span>
            )}
            {status === "upcoming" && (
              <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border text-sky-400 bg-sky-400/10 border-sky-400/25">
                📅 Upcoming
              </span>
            )}
            {event.eventType && event.eventType !== "General" && (
              <span className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border ${typeCls}`}>
                {event.eventType}
              </span>
            )}
          </div>

          <h2 className="text-3xl md:text-5xl font-black text-white leading-none tracking-tight mb-3 line-clamp-2">
            {event.title}
          </h2>

          {/* Meta row */}
          <div className="flex items-center gap-4 mb-3 flex-wrap">
            <span className="text-zinc-400 text-sm">📍 {event.location}</span>
            <span className="text-zinc-400 text-sm">
              📅 {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
            <span className={`text-sm font-black ${event.price === 0 ? "text-emerald-400" : "text-amber-400"}`}>
              {event.price === 0 ? "Free" : `₦${event.price.toLocaleString()}`}
            </span>
          </div>

          {/* Organizer */}
          {event.createdBy?.name && (
            <p className="text-zinc-500 text-xs mb-3">
              Hosted by <span className="text-zinc-300 font-semibold">{event.createdBy.name}</span>
            </p>
          )}

          <p className="text-zinc-400 text-sm leading-relaxed line-clamp-2 mb-5 max-w-xl">
            {event.description}
          </p>

          <Link to={`/events/${event._id}`}
            className="inline-flex items-center gap-2 bg-amber-400 text-zinc-950 font-black text-sm px-6 py-3 rounded-xl hover:bg-amber-300 transition-all shadow-lg shadow-amber-500/20">
            View Details →
          </Link>
        </div>

        {/* Right edge — large bg image fading in */}
        {event.image && (
          <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-1/3 overflow-hidden rounded-r-3xl">
            <img src={event.image} alt="" className="w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 to-transparent" />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Horizontal scroll row ────────────────────────────────────────────────────
function ScrollRow({ title, events, isAdmin, onDelete }) {
  const rowRef = useRef(null);
  const scroll = (dir) => rowRef.current?.scrollBy({ left: dir * 400, behavior: "smooth" });

  if (!events.length) return null;

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between px-5 md:px-10 mb-4">
        <h2 className="text-white font-black text-lg">{title}</h2>
        <div className="flex gap-2">
          <button onClick={() => scroll(-1)}
            className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all flex items-center justify-center">
            ‹
          </button>
          <button onClick={() => scroll(1)}
            className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all flex items-center justify-center">
            ›
          </button>
        </div>
      </div>

      <div ref={rowRef} className="flex gap-4 overflow-x-auto pb-3 px-5 md:px-10"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {events.map(ev => {
          const status = getStatus(ev.date);
          const typeCls = EVENT_TYPE_COLORS[ev.eventType] || EVENT_TYPE_COLORS.default;
          return (
            <div key={ev._id} className="flex-shrink-0 w-64 group relative">
              <Link to={`/events/${ev._id}`} className="block">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-600 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/60 transition-all duration-300">
                  {/* Image */}
                  <div className="relative h-40 overflow-hidden bg-zinc-800">
                    {ev.image ? (
                      <img src={ev.image} alt={ev.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-zinc-700 to-zinc-900">🎟</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent" />

                    {/* Status badge */}
                    <div className="absolute top-2.5 left-2.5">
                      {status === "ongoing" && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-full border text-emerald-400 bg-emerald-400/10 border-emerald-400/25 backdrop-blur-sm">
                          <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />Live
                        </span>
                      )}
                      {status === "upcoming" && (
                        <span className="text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-full border text-sky-400 bg-sky-400/10 border-sky-400/25 backdrop-blur-sm">
                          Soon
                        </span>
                      )}
                      {status === "past" && (
                        <span className="text-[9px] font-bold uppercase px-2 py-1 rounded-full border text-zinc-500 bg-zinc-800 border-zinc-700">
                          Ended
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="absolute top-2.5 right-2.5">
                      <span className={`text-[10px] font-black px-2 py-1 rounded-full border backdrop-blur-sm ${ev.price === 0 ? "bg-emerald-400/20 text-emerald-400 border-emerald-400/25" : "bg-amber-400/20 text-amber-400 border-amber-400/25"}`}>
                        {ev.price === 0 ? "Free" : `₦${ev.price.toLocaleString()}`}
                      </span>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-4">
                    <h3 className="font-black text-white text-sm leading-tight line-clamp-2 mb-2">{ev.title}</h3>

                    {/* Event type tag */}
                    {ev.eventType && ev.eventType !== "General" && (
                      <span className={`text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border mb-2 inline-block ${typeCls}`}>
                        {ev.eventType}
                      </span>
                    )}

                    <p className="text-zinc-500 text-xs truncate mb-0.5">📍 {ev.location}</p>
                    <p className="text-zinc-600 text-xs mb-3">
                      📅 {new Date(ev.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>

                    {/* Capacity bar */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
                          style={{ width: `${Math.min(((ev.attendees?.length ?? 0) / ev.capacity) * 100, 100)}%` }} />
                      </div>
                      <span className="text-[10px] text-zinc-600">{ev.attendees?.length ?? 0} going</span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Admin controls */}
              {isAdmin && (
                <div className="absolute top-12 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                  <Link to={`/events/${ev._id}/edit`} onClick={e => e.stopPropagation()}
                    className="bg-amber-400/90 text-zinc-950 text-[10px] font-black px-3 py-1.5 rounded-lg shadow">Edit</Link>
                  <button onClick={e => { e.preventDefault(); onDelete(ev); }}
                    className="bg-red-500/90 text-white text-[10px] font-black px-3 py-1.5 rounded-lg shadow">Del</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Location rows ─────────────────────────────────────────────────────────────
function LocationRows({ events, isAdmin, onDelete }) {
  const byLocation = events.reduce((acc, ev) => {
    const loc = ev.location?.split(",")[0]?.trim() || "Other";
    if (!acc[loc]) acc[loc] = [];
    acc[loc].push(ev);
    return acc;
  }, {});

  return Object.entries(byLocation)
    .sort((a, b) => b[1].length - a[1].length)
    .map(([loc, evs]) => (
      <ScrollRow key={loc} title={`📍 ${loc}`} events={evs} isAdmin={isAdmin} onDelete={onDelete} />
    ));
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [spotlightIdx, setSpotlightIdx] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    API.get("/events").then(res => setEvents(res.data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!events.length) return;
    const t = setInterval(() => setSpotlightIdx(i => (i + 1) % Math.min(events.length, 6)), 6000);
    return () => clearInterval(t);
  }, [events.length]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await API.delete(`/events/${deleteTarget._id}`);
      setEvents(prev => prev.filter(e => e._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) { alert(err.response?.data?.message || "Failed"); }
    finally { setDeleting(false); }
  };

  const filtered = search
    ? events.filter(e =>
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.location.toLowerCase().includes(search.toLowerCase()) ||
        (e.eventType || "").toLowerCase().includes(search.toLowerCase()))
    : events;

  const live     = filtered.filter(e => getStatus(e.date) === "ongoing");
  const upcoming = filtered.filter(e => getStatus(e.date) === "upcoming");
  const past     = filtered.filter(e => getStatus(e.date) === "past");
  const spotlight = events[spotlightIdx] || events[0];

  return (
    <div className="min-h-screen bg-zinc-950 text-white" style={{ fontFamily: "'Syne', sans-serif" }}>

      {/* Delete modal */}
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
                className="flex-1 border border-zinc-700 text-zinc-400 py-3 rounded-xl text-sm font-bold hover:border-zinc-500 hover:text-white transition-all">Cancel</button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 bg-red-500 text-white py-3 rounded-xl text-sm font-bold hover:bg-red-400 transition-all disabled:opacity-40">
                {deleting ? "Moving…" : "Move to Trash"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOP STRIP (scrollable thumbnails like 7XMovies top row) ── */}
      {!loading && events.length > 0 && !search && (
        <div className="pt-20 pb-4 border-b border-zinc-900">
          <div ref={null} className="flex gap-2 overflow-x-auto px-5 md:px-10"
            style={{ scrollbarWidth: "none" }}>
            {events.slice(0, 10).map((ev, i) => (
              <button key={ev._id} onClick={() => setSpotlightIdx(i)}
                className={`flex-shrink-0 rounded-xl overflow-hidden transition-all duration-300 ${i === spotlightIdx ? "ring-2 ring-amber-400 opacity-100 scale-105" : "opacity-50 hover:opacity-80"}`}
                style={{ width: "120px", height: "68px" }}>
                {ev.image ? (
                  <img src={ev.image} alt={ev.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-2xl">🎟</div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── SPOTLIGHT CARD ── */}
      {!loading && spotlight && !search && (
        <div className="pt-6">
          <SpotlightCard event={spotlight} />
        </div>
      )}

      {/* ── SEARCH + ADMIN ACTIONS ── */}
      <div className="px-5 md:px-10 py-5 flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search events, locations, types…"
            className="w-full bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-600 px-5 py-3 rounded-xl text-sm focus:outline-none focus:border-amber-400/50 transition-all" />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600">🔍</span>
        </div>
        {user && (
          <Link to="/my-tickets"
            className="px-4 py-3 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-xl text-xs font-bold hover:border-amber-400/40 hover:text-amber-400 transition-all whitespace-nowrap">
            🎫 My Tickets
          </Link>
        )}
        {isAdmin && (
          <div className="flex gap-2">
            <Link to="/create" className="px-4 py-3 bg-amber-400 text-zinc-950 rounded-xl text-xs font-black hover:bg-amber-300 transition-all whitespace-nowrap">+ Create</Link>
            <Link to="/admin" className="px-4 py-3 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-xl text-xs font-bold hover:border-zinc-500 transition-all whitespace-nowrap">Admin</Link>
          </div>
        )}
      </div>

      {/* ── SEARCH RESULTS ── */}
      {search && (
        <div className="px-5 md:px-10 mb-6">
          <p className="text-zinc-500 text-sm mb-4">
            <span className="text-white font-bold">{filtered.length}</span> results for "{search}"
          </p>
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-3">🎟</p>
              <p className="text-zinc-600 text-sm tracking-widest uppercase">No events found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map(ev => (
                <Link key={ev._id} to={`/events/${ev._id}`}
                  className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-600 hover:-translate-y-1 transition-all duration-200">
                  <div className="h-36 overflow-hidden bg-zinc-800 relative">
                    {ev.image
                      ? <img src={ev.image} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      : <div className="w-full h-full flex items-center justify-center text-4xl">🎟</div>}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <div className="p-3">
                    <p className="font-black text-white text-sm line-clamp-1 mb-0.5">{ev.title}</p>
                    {ev.eventType && ev.eventType !== "General" && (
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border mb-1 inline-block ${EVENT_TYPE_COLORS[ev.eventType] || EVENT_TYPE_COLORS.default}`}>
                        {ev.eventType}
                      </span>
                    )}
                    <p className="text-zinc-600 text-xs truncate">📍 {ev.location}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── ROWS ── */}
      {!search && !loading && (
        <>
          {live.length > 0 && <ScrollRow title="🟢 Happening Now" events={live} isAdmin={isAdmin} onDelete={setDeleteTarget} />}
          <ScrollRow title="📅 Upcoming Events" events={upcoming} isAdmin={isAdmin} onDelete={setDeleteTarget} />
          {past.length > 0 && <ScrollRow title="✓ Past Events" events={past} isAdmin={isAdmin} onDelete={setDeleteTarget} />}

          <div className="px-5 md:px-10 my-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-zinc-800" />
              <p className="text-[10px] tracking-[0.3em] uppercase text-zinc-600 font-bold">By Location</p>
              <div className="flex-1 h-px bg-zinc-800" />
            </div>
          </div>

          <LocationRows events={filtered} isAdmin={isAdmin} onDelete={setDeleteTarget} />
        </>
      )}

      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
        </div>
      )}

      <About />
      <FAQ />
      <Contact />
    </div>
  );
}
