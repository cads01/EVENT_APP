import { useState } from "react";
import { API } from "../api";
import { motion, AnimatePresence } from "framer-motion";

export default function PostEventRetargeting({ event, user, isPast, isAttending }) {
  const [showSurvey, setShowSurvey] = useState(false);
  const [surveyData, setSurveyData] = useState({ rating: 5, feedback: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isPast || !isAttending) return null;

  const submitSurvey = async () => {
    try {
      setLoading(true);
      await API.post(`/events/${event._id}/feedback`, surveyData);
      setSubmitted(true);
    } catch {}
    finally { setLoading(false); }
  };

  const claimBadge = async (badge) => {
    try {
      await API.post("/events/claim-badge", { eventId: event._id, badge });
    } catch {}
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-8">
      <p className="text-[10px] tracking-widest uppercase text-amber-400 font-bold mb-4">Post-Event</p>

      <AnimatePresence mode="wait">
        {!showSurvey && !submitted ? (
          <motion.div key="actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <button onClick={() => setShowSurvey(true)}
              className="w-full flex items-center gap-3 bg-zinc-800/50 border border-zinc-700 rounded-2xl p-4 hover:border-amber-400/30 transition-all text-left">
              <span className="text-2xl">📝</span>
              <div>
                <p className="font-bold text-white text-sm">Leave Feedback</p>
                <p className="text-zinc-500 text-xs">Help the organizer improve</p>
              </div>
            </button>
            <div className="flex gap-3">
              {["🎖️", "🏆", "⭐", "💎"].map((badge, i) => (
                <button key={i} onClick={() => claimBadge(badge)}
                  className="flex-1 bg-zinc-800/50 border border-zinc-700 rounded-xl py-3 text-center hover:border-amber-400/30 hover:bg-zinc-800 transition-all">
                  <span className="text-2xl block mb-1">{badge}</span>
                  <span className="text-[9px] text-zinc-500">Claim</span>
                </button>
              ))}
            </div>
            <div className="bg-zinc-800/30 border border-dashed border-zinc-700 rounded-2xl p-4 text-center">
              <p className="text-lg mb-1">🎫</p>
              <p className="text-xs font-bold text-amber-400">Thank You Discount</p>
              <p className="text-[10px] text-zinc-500 mt-1">Use code <span className="font-mono text-amber-400 bg-zinc-800 px-2 py-0.5 rounded">THANKS20</span> for 20% off your next event</p>
            </div>
          </motion.div>
        ) : showSurvey && !submitted ? (
          <motion.div key="survey" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <p className="font-bold text-white text-sm">Rate this event</p>
            <div className="flex gap-2">
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setSurveyData(d => ({ ...d, rating: n }))}
                  className={`w-10 h-10 rounded-xl text-lg transition-all ${
                    surveyData.rating >= n ? "bg-amber-400 text-zinc-950" : "bg-zinc-800 text-zinc-600"
                  }`}>{n}</button>
              ))}
            </div>
            <textarea value={surveyData.feedback} onChange={e => setSurveyData(d => ({ ...d, feedback: e.target.value }))}
              placeholder="Any feedback for the organizer?" rows={3}
              className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-xl px-3 py-2 text-sm resize-none" />
            <div className="flex gap-2">
              <button onClick={submitSurvey} disabled={loading}
                className="bg-amber-400 text-zinc-950 px-5 py-2.5 rounded-xl text-xs font-black hover:bg-amber-300 transition-all disabled:opacity-40">
                {loading ? "Submitting..." : "Submit Feedback"}
              </button>
              <button onClick={() => setShowSurvey(false)}
                className="border border-zinc-700 text-zinc-400 px-5 py-2.5 rounded-xl text-xs font-bold hover:border-zinc-500 transition-all">
                Cancel
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="thanks" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-6">
            <p className="text-4xl mb-3">🙏</p>
            <p className="font-bold text-white text-lg">Thank You!</p>
            <p className="text-zinc-500 text-sm">Your feedback helps make future events better.</p>
            <button onClick={() => claimBadge("🎖️")}
              className="mt-4 bg-amber-400 text-zinc-950 px-5 py-2.5 rounded-xl text-xs font-black hover:bg-amber-300 transition-all">
              Claim Your Badge
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
