# UnifyBank

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.5.

## Development server

## Getting started

Prerequisites:
- Node.js
- npm
- Angular (npm install -g @angular/cli)

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run start
```

Open https://localhost:4200/ in your browser.

## Features
- User authentication (username/password backed by Supabase table).
- User Profile view and inline editing (reactive forms).
- Dashboard layout with reusable components and guards to protect routes.
- Small set of shared UI components (buttons, inputs, profile card) and pipes for form handling.
- Transfering of funds between 2 accounts.
- Viewing past transactions (sending and recieving).

## Tech stack
- Framework: Angular 19.2.5
- Component Library: PrimeNG
- Database + Auth: Supabase + Supabase Auth
