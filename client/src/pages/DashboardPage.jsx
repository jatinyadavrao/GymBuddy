import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchRecommendations } from "../services/userService";
import { getMatchScore } from "../services/aiService";
import { authStore } from "../context/authStore";
import { motion, AnimatePresence } from "framer-motion";

const DashboardPage = () => {
  const currentUser = authStore((state) => state.user);
  const [recommendations, setRecommendations] = useState([]);
  const [filters, setFilters] = useState({ maxDistanceKm: 10, searchGym: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [loadingScoreId, setLoadingScoreId] = useState(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const result = await fetchRecommendations(filters);
        setRecommendations(result.data);
      } catch (err) {
        console.error("Failed to load recommendations", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Add a small debounce effect for typing in the search bar
    const timeoutId = setTimeout(() => {
      load();
    }, 400);
    
    return () => clearTimeout(timeoutId);
  }, [filters]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const handleCalculateScore = async (targetUserId) => {
    try {
      setLoadingScoreId(targetUserId);
      const scoreData = await getMatchScore(currentUser._id, targetUserId);
      setRecommendations((prev) => 
        prev.map(c => c._id === targetUserId ? { ...c, compatibilityScore: scoreData.score } : c)
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingScoreId(null);
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="mx-auto max-w-7xl p-6 text-slate-100 min-h-[calc(100vh-80px)]">
      {/* Header Section */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8 pt-4">
        <div>
          <h2 className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Athlete Hub</h2>
          <p className="text-sm font-medium text-slate-400 mt-2">Discover compatible training partners in your area</p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 bg-slate-900/50 p-3 rounded-2xl border border-white/5 backdrop-blur-sm shadow-xl">
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              className="w-full sm:w-80 rounded-xl border border-transparent bg-slate-800 py-2.5 pl-10 pr-4 text-sm font-medium text-white placeholder-slate-400 transition-all focus:border-cyan-500 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              placeholder="Search by gym address or location..."
              value={filters.searchGym}
              onChange={(e) => setFilters({ ...filters, searchGym: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-slate-800 px-4 py-2 border border-transparent hover:border-white/10 transition-colors">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Radius</span>
            <input
              className="w-16 bg-transparent text-right font-bold text-cyan-400 focus:outline-none"
              type="number"
              min="1"
              value={filters.maxDistanceKm}
              onChange={(e) => setFilters({ ...filters, maxDistanceKm: Number(e.target.value) })}
            />
            <span className="text-xs font-bold text-slate-400">km</span>
          </div>
        </div>
      </div>

      {/* Grid Section */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-[320px] rounded-3xl border border-white/5 bg-slate-900/50 p-6 animate-pulse">
               <div className="flex items-center gap-4 border-b border-white/5 pb-4 mb-4">
                  <div className="h-16 w-16 rounded-full bg-slate-800" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/2 rounded bg-slate-800" />
                    <div className="h-3 w-1/3 rounded bg-slate-800" />
                  </div>
               </div>
               <div className="space-y-3">
                 <div className="h-3 w-full rounded bg-slate-800" />
                 <div className="h-3 w-full rounded bg-slate-800" />
                 <div className="h-3 w-3/4 rounded bg-slate-800" />
               </div>
            </div>
          ))}
        </div>
      ) : recommendations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-60">
           <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-800 mb-6 border border-white/5 shadow-inner">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
           </div>
           <h3 className="text-xl font-bold text-slate-300 mb-2">No Athletes Found</h3>
           <p className="text-slate-400 max-w-md text-center">Try increasing your search radius or modifying your gym search filter to discover more partners.</p>
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <AnimatePresence>
            {recommendations.map((user) => (
              <motion.article 
                key={user._id} 
                variants={itemVariants}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/5 bg-slate-900 shadow-xl transition-all hover:border-cyan-500/30 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] hover:-translate-y-1"
              >
                {/* Score Badge */}
                <div className="absolute right-4 top-4 z-10 flex items-center gap-1.5 rounded-full bg-slate-950/80 px-3 py-1.5 backdrop-blur border border-white/10 shadow-lg">
                  {user.compatibilityScore ? (
                    <>
                      <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                      <span className="text-xs font-black text-cyan-400">{user.compatibilityScore}%</span>
                    </>
                  ) : (
                    <button 
                      onClick={() => handleCalculateScore(user._id)}
                      disabled={loadingScoreId === user._id}
                      className="text-xs font-black text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5 px-1 py-0.5 disabled:opacity-70 disabled:grayscale"
                    >
                      {loadingScoreId === user._id ? (
                        <div className="h-3 w-3 rounded-full border-2 border-dashed border-emerald-400 animate-spin" />
                      ) : (
                        <>
                           ⚡ <span className="hidden sm:inline">Score</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-4 mb-5 border-b border-white/5 pb-5">
                    <Link to={`/user/${user._id}`} className="shrink-0 h-16 w-16 overflow-hidden rounded-full border-2 border-slate-700 transition-colors group-hover:border-cyan-400">
                      <img src={user.profilePicture || "https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&w=400&q=80"} alt={user.name} className="h-full w-full object-cover" />
                    </Link>
                    <div>
                      <Link to={`/user/${user._id}`} className="text-xl font-black text-white hover:text-cyan-400 line-clamp-1 transition-colors">
                        {user.name}
                      </Link>
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-400 mt-1 line-clamp-1 flex items-center gap-1">
                        📍 {user.gymLocation || "Unknown Location"}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed text-slate-300 italic line-clamp-3 mb-6">
                    "{user.bio || "This athlete prefers to let their workouts do the talking."}"
                  </p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {user.fitnessLevel && (
                       <span className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                         {user.fitnessLevel}
                       </span>
                    )}
                    {(user.fitnessGoals || []).slice(0, 2).map((goal) => (
                       <span key={goal} className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                         {goal.split(" ")[0]}
                       </span>
                    ))}
                  </div>
                </div>

                {/* Interaction Footer */}
                <div className="mt-auto border-t border-white/5 bg-slate-800/30 p-4">
                   <Link to={`/user/${user._id}`} className="block w-full rounded-xl bg-white/5 py-3 text-center text-sm font-bold text-white transition-all hover:bg-cyan-500 hover:text-white hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] border border-transparent">
                     View Complete Profile
                   </Link>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default DashboardPage;
