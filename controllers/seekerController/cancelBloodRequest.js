const { DonationRequest, Donor } = require("../../models/formModel");
const userModel = require("../../models/userMode");
const { createNotification } = require("../notificationController");

exports.cancelRequest = async (req, res) => {
  try {
    const { donorId } = req.params;
    const seekerId = req.user.id || req.user._id;

    const deletedRequest = await DonationRequest.findOneAndDelete({
      donorId,
      seekerId,
      status: "pending",
    });

    if (!deletedRequest) {
      return res
        .status(404)
        .json({ success: false, message: "No pending request found" });
    }

    const seeker = await userModel.findById(seekerId);
    const donor = await Donor.findById(donorId).populate("userId");

    if (donor && donor.userId) {
      await createNotification({
        userId: donor.userId._id,
        title: "Blood Request Cancelled",
        message: `${seeker ? seeker.name : "A seeker"} cancelled their blood request.`,
        link: "/(dashboard)/donor",
      });
    }

    res.status(200).json({
      success: true,
      message: "Request cancelled successfully and donor notified.",
    });
  } catch (error) {
    console.error("Cancel Request Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel request",
      error: error.message,
    });
  }
};
