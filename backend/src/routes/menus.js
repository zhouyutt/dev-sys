const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { authMiddleware, requirePermission } = require('../middleware/auth');

// 所有路由都需要认证
router.use(authMiddleware);

// 获取用户可访问的菜单（不需要特殊权限，所有登录用户都可以）
router.get('/user-menus', menuController.getUserMenus);

// 获取所有菜单（需要menu:read权限）
router.get('/', requirePermission('menu:read'), menuController.getAllMenus);

// 获取单个菜单
router.get('/:id', requirePermission('menu:read'), menuController.getMenuById);

// 创建菜单（需要menu:write权限）
router.post('/', requirePermission('menu:write'), menuController.createMenu);

// 更新菜单（需要menu:write权限）
router.put('/:id', requirePermission('menu:write'), menuController.updateMenu);

// 删除菜单（需要menu:delete权限）
router.delete('/:id', requirePermission('menu:delete'), menuController.deleteMenu);

module.exports = router;
