# BantAI HIV MVP - API Endpoints

## Overview
RESTful API endpoints and Server Actions for the BantAI HIV platform.

## Authentication
- All authenticated endpoints require Clerk JWT token
- Public endpoints marked with 🌐
- Role-based access marked with required roles

## API Endpoints

### User Management

#### POST /api/auth/register 🌐
Register new user with OTP verification.
```json
Request:
{
  "phoneNumber": "+639123456789",
  "firstName": "Juan",
  "lastName": "Dela Cruz",
  "dateOfBirth": "1990-01-01",
  "gender": "male"
}

Response:
{
  "success": true,
  "message": "OTP sent to phone number",
  "userId": "uuid"
}
```

#### POST /api/auth/verify-otp 🌐
Verify OTP for phone number.
```json
Request:
{
  "phoneNumber": "+639123456789",
  "otp": "123456"
}

Response:
{
  "success": true,
  "token": "jwt-token",
  "user": { ... }
}
```

#### POST /api/users/bulk-add
Bulk add users (health_worker, admin only).
```json
Request:
{
  "users": [
    {
      "phoneNumber": "+639123456789",
      "firstName": "Juan",
      "lastName": "Dela Cruz",
      "dateOfBirth": "1990-01-01",
      "gender": "male"
    }
  ]
}

Response:
{
  "success": true,
  "created": 5,
  "failed": 0,
  "results": [ ... ]
}
```

### Risk Assessment

#### GET /api/risk-assessment/questions
Get current questionnaire.
```json
Response:
{
  "version": 1,
  "questions": [
    {
      "id": "uuid",
      "questionNumber": 1,
      "questionText": "Have you had unprotected sex in the last 6 months?",
      "questionType": "yes_no",
      "options": null
    }
  ]
}
```

#### POST /api/risk-assessment/submit
Submit risk assessment answers.
```json
Request:
{
  "userId": "uuid",
  "responses": {
    "q1": "yes",
    "q2": "no",
    "q3": "2"
  }
}

Response:
{
  "success": true,
  "assessmentId": "uuid",
  "riskScore": 65,
  "riskLevel": "moderate",
  "referralCode": "ABC123"
}
```

### SMS API

#### POST /api/sms/send
Send SMS message (internal use).
```json
Request:
{
  "phoneNumber": "+639123456789",
  "message": "Your OTP is 123456",
  "messageType": "otp"
}

Response:
{
  "success": true,
  "messageId": "uuid",
  "providerMessageId": "twilio-id"
}
```

#### POST /api/sms/webhook/receive 🌐
Webhook for incoming SMS (provider-specific).
```json
Request:
{
  "from": "+639123456789",
  "body": "1",
  "messageId": "provider-id"
}

Response:
{
  "success": true
}
```

### Referrals

#### GET /api/referrals/:code
Get referral details by code.
```json
Response:
{
  "referralCode": "ABC123",
  "status": "pending",
  "riskLevel": "high",
  "priority": true,
  "expiresAt": "2024-02-01T00:00:00Z",
  "testingCenter": {
    "name": "City Health Center",
    "address": "123 Main St",
    "contactNumber": "+639123456789"
  }
}
```

#### GET /api/referrals/nearby-centers
Get nearby testing centers.
```json
Request:
{
  "city": "Manila",
  "province": "Metro Manila"
}

Response:
{
  "centers": [
    {
      "id": "uuid",
      "name": "City Health Center",
      "address": "123 Main St",
      "distance": "2.5km",
      "availableSlots": 15
    }
  ]
}
```

### Testing Centers

#### POST /api/test-results/record
Record test result (testing_center only).
```json
Request:
{
  "referralCode": "ABC123",
  "testType": "Rapid HIV Test",
  "result": "negative",
  "notes": "Patient counseled"
}

Response:
{
  "success": true,
  "resultId": "uuid",
  "nextSteps": "Follow-up in 3 months"
}
```

#### GET /api/test-results/user/:userId
Get user's test history.
```json
Response:
{
  "results": [
    {
      "id": "uuid",
      "testDate": "2024-01-15",
      "testType": "Rapid HIV Test",
      "result": "negative",
      "testingCenter": "City Health Center"
    }
  ]
}
```

### ART Management

