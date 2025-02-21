# chrome_chat_bot

Chrome 浏览器扩展，支持调用私有 AI 大模型进行对话。

## 使用说明
1. 安装扩展后，点击"扩展程序选项"，输入API Key
2. 在任意网页右上角可见对话框
3. 选择想要使用的模型
4. 输入问题即可开始对话

## 功能特性

### 1. 核心对话功能
- 支持多个私有模型：
  - qwen2-72b（默认）
  - deepseek-r1
  - deepseek-r1-70b
  - deepseek-v3
- 实时对话响应
- 消息历史记录
- Markdown 格式支持

### 2. 界面交互
- 固定于浏览器右上角
- 自适应布局设计
- 简洁的标题栏和模型选择
- 流畅的输入和发送体验
- 清晰的消息列表展示

### 3. 安全特性
- API Key 加密存储
- AES-GCM 加密算法
- 安全的密钥派生机制
- 本地安全存储

### 4. 配置管理
- 可视化的选项页面
- 模型选择持久化
- 连接状态测试
- 本地配置存储

### 5. 技术架构
- Background Script 后台服务
- Content Script 页面交互
- Options Page 配置界面
- Webpack 模块化构建

### 6. 开发支持
- 完整的日志系统
- 错误处理机制
- DOM 状态监控
- 开发和生产环境配置

## 开发

1. 安装依赖：
```bash
npm install
```

2. 开发模式：
```bash
npm run dev
```

3. 生产构建：
```bash
npm run build
```

## 在 Chrome 中加载扩展：
- 打开 chrome://extensions/
- 启用"开发者模式"
- 点击"加载已解压的扩展程序"
- 选择项目的 dist 目录

## 注意事项

- API Key 请妥善保管
- 对话历史会保存在本地
- 如遇问题，请查看控制台日志
- 建议使用最新版本的 Chrome 浏览器
- 首次使用需要配置 API Key
- 确保网络连接稳定

## 技术栈

- JavaScript ES6+
- Chrome Extension API
- OpenAI API
- Webpack
- Babel
- Marked (Markdown 解析)



