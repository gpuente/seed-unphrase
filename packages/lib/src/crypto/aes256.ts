import { CryptoError, CryptoErrorCodes } from '../types';

const textEncoder = new TextEncoder();

function getCrypto(): any {
  // Browser environment
  if (typeof globalThis !== 'undefined' && (globalThis as any).crypto) {
    return (globalThis as any).crypto;
  }

  // Check for window in browser
  if (typeof globalThis !== 'undefined' &&
      (globalThis as any).window &&
      (globalThis as any).window.crypto) {
    return (globalThis as any).window.crypto;
  }

  try {
    // Node.js environment
    const { webcrypto } = require('crypto');
    return webcrypto;
  } catch {
    throw new CryptoError(
      'Web Crypto API not available in this environment',
      CryptoErrorCodes.CRYPTO_NOT_AVAILABLE
    );
  }
}

export function generateSecureRandom(length: number): Uint8Array {
  const crypto = getCrypto();
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return array;
}

export function generateSalt(): Uint8Array {
  return generateSecureRandom(32); // 256 bits
}

export function generateIV(): Uint8Array {
  return generateSecureRandom(12); // 96 bits for GCM
}

export async function deriveKeyFromPassword(
  password: string,
  salt: Uint8Array,
  iterations: number = 100000
): Promise<any> {
  const crypto = getCrypto();

  try {
    // Import password as key material
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      textEncoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    // Derive AES key using PBKDF2
    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: iterations,
        hash: 'SHA-256'
      },
      passwordKey,
      {
        name: 'AES-GCM',
        length: 256
      },
      false,
      ['encrypt', 'decrypt']
    );

    return derivedKey;
  } catch (error) {
    throw new CryptoError(
      `Key derivation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      CryptoErrorCodes.KEY_DERIVATION_FAILED
    );
  }
}

export async function encryptAES256GCM(
  plaintext: Uint8Array,
  key: any,
  iv: Uint8Array
): Promise<Uint8Array> {
  const crypto = getCrypto();

  try {
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      plaintext
    );

    return new Uint8Array(encrypted);
  } catch (error) {
    throw new CryptoError(
      `Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      CryptoErrorCodes.ENCRYPTION_FAILED
    );
  }
}

export async function decryptAES256GCM(
  ciphertext: Uint8Array,
  key: any,
  iv: Uint8Array
): Promise<Uint8Array> {
  const crypto = getCrypto();

  try {
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      ciphertext
    );

    return new Uint8Array(decrypted);
  } catch (error) {
    throw new CryptoError(
      `Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      CryptoErrorCodes.DECRYPTION_FAILED
    );
  }
}

export function arrayBufferToBase64(buffer: Uint8Array): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToArrayBuffer(base64: string): Uint8Array {
  try {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch (error) {
    throw new CryptoError(
      `Invalid base64 string: ${error instanceof Error ? error.message : 'Unknown error'}`,
      CryptoErrorCodes.INVALID_FORMAT
    );
  }
}