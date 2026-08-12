const { Donor } = require("../../models/formModel");

exports.registerAsDonor = async (req, res) => {
  try {
    const userIdFromToken = req.user.id || req.user._id;
    const existingDonor = await Donor.findOne({ userId: userIdFromToken });

    if (existingDonor) {
      return res
        .status(400)
        .json({ success: false, message: "Already registered as a donor!" });
    }

    const newDonor = new Donor({ ...req.body, userId: userIdFromToken });
    await newDonor.save();

    res
      .status(201)
      .json({
        success: true,
        message: "Donor profile created successfully",
        donor: newDonor,
      });
  } catch (error) {
    console.error("Register Donor Error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error registering donor",
        error: error.message,
      });
  }
};
