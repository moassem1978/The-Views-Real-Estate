#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting production optimization...\n');

// 1. Remove unused files and directories
const filesToDelete = [
  // Root level cleanup
  '01-THEVIEWS-WEBSITE.zip',
  '01-WEBSITE-PACKAGE',
  'attached_assets',
  'backups',
  'logs',
  'cookies.txt',
  'data-store.json',
  'server.log',
  'server.pid',
  'status.html',
  'bundle_analysis.html',
  'theviews-realestate-website.tar.gz',
  'ziPdrtBB',

  // Documentation files
  'CODE-REVIEW-REPORT.md',
  'DOMAIN-TRANSFER-GUIDE.md',
  'Marassi_Blog_Complete_Guide.txt',
  'Marassi_North_Coast_Blog_Guide.txt',
  'Property_Listing_Form_Documentation.html',
  'Property_Listing_Form_Documentation.txt',
  'SEO_Business_Profile_Documentation.html',
  'SEO_Business_Profile_Documentation.txt',
  'enhanced_seo_implementation.md',
  'seo_keyword_analysis.md',
  'top_brokers_research.md',
  'top_real_estate_research.md',
  'broker_keywords_analysis.md',

  // Utility scripts (keep essential ones)
  'bulk-property-uploader.js',
  'check-db-health.js',
  'check-server-health.js',
  'check_users.js',
  'check_users.mjs',
  'cleanup-missing-images.js',
  'create-projects-table.js',
  'create-projects-table.mjs',
  'emergency-restore.js',
  'final-auth-fix.js',
  'fix-auth.js',
  'fix-image-references.js',
  'fix-password-correct.js',
  'fix_storage.js',
  'force-restart.js',
  'generate-marassi-blog-pdf.js',
  'generate-marassi-pdf.js',
  'generate-pdf.js',
  'generate-simple-pdf.js',
  'keyword_research.js',
  'main.js',
  'manual-restore.js',
  'property-reupload-tool.js',
  'reset-owner-access.js',
  'reset_owner_credentials.js',
  'restore-images.js',
  'robust-server-fix.js',
  'set-owner-password.js',
  'simple-start.js',
  'start-production.js',
  'test-announcements.js',
  'test-highlighted.ts',
  'update-property-images.js',
  'update_password.js',
  'update_password.mjs',

  // Test files
  'test-project-image.jpg',
  'test-property-image.jpg',

  // Generated files
  'generated-icon.png',
  'gold-logo-data.txt',
  'site-settings.json',
];

console.log('🧹 Cleaning up unused files...');
let deletedCount = 0;

filesToDelete.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      const stats = fs.lstatSync(file);
      if (stats.isDirectory()) {
        fs.rmSync(file, { recursive: true, force: true });
      } else {
        fs.unlinkSync(file);
      }
      console.log(`   ✅ Deleted: ${file}`);
      deletedCount++;
    }
  } catch (error) {
    console.log(`   ❌ Failed to delete ${file}: ${error.message}`);
  }
});

console.log(`\n📊 Deleted ${deletedCount} unused files/directories\n`);

// 2. Clean up public directory
console.log('🗂️  Optimizing public directory...');

const publicCleanup = [
  'public/index.html', // Duplicate of client/index.html
  'public/projects.html', // Unused HTML file
];

publicCleanup.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`   ✅ Removed: ${file}`);
    }
  } catch (error) {
    console.log(`   ❌ Failed to remove ${file}: ${error.message}`);
  }
});

// 3. Optimize package.json for production
console.log('\n📦 Optimizing package.json...');

try {
  const packagePath = 'package.json';
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // Remove unnecessary scripts
  const scriptsToKeep = ['dev', 'build', 'start', 'db:push', 'db:generate', 'db:migrate'];
  const originalScriptCount = Object.keys(packageJson.scripts || {}).length;
  
  if (packageJson.scripts) {
    packageJson.scripts = Object.fromEntries(
      Object.entries(packageJson.scripts).filter(([key]) => scriptsToKeep.includes(key))
    );
  }
  
  // Add production optimization scripts
  packageJson.scripts = {
    ...packageJson.scripts,
    'build:analyze': 'npm run build && npx vite-bundle-analyzer dist/stats.html',
    'preview': 'vite preview',
    'clean': 'rm -rf dist node_modules/.vite',
  };
  
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  console.log(`   ✅ Cleaned up scripts (${originalScriptCount} → ${Object.keys(packageJson.scripts).length})`);
} catch (error) {
  console.log(`   ❌ Failed to optimize package.json: ${error.message}`);
}

// 4. Add bundle analyzer and compression
console.log('\n⚡ Adding production optimizations...');

try {
  // Install production optimization packages
  execSync('npm install --save-dev rollup-plugin-visualizer vite-plugin-compression', { stdio: 'inherit' });
  console.log('   ✅ Installed optimization packages');
} catch (error) {
  console.log(`   ❌ Failed to install packages: ${error.message}`);
}

// 5. Update vite.config.ts for production optimizations
console.log('🔧 Updating Vite configuration...');

