#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');

// Load BIP39 wordlist from the lib package
const wordlistPath = path.join(__dirname, '..', 'lib', 'src', 'wordlist.json');
const BIP39_WORDS = JSON.parse(fs.readFileSync(wordlistPath, 'utf8'));

console.log('🚀 Starting build process...');
console.log(`📖 Loaded ${BIP39_WORDS.length} BIP39 words from lib package`);

// Clean and create dist directory
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true });
  console.log('🗑️  Cleaned dist directory');
}
fs.mkdirSync(distDir, { recursive: true });
console.log('📁 Created dist directory');

// Function to replace BIP39 word list with efficient format
function replaceBIP39WordList(htmlContent) {
  // Create a more efficient word list format using string split
  const efficientWordList = `const BIP39_WORDS = '${BIP39_WORDS.join(' ')}' .split(' ');`;
  
  // Replace the massive inline array with the efficient version
  const updatedContent = htmlContent.replace(
    /const BIP39_WORDS = \[[\s\S]*?\];/,
    efficientWordList
  );
  
  return updatedContent;
}

// Function to add mobile responsive CSS fixes
function addMobileResponsiveCSS(htmlContent) {
  // Add mobile-responsive CSS for navigation and PWA improvements
  const mobileCSS = `
        /* Mobile responsive improvements */
        @media (max-width: 768px) {
            .nav {
                margin-bottom: 1.5rem;
            }
            
            .nav a {
                margin: 0 0.25rem;
                padding: 0.5rem 0.75rem;
                font-size: 0.9rem;
                display: inline-block;
            }
            
            .form-container {
                padding: 1.5rem;
                margin: 0 0.5rem 2rem 0.5rem;
            }
            
            .title {
                font-size: 2rem;
            }
            
            .result-display {
                padding: 1.5rem;
                margin: 0 0.5rem 2rem 0.5rem;
            }
        }
        
        @media (max-width: 480px) {
            .nav {
                margin-bottom: 1rem;
            }
            
            .nav a {
                margin: 0 0.1rem;
                padding: 0.4rem 0.6rem;
                font-size: 0.8rem;
                min-width: auto;
            }
            
            .form-container, .result-display {
                padding: 1rem;
                margin: 0 0.25rem 1.5rem 0.25rem;
            }
            
            .title {
                font-size: 1.75rem;
            }
            
            .form-group textarea {
                min-height: 80px;
            }
        }
        
        /* PWA display improvements */
        @media (display-mode: standalone) {
            body {
                padding-top: env(safe-area-inset-top);
                padding-bottom: env(safe-area-inset-bottom);
            }
        }`;

  // Insert the mobile CSS before the closing </style> tag
  return htmlContent.replace('</style>', `${mobileCSS}
    </style>`);
}

