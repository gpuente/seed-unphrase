/**
 * Simple Conceal Form Component
 * Handles seed phrase concealment with the lib functions
 */

import { concealSeedPhrase } from '@seed-unphrase/lib';
import { setProcessing, setResult, updateSecurityLevel } from '../main.js';
import toast from '../utils/toast.js';

let isInitialized = false;

/**
 * Handle conceal form submission
 */
async function handleConcealSubmit(event) {
    event.preventDefault();
    
    // Get form data
    const seedPhrase = document.getElementById('seed-phrase').value.trim();
    const cipherKey = document.getElementById('cipher-key').value.trim();
    const useSalt = document.getElementById('use-salt').checked;
    const saltValue = useSalt ? document.getElementById('salt-value').value.trim() : '';
    
    // Basic validation
    if (!seedPhrase) {
        toast.error('Seed phrase is required');
        return;
    }
    if (!cipherKey) {
        toast.error('Cipher key is required');
        return;
    }
    
    setProcessing(true);
    
    try {
        // Small delay for UX
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const options = {
            phrase: seedPhrase,
            cipherKey: cipherKey,
            salt: saltValue || undefined
        };
        
        const { result, validation } = concealSeedPhrase(options);
        
        // Handle validation warnings
        if (validation.invalidWords.length > 0) {
            toast.warning('Invalid Words Detected', {
                description: `${validation.invalidWords.length} invalid word(s) were replaced with "abandon"`
            });
        }
        
        // Set result
        setResult({
            quotient: result.quotient,
            remainder: result.remainder,
            originalWordCount: result.originalWordCount,
            concealedValue: `${result.quotient}:${result.remainder}`
        }, 'conceal');
        
        toast.success('Seed Phrase Concealed! 🎉', {
            description: 'Your seed phrase has been successfully hidden'
        });
        
    } catch (error) {
        console.error('Concealment error:', error);
        toast.error('Concealment Failed', {
            description: error.message || 'An unexpected error occurred'
        });
    } finally {
        setProcessing(false);
    }
}

/**
 * Handle salt checkbox change
 */
function handleSaltToggle() {
    const useSalt = document.getElementById('use-salt').checked;
    const saltContainer = document.getElementById('salt-input-container');
    const saltInput = document.getElementById('salt-value');
    
    if (useSalt) {
        saltContainer.classList.remove('hidden');
    } else {
        saltContainer.classList.add('hidden');
        saltInput.value = '';
    }
    
    updateSecurityLevel(useSalt, saltInput.value);
}

/**
 * Handle salt input changes
 */
function handleSaltInput() {
    const useSalt = document.getElementById('use-salt').checked;
    const saltValue = document.getElementById('salt-value').value;
    updateSecurityLevel(useSalt, saltValue);
}

/**
 * Initialize conceal form
 */
export async function initializeConcealForm() {
    if (isInitialized) return;
    
    try {
        const form = document.getElementById('conceal-form-element');
        if (!form) {
            throw new Error('Conceal form not found');
        }
        
        // Add form submit handler
        form.addEventListener('submit', handleConcealSubmit);
        
        // Add salt toggle handler
        const saltCheckbox = document.getElementById('use-salt');
        if (saltCheckbox) {
            saltCheckbox.addEventListener('change', handleSaltToggle);
        }
        
        // Add salt input handler
        const saltInput = document.getElementById('salt-value');
        if (saltInput) {
            saltInput.addEventListener('input', handleSaltInput);
        }
        
        isInitialized = true;
        console.log('✅ Conceal form initialized');
        
    } catch (error) {
        console.error('❌ Failed to initialize conceal form:', error);
        throw error;
    }
}

export default { initializeConcealForm };