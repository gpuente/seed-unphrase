/**
 * Security Indicator Component
 * Shows current security level (basic vs enhanced with salt)
 */

import { getElementById, setText, addClass, removeClass } from '../utils/dom.js';
import { appEvents, getAppState } from '../main.js';

let securityIndicator = null;
let securityLevel = null;
let securityDescription = null;
let securityIcon = null;
let isInitialized = false;

/**
 * Security configurations
 */
const SECURITY_CONFIG = {
    basic: {
        level: 'Basic Security',
        description: 'Consider adding salt for enhanced protection',
        icon: '⚠️',
        className: 'basic'
    },
    enhanced: {
        level: 'Enhanced Security',
        description: 'Salt protection active - Maximum security against brute force attacks',
        icon: '🛡️',
        className: 'enhanced'
    }
};

/**
 * Update security indicator UI
 * @param {object} security - Security state object
 */
function updateSecurityIndicatorUI(security) {
    if (!securityIndicator || !securityLevel || !securityDescription || !securityIcon) {
        return;
    }
    
    const config = SECURITY_CONFIG[security.level] || SECURITY_CONFIG.basic;
    
    // Update text content
    setText(securityLevel, config.level);
    setText(securityDescription, config.description);
    setText(securityIcon, config.icon);
    
    // Update CSS classes
    removeClass(securityIndicator, 'basic');
    removeClass(securityIndicator, 'enhanced');
    addClass(securityIndicator, config.className);
    
    removeClass(securityLevel, 'basic');
    removeClass(securityLevel, 'enhanced');
    addClass(securityLevel, config.className);
    
    // Update ARIA attributes for accessibility
    securityIndicator.setAttribute('aria-label', `Security level: ${config.level}`);
    securityIndicator.setAttribute('title', config.description);
}

/**
 * Handle security level changes
 * @param {object} security - New security state
 */
function handleSecurityChange(security) {
    updateSecurityIndicatorUI(security);
    
    // Optional: Add visual feedback for security level changes
    if (securityIndicator) {
        addClass(securityIndicator, 'updating');
        setTimeout(() => {
            removeClass(securityIndicator, 'updating');
        }, 300);
    }
}

/**
 * Handle processing state changes
 * @param {object} state - Application state
 */
function handleStateChange(state) {
    if (!securityIndicator) return;
    
    if (state.isProcessing) {
        addClass(securityIndicator, 'processing');
        securityIndicator.setAttribute('aria-busy', 'true');
    } else {
        removeClass(securityIndicator, 'processing');
        securityIndicator.setAttribute('aria-busy', 'false');
    }
}

/**
 * Handle info button interaction
 * @param {Event} e - Click event
 */
function handleInfoClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Create and show tooltip or modal with security information
    showSecurityTooltip(e.target);
}

/**
 * Show security information tooltip
 * @param {HTMLElement} target - Target element for positioning
 */
