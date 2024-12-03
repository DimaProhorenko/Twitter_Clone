import bcrypt from "bcryptjs";

import User from "../models/user.model.js";
import { generateTokenAndSetCookie, removeCookie } from "../utils/cookie.js";

export const signup = async (req, res) => {
  const { email, password, fullName, username } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  try {
    // Check fields are valid
    if (!email || !password || !fullName || !username) {
      return res
        .status(400)
        .json({ success: false, msg: "All fields are required" });
    }
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ success: false, msg: "Email is not valid" });
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

    generateTokenAndSetCookie(user._id, res);
    await user.save();

    return res.status(200).json({
      success: true,
      user: { ...user._doc, password: null },
      msg: "Signed up successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, msg: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, msg: "All fields are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(401)
        .json({ success: false, msg: "Email or password is wrong" });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );

    if (!isPasswordCorrect) {
      return res
        .status(401)
        .json({ success: false, msg: "Email or password is wrong" });
    }

    generateTokenAndSetCookie(user._id, res);
    return res.status(200).json({
      success: true,
      user: { ...user._doc, password: undefined },
      msg: "Logged in successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status().json({ success: false, msg: "Internal server error" });
  }
};
export const logout = (req, res) => {
  try {
    removeCookie(res);
    return res
      .status(200)
      .json({ success: true, msg: "Logged out successfully" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, msg: "Internal server error" });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, msg: "Internal server error" });
  }
};
