import Match from "../models/Match.js";
import Message from "../models/Message.js";
import { AppError, asyncHandler } from "../utils/error.js";

const ensureMatchOwnership = async (matchId, userId) => {
  const match = await Match.findById(matchId);
  if (!match) throw new AppError("Match not found", 404);

  const belongs =
    String(match.user1) === String(userId) || String(match.user2) === String(userId);
  if (!belongs) throw new AppError("Not authorized for this chat", 403);

  if (match.status !== "accepted") {
    throw new AppError("Chat is only available for accepted matches", 403);
  }

  return match;
};

export const getChatByMatch = asyncHandler(async (req, res) => {
  const { matchId } = req.params;
  const page = Number(req.query.page || 1);
  const limit = Math.min(Number(req.query.limit || 30), 100);
  const skip = (page - 1) * limit;

  const matchDoc = await ensureMatchOwnership(matchId, req.user._id);
  const match = await Match.findById(matchDoc._id)
    .populate("user1", "name profilePicture age")
    .populate("user2", "name profilePicture age")
    .lean();

  const total = await Message.countDocuments({ matchId });
  const messages = await Message.find({ matchId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("sender", "name profilePicture")
    .lean();

  res.json({
    match,
    page,
    limit,
    total,
    data: messages.reverse()
  });
});

export const sendMessage = asyncHandler(async (req, res) => {
  const { matchId, text } = req.body;
  if (!matchId || !text) {
    throw new AppError("matchId and text are required", 400);
  }

  const match = await ensureMatchOwnership(matchId, req.user._id);

  const message = await Message.create({
    matchId,
    sender: req.user._id,
    text,
    readBy: [req.user._id]
  });

  const populated = await Message.findById(message._id).populate("sender", "name profilePicture");

  const io = req.app.get("io");
  io.to(match.chatId).emit("new_message", populated);

  res.status(201).json(populated);
});
