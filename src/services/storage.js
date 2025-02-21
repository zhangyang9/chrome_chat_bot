import { Logger } from './logger';
import { encrypt, decrypt } from '../utils/crypto';

// 存储服务
export class StorageService {
  static async saveApiKey(apiKey) {
    try {
      const encryptedKey = await encrypt(apiKey);
      await chrome.storage.sync.set({ apiKey: encryptedKey });
    } catch (error) {
      Logger.error('API密钥保存失败', error);
      throw error;
    }
  }

  static async getApiKey() {
    try {
      const result = await chrome.storage.sync.get('apiKey');
      if (!result.apiKey) return null;
      return await decrypt(result.apiKey);
    } catch (error) {
      Logger.error('获取API密钥失败', error);
      return null;
    }
  }

  static async saveChatHistory(history) {
    try {
      await chrome.storage.local.set({ chatHistory: history });
    } catch (error) {
      Logger.error('保存对话历史失败', error);
    }
  }

  static async getChatHistory() {
    try {
      const result = await chrome.storage.local.get('chatHistory');
      return result.chatHistory || [];
    } catch (error) {
      Logger.error('获取对话历史失败', error);
      return [];
    }
  }

  static async clearChatHistory() {
    try {
      await chrome.storage.local.remove('chatHistory');
    } catch (error) {
      Logger.error('清除对话历史失败', error);
      throw error;
    }
  }

  static async saveSelectedModel(model) {
    try {
      await chrome.storage.sync.set({ selectedModel: model });
    } catch (error) {
      Logger.error('保存选中模型失败', error);
    }
  }

  static async getSelectedModel() {
    try {
      const result = await chrome.storage.sync.get('selectedModel');
      return result.selectedModel || 'qwen2-72b';
    } catch (error) {
      Logger.error('获取选中模型失败', error);
      return 'qwen2-72b';
    }
  }

  // 保存 baseURL
  static async saveBaseURL(baseURL) {
    try {
      await chrome.storage.sync.set({ baseURL });
      Logger.info('保存 baseURL 成功');
    } catch (error) {
      Logger.error('保存 baseURL 失败', error);
      throw error;
    }
  }

  // 获取 baseURL
  static async getBaseURL() {
    try {
      const result = await chrome.storage.sync.get('baseURL');
      return result.baseURL || 'https://api.example.com'; // 默认值
    } catch (error) {
      Logger.error('获取 baseURL 失败', error);
      return 'https://api.example.com'; // 出错时返回默认值
    }
  }

  // ... 其他存储方法
} 