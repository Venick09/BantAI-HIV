import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function testNumberFormats() {
  const apiKey = process.env.SEMAPHORE_API_KEY
  
  console.log('🧪 Testing different number formats and messages...\n')
  
  const tests = [
    { number: '9999986806', desc: 'Without 0 prefix' },
    { number: '+639999986806', desc: 'With +63 country code' },
    { number: '09999986806', desc: 'Standard format' }
  ]
  
  for (const test of tests) {
    console.log(`\n📱 Testing: ${test.desc} (${test.number})`)
    
    try {
      const response = await fetch('https://api.semaphore.co/api/v4/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apikey: apiKey,
          number: test.number,
          message: `BantAI test ${Date.now()}`
        })
      })
      
      const result = await response.json()
      
      if (Array.isArray(result) && result[0]) {
        console.log(`✅ Accepted - Message ID: ${result[0].message_id}, Status: ${result[0].status}`)
        
        // Wait and check status
        await new Promise(resolve => setTimeout(resolve, 3000))
        
        const statusResponse = await fetch(`https://api.semaphore.co/api/v4/messages/${result[0].message_id}?apikey=${apiKey}`)
        const status = await statusResponse.json()
        
        if (Array.isArray(status) && status[0]) {
          console.log(`   Status after 3s: ${status[0].status}`)
        }
      } else {
        console.log(`❌ Error:`, result)
      }
    } catch (error) {
      console.log(`❌ Exception:`, error)
    }
  }
  
  console.log('\n💡 Contact Semaphore support:')
  console.log('- Your account is active with credits')
  console.log('- Messages are being accepted but failing at carrier level')
  console.log('- All messages to 09999986806 are failing except one')
  console.log('- This suggests a carrier/routing issue that Semaphore needs to investigate')
}

testNumberFormats()