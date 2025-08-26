# 🌱 Seed Concealer

A secure monorepo for concealing and revealing cryptocurrency seed phrases using advanced salt-enhanced cryptographic techniques.

## 📦 Packages

This monorepo contains three packages:

- **[@seed-unphrase/lib](./packages/lib)** - Core cryptographic library
- **[@seed-unphrase/cli](./packages/cli)** - Command-line interface
- **[@seed-unphrase/web](./packages/web)** - React web application

## 🔐 Security Features

- **Salt-enhanced protection** - Prevents brute force attacks by making wrong attempts produce valid but incorrect BIP39 words
- **BIP39 compliance** - Uses the official 2048-word list for seed phrase validation
- **BigInt precision** - Handles up to 24-word seed phrases (97-digit numbers) without precision loss
- **Educational purpose** - Designed for learning about cryptographic concepts

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (recommended package manager)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd seed-unphrase

# Install dependencies
pnpm install

# Build all packages
pnpm build
```

### Usage

#### CLI Tool
```bash
# Run the interactive CLI
pnpm dev:cli

# Or use the built CLI
cd packages/cli && npm start
```

#### Web Application
```bash
# Start the development server
pnpm dev:web

# Build for production
pnpm build:web
```

#### Library (Programmatic)
```javascript
import { concealSeedPhrase, revealSeedPhrase } from '@seed-unphrase/lib';

// Conceal a seed phrase
const result = concealSeedPhrase({
  phrase: 'abandon ability able about above absent absorb abstract absurd abuse access accident',
  cipherKey: '123456789',
  salt: 'my-secret-salt' // Optional for enhanced security
});

console.log(result.quotient, result.remainder);

// Reveal the seed phrase
const revealed = revealSeedPhrase({
  quotient: result.quotient,
  remainder: result.remainder,
  cipherKey: '123456789',
  salt: 'my-secret-salt'
});

console.log(revealed.words.join(' '));
```

## 🛠 Development

### Available Scripts

```bash
# Development
pnpm dev:cli          # Run CLI in development mode
pnpm dev:web          # Run web app in development mode

# Building
pnpm build            # Build all packages
pnpm build:lib        # Build library only
pnpm build:cli        # Build CLI only
pnpm build:web        # Build web app only

# Testing
pnpm test             # Run all tests
pnpm test:lib         # Run library tests
pnpm test:cli         # Run CLI tests

# Type checking
pnpm typecheck        # Type check all packages

# Cleaning
pnpm clean            # Clean all build outputs
```

### Package Architecture

```
seed-unphrase/
├── packages/
│   ├── lib/          # Core cryptographic library
│   │   ├── src/      # TypeScript source code
│   │   ├── tests/    # Comprehensive test suite
│   │   └── dist/     # Built CommonJS modules
│   ├── cli/          # Command-line interface
│   │   ├── src/      # CLI source code with inquirer
│   │   ├── tests/    # CLI-specific tests
│   │   └── dist/     # Built CLI executable
│   └── web/          # React web application
│       ├── src/      # React components and pages
│       └── dist/     # Built static files
└── pnpm-workspace.yaml
```

## 🔬 How It Works

### Core Algorithm

1. **Input Processing**: Parse seed phrase words and validate against BIP39 wordlist
2. **Index Conversion**: Convert words to 0-based indices (0-2047)
3. **Salt Transformation** (Optional): Apply cryptographic salt to shift indices
4. **Number Building**: Format indices as 4-digit strings, prepend "1", create BigInt
5. **Division**: Divide the large number by cipher key → quotient:remainder
6. **Output**: Return quotient and remainder as concealed value

### Security Enhancement

The salt feature prevents brute force attacks by:
- Making each attempt with wrong salt produce valid BIP39 words
- Requiring both cipher key AND salt for correct decryption
- Using SHA-256 for cryptographically secure index transformation

### Example

```
Input:  "abandon ability able" + cipher "123" + salt "mysalt"
Words:  abandon(0) → ability(1) → able(2)
Salt:   Apply SHA-256 transformation to indices
Format: "1" + "0000" + "0001" + "0002" = 1000000010002
Divide: 1000000010002 ÷ 123 = quotient:remainder
Output: "8130081:21" (concealed value)
```

## ⚠️ Security Notice

**This tool is for educational purposes only.** While it uses strong cryptographic techniques:

- Always keep your cipher key and salt secure and separate
- Never share your concealed values without proper key management
- This is not intended as a production-grade security solution
- Test thoroughly before using with valuable seed phrases

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and add tests
4. Ensure all tests pass: `pnpm test`
5. Ensure builds work: `pnpm build`
6. Submit a pull request

## 📄 License

ISC License - see individual package LICENSE files for details.

## 🔗 Related

- [BIP39 Specification](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)
- [Cryptographic Best Practices](https://owasp.org/www-project-cryptographic-storage-cheat-sheet/)
- [Framer Motion](https://www.framer.com/motion/) (Web UI animations)