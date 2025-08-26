import { 
  loadWordList, 
  getWordIndex, 
  getWordByIndex, 
  validateWords, 
  clearWordListCache 
} from '../src/wordlist';
import { SeedPhraseError } from '../src/types';

// Mock the JSON import
jest.mock('../src/wordlist.json', () => [
  'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract'
], { virtual: true });

describe('wordlist', () => {
  beforeEach(() => {
    clearWordListCache();
  });

  describe('loadWordList', () => {
    it('should load word list from JSON', () => {
      const wordList = loadWordList();
      
      expect(wordList.indexToWord).toEqual([
        'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract'
      ]);
      expect(wordList.wordToIndex.get('abandon')).toBe(0);
      expect(wordList.wordToIndex.get('abstract')).toBe(7);
    });

    it('should cache loaded word list', () => {
      const wordList1 = loadWordList();
      const wordList2 = loadWordList();
      
      expect(wordList1).toBe(wordList2);
    });

    it('should return cached word list on subsequent calls', () => {
      const firstLoad = loadWordList();
      const secondLoad = loadWordList();
      
      expect(firstLoad).toBe(secondLoad);
    });

    it('should clear cache when requested', () => {
      const firstLoad = loadWordList();
      clearWordListCache();
      const secondLoad = loadWordList();
      
      expect(firstLoad).not.toBe(secondLoad);
      expect(firstLoad).toEqual(secondLoad);
    });
  });

  describe('getWordIndex', () => {
    it('should return correct index for valid words', () => {
      expect(getWordIndex('abandon')).toBe(0);
      expect(getWordIndex('ability')).toBe(1);
      expect(getWordIndex('abstract')).toBe(7);
    });

    it('should be case insensitive', () => {
      expect(getWordIndex('ABANDON')).toBe(0);
      expect(getWordIndex('Ability')).toBe(1);
      expect(getWordIndex('AbStRaCt')).toBe(7);
    });

    it('should return null for invalid words', () => {
      expect(getWordIndex('invalid')).toBeNull();
      expect(getWordIndex('notfound')).toBeNull();
    });

    it('should work with custom word list', () => {
      const wordList = loadWordList();
      expect(getWordIndex('abandon', wordList)).toBe(0);
    });
  });

  describe('getWordByIndex', () => {
    it('should return correct word for valid indices', () => {
      expect(getWordByIndex(0)).toBe('abandon');
      expect(getWordByIndex(1)).toBe('ability');
      expect(getWordByIndex(7)).toBe('abstract');
    });

    it('should return null for invalid indices', () => {
      expect(getWordByIndex(-1)).toBeNull();
      expect(getWordByIndex(100)).toBeNull();
    });

    it('should work with custom word list', () => {
      const wordList = loadWordList();
      expect(getWordByIndex(0, wordList)).toBe('abandon');
    });
  });

  describe('validateWords', () => {
    it('should identify valid and invalid words', () => {
      const result = validateWords(['abandon', 'invalid', 'ability', 'notfound']);
      
      expect(result.validWords).toEqual(['abandon', 'ability']);
      expect(result.invalidWords).toEqual(['invalid', 'notfound']);
      expect(result.indices).toEqual([0, 0, 1, 0]); // Invalid words get index 0
    });

    it('should handle empty array', () => {
      const result = validateWords([]);
      
      expect(result.validWords).toEqual([]);
      expect(result.invalidWords).toEqual([]);
      expect(result.indices).toEqual([]);
    });

    it('should be case insensitive', () => {
      const result = validateWords(['ABANDON', 'Ability']);
      
      expect(result.validWords).toEqual(['abandon', 'ability']);
      expect(result.invalidWords).toEqual([]);
      expect(result.indices).toEqual([0, 1]);
    });

    it('should trim whitespace', () => {
      const result = validateWords(['  abandon  ', ' ability ']);
      
      expect(result.validWords).toEqual(['abandon', 'ability']);
      expect(result.indices).toEqual([0, 1]);
    });

    it('should work with custom word list', () => {
      const wordList = loadWordList();
      const result = validateWords(['abandon', 'invalid'], wordList);
      
      expect(result.validWords).toEqual(['abandon']);
      expect(result.invalidWords).toEqual(['invalid']);
    });
  });
});