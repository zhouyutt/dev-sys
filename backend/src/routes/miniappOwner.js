const express = require("express");
const router = express.Router();
const ownerController = require("../controllers/miniappOwnerController");
const { miniappAuth, requireMiniappRole } = require("../middleware/miniappAuth");

router.use(miniappAuth, requireMiniappRole("owner"));
router.get("/dashboard", ownerController.getDashboard);

module.exports = router;
