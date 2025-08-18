// Direct test of OTP generation
const { OTPService } = require('./lib/sms/otp');
const { SMSService } = require('./lib/sms/sms-service');

async function testOTP() {
  console.log('='.repeat(60));
  console.log('TESTING OTP FOR: 09999986806');
  console.log('='.repeat(60));
  
  try {
    // Test 1: Direct OTP generation
    console.log('\n1. Testing direct OTP generation...');
    const otp = await OTPService.createOTP('09999986806', 'registration');
    console.log('OTP Generated:', otp);
    
    // Test 2: SMS Service
    console.log('\n2. Testing SMS service...');
    const smsService = new SMSService();
    await smsService.initialize();
    
    const message = `Your BantAI verification code is: ${otp}`;
    const result = await smsService.sendSMS('09999986806', message, undefined, 'otp');
    console.log('SMS Result:', result);
    
  } catch (error) {
    console.error('ERROR:', error);
  }
}

// Run the test
testOTP();