# Seed Phrase Concealer 🌱

A secure CLI tool to hide and reveal crypto seed phrases using personal cipher keys.

## Features

- 🔐 **Conceal** seed phrases using a personal cipher key
- 🔓 **Reveal** concealed seed phrases with the same cipher key
- 🧂 **Enhanced security** with optional salt parameter
- ⚠️ **Validate** seed phrases against BIP39 word list
- 📊 **Support** for 1-24 word seed phrases
- 🎯 **Perfect reversibility** with BigInt precision
- 🛡️ **Brute-force protection** through salt transformation
- 📚 **Reusable library** for integration into other applications
- ✨ **Interactive CLI** with colored output and emojis
- 🔄 **Backward compatibility** with existing concealed values

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd seed-unphrase

# Install dependencies
npm install

# Build the project
npm run build

# Run the CLI
npm start
```

## Usage

### Interactive Mode (Default)

```bash
npm start
```

This will launch an interactive menu where you can choose to conceal or reveal seed phrases.

### Command Line Options

```bash
# Conceal a seed phrase
npm run dev -- conceal

# Reveal a concealed seed phrase  
npm run dev -- reveal

# Show help
npm run dev -- --help
```

### How It Works

#### Concealing a Seed Phrase

1. Enter your seed phrase (space-separated words)
2. Enter a cipher key (any positive number)
3. **[Optional]** Enter a salt (any text for enhanced security)
4. The tool will:
   - Validate words against the BIP39 word list
   - Warn about any invalid words (replaced with index 0)
   - Convert words to indices (0000-2047 format)
   - **[If salt provided]** Transform indices using deterministic salt hashing
   - Create a large number by concatenating transformed indices with "1" prefix
   - Divide by your cipher key
   - Return the result as `quotient:remainder`

#### Revealing a Seed Phrase

1. Enter the concealed value (in `quotient:remainder` format)
2. Enter the same cipher key used for concealment
3. **[Optional]** Enter the same salt used during concealment
4. The tool will:
   - Multiply quotient by cipher key and add remainder
   - Remove the "1" prefix
   - Split into 4-digit word indices
   - **[If salt provided]** Reverse the salt transformation to get original indices
   - Convert indices back to words

### Salt-Enhanced Security 🛡️

The salt feature adds an extra layer of security by transforming word indices before concealment:

#### How Salt Works

- **Deterministic transformation**: Same salt always produces the same transformation
- **Position-specific**: Each word position gets a unique transformation based on salt + position
- **BIP39 compatible**: All transformed indices remain within valid range (0-2047)
- **Indistinguishable results**: Wrong salt still produces valid BIP39 words, preventing brute force detection

#### Security Benefits

1. **Brute-force protection**: Attackers cannot determine if they found the correct cipher key
2. **Two-factor security**: Requires both cipher key AND salt to reveal correct phrase
3. **False positives**: Wrong attempts produce valid-looking but incorrect seed phrases
4. **Backward compatibility**: Works with existing concealed values (no salt = no transformation)

#### Best Practices

- Use a memorable but unique salt (like a personal phrase or date)
- Keep salt separate from concealed value (don't write them together)
- Salt can be any text - even spaces and special characters work
- Empty salt is equivalent to no salt (maintains backward compatibility)

### Example

#### Basic Example (No Salt)
```bash
Input phrase: "abandon ability able"
Cipher key: "137643"
Concealed value: "7262969588765:45678"

# To reveal:
Concealed value: "7262969588765:45678"  
Cipher key: "137643"
Result: "abandon ability able"
```

#### Enhanced Security Example (With Salt)
```bash
Input phrase: "abandon ability able"
Cipher key: "137643"
Salt: "my_secret_phrase"
Concealed value: "8423157932184:91234"

# To reveal (requires BOTH cipher key AND salt):
Concealed value: "8423157932184:91234"
Cipher key: "137643"
Salt: "my_secret_phrase"
Result: "abandon ability able"

# Wrong salt produces different (but valid) words:
Concealed value: "8423157932184:91234"
Cipher key: "137643"
Salt: "wrong_salt"
Result: "absorb abstract about" # Valid BIP39 words, but incorrect!
```

## Library Usage

You can also use this as a library in your own projects:

```typescript
import { concealSeedPhrase, revealSeedPhrase } from 'seed-unphrase';

// Basic concealment (no salt)
const { result, validation } = concealSeedPhrase({
  phrase: 'abandon ability able',
  cipherKey: '137643'
});

console.log(`Concealed: ${result.quotient}:${result.remainder}`);
console.log(`Invalid words: ${validation.invalidWords}`);

// Enhanced security with salt
const saltedResult = concealSeedPhrase({
  phrase: 'abandon ability able',
  cipherKey: '137643',
  salt: 'my_secret_phrase'
});

console.log(`Salted concealed: ${saltedResult.result.quotient}:${saltedResult.result.remainder}`);

// Reveal without salt
const basicReveal = revealSeedPhrase({
  concealedValue: `${result.quotient}:${result.remainder}`,
  cipherKey: '137643'
});

console.log(`Basic revealed: ${basicReveal.words.join(' ')}`);

// Reveal with salt (both cipher key AND salt required)
const saltedReveal = revealSeedPhrase({
  concealedValue: `${saltedResult.result.quotient}:${saltedResult.result.remainder}`,
  cipherKey: '137643',
  salt: 'my_secret_phrase'
});

console.log(`Salted revealed: ${saltedReveal.words.join(' ')}`);
```

## Security Considerations

### Essential Security
- **Keep your cipher key safe**: Without it, you cannot recover your seed phrase
- **Remember your salt**: If used, both cipher key AND salt are required for recovery
- **Store separately**: Never write the salt and concealed value in the same location
- **Invalid words**: Words not in the BIP39 list are replaced with index 0 ("abandon")

### Enhanced Security with Salt
- **Brute-force protection**: Salt makes it impossible for attackers to detect correct guesses
- **Two-factor security**: Even with the concealed value, both key and salt are needed
- **Plausible deniability**: Wrong combinations produce valid-looking but incorrect phrases
- **Optional but recommended**: Salt is completely optional but significantly increases security

### Technical Guarantees
- **Precision**: Uses BigInt arithmetic to ensure perfect reversibility
- **No data loss**: The quotient:remainder format prevents decimal precision issues
- **Deterministic**: Same inputs always produce the same outputs
- **Backward compatible**: Existing concealed values work without modification

## API Reference

### Core Functions

- `concealSeedPhrase(options)` - Conceal a seed phrase
- `revealSeedPhrase(options)` - Reveal a concealed seed phrase
- `validateSeedPhrase(phrase)` - Validate words against BIP39 list

### Utilities

- `loadWordList(path?)` - Load BIP39 word list
- `validateWords(words)` - Check words against word list
- `parseWords(phrase)` - Split phrase into words
- `validateCipherKey(key)` - Validate cipher key format

### Salt Functions

- `generateSaltTransforms(salt, count)` - Generate position-specific transformations
- `applySaltTransformation(indices, salt?)` - Transform word indices using salt
- `reverseSaltTransformation(indices, salt?)` - Reverse salt transformation

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build the project
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Type checking
npm run typecheck
```

## Testing

The project includes comprehensive tests:

- Unit tests for all utility functions
- Integration tests for encoder/decoder
- End-to-end tests for real-world scenarios
- Edge case testing for error conditions

```bash
npm test
```

## License

ISC License

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

---

⚠️ **Important**: This tool is for educational purposes. Always keep multiple secure backups of your actual seed phrases. Never store them digitally without proper encryption.