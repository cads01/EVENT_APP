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
    if (!isPastEvent(event.date)) {
      navigate(`/events/${id}`, { replace: true });
    }
  }, [event, id, navigate]);

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading event summary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full h-72 md:h-96 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden">
        {event.image ? (
          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-8xl">🎟</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute top-6 left-6 right-6 flex flex-col gap-3">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full text-sm font-semibold tracking-wide">
            <span>✅ Event Ended</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white max-w-3xl">{event.title}</h1>
          <p className="max-w-2xl text-sm md:text-base text-blue-100">
            This event has finished. Here is the full recap, gallery, and everything that happened.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {message && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">
            {message}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-widest text-gray-500 mb-2">Event summary</p>
              <h2 className="text-3xl font-bold text-gray-900">{event.title}</h2>
            </div>
            <Link to="/" className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition">
              ← Back to all events
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-2xl mb-1">📍</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Location</p>
              <p className="text-gray-800 font-semibold mt-1">{event.location}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-2xl mb-1">📅</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Date & Time</p>
              <p className="text-gray-800 font-semibold mt-1 text-sm">{formatEventTime(event.date, event.timezone || 'UTC')}</p>
              <p className="text-xs text-gray-500 mt-2">Your time: {formatEventTime(event.date, getUserTimezone())}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-2xl mb-1">👥</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Attendees</p>
              <p className="text-gray-800 font-semibold mt-1">{event.attendees.length} / {event.capacity}</p>
            </div>
          </div>

          <div className="border-t pt-6 mt-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">About this event</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{event.description}</p>
            <div className="mt-6 space-y-4">
              <GetDirections venue={event.venue} location={event.location} />
            </div>
          </div>
        </div>

        <EventInsights event={event} />

        <div className="mt-10">
          <EventPosts
            eventId={id}
            user={user}
            readOnly
          />
        </div>

        <div className="mt-10">
          <EventComments
            eventId={id}
            user={user}
            comments={event.comments || []}
          />
        </div>
      </div>
    </div>
  );
}
