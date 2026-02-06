# 马来语（Bahasa Melayu）支持

## ✅ 马来语功能已添加

系统现在完全支持三种语言：
- 🇨🇳 简体中文 (zh)
- 🇬🇧 English (en)
- 🇲🇾 Bahasa Melayu (ms)

### 📍 语言切换位置

**导航栏右上角** - 点击地球图标（🌐）即可切换语言

现在支持三种语言选项：
- 简体中文
- English
- Bahasa Melayu

### 🔧 实现细节

1. **翻译文件**: `/Users/kun/Carl/vue-pure-admin/locales/ms.yaml`
   - 包含所有菜单、按钮、状态等完整翻译

2. **i18n配置**: `/Users/kun/Carl/vue-pure-admin/src/plugins/i18n.ts`
   - 已添加 `ms` 语言配置
   - Element Plus 组件使用英文作为fallback（因为Element Plus没有马来语）

3. **语言切换Hook**: `/Users/kun/Carl/vue-pure-admin/src/layout/hooks/useTranslationLang.ts`
   - 添加了 `translationMs()` 函数

4. **导航栏组件**: `/Users/kun/Carl/vue-pure-admin/src/layout/components/lay-navbar/index.vue`
   - 已添加马来语选项到语言切换下拉菜单

### 📝 已翻译的菜单项（马来语）

- **Pengurusan Pelajar** - Student Management / 学生管理
- **Pengurusan Bilik** - Room Management / 房间管理
- **Pengurusan Perjalanan** - Trip Management / 行程管理
- **Pengurusan Kakitangan** - Staff Management / 员工管理
- **Pengurusan Bot** - Boat Management / 船只管理
- **Pengurusan Sistem** - System Management / 系统管理
- **Pengurusan Pengguna** - User Management / 用户管理
- **Pengurusan Peranan** - Role Management / 角色管理
- **Pengurusan Kebenaran** - Permission Management / 权限管理
- **Pengurusan Menu** - Menu Management / 菜单管理
- **Monitor Sistem** - System Monitor / 系统监控
- **Gambaran Keseluruhan Sistem** - System Overview / 系统概览
- **Pengguna Dalam Talian** - Online Users / 在线用户
- **Log Log Masuk** - Login Logs / 登录日志
- **Log Operasi** - Operation Logs / 操作日志
- **Log Sistem** - System Logs / 系统日志
- **Kod QR Pendaftaran** - Enrollment QR Code / 报名二维码

### 🎯 使用方法

1. 登录系统
2. 查看导航栏右上角，找到地球图标（🌐）
3. 点击地球图标，选择语言：
   - 简体中文
   - English
   - **Bahasa Melayu** ← 新增！
4. 切换后，菜单和页面标题会立即更新为马来语
5. 语言选择会自动保存，刷新页面后保持

### ✨ 功能特点

1. **完整翻译**: 所有菜单项、按钮、状态消息都有马来语翻译
2. **自动保存**: 语言选择保存到localStorage
3. **实时切换**: 切换后立即生效
4. **易于扩展**: 可在 `locales/ms.yaml` 中添加新翻译项

### 📋 添加新翻译项

如果需要在页面中添加新的马来语翻译：

1. 在 `locales/ms.yaml` 中添加翻译：
```yaml
menus:
  newMenu: Menu Baru
```

2. 在代码中使用：
```vue
{{ t("menus.newMenu") }}
```

### 🔍 翻译对照表

| 中文 | English | Bahasa Melayu |
|------|---------|---------------|
| 学生管理 | Student Management | Pengurusan Pelajar |
| 房间管理 | Room Management | Pengurusan Bilik |
| 行程管理 | Trip Management | Pengurusan Perjalanan |
| 员工管理 | Staff Management | Pengurusan Kakitangan |
| 船只管理 | Boat Management | Pengurusan Bot |
| 系统管理 | System Management | Pengurusan Sistem |
| 用户管理 | User Management | Pengurusan Pengguna |
| 角色管理 | Role Management | Pengurusan Peranan |
| 权限管理 | Permission Management | Pengurusan Kebenaran |
| 菜单管理 | Menu Management | Pengurusan Menu |
| 系统监控 | System Monitor | Monitor Sistem |
| 系统概览 | System Overview | Gambaran Keseluruhan Sistem |
| 在线用户 | Online Users | Pengguna Dalam Talian |
| 登录日志 | Login Logs | Log Log Masuk |
| 操作日志 | Operation Logs | Log Operasi |
| 系统日志 | System Logs | Log Sistem |
| 报名二维码 | Enrollment QR Code | Kod QR Pendaftaran |

### ✅ 总结

**马来语支持已完全添加！** 🎉

- ✅ 马来语翻译文件已创建
- ✅ i18n配置已更新
- ✅ 语言切换组件已更新
- ✅ 所有菜单项都有马来语翻译
- ✅ 语言选择会自动保存
- ✅ 切换后立即生效

用户现在可以在简体中文、英文和马来语之间自由切换！
