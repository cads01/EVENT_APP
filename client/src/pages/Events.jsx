import { useEffect, useState, useRef, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API } from "../api";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../utils/Toast";
import { optimizeCloudinary } from "../utils/images";
import BlogCarousel from "../components/BlogCarousel";
import ErrorBoundary from "../components/ErrorBoundary";
import AmbientBackground from "../components/AmbientBackground";
import About from "../components/About";
import FAQ from "../components/FAQ";
import Contact from "../components/Contact";
import SectionHeader from "../components/SectionHeader";
import { PageSkeleton } from "../components/Skeleton";
import { btnPrimary, btnSecondary, inputCls, spinnerCls, containerWide } from "../utils/design";

const HeroCarousel = lazy(function() { return import("../components/HeroCarousel") });
const Recommendations = lazy(function() { return import("../components/Recommendations") });
const InteractiveGlobe = lazy(function() { return import("../components/InteractiveGlobe") });

const EVENT_TYPE_COLORS = {
  Wedding:    "text-pink-400 bg-pink-400/10 border-pink-400/25",
  Birthday:   "text-purple-400 bg-purple-400/10 border-purple-400/25",
  Concert:    "text-rose-400 bg-rose-400/10 border-rose-400/25",
  Conference: "text-sky-400 bg-sky-400/10 border-sky-400/25",
  Festival:   "text-orange-400 bg-orange-400/10 border-orange-400/25",
  Corporate:  "text-blue-400 bg-blue-400/10 border-blue-400/25",
  Sports:     "text-green-400 bg-green-400/10 border-green-400/25",
  Religious:  "text-amber-400 bg-amber-400/10 border-amber-400/25",
  Graduation: "text-yellow-400 bg-yellow-400/10 border-yellow-400/25",
  Workshop:   "text-teal-400 bg-teal-400/10 border-teal-400/25",
  default:    "text-zinc-400 bg-zinc-800 border-zinc-700",
};

const TYPE_ICONS = {
  Concert: "🎵", Wedding: "💒", Birthday: "🎂", Conference: "💼",
  Festival: "🎪", Corporate: "🏢", Sports: "⚽", Religious: "⛪",
  Graduation: "🎓", Workshop: "🔧", default: "📌",
};

const getStatus = function(date) {
  const now = new Date(), d = new Date(date);
  if (d < now) return "past";
  if (d <= new Date(now.getTime() + 86400000)) return "ongoing";
  return "upcoming";
};

