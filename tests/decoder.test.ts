import { revealSeedPhrase, formatRevealResult } from '../lib/decoder';
import { concealSeedPhrase } from '../lib/encoder';
import * as fs from 'fs';

// Mock fs module for testing
jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('decoder', () => {
  const mockWordList = 'abandon\nability\nable\nabout\nabove\nabsent\nabsorb\nabstract\nabsurd\nabuse';
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockedFs.readFileSync.mockReturnValue(mockWordList);
  });

  describe('revealSeedPhrase', () => {
    it('should reveal a simple seed phrase', () => {
      // First, conceal a known phrase to get valid test data
      const originalPhrase = 'abandon ability able';
      const cipherKey = '137643';
      
      const { result: concealResult } = concealSeedPhrase({
        phrase: originalPhrase,
        cipherKey
      });
      
      const concealedValue = `${concealResult.quotient}:${concealResult.remainder}`;
      
      // Now reveal it
      const result = revealSeedPhrase({
        concealedValue,
        cipherKey
      });
      
      expect(result.success).toBe(true);
      expect(result.words).toEqual(['abandon', 'ability', 'able']);
      expect(result.error).toBeUndefined();
    });

    it('should reveal a single word phrase', () => {
      const originalPhrase = 'abandon';
      const cipherKey = '123';
      
      const { result: concealResult } = concealSeedPhrase({
        phrase: originalPhrase,
        cipherKey
      });
      
      const concealedValue = `${concealResult.quotient}:${concealResult.remainder}`;
      
      const result = revealSeedPhrase({
        concealedValue,
        cipherKey
      });
      
      expect(result.success).toBe(true);
      expect(result.words).toEqual(['abandon']);
    });

    it('should handle large phrases', () => {
      const words = ['abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract'];
      const originalPhrase = words.join(' ');
      const cipherKey = '999999';
      
      const { result: concealResult } = concealSeedPhrase({
        phrase: originalPhrase,
        cipherKey
      });
      
      const concealedValue = `${concealResult.quotient}:${concealResult.remainder}`;
      
      const result = revealSeedPhrase({
        concealedValue,
        cipherKey
      });
      
      expect(result.success).toBe(true);
      expect(result.words).toEqual(words);
    });

    it('should handle phrases that were concealed with invalid words', () => {
      // Conceal phrase with invalid words (they become index 0 = 'abandon')
      const originalPhrase = 'abandon invalid able';
      const cipherKey = '137643';
      
      const { result: concealResult } = concealSeedPhrase({
        phrase: originalPhrase,
        cipherKey
      });
      
      const concealedValue = `${concealResult.quotient}:${concealResult.remainder}`;
      
      const result = revealSeedPhrase({
        concealedValue,
        cipherKey
      });
      
      expect(result.success).toBe(true);
      // Invalid words become 'abandon' (index 0)
      expect(result.words).toEqual(['abandon', 'abandon', 'able']);
    });

    it('should produce different results with wrong cipher key', () => {
      const originalPhrase = 'abandon ability able';
      const correctCipherKey = '137643';
      const wrongCipherKey = '123456';
      
      const { result: concealResult } = concealSeedPhrase({
        phrase: originalPhrase,
        cipherKey: correctCipherKey
      });
      
      const concealedValue = `${concealResult.quotient}:${concealResult.remainder}`;
      
      const result = revealSeedPhrase({
        concealedValue,
        cipherKey: wrongCipherKey
      });
      
      // May succeed or fail depending on the resulting indices
      if (result.success) {
        expect(result.words).not.toEqual(['abandon', 'ability', 'able']);
      } else {
        expect(result.success).toBe(false);
        expect(result.error).toBeTruthy();
      }
    });

    it('should fail with invalid concealed value format', () => {
      const result = revealSeedPhrase({
        concealedValue: 'invalid_format',
        cipherKey: '137643'
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Concealed value must be in format "quotient:remainder"');
      expect(result.words).toEqual([]);
    });

    it('should fail with invalid numbers in concealed value', () => {
      const result = revealSeedPhrase({
        concealedValue: 'abc:def',
        cipherKey: '137643'
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid concealed value format');
      expect(result.words).toEqual([]);
    });

    it('should fail with empty cipher key', () => {
      const result = revealSeedPhrase({
        concealedValue: '123:456',
        cipherKey: ''
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Cipher key cannot be empty');
      expect(result.words).toEqual([]);
    });

    it('should fail with invalid cipher key', () => {
      const result = revealSeedPhrase({
        concealedValue: '123:456',
        cipherKey: 'abc'
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Cipher key must be a valid number');
      expect(result.words).toEqual([]);
    });

    it('should fail with zero cipher key', () => {
      const result = revealSeedPhrase({
        concealedValue: '123:456',
        cipherKey: '0'
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Cipher key must be a positive number');
      expect(result.words).toEqual([]);
    });

    it('should fail with negative numbers in concealed value', () => {
      const result = revealSeedPhrase({
        concealedValue: '-123:456',
        cipherKey: '137643'
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Quotient and remainder must be non-negative');
      expect(result.words).toEqual([]);
    });

    it('should fail if concealed value does not start with 1 after reconstruction', () => {
      // Create a malformed concealed value that won't start with 1 when reconstructed
      const result = revealSeedPhrase({
        concealedValue: '0:0',
        cipherKey: '1'
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid concealed value: must start with 1');
      expect(result.words).toEqual([]);
    });

    it('should fail if reconstructed number has incorrect format', () => {
      // This should create a number that when parsed doesn't have length divisible by 4
      const result = revealSeedPhrase({
        concealedValue: '12:0', // This reconstructs to 12, which after removing '1' leaves '2' (not divisible by 4)
        cipherKey: '1'
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid concealed value: incorrect format');
      expect(result.words).toEqual([]);
    });

    it('should fail if word index is out of range', () => {
      // Create a scenario where the index would be larger than available words
      // The mock word list has 10 words (indices 0-9)
      // We'll construct a concealed value that results in an invalid index
      const result = revealSeedPhrase({
        concealedValue: '19999:0', // This should reconstruct to 19999 which gives us index 9999 (out of range)
        cipherKey: '1'
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid word index');
      expect(result.words).toEqual([]);
    });
  });

  describe('formatRevealResult', () => {
    it('should format successful result', () => {
      const result = {
        words: ['abandon', 'ability', 'able'],
        success: true
      };
      
      const formatted = formatRevealResult(result);
      expect(formatted).toBe('abandon ability able');
    });

    it('should format single word result', () => {
      const result = {
        words: ['abandon'],
        success: true
      };
      
      const formatted = formatRevealResult(result);
      expect(formatted).toBe('abandon');
    });

    it('should format error result', () => {
      const result = {
        words: [],
        success: false,
        error: 'Test error message'
      };
      
      const formatted = formatRevealResult(result);
      expect(formatted).toBe('Error: Test error message');
    });

    it('should handle empty words array on success', () => {
      const result = {
        words: [],
        success: true
      };
      
      const formatted = formatRevealResult(result);
      expect(formatted).toBe('');
    });
  });

  describe('salt functionality', () => {
    it('should reveal phrase with salt correctly', () => {
      const originalPhrase = 'abandon ability able';
      const cipherKey = '137643';
      const salt = 'test_salt';
      
      // Conceal with salt
      const { result: concealResult } = concealSeedPhrase({
        phrase: originalPhrase,
        cipherKey,
        salt
      });
      
      const concealedValue = `${concealResult.quotient}:${concealResult.remainder}`;
      
      // Reveal with same salt
      const result = revealSeedPhrase({
        concealedValue,
        cipherKey,
        salt
      });
      
      expect(result.success).toBe(true);
      expect(result.words).toEqual(['abandon', 'ability', 'able']);
    });

    it('should fail to reveal with wrong salt', () => {
      const originalPhrase = 'abandon ability able';
      const cipherKey = '137643';
      const correctSalt = 'correct_salt';
      const wrongSalt = 'wrong_salt';
      
      // Conceal with correct salt
      const { result: concealResult } = concealSeedPhrase({
        phrase: originalPhrase,
        cipherKey,
        salt: correctSalt
      });
      
      const concealedValue = `${concealResult.quotient}:${concealResult.remainder}`;
      
      // Try to reveal with wrong salt
      const result = revealSeedPhrase({
        concealedValue,
        cipherKey,
        salt: wrongSalt
      });
      
      // Should succeed but produce wrong words
      if (result.success) {
        expect(result.words).not.toEqual(['abandon', 'ability', 'able']);
      }
      // Note: The security feature ensures wrong salt still produces valid words
    });

    it('should handle salt concealed phrase without salt in reveal', () => {
      const originalPhrase = 'abandon ability able';
      const cipherKey = '137643';
      const salt = 'test_salt';
      
      // Conceal with salt
      const { result: concealResult } = concealSeedPhrase({
        phrase: originalPhrase,
        cipherKey,
        salt
      });
      
      const concealedValue = `${concealResult.quotient}:${concealResult.remainder}`;
      
      // Try to reveal without salt
      const result = revealSeedPhrase({
        concealedValue,
        cipherKey
      });
      
      // Should succeed but produce wrong words
      if (result.success) {
        expect(result.words).not.toEqual(['abandon', 'ability', 'able']);
      }
    });

    it('should handle no-salt concealed phrase with salt in reveal', () => {
      const originalPhrase = 'abandon ability able';
      const cipherKey = '137643';
      
      // Conceal without salt
      const { result: concealResult } = concealSeedPhrase({
        phrase: originalPhrase,
        cipherKey
      });
      
      const concealedValue = `${concealResult.quotient}:${concealResult.remainder}`;
      
      // Try to reveal with salt
      const result = revealSeedPhrase({
        concealedValue,
        cipherKey,
        salt: 'some_salt'
      });
      
      // Should succeed but produce wrong words
      if (result.success) {
        expect(result.words).not.toEqual(['abandon', 'ability', 'able']);
      }
    });

    it('should handle empty salt consistently', () => {
      const originalPhrase = 'abandon ability able';
      const cipherKey = '137643';
      
      // Conceal without salt
      const { result: concealResult } = concealSeedPhrase({
        phrase: originalPhrase,
        cipherKey
      });
      
      const concealedValue = `${concealResult.quotient}:${concealResult.remainder}`;
      
      // Reveal with empty salt should work like no salt
      const result1 = revealSeedPhrase({
        concealedValue,
        cipherKey
      });
      
      const result2 = revealSeedPhrase({
        concealedValue,
        cipherKey,
        salt: ''
      });
      
      const result3 = revealSeedPhrase({
        concealedValue,
        cipherKey,
        salt: '   '
      });
      
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result3.success).toBe(true);
      expect(result1.words).toEqual(['abandon', 'ability', 'able']);
      expect(result2.words).toEqual(['abandon', 'ability', 'able']);
      expect(result3.words).toEqual(['abandon', 'ability', 'able']);
    });

    it('should be deterministic with salt', () => {
      const originalPhrase = 'abandon ability able about above';
      const cipherKey = '137643';
      const salt = 'consistent_salt';
      
      // Conceal with salt
      const { result: concealResult } = concealSeedPhrase({
        phrase: originalPhrase,
        cipherKey,
        salt
      });
      
      const concealedValue = `${concealResult.quotient}:${concealResult.remainder}`;
      
      // Reveal multiple times with same salt
      const results = Array(3).fill(null).map(() => 
        revealSeedPhrase({
          concealedValue,
          cipherKey,
          salt
        })
      );
      
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.words).toEqual(['abandon', 'ability', 'able', 'about', 'above']);
      });
    });

    it('should produce different results for different salts', () => {
      const originalPhrase = 'abandon ability able';
      const cipherKey = '137643';
      
      // Conceal with different salts
      const { result: concealResult1 } = concealSeedPhrase({
        phrase: originalPhrase,
        cipherKey,
        salt: 'salt1'
      });
      
      const { result: concealResult2 } = concealSeedPhrase({
        phrase: originalPhrase,
        cipherKey,
        salt: 'salt2'
      });
      
      const concealedValue1 = `${concealResult1.quotient}:${concealResult1.remainder}`;
      const concealedValue2 = `${concealResult2.quotient}:${concealResult2.remainder}`;
      
      // Concealed values should be different
      expect(concealedValue1).not.toBe(concealedValue2);
      
      // But both can be revealed with their respective salts
      const result1 = revealSeedPhrase({
        concealedValue: concealedValue1,
        cipherKey,
        salt: 'salt1'
      });
      
      const result2 = revealSeedPhrase({
        concealedValue: concealedValue2,
        cipherKey,
        salt: 'salt2'
      });
      
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.words).toEqual(['abandon', 'ability', 'able']);
      expect(result2.words).toEqual(['abandon', 'ability', 'able']);
    });
  });

  describe('round-trip integration test', () => {
    it('should perfectly round-trip for various phrase lengths', () => {
      const testCases = [
        { phrase: 'abandon', words: 1 },
        { phrase: 'abandon ability', words: 2 },
        { phrase: 'abandon ability able about above', words: 5 },
        { phrase: 'abandon ability able about above absent absorb abstract', words: 8 },
      ];

      testCases.forEach(({ phrase, words }) => {
        const cipherKey = '137643';
        
        // Conceal
        const { result: concealResult } = concealSeedPhrase({
          phrase,
          cipherKey
        });
        
        const concealedValue = `${concealResult.quotient}:${concealResult.remainder}`;
        
        // Reveal
        const revealResult = revealSeedPhrase({
          concealedValue,
          cipherKey
        });
        
        expect(revealResult.success).toBe(true);
        expect(revealResult.words).toEqual(phrase.split(' '));
        expect(revealResult.words.length).toBe(words);
      });
    });

    it('should handle different cipher keys', () => {
      const phrase = 'abandon ability able about';
      const cipherKeys = ['1', '123', '999999', '123456789012345678901234567890'];
      
      cipherKeys.forEach(cipherKey => {
        // Conceal
        const { result: concealResult } = concealSeedPhrase({
          phrase,
          cipherKey
        });
        
        const concealedValue = `${concealResult.quotient}:${concealResult.remainder}`;
        
        // Reveal
        const revealResult = revealSeedPhrase({
          concealedValue,
          cipherKey
        });
        
        expect(revealResult.success).toBe(true);
        expect(revealResult.words).toEqual(['abandon', 'ability', 'able', 'about']);
      });
    });

    it('should be deterministic', () => {
      const phrase = 'abandon ability able';
      const cipherKey = '137643';
      
      // Perform the same operation multiple times
      const results = Array(5).fill(null).map(() => {
        const { result: concealResult } = concealSeedPhrase({
          phrase,
          cipherKey
        });
        
        const concealedValue = `${concealResult.quotient}:${concealResult.remainder}`;
        
        const revealResult = revealSeedPhrase({
          concealedValue,
          cipherKey
        });
        
        return {
          concealed: concealedValue,
          revealed: revealResult.words
        };
      });
      
      // All results should be identical
      const first = results[0];
      results.forEach(result => {
        expect(result.concealed).toBe(first.concealed);
        expect(result.revealed).toEqual(first.revealed);
      });
    });
  });
});