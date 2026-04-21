import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMenuOpen(false);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800"
            : "bg-zinc-950/60 backdrop-blur-md"
        }`}
        style={{ fontFamily: "'Syne', sans-serif" }}
      >
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">

          {/* Logo — always visible */}
          <Link to="/" className="font-black text-xl tracking-tight text-white hover:opacity-80 transition-opacity flex-shrink-0">
            Event<span className="text-amber-400">App</span>
          </Link>

          {/* Desktop centre links */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/" className="text-xs font-bold px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white transition-all">
              Events
            </Link>
            {user?.role === "admin" && (
              <Link to="/admin" className="text-xs font-bold px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white transition-all">
                Admin
              </Link>
            )}
            {["admin", "organizer"].includes(user?.role) && (
              <Link to="/dashboard" className="text-xs font-bold px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white transition-all">
                Dashboard
              </Link>
            )}
            {user?.role === "admin" && (
              <Link to="/trash" className="text-xs font-bold px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white transition-all">
                🗑️ Trash
              </Link>
            )}
          </div>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <span className="text-xs text-zinc-500">{user.name}</span>
                {["admin", "organizer"].includes(user?.role) && (
                  <Link to="/create" className="text-xs font-black bg-amber-400 text-zinc-950 px-4 py-1.5 rounded-lg hover:bg-amber-300 transition-all">
                    + Create
                  </Link>
                )}
                <button onClick={handleLogout}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-500 hover:border-red-500/40 hover:text-red-400 transition-all">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-xs font-bold px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white transition-all">
                  Login
                </Link>
                <Link to="/register" className="text-xs font-black bg-amber-400 text-zinc-950 px-4 py-1.5 rounded-lg hover:bg-amber-300 transition-all">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="flex md:hidden flex-col gap-[5px] justify-center w-8 h-8 focus:outline-none"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Menu"
          >
            <span className="block h-px bg-white transition-all duration-300 origin-center"
              style={{ width: "22px", transform: menuOpen ? "translateY(6px) rotate(45deg)" : "none" }} />
            <span className="block h-px bg-white transition-all duration-300"
              style={{ width: "22px", opacity: menuOpen ? 0 : 1 }} />
            <span className="block h-px bg-white transition-all duration-300 origin-center"
              style={{ width: "22px", transform: menuOpen ? "translateY(-6px) rotate(-45deg)" : "none" }} />
          </button>
        </div>
      </nav>

      {/* Mobile fullscreen overlay */}
      <div
        className="fixed inset-0 z-40 flex flex-col justify-center px-8 bg-zinc-950 md:hidden transition-all duration-300"
        style={{
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "all" : "none",
          transform: menuOpen ? "translateY(0)" : "translateY(-10px)",
        }}
      >
        <ul className="list-none flex flex-col gap-1 mb-10">
          {[
            { to: "/",          label: "Events",           show: true },
            { to: "/admin",     label: "Admin Dashboard",  show: user?.role === "admin" },
            { to: "/dashboard", label: "My Events",        show: ["admin","organizer"].includes(user?.role) },
            { to: "/create",    label: "+ Create Event",   show: ["admin","organizer"].includes(user?.role) },
            { to: "/trash",     label: "🗑️ Trash",         show: user?.role === "admin" },
          ].filter(l => l.show).map((l, i) => (
            <li key={l.to} style={{
              transition: `opacity 0.3s ${i * 0.05 + 0.1}s, transform 0.3s ${i * 0.05 + 0.1}s`,
              opacity: menuOpen ? 1 : 0,
              transform: menuOpen ? "translateX(0)" : "translateX(-16px)",
            }}>
              <Link to={l.to} onClick={() => setMenuOpen(false)}
                className="font-black text-lg text-zinc-400 hover:text-white transition-colors block py-2">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="border-t border-zinc-800 pt-8"
          style={{ transition: "opacity 0.3s 0.35s", opacity: menuOpen ? 1 : 0 }}>
          {user ? (
            <div className="flex flex-col gap-3">
              <p className="text-zinc-600 text-sm">
                Signed in as <span className="text-white font-bold">{user.name}</span>
              </p>
              <button onClick={handleLogout}
                className="text-sm font-bold text-red-400 border border-red-500/25 px-4 py-2.5 rounded-xl hover:bg-red-500/5 transition-all self-start">
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Link to="/login" onClick={() => setMenuOpen(false)}
                className="text-sm font-bold text-zinc-400 border border-zinc-700 px-4 py-2.5 rounded-xl hover:text-white transition-all">
                Login
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}
                className="text-sm font-black bg-amber-400 text-zinc-950 px-5 py-2.5 rounded-xl hover:bg-amber-300 transition-all">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