// Function to add browser extension protection and security measures
function addSecurityProtection(htmlContent) {
  // Create comprehensive security JavaScript
  const securityScript = `
    <script>
        // Browser Extension Protection System
        (function() {
            'use strict';
            
            // Security state management
            const SecurityManager = {
                isDebuggerOpen: false,
                secureInputs: new Map(),
                decoyFields: [],
                
                init() {
                    this.createSecureInputWrapper();
                    this.setupAntiDebugging();
                    this.setupClipboardProtection();
                    this.addDecoyFields();
                    this.setupMemoryProtection();
                },
                
                // Create secure Shadow DOM wrapper for sensitive inputs
                createSecureInputWrapper() {
                    const style = document.createElement('style');
                    style.textContent = \`
                        .secure-input-wrapper {
                            display: inline-block;
                            position: relative;
                            width: 100%;
                        }
                        .secure-input {
                            width: 100%;
                            padding: 0.75rem;
                            border: 2px solid #374151;
                            border-radius: 0.5rem;
                            background: #1f2937;
                            color: #f3f4f6;
                            font-size: 1rem;
                            transition: border-color 0.2s;
                        }
                        .secure-input:focus {
                            outline: none;
                            border-color: #8b5cf6;
                        }
                    \`;
                    document.head.appendChild(style);
                },
                
                // Create Shadow DOM protected input
                createShadowInput(originalInput) {
                    const wrapper = document.createElement('div');
                    wrapper.className = 'secure-input-wrapper';
                    
                    // Create shadow root with closed mode for maximum protection
                    const shadow = wrapper.attachShadow({ mode: 'closed' });
                    
                    // Clone styles into shadow DOM
                    const style = document.createElement('style');
                    style.textContent = \`
                        :host {
                            display: inline-block;
                            width: 100%;
                        }
                        .shadow-input {
                            width: 100%;
                            padding: 0.75rem;
                            border: 2px solid #374151;
                            border-radius: 0.5rem;
                            background: #1f2937;
                            color: #f3f4f6;
                            font-size: 1rem;
                            transition: border-color 0.2s;
                            box-sizing: border-box;
                            font-family: inherit;
                        }
                        .shadow-input:focus {
                            outline: none;
                            border-color: #8b5cf6;
                        }
                    \`;
                    shadow.appendChild(style);
                    
                    // Create the actual input
                    const shadowInput = document.createElement(originalInput.tagName.toLowerCase());
                    shadowInput.className = 'shadow-input';
                    shadowInput.type = originalInput.type;
                    shadowInput.placeholder = originalInput.placeholder;
                    shadowInput.required = originalInput.required;
                    shadowInput.rows = originalInput.rows;
                    
                    // Memory-only value storage (never in DOM)
                    let memoryValue = '';
                    let valueFragments = [];
                    
                    // Override value property
                    Object.defineProperty(shadowInput, 'value', {
                        get() { return memoryValue; },
                        set(val) { 
                            memoryValue = val;
                            this.dispatchEvent(new Event('input', { bubbles: true }));
                        }
                    });
                    
                    // Handle input with fragmentation
                    shadowInput.addEventListener('input', (e) => {
                        const inputValue = e.target.value || shadowInput.textContent;
                        
                        // Fragment the input across multiple memory locations
                        valueFragments = [];
                        for (let i = 0; i < inputValue.length; i += 3) {
                            valueFragments.push(inputValue.substr(i, 3));
                        }
                        memoryValue = inputValue;
                        
                        // Clear the actual DOM value
                        if (e.target.value !== undefined) {
                            setTimeout(() => e.target.value = '•'.repeat(inputValue.length), 0);
                        }
                        
                        // Dispatch to original input for form compatibility
                        if (originalInput.id && originalInput.id.includes('seed')) {
                            // Only show masked characters for seed phrase
                            originalInput.value = '•'.repeat(inputValue.length);
                        } else {
                            originalInput.value = inputValue;
                        }
                        originalInput.dispatchEvent(new Event('input', { bubbles: true }));
                    });
                    
                    // Prevent copy/paste for sensitive fields
                    if (originalInput.id && (originalInput.id.includes('seed') || originalInput.id.includes('cipher') || originalInput.id.includes('salt'))) {
                        shadowInput.addEventListener('copy', (e) => {
                            e.preventDefault();
                            this.showSecurityWarning('Copy operation blocked for security');
                        });
                        
                        shadowInput.addEventListener('cut', (e) => {
                            e.preventDefault();
                            this.showSecurityWarning('Cut operation blocked for security');
                        });
                        
                        shadowInput.addEventListener('paste', (e) => {
                            e.preventDefault();
                            // Allow paste but clear clipboard after
                            setTimeout(() => {
                                if (navigator.clipboard && navigator.clipboard.writeText) {
                                    navigator.clipboard.writeText('').catch(() => {});
                                }
                            }, 100);
                        });
                        
                        // Disable autocomplete
                        shadowInput.autocomplete = 'off';
                        shadowInput.spellcheck = false;
                    }
                    
                    shadow.appendChild(shadowInput);
                    
                    // Replace original input
                    originalInput.style.display = 'none';
                    originalInput.parentNode.insertBefore(wrapper, originalInput);
                    
                    // Store reference for memory cleanup
                    this.secureInputs.set(originalInput.id, {
                        wrapper,
                        shadow,
                        input: shadowInput,
                        getValue: () => memoryValue,
                        getFragments: () => valueFragments,
                        clear: () => {
                            memoryValue = '';
                            valueFragments = [];
                            shadowInput.value = '';
                        }
                    });
                    
                    return shadowInput;
                },
                
                // Add decoy input fields to confuse extensions
                addDecoyFields() {
                    const decoyCount = Math.floor(Math.random() * 5) + 3;
                    for (let i = 0; i < decoyCount; i++) {
                        const decoy = document.createElement('input');
                        decoy.type = 'password';
                        decoy.style.cssText = 'position: absolute; left: -9999px; opacity: 0; pointer-events: none;';
                        decoy.name = \`decoy_\${Math.random().toString(36).substr(2, 9)}\`;
                        decoy.value = this.generateDecoyValue();
                        decoy.tabIndex = -1;
                        document.body.appendChild(decoy);
                        this.decoyFields.push(decoy);
                    }
                },
                
                generateDecoyValue() {
                    const words = ['abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract'];
                    const wordCount = Math.floor(Math.random() * 12) + 12;
                    return Array.from({length: wordCount}, () => words[Math.floor(Math.random() * words.length)]).join(' ');
                },
                
                // Anti-debugging protection (mobile-aware)
                setupAntiDebugging() {
                    // Detect if we're on mobile to avoid false positives
                    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                                   ('ontouchstart' in window) ||
                                   (navigator.maxTouchPoints > 0) ||
                                   (window.innerWidth <= 768);
                    
                    if (isMobile) {
                        // On mobile, only use console detection with higher threshold
                        let consoleOpen = false;
                        const detectConsole = () => {
                            try {
                                const start = Date.now();
                                console.log('%c', 'color: transparent');
                                const end = Date.now();
                                // Higher threshold for mobile to avoid false positives
                                if (end - start > 200) {
                                    if (!consoleOpen) {
                                        consoleOpen = true;
                                        this.onDebuggerDetected();
                                    }
                                } else {
                                    if (consoleOpen) {
                                        consoleOpen = false;
                                        this.onDebuggerClosed();
                                    }
                                }
                            } catch (e) {
                                // Ignore errors on mobile
                            }
                        };
                        
                        // Less frequent checks on mobile
                        setInterval(detectConsole, 3000);
                        return;
                    }
                    
                    // Desktop debugging detection
                    let devtools = false;
                    const threshold = 160;
                    
                    setInterval(() => {
                        try {
                            const heightDiff = window.outerHeight - window.innerHeight;
                            const widthDiff = window.outerWidth - window.innerWidth;
                            
                            if (heightDiff > threshold || widthDiff > threshold) {
                                if (!devtools) {
                                    devtools = true;
                                    this.isDebuggerOpen = true;
                                    this.onDebuggerDetected();
                                }
                            } else {
                                if (devtools) {
                                    devtools = false;
                                    this.isDebuggerOpen = false;
                                    this.onDebuggerClosed();
                                }
                            }
                        } catch (e) {
                            // Ignore measurement errors
                        }
                    }, 1000);
                    
                    // Console detection for desktop
                    let consoleOpen = false;
                    const detectConsole = () => {
                        try {
                            const start = Date.now();
                            console.log('%c', 'color: transparent');
                            const end = Date.now();
                            if (end - start > 100) {
                                if (!consoleOpen) {
                                    consoleOpen = true;
                                    this.onDebuggerDetected();
                                }
                            } else {
                                if (consoleOpen) {
                                    consoleOpen = false;
                                    this.onDebuggerClosed();
                                }
                            }
                        } catch (e) {
                            // Ignore console detection errors
                        }
                    };
                    
                    setInterval(detectConsole, 2000);
                },
                
                onDebuggerDetected() {
                    this.showSecurityWarning('⚠️ Developer tools detected! For security, consider closing them when entering sensitive data.');
                    
                    // Optional: Blur sensitive inputs when debugger is active
                    this.secureInputs.forEach((secureInput) => {
                        if (secureInput.wrapper) {
                            secureInput.wrapper.style.filter = 'blur(3px)';
                        }
                    });
                },
                
                onDebuggerClosed() {
                    // Remove blur effect
                    this.secureInputs.forEach((secureInput) => {
                        if (secureInput.wrapper) {
                            secureInput.wrapper.style.filter = '';
                        }
                    });
                },
                
                // Clipboard protection
                setupClipboardProtection() {
                    // Clear clipboard on page unload
                    window.addEventListener('beforeunload', () => {
                        if (navigator.clipboard && navigator.clipboard.writeText) {
                            navigator.clipboard.writeText('').catch(() => {});
                        }
                    });
                    
                    // Clear sensitive data from memory on page hide
                    document.addEventListener('visibilitychange', () => {
                        if (document.hidden) {
                            this.clearSensitiveData();
                        }
                    });
                },
                
                // Memory protection - clear sensitive data
                setupMemoryProtection() {
                    // Clear data on page unload
                    window.addEventListener('beforeunload', () => {
                        this.clearSensitiveData();
                    });
                    
                    // Auto-clear after inactivity
                    let inactivityTimer;
                    const resetTimer = () => {
                        clearTimeout(inactivityTimer);
                        inactivityTimer = setTimeout(() => {
                            this.clearSensitiveData();
                            this.showSecurityWarning('Session cleared due to inactivity for security');
                        }, 15 * 60 * 1000); // 15 minutes
                    };
                    
                    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
                        document.addEventListener(event, resetTimer);
                    });
                    resetTimer();
                },
                
                clearSensitiveData() {
                    // Clear all secure inputs
                    this.secureInputs.forEach((secureInput) => {
                        if (secureInput.clear) {
                            secureInput.clear();
                        }
                    });
                    
                    // Clear original inputs
                    const sensitiveInputs = document.querySelectorAll('input[type="password"], textarea[id*="seed"]');
                    sensitiveInputs.forEach(input => {
                        input.value = '';
                    });
                    
                    // Force garbage collection if available
                    if (window.gc) {
                        window.gc();
                    }
                },
                
                showSecurityWarning(message) {
                    // Create non-intrusive security notification
                    const notification = document.createElement('div');
                    notification.style.cssText = \`
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: linear-gradient(135deg, #fbbf24, #f59e0b);
                        color: white;
                        padding: 12px 16px;
                        border-radius: 8px;
                        font-weight: 600;
                        z-index: 10000;
                        max-width: 300px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                        animation: slideIn 0.3s ease-out;
                    \`;
                    notification.textContent = message;
                    
                    const style = document.createElement('style');
                    style.textContent = \`
                        @keyframes slideIn {
                            from { transform: translateX(100%); opacity: 0; }
                            to { transform: translateX(0); opacity: 1; }
                        }
                    \`;
                    document.head.appendChild(style);
                    
                    document.body.appendChild(notification);
                    
                    setTimeout(() => {
                        if (notification.parentNode) {
                            notification.remove();
                        }
                        if (style.parentNode) {
                            style.remove();
                        }
                    }, 5000);
                }
            };
            
            // Initialize security system when DOM is ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    setTimeout(() => SecurityManager.init(), 100);
                });
            } else {
                setTimeout(() => SecurityManager.init(), 100);
            }
            
            // Protect sensitive inputs when they appear
            const protectSensitiveInputs = () => {
                const sensitiveSelectors = [
                    'input[id*="seed"]',
                    'textarea[id*="seed"]',
                    'input[id*="cipher"]',
                    'input[id*="salt"]'
                ];
                
                sensitiveSelectors.forEach(selector => {
                    const inputs = document.querySelectorAll(selector);
                    inputs.forEach(input => {
                        if (!input.dataset.protected) {
                            SecurityManager.createShadowInput(input);
                            input.dataset.protected = 'true';
                        }
                    });
                });
            };
            
            // Observe DOM changes to protect new inputs (wait for body to be ready)
            const startObserver = () => {
                if (typeof MutationObserver !== 'undefined' && document.body) {
                    const observer = new MutationObserver((mutations) => {
                        let shouldCheck = false;
                        mutations.forEach((mutation) => {
                            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                                shouldCheck = true;
                            }
                        });
                        if (shouldCheck) {
                            setTimeout(protectSensitiveInputs, 50);
                        }
                    });
                    
                    observer.observe(document.body, {
                        childList: true,
                        subtree: true
                    });
                } else {
                    // Retry if body not ready
                    setTimeout(startObserver, 100);
                }
            };
            
            startObserver();
            
            // Make SecurityManager available globally for form handling
            window.SecurityManager = SecurityManager;
            
        })();
    </script>`;

  // Insert security script before closing head tag
  return htmlContent.replace('</head>', `${securityScript}
</head>`);
}

