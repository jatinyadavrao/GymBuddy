import Match from "../models/Match.js";
import User from "../models/User.js";
import {
  analyzeBioWithGemini,
  analyzeCompatibilityWithGemini,
  calculateAiMatchScore,
  generateIcebreakersWithGemini,
  generateWorkoutSuggestions
} from "../services/geminiService.js";
import { AppError, asyncHandler } from "../utils/error.js";

export const analyzeBio = asyncHandler(async (req, res) => {
  const { bio } = req.body;
  if (!bio) {
    throw new AppError("bio is required", 400);
  }

  const result = await analyzeBioWithGemini(bio);
  await User.findByIdAndUpdate(req.user._id, {
    aiSummary: result.summarizedBio,
    personalityTraits: result.personalityTraits,
    workoutStyle: result.workoutStyle,
    bio
  });

  res.json(result);
});

export const analyzeCompatibility = asyncHandler(async (req, res) => {
  const { userAId, userBId } = req.body;
  if (!userAId || !userBId) {
    throw new AppError("userAId and userBId are required", 400);
  }

  const [userA, userB] = await Promise.all([User.findById(userAId), User.findById(userBId)]);
  if (!userA || !userB) {
    throw new AppError("Users not found", 404);
  }

  const result = await analyzeCompatibilityWithGemini(userA.bio || "", userB.bio || "");
  res.json(result);
});

export const getMatchScore = asyncHandler(async (req, res) => {
  const { userAId, userBId } = req.body;
  if (!userAId || !userBId) {
    throw new AppError("userAId and userBId are required", 400);
  }

  const [userA, userB] = await Promise.all([
    User.findById(userAId).lean(),
    User.findById(userBId).lean()
  ]);
  
  if (!userA || !userB) {
    throw new AppError("Users not found", 404);
  }

  const profileA = JSON.stringify({ bio: userA.bio, gender: userA.gender, goals: userA.fitnessGoals, interests: userA.interests });
  const profileB = JSON.stringify({ bio: userB.bio, gender: userB.gender, goals: userB.fitnessGoals, interests: userB.interests });

  const result = await calculateAiMatchScore(profileA, profileB);

  // Cache it for future fetches
  const pairIds = [String(userAId), String(userBId)].sort();
  await Match.findOneAndUpdate(
    { user1: pairIds[0], user2: pairIds[1] },
    { 
      $set: { 
        compatibilityScore: result.score, 
        compatibilityExplanation: result.reason 
      },
      $setOnInsert: {
         status: "pending",
         requestedBy: userAId // arbitrarily set to whoever pinged first if we create implicitly
      }
    },
    { upsert: true }
  );

  res.json(result);
});

export const generateIcebreakers = asyncHandler(async (req, res) => {
  const { matchId } = req.body;
  if (!matchId) {
    throw new AppError("matchId is required", 400);
  }

  const match = await Match.findById(matchId).populate("user1", "bio").populate("user2", "bio");
  if (!match) {
    throw new AppError("Match not found", 404);
  }

  const icebreakers = await generateIcebreakersWithGemini(match.user1.bio || "", match.user2.bio || "");
  res.json({ icebreakers });
});

export const workoutSuggestions = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).lean();
  const profileText = JSON.stringify({
    fitnessLevel: user.fitnessLevel,
    fitnessGoals: user.fitnessGoals,
    schedule: user.workoutSchedule,
    interests: user.interests
  });

  const plan = await generateWorkoutSuggestions(profileText);
  res.json({ plan });
});
