import { useEffect, useState, useRef } from "react";
import { API } from "../api";
import { motion } from "framer-motion";
import { subscribeToChannel } from "../utils/supabase";

export default function VIPChat({ eventId, user, isVip = false }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const subRef = useRef(null);

  const fetch = () => {
    API.get(`/live-updates/${eventId}/vip-chat`).then(res => setMessages(res.data || [])).catch(() => {});
  };

  useEffect(() => {
    if (!isVip) return;
    fetch();
    const t = setInterval(fetch, 15000);
    var sub = subscribeToChannel("vip-chat:" + eventId, "new-message", function(payload) {
      setMessages(function(prev) { return [...prev, payload] });
    });
    subRef.current = sub;
    return function() {
      clearInterval(t);
      if (sub && typeof sub.unsubscribe === "function") sub.unsubscribe();
    };
  }, [eventId, isVip]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!text.trim()) return;
    try {
      setLoading(true);
      await API.post(`/live-updates/${eventId}/vip-chat`, { message: text });
      setText("");
      fetch();
    } catch {}
    finally { setLoading(false); }
  };

  if (!isVip) {
    return (
      <div className="mb-8 bg-zinc-900/50 border border-dashed border-zinc-700 rounded-2xl p-6 text-center">
        <p className="text-2xl mb-2">🔒</p>
        <p className="text-zinc-500 text-xs tracking-widest uppercase">VIP Lounge</p>
        <p className="text-zinc-600 text-xs mt-1">Available for VIP ticket holders</p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">💎</span>
        <p className="text-[10px] tracking-widest uppercase text-amber-400 font-bold">VIP Lounge</p>
        <span className="text-[10px] text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded-full">Exclusive</span>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
        <div className="h-64 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: "thin" }}>
          {messages.length === 0 ? (
            <p className="text-zinc-600 text-xs text-center py-8">Welcome to the VIP Lounge</p>
          ) : messages.map((m, i) => (
            <motion.div key={m._id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 ${m.user?._id === user?._id ? "flex-row-reverse" : ""}`}>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${
                m.user?._id === user?._id ? "bg-amber-400 text-zinc-950" : "bg-zinc-700 text-white"}`}>
                {m.user?.name?.[0]?.toUpperCase() || "?"}
              </div>
              <div className={`max-w-[75%] ${m.user?._id === user?._id ? "items-end" : ""}`}>
                <p className={`text-xs font-bold mb-0.5 ${m.user?._id === user?._id ? "text-amber-400 text-right" : "text-zinc-400"}`}>
                  {m.user?.name || "Anonymous"}
                </p>
                <div className={`rounded-2xl px-3 py-2 text-sm ${
                  m.user?._id === user?._id ? "bg-amber-400 text-zinc-950" : "bg-zinc-800 text-white"}`}>
                  {m.message}
                </div>
              </div>
            </motion.div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-zinc-800 p-3 flex gap-2">
          <input value={text} onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Type a message..." className="flex-1 bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-xl px-3 py-2 text-sm" />
          <button onClick={send} disabled={loading || !text.trim()}
            className="bg-amber-400 text-zinc-950 px-4 py-2 rounded-xl text-xs font-bold hover:bg-amber-300 transition-all disabled:opacity-40">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