// Function to add enhanced CSP and security headers to HTML
function addSecurityHeaders(htmlContent) {
  // Update CSP to be more restrictive and block extensions
  const updatedCSP = htmlContent.replace(
    /content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; worker-src 'self'; manifest-src 'self'; img-src 'self' data: blob:;"/,
    `content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; worker-src 'self'; manifest-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self';"`
  );

  // Add additional security headers
  const securityMetaTags = `    <meta http-equiv="X-Frame-Options" content="DENY">
    <meta http-equiv="X-Content-Type-Options" content="nosniff">
    <meta http-equiv="Referrer-Policy" content="no-referrer">
    <meta name="robots" content="noindex, nofollow, nosnippet, noarchive">`;

  // Insert security meta tags after CSP
  return updatedCSP.replace(
    /<meta http-equiv="Content-Security-Policy"[^>]*>/,
    `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; worker-src 'self'; manifest-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self';">
${securityMetaTags}`
  );
}

// Function to add PWA meta tags and service worker registration to HTML
function addPWAToHtml(htmlContent) {
  // First, update CSP to allow service worker and install prompt
  const updatedCSP = htmlContent.replace(
    /content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"/,
    `content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; worker-src 'self'; manifest-src 'self'; img-src 'self' data: blob:;"`
  );

  // Add PWA meta tags after the existing meta tags
  const pwaMetaTags = `    <link rel="manifest" href="manifest.json">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">
    <meta name="apple-mobile-web-app-title" content="Seed Concealer">
    <meta name="theme-color" content="#8b5cf6">
    <link rel="icon" type="image/x-icon" href="favicon.ico">
    <link rel="icon" type="image/png" href="favicon.png">
    <link rel="apple-touch-icon" href="icon-512.png">
    <link rel="icon" type="image/png" sizes="512x512" href="icon-512.png">`;

  // Add service worker registration before closing body tag
  const serviceWorkerScript = `    <script>
        // Register service worker for PWA functionality
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js')
                    .then(registration => {
                        console.log('SW registered: ', registration);
                    })
                    .catch(registrationError => {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }

        // PWA install prompt
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            deferredPrompt = e;
            e.preventDefault();
            
            // Show install button
            const installBtn = document.createElement('button');
            installBtn.textContent = '📱 Install App';
            installBtn.style.cssText = \`
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: linear-gradient(135deg, #8b5cf6, #06b6d4);
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                z-index: 1000;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            \`;
            
            installBtn.onclick = () => {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted the A2HS prompt');
                        installBtn.remove();
                    }
                    deferredPrompt = null;
                });
            };
            
            document.body.appendChild(installBtn);
            
            // Auto-hide after 10 seconds
            setTimeout(() => {
                if (installBtn.parentNode) {
                    installBtn.remove();
                }
            }, 10000);
        });
    </script>`;

  // Insert PWA meta tags after the last existing meta tag
  const metaTagsInserted = updatedCSP.replace(
    /<meta name="description"[^>]*>/,
    `<meta name="description" content="Zero-dependency secure seed phrase concealer">
${pwaMetaTags}`
  );

  // Insert service worker script before closing body tag
  return metaTagsInserted.replace('</body>', `${serviceWorkerScript}
</body>`);
}

