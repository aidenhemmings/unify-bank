# UnifyBank

A modern, secure banking application built with Angular and Node.js featuring enterprise-grade security measures.

## 🏗️ Architecture

- **Frontend**: Angular 19.2.5 (Port 4200)
- **Backend**: Node.js/Express REST API (Port 3000 - HTTPS)
- **Database**: Supabase (PostgreSQL)
- **Security**: SSL/TLS, CSRF Protection, Rate Limiting, Input Validation

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)
- Angular CLI

## 🚀 Installation

### 1. Install Angular CLI Globally

```bash
npm install -g @angular/cli
```

### 2. Install Root Dependencies

```bash
npm install
```

### 3. Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### 4. Configure Environment

The backend uses environment variables for configuration. A `.env` file should exist in the `backend` directory with your Supabase credentials.

**Example `.env` structure:**

```env
PORT=3000
NODE_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
BCRYPT_ROUNDS=10
SSL_KEY_PATH=./ssl/localhost.key
SSL_CERT_PATH=./ssl/localhost.crt
```

### 5. Generate SSL Certificates (Optional for Development)

For HTTPS support in development:

```bash
cd ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout localhost.key -out localhost.crt
```

## 🎯 Running the Application

### Option 1: Run Both Servers Simultaneously (Recommended)

```bash
npm start
```

This will start both the frontend and backend servers concurrently.

### Option 2: Run Servers Separately

**Terminal 1 - Backend API:**

```bash
npm run start:backend
# or
cd backend
npm run dev
```

**Terminal 2 - Frontend:**

```bash
npm run start:frontend
# or
ng serve
```

## 🌐 Access the Application

- **Frontend**: https://localhost:4200
- **Backend API**: https://localhost:3000
- **Health Check**: https://localhost:3000/health

**Note**: You may need to accept the self-signed SSL certificate in your browser for development.

## 🔒 Security Features

### 1. **SSL/TLS Encryption**

- All traffic served over HTTPS in development and production
- Self-signed certificates for development
- Configurable SSL certificate paths via environment variables

### 2. **Attack Protection**

#### **CSRF Protection**

- Implemented via Helmet's CSRF middleware
- Custom headers required for state-changing operations
- Origin validation for all requests

#### **XSS Prevention**

- Content Security Policy (CSP) headers
- X-XSS-Protection enabled
- Input sanitization on all endpoints
- Output encoding for rendered content

#### **SQL/NoSQL Injection Protection**

- `express-mongo-sanitize` middleware removes prohibited characters
- Parameterized queries via Supabase client
- No raw query execution
- Whitelist-based input validation

#### **DDoS Protection**

- Rate limiting on all API endpoints
- Stricter rate limits on authentication routes (5 attempts per 15 minutes)
- General API rate limit: 100 requests per 15 minutes per IP

#### **HTTP Parameter Pollution (HPP)**

- `hpp` middleware prevents parameter pollution attacks
- Only last instance of duplicate parameters is used

### 3. **Input Validation & Whitelisting**

All inputs are validated using regex patterns and express-validator:

#### **Username Validation**

```javascript
Pattern: /^[a-zA-Z0-9_-]{3,20}$/
- 3-20 characters
- Alphanumeric, underscores, and hyphens only
```

#### **Email Validation**

```javascript
Pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
- Standard email format
- No special characters except allowed in email specification
```

#### **Password Requirements**

```javascript
Pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)
```

#### **UUID Validation**

```javascript
Pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
- Standard UUID v4 format
```

#### **Amount Validation**

```javascript
Pattern: /^\d+(\.\d{1,2})?$/
- Positive numbers only
- Up to 2 decimal places
- No negative values
```

#### **Account Number Validation**

```javascript
Pattern: /^\d{10,16}$/
- 10-16 digits only
- Numeric characters only
```

#### **Name Validation**

```javascript
Pattern: /^[a-zA-Z\s'-]{1,50}$/
- Letters, spaces, hyphens, and apostrophes only
- 1-50 characters
- No special characters or numbers
```

#### **Description Validation**

```javascript
Pattern: /^[a-zA-Z0-9\s.,!?'-]{0,500}$/
- Alphanumeric and basic punctuation
- Maximum 500 characters
- No HTML or script tags
```

### 4. **Password Security**

- **Hashing**: bcrypt with configurable rounds (default: 10)
- **Salting**: Automatic per-password unique salts
- **No Plain Text Storage**: Passwords never stored in plain text
- **Password Change Validation**: Requires current password verification
- **Frontend Validation**: Real-time password strength indicator
- **Server-Side Validation**: Double validation on backend

### 5. **Security Headers (Helmet)**

```javascript
- X-DNS-Prefetch-Control
- X-Frame-Options: DENY
- Strict-Transport-Security (HSTS)
- X-Download-Options: noopen
- X-Content-Type-Options: nosniff
- X-Permitted-Cross-Domain-Policies: none
- Referrer-Policy: no-referrer
- Content-Security-Policy (CSP)
```

### 6. **CORS Configuration**

```javascript
- Allowed Origins: localhost:4200 (HTTP & HTTPS)
- Credentials: Enabled
- Methods: GET, POST, PUT, PATCH, DELETE
- Headers: Content-Type, Authorization, X-User-Token
- Max Age: 24 hours
```

### 7. **Request Size Limits**

- JSON payload limit: 10kb
- URL-encoded payload limit: 10kb
- Prevents large payload attacks

## 📁 Project Structure

```
unify-bank/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Business logic
│   │   ├── routes/           # API endpoints with validation
│   │   ├── middleware/       # Security & validation middleware
│   │   ├── utils/            # Validators & helpers
│   │   ├── config/           # Database configuration
│   │   └── index.js          # Express server setup
│   ├── .env                  # Environment variables
│   └── package.json
├── src/
│   ├── app/
│   │   ├── common/
│   │   │   ├── guards/       # Route guards
│   │   │   ├── services/     # API services
│   │   │   ├── validators/   # Frontend validators
│   │   │   └── ui/           # Reusable components
│   │   └── modules/          # Feature modules
│   └── environment/          # Environment config
├── ssl/                      # SSL certificates
└── package.json
```

## 🛡️ Security Best Practices Implemented

1. ✅ **Defense in Depth**: Multiple layers of security
2. ✅ **Principle of Least Privilege**: Minimal permissions
3. ✅ **Input Validation**: Both client and server-side
4. ✅ **Secure Communication**: HTTPS/TLS encryption
5. ✅ **Password Security**: Bcrypt hashing with salt
6. ✅ **Rate Limiting**: Protection against brute force
7. ✅ **Error Handling**: No sensitive data in error messages
8. ✅ **Security Headers**: Comprehensive header protection
9. ✅ **Regular Expression Whitelisting**: Strict input patterns
10. ✅ **Session Management**: Secure token-based authentication

## 📚 Additional Documentation

- [Backend API Documentation](./backend/README.md)
- [Security Implementation Details](./SECURITY_IMPLEMENTATION.md)
- [Running Secured Application Guide](./RUNNING_SECURED_APP.md)

## 🔧 Development

### Build for Production

```bash
npm run build
```

### Run Tests

```bash
npm test
```

## 📝 License

This project is private and confidential.

## 👥 Support

For issues or questions, please contact the development team.

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
