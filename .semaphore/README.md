# Semaphore CI/CD Configuration

This directory contains the CI/CD pipeline configuration for Semaphore.

## Setup Instructions

1. **Connect Repository to Semaphore**
   - Go to [Semaphore](https://semaphoreci.com)
   - Click "New Project" and connect your GitHub repository
   - Semaphore will automatically detect the `.semaphore/semaphore.yml` file

2. **Configure Secrets**

   Create the following secrets in Semaphore UI under Project Settings > Secrets:

   ### `test-env` Secret
   ```bash
   DATABASE_URL=your_test_database_url
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_public_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   ```

   ### `build-env` Secret
   ```bash
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_public_key
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
   ```

   ### `database-env` Secret
   ```bash
   DATABASE_URL=your_production_database_url
   ```

   ### `vercel-production` Secret
   ```bash
   VERCEL_TOKEN=your_vercel_token
   VERCEL_ORG_ID=your_vercel_org_id
   VERCEL_PROJECT_ID=your_vercel_project_id
   ```

   ### `production-env` Secret
   ```bash
   DATABASE_URL=your_production_database_url
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_production_clerk_public_key
   CLERK_SECRET_KEY=your_production_clerk_secret_key
   ```

   ### `vercel-staging` Secret
   ```bash
   VERCEL_TOKEN=your_vercel_token
   VERCEL_ORG_ID=your_vercel_org_id
   VERCEL_PROJECT_ID=your_vercel_project_id
   ```

   ### `staging-env` Secret
   ```bash
   DATABASE_URL=your_staging_database_url
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_staging_clerk_public_key
   CLERK_SECRET_KEY=your_staging_clerk_secret_key
   ```

3. **Cache Configuration**
   
   Semaphore automatically caches `node_modules` based on the cache commands in the pipeline.

4. **Branch Protection**
   
   Configure branch protection rules in GitHub:
   - Require status checks to pass before merging
   - Require branches to be up to date before merging
   - Include administrators

## Pipeline Overview

### Main Pipeline (`semaphore.yml`)
1. **Install Dependencies** - Installs npm packages with caching
2. **Code Quality** - Runs linting, type checking, and format checking in parallel
3. **Tests** - Runs unit and E2E tests in parallel
4. **Build** - Creates production build
5. **Database Migrations** - Runs database migrations

### Deployment Pipelines
- **Production** (`deploy-production.yml`) - Triggered on main branch
- **Staging** (`deploy-staging.yml`) - Triggered on develop branch

## Adding New Secrets

To add new environment variables:

1. Go to Semaphore UI > Project Settings > Secrets
2. Click "New Secret"
3. Add your environment variables
4. Reference the secret in your pipeline:
   ```yaml
   task:
     secrets:
       - name: your-secret-name
   ```

## Customization

### Adding Test Scripts

Add these scripts to your `package.json` if they don't exist:

```json
{
  "scripts": {
    "test:smoke": "echo 'Add smoke tests here'",
    "test:integration": "echo 'Add integration tests here'"
  }
}
```

### Notifications

To add Slack notifications, update the notification job:

```yaml
- name: Notify Team
  commands:
    - curl -X POST -H 'Content-type: application/json' \
      --data '{"text":"Deployment successful!"}' \
      $SLACK_WEBHOOK_URL
```

## Troubleshooting

1. **Build Failures**
   - Check that all environment variables are set
   - Verify Node.js version matches your local environment
   - Check build logs for specific errors

2. **Test Failures**
   - Ensure test database is properly configured
   - Check that all test dependencies are installed
   - Review test logs for specific failures

3. **Deployment Issues**
   - Verify Vercel tokens are correct
   - Check that project IDs match your Vercel project
   - Ensure deployment environment variables are set in Vercel

## Support

For Semaphore-specific issues, consult:
- [Semaphore Documentation](https://docs.semaphoreci.com)
- [Semaphore Community](https://community.semaphoreci.com)