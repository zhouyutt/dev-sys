const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { User, Student, WechatBinding } = require("../models");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key_change_in_production";
const MINIAPP_EXPIRE = process.env.MINIAPP_JWT_EXPIRE || "7d";

async function getWechatSession(code) {
  const appId = process.env.WECHAT_APPID;
  const appSecret = process.env.WECHAT_SECRET;

  // Local fallback for dev or pre-integration.
  if (!appId || !appSecret) {
    return {
      openid: `mock_${crypto.createHash("md5").update(code).digest("hex")}`,
      unionid: null
    };
  }

  const query = new URLSearchParams({
    appid: appId,
    secret: appSecret,
    js_code: code,
    grant_type: "authorization_code"
  }).toString();

  const resp = await fetch(`https://api.weixin.qq.com/sns/jscode2session?${query}`);
  const data = await resp.json();
  if (!data.openid) {
    throw new Error(data.errmsg || "Failed to exchange wechat code");
  }
  return { openid: data.openid, unionid: data.unionid || null };
}

async function verifyErpUser(username, password) {
  const user = await User.findOne({ where: { username, status: "active" } });
  if (!user) return null;
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null;
  return user;
}

function buildMiniappToken(binding) {
  return jwt.sign(
    {
      tokenType: "miniapp",
      bindingId: binding.id,
      roleType: binding.role_type,
      userId: binding.user_id || null,
      studentId: binding.student_id || null
    },
    JWT_SECRET,
    { expiresIn: MINIAPP_EXPIRE }
  );
}

exports.code2session = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: "code is required" });
    }
    const session = await getWechatSession(code);
    res.json({ success: true, data: session });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.bindLogin = async (req, res) => {
  try {
    const { code, roleType, username, password, profileId, nickname, avatarUrl } = req.body;
    if (!code || !roleType || !username || !password) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    if (!["guest", "staff", "owner"].includes(roleType)) {
      return res.status(400).json({ success: false, message: "Invalid roleType" });
    }

    const session = await getWechatSession(code);
    const user = await verifyErpUser(username, password);
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid ERP account" });
    }

    if (roleType === "owner" && user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Only admin can bind owner role" });
    }
    if (roleType === "staff" && !["admin", "staff"].includes(user.role)) {
      return res.status(403).json({ success: false, message: "Only staff/admin can bind staff role" });
    }

    let student = null;
    if (roleType === "guest") {
      if (!profileId) {
        return res.status(400).json({ success: false, message: "Guest requires profileId" });
      }
      student = await Student.findByPk(profileId);
      if (!student) {
        return res.status(404).json({ success: false, message: "Guest profile not found" });
      }
    }

    let binding = await WechatBinding.findOne({ where: { openid: session.openid } });
    if (binding) {
      await binding.update({
        role_type: roleType,
        user_id: user.id,
        student_id: student ? student.id : null,
        unionid: session.unionid,
        nickname: nickname || binding.nickname,
        avatar_url: avatarUrl || binding.avatar_url,
        is_active: true
      });
    } else {
      binding = await WechatBinding.create({
        openid: session.openid,
        unionid: session.unionid,
        role_type: roleType,
        user_id: user.id,
        student_id: student ? student.id : null,
        nickname: nickname || null,
        avatar_url: avatarUrl || null,
        is_active: true
      });
    }

    const token = buildMiniappToken(binding);
    const refreshToken = jwt.sign(
      { tokenType: "miniapp-refresh", bindingId: binding.id },
      JWT_SECRET,
      { expiresIn: "14d" }
    );

    res.json({
      success: true,
      data: {
        token,
        refreshToken,
        roleType: binding.role_type,
        bindId: binding.id,
        profile: roleType === "guest" && student
          ? {
              id: student.id,
              guest_id: student.guest_id,
              name_en: student.name_en,
              name_cn: student.name_cn
            }
          : {
              id: user.id,
              username: user.username,
              name: user.name
            }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Bind login failed" });
  }
};

exports.refreshMiniappToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: "refreshToken is required" });
    }
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    if (decoded.tokenType !== "miniapp-refresh") {
      return res.status(401).json({ success: false, message: "Invalid refresh token type" });
    }

    const binding = await WechatBinding.findByPk(decoded.bindingId);
    if (!binding || !binding.is_active) {
      return res.status(401).json({ success: false, message: "Binding inactive" });
    }

    const token = buildMiniappToken(binding);
    res.json({ success: true, data: { token } });
  } catch (error) {
    res.status(401).json({ success: false, message: "Refresh token invalid or expired" });
  }
};
