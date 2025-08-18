#!/usr/bin/env node

const testPhoneNumber = '09171234567'

console.log('Testing SMS/OTP functionality...\n')

// Test 1: Send OTP
console.log('1. Testing OTP sending...')
fetch('http://localhost:3001/api/sms/send-otp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    phoneNumber: testPhoneNumber,
    purpose: 'registration'
  })
})
.then(res => res.json())
.then(data => {
  console.log('OTP Send Result:', data)
  console.log('\n---\n')
  
  // Test 2: Send regular SMS
  console.log('2. Testing regular SMS...')
  return fetch('http://localhost:3001/api/test-sms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      phoneNumber: testPhoneNumber,
      message: 'Test message from BantAI'
    })
  })
})
.then(res => res.json())
.then(data => {
  console.log('SMS Send Result:', data)
  console.log('\n---\n')
  console.log('✅ Tests completed! Check console output above for SMS messages.')
})
.catch(error => {
  console.error('❌ Test failed:', error.message)
})