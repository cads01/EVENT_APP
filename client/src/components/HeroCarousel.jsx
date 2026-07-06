import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const getVideoId = (url) => {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
};

export default function HeroCarousel({ events = [] }) {
  const [idx, setIdx] = useState(0);
  const featured = events.filter(e => new Date(e.date) > new Date()).slice(0, 5);
  if (!featured.length) return null;

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % featured.length), 7000);
    return () => clearInterval(t);
  }, [featured.length]);

  const current = featured[idx];
  const videoId = getVideoId(current.videoTrailer);

  return (
    <div className="relative h-[85vh] min-h-[500px] max-h-[800px] overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={current._id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {videoId ? (
            <div className="absolute inset-0">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0`}
                className="w-full h-full pointer-events-none"
                style={{ filter: "brightness(0.5)", objectFit: "cover" }}
                allow="autoplay; encrypted-media"
                title={current.title}
              />
            </div>
          ) : current.image ? (
            <img src={current.image} alt="" className="w-full h-full object-cover" style={{ filter: "brightness(0.45)" }} />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/30" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 z-10">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={current._id + "content"}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-4">
                {current.eventType && current.eventType !== "General" && (
                  <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full border text-amber-400 bg-amber-400/10 border-amber-400/30 backdrop-blur-sm">
                    {current.eventType}
                  </span>
                )}
                {new Date(current.date) <= new Date(Date.now() + 86400000) && (
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full border text-emerald-400 bg-emerald-400/10 border-emerald-400/30 backdrop-blur-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Live
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-7xl font-black text-white leading-none tracking-tight mb-4 max-w-3xl">
                {current.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-zinc-400 mb-6">
                <span>📍 {current.location}</span>
                <span>📅 {new Date(current.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                <span className={`font-black ${current.price === 0 ? "text-emerald-400" : "text-amber-400"}`}>
                  {current.price === 0 ? "Free" : `₦${current.price.toLocaleString()}`}
                </span>
              </div>
              <p className="text-zinc-500 text-sm md:text-base max-w-xl line-clamp-2 mb-8">
                {current.description}
              </p>
              <div className="flex gap-3">
                <Link to={`/events/${current._id}`}
                  className="inline-flex items-center gap-2 bg-amber-400 text-zinc-950 font-black text-sm px-8 py-3.5 rounded-xl hover:bg-amber-300 transition-all shadow-2xl shadow-amber-500/30">
                  View Event →
                </Link>
                {current.videoTrailer && (
                  <a href={current.videoTrailer} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border border-zinc-600 text-zinc-300 font-bold text-sm px-8 py-3.5 rounded-xl hover:border-amber-400/50 hover:text-amber-400 transition-all backdrop-blur-sm">
                    ▶ Watch Trailer
                  </a>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="absolute right-8 md:right-16 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-2">
        {featured.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)}
            className={`w-2 h-2 rounded-full transition-all duration-500 ${i === idx ? "bg-amber-400 h-6" : "bg-white/30 hover:bg-white/50"}`} />
        ))}
      </div>

      <div className="absolute bottom-8 right-8 md:bottom-16 md:right-16 z-10 flex gap-2">
        <button onClick={() => setIdx(i => (i - 1 + featured.length) % featured.length)}
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all">
          ‹
        </button>
        <button onClick={() => setIdx(i => (i + 1) % featured.length)}
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all">
          ›
        </button>
      </div>
    </div>
  );
}
