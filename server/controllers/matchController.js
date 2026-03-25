import Match from "../models/Match.js";
import User from "../models/User.js";
import { AppError, asyncHandler } from "../utils/error.js";

export const getMatches = asyncHandler(async (req, res) => {
  const query = {
    $or: [{ user1: req.user._id }, { user2: req.user._id }],
    status: { $ne: "rejected" }
  };

  const matches = await Match.find(query)
    .sort({ createdAt: -1 })
    .populate("user1", "name age profilePicture bio gymLocation")
    .populate("user2", "name age profilePicture bio gymLocation")
    .lean();

  const accepted = [];
  const pending = [];

  matches.forEach((match) => {
    const partner = String(match.user1._id) === String(req.user._id) ? match.user2 : match.user1;
    const transformed = { ...match, partner };

    if (match.status === "accepted") {
      accepted.push(transformed);
    } else if (match.status === "pending" && String(match.requestedBy) !== String(req.user._id)) {
      // Only show incoming pending requests (where requestedBy is the OTHER user)
      pending.push(transformed);
    }
  });

  res.json({ accepted, pending });
});

export const acceptMatch = asyncHandler(async (req, res) => {
  const { matchId } = req.params;
  const match = await Match.findById(matchId);
  if (!match) throw new AppError("Match not found", 404);

  if (match.status !== "pending" || String(match.requestedBy) === String(req.user._id)) {
    throw new AppError("Cannot accept this match", 400);
  }

  match.status = "accepted";
  await match.save();

  const partnerId = String(match.user1) === String(req.user._id) ? match.user2 : match.user1;

  await Promise.all([
    User.findByIdAndUpdate(req.user._id, { $addToSet: { matches: partnerId } }),
    User.findByIdAndUpdate(partnerId, { $addToSet: { matches: req.user._id } })
  ]);

  res.json({ success: true, match });
});

export const rejectMatch = asyncHandler(async (req, res) => {
  const { matchId } = req.params;
  const match = await Match.findById(matchId);
  if (!match) throw new AppError("Match not found", 404);

  if (match.status !== "pending" || String(match.requestedBy) === String(req.user._id)) {
    throw new AppError("Cannot reject this match", 400);
  }

  match.status = "rejected";
  await match.save();

  res.json({ success: true });
});
