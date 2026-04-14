import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { API } from "../api";
import { useAuth } from "../context/AuthContext";
import Countdown from "../components/Countdown";
import GetDirections from "../components/GetDirections";

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get(`/events/${id}`).then(res => setEvent(res.data));
  }, [id]);

  const handleRSVP = async () => {
    try {
      setLoading(true);
      await API.post(`/events/${id}/rsvp`);
      setMessage("success");
    } catch (err) {
      setMessage(err.response?.data?.message || "RSVP failed");
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

  if (!event) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500">Loading event...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image */}
      <div className="w-full h-72 md:h-96 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden">
        {event.image ? (
          <img src={event.image} alt={event.title}
            className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center text-8xl">
  🎟
</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-6 left-6">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${event.price === 0 ? "bg-green-500 text-white" : "bg-blue-500 text-white"}`}>
            {event.price === 0 ? "Free" : `₦${event.price.toLocaleString()}`}
          </span>
        </div>
      </div>

      {/* Content */}
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
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Date</p>
              <p className="text-gray-800 font-semibold mt-1">{new Date(event.date).toDateString()}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-2xl mb-1">👥</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Attending</p>
              <p className="text-gray-800 font-semibold mt-1">{event.attendees.length} / {event.capacity}</p>
            </div>
          </div>

          <div className="border-t pt-6 mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-3">About this event</h2>
            <p className="text-gray-600 leading-relaxed">{event.description}</p>
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

          {/* Message */}
          {message === "success" && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
              🎉 RSVP successful! Check your email for confirmation.
            </div>
          )}
          {message === "cancelled" && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-xl mb-6 text-sm">
              Payment was cancelled.
            </div>
          )}
          {message && message !== "success" && message !== "cancelled" && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">
              {message}
            </div>
          )}

          {/* Action */}
          {user ? (
            <div className="flex gap-4">
              {event.price > 0 ? (
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
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center">
              <p className="text-gray-600 mb-4">You need to be logged in to RSVP</p>
              <div className="flex gap-3 justify-center">
                <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
                  Login
                </Link>
                <Link to="/register" className="border border-blue-600 text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition">
                  Register
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Organizer */}
        {event.createdBy && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
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

        {/* Event Details */}
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <Countdown eventDate={event.date} />
          <GetDirections venue={event.venue} location={event.location} />
        </div>
      </div>
    </div>
  );
}