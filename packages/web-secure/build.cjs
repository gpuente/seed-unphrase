#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');

console.log('🚀 Starting build process...');

// Clean and create dist directory
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true });
  console.log('🗑️  Cleaned dist directory');
}
fs.mkdirSync(distDir, { recursive: true });
console.log('📁 Created dist directory');

// Function to add PWA meta tags and service worker registration to HTML
function addPWAToHtml(htmlContent) {
  // First, update CSP to allow service worker and install prompt
  const updatedCSP = htmlContent.replace(
    /content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"/,
    `content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; worker-src 'self'; manifest-src 'self';"`
  );

  // Add PWA meta tags after the existing meta tags
  const pwaMetaTags = `    <link rel="manifest" href="manifest.json">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">
    <meta name="apple-mobile-web-app-title" content="Seed Concealer">
    <meta name="theme-color" content="#8b5cf6">
    <link rel="apple-touch-icon" href="icon-192.png">
    <link rel="icon" type="image/png" sizes="192x192" href="icon-192.png">
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
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "icon-512.png", 
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["security", "utilities", "finance"],
  "shortcuts": [
    {
      "name": "Conceal Seed",
      "short_name": "Conceal",
      "description": "Hide your seed phrase",
      "url": "./conceal.html",
      "icons": [{ "src": "icon-192.png", "sizes": "192x192" }]
    },
    {
      "name": "Reveal Seed",
      "short_name": "Reveal", 
      "description": "Recover your seed phrase",
      "url": "./reveal.html",
      "icons": [{ "src": "icon-192.png", "sizes": "192x192" }]
    }
  ]
};

fs.writeFileSync(path.join(distDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log('✓ Created PWA manifest.json');

// Create service worker for offline functionality
const serviceWorkerContent = `const CACHE_NAME = 'seed-concealer-v1.0.0';
const STATIC_CACHE_URLS = [
  './',
  './index.html',
  './conceal.html',
  './reveal.html', 
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
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

        // Not in cache, fetch from network
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
            console.error('Service Worker: Fetch failed:', error);
            
            // Return cached fallback for document requests
            if (event.request.destination === 'document') {
              return caches.match('./index.html');
            }
            
            // For other requests, throw the error
            throw error;
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

// Create minimal PNG headers for valid icon files
function createMinimalPNG(size) {
  // Create a simple 1x1 transparent PNG and scale reference
  const pngHeader = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
    0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, 0x01, // Width: 1
    0x00, 0x00, 0x00, 0x01, // Height: 1
    0x08, 0x06, 0x00, 0x00, 0x00, // Bit depth: 8, Color type: 6 (RGBA), Compression: 0, Filter: 0, Interlace: 0
    0x1F, 0x15, 0xC4, 0x89, // CRC
    0x00, 0x00, 0x00, 0x0A, // IDAT chunk length
    0x49, 0x44, 0x41, 0x54, // IDAT
    0x78, 0x9C, 0x62, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // Compressed transparent pixel
    0xE2, 0x21, 0xBC, 0x33, // CRC
    0x00, 0x00, 0x00, 0x00, // IEND chunk length
    0x49, 0x45, 0x4E, 0x44, // IEND
    0xAE, 0x42, 0x60, 0x82  // CRC
  ]);
  
  return pngHeader;
}

// Create SVG files that can be used as icons
const icon192SVG = createSVGIcon(192);
const icon512SVG = createSVGIcon(512);

// Write SVG icons as .svg files (many browsers accept SVG icons in PWA manifests)
fs.writeFileSync(path.join(distDir, 'icon-192.svg'), icon192SVG);
fs.writeFileSync(path.join(distDir, 'icon-512.svg'), icon512SVG);

// Create minimal PNG files for compatibility
const minimalPNG = createMinimalPNG();
fs.writeFileSync(path.join(distDir, 'icon-192.png'), minimalPNG);
fs.writeFileSync(path.join(distDir, 'icon-512.png'), minimalPNG);

// Create a favicon.ico to prevent 404 errors
fs.writeFileSync(path.join(distDir, 'favicon.ico'), minimalPNG);

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