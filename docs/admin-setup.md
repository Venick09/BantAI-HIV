# Admin Access Setup Guide

This guide explains how to set up admin access for specific email addresses in the BantAI HIV Platform.

## Overview

The system allows you to grant admin access to specific email addresses. When a user with one of these email addresses logs in, they can promote themselves to admin role.

## Setup Steps

### 1. Configure Admin Email Addresses

Edit the file `/lib/admin-emails.ts` and add your admin email addresses:

```typescript
export const ADMIN_EMAILS = [
  'your-email@example.com',  // Replace with your actual email
  'admin@company.com',       // Add more as needed
]
```

### 2. Set Up Clerk Webhook (Optional but Recommended)

To automatically promote users to admin when they sign up or update their email:

1. Go to your Clerk Dashboard
2. Navigate to **Webhooks** section
3. Create a new webhook endpoint:
   - URL: `https://your-domain.com/api/webhooks/clerk`
   - Events: Select `user.created` and `user.updated`
4. Copy the webhook secret
5. Add it to your `.env.local`:
   ```
   CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret
   ```

### 3. Manual Admin Promotion

If you don't set up the webhook, users can still become admins by:

1. Logging in with their authorized email
2. Navigating to `/dashboard/admin-access`
3. Clicking "Check Admin Eligibility"
4. If their email is in the admin list, they'll be promoted

## How It Works

1. **Email-Based Authorization**: Only emails listed in `/lib/admin-emails.ts` can become admins
2. **Automatic Promotion**: With webhook setup, users are promoted automatically on sign-up/update
3. **Manual Promotion**: Users can check their eligibility at `/dashboard/admin-access`
4. **Role Persistence**: Once promoted, the admin role is stored in the database

## Security Notes

- The admin email list is hardcoded for security
- Only authenticated users can attempt promotion
- The promotion endpoint validates the user's email against the whitelist
- Admin status is checked on every admin route access

## Accessing Admin Panel

Once a user has admin role, they can access:
- `/admin` - Main admin dashboard
- `/admin/users` - User management
- `/admin/analytics` - Platform analytics
- `/admin/sms-logs` - SMS history
- And other admin features

## Troubleshooting

1. **"Your email is not authorized for admin access"**
   - Ensure your email is added to `/lib/admin-emails.ts`
   - Email comparison is case-insensitive

2. **Webhook not working**
   - Verify the webhook secret is correct
   - Check webhook logs in Clerk dashboard
   - Ensure the endpoint URL is publicly accessible

3. **Already promoted but can't access admin**
   - Clear browser cache
   - Sign out and sign back in
   - Check the database to verify role is set to 'admin'