import express from "express";
import { acceptMatch, getMatches, rejectMatch } from "../controllers/matchController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getMatches);
router.post("/:matchId/accept", protect, acceptMatch);
router.post("/:matchId/reject", protect, rejectMatch);

export default router;
