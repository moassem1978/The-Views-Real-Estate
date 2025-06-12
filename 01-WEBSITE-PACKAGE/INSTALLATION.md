# Installation Guide

## System Requirements
- Node.js 18 or higher
- PostgreSQL 12 or higher
- At least 2GB RAM
- 5GB disk space

## Step-by-Step Installation

### 1. Extract Files
Extract the website-package.zip to your desired directory:
```bash
unzip website-package.zip
cd website-package
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup
Create a PostgreSQL database:
```sql
CREATE DATABASE theviews_realestate;
CREATE USER theviews_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE theviews_realestate TO theviews_user;
```

### 4. Environment Configuration
Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
DATABASE_URL=postgresql://theviews_user:secure_password@localhost:5432/theviews_realestate
PORT=5000
NODE_ENV=production
ADMIN_EMAIL=admin@yoursite.com
ADMIN_PASSWORD=your_secure_password
```

### 5. Database Migration
Push the schema to your database:
```bash
npm run db:push
```

### 6. Start the Application
For development:
```bash
npm run dev
```

For production:
```bash
npm run build
npm start
```

### 7. Access the Application
Open your browser and navigate to:
- Development: http://localhost:5000
- Production: Your domain or server IP

### 8. Initial Setup
1. Navigate to `/login`
2. Use the admin credentials from your .env file
3. Access the admin dashboard to add properties and content

## Deployment Options

### Option A: Replit (Recommended)
1. Upload files to Replit
2. Install dependencies automatically
3. Configure environment variables
4. Deploy with one click

### Option B: Traditional Hosting
1. Upload files to your server
2. Install Node.js and PostgreSQL
3. Follow steps 2-6 above
4. Configure reverse proxy (nginx/Apache)
5. Set up SSL certificate

### Option C: Cloud Platforms
- Vercel: Frontend deployment
- Railway: Full-stack deployment
- Heroku: Full-stack deployment
- DigitalOcean App Platform

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure user has proper permissions

### Port Already in Use
- Change PORT in .env file
- Kill existing processes: `pkill -f node`

### Permission Errors
- Check file permissions: `chmod -R 755 uploads/`
- Ensure write access to uploads directory

### Build Errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version`

## Support
For technical support, refer to the README.md file or contact the development team.