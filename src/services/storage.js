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

  static async saveSettings(settings) {
    try {
      // 加密敏感配置
      const encryptedSettings = {
        ...settings,
        env: await encrypt(settings.env)
      };
      await chrome.storage.sync.set({ settings: encryptedSettings });
    } catch (error) {
      Logger.error('保存设置失败', error);
      throw error;
    }
  }

  static async getSettings() {
    try {
      const result = await chrome.storage.sync.get('settings');
      if (!result.settings) return {};

      // 解密敏感配置
      return {
        ...result.settings,
        env: result.settings.env ? await decrypt(result.settings.env) : 'prod'
      };
    } catch (error) {
      Logger.error('获取设置失败', error);
      return {};
    }
  }

  // ... 其他存储方法
} 