/**
 * DOM Utilities for Seed Concealer Web App
 * Zero-dependency DOM manipulation and event handling helpers
 */

/**
 * Get element by ID with error handling
 * @param {string} id - Element ID
 * @returns {HTMLElement|null}
 */
export function getElementById(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`Element with ID "${id}" not found`);
    }
    return element;
}

/**
 * Get element by selector with error handling
 * @param {string} selector - CSS selector
 * @returns {HTMLElement|null}
 */
export function querySelector(selector) {
    const element = document.querySelector(selector);
    if (!element) {
        console.warn(`Element with selector "${selector}" not found`);
    }
    return element;
}

/**
 * Get multiple elements by selector
 * @param {string} selector - CSS selector
 * @returns {NodeList}
 */
export function querySelectorAll(selector) {
    return document.querySelectorAll(selector);
}

/**
 * Add event listener with automatic cleanup
 * @param {HTMLElement|string} element - Element or selector
 * @param {string} event - Event type
 * @param {Function} handler - Event handler
 * @param {boolean|object} options - Event options
 * @returns {Function} Cleanup function
 */
export function addEventListener(element, event, handler, options = false) {
    const el = typeof element === 'string' ? querySelector(element) : element;
    if (!el) return () => {};
    
    el.addEventListener(event, handler, options);
    
    // Return cleanup function
    return () => el.removeEventListener(event, handler, options);
}

/**
 * Add CSS class to element
 * @param {HTMLElement|string} element - Element or selector
 * @param {string} className - CSS class name
 */
export function addClass(element, className) {
    const el = typeof element === 'string' ? querySelector(element) : element;
    if (el) {
        el.classList.add(className);
    }
}

/**
 * Remove CSS class from element
 * @param {HTMLElement|string} element - Element or selector
 * @param {string} className - CSS class name
 */
export function removeClass(element, className) {
    const el = typeof element === 'string' ? querySelector(element) : element;
    if (el) {
        el.classList.remove(className);
    }
}

/**
 * Toggle CSS class on element
 * @param {HTMLElement|string} element - Element or selector
 * @param {string} className - CSS class name
 * @param {boolean} force - Force add/remove
 * @returns {boolean} True if class is present after toggle
 */
export function toggleClass(element, className, force = undefined) {
    const el = typeof element === 'string' ? querySelector(element) : element;
    if (el) {
        return el.classList.toggle(className, force);
    }
    return false;
}

/**
 * Check if element has CSS class
 * @param {HTMLElement|string} element - Element or selector
 * @param {string} className - CSS class name
 * @returns {boolean}
 */
export function hasClass(element, className) {
    const el = typeof element === 'string' ? querySelector(element) : element;
    return el ? el.classList.contains(className) : false;
}

/**
 * Show element by removing 'hidden' class
 * @param {HTMLElement|string} element - Element or selector
 */
export function show(element) {
    removeClass(element, 'hidden');
    addClass(element, 'visible');
}

/**
 * Hide element by adding 'hidden' class
 * @param {HTMLElement|string} element - Element or selector
 */
export function hide(element) {
    addClass(element, 'hidden');
    removeClass(element, 'visible');
}

/**
 * Set element text content safely
 * @param {HTMLElement|string} element - Element or selector
 * @param {string} text - Text content
 */
export function setText(element, text) {
    const el = typeof element === 'string' ? querySelector(element) : element;
    if (el) {
        el.textContent = text || '';
    }
}

/**
 * Get element text content
 * @param {HTMLElement|string} element - Element or selector
 * @returns {string}
 */
export function getText(element) {
    const el = typeof element === 'string' ? querySelector(element) : element;
    return el ? el.textContent || '' : '';
}

/**
 * Set element HTML content safely
 * @param {HTMLElement|string} element - Element or selector
 * @param {string} html - HTML content
 */
