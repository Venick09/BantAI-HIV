import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function checkSenderNames() {
  const apiKey = process.env.SEMAPHORE_API_KEY
  
  if (!apiKey) {
    console.error('❌ SEMAPHORE_API_KEY not found in environment')
    return
  }
  
  console.log('🔍 Checking available sender names...\n')
  
  try {
    // Check sender names associated with account
    const response = await fetch(`https://api.semaphore.co/api/v4/account/sendernames?apikey=${apiKey}`)
    const data = await response.json()
    
    console.log('📱 Available Sender Names:')
    if (Array.isArray(data) && data.length > 0) {
      data.forEach((sender: any) => {
        console.log(`  - Name: "${sender.name}" | Status: ${sender.status} | Created: ${sender.created_at}`)
      })
    } else if (data.error) {
      console.log('❌ Error:', data.error)
    } else {
      console.log('❌ No sender names found or unexpected response:', data)
    }
    
    // Test with no sender name (let Semaphore use default)
    console.log('\n🧪 Testing SMS without specifying sender name...')
    const testResponse = await fetch('https://api.semaphore.co/api/v4/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        apikey: apiKey,
        number: '09999986806',
        message: 'Test from BantAI - No sender name specified'
        // Intentionally not specifying sendername
      })
    })
    
    const testData = await testResponse.json()
    console.log('Result:', JSON.stringify(testData, null, 2))
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkSenderNames()