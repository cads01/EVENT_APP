import { useState, useEffect } from "react";
import { API } from "../api";
import { useNavigate } from "react-router-dom";

const inputCls = "w-full bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-600 p-3.5 rounded-xl text-sm focus:outline-none focus:border-amber-400/50 transition-all";
const labelCls = "block text-xs font-bold tracking-widest uppercase text-zinc-500 mb-2";

export default function CreateBlog() {
  const [form, setForm] = useState({ title: "", content: "", event: "", featured: false });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/events").then(res => setEvents(res.data)).catch(() => {});
  }, []);

  const handleImage = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("content", form.content);
      fd.append("event", form.event || "");
      fd.append("featured", form.featured);
      if (image) fd.append("image", image);
      const res = await API.post("/blogs", fd, { headers: { "Content-Type": "multipart/form-data" } });
      navigate(`/blog/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to publish");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-12 px-4" style={{ fontFamily: "'Syne', sans-serif" }}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <button onClick={() => navigate(-1)} className="text-zinc-600 hover:text-zinc-400 text-sm mb-4 block transition-colors">← Back</button>
          <p className="text-[10px] tracking-[0.35em] uppercase text-amber-400 font-bold mb-2">Blog</p>
          <h1 className="text-4xl font-black">Write a Post</h1>
          <p className="text-zinc-600 text-sm mt-1">Share your thoughts with the community</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/25 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">{error}</div>
        )}

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6">
          <div>
            <label className={labelCls}>Title</label>
            <input className={inputCls} placeholder="e.g. My Experience at TechConf 2026"
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>

          <div>
            <label className={labelCls}>Content</label>
            <textarea className={inputCls} placeholder="Write your story…" rows={10}
              value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
          </div>

          <div>
            <label className={labelCls}>Related Event (optional)</label>
            <select className={inputCls} value={form.event}
              onChange={e => setForm(f => ({ ...f, event: e.target.value }))}>
              <option value="">— Select an event —</option>
              {events.map(ev => <option key={ev._id} value={ev._id}>{ev.title}</option>)}
            </select>
          </div>

          {/* Featured toggle */}
          <label className="flex items-start gap-3 cursor-pointer p-4 bg-zinc-800/50 border border-zinc-700 rounded-2xl hover:border-zinc-600 transition-all">
            <div className="relative mt-0.5">
              <input type="checkbox" className="sr-only" checked={form.featured}
                onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} />
              <div className={`w-10 h-5 rounded-full transition-colors ${form.featured ? "bg-amber-400" : "bg-zinc-700"}`} />
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.featured ? "translate-x-5" : ""}`} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Mark as featured</p>
              <p className="text-xs text-zinc-600 mt-0.5">Will appear in the homepage carousel</p>
            </div>
          </label>

          {/* Image */}
          <div>
            <label className={labelCls}>Featured Image</label>
            <label className="block cursor-pointer">
              <div className={`border-2 border-dashed border-zinc-700 rounded-2xl overflow-hidden hover:border-amber-400/40 transition-all ${preview ? "" : "p-8 text-center"}`}>
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-52 object-cover" />
                ) : (
                  <div>
                    <p className="text-3xl mb-2">🖼️</p>
                    <p className="text-zinc-600 text-sm">Click to upload cover image</p>
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
            </label>
          </div>
        </div>

        <button onClick={handleSubmit} disabled={loading || !form.title || !form.content}
          className="w-full mt-4 bg-gradient-to-r from-amber-400 to-orange-400 text-zinc-950 py-4 rounded-2xl font-black text-base hover:from-amber-300 hover:to-orange-300 transition-all disabled:opacity-40 shadow-lg shadow-amber-500/20">
          {loading ? "Publishing…" : "Publish Post"}
        </button>
      </div>
    </div>
  );
}
