import { useEffect, useState, useRef } from "react";
import { API } from "../api";
import { motion, AnimatePresence } from "framer-motion";
import { subscribeToChannel } from "../utils/supabase";

const TYPE_COLORS = {
  info: { dot: "bg-sky-400", border: "border-sky-500/20", bg: "bg-sky-500/5" },
  alert: { dot: "bg-red-400", border: "border-red-500/20", bg: "bg-red-500/5" },
  change: { dot: "bg-amber-400", border: "border-amber-500/20", bg: "bg-amber-500/5" },
  announcement: { dot: "bg-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/5" },
};

export default function LiveUpdates({ eventId, isOrganizer = false, canPost = false }) {
  const [updates, setUpdates] = useState([]);
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const subRef = useRef(null);

  const fetch = () => {
    API.get(`/live-updates/${eventId}`).then(res => setUpdates(res.data)).catch(() => {});
  };

  useEffect(() => {
    fetch();
    const t = setInterval(fetch, 30000);
    var sub = subscribeToChannel("live-updates:" + eventId, "new-update", function(payload) {
      setUpdates(function(prev) { return [payload, ...prev] });
    });
    subRef.current = sub;
    return function() {
      clearInterval(t);
      if (sub && typeof sub.unsubscribe === "function") sub.unsubscribe();
    };
  }, [eventId]);

  const handlePost = async () => {
    if (!message.trim()) return;
    try {
      setLoading(true);
      await API.post(`/live-updates/${eventId}`, { message, type });
      setMessage("");
      setShowForm(false);
      fetch();
    } catch (err) { alert(err.response?.data?.message || "Failed"); }
    finally { setLoading(false); }
  };

  const handleDelete = async (updateId) => {
    try {
      await API.delete(`/live-updates/${eventId}/${updateId}`);
      fetch();
    } catch {}
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <p className="text-[10px] tracking-widest uppercase text-emerald-400 font-bold">Live Updates</p>
        </div>
        {canPost && (
          <button onClick={() => setShowForm(v => !v)}
            className="text-xs font-bold text-amber-400 border border-amber-400/25 px-3 py-1.5 rounded-xl hover:bg-amber-400/10 transition-all">
            {showForm ? "Cancel" : "+ Post Update"}
          </button>
        )}
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-4 space-y-3">
          <select value={type} onChange={e => setType(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-3 py-2">
            <option value="info">Info</option>
            <option value="alert">Alert</option>
            <option value="change">Change</option>
            <option value="announcement">Announcement</option>
          </select>
          <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Write an update..."
            className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-xl px-3 py-2 text-sm resize-none" rows={3} />
          <div className="flex gap-2">
            <button onClick={handlePost} disabled={loading || !message.trim()}
              className="bg-amber-400 text-zinc-950 px-4 py-2 rounded-xl text-xs font-bold hover:bg-amber-300 transition-all disabled:opacity-40">
              {loading ? "Posting..." : "Post Update"}
            </button>
          </div>
        </motion.div>
      )}

      <div className="space-y-2 max-h-80 overflow-y-auto pr-1" style={{ scrollbarWidth: "thin" }}>
        <AnimatePresence>
          {updates.length === 0 ? (
            <p className="text-zinc-600 text-xs text-center py-8 tracking-widest uppercase">No updates yet</p>
          ) : updates.map(u => {
            const c = TYPE_COLORS[u.type] || TYPE_COLORS.info;
            return (
              <motion.div key={u._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                className={`${c.bg} border ${c.border} rounded-xl p-4`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${c.dot}`} />
                    <div className="min-w-0">
                      <p className="text-white text-sm">{u.message}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] uppercase tracking-widest text-zinc-600">{u.type}</span>
                        <span className="text-[10px] text-zinc-700">·</span>
                        <span className="text-[10px] text-zinc-600">{new Date(u.createdAt).toLocaleTimeString()}</span>
                        {u.postedBy?.name && <span className="text-[10px] text-zinc-700">· {u.postedBy.name}</span>}
                      </div>
                    </div>
                  </div>
                  {isOrganizer && (
                    <button onClick={() => handleDelete(u._id)}
                      className="text-zinc-600 hover:text-red-400 transition-colors text-xs flex-shrink-0">×</button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
