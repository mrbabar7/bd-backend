const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");

const {
  deleteProfile,
} = require("../controllers/donorController/deleteProfile");
const {
  checkDonorProfileRegister,
} = require("../controllers/donorController/checkDonorProfileRegister");
const {
  registerAsDonor,
} = require("../controllers/donorController/registerAsDonor");
const {
  updateDonorProfile,
} = require("../controllers/donorController/updateDonorProfile");
const {
  urgentBloodRequest,
} = require("../controllers/donorController/urgentBloodRequest");
const {
  acceptRequest,
} = require("../controllers/donorController/acceptBloodRequest");
const {
  rejectRequest,
} = require("../controllers/donorController/rejectBloodRequest");
const {
  respondFromEmail,
} = require("../controllers/donorController/donorEmailResponce");
const changePassword = require("../controllers/donorController/changePassword");
const {
  getNotifications,
  markAsRead,
} = require("../controllers/notificationController");
const {
  deleteAccount,
} = require("../controllers/donor&seekerController/deleteAccount");
const {
  deleteNotification,
} = require("../controllers/donor&seekerController/deleteNotification");

router.delete("/delete-profile", protect, deleteProfile);
router.put("/change-password", protect, changePassword);
router.delete("/delete-account", protect, deleteAccount);
router.get("/status", protect, checkDonorProfileRegister);
router.post("/register", protect, registerAsDonor);
router.put("/update-profile", protect, updateDonorProfile);
router.get("/my-requests", protect, urgentBloodRequest);
router.put("/accept/:requestId", protect, acceptRequest);
router.put("/reject/:requestId", protect, rejectRequest);
router.get("/respond-email/:requestId/:action", respondFromEmail);
router.get("/notifications/get-all", protect, getNotifications);
router.delete("/notifications/:id/delete", protect, deleteNotification);
router.post("/notifications/:id/read", protect, markAsRead);

module.exports = router;
