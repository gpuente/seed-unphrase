import { ConcealResult, ConcealOptions, WordValidationResult } from './types';
import { validateWords, loadWordList } from './wordlist';
import {
  parseWords,
  validateCipherKey,
  validatePhraseLength,
  buildNumberFromIndices,
  divideWithRemainder,
  formatConcealedValue,
  applySaltTransformation
} from './utils';

export function validateSeedPhrase(phrase: string): WordValidationResult {
  const words = parseWords(phrase);
  validatePhraseLength(words);
  
  const wordList = loadWordList();
  const validation = validateWords(words, wordList);
  
  return {
    validWords: validation.validWords,
    invalidWords: validation.invalidWords,
    wordIndices: validation.indices
  };
}

export function concealSeedPhrase(options: ConcealOptions): {
  result: ConcealResult;
  validation: WordValidationResult;
} {
  const { phrase, cipherKey, salt } = options;
  
  // Validate inputs
  const validation = validateSeedPhrase(phrase);
  const cipherKeyBigInt = validateCipherKey(cipherKey);
  
  // Apply salt transformation to indices (if salt is provided)
  const transformedIndices = applySaltTransformation(validation.wordIndices, salt);
  
  // Build the number from transformed word indices
  const seedNumber = buildNumberFromIndices(transformedIndices);
  
  // Divide by cipher key
  const { quotient, remainder } = divideWithRemainder(seedNumber, cipherKeyBigInt);
  
  const result: ConcealResult = {
    quotient: quotient.toString(),
    remainder: remainder.toString(),
    originalWordCount: validation.validWords.length + validation.invalidWords.length
  };
  
  return { result, validation };
}

export function formatConcealResult(result: ConcealResult): string {
  return formatConcealedValue(BigInt(result.quotient), BigInt(result.remainder));
}