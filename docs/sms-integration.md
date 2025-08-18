# SMS Integration Documentation

## Overview

The BantAI HIV platform uses SMS for:
- OTP verification during registration/login
- Risk assessment questionnaire delivery
- Test referral notifications
- ART adherence reminders
- General notifications

## Supported Providers

### 1. Twilio (International)
- Reliable global SMS delivery
- Detailed delivery reports
- Two-way SMS support
- Webhook integration for status updates

### 2. Semaphore (Philippines-focused)
- Local Philippine SMS provider
- Cost-effective for local numbers
- Simple API integration
- Bulk SMS support

## Configuration

### Environment Variables

```env
# Choose provider
SMS_PROVIDER=twilio # or semaphore

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Semaphore Configuration
SEMAPHORE_API_KEY=your_api_key
SEMAPHORE_SENDER_NAME=BANTAI

# OTP Security
OTP_SECRET=your-secure-secret-key
```

## API Endpoints

### 1. Send OTP
```
POST /api/sms/send-otp
Content-Type: application/json

{
  "phoneNumber": "09171234567",
  "purpose": "registration" // or "login", "password_reset"
}
```

### 2. Verify OTP
```
POST /api/sms/verify-otp
Content-Type: application/json

{
  "phoneNumber": "09171234567",
  "otp": "123456",
  "purpose": "registration"
}
```

## Webhook Endpoints

### Twilio
```
POST /api/webhooks/sms/twilio
```
Configure in Twilio console for delivery status updates.

### Semaphore
```
POST /api/webhooks/sms/semaphore
```
Configure in Semaphore dashboard for delivery reports and incoming SMS.

## SMS Service Usage

### Basic SMS Sending
```typescript
import { SMSService } from '@/lib/sms/sms-service'

const smsService = new SMSService()
await smsService.initialize()

const result = await smsService.sendSMS(
  '09171234567',
  'Your message here',
  userId, // optional
  'notification' // message type
)
```

### Template-based SMS
```typescript
const result = await smsService.sendTemplate(
  '09171234567',
  'RISK_ASSESSMENT_INTRO',
  { name: 'Juan', assessmentCode: 'ABC123' },
  userId
)
```

### Queue SMS for Later
```typescript
await smsService.queueSMS(
  '09171234567',
  templateId,
  new Date('2024-01-01 09:00:00'),
  { variables },
  userId
)
```

## Phone Number Format

The system accepts Philippine mobile numbers in these formats:
- `09XXXXXXXXX` (11 digits starting with 09)
- `+639XXXXXXXXX` (13 digits with country code)
- `639XXXXXXXXX` (12 digits without +)

Numbers are automatically formatted based on provider requirements:
- Twilio: `+639XXXXXXXXX` format
- Semaphore: `09XXXXXXXXX` format

## SMS Templates

Templates are stored in the `sms_templates` table with:
- Unique template code
- English and Tagalog versions
- Variable placeholders using `{{variable_name}}`
- Character count for billing

## Queue Processing

Set up a cron job to process the SMS queue:
```
GET /api/cron/sms-queue
Authorization: Bearer {CRON_SECRET}
```

Run every minute for timely delivery of scheduled messages.

## Security Considerations

1. **OTP Security**:
   - 6-digit random codes
   - 10-minute expiry
   - Maximum 3 attempts
   - SHA-256 hashed storage
   - 1-minute cooldown between requests

2. **Rate Limiting**:
   - Implement rate limiting on OTP endpoints
   - Track SMS costs per user
   - Monitor for abuse patterns

3. **Data Privacy**:
   - Comply with RA 10173 (Data Privacy Act)
   - Minimal message logging
   - Encryption for sensitive data
   - Regular data purging

## Testing

For development/testing:
- Use Twilio test credentials
- Mock SMS sending in tests
- Log messages instead of sending
- Use shorter OTP expiry times

## Monitoring

Track these metrics:
- SMS delivery rate
- Average delivery time
- Failed message count
- Cost per message
- OTP verification success rate