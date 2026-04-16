import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { formatEventTime, isPastEvent } from "../utils/timeFormatting";

export default function EventCarousel({ events = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (events.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % events.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [events.length]);

  if (events.length === 0) return null;

  const current = events[currentIndex];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + events.length) % events.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % events.length);
  };

  return (
    <div className="relative w-full h-96 rounded-2xl overflow-hidden shadow-lg">
      {/* Carousel items */}
      {events.map((event, idx) => (
        <div
          key={event._id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            idx === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Background image */}
          {event.image ? (
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-8xl">
              🎟
            </div>
          )}
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <h3 className="text-3xl font-bold mb-2">{current.title}</h3>
            <div className="flex gap-4 text-sm mb-4 flex-wrap">
              <div className="flex items-center gap-1">
                <span>📍</span>
                <span>{current.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>📅</span>
                <span>{formatEventTime(current.date, current.timezone || "UTC")}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>👥</span>
                <span>
                  {current.attendees?.length || 0} / {current.capacity}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Single View Event button for current event */}
      <Link
        to={isPastEvent(current.date) ? `/events/${current._id}/summary` : `/events/${current._id}`}
        className="absolute bottom-8 right-8 inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition z-30"
      >
        View Event →
      </Link>

      {/* Navigation buttons */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-gray-800 rounded-full w-10 h-10 flex items-center justify-center transition"
      >
        ‹
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-gray-800 rounded-full w-10 h-10 flex items-center justify-center transition"
      >
        ›
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
        {events.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2 h-2 rounded-full transition ${
              idx === currentIndex ? "bg-white w-6" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
