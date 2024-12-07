import { v2 as cloudinary } from "cloudinary";

import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import { hashPassword, validatePassword } from "../utils/password.js";
import { getCloudinaryImageId } from "../utils/helpers.js";

export const getUserProfile = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findByUsername(username).withoutPassword();
    if (!user) {
      return res
        .status(404)
        .json({ success: false, msg: "User was not found" });
    }
    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};

export const followUnfollowUser = async (req, res) => {
  const { id } = req.params;

  try {
    if (id === req.user._id.toString()) {
      return res
        .status(400)
        .json({ success: false, msg: "You can't follow yourself" });
    }
    const currentUser = await User.findById(req.user._id);
    const userToFollow = await User.findById(id);

    if (!currentUser || !userToFollow) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      // Unfollow logic
      currentUser.following = currentUser.following.filter(
        (followId) => followId.toString() !== id
      );
      userToFollow.followers = userToFollow.followers.filter(
        (followerId) => followerId.toString() !== req.user._id.toString()
      );

      await currentUser.save();
      await userToFollow.save();

      return res
        .status(200)
        .json({ success: true, msg: "Successfully unfollowed the user" });
    } else {
      currentUser.following.push(id);
      userToFollow.followers.push(req.user._id);

      await currentUser.save();
      await userToFollow.save();

      const notification = new Notification({
        type: "follow",
        from: currentUser._id,
        to: userToFollow._id,
      });

      await notification.save();

      return res
        .status(200)
        .json({ success: true, msg: "Successfully followed the user" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id).select("following");

    if (!currentUser) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    const suggestedUsers = await User.aggregate([
      {
        $match: {
          _id: { $nin: [...currentUser.following, currentUser._id] },
        },
      },
      {
        $sample: { size: 5 },
      },
      {
        $project: {
          _id: 1,
          username: 1,
          fullName: 1,
          profileImage: 1,
        },
      },
    ]);

    return res.status(200).json({ suggestedUsers });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: "Internal Server Error",
      error: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  const { fullName, username, email, currentPassword, newPassword, bio } =
    req.body;
  let { profileImage, coverImage } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    if (
      (!currentPassword && newPassword) ||
      (!newPassword && currentPassword)
    ) {
      return res.status(400).json({
        success: false,
        msg: "To change password provide both the current and new passwords",
      });
    }

    if (currentPassword && newPassword) {
      const { isValid, msg } = await validatePassword(
        currentPassword,
        user.password
      );

      if (!isValid) {
        return res.status(400).json({ success: false, msg });
      }

      user.password = await hashPassword(newPassword);
    }

    if (profileImage) {
      if (user.profileImage) {
        await cloudinary.uploader.destroy(
          getCloudinaryImageId(user.profileImage)
        );
      }
      const uploadedResponse = await cloudinary.uploader.upload(profileImage);
      user.profileImage = uploadedResponse.secure_url;
    }

    if (coverImage) {
      if (user.coverImage) {
        await cloudinary.uploader.destroy(
          getCloudinaryImageId(user.coverImage)
        );
      }
      const uploadedResponse = await cloudinary.uploader.upload(coverImage);
      user.coverImage = uploadedResponse.secure_url;
    }

    user.fullName = fullName || user.fullName;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.email = email || user.email;

    await user.save();

    return res.status(200).json({
      success: true,
      msg: "User was updated",
      user: { ...user._doc, password: null },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      msg: "Internal server error",
      error: error.message,
    });
  }
};
