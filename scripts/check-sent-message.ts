import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function checkSentMessage() {
  const apiKey = process.env.SEMAPHORE_API_KEY
  
  console.log('🔍 Checking the message that shows "Sent" status...\n')
  
  // Check the sent message
  const response1 = await fetch(`https://api.semaphore.co/api/v4/messages/253291386?apikey=${apiKey}`)
  const msg1 = await response1.json()
  
  console.log('Message 253291386 (Sent):')
  console.log(JSON.stringify(msg1, null, 2))
  
  // Wait a bit and check the test message
  console.log('\n⏳ Waiting 5 seconds to check test message status...')
  await new Promise(resolve => setTimeout(resolve, 5000))
  
  const response2 = await fetch(`https://api.semaphore.co/api/v4/messages/253291675?apikey=${apiKey}`)
  const msg2 = await response2.json()
  
  console.log('\nMessage 253291675 (Test):')
  console.log(JSON.stringify(msg2, null, 2))
  
  // Check your account/balance
  console.log('\n💰 Checking account balance...')
  const accountResponse = await fetch(`https://api.semaphore.co/api/v4/account?apikey=${apiKey}`)
  const account = await accountResponse.json()
  console.log('Account:', JSON.stringify(account, null, 2))
}

checkSentMessage()