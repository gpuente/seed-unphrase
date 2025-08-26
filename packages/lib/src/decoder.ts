import { RevealResult, RevealOptions } from './types';
import { getWordByIndex, loadWordList } from './wordlist';
import {
  validateCipherKey,
  parseConcealedValue,
  multiplyAndAdd,
  parseNumberToIndices,
  reverseSaltTransformation
} from './utils';

export function revealSeedPhrase(options: RevealOptions): RevealResult {
  try {
    const { concealedValue, cipherKey, salt } = options;
    
    // Validate inputs
    const cipherKeyBigInt = validateCipherKey(cipherKey);
    const { quotient, remainder } = parseConcealedValue(concealedValue);
    
    // Reconstruct the original number
    const originalNumber = multiplyAndAdd(quotient, cipherKeyBigInt, remainder);
    
    // Parse the number back to word indices (these are transformed indices if salt was used)
    const transformedIndices = parseNumberToIndices(originalNumber);
    
    // Reverse salt transformation to get original indices (if salt is provided)
    const originalIndices = reverseSaltTransformation(transformedIndices, salt);
    
    // Load word list
    const wordList = loadWordList();
    
    // Convert indices back to words
    const words: string[] = [];
    for (const index of originalIndices) {
      const word = getWordByIndex(index, wordList);
      if (word === null) {
        return {
          words: [],
          success: false,
          error: `Invalid word index: ${index}. Index must be between 0 and ${wordList.indexToWord.length - 1}.`
        };
      }
      words.push(word);
    }
    
    return {
      words,
      success: true
    };
    
  } catch (error) {
    return {
      words: [],
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export function formatRevealResult(result: RevealResult): string {
  if (!result.success) {
    return `Error: ${result.error}`;
  }
  
  return result.words.join(' ');
}