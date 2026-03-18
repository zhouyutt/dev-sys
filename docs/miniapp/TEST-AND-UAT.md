# MiniApp Test and UAT Plan

## 1. Automated Checks

- Backend miniapp API smoke:

```bash
cd backend
npm run test:miniapp
```

- Full backend regression smoke:

```bash
cd backend
npm run test:smoke
```

- Miniapp CI checks:
  - `npm run typecheck`
  - `npm run build:weapp`

## 2. Role-based UAT Scenarios

### Guest

- Bind login with WeChat code + ERP account + guest profile id
- Read and update own profile
- View own trips
- View own room information
- View notifications

### Staff

- Bind login as staff
- View today board
- Update guest status
- Update room check-in/check-out data
- Mark trip participant sign-in

### Owner

- Bind login as owner
- View dashboard metrics
- Verify cache behavior with repeated requests

## 3. Security UAT

- Guest token cannot access staff/owner endpoints
- Staff token cannot access owner endpoint
- Missing token returns 401

## 4. Go/No-Go Criteria

- P0 defects: 0
- P1 defects: accepted workaround confirmed
- Core APIs success in staging regression
- UAT sign-off from operations owner