#### POST /api/art/start
Start ART treatment (health_worker only).
```json
Request:
{
  "userId": "uuid",
  "testResultId": "uuid",
  "startDate": "2024-01-20",
  "regimen": "TDF/3TC/EFV",
  "facilityId": "uuid"
}

Response:
{
  "success": true,
  "treatmentId": "uuid",
  "reminderSchedule": {
    "type": "daily",
    "time": "08:00"
  }
}
```

#### POST /api/art/adherence/update
Update adherence status.
```json
Request:
{
  "treatmentId": "uuid",
  "takenToday": true,
  "notes": "No side effects"
}

Response:
{
  "success": true,
  "nextReminder": "2024-01-21T08:00:00Z"
}
```

### Admin Dashboard

#### GET /api/admin/stats
Get dashboard statistics (admin only).
```json
Response:
{
  "funnel": {
    "registered": 1250,
    "assessed": 980,
    "tested": 456,
    "onART": 89,
    "suppressed": 72
  },
  "riskDistribution": {
    "low": 450,
    "moderate": 380,
    "high": 150
  },
  "monthlyTrends": [ ... ]
}
```

#### GET /api/admin/billing/ledger
Get billing ledger (admin only).
```json
Request:
{
  "period": "2024-01",
  "status": "pending"
}

Response:
{
  "period": "2024-01",
  "summary": {
    "totalPatients": 125,
    "totalAmount": 45650,
    "breakdown": {
      "questionnaires": 18750,
      "testResults": 15000,
      "artStarts": 11900
    }
  },
  "details": [ ... ]
}
```

#### GET /api/admin/billing/export
Export billing CSV (admin only).
```
Response: CSV file download
patient_id,questionnaire_date,test_date,art_date,total_amount
uuid1,2024-01-15,2024-01-18,null,350
uuid2,2024-01-16,2024-01-19,2024-01-20,850
```

### Webhooks

#### POST /api/webhooks/sms-status 🌐
SMS delivery status webhook.
```json
Request:
{
  "messageId": "provider-id",
  "status": "delivered",
  "deliveredAt": "2024-01-15T10:30:00Z"
}
```

#### POST /api/webhooks/clerk 🌐
Clerk authentication webhook.
```json
Request: Clerk webhook payload
Response: 200 OK
```

## Server Actions

### User Actions
```typescript
// actions/user.ts
createUser(data: UserInput): Promise<User>
updateUserProfile(userId: string, data: ProfileUpdate): Promise<User>
getUserById(userId: string): Promise<User>
searchUsers(query: string, filters: UserFilters): Promise<User[]>
```

### Risk Assessment Actions
```typescript
// actions/risk-assessment.ts
startAssessment(userId: string): Promise<Assessment>
submitAnswer(assessmentId: string, questionId: string, answer: string): Promise<void>
calculateRiskScore(assessmentId: string): Promise<RiskResult>
getAssessmentHistory(userId: string): Promise<Assessment[]>
```

### Referral Actions
```typescript
// actions/referral.ts
createReferral(assessmentId: string, riskLevel: string): Promise<Referral>
getReferralByCode(code: string): Promise<Referral>
updateReferralStatus(referralId: string, status: string): Promise<Referral>
getExpiringReferrals(): Promise<Referral[]>
```

### SMS Actions
```typescript
// actions/sms.ts
sendOTP(phoneNumber: string): Promise<void>
sendQuestionnaire(userId: string): Promise<void>
sendTestResult(userId: string, result: string): Promise<void>
scheduleAdherenceReminder(treatmentId: string): Promise<void>
```

### Billing Actions
```typescript
// actions/billing.ts
recordQuestionnaireDelivery(userId: string): Promise<void>
recordTestResult(userId: string): Promise<void>
recordARTStart(userId: string): Promise<void>
generateBillingReport(period: string): Promise<BillingReport>
exportBillingCSV(period: string): Promise<string>
```

## Rate Limiting

- Public endpoints: 10 requests per minute
- Authenticated endpoints: 100 requests per minute
- SMS endpoints: 1 request per second
- Bulk operations: 5 requests per minute

## Error Responses

Standard error format:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid phone number format",
    "details": {
      "field": "phoneNumber",
      "value": "123"
    }
  }
}
```

Error codes:
- `UNAUTHORIZED` - Missing or invalid authentication
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid input data
- `RATE_LIMITED` - Too many requests
- `SMS_FAILED` - SMS delivery failure
- `INTERNAL_ERROR` - Server error