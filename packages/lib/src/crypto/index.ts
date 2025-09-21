// Main crypto module exports
export {
  encryptText,
  decryptText,
  validateEncryptedData,
  parseEncryptedJSON,
  serializeEncryptedData,
  estimatePasswordStrength
} from './textCrypto';

export {
  generateSecureRandom,
  generateSalt,
  generateIV,
  deriveKeyFromPassword,
  encryptAES256GCM,
  decryptAES256GCM,
  arrayBufferToBase64,
  base64ToArrayBuffer
} from './aes256';

export type { EncryptedData } from '../types';
export { CryptoError, CryptoErrorCodes } from '../types';