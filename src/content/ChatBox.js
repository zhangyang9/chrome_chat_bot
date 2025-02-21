import { MessageList } from './MessageList';
import { AIService } from '../services/api';
import { StorageService } from '../services/storage';
import { Logger } from '../services/logger';
import { ErrorHandler } from '../utils/errorHandler';

// 对话框主组件
export class ChatBox {
  constructor() {
    this.container = this.createContainer();
    this.messageList = new MessageList();
    this.modelSelector = this.createModelSelector();
    this.inputArea = this.createInputArea();
    this.aiService = null;
    this.visible = true; // 初始状态为显示
    // this.visible = false; // 初始状态为隐藏
    this.init();
  }

  createContainer() {
    const container = document.createElement('div');
    container.className = 'tc-chat-container';
    container.style.display = 'flex';
    container.style.position = 'fixed';
    container.style.top = '20px';
    container.style.right = '20px';
    container.style.width = '400px';
    container.style.minHeight = '600px';
    container.style.maxHeight = '80vh'; // 稍微降低最大高度
    container.style.backgroundColor = '#fff';
    container.style.borderRadius = '12px'; // 增加圆角
    container.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)'; // 优化阴影
    container.style.zIndex = '999999';
    container.style.flexDirection = 'column';
    container.style.overflow = 'hidden'; // 防止内容溢出
    container.style.border = '1px solid rgba(0, 0, 0, 0.1)'; // 添加边框
    
