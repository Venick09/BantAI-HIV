// Test Semaphore API directly with curl-like request
async function testDirectAPI() {
  const apiKey = '345d7d7cfd0cd0f202662689f4b2a9b9'
  
  console.log('🧪 Testing Semaphore API directly...\n')
  
  // Test 1: Simple message without HIV keywords
  console.log('Test 1: Simple message')
  try {
    const response = await fetch('https://api.semaphore.co/api/v4/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        apikey: apiKey,
        number: '09999986806',
        message: 'BantAI: Your code is 123456'
      })
    })
    
    const result = await response.json()
    console.log('Response:', JSON.stringify(result, null, 2))
    
    if (Array.isArray(result) && result[0]?.message_id) {
      // Wait and check status
      console.log('\nWaiting 5 seconds to check delivery status...')
      await new Promise(resolve => setTimeout(resolve, 5000))
      
      const statusResponse = await fetch(`https://api.semaphore.co/api/v4/messages/${result[0].message_id}?apikey=${apiKey}`)
      const status = await statusResponse.json()
      console.log('Status:', JSON.stringify(status, null, 2))
    }
  } catch (error) {
    console.error('Error:', error)
  }
  
  // Test 2: Check if it's the multi-line format causing issues
  console.log('\n\nTest 2: Single line message')
  try {
    const response = await fetch('https://api.semaphore.co/api/v4/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        apikey: apiKey,
        number: '09999986806',
        message: 'BantAI verification: 654321 (expires in 10 min)'
      })
    })
    
    const result = await response.json()
    console.log('Response:', JSON.stringify(result, null, 2))
  } catch (error) {
    console.error('Error:', error)
  }
}

testDirectAPI()