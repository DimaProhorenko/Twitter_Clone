import express from "express";
import {
  commentOnPost,
  createPost,
  deletePost,
  likeUnlikePost,
} from "../controllers/post.controller.js";
import { protectedRoute } from "../middleware/protectedRoute.js";

const router = express.Router();

router.post("/create", protectedRoute, createPost);
router.post("/comment/:id", protectedRoute, commentOnPost);
router.post("/like/:id", protectedRoute, likeUnlikePost);
router.delete("/delete/:id", protectedRoute, deletePost);

export default router;
