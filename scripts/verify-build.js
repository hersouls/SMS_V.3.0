#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const distPath = './dist';

function checkBuildOutput() {
  console.log('🔍 Verifying build output...');
  
  if (!fs.existsSync(distPath)) {
    console.error('❌ dist directory not found');
    process.exit(1);
  }
  
  const indexHtmlPath = path.join(distPath, 'index.html');
  if (!fs.existsSync(indexHtmlPath)) {
    console.error('❌ index.html not found in dist');
    process.exit(1);
  }
  
  // Check if index.html contains hashed asset references
  const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
  const hashedAssetPattern = /assets\/[^"]+\.[a-f0-9]{8}\.(js|css)/;
  
  if (!hashedAssetPattern.test(indexHtml)) {
    console.warn('⚠️  Warning: No hashed assets found in index.html');
  } else {
    console.log('✅ Hashed assets found in index.html');
  }
  
  // Check assets directory
  const assetsPath = path.join(distPath, 'assets');
  if (fs.existsSync(assetsPath)) {
    const assets = fs.readdirSync(assetsPath);
    const hashedFiles = assets.filter(file => /\.(js|css)$/.test(file) && /\.([a-f0-9]{8})\./.test(file));
    
    console.log(`📦 Found ${hashedFiles.length} hashed files in assets/`);
    hashedFiles.forEach(file => {
      console.log(`   - ${file}`);
    });
  }
  
  console.log('✅ Build verification completed');
}

checkBuildOutput();