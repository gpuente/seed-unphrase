# @seed-unphrase/cli

🌱 Interactive command-line interface for securely concealing and revealing cryptocurrency seed phrases with advanced salt-enhanced protection.

## 🚀 Installation

### Global Installation (Recommended)

```bash
npm install -g @seed-unphrase/cli
# or
yarn global add @seed-unphrase/cli
# or  
pnpm add -g @seed-unphrase/cli
```

### Local Installation

```bash
npm install @seed-unphrase/cli
# or
yarn add @seed-unphrase/cli
# or
pnpm add @seed-unphrase/cli
```

## 📖 Usage

### Interactive Mode

```bash
# Run the interactive CLI (after global install)
seed-concealer

# Or run locally
npx seed-concealer
```

The CLI provides an interactive menu with options to:
- 🔐 **Conceal a seed phrase** - Transform your seed phrase into a secure concealed value
- 🔓 **Reveal a seed phrase** - Recover your original seed phrase from concealed values
- ❌ **Exit** - Close the application

### Features

#### 🎨 Beautiful Interface
- Colorful, emoji-rich interface using Chalk
- Interactive prompts with validation
- Clear progress indicators and success/error messages
- Professional terminal styling

#### 🔐 Conceal Mode
- Input validation for seed phrases (1-24 words)
- BIP39 wordlist validation with helpful error messages
- Optional salt input for enhanced security
- Automatic cipher key generation or custom input
- Copy-friendly output format

#### 🔓 Reveal Mode  
- Parse concealed values in `quotient:remainder` format
- Validate cipher keys and optional salts
- Error handling with helpful troubleshooting tips
- Word count verification

#### 🛡️ Security Features
- **Salt Enhancement**: Optional salt for maximum security
- **Input Validation**: Comprehensive validation of all inputs
- **Error Handling**: Clear error messages without exposing sensitive data
- **Memory Safety**: Secure handling of sensitive information

### Example Session

```bash
$ seed-concealer

🌱 Seed Phrase Concealer CLI
Securely hide and reveal your crypto seed phrases

? What would you like to do? (Use arrow keys)
❯ 🔐 Conceal a seed phrase
  🔓 Reveal a seed phrase  
  ❌ Exit

# Selecting "Conceal"
? Enter your seed phrase (space-separated words): abandon ability able about above absent absorb abstract absurd abuse access accident
? Enter cipher key (positive number): 123456789
? Enable enhanced security with salt? Yes
? Enter salt value: my-secret-salt-123

✅ Seed phrase successfully concealed!

📋 Concealed Value: 8130081301:21
🔑 Cipher Key: 123456789  
🧂 Salt: my-secret-salt-123
📝 Original Words: 12

⚠️  IMPORTANT: Keep your cipher key and salt safe!
💡 You need BOTH the cipher key and salt to reveal your seed phrase.
```

## 🔧 Development

### Prerequisites
- Node.js 18+
- pnpm (recommended)

### Setup

```bash
# Clone the monorepo
git clone <repository-url>
cd seed-unphrase

# Install dependencies  
pnpm install

# Build the library dependency
pnpm build:lib

# Run in development mode
pnpm dev:cli

# Build for production
pnpm build:cli

# Test
pnpm test:cli
```

### Project Structure

```
packages/cli/
├── src/
│   └── cli.ts          # Main CLI application
├── tests/
│   └── cli.test.ts     # CLI-specific tests  
├── dist/               # Built JavaScript
├── package.json
├── tsconfig.json
└── README.md
```

## 🎯 Commands & Options

The CLI currently runs in interactive mode only. Future versions may include:

```bash
# Planned command-line arguments (not yet implemented)
seed-concealer conceal --phrase "abandon ability..." --key "123" --salt "mysalt"
seed-concealer reveal --quotient "123" --remainder "45" --key "123" --salt "mysalt"
seed-concealer validate --phrase "abandon ability..."
seed-concealer --help
seed-concealer --version
```

## 🔐 Security Best Practices

### ✅ Do
- Use unique, strong cipher keys (longer is better)
- Use random, unique salts for each concealment
- Store cipher keys and salts separately and securely
- Test the reveal process before relying on concealed values
- Use enhanced security (salt) for valuable seed phrases

### ❌ Don't
- Share concealed values without proper key management
- Use predictable or simple cipher keys/salts
- Store keys and salts together with concealed values
- Use this tool for production security without thorough testing
- Rely on this as your only backup method

## 📋 Input Validation

### Seed Phrases
- ✅ 1-24 words (BIP39 standard range)
- ✅ Words validated against official BIP39 wordlist (2048 words)
- ✅ Case-insensitive input
- ⚠️ Invalid words are replaced with "abandon" (index 0) with warnings

### Cipher Keys
- ✅ Must be positive integers
- ✅ Supports arbitrarily large numbers
- ✅ No leading zeros (except "0" itself)
- ❌ No negative numbers, decimals, or non-numeric characters

### Salts (Optional)
- ✅ Any non-empty string
- ✅ Recommended: Random, unique values
- ✅ Case-sensitive (different cases = different salts)

### Concealed Values
- ✅ Format: `quotient:remainder` (e.g., "12345:67")
- ✅ Both parts must be valid integers
- ❌ No spaces, letters, or special characters (except the colon)

## 🐛 Troubleshooting

### Common Issues

**"Invalid word detected"**
- Check spelling against BIP39 wordlist
- Ensure words are space-separated
- Invalid words are automatically replaced with "abandon"

**"Invalid cipher key"**  
- Must be a positive integer
- No letters, decimals, or special characters
- Use the same key that was used for concealment

**"Invalid concealed value format"**
- Must be in format: `quotient:remainder` 
- Both parts must be integers
- Check for typos or missing colons

**"Wrong cipher key or salt"**
- Verify you're using the exact same key and salt from concealment
- Salts are case-sensitive
- Try without salt if you didn't use one originally

### Getting Help

1. Check input format requirements above
2. Verify you're using the same cipher key and salt
3. Test with a simple example first
4. Check the main repository documentation

## 🤝 Contributing

1. Follow the monorepo development setup
2. Add tests for new features in `tests/cli.test.ts`
3. Ensure CLI follows interactive patterns
4. Test with various input combinations
5. Update documentation for new features

## 📦 Dependencies

### Runtime
- **@seed-unphrase/lib** - Core cryptographic functionality
- **commander** - Command-line framework  
- **inquirer** - Interactive prompts
- **chalk** - Terminal colors and styling

### Development
- **TypeScript** - Type-safe development
- **Jest** - Testing framework
- **ts-node** - TypeScript execution

## 📄 License

ISC License

## 🔗 Related

- [@seed-unphrase/lib](../lib) - Core library
- [@seed-unphrase/web](../web) - Web interface
- [BIP39 Wordlist](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)