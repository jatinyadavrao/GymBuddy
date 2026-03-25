import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authStore } from "../context/authStore";
import { registerUser } from "../services/authService";
import { motion } from "framer-motion";

const RegisterPage = () => {
  const setAuth = authStore((state) => state.setAuth);
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", gender: "male" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await registerUser(form);
      setAuth(data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
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
        className="w-full max-w-[500px] overflow-hidden rounded-3xl border border-white/5 bg-slate-900/50 backdrop-blur-xl shadow-2xl relative my-8"
      >
        <div className="absolute top-0 h-1 w-full bg-gradient-to-r from-cyan-400 to-emerald-500" />
        
        <div className="p-8">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-black text-white">Join GymBuddy</h2>
            <p className="mt-2 text-sm font-medium text-slate-400">Create your profile and find your perfect match</p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-center text-sm font-bold text-rose-400">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-400 uppercase">Full Name</label>
              <input 
                className="w-full rounded-xl border border-white/10 bg-slate-800/50 p-4 text-white placeholder-slate-500 outline-none transition-colors focus:border-cyan-500 focus:bg-slate-800" 
                type="text" 
                placeholder="Chris Bumstead" 
                onChange={(e) => setForm({ ...form, name: e.target.value })} 
                required 
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-400 uppercase">Email Address</label>
              <input 
                className="w-full rounded-xl border border-white/10 bg-slate-800/50 p-4 text-white placeholder-slate-500 outline-none transition-colors focus:border-cyan-500 focus:bg-slate-800" 
                type="email" 
                placeholder="chris@example.com" 
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
                minLength={6}
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold tracking-wider text-slate-400 uppercase">Gender</label>
              <div className="grid grid-cols-3 gap-3">
                {["male", "female", "other"].map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setForm({ ...form, gender: g })}
                    className={`rounded-xl py-3 text-sm font-bold uppercase tracking-wide transition-all ${form.gender === g ? "bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]" : "bg-slate-800/80 text-slate-400 border border-white/5 hover:bg-slate-700 hover:text-white"}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <button 
              className="mt-6 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-4 font-black transition-all hover:scale-[1.02] active:scale-95 disabled:scale-100 disabled:opacity-50 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] uppercase tracking-wide" 
              disabled={loading}
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm font-medium text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
