import { useEffect, useState } from "react";
import { API } from "../api";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { formatEventTimeShort, isPastEvent } from "../utils/timeFormatting";
import EventCarousel from "../components/EventCarousel";
import BlogCarousel from "../components/BlogCarousel";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [ongoingEvents, setOngoingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null); // event to confirm delete
  const [deleting, setDeleting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const popularOngoingEvents = events
    .filter(e => new Date(e.date) >= new Date() && e.attendees.length > 0)
    .sort((a, b) => b.attendees.length - a.attendees.length);

  const featuredEvent = popularOngoingEvents[0];

  const eventsByLocation = {};
  events.forEach(event => {
    const loc = event.location || 'Other';
    if (!eventsByLocation[loc]) eventsByLocation[loc] = [];
    eventsByLocation[loc].push(event);
  });

  const freeEvents = events.filter(e => e.price === 0);
  const paidEvents = events.filter(e => e.price > 0);
  const upcomingEvents = events.filter(e => new Date(e.date) > new Date());
  const pastEvents = events.filter(e => new Date(e.date) <= new Date());

  useEffect(() => {
    // Fetch events
    API.get("/events")
      .then(res => {
        setEvents(res.data);
        setOngoingEvents(res.data);
      })
      .finally(() => setLoading(false));

    // Fetch featured blogs
    API.get("/blogs")
      .then(res => {
        // Sort by featured and recent
        const sorted = res.data.sort((a, b) => {
          if (a.featured === b.featured) {
            return new Date(b.createdAt) - new Date(a.createdAt);
          }
          return b.featured - a.featured;
        });
        setBlogs(sorted.slice(0, 12)); // Get top 12 blogs
      })
      .catch(err => console.log("Blogs not available yet"))
      .finally(() => setBlogsLoading(false));
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await API.delete(`/events/${deleteTarget._id}`);
      setEvents(prev => prev.filter(e => e._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete event");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full">
            <div className="text-4xl mb-4 text-center">🗑️</div>
            <h2 className="text-xl font-bold text-gray-800 text-center mb-2">Delete Event?</h2>
            <p className="text-gray-500 text-sm text-center mb-6">
              <span className="font-semibold text-gray-700">"{deleteTarget.title}"</span> will be permanently deleted.
              This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-xl font-medium hover:bg-red-600 transition text-sm disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: featuredEvent?.image
              ? `url('${featuredEvent.image}')`
              : "url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-purple-900/70 to-indigo-900/80" />
        <div className="absolute inset-0 bg-black/40" />

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          {featuredEvent ? (
            <>
              <div className="mb-6">
                <span className="inline-block bg-yellow-500/20 text-yellow-300 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                  🔥 Popular Event
                </span>
                <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tight leading-tight">
                  {featuredEvent.title}
                </h1>
                <div className="flex flex-wrap justify-center gap-6 text-blue-100 mb-6">
                  <div className="flex items-center gap-2">
                    <span>📍</span>
                    <span>{featuredEvent.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>📅</span>
                    <span>{formatEventTimeShort(featuredEvent.date, featuredEvent.timezone || 'UTC')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>👥</span>
                    <span>{featuredEvent.attendees.length} attending</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  to={getEventLink(featuredEvent)}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 shadow-xl"
                >
                  View Event Details
                </Link>
                {isAdmin && (
                  <button
                    onClick={() => navigate("/create")}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/20 transition-all duration-300"
                  >
                    + Create Event
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tight leading-none">
                Discover
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                  Amazing Events
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed font-light">
                Find and attend the best events happening around you. Connect with communities, explore new experiences, and create unforgettable memories.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 shadow-xl">
                  Explore Events
                </button>
                {isAdmin && (
                  <button
                    onClick={() => navigate("/create")}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/20 transition-all duration-300"
                  >
                    + Create Event
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "48px 24px" }}>
        {/* Ongoing Events Carousel */}
        {!loading && ongoingEvents.length > 0 && (
          <div className="mb-16">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">🔴 Featured Events</h2>
              <p className="text-gray-600">Discover upcoming and past events</p>
            </div>
            <EventCarousel events={ongoingEvents} />
          </div>
        )}

        {/* Blogs & Comments Carousel */}
        {!blogsLoading && blogs.length > 0 && (
          <div className="mb-16">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">📰 Latest Blogs & Comments</h2>
              <p className="text-gray-600">What the community is saying about events</p>
            </div>
            <BlogCarousel blogs={blogs} />
          </div>
        )}

        {/* Popular Events */}
        {popularEvents.length > 0 && (
          <div className="mb-16">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">🔥 Popular Events</h2>
              <p className="text-gray-600">Most attended events by the community</p>
            </div>
            <EventCarousel events={popularEvents} />
          </div>
        )}

        {/* Events by Location */}
        {Object.keys(eventsByLocation).length > 0 && (
          <div className="mb-16">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">📍 Events by Location</h2>
              <p className="text-gray-600">Find events happening near you</p>
            </div>
            <div className="space-y-12">
              {Object.entries(eventsByLocation).slice(0, 3).map(([location, locEvents]) => (
                <div key={location}>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Events in {location}</h3>
                  <EventCarousel events={locEvents} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Event Categories */}
        <div className="mb-16">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">🏷️ Event Categories</h2>
            <p className="text-gray-600">Browse events by type and availability</p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition">
              Free Events ({freeEvents.length})
            </button>
            <button className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium hover:bg-green-200 transition">
              Paid Events ({paidEvents.length})
            </button>
            <button className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium hover:bg-purple-200 transition">
              Upcoming ({upcomingEvents.length})
            </button>
            <button className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium hover:bg-orange-200 transition">
              Past Events ({pastEvents.length})
            </button>
          </div>

          {/* Category Grids - Show Free Events by default */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {freeEvents.slice(0, 6).map(event => (
              <div key={event._id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                <Link to={getEventLink(event)} className="block">
                  {event.image ? (
                    <img src={event.image} alt={event.title} className="w-full h-48 object-cover" />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-4xl">🎟</div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{event.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">📍 {event.location}</p>
                    <p className="text-sm text-gray-500">{formatEventTimeShort(event.date, event.timezone || 'UTC')}</p>
                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-green-600 font-semibold">Free</span>
                      <span className="text-sm text-gray-500">{event.attendees.length} attending</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* App Info Sections */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover, attend, and connect at local events with our easy-to-use platform
            </p>
          </div>

          <div className="grid gap-8 xl:grid-cols-3">
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Discover Events</h3>
              <p className="text-gray-600 leading-relaxed">
                Browse upcoming events in your area. Filter by date, location, and interests to find the perfect event for you.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🎫</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">RSVP & Pay</h3>
              <p className="text-gray-600 leading-relaxed">
                Securely RSVP to free events or purchase tickets. Get instant confirmation and event updates via email.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">📸</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Share & Connect</h3>
              <p className="text-gray-600 leading-relaxed">
                Post photos, leave comments, and connect with other attendees. Build lasting memories and community.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 bg-gray-50 rounded-3xl p-8 md:p-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Got questions? We've got answers. Learn more about using our event platform.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How do I find events near me?</h3>
              <p className="text-gray-600">
                Browse our events page to see all upcoming events. You can filter by location, date, and category to find events in your area.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Is it free to attend events?</h3>
              <p className="text-gray-600">
                Many events are free to attend, but some require ticket purchases. Check the event details for pricing and RSVP options.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How do I RSVP for an event?</h3>
              <p className="text-gray-600">
                Click on any event to view details, then use the RSVP button. Free events require just a click, paid events use secure payment processing.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I share photos from events?</h3>
              <p className="text-gray-600">
                Yes! After RSVPing and checking in, you can post photos during the event. Photos are moderated to ensure a positive experience.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Get In Touch</h2>
            <p className="text-gray-600 mb-8">
              Have questions about events or need help with your account? Our support team is here to help.
            </p>
            <div className="space-y-4 text-left max-w-md mx-auto">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📧</span>
                <div>
                  <p className="font-semibold text-gray-900">Email Support</p>
                  <p className="text-gray-600">support@eventapp.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">📍</span>
                <div>
                  <p className="font-semibold text-gray-900">Location</p>
                  <p className="text-gray-600">Lagos, Nigeria</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
