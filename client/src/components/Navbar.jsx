import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ theme, toggleTheme }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav style={{
      backgroundColor: "var(--surface-nav)",
      borderBottom: "1px solid var(--border-nav)",
      padding: "0 24px",
      height: "64px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 50,
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
    }}>
      <Link to="/" style={{ textDecoration: "none" }}>
        <span style={{ fontSize: "22px", fontWeight: 800, color: "#2563eb" }}>🎟 EventApp</span>
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <Link to="/" style={{ color: "var(--text)", fontSize: "14px", textDecoration: "none" }}>All Events</Link>
        <button onClick={toggleTheme} style={{
          border: "1px solid var(--border)",
          backgroundColor: "transparent", color: "var(--text)",
          padding: "8px 16px", borderRadius: "8px", fontSize: "14px", cursor: "pointer"
        }}>
          {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
        </button>
        {user ? (
          <>
            <span style={{ fontSize: "14px", color: "var(--muted)" }}>
              Hi, <strong style={{ color: "var(--text)" }}>{user.name}</strong>
            </span>
            {user?.role === "admin" && <Link to="/admin">Admin</Link>}
            {["admin","organizer"].includes(user?.role) && <Link to="/dashboard">Dashboard</Link>}
            {user.role === "admin" && (
              <Link to="/create" style={{
                backgroundColor: "#2563eb", color: "white",
                padding: "8px 16px", borderRadius: "8px",
                fontSize: "14px", fontWeight: 600, textDecoration: "none"
              }}>+ Create Event</Link>
            )}
            <button onClick={handleLogout} style={{
              border: "1px solid #fca5a5", color: "#ef4444",
              backgroundColor: "transparent", padding: "8px 16px",
              borderRadius: "8px", fontSize: "14px", cursor: "pointer"
            }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{
              color: "#374151", padding: "8px 16px",
              borderRadius: "8px", fontSize: "14px", textDecoration: "none"
            }}>Login</Link>
            <Link to="/register" style={{
              backgroundColor: "#2563eb", color: "white",
              padding: "8px 16px", borderRadius: "8px",
              fontSize: "14px", fontWeight: 600, textDecoration: "none"
            }}>Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
}