import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function testOTPEndpoint() {
  const apiKey = process.env.SEMAPHORE_API_KEY
  
  console.log('🧪 Testing Semaphore OTP endpoint...\n')
  
  // Test with OTP endpoint (2 credits but dedicated route)
  const otpResponse = await fetch('https://api.semaphore.co/api/v4/otp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      apikey: apiKey,
      number: '09999986806',
      message: 'Your BantAI verification code is: {otp}. This code expires in 10 minutes.'
      // {otp} will be replaced with auto-generated code
    })
  })
  
  const otpData = await otpResponse.json()
  console.log('📱 OTP Endpoint Result:')
  console.log(JSON.stringify(otpData, null, 2))
  
  if (Array.isArray(otpData) && otpData[0]?.code) {
    console.log(`\n✅ Generated OTP Code: ${otpData[0].code}`)
    console.log('💰 Cost: 2 credits (OTP messages always cost 2 credits)')
    console.log('📍 Type:', otpData[0].type)
  }
}

testOTPEndpoint()