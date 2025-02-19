/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
// 定义 Logger
const Logger = {
  error: (...args) => {
    console.error('[ERROR]', new Date().toISOString(), ...args);
    // 可选：错误记录到存储或发送到服务器
  },
  info: (...args) => {
    console.info('[INFO]', new Date().toISOString(), ...args);
  },
  warn: (...args) => {
    console.warn('[WARN]', new Date().toISOString(), ...args);
  },
  debug: (...args) => {
    if (false) {}
  },
  // 格式化对象
  formatError: error => ({
    message: error.message,
    stack: error.stack,
    name: error.name,
    timestamp: new Date().toISOString()
  }),
  // 分组日志
  group: (label, callback) => {
    console.group(`[GROUP] ${label}`);
    try {
      callback();
    } finally {
      console.groupEnd();
    }
  },
  // 性能计时
  time: label => {
    console.time(`[TIMER] ${label}`);
  },
  timeEnd: label => {
    console.timeEnd(`[TIMER] ${label}`);
  }
};

// 防止生产环境打印调试信息
if (true) {
  Logger.debug = () => {};
}

// 等待 Service Worker 激活
self.addEventListener('activate', () => {
  Logger.info('Service Worker 激活');
});

// 等待 Service Worker 安装
self.addEventListener('install', () => {
  Logger.info('Service Worker 安装');
  self.skipWaiting();
});

// 检查 content script 是否已加载
async function checkContentScript(tabId) {
  try {
    const response = await chrome.tabs.sendMessage(tabId, {
      action: 'ping'
    });
    Logger.info('Content script 检查结果', response);
    return response && response.status === 'ok';
  } catch (error) {
    Logger.info('Content script 未加载', error);
    return false;
  }
}

// 确保在 chrome API 可用时再注册监听器
async function registerListeners() {
  try {
    var _action$onClicked;
    Logger.info('开始注册监听器');

    // 更严格的 API 检查
    const chrome = globalThis.chrome;
    if (!chrome) {
      throw new Error('Chrome API 未定义');
    }

    // 等待 Chrome API 初始化
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 直接获取需要使用的 API 引用
    const {
      action,
      runtime,
      tabs,
      scripting
    } = chrome;

    // 更详细的 API 检查
    if (!(action !== null && action !== void 0 && (_action$onClicked = action.onClicked) !== null && _action$onClicked !== void 0 && _action$onClicked.addListener)) {
      var _action$onClicked2;
      throw new Error(`chrome.action.onClicked.addListener 不可用: ${JSON.stringify({
        action: !!action,
        onClicked: !!(action !== null && action !== void 0 && action.onClicked),
        addListener: !!(action !== null && action !== void 0 && (_action$onClicked2 = action.onClicked) !== null && _action$onClicked2 !== void 0 && _action$onClicked2.addListener)
      })}`);
    }

    // 保存引用以确保稳定性
    const onClicked = action.onClicked;

    // 使用保存的引用注册监听器
    onClicked.addListener(async tab => {
      Logger.info('扩展图标被点击', {
        tabId: tab === null || tab === void 0 ? void 0 : tab.id
      });
      if (!tab.id) {
        Logger.error('无效的标签页ID');
        return;
      }
      try {
        // 使用之前保存的 API 引用
        const isLoaded = await checkContentScript(tab.id);
        Logger.info('Content script 状态检查', {
          isLoaded
        });
        if (!isLoaded) {
          await scripting.executeScript({
            target: {
              tabId: tab.id
            },
            files: ['src/content/content.js']
          });
          Logger.info('Content script 注入成功');
        }
        await tabs.sendMessage(tab.id, {
          action: 'toggleChatBox'
        });
        Logger.info('切换对话框消息发送成功');
      } catch (error) {
        Logger.error('处理点击事件失败', error);
      }
    });
    Logger.info('监听器注册成功');
  } catch (error) {
    var _chrome;
    Logger.error('注册监听器失败', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      chromeExists: typeof chrome !== 'undefined',
      actionExists: typeof ((_chrome = chrome) === null || _chrome === void 0 ? void 0 : _chrome.action) !== 'undefined'
    });
    throw error;
  }
}

// 确保在 Service Worker 环境中
if ('serviceWorker' in navigator) {
  self.addEventListener('activate', async event => {
    Logger.info('Service Worker 激活开始');
    try {
      await registerListeners();
      Logger.info('Service Worker 激活完成，监听器注册成功');
    } catch (error) {
      Logger.error('Service Worker 激活过程中出错', {
        phase: 'activate',
        error: Logger.formatError(error)
      });
    }
  });
}

// 导出 Logger
/* unused harmony default export */ var __WEBPACK_DEFAULT_EXPORT__ = ((/* unused pure expression or super */ null && (Logger)));
/******/ })()
;
//# sourceMappingURL=background.js.map