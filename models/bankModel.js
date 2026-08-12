const mongoose = require("mongoose");

const BloodBankSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    formType: { type: String, default: "bloodbank" },
    name: { type: String, required: true },
    orgType: { type: String, required: true },
    timing: { type: String, required: true },
    phone: { type: String, default: "" },
    whatsapp: { type: String },
    category: { type: [String], required: true },
    operatingDays: { type: [String] },
    website: { type: String, default: "" },
    address: { type: String, required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("BloodBank", BloodBankSchema);
