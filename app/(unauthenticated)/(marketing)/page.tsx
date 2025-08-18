import { BantAIHeroSection } from "./_components/sections/bantai-hero"
import { HowItWorksSection } from "./_components/sections/how-it-works"
import { FeaturesSection } from "./_components/sections/features"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Phone, Mail, MapPin, ArrowRight, Shield, Heart } from "lucide-react"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <BantAIHeroSection />
      
      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                About BantAI HIV Platform
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                BantAI is a government-backed initiative designed to combat the HIV epidemic in the Philippines through 
                innovative technology and compassionate care. We believe that everyone deserves access to confidential, 
                stigma-free HIV services.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Our platform combines cutting-edge technology with the simplicity of SMS messaging to ensure that every 
                Filipino, regardless of their location or resources, can access HIV prevention, testing, and treatment services.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-red-100 rounded-full p-2 mt-1">
                    <Shield className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Privacy First</h3>
                    <p className="text-gray-600">Protected by RA 11166 and RA 10173, ensuring complete confidentiality</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-red-100 rounded-full p-2 mt-1">
                    <Heart className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Compassionate Care</h3>
                    <p className="text-gray-600">Non-judgmental support from registration to treatment</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-red-100 rounded-full p-2 mt-1">
                    <Phone className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Accessible to All</h3>
                    <p className="text-gray-600">Works on any phone with SMS - no smartphone required</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-3xl p-12">
              <div className="text-center space-y-8">
                <h3 className="text-2xl font-bold text-gray-900">Our Mission</h3>
                <p className="text-lg text-gray-700 italic">
                  "To eliminate new HIV infections in the Philippines by 2030 through accessible technology, 
                  early detection, and comprehensive care support."
                </p>
                <div className="pt-8 border-t border-red-200">
                  <p className="text-sm text-gray-600 mb-4">In partnership with:</p>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>Department of Health</p>
                    <p>Philippine National AIDS Council</p>
                    <p>WHO Philippines</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <HowItWorksSection />
      <FeaturesSection />
      
      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to know about BantAI HIV Platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                q: "Is my information really confidential?",
                a: "Yes. We comply with RA 11166 (HIV and AIDS Policy Act) and RA 10173 (Data Privacy Act). Your data is encrypted and only accessible by you and authorized healthcare providers with your consent."
              },
              {
                q: "How much does it cost?",
                a: "BantAI is completely free for all users. This includes risk assessment, testing referrals, and treatment reminders. The service is funded by the government to ensure healthcare access for all."
              },
              {
                q: "Do I need a smartphone?",
                a: "No. BantAI works via SMS on any mobile phone. You can also access the web platform if you prefer, but it's not required."
              },
              {
                q: "What happens if I test positive?",
                a: "You'll receive immediate support, referral to treatment centers, and ongoing care management. We'll help you start ART (antiretroviral therapy) and send medication reminders to keep you healthy."
              }
            ].map((faq, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{faq.q}</h3>
                  <p className="text-gray-600">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-red-500 to-pink-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Take the First Step Today
          </h2>
          <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            Join thousands of Filipinos who have taken control of their HIV health journey with BantAI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              asChild 
              size="lg" 
              className="bg-white text-red-600 hover:bg-gray-100 shadow-lg"
            >
              <Link href="/register" className="group">
                Start Free Assessment
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button 
              asChild 
              size="lg" 
              variant="outline" 
              className="border-2 border-white text-white hover:bg-white hover:text-red-600"
            >
              <Link href="/test-otp">
                Try Demo First
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Get in Touch
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Have questions? Need support? Our team is here to help you 24/7. 
                All inquiries are handled with complete confidentiality.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="bg-red-100 p-3 rounded-lg">
                    <Phone className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Hotline</p>
                    <p className="text-gray-600">1-800-HIV-HELP (448-4357)</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="bg-red-100 p-3 rounded-lg">
                    <Mail className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Email</p>
                    <p className="text-gray-600">support@bantai.ph</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="bg-red-100 p-3 rounded-lg">
                    <MapPin className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Main Office</p>
                    <p className="text-gray-600">Department of Health Building<br />San Lazaro Compound, Manila</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-xl font-semibold mb-6">Send us a message</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name (Optional)</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="09XX XXX XXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea 
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="How can we help you?"
                  />
                </div>
                <Button className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600">
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-semibold mb-4">About BantAI</h4>
              <p className="text-sm">
                A government-backed HIV prevention and care platform providing free, 
                confidential services to all Filipinos.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link href="/partners" className="hover:text-white">Partners</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">HIV Facts</a></li>
                <li><a href="#" className="hover:text-white">Prevention Tips</a></li>
                <li><a href="#" className="hover:text-white">Treatment Info</a></li>
                <li><a href="#" className="hover:text-white">Support Groups</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Emergency</h4>
              <p className="text-sm mb-2">24/7 HIV Hotline:</p>
              <p className="text-xl text-white font-semibold">1-800-HIV-HELP</p>
              <p className="text-sm mt-4">
                For immediate medical emergency, call 911
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© 2024 BantAI HIV Platform. All rights reserved.</p>
            <p className="mt-2">
              In partnership with the Department of Health and Philippine National AIDS Council
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}