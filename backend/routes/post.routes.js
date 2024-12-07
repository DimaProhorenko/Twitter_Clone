import express from "express";
import { createPost, deletePost } from "../controllers/post.controller.js";
import { protectedRoute } from "../middleware/protectedRoute.js";

const router = express.Router();

router.post("/create", protectedRoute, createPost);
router.delete("/delete/:id", protectedRoute, deletePost);

export default router;
