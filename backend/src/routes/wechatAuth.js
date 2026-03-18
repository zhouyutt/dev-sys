const express = require("express");
const router = express.Router();
const wechatAuthController = require("../controllers/wechatAuthController");

router.post("/code2session", wechatAuthController.code2session);
router.post("/bind-login", wechatAuthController.bindLogin);
router.post("/refresh-token", wechatAuthController.refreshMiniappToken);

module.exports = router;
