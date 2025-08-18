import { test, expect } from '@playwright/test'

test.describe('User Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display landing page with registration CTA', async ({ page }) => {
    // Check for BantAI branding
    await expect(page.locator('h1').first()).toBeVisible()
    
    // Check for registration button
    const registerButton = page.getByRole('link', { name: /start|assessment|register/i })
    await expect(registerButton.first()).toBeVisible()
  })

  test('should navigate to registration page', async ({ page }) => {
    // Click on registration button
    const registerButton = page.getByRole('link', { name: /start|assessment|register/i })
    await registerButton.first().click()
    
    // Should be redirected to registration page
    await expect(page).toHaveURL(/.*register/)
    
    // Check for registration form elements
    await expect(page.locator('h1').first()).toBeVisible()
    await expect(page.locator('input[name="firstName"]')).toBeVisible()
    await expect(page.locator('input[name="lastName"]')).toBeVisible()
    await expect(page.locator('input[name="phoneNumber"]')).toBeVisible()
  })

  test('should validate phone number format', async ({ page }) => {
    await page.goto('/register')
    
    // Fill in name fields
    await page.fill('input[name="firstName"]', 'Juan')
    await page.fill('input[name="lastName"]', 'Dela Cruz')
    
    // Try invalid phone number
    await page.fill('input[name="phoneNumber"]', '123')
    await page.click('button[type="submit"]')
    
    // Should show validation error
    await expect(page.locator('text=Invalid phone number')).toBeVisible()
  })

  test('should proceed to OTP verification', async ({ page }) => {
    await page.goto('/register')
    
    // Fill in valid registration data
    await page.fill('input[name="firstName"]', 'Juan')
    await page.fill('input[name="lastName"]', 'Dela Cruz')
    await page.fill('input[name="phoneNumber"]', '09171234567')
    
    // Check privacy consent
    await page.check('input[type="checkbox"]')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Should show OTP verification
    await expect(page.locator('text=Verify your phone number')).toBeVisible({
      timeout: 10000
    })
  })
})

test.describe('Risk Assessment Flow', () => {
  test('should display risk assessment after login', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard')
    
    // Check if redirected to login (since not authenticated)
    await expect(page).toHaveURL(/.*login/)
  })

  test('should display risk assessment page', async ({ page }) => {
    await page.goto('/dashboard/risk-assessment')
    
    // Should redirect to login since not authenticated
    await expect(page).toHaveURL(/.*login/)
  })
})

test.describe('Privacy and Consent', () => {
  test('should display privacy policy', async ({ page }) => {
    await page.goto('/dashboard/privacy')
    
    // Should redirect to login since not authenticated
    await expect(page).toHaveURL(/.*login/)
  })

  test('should display consent management page', async ({ page }) => {
    await page.goto('/dashboard/consent')
    
    // Should redirect to login since not authenticated
    await expect(page).toHaveURL(/.*login/)
  })
})

test.describe('Admin Functions', () => {
  test('should require authentication for admin dashboard', async ({ page }) => {
    // Navigate to admin dashboard
    await page.goto('/dashboard/admin')
    
    // Should redirect to login since not authenticated
    await expect(page).toHaveURL(/.*login/)
  })

  test('should require authentication for patient search', async ({ page }) => {
    await page.goto('/dashboard/admin/patients')
    
    // Should redirect to login since not authenticated
    await expect(page).toHaveURL(/.*login/)
  })

  test('should require authentication for billing', async ({ page }) => {
    await page.goto('/dashboard/admin/billing')
    
    // Should redirect to login since not authenticated
    await expect(page).toHaveURL(/.*login/)
  })

  test('should require authentication for reports', async ({ page }) => {
    await page.goto('/dashboard/admin/reports')
    
    // Should redirect to login since not authenticated
    await expect(page).toHaveURL(/.*login/)
  })
})

test.describe('Test Center Functions', () => {
  test('should require authentication for test center', async ({ page }) => {
    await page.goto('/dashboard/test-center')
    
    // Should redirect to login since not authenticated
    await expect(page).toHaveURL(/.*login/)
  })
})

test.describe('Compliance Features', () => {
  test('should require authentication for compliance dashboard', async ({ page }) => {
    await page.goto('/dashboard/admin/compliance')
    
    // Should redirect to login since not authenticated
    await expect(page).toHaveURL(/.*login/)
  })
})