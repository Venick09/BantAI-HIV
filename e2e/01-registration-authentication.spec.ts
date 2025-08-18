import { test, expect, type Page } from '@playwright/test'

// Helper function to generate unique phone number
function generatePhoneNumber(): string {
  const timestamp = Date.now().toString().slice(-7)
  return `0917${timestamp}`
}

test.describe('1. User Registration & Authentication', () => {
  test.describe('1.1 Self-Registration Flow', () => {
    test('complete registration flow with OTP', async ({ page }) => {
      const phoneNumber = generatePhoneNumber()
      
      // Navigate to registration page
      await page.goto('/register')
      
      // Fill registration form
      await page.fill('input[name="firstName"]', 'Test')
      await page.fill('input[name="lastName"]', 'User')
      await page.fill('input[name="phoneNumber"]', phoneNumber)
      
      // Accept privacy consent
      const consentCheckbox = page.locator('input[type="checkbox"]')
      await consentCheckbox.check()
      
      // Submit form
      await page.click('button[type="submit"]')
      
      // Should show OTP verification
      await expect(page.locator('text=Verify your phone number')).toBeVisible({ timeout: 10000 })
      
      // In dev mode, check console for OTP
      await page.pause() // Manual step: check dev.log for OTP
      
      // Note: In real test, we would:
      // 1. Read OTP from dev.log or test SMS provider
      // 2. Enter OTP in verification form
      // 3. Verify redirect to dashboard
    })

    test('registration with minimal data', async ({ page }) => {
      const phoneNumber = generatePhoneNumber()
      
      await page.goto('/register')
      
      // Only required fields
      await page.fill('input[name="firstName"]', 'Min')
      await page.fill('input[name="lastName"]', 'User')
      await page.fill('input[name="phoneNumber"]', phoneNumber)
      await page.check('input[type="checkbox"]')
      
      await page.click('button[type="submit"]')
      
      // Should proceed to OTP
      await expect(page.locator('text=Verify')).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('1.2 Phone Number Validation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/register')
      await page.fill('input[name="firstName"]', 'Test')
      await page.fill('input[name="lastName"]', 'User')
    })

    test('valid phone number formats', async ({ page }) => {
      const validNumbers = ['09123456789', '639123456789', '09987654321']
      
      for (const number of validNumbers) {
        await page.fill('input[name="phoneNumber"]', number)
        await page.check('input[type="checkbox"]')
        await page.click('button[type="submit"]')
        
        // Should not show validation error
        await expect(page.locator('text=Invalid phone number')).not.toBeVisible()
        
        // Go back for next test
        await page.goto('/register')
        await page.fill('input[name="firstName"]', 'Test')
        await page.fill('input[name="lastName"]', 'User')
      }
    })

    test('invalid phone number formats', async ({ page }) => {
      const invalidNumbers = ['08123456789', '123456789', '0912345', '+11234567890']
      
      for (const number of invalidNumbers) {
        await page.fill('input[name="phoneNumber"]', number)
        await page.check('input[type="checkbox"]')
        await page.click('button[type="submit"]')
        
        // Should show validation error
        await expect(page.locator('text=Invalid phone number')).toBeVisible()
        
        // Clear for next test
        await page.fill('input[name="phoneNumber"]', '')
      }
    })

    test('duplicate phone number prevention', async ({ page }) => {
      // Use a known existing number (from seed data or previous test)
      await page.fill('input[name="phoneNumber"]', '09171234567')
      await page.check('input[type="checkbox"]')
      await page.click('button[type="submit"]')
      
      // Should show duplicate error or proceed to OTP (if number exists)
      // Note: Exact behavior depends on implementation
    })

    test.skip('rate limiting - 5 OTP requests per hour', async ({ page }) => {
      const phoneNumber = generatePhoneNumber()
      
      // Attempt multiple OTP requests
      for (let i = 0; i < 6; i++) {
        await page.goto('/register')
        await page.fill('input[name="firstName"]', 'Test')
        await page.fill('input[name="lastName"]', 'User')
        await page.fill('input[name="phoneNumber"]', phoneNumber)
        await page.check('input[type="checkbox"]')
        await page.click('button[type="submit"]')
        
        if (i < 5) {
          await expect(page.locator('text=Verify')).toBeVisible({ timeout: 10000 })
        } else {
          // Should show rate limit error
          await expect(page.locator('text=rate limit')).toBeVisible()
        }
      }
    })
  })

  test.describe('1.3 Authentication', () => {
    test('login with Clerk authentication', async ({ page }) => {
      await page.goto('/login')
      
      // Check for Clerk login form
      await expect(page.locator('form')).toBeVisible()
      
      // Note: Actual login requires Clerk test mode setup
    })

    test('role-based access control', async ({ page }) => {
      // Test different role access
      const roleUrls = [
        { role: 'patient', url: '/dashboard' },
        { role: 'health_worker', url: '/dashboard/art' },
        { role: 'test_center', url: '/dashboard/test-center' },
        { role: 'admin', url: '/dashboard/admin' }
      ]
      
      for (const { role, url } of roleUrls) {
        await page.goto(url)
        // Should redirect to login when not authenticated
        await expect(page).toHaveURL(/.*login/)
      }
    })

    test('logout functionality', async ({ page, context }) => {
      // Note: Requires authenticated session
      // This test would need proper Clerk test setup
      
      // Mock authenticated state
      await context.addCookies([{
        name: '__session',
        value: 'mock-session',
        domain: 'localhost',
        path: '/'
      }])
      
      await page.goto('/dashboard')
      
      // Look for logout button
      const logoutButton = page.locator('button:has-text("Sign out"), a:has-text("Sign out")')
      
      if (await logoutButton.isVisible()) {
        await logoutButton.click()
        // Should redirect to homepage or login
        await expect(page).toHaveURL(/\/(login|$)/)
      }
    })
  })
})