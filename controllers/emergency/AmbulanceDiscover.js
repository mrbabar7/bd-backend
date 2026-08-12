const Ambulance = require("../../models/ambulanceModel");

const getAmbulances = async (req, res) => {
  try {
    const ambulances = await Ambulance.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: ambulances.length,
      data: ambulances,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};

module.exports = { getAmbulances };
