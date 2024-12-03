import bcrypt from "bcryptjs";

import User from "../models/user.model.js";

export const signup = async (req, res) => {
  const { email, password, fullName, username } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Check fields are valid
  if (!email || !password || !fullName || !username) {
    return res
      .status(400)
      .json({ success: false, msg: "All fields are required" });
  }
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, msg: "Email is not valid" });
  }

  // Check for duplicate username
  const userNameExists = await User.findOne({ username });
  if (userNameExists) {
    return res
      .status(409)
      .json({ success: false, msg: "Username is already taken" });
  }

  // Check for duplicate email
  const emailExists = await User.findOne({ email });
  if (emailExists) {
    return res
      .status(409)
      .json({ success: false, msg: "Email is already in use" });
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await new User({
    email,
    password: hashedPassword,
    username,
    fullName,
  });

  if (!user) {
    return res.status(400).json({ success: false, msg: "Invalid user data" });
  }

  await user.save();

  return res.status(200).json({
    success: true,
    user: { ...user._doc, password: null },
    msg: "Signed up successfully",
  });
};
export const login = (req, res) => {};
export const logout = (req, res) => {};
