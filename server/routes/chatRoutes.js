import express from "express";
import { getChatByMatch, sendMessage } from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:matchId", protect, getChatByMatch);
router.post("/message", protect, sendMessage);

export default router;