export function setHTML(element, html) {
    const el = typeof element === 'string' ? querySelector(element) : element;
    if (el) {
        el.innerHTML = html || '';
    }
}

/**
 * Set input value
 * @param {HTMLElement|string} element - Element or selector
 * @param {string} value - Input value
 */
export function setValue(element, value) {
    const el = typeof element === 'string' ? querySelector(element) : element;
    if (el && ('value' in el)) {
        el.value = value || '';
    }
}

/**
 * Get input value
 * @param {HTMLElement|string} element - Element or selector
 * @returns {string}
 */
export function getValue(element) {
    const el = typeof element === 'string' ? querySelector(element) : element;
    return (el && 'value' in el) ? el.value : '';
}

/**
 * Set element attribute
 * @param {HTMLElement|string} element - Element or selector
 * @param {string} name - Attribute name
 * @param {string} value - Attribute value
 */
export function setAttribute(element, name, value) {
    const el = typeof element === 'string' ? querySelector(element) : element;
    if (el) {
        el.setAttribute(name, value);
    }
}

/**
 * Get element attribute
 * @param {HTMLElement|string} element - Element or selector
 * @param {string} name - Attribute name
 * @returns {string|null}
 */
export function getAttribute(element, name) {
    const el = typeof element === 'string' ? querySelector(element) : element;
    return el ? el.getAttribute(name) : null;
}

/**
 * Remove element attribute
 * @param {HTMLElement|string} element - Element or selector
 * @param {string} name - Attribute name
 */
export function removeAttribute(element, name) {
    const el = typeof element === 'string' ? querySelector(element) : element;
    if (el) {
        el.removeAttribute(name);
    }
}

/**
 * Set element disabled state
 * @param {HTMLElement|string} element - Element or selector
 * @param {boolean} disabled - Disabled state
 */
export function setDisabled(element, disabled) {
    const el = typeof element === 'string' ? querySelector(element) : element;
    if (el && 'disabled' in el) {
        el.disabled = disabled;
        toggleClass(el, 'disabled', disabled);
    }
}

/**
 * Focus element
 * @param {HTMLElement|string} element - Element or selector
 */
export function focus(element) {
    const el = typeof element === 'string' ? querySelector(element) : element;
    if (el && el.focus) {
        el.focus();
    }
}

/**
 * Create element with attributes and content
 * @param {string} tagName - Tag name
 * @param {object} attributes - Element attributes
 * @param {string|HTMLElement[]} content - Text content or child elements
 * @returns {HTMLElement}
 */
export function createElement(tagName, attributes = {}, content = '') {
    const element = document.createElement(tagName);
    
    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'textContent') {
            element.textContent = value;
        } else {
            element.setAttribute(key, value);
        }
    });
    
    // Set content
    if (typeof content === 'string') {
        element.textContent = content;
    } else if (Array.isArray(content)) {
        content.forEach(child => {
            if (child instanceof HTMLElement) {
                element.appendChild(child);
            }
        });
    }
    
    return element;
}

/**
 * Append element to parent
 * @param {HTMLElement|string} parent - Parent element or selector
 * @param {HTMLElement} child - Child element
 */
export function appendChild(parent, child) {
    const parentEl = typeof parent === 'string' ? querySelector(parent) : parent;
    if (parentEl && child instanceof HTMLElement) {
        parentEl.appendChild(child);
    }
}

/**
 * Remove element from DOM
 * @param {HTMLElement|string} element - Element or selector
 */
export function removeElement(element) {
    const el = typeof element === 'string' ? querySelector(element) : element;
    if (el && el.parentNode) {
        el.parentNode.removeChild(el);
    }
}

/**
 * Wait for DOM to be ready
 * @returns {Promise}
 */
