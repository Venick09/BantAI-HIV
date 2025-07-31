# BantAI HIV MVP - Project Tasks & Milestones

## Project Overview
Build a web-plus-SMS platform for HIV risk assessment, testing referral, and ART adherence tracking with government billing.

## Development Timeline: 13 Weeks

### Phase 1: Foundation (Weeks 1-3)
- [ ] **Project Setup**
  - [ ] Initialize Next.js 15 project with TypeScript
  - [ ] Set up Supabase (PostgreSQL) database
  - [ ] Configure Clerk authentication
  - [ ] Set up SMS provider integration (Twilio/Semaphore)
  - [ ] Configure environment variables
  - [ ] Set up CI/CD pipeline

- [ ] **Database Schema Design**
  - [ ] Design user/patient tables
  - [ ] Design risk assessment tables
  - [ ] Design referral tracking tables
  - [ ] Design ART adherence tables
  - [ ] Design billing ledger tables
  - [ ] Create database migrations

### Phase 2: Core Features (Weeks 4-7)
- [ ] **User Registration & Authentication**
  - [ ] Self-registration form with OTP verification
  - [ ] Health worker registration portal
  - [ ] Admin bulk-add functionality
  - [ ] Role-based access control

- [ ] **Risk Assessment System**
  - [ ] Create 5-7 item questionnaire
  - [ ] Implement auto-scoring algorithm (Low/Moderate/High)
  - [ ] SMS questionnaire delivery system
  - [ ] Response collection via SMS

- [ ] **SMS Engine**
  - [ ] SMS sending service
  - [ ] SMS template management
  - [ ] OTP verification system
  - [ ] Delivery status tracking
  - [ ] SMS scheduling for adherence reminders

### Phase 3: Referral & Testing (Weeks 8-10)
- [ ] **Referral System**
  - [ ] Generate unique Referral IDs
  - [ ] Risk-based messaging system
    - [ ] Prevention tips for low risk
    - [ ] Test center listings for moderate risk
    - [ ] Priority test instructions for high risk
  - [ ] QR code generation for referrals

- [ ] **Testing Center Integration**
  - [ ] Testing center portal
  - [ ] Result input interface
  - [ ] Referral ID lookup system
  - [ ] Test result status updates

- [ ] **ART Management**
  - [ ] ART start date recording
  - [ ] Adherence reminder scheduling
  - [ ] Treatment status tracking

### Phase 4: Admin & Billing (Weeks 11-12)
- [ ] **Admin Dashboard**
  - [ ] Funnel visualization (Registered → Tested → On ART → Suppressed)
  - [ ] Real-time statistics
  - [ ] Patient search and filtering
  - [ ] Report generation

- [ ] **Billing System**
  - [ ] Per-patient billing calculation
    - [ ] ₱150 - Questionnaire delivery
    - [ ] ₱200 - Test result logged
    - [ ] ₱500 - Positive case starts ART
    - [ ] ₱850 - Maximum per patient
  - [ ] CSV billing export
  - [ ] Billing period management
  - [ ] Audit trail

### Phase 5: Compliance & Testing (Week 13)
- [ ] **Compliance & Security**
  - [ ] RA 11166 (Philippine HIV and AIDS Policy Act) compliance
  - [ ] RA 10173 (Data Privacy Act) compliance
  - [ ] Data encryption implementation
  - [ ] Access logging and audit trails
  - [ ] Consent management

- [ ] **Testing & Deployment**
  - [ ] Unit testing (>80% coverage)
  - [ ] Integration testing
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
9. ✅ 99% uptime capability
10. ✅ ≤30s SMS delivery
11. ✅ RA 11166/RA 10173 compliance

## Success Metrics
- User registration completion rate >80%
- Risk assessment completion rate >75%
- Moderate/High risk users getting tested >60%
- Positive cases starting ART >90%
- SMS delivery success rate >95%
- System uptime >99%
- Billing accuracy 100%