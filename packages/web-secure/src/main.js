/**
 * Seed Concealer - Secure Web App
 * Zero-dependency vanilla JavaScript implementation
 */

// Import utilities
import { ready, addEventListener } from './utils/dom.js';
import { initializeToastSystem } from './utils/toast.js';
import { setupFormValidation } from './utils/validation.js';

// Import components (will be created next)
import { initializeModeToggle } from './components/mode-toggle.js';
import { initializeSecurityIndicator } from './components/security-indicator.js';
import { initializeConcealForm } from './components/conceal-form.js';
import { initializeRevealForm } from './components/reveal-form.js';
import { initializeResultDisplay } from './components/result-display.js';

/**
 * Application state
 */
const appState = {
    currentMode: 'conceal', // 'conceal' or 'reveal'
    isProcessing: false,
    security: {
        level: 'basic', // 'basic' or 'enhanced'
        hasSalt: false
    },
    result: null,
    validationErrors: []
};

/**
 * Application event emitter for component communication
 */
class EventEmitter {
    constructor() {
        this.events = {};
    }
    
    on(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
    }
    
    emit(eventName, data) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(callback => callback(data));
        }
    }
    
    off(eventName, callback) {
        if (this.events[eventName]) {
            this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
        }
    }
}

// Global event emitter for components
export const appEvents = new EventEmitter();

/**
 * Update application state
 * @param {object} updates - State updates
 */
export function updateAppState(updates) {
    Object.assign(appState, updates);
    appEvents.emit('stateChanged', appState);
}

/**
 * Get current application state
 * @returns {object} Current state
 */
export function getAppState() {
    return { ...appState };
}

/**
 * Set application processing state
 * @param {boolean} processing - Processing state
 */
export function setProcessing(processing) {
    updateAppState({ isProcessing: processing });
    
    // Disable/enable form elements
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea, button, select');
        inputs.forEach(input => {
            input.disabled = processing;
        });
    });
    
    // Update UI processing state
    document.body.classList.toggle('processing', processing);
}

/**
 * Switch between conceal and reveal modes
 * @param {string} mode - 'conceal' or 'reveal'
 */
export function switchMode(mode) {
    if (mode === appState.currentMode || appState.isProcessing) {
        return;
    }
    
    updateAppState({ currentMode: mode, result: null, validationErrors: [] });
    appEvents.emit('modeChanged', mode);
}

/**
 * Update security level based on salt usage
 * @param {boolean} hasSalt - Whether salt is being used
 * @param {string} saltValue - Salt value (optional)
 */
export function updateSecurityLevel(hasSalt, saltValue = '') {
    const hasValidSalt = hasSalt && saltValue && saltValue.trim().length > 0;
    const security = {
        level: hasValidSalt ? 'enhanced' : 'basic',
        hasSalt: hasValidSalt
    };
    
    updateAppState({ security });
    appEvents.emit('securityChanged', security);
}

/**
 * Set application result
 * @param {object} result - Result data
 * @param {string} mode - Mode that generated the result
 */
export function setResult(result, mode) {
    updateAppState({ result: { ...result, mode } });
    appEvents.emit('resultSet', { result, mode });
}

/**
 * Set validation errors
 * @param {string[]} errors - Array of error messages
 */
export function setValidationErrors(errors) {
    updateAppState({ validationErrors: errors });
    appEvents.emit('validationErrorsChanged', errors);
}

/**
 * Clear current result
 */
export function clearResult() {
    updateAppState({ result: null, validationErrors: [] });
    appEvents.emit('resultCleared');
}

/**
 * Initialize password visibility toggles
 */
function initializePasswordToggles() {
    const toggleButtons = document.querySelectorAll('.toggle-visibility');
    
    toggleButtons.forEach(button => {
        addEventListener(button, 'click', (e) => {
            e.preventDefault();
            const targetId = button.getAttribute('data-target');
            const targetInput = document.getElementById(targetId);
            
            if (targetInput) {
                const isPassword = targetInput.type === 'password';
                targetInput.type = isPassword ? 'text' : 'password';
                button.textContent = isPassword ? '🙈' : '👁️';
            }
        });
    });
}

/**
 * Initialize salt toggles
 */
