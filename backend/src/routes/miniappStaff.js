const express = require("express");
const router = express.Router();
const staffController = require("../controllers/miniappStaffController");
const { miniappAuth, requireMiniappRole } = require("../middleware/miniappAuth");

router.use(miniappAuth, requireMiniappRole("staff", "owner"));

router.get("/today-board", staffController.getTodayBoard);
router.put("/guest-status", staffController.updateGuestStatus);
router.put("/room-checkin", staffController.updateRoomCheckIn);
router.put("/trip-signin", staffController.updateTripSignIn);

module.exports = router;
