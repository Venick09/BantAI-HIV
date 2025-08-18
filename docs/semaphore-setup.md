# Semaphore SMS Setup Guide

This guide will help you set up Semaphore SMS for the BantAI HIV platform.

## Prerequisites

1. Create a Semaphore account at https://semaphore.co
2. Load credits to your account (PHP rates apply)
3. Get your API key from the dashboard

## Environment Variables

Add these to your `.env.local` file:

```bash
# SMS Configuration
SMS_PROVIDER=semaphore

# Semaphore Configuration
SEMAPHORE_API_KEY=your_actual_api_key_here
SEMAPHORE_SENDER_NAME=BANTAI
SEMAPHORE_ENDPOINT=https://api.semaphore.co/api/v4
```

## Important Notes

1. **Sender Name**: Limited to 11 characters. We use "BANTAI" as default.
2. **Phone Format**: The system automatically handles Philippine number formats:
   - Accepts: 09XXXXXXXXX, 639XXXXXXXXX, 9XXXXXXXXX
   - Converts all to 09XXXXXXXXX format for Semaphore

3. **API Limits**: 
   - Default rate limit: 60 requests per minute
   - Max message length: 918 characters (6 SMS segments)

## Testing Your Setup

1. Update your `.env.local` with your Semaphore API key
2. Restart your development server
3. Test OTP sending through:
   - Registration flow: `/register`
   - OTP test page: `/otp-test`

## Production Deployment

For Vercel deployment, add these environment variables:
- `SMS_PROVIDER` = `semaphore`
- `SEMAPHORE_API_KEY` = Your API key
- `SEMAPHORE_SENDER_NAME` = `BANTAI`
- `SEMAPHORE_ENDPOINT` = `https://api.semaphore.co/api/v4`

## Monitoring

1. Check SMS delivery status in Semaphore dashboard
2. Monitor failed messages in the application logs
3. Track SMS usage to manage costs

## Cost Estimation

- Local SMS: ₱0.50 per SMS (as of 2024)
- International SMS: Varies by country
- OTP typically uses 1 SMS segment

## Troubleshooting

### Common Issues:

1. **"Invalid API Key"**: Check your API key in `.env.local`
2. **"Invalid number"**: Ensure phone numbers are Philippine mobile numbers
3. **"Insufficient balance"**: Top up your Semaphore account

### Debug Mode

Enable debug logging by setting:
```bash
SMS_DEBUG=true
```

This will log all SMS attempts to the console (development only).

## Support

- Semaphore Docs: https://semaphore.co/docs
- API Reference: https://semaphore.co/docs/api
- Support: support@semaphore.co