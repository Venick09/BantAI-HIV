"use client"

import { Button } from "@/components/ui/button"
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import { Menu, X, Phone, Heart } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"

export function BantAIHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const navigation = [
    { name: "About", href: "/#about" },
    { name: "Services", href: "/#services" },
    { name: "How It Works", href: "/#how-it-works" },
    { name: "Contact", href: "/#contact" }
  ]

  // Handle smooth scrolling for hash links
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')
      
      if (link && link.href.includes('#')) {
        const hash = link.href.split('#')[1]
        if (hash) {
          e.preventDefault()
          const element = document.getElementById(hash)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
            setMobileMenuOpen(false)
          } else if (pathname !== '/') {
            // If we're not on homepage, navigate there first
            window.location.href = link.href
          }
        }
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [pathname])

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-lg p-2">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900">BantAI</span>
                <span className="text-xs text-gray-600 block -mt-1">HIV Platform</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            <Link 
              href="tel:1800HIVHELP" 
              className="flex items-center space-x-2 text-sm text-gray-700 hover:text-red-600"
            >
              <Phone className="h-4 w-4" />
              <span>1-800-HIV-HELP</span>
            </Link>
            
            <SignedOut>
              <Button variant="outline" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600" asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </SignedOut>
            
            <SignedIn>
              <Button className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-red-600"
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="border-t border-gray-200 pt-3">
                <Link 
                  href="tel:1800HIVHELP" 
                  className="flex items-center space-x-2 px-3 py-2 text-base font-medium text-gray-700"
                >
                  <Phone className="h-4 w-4" />
                  <span>1-800-HIV-HELP</span>
                </Link>
              </div>
              
              <div className="border-t border-gray-200 pt-3 space-y-2">
                <SignedOut>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button className="w-full bg-gradient-to-r from-red-500 to-pink-500" asChild>
                    <Link href="/register">Get Started</Link>
                  </Button>
                </SignedOut>
                
                <SignedIn>
                  <Button className="w-full bg-gradient-to-r from-red-500 to-pink-500" asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                </SignedIn>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}