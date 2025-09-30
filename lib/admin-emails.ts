// List of email addresses that should automatically be granted admin access
// IMPORTANT: Replace these with your actual admin email addresses
export const ADMIN_EMAILS = [
  // Add your admin email here
  'leannemarasigan30@gmail.com', // Replace with your actual admin email
  // You can add multiple admin emails as needed
  // Example: 'john.doe@company.com',
  // Example: 'admin@bantai.ph',
]

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase())
}