# Unify Bank Backend API

Backend API server for Unify Bank application built with Node.js, Express, and Supabase.

## Setup

1. Install dependencies:

```bash
cd backend
npm install
```

2. Create `.env` file from `.env.example`:

```bash
cp .env.example .env
```

3. Update `.env` with your Supabase credentials:

```
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
NODE_ENV=development
```

## Running the Server

Development mode with auto-reload:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/validate` - Validate token

### Accounts

- `GET /api/accounts` - Get all user accounts
- `GET /api/accounts/:id` - Get account by ID
- `GET /api/accounts/total-balance` - Get total balance
- `POST /api/accounts` - Create new account
- `PUT /api/accounts/:id` - Update account
- `PATCH /api/accounts/:id/balance` - Update account balance
- `DELETE /api/accounts/:id` - Delete account (soft delete)

### Payments

- `GET /api/payments` - Get all user payments
- `GET /api/payments/:id` - Get payment by ID
- `GET /api/payments/pending` - Get pending payments
- `GET /api/payments/status/:status` - Get payments by status
- `POST /api/payments` - Create new payment
- `POST /api/payments/:id/process` - Process payment
- `POST /api/payments/process-scheduled` - Process scheduled payments
- `PUT /api/payments/:id` - Update payment
- `PATCH /api/payments/:id/cancel` - Cancel payment

### Transactions

- `GET /api/transactions` - Get all user transactions
- `GET /api/transactions/:id` - Get transaction by ID
- `GET /api/transactions/account/:accountId` - Get transactions by account
- `GET /api/transactions/category/:category` - Get transactions by category
- `GET /api/transactions/stats/:year/:month` - Get monthly statistics
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Users

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/settings` - Get user settings
- `PUT /api/users/settings` - Update user settings
- `PATCH /api/users/settings/toggle-dark-mode` - Toggle dark mode

## Authentication

All endpoints except `/api/auth/login` and `/api/auth/validate` require authentication.

Include the token in requests using either:

- Header: `Authorization: Bearer <token>`
- Header: `X-User-Token: <token>`
