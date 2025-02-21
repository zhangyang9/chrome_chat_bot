import { MessageList } from './MessageList';
import { AIService } from '../services/api';
import { StorageService } from '../services/storage';
import { Logger } from '../services/logger';
import { ErrorHandler } from '../utils/errorHandler';

// 对话框主组件
export class ChatBox {
  constructor() {
    this.container = this.createContainer();
    this.floatIcon = this.createFloatIcon();
    this.messageList = new MessageList();
    this.modelSelector = this.createModelSelector();
    this.inputArea = this.createInputArea();
    this.aiService = null;
    
    // 简化状态管理
    this.state = {
      isHidden: false,
      position: { top: '20px', right: '20px' },
      size: { width: '400px', height: '600px' }
    };
    
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
    const header = this.createHeader();

    this.container.appendChild(header);
    this.container.appendChild(this.messageList.container);
    this.container.appendChild(this.inputArea);
  }

  createHeader() {
    const header = document.createElement('div');
    header.className = 'tc-header';
    Object.assign(header.style, {
      padding: '12px 16px',  // 增加内边距
      borderBottom: '1px solid #eaeaea', // 更柔和的边框颜色
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#ffffff', // 纯白背景
      height: '52px', // 稍微增加高度
      cursor: 'move',
      userSelect: 'none' // 防止文字被选中
    });

    // 左侧区域（标题 + 模型选择器）
    const leftArea = document.createElement('div');
    leftArea.style.display = 'flex';
    leftArea.style.alignItems = 'center';
    leftArea.style.gap = '12px'; // 增加间距
    leftArea.style.flex = '1';

    // 标题
    const title = document.createElement('div');
    title.className = 'tc-title';
    title.textContent = '同程智能问答助手';
    Object.assign(title.style, {
      fontSize: '15px',
      fontWeight: '600',
      color: '#262626',
      whiteSpace: 'nowrap',
      letterSpacing: '0.2px' // 增加字间距
    });

    // 优化模型选择器样式
    Object.assign(this.modelSelector.style, {
      height: '32px', // 固定高度
      padding: '0 12px',
      fontSize: '13px',
      borderRadius: '6px',
      border: '1px solid #e8e8e8',
      backgroundColor: '#fafafa',
      color: '#595959',
      cursor: 'pointer',
      outline: 'none',
      transition: 'all 0.2s ease',
      minWidth: '120px' // 固定最小宽度
    });

    // 添加模型选择器悬停效果
    this.modelSelector.addEventListener('mouseover', () => {
      this.modelSelector.style.borderColor = '#d9d9d9';
      this.modelSelector.style.backgroundColor = '#f5f5f5';
    });

    this.modelSelector.addEventListener('mouseout', () => {
      this.modelSelector.style.borderColor = '#e8e8e8';
      this.modelSelector.style.backgroundColor = '#fafafa';
    });

    leftArea.appendChild(title);
    leftArea.appendChild(this.modelSelector);

    // 右侧关闭按钮
    const controls = document.createElement('div');
    controls.className = 'tc-controls';
    controls.style.marginLeft = '16px'; // 与左侧保持距离

    const closeBtn = this.createControlButton('×', '关闭');
    Object.assign(closeBtn.style, {
      width: '28px', // 增加按钮大小
      height: '28px',
      fontSize: '18px', // 增加图标大小
      borderRadius: '6px',
      color: '#8c8c8c'
    });

    closeBtn.addEventListener('click', () => this.hide());
    controls.appendChild(closeBtn);

    header.appendChild(leftArea);
    header.appendChild(controls);

    return header;
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

    // 双击标题栏最大化
    const header = this.container.querySelector('.tc-header');
    header.addEventListener('dblclick', (e) => {
      // 不触发控制按钮的双击
      if (!e.target.closest('.tc-controls')) {
        this.maximize();
      }
    });

    // 拖拽功能
    this.enableDrag();
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

  // 简化 createControlButton 方法
  createControlButton(symbol, title) {
    const button = document.createElement('button');
    button.className = 'tc-control-button';
    button.title = title;
    button.textContent = symbol;
    
    Object.assign(button.style, {
      width: '28px',
      height: '28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: 'none',
      borderRadius: '6px',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      fontSize: '18px',
      color: '#8c8c8c',
      transition: 'all 0.2s ease',
      padding: '0',
      margin: '0'
    });

    // 优化关闭按钮悬停效果
    button.addEventListener('mouseover', () => {
      button.style.backgroundColor = '#fff2f0';
      button.style.color = '#ff4d4f';
    });

    button.addEventListener('mouseout', () => {
      button.style.backgroundColor = 'transparent';
      button.style.color = '#8c8c8c';
    });

    return button;
  }

  // 修改拖拽方法
  enableDrag() {
    const header = this.container.querySelector('.tc-header');
    let isDragging = false;
    let startX, startY;
    let initialX, initialY;

    header.addEventListener('mousedown', (e) => {
      // 不在控制按钮上开始拖拽
      if (!e.target.closest('.tc-controls')) {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        initialX = this.container.offsetLeft;
        initialY = this.container.offsetTop;
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        e.preventDefault();
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        
        this.container.style.left = `${initialX + dx}px`;
        this.container.style.top = `${initialY + dy}px`;
      }
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        // 保存新位置
        this.state.position = {
          top: this.container.style.top,
          right: this.container.style.right
        };
        this.saveState();
      }
    });
  }

