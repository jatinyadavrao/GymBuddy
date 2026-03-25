import { Link, useLocation } from "react-router-dom";
import { authStore } from "../context/authStore";
import { motion } from "framer-motion";

const Navbar = () => {
  const token = authStore((state) => state.token);
  const logout = authStore((state) => state.logout);
  const user = authStore((state) => state.user);
  const location = useLocation();

  const navLinks = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Swipe", path: "/swipe" },
    { name: "Matches", path: "/matches" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl shadow-lg"
    >
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="group flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-transform group-hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500">
            GymBuddy
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {token && navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path}
              className={`relative text-sm font-bold uppercase tracking-wider transition-colors ${isActive(link.path) ? "text-cyan-400" : "text-slate-400 hover:text-white"}`}
            >
              {link.name}
              {isActive(link.path) && (
                <motion.div layoutId="nav-pill" className="absolute -bottom-2 left-0 right-0 h-1 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
              )}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {token ? (
            <div className="flex items-center gap-4">
              <Link to="/profile" className="group relative h-10 w-10 overflow-hidden rounded-full border-2 border-slate-700 transition-colors hover:border-cyan-400 shrink-0">
                <img src={user?.profilePicture || "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg"} alt="Profile" className="h-full w-full object-cover transition-transform group-hover:scale-110" />
              </Link>
              <button
                onClick={logout}
                className="hidden sm:block rounded-xl border border-white/5 bg-slate-800/80 px-4 py-2 text-sm font-bold text-slate-300 transition-all hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/50"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-300 transition-colors hover:text-white">
                Log In
              </Link>
              <Link to="/register" className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-2.5 text-sm font-black text-white shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all hover:scale-105 active:scale-95">
                Join Now
              </Link>
            </div>
          )}
        </div>
      </nav>
    </motion.header>
  );
};

export default Navbar;
