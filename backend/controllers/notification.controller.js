import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifications = await Notification.find({ to: userId }).populate({
      path: "from",
      select: "username profileImage",
    });
    await Notification.updateMany({ to: userId }, { read: true });

    return res.status(200).json({ success: true, notifications });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      msg: "Internal server error",
      error: error.message,
    });
  }
};

export const deleteNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    await Notification.deleteMany({ to: userId });
    return res
      .status(200)
      .json({ success: true, msg: "Notifications deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      msg: "Internal server error",
      error: error.message,
    });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOne({ _id: id, to: userId });

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, msg: "Notification not found" });
    }

    await notification.deleteOne();
    return res
      .status(200)
      .json({ success: true, msg: "Notification deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      msg: "Internal server error",
      error: error.message,
    });
  }
};
