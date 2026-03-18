# Dive ERP MiniApp Technical Solution v1

## 1. Architecture

- **Client**: WeChat Mini Program built with Taro + Vue3 + TypeScript
- **Backend**: Existing Node.js + Express service
- **DB**: Existing MySQL (Sequelize)
- **Auth**: JWT reuse + WeChat code exchange + ERP account binding

## 2. Repository Layout

- `backend/`: existing API service, extended with miniapp endpoints
- `pure-admin-tpl/`: existing web admin frontend
- `miniapp/`: new WeChat Mini Program client
- `docs/miniapp/`: project docs and test plan

## 3. Backend Changes

### 3.1 New data model

- `wechat_bindings`
  - `id`
  - `openid` (unique)
  - `unionid` (nullable)
  - `user_id` (nullable, staff/owner binding)
  - `student_id` (nullable, guest binding)
  - `role_type` (`guest`, `staff`, `owner`)
  - `nickname`, `avatar_url`
  - `is_active`

### 3.2 New API groups

- `/api/wechat/auth/*`
  - code exchange
  - account bind
  - token refresh
- `/api/miniapp/guest/*`
- `/api/miniapp/staff/*`
- `/api/miniapp/owner/*`

### 3.3 Security

- Miniapp token scope uses existing JWT secret and expiration.
- Binding API requires ERP credentials for first bind.
- Each role endpoint validates role and binding ownership.

## 4. Client Changes

- Add role-aware tab and home landing.
- Add API service wrapper:
  - automatic token attach
  - error normalization
  - role-based route guards

## 5. Performance and Reliability

- Keep dashboard summary query lightweight.
- Add optional short TTL in-memory cache for owner dashboard endpoint.
- Use indexed fields for binding and relationship lookups.

## 6. Delivery Gates

- Gate 1: Auth + binding complete
- Gate 2: Guest self-service complete
- Gate 3: Staff operations complete
- Gate 4: Owner dashboard complete + regression pass

