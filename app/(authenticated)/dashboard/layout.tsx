import { getCustomerByUserId, createCustomer } from "@/actions/customers"
import { ensureUserExists } from "@/actions/users"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import DashboardClientLayout from "./_components/layout-client"

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const user = await currentUser()

  if (!user) {
    redirect("/login")
  }

  // Ensure user exists in our database
  const dbUser = await ensureUserExists(user.id)
  
  if (!dbUser) {
    // If we can't create a user, something is wrong
    throw new Error("Failed to create user record")
  }

  let customer = await getCustomerByUserId(user.id)

  // Create customer if doesn't exist
  if (!customer) {
    const result = await createCustomer(user.id)
    if (result.isSuccess && result.data) {
      customer = result.data
    } else {
      // If customer creation fails, show error
      throw new Error("Failed to create customer record")
    }
  }

  const userData = {
    name:
      user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.firstName || user.username || "User",
    email: user.emailAddresses[0]?.emailAddress || "",
    avatar: user.imageUrl,
    membership: customer.membership
  }

  return (
    <DashboardClientLayout userData={userData}>
      {children}
    </DashboardClientLayout>
  )
}
