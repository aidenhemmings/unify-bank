# Unify Bank - Banking Application

## Team Members

| Name | Student Number | Role |
|------|----------------|------|
| Aiden Hemmings | ST10144348 | Frontend + Backend Development, Database Design |
| Tristan Stavast | ST10144323 | Frontend Development, DevOps Architecture + CI/CD Architecture |
| Alexi Giagas | ST10085311 | Frontend Development, Documentation |

### YouTube Walkthrough Link: https://youtu.be/x9Hir9yHhaE&nbsp;

## Project Overview

This project involves developing a comprehensive, secure banking application with separate portals for regular users and administrators. The application was built to demonstrate enterprise-level security practices, authentication mechanisms, and role-based access control in a banking context.

The system consists of:
- **Frontend**: Angular-based single-page application with dual portals (User & Admin)
- **Backend**: Node.js/Express RESTful API with secure authentication
- **Database**: Supabase (PostgreSQL) for data persistence
- **Deployment**: Docker containerization for consistent development and production environments

The application simulates core banking operations including user authentication, account management, payment processing, transaction tracking, and administrative user management with proper security controls throughout.

## 🏗️ Architecture

- **Frontend**: Angular 19.2.5 (Port 4200)
- **Backend**: Node.js/Express REST API (Port 3000)
- **Database**: Supabase (PostgreSQL)
- **Security**: SSL/TLS, CSRF Protection, Rate Limiting, Input Validation

## Features

### Backend API Features

#### Authentication & Authorization
- **User Authentication**: Secure login/logout with token-based authentication
- **Admin Authentication**: Separate admin portal with role-based access control
- **Token Management**: UUID-based session tokens with validation endpoints
- **Password Security**: bcrypt hashing with configurable salt rounds

#### User Management
- **Profile Management**: View and update user information
- **Password Management**: Secure password change with validation
- **User Settings**: Customizable preferences including dark mode toggle
- **Account Status**: Active/inactive user management

#### Account Management
- **Multiple Accounts**: Support for multiple accounts per user (Checking, Savings, Credit)
- **Account Types**: Differentiation between account categories
- **Balance Tracking**: Real-time account balance updates
- **Account Creation**: Dynamic account creation with validation

#### Payment Processing
- **Payment Creation**: Initiate payments between accounts
- **Payment Types**: Support for various payment categories (Utilities, Transfer, Bill Payment, etc.)
- **Payment Validation**: Amount and account number validation
- **Payment History**: Retrieve user payment history

#### Transaction Management
- **Transaction Tracking**: Complete transaction history for all accounts
- **Transaction Types**: Deposits, Withdrawals, Transfers, Payments
- **Transaction Filtering**: Query transactions by account, type, and date
- **Balance Updates**: Automatic balance adjustments on transactions

#### Admin Portal Features
- **User Management**: View, search, and manage all system users
- **User Invitations**: Generate and send user invitations with tokens
- **Invitation Management**: Track and resend invitations
- **Admin Dashboard**: Statistics and system overview
- **Admin Profile**: Manage admin account settings

### User Portal Features

#### Dashboard
- **Account Overview**: Visual display of all user accounts with balances
- **Recent Transactions**: Quick view of latest account activity
- **Quick Actions**: Fast access to common operations (Send Money, Pay Bills, etc.)
- **Financial Summary**: Total balance across all accounts

#### Accounts Module
- **Account List**: View all accounts with detailed information
- **Account Details**: Comprehensive view of individual account data
- **Account Creation**: Create new accounts with different types
- **Transaction History**: Per-account transaction listing

#### Payments Module
- **Payment Form**: Create new payments with validation
- **Recipient Management**: Save and select frequent recipients
- **Payment Categories**: Organize payments by type
- **Payment Confirmation**: Review before submission
- **Payment History**: Track all sent payments

#### Transactions Module
- **Transaction List**: Paginated view of all transactions
- **Filtering**: Filter by account, date range, and transaction type
- **Search**: Find specific transactions
- **Export**: Download transaction history (XLSX format)
- **Details View**: Comprehensive transaction information

### Admin Portal Features

#### Admin Dashboard
- **System Statistics**: User counts, transaction volumes
- **Recent Activity**: Latest system events
- **User Analytics**: User growth and activity metrics

