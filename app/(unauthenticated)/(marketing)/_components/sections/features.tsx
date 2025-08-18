import { Shield, Phone, Clock, MapPin, Bell, BarChart } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Shield,
      title: "100% Confidential",
      description: "Your data is protected by RA 11166 and RA 10173. Only you control who sees your information.",
      gradient: "from-green-500 to-emerald-600"
    },
    {
      icon: Phone,
      title: "SMS-Based System",
      description: "No app downloads needed. Works on any phone with SMS capability. Simple and accessible.",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      icon: Clock,
      title: "24/7 Availability",
      description: "Access risk assessment, get referrals, and receive support anytime, anywhere in the Philippines.",
      gradient: "from-purple-500 to-purple-600"
    },
    {
      icon: MapPin,
      title: "Nationwide Coverage",
      description: "Connected to HIV testing centers across all major cities and provinces in the Philippines.",
      gradient: "from-orange-500 to-orange-600"
    },
    {
      icon: Bell,
      title: "Smart Reminders",
      description: "Automated SMS reminders for medication, appointments, and follow-up tests to keep you healthy.",
      gradient: "from-pink-500 to-pink-600"
    },
    {
      icon: BarChart,
      title: "Track Your Journey",
      description: "Monitor your health progress from testing to treatment, all in one secure platform.",
      gradient: "from-red-500 to-red-600"
    }
  ]

  return (
    <section id="services" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Why Choose BantAI?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Built for Filipinos, by Filipinos. A complete HIV care platform that respects your privacy while providing world-class healthcare access.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div 
              key={feature.title} 
              className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              {/* Hover effect gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative">
                {/* Icon */}
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.gradient} shadow-lg mb-6`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Statistics */}
        <div className="mt-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-3xl p-12 text-white">
          <h3 className="text-2xl font-bold text-center mb-12">Making a Real Impact</h3>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-red-100">Filipinos Served</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-red-100">User Satisfaction</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">&lt; 30s</div>
              <div className="text-red-100">SMS Response Time</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100%</div>
              <div className="text-red-100">Free Forever</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}