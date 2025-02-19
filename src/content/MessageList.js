import { marked } from 'marked';
import { StorageService } from '../services/storage';

// 消息列表组件
export class MessageList {
  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'tc-message-list';
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
      const messageEl = document.createElement('div');
      messageEl.className = `tc-message tc-message-${message.role}`;
      
      if (message.isError) {
        messageEl.className += ' tc-message-error';
      }

      const content = document.createElement('div');
      content.className = 'tc-message-content';
      content.innerHTML = marked(message.content);
      
      messageEl.appendChild(content);
      this.container.appendChild(messageEl);
    });

    this.container.scrollTop = this.container.scrollHeight;
  }

  // ... 其他方法
} 