import { StorageService } from '../services/storage';
import { AIService } from '../services/api';

// 直接在 options.js 中定义 Logger
const Logger = {
  error: function(message, error) {
    console.error(`[ERROR] ${message}`, error);
  },
  info: function(message, data = {}) {
    console.info(`[INFO] ${message}`, data);
  }
};

class OptionsPage {
  constructor() {
    this.apiKeyInput = document.getElementById('apiKey');
    this.togglePasswordBtn = document.getElementById('togglePassword');
    this.saveApiKeyBtn = document.getElementById('saveApiKey');
    this.testConnectionBtn = document.getElementById('testConnection');
    this.messageDiv = document.getElementById('message');
    
    this.init();
  }
  
  async init() {
    try {
      const apiKey = await StorageService.getApiKey();
      if (apiKey) {
        this.apiKeyInput.value = apiKey;
      }
      
      this.bindEvents();
    } catch (error) {
      Logger.error('选项页面初始化失败', error);
      this.showError('初始化失败，请刷新页面重试');
    }
  }
  
  bindEvents() {
    this.togglePasswordBtn.addEventListener('click', () => {
      const type = this.apiKeyInput.type;
      this.apiKeyInput.type = type === 'password' ? 'text' : 'password';
      this.togglePasswordBtn.textContent = type === 'password' ? '隐藏' : '显示';
    });
    
    this.saveApiKeyBtn.addEventListener('click', async () => {
      await this.saveApiKey();
    });
    
    this.testConnectionBtn.addEventListener('click', async () => {
      await this.testConnection();
    });
  }
  
  async saveApiKey() {
    try {
      const apiKey = this.apiKeyInput.value.trim();
      if (!apiKey) {
        return this.showError('请输入 API Key');
      }
      
      await StorageService.saveApiKey(apiKey);
      this.showSuccess('API Key 保存成功');
    } catch (error) {
      Logger.error('保存 API Key 失败', error);
      this.showError('保存失败，请重试');
    }
  }
  
  async testConnection() {
    try {
      const apiKey = this.apiKeyInput.value.trim();
      if (!apiKey) {
        return this.showError('请先输入并保存 API Key');
      }
      
      const aiService = new AIService(apiKey);
      await aiService.sendMessage('qwen2-72b', [
        { role: 'user', content: 'test' }
      ], () => {});
      
      this.showSuccess('连接测试成功');
    } catch (error) {
      Logger.error('连接测试失败', error);
      this.showError('连接测试失败，请检查 API Key 是否正确');
    }
  }
  
  showError(message) {
    this.messageDiv.className = 'error-message';
    this.messageDiv.textContent = message;
  }
  
  showSuccess(message) {
    this.messageDiv.className = 'success-message';
    this.messageDiv.textContent = message;
  }
}

// 初始化选项页面
document.addEventListener('DOMContentLoaded', () => {
  new OptionsPage();
}); 