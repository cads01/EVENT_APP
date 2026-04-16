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
      <h1>Test - Events Page</h1>
    </div>
  );

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
