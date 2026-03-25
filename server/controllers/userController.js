import Match from "../models/Match.js";
import User from "../models/User.js";
import { uploadImageBuffer } from "../services/cloudinaryService.js";
import { calculateAiMatchScore } from "../services/geminiService.js";
import { recommendationCache } from "../utils/cache.js";
import { AppError, asyncHandler } from "../utils/error.js";

const parseArray = (input) => {
  if (Array.isArray(input)) return input;
  if (typeof input === "string") {
    return input
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return undefined;
};

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("matches", "name age profilePicture gymLocation");
  res.json(user);
});

export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select("-password -email -pushToken -workoutCalendar -matches -likes -dislikes -preferredPartner")
    .lean();
  
  if (!user) {
    throw new AppError("User not found", 404);
  }
  
  res.json(user);
});

export const updateUser = asyncHandler(async (req, res) => {
  const updates = { ...req.body };

  ["fitnessGoals", "workoutSchedule", "interests"].forEach((key) => {
    const value = parseArray(updates[key]);
    if (value) updates[key] = value;
  });

  if (updates.longitude && updates.latitude) {
    updates.location = {
      ...(req.user.location?.toObject?.() || {}),
      coordinates: [Number(updates.longitude), Number(updates.latitude)],
      city: updates.city || req.user.location?.city || ""
    };
  }

  console.log("FILES RECEIVED IN UPDATE:", req.files);
  
  try {
    if (req.files?.profilePicture?.[0]) {
      console.log("Uploading Profile Picture...");
      updates.profilePicture = await uploadImageBuffer(req.files.profilePicture[0].buffer, "gymbuddy/profile");
      console.log("Profile Picture Uploaded:", updates.profilePicture);
    }
  } catch (cloudinaryErr) {
    console.error("Cloudinary Profile Upload Err:", cloudinaryErr);
    throw new AppError("Failed to upload profile picture to Cloudinary", 500);
  }

  if (req.files?.gymPhotos?.length) {
    const urls = await Promise.all(
      req.files.gymPhotos.map((file) => uploadImageBuffer(file.buffer, "gymbuddy/gym-photos"))
    );
    updates.gymPhotos = [...(req.user.gymPhotos || []), ...urls].slice(0, 6);
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  recommendationCache.del(String(req.user._id));
  res.json(user);
});

export const getRecommendations = asyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.user._id).lean();
  const page = Number(req.query.page || 1);
  const limit = Math.min(Number(req.query.limit || 20), 50);
  const skip = (page - 1) * limit;
  const searchGym = req.query.searchGym || "";
  const maxDistanceKm = Number(req.query.maxDistanceKm || 0);

  const cacheKey = `${req.user._id}-${page}-${limit}-${searchGym}-${maxDistanceKm}`;
  const cached = recommendationCache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const excludedIds = [
    currentUser._id,
    ...(currentUser.likes || []),
    ...(currentUser.dislikes || []),
    ...(currentUser.matches || [])
  ];

  const query = {
    _id: { $nin: excludedIds },
    profileVerified: { $in: [true, false] }
  };

  if (searchGym) {
    query.gymLocation = { $regex: searchGym, $options: "i" };
  }

  if (currentUser.preferredPartner && currentUser.preferredPartner !== "any") {
    query.gender = currentUser.preferredPartner;
  }

  if (maxDistanceKm > 0 && currentUser.location?.coordinates?.[0] && currentUser.location?.coordinates?.[1]) {
    query["location.coordinates"] = {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: currentUser.location.coordinates
        },
        $maxDistance: maxDistanceKm * 1000
      }
    };
  }

  const candidates = await User.find(query)
    .select("name age bio profilePicture gymLocation fitnessGoals workoutSchedule interests fitnessLevel location gender")
    .lean();

  const currentUserProfile = JSON.stringify({ bio: currentUser.bio, gender: currentUser.gender, goals: currentUser.fitnessGoals, interests: currentUser.interests });

  const scoredPromises = candidates.map(async (candidate) => {
    // Check if the score is cached in a Match object first to save API calls
    const pairIds = [String(currentUser._id), String(candidate._id)].sort();
    let cachedScore = null;
    let cachedReason = null;
    
    // In a real production app we'd query Matches in bulk, but for this scale individual is acceptable
    const existingMatch = await Match.findOne({ user1: pairIds[0], user2: pairIds[1] }).select("compatibilityScore compatibilityExplanation");
    
    if (existingMatch && existingMatch.compatibilityScore) {
      cachedScore = existingMatch.compatibilityScore;
      cachedReason = existingMatch.compatibilityExplanation;
    }

    return { ...candidate, compatibilityScore: cachedScore, compatibilityReasons: cachedReason ? [cachedReason] : [] };
  });

  const scored = await Promise.all(scoredPromises);
  
  scored.sort((a, b) => (b.compatibilityScore || 0) - (a.compatibilityScore || 0));

  const paginated = scored.slice(skip, skip + limit);
  const payload = {
    page,
    limit,
    total: scored.length,
    data: paginated
  };

  recommendationCache.set(cacheKey, payload);
  res.json(payload);
});

export const updateWorkoutCalendar = asyncHandler(async (req, res) => {
  const { date, completed, note } = req.body;
  if (!date) {
    throw new AppError("date is required", 400);
  }

  const user = await User.findById(req.user._id);
  const day = new Date(date).toDateString();
  const existingIndex = user.workoutCalendar.findIndex((entry) => new Date(entry.date).toDateString() === day);

  if (existingIndex >= 0) {
    user.workoutCalendar[existingIndex].completed = Boolean(completed);
    user.workoutCalendar[existingIndex].note = note || "";
  } else {
    user.workoutCalendar.push({ date, completed: Boolean(completed), note });
  }

  if (completed) {
    const now = new Date(date);
    const last = user.lastWorkoutAt ? new Date(user.lastWorkoutAt) : null;
    if (!last || now.toDateString() !== last.toDateString()) {
      const oneDay = 1000 * 60 * 60 * 24;
      if (last && Math.round((now - last) / oneDay) === 1) {
        user.streakCount += 1;
      } else if (!last) {
        user.streakCount = 1;
      } else {
        user.streakCount = 1;
      }
      user.lastWorkoutAt = now;
    }
  }

  await user.save();
  res.json(user);
});

export const verifyProfile = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user._id, { profileVerified: true }, { new: true });
  res.json({ message: "Profile verified", user });
});

export const registerPushToken = asyncHandler(async (req, res) => {
  const { pushToken } = req.body;
  if (!pushToken) {
    throw new AppError("pushToken is required", 400);
  }

  const user = await User.findByIdAndUpdate(req.user._id, { pushToken }, { new: true });
  res.json({ message: "Push token registered", user });
});
