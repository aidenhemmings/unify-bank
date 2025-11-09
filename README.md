# UnifyBank

A modern banking application with a secure three-tier architecture.

## Architecture

- **Frontend**: Angular 19.2.5 (Port 4200)
- **Backend**: Node.js/Express REST API (Port 3000)
- **Database**: Supabase (PostgreSQL)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm
- Angular CLI (`npm install -g @angular/cli`)

### Installation

1. **Install Frontend Dependencies**:

```bash
npm install
```

2. **Install Backend Dependencies**:

```bash
cd backend
npm install
```

3. **Configure Environment**:
   The backend `.env` file is already configured with Supabase credentials. If you need to update them:

```bash
cd backend
# Edit .env file with your Supabase URL and Key
```

### Running the Application

You need to run both the backend and frontend servers:

**Terminal 1 - Backend API Server:**

```bash
cd backend
npm run dev
```

Backend will run on `http://localhost:3000`

**Terminal 2 - Frontend Development Server:**

```bash
npm start
```

Frontend will run on `https://localhost:4200`

Open your browser and navigate to https://localhost:4200/

## Features

- User authentication with secure token-based sessions
- User profile view and inline editing (reactive forms)
- Dashboard layout with reusable components
- Route guards for protected pages
- Account management (create, view, update, delete)
- Payment processing and scheduling
- Transaction history and analytics
- Fund transfers between accounts
- Monthly income/expense statistics
- Dark/Light theme toggle
- Shared UI components (buttons, inputs, modals, etc.)

## Tech Stack

### Frontend

- **Framework**: Angular 19.2.5
- **Component Library**: PrimeNG
- **HTTP Client**: Angular HttpClient
- **State Management**: RxJS BehaviorSubjects
- **Forms**: Reactive Forms

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database Client**: @supabase/supabase-js
- **Authentication**: bcryptjs + custom token management
- **CORS**: Configured for Angular frontend

### Database

- **Provider**: Supabase
- **Type**: PostgreSQL
- **Features**: Row Level Security (RLS), Stored Procedures

## Project Structure

```
unify-bank/
├── src/                          # Angular frontend
│   ├── app/
│   │   ├── common/
│   │   │   ├── services/        # API services
│   │   │   ├── guards/          # Route guards
│   │   │   ├── ui/              # Shared components
│   │   │   └── types/           # TypeScript interfaces
│   │   └── modules/             # Feature modules
│   └── environment/             # Environment config
│
├── backend/                      # Express backend
│   ├── src/
│   │   ├── config/              # Configuration
│   │   ├── middleware/          # Auth middleware
│   │   ├── controllers/         # Business logic
│   │   ├── routes/              # API routes
│   │   └── index.js             # Server entry point
│   ├── .env                     # Environment variables
│   └── package.json
│
├── SETUP_GUIDE.md               # Detailed setup instructions
├── MIGRATION_SUMMARY.md         # Architecture migration details
└── README.md                    # This file
```
