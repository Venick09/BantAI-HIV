import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function checkAllMessages() {
  const apiKey = process.env.SEMAPHORE_API_KEY
  
  if (!apiKey) {
    console.error('❌ SEMAPHORE_API_KEY not found in environment')
    return
  }
  
  console.log('🔍 Fetching all messages sent to 09999986806...\n')
  
  try {
    // Get messages for this number
    const response = await fetch(`https://api.semaphore.co/api/v4/messages?apikey=${apiKey}&limit=20`)
    const messages = await response.json()
    
    if (Array.isArray(messages)) {
      const targetMessages = messages.filter(msg => 
        msg.recipient === '639999986806' || msg.recipient === '09999986806'
      )
      
      console.log(`📱 Found ${targetMessages.length} messages to your number:\n`)
      
      // Group by status
      const statusGroups = targetMessages.reduce((acc, msg) => {
        if (!acc[msg.status]) acc[msg.status] = []
        acc[msg.status].push(msg)
        return acc
      }, {})
      
      Object.entries(statusGroups).forEach(([status, msgs]) => {
        console.log(`\n${status} (${msgs.length} messages):`)
        msgs.forEach(msg => {
          console.log(`  ID: ${msg.message_id} | Created: ${msg.created_at} | Type: ${msg.type}`)
        })
      })
      
      // Check a recent failed message for details
      const failedMsg = targetMessages.find(msg => msg.status === 'Failed')
      if (failedMsg) {
        console.log('\n❌ Checking details of a failed message...')
        const detailResponse = await fetch(`https://api.semaphore.co/api/v4/messages/${failedMsg.message_id}?apikey=${apiKey}`)
        const detail = await detailResponse.json()
        console.log('Failed message details:', JSON.stringify(detail, null, 2))
      }
      
      // Try sending a simple test
      console.log('\n🧪 Sending a simple test message...')
      const testResponse = await fetch('https://api.semaphore.co/api/v4/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apikey: apiKey,
          number: '09999986806',
          message: 'Test from BantAI'
        })
      })
      
      const testResult = await testResponse.json()
      console.log('Test result:', JSON.stringify(testResult, null, 2))
      
    }
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkAllMessages()