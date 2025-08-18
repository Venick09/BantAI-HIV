"use client"

import { Button } from "@/components/ui/button"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, Heart, Phone } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export function StickyCTA() {
  const [dismissed, setDismissed] = useState(false)
  return (
    <AnimatePresence>
      {!dismissed && (
        <>
          {/* Mobile version - bottom bar */}
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 bottom-0 left-0 z-50 border-t border-gray-200 bg-white/95 p-4 backdrop-blur-lg md:hidden"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-600">
                  Get confidential HIV support
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  Start your free assessment now
                </p>
              </div>
              <Button size="sm" asChild className="group bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600">
                <Link href="/register">
                  Get Started
                  <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              {/* Close button */}
              <button
                aria-label="Dismiss"
                onClick={() => setDismissed(true)}
                className="ml-2 rounded-full p-1 hover:bg-gray-100"
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4l8 8m0-8l-8 8"
                  />
                </svg>
              </button>
            </div>
          </motion.div>

          {/* Desktop version - bottom right */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-6 bottom-6 z-50 hidden max-w-sm min-w-[350px] rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl md:block"
          >
            <button
              aria-label="Dismiss"
              onClick={() => setDismissed(true)}
              className="absolute top-3 right-3 rounded-full p-1 hover:bg-gray-100"
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 5l8 8m0-8l-8 8"
                />
              </svg>
            </button>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-lg p-2">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Need HIV support?
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    Free & Confidential Help
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Take a 5-minute risk assessment to understand your HIV status and get connected to care.
              </p>
              <Button asChild className="group w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600">
                <Link href="/register">
                  Start Assessment
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <Phone className="h-3 w-3" />
                <span>Or call 1-800-HIV-HELP</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}