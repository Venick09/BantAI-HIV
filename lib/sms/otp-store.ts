// Store the last generated OTP for development display
export const lastOTPStore: { [phoneNumber: string]: { otp: string; timestamp: number } } = {}

// Export function to store OTP (called from other parts of the app)
export function storeLastOTP(phoneNumber: string, otp: string) {
  lastOTPStore[phoneNumber] = {
    otp,
    timestamp: Date.now()
  }
}