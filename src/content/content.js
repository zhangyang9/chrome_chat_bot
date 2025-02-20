import { ChatBox } from './ChatBox';
import { Logger } from '../services/logger';

// 记录 content script 加载
Logger.info('Content script 开始加载');

let chatBox = null;

// 检查聊天框 DOM
function checkChatBoxDOM() {
  try {
    // 检查 chatBox 实例
    if (!chatBox) {
      Logger.info('聊天框实例不存在');
      return;
    }

    // 检查 container
    if (!chatBox.container) {
      Logger.info('聊天框容器不存在');
      return;
    }

    // 检查 container 是否在文档中
    if (!document.body.contains(chatBox.container)) {
      Logger.info('聊天框容器不在文档中');
      return;
    }

    // 获取基本状态
    const status = {
      exists: true,
      inDocument: true,
      visible: chatBox.visible,
      display: chatBox.container.style.display
    };

    // 获取尺寸
    const dimensions = {
      offsetWidth: chatBox.container.offsetWidth,
      offsetHeight: chatBox.container.offsetHeight,
      clientWidth: chatBox.container.clientWidth,
      clientHeight: chatBox.container.clientHeight
    };

    // 获取位置
    const position = {
      top: chatBox.container.style.top,
      right: chatBox.container.style.right
    };

    // 记录状态
    Logger.info('聊天框状态检查', {
      ...status,
      dimensions,
      position,
      styles: {
        backgroundColor: chatBox.container.style.backgroundColor,
        zIndex: chatBox.container.style.zIndex
      }
    });

  } catch (error) {
    Logger.error('状态检查失败', error);
  }
}

// 初始化聊天框
async function initChatBox() {
  try {
    if (!chatBox) {
      Logger.info('开始初始化聊天框');
      chatBox = new ChatBox();
      
      // 等待一帧以确保 DOM 更新
      await new Promise(requestAnimationFrame);
      
      // 检查初始化结果
      checkChatBoxDOM();
      
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
      // 切换后检查 DOM
      checkChatBoxDOM();
      
      Logger.info('切换聊天框状态', { visible: chatBox.visible });
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