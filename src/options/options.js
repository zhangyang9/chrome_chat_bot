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
    
    // 新增配置项
    this.envSelector = document.getElementById('envSelector');
    this.testModel = document.getElementById('testModel');
    this.testPrompt = document.getElementById('testPrompt');
    this.autoSave = document.getElementById('autoSave');
    this.soundNotification = document.getElementById('soundNotification');
    
    this.init();
  }
  
  async init() {
    try {
      const apiKey = await StorageService.getApiKey();
      if (apiKey) {
        this.apiKeyInput.value = apiKey;
      }
      
      await this.loadSettings();
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
  
  async loadSettings() {
    const settings = await StorageService.getSettings();
    this.autoSave.checked = settings.autoSave ?? true;
    this.soundNotification.checked = settings.soundNotification ?? false;
    this.envSelector.value = settings.env ?? 'prod';
  }

  async saveSettings() {
    const settings = {
      autoSave: this.autoSave.checked,
      soundNotification: this.soundNotification.checked,
      env: this.envSelector.value
    };
    await StorageService.saveSettings(settings);
  }
  
  async testConnection() {
    try {
      this.showTestStatus('testing');
      const apiKey = this.apiKeyInput.value.trim();
      const prompt = this.testPrompt.value.trim() || 'test';
      const model = this.testModel.value;

      if (!apiKey) {
        return this.showError('请先输入并保存 API Key');
      }

      const aiService = new AIService(apiKey);
      const startTime = Date.now();
      
      await aiService.sendMessage(model, [
        { role: 'user', content: prompt }
      ], (chunk) => {
        this.appendTestResult(chunk);
      });

      const duration = Date.now() - startTime;
      this.showTestStatus('success', duration);
    } catch (error) {
      this.showTestStatus('error', null, error.message);
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

  showTestStatus(status, duration = null, error = null) {
    const resultDiv = document.getElementById('testResult');
    switch(status) {
      case 'testing':
        resultDiv.innerHTML = '<div class="loading">测试中...</div>';
        break;
      case 'success':
        resultDiv.innerHTML = `
          <div class="success">
            <span>测试成功</span>
            <span>响应时间: ${duration}ms</span>
          </div>
        `;
        break;
      case 'error':
        resultDiv.innerHTML = `
          <div class="error">
            <span>测试失败</span>
            <span>${error}</span>
          </div>
        `;
        break;
    }
  }

  appendTestResult(chunk) {
    // Implementation of appendTestResult method
  }
}

// 初始化选项页面
document.addEventListener('DOMContentLoaded', () => {
  new OptionsPage();
}); 