function initializeSaltToggles() {
    const saltCheckboxes = document.querySelectorAll('#use-salt, #reveal-use-salt');
    
    saltCheckboxes.forEach(checkbox => {
        addEventListener(checkbox, 'change', () => {
            const isRevealMode = checkbox.id === 'reveal-use-salt';
            const containerPrefix = isRevealMode ? 'reveal-' : '';
            const saltContainer = document.getElementById(`${containerPrefix}salt-input-container`);
            const saltInput = document.getElementById(`${containerPrefix}salt-value`);
            
            if (saltContainer && saltInput) {
                if (checkbox.checked) {
                    saltContainer.classList.remove('hidden');
                    saltInput.focus();
                } else {
                    saltContainer.classList.add('hidden');
                    saltInput.value = '';
                }
                
                // Update security level
                updateSecurityLevel(checkbox.checked, saltInput.value);
            }
        });
    });
    
    // Also listen for salt input changes
    const saltInputs = document.querySelectorAll('#salt-value, #reveal-salt-value');
    saltInputs.forEach(input => {
        addEventListener(input, 'input', () => {
            const isRevealMode = input.id === 'reveal-salt-value';
            const checkbox = document.getElementById(isRevealMode ? 'reveal-use-salt' : 'use-salt');
            updateSecurityLevel(checkbox && checkbox.checked, input.value);
        });
    });
}

/**
 * Initialize global event listeners
 */
function initializeGlobalEvents() {
    // Handle keyboard shortcuts
    addEventListener(document, 'keydown', (e) => {
        // Escape key clears result
        if (e.key === 'Escape' && appState.result) {
            clearResult();
        }
        
        // Ctrl/Cmd + K to switch modes
        if ((e.ctrlKey || e.metaKey) && e.key === 'k' && !appState.isProcessing) {
            e.preventDefault();
            const newMode = appState.currentMode === 'conceal' ? 'reveal' : 'conceal';
            switchMode(newMode);
        }
    });
    
    // Handle browser back/forward
    addEventListener(window, 'popstate', (e) => {
        if (e.state && e.state.mode) {
            switchMode(e.state.mode);
        }
    });
    
    // Add initial state to history
    const initialState = { mode: appState.currentMode };
    if (history.pushState) {
        history.replaceState(initialState, '', window.location.href);
    }
}

/**
 * Initialize form validation
 */
function initializeFormValidation() {
    // Setup validation for both forms
    setupFormValidation('conceal-form-element', {}, 300);
    setupFormValidation('reveal-form-element', {}, 300);
}

/**
 * Handle unhandled errors
 */
function initializeErrorHandling() {
    window.addEventListener('error', (e) => {
        console.error('Unhandled error:', e.error);
        // Don't show toast for every error to avoid spam
        if (!e.error?.message?.includes('Script error')) {
            // Only show critical errors to user
            console.error('Critical error occurred. Check console for details.');
        }
    });
    
    window.addEventListener('unhandledrejection', (e) => {
        console.error('Unhandled promise rejection:', e.reason);
        // Log but don't show to user unless critical
    });
}

/**
 * Initialize application
 */
async function initializeApp() {
    try {
        console.log('🌱 Initializing Seed Concealer - Secure Edition...');
        
        // Initialize utilities
        initializeToastSystem();
        
        // Initialize global functionality
        initializePasswordToggles();
        initializeSaltToggles();
        initializeGlobalEvents();
        initializeFormValidation();
        initializeErrorHandling();
        
        // Initialize components
        await initializeModeToggle();
        await initializeSecurityIndicator();
        await initializeConcealForm();
        await initializeRevealForm();
        await initializeResultDisplay();
        
        console.log('✅ Seed Concealer initialized successfully');
        
        // Show initial toast
        // toast.info('Welcome to Seed Concealer', {
        //     description: 'Zero-dependency secure edition'
        // });
        
    } catch (error) {
        console.error('❌ Failed to initialize Seed Concealer:', error);
        document.body.innerHTML = `
            <div style="
                display: flex; 
                align-items: center; 
                justify-content: center; 
                height: 100vh; 
                color: #ef4444; 
                text-align: center;
                font-family: monospace;
            ">
                <div>
                    <h1>❌ Initialization Failed</h1>
                    <p>Please refresh the page and try again.</p>
                    <p style="font-size: 0.875rem; margin-top: 1rem;">
                        Error: ${error.message}
                    </p>
                </div>
            </div>
        `;
    }
}

/**
 * Start the application when DOM is ready
 */
ready().then(() => {
    initializeApp();
});

// Export state management functions for components
export {
    appState,
    setProcessing,
    switchMode,
    updateSecurityLevel,
    setResult,
    setValidationErrors,
    clearResult
};