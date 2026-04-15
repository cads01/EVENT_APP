import { useState } from "react";
import { API } from "../api";
import { useNavigate } from "react-router-dom";
import { getUserTimezone, COMMON_TIMEZONES } from "../utils/timeFormatting";

export default function CreateEvent() {
  const [form, setForm] = useState({
    title: "", description: "", date: "",
    location: "", timezone: getUserTimezone(), price: 0, capacity: 100
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      formData.append("description", form.description);
      formData.append("date", form.date);
      formData.append("timezone", form.timezone);
      formData.append("location", form.location);
      formData.append("price", form.price);
      formData.append("capacity", form.capacity);
      if (image) formData.append("image", image);

      await API.post("/events", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow p-8">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Create Event</h1>
        <p className="text-gray-500 text-sm mb-8">Fill in the details to publish a new event</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
            <input className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="e.g. Tech Conference 2026"
              onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Describe your event..." rows={4}
              onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="e.g. Lagos, Nigeria"
                onChange={e => setForm({ ...form, location: e.target.value })} />
            </diV>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
            <select className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={form.timezone}
              onChange={e => setForm({ ...form, timezone: e.target.value })}>
              {COMMON_TIMEZONES.map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Current location: {form.timezone}</p>
          </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦)</label>
              <input type="number" className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="0 for free"
                onChange={e => setForm({ ...form, price: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
              <input type="number" className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="100"
                onChange={e => setForm({ ...form, capacity: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Image</label>
            <input type="file" accept="image/*" onChange={handleImage}
              className="w-full border border-gray-200 p-3 rounded-lg text-sm text-gray-500" />
            {preview && (
              <img src={preview} alt="Preview"
                className="mt-3 w-full h-48 object-cover rounded-lg border" />
            )}
          </div>
        </div>

        <button onClick={handleSubmit} disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg mt-8 font-medium hover:bg-blue-700 transition disabled:opacity-50">
          {loading ? "Publishing..." : "Publish Event"}
        </button>
      </div>
    </div>
  );
}