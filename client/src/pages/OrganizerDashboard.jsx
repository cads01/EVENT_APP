import { useEffect, useState } from "react";
import { API } from "../api";
import { Link, useNavigate } from "react-router-dom";
import CheckInScanner from "../components/CheckInScanner";
import { useToast } from "../utils/Toast";

function StatusBadge({ status }) {
  const map = {
    ongoing:  "text-emerald-400 bg-emerald-400/10 border-emerald-400/25",
    upcoming: "text-sky-400 bg-sky-400/10 border-sky-400/25",
    past:     "text-zinc-500 bg-zinc-800 border-zinc-700",
  };
  const dot = { ongoing: "bg-emerald-400 animate-pulse", upcoming: "bg-sky-400", past: "bg-zinc-600" };
  const label = { ongoing: "Live Now", upcoming: "Upcoming", past: "Ended" };
  return (
    <span className={"inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border " + map[status]}>
      <span className={"w-1.5 h-1.5 rounded-full " + dot[status]} />
      {label[status]}
    </span>
  );
}

function AttendeeModal({ event, onClose }) {
  const active = event.tickets.filter(function(t) { return t.status === "active" });
  const cancelled = event.tickets.filter(function(t) { return t.status === "cancelled" });
  const [copied, setCopied] = useState(null);
  const copy = function(code, id) {
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(function() { setCopied(null) }, 2000);
  };

  const ticketList = event.tickets.length === 0 ? (
    <div className="text-center py-12">
      <p className="text-4xl mb-3">🎟</p>
      <p className="text-zinc-600 text-xs tracking-widest uppercase">No attendees yet</p>
    </div>
  ) : event.tickets.map(function(t, i) {
    return <div key={t._id || i}
      className={"p-4 rounded-2xl border transition-all " + (t.status === "cancelled" ? "bg-red-950/20 border-red-900/30 opacity-60" : "bg-zinc-800/50 border-zinc-700/50 hover:border-zinc-600")}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-zinc-950 font-black text-sm flex-shrink-0">
            {(t.user && t.user.name && t.user.name[0]) ? t.user.name[0].toUpperCase() : "?"}
          </div>
          <div>
            <p className="font-bold text-white text-sm">{t.user ? t.user.name : "Unknown"}</p>
            <p className="text-zinc-500 text-xs">{t.user ? t.user.email : ""}</p>
          </div>
        </div>
        <span className={"text-[10px] font-bold px-2.5 py-1 rounded-full " + (t.status === "active" ? "bg-emerald-400/10 text-emerald-400" : "bg-red-500/10 text-red-400")}>
          {t.status}
        </span>
      </div>
      <div className="flex items-center gap-2 bg-black/30 border border-dashed border-zinc-600 rounded-xl px-3 py-2">
        <span className="text-[9px] text-zinc-600 font-mono tracking-widest uppercase">Ticket</span>
        <span className="font-mono font-black text-amber-400 text-sm tracking-[0.15em] flex-1">{t.ticketCode}</span>
        <button onClick={function() { copy(t.ticketCode, t._id || i) }}
          className="text-zinc-500 hover:text-amber-400 transition-colors text-sm">
          {copied === (t._id || i) ? "✓" : "📋"}
        </button>
      </div>
      <div className="flex justify-between mt-2 text-[10px] text-zinc-600">
        <span>Issued {new Date(t.issuedAt).toLocaleDateString()}</span>
        <span className={t.paidAmount > 0 ? "text-emerald-500 font-semibold" : ""}>
          {t.paidAmount > 0 ? "₦" + t.paidAmount.toLocaleString() + " paid" : "Free"}
        </span>
      </div>
    </div>;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm px-4 pb-4 md:pb-0">
      <div className="bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div>
            <h2 className="font-black text-white text-lg">Attendees & Tickets</h2>
            <p className="text-zinc-500 text-xs mt-0.5 truncate max-w-[260px]">{event.title}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all">×</button>
        </div>
        <div className="grid grid-cols-3 gap-2 px-6 py-4 border-b border-zinc-800">
          <div className="text-center bg-zinc-800/50 rounded-xl py-3">
            <p className="text-2xl font-black text-white">{event.tickets.length}</p>
            <p className="text-[10px] tracking-widest uppercase text-zinc-600 mt-0.5">Total</p>
          </div>
          <div className="text-center bg-zinc-800/50 rounded-xl py-3">
            <p className="text-2xl font-black text-emerald-400">{active.length}</p>
            <p className="text-[10px] tracking-widest uppercase text-zinc-600 mt-0.5">Active</p>
          </div>
          <div className="text-center bg-zinc-800/50 rounded-xl py-3">
            <p className="text-2xl font-black text-red-400">{cancelled.length}</p>
            <p className="text-[10px] tracking-widest uppercase text-zinc-600 mt-0.5">Cancelled</p>
          </div>
        </div>
        <div className="overflow-y-auto flex-1 p-4 space-y-2">
          {ticketList}
        </div>
      </div>
    </div>
  );
}

export default function OrganizerDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("upcoming");
  const [selected, setSelected] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsEvent, setAnalyticsEvent] = useState(null);
  const [emailEvent, setEmailEvent] = useState(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(function() {
    API.get("/events/organizer/my-events")
      .then(function(res) { setEvents(res.data) })
      .catch(function() { navigate("/") })
      .finally(function() { setLoading(false) });
  }, []);

  const counts = {
    ongoing:  events.filter(function(e) { return e.status === "ongoing" }).length,
    upcoming: events.filter(function(e) { return e.status === "upcoming" }).length,
    past:     events.filter(function(e) { return e.status === "past" }).length,
  };
  const filtered = events.filter(function(e) { return e.status === tab });
  const totalAttendees = events.reduce(function(s, e) { return s + e.tickets.filter(function(t) { return t.status === "active" }).length }, 0);
  const totalRevenue = events.reduce(function(s, e) {
    return s + e.tickets.filter(function(t) { return t.status === "active" }).reduce(function(a, t) { return a + (t.paidAmount || 0) }, 0);
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {selected && <AttendeeModal event={selected} onClose={function() { setSelected(null) }} />}
      <div className="h-px w-full bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-400" />
      <div className="max-w-5xl mx-auto px-5 py-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-10">
          <div>
            <p className="text-[10px] tracking-[0.35em] uppercase text-emerald-400 font-bold mb-2">Organizer Hub</p>
            <h1 className="text-5xl font-black leading-none">My Events</h1>
            <p className="text-zinc-600 text-sm mt-1">Manage events and track your audience</p>
          </div>
          <Link to="/create" className="self-start md:self-auto px-5 py-2.5 bg-amber-400 text-zinc-950 rounded-xl text-sm font-black hover:bg-amber-300 transition-all">
            + Create Event
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div className="bg-zinc-900 border border-amber-500/20 rounded-2xl p-5 flex items-center gap-3">
            <span className="text-2xl">🎟</span>
            <div>
              <p className="text-2xl font-black text-white">{events.length}</p>
              <p className="text-[10px] font-bold tracking-widest uppercase text-zinc-600">Events</p>
            </div>
          </div>
          <div className="bg-zinc-900 border border-sky-500/20 rounded-2xl p-5 flex items-center gap-3">
            <span className="text-2xl">👥</span>
            <div>
              <p className="text-2xl font-black text-white">{totalAttendees}</p>
              <p className="text-[10px] font-bold tracking-widest uppercase text-zinc-600">Attendees</p>
            </div>
          </div>
          <div className="bg-zinc-900 border border-emerald-500/20 rounded-2xl p-5 flex items-center gap-3">
            <span className="text-2xl">💰</span>
            <div>
              <p className="text-2xl font-black text-white">{totalRevenue.toLocaleString()}</p>
              <p className="text-[10px] font-bold tracking-widest uppercase text-zinc-600">Revenue</p>
            </div>
          </div>
          <div className="bg-zinc-900 border border-rose-500/20 rounded-2xl p-5 flex items-center gap-3">
            <span className="text-2xl">🟢</span>
            <div>
              <p className="text-2xl font-black text-white">{counts.ongoing}</p>
              <p className="text-[10px] font-bold tracking-widest uppercase text-zinc-600">Live Now</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mb-6">
          {["ongoing", "upcoming", "past"].map(function(t) {
            var icon = { ongoing: "🟢", upcoming: "📅", past: "📦" }[t];
            var label = { ongoing: "Live", upcoming: "Upcoming", past: "Past" }[t];
            var count = { ongoing: counts.ongoing, upcoming: counts.upcoming, past: counts.past }[t];
            return (
              <button key={t} onClick={function() { setTab(t) }}
                className={"flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border " + (tab === t ? "bg-amber-400 text-zinc-950 border-amber-400" : "bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-white")}>
                {icon} {label}
                <span className={"text-[10px] px-1.5 py-0.5 rounded-full font-black " + (tab === t ? "bg-zinc-950/20 text-zinc-950" : "bg-zinc-800 text-zinc-500")}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        {filtered.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-16 text-center">
            <p className="text-5xl mb-4">{tab === "ongoing" ? "🎤" : tab === "upcoming" ? "📅" : "📦"}</p>
            <p className="font-black text-white text-lg mb-1">No {tab} events</p>
            <p className="text-zinc-600 text-sm mb-5">{tab === "upcoming" ? "Create your first event." : "No " + tab + " events yet."}</p>
            {tab === "upcoming" && (
              <Link to="/create" className="inline-block bg-amber-400 text-zinc-950 px-6 py-2.5 rounded-xl text-sm font-black hover:bg-amber-300 transition-all">
                Create Event
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(function(ev) {
              var activeTickets = ev.tickets.filter(function(t) { return t.status === "active" }).length;
              var pct = Math.min((activeTickets / ev.capacity) * 100, 100);
              return (
                <div key={ev._id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all">
                  <div className="flex gap-4 p-5">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0 ring-1 ring-white/5">
                      {ev.image
                        ? <img src={ev.image} alt={ev.title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-3xl">🎟</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3 className="font-black text-white text-base truncate">{ev.title}</h3>
                        <StatusBadge status={ev.status} />
                      </div>
                      <p className="text-zinc-500 text-xs mb-2">📍 {ev.location} · 📅 {new Date(ev.date).toDateString()}</p>
                      <div className="flex items-center justify-between mb-2">
                          <span className={"text-sm font-black " + (ev.price === 0 ? "text-emerald-400" : "text-amber-400")}>
                            {ev.price === 0 ? "Free" : "₦" + ev.price.toLocaleString()}
                          </span>
                        <span className="text-xs text-zinc-600">{activeTickets}/{ev.capacity} attending</span>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-1">
                        <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all" style={{ width: pct + "%" }} />
                      </div>
                    </div>
                  </div>
                  <div className="flex border-t border-zinc-800 divide-x divide-zinc-800">
                    <button onClick={function() { setSelected(ev) }}
                      className="flex-1 py-3 text-xs font-bold text-amber-400 hover:bg-amber-400/5 transition-all flex items-center justify-center gap-1.5">
                      👥 Attendees ({activeTickets})
                    </button>
                    <button onClick={function() { setAnalyticsEvent(ev) }}
                      className="flex-1 py-3 text-xs font-bold text-emerald-400 hover:bg-emerald-400/5 transition-all flex items-center justify-center gap-1.5">
                      📊 Analytics
                    </button>
                    <button onClick={async function() {
                      try {
                        await API.post("/notifications/remind/" + ev._id);
                        toast("Reminder sent to all ticket holders", "success");
                      } catch (e) { toast(e.response?.data?.message || "Failed to send reminder", "error"); }
                    }}
                      className="flex-1 py-3 text-xs font-bold text-purple-400 hover:bg-purple-400/5 transition-all flex items-center justify-center gap-1.5">
                      🔔 Remind
                    </button>
                    <button onClick={function() { setEmailEvent(ev); setEmailSubject(""); setEmailMessage("") }}
                      className="flex-1 py-3 text-xs font-bold text-orange-400 hover:bg-orange-400/5 transition-all flex items-center justify-center gap-1.5">
                      📧 Email
                    </button>
                    <Link to={"/checkin/" + ev._id}
                      className="flex-1 py-3 text-xs font-bold text-sky-400 hover:bg-sky-400/5 transition-all flex items-center justify-center gap-1.5">
                      📷 Check-In
                    </Link>
                    <Link to={"/events/" + ev._id}
                      className="flex-1 py-3 text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-1.5">
                      👁 View
                    </Link>
                    <Link to={"/events/" + ev._id + "/edit"}
                      className="flex-1 py-3 text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-1.5">
                      ✏️ Edit
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {analyticsEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 py-8">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
              <div>
                <h2 className="font-black text-white text-lg">Analytics: {analyticsEvent.title}</h2>
                <p className="text-zinc-500 text-xs">{analyticsEvent.location}</p>
              </div>
              <button onClick={function() { setAnalyticsEvent(null) }}
                className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-all">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 text-center">
                  <p className="text-xl font-black text-white">{analyticsEvent.tickets ? analyticsEvent.tickets.length : 0}</p>
                  <p className="text-[10px] text-zinc-500 tracking-widest uppercase mt-1">Total Tickets</p>
                </div>
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 text-center">
                  <p className="text-xl font-black text-white">{analyticsEvent.tickets ? analyticsEvent.tickets.filter(function(t) { return t.status === "active" }).reduce(function(s, t) { return s + (t.paidAmount || 0) }, 0).toLocaleString() : 0}</p>
                  <p className="text-[10px] text-zinc-500 tracking-widest uppercase mt-1">Revenue</p>
                </div>
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 text-center">
                  <p className="text-xl font-black text-white">{(analyticsEvent.attendees ? analyticsEvent.attendees.length : 0) + "/" + analyticsEvent.capacity}</p>
                  <p className="text-[10px] text-zinc-500 tracking-widest uppercase mt-1">Capacity</p>
                </div>
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 text-center">
                  <p className="text-xl font-black text-white">{Math.min(Math.round(((analyticsEvent.attendees ? analyticsEvent.attendees.length : 0) / analyticsEvent.capacity) * 100), 100)}%</p>
                  <p className="text-[10px] text-zinc-500 tracking-widest uppercase mt-1">Fill Rate</p>
                </div>
              </div>
              <TicketVelocityChart data={[
                { date: "Mon", tickets: 4 }, { date: "Tue", tickets: 7 }, { date: "Wed", tickets: 12 },
                { date: "Thu", tickets: 9 }, { date: "Fri", tickets: 15 }, { date: "Sat", tickets: 22 },
                { date: "Sun", tickets: 18 },
              ]} />
              <RevenueChart data={[
                { date: "Mon", revenue: 40000 }, { date: "Tue", revenue: 85000 },
                { date: "Wed", revenue: 120000 }, { date: "Thu", revenue: 95000 },
                { date: "Fri", revenue: 180000 }, { date: "Sat", revenue: 250000 },
                { date: "Sun", revenue: 210000 },
              ]} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DemographicsPie data={[
                  { name: "18-24", value: 25 }, { name: "25-34", value: 40 },
                  { name: "35-44", value: 20 }, { name: "45+", value: 15 },
                ]} />
                <CrowdDensityChart data={[
                  { time: "8AM", count: 5 }, { time: "9AM", count: 15 }, { time: "10AM", count: 45 },
                  { time: "11AM", count: 80 }, { time: "12PM", count: 95 }, { time: "1PM", count: 88 },
                  { time: "2PM", count: 72 }, { time: "3PM", count: 50 },
                ]} />
              </div>
            </div>
          </div>
        </div>
      )}
      {emailEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 py-8">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <div>
                <h2 className="font-black text-white text-lg">Email Attendees</h2>
                <p className="text-zinc-500 text-xs">{emailEvent.title}</p>
              </div>
              <button onClick={function() { setEmailEvent(null) }}
                className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-all">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] tracking-widest uppercase text-zinc-600 font-bold block mb-1.5">Subject</label>
                <input value={emailSubject} onChange={function(e) { setEmailSubject(e.target.value) }}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm" />
              </div>
              <div>
                <label className="text-[10px] tracking-widest uppercase text-zinc-600 font-bold block mb-1.5">Message</label>
                <textarea value={emailMessage} onChange={function(e) { setEmailMessage(e.target.value) }} rows={6}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm resize-none" />
              </div>
              <button disabled={emailSending || !emailMessage} onClick={async function() {
                  try {
                    setEmailSending(true);
                    var res = await API.post("/notifications/broadcast-email", { eventId: emailEvent._id, subject: emailSubject, message: emailMessage });
                    toast(res.data.message, "success");
                    setEmailEvent(null);
                  } catch (e) { toast("Failed: " + (e.response?.data?.message || e.message), "error"); }
                finally { setEmailSending(false); }
              }}
                className="w-full bg-amber-400 text-zinc-950 py-3 rounded-xl text-sm font-black hover:bg-amber-300 transition-all disabled:opacity-40">
                {emailSending ? "Sending…" : "Send Email to All Attendees"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
