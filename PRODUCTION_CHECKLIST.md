# Production Environment Checklist

## ✅ Security Configuration

### Backend Security
- [x] Helmet.js enabled for security headers
- [x] CORS configured with allowed origins
- [x] Rate limiting enabled (200 requests per 15 minutes in production)
- [x] JWT secret should be changed in production (minimum 32 characters)
- [x] Password hashing with bcrypt (10 rounds)
- [x] Input validation on all endpoints
- [x] SQL injection protection (Sequelize ORM)
- [x] Error messages don't expose sensitive information in production
- [x] Trust proxy configured for reverse proxy support

### Frontend Security
- [x] API requests use HTTPS in production
- [x] Token stored securely (HttpOnly cookies + localStorage)
- [x] XSS protection (Vue 3 built-in)
- [x] CSRF protection (via CORS and token validation)

## ✅ Database Configuration

- [x] Database connection pooling configured
- [x] Connection timeout settings
- [x] UTF8MB4 charset for full Unicode support
- [x] Database migrations/seed scripts available
- [x] Backup strategy recommended

## ✅ Environment Variables

Required environment variables:
```bash
# Database
DB_HOST=mysql
DB_PORT=3306
DB_NAME=dive_erp
DB_USER=root
DB_PASSWORD=<secure_password>

# JWT
JWT_SECRET=<32+ character secure random string>
JWT_EXPIRE=7d
JWT_EXPIRE_MS=604800000

# Server
NODE_ENV=production
PORT=3000

# Frontend
FRONTEND_URL=https://your-domain.com
```

## ✅ Permission System

### Roles Created
- **super_admin**: All permissions (`*:*:*`)
- **admin**: Full access to all modules
- **manager**: Read and write access to business modules
- **staff**: Read-only access to business modules

### Default Admin Accounts
- `superadmin` / `superadmin123` (Super Admin)
- `admin` / `admin123` (Admin)
- `manager1` / `manager123` (Manager)
- `staff1` / `staff123` (Staff)

**⚠️ IMPORTANT: Change default passwords in production!**

### Permission Levels
- **Read**: View data only
- **Write**: Create and edit data
- **Delete**: Delete data
- **All**: Full access (super admin only)

### Menu-Level Permissions
- Each menu item can require a specific permission
- Menus without permission requirements are visible to all authenticated users
- Menu visibility controlled by `visible` field in database

## ✅ API Endpoints

### User Management
- `GET /api/users` - List users (requires `user:read`)
- `GET /api/users/:id` - Get user details (requires `user:read`)
- `POST /api/users` - Create user (requires `user:write`)
- `PUT /api/users/:id` - Update user (requires `user:write`)
- `DELETE /api/users/:id` - Delete user (requires `user:delete`)
- `POST /api/users/:id/reset-password` - Reset password (requires `user:write`)

### Role Management
- `GET /api/roles` - List roles (requires `role:read`)
- `GET /api/roles/:id` - Get role details (requires `role:read`)
- `POST /api/roles` - Create role (requires `role:write`)
- `PUT /api/roles/:id` - Update role (requires `role:write`)
- `DELETE /api/roles/:id` - Delete role (requires `role:delete`)

### Permission Management
- `GET /api/permissions` - List permissions (requires `permission:read`)
- `GET /api/permissions/:id` - Get permission details (requires `permission:read`)
- `POST /api/permissions` - Create permission (requires `permission:write`)
- `PUT /api/permissions/:id` - Update permission (requires `permission:write`)
- `DELETE /api/permissions/:id` - Delete permission (requires `permission:delete`)

### Menu Management
- `GET /api/menus` - List all menus (requires `menu:read`)
- `GET /api/menus/user-menus` - Get user's accessible menus (no special permission)
- `GET /api/menus/:id` - Get menu details (requires `menu:read`)
- `POST /api/menus` - Create menu (requires `menu:write`)
- `PUT /api/menus/:id` - Update menu (requires `menu:write`)
- `DELETE /api/menus/:id` - Delete menu (requires `menu:delete`)

### System Monitor
- `GET /api/monitor/overview` - System overview (requires `monitor:read`)
- `GET /api/monitor/online-users` - Online users (requires `monitor:read`)
- `GET /api/monitor/login-logs` - Login logs (requires `monitor:read`)
- `GET /api/monitor/operation-logs` - Operation logs (requires `monitor:read`)
- `GET /api/monitor/system-logs` - System logs (requires `monitor:read`)

## ✅ Frontend Pages

### System Management
- `/system/users` - User Management
- `/system/roles` - Role Management
- `/system/permissions` - Permission Management
- `/system/menus` - Menu Management

### System Monitor
- `/monitor/overview` - System Overview
- `/monitor/online-users` - Online Users
- `/monitor/login-logs` - Login Logs
- `/monitor/operation-logs` - Operation Logs
- `/monitor/system-logs` - System Logs

## ✅ Production Deployment Steps

1. **Update Environment Variables**
   ```bash
   # Copy .env.example to .env
   cp .env.example .env
   
   # Update with production values
   # IMPORTANT: Change JWT_SECRET to a secure random string
   ```

2. **Initialize Permissions**
   ```bash
   npm run init-permissions
   ```

3. **Change Default Passwords**
   - Log in as superadmin
   - Change all default passwords via User Management

4. **Configure HTTPS**
   - Use reverse proxy (Nginx/Apache)
   - Enable SSL/TLS certificates

5. **Database Backup**
   - Set up regular database backups
   - Test restore procedures

6. **Monitoring**
   - Set up application monitoring (e.g., PM2, Docker logs)
   - Monitor error rates and response times

## ✅ Code Quality

- [x] All error messages in English
- [x] Input validation on all endpoints
- [x] Proper error handling
- [x] Transaction support for critical operations
- [x] Logging configured
- [x] No hardcoded credentials
- [x] Environment-based configuration

## ⚠️ Before Going to Production

1. **Change JWT_SECRET** to a secure random string (minimum 32 characters)
2. **Change default admin passwords**
3. **Update FRONTEND_URL** to production domain
4. **Configure CORS** with production domains only
5. **Enable HTTPS** for all connections
6. **Set up database backups**
7. **Review and test all permission configurations**
8. **Remove or secure development tools** (if any)
9. **Set up monitoring and alerting**
10. **Perform security audit**