function showSecurityTooltip(target) {
    // Remove existing tooltips
    const existingTooltips = document.querySelectorAll('.security-tooltip');
    existingTooltips.forEach(tooltip => tooltip.remove());
    
    // Create tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'security-tooltip';
    tooltip.innerHTML = `
        <div class="security-tooltip-content">
            <h4>Security Levels:</h4>
            <div class="security-level-item">
                <span class="security-level-icon">⚠️</span>
                <div>
                    <strong>Basic:</strong> Standard encryption without salt protection
                </div>
            </div>
            <div class="security-level-item">
                <span class="security-level-icon">🛡️</span>
                <div>
                    <strong>Enhanced:</strong> Salt-enhanced protection prevents brute force attacks
                </div>
            </div>
        </div>
    `;
    
    // Position tooltip
    const rect = target.getBoundingClientRect();
    tooltip.style.position = 'absolute';
    tooltip.style.top = (rect.bottom + window.scrollY + 10) + 'px';
    tooltip.style.left = (rect.left + window.scrollX - 100) + 'px';
    tooltip.style.zIndex = '1000';
    tooltip.style.background = 'rgba(15, 23, 42, 0.95)';
    tooltip.style.border = '1px solid rgba(71, 85, 105, 0.5)';
    tooltip.style.borderRadius = '0.75rem';
    tooltip.style.padding = '1rem';
    tooltip.style.color = 'white';
    tooltip.style.fontSize = '0.875rem';
    tooltip.style.maxWidth = '300px';
    tooltip.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
    tooltip.style.backdropFilter = 'blur(10px)';
    
    // Add tooltip to document
    document.body.appendChild(tooltip);
    
    // Remove tooltip after delay or on click outside
    const removeTooltip = () => {
        if (tooltip.parentNode) {
            tooltip.remove();
        }
    };
    
    setTimeout(removeTooltip, 5000); // Auto-remove after 5 seconds
    
    // Remove on click outside
    const handleOutsideClick = (e) => {
        if (!tooltip.contains(e.target) && e.target !== target) {
            removeTooltip();
            document.removeEventListener('click', handleOutsideClick);
        }
    };
    
    setTimeout(() => {
        document.addEventListener('click', handleOutsideClick);
    }, 100);
}

/**
 * Initialize security indicator component
 * @returns {Promise<void>}
 */
export async function initializeSecurityIndicator() {
    if (isInitialized) {
        console.warn('Security indicator already initialized');
        return;
    }
    
    try {
        // Get elements
        securityIndicator = getElementById('security-indicator');
        securityLevel = securityIndicator?.querySelector('.security-level');
        securityDescription = securityIndicator?.querySelector('.security-description');
        securityIcon = securityIndicator?.querySelector('.security-indicator-icon');
        
        if (!securityIndicator) {
            throw new Error('Security indicator container not found');
        }
        
        if (!securityLevel || !securityDescription || !securityIcon) {
            console.warn('Some security indicator elements not found - limited functionality');
        }
        
        // Set initial state
        const currentState = getAppState();
        updateSecurityIndicatorUI(currentState.security);
        
        // Add info button click handler
        const infoButton = securityIndicator.querySelector('.security-info');
        if (infoButton) {
            infoButton.addEventListener('click', handleInfoClick);
            infoButton.setAttribute('role', 'button');
            infoButton.setAttribute('aria-label', 'Show security information');
            infoButton.style.cursor = 'pointer';
        }
        
        // Set up ARIA attributes
        securityIndicator.setAttribute('role', 'status');
        securityIndicator.setAttribute('aria-live', 'polite');
        securityIndicator.setAttribute('aria-atomic', 'true');
        
        // Listen for app events
        appEvents.on('securityChanged', handleSecurityChange);
        appEvents.on('stateChanged', handleStateChange);
        
        isInitialized = true;
        console.log('✅ Security indicator component initialized');
        
    } catch (error) {
        console.error('❌ Failed to initialize security indicator:', error);
        throw error;
    }
}

/**
 * Cleanup security indicator component
 */
export function cleanupSecurityIndicator() {
    if (!isInitialized) return;
    
    appEvents.off('securityChanged', handleSecurityChange);
    appEvents.off('stateChanged', handleStateChange);
    
    // Remove any existing tooltips
    const tooltips = document.querySelectorAll('.security-tooltip');
    tooltips.forEach(tooltip => tooltip.remove());
    
    securityIndicator = null;
    securityLevel = null;
    securityDescription = null;
    securityIcon = null;
    isInitialized = false;
    
    console.log('🧹 Security indicator component cleaned up');
}

/**
 * Get current security level
 * @returns {object} Current security state
 */
export function getCurrentSecurity() {
    const state = getAppState();
    return state.security;
}

/**
 * Manually update security indicator
 * @param {object} security - Security state
 */
export function updateSecurity(security) {
    handleSecurityChange(security);
}

export default {
    initializeSecurityIndicator,
    cleanupSecurityIndicator,
    getCurrentSecurity,
    updateSecurity
};