#### User Management
- **User List**: Comprehensive view of all system users
- **User Search**: Find users by name, email, or username
- **User Details**: View complete user information
- **Status Management**: Activate/deactivate user accounts
- **Role Assignment**: Assign admin privileges

#### Invitation Management
- **Create Invitations**: Generate invitation links for new users
- **Invitation List**: Track all sent invitations
- **Resend Invitations**: Regenerate expired invitation tokens
- **Invitation Validation**: Verify invitation token validity
- **Accept Invitation**: New admin onboarding flow

## Security Overview

This application implements comprehensive security measures to protect against common web vulnerabilities and attacks:

### 1. SQL/NoSQL Injection Protection
- **Input Sanitization**: All user inputs are sanitized using `express-mongo-sanitize`
- **Parameterized Queries**: Supabase client uses prepared statements
- **Validation**: Strict regex patterns for all input fields (usernames, emails, amounts, etc.)
- **Character Filtering**: Removal of dangerous characters (`<`, `>`, SQL operators)

### 2. Cross-Site Scripting (XSS) Prevention
- **Security Headers**: Helmet.js implementation with Content Security Policy
- **Input Sanitization**: Custom sanitization functions removing HTML tags
- **Output Encoding**: Angular's built-in XSS protection via template sanitization
- **CSP Directives**: Restricted script sources to `'self'` only

### 3. Cross-Site Request Forgery (CSRF) Protection
- **Token-Based Authentication**: Custom token validation instead of cookie-based sessions
- **CORS Configuration**: Strict origin whitelisting (`localhost:4200` only)
- **Custom Headers**: `X-User-Token` and `X-Admin-Token` headers prevent CSRF
- **SameSite Cookies**: When cookies are used, configured with secure flags

### 4. Brute Force Attack Prevention
- **Rate Limiting**: Login attempts limited to 5 per 15 minutes
- **API Rate Limiting**: General API requests limited to 100 per 15 minutes
- **Account Lockout**: Failed login attempts tracked (can be extended)
- **Token Expiration**: Session tokens can be configured to expire

### 5. Authentication & Authorization
- **Password Hashing**: bcrypt with configurable salt rounds (default: 10)
- **Password Complexity**: Enforced requirements (min 8 chars, uppercase, lowercase, number, special character)
- **Token-Based Sessions**: UUID tokens stored securely in database
- **Role-Based Access Control**: Separate admin and user authentication paths
- **Token Validation**: Middleware validates tokens on every protected route

### 6. HTTP Parameter Pollution (HPP) Protection
- **HPP Middleware**: `hpp` package prevents duplicate parameters
- **Array Parameter Protection**: Whitelisting of allowed array parameters
- **Parameter Validation**: Strict validation of all request parameters

### 7. Man-in-the-Middle (MITM) Attack Prevention
- **HTTPS/TLS**: SSL certificate support for encrypted communication
- **HSTS Headers**: HTTP Strict Transport Security with 1-year max age
- **Secure Flag**: Cookies (when used) marked as secure
- **Certificate Validation**: Proper SSL/TLS certificate handling

### 8. Clickjacking Prevention
- **X-Frame-Options**: Set to `DENY` via Helmet.js
- **Frame Guards**: Prevents application from being embedded in iframes
- **CSP Frame Ancestors**: Additional frame embedding protection

### 11. Session Management
- **Token Invalidation**: Logout properly invalidates tokens
- **Token Validation**: Every request validates token against database
- **Session Expiry**: Tokens can be configured with expiration times
- **Secure Storage**: Tokens stored in localStorage with proper scoping

### 12. Input Validation
- **Express Validator**: Comprehensive validation on all input fields
- **Regex Patterns**: Strict patterns for usernames, emails, amounts, account numbers
- **Length Limits**: Maximum input lengths enforced (max 1000 chars)
- **Type Checking**: Validation of data types (strings, numbers, UUIDs)
- **Whitelist Validation**: Only expected fields are processed

### 13. CORS Security
- **Origin Whitelisting**: Only `https://localhost:4200` allowed
- **Credentials Support**: Controlled with `credentials: true`
- **Method Restriction**: Only necessary HTTP methods allowed
- **Header Control**: Specific headers whitelisted for cross-origin requests
- **Preflight Caching**: CORS preflight requests cached for 24 hours

