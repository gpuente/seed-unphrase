#!/usr/bin/env node

/**
 * Simple Build Script for Zero-Dependency Web App
 * Just copies HTML files and serves them
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputDir = path.join(__dirname, 'dist');

// Clean and create output directory
if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true });
}
fs.mkdirSync(outputDir, { recursive: true });

// Copy HTML files
const htmlFiles = ['index.html', 'conceal.html', 'reveal.html'];

htmlFiles.forEach(file => {
    const src = path.join(__dirname, file);
    const dest = path.join(outputDir, file);
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log(`✅ Copied ${file}`);
    }
});

console.log(`🎉 Build complete! Files are in ${outputDir}`);