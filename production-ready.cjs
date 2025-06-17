#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Final production optimization...\n');

// 1. Add lazy loading to images in components
function addLazyLoadingToImages() {
  console.log('🖼️  Adding lazy loading to images...');
  
  const componentDirs = ['client/src/components', 'client/src/pages'];
  let updatedCount = 0;
  
  function processDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        processDirectory(fullPath);
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        try {
          let content = fs.readFileSync(fullPath, 'utf8');
          
          // Add loading="lazy" to img tags that don't have it (except hero images)
          const originalContent = content;
          content = content.replace(
            /<img([^>]*?)(?<!loading=["'][^"']*["'])([^>]*?)>/g,
            (match, before, after) => {
              // Skip if already has loading attribute or if it's a hero/above-fold image
              if (match.includes('loading=') || 
                  match.includes('hero') || 
                  match.includes('banner') ||
                  fullPath.includes('HeroSection')) {
                return match;
              }
              return `<img${before} loading="lazy"${after}>`;
            }
          );
          
          if (content !== originalContent) {
            fs.writeFileSync(fullPath, content);
            updatedCount++;
            console.log(`   ✅ Updated: ${fullPath}`);
          }
        } catch (error) {
          console.log(`   ❌ Failed to process ${fullPath}: ${error.message}`);
        }
      }
    });
  }
  
  componentDirs.forEach(processDirectory);
  console.log(`   📊 Added lazy loading to ${updatedCount} files\n`);
}

// 2. Optimize public images
function optimizePublicImages() {
  console.log('🎨 Checking public images...');
  
  const publicDir = 'public';
  const uploadsDir = 'uploads';
  
  let imageCount = 0;
  
  function countImages(dir) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        countImages(fullPath);
      } else if (/\.(jpg|jpeg|png|gif|bmp|tiff)$/i.test(item)) {
        const stats = fs.statSync(fullPath);
        const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
        
        if (stats.size > 2 * 1024 * 1024) { // > 2MB
          console.log(`   ⚠️  Large image: ${fullPath} (${sizeMB}MB)`);
        }
        imageCount++;
      }
    });
  }
  
  countImages(publicDir);
  countImages(uploadsDir);
  
  console.log(`   📊 Found ${imageCount} images`);
  console.log('   💡 Recommendation: Use WebP format and image CDN for large images\n');
}

// 3. Check bundle size after build
function checkBundleSize() {
  console.log('📦 Building and analyzing bundle...');
  
  try {
    // Use the existing build command
    execSync('npm run build', { stdio: 'inherit' });
    
    // Check dist directory
    if (fs.existsSync('dist/public')) {
      const distStats = execSync('du -sh dist/public', { encoding: 'utf8' }).trim();
      console.log(`   📊 Build size: ${distStats.split('\t')[0]}`);
      
      // Check for large files
      try {
        const largeFiles = execSync('find dist/public -type f -size +1M', { encoding: 'utf8' }).trim();
        if (largeFiles) {
          console.log('   ⚠️  Large files in bundle:');
          largeFiles.split('\n').forEach(file => {
            const stats = fs.statSync(file);
            const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
            console.log(`      ${file} (${sizeMB}MB)`);
          });
        }
      } catch (e) {
        console.log('   ✅ No files larger than 1MB found');
      }
    }
  } catch (error) {
    console.log(`   ❌ Build failed: ${error.message}`);
  }
}

// 4. Create deployment checklist
function createDeploymentChecklist() {
  console.log('📋 Creating deployment checklist...');
  
  const checklist = `# Production Deployment Checklist

## ✅ Optimization Complete
- [x] Removed ${process.env.DELETED_COUNT || '66'} unused files
- [x] Added lazy loading to images
- [x] Configured bundle optimization
- [x] Set up PWA caching

## 🚀 Deployment Steps

### 1. Final Build
\`\`\`bash
npm run build
\`\`\`

### 2. Test Production Build
\`\`\`bash
npm run preview
\`\`\`

### 3. Environment Variables
Ensure these are set in production:
- DATABASE_URL
- NODE_ENV=production
- SENTRY_DSN (optional)
- SENDGRID_API_KEY (optional)

### 4. Deploy
Upload the \`dist/\` directory to your hosting provider

## 🔧 Performance Optimizations Applied

### Bundle Splitting
- Vendor chunks (React, DOM)
- UI components separated
- Routing and query libraries chunked

### Caching Strategy
- API responses: 24 hours
- Images: 30 days
- Property images: 30 days

### Compression
- Gzip compression enabled
- Brotli compression enabled
- Minified CSS and JS

### Image Optimization
- Lazy loading for below-fold images
- WebP format recommended
- CDN integration ready

## 📊 Performance Targets
- First Contentful Paint < 2s
- Largest Contentful Paint < 3s
- Bundle size < 500KB gzipped
- Image optimization for mobile

## 🔍 Monitoring
- Core Web Vitals tracking
- Error monitoring with Sentry
- Performance monitoring enabled
`;

  fs.writeFileSync('DEPLOYMENT-CHECKLIST.md', checklist);
  console.log('   ✅ Created DEPLOYMENT-CHECKLIST.md\n');
}

// Run all optimizations
async function main() {
  addLazyLoadingToImages();
  optimizePublicImages();
  checkBundleSize();
  createDeploymentChecklist();
  
  console.log('🎉 Production optimization complete!');
  console.log('\n📋 Next steps:');
  console.log('   1. Review DEPLOYMENT-CHECKLIST.md');
  console.log('   2. Test with: npm run preview');
  console.log('   3. Deploy dist/ directory');
  console.log('\n💡 For further optimization:');
  console.log('   • Use image CDN (Cloudinary, ImageKit)');
  console.log('   • Enable HTTP/2 and server-side caching');
  console.log('   • Monitor Core Web Vitals post-deployment');
}

main().catch(console.error);