"use client"

import { SignIn } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { motion } from "framer-motion"
import { ArrowRight, Heart, Shield, Phone, Users } from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function LoginPage() {
  const { theme } = useTheme()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect') || '/dashboard'

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
        {/* Left side - BantAI benefits */}
        <motion.div
          className="hidden space-y-8 lg:block"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-4">
            <motion.div
              className="inline-block"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <span className="bg-red-100 text-red-600 rounded-full px-3 py-1 text-xs font-medium">
                Welcome back to BantAI
              </span>
            </motion.div>
            <motion.h1
              className="text-4xl font-bold tracking-tight lg:text-5xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Continue your
              <motion.span
                className="mt-2 block bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                }}
                transition={{
                  duration: 5,
                  ease: "linear",
                  repeat: Infinity
                }}
                style={{
                  backgroundSize: "200% 200%"
                }}
              >
                health journey
              </motion.span>
            </motion.h1>
            <motion.p
              className="text-gray-600 text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Access your risk assessments, test results, and treatment reminders.
            </motion.p>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                icon: Shield,
                title: "100% Confidential",
                desc: "Your privacy protected",
                color: "text-green-500",
                bgColor: "bg-green-500/10"
              },
              {
                icon: Phone,
                title: "SMS Updates",
                desc: "Stay informed",
                color: "text-blue-500",
                bgColor: "bg-blue-500/10"
              },
              {
                icon: Heart,
                title: "Compassionate Care",
                desc: "Non-judgmental support",
                color: "text-red-500",
                bgColor: "bg-red-500/10"
              },
              {
                icon: Users,
                title: "Expert Network",
                desc: "Trusted providers",
                color: "text-purple-500",
                bgColor: "bg-purple-500/10"
              }
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                className="bg-white group relative overflow-hidden rounded-lg border border-gray-200 p-4 transition-all hover:shadow-lg"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 20px rgba(0,0,0,0.1)"
                }}
              >
                <motion.div
                  className={`${feature.bgColor} mb-2 inline-flex rounded-lg p-2`}
                  initial={{ rotate: -10 }}
                  animate={{ rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: 0.4 + i * 0.1
                  }}
                  whileHover={{ rotate: 10 }}
                >
                  <feature.icon className={`h-5 w-5 ${feature.color}`} />
                </motion.div>
                <p className="text-sm font-semibold text-gray-900">{feature.title}</p>
                <p className="text-xs text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <motion.div
            className="bg-gradient-to-r from-red-50 to-pink-50 space-y-4 rounded-xl border border-red-200 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            whileHover={{
              boxShadow: "0 8px 30px -10px rgba(239, 68, 68, 0.3)"
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">10,000+</p>
                <p className="text-sm text-gray-600">
                  Filipinos served
                </p>
              </div>
              <div className="h-12 w-px border-l border-red-200" />
              <div>
                <p className="text-2xl font-bold text-gray-900">95%</p>
                <p className="text-sm text-gray-600">
                  User satisfaction
                </p>
              </div>
              <div className="h-12 w-px border-l border-red-200" />
              <div>
                <p className="text-2xl font-bold text-gray-900">24/7</p>
                <p className="text-sm text-gray-600">Available support</p>
              </div>
            </div>
          </motion.div>

          {/* Trust badge */}
          <motion.div
            className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            whileHover={{
              scale: 1.02,
              boxShadow: "0 4px 15px rgba(34, 197, 94, 0.2)"
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <Shield className="h-5 w-5 text-green-600" />
            </motion.div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Government Approved</p>
              <p className="text-xs text-gray-600">
                Protected by RA 11166 & RA 10173
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Right side - Sign in form */}
        <motion.div
          className="mx-auto w-full max-w-md lg:mx-0"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div
            className="mb-8 text-center lg:text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="mb-2 text-2xl font-semibold text-gray-900">
              Sign in to your account
            </h2>
            <p className="text-sm text-gray-600">
              New to BantAI?{" "}
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="inline-block"
              >
                <Link
                  href="/register"
                  className="text-red-600 font-medium transition-colors hover:underline"
                >
                  Create free account
                  <ArrowRight className="ml-1 inline h-3 w-3" />
                </Link>
              </motion.span>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="relative"
          >
            <motion.div
              className="absolute -inset-1 rounded-lg bg-gradient-to-r from-red-200 to-pink-200 opacity-50 blur-xl"
              animate={{
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <SignIn
              forceRedirectUrl={redirectUrl}
              signUpUrl="/register"
              appearance={{ 
                baseTheme: theme === "dark" ? dark : undefined,
                elements: {
                  formButtonPrimary: "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600",
                  footerActionLink: "text-red-600 hover:text-red-700"
                }
              }}
            />
          </motion.div>

          <motion.div
            className="mt-6 space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-3 text-gray-500">Or</span>
              </div>
            </div>
            
            <div className="text-center">
              <Link
                href="/login-phone"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
              >
                <Phone className="h-4 w-4" />
                Sign in with phone number
              </Link>
            </div>
            
            <p className="text-center text-xs text-gray-500">
              Need help? Call our 24/7 hotline:{" "}
              <Link href="tel:1800HIVHELP" className="font-semibold text-red-600">
                1-800-HIV-HELP
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}