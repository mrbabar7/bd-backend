const { DonationRequest, Donor } = require("../../models/formModel");
const userModel = require("../../models/userMode");
const { sendingEmail } = require("../../email-sender/emailService");
const {
  seekerUpdateTemplate,
} = require("../../email-sender/seekerResponceEmailTemplate");
const { createNotification } = require("../notificationController");

exports.acceptRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await DonationRequest.findByIdAndUpdate(
      requestId,
      { status: "accepted" },
      { new: true },
    );

    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    const donor = await Donor.findById(request.donorId).populate("userId");
    const seeker = await userModel.findById(request.seekerId);

    if (!seeker || !donor) {
      return res
        .status(404)
        .json({ success: false, message: "Seeker or Donor record not found" });
    }

    await createNotification({
      userId: request.seekerId,
      title: "Blood Request Accepted",
      message: `Good news! Donor ${donor.fullName} has accepted your blood request. Please contact the donor.`,
      link: "/(manual)/donor-details",
      params: {
        donorId: donor._id.toString(),
        requestId: request._id.toString(),
      },
    });

    // ================= REAL-TIME SOCKET EMIT =================
    const io = req.app?.get("io") || global.io;
    if (io) {
      const socketPayload = {
        requestId: request._id.toString(),
        requestStatus: "accepted",
        status: "accepted",
        donorId: donor._id.toString(),
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

    const donorDetailsHtml = `
      <div style="background:#f1f5f9; border-radius:16px; padding:20px; text-align:left; margin-top:20px; border-left: 5px solid #059669;">
        <div style="font-weight:bold; margin-bottom:12px; color:#1e293b; font-size:16px;">DONOR CONTACT DETAILS:</div>
        <div style="margin-bottom:8px; font-size:14px;"><b>👤 Name:</b> ${donor.fullName}</div>
        <div style="margin-bottom:8px; font-size:14px;"><b>📞 Phone:</b> ${donor.mobileNumber}</div>
        <div style="margin-bottom:8px; font-size:14px;"><b>📧 Email:</b> ${donor.userId ? donor.userId.email : "N/A"}</div>
        <div style="margin-bottom:8px; font-size:14px;"><b>📍 Location:</b> ${donor.district}, ${donor.province}</div>
      </div>
    `;

    const subject = "🩸 Good News: Your Blood Request was Accepted!";
    const emailHtml = seekerUpdateTemplate
      .replace("{bgColor}", "linear-gradient(135deg, #059669 0%, #064e3b 100%)")
      .replace("{badgeColor}", "#059669")
      .replace("{statusText}", "REQUEST ACCEPTED")
      .replace("{seekerName}", seeker.name)
      .replace(
        "{mainMessage}",
        `Great news! <b>${donor.fullName}</b> has accepted your blood request. Please contact the donor as soon as possible.`,
      )
      .replace("{donorDetailsHtml}", donorDetailsHtml);

    await sendingEmail(seeker.email, subject, emailHtml);

    res.status(200).json({
      success: true,
      message: "Request accepted and seeker notified via Socket, Push & Email.",
      request,
    });
  } catch (error) {
    console.error("Accept Request Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during acceptance",
      error: error.message,
    });
  }
};
