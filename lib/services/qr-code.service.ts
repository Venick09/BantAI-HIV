import QRCode from 'qrcode'
import { db } from '@/db'
import { referrals } from '@/db/schema'
import { eq } from 'drizzle-orm'

export interface QRCodeData {
  referralCode: string
  userId: string
  testCenterId?: string
  riskLevel: 'low' | 'moderate' | 'high'
  expiresAt: Date
}

export class QRCodeService {
  private readonly baseUrl: string

  constructor(baseUrl?: string) {
    // In production, this would be your actual domain
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_BASE_URL || 'https://bantai-hiv.ph'
  }

  /**
   * Generate a QR code for a referral
   * @param data QR code data including referral code and user info
   * @returns Base64 encoded QR code image or URL to stored image
   */
  async generateReferralQRCode(data: QRCodeData): Promise<{ success: boolean; qrCodeUrl?: string; error?: string }> {
    try {
      // Create the data URL that the QR code will contain
      // This URL can be scanned by test centers to quickly look up the referral
      const referralUrl = `${this.baseUrl}/referral/verify/${data.referralCode}`
      
      // Additional data to encode (can be used by test center apps)
      const qrData = {
        url: referralUrl,
        code: data.referralCode,
        risk: data.riskLevel,
        expires: data.expiresAt.toISOString()
      }

      // Generate QR code options
      const qrOptions: QRCode.QRCodeToDataURLOptions = {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }

      // Generate QR code as base64 data URL
      const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), qrOptions)

      // In a production environment, you would:
      // 1. Upload this to a cloud storage service (S3, Cloudinary, etc.)
      // 2. Get back a permanent URL
      // 3. Store that URL in the database
      
      // For now, we'll store the data URL directly (not recommended for production)
      // Update the referral with the QR code URL
      await db
        .update(referrals)
        .set({ 
          qrCodeUrl: qrCodeDataUrl,
          updatedAt: new Date()
        })
        .where(eq(referrals.referralCode, data.referralCode))

      return {
        success: true,
        qrCodeUrl: qrCodeDataUrl
      }

    } catch (error) {
      console.error('QR code generation error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate QR code'
      }
    }
  }

  /**
   * Generate a QR code with custom styling for high-risk referrals
   */
  async generatePriorityQRCode(data: QRCodeData): Promise<{ success: boolean; qrCodeUrl?: string; error?: string }> {
    try {
      const referralUrl = `${this.baseUrl}/referral/priority/${data.referralCode}`
      
      const qrData = {
        url: referralUrl,
        code: data.referralCode,
        priority: true,
        risk: 'high',
        expires: data.expiresAt.toISOString()
      }

      // High priority QR codes get red accent color
      const qrOptions: QRCode.QRCodeToDataURLOptions = {
        errorCorrectionLevel: 'H', // Higher error correction for priority cases
        type: 'image/png',
        width: 400, // Larger size for easier scanning
        margin: 3,
        color: {
          dark: '#DC2626', // Red color for urgency
          light: '#FFFFFF'
        }
      }

      const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), qrOptions)

      await db
        .update(referrals)
        .set({ 
          qrCodeUrl: qrCodeDataUrl,
          updatedAt: new Date()
        })
        .where(eq(referrals.referralCode, data.referralCode))

      return {
        success: true,
        qrCodeUrl: qrCodeDataUrl
      }

    } catch (error) {
      console.error('Priority QR code generation error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate priority QR code'
      }
    }
  }

  /**
   * Generate a simple text-based QR code for SMS delivery
   * This generates a smaller QR that can be sent as a link
   */
  async generateSMSFriendlyQRCode(referralCode: string): Promise<{ success: boolean; shortUrl?: string; error?: string }> {
    try {
      // For SMS, we need a short URL that redirects to the QR code
      // In production, you'd use a URL shortener service
      const shortUrl = `${this.baseUrl}/qr/${referralCode}`
      
      // This would typically involve:
      // 1. Generating the QR code
      // 2. Uploading it to storage
      // 3. Creating a short URL that redirects to the QR image
      // 4. Returning the short URL for SMS

      return {
        success: true,
        shortUrl
      }

    } catch (error) {
      console.error('SMS QR generation error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate SMS-friendly QR code'
      }
    }
  }

  /**
   * Verify and decode a QR code data
   */
  decodeQRData(qrContent: string): { valid: boolean; data?: any; error?: string } {
    try {
      const data = JSON.parse(qrContent)
      
      // Validate required fields
      if (!data.code || !data.expires) {
        return {
          valid: false,
          error: 'Invalid QR code format'
        }
      }

      // Check if expired
      const expiryDate = new Date(data.expires)
      if (expiryDate < new Date()) {
        return {
          valid: false,
          error: 'QR code has expired'
        }
      }

      return {
        valid: true,
        data
      }

    } catch (error) {
      return {
        valid: false,
        error: 'Invalid QR code data'
      }
    }
  }
}