### 14. Security Headers (via Helmet.js)
- **X-Content-Type-Options**: `nosniff` prevents MIME type sniffing
- **X-XSS-Protection**: Legacy XSS filter enabled
- **Referrer-Policy**: Controlled referrer information leakage
- **Permissions-Policy**: Restricted browser features
- **Content-Security-Policy**: Prevents unauthorized resource loading

### 15. Denial of Service (DoS) Prevention
- **Request Size Limits**: JSON and URL-encoded payloads limited to 10kb
- **Rate Limiting**: Multiple layers of rate limiting (login, API)
- **Timeout Configuration**: Request timeouts prevent hanging connections
- **Resource Limits**: Database query limits prevent excessive resource usage

### 16. Database Security
- **Row Level Security**: Supabase RLS policies (configurable)
- **Least Privilege**: Database users have minimal required permissions
- **Connection Pooling**: Managed connections prevent exhaustion
- **Query Parameterization**: Prevents SQL injection via Supabase client

### 17. Frontend Security
- **Route Guards**: Authentication guards on all protected routes
- **Token Storage**: Secure localStorage usage with proper scoping
- **Auto Logout**: Token validation on route changes
- **Permission-Based UI**: UI elements hidden based on user permissions
- **Input Validation**: Client-side validation before API calls

### 18. Admin Security
- **Separate Authentication**: Distinct admin token prefix (`admin_`)
- **Role Verification**: Backend validates admin role on every request
- **Admin-Only Routes**: Separate route protection for admin endpoints
- **Account Status Checks**: Inactive admins cannot access system
- **Invitation System**: Controlled admin onboarding process

## 📋 Prerequisites

- Node.js (v20 or higher)
- npm (v8 or higher)
- Docker & Docker Compose (for containerized deployment, optional)

## 🚀 Installation

### 1. Install Dependencies

**Root directory (Frontend):**
```bash
npm install
```

**Backend directory:**
```bash
cd backend
npm install
cd ..
```

## 🎯 Running the Application

### Docker Deployment (Recommended)

**Build and start containers:**

```bash
npm run docker
```

Or manually:
```bash
docker compose up --build
```

**Manage Docker containers:**
- Start (detached): `npm run docker:start`
- Kill Docker (Remove Volumes): `docker compose down -v`
- Kill Docker (Dont Remove Volumes): `docker compose down`
- Remove Images: `docker rmi unify-bank-frontend unify-bank-backend`

## 🌐 Access the Application

- **User Portal**: https://localhost:4200
- **Admin Portal**: https://localhost:4200/admin/login
- **Backend API**: https://localhost:3000

**Note**: You may need to accept the self-signed SSL certificate in your browser for development.

### Local Development (Not Recommended)

**Run both servers concurrently**

```bash
npm start
```

This starts both frontend (port 4200) and backend (port 3000) simultaneously.

**Run servers separately:**

Terminal 1 - Backend:
```bash
npm run start:backend
```

Terminal 2 - Frontend:
```bash
npm run start:frontend
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Angular 19.2.5
- **UI Library**: PrimeNG
- **Icons**: FontAwesome
- **HTTP Client**: Angular HttpClient
- **Routing**: Angular Router
- **State Management**: RxJS Observables
- **Permissions**: ngx-permissions
- **File Export**: xlsx

### Backend
- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: bcryptjs, crypto
- **Security**: Helmet, express-rate-limit, hpp, express-mongo-sanitize
- **Validation**: express-validator
- **CORS**: cors
- **Environment**: dotenv

### DevOps
- **Containerization**: Docker & Docker Compose
- **Process Management**: concurrently, nodemon
- **SSL/TLS**: HTTPS with self-signed certificates
- **Pipelines**: CircleCi with SonarQube

### Login Credentials

#### Employee
- **User One**: 
    - Username: testuser
    - Password: Testpass123!
- **User Two**:
    - Username: tristanstavast
    - Password: testpass123

#### Admin User
- **Admin User One**
    - Username: aidenhemmings
    - Password: testpass123
