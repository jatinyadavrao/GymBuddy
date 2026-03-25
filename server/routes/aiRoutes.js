import express from "express";
import {
  analyzeBio,
  analyzeCompatibility,
  getMatchScore,
  generateIcebreakers,
  workoutSuggestions
} from "../controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/analyze-bio", protect, analyzeBio);
router.post("/compatibility", protect, analyzeCompatibility);
router.post("/match-score", protect, getMatchScore);
router.post("/icebreakers", protect, generateIcebreakers);
router.get("/workout-suggestions", protect, workoutSuggestions);

export default router;
