/**
 * Form Validation Utilities
 * Zero-dependency form validation similar to react-hook-form
 */

import { getValue, setFieldError, clearFormErrors } from './dom.js';

/**
 * Validation rule types
 */
export const VALIDATION_RULES = {
    REQUIRED: 'required',
    MIN_LENGTH: 'minLength',
    MAX_LENGTH: 'maxLength',
    PATTERN: 'pattern',
    CUSTOM: 'custom'
};

/**
 * Validation rule configurations
 */
const VALIDATION_CONFIG = {
    seedPhrase: {
        required: 'Seed phrase is required',
        custom: (value) => {
            const words = value.trim().split(/\s+/).filter(word => word.length > 0);
            if (words.length === 0) return 'Please enter at least one word';
            if (words.length > 24) return 'Maximum 24 words allowed';
            return true;
        }
    },
    cipherKey: {
        required: 'Cipher key is required',
        custom: (value) => {
            const trimmed = value.trim();
            if (!trimmed) return 'Cipher key cannot be empty';
            try {
                const bigIntValue = BigInt(trimmed);
                if (bigIntValue <= 0n) return 'Cipher key must be a positive number';
                return true;
            } catch {
                return 'Please enter a valid number';
            }
        }
    },
    concealedValue: {
        required: 'Concealed value is required',
        custom: (value) => {
            const trimmed = value.trim();
            if (!trimmed) return 'Concealed value cannot be empty';
            if (!trimmed.includes(':')) return 'Concealed value must be in quotient:remainder format';
            const [quotient, remainder] = trimmed.split(':');
            if (!quotient || !remainder) return 'Invalid format. Use quotient:remainder';
            try {
                BigInt(quotient);
                BigInt(remainder);
                return true;
            } catch {
                return 'Both quotient and remainder must be valid numbers';
            }
        }
    }
};

/**
 * Validate single field value against rules
 * @param {string} value - Field value
 * @param {object} rules - Validation rules
 * @returns {string|null} Error message or null if valid
 */
function validateField(value, rules) {
    // Required validation
    if (rules.required && (!value || value.trim() === '')) {
        return typeof rules.required === 'string' ? rules.required : 'This field is required';
    }
    
    // Skip other validations if field is empty and not required
    if (!value || value.trim() === '') {
        return null;
    }
    
    const trimmedValue = value.trim();
    
    // Min length validation
    if (rules.minLength) {
        const { value: minLen, message } = typeof rules.minLength === 'object' 
            ? rules.minLength 
            : { value: rules.minLength, message: `Minimum length is ${rules.minLength}` };
        
        if (trimmedValue.length < minLen) {
            return message;
        }
    }
    
    // Max length validation
    if (rules.maxLength) {
        const { value: maxLen, message } = typeof rules.maxLength === 'object'
            ? rules.maxLength
            : { value: rules.maxLength, message: `Maximum length is ${rules.maxLength}` };
        
        if (trimmedValue.length > maxLen) {
            return message;
        }
    }
    
    // Pattern validation
    if (rules.pattern) {
        const { value: pattern, message } = typeof rules.pattern === 'object'
            ? rules.pattern
            : { value: rules.pattern, message: 'Invalid format' };
        
        const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
        if (!regex.test(trimmedValue)) {
            return message;
        }
    }
    
    // Custom validation
    if (rules.custom && typeof rules.custom === 'function') {
        const result = rules.custom(trimmedValue);
        if (result !== true) {
            return typeof result === 'string' ? result : 'Invalid value';
        }
    }
    
    return null;
}

/**
 * Get validation rules for a field
 * @param {string} fieldName - Field name
 * @returns {object} Validation rules
 */
function getValidationRules(fieldName) {
    // Remove common prefixes/suffixes to get base field name
    const baseFieldName = fieldName
        .replace(/^reveal-/, '')
        .replace(/-key$/, 'Key')
        .replace(/-value$/, 'Value')
        .replace(/-phrase$/, 'Phrase');
    
    // Map field names to validation configs
    const fieldMappings = {
        'seed-phrase': 'seedPhrase',
        'cipher-key': 'cipherKey',
        'reveal-cipher-key': 'cipherKey', 
        'concealed-value': 'concealedValue',
        'cipherKey': 'cipherKey',
        'concealedValue': 'concealedValue',
        'seedPhrase': 'seedPhrase'
    };
    
    const configKey = fieldMappings[fieldName] || fieldMappings[baseFieldName];
    return VALIDATION_CONFIG[configKey] || {};
}

