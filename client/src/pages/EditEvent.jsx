import { useState, useEffect } from "react";
import { API } from "../api";
import { useNavigate, useParams } from "react-router-dom";
import { getUserTimezone, COMMON_TIMEZONES } from "../utils/timeFormatting";

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "", description: "", date: "",
    location: "", timezone: getUserTimezone(), price: 0, capacity: 100
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    API.get(`/events/${id}`)
      .then(res => {
        const e = res.data;
        setForm({
          title: e.title,
          description: e.description,
          date: e.date?.slice(0, 10), // format for date input
          location: e.location,
          timezone: e.timezone || getUserTimezone(),
          price: e.price,
          capacity: e.capacity,
        });
        if (e.image) setPreview(e.image);
      })
      .catch(() => setError("Failed to load event"))
      .finally(() => setFetching(false));
  }, [id]);

  const handleImage = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("date", form.date);
      formData.append("timezone", form.timezone);
      formData.append("location", form.location);
      formData.append("price", form.price);
      formData.append("capacity", form.capacity);
      if (image) formData.append("image", image);

      await API.put(`/events/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate(`/events/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update event");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow p-8">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-gray-600 transition text-sm">
            ← Back
          </button>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Edit Event</h1>
        <p className="text-gray-500 text-sm mb-8">Update the event details below</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
            <input
              className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              rows={4}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
            <select
              className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={form.timezone}
              onChange={e => setForm({ ...form, timezone: e.target.value })}>
              {COMMON_TIMEZONES.map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦)</label>
              <input
                type="number"
                className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
              <input
                type="number"
                className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={form.capacity}
                onChange={e => setForm({ ...form, capacity: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Image</label>
            {preview && (
              <img src={preview} alt="Preview"
                className="mb-3 w-full h-48 object-cover rounded-lg border" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
              className="w-full border border-gray-200 p-3 rounded-lg text-sm text-gray-500"
            />
            <p className="text-xs text-gray-400 mt-1">Leave empty to keep the current image</p>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
