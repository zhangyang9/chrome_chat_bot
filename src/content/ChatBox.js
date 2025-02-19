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
    this.visible = false; // 初始状态设为隐藏
    
    this.init();
  }

  createContainer() {
    const container = document.createElement('div');
    container.className = 'tc-chat-container';
    container.style.display = 'none'; // 初始状态隐藏
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
    Logger.info(`聊天框${this.visible ? '显示' : '隐藏'}`);
  }

  // ... 其他方法
} 