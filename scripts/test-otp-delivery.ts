// Test OTP endpoint with proper format
async function testOTPDelivery() {
  const apiKey = '345d7d7cfd0cd0f202662689f4b2a9b9'
  
  console.log('🧪 Testing OTP endpoint with dedicated route...\n')
  
  // Test 1: With {otp} placeholder and code parameter
  console.log('Test 1: OTP with placeholder and code')
  try {
    const response = await fetch('https://api.semaphore.co/api/v4/otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        apikey: apiKey,
        number: '09999986806',
        message: 'Your BantAI verification code is: {otp}',
        code: '123456'  // Our OTP code
      })
    })
    
    const result = await response.json()
    console.log('Response:', JSON.stringify(result, null, 2))
    
    if (Array.isArray(result) && result[0]?.message_id) {
      // Wait and check status
      console.log('\nWaiting 10 seconds to check delivery status...')
      await new Promise(resolve => setTimeout(resolve, 10000))
      
      const statusResponse = await fetch(`https://api.semaphore.co/api/v4/messages/${result[0].message_id}?apikey=${apiKey}`)
      const status = await statusResponse.json()
      console.log('Delivery Status:', JSON.stringify(status, null, 2))
    }
  } catch (error) {
    console.error('Error:', error)
  }
  
  // Test 2: Without HIV keywords at all
  console.log('\n\nTest 2: Generic OTP message')
  try {
    const response = await fetch('https://api.semaphore.co/api/v4/otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        apikey: apiKey,
        number: '09999986806',
        message: 'Your code is: {otp}',
        code: '654321'
      })
    })
    
    const result = await response.json()
    console.log('Response:', JSON.stringify(result, null, 2))
  } catch (error) {
    console.error('Error:', error)
  }
}

testOTPDelivery()