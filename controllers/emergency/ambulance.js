const AmbulanceModel = require("../../models/ambulanceModel");

// 1. REGISTER AMBULANCE
const registerAmbulance = async (req, res) => {
  try {
    const newEntry = new AmbulanceModel({
      ...req.body,
      user: req.user.id,
    });

    await newEntry.save();
    res.status(201).json({ success: true, data: newEntry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET ALL AMBULANCES FOR LOGGED-IN USER
const getAmbulanceData = async (req, res) => {
  try {
    // Returns ALL ambulance records created by the user (newest first)
    const data = await AmbulanceModel.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    if (!data || data.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No records found" });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. GET SINGLE AMBULANCE BY ID
const getAmbulanceById = async (req, res) => {
  try {
    const ambulance = await AmbulanceModel.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!ambulance) {
      return res
        .status(404)
        .json({ success: false, message: "Ambulance not found" });
    }

    res.json({ success: true, data: ambulance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. UPDATE AMBULANCE
const updateAmbulance = async (req, res) => {
  try {
    const id = req.params.id;

    const updated = await AmbulanceModel.findOneAndUpdate(
      { _id: id, user: req.user.id },
      { $set: req.body },
      { new: true, runValidators: true },
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Record not found or unauthorized" });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. DELETE AMBULANCE
const deleteAmbulance = async (req, res) => {
  try {
    const ambulance = await AmbulanceModel.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!ambulance) {
      return res
        .status(404)
        .json({ success: false, message: "Record not found or unauthorized" });
    }

    res.json({ success: true, message: "Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerAmbulance,
  getAmbulanceData,
  getAmbulanceById,
  updateAmbulance,
  deleteAmbulance,
};
