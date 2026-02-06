# 仙本那潜水店ERP管理系统

一个完整的潜水店管理系统，包含学员报名、住宿管理、行程安排、装备管理和大屏展示功能。

## 技术栈

### 后端
- Node.js + Express
- MySQL (通过 Sequelize ORM)
- JWT 认证
- 护照OCR识别 (Tesseract.js)
- 二维码生成 (qrcode)

### 前端
- Vue 3
- Vuestic Admin UI Framework
- Pinia 状态管理
- Axios HTTP客户端

### 部署
- Docker + Docker Compose
- 一键启动所有服务

## 功能模块

### 1. 学员报名系统
- 扫描二维码进入报名页面
- 填写个人信息和课程选择
- 上传护照照片自动识别信息
- 数据自动同步到系统数据库

### 2. 住宿管理
- 房间信息管理
- 房间分配和入住登记
- 房间状态实时更新
- 支持2-3人/间的大床房配置

### 3. 行程管理
- 每日出海行程安排
- 船只分配 (6条船)
- 目的地管理 (4个潜水点)
- 人员调度 (船长、DM、教练)

### 4. 人员管理
- 船长、DM、教练信息管理
- 学员与教练匹配
- 人员行程分配

### 5. 装备管理
- 装备库存管理
- 装备与学员绑定
- 装备出入库记录

### 6. 大屏展示
- 第二天出海行程信息
- 房间状态一览
- 实时数据更新

## 快速开始

### 前置要求
- Docker & Docker Compose
- Node.js >= 16 (仅开发环境)

### 一键部署

```bash
# 克隆项目
git clone <repository-url>
cd dive-erp-node-vue3-vuestic-demo-v6

# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

### 访问地址

- 管理后台: http://localhost:8080
- 报名页面: http://localhost:8080/enroll
- 大屏展示: http://localhost:8080/display
- 后端API: http://localhost:3000

### 默认账号

- 用户名: admin
- 密码: admin123

## 项目结构

```
dive-erp/
├── backend/              # 后端服务
│   ├── src/
│   │   ├── controllers/  # 控制器
│   │   ├── models/       # 数据模型
│   │   ├── routes/       # 路由
│   │   ├── middleware/   # 中间件
│   │   ├── services/     # 业务逻辑
│   │   └── utils/        # 工具函数
│   ├── uploads/          # 文件上传目录
│   └── package.json
├── frontend/             # 前端应用
│   ├── src/
│   │   ├── components/   # 组件
│   │   ├── views/        # 页面
│   │   ├── stores/       # Pinia stores
│   │   ├── router/       # 路由配置
│   │   └── api/          # API接口
│   └── package.json
├── docker-compose.yml    # Docker编排
├── .env.example          # 环境变量示例
└── README.md
```

## 开发指南

### 本地开发

#### 后端开发
```bash
cd backend
npm install
npm run dev
```

#### 前端开发
```bash
cd frontend
npm install
npm run dev
```

### 数据库迁移

```bash
cd backend
npm run migrate
npm run seed  # 导入初始数据
```

## 配置说明

复制 `.env.example` 为 `.env` 并修改配置：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=dive_erp
DB_USER=root
DB_PASSWORD=password

# JWT密钥
JWT_SECRET=your-secret-key

# 服务端口
PORT=3000
```

## 部署说明

详见 [DEPLOYMENT.md](./DEPLOYMENT.md)

## License

MIT
