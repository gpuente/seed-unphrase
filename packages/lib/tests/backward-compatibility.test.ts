import { concealSeedPhrase, revealSeedPhrase } from '../src';
import * as fs from 'fs';

// Mock fs module for testing
jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('Backward Compatibility', () => {
  const mockWordList = 'abandon\nability\nable\nabout\nabove\nabsent\nabsorb\nabstract\nabsurd\nabuse';
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockedFs.readFileSync.mockReturnValue(mockWordList);
  });

  describe('Pre-salt concealed values', () => {
    it('should reveal old concealed values without salt parameter', () => {
      // Simulate concealing with the old version (no salt parameter)
      const phrase = 'abandon ability able';
      const cipherKey = '137643';
      
      // Conceal without salt (old behavior)
      const { result } = concealSeedPhrase({
        phrase,
        cipherKey
        // Note: no salt parameter
      });
      
      const concealedValue = `${result.quotient}:${result.remainder}`;
      
      // Reveal with new version but no salt (should work)
      const revealResult = revealSeedPhrase({
        concealedValue,
        cipherKey
        // Note: no salt parameter
      });
      
      expect(revealResult.success).toBe(true);
      expect(revealResult.words).toEqual(['abandon', 'ability', 'able']);
    });

    it('should produce identical results with undefined vs no salt', () => {
      const phrase = 'abandon ability able about';
      const cipherKey = '999999';
      
      // Conceal without salt parameter
      const result1 = concealSeedPhrase({
        phrase,
        cipherKey
      });
      
      // Conceal with explicit undefined salt
      const result2 = concealSeedPhrase({
        phrase,
        cipherKey,
        salt: undefined
      });
      
      // Results should be identical
      expect(result1.result.quotient).toBe(result2.result.quotient);
      expect(result1.result.remainder).toBe(result2.result.remainder);
      expect(result1.validation).toEqual(result2.validation);
    });

    it('should produce identical results with empty string salt vs no salt', () => {
      const phrase = 'abandon ability able about above';
      const cipherKey = '123456789';
      
      // Conceal without salt parameter
      const result1 = concealSeedPhrase({
        phrase,
        cipherKey
      });
      
      // Conceal with empty string salt
      const result2 = concealSeedPhrase({
        phrase,
        cipherKey,
        salt: ''
      });
      
      // Conceal with whitespace-only salt
      const result3 = concealSeedPhrase({
        phrase,
        cipherKey,
        salt: '   '
      });
      
      // All results should be identical
      expect(result1.result.quotient).toBe(result2.result.quotient);
      expect(result1.result.remainder).toBe(result2.result.remainder);
      expect(result2.result.quotient).toBe(result3.result.quotient);
      expect(result2.result.remainder).toBe(result3.result.remainder);
    });

    it('should reveal old concealed values with empty salt parameter', () => {
      const phrase = 'abandon ability able about above';
      const cipherKey = '987654321';
      
      // Conceal without salt (simulating old version)
      const { result } = concealSeedPhrase({
        phrase,
        cipherKey
      });
      
      const concealedValue = `${result.quotient}:${result.remainder}`;
      
      // Try to reveal with empty salt (should work like no salt)
      const revealResult1 = revealSeedPhrase({
        concealedValue,
        cipherKey,
        salt: ''
      });
      
      const revealResult2 = revealSeedPhrase({
        concealedValue,
        cipherKey,
        salt: '   '
      });
      
      const revealResult3 = revealSeedPhrase({
        concealedValue,
        cipherKey,
        salt: undefined
      });
      
      // All should succeed and produce the same result
      expect(revealResult1.success).toBe(true);
      expect(revealResult2.success).toBe(true);
      expect(revealResult3.success).toBe(true);
      
      const expectedWords = ['abandon', 'ability', 'able', 'about', 'above'];
      expect(revealResult1.words).toEqual(expectedWords);
      expect(revealResult2.words).toEqual(expectedWords);
      expect(revealResult3.words).toEqual(expectedWords);
    });
  });

  describe('Migration scenarios', () => {
    it('should handle transition from no-salt to salt usage', () => {
      const phrase = 'abandon ability able';
      const cipherKey = '555555';
      
      // User starts without salt (old way)
      const oldResult = concealSeedPhrase({
        phrase,
        cipherKey
      });
      
      const oldConcealedValue = `${oldResult.result.quotient}:${oldResult.result.remainder}`;
      
      // User can still reveal their old concealed value
      const oldReveal = revealSeedPhrase({
        concealedValue: oldConcealedValue,
        cipherKey
      });
      
      expect(oldReveal.success).toBe(true);
      expect(oldReveal.words).toEqual(['abandon', 'ability', 'able']);
      
      // User decides to use salt for new concealment
      const newResult = concealSeedPhrase({
        phrase,
        cipherKey,
        salt: 'new_security_feature'
      });
      
      const newConcealedValue = `${newResult.result.quotient}:${newResult.result.remainder}`;
      
      // New concealed value is different (due to salt)
      expect(newConcealedValue).not.toBe(oldConcealedValue);
      
      // But can be revealed with salt
      const newReveal = revealSeedPhrase({
        concealedValue: newConcealedValue,
        cipherKey,
        salt: 'new_security_feature'
      });
      
      expect(newReveal.success).toBe(true);
      expect(newReveal.words).toEqual(['abandon', 'ability', 'able']);
      
      // Old and new both reveal to the same original phrase
      expect(oldReveal.words).toEqual(newReveal.words);
    });

    it('should maintain deterministic behavior across versions', () => {
      const testCases = [
        { phrase: 'abandon', cipherKey: '1' },
        { phrase: 'abandon ability', cipherKey: '123' },
        { phrase: 'abandon ability able about above', cipherKey: '999999' },
      ];
      
      testCases.forEach(({ phrase, cipherKey }) => {
        // Conceal multiple times without salt
        const results = Array(3).fill(null).map(() => 
          concealSeedPhrase({ phrase, cipherKey })
        );
        
        // All results should be identical
        const first = results[0];
        results.forEach(result => {
          expect(result.result.quotient).toBe(first.result.quotient);
          expect(result.result.remainder).toBe(first.result.remainder);
        });
        
        // All should reveal to original phrase
        const concealedValue = `${first.result.quotient}:${first.result.remainder}`;
        const revealResult = revealSeedPhrase({
          concealedValue,
          cipherKey
        });
        
        expect(revealResult.success).toBe(true);
        expect(revealResult.words).toEqual(phrase.split(' '));
      });
    });
  });

  describe('Edge cases for compatibility', () => {
    it('should handle large phrases without salt consistently', () => {
      // Test with 8-word phrase (larger but not maximum)
      const phrase = 'abandon ability able about above absent absorb abstract';
      const cipherKey = '123456789012345678901234567890';
      
      const result1 = concealSeedPhrase({ phrase, cipherKey });
      const result2 = concealSeedPhrase({ phrase, cipherKey, salt: undefined });
      const result3 = concealSeedPhrase({ phrase, cipherKey, salt: '' });
      
      // All should produce the same result
      expect(result1.result.quotient).toBe(result2.result.quotient);
      expect(result1.result.remainder).toBe(result2.result.remainder);
      expect(result2.result.quotient).toBe(result3.result.quotient);
      expect(result2.result.remainder).toBe(result3.result.remainder);
      
      // All should reveal correctly
      const concealedValue = `${result1.result.quotient}:${result1.result.remainder}`;
      const expectedWords = phrase.split(' ');
      
      const reveal1 = revealSeedPhrase({ concealedValue, cipherKey });
      const reveal2 = revealSeedPhrase({ concealedValue, cipherKey, salt: undefined });
      const reveal3 = revealSeedPhrase({ concealedValue, cipherKey, salt: '' });
      
      expect(reveal1.success).toBe(true);
      expect(reveal2.success).toBe(true);
      expect(reveal3.success).toBe(true);
      expect(reveal1.words).toEqual(expectedWords);
      expect(reveal2.words).toEqual(expectedWords);
      expect(reveal3.words).toEqual(expectedWords);
    });

    it('should handle invalid words consistently across versions', () => {
      const phrase = 'abandon invalid_word able';
      const cipherKey = '54321';
      
      // Conceal with invalid word (old behavior)
      const { result, validation } = concealSeedPhrase({
        phrase,
        cipherKey
      });
      
      expect(validation.validWords).toEqual(['abandon', 'able']);
      expect(validation.invalidWords).toEqual(['invalid_word']);
      
      const concealedValue = `${result.quotient}:${result.remainder}`;
      
      // Reveal should show invalid words as 'abandon' (index 0)
      const revealResult = revealSeedPhrase({
        concealedValue,
        cipherKey
      });
      
      expect(revealResult.success).toBe(true);
      expect(revealResult.words).toEqual(['abandon', 'abandon', 'able']);
    });
  });
});