// Copy and enhance HTML files
const htmlFiles = [
  { src: 'index.html', dest: 'index.html' },
  { src: 'conceal-simple.html', dest: 'conceal.html' },
  { src: 'reveal-simple.html', dest: 'reveal.html' }
];

htmlFiles.forEach(file => {
  if (fs.existsSync(file.src)) {
    let content = fs.readFileSync(file.src, 'utf-8');
    
    // Replace BIP39 word list with efficient format
    content = replaceBIP39WordList(content);
    
    // Add mobile responsive CSS
    content = addMobileResponsiveCSS(content);
    
    // Add security protection (Shadow DOM, anti-debugging, etc.)
    content = addSecurityProtection(content);
    
    // Add security headers and CSP
    content = addSecurityHeaders(content);
    
    // Add PWA functionality
    content = addPWAToHtml(content);
    
    // Update navigation links to use new names
    content = content
      .replace(/conceal-simple\.html/g, 'conceal.html')
      .replace(/reveal-simple\.html/g, 'reveal.html');
    
    fs.writeFileSync(path.join(distDir, file.dest), content);
    console.log(`✓ Enhanced and secured ${file.src} → dist/${file.dest}`);
  }
});

// Create PWA manifest
const manifest = {
  "name": "Seed Concealer - Secure Edition",
  "short_name": "SeedConcealer",
  "description": "Zero-dependency secure seed phrase concealer",
  "start_url": "./index.html",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#8b5cf6",
  "orientation": "portrait-primary",
  "scope": "./",
  "lang": "en",
  "dir": "ltr",
  "display_override": ["window-controls-overlay", "standalone", "minimal-ui"],
  "prefer_related_applications": false,
  "icons": [
    {
      "src": "icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "icon-512.png",
      "sizes": "512x512", 
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "icon-512.png", 
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "icon-512.png",
      "sizes": "144x144",
      "type": "image/png", 
      "purpose": "any"
    }
  ],
  "categories": ["security", "utilities", "finance"],
  "shortcuts": [
    {
      "name": "Conceal Seed",
      "short_name": "Conceal",
      "description": "Hide your seed phrase",
      "url": "./conceal.html",
      "icons": [{ "src": "icon-512.png", "sizes": "512x512", "type": "image/png" }]
    },
    {
      "name": "Reveal Seed",
      "short_name": "Reveal", 
      "description": "Recover your seed phrase",
      "url": "./reveal.html",
      "icons": [{ "src": "icon-512.png", "sizes": "512x512", "type": "image/png" }]
    }
  ],
  "related_applications": [],
  "edge_side_panel": {
    "preferred_width": 400
  }
};

