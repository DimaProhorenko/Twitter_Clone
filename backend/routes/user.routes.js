import express from "express";
import {
  followUnfollowUser,
  getSuggestedUsers,
  getUserProfile,
} from "../controllers/user.controller.js";
import { protectedRoute } from "../middleware/protectedRoute.js";

const router = express.Router();

router.get("/profile/:username", protectedRoute, getUserProfile);
router.get("/follow/:id", protectedRoute, followUnfollowUser);
router.get("/get-suggested-users", protectedRoute, getSuggestedUsers);

export default router;
