// 错误处理工具
export class ErrorHandler {
  static handle(error, context) {
    Logger.error(`${context}: ${error.message}`, error);
    
    // 根据错误类型显示不同的用户提示
    if (error.name === 'NetworkError') {
      return '网络连接失败，请检查网络设置';
    }
    if (error.name === 'AuthenticationError') {
      return 'API密钥无效，请在设置中重新配置';
    }
    return '发生未知错误，请稍后重试';
  }
} 