# Dive ERP MiniApp

## Local Development

1. Install dependencies

```bash
npm install
```

2. Run WeChat miniapp watch build

```bash
npm run dev:weapp
```

3. Open `miniapp/dist` in WeChat DevTools.

## Build

```bash
npm run build:weapp
```

## Environment Variables

- `TARO_APP_API_BASE`: backend API base URL, default `http://localhost:3000/api`

## Notes

- First login requires ERP credential binding.
- Guest role requires `profileId` (Student ID) during first bind in v1.
