// const { Donor, DonationRequest } = require("../../models/formModel");

// exports.searchDonors = async (req, res) => {
//   try {
//     const currentUserId = req.user.id || req.user._id;
//     const { bloodType, district, province } = req.query;
//     const today = new Date();

//     let query = {
//       userId: { $ne: currentUserId },
//     };

//     if (bloodType) query.bloodType = bloodType;
//     if (district) query.district = district;
//     if (province) query.province = province;

//     // Fetch donors and populate online status from User model
//     const donors = await Donor.find(query).populate(
//       "userId",
//       "isOnline lastSeen profilePicture",
//     );

//     const donorsWithStatus = await Promise.all(
//       donors.map(async (donor) => {
//         const request = await DonationRequest.findOne({
//           seekerId: currentUserId,
//           donorId: donor._id,
//         }).sort({ createdAt: -1 });

//         let finalAvailability = donor.isAvailable;
//         let daysRemaining = 0;

//         if (donor.nextAvailableDate) {
//           const nextDate = new Date(donor.nextAvailableDate);
//           if (nextDate > today) {
//             finalAvailability = false;
//             const diffTime = nextDate - today;
//             daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//           }
//         }

//         return {
//           ...donor.toObject(),
//           isOnline: donor.userId ? donor.userId.isOnline : false,
//           lastSeen: donor.userId ? donor.userId.lastSeen : null,
//           isAvailable: finalAvailability,
//           daysRemaining,
//           requestStatus: request ? request.status : null,
//           requestId: request ? request._id : null,
//           mobileNumber:
//             request && request.status === "accepted"
//               ? donor.mobileNumber
//               : null,
//         };
//       }),
//     );

//     // Sort: Online donors first, then available donors
//     donorsWithStatus.sort((a, b) => {
//       if (a.isOnline === b.isOnline) {
//         return b.isAvailable - a.isAvailable;
//       }
//       return b.isOnline - a.isOnline;
//     });

//     res
//       .status(200)
//       .json({
//         success: true,
//         count: donorsWithStatus.length,
//         donors: donorsWithStatus,
//       });
//   } catch (error) {
//     console.error("Search Error:", error);
//     res
//       .status(500)
//       .json({ success: false, message: "Search failed", error: error.message });
//   }
// };

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
      limit = 15,
    } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 15;
    const skip = (pageNum - 1) * limitNum;

    const today = new Date();

    // 1. Build Search Query (Insensitive Case + Field Alias Support)
    let query = {
      userId: { $ne: currentUserId },
    };

    if (bloodType) {
      query.bloodType = bloodType.trim();
    }

    const cityOrDistrict = district || city;
    if (cityOrDistrict) {
      const cityRegex = new RegExp(`^${cityOrDistrict.trim()}$`, "i");
      query.$or = [{ district: cityRegex }, { city: cityRegex }];
    }

    if (province) {
      query.province = new RegExp(`^${province.trim()}$`, "i");
    }

    console.log("🔍 DB Search Query Constructed:", JSON.stringify(query));
    console.log(
      `📄 Pagination: Page=${pageNum}, Limit=${limitNum}, Skip=${skip}`,
    );

    // 2. Count Total Matching Donors for Pagination Metadata
    const totalDonors = await Donor.countDocuments(query);
    const totalPages = Math.ceil(totalDonors / limitNum) || 1;

    console.log(
      `📊 DB Match Results: Total Donors=${totalDonors}, Total Pages=${totalPages}`,
    );

    // 3. Fetch Paginated Slice of Donors
    const donors = await Donor.find(query)
      .populate("userId", "isOnline lastSeen profilePicture")
      .skip(skip)
      .limit(limitNum)
      .lean();

    if (donors.length === 0) {
      console.log(`⚠️ No donors found for page ${pageNum}.`);
      return res.status(200).json({
        success: true,
        donors: [],
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalDonors, // Retain total count instead of resetting to 0
          hasMore: pageNum < totalPages,
        },
      });
    }

    // 4. Batch Fetch Donation Requests for Current Page Donors
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

    // 5. Process Availability & Mask Mobile Numbers
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

    // 6. Sort Current Page: Online Donors First, then Available Donors
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
        hasMore: pageNum < totalPages,
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
