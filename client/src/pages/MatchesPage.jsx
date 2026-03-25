import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { acceptMatch, fetchMatches, rejectMatch } from "../services/matchingService";

const MatchesPage = () => {
  const [activeTab, setActiveTab] = useState("accepted");
  const [acceptedMatches, setAcceptedMatches] = useState([]);
  const [pendingMatches, setPendingMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMatchInfo, setNewMatchInfo] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const result = await fetchMatches();
      setAcceptedMatches(result.accepted || []);
      setPendingMatches(result.pending || []);
    } catch (err) {
      console.error("Failed to load matches", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAccept = async (matchId) => {
    try {
      const resp = await acceptMatch(matchId);
      if (resp && resp.match) {
         // Find partner info to show in modal
         const partner = pendingMatches.find(m => m._id === matchId)?.partner;
         if (partner) {
           setNewMatchInfo({ matchId, partner });
         }
      }
      load(); // Refresh lists
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (matchId) => {
    try {
      await rejectMatch(matchId);
      load(); // Refresh lists
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-6 text-slate-100">
      <h2 className="mb-6 text-3xl font-black bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">Your Connections</h2>

      {/* Tabs */}
      <div className="mb-6 flex border-b border-slate-700/50">
        <button
          onClick={() => setActiveTab("accepted")}
          className={`pb-3 px-4 font-bold transition-all ${activeTab === "accepted" ? "border-b-2 border-cyan-400 text-cyan-400" : "text-slate-400 hover:text-slate-200"}`}
        >
          Matches ({acceptedMatches.length})
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`pb-3 px-4 font-bold transition-all flex items-center gap-2 ${activeTab === "pending" ? "border-b-2 border-emerald-400 text-emerald-400" : "text-slate-400 hover:text-slate-200"}`}
        >
          Pending Requests
          {pendingMatches.length > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-xs text-white">
              {pendingMatches.length}
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex animate-pulse flex-col space-y-4">
          {[1, 2, 3].map(i => (
             <div key={i} className="h-24 w-full rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : activeTab === "accepted" ? (
        <div className="space-y-4">
          {acceptedMatches.length === 0 ? (
            <div className="py-12 text-center text-slate-500">No active matches yet. Keep swiping!</div>
          ) : (
            acceptedMatches.map((match) => (
              <div key={match._id} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur-md transition-all hover:bg-white/10">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-cyan-400/30">
                     <img src={match.partner?.profilePicture || "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg"} alt={match.partner?.name} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{match.partner?.name}, {match.partner?.age}</p>
                  </div>
                </div>
                <Link to={`/chat/${match._id}`} className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-2 font-bold text-white shadow-lg transition-transform hover:scale-105">
                  Chat
                </Link>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {pendingMatches.length === 0 ? (
            <div className="py-12 text-center text-slate-500">No pending requests right now.</div>
          ) : (
            pendingMatches.map((match) => (
              <div key={match._id} className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur-md transition-all md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-emerald-400/30">
                     <img src={match.partner?.profilePicture || "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg"} alt={match.partner?.name} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold text-white">{match.partner?.name}, {match.partner?.age}</p>
                      <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-400">New Request</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleReject(match._id)} className="rounded-xl bg-white/10 px-4 py-2 font-bold text-slate-300 transition-colors hover:bg-rose-500/20 hover:text-rose-400">
                    Pass
                  </button>
                  <button onClick={() => handleAccept(match._id)} className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2 font-bold text-white shadow-lg shadow-emerald-500/20 transition-transform hover:scale-105">
                    Accept Match
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Match Modal */}
      {newMatchInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md scale-100 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-center shadow-2xl">
            <h3 className="mb-2 text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">It's a Match!</h3>
            <p className="mb-6 text-slate-300">You and {newMatchInfo.partner?.name} are now connected!</p>
            
            <div className="relative mx-auto mb-8 flex w-full max-w-[240px] items-center justify-center">
              <div className="absolute h-32 w-32 -translate-x-12 overflow-hidden rounded-full border-4 border-slate-900 shadow-xl z-20">
                <img src={newMatchInfo.partner?.profilePicture || "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg"} alt="Partner" className="h-full w-full object-cover" />
              </div>
              <div className="absolute h-32 w-32 translate-x-12 overflow-hidden rounded-full border-4 border-slate-900 shadow-xl z-10 opacity-90 scale-95">
                 {/* Current User Dummy logic placeholder, using partner photo as fallback if user photo isn't available easily locally */}
                <div className="h-full w-full bg-slate-700 flex items-center justify-center font-black text-4xl text-slate-500">YOU</div>
              </div>
              <div className="h-32 w-32" /> {/* spacer */}
            </div>

            <div className="flex flex-col gap-3">
              <Link to={`/chat/${newMatchInfo.matchId}`} className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-4 font-black transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                Send a Message
              </Link>
              <button onClick={() => setNewMatchInfo(null)} className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 font-bold text-slate-300 transition-colors hover:bg-white/10 hover:text-white">
                Keep Matching
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchesPage;
