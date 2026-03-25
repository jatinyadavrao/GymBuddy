import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
  {
    user1: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    user2: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
    chatId: { type: String, required: true },
    compatibilityScore: { type: Number },
    compatibilityExplanation: { type: String, default: "" },
    suggestedWorkout: { type: String, default: "" }
  },
  { timestamps: true }
);

matchSchema.index({ user1: 1, user2: 1 }, { unique: true });

const Match = mongoose.model("Match", matchSchema);
export default Match;
