import * as fs from 'fs';
import * as path from 'path';
import { WordListData, SeedPhraseError, ErrorCodes } from './types';

let cachedWordList: WordListData | null = null;

export function loadWordList(wordListPath?: string): WordListData {
  if (cachedWordList) {
    return cachedWordList;
  }

  const filePath = wordListPath || path.join(__dirname, '..', 'english.txt');
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const words = content
      .split('\n')
      .map(word => word.trim())
      .filter(word => word.length > 0);

    if (words.length === 0) {
      throw new SeedPhraseError('Word list is empty', ErrorCodes.WORDLIST_LOAD_ERROR);
    }

    const wordToIndex = new Map<string, number>();
    const indexToWord: string[] = [];

    words.forEach((word, index) => {
      wordToIndex.set(word.toLowerCase(), index);
      indexToWord.push(word.toLowerCase());
    });

    cachedWordList = { wordToIndex, indexToWord };
    return cachedWordList;
  } catch (error) {
    if (error instanceof SeedPhraseError) {
      throw error;
    }
    throw new SeedPhraseError(
      `Failed to load word list from ${filePath}: ${error}`,
      ErrorCodes.WORDLIST_LOAD_ERROR
    );
  }
}

export function getWordIndex(word: string, wordList?: WordListData): number | null {
  const list = wordList || loadWordList();
  const index = list.wordToIndex.get(word.toLowerCase());
  return index !== undefined ? index : null;
}

export function getWordByIndex(index: number, wordList?: WordListData): string | null {
  const list = wordList || loadWordList();
  return list.indexToWord[index] || null;
}

export function validateWords(words: string[], wordList?: WordListData): {
  validWords: string[];
  invalidWords: string[];
  indices: number[];
} {
  const list = wordList || loadWordList();
  const validWords: string[] = [];
  const invalidWords: string[] = [];
  const indices: number[] = [];

  words.forEach(word => {
    const trimmedWord = word.trim().toLowerCase();
    const index = getWordIndex(trimmedWord, list);
    
    if (index !== null) {
      validWords.push(trimmedWord);
      indices.push(index);
    } else {
      invalidWords.push(trimmedWord);
      indices.push(0); // Use 0 as default for invalid words
    }
  });

  return { validWords, invalidWords, indices };
}

export function clearWordListCache(): void {
  cachedWordList = null;
}