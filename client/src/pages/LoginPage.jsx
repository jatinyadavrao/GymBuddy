import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authStore } from "../context/authStore";
import { loginUser } from "../services/authService";
import { motion } from "framer-motion";

const LoginPage = () => {
  const setAuth = authStore((state) => state.setAuth);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await loginUser(form);
      setAuth(data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md overflow-hidden rounded-3xl border border-white/5 bg-slate-900/50 backdrop-blur-xl shadow-2xl relative"
      >
        <div className="absolute top-0 h-1 w-full bg-gradient-to-r from-cyan-400 to-blue-600" />
        
        <div className="p-8">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-black text-white">Welcome Back</h2>
            <p className="mt-2 text-sm font-medium text-slate-400">Log in to continue your fitness journey</p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-center text-sm font-bold text-rose-400">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-400 uppercase">Email Address</label>
              <input 
                className="w-full rounded-xl border border-white/10 bg-slate-800/50 p-4 text-white placeholder-slate-500 outline-none transition-colors focus:border-cyan-500 focus:bg-slate-800" 
                type="email" 
                placeholder="athlete@gymbuddy.com" 
                onChange={(e) => setForm({ ...form, email: e.target.value })} 
                required 
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-400 uppercase">Password</label>
              <input 
                className="w-full rounded-xl border border-white/10 bg-slate-800/50 p-4 text-white placeholder-slate-500 outline-none transition-colors focus:border-cyan-500 focus:bg-slate-800" 
                type="password" 
                placeholder="••••••••" 
                onChange={(e) => setForm({ ...form, password: e.target.value })} 
                required 
              />
            </div>
            <button 
              className="mt-4 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-4 font-black transition-all hover:scale-[1.02] active:scale-95 disabled:scale-100 disabled:opacity-50 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]" 
              disabled={loading}
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                "LOG IN TO GYMBUDDY"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-medium text-slate-400">
            Don't have an account?{" "}
            <Link to="/register" className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
