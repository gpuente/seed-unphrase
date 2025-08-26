import { 
  loadWordList, 
  getWordIndex, 
  getWordByIndex, 
  validateWords, 
  clearWordListCache 
} from '../lib/wordlist';
import { SeedPhraseError } from '../lib/types';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs module for testing
jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('wordlist', () => {
  const mockWordList = 'abandon\nability\nable\nabout\nabove\nabsent\nabsorb\nabstract';
  
  beforeEach(() => {
    clearWordListCache();
    mockedFs.readFileSync.mockReturnValue(mockWordList);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('loadWordList', () => {
    it('should load word list from default path', () => {
      const wordList = loadWordList();
      
      expect(mockedFs.readFileSync).toHaveBeenCalledWith(
        expect.stringContaining('english.txt'), 
        'utf-8'
      );
      expect(wordList.indexToWord).toEqual([
        'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract'
      ]);
      expect(wordList.wordToIndex.get('abandon')).toBe(0);
      expect(wordList.wordToIndex.get('abstract')).toBe(7);
    });

    it('should load word list from custom path', () => {
      const customPath = '/custom/path/wordlist.txt';
      loadWordList(customPath);
      
      expect(mockedFs.readFileSync).toHaveBeenCalledWith(customPath, 'utf-8');
    });

    it('should cache loaded word list', () => {
      const wordList1 = loadWordList();
      const wordList2 = loadWordList();
      
      expect(mockedFs.readFileSync).toHaveBeenCalledTimes(1);
      expect(wordList1).toBe(wordList2);
    });

    it('should handle words with case insensitivity', () => {
      mockedFs.readFileSync.mockReturnValue('Abandon\nAbility\nABLE');
      const wordList = loadWordList();
      
      expect(wordList.indexToWord).toEqual(['abandon', 'ability', 'able']);
      expect(wordList.wordToIndex.get('abandon')).toBe(0);
      expect(wordList.wordToIndex.get('ABANDON')).toBeUndefined();
    });

    it('should filter empty lines and trim whitespace', () => {
      mockedFs.readFileSync.mockReturnValue('abandon\n  ability  \n\nable\n\n  about  ');
      const wordList = loadWordList();
      
      expect(wordList.indexToWord).toEqual(['abandon', 'ability', 'able', 'about']);
    });

    it('should throw error for empty word list', () => {
      mockedFs.readFileSync.mockReturnValue('');
      
      expect(() => loadWordList()).toThrow(SeedPhraseError);
      expect(() => loadWordList()).toThrow('Word list is empty');
    });

    it('should throw error for file read failure', () => {
      mockedFs.readFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });
      
      expect(() => loadWordList()).toThrow(SeedPhraseError);
      expect(() => loadWordList()).toThrow('Failed to load word list');
    });
  });

  describe('getWordIndex', () => {
    beforeEach(() => {
      mockedFs.readFileSync.mockReturnValue(mockWordList);
    });

    it('should return correct index for existing words', () => {
      expect(getWordIndex('abandon')).toBe(0);
      expect(getWordIndex('ability')).toBe(1);
      expect(getWordIndex('abstract')).toBe(7);
    });

    it('should be case insensitive', () => {
      expect(getWordIndex('ABANDON')).toBe(0);
      expect(getWordIndex('Ability')).toBe(1);
      expect(getWordIndex('aBsTrAcT')).toBe(7);
    });

    it('should return null for non-existing words', () => {
      expect(getWordIndex('nonexistent')).toBeNull();
      expect(getWordIndex('invalid')).toBeNull();
    });

    it('should use provided word list', () => {
      const customWordList = {
        wordToIndex: new Map([['custom', 0], ['word', 1]]),
        indexToWord: ['custom', 'word']
      };
      
      expect(getWordIndex('custom', customWordList)).toBe(0);
      expect(getWordIndex('abandon', customWordList)).toBeNull();
    });
  });

  describe('getWordByIndex', () => {
    beforeEach(() => {
      mockedFs.readFileSync.mockReturnValue(mockWordList);
    });

    it('should return correct word for valid indices', () => {
      expect(getWordByIndex(0)).toBe('abandon');
      expect(getWordByIndex(1)).toBe('ability');
      expect(getWordByIndex(7)).toBe('abstract');
    });

    it('should return null for invalid indices', () => {
      expect(getWordByIndex(-1)).toBeNull();
      expect(getWordByIndex(100)).toBeNull();
      expect(getWordByIndex(8)).toBeNull();
    });

    it('should use provided word list', () => {
      const customWordList = {
        wordToIndex: new Map([['custom', 0], ['word', 1]]),
        indexToWord: ['custom', 'word']
      };
      
      expect(getWordByIndex(0, customWordList)).toBe('custom');
      expect(getWordByIndex(1, customWordList)).toBe('word');
      expect(getWordByIndex(2, customWordList)).toBeNull();
    });
  });

  describe('validateWords', () => {
    beforeEach(() => {
      mockedFs.readFileSync.mockReturnValue(mockWordList);
    });

    it('should validate all valid words', () => {
      const result = validateWords(['abandon', 'ability', 'able']);
      
      expect(result.validWords).toEqual(['abandon', 'ability', 'able']);
      expect(result.invalidWords).toEqual([]);
      expect(result.indices).toEqual([0, 1, 2]);
    });

    it('should handle invalid words', () => {
      const result = validateWords(['abandon', 'invalid', 'able', 'nonexistent']);
      
      expect(result.validWords).toEqual(['abandon', 'able']);
      expect(result.invalidWords).toEqual(['invalid', 'nonexistent']);
      expect(result.indices).toEqual([0, 0, 2, 0]); // Invalid words get index 0
    });

    it('should be case insensitive', () => {
      const result = validateWords(['ABANDON', 'Ability', 'aBLe']);
      
      expect(result.validWords).toEqual(['abandon', 'ability', 'able']);
      expect(result.invalidWords).toEqual([]);
      expect(result.indices).toEqual([0, 1, 2]);
    });

    it('should trim whitespace from words', () => {
      const result = validateWords(['  abandon  ', ' ability ', 'able']);
      
      expect(result.validWords).toEqual(['abandon', 'ability', 'able']);
      expect(result.invalidWords).toEqual([]);
      expect(result.indices).toEqual([0, 1, 2]);
    });

    it('should handle empty array', () => {
      const result = validateWords([]);
      
      expect(result.validWords).toEqual([]);
      expect(result.invalidWords).toEqual([]);
      expect(result.indices).toEqual([]);
    });

    it('should handle mix of valid and invalid words', () => {
      const result = validateWords(['abandon', 'xyz123', 'able', '']);
      
      expect(result.validWords).toEqual(['abandon', 'able']);
      expect(result.invalidWords).toEqual(['xyz123', '']);
      expect(result.indices).toEqual([0, 0, 2, 0]);
    });
  });

  describe('clearWordListCache', () => {
    it('should clear the cache', () => {
      // Load word list to cache it
      loadWordList();
      expect(mockedFs.readFileSync).toHaveBeenCalledTimes(1);
      
      // Load again, should use cache
      loadWordList();
      expect(mockedFs.readFileSync).toHaveBeenCalledTimes(1);
      
      // Clear cache and load again
      clearWordListCache();
      loadWordList();
      expect(mockedFs.readFileSync).toHaveBeenCalledTimes(2);
    });
  });
});