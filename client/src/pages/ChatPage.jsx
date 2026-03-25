import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ChatWindow from "../components/ChatWindow";
import { authStore } from "../context/authStore";
import { useSocket } from "../hooks/useSocket";
import { fetchChat, sendChatMessage } from "../services/chatService";

const ChatPage = () => {
  const { matchId } = useParams();
  const currentUser = authStore((state) => state.user);
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [match, setMatch] = useState(null);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState(null);
  const [partner, setPartner] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await fetchChat(matchId);
        setMessages(result.data || []);
        
        const loadedMatch = result.match;
        setMatch(loadedMatch);
        
        // Compute partner
        if (loadedMatch && currentUser) {
           const p = String(loadedMatch.user1?._id) === String(currentUser._id) 
              ? loadedMatch.user2 
              : loadedMatch.user1;
           setPartner(p);
        }

        if (socket && loadedMatch?.chatId) {
          socket.emit("join_room", { chatId: loadedMatch.chatId });
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load chat. You may not have access.");
      }
    };

    load();
  }, [matchId, socket]);

  useEffect(() => {
    if (!socket) return;

    const onNewMessage = (message) => {
      if (String(message.matchId) === String(matchId)) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const onTyping = () => setTyping(true);
    const onStopTyping = () => setTyping(false);

    socket.on("new_message", onNewMessage);
    socket.on("typing", onTyping);
    socket.on("stop_typing", onStopTyping);

    return () => {
      socket.off("new_message", onNewMessage);
      socket.off("typing", onTyping);
      socket.off("stop_typing", onStopTyping);
    };
  }, [socket, matchId]);

  const submit = async (event) => {
    event.preventDefault();
    if (!text.trim()) return;

    await sendChatMessage({ matchId, text });
    if (socket && match?.chatId) {
      socket.emit("stop_typing", { chatId: match.chatId, userId: currentUser?._id });
    }
    setText("");
  };

  const onTypingChange = (value) => {
    setText(value);
    if (!socket || !match?.chatId) return;
    socket.emit("typing", { chatId: match.chatId, userId: currentUser?._id });
  };

  if (error) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-center p-6 text-slate-100 min-h-[50vh]">
        <h2 className="mb-4 text-3xl font-black text-rose-400">Restricted Access</h2>
        <p className="text-slate-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col h-[calc(100vh-80px)] p-4 sm:p-6 text-slate-100">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between rounded-2xl bg-slate-900 border border-white/5 p-4 shadow-lg backdrop-blur shrink-0 z-10">
        <div className="flex items-center gap-4">
          {partner ? (
             <Link to={`/user/${partner._id}`} className="group relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-cyan-500/30 transition-all hover:border-cyan-400">
               <img src={partner.profilePicture || "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg"} alt={partner.name} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
             </Link>
          ) : (
             <div className="h-12 w-12 shrink-0 rounded-full bg-slate-800 animate-pulse border-2 border-white/5" />
          )}
          
          <div className="flex flex-col">
             {partner ? (
                <Link to={`/user/${partner._id}`} className="text-xl font-black text-white hover:text-cyan-400 transition-colors line-clamp-1">{partner.name}</Link>
             ) : (
                <div className="h-6 w-32 rounded bg-slate-800 animate-pulse mb-1" />
             )}
             <div className="h-4 flex items-center">
               {typing ? (
                 <p className="text-xs font-bold text-cyan-400 animate-pulse">typing...</p>
               ) : (
                 <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                   <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span> Online
                 </p>
               )}
             </div>
          </div>
        </div>
        
        {partner && (
          <Link to={`/user/${partner._id}`} className="hidden sm:flex text-sm font-bold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition-all border border-white/5">
            View Profile
          </Link>
        )}
      </div>

      {/* Chat Window Container */}
      <div className="relative flex-1 min-h-0 rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur pb-2">
        <ChatWindow messages={messages} currentUserId={currentUser?._id} />
      </div>
      <form onSubmit={submit} className="mt-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => onTypingChange(e.target.value)}
          className="flex-1 rounded bg-slate-800 p-3"
          placeholder="Type your message"
          disabled={!match || match.status !== "accepted"}
        />
        <button className="rounded bg-orange-500 px-4 font-bold disabled:opacity-50" disabled={!match || match.status !== "accepted"}>Send</button>
      </form>
    </div>
  );
};

export default ChatPage;
