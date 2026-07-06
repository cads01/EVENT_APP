import { useEffect, useState } from "react";
import { API } from "../api";
import { motion, AnimatePresence } from "framer-motion";

export default function Matchmaking({ eventId, user }) {
  const [data, setData] = useState(null);
  const [soloMode, setSoloMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetch = () => {
    if (!user) return;
    API.get(`/matchmaking/${eventId}`).then(res => {
      setData(res.data);
      setSoloMode(user.preferences?.soloMode || false);
    }).catch(() => {});
  };

  useEffect(() => { fetch(); }, [eventId, user]);

  const toggle = async () => {
    try {
      setLoading(true);
      const res = await API.post(`/matchmaking/${eventId}/toggle`);
      setSoloMode(res.data.soloMode);
      fetch();
    } catch {}
    finally { setLoading(false); }
  };

  if (!data) return null;

  return (
    <div className="mb-8">
      <button onClick={toggle} disabled={loading}
        className="w-full flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition-all">
        <div className="flex items-center gap-3">
          <span className="text-xl">🤝</span>
          <div className="text-left">
            <p className="font-bold text-white text-sm">Solo Attendee Matchmaking</p>
            <p className="text-zinc-500 text-xs">
              {soloMode ? "You're visible to other solo attendees" : "Toggle to connect with other solo attendees"}
            </p>
          </div>
        </div>
        <div className={`w-12 h-6 rounded-full transition-colors ${soloMode ? "bg-emerald-400" : "bg-zinc-700"} relative`}>
          <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${soloMode ? "translate-x-6" : "translate-x-0.5"}`} />
        </div>
      </button>

      <AnimatePresence>
        {soloMode && data.matches?.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            className="bg-zinc-900 border-x border-b border-zinc-800 rounded-b-2xl p-4 space-y-2">
            <p className="text-xs font-bold text-zinc-500 tracking-widest uppercase mb-3">
              {data.matches.length} solo attendee{data.matches.length !== 1 ? "s" : ""} at this event
            </p>
            {data.matches.map(m => (
              <div key={m._id} className="flex items-center gap-3 bg-zinc-800/50 rounded-xl p-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-zinc-950 font-black text-sm">
                  {m.name?.[0]?.toUpperCase()}
                </div>
                <p className="font-bold text-white text-sm">{m.name}</p>
              </div>
            ))}
          </motion.div>
        )}
        {soloMode && (!data.matches || data.matches.length === 0) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-4 text-zinc-600 text-xs tracking-widest uppercase">
            No other solo attendees found yet
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
