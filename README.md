# Donor Connect

## Project Description

Donor Connect is a comprehensive blood donor coordination system built with modern web technologies. The application connects registered blood donors with urgent hospital blood requests, delivers real-time notifications, and provides an intuitive dashboard for tracking blood availability and request status.

This project was developed as part of the AI-Assisted Coding course (3-2 semester) and demonstrates the integration of AI tools in software development, from initial design to deployment.

## Features

- **Donor Registration & Authentication**: Secure donor registration with blood type, contact details, and donation history tracking
- **Email-Based Login**: Simple, passwordless authentication using registered email addresses
- **Interactive Dashboard**: Real-time statistics showing total donors, available donors, open requests, and critical needs
- **Blood Request Management**: Create, filter, and manage blood requests by blood type, urgency, and status
- **Smart Notification System**: Automatic matching and notification delivery for donors with matching blood types
- **Responsive Design**: Mobile-friendly interface built with modern UI components and animations
- **Type-Safe Architecture**: Full TypeScript implementation with runtime validation using Zod
- **Database Integration**: PostgreSQL with Drizzle ORM for reliable data persistence

## Tech Stack

### Frontend
- **React 18** with TypeScript for component-based UI development
- **Vite** for fast development and optimized production builds
- **Tailwind CSS** for utility-first styling and responsive design
- **Radix UI** for accessible, customizable UI components
- **Framer Motion** for smooth animations and transitions
- **React Query** for efficient data fetching and caching
- **Wouter** for lightweight client-side routing
- **Recharts** for data visualization and charts

### Backend
- **Node.js** with Express.js for RESTful API development
- **TypeScript** for type-safe server-side code
- **Zod** for schema validation and type inference
- **Drizzle ORM** for PostgreSQL database operations
- **PostgreSQL** for reliable data storage

### Development & Deployment
- **pnpm** for fast, disk-efficient package management
- **Railway** for backend API deployment
- **Vercel** for frontend hosting
- **Neon** for managed PostgreSQL database

## Installation & Setup

### Prerequisites
- Node.js 18+ and pnpm package manager
- PostgreSQL database (local or cloud-hosted)

### Quick Start

1. **Clone and Install Dependencies**:
   ```bash
   git clone <repository-url>
   cd donor-connect
   pnpm install
   ```

2. **Database Setup**:
   - Create a PostgreSQL database (local or use supabase)
   - Set `DATABASE_URL` in your `.env` file

3. **Run Database Migrations**:
   ```bash
   cd lib/db
   pnpm run push
   ```

4. **Start Development Environment**:
   ```bash
   # From project root
   pnpm run dev
   ```
   This starts both API server (port 5000) and frontend (port 3000)

### Manual Setup

**Backend (API Server)**:
```bash
cd artifacts/api-server
pnpm run dev
```

**Frontend (Donor Portal)**:
```bash
cd artifacts/blood-donor
pnpm run dev
```

## Usage

1. **Register as a Donor**: Visit the registration page and provide your details
2. **Login**: Use your registered email to access your donor profile
3. **View Dashboard**: Check statistics and recent blood requests
4. **Browse Requests**: Filter and view urgent blood needs by location and blood type
5. **Create Requests**: Submit new blood requests for patients (requires donor account)
6. **Manage Notifications**: View and respond to matching blood request alerts

## Project Structure

```
donor-connect/
├── artifacts/
│   ├── api-server/          # Express.js backend API
│   └── blood-donor/         # React frontend application
├── lib/
│   ├── api-client-react/    # Generated React API client
│   ├── api-spec/           # OpenAPI specification
│   ├── api-zod/            # Zod validation schemas
│   └── db/                 # Database schema and migrations
├── scripts/                # Utility scripts
└── submission/             # Project deliverables and documentation
```

## AI Tools Used

This project was developed using AI assistance throughout the development process:

- **Code Generation**: AI prompts generated React components, Express routes, database schemas, and validation logic
- **UI Design**: Generated responsive layouts, forms, and interactive elements
- **Documentation**: Created comprehensive README, deployment guides, and presentation materials
- **Debugging**: AI-assisted troubleshooting of API endpoints, database queries, and frontend state management
- **Architecture**: Guided the selection of technologies and project structure

## Deployment

### Backend
1. Connect your GitHub repository to Supabase
2. Set environment variables: `DATABASE_URL` and `PORT=5000`
3. Deploy the `artifacts/api-server` directory

### Frontend
1. Import the repository to Render
2. Configure build settings:
   - Root directory: `artifacts/blood-donor`
   - Build command: `pnpm run build`
   - Output directory: `dist/public`
3. Set `VITE_API_BASE_URL` to your Supabase API URL

### Database
- **Neon.tech**: Recommended for PostgreSQL hosting
- **Local Development**: Use Docker or local PostgreSQL instance

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/donor_connect

# API Server
PORT=5000

# Frontend
VITE_API_BASE_URL=http://localhost:5000
BASE_PATH=/
```

## Contributing

This project was developed as an academic assignment. For educational purposes, you may:

1. Fork the repository
2. Study the codebase and architecture
3. Run locally for learning purposes
4. Adapt concepts for your own projects

## License

This project is developed for educational purposes as part of the AI-Assisted Coding course.

## Acknowledgments

- Built with assistance from AI coding tools
- UI components inspired by modern design systems
- Database design following relational best practices
- Deployment configured for cloud platforms
