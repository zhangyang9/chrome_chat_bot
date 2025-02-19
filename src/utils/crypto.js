// 使用 AES 加密算法
const CRYPTO_KEY = 'tc-chat-security-key';

export async function encrypt(text) {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    
    const key = await deriveKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    
    const encryptedArray = new Uint8Array(encryptedData);
    const resultArray = new Uint8Array(iv.length + encryptedArray.length);
    resultArray.set(iv);
    resultArray.set(encryptedArray, iv.length);
    
    return btoa(String.fromCharCode.apply(null, resultArray));
  } catch (error) {
    Logger.error('加密失败', error);
    throw error;
  }
}

export async function decrypt(encryptedText) {
  try {
    const binary = atob(encryptedText);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    
    const iv = bytes.slice(0, 12);
    const data = bytes.slice(12);
    
    const key = await deriveKey();
    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    
    return new TextDecoder().decode(decryptedData);
  } catch (error) {
    Logger.error('解密失败', error);
    throw error;
  }
}

async function deriveKey() {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(CRYPTO_KEY),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  
  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('tc-chat-salt'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
} 