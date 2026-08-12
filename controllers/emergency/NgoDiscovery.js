const ngoModel = require("../../models/ngoModel");

const getNgo = async (req, res) => {
  try {
    const ngos = await ngoModel.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: ngos.length,
      data: ngos,
    });
  } catch (err) {
    console.error("Error fetching NGOs:", err);
    res.status(500).json({
      success: false,
      message: "Server Error: Unable to fetch NGO directory data.",
      error: err.message,
    });
  }
};

module.exports = { getNgo };
