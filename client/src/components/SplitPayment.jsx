import { useState } from "react";
import { API } from "../api";
import { motion } from "framer-motion";

export default function SplitPayment({ eventId, eventPrice, user }) {
  const [showForm, setShowForm] = useState(false);
  const [emails, setEmails] = useState([""]);
  const [loading, setLoading] = useState(false);
  const [split, setSplit] = useState(null);
  const [message, setMessage] = useState("");

  const totalAmount = eventPrice || 0;
  const share = emails.length > 0 ? Math.round(totalAmount / emails.length) : 0;

  const addEmail = () => setEmails(e => [...e, ""]);
  const removeEmail = (i) => setEmails(e => e.filter((_, idx) => idx !== i));
  const updateEmail = (i, v) => setEmails(e => e.map((em, idx) => idx === i ? v : em));

  const createSplit = async () => {
    const validEmails = emails.filter(e => e.trim());
    if (validEmails.length < 2) {
      setMessage("Need at least 2 people to split");
      return;
    }
    try {
      setLoading(true);
      const res = await API.post(`/split-payments/${eventId}/create`, {
        totalAmount,
        participants: validEmails.map(email => ({ email })),
      });
      setSplit(res.data);
      setMessage(`Split created! Each person pays ₦${share.toLocaleString()}`);
    } catch (err) { setMessage(err.response?.data?.message || "Failed"); }
    finally { setLoading(false); }
  };

  const payShare = async () => {
    if (!split) return;
    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email: user.email,
      amount: share * 100,
      currency: "NGN",
      callback: async (t) => {
        await API.post(`/split-payments/${eventId}/split/${split._id}/pay`, {
          transactionRef: t.reference,
          issueTickets: true,
        });
        setMessage("Payment successful!");
      },
      onClose: () => setMessage("Payment cancelled"),
    });
    handler.openIframe();
  };

  if (totalAmount === 0) return null;

  return (
    <div className="mb-8">
      <button onClick={() => setShowForm(v => !v)}
        className="w-full flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition-all">
        <div className="flex items-center gap-3">
          <span className="text-xl">💸</span>
          <div className="text-left">
            <p className="font-bold text-white text-sm">Split the Cost</p>
            <p className="text-zinc-500 text-xs">Divide ₦{totalAmount.toLocaleString()} with friends</p>
          </div>
        </div>
        <span className="text-zinc-500 text-sm">{showForm ? "−" : "+"}</span>
      </button>

      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
          className="bg-zinc-900 border-x border-b border-zinc-800 rounded-b-2xl p-5 space-y-4">
          {message && (
            <div className={`text-xs px-3 py-2 rounded-xl ${message.includes("Failed") ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"}`}>
              {message}
            </div>
          )}

          <div className="space-y-3">
            <p className="text-xs font-bold text-zinc-500 tracking-widest uppercase">Split with</p>
            {emails.map((em, i) => (
              <div key={i} className="flex gap-2 items-center">
                <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500 flex-shrink-0">
                  {i + 1}
                </div>
                <input value={em} onChange={e => updateEmail(i, e.target.value)} placeholder="friend@email.com"
                  className="flex-1 bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-xl px-3 py-2 text-sm" />
                {emails.length > 2 && (
                  <button onClick={() => removeEmail(i)} className="text-zinc-600 hover:text-red-400 text-xs">×</button>
                )}
              </div>
            ))}
            <button onClick={addEmail}
              className="text-xs text-amber-400 font-bold hover:text-amber-300 transition-colors">+ Add person</button>
          </div>

          <div className="bg-zinc-800/50 rounded-xl p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-zinc-400">Total</span>
              <span className="text-white font-bold">₦{totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Each pays</span>
              <span className="text-amber-400 font-black">₦{share.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={createSplit} disabled={loading}
              className="flex-1 bg-amber-400 text-zinc-950 py-3 rounded-xl text-xs font-black hover:bg-amber-300 transition-all disabled:opacity-40">
              {loading ? "Creating..." : "Create Split"}
            </button>
            {split && (
              <button onClick={payShare}
                className="flex-1 bg-emerald-400 text-zinc-950 py-3 rounded-xl text-xs font-black hover:bg-emerald-300 transition-all">
                Pay Your Share
              </button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
