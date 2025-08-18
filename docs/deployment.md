# Deployment Guide

## Overview

BantAI HIV platform uses GitHub Actions for CI/CD and can be deployed to various platforms. This guide covers deployment to Vercel (recommended) and other options.

## CI/CD Pipeline

### Continuous Integration (CI)

The CI pipeline runs on every push and pull request:

1. **Linting** - Code style and quality checks
2. **Type Checking** - TypeScript validation
3. **Testing** - Unit and integration tests
4. **Security Scan** - Dependency vulnerabilities
5. **Build** - Production build verification

### Continuous Deployment (CD)

- **Staging**: Auto-deploy from `develop` branch
- **Production**: Auto-deploy from `main` branch

## Environment Variables

### Required for Production

```env
# Database (Supabase)
DATABASE_URL="postgresql://..."

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx

# SMS Provider
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+639xxx

# Security
OTP_SECRET=strong-random-secret
CRON_SECRET=another-random-secret
```

### GitHub Secrets Setup

Add these secrets in GitHub repository settings:

1. Go to Settings → Secrets → Actions
2. Add each environment variable as a secret
3. For Vercel deployment, also add:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Connect Repository**
   ```bash
   npx vercel link
   ```

2. **Configure Project**
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Environment Variables**
   - Add all production variables in Vercel dashboard
   - Set different values for Preview and Production

4. **Custom Domain**
   - Add domain in Vercel project settings
   - Update DNS records

### Option 2: Railway

1. **Create New Project**
   ```bash
   railway login
   railway init
   ```

2. **Add PostgreSQL**
   ```bash
   railway add
   # Select PostgreSQL
   ```

3. **Deploy**
   ```bash
   railway up
   ```

### Option 3: Docker

1. **Build Image**
   ```bash
   docker build -t bantai-hiv .
   ```

2. **Run Container**
   ```bash
   docker run -p 3000:3000 --env-file .env.production bantai-hiv
   ```

## Database Migrations

### Production Migrations

1. **Before Deployment**
   ```bash
   npx drizzle-kit generate
   ```

2. **During Deployment**
   - Migrations run automatically in deploy workflow
   - Or manually: `npx drizzle-kit push`

### Rollback Strategy

```bash
# Generate down migration
npx drizzle-kit generate --custom

# Apply specific migration
npx drizzle-kit push --migration-file=xxx
```

## Monitoring

### Health Checks

- Endpoint: `/api/health`
- Checks: Database, Environment, Services
- Used by: Load balancers, Monitoring tools

### Recommended Monitoring

1. **Uptime Monitoring**
   - Pingdom, UptimeRobot, or Better Uptime
   - Monitor `/api/health` every 5 minutes

2. **Error Tracking**
   - Sentry for application errors
   - LogRocket for user session replay

3. **Performance**
   - Vercel Analytics (built-in)
   - Google Analytics for user metrics

## Security Checklist

- [ ] All secrets are in environment variables
- [ ] HTTPS enabled on all endpoints
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Security headers added
- [ ] Database connection uses SSL
- [ ] Logs don't contain sensitive data

## Deployment Workflow

### Feature Development
```
feature-branch → develop → staging
```

### Production Release
```
develop → main → production
```

### Hotfix
```
hotfix-branch → main → production
                  ↓
               develop
```

## Rollback Procedure

1. **Immediate Rollback**
   - Redeploy previous version in Vercel
   - Or: `vercel rollback`

2. **Database Rollback**
   - Keep migration backups
   - Test rollback procedures

## Performance Optimization

1. **Build Optimization**
   - Enable Turbopack in development
   - Use `next/dynamic` for code splitting
   - Optimize images with `next/image`

2. **Database**
   - Connection pooling
   - Query optimization
   - Proper indexing

3. **Caching**
   - Static page generation where possible
   - API route caching
   - CDN for assets

## Troubleshooting

### Build Failures
- Check Node.js version (v20+)
- Verify all dependencies installed
- Check environment variables

### Runtime Errors
- Check logs in Vercel dashboard
- Verify database connection
- Check API keys and secrets

### Performance Issues
- Enable Vercel Analytics
- Check database query performance
- Review bundle size