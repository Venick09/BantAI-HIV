# SMS/OTP System Documentation

## Overview
The SMS/OTP system has been updated to work in development mode without requiring real SMS credentials or a running database.

## Features

### 1. Console SMS Provider
- When Twilio/Semaphore credentials are not configured, SMS messages are logged to the console
- OTP codes are displayed in the terminal for easy testing
- All SMS functionality works without actual SMS delivery

### 2. In-Memory OTP Storage
- When the database is not available, OTPs are stored in memory
- Perfect for development and testing
- Maintains all OTP validation rules (expiry, attempts, etc.)

### 3. Graceful Degradation
- System automatically detects missing credentials/database
- Falls back to development-friendly alternatives
- No configuration changes needed

## Testing SMS/OTP

### Method 1: Registration Flow
1. Start the dev server: `npm run dev`
2. Navigate to `/register`
3. Enter a Philippine phone number (e.g., 09171234567)
4. Click "Send Verification Code"
5. Check your terminal - the OTP will be displayed there
6. Enter the OTP in the form to continue

### Method 2: Test Pages
- `/test-sms` - Test SMS sending with detailed debugging
- `/test-otp` - Test OTP flow specifically

### Method 3: API Testing
```bash
# Send OTP
curl -X POST http://localhost:3000/api/sms/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "09171234567", "purpose": "registration"}'

# Test SMS
curl -X POST http://localhost:3000/api/test-sms \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "09171234567", "message": "Test message"}'
```

## Console Output Example
When an SMS is sent, you'll see:
```
============================================================
📱 SMS MESSAGE (Development Mode)
============================================================
To: +639171234567
Message ID: console_ABC123XYZ
Sent At: 1/1/2024, 12:00:00 PM
------------------------------------------------------------
Message:
Your BantAI verification code is: 123456

This code will expire in 10 minutes.
============================================================
🔑 OTP Code: 123456
============================================================
```

## Production Setup
To use real SMS in production:

1. **Twilio Setup**:
   ```env
   SMS_PROVIDER=twilio
   TWILIO_ACCOUNT_SID=your_actual_sid
   TWILIO_AUTH_TOKEN=your_actual_token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

2. **Semaphore Setup** (Philippines):
   ```env
   SMS_PROVIDER=semaphore
   SEMAPHORE_API_KEY=your_api_key
   SEMAPHORE_SENDER_NAME=BANTAI
   ```

3. **Database**: Ensure PostgreSQL/Supabase is running

## Troubleshooting

### "SMS not sending"
- Check terminal for console output
- Verify phone number format (09XXXXXXXXX)
- Check `/test-sms` page for detailed errors

### "OTP not working"
- OTPs expire in 10 minutes
- Maximum 3 attempts per OTP
- 1-minute cooldown between requests

### "Database errors"
- System will use in-memory storage automatically
- No action needed for development