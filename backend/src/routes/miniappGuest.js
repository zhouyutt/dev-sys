const express = require("express");
const router = express.Router();
const guestController = require("../controllers/miniappGuestController");
const { miniappAuth, requireMiniappRole } = require("../middleware/miniappAuth");

router.use(miniappAuth, requireMiniappRole("guest"));

router.get("/profile", guestController.getProfile);
router.put("/profile", guestController.updateProfile);
router.get("/trips", guestController.getTrips);
router.get("/room", guestController.getRoom);
router.get("/notifications", guestController.getNotifications);

module.exports = router;