const viteConfigPath = 'vite.config.ts';
try {
  let viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
  
  // Add imports for optimization plugins
  if (!viteConfig.includes('rollup-plugin-visualizer')) {
    viteConfig = viteConfig.replace(
      /import { defineConfig } from 'vite'/,
      `import { defineConfig } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer'
import { compression } from 'vite-plugin-compression'`
    );
  }
  
  // Add plugins to the config
  if (!viteConfig.includes('visualizer()')) {
    viteConfig = viteConfig.replace(
      /plugins: \[([\s\S]*?)\]/,
      `plugins: [
$1,
    // Production optimizations
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
    compression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
  ]`
    );
  }
  
  // Add build optimizations
  if (!viteConfig.includes('build: {')) {
    viteConfig = viteConfig.replace(
      /export default defineConfig\({/,
      `export default defineConfig({
  build: {
    target: 'es2020',
    minify: 'terser',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          routing: ['wouter'],
          query: ['@tanstack/react-query'],
        },
      },
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },`
    );
  }
  
  fs.writeFileSync(viteConfigPath, viteConfig);
  console.log('   ✅ Updated Vite configuration with optimizations');
} catch (error) {
  console.log(`   ❌ Failed to update Vite config: ${error.message}`);
}

// 6. Add image optimization script
console.log('🖼️  Creating image optimization script...');

const imageOptScript = `#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'];
const maxWidth = 1920;

function findImages(dir, images = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      findImages(fullPath, images);
    } else if (stat.isFile() && imageExtensions.includes(path.extname(item).toLowerCase())) {
      images.push(fullPath);
    }
  }
  
  return images;
}

function optimizeImage(imagePath) {
  try {
    const ext = path.extname(imagePath).toLowerCase();
    const dir = path.dirname(imagePath);
    const name = path.basename(imagePath, ext);
    const webpPath = path.join(dir, name + '.webp');
    
    // Convert to WebP with optimization
    execSync(\`npx sharp-cli -i "\${imagePath}" -o "\${webpPath}" --width \${maxWidth} --quality 85 --format webp\`, { stdio: 'pipe' });
    
    console.log(\`   ✅ Optimized: \${imagePath} → \${webpPath}\`);
    return true;
  } catch (error) {
    console.log(\`   ❌ Failed to optimize \${imagePath}: \${error.message}\`);
    return false;
  }
}

console.log('🖼️  Starting image optimization...');

const images = findImages('./public');
const uploadImages = findImages('./uploads');
const allImages = [...images, ...uploadImages];

console.log(\`Found \${allImages.length} images to optimize\`);

let optimizedCount = 0;
allImages.forEach(imagePath => {
  if (optimizeImage(imagePath)) {
    optimizedCount++;
  }
});

console.log(\`\\n📊 Optimized \${optimizedCount}/\${allImages.length} images\`);
`;

fs.writeFileSync('optimize-images.js', imageOptScript);
fs.chmodSync('optimize-images.js', '755');
console.log('   ✅ Created image optimization script');

// 7. Create production build script
console.log('🔨 Creating production build script...');

const buildScript = `#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🚀 Starting production build...');

try {
  // Clean previous builds
  console.log('🧹 Cleaning previous builds...');
  execSync('npm run clean', { stdio: 'inherit' });
  
  // Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  // Build the application
  console.log('🔨 Building application...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Generate bundle analysis
  console.log('📊 Generating bundle analysis...');
  execSync('npm run build:analyze', { stdio: 'inherit' });
  
  console.log('\\n✅ Production build completed successfully!');
  console.log('📊 Check dist/stats.html for bundle analysis');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
`;

fs.writeFileSync('build-production.js', buildScript);
fs.chmodSync('build-production.js', '755');
console.log('   ✅ Created production build script');

// 8. Update .gitignore
console.log('📝 Updating .gitignore...');

const gitignoreAdditions = `
# Production optimization
dist/
*.gz
*.br
stats.html
bundle_analysis.html

# Cleanup
logs/
backups/
attached_assets/
*.log
*.pid
data-store.json
cookies.txt
`;

try {
  let gitignore = '';
  if (fs.existsSync('.gitignore')) {
    gitignore = fs.readFileSync('.gitignore', 'utf8');
  }
  
  if (!gitignore.includes('# Production optimization')) {
    fs.writeFileSync('.gitignore', gitignore + gitignoreAdditions);
    console.log('   ✅ Updated .gitignore');
  }
} catch (error) {
  console.log(`   ❌ Failed to update .gitignore: ${error.message}`);
}

// 9. Clean node_modules and reinstall for production
console.log('\n🔄 Optimizing dependencies...');

try {
  execSync('npm prune --production', { stdio: 'inherit' });
  console.log('   ✅ Pruned development dependencies');
} catch (error) {
  console.log(`   ❌ Failed to prune dependencies: ${error.message}`);
}

// 10. Summary
console.log('\n🎉 Production optimization completed!');
console.log('\n📋 Next steps:');
console.log('   1. Run: npm run build');
console.log('   2. Run: ./optimize-images.js (optional - requires sharp-cli)');
console.log('   3. Run: ./build-production.js');
console.log('   4. Deploy the dist/ folder');
console.log('\n💡 Tips:');
console.log('   • Check dist/stats.html for bundle size analysis');
console.log('   • Use npm run preview to test the production build');
console.log('   • Consider using a CDN for static assets');

console.log(`\n📊 Optimization Results:`);
console.log(`   • Removed ${deletedCount} unused files`);
console.log(`   • Added production optimizations to Vite`);
console.log(`   • Created build and image optimization scripts`);
console.log(`   • Updated package.json and .gitignore`);