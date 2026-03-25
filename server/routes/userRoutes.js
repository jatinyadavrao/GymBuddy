import express from "express";
import {
  getMe,
  getRecommendations,
  getUserProfile,
  registerPushToken,
  updateUser,
  updateWorkoutCalendar,
  verifyProfile
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/me", protect, getMe);
router.put(
  "/update",
  protect,
  upload.fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "gymPhotos", maxCount: 4 }
  ]),
  updateUser
);
router.get("/recommendations", protect, getRecommendations);
router.put("/workout-calendar", protect, updateWorkoutCalendar);
router.put("/verify", protect, verifyProfile);
router.put("/push-token", protect, registerPushToken);
router.get("/:id", protect, getUserProfile);

export default router;
