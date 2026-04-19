import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ theme, toggleTheme }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ── Transparent sticky nav ──────────────────────────────────────────────────
  function Navbar({ user, isAdmin, events }) {
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
      const onScroll = () => setScrolled(window.scrollY > 60);
      window.addEventListener("scroll", onScroll);
      return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/80" : "bg-transparent"
        }`}>
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/" className={`font-black text-xl tracking-tight transition-colors duration-300 ${scrolled ? "text-white" : "text-white"}`}>
            Event<span className="text-amber-400">App</span>
          </Link>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin" className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${scrolled ? "text-zinc-400 hover:text-white" : "text-white/70 hover:text-white"}`}>
                    Dashboard
                  </Link>
                )}
                {user.role === "organizer" && (
                  <Link to="/dashboard" className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${scrolled ? "text-zinc-400 hover:text-white" : "text-white/70 hover:text-white"}`}>
                    My Events
                  </Link>
                )}
                {isAdmin && (
                  <Link to="/create" className="text-xs font-bold bg-amber-400 text-zinc-950 px-4 py-1.5 rounded-lg hover:bg-amber-300 transition-all">
                    + Create
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link to="/login" className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${scrolled ? "text-zinc-400 hover:text-white" : "text-white/80 hover:text-white"}`}>
                  Login
                </Link>
                <Link to="/register" className="text-xs font-bold bg-amber-400 text-zinc-950 px-4 py-1.5 rounded-lg hover:bg-amber-300 transition-all">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    );
  }


  // return (
  //   <nav style={{
  //     backgroundColor: "var(--surface-nav)",
  //     borderBottom: "1px solid var(--border-nav)",
  //     padding: "0 24px",
  //     height: "64px",
  //     display: "flex",
  //     alignItems: "center",
  //     justifyContent: "space-between",
  //     position: "sticky",
  //     top: 0,
  //     zIndex: 50,
  //     boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
  //   }}>
  //     <Link to="/" style={{ textDecoration: "none" }}>
  //       <span style={{ fontSize: "22px", fontWeight: 800, color: "#2563eb" }}>🎟 EventApp</span>
  //     </Link>

  //     <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
  //       <Link to="/" style={{ color: "var(--text)", fontSize: "14px", textDecoration: "none" }}>All Events</Link>
  //       <button onClick={toggleTheme} style={{
  //         border: "1px solid var(--border)",
  //         backgroundColor: "transparent", color: "var(--text)",
  //         padding: "8px 16px", borderRadius: "8px", fontSize: "14px", cursor: "pointer"
  //       }}>
  //         {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
  //       </button>
  //       {user ? (
  //         <>
  //           <span style={{ fontSize: "14px", color: "var(--muted)" }}>
  //             Hi, <strong style={{ color: "var(--text)" }}>{user.name}</strong>
  //           </span>
  //           {user?.role === "admin" && <Link to="/admin">Admin</Link>}
  //           {["admin","organizer"].includes(user?.role) && <Link to="/dashboard">Dashboard</Link>}
  //           {user.role === "admin" && (
  //             <Link to="/create" style={{
  //               backgroundColor: "#2563eb", color: "white",
  //               padding: "8px 16px", borderRadius: "8px",
  //               fontSize: "14px", fontWeight: 600, textDecoration: "none"
  //             }}>+ Create Event</Link>
  //           )}
  //           <button onClick={handleLogout} style={{
  //             border: "1px solid #fca5a5", color: "#ef4444",
  //             backgroundColor: "transparent", padding: "8px 16px",
  //             borderRadius: "8px", fontSize: "14px", cursor: "pointer"
  //           }}>Logout</button>
  //         </>
  //       ) : (
  //         <>
  //           <Link to="/login" style={{
  //             color: "#374151", padding: "8px 16px",
  //             borderRadius: "8px", fontSize: "14px", textDecoration: "none"
  //           }}>Login</Link>
  //           <Link to="/register" style={{
  //             backgroundColor: "#2563eb", color: "white",
  //             padding: "8px 16px", borderRadius: "8px",
  //             fontSize: "14px", fontWeight: 600, textDecoration: "none"
  //           }}>Get Started</Link>
  //         </>
  //       )}
  //     </div>
  //   </nav>
  // );
}