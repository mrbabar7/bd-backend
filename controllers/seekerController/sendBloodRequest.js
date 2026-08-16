const { DonationRequest, Donor } = require("../../models/formModel");
const userModel = require("../../models/userMode");
const Address = require("../../models/addressModel");
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
    const targetUserId = donor.userId._id || donor.userId;

    await createNotification({
      userId: targetUserId,
      title: "Urgent Blood Requirement!",
      message: `${activeAddress.fullName} from ${activeAddress.city} needs ${requestedBloodType} blood.`,
      link: "/(dashboard)/request",
    });

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
