import { useEffect, useState } from "react";
import { API } from "../api";
import { useNavigate } from "react-router-dom";

export default function Trash() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [confirmPurge, setConfirmPurge] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/events/trash").then(res => setItems(res.data)).finally(() => setLoading(false));
  }, []);

  const handleRestore = async (item) => {
    try {
      setActionId(item._id);
      await API.post(`/events/trash/${item._id}/restore`);
      setItems(prev => prev.filter(i => i._id !== item._id));
    } catch (err) { alert(err.response?.data?.message || "Restore failed"); }
    finally { setActionId(null); }
  };

  const handlePermanentDelete = async () => {
    if (!confirmPurge) return;
    try {
      setActionId(confirmPurge._id);
      await API.delete(`/events/trash/${confirmPurge._id}`);
      setItems(prev => prev.filter(i => i._id !== confirmPurge._id));
      setConfirmPurge(null);
    } catch (err) { alert(err.response?.data?.message || "Delete failed"); }
    finally { setActionId(null); }
  };

  const daysLeft = (expiresAt) => {
    const diff = new Date(expiresAt) - new Date();
    if (diff <= 0) return "Expiring soon";
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return `${days}d left`;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-12 px-4" style={{ fontFamily: "'Syne', sans-serif" }}>
      <div className="h-px w-full fixed top-0 left-0 bg-gradient-to-r from-red-500 via-rose-400 to-orange-400" />

      {/* Purge confirm modal */}
      {confirmPurge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 max-w-sm w-full shadow-2xl">
            <p className="text-4xl text-center mb-4">⚠️</p>
            <h2 className="text-xl font-black text-white text-center mb-2">Delete Forever?</h2>
            <p className="text-zinc-500 text-sm text-center mb-6">
              "<span className="text-white font-bold">{confirmPurge.title}</span>" will be permanently destroyed.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmPurge(null)}
                className="flex-1 border border-zinc-700 text-zinc-400 py-3 rounded-xl text-sm font-bold hover:border-zinc-500 hover:text-white transition-all">
                Cancel
              </button>
              <button onClick={handlePermanentDelete} disabled={!!actionId}
                className="flex-1 bg-red-500 text-white py-3 rounded-xl text-sm font-bold hover:bg-red-400 transition-all disabled:opacity-40">
                {actionId ? "Deleting…" : "Delete Forever"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto pt-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <button onClick={() => navigate("/")} className="text-zinc-600 hover:text-zinc-400 text-sm mb-3 block transition-colors">← Back to Events</button>
            <p className="text-[10px] tracking-[0.35em] uppercase text-red-400 font-bold mb-1">Recycle Bin</p>
            <h1 className="text-4xl font-black flex items-center gap-3">🗑️ Trash</h1>
            <p className="text-zinc-600 text-sm mt-1">Deleted events are kept for 30 days then auto-purged</p>
          </div>
          {items.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-black px-3 py-1.5 rounded-xl mt-8">
              {items.length} item{items.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 rounded-full border-2 border-red-400 border-t-transparent animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-16 text-center">
            <p className="text-5xl mb-4">✨</p>
            <p className="font-black text-white text-xl mb-2">Trash is empty</p>
            <p className="text-zinc-600 text-sm">Deleted events will appear here for 30 days.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <div key={item._id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all flex gap-4 p-5">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0 ring-1 ring-white/5">
                  {item.image
                    ? <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-3xl">🎟</div>}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h2 className="font-black text-white text-base truncate">{item.title}</h2>
                    <span className="flex-shrink-0 text-[10px] font-bold text-orange-400 bg-orange-400/10 border border-orange-400/20 px-2 py-0.5 rounded-full">
                      {daysLeft(item.expiresAt)}
                    </span>
                  </div>
                  <p className="text-zinc-500 text-xs mb-0.5">📍 {item.location} · 📅 {new Date(item.date).toDateString()}</p>
                  <p className="text-zinc-600 text-[11px]">
                    Deleted {new Date(item.deletedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    {item.deletedBy?.name && ` by ${item.deletedBy.name}`}
                  </p>
                  <p className="text-zinc-700 text-[11px] mt-0.5">
                    {item.attendees?.length ?? 0} attendees · {item.price === 0 ? "Free" : `₦${item.price?.toLocaleString()}`}
                  </p>
                </div>

                <div className="flex flex-col gap-2 flex-shrink-0 justify-center">
                  <button onClick={() => handleRestore(item)} disabled={!!actionId}
                    className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-40 whitespace-nowrap hover:border-sky-400/40 hover:text-sky-400">
                    {actionId === item._id ? "…" : "↩ Restore"}
                  </button>
                  <button onClick={() => setConfirmPurge(item)} disabled={!!actionId}
                    className="border border-red-500/25 text-red-500 bg-red-500/5 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-500/10 transition-all disabled:opacity-40 whitespace-nowrap">
                    Delete Forever
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
