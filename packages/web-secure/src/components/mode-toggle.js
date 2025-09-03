/**
 * Mode Toggle Component
 * Handles switching between conceal and reveal modes
 */

import { getElementById, addEventListener, addClass, removeClass, hasClass } from '../utils/dom.js';
import { appEvents, switchMode, getAppState } from '../main.js';

let concealBtn = null;
let revealBtn = null;
let concealForm = null;
let revealForm = null;
let isInitialized = false;

/**
 * Update mode toggle UI
 * @param {string} mode - Current mode ('conceal' or 'reveal')
 */
function updateModeToggleUI(mode) {
    if (!concealBtn || !revealBtn) return;
    
    // Update button states
    if (mode === 'conceal') {
        addClass(concealBtn, 'active');
        addClass(concealBtn, 'conceal');
        removeClass(concealBtn, 'reveal');
        removeClass(revealBtn, 'active');
        removeClass(revealBtn, 'conceal');
        removeClass(revealBtn, 'reveal');
    } else {
        addClass(revealBtn, 'active');
        addClass(revealBtn, 'reveal');
        removeClass(revealBtn, 'conceal');
        removeClass(concealBtn, 'active');
        removeClass(concealBtn, 'conceal');
        removeClass(concealBtn, 'reveal');
    }
    
    // Update form visibility
    if (concealForm && revealForm) {
        if (mode === 'conceal') {
            addClass(concealForm, 'active');
            removeClass(revealForm, 'active');
        } else {
            addClass(revealForm, 'active');
            removeClass(concealForm, 'active');
        }
    }
}

/**
 * Handle mode button click
 * @param {string} mode - Target mode
 */
function handleModeClick(mode) {
    const currentState = getAppState();
    
    // Prevent mode change if processing
    if (currentState.isProcessing) {
        return;
    }
    
    // Don't switch if already in target mode
    if (currentState.currentMode === mode) {
        return;
    }
    
    // Switch mode
    switchMode(mode);
    
    // Update history state
    if (history.pushState) {
        const state = { mode };
        const url = new URL(window.location);
        url.searchParams.set('mode', mode);
        history.pushState(state, '', url);
    }
}

/**
 * Handle keyboard navigation
 * @param {KeyboardEvent} e - Keyboard event
 */
function handleKeyboardNavigation(e) {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const currentState = getAppState();
        const newMode = currentState.currentMode === 'conceal' ? 'reveal' : 'conceal';
        handleModeClick(newMode);
    } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const targetMode = e.target === concealBtn ? 'conceal' : 'reveal';
        handleModeClick(targetMode);
    }
}

/**
 * Handle state changes
 * @param {object} state - New application state
 */
function handleStateChange(state) {
    updateModeToggleUI(state.currentMode);
    
    // Update button disabled state
    if (concealBtn && revealBtn) {
        concealBtn.disabled = state.isProcessing;
        revealBtn.disabled = state.isProcessing;
        
        // Add/remove processing class
        const modeToggle = getElementById('mode-toggle');
        if (modeToggle) {
            if (state.isProcessing) {
                addClass(modeToggle, 'processing');
            } else {
                removeClass(modeToggle, 'processing');
            }
        }
    }
}

/**
 * Handle mode change events
 * @param {string} mode - New mode
 */
function handleModeChange(mode) {
    updateModeToggleUI(mode);
    
    // Focus appropriate form
    setTimeout(() => {
        if (mode === 'conceal') {
            const seedPhraseInput = getElementById('seed-phrase');
            if (seedPhraseInput) seedPhraseInput.focus();
        } else {
            const concealedValueInput = getElementById('concealed-value');
            if (concealedValueInput) concealedValueInput.focus();
        }
    }, 100);
}

/**
 * Initialize mode toggle component
 * @returns {Promise<void>}
 */
export async function initializeModeToggle() {
    if (isInitialized) {
        console.warn('Mode toggle already initialized');
        return;
    }
    
    try {
        // Get elements
        concealBtn = getElementById('conceal-btn');
        revealBtn = getElementById('reveal-btn');
        concealForm = getElementById('conceal-form');
        revealForm = getElementById('reveal-form');
        
        if (!concealBtn || !revealBtn) {
            throw new Error('Mode toggle buttons not found');
        }
        
        if (!concealForm || !revealForm) {
            console.warn('Form containers not found - mode toggle will work with limited functionality');
        }
        
        // Set initial state
        const currentState = getAppState();
        updateModeToggleUI(currentState.currentMode);
        
        // Add event listeners
        addEventListener(concealBtn, 'click', () => handleModeClick('conceal'));
        addEventListener(revealBtn, 'click', () => handleModeClick('reveal'));
        
        // Add keyboard navigation
        addEventListener(concealBtn, 'keydown', handleKeyboardNavigation);
        addEventListener(revealBtn, 'keydown', handleKeyboardNavigation);
        
        // Add ARIA attributes for accessibility
        concealBtn.setAttribute('role', 'tab');
        concealBtn.setAttribute('aria-selected', currentState.currentMode === 'conceal' ? 'true' : 'false');
        revealBtn.setAttribute('role', 'tab');
        revealBtn.setAttribute('aria-selected', currentState.currentMode === 'reveal' ? 'true' : 'false');
        
        const modeToggle = getElementById('mode-toggle');
        if (modeToggle) {
            modeToggle.setAttribute('role', 'tablist');
            modeToggle.setAttribute('aria-label', 'Choose operation mode');
        }
        
        // Listen for app state changes
        appEvents.on('stateChanged', handleStateChange);
        appEvents.on('modeChanged', handleModeChange);
        
        // Handle URL parameters on initial load
        const urlParams = new URLSearchParams(window.location.search);
        const urlMode = urlParams.get('mode');
        if (urlMode && (urlMode === 'conceal' || urlMode === 'reveal')) {
            if (urlMode !== currentState.currentMode) {
                switchMode(urlMode);
            }
        }
        
        isInitialized = true;
        console.log('✅ Mode toggle component initialized');
        
    } catch (error) {
        console.error('❌ Failed to initialize mode toggle:', error);
        throw error;
    }
}

/**
 * Cleanup mode toggle component
 */
export function cleanupModeToggle() {
    if (!isInitialized) return;
    
    appEvents.off('stateChanged', handleStateChange);
    appEvents.off('modeChanged', handleModeChange);
    
    concealBtn = null;
    revealBtn = null;
    concealForm = null;
    revealForm = null;
    isInitialized = false;
    
    console.log('🧹 Mode toggle component cleaned up');
}

/**
 * Get current mode
 * @returns {string} Current mode
 */
export function getCurrentMode() {
    const state = getAppState();
    return state.currentMode;
}

/**
 * Set mode programmatically
 * @param {string} mode - Target mode
 */
export function setMode(mode) {
    if (mode !== 'conceal' && mode !== 'reveal') {
        console.error('Invalid mode:', mode);
        return;
    }
    
    handleModeClick(mode);
}

export default {
    initializeModeToggle,
    cleanupModeToggle,
    getCurrentMode,
    setMode
};