#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🧹 Website Bloat Cleanup Analysis\n');

// Analyze current sizes
function getDirectorySize(dirPath) {
  try {
    const result = execSync(`du -sh "${dirPath}" 2>/dev/null`, { encoding: 'utf8' });
    return result.trim().split('\t')[0];
  } catch (error) {
    return 'N/A';
  }
}

// Main directories to analyze
const directories = [
  'public/uploads/properties',
  'public/uploads/projects', 
  'public/uploads/announcements',
  'attached_assets',
  'project-export',
  'client',
  'server',
  'shared'
];

console.log('📦 Current Directory Sizes:');
directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`  ${dir}: ${getDirectorySize(dir)}`);
  }
});

// Analyze large images
console.log('\n🖼️  Large Property Images (>1MB):');
try {
  const largeImages = execSync(
    `find ./public/uploads/properties -type f -size +1M -exec ls -lh {} \\; | sort -k5 -hr | head -10`,
    { encoding: 'utf8' }
  );
  console.log(largeImages);
} catch (error) {
  console.log('No large images found or directory does not exist');
}

// Count total files
console.log('\n📄 File Count Analysis:');
directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    try {
      const fileCount = execSync(`find "${dir}" -type f | wc -l`, { encoding: 'utf8' }).trim();
      console.log(`  ${dir}: ${fileCount} files`);
    } catch (error) {
      console.log(`  ${dir}: Error counting files`);
    }
  }
});

// Optimization recommendations
console.log('\n🎯 Cleanup Recommendations:');
console.log('1. Convert large images to WebP format (can reduce size by 25-35%)');
console.log('2. Remove duplicate images in attached_assets vs public/uploads');
console.log('3. Compress images over 1MB to 800KB max');
console.log('4. Remove project-export if it\'s a backup');
console.log('5. Clean up unused placeholder files');

console.log('\n✅ Creating clean backup excludes:');
console.log('- node_modules (661MB)');
console.log('- .git history (434MB)'); 
console.log('- .local/.cache (460MB)');
console.log('- Large uncompressed images');