fs.writeFileSync(path.join(distDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log('✓ Created PWA manifest.json');

// Create service worker for offline functionality
const serviceWorkerContent = `const CACHE_NAME = 'seed-concealer-secure-v1.0.3';
const STATIC_CACHE_URLS = [
  './',
  './index.html',
  './conceal.html',
  './reveal.html', 
  './manifest.json',
  './favicon.ico',
  './favicon.png',
  './icon-512.png',
  './icon-192.svg',
  './icon-512.svg'
];

// Additional caching strategies for iOS PWA
const RUNTIME_CACHE = 'runtime-cache-v1.0.3';

// Install event - cache static resources with iOS-specific handling
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    Promise.all([
      // Cache static files
      caches.open(CACHE_NAME).then(cache => {
        console.log('Service Worker: Caching static files');
        return Promise.all(
          STATIC_CACHE_URLS.map(url => {
            // iOS Safari requires explicit cache headers for PWA offline
            const request = new Request(url, {
              cache: 'reload',
              credentials: 'same-origin'
            });
            return fetch(request)
              .then(response => {
                if (response.status === 200) {
                  return cache.put(url, response);
                }
                throw new Error(\`Failed to fetch \${url}: \${response.status}\`);
              })
              .catch(err => {
                console.log('Failed to cache', url, ':', err);
                // Try fallback caching
                return cache.add(url).catch(() => {
                  console.warn('Fallback caching also failed for', url);
                });
              });
          })
        );
      }),
      // Initialize runtime cache
      caches.open(RUNTIME_CACHE)
    ])
    .then(() => {
      console.log('Service Worker: Install complete');
      return self.skipWaiting();
    })
    .catch(error => {
      console.error('Service Worker: Install failed', error);
    })
  );
});

// Activate event - clean up old caches with iOS-specific handling  
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('Service Worker: Clearing old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activation complete');
        // Force claim clients immediately for iOS PWA
        return self.clients.claim();
      })
      .then(() => {
        // Notify all clients that SW is ready (important for iOS)
        return self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'SW_ACTIVATED',
              message: 'Service Worker activated and ready for offline use'
            });
          });
        });
      })
  );
});

// Enhanced fetch event - iOS PWA optimized offline support
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip external requests and extension requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // iOS PWA cache-first strategy for better offline support
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          console.log('Service Worker: Serving from cache:', event.request.url);
          return cachedResponse;
        }

        // Handle different URL patterns
        const url = new URL(event.request.url);
        const pathname = url.pathname;
        
        // Root requests
        if (pathname === '/' || pathname === '' || pathname === '/index.html') {
          return caches.match('./index.html').then(response => {
            if (response) return response;
            return caches.match('index.html');
          });
        }
        
        // Specific HTML files
        if (pathname.endsWith('.html') || pathname.endsWith('/')) {
          const htmlFile = pathname.replace(/\/$/, '') + (pathname.endsWith('.html') ? '' : '.html');
          const cleanFile = htmlFile.replace(/^\//, './');
          return caches.match(cleanFile).then(response => {
            if (response) return response;
            return caches.match(htmlFile.replace(/^\//, ''));
          });
        }

        // For iOS PWA: Always try cache first, then network
        return caches.open(CACHE_NAME).then(cache => {
          // Try exact match first
          return cache.match(event.request).then(response => {
            if (response) return response;
            
            // Try with relative path
            const relativeUrl = event.request.url.replace(self.location.origin, '.');
            return cache.match(relativeUrl);
          });
        }).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Network fallback for iOS
          return fetch(event.request.clone())
            .then(response => {
              // Cache successful responses for future offline use
              if (response && response.status === 200) {
                caches.open(RUNTIME_CACHE).then(cache => {
                  cache.put(event.request, response.clone());
                });
              }
              return response;
            })
            .catch(networkError => {
              console.log('Service Worker: Network failed, using offline strategy');
              
              // iOS-specific offline fallback
              if (event.request.destination === 'document' || 
                  (event.request.headers.get('accept') && 
                   event.request.headers.get('accept').includes('text/html'))) {
                
                // Return the most appropriate HTML file
                return caches.match('./index.html')
                  .then(response => response || caches.match('index.html'))
                  .then(response => response || caches.match('./conceal.html'))
                  .then(response => response || caches.match('./reveal.html'))
                  .then(response => {
                    if (response) {
                      console.log('Service Worker: Serving offline HTML');
                      return response;
                    }
                    
                    // Last resort: create offline page
                    return new Response(\`
                      <!DOCTYPE html>
                      <html>
                        <head>
                          <title>Offline - Seed Concealer</title>
                          <meta charset="UTF-8">
                          <meta name="viewport" content="width=device-width, initial-scale=1.0">
                          <style>
                            body { 
                              font-family: Arial, sans-serif; 
                              text-align: center; 
                              padding: 50px;
                              background: #0f172a;
                              color: #fff;
                            }
                            .offline-message {
                              background: #8b5cf6;
                              padding: 20px;
                              border-radius: 10px;
                              max-width: 400px;
                              margin: 0 auto;
                            }
                          </style>
                        </head>
                        <body>
                          <div class="offline-message">
                            <h1>🌱 Seed Concealer</h1>
                            <h2>You're Offline</h2>
                            <p>This PWA works offline! The page you requested isn't cached yet.</p>
                            <p><a href="/" style="color: #06b6d4;">Return to Home</a></p>
                          </div>
                        </body>
                      </html>
                    \`, {
                      status: 200,
                      headers: new Headers({
                        'Content-Type': 'text/html'
                      })
                    });
                  });
              }
              
              // For other resources
              return new Response('Offline - Resource not available', {
                status: 503,
                statusText: 'Service Unavailable',
                headers: new Headers({
                  'Content-Type': 'text/plain'
                })
              });
            });
        });
      })
  );
});

// Handle messages from the main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});`;

fs.writeFileSync(path.join(distDir, 'sw.js'), serviceWorkerContent);
console.log('✓ Created service worker sw.js');

// Create SVG-based icon files as data URLs (works in browsers)
const createSVGIcon = (size) => {
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad${size}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#06b6d4;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" rx="${size/10}" fill="url(#grad${size})"/>
    <text x="${size/2}" y="${size/2 + size/8}" font-family="Arial" font-size="${size/4}" 
          fill="white" text-anchor="middle" font-weight="bold">🌱</text>
  </svg>`;
  
  return svg;
};

// Create a proper PNG icon with correct dimensions
function createProperPNG(size) {
  // Create a proper sized PNG with a gradient background and emoji-like icon
  // This is a base64 encoded PNG that represents a purple gradient background with proper dimensions
  if (size === 192) {
    // 192x192 purple gradient PNG with seed icon
    const base64PNG = 'data:image/png;base64,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';
    return Buffer.from(base64PNG.split(',')[1], 'base64');
  } else {
    // 512x512 version - same concept but larger
    const base64PNG = 'data:image/png;base64,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';
    return Buffer.from(base64PNG.split(',')[1], 'base64');
  }
}

// Create SVG files that can be used as icons
const icon192SVG = createSVGIcon(192);
const icon512SVG = createSVGIcon(512);

// Write SVG icons as .svg files (many browsers accept SVG icons in PWA manifests)
fs.writeFileSync(path.join(distDir, 'icon-192.svg'), icon192SVG);
fs.writeFileSync(path.join(distDir, 'icon-512.svg'), icon512SVG);

// Copy the existing yellow lock icon for PWA and favicon
const existingIconPath = path.join(__dirname, 'yellow-lock-icon-24.png');
if (fs.existsSync(existingIconPath)) {
  const iconBuffer = fs.readFileSync(existingIconPath);
  // Use the yellow lock icon for PWA (it's 512x512)
  fs.writeFileSync(path.join(distDir, 'icon-512.png'), iconBuffer);
  // Use the same yellow lock icon as favicon
  fs.writeFileSync(path.join(distDir, 'favicon.ico'), iconBuffer);
  // Also create a PNG favicon for better browser support
  fs.writeFileSync(path.join(distDir, 'favicon.png'), iconBuffer);
  console.log('✓ Using yellow lock icon as favicon and PWA icon');
} else {
  // Fallback to generated icons if the file doesn't exist
  const coloredPNG = createProperPNG(512);
  fs.writeFileSync(path.join(distDir, 'icon-512.png'), coloredPNG);
  fs.writeFileSync(path.join(distDir, 'favicon.ico'), coloredPNG);
  fs.writeFileSync(path.join(distDir, 'favicon.png'), coloredPNG);
  console.log('✓ Using generated icons for PWA and favicon');
}

console.log('✓ Created SVG and PNG icon files');

// Create deployment info
const deploymentInfo = {
  buildTime: new Date().toISOString(),
  version: '1.0.0',
  features: [
    'Zero dependencies',
    'PWA with offline support',
    'Service worker caching',
    'Install prompt',
    'Seed phrase concealment/reveal',
    'Salt-enhanced security'
  ],
  files: fs.readdirSync(distDir),
  totalSize: fs.readdirSync(distDir)
    .map(file => fs.statSync(path.join(distDir, file)).size)
    .reduce((total, size) => total + size, 0)
};

fs.writeFileSync(path.join(distDir, 'build-info.json'), JSON.stringify(deploymentInfo, null, 2));

console.log('\n🎉 Build complete! All files ready for deployment in dist/ folder');
console.log('📁 Contents:');
fs.readdirSync(distDir).forEach(file => {
  const stat = fs.statSync(path.join(distDir, file));
  const size = (stat.size / 1024).toFixed(1);
  console.log(`   ${file} (${size}KB)`);
});

console.log(`\n📊 Total size: ${(deploymentInfo.totalSize / 1024).toFixed(1)}KB`);
console.log('✅ Ready for PWA deployment with offline support!');