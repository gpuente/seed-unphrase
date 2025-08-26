import {
  formatIndex,
  parseWords,
  buildNumberFromIndices,
  parseNumberToIndices,
  divideWithRemainder,
  multiplyAndAdd,
  validateCipherKey,
  parseConcealedValue,
  formatConcealedValue,
  validatePhraseLength,
  generateSaltTransforms,
  applySaltTransformation,
  reverseSaltTransformation
} from '../lib/utils';
import { SeedPhraseError, ErrorCodes } from '../lib/types';

describe('utils', () => {
  describe('formatIndex', () => {
    it('should format single digit numbers with leading zeros', () => {
      expect(formatIndex(0)).toBe('0000');
      expect(formatIndex(5)).toBe('0005');
      expect(formatIndex(9)).toBe('0009');
    });

    it('should format double digit numbers with leading zeros', () => {
      expect(formatIndex(15)).toBe('0015');
      expect(formatIndex(99)).toBe('0099');
    });

    it('should format triple digit numbers with leading zeros', () => {
      expect(formatIndex(123)).toBe('0123');
      expect(formatIndex(999)).toBe('0999');
    });

    it('should format four digit numbers without leading zeros', () => {
      expect(formatIndex(1234)).toBe('1234');
      expect(formatIndex(2047)).toBe('2047');
    });
  });

  describe('parseWords', () => {
    it('should split words by spaces', () => {
      expect(parseWords('word1 word2 word3')).toEqual(['word1', 'word2', 'word3']);
    });

    it('should handle multiple spaces', () => {
      expect(parseWords('word1   word2    word3')).toEqual(['word1', 'word2', 'word3']);
    });

    it('should trim whitespace', () => {
      expect(parseWords('  word1 word2 word3  ')).toEqual(['word1', 'word2', 'word3']);
    });

    it('should handle single word', () => {
      expect(parseWords('word')).toEqual(['word']);
    });

    it('should handle empty string', () => {
      expect(parseWords('')).toEqual([]);
      expect(parseWords('   ')).toEqual([]);
    });
  });

  describe('buildNumberFromIndices', () => {
    it('should build number with single index', () => {
      expect(buildNumberFromIndices([0])).toBe(10000n);
      expect(buildNumberFromIndices([1])).toBe(10001n);
      expect(buildNumberFromIndices([2047])).toBe(12047n);
    });

    it('should build number with multiple indices', () => {
      expect(buildNumberFromIndices([0, 1, 2])).toBe(1000000010002n);
      expect(buildNumberFromIndices([15, 1545])).toBe(100151545n);
    });

    it('should handle empty array', () => {
      expect(buildNumberFromIndices([])).toBe(1n);
    });
  });

  describe('parseNumberToIndices', () => {
    it('should parse single index number', () => {
      expect(parseNumberToIndices(10000n)).toEqual([0]);
      expect(parseNumberToIndices(10001n)).toEqual([1]);
      expect(parseNumberToIndices(12047n)).toEqual([2047]);
    });

    it('should parse multiple indices number', () => {
      expect(parseNumberToIndices(1000000010002n)).toEqual([0, 1, 2]);
      expect(parseNumberToIndices(100151545n)).toEqual([15, 1545]);
    });

    it('should handle number with just prefix', () => {
      expect(parseNumberToIndices(1n)).toEqual([]);
    });

    it('should throw error if number does not start with 1', () => {
      expect(() => parseNumberToIndices(20000n)).toThrow(SeedPhraseError);
      expect(() => parseNumberToIndices(20000n)).toThrow('Invalid concealed value: must start with 1');
    });

    it('should throw error if remaining length is not divisible by 4', () => {
      expect(() => parseNumberToIndices(100n)).toThrow(SeedPhraseError);
      expect(() => parseNumberToIndices(100n)).toThrow('Invalid concealed value: incorrect format');
    });

    it('should handle number with just prefix', () => {
      // This would represent a number with just the prefix
      expect(parseNumberToIndices(1n)).toEqual([]);
    });
  });

  describe('divideWithRemainder', () => {
    it('should divide numbers correctly', () => {
      const result = divideWithRemainder(10n, 3n);
      expect(result.quotient).toBe(3n);
      expect(result.remainder).toBe(1n);
    });

    it('should handle exact division', () => {
      const result = divideWithRemainder(10n, 5n);
      expect(result.quotient).toBe(2n);
      expect(result.remainder).toBe(0n);
    });

    it('should handle large numbers', () => {
      const result = divideWithRemainder(1000000000000000000n, 137643n);
      expect(result.quotient * 137643n + result.remainder).toBe(1000000000000000000n);
    });

    it('should throw error for division by zero', () => {
      expect(() => divideWithRemainder(10n, 0n)).toThrow(SeedPhraseError);
      expect(() => divideWithRemainder(10n, 0n)).toThrow('Cannot divide by zero');
    });
  });

  describe('multiplyAndAdd', () => {
    it('should multiply and add correctly', () => {
      expect(multiplyAndAdd(3n, 3n, 1n)).toBe(10n);
      expect(multiplyAndAdd(2n, 5n, 0n)).toBe(10n);
    });

    it('should handle large numbers', () => {
      const quotient = 7262969588765n;
      const divisor = 137643n;
      const remainder = 45678n;
      const result = multiplyAndAdd(quotient, divisor, remainder);
      expect(result).toBe(quotient * divisor + remainder);
    });
  });

  describe('validateCipherKey', () => {
    it('should accept valid positive numbers', () => {
      expect(validateCipherKey('123')).toBe(123n);
      expect(validateCipherKey('137643')).toBe(137643n);
      expect(validateCipherKey('1')).toBe(1n);
    });

    it('should accept large numbers', () => {
      const largeNum = '123456789012345678901234567890';
      expect(validateCipherKey(largeNum)).toBe(BigInt(largeNum));
    });

    it('should trim whitespace', () => {
      expect(validateCipherKey('  123  ')).toBe(123n);
    });

    it('should throw error for empty key', () => {
      expect(() => validateCipherKey('')).toThrow(SeedPhraseError);
      expect(() => validateCipherKey('   ')).toThrow('Cipher key cannot be empty');
    });

    it('should throw error for non-numeric key', () => {
      expect(() => validateCipherKey('abc')).toThrow(SeedPhraseError);
      expect(() => validateCipherKey('abc')).toThrow('Cipher key must be a valid number');
    });

    it('should throw error for zero or negative numbers', () => {
      expect(() => validateCipherKey('0')).toThrow(SeedPhraseError);
      expect(() => validateCipherKey('-1')).toThrow('Cipher key must be a positive number');
    });
  });

  describe('parseConcealedValue', () => {
    it('should parse valid concealed values', () => {
      const result = parseConcealedValue('123:456');
      expect(result.quotient).toBe(123n);
      expect(result.remainder).toBe(456n);
    });

    it('should handle large numbers', () => {
      const result = parseConcealedValue('123456789012345678901234567890:987654321098765432109876543210');
      expect(result.quotient).toBe(123456789012345678901234567890n);
      expect(result.remainder).toBe(987654321098765432109876543210n);
    });

    it('should trim whitespace', () => {
      const result = parseConcealedValue('  123:456  ');
      expect(result.quotient).toBe(123n);
      expect(result.remainder).toBe(456n);
    });

    it('should throw error for missing colon', () => {
      expect(() => parseConcealedValue('123456')).toThrow(SeedPhraseError);
      expect(() => parseConcealedValue('123456')).toThrow('Concealed value must be in format "quotient:remainder"');
    });

    it('should throw error for multiple colons', () => {
      expect(() => parseConcealedValue('123:456:789')).toThrow(SeedPhraseError);
    });

    it('should throw error for invalid numbers', () => {
      expect(() => parseConcealedValue('abc:def')).toThrow(SeedPhraseError);
      expect(() => parseConcealedValue('abc:def')).toThrow('Invalid concealed value format');
    });

    it('should throw error for negative numbers', () => {
      expect(() => parseConcealedValue('-123:456')).toThrow(SeedPhraseError);
      expect(() => parseConcealedValue('123:-456')).toThrow('Quotient and remainder must be non-negative');
    });
  });

  describe('formatConcealedValue', () => {
    it('should format concealed values correctly', () => {
      expect(formatConcealedValue(123n, 456n)).toBe('123:456');
      expect(formatConcealedValue(0n, 0n)).toBe('0:0');
    });
  });

  describe('validatePhraseLength', () => {
    it('should accept valid phrase lengths', () => {
      expect(() => validatePhraseLength(['word'])).not.toThrow();
      expect(() => validatePhraseLength(new Array(24).fill('word'))).not.toThrow();
    });

    it('should throw error for empty phrase', () => {
      expect(() => validatePhraseLength([])).toThrow(SeedPhraseError);
      expect(() => validatePhraseLength([])).toThrow('Seed phrase cannot be empty');
    });

    it('should throw error for phrase too long', () => {
      expect(() => validatePhraseLength(new Array(25).fill('word'))).toThrow(SeedPhraseError);
      expect(() => validatePhraseLength(new Array(25).fill('word'))).toThrow('Seed phrase cannot exceed 24 words');
    });
  });

  describe('generateSaltTransforms', () => {
    it('should generate deterministic transforms for given salt', () => {
      const salt = 'test_salt';
      const transforms1 = generateSaltTransforms(salt, 3);
      const transforms2 = generateSaltTransforms(salt, 3);
      
      expect(transforms1).toEqual(transforms2);
      expect(transforms1).toHaveLength(3);
      
      // All transforms should be within BIP39 range
      transforms1.forEach(transform => {
        expect(transform).toBeGreaterThanOrEqual(0);
        expect(transform).toBeLessThan(2048);
      });
    });

    it('should generate different transforms for different salts', () => {
      const transforms1 = generateSaltTransforms('salt1', 3);
      const transforms2 = generateSaltTransforms('salt2', 3);
      
      expect(transforms1).not.toEqual(transforms2);
    });

    it('should generate different transforms for different positions', () => {
      const transforms = generateSaltTransforms('test_salt', 5);
      
      // Should have unique values (with high probability)
      const uniqueTransforms = new Set(transforms);
      expect(uniqueTransforms.size).toBeGreaterThan(1);
    });

    it('should return array of zeros for empty salt', () => {
      const transforms = generateSaltTransforms('', 3);
      expect(transforms).toEqual([0, 0, 0]);
    });

    it('should handle different count values', () => {
      expect(generateSaltTransforms('test', 1)).toHaveLength(1);
      expect(generateSaltTransforms('test', 10)).toHaveLength(10);
      expect(generateSaltTransforms('test', 24)).toHaveLength(24);
    });
  });

  describe('applySaltTransformation', () => {
    it('should transform indices with salt', () => {
      const indices = [10, 20, 30];
      const salt = 'test_salt';
      
      const transformed = applySaltTransformation(indices, salt);
      
      expect(transformed).toHaveLength(3);
      expect(transformed).not.toEqual(indices);
      
      // All transformed indices should be within BIP39 range
      transformed.forEach(index => {
        expect(index).toBeGreaterThanOrEqual(0);
        expect(index).toBeLessThan(2048);
      });
    });

    it('should return original indices when no salt provided', () => {
      const indices = [10, 20, 30];
      
      expect(applySaltTransformation(indices)).toEqual(indices);
      expect(applySaltTransformation(indices, undefined)).toEqual(indices);
    });

    it('should be deterministic', () => {
      const indices = [100, 200, 300];
      const salt = 'consistent_salt';
      
      const transformed1 = applySaltTransformation(indices, salt);
      const transformed2 = applySaltTransformation(indices, salt);
      
      expect(transformed1).toEqual(transformed2);
    });

    it('should handle edge cases near BIP39 range limits', () => {
      const indices = [0, 1, 2046, 2047]; // Edge cases
      const salt = 'test_salt';
      
      const transformed = applySaltTransformation(indices, salt);
      
      transformed.forEach(index => {
        expect(index).toBeGreaterThanOrEqual(0);
        expect(index).toBeLessThan(2048);
      });
    });

    it('should handle empty array', () => {
      expect(applySaltTransformation([], 'salt')).toEqual([]);
    });
  });

  describe('reverseSaltTransformation', () => {
    it('should reverse the salt transformation correctly', () => {
      const originalIndices = [10, 20, 30, 100, 500];
      const salt = 'test_salt';
      
      const transformed = applySaltTransformation(originalIndices, salt);
      const reversed = reverseSaltTransformation(transformed, salt);
      
      expect(reversed).toEqual(originalIndices);
    });

    it('should return original indices when no salt provided', () => {
      const indices = [10, 20, 30];
      
      expect(reverseSaltTransformation(indices)).toEqual(indices);
      expect(reverseSaltTransformation(indices, undefined)).toEqual(indices);
    });

    it('should handle all possible BIP39 indices', () => {
      const testIndices = [0, 1, 100, 500, 1000, 1500, 2046, 2047];
      const salt = 'comprehensive_test';
      
      const transformed = applySaltTransformation(testIndices, salt);
      const reversed = reverseSaltTransformation(transformed, salt);
      
      expect(reversed).toEqual(testIndices);
    });

    it('should work with different salt values', () => {
      const originalIndices = [42, 123, 456, 789];
      
      const salts = ['salt1', 'salt2', 'different_salt', 'long_salt_value_123'];
      
      salts.forEach(salt => {
        const transformed = applySaltTransformation(originalIndices, salt);
        const reversed = reverseSaltTransformation(transformed, salt);
        expect(reversed).toEqual(originalIndices);
      });
    });

    it('should handle empty array', () => {
      expect(reverseSaltTransformation([], 'salt')).toEqual([]);
    });

    it('should ensure modular arithmetic works correctly', () => {
      // Test with indices that when transformed might wrap around
      const testCases = [
        [2047, 2046], // High indices
        [0, 1],       // Low indices
        [1000, 1500]  // Mid-range indices
      ];
      
      testCases.forEach(indices => {
        const salt = 'wrap_test';
        const transformed = applySaltTransformation(indices, salt);
        const reversed = reverseSaltTransformation(transformed, salt);
        expect(reversed).toEqual(indices);
      });
    });
  });

  describe('salt transformation integration', () => {
    it('should maintain BIP39 compatibility', () => {
      const originalIndices = Array.from({ length: 24 }, (_, i) => i * 85); // Spread across range
      const salt = 'integration_test';
      
      const transformed = applySaltTransformation(originalIndices, salt);
      const reversed = reverseSaltTransformation(transformed, salt);
      
      // Verify round trip
      expect(reversed).toEqual(originalIndices);
      
      // Verify all values are within BIP39 range
      transformed.forEach(index => {
        expect(index).toBeGreaterThanOrEqual(0);
        expect(index).toBeLessThan(2048);
      });
    });

    it('should produce different results for different salts but same recovery', () => {
      const originalIndices = [100, 200, 300];
      const salt1 = 'salt_a';
      const salt2 = 'salt_b';
      
      const transformed1 = applySaltTransformation(originalIndices, salt1);
      const transformed2 = applySaltTransformation(originalIndices, salt2);
      
      // Different transformations
      expect(transformed1).not.toEqual(transformed2);
      
      // But both can be reversed correctly
      expect(reverseSaltTransformation(transformed1, salt1)).toEqual(originalIndices);
      expect(reverseSaltTransformation(transformed2, salt2)).toEqual(originalIndices);
      
      // Wrong salt gives wrong result
      expect(reverseSaltTransformation(transformed1, salt2)).not.toEqual(originalIndices);
      expect(reverseSaltTransformation(transformed2, salt1)).not.toEqual(originalIndices);
    });
  });
});