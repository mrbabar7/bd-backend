const { DonationRequest } = require("../../models/formModel");
const userModel = require("../../models/userMode");
const { sendingEmail } = require("../../email-sender/emailService");
const {
  seekerUpdateTemplate,
} = require("../../email-sender/seekerResponceEmailTemplate");
const { createNotification } = require("../notificationController");

exports.rejectRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);

    const request = await DonationRequest.findByIdAndUpdate(
      requestId,
      {
        status: "rejected",
        expireAt: expiryDate,
      },
      { new: true },
    );

    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    await createNotification({
      userId: request.seekerId,
      title: "Blood Request Rejected",
      message:
        "We are sorry, the donor has declined your blood request. Please search for another available donor.",
      link: "/(dashboard)/request", // Exact Expo Router path
    });

    // ================= REAL-TIME SOCKET EMIT =================
    const io = req.app?.get("io") || global.io;
    if (io) {
      const socketPayload = {
        requestId: request._id.toString(),
        requestStatus: "rejected",
        status: "rejected",
        donorId: request.donorId ? request.donorId.toString() : null,
        seekerId: request.seekerId.toString(),
      };

      // Broadcast to all sockets & specific rooms
      io.emit("blood_request_status_updated", socketPayload);
      // io.emit("request_status_changed", socketPayload);
      io.to(`user_${request.seekerId}`).emit(
        "blood_request_status_updated",
        socketPayload,
      );
    }

    const seeker = await userModel.findById(request.seekerId);

    if (seeker && seeker.email) {
      const subject = "Update: Your Blood Request Status";
      const emailHtml = seekerUpdateTemplate
        .replace(
          "{bgColor}",
          "linear-gradient(135deg, #64748b 0%, #334155 100%)",
        )
        .replace("{badgeColor}", "#64748b")
        .replace("{statusText}", "REQUEST DECLINED")
        .replace("{seekerName}", seeker.name)
        .replace(
          "{mainMessage}",
          "We regret to inform you that the donor is unable to fulfill your blood request at this moment. Please try requesting other available donors in your area.",
        )
        .replace("{donorDetailsHtml}", "");

      await sendingEmail(seeker.email, subject, emailHtml);
    }

    res.status(200).json({
      success: true,
      message: "Request rejected and seeker notified via Socket, Push & Email.",
    });
  } catch (error) {
    console.error("Reject Request Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during rejection",
      error: error.message,
    });
  }
};
