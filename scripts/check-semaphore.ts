import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function checkSemaphoreAccount() {
  const apiKey = process.env.SEMAPHORE_API_KEY
  
  if (!apiKey) {
    console.error('❌ SEMAPHORE_API_KEY not found in environment')
    return
  }
  
  console.log('🔍 Checking Semaphore account...')
  console.log(`📱 API Key: ${apiKey.substring(0, 8)}...`)
  
  try {
    // Check account balance
    const accountResponse = await fetch(`https://api.semaphore.co/api/v4/account?apikey=${apiKey}`)
    
    const accountData = await accountResponse.json()
    console.log('\n💰 Account Status:')
    console.log(JSON.stringify(accountData, null, 2))
    
    // Check recent messages
    const messagesResponse = await fetch(`https://api.semaphore.co/api/v4/messages?apikey=${apiKey}&limit=5`)
    
    const messagesData = await messagesResponse.json()
    console.log('\n📱 Recent Messages:')
    if (Array.isArray(messagesData)) {
      messagesData.forEach((msg: any) => {
        console.log(`- ID: ${msg.message_id} | To: ${msg.recipient} | Status: ${msg.status} | Created: ${msg.created_at}`)
      })
    } else {
      console.log(JSON.stringify(messagesData, null, 2))
    }
    
    // Test sending a priority message (costs 2 credits but more reliable)
    console.log('\n🚀 Testing priority message...')
    const testResponse = await fetch('https://api.semaphore.co/api/v4/priority', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        apikey: apiKey,
        number: '09999986806',
        message: 'BantAI Test: If you receive this, SMS is working! Reply STOP to opt out.',
        sendername: 'SEMAPHORE'
      })
    })
    
    const testData = await testResponse.json()
    console.log('📤 Priority message result:')
    console.log(JSON.stringify(testData, null, 2))
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkSemaphoreAccount()