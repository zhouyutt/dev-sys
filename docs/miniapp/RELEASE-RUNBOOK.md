# MiniApp Release Runbook

## 1. Pre-release Checklist

- Confirm backend env values:
  - `JWT_SECRET`
  - `WECHAT_APPID`
  - `WECHAT_SECRET`
  - `MINIAPP_JWT_EXPIRE`
  - `MINIAPP_OWNER_CACHE_MS`
- Run:
  - `npm run test:miniapp`
  - `npm run test:smoke`

## 2. Build and Package

- Miniapp:
  - `cd miniapp && npm install && npm run build:weapp`
  - Upload `miniapp/dist` via WeChat DevTools.

## 3. Gray Release

- Publish miniapp as trial version first.
- Allow internal staff and selected guests for 24-48h validation.
- Monitor backend error rate and key endpoints.

## 4. Rollback Strategy

- Miniapp: rollback to previous reviewed version in WeChat release management.
- Backend: rollback deployment artifact to previous tag.

## 5. Post-release Monitoring

- Check:
  - bind login failures
  - 401/403 spikes
  - owner dashboard latency
  - staff write operation failures

