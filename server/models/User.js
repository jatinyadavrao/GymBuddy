import mongoose from "mongoose";
import {
  FITNESS_GOALS,
  FITNESS_LEVELS,
  INTERESTS,
  PARTNER_TYPES,
  WORKOUT_SCHEDULES
} from "../utils/constants.js";

const workoutEntrySchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    completed: { type: Boolean, default: false },
    note: { type: String, trim: true }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    age: { type: Number, min: 16, max: 80 },
    gender: { type: String, trim: true },
    bio: { type: String, maxlength: 500, default: "" },
    profilePicture: { type: String, default: "" },
    gymPhotos: [{ type: String }],
    location: {
      city: { type: String, trim: true },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    },
    gymLocation: { type: String, trim: true },
    fitnessLevel: { type: String, enum: FITNESS_LEVELS },
    fitnessGoals: [{ type: String, enum: FITNESS_GOALS }],
    workoutSchedule: [{ type: String, enum: WORKOUT_SCHEDULES }],
    interests: [{ type: String, enum: INTERESTS }],
    preferredPartner: { type: String, enum: PARTNER_TYPES, default: "any" },
    matches: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    aiSummary: { type: String, default: "" },
    personalityTraits: [{ type: String }],
    workoutStyle: { type: String, default: "" },
    profileVerified: { type: Boolean, default: false },
    streakCount: { type: Number, default: 0 },
    lastWorkoutAt: { type: Date },
    workoutCalendar: [workoutEntrySchema],
    pushToken: { type: String, default: "" }
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

userSchema.index({ "location.coordinates": "2dsphere" });
userSchema.index({ gymLocation: 1, fitnessLevel: 1 });

const User = mongoose.model("User", userSchema);
export default User;
