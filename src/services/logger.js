export class Logger {
  static levels = {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug'
  };

  static error(message, error) {
    console.error(`[ERROR] ${message}`, error);
    // 可以在这里添加错误上报逻辑
  }

  static warn(message, data = {}) {
    console.warn(`[WARN] ${message}`, data);
  }

  static info(message, data = {}) {
    console.info(`[INFO] ${message}`, data);
  }

  static debug(message, data = {}) {
    console.debug(`[DEBUG] ${message}`, data);
  }
} 