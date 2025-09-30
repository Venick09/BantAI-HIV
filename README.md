# BantAI HIV Platform

A comprehensive SMS-based HIV management platform for the Philippines, enabling remote patient care, medication adherence monitoring, and health worker coordination.

## 🚀 Tech Stack

- **Frontend**: [Next.js 15](https://nextjs.org/), [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/)
- **Backend**: [PostgreSQL](https://www.postgresql.org/), [Drizzle ORM](https://orm.drizzle.team/), [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- **Authentication**: [Clerk](https://clerk.com/) + Custom Phone-based OTP
- **SMS Integration**: [Semaphore](https://semaphore.co/) (Philippines SMS provider)
- **Deployment**: [Vercel](https://vercel.com/) / Docker

## 🔒 Security Improvements Implemented

1. **Fixed OTP Schema Mismatch** - Added missing `verified` and `verifiedAt` fields
2. **Removed Hardcoded JWT Secret** - Now uses environment variables
3. **Added API Rate Limiting** - Protection against brute force attacks
4. **Implemented Zod Validation** - Type-safe input validation across all endpoints
5. **Added Database Indexes** - Improved query performance
6. **Comprehensive Error Handling** - Consistent error responses

## 📋 Prerequisites

- Node.js 20+
- PostgreSQL 16+ or Supabase account
- Clerk account for authentication
- Semaphore account for SMS (Philippines)

## 🛠️ Setup Instructions

### 1. Clone and Install

```bash
git clone <repository>
cd BantAI-HIV
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env.local` and configure:

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bantai_hiv"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# SMS Provider (Semaphore)
SMS_PROVIDER=semaphore
SEMAPHORE_API_KEY=your_api_key
SEMAPHORE_SENDER_NAME=BantAI

# Security Keys (Generate secure random strings)
JWT_SECRET=<generate-secure-random-string>
OTP_SECRET=<generate-secure-random-string>
```

### 3. Database Setup

```bash
# Run migrations
npx drizzle-kit push

# Apply additional migrations
psql $DATABASE_URL < db/migrations/0003_fix_otp_schema.sql
psql $DATABASE_URL < db/migrations/0004_add_indexes.sql

# Seed database (optional)
npx bun db/seed
```

### 4. Development

```bash
# Start development server
npm run dev

# Run type checking
npm run types

# Run linting
npm run lint

# Run tests
npm run test
```

## 🐳 Docker Deployment

### Development with Docker

```bash
# Start all services (PostgreSQL, Redis, MailHog)
docker-compose -f docker-compose.dev.yml up -d

# Build and run the app
docker-compose up --build
```

### Production Deployment

```bash
# Build production image
docker build -t bantai-hiv .

# Run with docker-compose
docker-compose up -d
```

## 📱 Key Features

- **SMS-based Registration & Authentication**
- **OTP Verification System**
- **Patient Management Dashboard**
- **Risk Assessment Tracking**
- **ART (Antiretroviral Therapy) Management**
- **Referral System**
- **SMS Templates in English/Tagalog**
- **Comprehensive Audit Logging**

## 🔑 API Security

All API endpoints include:
- Rate limiting (configurable per endpoint)
- Input validation with Zod schemas
- JWT authentication for protected routes
- Comprehensive error handling
- Request/Response logging

### Rate Limits

- Authentication: 5 attempts per 15 minutes
- OTP requests: 3 per hour
- General API: 60 requests per minute

## 📊 Database Schema

Key tables:
- `users` - User accounts with phone-based auth
- `otpVerifications` - OTP tracking with expiry
- `smsLogs` - Complete SMS history
- `riskAssessments` - Patient risk evaluations
- `artManagement` - Medication tracking
- `referrals` - Patient referral system

## 🧪 Testing

```bash
# Unit tests
npm run test:unit

# E2E tests
npm run test:e2e

# All tests
npm run test
```

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run types` - TypeScript type checking
- `npm run format:write` - Format with Prettier
- `npm run clean` - Lint fix + format
- `npx drizzle-kit push` - Apply schema changes
- `npx drizzle-kit generate` - Generate migrations

## 🚨 Security Considerations

1. **Environment Variables**: Never commit `.env.local`
2. **API Keys**: Use different keys for development/production
3. **Database**: Enable SSL in production
4. **Rate Limiting**: Adjust limits based on usage patterns
5. **Monitoring**: Set up error tracking (Sentry recommended)

## 🤝 Contributing

1. Create a feature branch
2. Run tests and linting before committing
3. Follow the existing code style
4. Update documentation as needed

## 📄 License

This project is proprietary and confidential.

---

For issues or questions, please contact the development team.