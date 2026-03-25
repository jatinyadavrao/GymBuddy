import express from "express";
import { dislikeUser, likeUser } from "../controllers/swipeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/like", protect, likeUser);
router.post("/dislike", protect, dislikeUser);

export default router;
