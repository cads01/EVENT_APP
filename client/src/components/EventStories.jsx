import { useState, useEffect, useCallback } from "react";
import { API } from "../api";
import { motion, AnimatePresence } from "framer-motion";

export default function EventStories({ eventId, user, isAttending }) {
  const [stories, setStories] = useState([]);
  const [viewing, setViewing] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    API.get(`/events/${eventId}/posts`).then(res => {
      const recent = res.data.filter(p => {
        const diff = Date.now() - new Date(p.createdAt).getTime();
        return diff < 86400000;
      });
      setStories(recent);
    }).catch(() => {});
  }, [eventId]);

  useEffect(() => {
    if (viewing === null) return;
    const dur = 5000;
    const step = 100;
    const t = setInterval(() => {
      setProgress(p => {
        const next = p + step;
        if (next >= dur) {
          setViewing(v => (v + 1 < stories.length ? v + 1 : null));
          return 0;
        }
        return next;
      });
    }, step);
    return () => clearInterval(t);
  }, [viewing, stories.length]);

  const close = useCallback(() => { setViewing(null); setProgress(0); }, []);

  if (!stories.length) return (
    <div className="mb-8 bg-zinc-900/50 border border-dashed border-zinc-700 rounded-2xl p-6 text-center">
      <p className="text-2xl mb-2">📸</p>
      <p className="text-zinc-500 text-xs tracking-widest uppercase">Event Stories</p>
      <p className="text-zinc-600 text-xs mt-1">No stories yet today. Be the first to share!</p>
    </div>
  );

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
        <p className="text-[10px] tracking-widest uppercase text-rose-400 font-bold">Stories</p>
        <span className="text-[10px] text-zinc-600">· {stories.length} today</span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
        {stories.map((s, i) => (
          <button key={s._id} onClick={() => setViewing(i)}
            className="flex-shrink-0 flex flex-col items-center gap-1.5 group">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-400 to-amber-400 p-0.5">
              <div className="w-full h-full rounded-full bg-zinc-800 overflow-hidden">
                {s.images?.[0] ? (
                  <img src={s.images[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg font-bold text-white">
                    {s.author?.name?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            <p className="text-[9px] text-zinc-500 truncate max-w-16 text-center">{s.author?.name?.split(" ")[0]}</p>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {viewing !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
            onClick={close}>
            <div className="relative max-w-lg w-full mx-4" onClick={e => e.stopPropagation()}>
              <div className="h-[70vh] bg-zinc-900 rounded-3xl overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 z-10 p-3">
                  <div className="w-full h-0.5 bg-zinc-700 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 transition-all" style={{ width: `${(progress / 5000) * 100}%` }} />
                  </div>
                </div>
                {stories[viewing]?.images?.[0] && (
                  <img src={stories[viewing].images[0]} alt="Story" className="w-full h-full object-cover" />
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <p className="text-white font-bold">{stories[viewing]?.author?.name}</p>
                  {stories[viewing]?.caption && (
                    <p className="text-zinc-300 text-sm mt-1">{stories[viewing].caption}</p>
                  )}
                </div>
              </div>
              <button onClick={close}
                className="absolute -top-10 right-0 text-white/60 hover:text-white text-sm transition-colors">Close</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
