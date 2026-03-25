import bcrypt from "bcrypt";
import User from "../models/User.js";
import { analyzeBioWithGemini } from "../services/geminiService.js";
import { generateToken } from "../utils/token.js";
import { AppError, asyncHandler } from "../utils/error.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, bio = "" } = req.body;

  if (!name || !email || !password) {
    throw new AppError("Name, email and password are required", 400);
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("Email already registered", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  let aiProfile = { summarizedBio: "", personalityTraits: [], workoutStyle: "" };

  if (bio?.trim()) {
    try {
      aiProfile = await analyzeBioWithGemini(bio);
    } catch {
      aiProfile = { summarizedBio: bio.slice(0, 150), personalityTraits: [], workoutStyle: "" };
    }
  }

  const user = await User.create({
    ...req.body,
    email,
    name,
    password: hashedPassword,
    aiSummary: aiProfile.summarizedBio,
    personalityTraits: aiProfile.personalityTraits,
    workoutStyle: aiProfile.workoutStyle
  });

  res.status(201).json({
    token: generateToken(user._id),
    user
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new AppError("Invalid email or password", 401);
  }

  user.password = undefined;

  res.json({
    token: generateToken(user._id),
    user
  });
});
