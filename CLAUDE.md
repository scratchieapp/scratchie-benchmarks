# Scratchie Manufacturing Quality Benchmark Dashboard

## Project Overview

The Scratchie Manufacturing Quality Benchmark Dashboard is a comprehensive multi-tenant manufacturing quality management system designed to track, analyze, and improve production quality metrics across manufacturing operations. The platform provides real-time insights into key performance indicators (KPIs), quality trends, and ROI calculations to help manufacturers optimize their operations.

The dashboard features a sophisticated two-tier access system, allowing different levels of data visibility and functionality based on user authentication level, making it suitable for both detailed operational analysis and executive-level reporting.

## Authentication System

The application implements a two-tier password-based authentication system with distinct access levels:

### Full Dashboard Access
- **Password**: `sync2025`
- **Features**: Complete access to all dashboard functionality
- **Tabs Available**: Dashboard, Performance, Targets, ROI & Benchmarking, Data Entry
- **Capabilities**: Full data entry, editing, analysis, and reporting features

### Simple Dashboard Access
- **Password**: `simple2025`
- **Features**: Streamlined view with essential metrics only
- **Interface**: Single page view focused on key KPIs
- **Capabilities**: Read-only access to critical performance indicators

## Dashboard Features

### Full Dashboard
The complete dashboard provides comprehensive manufacturing quality management capabilities:

1. **Dashboard Tab**: Overview of key metrics, trends, and alerts
2. **Performance Tab**: Detailed performance analytics and historical trends
3. **Targets Tab**: Goal setting, target management, and progress tracking
4. **ROI & Benchmarking Tab**: Return on investment calculations and industry benchmarking
5. **Data Entry Tab**: Input forms for quality data, production metrics, and incidents

### Simple Dashboard
The simplified interface focuses on essential information:

- Key KPIs display
- Critical alerts and notifications
- High-level performance summaries
- Single-page layout for quick insights

## Key Technologies

The project is built using modern web technologies for optimal performance and maintainability:

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript for type safety and better development experience
- **Styling**: Tailwind CSS for responsive and utility-first styling
- **Charts & Visualization**: Recharts for interactive data visualization
- **Database**: Supabase for real-time database and authentication
- **UI Components**: Custom components with Tailwind CSS
- **State Management**: React hooks and context for application state

## Database Architecture

### Supabase Multi-Tenant Setup
The application uses Supabase as its backend database with a multi-tenant architecture:

- **Real-time capabilities**: Live data updates across all connected clients
- **Row Level Security (RLS)**: Tenant isolation and data security
- **PostgreSQL**: Robust relational database with advanced querying capabilities
- **API Integration**: Automatic REST and GraphQL APIs
- **Authentication**: Built-in user management (extended with custom password system)

### Key Database Tables
- Manufacturing quality metrics
- Performance indicators
- Target definitions and tracking
- ROI calculations and benchmarks
- User access logs and audit trails

## Key Calculations

### Scratchie Index
A proprietary quality metric that aggregates multiple quality indicators into a single, actionable score:
- Combines defect rates, production efficiency, and quality control metrics
- Weighted scoring system based on impact and criticality
- Trend analysis for continuous improvement tracking

### ROI Calculations
Comprehensive return on investment analysis including:
- Cost savings from quality improvements
- Productivity gains measurement
- Investment tracking and payback periods
- Comparative analysis against industry benchmarks

### Baseline Comparisons
- Historical performance comparisons
- Industry standard benchmarking
- Target vs. actual performance analysis
- Variance reporting and trend identification

## Development Commands

### Development Server
```bash
npm run dev
```
Starts the development server on `http://localhost:3000` with hot reload enabled.

### Production Build
```bash
npm run build
```
Creates an optimized production build with static generation and performance optimizations.

### Additional Commands
```bash
npm run start    # Start production server
npm run lint     # Run ESLint for code quality
npm run type-check # TypeScript type checking
```

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application Configuration
NEXT_PUBLIC_APP_ENV=development
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Dashboard Access Passwords (for reference)
FULL_ACCESS_PASSWORD=sync2024
SIMPLE_ACCESS_PASSWORD=simple2024

# Optional: Analytics and Monitoring
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

### Required Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key for client-side operations
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for server-side operations
- `NEXTAUTH_SECRET`: Secret key for NextAuth.js sessions

## Deployment

### Vercel Deployment
The application is optimized for deployment on Vercel:

1. **Automatic Deployments**: Connected to Git repository for continuous deployment
2. **Environment Variables**: Configure all required environment variables in Vercel dashboard
3. **Build Optimization**: Next.js 14 optimizations for faster builds and smaller bundles
4. **Edge Functions**: Utilizing Vercel's edge network for optimal performance
5. **Static Generation**: Pre-rendered pages for improved loading speeds

### Deployment Steps
1. Connect your repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Set up Supabase project and configure database
4. Deploy and test both authentication tiers

### Performance Optimizations
- Static site generation where possible
- Image optimization with Next.js Image component
- Code splitting and lazy loading
- Efficient bundle analysis and optimization

## Project Structure

```
/
├── app/                 # Next.js 14 App Router
├── components/          # Reusable UI components
├── lib/                # Utilities and database connections
├── public/             # Static assets
├── types/              # TypeScript type definitions
├── hooks/              # Custom React hooks
└── utils/              # Helper functions and calculations
```

## Development Guidelines

- Follow TypeScript strict mode for type safety
- Use Tailwind CSS classes for consistent styling
- Implement proper error handling and loading states
- Maintain responsive design for all screen sizes
- Follow Next.js 14 best practices and App Router conventions
- Ensure proper data validation and sanitization
- Implement comprehensive testing for key calculations

## Support and Maintenance

For development support and maintenance:
- Monitor Supabase dashboard for database performance
- Review Vercel analytics for application performance
- Regularly update dependencies for security patches
- Backup database and configuration settings
- Monitor authentication logs for security issues