const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

async function createWebsiteZip() {
  console.log('🚀 Creating complete website zip file...');

  const output = fs.createWriteStream('complete-website-code.zip');
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', function() {
    console.log(`✅ Website zip created successfully: ${archive.pointer()} total bytes`);
    console.log('📦 File: complete-website-code.zip');
    console.log('\n📁 Contents:');
    console.log('   ├── client/ (React frontend)');
    console.log('   ├── server/ (Express backend)');
    console.log('   ├── shared/ (Database schema)');
    console.log('   ├── public/ (Static assets)');
    console.log('   ├── package.json');
    console.log('   ├── README.md');
    console.log('   └── deployment files');
  });

  archive.on('error', function(err) {
    console.error('❌ Error creating zip:', err);
  });

  archive.pipe(output);

  // Key directories to include
  const directories = [
    'client',
    'server', 
    'shared',
    'public',
    'uploads'
  ];

  // Important root files
  const rootFiles = [
    'package.json',
    'package-lock.json',
    'tsconfig.json',
    'tailwind.config.ts',
    'postcss.config.js',
    'vite.config.ts',
    'drizzle.config.ts',
    'theme.json',
    'index.html',
    '.env.production',
    'UPDATED-WEBSITE-CODE-SUMMARY.md',
    'COMPLETE-IMPLEMENTATION-CODE.md'
  ];

  // Add directories
  for (const dir of directories) {
    if (fs.existsSync(dir)) {
      console.log(`📂 Adding directory: ${dir}/`);
      archive.directory(dir, dir);
    }
  }

  // Add root files
  for (const file of rootFiles) {
    if (fs.existsSync(file)) {
      console.log(`📄 Adding file: ${file}`);
      archive.file(file, { name: file });
    }
  }

  // Create a comprehensive README
  const readmeContent = `# The Views Real Estate - Complete Website Code

## Overview
Complete real estate platform with enhanced property submission, comprehensive SEO, and advanced features.

## Features Implemented
- ✅ Enhanced Property Form with automatic down payment calculations
- ✅ Image upload/deletion with preview functionality  
- ✅ Proper location and unit type dropdowns
- ✅ Highlight/Featured property toggles
- ✅ Comprehensive form validation
- ✅ SEO optimization (Arabic/English)
- ✅ Responsive design with amber brand colors
- ✅ User authentication and role management
- ✅ Database integration with PostgreSQL
- ✅ Production-ready deployment configuration

## Quick Start

### 1. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Environment Setup
Copy \`.env.production\` to \`.env\` and configure your database URL:
\`\`\`
DATABASE_URL=your_postgresql_connection_string
\`\`\`

### 3. Database Setup
\`\`\`bash
npm run db:push
\`\`\`

### 4. Start Development Server
\`\`\`bash
npm run dev
\`\`\`

### 5. Access Application
- Frontend: http://localhost:5000
- Login with username: 'owner', password: 'admin123'

## Project Structure
\`\`\`
├── client/          # React frontend
├── server/          # Express backend  
├── shared/          # Database schema
├── public/          # Static assets
├── uploads/         # File uploads
└── docs/           # Documentation
\`\`\`

## Key Components

### Enhanced Property Form
- Automatic financial calculations
- Image management with preview
- Conditional fields based on property type
- Form validation and error handling

### SEO Optimization  
- Multilingual meta tags
- Structured data for search engines
- Social media optimization

### Authentication
- Secure login system
- Role-based access control
- Session management

## Deployment
The application is production-ready with:
- Optimized build configuration
- Environment variable management
- Database migrations
- Image processing

## Support
For technical support, contact: Sales@theviewsrealestate.com

---
Generated on: ${new Date().toISOString()}
Version: Production-Ready v1.0
`;

  archive.append(readmeContent, { name: 'README.md' });

  // Create deployment guide
  const deploymentGuide = `# Deployment Guide

## Production Deployment Steps

### 1. Server Requirements
- Node.js 18+ 
- PostgreSQL 14+
- 2GB+ RAM
- 10GB+ storage

### 2. Environment Variables
\`\`\`
DATABASE_URL=postgresql://user:password@host:port/database
NODE_ENV=production
PORT=5000
SESSION_SECRET=your-secure-session-secret
\`\`\`

### 3. Build and Deploy
\`\`\`bash
# Install dependencies
npm install

# Build production assets  
npm run build

# Start production server
npm start
\`\`\`

### 4. Database Migration
\`\`\`bash
npm run db:push
\`\`\`

### 5. Create Admin User
Login with default credentials and change password immediately.

## Hosting Platforms
- ✅ Replit (recommended)
- ✅ Vercel
- ✅ Railway
- ✅ DigitalOcean
- ✅ AWS/Google Cloud

## Domain Configuration
Update environment variables with your domain:
- Update SEO meta tags
- Configure CORS settings
- Set up SSL certificates

## Monitoring
- Built-in error logging
- Performance monitoring
- Database connection health checks
`;

  archive.append(deploymentGuide, { name: 'DEPLOYMENT.md' });

  // Finalize the archive
  await archive.finalize();
}

// Run the zip creation
createWebsiteZip().catch(console.error);