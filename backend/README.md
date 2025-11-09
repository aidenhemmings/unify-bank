# Unify Bank Backend API

Enterprise-grade REST API server for Unify Bank application built with Node.js, Express, and Supabase, featuring comprehensive security measures and input validation.

## 🏗️ Technology Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Token-based with bcrypt password hashing
- **Security**: Helmet, express-rate-limit, express-validator, hpp, express-mongo-sanitize

## 📋 Prerequisites

- Node.js v18 or higher
- npm v8 or higher
- Supabase account and credentials
- SSL certificates (for HTTPS in development)

## 🚀 Installation

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file or copy from `.env.example`:

```bash
cp .env.example .env
```

Update `.env` with your configuration:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_anon_key_here

# Security Configuration
BCRYPT_ROUNDS=10

# SSL Configuration
SSL_KEY_PATH=./ssl/localhost.key
SSL_CERT_PATH=./ssl/localhost.crt
```

### 4. Generate SSL Certificates (Development Only)

```bash
cd ../ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout localhost.key -out localhost.crt
cd ../backend
```

## 🎯 Running the Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

### From Root Directory

```bash
cd ..
npm run start:backend
```

The server will start on:

- **HTTPS**: https://localhost:3000 (if SSL certificates are present)
- **HTTP**: http://localhost:3000 (fallback if no SSL certificates)

## 🔒 Security Implementation

### 1. **SSL/TLS Encryption**

- All traffic served over HTTPS
- Configurable SSL certificate paths
- Automatic fallback to HTTP if certificates not found
- HSTS headers for enforcing HTTPS

### 2. **Password Security**

#### Bcrypt Hashing

- Configurable salt rounds (default: 10)
- Automatic salt generation per password
- No plain text password storage
- Secure password comparison

```javascript
// Password hashing
const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS));

