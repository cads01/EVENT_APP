import { useEffect, useState } from "react";
import { API } from "../api";
import { Link, useNavigate } from "react-router-dom";

function StatCard({ icon, label, value, accent }) {
  return (
    <div className={"relative overflow-hidden rounded-2xl border p-6 bg-zinc-900 " + accent}>
      <div className="absolute -right-3 -top-3 text-5xl opacity-10 select-none">{icon}</div>
      <p className="text-3xl font-black text-white mb-1">{value}</p>
      <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-zinc-500">{label}</p>
      <div className="mt-3 text-xl">{icon}</div>
    </div>
  );
}

function EventsTab({ stats, onDelete, deletingId }) {
  const [tab, setTab] = useState("all");
  var all = [];
  if (stats) {
    all = [
      ...(stats.ongoingEvents || []).map(function(e) { return { ...e, status: "ongoing" } }),
      ...(stats.upcomingEvents || []).map(function(e) { return { ...e, status: "upcoming" } }),
      ...(stats.pastEvents || []).map(function(e) { return { ...e, status: "past" } }),
    ];
  }
  var filtered = tab === "all" ? all : all.filter(function(e) { return e.status === tab });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-sm tracking-wide text-white">Events</h2>
        <div className="flex gap-1 bg-zinc-800 rounded-lg p-1">
          {["all", "ongoing", "upcoming", "past"].map(function(t) {
            return (
              <button key={t} onClick={function() { setTab(t) }}
                className={"px-3 py-1 rounded-md text-[11px] font-bold capitalize transition-all " + (tab === t ? "bg-amber-400 text-zinc-950" : "text-zinc-500 hover:text-white")}>
                {t}
              </button>
            );
          })}
        </div>
      </div>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
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
                  {["Event", "Date", "Organizer", "Seats", "Price", "Status", "Actions"].map(function(h) {
                    return <th key={h} className="text-left px-5 py-3">{h}</th>;
                  })}
                </tr>
              </thead>
              <tbody>
                {filtered.map(function(ev) {
                  return (
                    <tr key={ev._id} className="border-b border-zinc-800/50 hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0 ring-1 ring-white/5">
                            {ev.image ? <img src={ev.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-sm">🎟</div>}
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
                            <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: Math.min(((ev.attendees?.length || 0) / ev.capacity) * 100, 100) + "%" }} />
                          </div>
                          <span className="text-[11px] text-zinc-600">{(ev.attendees?.length || 0)}/{ev.capacity}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={"text-sm font-bold " + (ev.price === 0 ? "text-emerald-400" : "text-amber-400")}>
                          {ev.price === 0 ? "Free" : "₦" + ev.price.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={"inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border " + ({
                          ongoing: "text-emerald-400 bg-emerald-400/10 border-emerald-400/25",
                          upcoming: "text-sky-400 bg-sky-400/10 border-sky-400/25",
                          past: "text-zinc-500 bg-zinc-800 border-zinc-700",
                        }[ev.status])}>
                          <span className={"w-1.5 h-1.5 rounded-full " + ({ ongoing: "bg-emerald-400 animate-pulse", upcoming: "bg-sky-400", past: "bg-zinc-600" }[ev.status])} />
                          {ev.status === "ongoing" ? "Live" : ev.status === "upcoming" ? "Upcoming" : "Ended"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-3 text-xs font-semibold">
                          <Link to={"/events/" + ev._id} className="text-sky-400 hover:text-sky-300 transition-colors">View</Link>
                          <Link to={"/events/" + ev._id + "/edit"} className="text-zinc-400 hover:text-white transition-colors">Edit</Link>
                          <button onClick={function() { onDelete(ev._id) }} disabled={deletingId === ev._id}
                            className="text-red-500 hover:text-red-400 transition-colors disabled:opacity-30">
                            {deletingId === ev._id ? "…" : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  var timer;

  var fetch = function(q) {
    setLoading(true);
    API.get("/admin/users" + (q ? "?search=" + encodeURIComponent(q) : ""))
      .then(function(res) { setUsers(res.data) })
      .catch(function() {})
      .finally(function() { setLoading(false) });
  };

  useEffect(function() { fetch() }, []);

  var handleSearch = function(val) {
    setSearch(val);
    clearTimeout(timer);
    timer = setTimeout(function() { fetch(val) }, 400);
  };

  var changeRole = function(id, role) {
    API.patch("/admin/users/" + id + "/role", { role: role })
      .then(function(res) {
        setUsers(function(prev) { return prev.map(function(u) { return u._id === id ? { ...u, role: res.data.role } : u }) });
      })
      .catch(function(err) { alert(err.response?.data?.message || "Failed") });
  };

  var deleteUser = function(id) {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    API.delete("/admin/users/" + id)
      .then(function() { setUsers(function(prev) { return prev.filter(function(u) { return u._id !== id }) }) })
      .catch(function(err) { alert(err.response?.data?.message || "Failed") });
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <h2 className="font-bold text-sm tracking-wide text-white">Users</h2>
        <div className="flex-1" />
        <input value={search} onChange={function(e) { handleSearch(e.target.value) }}
          placeholder="Search by name or email…"
          className="max-w-xs bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-xl px-4 py-2 text-sm" />
      </div>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">👤</p>
            <p className="text-zinc-600 text-xs tracking-widest uppercase">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-[10px] tracking-widest uppercase text-zinc-600 border-b border-zinc-800">
                  {["User", "Email", "Role", "Joined", "Badges", "Actions"].map(function(h) {
                    return <th key={h} className="text-left px-5 py-3">{h}</th>;
                  })}
                </tr>
              </thead>
              <tbody>
                {users.map(function(u) {
                  return (
                    <tr key={u._id} className="border-b border-zinc-800/50 hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-zinc-950 font-black text-sm flex-shrink-0">
                            {u.name ? u.name[0].toUpperCase() : "?"}
                          </div>
                          <span className="text-sm font-semibold text-white">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-zinc-500">{u.email}</td>
                      <td className="px-5 py-3.5">
                        <select value={u.role} onChange={function(e) { changeRole(u._id, e.target.value) }}
                          className="bg-zinc-800 border border-zinc-700 text-white text-xs font-bold rounded-lg px-2 py-1 cursor-pointer">
                          <option value="user">User</option>
                          <option value="organizer">Organizer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-zinc-500">
                        {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs text-zinc-500">{(u.badges || []).length > 0 ? u.badges.join(", ") : "—"}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <button onClick={function() { deleteUser(u._id) }}
                          className="text-xs text-red-500 hover:text-red-400 transition-colors">Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function BlogsTab() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(function() {
    API.get("/admin/blogs")
      .then(function(res) { setBlogs(res.data) })
      .catch(function() {})
      .finally(function() { setLoading(false) });
  }, []);

  var deleteBlog = function(id) {
    if (!window.confirm("Delete this blog post?")) return;
    API.delete("/admin/blogs/" + id)
      .then(function() { setBlogs(function(prev) { return prev.filter(function(b) { return b._id !== id }) }) })
      .catch(function(err) { alert(err.response?.data?.message || "Failed") });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-sm tracking-wide text-white">Blog Posts</h2>
        <Link to="/blog/create" className="text-xs font-bold bg-amber-400 text-zinc-950 px-4 py-2 rounded-xl hover:bg-amber-300 transition-all">+ New Post</Link>
      </div>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">📝</p>
            <p className="text-zinc-600 text-xs tracking-widest uppercase">No blog posts</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-[10px] tracking-widest uppercase text-zinc-600 border-b border-zinc-800">
                  {["Title", "Author", "Date", "Likes", "Featured", "Actions"].map(function(h) {
                    return <th key={h} className="text-left px-5 py-3">{h}</th>;
                  })}
                </tr>
              </thead>
              <tbody>
                {blogs.map(function(b) {
                  return (
                    <tr key={b._id} className="border-b border-zinc-800/50 hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0 ring-1 ring-white/5">
                            {b.image ? <img src={b.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-sm">📝</div>}
                          </div>
                          <span className="text-sm font-semibold text-white line-clamp-1 max-w-[220px]">{b.title}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-zinc-500">{b.author?.name || "—"}</td>
                      <td className="px-5 py-3.5 text-sm text-zinc-500">
                        {new Date(b.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-zinc-500">{b.likes || 0}</td>
                      <td className="px-5 py-3.5">
                        <span className={"text-[10px] font-bold px-2 py-0.5 rounded-full " + (b.featured ? "bg-amber-400/10 text-amber-400" : "bg-zinc-800 text-zinc-600")}>
                          {b.featured ? "Featured" : "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-3 text-xs font-semibold">
                          <Link to={"/blog/" + b._id} className="text-sky-400 hover:text-sky-300 transition-colors">View</Link>
                          <button onClick={function() { deleteBlog(b._id) }}
                            className="text-red-500 hover:text-red-400 transition-colors">Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState("events");
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  useEffect(function() {
    API.get("/events/admin/stats")
      .then(function(res) { setStats(res.data) })
      .catch(function() { navigate("/") })
      .finally(function() { setLoading(false) });
  }, []);

  var handleDelete = async function(eventId) {
    if (!window.confirm("Move this event to trash?")) return;
    try {
      setDeletingId(eventId);
      await API.delete("/events/" + eventId);
      setStats(function(prev) {
        if (!prev) return prev;
        var f = function(arr) { return arr.filter(function(e) { return e._id !== eventId }) };
        var o = f(prev.ongoingEvents), u = f(prev.upcomingEvents), p = f(prev.pastEvents);
        return { ...prev, ongoingEvents: o, upcomingEvents: u, pastEvents: p,
          ongoing: o.length, upcoming: u.length, past: p.length,
          totalEvents: o.length + u.length + p.length };
      });
    } catch (err) { alert(err.response?.data?.message || "Failed"); }
    finally { setDeletingId(null); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
          <p className="text-zinc-600 text-xs tracking-widest uppercase">Loading</p>
        </div>
      </div>
    );
  }
  if (!stats) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="h-px w-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400" />

      <div className="max-w-7xl mx-auto px-5 py-10">
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard icon="🎟" label="Total Events"   value={stats.totalEvents}                         accent="border-amber-500/20" />
          <StatCard icon="👥" label="Total Users"    value={stats.totalUsers}                          accent="border-sky-500/20" />
          <StatCard icon="🎫" label="Active Tickets" value={stats.totalTickets}                        accent="border-emerald-500/20" />
          <StatCard icon="💰" label="Revenue"         value={"₦" + stats.totalRevenue.toLocaleString()} accent="border-rose-500/20" />
        </div>

        <div className="flex gap-2 mb-8">
          {[
            { key: "events", icon: "🎟", label: "Events" },
            { key: "users",  icon: "👥", label: "Users" },
            { key: "blogs",  icon: "📝", label: "Blogs" },
          ].map(function(s) {
            return (
              <button key={s.key} onClick={function() { setSection(s.key) }}
                className={"flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border " + (section === s.key ? "bg-amber-400 text-zinc-950 border-amber-400" : "bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-white")}>
                {s.icon} {s.label}
              </button>
            );
          })}
        </div>

        {section === "events" && <EventsTab stats={stats} onDelete={handleDelete} deletingId={deletingId} />}
        {section === "users" && <UsersTab />}
        {section === "blogs" && <BlogsTab />}
      </div>
    </div>
  );
}
