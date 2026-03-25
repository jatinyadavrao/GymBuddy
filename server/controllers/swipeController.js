import Match from "../models/Match.js";
import User from "../models/User.js";
import { calculateAiMatchScore } from "../services/geminiService.js";
import { sendPushNotification } from "../services/notificationService.js";
import { AppError, asyncHandler } from "../utils/error.js";

const orderedPair = (id1, id2) => {
  const [a, b] = [String(id1), String(id2)].sort();
  return { user1: a, user2: b };
};

export const likeUser = asyncHandler(async (req, res) => {
  const { targetUserId } = req.body;
  if (!targetUserId) {
    throw new AppError("targetUserId is required", 400);
  }

  if (String(req.user._id) === String(targetUserId)) {
    throw new AppError("Cannot like yourself", 400);
  }

  const target = await User.findById(targetUserId);
  if (!target) {
    throw new AppError("Target user not found", 404);
  }

  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { likes: targetUserId },
    $pull: { dislikes: targetUserId }
  });

  const pair = orderedPair(req.user._id, targetUserId);
  let match = await Match.findOne(pair);

  if (!match) {
    const profileA = JSON.stringify({ bio: req.user.bio, goals: req.user.fitnessGoals, interests: req.user.interests });
    const profileB = JSON.stringify({ bio: target.bio, goals: target.fitnessGoals, interests: target.interests });
    const aiResult = await calculateAiMatchScore(profileA, profileB);

    match = await Match.create({
      ...pair,
      chatId: `${pair.user1}_${pair.user2}`,
      status: "pending",
      requestedBy: req.user._id,
      compatibilityScore: aiResult.score,
      compatibilityExplanation: aiResult.reason
    });

    await sendPushNotification(target.pushToken, {
      title: "New Match Request",
      body: "Someone wants to match with you!"
    });

    return res.json({ matched: false, match });
  }

  if (match.status === "pending" && String(match.requestedBy) === String(targetUserId)) {
    match.status = "accepted";
    await match.save();

    await Promise.all([
      User.findByIdAndUpdate(req.user._id, { $addToSet: { matches: targetUserId } }),
      User.findByIdAndUpdate(targetUserId, { $addToSet: { matches: req.user._id } })
    ]);

    await Promise.all([
      sendPushNotification(req.user.pushToken, {
        title: "Match Accepted",
        body: `You are now matched with ${target.name}`
      }),
      sendPushNotification(target.pushToken, {
        title: "Match Accepted",
        body: `${req.user.name} accepted your match request!`
      })
    ]);

    return res.json({ matched: true, match });
  }

  res.json({ matched: match.status === "accepted", match });
});

export const dislikeUser = asyncHandler(async (req, res) => {
  const { targetUserId } = req.body;
  if (!targetUserId) {
    throw new AppError("targetUserId is required", 400);
  }

  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { dislikes: targetUserId },
    $pull: { likes: targetUserId }
  });

  const pair = orderedPair(req.user._id, targetUserId);
  const match = await Match.findOne(pair);

  if (match && match.status === "pending" && String(match.requestedBy) === String(targetUserId)) {
    match.status = "rejected";
    await match.save();
  }

  res.json({ success: true });
});
