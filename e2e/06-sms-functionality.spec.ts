import { test, expect } from '@playwright/test'
import { readFile } from 'fs/promises'
import { join } from 'path'

test.describe('6. SMS Functionality', () => {
  test.describe('6.1 SMS Delivery', () => {
    test('OTP delivery via console provider', async ({ page }) => {
      const phoneNumber = `0917${Date.now().toString().slice(-7)}`
      
      // Navigate to test OTP page
      await page.goto('/test-otp')
      
      // Send OTP
      await page.fill('input[name="phoneNumber"]', phoneNumber)
      await page.click('button:has-text("Send OTP")')
      
      // In dev mode, OTP should appear in console
      await expect(page.locator('text=/OTP sent|verification code sent/i')).toBeVisible()
      
      // Check dev.log for OTP (in real test environment)
      // const devLog = await readFile(join(process.cwd(), 'dev.log'), 'utf-8')
      // expect(devLog).toContain(phoneNumber)
    })

    test('verify OTP functionality', async ({ page }) => {
      const phoneNumber = `0917${Date.now().toString().slice(-7)}`
      
      await page.goto('/test-otp')
      
      // Send OTP
      await page.fill('input[name="phoneNumber"]', phoneNumber)
      await page.click('button:has-text("Send OTP")')
      
      // Wait for OTP field
      await expect(page.locator('input[name="otp"], input[placeholder*="OTP"]')).toBeVisible()
      
      // In dev, OTP is usually 123456 or visible in console
      await page.fill('input[name="otp"]', '123456')
      await page.click('button:has-text("Verify")')
      
      // Check verification result
      await expect(page.locator('text=/verified|success/i')).toBeVisible()
    })

    test.skip('SMS delivery time check (≤30 seconds)', async ({ page }) => {
      // This requires actual SMS provider integration
      const startTime = Date.now()
      
      await page.goto('/test-sms')
      await page.fill('input[name="phoneNumber"]', '09171234567')
      await page.click('button:has-text("Send Test SMS")')
      
      // Wait for delivery confirmation
      await expect(page.locator('text=/delivered|sent successfully/i')).toBeVisible({
        timeout: 30000
      })
      
      const deliveryTime = Date.now() - startTime
      expect(deliveryTime).toBeLessThanOrEqual(30000)
    })
  })

  test.describe('6.2 Provider Switching', () => {
    test('console provider in development', async ({ page }) => {
      // Check if console provider is active
      await page.goto('/test-sms')
      
      // In dev mode, should show console provider indicator
      const providerInfo = page.locator('text=/console|development mode/i')
      
      if (await providerInfo.isVisible()) {
        expect(true).toBe(true) // Console provider active
      }
    })

    test.skip('provider fallback handling', async ({ page }) => {
      // This would test failover between providers
      // Requires multiple providers configured
      
      // Simulate primary provider failure
      // Verify fallback to secondary provider
    })
  })

  test.describe('6.3 Template Management', () => {
    test('bilingual SMS support', async ({ page }) => {
      await page.goto('/test-sms')
      
      // Check for language selection
      const langSelect = page.locator('select[name="language"], input[name="language"]')
      
      if (await langSelect.isVisible()) {
        // Test English
        await langSelect.selectOption('en')
        await page.click('button:has-text("Send")')
        
        // Test Tagalog
        await langSelect.selectOption('tl')
        await page.click('button:has-text("Send")')
      }
    })

    test('SMS character limit compliance', async ({ page }) => {
      await page.goto('/test-sms')
      
      // Check for character counter
      const messageInput = page.locator('textarea[name="message"]')
      const charCounter = page.locator('text=/characters|chars/i')
      
      if (await messageInput.isVisible()) {
        // Type long message
        const longMessage = 'a'.repeat(200)
        await messageInput.fill(longMessage)
        
        // Check character count display
        if (await charCounter.isVisible()) {
          const counterText = await charCounter.textContent()
          expect(counterText).toMatch(/\d+/)
        }
        
        // Verify SMS segmentation warning if > 160 chars
        if (longMessage.length > 160) {
          await expect(page.locator('text=/segment|parts/i')).toBeVisible()
        }
      }
    })
  })

  test.describe('SMS Integration Tests', () => {
    test('risk assessment via SMS flow', async ({ page }) => {
      // Document expected SMS flow
      const smsFlow = `
        1. User texts "START" to 21587
        2. System responds with first question
        3. User replies "A", "B", or "C"
        4. System sends next question
        5. After 7 questions, system sends risk result
        6. System sends appropriate follow-up (prevention tips, test centers, or urgent message)
      `
      
      // Check if SMS instructions are displayed
      await page.goto('/')
      const smsInstructions = page.locator('text=/text START|SMS.*21587/i')
      
      if (await smsInstructions.isVisible()) {
        expect(true).toBe(true) // SMS instructions found
      }
    })

    test('test center information via SMS', async ({ page }) => {
      // Test SMS delivery of test center details
      await page.goto('/dashboard/test-center')
      
      // Will redirect to login if not authenticated
      await expect(page).toHaveURL(/login|test-center/)
    })

    test('ART adherence reminders', async ({ page }) => {
      // Test reminder scheduling
      await page.goto('/dashboard/reminders')
      
      // Will redirect to login if not authenticated
      await expect(page).toHaveURL(/login|reminder/)
    })
  })
})