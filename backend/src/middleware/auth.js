const jwt = require('jsonwebtoken');
const { User, Role, Permission } = require('../models');

// 验证JWT Token
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No authentication token provided' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production');
    
    // 加载用户及其角色和权限
    const user = await User.findByPk(decoded.id, {
      include: [{
        model: Role,
        as: 'roles',
        through: { attributes: [] },
        include: [{
          model: Permission,
          as: 'permissions',
          through: { attributes: [] }
        }]
      }]
    });
    
    if (!user || user.status !== 'active') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid authentication token' 
      });
    }

    // 收集用户的所有权限代码（兼容无角色或角色无权限的种子用户）
    const permissions = new Set();
    (user.roles || []).forEach(role => {
      (role.permissions || []).forEach(permission => {
        if (permission && permission.code) permissions.add(permission.code);
      });
    });

    req.user = user;
    req.userPermissions = permissions; // 添加权限集合到request对象
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication failed' 
    });
  }
};

// 检查管理员权限（保留向后兼容）
const adminMiddleware = (req, res, next) => {
  // 检查是否有admin角色或admin权限
  const hasAdminRole = req.user.roles?.some(role => role.name === 'admin');
  const hasAdminPermission = req.userPermissions?.has('*:*:*') || req.userPermissions?.has('admin:all');
  
  if (!hasAdminRole && !hasAdminPermission && req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Insufficient permissions' 
    });
  }
  next();
};

// 检查特定权限
const requirePermission = (permissionCode) => {
  return (req, res, next) => {
    // 超级管理员拥有所有权限
    if (req.userPermissions?.has('*:*:*')) {
      return next();
    }

    // 检查是否有特定权限
    if (req.userPermissions?.has(permissionCode)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Permission denied: ${permissionCode}`
    });
  };
};

module.exports = { authMiddleware, adminMiddleware, requirePermission };
