import { Phone, MessageCircle, FileCheck, Heart } from "lucide-react"

export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Register with Phone",
      description: "Sign up using just your phone number. Receive an OTP to verify your identity. No personal details required upfront.",
      icon: Phone,
      color: "from-blue-500 to-blue-600"
    },
    {
      number: "02",
      title: "Take Risk Assessment",
      description: "Answer 7 simple questions via SMS or web to determine your HIV risk level. Takes less than 5 minutes.",
      icon: MessageCircle,
      color: "from-purple-500 to-purple-600"
    },
    {
      number: "03",
      title: "Get Your Results",
      description: "Receive your risk level (Low, Moderate, or High) instantly. High-risk individuals get priority referral codes.",
      icon: FileCheck,
      color: "from-green-500 to-green-600"
    },
    {
      number: "04",
      title: "Access Care",
      description: "Get tested at partner centers, start treatment if needed, and receive SMS reminders for medication and appointments.",
      icon: Heart,
      color: "from-red-500 to-pink-600"
    }
  ]

  return (
    <section id="how-it-works" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            How BantAI Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Four simple steps to take control of your HIV health journey
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connection line (except for last item) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-20 left-full w-full h-0.5 bg-gray-300 -z-10" />
              )}
              
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow h-full">
                {/* Step number */}
                <div className="text-4xl font-bold text-gray-200 mb-4">{step.number}</div>
                
                {/* Icon */}
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${step.color} mb-4`}>
                  <step.icon className="h-6 w-6 text-white" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Sample SMS flow */}
        <div className="mt-20 bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-pink-500 p-6 text-white">
            <h3 className="text-2xl font-bold mb-2">See It In Action</h3>
            <p>Experience how simple our SMS-based system works</p>
          </div>
          
          <div className="p-8">
            <div className="max-w-2xl mx-auto">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-sm font-medium">BA</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-2xl rounded-tl-none p-4 inline-block">
                      <p className="text-sm">Hi! Let's check your HIV risk. Reply YES if you've had unprotected sex in the last 6 months.</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4 justify-end">
                  <div className="flex-1 text-right">
                    <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl rounded-tr-none p-4 inline-block">
                      <p className="text-sm">YES</p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">You</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-sm font-medium">BA</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-2xl rounded-tl-none p-4 inline-block">
                      <p className="text-sm">Thank you. Have you had multiple partners in the last 6 months? Reply YES or NO.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-center text-sm text-gray-500 mt-8">
                Continue answering simple questions to get your personalized risk assessment
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}