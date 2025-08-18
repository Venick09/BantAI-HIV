import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Shield, Phone, Heart, ArrowRight, CheckCircle } from "lucide-react"

export function BantAIHeroSection() {
  const benefits = [
    "100% Confidential & Private",
    "Free HIV Testing & Care",
    "SMS-Based - No App Needed",
    "Government Approved"
  ]

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-red-50 via-pink-50 to-white">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-red-200 to-pink-200 opacity-30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-tr from-pink-200 to-red-200 opacity-30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          {/* Left column - Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800 mb-6">
              <Shield className="mr-2 h-4 w-4" />
              Protected by Philippine Law
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Your Health,{" "}
              <span className="bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                Your Privacy
              </span>
            </h1>
            
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl">
              Take control of your HIV health journey with BantAI. Get free, confidential risk assessment, 
              testing referrals, and treatment support - all through simple SMS messages.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                asChild 
                size="lg" 
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg"
              >
                <Link href="/register" className="group">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="lg" className="border-2">
                <Link href="#how-it-works">
                  See How It Works
                </Link>
              </Button>
            </div>

            <div className="mt-12 space-y-3">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right column - Visual */}
          <div className="relative lg:pl-8">
            <div className="relative mx-auto max-w-md">
              {/* Phone mockup */}
              <div className="relative rounded-3xl bg-gray-900 p-2 shadow-2xl">
                <div className="rounded-2xl bg-white p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-xs text-gray-500">SMS Conversation</span>
                    <span className="text-xs text-gray-500">Now</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-start">
                      <div className="rounded-2xl rounded-bl-none bg-gray-100 p-3 max-w-[80%]">
                        <p className="text-sm">Welcome to BantAI! I'm here to help you with confidential HIV services. Reply START to begin.</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <div className="rounded-2xl rounded-br-none bg-gradient-to-r from-red-500 to-pink-500 p-3 text-white max-w-[80%]">
                        <p className="text-sm">START</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-start">
                      <div className="rounded-2xl rounded-bl-none bg-gray-100 p-3 max-w-[80%]">
                        <p className="text-sm">Great! Let's assess your HIV risk with a few questions. Your answers are 100% confidential. Ready?</p>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <div className="rounded-2xl rounded-br-none bg-gradient-to-r from-red-500 to-pink-500 p-3 text-white max-w-[80%]">
                        <p className="text-sm">Yes</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats cards */}
              <div className="absolute -bottom-6 -left-6 rounded-lg bg-white p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-green-100 p-2">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">100%</p>
                    <p className="text-sm text-gray-600">Confidential</p>
                  </div>
                </div>
              </div>

              <div className="absolute -top-6 -right-6 rounded-lg bg-white p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-blue-100 p-2">
                    <Phone className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">24/7</p>
                    <p className="text-sm text-gray-600">Available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-20 border-t border-gray-200 pt-12">
          <p className="text-center text-sm text-gray-600 mb-6">Trusted by healthcare providers across the Philippines</p>
          <div className="flex flex-wrap justify-center gap-8 items-center">
            <div className="text-gray-400">
              <span className="font-semibold">Department of Health</span>
            </div>
            <div className="text-gray-400">
              <span className="font-semibold">Philippine National AIDS Council</span>
            </div>
            <div className="text-gray-400">
              <span className="font-semibold">WHO Philippines</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}