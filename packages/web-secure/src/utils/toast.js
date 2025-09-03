/**
 * Toast Notification System
 * Zero-dependency toast notifications similar to Sonner
 */

import { 
    getElementById, 
    createElement, 
    appendChild, 
    removeElement, 
    addClass, 
    removeClass,
    addEventListener 
} from './dom.js';

/**
 * Toast types with their configurations
 */
const TOAST_TYPES = {
    success: {
        icon: '✅',
        className: 'success'
    },
    error: {
        icon: '❌',
        className: 'error'
    },
    warning: {
        icon: '⚠️',
        className: 'warning'
    },
    info: {
        icon: 'ℹ️',
        className: 'info'
    }
};

/**
 * Default toast options
 */
const DEFAULT_OPTIONS = {
    duration: 4000,
    closable: true,
    position: 'bottom-right'
};

/**
 * Active toasts map for management
 */
let activeToasts = new Map();
let toastCounter = 0;

/**
 * Get or create toast container
 * @returns {HTMLElement}
 */
function getToastContainer() {
    let container = getElementById('toast-container');
    
    if (!container) {
        container = createElement('div', {
            id: 'toast-container',
            className: 'toast-container'
        });
        appendChild(document.body, container);
    }
    
    return container;
}

/**
 * Create toast element
 * @param {string} title - Toast title
 * @param {string} description - Toast description
 * @param {string} type - Toast type
 * @param {object} options - Toast options
 * @returns {HTMLElement}
 */
function createToastElement(title, description, type, options) {
    const config = TOAST_TYPES[type] || TOAST_TYPES.info;
    
    // Toast container
    const toast = createElement('div', {
        className: `toast ${config.className}`,
        'data-toast-id': ++toastCounter
    });
    
    // Toast header
    const header = createElement('div', {
        className: 'toast-header'
    });
    
    // Icon
    const icon = createElement('span', {
        className: 'toast-icon'
    }, config.icon);
    
    // Title
    const titleElement = createElement('span', {
        className: 'toast-title'
    }, title);
    
    appendChild(header, icon);
    appendChild(header, titleElement);
    appendChild(toast, header);
    
    // Description (optional)
    if (description) {
        const descElement = createElement('div', {
            className: 'toast-description'
        }, description);
        appendChild(toast, descElement);
    }
    
    // Close button (if closable)
    if (options.closable) {
        const closeBtn = createElement('button', {
            className: 'toast-close',
            type: 'button',
            'aria-label': 'Close notification'
        }, '×');
        
        appendChild(toast, closeBtn);
        
        // Handle close click
        addEventListener(closeBtn, 'click', (e) => {
            e.stopPropagation();
            dismissToast(toastCounter);
        });
    }
    
    // Handle toast click to dismiss
    if (options.closable) {
        addEventListener(toast, 'click', () => {
            dismissToast(toastCounter);
        });
    }
    
    return toast;
}

/**
 * Show toast notification
 * @param {string} title - Toast title
 * @param {string} description - Toast description (optional)
 * @param {string} type - Toast type (success, error, warning, info)
 * @param {object} customOptions - Custom options
 * @returns {number} Toast ID for dismissal
 */
function showToast(title, description = '', type = 'info', customOptions = {}) {
    const options = { ...DEFAULT_OPTIONS, ...customOptions };
    const container = getToastContainer();
    
    // Create toast element
    const toast = createToastElement(title, description, type, options);
    const toastId = parseInt(toast.getAttribute('data-toast-id'));
    
    // Add to container
    appendChild(container, toast);
    
    // Trigger entrance animation
    setTimeout(() => {
        addClass(toast, 'show');
    }, 10);
    
    // Store reference
    activeToasts.set(toastId, {
        element: toast,
        options: options,
        timeoutId: null
    });
    
    // Auto dismiss if duration is set
    if (options.duration > 0) {
        const timeoutId = setTimeout(() => {
            dismissToast(toastId);
        }, options.duration);
        
        activeToasts.get(toastId).timeoutId = timeoutId;
    }
    
    return toastId;
}

/**
 * Dismiss toast by ID
 * @param {number} toastId - Toast ID
 */
function dismissToast(toastId) {
    const toastData = activeToasts.get(toastId);
    if (!toastData) return;
    
    const { element, timeoutId } = toastData;
    
    // Clear timeout
    if (timeoutId) {
        clearTimeout(timeoutId);
    }
    
    // Add closing animation
    addClass(element, 'closing');
    
    // Remove after animation
    setTimeout(() => {
        removeElement(element);
        activeToasts.delete(toastId);
    }, 300);
}

/**
 * Dismiss all toasts
 */
function dismissAllToasts() {
    const toastIds = Array.from(activeToasts.keys());
    toastIds.forEach(id => dismissToast(id));
}

/**
 * Success toast
 * @param {string} title - Toast title
 * @param {object} options - Options object with optional description
 * @returns {number} Toast ID
 */
function success(title, options = {}) {
    const { description, ...restOptions } = options;
    return showToast(title, description, 'success', restOptions);
}

/**
 * Error toast
 * @param {string} title - Toast title
 * @param {object} options - Options object with optional description
 * @returns {number} Toast ID
 */
function error(title, options = {}) {
    const { description, ...restOptions } = options;
    return showToast(title, description, 'error', { duration: 6000, ...restOptions });
}

/**
 * Warning toast
 * @param {string} title - Toast title
 * @param {object} options - Options object with optional description
 * @returns {number} Toast ID
 */
function warning(title, options = {}) {
    const { description, ...restOptions } = options;
    return showToast(title, description, 'warning', { duration: 5000, ...restOptions });
}

/**
 * Info toast
 * @param {string} title - Toast title
 * @param {object} options - Options object with optional description
 * @returns {number} Toast ID
 */
function info(title, options = {}) {
    const { description, ...restOptions } = options;
    return showToast(title, description, 'info', restOptions);
}

/**
 * Custom toast with full control
 * @param {string} title - Toast title
 * @param {object} options - Full options object
 * @returns {number} Toast ID
 */
function custom(title, options = {}) {
    const { description, type = 'info', ...restOptions } = options;
    return showToast(title, description, type, restOptions);
}

/**
 * Toast API object
 */
export const toast = {
    success,
    error,
    warning,
    info,
    custom,
    dismiss: dismissToast,
    dismissAll: dismissAllToasts
};

/**
 * Initialize toast system
 * Should be called when DOM is ready
 */
export function initializeToastSystem() {
    // Ensure container exists
    getToastContainer();
    
    // Clean up any orphaned toasts on page load
    activeToasts.clear();
    toastCounter = 0;
    
    console.log('Toast notification system initialized');
}

export default toast;