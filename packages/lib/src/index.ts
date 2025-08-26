// Export types
export * from './types';

// Export core functionality
export { concealSeedPhrase, validateSeedPhrase, formatConcealResult } from './encoder';
export { revealSeedPhrase, formatRevealResult } from './decoder';

// Export word list operations
export { 
  loadWordList, 
  getWordIndex, 
  getWordByIndex, 
  validateWords, 
  clearWordListCache 
} from './wordlist';

// Export utilities
export {
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
} from './utils';