import { EncryptedData, CryptoError, CryptoErrorCodes } from '../types';
import {
  generateSalt,
  generateIV,
  deriveKeyFromPassword,
  encryptAES256GCM,
  decryptAES256GCM,
  arrayBufferToBase64,
  base64ToArrayBuffer
} from './aes256';

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const DEFAULT_ITERATIONS = 100000;
const ALGORITHM_IDENTIFIER = 'AES-256-GCM-PBKDF2';

export async function encryptText(
  plaintext: string,
  password: string,
  iterations: number = DEFAULT_ITERATIONS
): Promise<EncryptedData> {
  if (!plaintext) {
    throw new CryptoError(
      'Plaintext cannot be empty',
      CryptoErrorCodes.INVALID_FORMAT
    );
  }

  if (!password || password.trim().length === 0) {
    throw new CryptoError(
      'Password cannot be empty',
      CryptoErrorCodes.INVALID_PASSWORD
    );
  }

  try {
    // Generate salt and IV
    const salt = generateSalt();
    const iv = generateIV();

    // Derive key from password
    const key = await deriveKeyFromPassword(password, salt, iterations);

    // Encrypt the plaintext
    const plaintextBytes = textEncoder.encode(plaintext);
    const ciphertext = await encryptAES256GCM(plaintextBytes, key, iv);

    // Return encrypted data
    return {
      ciphertext: arrayBufferToBase64(ciphertext),
      salt: arrayBufferToBase64(salt),
      iv: arrayBufferToBase64(iv),
      iterations: iterations,
      algorithm: ALGORITHM_IDENTIFIER
    };
  } catch (error) {
    if (error instanceof CryptoError) {
      throw error;
    }
    throw new CryptoError(
      `Text encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      CryptoErrorCodes.ENCRYPTION_FAILED
    );
  }
}

export async function decryptText(
  encryptedData: EncryptedData,
  password: string
): Promise<string> {
  if (!password || password.trim().length === 0) {
    throw new CryptoError(
      'Password cannot be empty',
      CryptoErrorCodes.INVALID_PASSWORD
    );
  }

  if (!encryptedData.ciphertext || !encryptedData.salt || !encryptedData.iv) {
    throw new CryptoError(
      'Invalid encrypted data: missing required fields',
      CryptoErrorCodes.INVALID_ENCRYPTED_DATA
    );
  }

  if (encryptedData.algorithm !== ALGORITHM_IDENTIFIER) {
    throw new CryptoError(
      `Unsupported algorithm: ${encryptedData.algorithm}`,
      CryptoErrorCodes.INVALID_ENCRYPTED_DATA
    );
  }

  try {
    // Decode the encrypted data
    const ciphertext = base64ToArrayBuffer(encryptedData.ciphertext);
    const salt = base64ToArrayBuffer(encryptedData.salt);
    const iv = base64ToArrayBuffer(encryptedData.iv);

    // Derive key from password
    const key = await deriveKeyFromPassword(password, salt, encryptedData.iterations);

    // Decrypt the ciphertext
    const plaintextBytes = await decryptAES256GCM(ciphertext, key, iv);

    // Decode to string
    return textDecoder.decode(plaintextBytes);
  } catch (error) {
    if (error instanceof CryptoError) {
      throw error;
    }
    throw new CryptoError(
      `Text decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      CryptoErrorCodes.DECRYPTION_FAILED
    );
  }
}

export function validateEncryptedData(data: any): data is EncryptedData {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.ciphertext === 'string' &&
    typeof data.salt === 'string' &&
    typeof data.iv === 'string' &&
    typeof data.iterations === 'number' &&
    typeof data.algorithm === 'string' &&
    data.iterations > 0
  );
}

export function parseEncryptedJSON(json: string): EncryptedData {
  try {
    const data = JSON.parse(json);
    if (!validateEncryptedData(data)) {
      throw new CryptoError(
        'Invalid encrypted data format',
        CryptoErrorCodes.INVALID_ENCRYPTED_DATA
      );
    }
    return data;
  } catch (error) {
    if (error instanceof CryptoError) {
      throw error;
    }
    throw new CryptoError(
      `Failed to parse encrypted JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
      CryptoErrorCodes.INVALID_FORMAT
    );
  }
}

export function serializeEncryptedData(data: EncryptedData): string {
  return JSON.stringify(data, null, 2);
}

export function estimatePasswordStrength(password: string): {
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score += 1;
  else feedback.push('Use at least 8 characters');

  if (password.length >= 12) score += 1;
  else if (password.length >= 8) feedback.push('Consider using 12+ characters');

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Include lowercase letters');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Include uppercase letters');

  if (/[0-9]/.test(password)) score += 1;
  else feedback.push('Include numbers');

  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  else feedback.push('Include special characters');

  if (password.length >= 16) score += 1;

  let strength: 'weak' | 'medium' | 'strong' | 'very-strong' = 'weak';
  if (score >= 6) strength = 'very-strong';
  else if (score >= 4) strength = 'strong';
  else if (score >= 3) strength = 'medium';

  if (feedback.length === 0) {
    feedback.push('Password looks good!');
  }

  return { strength, score, feedback };
}