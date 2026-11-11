import CryptoJS from 'crypto-js';

const encryptionKey = process.env.EXPO_PUBLIC_ENCRYPTION_KEY;

function readKey(): CryptoJS.lib.WordArray {
  if (!/^[0-9a-fA-F]{64}$/.test(encryptionKey ?? '')) {
    throw new Error('EXPO_PUBLIC_ENCRYPTION_KEY must contain exactly 64 hexadecimal characters');
  }
  return CryptoJS.enc.Hex.parse(encryptionKey!);
}

export function encryptLoginPassword(password: string): string {
  const iv = CryptoJS.lib.WordArray.random(16);
  const encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(password), readKey(), {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return `${iv.toString(CryptoJS.enc.Hex).toLowerCase()}:${encrypted.ciphertext
    .toString(CryptoJS.enc.Hex)
    .toLowerCase()}`;
}
