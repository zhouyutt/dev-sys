# 2GB 服务器部署说明

适用场景：云服务器内存仅 `2GB`，不适合在服务器内执行 `pure-admin-tpl` 前端生产构建。

## 部署原则

- 前端在本地电脑或 CI 环境构建 `dist`
- 服务器只负责运行 `Nginx` 静态文件容器、后端容器和 MySQL 容器
- 不要在 `2GB` 服务器上执行前端 `pnpm build` 或 `docker compose build frontend` 的源码编译流程

## 推荐步骤

### 1. 在本地构建前端

```bash
cd pure-admin-tpl
pnpm install
pnpm build
```

构建完成后，确认 `pure-admin-tpl/dist` 目录已生成。

### 2. 将代码和 dist 一起上传到服务器

至少确保服务器上的这些内容存在：

- `docker-compose.yml`
- `backend/`
- `pure-admin-tpl/Dockerfile`
- `pure-admin-tpl/dist/`

注意：当前前端 Docker 镜像会直接复制 `pure-admin-tpl/dist`，如果服务器上没有这个目录，前端镜像构建会失败。

### 3. 在服务器启动

```bash
docker compose up -d --build
```

前端镜像现在只会把 `dist` 拷贝进 `nginx`，不会再在服务器中执行 Vite 构建。

## 更新前端的方式

前端代码有变更时，重复以下流程：

```bash
cd pure-admin-tpl
pnpm build
```

然后把最新的 `pure-admin-tpl/dist` 同步到服务器，再执行：

```bash
docker compose up -d --build frontend
```

## 常见问题

### 前端镜像构建时报 `COPY dist` 失败

说明服务器上的 `pure-admin-tpl/dist` 不存在。先在本地构建前端，并把 `dist` 上传到服务器。

### 后端和前端都在服务器上，但内存仍紧张

建议：

- MySQL 保持默认，不额外叠加高内存业务
- 后端容器仅运行生产依赖
- 避免在同一台 `2GB` 机器上同时做前端构建、数据库初始化和其他大任务
