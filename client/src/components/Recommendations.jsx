import { useEffect, useState } from "react";
import { API } from "../api";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Recommendations({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    API.get("/recommendations")
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (!user || loading) return null;
  if (!data || (!data.basedOnHistory?.length && !data.popular?.length)) return null;

  const Row = ({ title, items }) => {
    if (!items?.length) return null;
    return (
      <div className="mb-8">
        <p className="text-[10px] tracking-[0.35em] uppercase text-amber-400 font-bold mb-4">{title}</p>
        <div className="flex gap-4 overflow-x-auto pb-3" style={{ scrollbarWidth: "none" }}>
          {items.map((ev, i) => (
            <motion.div key={ev._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={`/events/${ev._id}`} className="block flex-shrink-0 w-52 group">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-600 hover:-translate-y-1 transition-all duration-300">
                  <div className="h-28 overflow-hidden bg-zinc-800 relative">
                    {ev.image ? <img src={ev.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      : <div className="w-full h-full flex items-center justify-center text-3xl">🎟</div>}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <div className="p-3">
                    <p className="font-black text-white text-sm line-clamp-1">{ev.title}</p>
                    <p className="text-zinc-600 text-xs truncate mt-0.5">📍 {ev.location}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-[10px] font-black ${ev.price === 0 ? "text-emerald-400" : "text-amber-400"}`}>
                        {ev.price === 0 ? "Free" : `₦${ev.price.toLocaleString()}`}
                      </span>
                      <span className="text-[10px] text-zinc-600">{new Date(ev.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="px-5 md:px-10">
      <Row title="Based on Your History" items={data.basedOnHistory} />
      <Row title="Popular Right Now" items={data.popular} />
    </div>
  );
}
