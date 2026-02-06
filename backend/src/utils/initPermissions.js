require('dotenv').config();
const { 
  User, 
  Role, 
  Permission, 
  Menu, 
  UserRole, 
  RolePermission,
  sequelize
} = require('../models');
const bcrypt = require('bcryptjs');

const initPermissions = async () => {
  try {
    console.log('Initializing permissions system...');

    // 1. 创建权限
    const permissions = [
      // 用户管理权限
      { name: 'User Read', code: 'user:read', resource: 'user', action: 'read', description: 'View users' },
      { name: 'User Write', code: 'user:write', resource: 'user', action: 'write', description: 'Create/Edit users' },
      { name: 'User Delete', code: 'user:delete', resource: 'user', action: 'delete', description: 'Delete users' },
      
      // 角色管理权限
      { name: 'Role Read', code: 'role:read', resource: 'role', action: 'read', description: 'View roles' },
      { name: 'Role Write', code: 'role:write', resource: 'role', action: 'write', description: 'Create/Edit roles' },
      { name: 'Role Delete', code: 'role:delete', resource: 'role', action: 'delete', description: 'Delete roles' },
      
      // 权限管理权限
      { name: 'Permission Read', code: 'permission:read', resource: 'permission', action: 'read', description: 'View permissions' },
      { name: 'Permission Write', code: 'permission:write', resource: 'permission', action: 'write', description: 'Create/Edit permissions' },
      { name: 'Permission Delete', code: 'permission:delete', resource: 'permission', action: 'delete', description: 'Delete permissions' },
      
      // 菜单管理权限
      { name: 'Menu Read', code: 'menu:read', resource: 'menu', action: 'read', description: 'View menus' },
      { name: 'Menu Write', code: 'menu:write', resource: 'menu', action: 'write', description: 'Create/Edit menus' },
      { name: 'Menu Delete', code: 'menu:delete', resource: 'menu', action: 'delete', description: 'Delete menus' },
      
      // 系统监控权限
      { name: 'Monitor Read', code: 'monitor:read', resource: 'monitor', action: 'read', description: 'View system monitor' },
      
      // 学生管理权限
      { name: 'Student Read', code: 'student:read', resource: 'student', action: 'read', description: 'View students' },
      { name: 'Student Write', code: 'student:write', resource: 'student', action: 'write', description: 'Create/Edit students' },
      { name: 'Student Delete', code: 'student:delete', resource: 'student', action: 'delete', description: 'Delete students' },
      
      // 房间管理权限
      { name: 'Room Read', code: 'room:read', resource: 'room', action: 'read', description: 'View rooms' },
      { name: 'Room Write', code: 'room:write', resource: 'room', action: 'write', description: 'Create/Edit rooms' },
      { name: 'Room Delete', code: 'room:delete', resource: 'room', action: 'delete', description: 'Delete rooms' },
      
      // 行程管理权限
      { name: 'Trip Read', code: 'trip:read', resource: 'trip', action: 'read', description: 'View trips' },
      { name: 'Trip Write', code: 'trip:write', resource: 'trip', action: 'write', description: 'Create/Edit trips' },
      { name: 'Trip Delete', code: 'trip:delete', resource: 'trip', action: 'delete', description: 'Delete trips' },
      
      // 员工管理权限
      { name: 'Staff Read', code: 'staff:read', resource: 'staff', action: 'read', description: 'View staff' },
      { name: 'Staff Write', code: 'staff:write', resource: 'staff', action: 'write', description: 'Create/Edit staff' },
      { name: 'Staff Delete', code: 'staff:delete', resource: 'staff', action: 'delete', description: 'Delete staff' },
      
      // 船只管理权限
      { name: 'Boat Read', code: 'boat:read', resource: 'boat', action: 'read', description: 'View boats' },
      { name: 'Boat Write', code: 'boat:write', resource: 'boat', action: 'write', description: 'Create/Edit boats' },
      { name: 'Boat Delete', code: 'boat:delete', resource: 'boat', action: 'delete', description: 'Delete boats' },
      
      // 超级管理员权限
      { name: 'All Permissions', code: '*:*:*', resource: '*', action: 'all', description: 'All permissions' }
    ];

    const createdPermissions = [];
    for (const perm of permissions) {
      const [permission, created] = await Permission.findOrCreate({
        where: { code: perm.code },
        defaults: perm
      });
      createdPermissions.push(permission);
      if (created) {
        console.log(`✓ Created permission: ${perm.code}`);
      }
    }

    // 2. 创建角色
    const roles = [
      {
        name: 'super_admin',
        name_cn: 'Super Administrator',
        description: 'Super administrator with all permissions',
        permissions: ['*:*:*']
      },
      {
        name: 'admin',
        name_cn: 'Administrator',
        description: 'Administrator with most permissions',
        permissions: [
          'user:read', 'user:write', 'user:delete',
          'role:read', 'role:write', 'role:delete',
          'permission:read', 'permission:write', 'permission:delete',
          'menu:read', 'menu:write', 'menu:delete',
          'monitor:read',
          'student:read', 'student:write', 'student:delete',
          'room:read', 'room:write', 'room:delete',
          'trip:read', 'trip:write', 'trip:delete',
          'staff:read', 'staff:write', 'staff:delete',
          'boat:read', 'boat:write', 'boat:delete'
        ]
      },
      {
        name: 'manager',
        name_cn: 'Manager',
        description: 'Manager with read and write permissions',
        permissions: [
          'student:read', 'student:write',
          'room:read', 'room:write',
          'trip:read', 'trip:write',
          'staff:read', 'staff:write',
          'boat:read', 'boat:write',
          'monitor:read'
        ]
      },
      {
        name: 'staff',
        name_cn: 'Staff',
        description: 'Staff with read-only permissions',
        permissions: [
          'student:read',
          'room:read',
          'trip:read',
          'staff:read',
          'boat:read'
        ]
      }
    ];

    const createdRoles = [];
    for (const roleData of roles) {
      const { permissions: permCodes, ...roleInfo } = roleData;
      const [role, created] = await Role.findOrCreate({
        where: { name: roleInfo.name },
        defaults: roleInfo
      });
      createdRoles.push(role);
      
      if (created) {
        console.log(`✓ Created role: ${roleInfo.name}`);
      }

      // 分配权限
      const rolePermissions = createdPermissions.filter(p => permCodes.includes(p.code));
      await role.setPermissions(rolePermissions);
      console.log(`✓ Assigned ${rolePermissions.length} permissions to role: ${roleInfo.name}`);
    }

    // 3. 创建管理员用户
    const adminUsers = [
      {
        username: 'superadmin',
        password: 'superadmin123',
        name: 'Super Administrator',
        email: 'superadmin@diveerp.com',
        role: 'admin',
        roles: ['super_admin']
      },
      {
        username: 'admin',
        password: 'admin123',
        name: 'Administrator',
        email: 'admin@diveerp.com',
        role: 'admin',
        roles: ['admin']
      },
      {
        username: 'manager1',
        password: 'manager123',
        name: 'Manager One',
        email: 'manager1@diveerp.com',
        role: 'staff',
        roles: ['manager']
      },
      {
        username: 'staff1',
        password: 'staff123',
        name: 'Staff One',
        email: 'staff1@diveerp.com',
        role: 'staff',
        roles: ['staff']
      }
    ];

    for (const userData of adminUsers) {
      const { roles: userRoles, ...userInfo } = userData;
      
      // 检查用户是否已存在
      let user = await User.findOne({ where: { username: userInfo.username } });
      
      if (!user) {
        const hashedPassword = await bcrypt.hash(userInfo.password, 10);
        user = await User.create({
          ...userInfo,
          password: hashedPassword,
          status: 'active'
        });
        console.log(`✓ Created user: ${userInfo.username}`);
      }

      // 分配角色
      const assignedRoles = createdRoles.filter(r => userRoles.includes(r.name));
      await user.setRoles(assignedRoles);
      console.log(`✓ Assigned roles to user: ${userInfo.username}`);
    }

    // 4. 创建菜单
    const menus = [
      { name: 'Home', path: '/welcome', component: 'views/welcome/index.vue', icon: 'ep:home-filled', order: 0, permission: null },
      { name: 'Student Management', path: '/students', component: 'views/students/index.vue', icon: 'ep:user', order: 1, permission: 'student:read' },
      { name: 'Room Management', path: '/rooms', component: 'views/rooms/index.vue', icon: 'ep:house', order: 2, permission: 'room:read' },
      { name: 'Trip Management', path: '/trips', component: 'views/trips/index.vue', icon: 'ep:ship', order: 3, permission: 'trip:read' },
      { name: 'Staff Management', path: '/staff', component: 'views/staff/index.vue', icon: 'ep:user-filled', order: 4, permission: 'staff:read' },
      { name: 'Boat Management', path: '/boat', component: 'views/boats/index.vue', icon: 'ep:ship', order: 5, permission: 'boat:read' },
      { name: 'Dashboard', path: '/dashboard', component: 'views/dashboard/index.vue', icon: 'ep:data-line', order: 6, permission: null },
      { name: 'System Management', path: '/system', component: null, icon: 'ep:setting', order: 100, permission: 'user:read', parent: true },
      { name: 'User Management', path: '/system/users', component: 'views/system/users/index.vue', icon: 'ep:user', order: 101, permission: 'user:read', parent_id: null },
      { name: 'Role Management', path: '/system/roles', component: 'views/system/roles/index.vue', icon: 'ep:avatar', order: 102, permission: 'role:read', parent_id: null },
      { name: 'Permission Management', path: '/system/permissions', component: 'views/system/permissions/index.vue', icon: 'ep:lock', order: 103, permission: 'permission:read', parent_id: null },
      { name: 'Menu Management', path: '/system/menus', component: 'views/system/menus/index.vue', icon: 'ep:menu', order: 104, permission: 'menu:read', parent_id: null },
      { name: 'System Monitor', path: '/monitor', component: null, icon: 'ep:monitor', order: 200, permission: 'monitor:read', parent: true },
      { name: 'System Overview', path: '/monitor/overview', component: 'views/monitor/overview/index.vue', icon: 'ep:data-line', order: 201, permission: 'monitor:read', parent_id: null },
      { name: 'Online Users', path: '/monitor/online-users', component: 'views/monitor/online-users/index.vue', icon: 'ep:user', order: 202, permission: 'monitor:read', parent_id: null },
      { name: 'Login Logs', path: '/monitor/login-logs', component: 'views/monitor/login-logs/index.vue', icon: 'ep:document', order: 203, permission: 'monitor:read', parent_id: null },
      { name: 'Operation Logs', path: '/monitor/operation-logs', component: 'views/monitor/operation-logs/index.vue', icon: 'ep:document', order: 204, permission: 'monitor:read', parent_id: null },
      { name: 'System Logs', path: '/monitor/system-logs', component: 'views/monitor/system-logs/index.vue', icon: 'ep:document', order: 205, permission: 'monitor:read', parent_id: null }
    ];

    // 先创建父菜单
    const systemMenu = await Menu.findOrCreate({
      where: { path: '/system' },
      defaults: {
        name: 'System Management',
        path: '/system',
        component: null,
        icon: 'ep:setting',
        order: 100,
        permission: 'user:read',
        visible: true
      }
    });

    const monitorMenu = await Menu.findOrCreate({
      where: { path: '/monitor' },
      defaults: {
        name: 'System Monitor',
        path: '/monitor',
        component: null,
        icon: 'ep:monitor',
        order: 200,
        permission: 'monitor:read',
        visible: true
      }
    });

    // 创建子菜单
    for (const menuData of menus) {
      if (menuData.parent) continue; // 跳过父菜单，已经创建了

      let parentId = menuData.parent_id;
      if (menuData.path?.startsWith('/system/')) {
        parentId = systemMenu[0].id;
      } else if (menuData.path?.startsWith('/monitor/')) {
        parentId = monitorMenu[0].id;
      }

      await Menu.findOrCreate({
        where: { path: menuData.path },
        defaults: {
          name: menuData.name,
          path: menuData.path,
          component: menuData.component,
          icon: menuData.icon,
          order: menuData.order,
          permission: menuData.permission,
          parent_id: parentId,
          visible: true
        }
      });
      console.log(`✓ Created menu: ${menuData.name}`);
    }

    console.log('\n=================================');
    console.log('✓ Permissions system initialized!');
    console.log('=================================');
    console.log('Default admin accounts:');
    console.log('  superadmin / superadmin123 (Super Admin)');
    console.log('  admin / admin123 (Admin)');
    console.log('  manager1 / manager123 (Manager)');
    console.log('  staff1 / staff123 (Staff)');
    console.log('=================================\n');

  } catch (error) {
    console.error('Initialize permissions failed:', error);
    throw error;
  }
};

// 执行初始化
if (require.main === module) {
  initPermissions()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}

module.exports = { initPermissions };
