import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SwipeCard from "../components/SwipeCard";
import { swipeDislike, swipeLike } from "../services/matchingService";
import { fetchRecommendations } from "../services/userService";
import { getMatchScore } from "../services/aiService";
import { authStore } from "../context/authStore";

const SwipePage = () => {
  const currentUser = authStore((state) => state.user);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMatchInfo, setNewMatchInfo] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const result = await fetchRecommendations({ limit: 20 });
        setCards(result.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const onLike = async (targetUserId) => {
    const target = cards.find(c => c._id === targetUserId);
    const result = await swipeLike(targetUserId);
    setCards((prev) => prev.filter((c) => c._id !== targetUserId));
    if (result.matched && result.match) {
      setNewMatchInfo({ matchId: result.match._id, partner: target });
    }
  };

  const onDislike = async (targetUserId) => {
    await swipeDislike(targetUserId);
    setCards((prev) => prev.filter((c) => c._id !== targetUserId));
  };

  const handleCalculateScore = async (targetUserId) => {
    try {
      setCards((prev) => 
        prev.map(c => c._id === targetUserId ? { ...c, isCalculating: true } : c)
      );
      const scoreData = await getMatchScore(currentUser._id, targetUserId);
      setCards((prev) => 
        prev.map(c => c._id === targetUserId ? { ...c, compatibilityScore: scoreData.score, isCalculating: false } : c)
      );
    } catch (err) {
      console.error(err);
      setCards((prev) => 
        prev.map(c => c._id === targetUserId ? { ...c, isCalculating: false } : c)
      );
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col items-center p-6 text-slate-100 min-h-[calc(100vh-80px)] overflow-hidden relative">
      <div className="w-full mb-8 text-center pt-4">
        <h2 className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Discover</h2>
        <p className="text-sm text-slate-400 mt-1 font-medium">Find your perfect workout partner</p>
      </div>

      <div className="relative flex h-[600px] w-full items-center justify-center">
        {loading ? (
           <div className="absolute inset-0 flex justify-center">
             <div className="w-full max-w-sm rounded-3xl bg-slate-800/80 border border-white/5 animate-pulse shadow-2xl p-5">
                <div className="h-96 w-full rounded-2xl bg-white/5" />
                <div className="mt-4 space-y-3 px-2">
                  <div className="h-4 w-3/4 rounded bg-white/5" />
                  <div className="h-4 w-1/2 rounded bg-white/5" />
                  <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                    <div className="h-8 w-20 rounded bg-white/5" />
                    <div className="h-8 w-20 rounded bg-white/5" />
                  </div>
                </div>
             </div>
           </div>
        ) : cards.length ? (
          cards.slice(0, 3).reverse().map((user, index, arr) => (
            <div key={user._id} className="absolute inset-0 flex justify-center" style={{ zIndex: index }}>
              {index === arr.length - 1 ? (
                <SwipeCard user={user} onLike={onLike} onDislike={onDislike} onCalculateScore={handleCalculateScore} />
              ) : (
                <div 
                  className="w-full max-w-sm rounded-3xl bg-slate-800/50 border border-white/5 opacity-50 blur-[2px]"
                  style={{ transform: `scale(${0.95 - (arr.length - 1 - index) * 0.05}) translateY(${(arr.length - 1 - index) * 20}px)` }}
                />
              )}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center space-y-6 opacity-60">
            <div className="h-24 w-24 rounded-full border-4 border-dashed border-slate-600 animate-[spin_4s_linear_infinite]" />
            <p className="text-lg font-medium tracking-wide">Finding more athletes...</p>
          </div>
        )}
      </div>

      {/* Match Modal */}
      {newMatchInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md scale-100 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-center shadow-2xl">
            <h3 className="mb-2 text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">It's a Match!</h3>
            <p className="mb-6 text-slate-300">You and {newMatchInfo.partner?.name} liked each other!</p>
            
            <div className="relative mx-auto mb-8 flex w-full max-w-[240px] items-center justify-center">
              <div className="absolute h-32 w-32 -translate-x-12 overflow-hidden rounded-full border-4 border-slate-900 shadow-xl z-20">
                <img src={newMatchInfo.partner?.profilePicture || "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg"} alt="Partner" className="h-full w-full object-cover" />
              </div>
              <div className="absolute h-32 w-32 translate-x-12 overflow-hidden rounded-full border-4 border-slate-900 shadow-xl z-10 opacity-90 scale-95">
                <div className="h-full w-full bg-slate-700 flex items-center justify-center font-black text-4xl text-slate-500">YOU</div>
              </div>
              <div className="h-32 w-32" />
            </div>

            <div className="flex flex-col gap-3">
              <Link to={`/chat/${newMatchInfo.matchId}`} className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-4 font-black transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.3)] block text-center">
                Send a Message
              </Link>
              <button onClick={() => setNewMatchInfo(null)} className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 font-bold text-slate-300 transition-colors hover:bg-white/10 hover:text-white">
                Keep Swiping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwipePage;
