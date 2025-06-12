# The Views Real Estate - Project Export

## Project Overview
A cutting-edge real estate intelligence platform for the Egyptian property market, focusing on robust image management, data integrity, and secure property listing workflows.

## Technology Stack

### Frontend
- **Framework**: React.js 18.3.1 with TypeScript
- **Styling**: Tailwind CSS 3.4.14 with custom components
- **UI Components**: Radix UI primitives with custom styling
- **State Management**: TanStack Query (React Query) 5.60.5
- **Routing**: Wouter 3.3.5 (lightweight routing)
- **Forms**: React Hook Form 7.53.1 with Zod validation
- **Build Tool**: Vite 5.4.14

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js 4.21.2
- **Database**: PostgreSQL with Drizzle ORM 0.39.1
- **Authentication**: Passport.js with local strategy
- **File Upload**: Multer 1.4.5 for image handling
- **Email**: SendGrid integration
- **Monitoring**: Sentry integration

### Key Features
- Property listings with advanced filtering
- Project management with detailed specifications
- Blog system with SEO optimization
- User authentication and role management
- Image upload and management
- Contact forms and lead generation
- Responsive design for all devices

## File Structure

```
project-export/
├── frontend/           # React.js frontend application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── lib/        # Utility functions
│   │   └── types/      # TypeScript type definitions
│   ├── public/         # Static assets
│   └── index.html      # Entry HTML file
├── backend/            # Express.js backend
│   ├── server/         # Server implementation
│   └── shared/         # Shared schemas and types
├── config/             # Configuration files
└── database/           # Database migrations and backups
```

## Installation & Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn package manager

### Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create `.env` file with:
   ```
   DATABASE_URL=your_postgresql_url
   SESSION_SECRET=your_session_secret
   SENDGRID_API_KEY=your_sendgrid_key
   SENTRY_DSN=your_sentry_dsn (optional)
   ```

3. **Database Setup**
   ```bash
   npm run db:push
   ```

4. **Development Server**
   ```bash
   npm run dev
   ```

5. **Production Build**
   ```bash
   npm run build
   npm start
   ```

## Key Components

### Frontend Components
- **PropertyCard**: Displays property information with images
- **ProjectDetail**: Detailed project information pages  
- **Blog**: SEO-optimized blog system
- **Dashboard**: Admin interface for content management
- **ContactForm**: Lead generation forms

### Backend Features
- **Property Management**: CRUD operations for properties
- **Project Management**: Detailed project specifications
- **User Authentication**: Secure login system
- **Image Handling**: Upload and storage management
- **SEO Optimization**: Automated meta tags and structured data

## Database Schema
- Users table with role-based access
- Properties with comprehensive specifications
- Projects with detailed information
- Blog articles with SEO metadata
- Contact leads and testimonials

## Styling System
- Tailwind CSS utility classes
- Custom color scheme with brand colors
- Responsive design patterns
- Component variants using class-variance-authority
- Dark/light theme support

## API Endpoints

### Properties
- `GET /api/properties` - List properties with filtering
- `GET /api/properties/:id` - Get property details
- `POST /api/properties` - Create new property (admin)
- `PUT /api/properties/:id` - Update property (admin)

### Projects  
- `GET /api/projects` - List projects
- `GET /api/projects/:slug` - Get project details

### Blog
- `GET /api/articles` - List blog articles
- `GET /api/articles/:slug` - Get article content

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/user` - Get current user
- `POST /api/auth/logout` - User logout

## Deployment
The application is designed for deployment on modern hosting platforms with support for:
- Static file serving
- PostgreSQL database
- Environment variable configuration
- SSL/TLS encryption

## Contact Information
**The Views Real Estate**
- Email: Sales@theviewsrealestate.com
- Phone: +20 106 311 1136
- Business Hours: Saturday-Friday 11:00-19:00

Expert real estate consultation for Egypt and Dubai markets with 30+ years of experience.