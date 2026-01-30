# Arknights Card for Home Assistant

<p align="center">
  <img src="https://img.shields.io/badge/Home%20Assistant-Lovelace%20Card-blue.svg" alt="Home Assistant Lovelace Card">
  <img src="https://img.shields.io/badge/HACS-Custom-orange.svg" alt="HACS Custom">
</p>

为 [ha_arknights](https://github.com/neqq3/ha_arknights_card) 集成提供的 Lovelace 自定义卡片。

## ✨ 功能

- 🔋 **理智进度环** - 动态显示当前理智值和恢复倒计时
- 👤 **玩家信息** - 显示博士昵称和等级
- 🏭 **基建概览** - 贸易站、制造站、无人机、训练室状态
- 📝 **一键签到** - 直接在卡片上完成森空岛签到

## 📦 安装

### 前置要求

请先安装 [ha_arknights](https://github.com/neqq3/ha_arknights_card) 集成。

### 方法一：HACS（推荐）

1. 打开 HACS → 前端
2. 点击右上角菜单 → **自定义存储库**
3. 输入本仓库地址，类别选择 **Lovelace**
4. 搜索 **Arknights Card** 并下载
5. 刷新浏览器

### 方法二：手动安装

1. 下载 `dist/arknights-card.js`
2. 复制到 `config/www/` 目录
3. 在 Lovelace 资源中添加：
   ```yaml
   url: /local/arknights-card.js
   type: module
   ```
4. 刷新浏览器

## ⚙️ 配置

### 基础配置

```yaml
type: custom:arknights-card
entity: sensor.arknights_sanity
```

### 完整配置

```yaml
type: custom:arknights-card
entity: sensor.arknights_sanity
name: 我的博士              # 可选，自定义名称
show_header: true           # 显示头部信息
show_sanity: true           # 显示理智状态
show_base: true             # 显示基建概览
show_sign_button: true      # 显示签到按钮
```

## 🎨 预览

卡片采用明日方舟经典深色主题配合青色强调色，支持：
- Glassmorphism 效果
- 动态进度环
- 满仓/高值警告高亮

## 🔧 开发

```bash
# 安装依赖
npm install

# 开发模式（监听变化）
npm run watch

# 构建生产版本
npm run build
```

## 📄 许可证

MIT License
