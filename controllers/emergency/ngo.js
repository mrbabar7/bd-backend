const NGO = require("../../models/ngoModel");
exports.registerNGO = async (req, res) => {
  try {
    const {
      name,
      orgType,
      timing,
      operatingDays,
      whatsapp,
      category,
      website,
      address,
      phone,
      formType = "ngo",
    } = req.body;

    const newNGO = new NGO({
      user: req.user.id,
      email: req.user.email,
      name,
      orgType,
      timing,
      operatingDays,
      whatsapp,
      category,
      website,
      address,
      phone,
      formType,
    });

    await newNGO.save();

    res.status(201).json({
      success: true,
      message: "NGO Registered Successfully",
      data: newNGO,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fetch all NGOs registered by the authenticated user
exports.getNGOByEmail = async (req, res) => {
  try {
    const data = await NGO.find({
      $or: [{ user: req.user.id }, { email: req.user.email }],
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a specific NGO facility owned by the user
exports.updateNGO = async (req, res) => {
  try {
    const updated = await NGO.findOneAndUpdate(
      {
        _id: req.params.id,
        $or: [{ user: req.user.id }, { email: req.user.email }],
      },
      { $set: req.body },
      { new: true, runValidators: true },
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "NGO record not found or unauthorized.",
      });
    }

    res.status(200).json({
      success: true,
      message: "NGO Profile Updated!",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a specific NGO facility owned by the user
exports.deleteNGO = async (req, res) => {
  try {
    const deletedNGO = await NGO.findOneAndDelete({
      _id: req.params.id,
      $or: [{ user: req.user.id }, { email: req.user.email }],
    });

    if (!deletedNGO) {
      return res.status(404).json({
        success: false,
        message: "NGO record not found or unauthorized.",
      });
    }

    res.status(200).json({
      success: true,
      message: "NGO record deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
