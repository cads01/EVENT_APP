import { useEffect, useState } from "react";
import { API } from "../api";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const STATUS_CLS = {
  active:    "text-emerald-400 bg-emerald-400/10 border-emerald-400/25",
  cancelled: "text-red-400 bg-red-400/10 border-red-400/25",
  used:      "text-zinc-500 bg-zinc-800 border-zinc-700",
};

export default function MyTickets() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    API.get("/tickets/mine")
      .then(res => setTickets(res.data))
      .finally(() => setLoading(false));
  }, []);

  const copy = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const upcoming = tickets.filter(t => t.event && new Date(t.event.date) > new Date());
  const past     = tickets.filter(t => t.event && new Date(t.event.date) <= new Date());

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white pt-20 pb-16 px-5" style={{ fontFamily: "'Syne', sans-serif" }}>
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <p className="text-[10px] tracking-[0.35em] uppercase text-amber-400 font-bold mb-1">Your Tickets</p>
          <h1 className="text-4xl font-black">My Tickets</h1>
          <p className="text-zinc-600 text-sm mt-1">All your RSVPs and event tickets in one place</p>
        </div>

        {/* Checklist summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[
            { icon: "🎟", label: "Total Tickets",    value: tickets.length },
            { icon: "📅", label: "Upcoming",         value: upcoming.length },
            { icon: "✅", label: "Active",            value: tickets.filter(t => t.status === "active").length },
            { icon: "✓",  label: "Past Events",      value: past.length },
          ].map(s => (
            <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <p className="text-xl font-black text-white">{s.value}</p>
                <p className="text-[10px] font-bold tracking-widest uppercase text-zinc-600">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {tickets.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-16 text-center">
            <p className="text-5xl mb-4">🎟</p>
            <p className="font-black text-white text-xl mb-2">No tickets yet</p>
            <p className="text-zinc-600 text-sm mb-6">RSVP to an event to get your ticket here</p>
            <Link to="/" className="inline-block bg-amber-400 text-zinc-950 px-6 py-3 rounded-xl font-black text-sm hover:bg-amber-300 transition-all">
              Browse Events →
            </Link>
          </div>
        ) : (
          <>
            {/* Upcoming tickets */}
            {upcoming.length > 0 && (
              <div className="mb-8">
                <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-4">Upcoming</p>
                <div className="space-y-3">
                  {upcoming.map(ticket => <TicketCard key={ticket._id} ticket={ticket} copied={copied} onCopy={copy} />)}
                </div>
              </div>
            )}

            {/* Past tickets */}
            {past.length > 0 && (
              <div>
                <p className="text-xs font-bold tracking-widest uppercase text-zinc-600 mb-4">Past Events</p>
                <div className="space-y-3 opacity-70">
                  {past.map(ticket => <TicketCard key={ticket._id} ticket={ticket} copied={copied} onCopy={copy} isPast />)}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function TicketCard({ ticket, copied, onCopy, isPast }) {
  const ev = ticket.event;
  if (!ev) return null;

  return (
    <div className={`bg-zinc-900 border rounded-2xl overflow-hidden transition-all ${isPast ? "border-zinc-800" : "border-zinc-700 hover:border-zinc-600"}`}>
      <div className="flex gap-4 p-5">
        {/* Event image */}
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0 ring-1 ring-white/5">
          {ev.image
            ? <img src={ev.image} alt={ev.title} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-3xl">🎟</div>}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <Link to={`/events/${ev._id}`}
              className="font-black text-white text-base truncate hover:text-amber-400 transition-colors">
              {ev.title}
            </Link>
            <span className={`flex-shrink-0 text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border ${STATUS_CLS[ticket.status] || STATUS_CLS.active}`}>
              {ticket.status}
            </span>
          </div>

          {ev.eventType && ev.eventType !== "General" && (
            <span className="text-[9px] font-bold uppercase text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full mb-1 inline-block">
              {ev.eventType}
            </span>
          )}

          <p className="text-zinc-500 text-xs mb-0.5">📍 {ev.location}</p>
          <p className="text-zinc-600 text-xs">
            📅 {new Date(ev.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
          </p>
          <p className="text-zinc-600 text-xs mt-0.5">
            {ticket.paidAmount > 0
              ? <span className="text-emerald-500 font-semibold">₦{ticket.paidAmount.toLocaleString()} paid</span>
              : <span className="text-emerald-400">Free ticket</span>}
          </p>
        </div>
      </div>

      {/* Ticket code strip */}
      <div className="mx-5 mb-5 flex items-center gap-3 bg-black/30 border border-dashed border-zinc-700 rounded-xl px-4 py-3">
        <div>
          <p className="text-[9px] font-mono tracking-widest uppercase text-zinc-600 mb-0.5">Ticket Code</p>
          <p className="font-mono font-black text-amber-400 text-base tracking-[0.2em]">{ticket.ticketCode}</p>
        </div>
        <button onClick={() => onCopy(ticket.ticketCode, ticket._id)}
          className="ml-auto text-zinc-500 hover:text-amber-400 transition-colors text-lg flex-shrink-0"
          title="Copy ticket code">
          {copied === ticket._id ? "✓" : "📋"}
        </button>
        <p className="text-[9px] text-zinc-700 font-mono">
          Issued {new Date(ticket.issuedAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
