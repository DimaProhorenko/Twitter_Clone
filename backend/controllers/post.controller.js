import Post from "../models/post.model.js";

export const createPost = async (req, res) => {
  try {
    const { title, text, image } = req.body;

    if (!title || !text) {
      return res
        .status(400)
        .json({ success: false, msg: "Title and text fields are required" });
    }

    const post = await new Post({
      title,
      text,
      image,
      user: req.user._id,
    });

    if (!post) {
      return res.status(400).json({ success: false, msg: "Invalid post data" });
    }

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
