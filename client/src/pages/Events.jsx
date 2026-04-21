import { useEffect, useState, useRef } from "react";
import { API } from "../api";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import About from "../components/About";
import FAQ from "../components/FAQ";
import Contact from "../components/Contact";

// ── Helpers ──────────────────────────────────────────────────────────────────
const getStatus = (date) => {
  const now = new Date(), d = new Date(date);
  if (d < now) return "past";
  if (d <= new Date(now.getTime() + 86400000)) return "ongoing";
  return "upcoming";
};

const STATUS_LABEL = { ongoing: "🟢 Live", upcoming: "📅 Upcoming", past: "✓ Ended" };
const STATUS_CLS = {
  ongoing:  "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  upcoming: "text-sky-400 bg-sky-400/10 border-sky-400/30",
  past:     "text-zinc-500 bg-zinc-800 border-zinc-700",
};

// ── Horizontal scroll row (Netflix-style) ─────────────────────────────────────
function ScrollRow({ title, events, isAdmin, onDelete, viewAllLink }) {
  const rowRef = useRef(null);

  const scroll = (dir) => {
    if (rowRef.current) rowRef.current.scrollBy({ left: dir * 300, behavior: "smooth" });
  };

  if (!events.length) return null;

  return (
    <div className="mb-10">
      {/* Row header */}
      <div className="flex items-center justify-between px-5 md:px-10 mb-3">
        <h2 className="text-base font-black text-white">{title}</h2>
        <div className="flex items-center gap-3">
          {viewAllLink && (
            <span className="text-xs font-bold text-zinc-500 hover:text-amber-400 transition-colors cursor-pointer">
              View all →
            </span>
          )}
          <button onClick={() => scroll(-1)}
            className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all flex items-center justify-center text-sm">
            ‹
          </button>
          <button onClick={() => scroll(1)}
            className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all flex items-center justify-center text-sm">
            ›
          </button>
        </div>
      </div>

      {/* Scrollable strip */}
      <div
        ref={rowRef}
        className="flex gap-3 overflow-x-auto pb-2 px-5 md:px-10 scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {events.map(ev => {
          const status = getStatus(ev.date);
          return (
            <div key={ev._id} className="flex-shrink-0 w-44 group relative">
              <Link to={`/events/${ev._id}`} className="block">
                <div className="relative rounded-xl overflow-hidden bg-zinc-800 hover:ring-2 hover:ring-amber-400/60 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/60">
                  {/* Thumbnail */}
                  <div className="relative h-28 overflow-hidden">
                    {ev.image ? (
                      <img src={ev.image} alt={ev.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center text-4xl">🎟</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    {/* Price tag */}
                    <div className="absolute top-1.5 right-1.5">
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border backdrop-blur-sm ${ev.price === 0 ? "bg-emerald-400/20 text-emerald-400 border-emerald-400/25" : "bg-amber-400/20 text-amber-400 border-amber-400/25"}`}>
                        {ev.price === 0 ? "Free" : `₦${ev.price.toLocaleString()}`}
                      </span>
                    </div>
                    {/* Status dot */}
                    <div className="absolute top-1.5 left-1.5">
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border backdrop-blur-sm ${STATUS_CLS[status]}`}>
                        {STATUS_LABEL[status]}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-2.5">
                    <p className="font-black text-white text-[11px] leading-tight line-clamp-2 mb-1">{ev.title}</p>
                    <p className="text-zinc-600 text-[10px] truncate">📍 {ev.location}</p>
                    <p className="text-zinc-700 text-[10px]">📅 {new Date(ev.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                  </div>
                </div>
              </Link>

              {/* Admin buttons on hover */}
              {isAdmin && (
                <div className="absolute top-1.5 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 mt-[58px]">
                  <Link to={`/events/${ev._id}/edit`}
                    onClick={e => e.stopPropagation()}
                    className="bg-amber-400/90 text-zinc-950 text-[9px] font-black px-2 py-1 rounded">
                    Edit
                  </Link>
                  <button onClick={e => { e.preventDefault(); onDelete(ev); }}
                    className="bg-red-500/90 text-white text-[9px] font-black px-2 py-1 rounded">
                    Del
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Hero spotlight ────────────────────────────────────────────────────────────
function HeroSpotlight({ event }) {
  if (!event) return null;
  const status = getStatus(event.date);

  return (
    <div className="relative w-full overflow-hidden" style={{ height: "80vh", minHeight: "500px" }}>
      {/* BG image */}
      {event.image ? (
        <img src={event.image} alt={event.title}
          className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-950" />
      )}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950/30" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end px-5 md:px-10 pb-16 max-w-2xl">
        {/* Status */}
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full border w-fit mb-4 ${STATUS_CLS[status]}`}>
          {status === "ongoing" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
          {STATUS_LABEL[status]}
        </span>

        <h1 className="text-4xl md:text-6xl font-black leading-none tracking-tight text-white mb-3">
          {event.title}
        </h1>

        <div className="flex items-center gap-4 mb-4 text-sm text-zinc-400">
          <span>📍 {event.location}</span>
          <span>📅 {new Date(event.date).toDateString()}</span>
          <span className={`font-black ${event.price === 0 ? "text-emerald-400" : "text-amber-400"}`}>
            {event.price === 0 ? "Free" : `₦${event.price.toLocaleString()}`}
          </span>
        </div>

        <p className="text-zinc-400 text-sm leading-relaxed max-w-lg mb-6 line-clamp-3">
          {event.description}
        </p>

        <div className="flex items-center gap-3">
          <Link to={`/events/${event._id}`}
            className="bg-amber-400 text-zinc-950 font-black text-sm px-6 py-3 rounded-xl hover:bg-amber-300 transition-all shadow-lg shadow-amber-500/20">
            View Details →
          </Link>
          <span className="text-zinc-600 text-xs">
            {event.attendees?.length ?? 0} / {event.capacity} attending
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Location rows ──────────────────────────────────────────────────────────────
function LocationRows({ events, isAdmin, onDelete }) {
  const byLocation = events.reduce((acc, ev) => {
    const loc = ev.location?.split(",")[0]?.trim() || "Other";
    if (!acc[loc]) acc[loc] = [];
    acc[loc].push(ev);
    return acc;
  }, {});

  const locations = Object.entries(byLocation)
    .sort((a, b) => b[1].length - a[1].length)
    .filter(([, evs]) => evs.length >= 1);

  return (
    <>
      {locations.map(([loc, locEvents]) => (
        <ScrollRow
          key={loc}
          title={`📍 ${loc}`}
          events={locEvents}
          isAdmin={isAdmin}
          onDelete={onDelete}
          viewAllLink={locEvents.length > 6}
        />
      ))}
    </>
  );
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

  // Auto-rotate spotlight every 6s
  useEffect(() => {
    if (!events.length) return;
    const t = setInterval(() => setSpotlightIdx(i => (i + 1) % Math.min(events.length, 5)), 6000);
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
        e.location.toLowerCase().includes(search.toLowerCase()))
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

      {/* ── HERO SPOTLIGHT ── */}
      {!loading && spotlight && !search && <HeroSpotlight event={spotlight} />}

      {/* ── SEARCH BAR ── */}
      <div className="px-5 md:px-10 py-6 flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search events, locations…"
            className="w-full bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-600 px-5 py-3 rounded-xl text-sm focus:outline-none focus:border-amber-400/50 transition-all"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 text-sm">🔍</span>
        </div>

        {isAdmin && (
          <div className="flex gap-2">
            <Link to="/create" className="px-4 py-3 bg-amber-400 text-zinc-950 rounded-xl text-xs font-black hover:bg-amber-300 transition-all whitespace-nowrap">
              + Create
            </Link>
            <Link to="/admin" className="px-4 py-3 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-xl text-xs font-bold hover:border-zinc-500 transition-all whitespace-nowrap">
              Admin
            </Link>
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
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {filtered.map(ev => (
                <Link key={ev._id} to={`/events/${ev._id}`}
                  className="group bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-600 hover:-translate-y-1 transition-all duration-200">
                  <div className="h-28 overflow-hidden bg-zinc-800 relative">
                    {ev.image
                      ? <img src={ev.image} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      : <div className="w-full h-full flex items-center justify-center text-4xl">🎟</div>}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <div className="p-2.5">
                    <p className="font-black text-white text-[11px] line-clamp-2 mb-0.5">{ev.title}</p>
                    <p className="text-zinc-600 text-[10px] truncate">📍 {ev.location}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── ROWS (hidden while searching) ── */}
      {!search && !loading && (
        <>
          {live.length > 0 && (
            <ScrollRow title="🟢 Happening Now" events={live} isAdmin={isAdmin} onDelete={setDeleteTarget} />
          )}
          <ScrollRow title="📅 Upcoming Events" events={upcoming} isAdmin={isAdmin} onDelete={setDeleteTarget} viewAllLink />
          <ScrollRow title="✓ Past Events" events={past} isAdmin={isAdmin} onDelete={setDeleteTarget} viewAllLink />

          {/* Divider */}
          <div className="px-5 md:px-10 mb-8 mt-4">
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
