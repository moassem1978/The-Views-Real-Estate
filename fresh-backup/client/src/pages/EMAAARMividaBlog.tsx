import { MapPin, Car, TreePine, Users, Calendar, Building2, Clock, DollarSign } from "lucide-react";

export default function EMAAARMividaBlog() {
  return (
    <div className="min-h-screen bg-cream-light">

      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-to-r from-rich-black to-rich-black-light flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold text-cream mb-4">
              EMAAR Mivida New Cairo
            </h1>
            <p className="text-xl text-cream-dark mb-6 leading-relaxed">
              Egypt's premier residential community offering luxury living with world-class amenities in the heart of New Cairo
            </p>
            <div className="flex items-center text-cream-dark">
              <MapPin className="h-5 w-5 mr-2" />
              <span>New Cairo, Egypt</span>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-rich-black/90 to-rich-black/70"></div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          
          {/* Project Overview */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-rich-black mb-6">Project Overview</h2>
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <p className="text-gray-700 leading-relaxed mb-6">
                EMAAR Mivida stands as one of Egypt's most prestigious residential developments, strategically located in New Cairo. 
                This master-planned community spans over 890 acres and represents EMAAR's commitment to creating sustainable, 
                luxury living environments that cater to modern Egyptian families.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Developed by EMAAR Misr, a joint venture between EMAAR Properties and Egyptian investors, Mivida combines 
                international expertise with local market knowledge to deliver a truly exceptional residential experience.
              </p>
            </div>
          </section>

          {/* Key Statistics */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-rich-black mb-6">Project Facts</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <Building2 className="h-8 w-8 text-copper mx-auto mb-3" />
                <h3 className="font-semibold text-rich-black mb-2">Total Area</h3>
                <p className="text-2xl font-bold text-copper">890 Acres</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <Users className="h-8 w-8 text-copper mx-auto mb-3" />
                <h3 className="font-semibold text-rich-black mb-2">Total Units</h3>
                <p className="text-2xl font-bold text-copper">7,000+</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <TreePine className="h-8 w-8 text-copper mx-auto mb-3" />
                <h3 className="font-semibold text-rich-black mb-2">Green Spaces</h3>
                <p className="text-2xl font-bold text-copper">60%</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <Calendar className="h-8 w-8 text-copper mx-auto mb-3" />
                <h3 className="font-semibold text-rich-black mb-2">Launch Year</h3>
                <p className="text-2xl font-bold text-copper">2008</p>
              </div>
            </div>
          </section>

          {/* Property Types */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-rich-black mb-6">Available Property Types</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-rich-black mb-4">Apartments</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• 1-4 bedroom options</li>
                  <li>• Modern finishing and layouts</li>
                  <li>• Private balconies and terraces</li>
                  <li>• Prime locations within the community</li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-rich-black mb-4">Villas</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Standalone and twin houses</li>
                  <li>• 3-6 bedroom configurations</li>
                  <li>• Private gardens and parking</li>
                  <li>• Premium locations and views</li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-rich-black mb-4">Townhouses</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• 2-4 bedroom layouts</li>
                  <li>• Ground floor and upper floor options</li>
                  <li>• Shared amenities access</li>
                  <li>• Family-oriented designs</li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-rich-black mb-4">Penthouses</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Luxury specifications</li>
                  <li>• Private roof terraces</li>
                  <li>• Panoramic community views</li>
                  <li>• Exclusive amenities access</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Amenities */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-rich-black mb-6">World-Class Amenities</h2>
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-rich-black mb-4">Recreation & Sports</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Multiple swimming pools</li>
                    <li>• Tennis courts</li>
                    <li>• Fitness centers and gyms</li>
                    <li>• Jogging and cycling tracks</li>
                    <li>• Sports courts (basketball, volleyball)</li>
                    <li>• Children's playgrounds</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-rich-black mb-4">Lifestyle & Services</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Community center</li>
                    <li>• Retail and shopping areas</li>
                    <li>• Restaurants and cafes</li>
                    <li>• Healthcare facilities</li>
                    <li>• Educational institutions</li>
                    <li>• 24/7 security and maintenance</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Location Advantages */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-rich-black mb-6">Strategic Location</h2>
            <div className="bg-white rounded-lg shadow-md p-8">
              <p className="text-gray-700 leading-relaxed mb-6">
                Mivida's location in New Cairo provides residents with exceptional connectivity to key areas across Greater Cairo, 
                while maintaining a peaceful residential atmosphere away from the city's congestion.
              </p>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-rich-black mb-4">Nearby Landmarks</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Cairo International Airport (15 minutes)</li>
                    <li>• American University in Cairo (10 minutes)</li>
                    <li>• Cairo Festival City (5 minutes)</li>
                    <li>• Downtown Cairo (30 minutes)</li>
                    <li>• New Administrative Capital (20 minutes)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-rich-black mb-4">Transportation</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Major highway access</li>
                    <li>• Ring Road connectivity</li>
                    <li>• Public transportation options</li>
                    <li>• Planned metro extensions</li>
                    <li>• Easy access to business districts</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Investment Insights */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-rich-black mb-6">Investment Analysis</h2>
            <div className="bg-white rounded-lg shadow-md p-8">
              <p className="text-gray-700 leading-relaxed mb-6">
                EMAAR Mivida represents a strong investment opportunity in Egypt's premium real estate market, with consistent 
                demand driven by its reputation, location, and comprehensive amenities package.
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <DollarSign className="h-8 w-8 text-copper mx-auto mb-3" />
                  <h3 className="font-semibold text-rich-black mb-2">Capital Appreciation</h3>
                  <p className="text-sm text-gray-600">Steady property value growth over time</p>
                </div>
                <div className="text-center">
                  <Clock className="h-8 w-8 text-copper mx-auto mb-3" />
                  <h3 className="font-semibold text-rich-black mb-2">Rental Demand</h3>
                  <p className="text-sm text-gray-600">High occupancy rates and rental yields</p>
                </div>
                <div className="text-center">
                  <Building2 className="h-8 w-8 text-copper mx-auto mb-3" />
                  <h3 className="font-semibold text-rich-black mb-2">Developer Reputation</h3>
                  <p className="text-sm text-gray-600">EMAAR's proven track record globally</p>
                </div>
              </div>
            </div>
          </section>

          {/* Why Choose Mivida */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-rich-black mb-6">Why Choose EMAAR Mivida?</h2>
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-rich-black mb-4">Community Benefits</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li>• Established community with mature infrastructure</li>
                    <li>• High-quality construction and finishing standards</li>
                    <li>• Comprehensive master planning and design</li>
                    <li>• Strong resale market and property values</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-rich-black mb-4">Lifestyle Advantages</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li>• Family-friendly environment with excellent schools</li>
                    <li>• Sustainable living with extensive green spaces</li>
                    <li>• Active community with regular events and activities</li>
                    <li>• International standard amenities and services</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Contact CTA */}
          <section className="bg-gradient-to-r from-copper to-copper-dark rounded-lg p-8 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Explore EMAAR Mivida?</h2>
            <p className="text-xl mb-6 opacity-90">
              Get expert guidance on available properties and investment opportunities in this premier community
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/properties?project=EMAAR Mivida" 
                className="bg-white text-copper font-semibold px-8 py-3 rounded-md hover:bg-cream transition-colors"
              >
                View Available Properties
              </a>
              <a 
                href="/contact" 
                className="border-2 border-white text-white font-semibold px-8 py-3 rounded-md hover:bg-white hover:text-copper transition-colors"
              >
                Schedule Consultation
              </a>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}