import { marked } from 'marked';
import { StorageService } from '../services/storage';

// 消息列表组件
export class MessageList {
  constructor() {
    this.container = this.createContainer();
    this.messages = [];
    this.init();
  }

  async init() {
    this.messages = await StorageService.getChatHistory();
    this.render();
  }

  addMessage(message) {
    this.messages.push({
      ...message,
      timestamp: new Date().toISOString()
    });
    this.render();
    this.saveHistory();
  }

  appendToLastMessage(content) {
    const lastMessage = this.messages[this.messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant') {
      lastMessage.content += content;
    } else {
      this.messages.push({
        role: 'assistant',
        content,
        timestamp: new Date().toISOString()
      });
    }
    this.render();
    this.saveHistory();
  }

  async saveHistory() {
    await StorageService.saveChatHistory(this.messages);
  }

  render() {
    this.container.innerHTML = '';
    
    this.messages.forEach(message => {
      const messageEl = this.createMessageElement(message);
      this.container.appendChild(messageEl);
    });

    this.container.scrollTop = this.container.scrollHeight;
  }

  createContainer() {
    const container = document.createElement('div');
    container.className = 'tc-message-list';
    container.style.flex = '1';
    container.style.overflowY = 'auto';
    container.style.padding = '16px';
    container.style.backgroundColor = '#fff';
    // 添加平滑滚动
    container.style.scrollBehavior = 'smooth';
    return container;
  }

  createMessageElement(message) {
    const wrapper = document.createElement('div');
    wrapper.className = `tc-message tc-message-${message.role}`;
    wrapper.style.marginBottom = '16px';
    wrapper.style.maxWidth = '85%';
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.alignItems = message.role === 'user' ? 'flex-end' : 'flex-start';

    const content = document.createElement('div');
    content.className = 'tc-message-content';
    content.style.padding = '12px 16px';
    content.style.borderRadius = '12px';
    content.style.fontSize = '14px';
    content.style.lineHeight = '1.6';
    content.style.wordBreak = 'break-word';

    if (message.role === 'user') {
      content.style.backgroundColor = '#1890ff';
      content.style.color = '#fff';
      wrapper.style.marginLeft = 'auto';
    } else if (message.role === 'assistant') {
      content.style.backgroundColor = '#f5f5f5';
      content.style.color = '#1a1a1a';
      wrapper.style.marginRight = 'auto';
    } else if (message.isError) {
      content.style.backgroundColor = '#fff1f0';
      content.style.color = '#f5222d';
      content.style.border = '1px solid #ffa39e';
    }

    content.textContent = message.content;
    wrapper.appendChild(content);
    return wrapper;
  }

  // ... 其他方法
} 