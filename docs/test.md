# BantAI-HIV Testing Guide

## Overview
This document outlines all functionalities of the BantAI-HIV platform that should be tested to ensure reliability and capability. The platform is a comprehensive HIV prevention and care management system with SMS integration, risk assessment, and government billing features.

## 1. User Registration & Authentication

### 1.1 Self-Registration Flow
- [ ] Navigate to `/register`
- [ ] Enter phone number (09XXXXXXXXX format)
- [ ] Receive OTP via SMS (console in dev mode)
- [ ] Verify OTP successfully
- [ ] Complete registration with minimal data
- [ ] Redirect to dashboard after successful registration

### 1.2 Phone Number Validation
- [ ] Test valid formats: 09123456789, 639123456789
- [ ] Test invalid formats: 08123456789, 123456789
- [ ] Test duplicate phone number prevention
- [ ] Test rate limiting (5 OTP requests per hour)

### 1.3 Authentication
- [ ] Login with Clerk authentication
- [ ] Role-based access (patient, health_worker, test_center, admin)
- [ ] Session persistence
- [ ] Logout functionality

## 2. Risk Assessment System

### 2.1 Questionnaire Delivery
- [ ] Access risk assessment from dashboard
- [ ] View questions in English
- [ ] Toggle to Tagalog translation
- [ ] Answer all 7 questions
- [ ] Submit assessment

### 2.2 Scoring Algorithm
- [ ] Low risk (0-2 points) - Prevention tips
- [ ] Moderate risk (3-5 points) - Test center recommendations
- [ ] High risk (6+ points) - Priority testing message
- [ ] Score calculation accuracy
- [ ] Result storage in database

### 2.3 SMS-Based Assessment
- [ ] Receive assessment questions via SMS
- [ ] Reply with answers
- [ ] Receive risk level result
- [ ] Get appropriate follow-up messages

## 3. Referral System

### 3.1 Referral ID Generation
- [ ] Generate unique 8-character referral code
- [ ] QR code generation for referral
- [ ] Referral tracking in database
- [ ] Priority marking for high-risk referrals

### 3.2 Test Center Integration
- [ ] View nearby test centers (based on location)
- [ ] Get test center contact information
- [ ] See operating hours and services
- [ ] Receive SMS with test center details

## 4. Testing Center Portal

### 4.1 Test Center Dashboard (`/dashboard/test-center`)
- [ ] Login as test center staff
- [ ] View daily statistics
- [ ] Search referrals by code
- [ ] View pending tests queue

### 4.2 Result Input
- [ ] Look up patient by referral ID
- [ ] Input test results (positive/negative)
- [ ] Update patient status
- [ ] Trigger billing event (₱200)

### 4.3 Activity Tracking
- [ ] View recent activities
- [ ] Track conversion rates
- [ ] Monitor testing volume

## 5. ART Management

### 5.1 ART Initiation (`/dashboard/art`)
- [ ] View positive patients
- [ ] Start ART for patient
- [ ] Set treatment start date
- [ ] Trigger billing event (₱500)

### 5.2 Adherence Tracking
- [ ] Schedule SMS reminders
- [ ] Track medication adherence
- [ ] Update viral load status
- [ ] Monitor treatment progress

### 5.3 Patient Management
- [ ] Search patients by name/phone
- [ ] Filter by treatment status
- [ ] View patient history
- [ ] Export patient data

## 6. SMS Functionality

### 6.1 SMS Delivery
- [ ] OTP delivery (≤30 seconds)
- [ ] Risk assessment messages
- [ ] Test center information
- [ ] ART adherence reminders
- [ ] Emergency alerts

### 6.2 Provider Switching
- [ ] Console provider (development)
- [ ] Twilio provider (production)
- [ ] Semaphore provider (production)
- [ ] Fallback handling

### 6.3 Template Management
- [ ] Dynamic message templates
- [ ] Bilingual support (EN/TL)
- [ ] Personalization tokens
- [ ] Character limit compliance

## 7. Admin Dashboard

### 7.1 HIV Care Cascade (`/dashboard/admin`)
- [ ] Funnel visualization
- [ ] Real-time statistics
- [ ] Conversion rate tracking
- [ ] Period filtering

### 7.2 User Management (`/dashboard/admin/users`)
- [ ] View all users
- [ ] Search and filter
- [ ] Role management
- [ ] Bulk operations

### 7.3 Reports & Analytics
- [ ] Generate reports
- [ ] Export to CSV
- [ ] Data visualization
- [ ] Trend analysis

## 8. Billing System

