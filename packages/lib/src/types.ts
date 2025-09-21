export interface ConcealResult {
  quotient: string;
  remainder: string;
  originalWordCount: number;
}

export interface RevealResult {
  words: string[];
  success: boolean;
  error?: string;
}

export interface ConcealOptions {
  phrase: string;
  cipherKey: string;
  salt?: string;
}

export interface RevealOptions {
  concealedValue: string;
  cipherKey: string;
  salt?: string;
}

export interface WordValidationResult {
  validWords: string[];
  invalidWords: string[];
  wordIndices: number[];
}

export interface WordListData {
  wordToIndex: Map<string, number>;
  indexToWord: string[];
}

export class SeedPhraseError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'SeedPhraseError';
  }
}

export interface EncryptedData {
  ciphertext: string;  // base64
  salt: string;        // base64
  iv: string;          // base64
  iterations: number;
  algorithm: string;
}

export class CryptoError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'CryptoError';
  }
}

export const ErrorCodes = {
  INVALID_WORD: 'INVALID_WORD',
  INVALID_CIPHER_KEY: 'INVALID_CIPHER_KEY',
  INVALID_CONCEALED_VALUE: 'INVALID_CONCEALED_VALUE',
  DIVISION_BY_ZERO: 'DIVISION_BY_ZERO',
  WORDLIST_LOAD_ERROR: 'WORDLIST_LOAD_ERROR',
  INVALID_PHRASE_LENGTH: 'INVALID_PHRASE_LENGTH',
} as const;

export const CryptoErrorCodes = {
  CRYPTO_NOT_AVAILABLE: 'CRYPTO_NOT_AVAILABLE',
  KEY_DERIVATION_FAILED: 'KEY_DERIVATION_FAILED',
  ENCRYPTION_FAILED: 'ENCRYPTION_FAILED',
  DECRYPTION_FAILED: 'DECRYPTION_FAILED',
  INVALID_FORMAT: 'INVALID_FORMAT',
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  INVALID_ENCRYPTED_DATA: 'INVALID_ENCRYPTED_DATA',
} as const;