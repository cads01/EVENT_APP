import { useState } from "react";
import { API } from "../api";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const res = await API.post("/auth/register", form);
      login(res.data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        <input className="w-full border p-2 rounded mb-4" placeholder="Name"
          onChange={e => setForm({ ...form, name: e.target.value })} />
        <input className="w-full border p-2 rounded mb-4" placeholder="Email"
          onChange={e => setForm({ ...form, email: e.target.value })} />
        <input className="w-full border p-2 rounded mb-6" placeholder="Password" type="password"
          onChange={e => setForm({ ...form, password: e.target.value })} />
        <button onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Register
        </button>
        <p className="text-center mt-4 text-sm">
          Already have an account? <Link to="/login" className="text-blue-600">Login</Link>
        </p>
      </div>
    </div>
  );
}