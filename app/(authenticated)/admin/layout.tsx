import { redirect } from 'next/navigation'
import { isAdmin } from '@/middleware/admin'
import AdminSidebar from './_components/admin-sidebar'

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  const admin = await isAdmin()
  
  if (!admin) {
    redirect('/dashboard/admin-access')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}