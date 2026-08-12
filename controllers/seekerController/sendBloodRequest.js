const { DonationRequest, Donor } = require("../../models/formModel");
const userModel = require("../../models/userMode");
const Address = require("../../models/addressModel");
const { sendingEmail } = require("../../email-sender/emailService");
const {
  requestTemplate,
} = require("../../email-sender/donorRequestEmailTemplate");
const { createNotification } = require("../notificationController");

require("dotenv").config();

const BACKEND_SERVER = process.env.BACKEND_SERVER;

exports.sendBloodRequest = async (req, res) => {
  try {
    const seekerId = req.user.id || req.user._id;
    const { donorId } = req.params;
    const { requestedBloodType } = req.body;

    // 1. Verify Seeker Primary Address
    const activeAddress = await Address.findOne({
      user: seekerId,
      isPrimary: true,
    });

    if (!activeAddress) {
      return res.status(400).json({
        success: false,
        requiresAddress: true,
        message:
          "You must save and select a primary contact address before requesting blood.",
      });
    }

    // 2. Prevent Duplicate Pending Requests
    const existing = await DonationRequest.findOne({
      seekerId,
      donorId,
      status: "pending",
    });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Already requested" });
    }

    // 3. Fetch Donor Record
    const donor = await Donor.findById(donorId).populate("userId");
    if (!donor) {
      return res
        .status(404)
        .json({ success: false, message: "Donor not found" });
    }

    // 4. Create New Donation Request
    const seekerLocationString = `${activeAddress.addressLine}, ${activeAddress.city}, ${activeAddress.province}`;

    // Set 7-day expiration date
    const expireAt = new Date();
    expireAt.setDate(expireAt.getDate() + 7);

    const newRequest = new DonationRequest({
      seekerId,
      donorId,
      requestedBloodType,
      status: "pending",
      seekerName: activeAddress.fullName,
      seekerPhone: activeAddress.phone,
      seekerLocation: {
        province: activeAddress.province,
        city: activeAddress.city,
        addressLine: activeAddress.addressLine,
      },
      expireAt,
    });

    const savedRequest = await newRequest.save();
    await createNotification({
      userId: donor.userId._id,
      title: "Urgent Blood Requirement!",
      message: `${activeAddress.fullName} from ${activeAddress.city} needs ${requestedBloodType} blood.`,
      link: "/(dashboard)/request", // Exact Expo Router path
    });

    // 6. Send Email to Donor
    if (donor.userId && donor.userId.email) {
      const baseUrl = `${BACKEND_SERVER}/api/donors/respond-email`;
      const acceptLink = `${baseUrl}/${savedRequest._id}/accept`;
      const rejectLink = `${baseUrl}/${savedRequest._id}/reject`;

      const subject = `🩸 Urgent: Blood Request from ${activeAddress.fullName}`;
      const emailHtml = requestTemplate
        .replace("{donorName}", donor.fullName)
        .replace("{seekerName}", activeAddress.fullName)
        .replace("{bloodType}", requestedBloodType)
        .replace("{location}", seekerLocationString)
        .replace("{acceptLink}", acceptLink)
        .replace("{rejectLink}", rejectLink);

      await sendingEmail(donor.userId.email, subject, emailHtml);
    }

    res.status(200).json({
      success: true,
      message: "Request sent! Donor notified via Push & Email.",
      request: savedRequest,
    });
  } catch (error) {
    console.error("Send Request Error:", error);
    res.status(500).json({
      success: false,
      message: "Request failed",
      error: error.message,
    });
  }
};
