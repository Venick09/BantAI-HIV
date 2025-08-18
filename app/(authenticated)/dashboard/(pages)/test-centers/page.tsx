'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MapPin, Phone, Clock, Search, Navigation, ShieldCheck, Filter } from 'lucide-react'
import { getTestCenters } from '@/actions/test-center'

interface TestCenter {
  id: string
  name: string
  code: string
  address: string
  city: string
  province: string
  contactNumber: string
  operatingHours: string
  isActive: boolean
}

export default function TestCentersPage() {
  const [testCenters, setTestCenters] = useState<TestCenter[]>([])
  const [filteredCenters, setFilteredCenters] = useState<TestCenter[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCity, setSelectedCity] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTestCenters()
  }, [])

  useEffect(() => {
    // Filter test centers based on search term and city
    let filtered = testCenters
    
    if (selectedCity !== 'all') {
      filtered = filtered.filter(center => center.city === selectedCity)
    }
    
    if (searchTerm) {
      filtered = filtered.filter(center => 
        center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        center.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        center.province.toLowerCase().includes(searchTerm.toLowerCase()) ||
        center.address.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    setFilteredCenters(filtered)
  }, [searchTerm, selectedCity, testCenters])

  const loadTestCenters = async () => {
    try {
      const centers = await getTestCenters()
      setTestCenters(centers)
      setFilteredCenters(centers)
    } catch (error) {
      console.error('Failed to load test centers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCallCenter = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`
  }

  const handleGetDirections = (address: string) => {
    const encodedAddress = encodeURIComponent(address)
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank')
  }

  // Get unique cities from test centers
  const cities = ['all', ...new Set(testCenters.map(center => center.city))].sort()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-50 rounded-full">
              <MapPin className="h-8 w-8 text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Find Testing Centers</h1>
              <p className="text-gray-600">Free and confidential HIV testing near you</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search centers, cities, or addresses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 bg-gray-50 border-gray-200"
              />
            </div>
            <div className="relative sm:w-48">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full h-12 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Cities</option>
                {cities.slice(1).map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Results Summary */}
        {!loading && (
          <div className="mb-6 flex items-center justify-between">
            <p className="text-gray-600">
              {filteredCenters.length} {filteredCenters.length === 1 ? 'center' : 'centers'} found
              {selectedCity !== 'all' && ` in ${selectedCity}`}
            </p>
            <Badge className="bg-green-100 text-green-700 border-0">
              Free Testing Available
            </Badge>
          </div>
        )}

        {/* Test Centers */}
        {loading ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-12 text-center">
              <div className="animate-pulse">
                <div className="h-8 w-48 bg-gray-200 rounded mx-auto"></div>
              </div>
            </CardContent>
          </Card>
        ) : filteredCenters.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-12 text-center">
              <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No test centers found</p>
              <p className="text-sm text-gray-400 mt-2">Try adjusting your search or filters</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredCenters.map((center) => (
              <Card key={center.id} className="border-0 shadow-sm hover:shadow-md transition-all overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {/* Center Info */}
                  <CardContent className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{center.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">Center Code: {center.code}</p>
                      </div>
                      <Badge className={center.isActive ? 'bg-green-100 text-green-700 border-0' : 'bg-gray-100 text-gray-600 border-0'}>
                        {center.isActive ? 'Open' : 'Closed'}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div className="text-gray-600">
                          <p>{center.address}</p>
                          <p className="font-medium">{center.city}, {center.province}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-gray-400" />
                        <p className="text-gray-600">{center.operatingHours}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <p className="text-gray-600 font-medium">{center.contactNumber}</p>
                      </div>
                    </div>
                  </CardContent>

                  {/* Actions */}
                  <div className="border-t md:border-t-0 md:border-l bg-gray-50 p-6 flex flex-row md:flex-col gap-3 md:w-48">
                    <Button
                      onClick={() => handleCallCenter(center.contactNumber)}
                      className="flex-1 md:w-full bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call Now
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleGetDirections(`${center.address}, ${center.city}, ${center.province}`)}
                      className="flex-1 md:w-full"
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Directions
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Info Cards */}
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <ShieldCheck className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">100% Confidential</h3>
                  <p className="text-sm text-gray-600">
                    Your test results are protected under RA 11166 (Philippine HIV and AIDS Policy Act). 
                    No one can access your information without your consent.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-white">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Quick Results</h3>
                  <p className="text-sm text-gray-600">
                    Most centers provide rapid HIV testing with results in 15-30 minutes. 
                    Bring your referral code for priority service.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}