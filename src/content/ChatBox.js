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
    // 初始状态设为显示
    container.style.display = 'flex';
    // 确保样式正确应用
    container.style.position = 'fixed';
    container.style.top = '20px';
    container.style.right = '20px';
    container.style.width = '400px';
    container.style.minHeight = '600px';
    container.style.maxHeight = '90vh';
    container.style.backgroundColor = '#fff';
    container.style.borderRadius = '8px';
    container.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    container.style.zIndex = '999999';
    container.style.flexDirection = 'column';
    
    return container;
  }

  createModelSelector() {
    const selector = document.createElement('select');
    selector.className = 'tc-model-selector';
    
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

    const textarea = document.createElement('textarea');
    textarea.className = 'tc-input';
    textarea.placeholder = '请输入您的问题...';

    const sendButton = document.createElement('button');
    sendButton.className = 'tc-send-button';
    sendButton.textContent = '发送';
    sendButton.onclick = () => this.handleSend();

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
    
    const title = document.createElement('div');
    title.className = 'tc-title';
    title.textContent = '同程智能问答助手';
    
    header.appendChild(title);
    header.appendChild(this.modelSelector);

    this.container.appendChild(header);
    this.container.appendChild(this.messageList.container);
    this.container.appendChild(this.inputArea);
  }

  bindEvents() {
    this.modelSelector.addEventListener('change', async (e) => {
      await StorageService.saveSelectedModel(e.target.value);
    });

    this.inputArea.querySelector('textarea').addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSend();
      }
    });
  }

  async handleSend() {
    const textarea = this.inputArea.querySelector('textarea');
    const content = textarea.value.trim();
    
    if (!content) return;

    try {
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
      const errorMessage = ErrorHandler.handle(error, '发送消息');
      this.messageList.addMessage({
        role: 'system',
        content: errorMessage,
        isError: true
      });
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
    // 使用 this.container 而不是重新查询
    const container = this.container;
    
    Logger.info('聊天框 DOM 检查', {
      exists: !!container,
      inDocument: document.body.contains(container),
      display: container.style.display,
      visible: this.visible,
      dimensions: {
        width: container.offsetWidth || container.style.width,
        height: container.offsetHeight || container.style.height
      },
      position: {
        top: container.style.top,
        right: container.style.right
      },
      zIndex: container.style.zIndex,
      children: {
        header: !!container.querySelector('.tc-header'),
        messageList: !!container.querySelector('.tc-message-list'),
        inputArea: !!container.querySelector('.tc-input-area')
      },
      styles: {
        computed: window.getComputedStyle(container),
        inline: container.style
      }
    });
  }

  // ... 其他方法
} 