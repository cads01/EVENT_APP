import { useEffect, useState, useRef } from "react";
import { API } from "../api";
import { motion, AnimatePresence } from "framer-motion";
import { subscribeToChannel } from "../utils/supabase";

export default function NotificationBell({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const subRef = useRef(null);

  const fetch = () => {
    if (!user) return;
    API.get("/notifications").then(res => setNotifications(res.data)).catch(() => {});
  };

  useEffect(() => {
    fetch();
    const t = setInterval(fetch, 60000);
    if (user) {
      var sub = subscribeToChannel("notifications:" + user.id, "new-notification", function(payload) {
        setNotifications(function(prev) { return [payload, ...prev] });
      });
      subRef.current = sub;
    }
    return function() {
      clearInterval(t);
      if (subRef.current && typeof subRef.current.unsubscribe === "function") subRef.current.unsubscribe();
    };
  }, [user]);

  const unread = notifications.filter(n => !n.read).length;

  const markRead = async (id) => {
    await API.put(`/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    await API.put("/notifications/read-all");
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button onClick={() => setOpen(v => !v)}
        className="relative w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center hover:border-zinc-500 transition-all">
        <span className="text-sm">🔔</span>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-10 w-80 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden z-50">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <p className="text-xs font-bold text-zinc-400 tracking-widest uppercase">Notifications</p>
              {unread > 0 && (
                <button onClick={markAllRead}
                  className="text-[10px] text-amber-400 font-bold hover:text-amber-300 transition-colors">Mark all read</button>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
              {notifications.length === 0 ? (
                <p className="text-center text-zinc-600 text-xs py-8">No notifications</p>
              ) : notifications.map(n => (
                <div key={n._id} onClick={() => markRead(n._id)}
                  className={`p-4 border-b border-zinc-800 cursor-pointer hover:bg-zinc-800/50 transition-all ${!n.read ? "border-l-2 border-l-amber-400" : ""}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.type === "alert" ? "bg-red-400" : n.type === "badge" ? "bg-amber-400" : "bg-sky-400"}`} />
                    <div className="min-w-0">
                      <p className="text-white text-xs font-bold">{n.title}</p>
                      <p className="text-zinc-500 text-[11px] mt-0.5">{n.message}</p>
                      <p className="text-zinc-700 text-[9px] mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
