const userModel = require("../../models/userMode"); // Adjust path if model name is userModel or userMode
const { Donor } = require("../../models/formModel");
const bcrypt = require("bcryptjs");

// Import your existing email service and template
const { sendingEmail } = require("../../email-sender/emailService");
const {
  useTemplate,
} = require("../../email-sender/otpVerificationEmailTemplate");

/**
 * 1. GET USER PROFILE
 */
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await userModel
      .findById(userId)
      .select("-password -emailChangeOtp");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const donorProfile = await Donor.findOne({ userId });

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName || user.name,
        email: user.email,
        isDonor: !!donorProfile,
      },
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error fetching profile." });
  }
};

/**
 * 2. UPDATE PERSONAL INFO (Name, Phone)
 */
exports.updatePersonalInfo = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { fullName } = req.body;

    if (!fullName) {
      return res
        .status(400)
        .json({ success: false, message: "Full Name is required." });
    }

    const updatedUser = await userModel
      .findByIdAndUpdate(userId, { fullName, name: fullName }, { new: true })
      .select("-password -emailChangeOtp");

    // Sync in Donor document if exists
    await Donor.findOneAndUpdate({ userId }, { name: fullName });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error updating profile." });
  }
};

/**
 * 3. UPDATE PASSWORD
 */
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Both current and new passwords are required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long.",
      });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        field: "currentPassword",
        message: "Incorrect current password.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.error("Change Password Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error updating password." });
  }
};

/**
 * 4. REQUEST EMAIL CHANGE (STEP 1)
 */
exports.requestEmailChange = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { newEmail } = req.body;

    if (!newEmail) {
      return res
        .status(400)
        .json({ success: false, message: "New email address is required." });
    }

    const formattedEmail = newEmail.trim().toLowerCase();

    // Check if new email is already in use
    const existingUser = await userModel.findOne({ email: formattedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "This email address is already registered to another account.",
      });
    }

    const user = await userModel.findById(userId);
    if (user.email === formattedEmail) {
      return res.status(400).json({
        success: false,
        message: "New email cannot be identical to your current email.",
      });
    }

    // Generate 6-digit OTP (5-min expiration)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 5 * 60 * 1000);

    user.pendingEmail = formattedEmail;
    user.emailChangeOtp = otp;
    user.emailChangeOtpExpires = expires;
    await user.save();

    // Render Template & Send Email using sendingEmail
    const userName = user.fullName || user.name || "User";
    const subject = "🩸 BloodDonation – Verify Your New Email Address";
    const htmlContent = useTemplate
      .replace("{name}", userName)
      .replace("{verificationCode}", otp);

    await sendingEmail(formattedEmail, subject, htmlContent);

    return res.status(200).json({
      success: true,
      message: `A 6-digit verification code has been sent to ${formattedEmail}.`,
    });
  } catch (error) {
    console.error("Request Email Change Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error initiating email change.",
    });
  }
};

/**
 * 5. RESEND EMAIL CHANGE OTP (OPTIONAL STEP)
 */
exports.resendEmailChangeOtp = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await userModel.findById(userId);

    if (!user || !user.pendingEmail) {
      return res.status(400).json({
        success: false,
        message: "No pending email change request found.",
      });
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    user.emailChangeOtp = newOtp;
    user.emailChangeOtpExpires = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    const userName = user.fullName || user.name || "User";
    const subject = "🩸 BloodDonation – New Verification Code";
    const htmlContent = useTemplate
      .replace("{name}", userName)
      .replace("{verificationCode}", newOtp);

    await sendingEmail(user.pendingEmail, subject, htmlContent);

    return res.status(200).json({
      success: true,
      message: "A new OTP code has been sent to your new email address.",
    });
  } catch (error) {
    console.error("Resend Email Change OTP Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error resending OTP." });
  }
};

/**
 * 6. VERIFY EMAIL CHANGE OTP (STEP 2)
 */
exports.verifyEmailChange = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { otp } = req.body;

    if (!otp) {
      return res
        .status(400)
        .json({ success: false, message: "Verification OTP is required." });
    }

    const user = await userModel.findById(userId);
    if (!user || !user.pendingEmail || !user.emailChangeOtp) {
      return res.status(400).json({
        success: false,
        message: "No pending email change request found. Please request again.",
      });
    }

    if (new Date() > user.emailChangeOtpExpires) {
      user.pendingEmail = undefined;
      user.emailChangeOtp = undefined;
      user.emailChangeOtpExpires = undefined;
      await user.save();

      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new email change.",
      });
    }

    if (user.emailChangeOtp !== otp.trim()) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP code provided. Please try again.",
      });
    }

    const updatedEmail = user.pendingEmail;
    user.email = updatedEmail;
    user.pendingEmail = undefined;
    user.emailChangeOtp = undefined;
    user.emailChangeOtpExpires = undefined;
    await user.save();

    // Sync email in Donor record if present
    await Donor.findOneAndUpdate({ userId }, { email: updatedEmail });

    return res.status(200).json({
      success: true,
      message: "Email address updated successfully.",
      newEmail: updatedEmail,
    });
  } catch (error) {
    console.error("Verify Email Change Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error verifying email change.",
    });
  }
};

/**
 * 7. DELETE ACCOUNT
 */
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password verification is required to delete account.",
      });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password. Account deletion aborted.",
      });
    }

    // Cascade Delete Donor Record
    await Donor.findOneAndDelete({ userId });

    // Delete User
    await userModel.findByIdAndDelete(userId);

    return res.status(200).json({
      success: true,
      message: "Your account and donor profile have been permanently deleted.",
    });
  } catch (error) {
    console.error("Delete Account Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error deleting account." });
  }
};
