import { useState } from "react";
import { Link } from "react-router-dom";
import { API } from "../api";

export default function ForgotPassword() {
  var [email, setEmail] = useState("");
  var [sent, setSent] = useState(false);
  var [loading, setLoading] = useState(false);
  var [error, setError] = useState("");

  var handleSubmit = async function(e) {
    e.preventDefault();
    if (!email) return;
    try {
      setLoading(true);
      setError("");
      await API.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed");
    } finally { setLoading(false); }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center" style={{ fontFamily: "'Syne', sans-serif" }}>
        <div className="max-w-sm w-full px-5 text-center">
          <p className="text-4xl mb-4">📬</p>
          <h1 className="text-2xl font-black mb-3">Check Your Email</h1>
          <p className="text-zinc-500 text-sm mb-8">If an account with that email exists, we've sent a password reset link.</p>
          <Link to="/login" className="text-amber-400 font-bold text-sm hover:underline">Back to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center" style={{ fontFamily: "'Syne', sans-serif" }}>
      <div className="max-w-sm w-full px-5">
        <div className="mb-8 text-center">
          <p className="text-[10px] tracking-[0.35em] uppercase text-amber-400 font-bold mb-2">Recovery</p>
          <h1 className="text-3xl font-black leading-none">Forgot Password</h1>
          <p className="text-zinc-600 text-sm mt-3">Enter your email and we'll send you a reset link.</p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/25 text-red-400 rounded-xl text-sm font-bold">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] tracking-widest uppercase text-zinc-600 font-bold block mb-1.5">Email</label>
            <input type="email" value={email} onChange={function(e) { setEmail(e.target.value) }} required
              className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400/50" />
          </div>
          <button type="submit" disabled={loading || !email}
            className="w-full bg-amber-400 text-zinc-950 py-3 rounded-xl text-sm font-black hover:bg-amber-300 transition-all disabled:opacity-40">
            {loading ? "Sending…" : "Send Reset Link"}
          </button>
        </form>

        <p className="text-center mt-6">
          <Link to="/login" className="text-zinc-600 text-sm hover:text-white transition-all">← Back to Login</Link>
        </p>
      </div>
    </div>
  );
}
