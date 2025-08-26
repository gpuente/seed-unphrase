#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { 
  concealSeedPhrase, 
  revealSeedPhrase, 
  formatConcealResult, 
  formatRevealResult 
} from '@seed-unphrase/lib';

const program = new Command();

interface ConcealAnswers {
  seedPhrase: string;
  cipherKey: string;
  salt?: string;
}

interface RevealAnswers {
  concealedValue: string;
  cipherKey: string;
  salt?: string;
}

async function concealFlow(): Promise<void> {
  console.log(chalk.blue.bold('\n🔐 Seed Phrase Concealer'));
  console.log(chalk.gray('Hide your seed phrase using a personal cipher key\n'));

  const answers = await inquirer.prompt<ConcealAnswers>([
    {
      type: 'input',
      name: 'seedPhrase',
      message: 'Enter your seed phrase (space-separated words):',
      validate: (input: string) => {
        const words = input.trim().split(/\s+/);
        if (words.length === 0) return 'Please enter at least one word';
        if (words.length > 24) return 'Maximum 24 words allowed';
        return true;
      }
    },
    {
      type: 'password',
      name: 'cipherKey',
      message: 'Enter your cipher key (a positive number):',
      mask: '*',
      validate: (input: string) => {
        const num = input.trim();
        if (!num) return 'Cipher key cannot be empty';
        try {
          const bigIntValue = BigInt(num);
          if (bigIntValue <= 0n) return 'Cipher key must be a positive number';
          return true;
        } catch {
          return 'Please enter a valid number';
        }
      }
    },
    {
      type: 'password',
      name: 'salt',
      message: 'Enter optional salt (leave empty for no salt):',
      mask: '*',
      validate: (input: string) => {
        // Salt is optional, so empty input is valid
        return true;
      },
      filter: (input: string) => {
        const trimmed = input.trim();
        return trimmed === '' ? undefined : trimmed;
      }
    }
  ]);

  try {
    console.log(chalk.yellow('\n⏳ Processing...'));
    
    const { result, validation } = concealSeedPhrase({
      phrase: answers.seedPhrase,
      cipherKey: answers.cipherKey,
      salt: answers.salt
    });

    // Show warnings for invalid words
    if (validation.invalidWords.length > 0) {
      console.log(chalk.red.bold('\n⚠️  Warning: Invalid words detected!'));
      console.log(chalk.red('The following words were not found in the BIP39 word list:'));
      validation.invalidWords.forEach((word: string) => {
        console.log(chalk.red(`  • ${word}`));
      });
      console.log(chalk.yellow('These words were replaced with index 0 (word: "abandon")\n'));
    }

    console.log(chalk.green.bold('✅ Seed phrase successfully concealed!'));
    console.log(chalk.cyan('\n📋 Your concealed value:'));
    console.log(chalk.white.bold(formatConcealResult(result)));
    
    console.log(chalk.gray('\n📊 Summary:'));
    console.log(chalk.gray(`  • Original word count: ${result.originalWordCount}`));
    console.log(chalk.gray(`  • Valid words: ${validation.validWords.length}`));
    console.log(chalk.gray(`  • Invalid words: ${validation.invalidWords.length}`));
    console.log(chalk.gray('\n💡 Keep both your concealed value and cipher key safe!'));
    
  } catch (error) {
    console.log(chalk.red.bold('\n❌ Error:'), chalk.red(error instanceof Error ? error.message : 'Unknown error'));
  }
}

