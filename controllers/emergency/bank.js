const BloodBankModel = require("../../models/bankModel");
const registerBank = async (req, res) => {
  try {
    const {
      name,
      orgType,
      timing,
      phone,
      whatsapp,
      category,
      operatingDays,
      website,
      address,
      formType = "bloodbank",
    } = req.body;

    const newEntry = new BloodBankModel({
      user: req.user.id,
      name,
      orgType,
      timing,
      phone,
      whatsapp,
      category,
      operatingDays,
      website,
      address,
      formType,
    });

    await newEntry.save();
    res.status(201).json({ success: true, data: newEntry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fetch all blood bank facilities registered by the authenticated user
const getBankByEmail = async (req, res) => {
  try {
    const type = req.query.type || "bloodbank";

    const data = await BloodBankModel.find({
      user: req.user.id,
      formType: type,
    }).sort({ createdAt: -1 });

    res.json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a specific blood bank facility owned by the user
const updateBank = async (req, res) => {
  try {
    const updated = await BloodBankModel.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: req.body },
      { new: true, runValidators: true },
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Blood bank record not found or unauthorized.",
      });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a specific blood bank facility owned by the user
const deleteBank = async (req, res) => {
  try {
    const deleted = await BloodBankModel.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Blood bank record not found or unauthorized.",
      });
    }

    res.json({ success: true, message: "Blood bank deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { registerBank, getBankByEmail, updateBank, deleteBank };
