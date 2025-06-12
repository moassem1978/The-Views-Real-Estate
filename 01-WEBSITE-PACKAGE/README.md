# The Views Real Estate - Website Package

This package contains the complete real estate website with all source code, configuration files, and documentation.

## Package Contents

### Core Application
- **Frontend**: React.js with TypeScript, Tailwind CSS
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with session management

### Features Included
- Property management system (78+ properties)
- Marassi North Coast blog content
- SEO optimization system
- Image upload and processing
- Contact forms and lead generation
- Mobile-responsive design
- Admin dashboard
- User authentication
- Database migrations

### Directory Structure
```
website-package/
├── client/                 # Frontend React application
├── server/                 # Backend Express server
├── shared/                 # Shared types and schemas
├── public/                 # Static assets
├── uploads/               # File uploads directory
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── vite.config.ts         # Vite build configuration
├── drizzle.config.ts      # Database configuration
└── deployment/            # Deployment files

```

## Installation & Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn package manager

### Quick Start
1. Extract the package files
2. Install dependencies: `npm install`
3. Set up environment variables (see .env.example)
4. Configure database connection
5. Run migrations: `npm run db:push`
6. Start development server: `npm run dev`

### Environment Variables
```env
DATABASE_URL=postgresql://user:password@localhost:5432/database
PORT=5000
NODE_ENV=development
SENDGRID_API_KEY=your_sendgrid_key (optional)
SENTRY_DSN=your_sentry_dsn (optional)
```

### Deployment Options
- Replit Deployment (recommended)
- Vercel/Netlify for frontend
- Heroku/Railway for full-stack
- Self-hosted VPS

## Key Features

### Property Management
- CRUD operations for properties
- Image upload and processing
- Advanced search and filtering
- Property categorization (Primary/Resale)
- Location-based organization

### Content Management
- Blog system with Marassi content
- SEO meta tag management
- Announcements system
- Testimonials management
- Project galleries

### User System
- Secure authentication
- Role-based access (Owner/Admin/User)
- Session management
- Password hashing

### Technical Features
- TypeScript for type safety
- Responsive design with Tailwind CSS
- Image optimization and validation
- Database health monitoring
- Error logging and reporting
- Backup and restore system

## Database Schema

### Main Tables
- users (authentication and profiles)
- properties (property listings)
- announcements (site announcements)
- testimonials (client testimonials)
- seo_pages (SEO metadata)
- site_settings (configuration)

### Key Relationships
- Properties linked to users (created_by)
- Images associated with properties
- SEO data for each page type

## API Endpoints

### Properties
- GET /api/properties - List all properties
- POST /api/properties - Create new property
- PUT /api/properties/:id - Update property
- DELETE /api/properties/:id - Delete property

### Authentication
- POST /api/auth/login - User login
- POST /api/auth/logout - User logout
- GET /api/user - Get current user

### Content
- GET /api/announcements - Get announcements
- GET /api/testimonials - Get testimonials
- GET /api/site-settings - Get site configuration
- GET /api/seo/page/:page - Get SEO data

## Customization

### Branding
- Update `theme.json` for color scheme
- Replace logos in `public/uploads/logos/`
- Modify company information in site settings

### Content
- Add/edit properties through admin interface
- Update blog content in relevant components
- Customize SEO metadata per page

### Styling
- Tailwind CSS classes for responsive design
- Custom CSS in `client/src/index.css`
- Component-specific styling

## License
This package is proprietary software developed for The Views Real Estate.

## Version
1.0.0 - Complete real estate platform with all features