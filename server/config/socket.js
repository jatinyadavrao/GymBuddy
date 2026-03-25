import Message from "../models/Message.js";

export const configureSocket = (io) => {
  io.on("connection", (socket) => {
    socket.on("join_room", ({ chatId }) => {
      socket.join(chatId);
    });

    socket.on("typing", ({ chatId, userId }) => {
      socket.to(chatId).emit("typing", { userId });
    });

    socket.on("stop_typing", ({ chatId, userId }) => {
      socket.to(chatId).emit("stop_typing", { userId });
    });

    socket.on("mark_read", async ({ messageId, userId, chatId }) => {
      await Message.findByIdAndUpdate(messageId, { $addToSet: { readBy: userId } });
      io.to(chatId).emit("message_read", { messageId, userId });
    });
  });
};
