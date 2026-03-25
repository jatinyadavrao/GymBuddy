const ChatWindow = ({ messages, currentUserId }) => {
  return (
    <div className="flex h-full flex-col overflow-y-auto p-6 rounded-3xl">
      <div className="flex flex-col space-y-4">
        {messages.map((message) => {
          const mine = String(message.sender?._id || message.sender) === String(currentUserId);
          return (
            <div key={message._id} className={`flex ${mine ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div
                className={`max-w-[75%] rounded-3xl px-5 py-3 text-sm shadow-md ${
                  mine 
                    ? "rounded-br-none bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-cyan-500/20" 
                    : "rounded-bl-none bg-slate-800 border border-white/5 text-slate-100"
                }`}
              >
                <p className="leading-relaxed">{message.text}</p>
                <p className={`mt-2 text-[10px] uppercase tracking-wider ${mine ? "text-cyan-100/70" : "text-slate-400"}`}>
                  {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChatWindow;