export function ready() {
    return new Promise((resolve) => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', resolve);
        } else {
            resolve();
        }
    });
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback for older browsers
            const textArea = createElement('textarea', {
                value: text,
                style: 'position: fixed; left: -999999px; top: -999999px;'
            });
            
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            const success = document.execCommand('copy');
            document.body.removeChild(textArea);
            
            return success;
        }
    } catch (error) {
        console.error('Failed to copy text:', error);
        return false;
    }
}

/**
 * Debounce function execution
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * Throttle function execution
 * @param {Function} func - Function to throttle
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, delay) {
    let lastCall = 0;
    return function (...args) {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            func.apply(this, args);
        }
    };
}

/**
 * Add CSS styles to element
 * @param {HTMLElement|string} element - Element or selector
 * @param {object} styles - Style object
 */
export function setStyles(element, styles) {
    const el = typeof element === 'string' ? querySelector(element) : element;
    if (el) {
        Object.entries(styles).forEach(([property, value]) => {
            el.style[property] = value;
        });
    }
}

/**
 * Get computed style property
 * @param {HTMLElement|string} element - Element or selector
 * @param {string} property - CSS property name
 * @returns {string}
 */
export function getStyle(element, property) {
    const el = typeof element === 'string' ? querySelector(element) : element;
    if (el) {
        return window.getComputedStyle(el).getPropertyValue(property);
    }
    return '';
}

/**
 * Check if element is visible
 * @param {HTMLElement|string} element - Element or selector
 * @returns {boolean}
 */
export function isVisible(element) {
    const el = typeof element === 'string' ? querySelector(element) : element;
    if (!el) return false;
    
    const style = window.getComputedStyle(el);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0' &&
           !hasClass(el, 'hidden');
}

/**
 * Smooth scroll to element
 * @param {HTMLElement|string} element - Element or selector
 * @param {object} options - Scroll options
 */
export function scrollTo(element, options = {}) {
    const el = typeof element === 'string' ? querySelector(element) : element;
    if (el) {
        el.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest',
            ...options
        });
    }
}

/**
 * Get form data as object
 * @param {HTMLFormElement|string} form - Form element or selector
 * @returns {object}
 */
export function getFormData(form) {
    const formEl = typeof form === 'string' ? querySelector(form) : form;
    if (!formEl) return {};
    
    const formData = new FormData(formEl);
    const data = {};
    
    for (const [key, value] of formData.entries()) {
        if (data[key]) {
            // Handle multiple values (checkboxes, etc.)
            if (Array.isArray(data[key])) {
                data[key].push(value);
            } else {
                data[key] = [data[key], value];
            }
        } else {
            data[key] = value;
        }
    }
    
    return data;
}

/**
 * Reset form
 * @param {HTMLFormElement|string} form - Form element or selector
 */
export function resetForm(form) {
    const formEl = typeof form === 'string' ? querySelector(form) : form;
    if (formEl && formEl.reset) {
        formEl.reset();
    }
}

/**
 * Set form field errors
 * @param {string} fieldId - Field ID
 * @param {string|null} error - Error message or null to clear
 */
export function setFieldError(fieldId, error) {
    const field = getElementById(fieldId);
    const errorElement = getElementById(fieldId + '-error');
    
    if (field && errorElement) {
        if (error) {
            addClass(field, 'error');
            setText(errorElement, error);
            addClass(errorElement, 'visible');
        } else {
            removeClass(field, 'error');
            setText(errorElement, '');
            removeClass(errorElement, 'visible');
        }
    }
}

/**
 * Clear all form errors
 * @param {HTMLFormElement|string} form - Form element or selector
 */
export function clearFormErrors(form) {
    const formEl = typeof form === 'string' ? querySelector(form) : form;
    if (!formEl) return;
    
    const errorElements = formEl.querySelectorAll('.error-message');
    const fieldElements = formEl.querySelectorAll('.error');
    
    errorElements.forEach(el => {
        setText(el, '');
        removeClass(el, 'visible');
    });
    
    fieldElements.forEach(el => {
        removeClass(el, 'error');
    });
}