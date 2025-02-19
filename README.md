# chrome_chat_bot
# 同程智能问答助手插件
# yang6.zhang 2025-02-19

Chrome 浏览器扩展，支持调用私有 AI 大模型进行对话。

## 功能特性

- 支持多个私有模型：
  - qwen2-72b（默认）
  - deepseek-r1
  - deepseek-r1-70b
  - deepseek-v3
- 对话框自适应大小
- 支持对话历史记录
- API Key 安全存储
- Markdown 格式支持

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

4. 在 Chrome 中加载扩展：
- 打开 chrome://extensions/
- 启用"开发者模式"
- 点击"加载已解压的扩展程序"
- 选择项目的 dist 目录

## 使用说明

1. 安装扩展后，点击扩展图标进行配置
2. 在设置页面输入 API Key
3. 在任意网页右上角可见对话框
4. 选择想要使用的模型
5. 输入问题即可开始对话

## 注意事项

- API Key 请妥善保管
- 对话历史会保存在本地
- 如遇问题，请查看控制台日志
