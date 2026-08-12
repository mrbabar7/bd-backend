// models/userModel.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: false },
    googleId: { type: String, unique: true, sparse: true },
    profilePicture: { type: String, default: "" },
    otp: { type: String },
    otpExpires: { type: Date },
    isVerified: { type: Boolean, default: false },
    token: { type: String, default: null },
    pushToken: { type: String, default: null },
    fcmToken: { type: String, default: null },
    isOnline: { type: Boolean, default: false }, // Syncs with Socket.io connections
    lastSeen: { type: Date, default: Date.now },
    pendingEmail: { type: String, default: null },
    emailChangeOtp: { type: String, default: null },
    emailChangeOtpExpires: { type: Date, default: null },
  },
  { timestamps: true },
);

const userModel = mongoose.model("User", userSchema);
module.exports = userModel;
