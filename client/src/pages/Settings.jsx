import { useEffect, useState } from "react";
import { API } from "../api";
import { useAuth } from "../context/AuthContext";

const EVENT_CATEGORIES = [
  "General", "Conference", "Wedding", "Birthday", "Concert",
  "Festival", "Corporate", "Networking", "Sports", "Charity",
  "Exhibition", "Workshop", "Religious", "Graduation", "Other",
];

const BADGE_DEFS = {
  early_bird:     { icon: "🐦", label: "Early Bird",     desc: "Attended an event in the first month" },
  social_butterfly: { icon: "🦋", label: "Social Butterfly", desc: "Joined the forum at 3+ events" },
  vip:            { icon: "💎", label: "VIP",            desc: "Attended a VIP event" },
  globe_trotter:  { icon: "🌍", label: "Globe Trotter",  desc: "Attended events in 3+ locations" },
  super_fan:      { icon: "⭐", label: "Super Fan",      desc: "Attended 10+ events" },
  reviewer:       { icon: "✍️", label: "Reviewer",       desc: "Left feedback after 3 events" },
};

export default function Settings() {
  var { user, login } = useAuth();
  var [profile, setProfile] = useState(null);
  var [loading, setLoading] = useState(true);
  var [saving, setSaving] = useState(false);
  var [message, setMessage] = useState("");

  var [name, setName] = useState("");
  var [email, setEmail] = useState("");
  var [currentPassword, setCurrentPassword] = useState("");
  var [newPassword, setNewPassword] = useState("");
  var [categories, setCategories] = useState([]);
  var [soloMode, setSoloMode] = useState(false);

  useEffect(function() {
    API.get("/auth/profile").then(function(res) {
      setProfile(res.data);
      setName(res.data.name || "");
      setEmail(res.data.email || "");
      setCategories(res.data.preferences?.categories || []);
      setSoloMode(res.data.preferences?.soloMode || false);
    }).catch(function() {}).finally(function() { setLoading(false) });
  }, []);

  var saveProfile = async function() {
    try {
      setSaving(true);
      setMessage("");
      var res = await API.put("/auth/profile", { name, email });
      setProfile(res.data);
      login({ token: localStorage.getItem("token"), user: res.data });
      setMessage("Profile updated");
    } catch (err) { setMessage(err.response?.data?.message || "Failed"); }
    finally { setSaving(false); }
  };

  var savePassword = async function() {
    try {
      setSaving(true);
      setMessage("");
      await API.put("/auth/password", { currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setMessage("Password updated");
    } catch (err) { setMessage(err.response?.data?.message || "Failed"); }
    finally { setSaving(false); }
  };

  var savePreferences = async function() {
    try {
      setSaving(true);
      setMessage("");
      var res = await API.put("/auth/preferences", { categories, soloMode });
      setProfile(res.data);
      setMessage("Preferences saved");
    } catch (err) { setMessage(err.response?.data?.message || "Failed"); }
    finally { setSaving(false); }
  };

  var toggleCategory = function(cat) {
    setCategories(function(prev) {
      return prev.includes(cat) ? prev.filter(function(c) { return c !== cat }) : [...prev, cat];
    });
  };

  var badges = profile?.badges || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="h-px w-full bg-gradient-to-r from-sky-400 via-amber-400 to-orange-400" />

      <div className="max-w-3xl mx-auto px-5 py-10">
        <div className="mb-10">
          <p className="text-[10px] tracking-[0.35em] uppercase text-amber-400 font-bold mb-2">Account</p>
          <h1 className="text-5xl font-black leading-none">Settings</h1>
        </div>

        {message && (
          <div className={"mb-6 px-4 py-3 rounded-xl text-sm font-bold " + (message === "Profile updated" || message === "Password updated" || message === "Preferences saved" ? "bg-emerald-400/10 border border-emerald-400/25 text-emerald-400" : "bg-red-500/10 border border-red-500/25 text-red-400")}>
            {message}
          </div>
        )}

        {/* ── Profile ── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-6">
          <h2 className="font-black text-lg mb-5">Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] tracking-widest uppercase text-zinc-600 font-bold block mb-1.5">Name</label>
              <input value={name} onChange={function(e) { setName(e.target.value) }}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm" />
            </div>
            <div>
              <label className="text-[10px] tracking-widest uppercase text-zinc-600 font-bold block mb-1.5">Email</label>
              <input value={email} onChange={function(e) { setEmail(e.target.value) }} type="email"
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm" />
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-600">
              <span>Role:</span>
              <span className="font-bold text-amber-400 uppercase tracking-wider">{profile?.role || "user"}</span>
            </div>
            <div className="text-xs text-zinc-600">
              Member since {new Date(profile?.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </div>
            <button onClick={saveProfile} disabled={saving}
              className="bg-amber-400 text-zinc-950 px-6 py-2.5 rounded-xl text-sm font-black hover:bg-amber-300 transition-all disabled:opacity-40">
              {saving ? "Saving…" : "Save Profile"}
            </button>
          </div>
        </div>

        {/* ── Password ── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-6">
          <h2 className="font-black text-lg mb-5">Change Password</h2>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] tracking-widest uppercase text-zinc-600 font-bold block mb-1.5">Current Password</label>
              <input value={currentPassword} onChange={function(e) { setCurrentPassword(e.target.value) }} type="password"
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm" />
            </div>
            <div>
              <label className="text-[10px] tracking-widest uppercase text-zinc-600 font-bold block mb-1.5">New Password</label>
              <input value={newPassword} onChange={function(e) { setNewPassword(e.target.value) }} type="password" minLength={6}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm" />
            </div>
            <button onClick={savePassword} disabled={saving || !currentPassword || !newPassword}
              className="bg-zinc-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-zinc-600 transition-all disabled:opacity-40">
              {saving ? "Saving…" : "Update Password"}
            </button>
          </div>
        </div>

        {/* ── Preferences ── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-6">
          <h2 className="font-black text-lg mb-5">Preferences</h2>
          <div className="space-y-5">
            <div>
              <label className="text-[10px] tracking-widest uppercase text-zinc-600 font-bold block mb-3">Event Categories</label>
              <div className="flex flex-wrap gap-2">
                {EVENT_CATEGORIES.map(function(cat) {
                  var active = categories.includes(cat);
                  return (
                    <button key={cat} onClick={function() { toggleCategory(cat) }}
                      className={"px-3 py-1.5 rounded-xl text-xs font-bold border transition-all " + (active ? "bg-amber-400 text-zinc-950 border-amber-400" : "bg-zinc-800 text-zinc-500 border-zinc-700 hover:border-zinc-500")}>
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">Solo Mode</p>
                <p className="text-xs text-zinc-600">Let event organizers know you're open to connecting</p>
              </div>
              <button onClick={function() { setSoloMode(function(v) { return !v }) }}
                className={"w-12 h-6 rounded-full transition-all border " + (soloMode ? "bg-amber-400 border-amber-400" : "bg-zinc-700 border-zinc-600")}>
                <div className={"w-4 h-4 rounded-full bg-white transition-all mx-0.5 " + (soloMode ? "translate-x-6" : "translate-x-0.5")} />
              </button>
            </div>
            <button onClick={savePreferences} disabled={saving}
              className="bg-amber-400 text-zinc-950 px-6 py-2.5 rounded-xl text-sm font-black hover:bg-amber-300 transition-all disabled:opacity-40">
              {saving ? "Saving…" : "Save Preferences"}
            </button>
          </div>
        </div>

        {/* ── Badges ── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-6">
          <h2 className="font-black text-lg mb-5">Badges</h2>
          {badges.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-3">🏅</p>
              <p className="text-zinc-600 text-xs tracking-widest uppercase">No badges yet</p>
              <p className="text-zinc-700 text-xs mt-2">Attend events to earn badges</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {badges.map(function(b) {
                var def = BADGE_DEFS[b] || { icon: "🏅", label: b, desc: "" };
                return (
                  <div key={b} className="bg-zinc-800/50 border border-zinc-700 rounded-2xl p-4 text-center">
                    <p className="text-3xl mb-2">{def.icon}</p>
                    <p className="font-black text-white text-sm">{def.label}</p>
                    <p className="text-[10px] text-zinc-600 mt-1">{def.desc}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
