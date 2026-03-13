# Repository Guidelines

## 项目结构与模块组织
仓库当前以后端为主。`backend/src/` 是核心代码，按 `controllers/`、`models/`、`routes/`、`middleware/`、`utils/` 分层；`backend/scripts/` 放可直接执行的运维和冒烟脚本；`backend/uploads/` 用于上传文件，避免提交业务数据。`docs/` 保存发布与运维文档，例如 `docs/PRE-PRODUCTION-CHECKLIST.md`。`pure-admin-tpl/` 当前为空目录，编写文档或代码时不要假定前端实现已在仓库内。

## 构建、测试与开发命令
后端开发在 `backend/` 目录进行：

- `npm install`：安装后端依赖。
- `npm run dev`：用 `nodemon` 启动本地开发服务。
- `npm start`：以生产方式运行 `src/index.js`。
- `npm run migrate`：执行数据库迁移/初始化逻辑。
- `npm run seed`：写入基础演示数据。
- `npm run init-permissions`：初始化 RBAC 权限与角色。
- `npm run test:smoke`：对本地 API 运行全量冒烟测试；如需指定地址，使用 `node scripts/smoke-test.js https://host/api`。

## 编码风格与命名约定
本项目后端使用 CommonJS、分号和 2 空格缩进。保持现有分层：控制器负责请求响应，模型负责 Sequelize 定义，工具脚本放入 `utils/` 或 `scripts/`。命名遵循现状：模型文件使用 PascalCase，如 `TripStaff.js`；控制器使用 camelCase + `Controller`，如 `authController.js`；路由文件使用小写复数，如 `students.js`。

## 测试规范
仓库未配置 Jest/Vitest；当前基线测试是 `backend/scripts/smoke-test.js`。修改 API、权限或关键业务流时，至少运行一次 `npm run test:smoke`，并在新增接口后补充对应冒烟场景。若变更依赖真实数据，请在 PR 中写明前置数据和环境变量。

## 提交与 Pull Request 规范
近期提交遵循 Conventional Commits 风格，常见前缀有 `feat:`、`fix:`、`chore:`、`test:`；摘要可用中文或英文，但要直接说明影响范围。PR 至少应包含：变更目的、受影响模块、数据库或配置变更、测试结果；涉及接口时附示例请求，涉及界面时附截图。

## 安全与配置提示
不要提交 `.env`、真实上传文件或生产密钥。默认管理员密码和 `JWT_SECRET` 仅可用于本地验证，部署前必须替换。涉及上线前检查时，优先同步更新 `docs/PRE-PRODUCTION-CHECKLIST.md`。

## 使用准则概览
- 回复语言必须使用简体中文
- 接到需求后先整理详细的to-do列表，发送用户确认；若用户提出修改意见，需重新整理并确认
- 开发过程中若有任何不确定之处，必须主动向用户提问。
