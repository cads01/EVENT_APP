import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { API } from "../api";
import { useAuth } from "../context/AuthContext";
import Countdown from "../components/Countdown";
import GetDirections from "../components/GetDirections";

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [attendees, setAttendees] = useState(null);
  const [showAttendees, setShowAttendees] = useState(false);
  const [loadingAttendees, setLoadingAttendees] = useState(false);
  const isAdmin = user?.role === "admin";

  const refresh = () => API.get(`/events/${id}`).then(res => setEvent(res.data));

  useEffect(() => { refresh().catch(() => setMessage("Failed to load event.")); }, [id]);

  const isAttending = event?.attendees?.some(
    a => (a._id || a).toString() === (user?._id || user?.id)
  );

  const handleRSVP = async () => {
    try {
      setLoading(true); setMessage("");
      await API.post(`/events/${id}/rsvp`);
      setMessage("success");
      await refresh();
    } catch (err) { setMessage(err.response?.data?.message || "RSVP failed"); }
    finally { setLoading(false); }
  };

  const handleCancelRSVP = async () => {
    try {
      setLoading(true); setMessage("");
      await API.delete(`/events/${id}/rsvp`);
      setMessage("cancelled_rsvp");
      await refresh();
    } catch (err) { setMessage(err.response?.data?.message || "Failed to cancel"); }
    finally { setLoading(false); }
  };

  const handlePayment = () => {
    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email: user.email,
      amount: event.price * 100,
      currency: "NGN",
      callback: () => handleRSVP(),
      onClose: () => setMessage("cancelled"),
    });
    handler.openIframe();
  };

  const loadAttendees = async () => {
    setLoadingAttendees(true); setShowAttendees(true);
    try {
      const res = await API.get(`/events/${id}/attendees`);
      setAttendees(res.data.attendees);
    } catch { setAttendees([]); }
    finally { setLoadingAttendees(false); }
  };

  if (!event) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
    </div>
  );

  const fillPct = Math.min((event.attendees.length / event.capacity) * 100, 100);

  return (
    <div className="min-h-screen bg-zinc-950 text-white" style={{ fontFamily: "'Syne', sans-serif" }}>

      {/* Attendees modal */}
      {showAttendees && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <div>
                <h2 className="font-black text-white">Attendees</h2>
                <p className="text-zinc-500 text-xs">{event.title}</p>
              </div>
              <button onClick={() => setShowAttendees(false)}
                className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-all">×</button>
            </div>
            <div className="overflow-y-auto flex-1 p-4">
              {loadingAttendees ? (
                <div className="flex justify-center py-10">
                  <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                </div>
              ) : attendees?.length === 0 ? (
                <p className="text-center text-zinc-600 py-8 text-xs tracking-widest uppercase">No attendees yet</p>
              ) : (
                <ul className="space-y-2">
                  {attendees?.map((a, i) => (
                    <li key={a._id} className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-xl">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-zinc-950 font-black text-sm flex-shrink-0">
                        {a.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white text-sm truncate">{a.name}</p>
                        <p className="text-zinc-500 text-xs truncate">{a.email}</p>
                      </div>
                      {a.ticketCode && (
                        <span className="ml-auto font-mono text-[10px] text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-lg flex-shrink-0">
                          {a.ticketCode}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="p-4 border-t border-zinc-800 text-center">
              <p className="text-xs text-zinc-600">{attendees?.length ?? 0} of {event.capacity} spots filled</p>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <div className="relative h-72 md:h-[420px] overflow-hidden">
        {event.image ? (
          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-8xl">🎟</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

        {/* Badges */}
        <div className="absolute bottom-6 left-6 flex items-center gap-2">
          <span className={`text-xs font-black px-3 py-1.5 rounded-full border ${event.price === 0 ? "bg-emerald-400/20 text-emerald-400 border-emerald-400/30" : "bg-amber-400/20 text-amber-400 border-amber-400/30"}`}>
            {event.price === 0 ? "Free" : `₦${event.price.toLocaleString()}`}
          </span>
        </div>

        {/* Admin actions */}
        {isAdmin && (
          <div className="absolute top-4 right-4 flex gap-2">
            <button onClick={() => navigate(`/events/${id}/edit`)}
              className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:border-amber-400/50 hover:text-amber-400 transition-all">
              ✏️ Edit
            </button>
            <button onClick={loadAttendees}
              className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:border-sky-400/50 hover:text-sky-400 transition-all">
              👥 {event.attendees.length}
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-5 py-10">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 mb-4">
          <h2 className="text-4xl font-black mb-8 leading-tight">{event.title}</h2>

          {/* Info cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
            {[
              { icon: "📍", label: "Location", value: event.location },
              { icon: "📅", label: "Date",     value: new Date(event.date).toDateString() },
            ].map(item => (
              <div key={item.label} className="bg-zinc-800/50 border border-zinc-700/50 rounded-2xl p-4 text-center">
                <p className="text-2xl mb-1">{item.icon}</p>
                <p className="text-[10px] tracking-widest uppercase text-zinc-600 font-bold mb-1">{item.label}</p>
                <p className="text-white font-bold text-sm">{item.value}</p>
              </div>
            ))}
            <div
              onClick={isAdmin ? loadAttendees : undefined}
              className={`bg-zinc-800/50 border border-zinc-700/50 rounded-2xl p-4 text-center ${isAdmin ? "cursor-pointer hover:border-amber-400/30 transition-all" : ""}`}>
              <p className="text-2xl mb-1">👥</p>
              <p className="text-[10px] tracking-widest uppercase text-zinc-600 font-bold mb-1">Attending</p>
              <p className="text-white font-bold text-sm">{event.attendees.length} / {event.capacity}</p>
              {isAdmin && <p className="text-[10px] text-amber-400 mt-1">Click to view</p>}
            </div>
          </div>

          {/* Description */}
          <div className="border-t border-zinc-800 pt-6 mb-8">
            <h2 className="font-black text-white mb-3 text-lg">About</h2>
            <p className="text-zinc-400 leading-relaxed whitespace-pre-line text-sm">{event.description}</p>
            <div className="mt-6 space-y-4">
              <Countdown eventDate={event.date} />
              <GetDirections venue={event.venue} location={event.location} />
            </div>
          </div>

          {/* Capacity bar */}
          <div className="mb-8">
            <div className="flex justify-between text-xs text-zinc-500 mb-2">
              <span>Capacity</span>
              <span>{Math.round(fillPct)}% filled</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2">
              <div className="h-2 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all"
                style={{ width: `${fillPct}%` }} />
            </div>
          </div>

          {/* Messages */}
          {message === "success" && (
            <div className="bg-emerald-400/10 border border-emerald-400/25 text-emerald-400 px-4 py-3 rounded-xl mb-6 text-sm font-bold">
              🎉 RSVP confirmed! Check your email for your ticket.
            </div>
          )}
          {message === "cancelled_rsvp" && (
            <div className="bg-zinc-800 border border-zinc-700 text-zinc-400 px-4 py-3 rounded-xl mb-6 text-sm">
              Your RSVP has been cancelled.
            </div>
          )}
          {message === "cancelled" && (
            <div className="bg-amber-400/10 border border-amber-400/25 text-amber-400 px-4 py-3 rounded-xl mb-6 text-sm">
              Payment was cancelled.
            </div>
          )}
          {message && !["success", "cancelled_rsvp", "cancelled"].includes(message) && (
            <div className="bg-red-500/10 border border-red-500/25 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
              {message}
            </div>
          )}

          {/* CTA */}
          {user ? (
            isAttending ? (
              <button onClick={handleCancelRSVP} disabled={loading}
                className="w-full border-2 border-red-500/30 text-red-400 py-4 rounded-2xl font-black text-base hover:bg-red-500/5 transition-all disabled:opacity-40">
                {loading ? "Cancelling…" : "Cancel My RSVP"}
              </button>
            ) : event.price > 0 ? (
              <button onClick={handlePayment} disabled={loading}
                className="w-full bg-gradient-to-r from-amber-400 to-orange-400 text-zinc-950 py-4 rounded-2xl font-black text-base hover:from-amber-300 hover:to-orange-300 transition-all disabled:opacity-40 shadow-lg shadow-amber-500/20">
                {loading ? "Processing…" : `Pay ₦${event.price.toLocaleString()} & RSVP`}
              </button>
            ) : (
              <button onClick={handleRSVP} disabled={loading}
                className="w-full bg-gradient-to-r from-amber-400 to-orange-400 text-zinc-950 py-4 rounded-2xl font-black text-base hover:from-amber-300 hover:to-orange-300 transition-all disabled:opacity-40 shadow-lg shadow-amber-500/20">
                {loading ? "Processing…" : "RSVP Now — It's Free!"}
              </button>
            )
          ) : (
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-2xl p-6 text-center">
              <p className="text-zinc-400 mb-4 text-sm">Sign in to RSVP for this event</p>
              <div className="flex gap-3 justify-center">
                <Link to="/login" className="bg-amber-400 text-zinc-950 px-6 py-2.5 rounded-xl font-black text-sm hover:bg-amber-300 transition-all">
                  Login
                </Link>
                <Link to="/register" className="border border-zinc-700 text-zinc-400 px-6 py-2.5 rounded-xl font-bold text-sm hover:border-zinc-500 hover:text-white transition-all">
                  Register
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Organizer */}
        {event.createdBy && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <p className="text-[10px] tracking-widest uppercase text-zinc-600 font-bold mb-4">Organizer</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-zinc-950 font-black">
                {event.createdBy.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-white">{event.createdBy.name}</p>
                <p className="text-zinc-500 text-xs">{event.createdBy.email}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
