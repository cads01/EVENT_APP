import { useState, useEffect } from "react";
import { API } from "../api";
import { useNavigate } from "react-router-dom";

export default function CreateBlog() {
  const [form, setForm] = useState({
    title: "",
    content: "",
    event: "",
    featured: false
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch events for selection
    API.get("/events")
      .then(res => setEvents(res.data))
      .catch(() => console.log("Failed to load events"));
  }, []);

  const handleImage = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("content", form.content);
      formData.append("event", form.event || null);
      formData.append("featured", form.featured);
      if (image) formData.append("image", image);

      const res = await API.post("/blogs", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate(`/blog/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create blog");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow p-8">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Write a Blog Post</h1>
        <p className="text-gray-500 text-sm mb-8">Share your thoughts about events and the community</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Blog Title</label>
            <input
              className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="e.g. My Experience at TechConf 2026"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Write your blog post here..."
              rows={8}
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Related Event (optional)</label>
            <select
              className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={form.event}
              onChange={e => setForm({ ...form, event: e.target.value })}
            >
              <option value="">-- Select an event --</option>
              {events.map(event => (
                <option key={event._id} value={event._id}>
                  {event.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
              className="w-full border border-gray-200 p-3 rounded-lg text-sm text-gray-500"
            />
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="mt-3 w-full h-48 object-cover rounded-lg border"
              />
            )}
          </div>

          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
            <input
              type="checkbox"
              id="featured"
              checked={form.featured}
              onChange={e => setForm({ ...form, featured: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="featured" className="text-sm text-gray-700 cursor-pointer">
              Mark as featured (will appear in homepage carousel)
            </label>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !form.title || !form.content}
          className="w-full bg-blue-600 text-white py-3 rounded-lg mt-8 font-medium hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Publishing..." : "Publish Blog Post"}
        </button>
      </div>
    </div>
  );
}
