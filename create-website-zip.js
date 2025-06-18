
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

async function createWebsiteZip() {
  console.log('📦 Creating website zip file...');
  
  const output = fs.createWriteStream('the-views-website-complete.zip');
  const archive = archiver('zip', {
    zlib: { level: 9 } // Maximum compression
  });

  output.on('close', function() {
    console.log(`✅ Website zip created successfully!`);
    console.log(`📁 File size: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
    console.log(`📂 Location: ./the-views-website-complete.zip`);
  });

  archive.on('error', function(err) {
    console.error('❌ Error creating zip:', err);
    throw err;
  });

  archive.pipe(output);

  // Include all important directories and files
  const includePatterns = [
    'client/**/*',
    'server/**/*',
    'public/**/*',
    'shared/**/*',
    'package.json',
    'package-lock.json',
    'tsconfig.json',
    'tailwind.config.ts',
    'postcss.config.js',
    'vite.config.ts',
    'drizzle.config.ts',
    'theme.json',
    'index.html',
    '.replit',
    'replit.nix',
    '*.md'
  ];

  // Exclude patterns
  const excludePatterns = [
    'node_modules/**',
    '.git/**',
    'dist/**',
    'logs/**',
    'uploads/**',
    'attached_assets/**',
    'backups/**',
    '.config/**',
    '*.log',
    '*.tmp',
    '.DS_Store',
    'Thumbs.db'
  ];

  // Add files with filtering
  try {
    // Add the main directories
    archive.directory('client/', 'client/');
    archive.directory('server/', 'server/');
    archive.directory('public/', 'public/');
    archive.directory('shared/', 'shared/');
    
    // Add configuration files
    const configFiles = [
      'package.json',
      'package-lock.json',
      'tsconfig.json',
      'tailwind.config.ts',
      'postcss.config.js',
      'vite.config.ts',
      'drizzle.config.ts',
      'theme.json',
      'index.html',
      '.replit',
      'replit.nix'
    ];

    configFiles.forEach(file => {
      if (fs.existsSync(file)) {
        archive.file(file, { name: file });
      }
    });

    // Add documentation files
    const docFiles = fs.readdirSync('.').filter(file => file.endsWith('.md'));
    docFiles.forEach(file => {
      archive.file(file, { name: file });
    });

    // Add a README for the zip contents
    const readmeContent = `# The Views Real Estate Website - Complete Code

This zip file contains the complete source code for The Views Real Estate website.

## Structure:
- \`client/\` - React frontend application
- \`server/\` - Express.js backend server
- \`public/\` - Static assets and files
- \`shared/\` - Shared types and schemas
- Configuration files (package.json, tsconfig.json, etc.)

## To run the project:
1. Extract this zip file
2. Run \`npm install\` to install dependencies
3. Set up your environment variables
4. Run \`npm run dev\` to start the development server

## Key Features:
- React + TypeScript frontend
- Express.js + PostgreSQL backend
- Image upload and management
- SEO optimization
- Real estate property listings
- Project management
- User authentication
- Mobile responsive design

Generated on: ${new Date().toISOString()}
`;

    archive.append(readmeContent, { name: 'README-WEBSITE.md' });

    console.log('📁 Adding files to zip...');
    await archive.finalize();
    
  } catch (error) {
    console.error('❌ Error creating zip file:', error);
  }
}

// Run the script
createWebsiteZip().catch(console.error);
