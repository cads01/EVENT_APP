import { useState } from "react";
import { API } from "../api";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const res = await API.post("/auth/login", form);
      login(res.data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden md:flex w-1/2 bg-blue-600 flex-col justify-center items-center text-white p-12">
        <div className="text-5xl mb-6">🎟</div>
        <h2 className="text-4xl font-extrabold mb-4">EventApp</h2>
        <p className="text-blue-100 text-center text-lg max-w-xs">
          Discover, create and manage events all in one place.
        </p>
      </div>

      {/* Right Panel */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white px-8">
        <div className="w-full max-w-md">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-2">Welcome back 👋</h2>
          <p className="text-gray-500 mb-8">Login to your EventApp account</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-5">
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
            className="w-full bg-blue-600 text-white py-3 rounded-xl mt-6 font-bold text-sm hover:bg-blue-700 transition disabled:opacity-50">
            {loading ? "Logging in..." : "Login →"}
          </button>

          <p className="text-center mt-6 text-sm text-gray-500">
            No account?{" "}
            <Link to="/register" className="text-blue-600 font-semibold hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}