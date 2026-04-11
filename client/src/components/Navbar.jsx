import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-extrabold text-blue-600 tracking-tight">
          🎟 EventApp
        </Link>
        <div className="flex gap-3 items-center">
          {user ? (
            <>
              <span className="text-sm text-gray-500 hidden md:block">Hi, <strong>{user.name}</strong></span>
              {user.role === "admin" && (
                <Link to="/create"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                  + Create Event
                </Link>
              )}
              <button onClick={handleLogout}
                className="border border-red-400 text-red-500 px-4 py-2 rounded-lg text-sm hover:bg-red-50 transition">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login"
                className="text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-100 transition">
                Login
              </Link>
              <Link to="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}