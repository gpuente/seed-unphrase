import { concealSeedPhrase, validateSeedPhrase, formatConcealResult } from '../src/encoder';
import { SeedPhraseError } from '../src/types';
import * as fs from 'fs';

// Mock fs module for testing
jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('encoder', () => {
  const mockWordList = 'abandon\nability\nable\nabout\nabove\nabsent\nabsorb\nabstract\nabsurd\nabuse';
  
  beforeEach(() => {
    // Clear any cached word list
    jest.clearAllMocks();
    mockedFs.readFileSync.mockReturnValue(mockWordList);
  });

  describe('validateSeedPhrase', () => {
    it('should validate a phrase with all valid words', () => {
      const result = validateSeedPhrase('abandon ability able');
      
      expect(result.validWords).toEqual(['abandon', 'ability', 'able']);
      expect(result.invalidWords).toEqual([]);
      expect(result.wordIndices).toEqual([0, 1, 2]);
    });

    it('should validate a phrase with some invalid words', () => {
      const result = validateSeedPhrase('abandon invalid able nonexistent');
      
      expect(result.validWords).toEqual(['abandon', 'able']);
      expect(result.invalidWords).toEqual(['invalid', 'nonexistent']);
      expect(result.wordIndices).toEqual([0, 0, 2, 0]); // Invalid words get index 0
    });

    it('should handle single word phrase', () => {
      const result = validateSeedPhrase('abandon');
      
      expect(result.validWords).toEqual(['abandon']);
      expect(result.invalidWords).toEqual([]);
      expect(result.wordIndices).toEqual([0]);
    });

    it('should be case insensitive', () => {
      const result = validateSeedPhrase('ABANDON Ability aBLe');
      
      expect(result.validWords).toEqual(['abandon', 'ability', 'able']);
      expect(result.invalidWords).toEqual([]);
      expect(result.wordIndices).toEqual([0, 1, 2]);
    });

    it('should handle extra whitespace', () => {
      const result = validateSeedPhrase('  abandon   ability    able  ');
      
      expect(result.validWords).toEqual(['abandon', 'ability', 'able']);
      expect(result.invalidWords).toEqual([]);
      expect(result.wordIndices).toEqual([0, 1, 2]);
    });

    it('should throw error for empty phrase', () => {
      expect(() => validateSeedPhrase('')).toThrow(SeedPhraseError);
      expect(() => validateSeedPhrase('   ')).toThrow('Seed phrase cannot be empty');
    });

    it('should throw error for phrase too long', () => {
      const longPhrase = new Array(25).fill('abandon').join(' ');
      expect(() => validateSeedPhrase(longPhrase)).toThrow(SeedPhraseError);
      expect(() => validateSeedPhrase(longPhrase)).toThrow('Seed phrase cannot exceed 24 words');
    });
  });

  describe('concealSeedPhrase', () => {
    it('should conceal a valid seed phrase', () => {
      const options = {
        phrase: 'abandon ability able',
        cipherKey: '137643'
      };
      
      const { result, validation } = concealSeedPhrase(options);
      
      expect(validation.validWords).toEqual(['abandon', 'ability', 'able']);
      expect(validation.invalidWords).toEqual([]);
      expect(result.originalWordCount).toBe(3);
      expect(result.quotient).toBeTruthy();
      expect(result.remainder).toBeTruthy();
      
      // Verify the numbers are strings (for JSON serialization)
      expect(typeof result.quotient).toBe('string');
      expect(typeof result.remainder).toBe('string');
      
      // Verify they can be parsed back to BigInt
      expect(() => BigInt(result.quotient)).not.toThrow();
      expect(() => BigInt(result.remainder)).not.toThrow();
    });

    it('should handle invalid words in phrase', () => {
      const options = {
        phrase: 'abandon invalid able',
        cipherKey: '137643'
      };
      
      const { result, validation } = concealSeedPhrase(options);
      
      expect(validation.validWords).toEqual(['abandon', 'able']);
      expect(validation.invalidWords).toEqual(['invalid']);
      expect(result.originalWordCount).toBe(3);
    });

    it('should handle single word phrase', () => {
      const options = {
        phrase: 'abandon',
        cipherKey: '123'
      };
      
      const { result, validation } = concealSeedPhrase(options);
      
      expect(validation.validWords).toEqual(['abandon']);
      expect(validation.invalidWords).toEqual([]);
      expect(result.originalWordCount).toBe(1);
    });

    it('should handle large cipher key', () => {
      const options = {
        phrase: 'abandon ability able',
        cipherKey: '123456789012345678901234567890'
      };
      
      const { result } = concealSeedPhrase(options);
      
      expect(result.quotient).toBeTruthy();
      expect(result.remainder).toBeTruthy();
    });

    it('should throw error for invalid cipher key', () => {
      const options = {
        phrase: 'abandon ability able',
        cipherKey: '0'
      };
      
      expect(() => concealSeedPhrase(options)).toThrow(SeedPhraseError);
      expect(() => concealSeedPhrase(options)).toThrow('Cipher key must be a positive number');
    });

    it('should throw error for non-numeric cipher key', () => {
      const options = {
        phrase: 'abandon ability able',
        cipherKey: 'abc'
      };
      
      expect(() => concealSeedPhrase(options)).toThrow(SeedPhraseError);
      expect(() => concealSeedPhrase(options)).toThrow('Cipher key must be a valid number');
    });

    it('should throw error for empty cipher key', () => {
      const options = {
        phrase: 'abandon ability able',
        cipherKey: ''
      };
      
      expect(() => concealSeedPhrase(options)).toThrow(SeedPhraseError);
      expect(() => concealSeedPhrase(options)).toThrow('Cipher key cannot be empty');
    });

    it('should produce different results for different cipher keys', () => {
      const phrase = 'abandon ability able';
      
      const result1 = concealSeedPhrase({ phrase, cipherKey: '123' });
      const result2 = concealSeedPhrase({ phrase, cipherKey: '456' });
      
      expect(result1.result.quotient).not.toBe(result2.result.quotient);
    });

    it('should handle 24-word phrases', () => {
      const words = mockWordList.split('\n').slice(0, 10);
      const phrase = new Array(24).fill(words).flat().slice(0, 24).join(' ');
      
      const options = {
        phrase,
        cipherKey: '137643'
      };
      
      const { result } = concealSeedPhrase(options);
      
      expect(result.originalWordCount).toBe(24);
      expect(result.quotient).toBeTruthy();
      expect(result.remainder).toBeTruthy();
    });
  });

  describe('formatConcealResult', () => {
    it('should format concealed result correctly', () => {
      const result = {
        quotient: '12345',
        remainder: '67890',
        originalWordCount: 3
      };
      
      const formatted = formatConcealResult(result);
      expect(formatted).toBe('12345:67890');
    });

    it('should handle zero values', () => {
      const result = {
        quotient: '0',
        remainder: '0',
        originalWordCount: 1
      };
      
      const formatted = formatConcealResult(result);
      expect(formatted).toBe('0:0');
    });

    it('should handle large numbers', () => {
      const result = {
        quotient: '123456789012345678901234567890',
        remainder: '987654321098765432109876543210',
        originalWordCount: 24
      };
      
      const formatted = formatConcealResult(result);
      expect(formatted).toBe('123456789012345678901234567890:987654321098765432109876543210');
    });
  });

  describe('salt functionality', () => {
    it('should conceal with salt successfully', () => {
      const options = {
        phrase: 'abandon ability able',
        cipherKey: '137643',
        salt: 'test_salt'
      };
      
      const { result, validation } = concealSeedPhrase(options);
      
      expect(validation.validWords).toEqual(['abandon', 'ability', 'able']);
      expect(validation.invalidWords).toEqual([]);
      expect(result.originalWordCount).toBe(3);
      expect(result.quotient).toBeTruthy();
      expect(result.remainder).toBeTruthy();
    });

    it('should produce different results with different salts', () => {
      const phrase = 'abandon ability able';
      const cipherKey = '137643';
      
      const result1 = concealSeedPhrase({ phrase, cipherKey });
      const result2 = concealSeedPhrase({ phrase, cipherKey, salt: 'salt1' });
      const result3 = concealSeedPhrase({ phrase, cipherKey, salt: 'salt2' });
      
      // All should have different concealed values
      expect(result1.result.quotient).not.toBe(result2.result.quotient);
      expect(result1.result.quotient).not.toBe(result3.result.quotient);
      expect(result2.result.quotient).not.toBe(result3.result.quotient);
    });

    it('should be deterministic with salt', () => {
      const options = {
        phrase: 'abandon ability able about above',
        cipherKey: '137643',
        salt: 'consistent_salt'
      };
      
      const result1 = concealSeedPhrase(options);
      const result2 = concealSeedPhrase(options);
      
      expect(result1.result.quotient).toBe(result2.result.quotient);
      expect(result1.result.remainder).toBe(result2.result.remainder);
      expect(result1.validation).toEqual(result2.validation);
    });

    it('should handle empty salt like no salt', () => {
      const phrase = 'abandon ability able';
      const cipherKey = '137643';
      
      const result1 = concealSeedPhrase({ phrase, cipherKey });
      const result2 = concealSeedPhrase({ phrase, cipherKey, salt: '' });
      const result3 = concealSeedPhrase({ phrase, cipherKey, salt: '   ' });
      
      expect(result1.result.quotient).toBe(result2.result.quotient);
      expect(result1.result.remainder).toBe(result2.result.remainder);
      expect(result2.result.quotient).toBe(result3.result.quotient);
      expect(result2.result.remainder).toBe(result3.result.remainder);
    });

    it('should work with salt and invalid words', () => {
      const options = {
        phrase: 'abandon invalid able nonexistent',
        cipherKey: '137643',
        salt: 'test_salt'
      };
      
      const { result, validation } = concealSeedPhrase(options);
      
      expect(validation.validWords).toEqual(['abandon', 'able']);
      expect(validation.invalidWords).toEqual(['invalid', 'nonexistent']);
      expect(result.originalWordCount).toBe(4);
    });
  });

  describe('integration test', () => {
    it('should produce consistent results for the same inputs', () => {
      const options = {
        phrase: 'abandon ability able about above',
        cipherKey: '137643'
      };
      
      const result1 = concealSeedPhrase(options);
      const result2 = concealSeedPhrase(options);
      
      expect(result1.result.quotient).toBe(result2.result.quotient);
      expect(result1.result.remainder).toBe(result2.result.remainder);
      expect(result1.validation).toEqual(result2.validation);
    });

    it('should handle edge case with all zeros', () => {
      // This would create a number starting with 1 followed by all zeros
      const phrase = new Array(5).fill('abandon').join(' '); // All index 0
      const options = {
        phrase,
        cipherKey: '137643'
      };
      
      const { result } = concealSeedPhrase(options);
      
      expect(result.quotient).toBeTruthy();
      expect(result.remainder).toBeTruthy();
      expect(result.originalWordCount).toBe(5);
    });
  });
});