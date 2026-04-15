import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { API } from "../api";
import { useAuth } from "../context/AuthContext";
import Countdown from "../components/Countdown";
import GetDirections from "../components/GetDirections";
import EventComments from "../components/EventComments";
import EventPosts from "../components/EventPosts";
import EventDonation from "../components/EventDonation";
import EventInsights from "../components/EventInsights";
import { formatEventTime, getUserTimezone } from "../utils/timeFormatting";

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
  const [ticketStatus, setTicketStatus] = useState(null);
  const isAdmin = user?.role === "admin";

  const refreshEvent = () =>
    API.get(`/events/${id}`).then(res => setEvent(res.data));

  useEffect(() => {
    refreshEvent().catch(() => setMessage("Failed to load event."));
  }, [id]);

  const isAttending = event?.attendees?.some(
    a => (a._id || a).toString() === (user?._id || user?.id)
  );

  const eventStarted = event ? new Date() >= new Date(event.date) : false;
  const canSharePhotos = isAttending && (eventStarted || ticketStatus === "used");

  const handleRSVP = async () => {
    try {
      setLoading(true);
      setMessage("");
      await API.post(`/events/${id}/rsvp`);
      setMessage("success");
      await refreshEvent();
    } catch (err) {
      setMessage(err.response?.data?.message || "RSVP failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRSVP = async () => {
    try {
      setLoading(true);
      setMessage("");
      await API.delete(`/events/${id}/rsvp`);
      setMessage("cancelled_rsvp");
      await refreshEvent();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to cancel RSVP");
    } finally {
      setLoading(false);
    }
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
    setLoadingAttendees(true);
    setShowAttendees(true);
    try {
      const res = await API.get(`/events/${id}/attendees`);
      setAttendees(res.data.attendees);
    } catch {
      setAttendees([]);
    } finally {
      setLoadingAttendees(false);
    }
  };

  useEffect(() => {
    if (!user || !isAttending) return;
    API.get(`/events/${id}/ticket`)
      .then(res => setTicketStatus(res.data.status))
      .catch(() => setTicketStatus(null));
  }, [id, user, isAttending]);

  const handleCheckIn = async () => {
    try {
      setLoading(true);
      setMessage("");
      await API.post(`/events/${id}/checkin`);
      setTicketStatus("used");
      setMessage("Checked in successfully. You can now share photos before the event starts.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Check-in failed");
    } finally {
      setLoading(false);
    }
  };

  if (!event) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Loading event...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Attendees modal */}
      {showAttendees && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Attendees</h2>
                <p className="text-sm text-gray-500">{event.title}</p>
              </div>
              <button onClick={() => setShowAttendees(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>
            <div className="overflow-y-auto flex-1 p-4">
              {loadingAttendees ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : attendees?.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No attendees yet</p>
              ) : (
                <ul className="space-y-3">
                  {attendees?.map((a, i) => (
                    <li key={a._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {a.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 text-sm truncate">{a.name}</p>
                        <p className="text-xs text-gray-400 truncate">{a.email}</p>
                      </div>
                      <span className="ml-auto text-xs text-gray-300 flex-shrink-0">#{i + 1}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="p-4 border-t text-center text-sm text-gray-500">
              {attendees?.length ?? 0} of {event.capacity} spots filled
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <div className="w-full h-72 md:h-96 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden">
        {event.image ? (
          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-8xl">🎟</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-6 left-6">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${event.price === 0 ? "bg-green-500 text-white" : "bg-blue-500 text-white"}`}>
            {event.price === 0 ? "Free" : `₦${event.price.toLocaleString()}`}
          </span>
        </div>
        {isAdmin && (
          <div className="absolute top-4 right-4 flex gap-2">
            <button onClick={() => navigate(`/events/${id}/edit`)}
              className="bg-white/90 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-white transition">
              ✏️ Edit
            </button>
            <button onClick={loadAttendees}
              className="bg-white/90 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-white transition">
              👥 Attendees ({event.attendees.length})
            </button>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-6">{event.title}</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
            <div onClick={isAdmin ? loadAttendees : undefined}
              className={`rounded-xl p-4 text-center ${isAdmin ? "bg-blue-50 hover:bg-blue-100 cursor-pointer" : "bg-gray-50"} transition`}>
              <p className="text-2xl mb-1">👥</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Attending</p>
              <p className="text-gray-800 font-semibold mt-1">{event.attendees.length} / {event.capacity}</p>
              {isAdmin && <p className="text-[10px] text-blue-400 mt-0.5">click to view list</p>}
            </div>
          </div>

          <div className="border-t pt-6 mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-3">About this event</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{event.description}</p>
            <div className="mt-6 space-y-4">
              <Countdown eventDate={event.date} />
              <GetDirections venue={event.venue} location={event.location} />
            </div>
          </div>

          {/* Capacity bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Spots filled</span>
              <span>{Math.round((event.attendees.length / event.capacity) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min((event.attendees.length / event.capacity) * 100, 100)}%` }} />
            </div>
          </div>

          {/* Messages */}
          {message === "success" && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
              🎉 RSVP confirmed! Check your email.
            </div>
          )}
          {message === "cancelled_rsvp" && (
            <div className="bg-gray-50 border border-gray-200 text-gray-600 px-4 py-3 rounded-xl mb-6 text-sm">
              Your RSVP has been cancelled.
            </div>
          )}
          {message === "cancelled" && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-xl mb-6 text-sm">
              Payment was cancelled.
            </div>
          )}
          {message && !["success", "cancelled_rsvp", "cancelled"].includes(message) && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">
              {message}
            </div>
          )}

          {/* Action buttons */}
          {user ? (
            <div className="flex gap-3">
              {isAttending ? (
                <button onClick={handleCancelRSVP} disabled={loading}
                  className="flex-1 border-2 border-red-200 text-red-500 py-4 rounded-xl font-bold text-base hover:bg-red-50 transition disabled:opacity-50">
                  {loading ? "Cancelling..." : "Cancel My RSVP"}
                </button>
              ) : event.price > 0 ? (
                <button onClick={handlePayment} disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition disabled:opacity-50">
                  {loading ? "Processing..." : `Pay ₦${event.price.toLocaleString()} & RSVP`}
                </button>
              ) : (
                <button onClick={handleRSVP} disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition disabled:opacity-50">
                  {loading ? "Processing..." : "RSVP Now — It's Free!"}
                </button>
              )}
        
            {isAttending && !canSharePhotos && (
              <div className="mt-4 p-4 rounded-xl border border-yellow-200 bg-yellow-50 text-yellow-700 text-sm">
                Check in before the event starts to post pictures early.
                <button
                  onClick={handleCheckIn}
                  disabled={loading}
                  className="mt-3 w-full inline-flex justify-center items-center rounded-lg bg-yellow-500 px-4 py-2 text-white font-semibold hover:bg-yellow-600 transition disabled:opacity-50"
                >
                  {loading ? "Checking in..." : "Check in now"}
                </button>
              </div>
            )}
          </div>
          ) : (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center">
              <p className="text-gray-600 mb-4">You need to be logged in to RSVP</p>
              <div className="flex gap-3 justify-center">
                <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition">Login</Link>
                <Link to="/register" className="border border-blue-600 text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition">Register</Link>
              </div>
            </div>
          )}
        </div>

        {event.createdBy && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Organizer</h2>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {event.createdBy.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{event.createdBy.name}</p>
                <p className="text-sm text-gray-500">{event.createdBy.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Event Insights */}
        <EventInsights event={event} />

        {/* Donations Section */}
        <EventDonation 
          eventId={id} 
          user={user}
          currentDonations={event.donations || 0}
          onDonation={() => {
            API.get(`/events/${id}`).then(res => setEvent(res.data));
          }}
        />

        {/* Picture Posts Section */}
        <EventPosts 
          eventId={id}
          user={user}
          isAttending={isAttending}
          canPost={canSharePhotos}
          onPostsChange={() => {
            API.get(`/events/${id}`).then(res => setEvent(res.data));
          }}
        />

        {/* Comments Section */}
        <EventComments 
          eventId={id}
          user={user}
          comments={event.comments || []}
        />
      </div>
    </div>
  );
}