async function revealFlow(): Promise<void> {
  console.log(chalk.blue.bold('\n🔓 Seed Phrase Revealer'));
  console.log(chalk.gray('Reveal your seed phrase using the concealed value and cipher key\n'));

  const answers = await inquirer.prompt<RevealAnswers>([
    {
      type: 'input',
      name: 'concealedValue',
      message: 'Enter your concealed value (quotient:remainder format):',
      validate: (input: string) => {
        const value = input.trim();
        if (!value) return 'Please enter the concealed value';
        if (!value.includes(':')) return 'Format must be "quotient:remainder"';
        const parts = value.split(':');
        if (parts.length !== 2) return 'Format must be "quotient:remainder"';
        try {
          BigInt(parts[0]);
          BigInt(parts[1]);
          return true;
        } catch {
          return 'Invalid number format';
        }
      }
    },
    {
      type: 'password',
      name: 'cipherKey',
      message: 'Enter your cipher key:',
      mask: '*',
      validate: (input: string) => {
        const num = input.trim();
        if (!num) return 'Cipher key cannot be empty';
        try {
          const bigIntValue = BigInt(num);
          if (bigIntValue <= 0n) return 'Cipher key must be a positive number';
          return true;
        } catch {
          return 'Please enter a valid number';
        }
      }
    },
    {
      type: 'password',
      name: 'salt',
      message: 'Enter optional salt (leave empty if no salt was used):',
      mask: '*',
      validate: (input: string) => {
        // Salt is optional, so empty input is valid
        return true;
      },
      filter: (input: string) => {
        const trimmed = input.trim();
        return trimmed === '' ? undefined : trimmed;
      }
    }
  ]);

  try {
    console.log(chalk.yellow('\n⏳ Processing...'));
    
    const result = revealSeedPhrase({
      concealedValue: answers.concealedValue,
      cipherKey: answers.cipherKey,
      salt: answers.salt
    });

    if (result.success) {
      console.log(chalk.green.bold('✅ Seed phrase successfully revealed!'));
      console.log(chalk.cyan('\n🔑 Your seed phrase:'));
      console.log(chalk.white.bold(formatRevealResult(result)));
      console.log(chalk.gray(`\n📊 Word count: ${result.words.length}`));
    } else {
      console.log(chalk.red.bold('❌ Failed to reveal seed phrase'));
      console.log(chalk.red(result.error));
    }
    
  } catch (error) {
    console.log(chalk.red.bold('\n❌ Error:'), chalk.red(error instanceof Error ? error.message : 'Unknown error'));
  }
}

async function mainMenu(): Promise<void> {
  console.log(chalk.magenta.bold('\n🌱 Seed Phrase Concealer CLI'));
  console.log(chalk.gray('Securely hide and reveal your crypto seed phrases\n'));

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        {
          name: '🔐 Conceal a seed phrase',
          value: 'conceal'
        },
        {
          name: '🔓 Reveal a seed phrase',
          value: 'reveal'
        },
        {
          name: '❌ Exit',
          value: 'exit'
        }
      ]
    }
  ]);

  switch (action) {
    case 'conceal':
      await concealFlow();
      break;
    case 'reveal':
      await revealFlow();
      break;
    case 'exit':
      console.log(chalk.gray('\nGoodbye! 👋'));
      process.exit(0);
  }

  // Ask if user wants to continue
  const { continue: shouldContinue } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'continue',
      message: 'Would you like to perform another operation?',
      default: false
    }
  ]);

  if (shouldContinue) {
    await mainMenu();
  } else {
    console.log(chalk.gray('\nGoodbye! 👋'));
  }
}

// Setup CLI program
program
  .name('seed-concealer')
  .description('CLI tool to securely hide and reveal crypto seed phrases')
  .version('1.0.0');

program
  .command('interactive', { isDefault: true })
  .description('Start interactive mode')
  .action(mainMenu);

program
  .command('conceal')
  .description('Conceal a seed phrase')
  .action(concealFlow);

program
  .command('reveal')
  .description('Reveal a concealed seed phrase')
  .action(revealFlow);

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red.bold('Unhandled Rejection at:'), promise, chalk.red('reason:'), reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error(chalk.red.bold('Uncaught Exception:'), error);
  process.exit(1);
});

// Start the CLI
if (require.main === module) {
  program.parse();
}