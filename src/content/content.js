import { ChatBox } from './ChatBox';
import { Logger } from '../services/logger';

// 记录 content script 加载
Logger.info('Content script 开始加载');

let chatBox = null;

// 检查聊天框 DOM
function checkChatBoxDOM() {
  if (!chatBox || !chatBox.container) {
    Logger.info('聊天框未初始化');
    return;
  }

  const container = chatBox.container;
  
  Logger.info('聊天框 DOM 状态', {
    exists: !!container,
    inDocument: document.body.contains(container),
    visible: chatBox.visible,
    containerDisplay: container.style.display,
    containerComputed: window.getComputedStyle(container),
    containerDimensions: {
      width: container.offsetWidth,
      height: container.offsetHeight,
      clientWidth: container.clientWidth,
      clientHeight: container.clientHeight
    },
    containerPosition: {
      top: container.style.top,
      right: container.style.right
    },
    containerStyles: {
      backgroundColor: container.style.backgroundColor,
      zIndex: container.style.zIndex
    }
  });
}

// 初始化聊天框
function initChatBox() {
  try {
    if (!chatBox) {
      chatBox = new ChatBox();
      Logger.info('聊天框初始化成功');
      // 初始化后检查 DOM
      checkChatBoxDOM();
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