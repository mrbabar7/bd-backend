const userModel = require("../../models/userMode");

const savePushToken = async (req, res) => {
  try {
    const { token, fcmToken, userId } = req.body;

    // Accept token whether sent as 'fcmToken' or 'token' in request body
    const tokenToSave = fcmToken || token;

    if (!tokenToSave) {
      return res.status(400).json({
        success: false,
        message: "FCM token is required",
      });
    }

    // Update user's fcmToken in MongoDB
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { fcmToken: tokenToSave },
      { new: true },
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "FCM Token saved successfully",
    });
  } catch (error) {
    console.error("Error in savePushToken:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save FCM token",
    });
  }
};

module.exports = savePushToken;
