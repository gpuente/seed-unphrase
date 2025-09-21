import {
  encryptText,
  decryptText,
  validateEncryptedData,
  parseEncryptedJSON,
  serializeEncryptedData,
  estimatePasswordStrength
} from '../../src/crypto/textCrypto';
import { CryptoError, CryptoErrorCodes } from '../../src/types';

describe('textCrypto', () => {
  describe('encryptText', () => {
    it('should encrypt text successfully', async () => {
      const plaintext = 'Hello, World!';
      const password = 'test-password-123';

      const encrypted = await encryptText(plaintext, password);

      expect(encrypted.ciphertext).toBeDefined();
      expect(encrypted.salt).toBeDefined();
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.iterations).toBe(100000);
      expect(encrypted.algorithm).toBe('AES-256-GCM-PBKDF2');
    });

    it('should produce different ciphertext for same input', async () => {
      const plaintext = 'Same text';
      const password = 'same-password';

      const encrypted1 = await encryptText(plaintext, password);
      const encrypted2 = await encryptText(plaintext, password);

      expect(encrypted1.ciphertext).not.toBe(encrypted2.ciphertext);
      expect(encrypted1.salt).not.toBe(encrypted2.salt);
      expect(encrypted1.iv).not.toBe(encrypted2.iv);
    });

    it('should handle unicode text', async () => {
      const plaintext = '🌱 Unicode: ñáéíóú 中文 русский';
      const password = 'unicode-password';

      const encrypted = await encryptText(plaintext, password);
      expect(encrypted.ciphertext).toBeDefined();
    });

    it('should handle large text', async () => {
      const plaintext = 'A'.repeat(10000); // 10KB text
      const password = 'large-text-password';

      const encrypted = await encryptText(plaintext, password);
      expect(encrypted.ciphertext).toBeDefined();
    });

    it('should throw error for empty plaintext', async () => {
      await expect(encryptText('', 'password')).rejects.toThrow(CryptoError);
      await expect(encryptText('', 'password')).rejects.toThrow('Plaintext cannot be empty');
    });

    it('should throw error for empty password', async () => {
      await expect(encryptText('text', '')).rejects.toThrow(CryptoError);
      await expect(encryptText('text', '   ')).rejects.toThrow(CryptoError);
    });

    it('should use custom iterations', async () => {
      const plaintext = 'Test text';
      const password = 'test-password';
      const iterations = 50000;

      const encrypted = await encryptText(plaintext, password, iterations);
      expect(encrypted.iterations).toBe(iterations);
    });
  });

  describe('decryptText', () => {
    it('should decrypt text successfully', async () => {
      const plaintext = 'Hello, Decryption!';
      const password = 'decrypt-password-123';

      const encrypted = await encryptText(plaintext, password);
      const decrypted = await decryptText(encrypted, password);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle unicode text decryption', async () => {
      const plaintext = '🔐 Encrypted: ñáéíóú 中文 русский';
      const password = 'unicode-decrypt-password';

      const encrypted = await encryptText(plaintext, password);
      const decrypted = await decryptText(encrypted, password);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle large text decryption', async () => {
      const plaintext = 'B'.repeat(5000);
      const password = 'large-decrypt-password';

      const encrypted = await encryptText(plaintext, password);
      const decrypted = await decryptText(encrypted, password);

      expect(decrypted).toBe(plaintext);
    });

    it('should throw error for wrong password', async () => {
      const plaintext = 'Secret message';
      const password = 'correct-password';
      const wrongPassword = 'wrong-password';

      const encrypted = await encryptText(plaintext, password);

      await expect(decryptText(encrypted, wrongPassword)).rejects.toThrow(CryptoError);
    });

    it('should throw error for empty password', async () => {
      const encrypted = {
        ciphertext: 'dGVzdA==',
        salt: 'dGVzdA==',
        iv: 'dGVzdA==',
        iterations: 100000,
        algorithm: 'AES-256-GCM-PBKDF2'
      };

      await expect(decryptText(encrypted, '')).rejects.toThrow(CryptoError);
      await expect(decryptText(encrypted, '   ')).rejects.toThrow(CryptoError);
    });

    it('should throw error for invalid encrypted data', async () => {
      const invalidData = {
        ciphertext: '',
        salt: 'dGVzdA==',
        iv: 'dGVzdA==',
        iterations: 100000,
        algorithm: 'AES-256-GCM-PBKDF2'
      };

      await expect(decryptText(invalidData, 'password')).rejects.toThrow(CryptoError);
    });

    it('should throw error for unsupported algorithm', async () => {
      const encrypted = {
        ciphertext: 'dGVzdA==',
        salt: 'dGVzdA==',
        iv: 'dGVzdA==',
        iterations: 100000,
        algorithm: 'UNSUPPORTED-ALGORITHM'
      };

      await expect(decryptText(encrypted, 'password')).rejects.toThrow(CryptoError);
      await expect(decryptText(encrypted, 'password')).rejects.toThrow('Unsupported algorithm');
    });
  });

  describe('end-to-end encryption/decryption', () => {
    const testCases = [
      { description: 'simple text', plaintext: 'Simple message', password: 'simple-pass' },
      { description: 'empty string', plaintext: ' ', password: 'empty-pass' },
      { description: 'special characters', plaintext: '!@#$%^&*()_+-=[]{}|;:,.<>?', password: 'special-pass' },
      { description: 'newlines and tabs', plaintext: 'Line 1\nLine 2\tTabbed', password: 'newline-pass' },
      { description: 'unicode', plaintext: '🌱🔐💻 Unicode test', password: 'unicode-pass' },
      { description: 'long text', plaintext: 'A'.repeat(1000), password: 'long-pass' }
    ];

    testCases.forEach(({ description, plaintext, password }) => {
      it(`should encrypt and decrypt ${description}`, async () => {
        const encrypted = await encryptText(plaintext, password);
        const decrypted = await decryptText(encrypted, password);
        expect(decrypted).toBe(plaintext);
      });
    });
  });

  describe('validateEncryptedData', () => {
    it('should validate correct encrypted data', () => {
      const validData = {
        ciphertext: 'dGVzdA==',
        salt: 'dGVzdA==',
        iv: 'dGVzdA==',
        iterations: 100000,
        algorithm: 'AES-256-GCM-PBKDF2'
      };

      expect(validateEncryptedData(validData)).toBe(true);
    });

    it('should reject invalid data types', () => {
      expect(validateEncryptedData(null)).toBe(false);
      expect(validateEncryptedData(undefined)).toBe(false);
      expect(validateEncryptedData('string')).toBe(false);
      expect(validateEncryptedData(123)).toBe(false);
      expect(validateEncryptedData([])).toBe(false);
    });

    it('should reject missing fields', () => {
      const incomplete = {
        ciphertext: 'dGVzdA==',
        salt: 'dGVzdA==',
        // missing iv, iterations, algorithm
      };

      expect(validateEncryptedData(incomplete)).toBe(false);
    });

    it('should reject invalid field types', () => {
      const invalidTypes = {
        ciphertext: 123, // should be string
        salt: 'dGVzdA==',
        iv: 'dGVzdA==',
        iterations: '100000', // should be number
        algorithm: 'AES-256-GCM-PBKDF2'
      };

      expect(validateEncryptedData(invalidTypes)).toBe(false);
    });

    it('should reject invalid iterations', () => {
      const zeroIterations = {
        ciphertext: 'dGVzdA==',
        salt: 'dGVzdA==',
        iv: 'dGVzdA==',
        iterations: 0,
        algorithm: 'AES-256-GCM-PBKDF2'
      };

      expect(validateEncryptedData(zeroIterations)).toBe(false);
    });
  });

  describe('parseEncryptedJSON', () => {
    it('should parse valid JSON', () => {
      const validData = {
        ciphertext: 'dGVzdA==',
        salt: 'dGVzdA==',
        iv: 'dGVzdA==',
        iterations: 100000,
        algorithm: 'AES-256-GCM-PBKDF2'
      };
      const json = JSON.stringify(validData);

      const parsed = parseEncryptedJSON(json);
      expect(parsed).toEqual(validData);
    });

    it('should throw error for invalid JSON', () => {
      expect(() => parseEncryptedJSON('invalid json')).toThrow(CryptoError);
      expect(() => parseEncryptedJSON('{invalid}')).toThrow(CryptoError);
    });

    it('should throw error for valid JSON but invalid structure', () => {
      const invalidStructure = JSON.stringify({ invalid: 'data' });
      expect(() => parseEncryptedJSON(invalidStructure)).toThrow(CryptoError);
    });
  });

  describe('serializeEncryptedData', () => {
    it('should serialize encrypted data to formatted JSON', () => {
      const data = {
        ciphertext: 'dGVzdA==',
        salt: 'dGVzdA==',
        iv: 'dGVzdA==',
        iterations: 100000,
        algorithm: 'AES-256-GCM-PBKDF2'
      };

      const serialized = serializeEncryptedData(data);
      expect(typeof serialized).toBe('string');
      expect(JSON.parse(serialized)).toEqual(data);
      expect(serialized).toContain('\n'); // Should be formatted
    });
  });

  describe('estimatePasswordStrength', () => {
    it('should rate weak passwords correctly', () => {
      const weak = estimatePasswordStrength('123');
      expect(weak.strength).toBe('weak');
      expect(weak.score).toBeLessThan(3);
      expect(weak.feedback.length).toBeGreaterThan(0);
    });

    it('should rate medium passwords correctly', () => {
      const medium = estimatePasswordStrength('password1'); // lower case to get medium
      expect(medium.strength).toBe('medium');
      expect(medium.score).toBeGreaterThanOrEqual(3);
      expect(medium.score).toBeLessThan(4);
    });

    it('should rate strong passwords correctly', () => {
      const strong = estimatePasswordStrength('Password1!');
      expect(strong.strength).toBe('strong');
      expect(strong.score).toBeGreaterThanOrEqual(4);
      expect(strong.score).toBeLessThan(6);
    });

    it('should rate very strong passwords correctly', () => {
      const veryStrong = estimatePasswordStrength('VeryStrongPassword123!@#');
      expect(veryStrong.strength).toBe('very-strong');
      expect(veryStrong.score).toBeGreaterThanOrEqual(6);
      expect(veryStrong.feedback).toContain('Password looks good!');
    });

    it('should provide helpful feedback', () => {
      const simple = estimatePasswordStrength('abc');
      expect(simple.feedback).toContain('Use at least 8 characters');
      expect(simple.feedback).toContain('Include uppercase letters');
      expect(simple.feedback).toContain('Include numbers');
      expect(simple.feedback).toContain('Include special characters');
    });
  });
});