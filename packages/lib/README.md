# @seed-unphrase/lib

Core cryptographic library for concealing and revealing cryptocurrency seed phrases with salt-enhanced security.

## 🚀 Installation

```bash
npm install @seed-unphrase/lib
# or
yarn add @seed-unphrase/lib
# or
pnpm add @seed-unphrase/lib
```

## 📖 Usage

### Basic Concealment

```typescript
import { concealSeedPhrase, revealSeedPhrase } from '@seed-unphrase/lib';

// Conceal a seed phrase
const { result, validation } = concealSeedPhrase({
  phrase: 'abandon ability able about above absent absorb abstract absurd abuse access accident',
  cipherKey: '123456789'
});

console.log('Concealed:', `${result.quotient}:${result.remainder}`);
console.log('Valid words:', validation.validWords.length);
console.log('Invalid words:', validation.invalidWords);

// Reveal the seed phrase
const revealed = revealSeedPhrase({
  quotient: result.quotient,
  remainder: result.remainder,
  cipherKey: '123456789'
});

if (revealed.success) {
  console.log('Revealed:', revealed.words.join(' '));
} else {
  console.error('Error:', revealed.error);
}
```

### Enhanced Security with Salt

```typescript
import { concealSeedPhrase, revealSeedPhrase } from '@seed-unphrase/lib';

// Conceal with salt for enhanced security
const { result, validation } = concealSeedPhrase({
  phrase: 'abandon ability able about above absent absorb abstract absurd abuse access accident',
  cipherKey: '123456789',
  salt: 'my-secret-salt-value'
});

console.log('Enhanced concealed:', `${result.quotient}:${result.remainder}`);

// Reveal with salt (both cipher key AND salt required)
const revealed = revealSeedPhrase({
  quotient: result.quotient,
  remainder: result.remainder,
  cipherKey: '123456789',
  salt: 'my-secret-salt-value'
});

console.log('Revealed:', revealed.words.join(' '));
```

### Validation Only

```typescript
import { validateSeedPhrase } from '@seed-unphrase/lib';

const validation = validateSeedPhrase('abandon ability invalid about');
console.log('Valid words:', validation.validWords);     // ['abandon', 'ability', 'about']
console.log('Invalid words:', validation.invalidWords); // ['invalid']
console.log('Word indices:', validation.wordIndices);   // [0, 1, 0, 3] (invalid words get index 0)
```

### Working with Word Lists

```typescript
import { 
  loadWordList, 
  getWordIndex, 
  getWordByIndex, 
  validateWords 
} from '@seed-unphrase/lib';

// Load the BIP39 word list
const wordList = loadWordList();
console.log('Total words:', wordList.wordToIndex.size); // 2048

// Get word index
const index = getWordIndex('abandon'); // 0
console.log('Index of "abandon":', index);

// Get word by index
const word = getWordByIndex(0); // 'abandon'
console.log('Word at index 0:', word);

// Validate multiple words
const words = ['abandon', 'ability', 'invalid'];
const result = validateWords(words, wordList);
console.log('Validation result:', result);
```

### Utility Functions

```typescript
import { 
  formatConcealResult,
  formatRevealResult,
  parseConcealedValue,
  validateCipherKey
} from '@seed-unphrase/lib';

// Format results for display
const concealedDisplay = formatConcealResult({ 
  quotient: '12345', 
  remainder: '67', 
  originalWordCount: 12 
});

const revealedDisplay = formatRevealResult({ 
  words: ['abandon', 'ability'], 
  success: true 
});

// Parse concealed value string
const { quotient, remainder } = parseConcealedValue('12345:67');

// Validate cipher key
try {
  const cipherKeyBigInt = validateCipherKey('123456789');
  console.log('Valid cipher key:', cipherKeyBigInt.toString());
} catch (error) {
  console.error('Invalid cipher key:', error.message);
}
```

## 🔐 API Reference

### Core Functions

#### `concealSeedPhrase(options: ConcealOptions)`

Conceals a seed phrase using the provided cipher key and optional salt.

**Parameters:**
- `options.phrase: string` - Space-separated seed phrase words
- `options.cipherKey: string` - Positive integer as string
- `options.salt?: string` - Optional salt for enhanced security

**Returns:**
- `result: ConcealResult` - Contains quotient, remainder, and word count
- `validation: WordValidationResult` - Contains validation info about words

#### `revealSeedPhrase(options: RevealOptions)`

Reveals a concealed seed phrase.

**Parameters:**
- `options.quotient: string` - Quotient from concealment
- `options.remainder: string` - Remainder from concealment  
- `options.cipherKey: string` - Same cipher key used for concealment
- `options.salt?: string` - Same salt used for concealment (if any)

**Returns:**
- `RevealResult` - Contains words array, success boolean, and optional error

### Types

```typescript
interface ConcealOptions {
  phrase: string;
  cipherKey: string;
  salt?: string;
}

interface RevealOptions {
  quotient: string;
  remainder: string;
  cipherKey: string;
  salt?: string;
}

interface ConcealResult {
  quotient: string;
  remainder: string;
  originalWordCount: number;
}

interface RevealResult {
  words: string[];
  success: boolean;
  error?: string;
}

interface WordValidationResult {
  validWords: string[];
  invalidWords: string[];
  wordIndices: number[];
}
```

## 🔬 How It Works

### Algorithm Steps

1. **Word Validation**: Check each word against BIP39 wordlist (2048 words)
2. **Index Conversion**: Convert valid words to 0-based indices  
3. **Salt Transformation** (if provided): Apply SHA-256-based transformation to indices
4. **Number Building**: Format indices as 4-digit zero-padded strings, prepend "1"
5. **Division**: Divide resulting BigInt by cipher key to get quotient and remainder
6. **Storage**: Store quotient:remainder as concealed value

### Salt Security Enhancement  

The salt feature provides security through indistinguishability:
- Wrong salt produces different but valid BIP39 words
- Attackers cannot distinguish correct from incorrect attempts  
- Requires both cipher key AND salt for successful decryption
- Uses SHA-256 for cryptographically secure index transformation

### Precision Handling

- Supports 1-24 word seed phrases (up to 97-digit numbers)
- Uses JavaScript BigInt for arbitrary precision arithmetic
- Quotient:remainder format avoids floating-point precision issues
- All calculations maintain exact integer precision

## ⚠️ Security Considerations

- **Educational Purpose**: This library is for educational use
- **Key Management**: Keep cipher keys and salts secure and separate
- **Salt Importance**: Use unique, random salts for maximum security
- **Validation**: Always validate input seed phrases before processing
- **Testing**: Thoroughly test with your specific use cases

## 🧪 Testing

The library includes comprehensive tests covering:

- Core concealment/reveal functionality
- Salt-enhanced security features  
- Edge cases and error conditions
- BIP39 wordlist operations
- BigInt precision handling
- Backward compatibility

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 📦 Dependencies

- **Runtime**: None (zero dependencies)
- **Development**: TypeScript, Jest, Node.js types

## 📄 License

ISC License