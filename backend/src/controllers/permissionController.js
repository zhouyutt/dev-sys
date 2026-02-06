const { Permission, Role, RolePermission, sequelize } = require('../models');
const { Op } = require('sequelize');

// 获取所有权限
exports.getAllPermissions = async (req, res) => {
  try {
    const { page = 1, pageSize = 100, search, resource, action } = req.query;
    const offset = (page - 1) * pageSize;
    
    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { code: { [Op.like]: `%${search}%` } },
        { resource: { [Op.like]: `%${search}%` } }
      ];
    }
    if (resource) where.resource = resource;
    if (action) where.action = action;

    const { count, rows: permissions } = await Permission.findAndCountAll({
      where,
      include: [{
        model: Role,
        as: 'roles',
        through: { attributes: [] }
      }],
      limit: parseInt(pageSize),
      offset: parseInt(offset),
      order: [['resource', 'ASC'], ['action', 'ASC']],
      distinct: true
    });

    res.json({
      success: true,
      data: permissions,
      pagination: {
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalPages: Math.ceil(count / pageSize)
      }
    });
  } catch (error) {
    console.error('Get permissions failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get permissions',
      error: error.message
    });
  }
};

// 获取单个权限
exports.getPermissionById = async (req, res) => {
  try {
    const permission = await Permission.findByPk(req.params.id, {
      include: [{
        model: Role,
        as: 'roles',
        through: { attributes: [] }
      }]
    });

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found'
      });
    }

    res.json({
      success: true,
      data: permission
    });
  } catch (error) {
    console.error('Get permission failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get permission',
      error: error.message
    });
  }
};

// 创建权限
exports.createPermission = async (req, res) => {
  try {
    const { name, code, resource, action, description } = req.body;

    if (!name || !code || !resource || !action) {
      return res.status(400).json({
        success: false,
        message: 'Name, code, resource and action are required'
      });
    }

    // 检查权限代码是否已存在
    const existingPermission = await Permission.findOne({ where: { code } });
    if (existingPermission) {
      return res.status(400).json({
        success: false,
        message: 'Permission code already exists'
      });
    }

    const permission = await Permission.create({
      name,
      code,
      resource,
      action,
      description
    });

    res.status(201).json({
      success: true,
      message: 'Permission created successfully',
      data: permission
    });
  } catch (error) {
    console.error('Create permission failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create permission',
      error: error.message
    });
  }
};

// 更新权限
exports.updatePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, resource, action, description } = req.body;

    const permission = await Permission.findByPk(id);
    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found'
      });
    }

    // 如果code改变，检查新code是否已存在
    if (code && code !== permission.code) {
      const existingPermission = await Permission.findOne({ where: { code } });
      if (existingPermission) {
        return res.status(400).json({
          success: false,
          message: 'Permission code already exists'
        });
      }
    }

    await permission.update({
      name,
      code,
      resource,
      action,
      description
    });

    res.json({
      success: true,
      message: 'Permission updated successfully',
      data: permission
    });
  } catch (error) {
    console.error('Update permission failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update permission',
      error: error.message
    });
  }
};

// 删除权限
exports.deletePermission = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;

    const permission = await Permission.findByPk(id);
    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found'
      });
    }

    // 检查是否有角色使用此权限
    const roleCount = await Role.count({
      include: [{
        model: Permission,
        as: 'permissions',
        where: { id },
        through: { attributes: [] }
      }]
    });

    if (roleCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete permission: ${roleCount} role(s) are using this permission`
      });
    }

    // 删除权限
    await permission.destroy({ transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Permission deleted successfully'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Delete permission failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete permission',
      error: error.message
    });
  }
};
