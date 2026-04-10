import { useState } from "react";
import { API } from "../api";
import { useNavigate } from "react-router-dom";

export default function CreateEvent() {
  const [form, setForm] = useState({
    title: "", description: "", date: "",
    location: "", price: 0, capacity: 100
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      await API.post("/events", form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create event");
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
      <input className="w-full border p-2 rounded mb-6" type="number" placeholder="Capacity"
        onChange={e => setForm({ ...form, capacity: e.target.value })} />
      <button onClick={handleSubmit}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
        Create Event
      </button>
    </div>
  );
}