    return container;
  }

  createModelSelector() {
    const selector = document.createElement('select');
    selector.className = 'tc-model-selector';
    selector.style.padding = '6px 12px';
    selector.style.fontSize = '14px';
    selector.style.borderRadius = '6px';
    selector.style.border = '1px solid #ddd';
    selector.style.backgroundColor = '#f5f5f5';
    selector.style.cursor = 'pointer';
    
    const models = [
      { value: 'qwen2-72b', label: 'Qwen2-72B' },
      { value: 'deepseek-r1', label: 'Deepseek-R1' },
      { value: 'deepseek-r1-70b', label: 'Deepseek-R1-70B' },
      { value: 'deepseek-v3', label: 'Deepseek-V3' }
    ];

    models.forEach(model => {
      const option = document.createElement('option');
      option.value = model.value;
      option.textContent = model.label;
      selector.appendChild(option);
    });

    return selector;
  }

  createInputArea() {
    const container = document.createElement('div');
    container.className = 'tc-input-area';
    container.style.padding = '16px';
    container.style.borderTop = '1px solid #eee';
    container.style.backgroundColor = '#f8f9fa';

    const textarea = document.createElement('textarea');
    textarea.className = 'tc-input';
    textarea.placeholder = '请输入您的问题...';
    textarea.style.width = '100%';
    textarea.style.minHeight = '80px';
    textarea.style.padding = '12px';
    textarea.style.border = '1px solid #ddd';
    textarea.style.borderRadius = '8px';
    textarea.style.resize = 'vertical';
    textarea.style.marginBottom = '12px';
    textarea.style.fontSize = '14px';
    textarea.style.lineHeight = '1.6';
    textarea.style.backgroundColor = '#fff';

    const sendButton = document.createElement('button');
    sendButton.className = 'tc-send-button';
    sendButton.textContent = '发送';
    sendButton.style.width = '100%';
    sendButton.style.padding = '10px';
    sendButton.style.backgroundColor = '#1890ff';
    sendButton.style.color = '#fff';
    sendButton.style.border = 'none';
    sendButton.style.borderRadius = '8px';
    sendButton.style.cursor = 'pointer';
    sendButton.style.fontSize = '14px';
    sendButton.style.fontWeight = '500';
    sendButton.style.transition = 'background-color 0.2s';

    // 添加点击事件处理
    sendButton.addEventListener('click', () => this.handleSend());

    // 添加悬停效果
    sendButton.onmouseover = () => {
      sendButton.style.backgroundColor = '#40a9ff';
    };
    sendButton.onmouseout = () => {
      sendButton.style.backgroundColor = '#1890ff';
    };

    container.appendChild(textarea);
    container.appendChild(sendButton);

    return container;
  }

  async init() {
    try {
      await this.loadConfig();
      this.render();
      this.bindEvents();
      document.body.appendChild(this.container);
      
      // 添加 DOM 检查
      this.checkDOMElement();
      
      Logger.info('聊天框初始化成功');
    } catch (error) {
      Logger.error('聊天框初始化失败', error);
    }
  }

  async loadConfig() {
    const apiKey = await StorageService.getApiKey();
    if (!apiKey) {
      throw new Error('未配置API密钥');
    }
    this.aiService = new AIService(apiKey);
    
    const selectedModel = await StorageService.getSelectedModel();
    this.modelSelector.value = selectedModel;
  }

  render() {
    const header = document.createElement('div');
    header.className = 'tc-header';
    header.style.padding = '16px';
    header.style.borderBottom = '1px solid #eee';
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.backgroundColor = '#f8f9fa';
    
    const title = document.createElement('div');
    title.className = 'tc-title';
    title.textContent = '同程智能问答助手';
    title.style.fontSize = '16px';
    title.style.fontWeight = '500';
    title.style.color = '#1a1a1a';
    
    header.appendChild(title);
    header.appendChild(this.modelSelector);

    this.container.appendChild(header);
    this.container.appendChild(this.messageList.container);
    this.container.appendChild(this.inputArea);
  }

  bindEvents() {
    // 绑定模型选择器事件
    this.modelSelector.addEventListener('change', async (e) => {
      await StorageService.saveSelectedModel(e.target.value);
    });

    // 绑定回车发送
    const textarea = this.inputArea.querySelector('textarea');
    textarea.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSend();
      }
    });

    // 绑定发送按钮点击事件（作为备份）
    const sendButton = this.inputArea.querySelector('.tc-send-button');
    sendButton.addEventListener('click', () => this.handleSend());
  }

  async handleSend() {
    try {
      const textarea = this.inputArea.querySelector('textarea');
      const content = textarea.value.trim();
      
      if (!content) {
        Logger.info('输入内容为空');
        return;
      }

      Logger.info('开始发送消息', { content });

      // 禁用输入和发送按钮
      textarea.disabled = true;
      const sendButton = this.inputArea.querySelector('.tc-send-button');
      sendButton.disabled = true;
      sendButton.style.backgroundColor = '#d9d9d9';

      const userMessage = { role: 'user', content };
      this.messageList.addMessage(userMessage);
      textarea.value = '';

      const messages = [
        { role: 'system', content: 'You are a helpful assistant' },
        userMessage
      ];

      await this.aiService.sendMessage(
        this.modelSelector.value,
        messages,
        (chunk) => this.messageList.appendToLastMessage(chunk)
      );

    } catch (error) {
      Logger.error('发送消息失败', error);
      const errorMessage = error.message || '发送消息失败';
      this.messageList.addMessage({
        role: 'system',
        content: errorMessage,
        isError: true
      });
    } finally {
      // 重新启用输入和发送按钮
      const textarea = this.inputArea.querySelector('textarea');
      const sendButton = this.inputArea.querySelector('.tc-send-button');
      textarea.disabled = false;
      sendButton.disabled = false;
      sendButton.style.backgroundColor = '#1890ff';
      textarea.focus();
    }
  }

  toggle() {
    this.visible = !this.visible;
    this.container.style.display = this.visible ? 'flex' : 'none';
    Logger.info(`聊天框切换状态`, {
      visible: this.visible,
      display: this.container.style.display,
      dimensions: {
        width: this.container.offsetWidth,
        height: this.container.offsetHeight
      }
    });
  }

  // 添加 DOM 检查方法
  checkDOMElement() {
    try {
      // 检查 container 是否存在
      if (!this.container) {
        Logger.error('聊天框容器不存在');
        return;
      }

      // 检查 container 是否在文档中
      if (!document.body.contains(this.container)) {
        Logger.error('聊天框容器不在文档中');
        return;
      }

      // 获取基本信息
      const basicInfo = {
        exists: true,
        inDocument: true,
        display: this.container.style.display,
        visible: this.visible
      };

      // 获取尺寸信息
      const dimensions = {
        width: this.container.offsetWidth,
        height: this.container.offsetHeight,
        clientWidth: this.container.clientWidth,
        clientHeight: this.container.clientHeight
      };

      // 获取位置信息
      const position = {
        top: this.container.style.top,
        right: this.container.style.right
      };

      // 获取子元素信息
      const children = {
        header: this.container.querySelector('.tc-header') !== null,
        messageList: this.container.querySelector('.tc-message-list') !== null,
        inputArea: this.container.querySelector('.tc-input-area') !== null
      };

      // 记录完整状态
      Logger.info('聊天框 DOM 检查', {
        ...basicInfo,
        dimensions,
        position,
        zIndex: this.container.style.zIndex,
        children
      });

      // 检查关键样式是否正确应用
      this.checkStyles();

    } catch (error) {
      Logger.error('DOM 检查失败', error);
    }
  }

  checkStyles() {
    const requiredStyles = {
      position: 'fixed',
      display: this.visible ? 'flex' : 'none',
      top: '20px',
      right: '20px',
      width: '400px',
      minHeight: '600px',
      backgroundColor: '#fff',
      zIndex: '999999'
    };

    const currentStyles = {};
    Object.keys(requiredStyles).forEach(key => {
      currentStyles[key] = this.container.style[key];
    });

    Logger.info('样式检查', {
      required: requiredStyles,
      current: currentStyles,
      matches: Object.keys(requiredStyles).every(
        key => currentStyles[key] === requiredStyles[key]
      )
    });
  }

  // ... 其他方法
} 