const { Menu, Role, Permission, User } = require('../models');
const { Op } = require('sequelize');

// 获取所有菜单（树形结构）
exports.getAllMenus = async (req, res) => {
  try {
    const { role_id } = req.query;

    // 获取所有菜单
    const menus = await Menu.findAll({
      order: [['order', 'ASC'], ['id', 'ASC']]
    });

    // 如果有role_id，过滤出该角色有权限的菜单
    let accessibleMenus = menus;
    if (role_id) {
      const role = await Role.findByPk(role_id, {
        include: [{
          model: Permission,
          as: 'permissions',
          through: { attributes: [] }
        }]
      });

      if (role) {
        const permissionCodes = role.permissions.map(p => p.code);
        accessibleMenus = menus.filter(menu => {
          // 如果菜单没有权限要求，或者角色有对应权限
          return !menu.permission || permissionCodes.includes(menu.permission);
        });
      }
    }

    // 构建树形结构
    const buildTree = (parentId = null) => {
      return accessibleMenus
        .filter(menu => menu.parent_id === parentId)
        .map(menu => ({
          ...menu.toJSON(),
          children: buildTree(menu.id)
        }));
    };

    const menuTree = buildTree();

    res.json({
      success: true,
      data: menuTree
    });
  } catch (error) {
    console.error('Get menus failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get menus',
      error: error.message
    });
  }
};

// 获取单个菜单
exports.getMenuById = async (req, res) => {
  try {
    const menu = await Menu.findByPk(req.params.id, {
      include: [{
        model: Menu,
        as: 'parent'
      }, {
        model: Menu,
        as: 'children'
      }]
    });

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found'
      });
    }

    res.json({
      success: true,
      data: menu
    });
  } catch (error) {
    console.error('Get menu failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get menu',
      error: error.message
    });
  }
};

// 创建菜单
exports.createMenu = async (req, res) => {
  try {
    const { parent_id, name, path, component, icon, order, visible, permission, meta } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Menu name is required'
      });
    }

    // 如果指定了parent_id，验证父菜单存在
    if (parent_id) {
      const parentMenu = await Menu.findByPk(parent_id);
      if (!parentMenu) {
        return res.status(400).json({
          success: false,
          message: 'Parent menu not found'
        });
      }
    }

    const menu = await Menu.create({
      parent_id: parent_id || null,
      name,
      path,
      component,
      icon,
      order: order || 0,
      visible: visible !== undefined ? visible : true,
      permission,
      meta
    });

    res.status(201).json({
      success: true,
      message: 'Menu created successfully',
      data: menu
    });
  } catch (error) {
    console.error('Create menu failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create menu',
      error: error.message
    });
  }
};

// 更新菜单
exports.updateMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const { parent_id, name, path, component, icon, order, visible, permission, meta } = req.body;

    const menu = await Menu.findByPk(id);
    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found'
      });
    }

    // 不能将自己设为父菜单
    if (parent_id && parseInt(parent_id) === parseInt(id)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot set itself as parent'
      });
    }

    // 如果指定了parent_id，验证父菜单存在
    if (parent_id) {
      const parentMenu = await Menu.findByPk(parent_id);
      if (!parentMenu) {
        return res.status(400).json({
          success: false,
          message: 'Parent menu not found'
        });
      }
    }

    await menu.update({
      parent_id: parent_id !== undefined ? (parent_id || null) : menu.parent_id,
      name,
      path,
      component,
      icon,
      order,
      visible,
      permission,
      meta
    });

    res.json({
      success: true,
      message: 'Menu updated successfully',
      data: menu
    });
  } catch (error) {
    console.error('Update menu failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update menu',
      error: error.message
    });
  }
};

// 删除菜单
exports.deleteMenu = async (req, res) => {
  try {
    const { id } = req.params;

    const menu = await Menu.findByPk(id);
    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found'
      });
    }

    // 检查是否有子菜单
    const childrenCount = await Menu.count({ where: { parent_id: id } });
    if (childrenCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete menu: ${childrenCount} sub-menu(s) exist`
      });
    }

    await menu.destroy();

    res.json({
      success: true,
      message: 'Menu deleted successfully'
    });
  } catch (error) {
    console.error('Delete menu failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete menu',
      error: error.message
    });
  }
};

// 获取用户可访问的菜单（根据用户角色）
exports.getUserMenus = async (req, res) => {
  try {
    const userId = req.user.id;

    // 获取用户的所有角色和权限
    const user = await User.findByPk(userId, {
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

    // 收集所有权限代码
    const permissionCodes = new Set();
    user.roles.forEach(role => {
      role.permissions.forEach(permission => {
        permissionCodes.add(permission.code);
      });
    });

    // 获取所有菜单
    const allMenus = await Menu.findAll({
      where: { visible: true },
      order: [['order', 'ASC'], ['id', 'ASC']]
    });

    // 过滤出用户有权限的菜单
    const accessibleMenus = allMenus.filter(menu => {
      // 如果菜单没有权限要求，或者用户有对应权限
      return !menu.permission || permissionCodes.has(menu.permission);
    });

    // 构建树形结构，只返回前端需要的字段
    const buildTree = (parentId = null) => {
      return accessibleMenus
        .filter(menu => menu.parent_id === parentId)
        .map(menu => {
          const menuData = menu.toJSON();
          // 只返回前端需要的字段，排除数据库字段（id, parent_id等）
          const cleanMenu = {
            name: menuData.name,
            path: menuData.path,
            component: menuData.component,
            icon: menuData.icon,
            order: menuData.order,
            visible: menuData.visible,
            permission: menuData.permission,
            children: buildTree(menu.id)
          };
          // 如果children为空数组，不返回children字段
          if (cleanMenu.children.length === 0) {
            delete cleanMenu.children;
          }
          return cleanMenu;
        });
    };

    const menuTree = buildTree();

    res.json({
      success: true,
      data: menuTree
    });
  } catch (error) {
    console.error('Get user menus failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user menus',
      error: error.message
    });
  }
};
