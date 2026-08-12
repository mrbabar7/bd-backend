const { Donor, DonationRequest } = require("../../models/formModel");

exports.searchDonors = async (req, res) => {
  try {
    const currentUserId = req.user.id || req.user._id;
    const { bloodType, district, province } = req.query;
    const today = new Date();

    let query = {
      userId: { $ne: currentUserId },
    };

    if (bloodType) query.bloodType = bloodType;
    if (district) query.district = district;
    if (province) query.province = province;

    // Fetch donors and populate online status from User model
    const donors = await Donor.find(query).populate(
      "userId",
      "isOnline lastSeen profilePicture",
    );

    const donorsWithStatus = await Promise.all(
      donors.map(async (donor) => {
        const request = await DonationRequest.findOne({
          seekerId: currentUserId,
          donorId: donor._id,
        }).sort({ createdAt: -1 });

        let finalAvailability = donor.isAvailable;
        let daysRemaining = 0;

        if (donor.nextAvailableDate) {
          const nextDate = new Date(donor.nextAvailableDate);
          if (nextDate > today) {
            finalAvailability = false;
            const diffTime = nextDate - today;
            daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          }
        }

        return {
          ...donor.toObject(),
          isOnline: donor.userId ? donor.userId.isOnline : false,
          lastSeen: donor.userId ? donor.userId.lastSeen : null,
          isAvailable: finalAvailability,
          daysRemaining,
          requestStatus: request ? request.status : null,
          requestId: request ? request._id : null,
          mobileNumber:
            request && request.status === "accepted"
              ? donor.mobileNumber
              : null,
        };
      }),
    );

    // Sort: Online donors first, then available donors
    donorsWithStatus.sort((a, b) => {
      if (a.isOnline === b.isOnline) {
        return b.isAvailable - a.isAvailable;
      }
      return b.isOnline - a.isOnline;
    });

    res
      .status(200)
      .json({
        success: true,
        count: donorsWithStatus.length,
        donors: donorsWithStatus,
      });
  } catch (error) {
    console.error("Search Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Search failed", error: error.message });
  }
};
