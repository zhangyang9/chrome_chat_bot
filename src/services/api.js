// API 服务封装
import { OpenAI } from 'openai';
import { StorageService } from './storage';

export class AIService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = null; // 初始化为 null
    this.client = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://oneai.17usoft.com/v1', // 默认值，生产环境会从配置页面获取
      dangerouslyAllowBrowser: true  // 允许在浏览器环境中使用
    });
  }

  async init() {
    // 从配置获取 baseURL
    this.baseURL = await StorageService.getBaseURL();
  }

  async sendMessage(model, messages, onChunk) {
    if (!this.baseURL) {
      await this.init(); // 确保 baseURL 已加载
    }

    try {
      const response = await this.client.chat.completions.create({
        model: model,
        messages: messages,
        stream: true
      });
      
      for await (const chunk of response) {
        onChunk(chunk.choices[0]?.delta?.content || '');
      }
    } catch (error) {
      Logger.error('API调用失败', error);
      throw new Error('消息发送失败，请检查网络连接或API配置');
    }
  }
} 