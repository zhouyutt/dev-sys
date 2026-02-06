require('dotenv').config();
const bcrypt = require('bcryptjs');
const { User, Role, Permission, Menu, UserRole, RolePermission, sequelize } = require('../models');

const initRBAC = async () => {
  try {
    console.log('\n🚀 Starting RBAC Initialization...\n');

    // 1. Create Roles
    console.log('📝 Creating roles...');
    const roles = await Role.bulkCreate([
      {
        name: 'super_admin',
        name_cn: '超级管理员',
        description: 'Super Administrator with all permissions',
        status: 'active',
        is_system: true
      },
      {
        name: 'admin',
        name_cn: '管理员',
        description: 'Administrator with most permissions',
        status: 'active',
        is_system: true
      },
      {
        name: 'manager',
        name_cn: '经理',
        description: 'Manager with read/write permissions',
        status: 'active',
        is_system: false
      },
      {
        name: 'staff',
        name_cn: '员工',
        description: 'Staff with limited permissions',
        status: 'active',
        is_system: false
      },
      {
        name: 'readonly',
        name_cn: '只读用户',
        description: 'Read-only user',
        status: 'active',
        is_system: false
      }
    ]);
    console.log(`✅ Created ${roles.length} roles`);

    // 2. Create Permissions
    console.log('\n📝 Creating permissions...');
    const permissionsData = [
      // User Management
      { name: 'user:read', display_name: 'View Users', module: 'user', action: 'read', description: 'View user list and details' },
      { name: 'user:create', display_name: 'Create User', module: 'user', action: 'create', description: 'Create new users' },
      { name: 'user:update', display_name: 'Update User', module: 'user', action: 'update', description: 'Update user information' },
      { name: 'user:delete', display_name: 'Delete User', module: 'user', action: 'delete', description: 'Delete users' },
      
      // Role Management
      { name: 'role:read', display_name: 'View Roles', module: 'role', action: 'read', description: 'View role list and details' },
      { name: 'role:create', display_name: 'Create Role', module: 'role', action: 'create', description: 'Create new roles' },
      { name: 'role:update', display_name: 'Update Role', module: 'role', action: 'update', description: 'Update role information' },
      { name: 'role:delete', display_name: 'Delete Role', module: 'role', action: 'delete', description: 'Delete roles' },
      
      // Permission Management
      { name: 'permission:read', display_name: 'View Permissions', module: 'permission', action: 'read', description: 'View permission list' },
      { name: 'permission:update', display_name: 'Update Permissions', module: 'permission', action: 'update', description: 'Update permission assignments' },
      
      // Menu Management
      { name: 'menu:read', display_name: 'View Menus', module: 'menu', action: 'read', description: 'View menu configuration' },
      { name: 'menu:update', display_name: 'Update Menus', module: 'menu', action: 'update', description: 'Update menu configuration' },
      
      // Student Management
      { name: 'student:read', display_name: 'View Students', module: 'student', action: 'read', description: 'View student list and details' },
      { name: 'student:create', display_name: 'Create Student', module: 'student', action: 'create', description: 'Create new students' },
      { name: 'student:update', display_name: 'Update Student', module: 'student', action: 'update', description: 'Update student information' },
      { name: 'student:delete', display_name: 'Delete Student', module: 'student', action: 'delete', description: 'Delete students' },
      
      // Room Management
      { name: 'room:read', display_name: 'View Rooms', module: 'room', action: 'read', description: 'View room list and status' },
      { name: 'room:create', display_name: 'Create Room', module: 'room', action: 'create', description: 'Create new rooms' },
      { name: 'room:update', display_name: 'Update Room', module: 'room', action: 'update', description: 'Update room information' },
      { name: 'room:delete', display_name: 'Delete Room', module: 'room', action: 'delete', description: 'Delete rooms' },
      
      // Trip Management
      { name: 'trip:read', display_name: 'View Trips', module: 'trip', action: 'read', description: 'View trip list and details' },
      { name: 'trip:create', display_name: 'Create Trip', module: 'trip', action: 'create', description: 'Create new trips' },
      { name: 'trip:update', display_name: 'Update Trip', module: 'trip', action: 'update', description: 'Update trip information' },
      { name: 'trip:delete', display_name: 'Delete Trip', module: 'trip', action: 'delete', description: 'Delete trips' },
      
      // Staff Management
      { name: 'staff:read', display_name: 'View Staff', module: 'staff', action: 'read', description: 'View staff list and details' },
      { name: 'staff:create', display_name: 'Create Staff', module: 'staff', action: 'create', description: 'Create new staff' },
      { name: 'staff:update', display_name: 'Update Staff', module: 'staff', action: 'update', description: 'Update staff information' },
      { name: 'staff:delete', display_name: 'Delete Staff', module: 'staff', action: 'delete', description: 'Delete staff' },
      
      // Boat Management
      { name: 'boat:read', display_name: 'View Boats', module: 'boat', action: 'read', description: 'View boat list and details' },
      { name: 'boat:create', display_name: 'Create Boat', module: 'boat', action: 'create', description: 'Create new boats' },
      { name: 'boat:update', display_name: 'Update Boat', module: 'boat', action: 'update', description: 'Update boat information' },
      { name: 'boat:delete', display_name: 'Delete Boat', module: 'boat', action: 'delete', description: 'Delete boats' },
      
      // Dashboard
      { name: 'dashboard:read', display_name: 'View Dashboard', module: 'dashboard', action: 'read', description: 'View dashboard' },
      
      // System Monitoring
      { name: 'monitor:read', display_name: 'View System Monitor', module: 'monitor', action: 'read', description: 'View system monitoring data' }
    ];
    
    const permissions = await Permission.bulkCreate(permissionsData);
    console.log(`✅ Created ${permissions.length} permissions`);

    // 3. Assign permissions to roles
    console.log('\n📝 Assigning permissions to roles...');
    
    const superAdminRole = roles.find(r => r.name === 'super_admin');
    const adminRole = roles.find(r => r.name === 'admin');
    const managerRole = roles.find(r => r.name === 'manager');
    const staffRole = roles.find(r => r.name === 'staff');
    const readonlyRole = roles.find(r => r.name === 'readonly');
    
    // Super Admin: All permissions
    await superAdminRole.setPermissions(permissions);
    
    // Admin: All except user/role/permission management
    const adminPermissions = permissions.filter(p => 
      !['user:delete', 'role:delete', 'permission:update'].includes(p.name)
    );
    await adminRole.setPermissions(adminPermissions);
    
    // Manager: Read/Write for business modules
    const managerPermissions = permissions.filter(p => 
      ['student', 'room', 'trip', 'staff', 'boat', 'dashboard'].includes(p.module)
    );
    await managerRole.setPermissions(managerPermissions);
    
    // Staff: Read/Write for basic modules
    const staffPermissions = permissions.filter(p => 
      (['student', 'room', 'trip', 'dashboard'].includes(p.module)) &&
      p.action !== 'delete'
    );
    await staffRole.setPermissions(staffPermissions);
    
    // Readonly: Only read permissions
    const readonlyPermissions = permissions.filter(p => p.action === 'read');
    await readonlyRole.setPermissions(readonlyPermissions);
    
    console.log('✅ Permissions assigned to roles');

    // 4. Create admin users
    console.log('\n📝 Creating admin users...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const users = await User.bulkCreate([
      {
        username: 'superadmin',
        password: hashedPassword,
        name: 'Super Administrator',
        email: 'superadmin@diveerp.com',
        role: 'super_admin',
        status: 'active'
      },
      {
        username: 'admin',
        password: hashedPassword,
        name: 'System Administrator',
        email: 'admin@diveerp.com',
        role: 'admin',
        status: 'active'
      },
      {
        username: 'manager',
        password: hashedPassword,
        name: 'Manager User',
        email: 'manager@diveerp.com',
        role: 'manager',
        status: 'active'
      },
      {
        username: 'staff',
        password: hashedPassword,
        name: 'Staff User',
        email: 'staff@diveerp.com',
        role: 'staff',
        status: 'active'
      },
      {
        username: 'readonly',
        password: hashedPassword,
        name: 'Readonly User',
        email: 'readonly@diveerp.com',
        role: 'readonly',
        status: 'active'
      }
    ]);
    console.log(`✅ Created ${users.length} users`);

    // 5. Assign roles to users
    console.log('\n📝 Assigning roles to users...');
    await UserRole.bulkCreate([
      { user_id: users[0].id, role_id: superAdminRole.id },
      { user_id: users[1].id, role_id: adminRole.id },
      { user_id: users[2].id, role_id: managerRole.id },
      { user_id: users[3].id, role_id: staffRole.id },
      { user_id: users[4].id, role_id: readonlyRole.id }
    ]);
    console.log('✅ Roles assigned to users');

    // 6. Create menu structure
    console.log('\n📝 Creating menu structure...');
    const menus = await Menu.bulkCreate([
      // Home
      { id: 1, name: 'Home', path: '/', icon: 'ep:home-filled', parent_id: null, sort_order: 0, permission_name: 'dashboard:read' },
      
      // Student Management
      { id: 2, name: 'Student Management', path: '/students', icon: 'ep:user', parent_id: null, sort_order: 1, permission_name: 'student:read' },
      
      // Room Management
      { id: 3, name: 'Room Management', path: '/rooms', icon: 'ep:house', parent_id: null, sort_order: 2, permission_name: 'room:read' },
      
      // Trip Management
      { id: 4, name: 'Trip Management', path: '/trips', icon: 'ep:ship', parent_id: null, sort_order: 3, permission_name: 'trip:read' },
      
      // Staff Management
      { id: 5, name: 'Staff Management', path: '/staff', icon: 'ep:user-filled', parent_id: null, sort_order: 4, permission_name: 'staff:read' },
      
      // Boat Management
      { id: 6, name: 'Boat Management', path: '/boat', icon: 'ep:ship', parent_id: null, sort_order: 5, permission_name: 'boat:read' },
      
      // Dashboard
      { id: 7, name: 'Dashboard', path: '/dashboard', icon: 'ep:data-line', parent_id: null, sort_order: 6, permission_name: 'dashboard:read' },
      
      // System Management
      { id: 10, name: 'System Management', path: '/system', icon: 'ep:setting', parent_id: null, sort_order: 10, permission_name: null },
      { id: 11, name: 'User Management', path: '/system/users', icon: 'ep:user', parent_id: 10, sort_order: 1, permission_name: 'user:read' },
      { id: 12, name: 'Role Management', path: '/system/roles', icon: 'ep:avatar', parent_id: 10, sort_order: 2, permission_name: 'role:read' },
      { id: 13, name: 'Permission Management', path: '/system/permissions', icon: 'ep:key', parent_id: 10, sort_order: 3, permission_name: 'permission:read' },
      { id: 14, name: 'Menu Management', path: '/system/menus', icon: 'ep:menu', parent_id: 10, sort_order: 4, permission_name: 'menu:read' },
      
      // System Monitoring
      { id: 20, name: 'System Monitoring', path: '/monitor', icon: 'ep:monitor', parent_id: null, sort_order: 20, permission_name: 'monitor:read' },
      
      // Enrollment QR Code
      { id: 30, name: 'Enrollment QR Code', path: '/enrollment-qrcode', icon: 'ep:picture', parent_id: null, sort_order: 30, permission_name: 'student:read' }
    ]);
    console.log(`✅ Created ${menus.length} menu items`);

    console.log('\n✅ RBAC Initialization completed!\n');
    console.log('📋 Created users (all with password "admin123"):');
    console.log('   - superadmin (Super Administrator)');
    console.log('   - admin (Administrator)');
    console.log('   - manager (Manager)');
    console.log('   - staff (Staff)');
    console.log('   - readonly (Read-only User)\n');

  } catch (error) {
    console.error('❌ RBAC Initialization failed:', error);
    throw error;
  }
};

// Run if executed directly
if (require.main === module) {
  initRBAC()
    .then(() => {
      console.log('✅ Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

module.exports = initRBAC;