/**
 * Validate form field and show/hide error
 * @param {string} fieldId - Field element ID
 * @param {object} customRules - Custom validation rules (optional)
 * @returns {boolean} True if valid
 */
export function validateFormField(fieldId, customRules = null) {
    const value = getValue(fieldId);
    const rules = customRules || getValidationRules(fieldId);
    
    const error = validateField(value, rules);
    setFieldError(fieldId, error);
    
    return error === null;
}

/**
 * Validate entire form
 * @param {string} formId - Form element ID
 * @param {object} fieldRules - Custom field validation rules (optional)
 * @returns {object} Validation result with isValid flag and errors object
 */
export function validateForm(formId, fieldRules = {}) {
    const form = document.getElementById(formId);
    if (!form) {
        console.error(`Form with ID "${formId}" not found`);
        return { isValid: false, errors: {} };
    }
    
    // Clear existing errors
    clearFormErrors(form);
    
    const errors = {};
    let isValid = true;
    
    // Get all form inputs
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        const fieldId = input.id;
        if (!fieldId) return;
        
        const customRules = fieldRules[fieldId];
        const fieldIsValid = validateFormField(fieldId, customRules);
        
        if (!fieldIsValid) {
            const errorElement = document.getElementById(fieldId + '-error');
            if (errorElement) {
                errors[fieldId] = errorElement.textContent;
            }
            isValid = false;
        }
    });
    
    return { isValid, errors };
}

/**
 * Get form data with validation
 * @param {string} formId - Form element ID
 * @param {object} fieldRules - Custom field validation rules (optional)
 * @returns {object} Form data with validation result
 */
export function getValidatedFormData(formId, fieldRules = {}) {
    const form = document.getElementById(formId);
    if (!form) {
        return { 
            data: {}, 
            isValid: false, 
            errors: { form: 'Form not found' }
        };
    }
    
    // Get form data
    const formData = new FormData(form);
    const data = {};
    
    // Convert FormData to plain object
    for (const [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    // Also get values from elements with IDs (for better control)
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        if (input.id && input.name) {
            data[input.name] = input.value;
        } else if (input.id) {
            // Use ID as key if no name attribute
            const key = input.id.replace(/-/g, '_');
            data[key] = input.value;
        }
    });
    
    // Add checkbox states
    const checkboxes = form.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        if (checkbox.id) {
            const key = checkbox.name || checkbox.id.replace(/-/g, '_');
            data[key] = checkbox.checked;
        }
    });
    
    // Validate form
    const validation = validateForm(formId, fieldRules);
    
    return {
        data,
        isValid: validation.isValid,
        errors: validation.errors
    };
}

/**
 * Real-time field validation setup
 * @param {string} fieldId - Field element ID
 * @param {object} rules - Validation rules (optional)
 * @param {number} debounceMs - Debounce delay in milliseconds
 */
export function setupRealTimeValidation(fieldId, rules = null, debounceMs = 300) {
    const field = document.getElementById(fieldId);
    if (!field) {
        console.error(`Field with ID "${fieldId}" not found`);
        return;
    }
    
    let timeoutId;
    
    const validateWithDebounce = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            validateFormField(fieldId, rules);
        }, debounceMs);
    };
    
    // Add event listeners
    field.addEventListener('blur', () => validateFormField(fieldId, rules));
    field.addEventListener('input', validateWithDebounce);
    field.addEventListener('change', validateWithDebounce);
}

/**
 * Setup real-time validation for entire form
 * @param {string} formId - Form element ID
 * @param {object} fieldRules - Field-specific validation rules
 * @param {number} debounceMs - Debounce delay in milliseconds
 */
