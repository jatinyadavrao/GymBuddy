import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchUserProfile } from "../services/userService";

const PublicProfilePage = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const data = await fetchUserProfile(id);
        setUser(data);
      } catch (err) {
        setError("Failed to load user profile");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6 text-slate-100">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-slate-100 text-center">
        <h2 className="text-2xl font-black text-rose-500 mb-2">Profile Not Found</h2>
        <p className="text-slate-400 mb-6">{error || "This user does not exist."}</p>
        <Link to="/swipe" className="rounded-xl bg-slate-800 px-6 py-3 font-bold text-white transition hover:bg-slate-700">Back to Swiping</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6 text-slate-100">
      <Link to={-1} className="inline-flex items-center gap-2 mb-6 text-sm font-bold text-slate-400 hover:text-cyan-400 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Go Back
      </Link>

      <div className="overflow-hidden rounded-3xl border border-white/5 bg-slate-900 shadow-2xl backdrop-blur-md">
        <div className="h-48 w-full bg-gradient-to-r from-cyan-600 to-blue-600 relative overflow-hidden">
             {/* Abstract background graphics */}
             <div className="absolute top-[-50%] left-[-10%] h-[200%] w-[50%] rotate-12 bg-white/10 blur-3xl"></div>
        </div>
        
        <div className="relative px-6 pb-8 md:px-12">
          {/* Avatar Profile */}
          <div className="absolute -top-20 left-6 md:left-12 h-36 w-36 overflow-hidden rounded-full border-4 border-slate-900 bg-slate-800 shadow-xl">
            <img 
              src={user.profilePicture || "https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&w=400&q=80"} 
              alt={user.name} 
              className="h-full w-full object-cover" 
            />
          </div>

          <div className="pt-20">
            <h1 className="text-4xl font-black text-white md:text-5xl">{user.name}, <span className="font-light text-cyan-400">{user.age || "N/A"}</span></h1>
            {user.gymLocation && (
              <p className="mt-2 flex items-center text-slate-300 font-medium tracking-wide">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-rose-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                Works out at <span className="text-white ml-1 font-bold">{user.gymLocation}</span>
              </p>
            )}
            
            <div className="mt-8 space-y-8">
              {/* Bio */}
              <div className="rounded-2xl bg-white/5 p-6 border border-white/10 shadow-inner">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-cyan-500">About Me</h3>
                <p className="text-lg leading-relaxed text-slate-300 italic">" {user.bio || "No bio provided."} "</p>
              </div>

              {/* Physical Stats */}
              <div className="grid gap-4 sm:grid-cols-3">
                 <div className="rounded-xl bg-slate-800/80 p-5 text-center shadow-md border border-white/5">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Gender</p>
                    <p className="mt-1 text-xl font-black text-white capitalize">{user.gender || "Unknown"}</p>
                 </div>
                 <div className="rounded-xl bg-slate-800/80 p-5 text-center shadow-md border border-white/5">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Fitness Level</p>
                    <p className="mt-1 text-xl font-black text-white capitalize">{user.fitnessLevel || "N/A"}</p>
                 </div>
                 <div className="rounded-xl bg-slate-800/80 p-5 text-center shadow-md border border-white/5">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Streak</p>
                    <p className="mt-1 text-xl font-black text-white capitalize">{user.streakCount || 0} 🔥</p>
                 </div>
              </div>

              {/* Goals */}
              {user.fitnessGoals?.length > 0 && (
                <div>
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-400">Fitness Goals</h3>
                  <div className="flex flex-wrap gap-3">
                    {user.fitnessGoals.map(goal => (
                       <span key={goal} className="rounded-xl bg-indigo-900/40 border border-indigo-500/30 px-4 py-2 text-sm font-bold uppercase tracking-wider text-indigo-300 shadow-sm">
                         {goal}
                       </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Interests */}
              {user.interests?.length > 0 && (
                <div>
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-400">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.interests.map(interest => (
                       <span key={interest} className="rounded-xl bg-emerald-900/40 border border-emerald-500/30 px-4 py-2 text-sm font-bold uppercase tracking-wider text-emerald-300 shadow-sm">
                         {interest}
                       </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfilePage;
