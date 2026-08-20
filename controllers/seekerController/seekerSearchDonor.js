

const { Donor, DonationRequest } = require("../../models/formModel");

exports.searchDonors = async (req, res) => {
  try {
    const currentUserId = req.user.id || req.user._id;
    const {
      bloodType,
      district,
      city,
      province,
      page = 1,
      limit = 10,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const today = new Date();

    // 1. Build Clean Search Query
    let query = {
      userId: { $ne: currentUserId },
    };

    if (bloodType && bloodType.trim()) {
      query.bloodType = bloodType.trim();
    }

    const cityOrDistrict = (district || city || "").trim();
    if (cityOrDistrict) {
      // Escape special characters for safer regex matching
      const safeCity = cityOrDistrict.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [
        { district: new RegExp(`^${safeCity}$`, "i") },
        { city: new RegExp(`^${safeCity}$`, "i") },
      ];
    }

    if (province && province.trim()) {
      const safeProvince = province
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.province = new RegExp(`^${safeProvince}$`, "i");
    }

    console.log("🔍 DB Search Query Raw:", query);
    console.log(
      `📄 Pagination: Page=${pageNum}, Limit=${limitNum}, Skip=${skip}`,
    );

    // 2. Count Total Matching Donors
    const totalDonors = await Donor.countDocuments(query);
    const totalPages = Math.ceil(totalDonors / limitNum) || 1;
    const hasMore = skip + limitNum < totalDonors; // Precise check for remaining records

    console.log(
      `📊 DB Match Results: Total Donors=${totalDonors}, Total Pages=${totalPages}, HasMore=${hasMore}`,
    );

    if (totalDonors === 0) {
      return res.status(200).json({
        success: true,
        donors: [],
        pagination: {
          currentPage: pageNum,
          totalPages: 1,
          totalDonors: 0,
          hasMore: false,
        },
      });
    }

    // 3. Fetch Paginated Slice
    const donors = await Donor.find(query)
      .populate("userId", "isOnline lastSeen profilePicture")
      .skip(skip)
      .limit(limitNum)
      .lean();

    // 4. Batch Fetch Donation Requests
    const donorIds = donors.map((d) => d._id);
    const existingRequests = await DonationRequest.find({
      seekerId: currentUserId,
      donorId: { $in: donorIds },
    })
      .sort({ createdAt: -1 })
      .lean();

    const requestMap = new Map();
    existingRequests.forEach((reqItem) => {
      if (!requestMap.has(reqItem.donorId.toString())) {
        requestMap.set(reqItem.donorId.toString(), reqItem);
      }
    });

    // 5. Process Availability
    const donorsWithStatus = donors.map((donor) => {
      const request = requestMap.get(donor._id.toString()) || null;

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
        ...donor,
        isOnline: donor.userId ? donor.userId.isOnline : false,
        lastSeen: donor.userId ? donor.userId.lastSeen : null,
        isAvailable: finalAvailability,
        daysRemaining,
        requestStatus: request ? request.status : null,
        requestId: request ? request._id : null,
        mobileNumber:
          request && request.status === "accepted" ? donor.mobileNumber : null,
      };
    });

    // 6. Sort Online & Available Donors First
    donorsWithStatus.sort((a, b) => {
      if (a.isOnline === b.isOnline) {
        return b.isAvailable - a.isAvailable;
      }
      return b.isOnline - a.isOnline;
    });

    res.status(200).json({
      success: true,
      donors: donorsWithStatus,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalDonors,
        hasMore,
      },
    });
  } catch (error) {
    console.error("❌ Controller Search Error:", error);
    res.status(500).json({
      success: false,
      message: "Search failed",
      error: error.message,
    });
  }
};
