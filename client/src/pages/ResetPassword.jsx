import { useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { API } from "../api";

export default function ResetPassword() {
  var [searchParams] = useSearchParams();
  var navigate = useNavigate();
  var token = searchParams.get("token");
  var [newPassword, setNewPassword] = useState("");
  var [loading, setLoading] = useState(false);
  var [error, setError] = useState("");
  var [done, setDone] = useState(false);

  var handleSubmit = async function(e) {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    try {
      setLoading(true);
      setError("");
      await API.post("/auth/reset-password", { token, newPassword });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed");
    } finally { setLoading(false); }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center" style={{ fontFamily: "'Syne', sans-serif" }}>
        <div className="max-w-sm w-full px-5 text-center">
          <p className="text-4xl mb-4">⚠️</p>
          <h1 className="text-2xl font-black mb-3">Invalid Link</h1>
          <p className="text-zinc-500 text-sm mb-8">This reset link is invalid or has expired.</p>
          <Link to="/forgot-password" className="text-amber-400 font-bold text-sm hover:underline">Request a new link</Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center" style={{ fontFamily: "'Syne', sans-serif" }}>
        <div className="max-w-sm w-full px-5 text-center">
          <p className="text-4xl mb-4">✅</p>
          <h1 className="text-2xl font-black mb-3">Password Reset</h1>
          <p className="text-zinc-500 text-sm mb-8">Your password has been updated successfully.</p>
          <Link to="/login" onClick={function() { navigate("/login") }} className="bg-amber-400 text-zinc-950 px-6 py-3 rounded-xl text-sm font-black hover:bg-amber-300 transition-all inline-block">Log In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center" style={{ fontFamily: "'Syne', sans-serif" }}>
      <div className="max-w-sm w-full px-5">
        <div className="mb-8 text-center">
          <p className="text-[10px] tracking-[0.35em] uppercase text-amber-400 font-bold mb-2">Reset</p>
          <h1 className="text-3xl font-black leading-none">New Password</h1>
          <p className="text-zinc-600 text-sm mt-3">Choose a new password for your account.</p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/25 text-red-400 rounded-xl text-sm font-bold">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] tracking-widest uppercase text-zinc-600 font-bold block mb-1.5">New Password</label>
            <input type="password" value={newPassword} onChange={function(e) { setNewPassword(e.target.value) }} minLength={6} required
              className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400/50" />
          </div>
          <button type="submit" disabled={loading || !newPassword}
            className="w-full bg-amber-400 text-zinc-950 py-3 rounded-xl text-sm font-black hover:bg-amber-300 transition-all disabled:opacity-40">
            {loading ? "Resetting…" : "Reset Password"}
          </button>
        </form>

        <p className="text-center mt-6">
          <Link to="/login" className="text-zinc-600 text-sm hover:text-white transition-all">← Back to Login</Link>
        </p>
      </div>
    </div>
  );
}
