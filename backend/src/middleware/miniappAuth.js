const jwt = require("jsonwebtoken");
const { WechatBinding, User, Student } = require("../models");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key_change_in_production";

async function miniappAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ success: false, message: "No authentication token provided" });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.tokenType !== "miniapp") {
      return res.status(401).json({ success: false, message: "Invalid miniapp token" });
    }

    const binding = await WechatBinding.findByPk(decoded.bindingId, {
      include: [
        { model: User, as: "user", attributes: ["id", "username", "name", "status"] },
        { model: Student, as: "student" }
      ]
    });
    if (!binding || !binding.is_active) {
      return res.status(401).json({ success: false, message: "Binding is inactive" });
    }

    req.miniapp = {
      roleType: binding.role_type,
      bindingId: binding.id,
      user: binding.user,
      student: binding.student
    };
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Miniapp authentication failed" });
  }
}

function requireMiniappRole(...roles) {
  return (req, res, next) => {
    if (!req.miniapp || !roles.includes(req.miniapp.roleType)) {
      return res.status(403).json({ success: false, message: "Miniapp role forbidden" });
    }
    next();
  };
}

module.exports = { miniappAuth, requireMiniappRole };