// Password verification
const isValid = await bcrypt.compare(inputPassword, hashedPassword);
```

### 3. **Input Validation & Regex Whitelisting**

All inputs are validated using strict regex patterns defined in `utils/validators.js`:

#### **Username**

```javascript
USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,20}$/
✅ Allows: Letters, numbers, underscore, hyphen
✅ Length: 3-20 characters
❌ Blocks: Special characters, spaces, SQL/script injection
```

#### **Email**

```javascript
EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
✅ Standard email format
❌ Blocks: Invalid email patterns, script injection
```

#### **Password**

```javascript
PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
✅ Minimum 8 characters
✅ Must contain: uppercase, lowercase, number, special char
✅ Allowed special chars: @$!%*?&
❌ Blocks: Weak passwords
```

#### **UUID**

```javascript
UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
✅ Standard UUID v4 format only
❌ Blocks: Invalid UUIDs, injection attempts
```

#### **Amount**

```javascript
AMOUNT_REGEX = /^\d+(\.\d{1,2})?$/
✅ Positive numbers with up to 2 decimal places
❌ Blocks: Negative values, more than 2 decimals, non-numeric
```

#### **Account Number**

```javascript
ACCOUNT_NUMBER_REGEX = /^\d{10,16}$/
✅ 10-16 digit numbers only
❌ Blocks: Letters, special characters, invalid lengths
```

#### **Name (First/Last)**

```javascript
NAME_REGEX = /^[a-zA-Z\s'-]{1,50}$/
✅ Letters, spaces, hyphens, apostrophes
✅ 1-50 characters
❌ Blocks: Numbers, special characters
```

#### **Description**

```javascript
DESCRIPTION_REGEX = /^[a-zA-Z0-9\s.,!?'-]{0,500}$/
✅ Alphanumeric + basic punctuation
✅ Max 500 characters
❌ Blocks: HTML tags, script injection, special characters
```

### 4. **Attack Protection**

#### **XSS (Cross-Site Scripting) Prevention**

```javascript
✅ Input sanitization on all endpoints
✅ Content Security Policy headers
✅ X-XSS-Protection header enabled
✅ Output encoding
✅ No eval() or innerHTML usage
```

#### **SQL/NoSQL Injection Prevention**

```javascript
✅ express-mongo-sanitize middleware
✅ Removes $ and . from user input
✅ Parameterized queries via Supabase
✅ No raw query execution
✅ Whitelist-based validation
```

#### **CSRF (Cross-Site Request Forgery) Protection**

```javascript
✅ Helmet CSRF middleware
✅ Custom headers required (X-User-Token)
✅ Origin validation
✅ SameSite cookie attributes
```

#### **DDoS Protection**

```javascript
// Login endpoint: 5 attempts per 15 minutes
loginRateLimiter: {
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts"
}

// General API: 100 requests per 15 minutes
apiRateLimiter: {
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests"
}
```

#### **HTTP Parameter Pollution (HPP) Prevention**

```javascript
✅ hpp middleware enabled
✅ Prevents duplicate parameter attacks
✅ Uses last instance of duplicate params
```

### 5. **Security Headers (Helmet)**

```javascript
{
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true
}
```

### 6. **CORS Configuration**

```javascript
cors({
  origin: ["http://localhost:4200", "https://localhost:4200"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "X-User-Token"],
  maxAge: 86400,
});
```

### 7. **Request Size Limits**

```javascript
express.json({ limit: "10kb" });
express.urlencoded({ extended: true, limit: "10kb" });
```

Prevents large payload attacks and memory exhaustion.

## 📡 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint    | Description       | Validation         |
| ------ | ----------- | ----------------- | ------------------ |
| POST   | `/login`    | Authenticate user | Username, Password |
| POST   | `/logout`   | End user session  | Token required     |
| GET    | `/validate` | Validate token    | Token required     |

### Accounts (`/api/accounts`)

| Method | Endpoint         | Description           | Validation                  |
| ------ | ---------------- | --------------------- | --------------------------- |
| GET    | `/`              | Get all user accounts | Token required              |
| GET    | `/:id`           | Get account by ID     | UUID validation             |
| GET    | `/total-balance` | Get total balance     | Token required              |
| POST   | `/`              | Create new account    | Account name, type, balance |
| PUT    | `/:id`           | Update account        | UUID, account data          |
| PATCH  | `/:id/balance`   | Update balance        | UUID, amount                |
| DELETE | `/:id`           | Delete account        | UUID (soft delete)          |

### Payments (`/api/payments`)

| Method | Endpoint             | Description          | Validation                 |
| ------ | -------------------- | -------------------- | -------------------------- |
| GET    | `/`                  | Get all payments     | Token required             |
| GET    | `/:id`               | Get payment by ID    | UUID validation            |
| GET    | `/pending`           | Get pending payments | Token required             |
| GET    | `/status/:status`    | Filter by status     | Status enum                |
| POST   | `/`                  | Create payment       | Account, amount, recipient |
| POST   | `/:id/process`       | Process payment      | UUID                       |
| POST   | `/process-scheduled` | Process scheduled    | Admin only                 |
| PUT    | `/:id`               | Update payment       | UUID, payment data         |
| PATCH  | `/:id/cancel`        | Cancel payment       | UUID                       |

### Transactions (`/api/transactions`)

| Method | Endpoint              | Description          | Validation                   |
| ------ | --------------------- | -------------------- | ---------------------------- |
| GET    | `/`                   | Get all transactions | Token required               |
| GET    | `/:id`                | Get by ID            | UUID validation              |
| GET    | `/account/:accountId` | Filter by account    | UUID validation              |
| GET    | `/category/:category` | Filter by category   | Category enum                |
| GET    | `/stats/:year/:month` | Monthly stats        | Year/month numbers           |
| POST   | `/`                   | Create transaction   | Account, amount, description |
| PUT    | `/:id`                | Update transaction   | UUID, transaction data       |
| DELETE | `/:id`                | Delete transaction   | UUID                         |

### Users (`/api/users`)

| Method | Endpoint                     | Description      | Validation             |
| ------ | ---------------------------- | ---------------- | ---------------------- |
| GET    | `/profile`                   | Get user profile | Token required         |
| PUT    | `/profile`                   | Update profile   | Name, email validation |
| POST   | `/change-password`           | Change password  | Current + new password |
| GET    | `/settings`                  | Get settings     | Token required         |
| PUT    | `/settings`                  | Update settings  | Settings object        |
| PATCH  | `/settings/toggle-dark-mode` | Toggle dark mode | Token required         |

## 🔐 Authentication

All endpoints except login require authentication via token.

### Include Token in Requests

**Header (Recommended):**

```
X-User-Token: your-token-here
```

**Alternative Header:**

```
Authorization: Bearer your-token-here
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── supabase.js           # Database configuration
│   ├── controllers/
│   │   ├── auth.controller.js    # Authentication logic
│   │   ├── accounts.controller.js
│   │   ├── payments.controller.js
│   │   ├── transactions.controller.js
│   │   └── users.controller.js
│   ├── middleware/
│   │   └── security.middleware.js # Security headers, rate limiting
│   ├── routes/
│   │   ├── auth.routes.js        # + validation chains
│   │   ├── accounts.routes.js    # + validation chains
│   │   ├── payments.routes.js    # + validation chains
│   │   ├── transactions.routes.js # + validation chains
│   │   └── users.routes.js       # + validation chains
│   ├── utils/
│   │   ├── validators.js          # Regex patterns & validators
│   │   └── password-validators.js # Password change validation
│   └── index.js                   # Express app setup
├── .env                           # Environment variables
├── .env.example                   # Example configuration
└── package.json
```

## 🛡️ Security Best Practices

| Practice            | Implementation                      | Status |
| ------------------- | ----------------------------------- | ------ |
| HTTPS/TLS           | SSL certificates, HSTS headers      | ✅     |
| Password Hashing    | Bcrypt with salt (10 rounds)        | ✅     |
| Input Validation    | Regex whitelisting                  | ✅     |
| XSS Prevention      | CSP headers, sanitization           | ✅     |
| SQL Injection       | Parameterized queries, sanitization | ✅     |
| CSRF Protection     | Custom headers, origin check        | ✅     |
| Rate Limiting       | Per-endpoint limits                 | ✅     |
| HPP Prevention      | hpp middleware                      | ✅     |
| Security Headers    | Helmet middleware                   | ✅     |
| Request Size Limits | 10kb max payload                    | ✅     |
| Error Handling      | No sensitive data exposure          | ✅     |

## 🔧 Development

### Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_KEY`: Supabase anonymous key
- `BCRYPT_ROUNDS`: Password hashing rounds (default: 10)
- `SSL_KEY_PATH`: Path to SSL private key
- `SSL_CERT_PATH`: Path to SSL certificate

### Health Check

```bash
curl https://localhost:3000/health
```

Response:

```json
{
  "status": "ok",
  "timestamp": "2025-11-09T12:00:00.000Z"
}
```

## 📝 Error Responses

All errors follow a consistent format:

```json
{
  "error": "Error message",
  "message": "Detailed message (development only)"
}
```

### Common HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `429`: Too Many Requests (rate limit)
- `500`: Internal Server Error

## 📚 Additional Resources

- [Main Project README](../README.md)
- [Security Implementation Guide](../SECURITY_IMPLEMENTATION.md)
- [Deployment Guide](../RUNNING_SECURED_APP.md)

## 📞 Support

For security vulnerabilities, please contact the security team immediately.
For other issues, contact the development team.

## 📄 License

This project is private and confidential.
