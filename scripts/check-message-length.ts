const message = `Welcome to BantAI HIV Platform!

Your verification code is: 123456

This code expires in 10 minutes.`

console.log('📱 Message Analysis:')
console.log('==================')
console.log('Message:', message)
console.log('\nCharacter count:', message.length)
console.log('SMS segments needed:', Math.ceil(message.length / 160))

// Check if it's using Unicode characters
const hasUnicode = /[^\x00-\x7F]/.test(message)
console.log('Contains Unicode:', hasUnicode)

// Count line breaks
const lineBreaks = (message.match(/\n/g) || []).length
console.log('Line breaks:', lineBreaks)

console.log('\n💡 SMS Pricing Info:')
console.log('- Standard SMS: 160 characters = 1 credit')
console.log('- Multi-part SMS: 153 characters per segment')
console.log('- Your message needs:', Math.ceil(message.length / 153), 'segments (if multi-part)')
console.log('- Total cost: 2 credits')

console.log('\n📊 Credit Usage Breakdown:')
console.log('- Each failed SMS to 09999986806 = 2 credits (deducted immediately)')
console.log('- Refund for failed delivery = 2 credits (may take time)')
console.log('- Net cost after refund = 0 credits')

console.log('\n⚠️  Important:')
console.log('- Semaphore charges upfront when accepting the message')
console.log('- Refunds for failed messages can take hours or days')
console.log('- Check your Semaphore dashboard for refund status')
console.log('- Use a VALID phone number to avoid failed deliveries')