function SearchRow({ search, onSearchChange, filterStatus, filterType, filterSort, onFilterChange, user, isAdmin, events, loading }) {
  const [focused, setFocused] = useState(false);
  const types = ["Concert", "Workshop", "Conference", "Festival", "Corporate", "Wedding", "Sports"];

  return (
    <div className="pt-6 pb-4 relative z-10">
      <div className={"max-w-4xl mx-auto bg-zinc-900/80 backdrop-blur-xl border rounded-2xl p-5 transition-all duration-300 " + (focused ? "border-amber-400/40 shadow-lg shadow-amber-500/5" : "border-zinc-800")}>
        <div className="relative flex items-center gap-3">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg pointer-events-none" style={{ filter: focused ? "none" : "grayscale(0.5)" }}>
              {focused ? "🔍" : "🔍"}
            </span>
            <input value={search} onChange={function(e) { onSearchChange(e.target.value) }}
              onFocus={function() { setFocused(true) }} onBlur={function() { setFocused(false) }}
              placeholder="Search events, locations, categories…"
              className={"w-full pl-12 pr-4 py-3.5 rounded-xl text-sm transition-all bg-zinc-800/50 border text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400/50 " + (focused ? "border-amber-400/30" : "border-zinc-700")} />
          </div>
          {user && (
            <Link to="/my-tickets"
              className="hidden sm:flex items-center gap-2 px-5 py-3.5 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-xl text-xs font-bold hover:border-amber-400/40 hover:text-amber-400 transition-all whitespace-nowrap">
              <span>🎫</span> My Tickets
            </Link>
          )}
          {isAdmin && (
            <Link to="/create"
              className="hidden sm:flex items-center gap-2 px-5 py-3.5 bg-gradient-to-r from-amber-400 to-orange-400 text-zinc-950 rounded-xl text-xs font-black hover:from-amber-300 hover:to-orange-300 transition-all shadow-lg shadow-amber-500/20 whitespace-nowrap">
              <span>+</span> Create
            </Link>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-4">
          {["", "upcoming", "ongoing", "past"].map(function(s) {
            const labels = { "": "All Events", upcoming: "Upcoming", ongoing: "Live", past: "Past" };
            const active = filterStatus === s;
            return (
              <button key={s} onClick={function() { onFilterChange(s, undefined, undefined) }}
                className={"px-3.5 py-1.5 text-[11px] font-bold tracking-wider rounded-lg transition-all duration-200 " + (active ? "bg-amber-400 text-zinc-950 shadow-sm" : "text-zinc-500 hover:text-white hover:bg-zinc-800")}>
                {labels[s]}
              </button>
            );
          })}
          <span className="w-px h-5 bg-zinc-700 mx-1 hidden sm:block" />
          {types.map(function(t) {
            const active = filterType === t;
            return (
              <button key={t} onClick={function() { onFilterChange(undefined, active ? "" : t, undefined) }}
                className={"hidden sm:inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold tracking-wider rounded-lg transition-all duration-200 " + (active ? "bg-amber-400/10 text-amber-400 border border-amber-400/20" : "text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/50")}>
                {TYPE_ICONS[t] || "📌"} {t}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function FilterPagination({ page, totalPages, onPageChange, search, filterStatus, filterType, filterSort }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-3 pb-8">
      <button onClick={function() { var next = Math.max(1, page - 1); onPageChange(next) }}
        disabled={page <= 1}
        className="px-4 py-2 rounded-xl border border-zinc-800 text-zinc-400 text-sm font-bold hover:border-zinc-600 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed">← Prev</button>
      {Array.from({ length: Math.min(totalPages, 5) }, function(_, i) {
        var p = page <= 3 ? i + 1 : (page > totalPages - 2 ? totalPages - 4 + i : page - 2 + i);
        if (p < 1 || p > totalPages) return null;
        return (
          <button key={p} onClick={function() { onPageChange(p) }}
            className={"w-9 h-9 rounded-xl text-xs font-bold transition-all " + (p === page ? "bg-amber-400 text-zinc-950 shadow-md" : "text-zinc-500 hover:text-white hover:bg-zinc-800 border border-zinc-800")}>
            {p}
          </button>
        );
      })}
      <button onClick={function() { var next = Math.min(totalPages, page + 1); onPageChange(next) }}
        disabled={page >= totalPages}
        className="px-4 py-2 rounded-xl border border-zinc-800 text-zinc-400 text-sm font-bold hover:border-zinc-600 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed">Next →</button>
    </div>
  );
}

function ScrollRow({ title, events, isAdmin, onDelete, sectionNum }) {
  const rowRef = useRef(null);
  if (!events.length) return null;

  var scroll = function(dir) {
    rowRef.current?.scrollBy({ left: dir * 400, behavior: "smooth" });
  };

  return (
    <div className="mb-10 relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {sectionNum !== undefined && (
            <span className="text-[10px] font-black text-zinc-700 tracking-widest">0{sectionNum}</span>
          )}
          <h2 className="text-white font-black text-lg">{title}</h2>
          <span className="text-[11px] text-zinc-600 font-bold bg-zinc-800/50 px-2.5 py-0.5 rounded-full">{events.length}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={function() { scroll(-1) }}
            className="w-9 h-9 rounded-full bg-zinc-800/80 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-700 hover:scale-105 transition-all flex items-center justify-center text-lg">‹</button>
          <button onClick={function() { scroll(1) }}
            className="w-9 h-9 rounded-full bg-zinc-800/80 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-700 hover:scale-105 transition-all flex items-center justify-center text-lg">›</button>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-zinc-950 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-zinc-950 to-transparent z-10 pointer-events-none" />
        <div ref={rowRef} className="flex gap-4 overflow-x-auto pb-3 -mx-5 md:-mx-10 px-5 md:px-10 scrollbar-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {events.map(function(ev, idx) {
            const status = getStatus(ev.date);
            const typeCls = EVENT_TYPE_COLORS[ev.eventType] || EVENT_TYPE_COLORS.default;
            return (
              <motion.div key={ev._id} className="flex-shrink-0 w-64 group relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}>
                <Link to={"/events/" + ev._id} className="block">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-600 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/60 transition-all duration-300">
                    <div className="relative h-40 overflow-hidden bg-zinc-800">
                      {ev.image ? (
                        <img src={optimizeCloudinary(ev.image, 400)} alt={ev.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-zinc-700 to-zinc-900">🎟</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent" />
                      <div className="absolute top-2.5 left-2.5">
                        {status === "ongoing" && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-full border text-emerald-400 bg-emerald-400/10 border-emerald-400/25 backdrop-blur-sm">
                            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />Live
                          </span>
                        )}
                        {status === "upcoming" && (
                          <span className="text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-full border text-sky-400 bg-sky-400/10 border-sky-400/25 backdrop-blur-sm">Soon</span>
                        )}
                        {status === "past" && (
                          <span className="text-[9px] font-bold uppercase px-2 py-1 rounded-full border text-zinc-500 bg-zinc-800 border-zinc-700">Ended</span>
                        )}
                      </div>
                      <div className="absolute top-2.5 right-2.5">
                        <span className={"text-[10px] font-black px-2 py-1 rounded-full border backdrop-blur-sm " + (ev.price === 0 ? "bg-emerald-400/20 text-emerald-400 border-emerald-400/25" : "bg-amber-400/20 text-amber-400 border-amber-400/25")}>
                          {ev.price === 0 ? "Free" : "₦" + ev.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-black text-white text-sm leading-tight line-clamp-2 mb-2">{ev.title}</h3>
                      {ev.eventType && ev.eventType !== "General" && (
                        <span className={"text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border mb-2 inline-block " + typeCls}>
                          {ev.eventType}
                        </span>
                      )}
                      <p className="text-zinc-500 text-xs truncate mb-0.5">📍 {ev.location}</p>
                      <p className="text-zinc-600 text-xs mb-3">
                        📅 {new Date(ev.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
                            style={{ width: Math.min(((ev.attendees?.length ?? 0) / ev.capacity) * 100, 100) + "%" }} />
                        </div>
                        <span className="text-[10px] text-zinc-600">{ev.attendees?.length ?? 0} going</span>
                      </div>
                    </div>
                  </div>
                </Link>
                {isAdmin && (
                  <div className="absolute top-12 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                    <Link to={"/events/" + ev._id + "/edit"} onClick={function(e) { e.stopPropagation() }}
                      className="bg-amber-400/90 text-zinc-950 text-[10px] font-black px-3 py-1.5 rounded-lg shadow">Edit</Link>
                    <button onClick={function(e) { e.preventDefault(); onDelete(ev) }}
                      className="bg-red-500/90 text-white text-[10px] font-black px-3 py-1.5 rounded-lg shadow">Del</button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function LocationRows({ events, isAdmin, onDelete }) {
  const byLocation = events.reduce(function(acc, ev) {
    const loc = ev.location?.split(",")[0]?.trim() || "Other";
    if (!acc[loc]) acc[loc] = [];
    acc[loc].push(ev);
    return acc;
  }, {});
  return Object.entries(byLocation)
    .sort(function(a, b) { return b[1].length - a[1].length })
    .map(function(item, i) {
      return <ScrollRow key={item[0]} title={"📍 " + item[0]} events={item[1]} isAdmin={isAdmin} onDelete={onDelete} sectionNum={i + 1} />;
    });
}

function SpotlightSection({ events }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const featured = events.slice(0, 6);
  if (!featured.length) return null;

  const ev = featured[activeIdx];
  const status = getStatus(ev.date);
  const typeCls = EVENT_TYPE_COLORS[ev.eventType] || EVENT_TYPE_COLORS.default;

  return (
    <div className="py-10 relative">
      <div className="flex items-center gap-4 mb-6">
        <div>
          <p className="text-[10px] tracking-[0.35em] uppercase text-amber-400 font-bold mb-1">Featured</p>
          <h2 className="text-2xl font-black text-white">Event Spotlight</h2>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-zinc-700 to-transparent ml-2" />
      </div>

      <div className="relative rounded-3xl overflow-hidden mb-5 group"
        style={{ minHeight: "360px", background: "#0d0d0d" }}>
        <div className="absolute -inset-[1px] bg-gradient-to-r from-amber-400/30 via-amber-600/10 to-orange-400/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        {ev.image && (
          <>
            <AnimatePresence mode="wait">
              <motion.img key={ev._id} src={ev.image} alt=""
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 0.25, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 w-full h-full object-cover" />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-zinc-950/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 to-transparent" />
          </>
        )}
        <div className="relative flex items-center gap-6 p-6 md:p-10">
          <div className="flex-shrink-0">
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-2xl overflow-hidden ring-2 ring-amber-400/30 shadow-2xl shadow-black/60">
              {ev.hostImage ? (
                <img src={ev.hostImage} alt="Host" className="w-full h-full object-cover" />
              ) : ev.image ? (
                <img src={ev.image} alt={ev.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-5xl">🎟</div>
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {status === "ongoing" && (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border text-emerald-400 bg-emerald-400/10 border-emerald-400/25">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Live Now
                </span>
              )}
              {status === "upcoming" && (
                <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border text-sky-400 bg-sky-400/10 border-sky-400/25">📅 Upcoming</span>
              )}
              {ev.eventType && ev.eventType !== "General" && (
                <span className={"text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border " + typeCls}>
                  {ev.eventType}
                </span>
              )}
            </div>
            <AnimatePresence mode="wait">
              <motion.h2 key={ev._id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="text-3xl md:text-4xl font-black text-white leading-none tracking-tight mb-3 line-clamp-2">
                {ev.title}
              </motion.h2>
            </AnimatePresence>
            <div className="flex items-center gap-4 mb-2 flex-wrap text-sm text-zinc-400">
              <span>📍 {ev.location}</span>
              <span>📅 {new Date(ev.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              <span className={"font-black " + (ev.price === 0 ? "text-emerald-400" : "text-amber-400")}>
                {ev.price === 0 ? "Free" : "₦" + ev.price.toLocaleString()}
              </span>
            </div>
            {ev.createdBy?.name && (
              <p className="text-zinc-500 text-xs mb-3">
                Hosted by <span className="text-zinc-300 font-semibold">{ev.createdBy.name}</span>
              </p>
            )}
            <p className="text-zinc-400 text-sm leading-relaxed line-clamp-2 mb-5 max-w-lg">{ev.description}</p>
            <Link to={"/events/" + ev._id}
              className="inline-flex items-center gap-2 bg-amber-400 text-zinc-950 font-black text-sm px-6 py-3 rounded-xl hover:bg-amber-300 transition-all shadow-lg shadow-amber-500/20">
              View Details →
            </Link>
          </div>
          {ev.image && (
            <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-72 overflow-hidden rounded-r-3xl pointer-events-none">
              <img src={ev.image} alt="" className="w-full h-full object-cover opacity-50" />
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 to-transparent" />
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: "none" }}>
        {featured.map(function(e, i) {
          return (
            <button key={e._id} onClick={function() { setActiveIdx(i) }}
              className={"flex-shrink-0 rounded-xl overflow-hidden transition-all duration-300 " + (i === activeIdx ? "ring-2 ring-amber-400 opacity-100 scale-105 shadow-lg shadow-amber-500/10" : "opacity-40 hover:opacity-70")}
              style={{ width: "100px", height: "60px" }}>
              {e.image ? (
                <img src={optimizeCloudinary(e.image, 240)} alt={e.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-xl">🎟</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DeleteModal({ target, onClose, onConfirm, deleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 max-w-sm w-full shadow-2xl">
        <p className="text-4xl text-center mb-4">🗑️</p>
        <h2 className="text-xl font-black text-white text-center mb-2">Move to Trash?</h2>
        <p className="text-zinc-500 text-sm text-center mb-6">
          "<span className="text-white font-semibold">{target.title}</span>" will be moved to the recycle bin.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 border border-zinc-700 text-zinc-400 py-3 rounded-xl text-sm font-bold hover:border-zinc-500 hover:text-white transition-all">Cancel</button>
          <button onClick={onConfirm} disabled={deleting}
            className="flex-1 bg-red-500 text-white py-3 rounded-xl text-sm font-bold hover:bg-red-400 transition-all disabled:opacity-40">
            {deleting ? "Moving…" : "Move to Trash"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterSort, setFilterSort] = useState("newest");
  const { user } = useAuth();
  const toast = useToast();
  const searchTimer = useRef(null);

  var fetchEvents = function(q, p, status, type, sort) {
    setLoading(true);
    var params = { page: p || 1, limit: 50 };
    if (q && q.trim()) params.search = q.trim();
    if (status) params.status = status;
    if (type) params.eventType = type;
    params.sort = sort || "newest";
    API.get("/events", { params: params }).then(function(res) {
      setEvents(res.data.events || []);
      setTotalPages(res.data.pages || 1);
      setPage(res.data.page || 1);
    }).catch(function() {}).finally(function() { setLoading(false) });
  };

  useEffect(function() { fetchEvents(search, page, filterStatus, filterType, filterSort) }, []);

  var handleSearch = function(val) {
    setSearch(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(function() { setPage(1); fetchEvents(val, 1, filterStatus, filterType, filterSort) }, 350);
  };

  var handleFilterChange = function(status, type, sort) {
    var s = status !== undefined ? status : filterStatus;
    var t = type !== undefined ? type : filterType;
    var o = sort !== undefined ? sort : filterSort;
    setFilterStatus(s);
    setFilterType(t);
    setFilterSort(o);
    setPage(1);
    fetchEvents(search, 1, s, t, o);
  };

  var handleDelete = async function() {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await API.delete("/events/" + deleteTarget._id);
      setEvents(function(prev) { return prev.filter(function(e) { return e._id !== deleteTarget._id }) });
      setDeleteTarget(null);
      toast("Event moved to trash", "success");
    } catch (err) {
      toast(err.response?.data?.message || "Failed to delete event", "error");
    } finally { setDeleting(false); }
  };

  var live     = events.filter(function(e) { return getStatus(e.date) === "ongoing" });
  var upcoming = events.filter(function(e) { return getStatus(e.date) === "upcoming" });
  var past     = events.filter(function(e) { return getStatus(e.date) === "past" });
  var isAdmin  = user?.role === "admin";

  var sectionNum = 0;
  var nextSection = function() { sectionNum++; return sectionNum; };

  return (
    <div className="min-h-screen bg-zinc-950 text-white relative">
      <AmbientBackground />

      {deleteTarget && (
        <DeleteModal target={deleteTarget} onClose={function() { setDeleteTarget(null) }}
          onConfirm={handleDelete} deleting={deleting} />
      )}

      <Suspense fallback={<div className="h-[70vh] bg-zinc-900 animate-pulse" />}>
        <HeroCarousel events={events} />
      </Suspense>

      <div className={"relative " + containerWide}>
        <div className="absolute -top-16 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-zinc-950 pointer-events-none" />

        <div className="pt-6">
          <Suspense fallback={<div className="h-32 bg-zinc-900 animate-pulse rounded-2xl" />}>
            <Recommendations user={user} />
          </Suspense>
        </div>

        <SearchRow search={search} onSearchChange={handleSearch}
          filterStatus={filterStatus} filterType={filterType} filterSort={filterSort}
          onFilterChange={handleFilterChange}
          user={user} isAdmin={isAdmin} events={events} loading={loading} />

        {search && !loading && (
          <div className="mb-6">
            {events.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
                <p className="text-5xl mb-4">🎟</p>
                <p className="text-zinc-500 text-sm tracking-widest uppercase">No events found for "<span className="text-white font-bold">{search}</span>"</p>
                <button onClick={function() { setSearch(""); fetchEvents("", 1, filterStatus, filterType, filterSort) }}
                  className="mt-4 text-[11px] text-amber-400 font-bold hover:text-amber-300 transition-colors">← Clear search</button>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="text-zinc-500 text-sm mb-4"><span className="text-white font-bold">{events.length}</span> result{events.length !== 1 ? "s" : ""} for "<span className="text-amber-400">{search}</span>"</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {events.map(function(ev) {
                    var typeCls = EVENT_TYPE_COLORS[ev.eventType] || EVENT_TYPE_COLORS.default;
                    return (
                      <Link key={ev._id} to={"/events/" + ev._id}
                        className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-600 hover:-translate-y-1 transition-all duration-200">
                        <div className="h-36 overflow-hidden bg-zinc-800 relative">
                          {ev.image ? (
                            <img src={optimizeCloudinary(ev.image, 400)} alt={ev.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl">🎟</div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        </div>
                        <div className="p-3">
                          <p className="font-black text-white text-sm line-clamp-1 mb-1">{ev.title}</p>
                          {ev.eventType && ev.eventType !== "General" && (
                            <span className={"text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border mb-1 inline-block " + typeCls}>{ev.eventType}</span>
                          )}
                          <p className="text-zinc-600 text-xs truncate">📍 {ev.location}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>
        )}

        {!search && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="animate-fadeIn">
            {live.length > 0 && <ScrollRow title="🟢 Happening Now" events={live} isAdmin={isAdmin} onDelete={setDeleteTarget} sectionNum={nextSection()} />}
            <ScrollRow title="📅 Upcoming Events" events={upcoming} isAdmin={isAdmin} onDelete={setDeleteTarget} sectionNum={nextSection()} />
            {past.length > 0 && <ScrollRow title="✓ Past Events" events={past} isAdmin={isAdmin} onDelete={setDeleteTarget} sectionNum={nextSection()} />}

            <div className="my-6">
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-zinc-800" />
                <p className="text-[10px] tracking-[0.3em] uppercase text-zinc-600 font-bold">By Location</p>
                <div className="flex-1 h-px bg-zinc-800" />
              </div>
            </div>

            <LocationRows events={events} isAdmin={isAdmin} onDelete={setDeleteTarget} />

            <ErrorBoundary name="Globe">
              <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className={spinnerCls} /></div>}>
                <InteractiveGlobe events={events} />
              </Suspense>
            </ErrorBoundary>

            {events.length > 0 && (
              <>
                <div className="mt-6 mb-2">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-zinc-800" />
                    <p className="text-[10px] tracking-[0.3em] uppercase text-zinc-600 font-bold">Spotlight</p>
                    <div className="flex-1 h-px bg-zinc-800" />
                  </div>
                </div>
                <SpotlightSection events={events} />
              </>
            )}
          </motion.div>
        )}

        {!search && !loading && <FilterPagination page={page} totalPages={totalPages} onPageChange={function(p) { setPage(p); fetchEvents(search, p, filterStatus, filterType, filterSort) }} search={search} filterStatus={filterStatus} filterType={filterType} filterSort={filterSort} />}

        {!search && !loading && <BlogCarousel />}

        {loading && (
          <div className="flex justify-center py-20">
            <div className={spinnerCls} />
          </div>
        )}

        <About />
        <FAQ />
        <Contact />
      </div>
    </div>
  );
}
