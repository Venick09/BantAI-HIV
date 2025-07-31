# BantAI HIV MVP - Database Schema

## Overview
PostgreSQL database schema using Drizzle ORM for the BantAI HIV platform.

## Core Tables

### 1. Users
Stores all system users including patients, health workers, and admins.

```sql
users {
  id: uuid (PK)
  clerk_id: varchar(255) (unique, nullable) -- For authenticated users
  phone_number: varchar(20) (unique, not null)
  phone_verified: boolean (default false)
  first_name: varchar(100)
  last_name: varchar(100)
  date_of_birth: date
  gender: enum('male', 'female', 'other')
  role: enum('patient', 'health_worker', 'testing_center', 'admin')
  organization_id: uuid (FK to organizations, nullable)
  created_at: timestamp
  updated_at: timestamp
  created_by: uuid (FK to users, nullable) -- For bulk registration
}
```

### 2. Organizations
Testing centers and health facilities.

```sql
organizations {
  id: uuid (PK)
  name: varchar(255)
  type: enum('testing_center', 'health_facility', 'lgu')
  address: text
  city: varchar(100)
  province: varchar(100)
  contact_number: varchar(20)
  is_active: boolean (default true)
  created_at: timestamp
  updated_at: timestamp
}
```

### 3. Risk Assessments
Tracks questionnaire responses and risk scores.

```sql
risk_assessments {
  id: uuid (PK)
  user_id: uuid (FK to users)
  questionnaire_version: integer (default 1)
  responses: jsonb -- Store all answers
  risk_score: integer
  risk_level: enum('low', 'moderate', 'high')
  completed_at: timestamp
  sms_sent_at: timestamp
  sms_delivered_at: timestamp
  created_at: timestamp
}
```

### 4. Risk Assessment Questions
Configurable questionnaire items.

```sql
risk_questions {
  id: uuid (PK)
  version: integer
  question_number: integer
  question_text: text
  question_type: enum('yes_no', 'multiple_choice', 'numeric')
  options: jsonb (nullable) -- For multiple choice
  weight: integer -- For scoring
  is_active: boolean (default true)
  created_at: timestamp
}
```

### 5. Referrals
Tracks testing referrals and their status.

```sql
referrals {
  id: uuid (PK)
  referral_code: varchar(10) (unique) -- Human-readable code
  user_id: uuid (FK to users)
  risk_assessment_id: uuid (FK to risk_assessments)
  risk_level: enum('low', 'moderate', 'high')
  referred_to: uuid (FK to organizations, nullable)
  status: enum('pending', 'scheduled', 'tested', 'expired')
  priority: boolean (default false) -- For high-risk cases
  expires_at: timestamp
  tested_at: timestamp (nullable)
  created_at: timestamp
  updated_at: timestamp
}
```

### 6. Test Results
HIV test results linked to referrals.

```sql
test_results {
  id: uuid (PK)
  referral_id: uuid (FK to referrals)
  user_id: uuid (FK to users)
  testing_center_id: uuid (FK to organizations)
  test_type: varchar(100)
  result: enum('positive', 'negative', 'indeterminate')
  tested_by: uuid (FK to users) -- Health worker
  notes: text (nullable)
  created_at: timestamp
  updated_at: timestamp
}
```

### 7. ART Treatment
Antiretroviral therapy tracking.

```sql
art_treatments {
  id: uuid (PK)
  user_id: uuid (FK to users)
  test_result_id: uuid (FK to test_results)
  start_date: date
  facility_id: uuid (FK to organizations)
  regimen: varchar(255)
  status: enum('active', 'discontinued', 'transferred', 'lost_to_followup')
  viral_load_suppressed: boolean (nullable)
  last_viral_load_date: date (nullable)
  created_at: timestamp
  updated_at: timestamp
}
```

### 8. SMS Messages
All SMS communications tracking.

```sql
sms_messages {
  id: uuid (PK)
  user_id: uuid (FK to users)
  phone_number: varchar(20)
  message_type: enum('otp', 'questionnaire', 'result', 'reminder', 'notification')
  message_content: text
  status: enum('pending', 'sent', 'delivered', 'failed')
  provider_message_id: varchar(255) (nullable)
  sent_at: timestamp (nullable)
  delivered_at: timestamp (nullable)
  error_message: text (nullable)
  created_at: timestamp
}
```

### 9. Adherence Reminders
ART adherence SMS scheduling.

```sql
adherence_reminders {
  id: uuid (PK)
  art_treatment_id: uuid (FK to art_treatments)
  user_id: uuid (FK to users)
  schedule_type: enum('daily', 'weekly', 'monthly')
  send_time: time
  days_of_week: integer[] (nullable) -- For weekly
  day_of_month: integer (nullable) -- For monthly
  is_active: boolean (default true)
  last_sent_at: timestamp (nullable)
  created_at: timestamp
  updated_at: timestamp
}
```

### 10. Billing Ledger
Government billing records.

```sql
billing_ledger {
  id: uuid (PK)
  user_id: uuid (FK to users)
  billing_period: varchar(7) -- YYYY-MM format
  questionnaire_delivered: boolean (default false)
  questionnaire_delivered_at: timestamp (nullable)
  test_result_logged: boolean (default false)
  test_result_logged_at: timestamp (nullable)
  art_started: boolean (default false)
  art_started_at: timestamp (nullable)
  total_amount: decimal(10,2)
  status: enum('pending', 'billed', 'paid')
  created_at: timestamp
  updated_at: timestamp
}
```

### 11. Audit Logs
Compliance and security tracking.

```sql
audit_logs {
  id: uuid (PK)
  user_id: uuid (FK to users, nullable)
  action: varchar(255)
  entity_type: varchar(100)
  entity_id: uuid
  old_values: jsonb (nullable)
  new_values: jsonb (nullable)
  ip_address: inet
  user_agent: text
  created_at: timestamp
}
```

### 12. System Settings
Application configuration.

```sql
system_settings {
  id: uuid (PK)
  key: varchar(255) (unique)
  value: jsonb
  description: text
  updated_by: uuid (FK to users)
  updated_at: timestamp
}
```

## Indexes

```sql
-- Performance indexes
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_referrals_code ON referrals(referral_code);
CREATE INDEX idx_referrals_user ON referrals(user_id);
CREATE INDEX idx_test_results_user ON test_results(user_id);
CREATE INDEX idx_art_treatments_user ON art_treatments(user_id);
CREATE INDEX idx_sms_messages_user ON sms_messages(user_id);
CREATE INDEX idx_billing_ledger_user_period ON billing_ledger(user_id, billing_period);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
```

## Data Privacy Considerations

1. **Encryption**: All PII fields should be encrypted at rest
2. **Access Control**: Row-level security based on user roles
3. **Audit Trail**: All data access and modifications logged
4. **Data Retention**: Implement policies per RA 11166 requirements
5. **Anonymization**: Support for statistical reporting without PII

## Billing Rules

Per patient charges:
- ₱150 - When questionnaire is delivered (one-time)
- ₱200 - When test result is logged (one-time)
- ₱500 - When positive case starts ART (one-time)
- Maximum ₱850 per patient lifetime

## Notes

1. All timestamps are stored in UTC
2. Phone numbers include country code
3. Soft deletes implemented via status fields
4. JSONB used for flexible data storage
5. UUID primary keys for security and scalability