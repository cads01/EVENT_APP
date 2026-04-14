import { useEffect, useState } from "react";
import { API } from "../api";
import { useNavigate } from "react-router-dom";

export default function Trash() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null); // track which item is loading
  const [confirmPurge, setConfirmPurge] = useState(null); // item to permanently delete
  const navigate = useNavigate();

  const fetchTrash = () => {
    setLoading(true);
    API.get("/events/trash")
      .then(res => setItems(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTrash(); }, []);

  const handleRestore = async (item) => {
    try {
      setActionId(item._id);
      await API.post(`/events/trash/${item._id}/restore`);
      setItems(prev => prev.filter(i => i._id !== item._id));
    } catch (err) {
      alert(err.response?.data?.message || "Restore failed");
    } finally {
      setActionId(null);
    }
  };

  const handlePermanentDelete = async () => {
    if (!confirmPurge) return;
    try {
      setActionId(confirmPurge._id);
      await API.delete(`/events/trash/${confirmPurge._id}`);
      setItems(prev => prev.filter(i => i._id !== confirmPurge._id));
      setConfirmPurge(null);
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    } finally {
      setActionId(null);
    }
  };

  const daysLeft = (expiresAt) => {
    const diff = new Date(expiresAt) - new Date();
    if (diff <= 0) return "Expiring soon";
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return `${days} day${days !== 1 ? "s" : ""} left`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">

      {/* Permanent delete confirmation */}
      {confirmPurge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full">
            <div className="text-4xl mb-4 text-center">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 text-center mb-2">Permanently Delete?</h2>
            <p className="text-gray-500 text-sm text-center mb-6">
              <span className="font-semibold text-gray-700">"{confirmPurge.title}"</span> will be gone forever. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmPurge(null)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition text-sm">
                Cancel
              </button>
              <button onClick={handlePermanentDelete} disabled={!!actionId}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-xl font-medium hover:bg-red-600 transition text-sm disabled:opacity-50">
                {actionId ? "Deleting..." : "Delete Forever"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button onClick={() => navigate("/")}
              className="text-sm text-gray-400 hover:text-gray-600 transition mb-2 block">
              ← Back to Events
            </button>
            <h1 className="text-3xl font-extrabold text-gray-800 flex items-center gap-3">
              🗑️ Recycle Bin
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Deleted events are kept for 30 days, then auto-purged.
            </p>
          </div>
          {items.length > 0 && (
            <span className="bg-red-100 text-red-600 text-sm font-semibold px-3 py-1 rounded-full">
              {items.length} item{items.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
            <p className="text-5xl mb-4">✨</p>
            <p className="text-xl font-bold text-gray-700 mb-2">Recycle bin is empty</p>
            <p className="text-gray-400 text-sm">Deleted events will appear here for 30 days.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map(item => (
              <div key={item._id}
                className="bg-white rounded-2xl shadow-sm p-6 flex gap-4 items-start">
                {/* Image or placeholder */}
                <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-3xl">
                  {item.image
                    ? <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    : "🎟"}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h2 className="font-bold text-gray-800 text-base truncate">{item.title}</h2>
                    <span className="flex-shrink-0 text-xs text-orange-500 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full font-medium">
                      {daysLeft(item.expiresAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">
                    📍 {item.location} · 📅 {new Date(item.date).toDateString()}
                  </p>
                  <p className="text-xs text-gray-400">
                    Deleted {new Date(item.deletedAt).toLocaleDateString("en-US", {
                      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                    })}
                    {item.deletedBy?.name && ` by ${item.deletedBy.name}`}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {item.attendees?.length ?? 0} attendee{item.attendees?.length !== 1 ? "s" : ""} ·{" "}
                    {item.price === 0 ? "Free" : `₦${item.price?.toLocaleString()}`}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleRestore(item)}
                    disabled={!!actionId}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-blue-700 transition disabled:opacity-50 whitespace-nowrap"
                  >
                    {actionId === item._id ? "Restoring..." : "↩ Restore"}
                  </button>
                  <button
                    onClick={() => setConfirmPurge(item)}
                    disabled={!!actionId}
                    className="border border-red-200 text-red-500 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-red-50 transition disabled:opacity-50 whitespace-nowrap"
                  >
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
