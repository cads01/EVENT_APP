import { useState, useEffect } from "react";
import { API } from "../api";
import { useNavigate, useParams } from "react-router-dom";
import { getUserTimezone, COMMON_TIMEZONES } from "../utils/timeFormatting";

const inputCls = "w-full bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-600 p-3.5 rounded-xl text-sm focus:outline-none focus:border-amber-400/50 transition-all";
const labelCls = "block text-xs font-bold tracking-widest uppercase text-zinc-500 mb-2";

const EVENT_TYPES = [
  "General","Conference","Wedding","Birthday","Concert",
  "Festival","Corporate","Networking","Sports","Charity",
  "Exhibition","Workshop","Religious","Graduation","Other"
];

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "", description: "", date: "", location: "",
    timezone: getUserTimezone(), eventType: "General",
    price: 0, capacity: 100,
    requiresModeration: false, specialCode: "",
    faq: [{ question: "", answer: "" }]
  });
  const [image, setImage] = useState(null);
  const [hostImage, setHostImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [hostPreview, setHostPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    API.get(`/events/${id}`)
      .then(res => {
        const e = res.data;
        setForm({
          title: e.title, description: e.description,
          date: e.date?.slice(0, 10), location: e.location,
          timezone: e.timezone || getUserTimezone(),
          eventType: e.eventType || "General",
          price: e.price, capacity: e.capacity,
          requiresModeration: e.requiresModeration || false,
          specialCode: e.specialCode || "",
          faq: e.faq?.length ? e.faq : [{ question: "", answer: "" }],
        });
        if (e.image) setPreview(e.image);
        if (e.hostImage) setHostPreview(e.hostImage);
      })
      .catch(() => setError("Failed to load event"))
      .finally(() => setFetching(false));
  }, [id]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleImage = (e) => {
    const file = e.target.files[0];
    setImage(file); setPreview(URL.createObjectURL(file));
  };
  const handleHostImage = (e) => {
    const file = e.target.files[0];
    setHostImage(file); setHostPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true); setError("");
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === "faq") fd.append(k, JSON.stringify(v.filter(i => i.question.trim() || i.answer.trim())));
        else fd.append(k, v);
      });
      if (image) fd.append("image", image);
      if (hostImage) fd.append("hostImage", hostImage);
      await API.put(`/events/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      navigate(`/events/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update event");
    } finally { setLoading(false); }
  };

  if (fetching) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-12 px-4 pt-24" style={{ fontFamily: "'Syne', sans-serif" }}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <button onClick={() => navigate(-1)} className="text-zinc-600 hover:text-zinc-400 text-sm mb-4 block transition-colors">← Back</button>
          <p className="text-[10px] tracking-[0.35em] uppercase text-amber-400 font-bold mb-2">Editing</p>
          <h1 className="text-4xl font-black">Edit Event</h1>
          <p className="text-zinc-600 text-sm mt-1">Update the details below</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/25 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">{error}</div>}

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6">
          <div>
            <label className={labelCls}>Event Title</label>
            <input className={inputCls} value={form.title} onChange={e => set("title", e.target.value)} />
          </div>

          <div>
            <label className={labelCls}>Event Type</label>
            <select className={inputCls} value={form.eventType} onChange={e => set("eventType", e.target.value)}>
              {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea className={inputCls} rows={4} value={form.description} onChange={e => set("description", e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Date</label>
              <input type="date" className={inputCls} value={form.date} onChange={e => set("date", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Location</label>
              <input className={inputCls} value={form.location} onChange={e => set("location", e.target.value)} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Timezone</label>
            <select className={inputCls} value={form.timezone} onChange={e => set("timezone", e.target.value)}>
              {COMMON_TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Price (₦)</label>
              <input type="number" className={inputCls} value={form.price} onChange={e => set("price", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Capacity</label>
              <input type="number" className={inputCls} value={form.capacity} onChange={e => set("capacity", e.target.value)} />
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-6 space-y-5">
            <p className="text-[10px] tracking-widest uppercase text-zinc-600 font-bold">Advanced</p>
            <label className="flex items-start gap-3 cursor-pointer">
              <div className="relative mt-0.5">
                <input type="checkbox" className="sr-only" checked={form.requiresModeration}
                  onChange={e => set("requiresModeration", e.target.checked)} />
                <div className={`w-10 h-5 rounded-full transition-colors ${form.requiresModeration ? "bg-amber-400" : "bg-zinc-700"}`} />
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.requiresModeration ? "translate-x-5" : ""}`} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Require photo moderation</p>
                <p className="text-xs text-zinc-600 mt-0.5">Admin approval before photos appear in gallery</p>
              </div>
            </label>
            <div>
              <label className={labelCls}>Special Access Code</label>
              <input className={inputCls} placeholder="e.g. VIP2026" value={form.specialCode}
                onChange={e => set("specialCode", e.target.value)} />
            </div>
          </div>

          {/* FAQ */}
          <div className="border-t border-zinc-800 pt-6">
            <p className="text-[10px] tracking-widest uppercase text-zinc-600 font-bold mb-4">FAQ</p>
            <div className="space-y-3 mb-3">
              {form.faq.map((item, idx) => (
                <div key={idx} className="bg-zinc-800/50 border border-zinc-700 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between">
                    <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Item {idx + 1}</p>
                    <button onClick={() => setForm(f => ({ ...f, faq: f.faq.filter((_, i) => i !== idx) }))}
                      disabled={form.faq.length === 1} className="text-xs text-red-500 font-bold disabled:opacity-30">Remove</button>
                  </div>
                  <input value={item.question} placeholder="Question" className={inputCls}
                    onChange={e => setForm(f => ({ ...f, faq: f.faq.map((q, i) => i === idx ? { ...q, question: e.target.value } : q) }))} />
                  <textarea value={item.answer} placeholder="Answer" rows={2} className={inputCls}
                    onChange={e => setForm(f => ({ ...f, faq: f.faq.map((q, i) => i === idx ? { ...q, answer: e.target.value } : q) }))} />
                </div>
              ))}
            </div>
            <button onClick={() => setForm(f => ({ ...f, faq: [...f.faq, { question: "", answer: "" }] }))}
              className="text-xs font-bold text-amber-400 border border-amber-400/25 bg-amber-400/5 px-4 py-2 rounded-xl hover:bg-amber-400/10 transition-all">
              + Add FAQ
            </button>
          </div>

          {/* Images */}
          <div className="border-t border-zinc-800 pt-6 space-y-5">
            <p className="text-[10px] tracking-widest uppercase text-zinc-600 font-bold">Images</p>

            <div>
              <label className={labelCls}>Event Banner Image</label>
              <label className="block cursor-pointer">
                <div className={`border-2 border-dashed border-zinc-700 rounded-2xl overflow-hidden hover:border-amber-400/40 transition-all ${preview ? "" : "p-8 text-center"}`}>
                  {preview ? <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
                    : <div><p className="text-3xl mb-2">🖼️</p><p className="text-zinc-600 text-sm">Click to upload new image</p><p className="text-zinc-700 text-xs mt-1">Leave empty to keep current</p></div>}
                </div>
                <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
              </label>
            </div>

            <div>
              <label className={labelCls}>Host / Organizer Image</label>
              <p className="text-xs text-zinc-600 mb-2">Shows on the spotlight card (left side)</p>
              <label className="block cursor-pointer">
                <div className={`border-2 border-dashed border-zinc-700 rounded-2xl overflow-hidden hover:border-amber-400/40 transition-all ${hostPreview ? "" : "p-6 text-center"}`}>
                  {hostPreview ? <img src={hostPreview} alt="Host" className="w-full h-36 object-cover" />
                    : <div><p className="text-3xl mb-2">👤</p><p className="text-zinc-600 text-sm">Click to upload host image</p></div>}
                </div>
                <input type="file" accept="image/*" onChange={handleHostImage} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button onClick={() => navigate(-1)}
            className="flex-1 border border-zinc-700 text-zinc-400 py-4 rounded-2xl font-bold text-sm hover:border-zinc-500 hover:text-white transition-all">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 bg-gradient-to-r from-amber-400 to-orange-400 text-zinc-950 py-4 rounded-2xl font-black text-sm hover:from-amber-300 hover:to-orange-300 transition-all disabled:opacity-40 shadow-lg shadow-amber-500/20">
            {loading ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
