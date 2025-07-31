# BantAI HIV MVP - Pages Structure

## Overview
Next.js 15 App Router structure with clear separation between public and authenticated routes.

## Route Structure

### Public Routes - `/app/(unauthenticated)`

#### Marketing Pages - `(marketing)`
```
/                           - Landing page
├── /features              - Platform features showcase
├── /pricing               - Pricing plans (if applicable)
├── /about                 - About BantAI HIV
├── /contact               - Contact information
└── /privacy               - Privacy policy (RA 10173 compliance)
```

#### Auth Pages - `(auth)`
```
/login                     - User login
├── /signup                - User registration
├── /verify-otp            - OTP verification
├── /forgot-password       - Password reset
└── /error                 - Auth error page
```

### Protected Routes - `/app/(authenticated)`

#### Patient Dashboard - `/dashboard`
```
/dashboard                 - Patient overview
├── /assessment           - Risk assessment
│   ├── /start           - Begin questionnaire
│   ├── /questions       - Answer questions
│   └── /results         - View results & referral
├── /referrals           - My referrals
│   ├── /active          - Active referral details
│   └── /history         - Past referrals
├── /test-results        - Test history
├── /treatment           - ART management
│   ├── /adherence       - Adherence tracking
│   └── /reminders       - SMS reminder settings
└── /profile             - User profile
    └── /settings        - Account settings
```

#### Health Worker Portal - `/health-worker`
```
/health-worker            - Health worker dashboard
├── /patients            - Patient management
│   ├── /add             - Add single patient
│   ├── /bulk-add        - Bulk registration
│   └── /[id]            - Patient details
├── /assessments         - View assessments
└── /referrals           - Manage referrals
```

#### Testing Center Portal - `/testing-center`
```
/testing-center          - Testing center dashboard
├── /referrals           - Incoming referrals
│   ├── /pending         - Pending tests
│   └── /search          - Search by code
├── /record-result       - Input test results
└── /reports             - Testing reports
```

#### Admin Dashboard - `/admin`
```
/admin                   - Admin overview
├── /analytics           - System analytics
│   ├── /funnel          - Conversion funnel
│   ├── /trends          - Monthly trends
│   └── /risk-distribution - Risk analysis
├── /users               - User management
│   ├── /patients        - Patient list
│   ├── /health-workers  - Health worker list
│   └── /organizations   - Organization management
├── /billing             - Billing management
│   ├── /ledger          - Billing ledger
│   ├── /export          - Export CSV
│   └── /reports         - Financial reports
├── /sms                 - SMS management
│   ├── /logs            - Message logs
│   ├── /templates       - Message templates
│   └── /credits         - SMS credits
├── /settings            - System settings
│   ├── /questionnaire   - Edit questions
│   ├── /scoring         - Risk scoring config
│   └── /compliance      - Compliance settings
└── /audit               - Audit logs
```

### API Routes - `/app/api`
```
/api
├── /auth/*              - Authentication endpoints
├── /sms/*               - SMS endpoints
├── /webhooks/*          - External webhooks
└── /admin/*             - Admin endpoints
```

## Page Components Structure

### Common Layout Components
```
/components/layouts/
├── PublicLayout.tsx     - Public pages wrapper
├── DashboardLayout.tsx  - Patient dashboard wrapper
├── AdminLayout.tsx      - Admin portal wrapper
└── MobileLayout.tsx     - Mobile-optimized wrapper
```

### Shared Components
```
/components/
├── /ui/                 - Shadcn UI components
├── /forms/
│   ├── OTPInput.tsx
│   ├── PhoneInput.tsx
│   ├── QuestionnaireForm.tsx
│   └── PatientForm.tsx
├── /charts/
│   ├── FunnelChart.tsx
│   ├── TrendChart.tsx
│   └── RiskPieChart.tsx
├── /tables/
│   ├── PatientTable.tsx
│   ├── ReferralTable.tsx
│   └── BillingTable.tsx
└── /common/
    ├── LoadingSpinner.tsx
    ├── ErrorBoundary.tsx
    └── SMSPreview.tsx
```

## Key Page Features

### Landing Page (`/`)
- Hero section with CTA
- Key statistics
- How it works (3 steps)
- Benefits for patients/government
- Partner organizations
- Call to action buttons

### Patient Dashboard (`/dashboard`)
- Welcome message with risk status
- Quick actions (Take assessment, View referral)
- Recent test results
- Treatment adherence score
- Upcoming reminders

### Risk Assessment (`/dashboard/assessment`)
- Progress indicator
- Question navigation
- SMS preview for mobile users
- Auto-save functionality
- Results with visual risk meter
- Next steps based on risk level

### Admin Analytics (`/admin/analytics`)
- Real-time statistics cards
- Conversion funnel visualization
- Geographic heat map
- Time-based trend charts
- Export functionality

### Billing Dashboard (`/admin/billing`)
- Current period summary
- Patient-level billing details
- Charge breakdown visualization
- CSV export with filters
- Payment status tracking

## Mobile Considerations

### SMS-First Interface
- Simplified navigation for feature phones
- SMS command shortcuts displayed
- QR codes for quick access
- Large touch targets

### Progressive Web App
- Offline capability for assessments
- Push notifications for reminders
- App-like experience on mobile

## Accessibility Features
- WCAG 2.1 AA compliance
- Screen reader support
- Keyboard navigation
- High contrast mode
- Multi-language support (English, Filipino)

## Security Features
- Session timeout warnings
- Secure data display (masked PII)
- Activity logging
- Two-factor authentication for admins
- Role-based UI elements

## Performance Targets
- Initial page load <3s
- Time to interactive <5s
- Lighthouse score >90
- Core Web Vitals pass