  // 修改隐藏方法
  hide() {
    // 保存当前状态
    if (!this.state.isHidden) {
      this.state.position = {
        top: this.container.style.top,
        right: this.container.style.right
      };
      this.state.size = {
        width: this.container.style.width,
        height: this.container.style.height
      };
    }

    // 隐藏对话框
    this.container.style.display = 'none';
    
    // 显示悬浮图标
    this.floatIcon.style.display = 'block';
    
    this.state.isHidden = true;

    this.saveState();
    Logger.info('聊天框隐藏，显示悬浮图标');
  }

  // 添加显示方法
  show() {
    // 隐藏悬浮图标
    this.floatIcon.style.display = 'none';
    
    // 显示对话框
    this.container.style.display = 'flex';
    this.container.style.width = this.state.size.width;
    this.container.style.height = this.state.size.height;
    this.container.style.top = this.state.position.top;
    this.container.style.right = this.state.position.right;
    
    // 显示所有内容
    this.messageList.container.style.display = 'block';
    this.inputArea.style.display = 'block';

    this.state.isHidden = false;
    this.saveState();
    Logger.info('显示聊天框');
  }

  // 修改销毁方法
  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    if (this.floatIcon && this.floatIcon.parentNode) {
      this.floatIcon.parentNode.removeChild(this.floatIcon);
    }
  }

  // 修改状态保存方法
  saveState() {
    StorageService.saveChatBoxState({
      isHidden: this.state.isHidden,
      position: this.state.position,
      size: this.state.size
    });
  }

  // 创建悬浮图标
  createFloatIcon() {
    const icon = document.createElement('div');
    icon.className = 'tc-float-icon';
    Object.assign(icon.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      width: '15px',
      height: '15px',
      borderRadius: '50%',
      backgroundColor: '#1890ff',
      cursor: 'pointer',
      display: 'none',
      zIndex: '999999',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      transition: 'all 0.3s'
    });

    // 添加悬停效果
    icon.addEventListener('mouseover', () => {
      icon.style.transform = 'scale(1.1)';
      icon.style.backgroundColor = '#40a9ff';
    });

    icon.addEventListener('mouseout', () => {
      icon.style.transform = 'scale(1)';
      icon.style.backgroundColor = '#1890ff';
    });

    // 点击显示对话框
    icon.addEventListener('click', () => this.show());

    document.body.appendChild(icon);
    return icon;
  }
} 