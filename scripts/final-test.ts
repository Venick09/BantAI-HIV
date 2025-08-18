// Final test to confirm it's the number
async function finalTest() {
  const apiKey = '345d7d7cfd0cd0f202662689f4b2a9b9'
  
  console.log('🧪 Final confirmation test...\n')
  
  // Test with a fake but different number to see if it gets different status
  console.log('Test 1: Different number (09171234567)')
  try {
    const response = await fetch('https://api.semaphore.co/api/v4/otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        apikey: apiKey,
        number: '09171234567',  // Different number
        message: 'Test: {otp}',
        code: '111111'
      })
    })
    
    const result = await response.json()
    console.log('Response:', result[0]?.status, '- Message ID:', result[0]?.message_id)
    
    // Check if your number is specifically blocked
    console.log('\nTest 2: Your number again (09999986806)')
    const response2 = await fetch('https://api.semaphore.co/api/v4/otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        apikey: apiKey,
        number: '09999986806',  // Your number
        message: 'Test: {otp}',
        code: '222222'
      })
    })
    
    const result2 = await response2.json()
    console.log('Response:', result2[0]?.status, '- Message ID:', result2[0]?.message_id)
    
    // Compare networks
    console.log('\nNetwork comparison:')
    console.log('09171234567:', result[0]?.network)
    console.log('09999986806:', result2[0]?.network)
    
  } catch (error) {
    console.error('Error:', error)
  }
}

finalTest()