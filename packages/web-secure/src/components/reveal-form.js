/**
 * Simple Reveal Form Component
 * Handles seed phrase revelation with the lib functions
 */

import { revealSeedPhrase } from '@seed-unphrase/lib';
import { setProcessing, setResult, updateSecurityLevel } from '../main.js';
import toast from '../utils/toast.js';

let isInitialized = false;

/**
 * Handle reveal form submission
 */
async function handleRevealSubmit(event) {
    event.preventDefault();
    
    // Get form data
    const concealedValue = document.getElementById('concealed-value').value.trim();
    const cipherKey = document.getElementById('reveal-cipher-key').value.trim();
    const useSalt = document.getElementById('reveal-use-salt').checked;
    const saltValue = useSalt ? document.getElementById('reveal-salt-value').value.trim() : '';
    
    // Basic validation
    if (!concealedValue) {
        toast.error('Concealed value is required');
        return;
    }
    if (!cipherKey) {
        toast.error('Cipher key is required');
        return;
    }
    if (!concealedValue.includes(':')) {
        toast.error('Concealed value must be in quotient:remainder format');
        return;
    }
    
    setProcessing(true);
    
    try {
        // Small delay for UX
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const options = {
            concealedValue: concealedValue,
            cipherKey: cipherKey,
            salt: saltValue || undefined
        };
        
        const result = revealSeedPhrase(options);
        
        if (!result.success) {
            throw new Error(result.error || 'Failed to reveal seed phrase');
        }
        
        // Set result
        setResult({
            phrase: result.words.join(' '),
            wordCount: result.words.length
        }, 'reveal');
        
        toast.success('Seed Phrase Revealed! 🔓', {
            description: 'Your concealed value has been successfully decrypted'
        });
        
    } catch (error) {
        console.error('Reveal error:', error);
        toast.error('Reveal Failed', {
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
    const useSalt = document.getElementById('reveal-use-salt').checked;
    const saltContainer = document.getElementById('reveal-salt-input-container');
    const saltInput = document.getElementById('reveal-salt-value');
    
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
    const useSalt = document.getElementById('reveal-use-salt').checked;
    const saltValue = document.getElementById('reveal-salt-value').value;
    updateSecurityLevel(useSalt, saltValue);
}

/**
 * Initialize reveal form
 */
export async function initializeRevealForm() {
    if (isInitialized) return;
    
    try {
        const form = document.getElementById('reveal-form-element');
        if (!form) {
            throw new Error('Reveal form not found');
        }
        
        // Add form submit handler
        form.addEventListener('submit', handleRevealSubmit);
        
        // Add salt toggle handler
        const saltCheckbox = document.getElementById('reveal-use-salt');
        if (saltCheckbox) {
            saltCheckbox.addEventListener('change', handleSaltToggle);
        }
        
        // Add salt input handler
        const saltInput = document.getElementById('reveal-salt-value');
        if (saltInput) {
            saltInput.addEventListener('input', handleSaltInput);
        }
        
        isInitialized = true;
        console.log('✅ Reveal form initialized');
        
    } catch (error) {
        console.error('❌ Failed to initialize reveal form:', error);
        throw error;
    }
}

export default { initializeRevealForm };