export function setupFormValidation(formId, fieldRules = {}, debounceMs = 300) {
    const form = document.getElementById(formId);
    if (!form) {
        console.error(`Form with ID "${formId}" not found`);
        return;
    }
    
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        if (input.id) {
            const rules = fieldRules[input.id];
            setupRealTimeValidation(input.id, rules, debounceMs);
        }
    });
}

/**
 * Validation utilities for specific field types
 */
export const validators = {
    /**
     * Validate seed phrase
     * @param {string} value - Seed phrase
     * @returns {string|null} Error message or null
     */
    seedPhrase: (value) => {
        if (!value || value.trim() === '') {
            return 'Seed phrase is required';
        }
        
        const words = value.trim().split(/\s+/).filter(word => word.length > 0);
        if (words.length === 0) {
            return 'Please enter at least one word';
        }
        if (words.length > 24) {
            return 'Maximum 24 words allowed';
        }
        
        return null;
    },
    
    /**
     * Validate cipher key
     * @param {string} value - Cipher key
     * @returns {string|null} Error message or null
     */
    cipherKey: (value) => {
        if (!value || value.trim() === '') {
            return 'Cipher key is required';
        }
        
        const trimmed = value.trim();
        try {
            const bigIntValue = BigInt(trimmed);
            if (bigIntValue <= 0n) {
                return 'Cipher key must be a positive number';
            }
        } catch {
            return 'Please enter a valid number';
        }
        
        return null;
    },
    
    /**
     * Validate concealed value
     * @param {string} value - Concealed value
     * @returns {string|null} Error message or null
     */
    concealedValue: (value) => {
        if (!value || value.trim() === '') {
            return 'Concealed value is required';
        }
        
        const trimmed = value.trim();
        if (!trimmed.includes(':')) {
            return 'Concealed value must be in quotient:remainder format';
        }
        
        const parts = trimmed.split(':');
        if (parts.length !== 2) {
            return 'Invalid format. Use quotient:remainder';
        }
        
        const [quotient, remainder] = parts;
        if (!quotient || !remainder) {
            return 'Invalid format. Use quotient:remainder';
        }
        
        try {
            BigInt(quotient);
            BigInt(remainder);
        } catch {
            return 'Both quotient and remainder must be valid numbers';
        }
        
        return null;
    },
    
    /**
     * Validate email format
     * @param {string} value - Email
     * @returns {string|null} Error message or null
     */
    email: (value) => {
        if (!value || value.trim() === '') {
            return null; // Allow empty if not required
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value.trim())) {
            return 'Please enter a valid email address';
        }
        
        return null;
    },
    
    /**
     * Validate URL format
     * @param {string} value - URL
     * @returns {string|null} Error message or null
     */
    url: (value) => {
        if (!value || value.trim() === '') {
            return null; // Allow empty if not required
        }
        
        try {
            new URL(value.trim());
            return null;
        } catch {
            return 'Please enter a valid URL';
        }
    }
};

/**
 * Clear validation state for a field
 * @param {string} fieldId - Field element ID
 */
export function clearFieldValidation(fieldId) {
    setFieldError(fieldId, null);
}

/**
 * Set custom error for a field
 * @param {string} fieldId - Field element ID
 * @param {string} error - Error message
 */
export function setCustomFieldError(fieldId, error) {
    setFieldError(fieldId, error);
}

/**
 * Check if field has error
 * @param {string} fieldId - Field element ID
 * @returns {boolean} True if field has error
 */
export function hasFieldError(fieldId) {
    const errorElement = document.getElementById(fieldId + '-error');
    return errorElement && errorElement.textContent && errorElement.classList.contains('visible');
}

/**
 * Get field error message
 * @param {string} fieldId - Field element ID
 * @returns {string} Error message or empty string
 */
export function getFieldError(fieldId) {
    const errorElement = document.getElementById(fieldId + '-error');
    return (errorElement && errorElement.classList.contains('visible')) ? errorElement.textContent : '';
}

export default {
    validateFormField,
    validateForm,
    getValidatedFormData,
    setupRealTimeValidation,
    setupFormValidation,
    validators,
    clearFieldValidation,
    setCustomFieldError,
    hasFieldError,
    getFieldError
};