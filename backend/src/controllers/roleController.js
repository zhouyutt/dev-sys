const { Role, Permission, RolePermission, User, sequelize } = require('../models');
const { Op } = require('sequelize');

// 获取所有角色
exports.getAllRoles = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, search, status } = req.query;
    const offset = (page - 1) * pageSize;
    
    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { name_cn: { [Op.like]: `%${search}%` } }
      ];
    }
    if (status) where.status = status;

    const { count, rows: roles } = await Role.findAndCountAll({
      where,
      include: [{
        model: Permission,
        as: 'permissions',
        through: { attributes: [] }
      }],
      limit: parseInt(pageSize),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      distinct: true
    });

    res.json({
      success: true,
      data: roles,
      pagination: {
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalPages: Math.ceil(count / pageSize)
      }
    });
  } catch (error) {
    console.error('Get roles failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get roles',
      error: error.message
    });
  }
};

// 获取单个角色
exports.getRoleById = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id, {
      include: [{
        model: Permission,
        as: 'permissions',
        through: { attributes: [] }
      }]
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    res.json({
      success: true,
      data: role
    });
  } catch (error) {
    console.error('Get role failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get role',
      error: error.message
    });
  }
};

// 创建角色
exports.createRole = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { name, name_cn, description, status = 'active', permission_ids = [] } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Role name is required'
      });
    }

    // 检查角色名是否已存在
    const existingRole = await Role.findOne({ where: { name } });
    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: 'Role name already exists'
      });
    }

    const role = await Role.create({
      name,
      name_cn,
      description,
      status
    }, { transaction });

    // 分配权限
    if (permission_ids.length > 0) {
      await RolePermission.bulkCreate(
        permission_ids.map(permission_id => ({ role_id: role.id, permission_id })),
        { transaction }
      );
    }

    await transaction.commit();

    // 重新加载角色数据（包含权限）
    const roleWithPermissions = await Role.findByPk(role.id, {
      include: [{
        model: Permission,
        as: 'permissions',
        through: { attributes: [] }
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: roleWithPermissions
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Create role failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create role',
      error: error.message
    });
  }
};

// 更新角色
exports.updateRole = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { name, name_cn, description, status, permission_ids } = req.body;

    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    // 更新基本信息
    const updateData = {};
    if (name) updateData.name = name;
    if (name_cn !== undefined) updateData.name_cn = name_cn;
    if (description !== undefined) updateData.description = description;
    if (status) updateData.status = status;

    await role.update(updateData, { transaction });

    // 更新权限
    if (permission_ids !== undefined) {
      // 删除旧的权限关联
      await RolePermission.destroy({
        where: { role_id: id },
        transaction
      });

      // 添加新的权限关联
      if (permission_ids.length > 0) {
        await RolePermission.bulkCreate(
          permission_ids.map(permission_id => ({ role_id: id, permission_id })),
          { transaction }
        );
      }
    }

    await transaction.commit();

    // 重新加载角色数据
    const roleWithPermissions = await Role.findByPk(id, {
      include: [{
        model: Permission,
        as: 'permissions',
        through: { attributes: [] }
      }]
    });

    res.json({
      success: true,
      message: 'Role updated successfully',
      data: roleWithPermissions
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Update role failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update role',
      error: error.message
    });
  }
};

// 删除角色
exports.deleteRole = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;

    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    // 检查是否有用户使用此角色
    const userCount = await User.count({
      include: [{
        model: Role,
        as: 'roles',
        where: { id },
        through: { attributes: [] }
      }]
    });

    if (userCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete role: ${userCount} user(s) are using this role`
      });
    }

    // 删除权限关联
    await RolePermission.destroy({
      where: { role_id: id },
      transaction
    });

    // 删除角色
    await role.destroy({ transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Delete role failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete role',
      error: error.message
    });
  }
};
