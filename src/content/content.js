import { ChatBox } from './ChatBox';
import { Logger } from '../services/logger';

// 记录 content script 加载
Logger.info('Content script 开始加载');

let chatBox = null;

// 初始化聊天框
function initChatBox() {
  try {
    if (!chatBox) {
      chatBox = new ChatBox();
      Logger.info('聊天框初始化成功');
    }
  } catch (error) {
    Logger.error('聊天框初始化失败', error);
  }
}

// 监听来自 background 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    Logger.info('收到消息', request);
    
    // 响应 ping 消息
    if (request.action === 'ping') {
      Logger.info('响应 ping 消息');
      sendResponse({ status: 'ok' });
      return true;
    }
    
    // 处理切换聊天框消息
    if (request.action === 'toggleChatBox') {
      if (!chatBox) {
        initChatBox();
      }
      chatBox.toggle();
      Logger.info('切换聊天框状态');
      sendResponse({ success: true });
      return true;
    }
  } catch (error) {
    Logger.error('处理消息失败', error);
    sendResponse({ success: false, error: error.message });
  }
  return true;
});

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  Logger.info('页面加载完成，初始化聊天框');
  initChatBox();
});

// 记录 content script 加载完成
Logger.info('Content script 加载完成'); 