import { motion, useAnimation, useMotionValue, useTransform } from "framer-motion";
import { useEffect } from "react";

const SwipeCard = ({ user, onLike, onDislike, onCalculateScore }) => {
  const x = useMotionValue(0);
  const controls = useAnimation();
  
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  useEffect(() => {
    controls.start({ x: 0, opacity: 1, scale: 1, rotate: 0 });
  }, [user, controls]);

  if (!user) return null;

  const handleDragEnd = async (e, info) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    
    if (offset > 100 || velocity > 500) {
      await controls.start({ x: 300, opacity: 0 });
      onLike(user._id);
    } else if (offset < -100 || velocity < -500) {
      await controls.start({ x: -300, opacity: 0 });
      onDislike(user._id);
    } else {
      controls.start({ x: 0, opacity: 1 });
    }
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      style={{ x, rotate, opacity }}
      animate={controls}
      initial={{ scale: 0.95, opacity: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="absolute w-full max-w-sm cursor-grab active:cursor-grabbing rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-2xl backdrop-blur-md"
    >
      <div className="relative h-96 w-full overflow-hidden rounded-2xl">
        <img
          src={user.profilePicture || "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80"}
          alt={user.name}
          className="h-full w-full object-cover"
          draggable="false"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent pt-12 pb-4 px-4 text-white">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-3xl font-black tracking-tight flex items-center gap-2 drop-shadow-md">
                {user.name} <span className="text-xl font-normal text-slate-300">{user.age || ""}</span>
              </h3>
            </div>
            
            {/* Circular Match Score */}
            <div className="flex flex-col items-center">
              {user.compatibilityScore ? (
                <>
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-slate-900/50 backdrop-blur shadow-lg border border-white/10">
                    <svg className="h-full w-full rotate-[-90deg]">
                      <circle cx="28" cy="28" r="24" className="fill-none stroke-slate-700 stroke-[4]" />
                      <circle 
                        cx="28" cy="28" r="24" 
                        className="fill-none stroke-cyan-400 stroke-[4] transition-all duration-1000 ease-out"
                        strokeDasharray="150"
                        strokeDashoffset={150 - (150 * user.compatibilityScore) / 100}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-sm font-black text-cyan-300 drop-shadow-lg">{user.compatibilityScore}%</span>
                  </div>
                  <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-cyan-400/80">Match</span>
                </>
              ) : (
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => onCalculateScore?.(user._id)}
                  disabled={user.isCalculating}
                  className="flex h-14 w-14 flex-col items-center justify-center rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all hover:scale-105 hover:border-emerald-400 active:scale-95 group relative overflow-hidden disabled:opacity-70 disabled:grayscale z-50"
                >
                  {user.isCalculating ? (
                    <div className="h-6 w-6 rounded-full border-2 border-dashed border-emerald-400 animate-spin" />
                  ) : (
                    <>
                      <span className="text-xl leading-none group-hover:animate-pulse">⚡</span>
                      <span className="text-[7px] font-black uppercase tracking-widest text-emerald-400 mt-0.5">Score</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 space-y-3 text-slate-300 px-2 pb-2">
        <p className="text-base line-clamp-3 leading-relaxed mt-1 border-l-2 border-cyan-500/50 pl-3">{user.bio || "This athlete prefers to let their workouts do the talking."}</p>
        <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
          <span className="flex items-center gap-1 rounded-lg bg-slate-800/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300 shadow-inner">
            📍 {user.gymLocation || "Gym not set"}
          </span>
          <span className="flex items-center gap-1 rounded-lg bg-indigo-900/30 border border-indigo-800/50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-300 shadow-inner">
            💪 {user.fitnessLevel || "Beginner"}
          </span>
          {(user.fitnessGoals || []).slice(0, 2).map((goal) => (
             <span key={goal} className="rounded-lg bg-cyan-900/30 border border-cyan-800/50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-300 shadow-inner">
               🎯 {goal}
             </span>
          ))}
        </div>
      </div>
      
      {/* Interactive Desktop / Mobile Buttons */}
      <div className="mt-4 flex gap-4 px-2">
        <button 
          onClick={async () => { await controls.start({ x: -300, opacity: 0, rotate: -20 }); onDislike(user._id); }} 
          className="group relative flex-1 overflow-hidden rounded-2xl bg-slate-800 py-4 font-black tracking-widest text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.1)] transition-all hover:bg-slate-700 hover:shadow-[0_0_25px_rgba(244,63,94,0.3)] hover:-translate-y-1 active:scale-95 border border-rose-500/20"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transition-transform group-hover:-rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            PASS
          </span>
        </button>
        <button 
          onClick={async () => { await controls.start({ x: 300, opacity: 0, rotate: 20 }); onLike(user._id); }} 
          className="group relative flex-1 overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 py-4 font-black tracking-widest text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all hover:from-cyan-400 hover:to-blue-500 hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:-translate-y-1 active:scale-95 border border-cyan-400/50"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transition-transform group-hover:scale-125 group-hover:-rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            CONNECT
          </span>
        </button>
      </div>
    </motion.div>
  );
};

export default SwipeCard;
