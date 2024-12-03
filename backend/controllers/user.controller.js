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
    return res
      .status(500)
      .json({ success: false, msg: "Internal server error" });
  }
};
