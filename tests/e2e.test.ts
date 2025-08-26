import { concealSeedPhrase, revealSeedPhrase } from '../lib';
import * as fs from 'fs';
import * as path from 'path';

describe('End-to-End Tests', () => {
  beforeAll(() => {
    // Use the actual word list file for E2E tests
    const actualWordListPath = path.join(__dirname, '..', 'english.txt');
    
    // Check if the actual word list exists, if not create a mock for testing
    if (!fs.existsSync(actualWordListPath)) {
      console.warn('Actual word list not found, using mock data for E2E tests');
      
      // Create a minimal BIP39-like word list for testing
      const testWordList = [
        'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 
        'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
        'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual'
      ].join('\n');
      
      fs.writeFileSync(actualWordListPath, testWordList);
    }
  });

  describe('Real-world scenarios', () => {
    it('should handle typical 12-word seed phrases', async () => {
      const seedPhrase = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
      const cipherKey = '123456789';
      
      // Conceal the seed phrase
      const { result, validation } = concealSeedPhrase({
        phrase: seedPhrase,
        cipherKey
      });
      
      expect(validation.invalidWords).toEqual([]);
      expect(result.originalWordCount).toBe(12);
      
      const concealedValue = `${result.quotient}:${result.remainder}`;
      
      // Reveal the seed phrase
      const revealResult = revealSeedPhrase({
        concealedValue,
        cipherKey
      });
      
      expect(revealResult.success).toBe(true);
      expect(revealResult.words.join(' ')).toBe(seedPhrase);
    });

    it('should handle 24-word seed phrases', async () => {
      const seedPhrase = [
        'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon',
        'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon',
        'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon',
        'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'about'
      ].join(' ');
      const cipherKey = '987654321';
      
      // Conceal the seed phrase
      const { result, validation } = concealSeedPhrase({
        phrase: seedPhrase,
        cipherKey
      });
      
      expect(validation.invalidWords).toEqual([]);
      expect(result.originalWordCount).toBe(24);
      
      const concealedValue = `${result.quotient}:${result.remainder}`;
      
      // Reveal the seed phrase
      const revealResult = revealSeedPhrase({
        concealedValue,
        cipherKey
      });
      
      expect(revealResult.success).toBe(true);
      expect(revealResult.words.join(' ')).toBe(seedPhrase);
    });

    it('should handle very large cipher keys', async () => {
      const seedPhrase = 'abandon ability able about above absent';
      const largeCipherKey = '999999999999999999999999999999999999999999999999';
      
      const { result } = concealSeedPhrase({
        phrase: seedPhrase,
        cipherKey: largeCipherKey
      });
      
      const concealedValue = `${result.quotient}:${result.remainder}`;
      
      const revealResult = revealSeedPhrase({
        concealedValue,
        cipherKey: largeCipherKey
      });
      
      expect(revealResult.success).toBe(true);
      expect(revealResult.words.join(' ')).toBe(seedPhrase);
    });

    it('should handle phrases with invalid words and warn user', async () => {
      const seedPhrase = 'abandon invalidword1 able invalidword2 about';
      const cipherKey = '12345';
      
      const { result, validation } = concealSeedPhrase({
        phrase: seedPhrase,
        cipherKey
      });
      
      // Should identify invalid words
      expect(validation.invalidWords).toEqual(['invalidword1', 'invalidword2']);
      expect(validation.validWords).toEqual(['abandon', 'able', 'about']);
      
      const concealedValue = `${result.quotient}:${result.remainder}`;
      
      // When revealed, invalid words become 'abandon' (index 0)
      const revealResult = revealSeedPhrase({
        concealedValue,
        cipherKey
      });
      
      expect(revealResult.success).toBe(true);
      expect(revealResult.words).toEqual(['abandon', 'abandon', 'able', 'abandon', 'about']);
    });

    it('should be consistent across multiple operations', async () => {
      const seedPhrase = 'abandon ability able about above absent absorb abstract';
      const cipherKey = '777888999';
      
      // Perform the operation multiple times
      const operations = Array(10).fill(null).map(() => {
        const { result } = concealSeedPhrase({
          phrase: seedPhrase,
          cipherKey
        });
        
        const concealedValue = `${result.quotient}:${result.remainder}`;
        
        const revealResult = revealSeedPhrase({
          concealedValue,
          cipherKey
        });
        
        return {
          concealed: concealedValue,
          revealed: revealResult.words.join(' ')
        };
      });
      
      // All operations should produce identical results
      const first = operations[0];
      operations.forEach((op, index) => {
        expect(op.concealed).toBe(first.concealed);
        expect(op.revealed).toBe(first.revealed);
        expect(op.revealed).toBe(seedPhrase);
      });
    });

    it('should produce different results with wrong cipher key', async () => {
      const seedPhrase = 'abandon ability able';
      const correctKey = '123456';
      const wrongKey = '654321';
      
      const { result } = concealSeedPhrase({
        phrase: seedPhrase,
        cipherKey: correctKey
      });
      
      const concealedValue = `${result.quotient}:${result.remainder}`;
      
      // Try to reveal with wrong key
      const revealResult = revealSeedPhrase({
        concealedValue,
        cipherKey: wrongKey
      });
      
      // May succeed or fail depending on the resulting word indices
      if (revealResult.success) {
        expect(revealResult.words.join(' ')).not.toBe(seedPhrase);
      } else {
        expect(revealResult.success).toBe(false);
        expect(revealResult.error).toBeTruthy();
      }
    });

    it('should handle edge cases with minimum values', async () => {
      // Single word, cipher key = 1
      const seedPhrase = 'abandon';
      const cipherKey = '1';
      
      const { result } = concealSeedPhrase({
        phrase: seedPhrase,
        cipherKey
      });
      
      const concealedValue = `${result.quotient}:${result.remainder}`;
      
      const revealResult = revealSeedPhrase({
        concealedValue,
        cipherKey
      });
      
      expect(revealResult.success).toBe(true);
      expect(revealResult.words).toEqual(['abandon']);
    });

    it('should preserve word order', async () => {
      const seedPhrase = 'about above absent absorb abstract absurd abuse access accident account';
      const cipherKey = '999888777';
      
      const { result } = concealSeedPhrase({
        phrase: seedPhrase,
        cipherKey
      });
      
      const concealedValue = `${result.quotient}:${result.remainder}`;
      
      const revealResult = revealSeedPhrase({
        concealedValue,
        cipherKey
      });
      
      expect(revealResult.success).toBe(true);
      expect(revealResult.words.join(' ')).toBe(seedPhrase);
      
      // Verify exact order
      const originalWords = seedPhrase.split(' ');
      expect(revealResult.words).toEqual(originalWords);
    });

    it('should handle mixed case input', async () => {
      const seedPhrase = 'ABANDON Ability ABLE About ABOVE';
      const expectedResult = 'abandon ability able about above'; // Should be normalized to lowercase
      const cipherKey = '555444333';
      
      const { result, validation } = concealSeedPhrase({
        phrase: seedPhrase,
        cipherKey
      });
      
      expect(validation.invalidWords).toEqual([]);
      expect(validation.validWords).toEqual(['abandon', 'ability', 'able', 'about', 'above']);
      
      const concealedValue = `${result.quotient}:${result.remainder}`;
      
      const revealResult = revealSeedPhrase({
        concealedValue,
        cipherKey
      });
      
      expect(revealResult.success).toBe(true);
      expect(revealResult.words.join(' ')).toBe(expectedResult);
    });
  });

  describe('Performance considerations', () => {
    it('should handle operations efficiently', async () => {
      const seedPhrase = 'abandon ability able about above absent absorb abstract absurd abuse access accident';
      const cipherKey = '123456789012345678901234567890';
      
      const startTime = Date.now();
      
      const { result } = concealSeedPhrase({
        phrase: seedPhrase,
        cipherKey
      });
      
      const concealedValue = `${result.quotient}:${result.remainder}`;
      
      const revealResult = revealSeedPhrase({
        concealedValue,
        cipherKey
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete reasonably quickly (less than 1 second)
      expect(duration).toBeLessThan(1000);
      expect(revealResult.success).toBe(true);
      expect(revealResult.words.join(' ')).toBe(seedPhrase);
    });
  });
});