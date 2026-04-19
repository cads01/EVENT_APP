import { useEffect, useState, useRef, useCallback } from "react";
import { API } from "../api";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import About from "../components/About";
import FAQ from "../components/FAQ";
import Contact from "../components/Contact";


// ── Auto-sliding carousel ────────────────────────────────────────────────────
function Carousel({ events }) {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(null);
  const timerRef = useRef(null);
  const featured = events.slice(0, 6);

  const next = useCallback(() => setActive(a => (a + 1) % featured.length), [featured.length]);
  const prev = () => setActive(a => (a - 1 + featured.length) % featured.length);

  useEffect(() => {
    timerRef.current = setInterval(next, 4000);
    return () => clearInterval(timerRef.current);
  }, [next]);

  const pauseTimer = () => clearInterval(timerRef.current);
  const resumeTimer = () => { timerRef.current = setInterval(next, 4000); };

  if (!featured.length) return null;

  const getStatus = (date) => {
    const now = new Date(), d = new Date(date);
    if (d < now) return { label: "Ended", cls: "text-zinc-400 bg-zinc-800 border-zinc-700" };
    if (d <= new Date(now.getTime() + 86400000)) return { label: "Live Now", cls: "text-emerald-400 bg-emerald-400/10 border-emerald-400/25", pulse: true };
    return { label: "Upcoming", cls: "text-sky-400 bg-sky-400/10 border-sky-400/25" };
  };

  return (
    <div className="relative w-full overflow-hidden" onMouseEnter={pauseTimer} onMouseLeave={resumeTimer}>
      {/* Track */}
      <div className="flex gap-4 px-5 pb-6 overflow-visible" style={{ width: "max-content" }}>
        {featured.map((ev, i) => {
          const st = getStatus(ev.date);
          const isActive = i === active;
          const isHov = hovered === i;
          return (
            <Link
              key={ev._id}
              to={`/events/${ev._id}`}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                width: isActive ? "380px" : "260px",
                opacity: isActive ? 1 : 0.55,
                transform: isHov ? "translateY(-8px) scale(1.02)" : isActive ? "translateY(0)" : "translateY(6px)",
                transition: "all 0.5s cubic-bezier(0.4,0,0.2,1)",
                flexShrink: 0,
              }}
              className="block rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-600 hover:shadow-2xl hover:shadow-black/60 relative group"
              onClick={e => { if (!isActive) { e.preventDefault(); setActive(i); } }}
            >
              {/* Image */}
              <div className="relative overflow-hidden" style={{ height: isActive ? "240px" : "180px", transition: "height 0.5s" }}>
                {ev.image ? (
                  <img src={ev.image} alt={ev.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center text-6xl">🎟</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/30 to-transparent" />

                {/* Status */}
                <div className="absolute top-3 left-3">
                  <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border backdrop-blur-sm ${st.cls}`}>
                    {st.pulse && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                    {st.label}
                  </span>
                </div>

                {/* Price */}
                <div className="absolute top-3 right-3">
                  <span className={`text-xs font-black px-2.5 py-1 rounded-full border backdrop-blur-sm ${ev.price === 0 ? "bg-emerald-400/20 text-emerald-400 border-emerald-400/25" : "bg-amber-400/20 text-amber-400 border-amber-400/25"}`}>
                    {ev.price === 0 ? "Free" : `₦${ev.price.toLocaleString()}`}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-black text-white text-sm leading-tight mb-2 line-clamp-2">{ev.title}</h3>
                <p className="text-zinc-500 text-[11px] mb-1 truncate">📍 {ev.location}</p>
                <p className="text-zinc-600 text-[11px] mb-3">📅 {new Date(ev.date).toDateString()}</p>

                {/* Hover detail popup */}
                <div className={`overflow-hidden transition-all duration-300 ${isHov || isActive ? "max-h-20 opacity-100" : "max-h-0 opacity-0"}`}>
                  <p className="text-zinc-500 text-[11px] line-clamp-2 mb-3">{ev.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-600">{ev.attendees?.length ?? 0} attending</span>
                    <span className="text-[10px] font-bold text-amber-400 group-hover:underline">View details →</span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Nav arrows */}
      <button onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-zinc-900/90 border border-zinc-700 text-white flex items-center justify-center hover:bg-zinc-800 transition-all shadow-lg text-sm">
        ‹
      </button>
      <button onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-zinc-900/90 border border-zinc-700 text-white flex items-center justify-center hover:bg-zinc-800 transition-all shadow-lg text-sm">
        ›
      </button>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-2">
        {featured.map((_, i) => (
          <button key={i} onClick={() => setActive(i)}
            className={`rounded-full transition-all duration-300 ${i === active ? "w-6 h-1.5 bg-amber-400" : "w-1.5 h-1.5 bg-zinc-700 hover:bg-zinc-500"}`} />
        ))}
      </div>
    </div>
  );
}

// ── Events by location section ───────────────────────────────────────────────
function EventsByLocation({ events }) {
  const [expandedLocation, setExpandedLocation] = useState(null);

  // Group events by location
  const byLocation = events.reduce((acc, ev) => {
    const loc = ev.location?.split(",")[0]?.trim() || "Other";
    if (!acc[loc]) acc[loc] = [];
    acc[loc].push(ev);
    return acc;
  }, {});

  const locations = Object.entries(byLocation).sort((a, b) => b[1].length - a[1].length);

  const getStatus = (date) => {
    const now = new Date(), d = new Date(date);
    if (d < now) return "past";
    if (d <= new Date(now.getTime() + 86400000)) return "ongoing";
    return "upcoming";
  };

  const statusColor = { ongoing: "text-emerald-400", upcoming: "text-sky-400", past: "text-zinc-600" };

  return (
    <div className="max-w-6xl mx-auto px-5 py-16">
      <div className="flex items-center gap-4 mb-10">
        <div>
          <p className="text-[10px] tracking-[0.35em] uppercase text-amber-400 font-bold mb-1">Browse</p>
          <h2 className="text-3xl font-black text-white">Events by Location</h2>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-zinc-700 to-transparent ml-4" />
      </div>

      <div className="space-y-10">
        {locations.map(([location, locEvents]) => {
          const isExpanded = expandedLocation === location;
          const displayEvents = isExpanded ? locEvents : locEvents.slice(0, 3);
          const hasMore = locEvents.length > 3;

          return (
            <div key={location}>
              {/* Location header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-base">📍</div>
                  <div>
                    <h3 className="font-black text-white text-lg leading-none">{location}</h3>
                    <p className="text-zinc-600 text-xs mt-0.5">{locEvents.length} event{locEvents.length !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                {hasMore && (
                  <button
                    onClick={() => setExpandedLocation(isExpanded ? null : location)}
                    className="flex items-center gap-2 text-xs font-bold text-amber-400 border border-amber-400/25 bg-amber-400/5 px-4 py-2 rounded-xl hover:bg-amber-400/10 transition-all">
                    {isExpanded ? "Show less ↑" : `View all ${locEvents.length} →`}
                  </button>
                )}
              </div>

              {/* Events row */}
              <div className={`grid gap-3 transition-all duration-500 ${
                displayEvents.length === 1 ? "grid-cols-1 max-w-sm" :
                displayEvents.length === 2 ? "grid-cols-2" :
                "grid-cols-1 md:grid-cols-3"
              }`}>
                {displayEvents.map(ev => {
                  const status = getStatus(ev.date);
                  return (
                    <Link key={ev._id} to={`/events/${ev._id}`}
                      className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-600 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40 transition-all duration-300">
                      <div className="relative h-40 overflow-hidden bg-zinc-800">
                        {ev.image ? (
                          <img src={ev.image} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-5xl">🎟</div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent" />
                        <div className="absolute bottom-2 right-2">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border backdrop-blur-sm ${ev.price === 0 ? "bg-emerald-400/20 text-emerald-400 border-emerald-400/25" : "bg-amber-400/20 text-amber-400 border-amber-400/25"}`}>
                            {ev.price === 0 ? "Free" : `₦${ev.price.toLocaleString()}`}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-black text-white text-sm line-clamp-1 flex-1">{ev.title}</h4>
                          <span className={`text-[9px] font-bold tracking-widest uppercase flex-shrink-0 ${statusColor[status]}`}>
                            {status === "ongoing" ? "🟢 Live" : status === "upcoming" ? "📅" : "✓"}
                          </span>
                        </div>
                        <p className="text-zinc-600 text-[11px]">📅 {new Date(ev.date).toDateString()}</p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex-1 h-0.5 bg-zinc-800 rounded-full mr-2">
                            <div className="h-full bg-amber-400/50 rounded-full"
                              style={{ width: `${Math.min((ev.attendees?.length / ev.capacity) * 100, 100)}%` }} />
                          </div>
                          <span className="text-[10px] text-zinc-600 flex-shrink-0">{ev.attendees?.length ?? 0} going</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="mt-8 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── All Events Grid ──────────────────────────────────────────────────────────
function AllEventsGrid({ events, isAdmin, deleteTarget, setDeleteTarget, deleting, handleDelete, navigate }) {
  const getStatus = (date) => {
    const now = new Date(), d = new Date(date);
    if (d < now) return "past";
    if (d <= new Date(now.getTime() + 86400000)) return "ongoing";
    return "upcoming";
  };
  const statusMap = {
    ongoing:  { cls: "text-emerald-400 bg-emerald-400/10 border-emerald-400/25", dot: "bg-emerald-400 animate-pulse", label: "Live" },
    upcoming: { cls: "text-sky-400 bg-sky-400/10 border-sky-400/25",             dot: "bg-sky-400",                   label: "Upcoming" },
    past:     { cls: "text-zinc-500 bg-zinc-800 border-zinc-700",                dot: "bg-zinc-600",                  label: "Ended" },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {events.map(event => {
        const status = getStatus(event.date);
        const s = statusMap[status];
        return (
          <div key={event._id} className="relative group">
            <Link to={`/events/${event._id}`} className="block">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-600 transition-all duration-300 hover:shadow-xl hover:shadow-black/50 hover:-translate-y-1">
                <div className="relative h-52 bg-zinc-800 overflow-hidden">
                  {event.image ? (
                    <img src={event.image} alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-zinc-800 to-zinc-900">🎟</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border backdrop-blur-sm ${s.cls}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{s.label}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className={`text-xs font-black px-3 py-1 rounded-full backdrop-blur-sm border ${event.price === 0 ? "bg-emerald-400/20 text-emerald-400 border-emerald-400/25" : "bg-amber-400/20 text-amber-400 border-amber-400/25"}`}>
                      {event.price === 0 ? "Free" : `₦${event.price.toLocaleString()}`}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h2 className="font-black text-white text-base mb-2 line-clamp-1">{event.title}</h2>
                  <p className="text-zinc-500 text-xs mb-1">📍 {event.location}</p>
                  <p className="text-zinc-600 text-xs mb-4">📅 {new Date(event.date).toDateString()}</p>
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
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
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
    API.get("/events").then(res => setEvents(res.data)).finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await API.delete(`/events/${deleteTarget._id}`);
      setEvents(prev => prev.filter(e => e._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) { alert(err.response?.data?.message || "Failed to delete"); }
    finally { setDeleting(false); }
  };

  const filtered = events.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white" style={{ fontFamily: "'Syne', sans-serif" }}>

      {/* Transparent Nav */}
      <Navbar user={user} isAdmin={isAdmin} events={events} />

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

      {/* ── HERO ── tall, full-bleed with grid overlay */}
      <div className="relative overflow-hidden" style={{ minHeight: "100vh" }}>
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black" />
        <div className="absolute inset-0 opacity-40"
          style={{ backgroundImage: "radial-gradient(ellipse at 15% 60%, #f59e0b22 0%, transparent 55%), radial-gradient(ellipse at 85% 20%, #0ea5e922 0%, transparent 55%), radial-gradient(ellipse at 50% 90%, #f97316 11 0%, transparent 40%)" }} />
        <div className="absolute inset-0"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)", backgroundSize: "70px 70px" }} />

        {/* Hero content */}
        <div className="relative flex flex-col items-center justify-center text-center px-5 pt-40 pb-16">
          <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[10px] font-bold tracking-widest uppercase px-4 py-2 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Discover · Attend · Experience
          </div>

          <h1 className="text-6xl md:text-8xl font-black leading-none tracking-tight mb-6 max-w-4xl">
            Find Your Next<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400">
              Great Event
            </span>
          </h1>

          <p className="text-zinc-400 text-lg max-w-md mb-10 leading-relaxed">
            Discover events happening around you. From tech conferences to hospital inaugurations — all in one place.
          </p>

          {/* Search */}
          <div className="relative w-full max-w-lg mb-4">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search events, locations…"
              className="w-full bg-zinc-900/70 backdrop-blur-xl border border-zinc-700 rounded-2xl px-6 py-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400/60 transition-all shadow-2xl"
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-600 text-base">🔍</span>
          </div>

          {isAdmin && (
            <div className="flex gap-3 mt-2">
              <Link to="/create" className="px-6 py-2.5 bg-amber-400 text-zinc-950 rounded-xl text-sm font-black hover:bg-amber-300 transition-all shadow-lg shadow-amber-500/20">
                + Create Event
              </Link>
              <Link to="/admin" className="px-6 py-2.5 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-xl text-sm font-bold hover:border-zinc-500 hover:text-white transition-all">
                Admin Dashboard →
              </Link>
            </div>
          )}

          {/* Scroll hint */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
            <span className="text-zinc-600 text-[10px] tracking-widest uppercase">Scroll</span>
            <div className="w-px h-8 bg-gradient-to-b from-zinc-600 to-transparent" />
          </div>
        </div>
      </div>

      {/* ── CAROUSEL ── */}
      {!loading && events.length > 0 && (
        <div className="py-12 border-t border-zinc-900">
          <div className="max-w-6xl mx-auto px-5 mb-6">
            <p className="text-[10px] tracking-[0.35em] uppercase text-amber-400 font-bold mb-1">Featured</p>
            <h2 className="text-2xl font-black text-white">Trending Events</h2>
          </div>
          <Carousel events={events} />
        </div>
      )}

      {/* ── ALL EVENTS GRID ── */}
      <div className="max-w-6xl mx-auto px-5 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[10px] tracking-[0.35em] uppercase text-amber-400 font-bold mb-1">
              {search ? "Search Results" : "All Events"}
            </p>
            <h2 className="text-2xl font-black text-white">
              {search ? `"${search}"` : "Browse All"}
              <span className="text-zinc-700 font-normal text-base ml-3">({filtered.length})</span>
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🎟</p>
            <p className="text-zinc-600 text-sm tracking-widest uppercase">No events found</p>
          </div>
        ) : (
          <AllEventsGrid
            events={filtered}
            isAdmin={isAdmin}
            deleteTarget={deleteTarget}
            setDeleteTarget={setDeleteTarget}
            deleting={deleting}
            handleDelete={handleDelete}
            navigate={navigate}
          />
        )}
      </div>

      {/* ── EVENTS BY LOCATION ── */}
      {!loading && events.length > 0 && !search && (
        <div className="border-t border-zinc-900">
          <EventsByLocation events={events} />
        </div>
      )}

      {/* Landing sections */}
      <About />
      <FAQ />
      <Contact />
    </div>
  );
}
