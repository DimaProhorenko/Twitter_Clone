import User from "../models/user.model.js";

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
    if (id === req.user._id) {
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

      return res
        .status(200)
        .json({ success: true, msg: "Successfully followed the user" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};
