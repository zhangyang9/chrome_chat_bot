// API 服务封装
import { OpenAI } from 'openai';

export class AIService {
  constructor(apiKey) {
    this.client = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://oneai.17usoft.com/v1',
      dangerouslyAllowBrowser: true  // 允许在浏览器环境中使用
    });
  }

  async sendMessage(model, messages, onChunk) {
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