'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Activity,
  MessageSquare,
  Settings,
  Shield,
  BarChart3,
  TestTube,
  Calendar,
  DollarSign,
  LogOut,
  Home,
  Pill,
  Bell,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useClerk } from '@clerk/nextjs'
import { useState } from 'react'

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/admin', 
    icon: LayoutDashboard,
    exact: true 
  },
  
  // Patient Management Section
  {
    name: 'Patient Management',
    icon: Users,
    isSection: true,
    items: [
      { name: 'All Patients', href: '/admin/users', icon: Users },
      { name: 'Risk Assessments', href: '/admin/assessments', icon: FileText },
      { name: 'Test Results', href: '/admin/test-results', icon: TestTube },
    ]
  },
  
  // Treatment & Care Section
  {
    name: 'Treatment & Care',
    icon: Pill,
    isSection: true,
    items: [
      { name: 'ART Management', href: '/admin/art', icon: Pill },
      { name: 'Appointments', href: '/admin/appointments', icon: Calendar },
      { name: 'Reminders', href: '/admin/reminders', icon: Bell },
    ]
  },
  
  // System & Reports Section
  {
    name: 'System & Reports',
    icon: BarChart3,
    isSection: true,
    items: [
      { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
      { name: 'SMS Logs', href: '/admin/sms-logs', icon: MessageSquare },
      { name: 'Billing', href: '/admin/billing', icon: DollarSign },
    ]
  },
  
  // Admin Section
  {
    name: 'Administration',
    icon: Settings,
    isSection: true,
    items: [
      { name: 'System Settings', href: '/admin/settings', icon: Settings },
      { name: 'SMS Templates', href: '/admin/sms-templates', icon: MessageSquare },
    ]
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const { signOut } = useClerk()
  const [expandedSections, setExpandedSections] = useState<string[]>(['Patient Management', 'Treatment & Care'])

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionName)
        ? prev.filter(name => name !== sectionName)
        : [...prev, sectionName]
    )
  }

  const isItemActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href
    }
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <aside className="w-72 bg-gradient-to-b from-gray-900 to-gray-950 text-white">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <Shield className="h-8 w-8 text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold">BantAI Admin</h2>
              <p className="text-xs text-gray-400">HIV Management System</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            if (item.isSection) {
              const isExpanded = expandedSections.includes(item.name)
              const hasActiveChild = item.items?.some(child => isItemActive(child.href))
              
              return (
                <div key={item.name} className="space-y-1">
                  <button
                    onClick={() => toggleSection(item.name)}
                    className={`
                      w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all
                      ${hasActiveChild ? 'text-white bg-gray-800/50' : 'text-gray-400 hover:text-white hover:bg-gray-800/30'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  
                  {isExpanded && item.items && (
                    <div className="ml-4 space-y-1">
                      {item.items.map((subItem) => {
                        const isActive = isItemActive(subItem.href)
                        
                        return (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className={`
                              flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all
                              ${isActive 
                                ? 'bg-red-500/20 text-white font-medium' 
                                : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
                              }
                            `}
                          >
                            <subItem.icon className="h-4 w-4" />
                            {subItem.name}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }
            
            // Single item (like Dashboard)
            const isActive = isItemActive(item.href, item.exact)
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all
                  ${isActive 
                    ? 'bg-red-500/20 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/30'
                  }
                `}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 space-y-2">
          <Link href="/dashboard" className="block">
            <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all">
              <Home className="h-4 w-4 mr-3" />
              Patient Dashboard
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-gray-400 hover:text-white hover:bg-red-500/20 transition-all"
            onClick={() => signOut()}
          >
            <LogOut className="h-4 w-4 mr-3" />
            Sign Out
          </Button>
        </div>
      </div>
    </aside>
  )
}