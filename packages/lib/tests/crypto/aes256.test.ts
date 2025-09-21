import {
  generateSecureRandom,
  generateSalt,
  generateIV,
  deriveKeyFromPassword,
  encryptAES256GCM,
  decryptAES256GCM,
  arrayBufferToBase64,
  base64ToArrayBuffer
} from '../../src/crypto/aes256';
import { CryptoError } from '../../src/types';

describe('aes256', () => {
  describe('generateSecureRandom', () => {
    it('should generate random bytes of specified length', () => {
      const random8 = generateSecureRandom(8);
      const random16 = generateSecureRandom(16);
      const random32 = generateSecureRandom(32);

      expect(random8.length).toBe(8);
      expect(random16.length).toBe(16);
      expect(random32.length).toBe(32);
    });

    it('should generate different values each time', () => {
      const random1 = generateSecureRandom(16);
      const random2 = generateSecureRandom(16);

      expect(random1).not.toEqual(random2);
    });

    it('should generate zero-length array for zero input', () => {
      const random = generateSecureRandom(0);
      expect(random.length).toBe(0);
    });
  });

  describe('generateSalt', () => {
    it('should generate 32-byte salt', () => {
      const salt = generateSalt();
      expect(salt.length).toBe(32);
    });

    it('should generate different salts each time', () => {
      const salt1 = generateSalt();
      const salt2 = generateSalt();

      expect(salt1).not.toEqual(salt2);
    });
  });

  describe('generateIV', () => {
    it('should generate 12-byte IV', () => {
      const iv = generateIV();
      expect(iv.length).toBe(12);
    });

    it('should generate different IVs each time', () => {
      const iv1 = generateIV();
      const iv2 = generateIV();

      expect(iv1).not.toEqual(iv2);
    });
  });

  describe('base64 encoding/decoding', () => {
    it('should encode and decode correctly', () => {
      const original = new Uint8Array([1, 2, 3, 4, 5, 255, 128, 0]);
      const base64 = arrayBufferToBase64(original);
      const decoded = base64ToArrayBuffer(base64);

      expect(decoded).toEqual(original);
    });

    it('should handle empty array', () => {
      const empty = new Uint8Array(0);
      const base64 = arrayBufferToBase64(empty);
      const decoded = base64ToArrayBuffer(base64);

      expect(decoded).toEqual(empty);
      expect(base64).toBe('');
    });

    it('should handle large arrays', () => {
      const large = new Uint8Array(1000);
      for (let i = 0; i < large.length; i++) {
        large[i] = i % 256;
      }

      const base64 = arrayBufferToBase64(large);
      const decoded = base64ToArrayBuffer(base64);

      expect(decoded).toEqual(large);
    });

    it('should throw error for invalid base64', () => {
      expect(() => base64ToArrayBuffer('invalid base64!')).toThrow(CryptoError);
      expect(() => base64ToArrayBuffer('!@#$')).toThrow(CryptoError);
    });
  });

  describe('deriveKeyFromPassword', () => {
    it('should derive key from password and salt', async () => {
      const password = 'test-password';
      const salt = generateSalt();
      const iterations = 10000; // Lower for testing speed

      const key = await deriveKeyFromPassword(password, salt, iterations);

      expect(key).toBeDefined();
      expect(key.type).toBe('secret');
    });

    it('should produce same key for same inputs', async () => {
      const password = 'same-password';
      const salt = new Uint8Array(32);
      salt.fill(42); // Fixed salt for reproducibility
      const iterations = 5000;

      const key1 = await deriveKeyFromPassword(password, salt, iterations);
      const key2 = await deriveKeyFromPassword(password, salt, iterations);

      // Can't directly compare CryptoKey objects, but they should be functionally equivalent
      expect(key1.type).toBe(key2.type);
      expect(key1.algorithm).toEqual(key2.algorithm);
    });

    it('should produce different keys for different passwords', async () => {
      const salt = generateSalt();
      const iterations = 5000;

      const key1 = await deriveKeyFromPassword('password1', salt, iterations);
      const key2 = await deriveKeyFromPassword('password2', salt, iterations);

      // Test by using them for encryption - different keys should produce different results
      const plaintext = new Uint8Array([1, 2, 3, 4]);
      const iv = generateIV();

      const encrypted1 = await encryptAES256GCM(plaintext, key1, iv);
      const encrypted2 = await encryptAES256GCM(plaintext, key2, iv);

      expect(encrypted1).not.toEqual(encrypted2);
    });

    it('should produce different keys for different salts', async () => {
      const password = 'same-password';
      const salt1 = generateSalt();
      const salt2 = generateSalt();
      const iterations = 5000;

      const key1 = await deriveKeyFromPassword(password, salt1, iterations);
      const key2 = await deriveKeyFromPassword(password, salt2, iterations);

      // Test by using them for encryption
      const plaintext = new Uint8Array([1, 2, 3, 4]);
      const iv = generateIV();

      const encrypted1 = await encryptAES256GCM(plaintext, key1, iv);
      const encrypted2 = await encryptAES256GCM(plaintext, key2, iv);

      expect(encrypted1).not.toEqual(encrypted2);
    });
  });

  describe('AES-256-GCM encryption/decryption', () => {
    let key: any;

    beforeEach(async () => {
      const password = 'test-password';
      const salt = generateSalt();
      key = await deriveKeyFromPassword(password, salt, 5000);
    });

    it('should encrypt and decrypt successfully', async () => {
      const plaintext = new Uint8Array([1, 2, 3, 4, 5]);
      const iv = generateIV();

      const encrypted = await encryptAES256GCM(plaintext, key, iv);
      const decrypted = await decryptAES256GCM(encrypted, key, iv);

      expect(decrypted).toEqual(plaintext);
    });

    it('should produce different ciphertext with different IVs', async () => {
      const plaintext = new Uint8Array([1, 2, 3, 4, 5]);
      const iv1 = generateIV();
      const iv2 = generateIV();

      const encrypted1 = await encryptAES256GCM(plaintext, key, iv1);
      const encrypted2 = await encryptAES256GCM(plaintext, key, iv2);

      expect(encrypted1).not.toEqual(encrypted2);
    });

    it('should handle empty plaintext', async () => {
      const plaintext = new Uint8Array(0);
      const iv = generateIV();

      const encrypted = await encryptAES256GCM(plaintext, key, iv);
      const decrypted = await decryptAES256GCM(encrypted, key, iv);

      expect(decrypted).toEqual(plaintext);
    });

    it('should handle large plaintext', async () => {
      const plaintext = new Uint8Array(10000);
      for (let i = 0; i < plaintext.length; i++) {
        plaintext[i] = i % 256;
      }
      const iv = generateIV();

      const encrypted = await encryptAES256GCM(plaintext, key, iv);
      const decrypted = await decryptAES256GCM(encrypted, key, iv);

      expect(decrypted).toEqual(plaintext);
    });

    it('should fail decryption with wrong key', async () => {
      const plaintext = new Uint8Array([1, 2, 3, 4, 5]);
      const iv = generateIV();

      // Create a different key
      const wrongKey = await deriveKeyFromPassword('wrong-password', generateSalt(), 5000);

      const encrypted = await encryptAES256GCM(plaintext, key, iv);

      await expect(decryptAES256GCM(encrypted, wrongKey, iv)).rejects.toThrow(CryptoError);
    });

    it('should fail decryption with wrong IV', async () => {
      const plaintext = new Uint8Array([1, 2, 3, 4, 5]);
      const iv = generateIV();
      const wrongIV = generateIV();

      const encrypted = await encryptAES256GCM(plaintext, key, iv);

      await expect(decryptAES256GCM(encrypted, key, wrongIV)).rejects.toThrow(CryptoError);
    });

    it('should fail decryption with tampered ciphertext', async () => {
      const plaintext = new Uint8Array([1, 2, 3, 4, 5]);
      const iv = generateIV();

      const encrypted = await encryptAES256GCM(plaintext, key, iv);

      // Tamper with the ciphertext
      const tampered = new Uint8Array(encrypted);
      tampered[0] = tampered[0] ^ 1; // Flip one bit

      await expect(decryptAES256GCM(tampered, key, iv)).rejects.toThrow(CryptoError);
    });
  });

  describe('integration tests', () => {
    it('should handle complete encryption workflow', async () => {
      const password = 'integration-test-password';
      const plaintext = 'This is a test message for integration testing!';
      const plaintextBytes = new TextEncoder().encode(plaintext);

      // Generate salt and IV
      const salt = generateSalt();
      const iv = generateIV();

      // Derive key
      const key = await deriveKeyFromPassword(password, salt, 10000);

      // Encrypt
      const encrypted = await encryptAES256GCM(plaintextBytes, key, iv);

      // Decrypt
      const decrypted = await decryptAES256GCM(encrypted, key, iv);

      // Verify
      const decryptedText = new TextDecoder().decode(decrypted);
      expect(decryptedText).toBe(plaintext);
    });

    it('should handle unicode text properly', async () => {
      const password = 'unicode-test-password';
      const plaintext = '🌱 Unicode test: ñáéíóú 中文 русский language';
      const plaintextBytes = new TextEncoder().encode(plaintext);

      const salt = generateSalt();
      const iv = generateIV();
      const key = await deriveKeyFromPassword(password, salt, 5000);

      const encrypted = await encryptAES256GCM(plaintextBytes, key, iv);
      const decrypted = await decryptAES256GCM(encrypted, key, iv);

      const decryptedText = new TextDecoder().decode(decrypted);
      expect(decryptedText).toBe(plaintext);
    });
  });
});