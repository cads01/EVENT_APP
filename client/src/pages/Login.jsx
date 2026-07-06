import { useState, useEffect, useRef } from "react";
import { API } from "../api";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { inputCls } from "../utils/design";
import { useToast } from "../utils/Toast";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const googleBtnRef = useRef(null);

  useEffect(function() {
    if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) return;
    var script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = function() {
      if (window.google && googleBtnRef.current) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: function(response) {
            if (response.credential) handleGoogleLogin(response.credential);
          },
        });
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: "outline", size: "large",
          width: googleBtnRef.current.offsetWidth || 384,
          text: "signin_with", shape: "rectangular", logo_alignment: "left",
        });
      }
    };
    document.body.appendChild(script);
    return function() { if (window.google) window.google.accounts.id.cancel(); };
  }, []);

  var handleGoogleLogin = async function(credential) {
    try {
      setGoogleLoading(true); setError("");
      var res = await API.post("/auth/google", { credential });
      login(res.data);
      toast("Welcome back!", "success");
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Google login failed");
    } finally { setGoogleLoading(false); }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const res = await API.post("/auth/login", form);
      login(res.data);
      toast("Welcome back!", "success");
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally { setLoading(false); }
  };

  const onKey = e => e.key === "Enter" && handleSubmit();

  return (
    <div className="min-h-screen flex bg-zinc-950">
      <div className="hidden md:flex w-1/2 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-zinc-900 to-zinc-950" />
        <div className="absolute inset-0"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "50px 50px" }} />
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-amber-400/10 blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="relative">
          <Link to="/" className="text-white font-black text-2xl">Event<span className="text-amber-400">App</span></Link>
        </div>
        <div className="relative">
          <p className="text-[10px] tracking-[0.35em] uppercase text-amber-400 font-bold mb-3">Welcome back</p>
          <h2 className="text-5xl font-black text-white leading-none mb-4">Your events<br />await you.</h2>
          <p className="text-zinc-500 text-base max-w-xs">Sign in to discover, manage, and attend the best events around you.</p>
          <div className="mt-10 space-y-3">
            {["Discover amazing events", "RSVP in one click", "Track your tickets", "Get email reminders"].map(f => (
              <div key={f} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400 text-[10px] font-black">✓</span>
                <span className="text-zinc-400 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-zinc-700 text-xs">© 2026 EventApp</p>
      </div>
      <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="md:hidden mb-8">
            <Link to="/" className="text-white font-black text-xl">Event<span className="text-amber-400">App</span></Link>
          </div>
          <p className="text-[10px] tracking-[0.35em] uppercase text-amber-400 font-bold mb-2">Sign in</p>
          <h1 className="text-4xl font-black text-white mb-1">Welcome back</h1>
          <p className="text-zinc-600 text-sm mb-8">Enter your credentials to continue</p>
          {error && (
            <div className="bg-red-500/10 border border-red-500/25 text-red-400 px-4 py-3 rounded-xl mb-5 text-sm">{error}</div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-zinc-600 mb-2">Email</label>
              <input type="email" placeholder="you@example.com" className={inputCls}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} onKeyDown={onKey} />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-zinc-600 mb-2">Password</label>
              <input type="password" placeholder="••••••••" className={inputCls}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} onKeyDown={onKey} />
            </div>
          </div>
          <div className="flex justify-end mt-1">
            <Link to="/forgot-password" className="text-[11px] text-zinc-600 hover:text-amber-400 transition-all font-bold">Forgot password?</Link>
          </div>
          {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
            <>
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-zinc-800" />
                <span className="text-[10px] tracking-widest uppercase text-zinc-600 font-bold">or</span>
                <div className="flex-1 h-px bg-zinc-800" />
              </div>
              <div ref={googleBtnRef} className="w-full flex justify-center min-h-[40px]">
                {googleLoading && <span className="text-xs text-zinc-600">Signing in with Google…</span>}
              </div>
            </>
          )}
          <button onClick={handleSubmit} disabled={loading}
            className="w-full mt-6 bg-gradient-to-r from-amber-400 to-orange-400 text-zinc-950 py-3.5 rounded-xl font-black text-sm hover:from-amber-300 hover:to-orange-300 transition-all disabled:opacity-40 shadow-lg shadow-amber-500/20">
            {loading ? "Signing in…" : "Sign In →"}
          </button>
          <p className="text-center mt-6 text-sm text-zinc-600">
            No account?{" "}
            <Link to="/register" className="text-amber-400 font-black hover:text-amber-300 transition-colors">Create one →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
