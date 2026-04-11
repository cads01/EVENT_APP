import { useState } from "react";
import { API } from "../api";
import { useNavigate } from "react-router-dom";

export default function CreateEvent() {
  const [form, setForm] = useState({
    title: "", description: "", date: "",
    location: "", price: 0, capacity: 100
  });
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
  try {
    setLoading(true);
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("date", form.date);
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
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Create Event</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <input className="w-full border p-2 rounded mb-4" placeholder="Title"
        onChange={e => setForm({ ...form, title: e.target.value })} />
      <textarea className="w-full border p-2 rounded mb-4" placeholder="Description" rows={4}
        onChange={e => setForm({ ...form, description: e.target.value })} />
      <input className="w-full border p-2 rounded mb-4" type="date"
        onChange={e => setForm({ ...form, date: e.target.value })} />
      <input className="w-full border p-2 rounded mb-4" placeholder="Location"
        onChange={e => setForm({ ...form, location: e.target.value })} />
      <input className="w-full border p-2 rounded mb-4" type="number" placeholder="Price (0 for free)"
        onChange={e => setForm({ ...form, price: e.target.value })} />
      <input className="w-full border p-2 rounded mb-4" type="number" placeholder="Capacity"
        onChange={e => setForm({ ...form, capacity: e.target.value })} />
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Event Image</label>
        <input type="file" accept="image/*"
          onChange={e => setImage(e.target.files[0])}
          className="w-full border p-2 rounded" />
      </div>
      <button onClick={handleSubmit} disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50">
        {loading ? "Creating..." : "Create Event"}
      </button>
    </div>
  );
}