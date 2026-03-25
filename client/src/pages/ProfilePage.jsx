import { useEffect, useState } from "react";
import { authStore } from "../context/authStore";
import { analyzeBio, getWorkoutSuggestions } from "../services/aiService";
import { fetchMe, updateProfile, verifyProfile } from "../services/userService";

const ProfilePage = () => {
  const refreshUser = authStore((state) => state.refreshUser);
  const currentUser = authStore((state) => state.user);
  const [form, setForm] = useState({ bio: "", gymLocation: "", fitnessLevel: "beginner" });
  const [profilePicture, setProfilePicture] = useState(null);
  const [preview, setPreview] = useState(null);
  const [workoutPlan, setWorkoutPlan] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const me = await fetchMe();
      refreshUser(me);
      setForm({
        bio: me.bio || "",
        gymLocation: me.gymLocation || "",
        fitnessLevel: me.fitnessLevel || "beginner",
        gender: me.gender || "male"
      });
      if (me.profilePicture) setPreview(me.profilePicture);
    };
    load();
  }, [refreshUser]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });
      // CRITICAL: Ensure the actual File object is appended
      if (profilePicture instanceof File) {
        data.append("profilePicture", profilePicture);
      }
      
      const user = await updateProfile(data);
      refreshUser(user);
    } catch (err) {
      console.error("Profile update failed:", err);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
      alert("Profile updated successfully!");
    }
  };

  const autoAnalyze = async () => {
    const response = await analyzeBio(form.bio);
    alert("Bio analyzed! " + (response.summarizedBio || ""));
  };

  const suggestWorkout = async () => {
    const result = await getWorkoutSuggestions();
    setWorkoutPlan(result.plan || []);
  };

  return (
    <div className="mx-auto max-w-4xl p-6 text-slate-100 min-h-screen">
      <div className="mb-8">
        <h2 className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Your Profile</h2>
        <p className="text-sm text-slate-400 mt-1 font-medium">Update your details to find better matches</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="rounded-3xl border border-white/5 bg-slate-900/50 p-6 shadow-2xl backdrop-blur-xl flex flex-col items-center">
            <label className="relative cursor-pointer group flex flex-col items-center">
              <div className="h-48 w-48 overflow-hidden rounded-full border-4 border-slate-800 shadow-xl transition-all group-hover:border-cyan-500/50">
                <img
                  src={preview || "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=400&q=80"}
                  alt="Profile"
                  className="h-full w-full object-cover transition-transform group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="font-bold text-white shadow-md">Change Photo</span>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </label>
            <h3 className="mt-4 text-xl font-bold">{currentUser?.name || "Athlete"}</h3>
            <p className="text-sm text-cyan-400">{currentUser?.profileVerified ? "✓ Verified" : "Unverified"}</p>
          </div>
        </div>

        <div className="md:col-span-2">
          <form onSubmit={submit} className="space-y-5 rounded-3xl border border-white/5 bg-slate-900/50 p-8 shadow-2xl backdrop-blur-xl">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-300">Bio</label>
              <textarea 
                className="w-full rounded-xl bg-slate-800/50 p-4 border border-white/10 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors min-h-[120px]" 
                value={form.bio} 
                onChange={(e) => setForm({ ...form, bio: e.target.value })} 
                placeholder="Tell potential gym partners about yourself..." 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-300">Gym Location</label>
                <input 
                  className="w-full rounded-xl bg-slate-800/50 p-4 border border-white/10 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors" 
                  value={form.gymLocation} 
                  onChange={(e) => setForm({ ...form, gymLocation: e.target.value })} 
                  placeholder="e.g. Gold's Gym Downtown" 
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-300">Fitness Level</label>
                <select 
                  className="w-full rounded-xl bg-slate-800/50 p-4 border border-white/10 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors appearance-none" 
                  value={form.fitnessLevel} 
                  onChange={(e) => setForm({ ...form, fitnessLevel: e.target.value })}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-300">Gender</label>
                <select 
                  className="w-full rounded-xl bg-slate-800/50 p-4 border border-white/10 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors appearance-none" 
                  value={form.gender} 
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap gap-3">
              <button disabled={isLoading} className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-pink-600 px-6 py-3 font-bold text-white shadow-lg shadow-orange-500/30 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50">
                {isLoading ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>

          <div className="mt-8 rounded-3xl border border-white/5 bg-slate-900/50 p-8 shadow-2xl backdrop-blur-xl">
            <h3 className="mb-4 text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">AI ToolKit</h3>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={autoAnalyze} className="rounded-xl border border-cyan-500/50 bg-cyan-500/10 px-5 py-3 font-semibold text-cyan-400 transition-colors hover:bg-cyan-500 hover:text-white">
                ✨ Analyze Bio
              </button>
              <button type="button" onClick={suggestWorkout} className="rounded-xl border border-emerald-500/50 bg-emerald-500/10 px-5 py-3 font-semibold text-emerald-400 transition-colors hover:bg-emerald-500 hover:text-white">
                🏋️ Generate Workout
              </button>
              <button type="button" onClick={verifyProfile} className="rounded-xl border border-violet-500/50 bg-violet-500/10 px-5 py-3 font-semibold text-violet-400 transition-colors hover:bg-violet-500 hover:text-white">
                🛡 Verify Profile
              </button>
            </div>

            {!!workoutPlan.length && (
              <div className="mt-6 rounded-2xl bg-slate-800/50 p-5 border border-emerald-500/20">
                <h4 className="mb-3 font-bold text-emerald-400 flex items-center gap-2">
                  <span>Your AI 7-Day Plan</span>
                </h4>
                <ul className="space-y-2">
                  {workoutPlan.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-300">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-400">{idx + 1}</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
