import Post from "../models/post.model.js";
import { v2 as cloudinary } from "cloudinary";
import { getCloudinaryImageId } from "../utils/helpers.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

export const createPost = async (req, res) => {
  try {
    const { title, text, image } = req.body;
    let imageUrl = "";

    if (!title || !text) {
      return res
        .status(400)
        .json({ success: false, msg: "Title and text fields are required" });
    }

    if (image) {
      const uplodedResponse = await cloudinary.uploader.upload(image);
      imageUrl = uplodedResponse.secure_url;
    }

    const post = new Post({
      title,
      text,
      image: imageUrl,
      user: req.user._id,
    });

    if (!post) {
      return res.status(400).json({ success: false, msg: "Invalid post data" });
    }

    await post.save();

    return res.status(200).json({ success: true, post });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      msg: "Internal server error",
      error: error.message,
    });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ success: false, msg: "Post not found" });
    }

    if (req.user._id.toString() !== post.user.toString()) {
      return res.status(401).json({
        success: false,
        msg: "You are not authorized to delete this post",
      });
    }

    if (post.image) {
      await cloudinary.uploader.destroy(getCloudinaryImageId(post.image));
    }

    await post.deleteOne();

    return res
      .status(200)
      .json({ success: true, msg: "Post was deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      msg: "Interval server error",
      error: error.message,
    });
  }
};

export const commentOnPost = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const { comment } = req.body;
    const userId = req.user._id;

    if (!comment) {
      return res
        .status(400)
        .json({ success: false, msg: "Comment field is required" });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ success: false, msg: "Post not found" });
    }

    post.comments.push({ user: userId, text: comment });
    await post.save();

    return res.status(200).json({ success: true, msg: "Comment was added" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, msg: "Internal server", error: error.message });
  }
};

export const likeUnlikePost = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, msg: "Post not found" });
    }

    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });
      return res.status(200).json({ success: true, msg: "Post was unliked" });
    } else {
      post.likes.push(userId);
      await post.save();
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
      const notification = new Notification({
        from: userId,
        to: post.user,
        type: "like",
      });
      await notification.save();
      return res.status(200).json({ success: true, msg: "Post was liked" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      msg: "Internal server error",
      error: error.message,
    });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "username profileImage" })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    return res.status(200).json({ success: true, posts });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      msg: "Internal server error",
      error: error.message,
    });
  }
};

export const getLikedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    const posts = await Post.find({ _id: { $in: user.likedPosts } })
      .populate({
        path: "user",
        select: "username profileImage",
      })
      .populate({
        path: "comments.user",
        select: "username profileImage",
      });

    return res.status(200).json({ success: true, posts });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      msg: "Internal server error",
      error: error.message,
    });
  }
};
