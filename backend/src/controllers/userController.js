const { User, Role, UserRole, Permission, sequelize } = require('../models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

// 获取所有用户
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, search, status, role_id } = req.query;
    const offset = (page - 1) * pageSize;
    
    const where = {};
    if (search) {
      where[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }
    if (status) where.status = status;

    const include = [{
      model: Role,
      as: 'roles',
      through: { attributes: [] },
      ...(role_id ? { where: { id: role_id } } : {})
    }];

    const { count, rows: users } = await User.findAndCountAll({
      where,
      include,
      limit: parseInt(pageSize),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      distinct: true
    });

    res.json({
      success: true,
      data: users,
      pagination: {
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalPages: Math.ceil(count / pageSize)
      }
    });
  } catch (error) {
    console.error('Get users failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: error.message
    });
  }
};

// 获取单个用户
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
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

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user',
      error: error.message
    });
  }
};

// 创建用户
exports.createUser = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { username, password, name, email, phone, role_ids = [], status = 'active' } = req.body;

    // 验证
    if (!username || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Username, password and name are required'
      });
    }

    // 检查用户名是否已存在
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await User.create({
      username,
      password: hashedPassword,
      name,
      email,
      phone,
      status,
      role: 'staff' // 保留legacy字段
    }, { transaction });

    // 分配角色
    if (role_ids.length > 0) {
      await UserRole.bulkCreate(
        role_ids.map(role_id => ({ user_id: user.id, role_id })),
        { transaction }
      );
    }

    await transaction.commit();

    // 重新加载用户数据（包含角色）
    const userWithRoles = await User.findByPk(user.id, {
      include: [{
        model: Role,
        as: 'roles',
        through: { attributes: [] }
      }]
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userWithRoles
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Create user failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message
    });
  }
};

// 更新用户
exports.updateUser = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { username, password, name, email, phone, role_ids, status } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // 更新基本信息
    const updateData = {};
    if (username) updateData.username = username;
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (status) updateData.status = status;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await user.update(updateData, { transaction });

    // 更新角色
    if (role_ids !== undefined) {
      // 删除旧的角色关联
      await UserRole.destroy({
        where: { user_id: id },
        transaction
      });

      // 添加新的角色关联
      if (role_ids.length > 0) {
        await UserRole.bulkCreate(
          role_ids.map(role_id => ({ user_id: id, role_id })),
          { transaction }
        );
      }
    }

    await transaction.commit();

    // 重新加载用户数据
    const userWithRoles = await User.findByPk(id, {
      include: [{
        model: Role,
        as: 'roles',
        through: { attributes: [] }
      }]
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: userWithRoles
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Update user failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
};

// 删除用户
exports.deleteUser = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // 不能删除自己
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete yourself'
      });
    }

    // 删除角色关联
    await UserRole.destroy({
      where: { user_id: id },
      transaction
    });

    // 删除用户
    await user.destroy({ transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Delete user failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
};

// 重置用户密码
exports.resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_password } = req.body;

    if (!new_password) {
      return res.status(400).json({
        success: false,
        message: 'New password is required'
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await user.update({ password: hashedPassword });

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: error.message
    });
  }
};
