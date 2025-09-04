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
    
    // Add PWA functionality
    content = addPWAToHtml(content);
    
    // Update navigation links to use new names
    content = content
      .replace(/conceal-simple\.html/g, 'conceal.html')
      .replace(/reveal-simple\.html/g, 'reveal.html');
    
    fs.writeFileSync(path.join(distDir, file.dest), content);
    console.log(`✓ Enhanced and copied ${file.src} → dist/${file.dest}`);
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
const serviceWorkerContent = `const CACHE_NAME = 'seed-concealer-v1.0.1';
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

// Install event - cache static resources
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching files');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('Service Worker: Install complete');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Cache failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: Clearing old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          console.log('Service Worker: Serving from cache:', event.request.url);
          return cachedResponse;
        }

        // Try to match with ./ prefix for root requests
        const rootPath = event.request.url.replace(self.location.origin, '');
        if (rootPath === '/' || rootPath === '') {
          return caches.match('./index.html');
        }

        // Not in cache, try to fetch from network
        console.log('Service Worker: Fetching from network:', event.request.url);
        return fetch(event.request)
          .then(response => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response since it's a stream
            const responseToCache = response.clone();

            // Add to cache for future requests
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(error => {
            console.error('Service Worker: Fetch failed (offline?):', error);
            
            // Return cached fallback for document requests when offline
            if (event.request.destination === 'document' || event.request.headers.get('accept').includes('text/html')) {
              return caches.match('./index.html').then(response => {
                if (response) return response;
                // Try other cached HTML files as fallback
                return caches.match('./conceal.html');
              });
            }
            
            // For other requests, try to find any cached version
            return caches.match(event.request.url.replace(self.location.origin, '.'));
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
    const base64PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAYAAABS3GwHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4AUkSYqIQkQSoghodkVUcERRUUEG8igiAOOjoCMFVEsDIoK2AfkIaKOg6OIisr74Xuja9a89+bN/rXXPues852zzwfACAyWSDNRNYAMqUIeEeCDx8TG4eQuQIEKJHAAEAizZCFz/SMBAPh+PDwrIsAHvgABeNMLCADATZvAMByH/w/qQplcAYCEAcB0kThLCIAUAEB6jkKmAEBGAYCdmCZTAKAEAGDLY2LjAFAtAGAnf+bTAICd+Jl7AQBblCEVAaCRACATZYhEAGg7AKzPVopFAFgwABRmS8Q5ANgtADBJV2ZIALC3AMDOEAuyAAgMADBRiIUpAAR7AGDIIyN4AISZABRG8lc88SuuEOcqAAB4mbI8uSQ5RYFbCC1xB1dXLh4ozkkXKxQ2YQJhmkAuwnmZGTKBNA/g88wAAKCRFRHgg/P9eM4Ors7ONo62Dl8t6r8G/yJiYuP+5c+rcEAAAOF0ftH+LC+zGoA7BoBt/qIl7gRoXgugdfeLZrIPQLUAoOnaV/Nw+H48PEWhkLnZ2eXk5NhKxEJbYcpXff5nwl/AV/1s+X48/Pf14L7iJIEyXYFHBPjgwsz0TKUcz5IJhGLc5o9H/LcL//wd0yLESWK5WCoU41EScY5EmozzMqUiiUKSKcUl0v9k4t8s+wM+3zUAsGo+AXuRLahdYwP2SycQWHTA4vcAAPK7b8HUKAgDgGiD4c93/+8//UegJQCAZkmScQAAXkQkLlTKsz/HCAAARKCBKrBBG/TBGCzABhzBBdzBC/xgNoRCJMTCQhBCCmSAHHJgKayCQiiGzbAdKmAv1EAdNMBRaIaTcA4uwlW4Dj1wD/phCJ7BKLyBCQRByAgTYSHaiAFiilgjjggXmYX4IcFIBBKLJCDJiBRRIkuRNUgxUopUIFVIHfI9cgI5h1xGupE7yAAygvyGvEcxlIGyUT3UDLVDuag3GoRGogvQZHQxmo8WoJvQcrQaPYw2oefQq2gP2o8+Q8cwwOgYBzPEbDAuxsNCsTgsCZNjy7EirAyrxhqwVqwDu4n1Y8+xdwQSgUXACTYEd0IgYR5BSFhMWE7YSKggHCQ0EdoJNwkDhFHCJyKTqEu0JroR+cQYYjIxh1hILCPWEo8TLxB7iEPENyQSiUMyJ7mQAkmxpFTSEtJG0m5SI+ksqZs0SBojk8naZGuyBzmULCAryIXkneTD5DPkG+Qh8lsKnWJAcaT4U+IoUspqShnlEOU05QZlmDJBVaOaUt2ooVQRNY9aQq2htlKvUYeoEzR1mjnNgxZJS6WtopXTGmgXaPdpr+h0uhHdlR5Ol9BX0svpR+iX6AP0dwwNhhWDx4hnKBmbGAcYZxl3GK+YTKYZ04sZx1QwNzHrmOeZD5lvVVgqtip8FZHKCpVKlSaVGyovVKmqpqreqgtV81XLVI+pXlN9rkZVM1PjqQnUlqtVqp1Q61MbU2epO6iHqmeob1Q/pH5Z/YkGWcNMw09DpFGgsV/jvMYgC2MZs3gsIWsNq4Z1gTXEJrHN2Xx2KruY/R27iz2qqaE5QzNKM1ezUvOUZj8H45hx+Jx0TgnnKKeX836K3hTvKeIpG6Y0TLkxZVxrqpaXllirSKtRq0frvTau7aedpr1Fu1n7gQ5Bx0onXCdHZ4/OBZ3nU9lT3acKpxZNPTr1ri6qa6UbobtEd79up+6Ynr5egJ5Mb6feeb3n+hx9L/1U/W36p/VHDFgGswwkBtsMzhg8xTVxbzwdL8fb8VFDXcNAQ6VhlWGX4YSRudE8o9VGjUYPjGnGXOMk423GbcajJgYmISZLTepN7ppSTbmmKaY7TDtMx83MzaLN1pk1mz0x1zLnm+eb15vft2BaeFostqi2uGVJsuRaplnutrxuhVo5WaVYVVpds0atna0l1rutu6cRp7lOk06rntZnw7Dxtsm2qbcZsOXYBtuutm22fWFnYhdnt8Wuw+6TvZN9un2N/T0HDYfZDqsdWh1+c7RyFDpWOt6azpzuP33F9JbpL2dYzxDP2DPjthPLKcRpnVOb00dnF2e5c4PziIuJS4LLLpc+Lpsbxt3IveRKdPVxXeF60vWdm7Obwu2o26/uNu5p7ofcn8w0nymeWTNz0MPIQ+BR5dE/C5+VMGvfrH5PQ0+BZ7XnIy9jL5FXrdewt6V3qvdh7xc+9j5yn+M+4zw33jLeWV/MN8C3yLfLT8Nvnl+F30N/I/9k/3r/0QCngCUBZwOJgUGBWwL7+Hp8Ib+OPzrbZfay2e1BjKC5QRVBj4KtguXBrSFoyOyQrSH355jOkc5pDoVQfujW0Adh5mGLw34MJ4WHhVeGP45wiFga0TGXNXfR3ENz30T6RJZE3ptnMU85ry1KNSo+qi5qPNo3ujS6P8YuZlnM1VidWElsSxw5LiquNm5svt/87fOH4p3iC+N7F5gvyF1weaHOwvSFpxapLhIsOpZATIhOOJTwQRAqqBaMJfITdyWOCnnCHcJnIi/RNtGI2ENcKh5O8kgqTXqS7JG8NXkkxTOlLOW5hCepkLxMDUzdmzqeFpp2IG0yPTq9MYOSkZBxQqohTZO2Z+pn5mZ2y6xlhbL+xW6Lty8elQfJa7OQrAVZLQq2QqboVFoo1yoHsmdlV2a/zYnKOZarnivN7cyzytuQN5zvn//tEsIS4ZK2pYZLVy0dWOa9rGo5sjxxedsK4xUFK4ZWBqw8uIq2Km3VT6vtV5eufr0mek1rgV7ByoLBtQFr6wtVCuWFfevc1+1dT1gvWd+1YfqGnRs+FYmKrhTbF5cVf9go3HjlG4dvyr+Z3JS0qavEuWTPZtJm6ebeLZ5bDpaql+aXDm4N2dq0Dd9WtO319kXbL5fNKNu7g7ZDuaO/PLi8ZafJzs07P1SkVPRU+lQ27tLdtWHX+G7R7ht7vPY07NXbW7z3/T7JvttVAVVN1WbVZftJ+7P3P66Jqun4lvttXa1ObXHtxwPSA/0HIw6217nU1R3SPVRSj9Yr60cOxx++/p3vdy0NNg1VjZzG4iNwRHnk6fcJ3/ceDTradox7rOEH0x92HWcdL2pCmvKaRptTmvtbYlu6T8w+0dbq3nr8R9sfD5w0PFl5SvNUyWna6YLTk2fyz4ydlZ19fi753GDborZ752PO32oPb++6EHTh0kX/i+c7vDvOXPK4dPKy2+UTV7hXmq86X23qdOo8/pPTT8e7nLuarrlca7nuer21e2b36RueN87d9L158Rb/1tWeOT3dvfN6b/fF9/XfFt1+cif9zsu72Xcn7q28T7xf9EDtQdlD3YfVP1v+3Njv3H9qwHeg89HcR/cGhYPP/pH1jw9DBY+Zj8uGDYbrnjg+OTniP3L96fynQ89kzyaeF/6i/suuFxYvfvjV69fO0ZjRoZfyl5O/bXyl/erA6xmv28bCxh6+yXgzMV70VvvtwXfcdx3vo98PT+R8IH8o/2j5sfVT0Kf7kxmTk/8EA5jz/GMzLdsAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAAAHJJREFUeNrs2IEJwDAMBEFN0n+xJi0hATOCoZb98gAAVAAfwJDqAQD4AAAAAADAB/ABfAAfwAcAAB8AAHwAAHwAAHwAAPABAMAHAAAfAAB8AADwAQDABwAAHwAAfAAA8AEAwAcAAB8AAHwAAADgAGjWABkmm7+TAAAAAElFTkSuQmCC';
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