### 8.1 Billing Dashboard (`/dashboard/admin/billing`)
- [ ] View billing summary
- [ ] Period selection
- [ ] Patient-level details
- [ ] Total calculations

### 8.2 Billing Events
- [ ] ₱150 - Risk assessment completed
- [ ] ₱200 - Test result logged
- [ ] ₱500 - ART initiated
- [ ] ₱850 - Maximum cap per patient

### 8.3 Export & Reporting
- [ ] Generate CSV export
- [ ] Include all required fields
- [ ] Audit trail
- [ ] Billing period management

## 9. Compliance & Security

### 9.1 Data Privacy (RA 10173)
- [ ] Minimal data collection
- [ ] Consent management
- [ ] Data encryption (AES-256-GCM)
- [ ] Access logging

### 9.2 HIV Act Compliance (RA 11166)
- [ ] Confidentiality measures
- [ ] Voluntary testing only
- [ ] Non-discrimination
- [ ] Proper counseling flow

### 9.3 Audit Logging
- [ ] User actions tracked
- [ ] Data access logged
- [ ] Compliance reports
- [ ] Security event monitoring

## 10. Performance Testing

### 10.1 Load Testing
- [ ] 1000 concurrent users
- [ ] 10,000 SMS/hour
- [ ] Database query performance
- [ ] API response times

### 10.2 Reliability
- [ ] 99% uptime target
- [ ] Error handling
- [ ] Graceful degradation
- [ ] Recovery procedures

### 10.3 SMS Performance
- [ ] Delivery success rate >95%
- [ ] Delivery time ≤30 seconds
- [ ] Queue management
- [ ] Retry logic

## 11. Integration Testing

### 11.1 End-to-End Flows
- [ ] Complete registration → assessment → referral → testing → ART flow
- [ ] SMS-only user journey
- [ ] Web + SMS hybrid usage
- [ ] Multi-role interactions

### 11.2 API Testing
- [ ] `/api/sms/send-otp`
- [ ] `/api/sms/verify-otp`
- [ ] `/api/cron/send-reminders`
- [ ] Authentication endpoints

### 11.3 Database Integrity
- [ ] Foreign key constraints
- [ ] Data consistency
- [ ] Transaction handling
- [ ] Backup/restore

## 12. User Experience Testing

### 12.1 Mobile Responsiveness
- [ ] Registration on mobile
- [ ] Dashboard navigation
- [ ] Form usability
- [ ] SMS interaction

### 12.2 Accessibility
- [ ] Screen reader compatibility
- [ ] Keyboard navigation
- [ ] Color contrast
- [ ] Font sizing

### 12.3 Bilingual Support
- [ ] English interface
- [ ] Tagalog translations
- [ ] Language switching
- [ ] SMS language preference

## 13. Error Handling

### 13.1 User Errors
- [ ] Invalid input handling
- [ ] Clear error messages
- [ ] Recovery options
- [ ] Help documentation

### 13.2 System Errors
- [ ] Database connection failures
- [ ] SMS provider outages
- [ ] API timeouts
- [ ] Graceful error pages

## 14. Deployment Testing

### 14.1 Environment Configuration
- [ ] Development setup
- [ ] Staging deployment
- [ ] Production readiness
- [ ] Environment variables

### 14.2 CI/CD Pipeline
- [ ] Automated tests
- [ ] Build process
- [ ] Deployment automation
- [ ] Rollback procedures

## Testing Commands

```bash
# Unit Tests
npm run test:unit

# Integration Tests (Playwright)
npm run test:e2e

# Type Checking
npm run types

# Linting
npm run lint

# Full Test Suite
npm run test
```

## Test Data

### Test Phone Numbers
- Valid: 09123456789, 09987654321, 639123456789
- Invalid: 08123456789, 123456789, +11234567890

### Test Referral Codes
- HIGH001 (high risk patient)
- MOD002 (moderate risk patient)
- LOW003 (low risk patient)

### Test Credentials
- Admin: Use Clerk dev mode
- Health Worker: Create via admin panel
- Test Center: Create via admin panel

## Success Criteria

1. **Functionality**: All features work as designed
2. **Performance**: Meets performance targets (99% uptime, ≤30s SMS)
3. **Security**: Passes security audit, data properly encrypted
4. **Compliance**: Meets RA 11166 and RA 10173 requirements
5. **Usability**: Intuitive for health workers and patients
6. **Reliability**: Handles errors gracefully, maintains data integrity

## Notes

- Use console SMS provider for development testing
- Check `/dev.log` for SMS messages in development
- Monitor console for error messages
- Use Chrome DevTools for network inspection
- Test both web and SMS-only user journeys