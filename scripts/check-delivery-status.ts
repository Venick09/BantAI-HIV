import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function checkDeliveryStatus() {
  const apiKey = process.env.SEMAPHORE_API_KEY
  
  if (!apiKey) {
    console.error('❌ SEMAPHORE_API_KEY not found in environment')
    return
  }
  
  // List of message IDs to check (from your recent attempts)
  const messageIds = [
    '253291312', // Latest
    '253291289', // Priority test
    '253291277',
    '253291262',
    '253291221',
    '253291203'
  ]
  
  console.log('🔍 Checking delivery status for recent messages...\n')
  
  for (const messageId of messageIds) {
    try {
      const response = await fetch(`https://api.semaphore.co/api/v4/messages/${messageId}?apikey=${apiKey}`)
      const data = await response.json()
      
      if (Array.isArray(data) && data.length > 0) {
        const msg = data[0]
        console.log(`📱 Message ID: ${msg.message_id}`)
        console.log(`   To: ${msg.recipient} (${msg.network})`)
        console.log(`   Status: ${msg.status}`)
        console.log(`   Type: ${msg.type}`)
        console.log(`   Created: ${msg.created_at}`)
        console.log(`   Updated: ${msg.updated_at}`)
        
        // Check if there's any error info
        if (msg.error_code || msg.error_message) {
          console.log(`   ❌ Error: ${msg.error_message || msg.error_code}`)
        }
        
        console.log('   ---')
      } else {
        console.log(`❌ No data for message ${messageId}`)
      }
    } catch (error) {
      console.log(`❌ Error checking message ${messageId}:`, error)
    }
  }
  
  // Check if the number might be blocked
  console.log('\n💡 Possible reasons for non-delivery:')
  console.log('1. Number is inactive or doesn\'t exist')
  console.log('2. Number has DND (Do Not Disturb) enabled')
  console.log('3. Network issues with Smart')
  console.log('4. Number format issue (try with +63 prefix)')
  console.log('5. Sender name "SEMAPHORE" might be blocked by carrier')
  
  // Let's try sending with different format
  console.log('\n🧪 Testing with international format (+639999986806)...')
  
  const testResponse = await fetch('https://api.semaphore.co/api/v4/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      apikey: apiKey,
      number: '+639999986806', // Try with + prefix
      message: 'Test from BantAI with international format',
      sendername: 'INFO' // Try different sender name
    })
  })
  
  const testData = await testResponse.json()
  console.log('Result:', JSON.stringify(testData, null, 2))
}

checkDeliveryStatus()