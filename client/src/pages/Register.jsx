import { useState } from "react";
import { API } from "../api";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const res = await API.post("/auth/register", form);
      login(res.data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden md:flex w-1/2 bg-indigo-700 flex-col justify-center items-center text-white p-12">
        <div className="text-5xl mb-6">🎟</div>
        <h2 className="text-4xl font-extrabold mb-4">EventApp</h2>
        <p className="text-indigo-100 text-center text-lg max-w-xs">
          Join thousands of people discovering amazing events every day.
        </p>
        <div className="mt-12 space-y-4 w-full max-w-xs">
          {["Create & manage events", "RSVP in one click", "Get email confirmations", "Pay securely with Paystack"].map(f => (
            <div key={f} className="flex items-center gap-3 text-indigo-100">
              <span className="text-green-400 font-bold">✓</span>
              <span className="text-sm">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white px-8">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Create account ✨</h1>
          <p className="text-gray-500 mb-8">Join EventApp and start exploring</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <input
                className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-blue-500 text-gray-800 text-sm transition"
                placeholder="John Doe"
                onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-blue-500 text-gray-800 text-sm transition"
                placeholder="john@example.com"
                onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input
                className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-blue-500 text-gray-800 text-sm transition"
                placeholder="••••••••" type="password"
                onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
          </div>

          <button onClick={handleSubmit} disabled={loading}
            className="w-full bg-indigo-700 text-white py-3 rounded-xl mt-6 font-bold text-sm hover:bg-indigo-800 transition disabled:opacity-50">
            {loading ? "Creating account..." : "Create Account →"}
          </button>

          <p className="text-center mt-6 text-sm text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}