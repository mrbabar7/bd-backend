const Notification = require("../models/notificationModel");
const userModel = require("../models/userMode"); // Ensure correct model path
const {
  emitToUser,
  sendPushNotification,
} = require("../services/socketService");

exports.createNotification = async ({
  userId,
  title = "Blood Donation",
  message,
  link = "",
  params = {},
  data = {},
}) => {
  try {
    // 1. Normalize link and params
    const targetLink = link || data.link || data.url || "";
    const targetParams =
      Object.keys(params).length > 0 ? params : data.params || {};

    // 2. Save Notification to Database (In-App Inbox)
    const notification = new Notification({
      userId,
      message,
      link: targetLink,
      data: { ...data, params: targetParams },
      isRead: false,
    });
    const savedNotif = await notification.save();

    // 3. Emit Real-time Socket Event to Active Users
    emitToUser(userId, "new_notification_received", savedNotif);

    // 4. Fetch user's FCM Token
    const targetUser = await userModel
      .findById(userId)
      .select("fcmToken pushToken");

    // Prefer fcmToken, fallback to pushToken
    const tokenToSend = targetUser?.fcmToken || targetUser?.pushToken;

    if (tokenToSend) {
      // Build clean payload for Expo Router dynamic deep linking
      const pushPayload = {
        ...data,
        link: targetLink,
        url: targetLink,
        params: targetParams,
        notificationId: savedNotif._id.toString(),
      };

      await sendPushNotification(tokenToSend, title, message, pushPayload);
    }

    return savedNotif;
  } catch (err) {
    console.error("Error creating notification:", err);
  }
};

// API Endpoint: Get user notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(30);
    res.json({ success: true, notifications });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch notifications" });
  }
};

// API Endpoint: Mark single notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notif = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true },
    );
    res.json({ success: true, notification: notif });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to mark as read" });
  }
};
