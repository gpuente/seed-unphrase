import { SeedPhraseError, ErrorCodes } from './types';

export function formatIndex(index: number): string {
  return index.toString().padStart(4, '0');
}

export function parseWords(phrase: string): string[] {
  return phrase
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0);
}

export function buildNumberFromIndices(indices: number[]): bigint {
  let result = '1'; // Start with 1 as prefix
  
  indices.forEach(index => {
    result += formatIndex(index);
  });
  
  return BigInt(result);
}

export function parseNumberToIndices(num: bigint): number[] {
  const numStr = num.toString();
  
  // Remove the leading '1'
  if (!numStr.startsWith('1')) {
    throw new SeedPhraseError(
      'Invalid concealed value: must start with 1',
      ErrorCodes.INVALID_CONCEALED_VALUE
    );
  }
  
  const indexStr = numStr.slice(1);
  
  // Check if the remaining string length is divisible by 4
  if (indexStr.length % 4 !== 0) {
    throw new SeedPhraseError(
      'Invalid concealed value: incorrect format',
      ErrorCodes.INVALID_CONCEALED_VALUE
    );
  }
  
  const indices: number[] = [];
  for (let i = 0; i < indexStr.length; i += 4) {
    const chunk = indexStr.slice(i, i + 4);
    const index = parseInt(chunk, 10);
    
    if (isNaN(index) || index < 0) {
      throw new SeedPhraseError(
        `Invalid word index: ${chunk}`,
        ErrorCodes.INVALID_CONCEALED_VALUE
      );
    }
    
    indices.push(index);
  }
  
  return indices;
}

export function divideWithRemainder(dividend: bigint, divisor: bigint): {
  quotient: bigint;
  remainder: bigint;
} {
  if (divisor === 0n) {
    throw new SeedPhraseError(
      'Cannot divide by zero',
      ErrorCodes.DIVISION_BY_ZERO
    );
  }
  
  return {
    quotient: dividend / divisor,
    remainder: dividend % divisor
  };
}

export function multiplyAndAdd(quotient: bigint, divisor: bigint, remainder: bigint): bigint {
  return quotient * divisor + remainder;
}

export function validateCipherKey(cipherKey: string): bigint {
  const key = cipherKey.trim();
  
  if (!key) {
    throw new SeedPhraseError(
      'Cipher key cannot be empty',
      ErrorCodes.INVALID_CIPHER_KEY
    );
  }
  
  let parsedKey: bigint;
  try {
    parsedKey = BigInt(key);
  } catch {
    throw new SeedPhraseError(
      'Cipher key must be a valid number',
      ErrorCodes.INVALID_CIPHER_KEY
    );
  }
  
  if (parsedKey <= 0n) {
    throw new SeedPhraseError(
      'Cipher key must be a positive number',
      ErrorCodes.INVALID_CIPHER_KEY
    );
  }
  
  return parsedKey;
}

export function parseConcealedValue(concealedValue: string): {
  quotient: bigint;
  remainder: bigint;
} {
  const value = concealedValue.trim();
  
  if (!value.includes(':')) {
    throw new SeedPhraseError(
      'Concealed value must be in format "quotient:remainder"',
      ErrorCodes.INVALID_CONCEALED_VALUE
    );
  }
  
  const parts = value.split(':');
  if (parts.length !== 2) {
    throw new SeedPhraseError(
      'Concealed value must be in format "quotient:remainder"',
      ErrorCodes.INVALID_CONCEALED_VALUE
    );
  }
  
  try {
    const quotient = BigInt(parts[0]);
    const remainder = BigInt(parts[1]);
    
    if (quotient < 0n || remainder < 0n) {
      throw new SeedPhraseError(
        'Quotient and remainder must be non-negative',
        ErrorCodes.INVALID_CONCEALED_VALUE
      );
    }
    
    return { quotient, remainder };
  } catch (error) {
    if (error instanceof SeedPhraseError) {
      throw error;
    }
    throw new SeedPhraseError(
      'Invalid concealed value format',
      ErrorCodes.INVALID_CONCEALED_VALUE
    );
  }
}

export function formatConcealedValue(quotient: bigint, remainder: bigint): string {
  return `${quotient.toString()}:${remainder.toString()}`;
}

export function validatePhraseLength(words: string[]): void {
  if (words.length === 0) {
    throw new SeedPhraseError(
      'Seed phrase cannot be empty',
      ErrorCodes.INVALID_PHRASE_LENGTH
    );
  }
  
  if (words.length > 24) {
    throw new SeedPhraseError(
      'Seed phrase cannot exceed 24 words',
      ErrorCodes.INVALID_PHRASE_LENGTH
    );
  }
}

// Simple hash function for deterministic salt transformations
function simpleHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// Generate salt-based transformations for each word position
export function generateSaltTransforms(salt: string, count: number): number[] {
  if (!salt || salt.trim() === '') {
    // No salt means no transformation (backward compatibility)
    return new Array(count).fill(0);
  }
  
  const transforms: number[] = [];
  for (let i = 0; i < count; i++) {
    // Hash salt + position to get deterministic transform
    const hash = simpleHash(salt + ':' + i);
    transforms.push(hash % 2048); // Keep in valid BIP39 range
  }
  return transforms;
}

// Apply salt transformation to word indices
export function applySaltTransformation(indices: number[], salt?: string): number[] {
  if (!salt) {
    return indices; // No transformation without salt
  }
  
  const transforms = generateSaltTransforms(salt, indices.length);
  return indices.map((index, i) => (index + transforms[i]) % 2048);
}

// Reverse salt transformation to get original indices
export function reverseSaltTransformation(indices: number[], salt?: string): number[] {
  if (!salt) {
    return indices; // No transformation without salt
  }
  
  const transforms = generateSaltTransforms(salt, indices.length);
  return indices.map((index, i) => (index - transforms[i] + 2048) % 2048);
}