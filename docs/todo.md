# BantAI HIV MVP - Project Tasks & Milestones

## Project Overview
Build a web-plus-SMS platform for HIV risk assessment, testing referral, and ART adherence tracking with government billing.

## Development Timeline: 13 Weeks

### Phase 1: Foundation (Weeks 1-3) ✅ COMPLETED
- [x] **Project Setup**
  - [x] Initialize Next.js 15 project with TypeScript
  - [x] Set up Supabase (PostgreSQL) database
  - [x] Configure Clerk authentication
  - [x] Set up SMS provider integration (Twilio/Semaphore)
  - [x] Configure environment variables
  - [x] Set up CI/CD pipeline

- [x] **Database Schema Design**
  - [x] Design user/patient tables
  - [x] Design risk assessment tables
  - [x] Design referral tracking tables
  - [x] Design ART adherence tables
  - [x] Design billing ledger tables
  - [x] Create database migrations

### Phase 1.5: UI/UX Design & Branding ✅ COMPLETED
- [x] **Platform Branding**
  - [x] BantAI brand identity (red/pink gradient theme)
  - [x] Custom logo with heart icon
  - [x] Consistent color scheme throughout
  - [x] Healthcare-focused messaging

- [x] **Landing Page Design**
  - [x] Hero section with SMS mockup
  - [x] How It Works 4-step process
  - [x] Features grid with statistics
  - [x] FAQ section
  - [x] Contact form
  - [x] Emergency hotline display

- [x] **Component Design**
  - [x] Custom header with navigation
  - [x] Responsive mobile menu
  - [x] Sticky CTA for conversions
  - [x] Site banner for announcements
  - [x] Professional footer

- [x] **Dashboard Design**
  - [x] HIV-specific dashboard layout
  - [x] Health status tracking cards
  - [x] Quick action buttons
  - [x] Risk assessment integration

### Phase 2: Core Features (Weeks 4-7) ✅ COMPLETED
- [x] **User Registration & Authentication**
  - [x] Self-registration form with OTP verification
  - [x] Phone number-based registration flow
  - [x] Privacy-first approach (minimal data collection)
  - [x] Registration page UI (/register)
  - [x] OTP verification flow
  - [x] Test OTP page for development (/test-otp)
  - [x] Health worker registration portal (via admin)
  - [x] Admin bulk-add functionality (via admin dashboard)
  - [x] Role-based access control (implemented in middleware)

- [x] **Risk Assessment System**
  - [x] Create 5-7 item questionnaire
  - [x] Bilingual support (English/Tagalog)
  - [x] Implement auto-scoring algorithm (Low/Moderate/High)
  - [x] Database seed data for questions
  - [x] Scoring rules configuration
  - [x] Risk level calculations
  - [x] SMS questionnaire delivery system (via SMS service)
  - [x] Response collection via SMS (via SMS service)

- [x] **SMS Engine**
  - [x] SMS sending service (Multi-provider: Twilio/Semaphore)
  - [x] SMS template management
  - [x] OTP verification system
  - [x] Delivery status tracking
  - [x] SMS scheduling for adherence reminders
  - [x] API endpoints (/api/sms/send-otp, /api/sms/verify-otp)

### Phase 3: Referral & Testing (Weeks 8-10) ✅ COMPLETED
- [x] **Referral System**
  - [x] Generate unique Referral IDs
  - [x] Database schema for referrals
  - [x] Risk-based messaging system
    - [x] Prevention tips for low risk
    - [x] Test center listings for moderate risk
    - [x] Priority test instructions for high risk
  - [x] QR code generation for referrals

- [x] **Testing Center Integration**
  - [x] Test center database schema
  - [x] Seed data for Manila test centers
  - [x] Testing center portal
  - [x] Result input interface
  - [x] Referral ID lookup system
  - [x] Test result status updates

- [x] **ART Management**
  - [x] ART start date recording
  - [x] Adherence reminder scheduling
  - [x] Treatment status tracking

### Phase 4: Admin & Billing (Weeks 11-12) ✅ COMPLETED
- [x] **Admin Dashboard**
  - [x] Funnel visualization (Registered → Tested → On ART → Suppressed)
  - [x] Real-time statistics
  - [x] Patient search and filtering
  - [x] Report generation

- [x] **Billing System**
  - [x] Per-patient billing calculation
    - [x] ₱150 - Questionnaire delivery
    - [x] ₱200 - Test result logged
    - [x] ₱500 - Positive case starts ART
    - [x] ₱850 - Maximum per patient
  - [x] CSV billing export
  - [x] Billing period management
  - [x] Audit trail

### Phase 5: Compliance & Testing (Week 13) ✅ COMPLETED
- [x] **Compliance & Security**
  - [x] RA 11166 (Philippine HIV and AIDS Policy Act) compliance
  - [x] RA 10173 (Data Privacy Act) compliance
  - [x] Data encryption implementation
  - [x] Access logging and audit trails
  - [x] Consent management

- [x] **Testing & Deployment** ✅ Testing Setup Complete
  - [x] Unit testing setup (Jest configured)
  - [x] Test examples for encryption and audit logging
  - [x] Coverage thresholds configured (80% target)
  - [x] Integration testing (Playwright ready)
  - [ ] Load testing (99% uptime target)
  - [ ] SMS delivery performance testing (≤30s target)
  - [ ] UAT with health workers
  - [ ] Production deployment
  - [ ] Pilot city launch preparation

## Key Deliverables
1. ✅ Self-registration with OTP verification
2. ✅ SMS-based risk assessment questionnaire
3. ✅ Auto-scoring and risk categorization
4. ✅ Referral ID generation and tracking
5. ✅ Testing center result input
6. ✅ ART adherence SMS scheduling
7. ✅ Admin dashboard with funnel analytics
8. ✅ CSV billing export
9. ⬜ 99% uptime capability
10. ⬜ ≤30s SMS delivery
11. ✅ RA 11166/RA 10173 compliance

## Success Metrics
- User registration completion rate >80%
- Risk assessment completion rate >75%
- Moderate/High risk users getting tested >60%
- Positive cases starting ART >90%
- SMS delivery success rate >95%
- System uptime >99%
- Billing accuracy 100%