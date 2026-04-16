import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { API } from "../api";
import { useAuth } from "../context/AuthContext";
import GetDirections from "../components/GetDirections";
import EventComments from "../components/EventComments";
import EventPosts from "../components/EventPosts";
import EventInsights from "../components/EventInsights";
import { formatEventTime, getUserTimezone, isPastEvent } from "../utils/timeFormatting";

export default function EventSummary() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    API.get(`/events/${id}`)
      .then(res => setEvent(res.data))
      .catch(() => setMessage("Failed to load event."));
  }, [id]);

  useEffect(() => {
    if (!event) return;
    if (!isPastEvent(event.date)) navigate(`/events/${id}`, { replace: true });
  }, [event, id, navigate]);

  if (!event) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
      {/* Hero */}
      <div className="relative h-72 md:h-[420px] overflow-hidden">
        {event.image ? (
          <img src={event.image} alt={event.title} className="w-full h-full object-cover grayscale-[30%]" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-8xl">🎟</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-zinc-950/20" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="inline-flex items-center gap-2 bg-zinc-800/80 backdrop-blur-sm border border-zinc-700 text-zinc-400 text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full mb-4">
            ✅ Event Ended
          </div>
          <h1 className="text-4xl md:text-5xl font-black leading-tight max-w-3xl">{event.title}</h1>
          <p className="text-zinc-500 text-sm mt-2 max-w-xl">
            This event has finished. Here's the full recap, gallery, and highlights.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 py-10">
        {message && (
          <div className="bg-red-500/10 border border-red-500/25 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">{message}</div>
        )}

        {/* Summary card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <p className="text-[10px] tracking-widest uppercase text-zinc-600 font-bold mb-1">Event Recap</p>
              <h2 className="text-3xl font-black">{event.title}</h2>
            </div>
            <Link to="/"
              className="inline-flex items-center justify-center bg-zinc-800 border border-zinc-700 text-zinc-300 px-5 py-2.5 rounded-xl text-sm font-bold hover:border-zinc-500 hover:text-white transition-all self-start md:self-auto">
              ← All Events
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
            <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-2xl p-4 text-center">
              <p className="text-2xl mb-1">📍</p>
              <p className="text-[10px] tracking-widest uppercase text-zinc-600 font-bold mb-1">Location</p>
              <p className="text-white font-bold text-sm">{event.location}</p>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-2xl p-4 text-center">
              <p className="text-2xl mb-1">📅</p>
              <p className="text-[10px] tracking-widest uppercase text-zinc-600 font-bold mb-1">Date & Time</p>
              <p className="text-white font-bold text-sm">{formatEventTime(event.date, event.timezone || "UTC")}</p>
              <p className="text-zinc-600 text-xs mt-1">Your time: {formatEventTime(event.date, getUserTimezone())}</p>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-2xl p-4 text-center">
              <p className="text-2xl mb-1">👥</p>
              <p className="text-[10px] tracking-widest uppercase text-zinc-600 font-bold mb-1">Attendees</p>
              <p className="text-white font-bold text-sm">{event.attendees.length} / {event.capacity}</p>
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-6">
            <h2 className="font-black text-white text-lg mb-3">About</h2>
            <p className="text-zinc-400 leading-relaxed whitespace-pre-line text-sm">{event.description}</p>
            <div className="mt-6">
              <GetDirections venue={event.venue} location={event.location} />
            </div>
          </div>
        </div>

        <EventInsights event={event} />

        <div className="mt-8">
          <EventPosts eventId={id} user={user} readOnly />
        </div>

        <div className="mt-8">
          <EventComments eventId={id} user={user} comments={event.comments || []} />
        </div>
      </div>
    </div>
  );
}
