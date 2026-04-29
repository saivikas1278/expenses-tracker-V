# Expenses Tracker V

A full-stack expense tracking application built with React, Express, and Supabase.

## Features
- User Authentication (Signup/Login)
- Dashboard with Balance, Income, and Expense tracking
- Transaction history with charts
- Real-time data storage via Supabase

## Local Development

1. Install dependencies:
   ```bash
   npm run install-all
   ```

2. Set up environment variables in both `client/.env` and `server/.env`.

3. Run both client and server:
   ```bash
   npm run dev
   ```

## Deployment (Render)

This project is configured for a unified deployment on Render.

1. **New Web Service**: Connect your GitHub repository.
2. **Build Command**: `npm run render-postbuild`
3. **Start Command**: `npm start`
4. **Environment Variables**:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `JWT_SECRET`
   - (Optional) `PORT` (defaults to 5000)

The server will build the React frontend and serve it automatically.
