import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Property } from "../types";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ContactCTA from "@/components/home/ContactCTA";
import { MapPin, Building, TrendingUp, Users, Calendar, Award, Home, Car, Waves, TreePine } from "lucide-react";

// SEO optimization for EMAAR Mivida project page
function EMAAARMividaSEO() {
  useEffect(() => {
    const title = "EMAAR Mivida Project Details - Villas, Units, Prices | The Views Real Estate Egypt";
    const description = "Complete guide to EMAAR Mivida development in New Cairo. Explore Lake District, Mivida Gardens, villas, apartments with expert analysis by Mohamed Assem.";
    
    document.title = title;
    
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', 'EMAAR Mivida, Mivida New Cairo, Lake District Mivida, Mivida Gardens, Mivida villas, Mivida units, Mivida apartments, EMAAR developments Egypt, Mivida project details, Mivida floor plans, Mivida prices 2024, Mivida amenities, New Cairo luxury properties, Mohamed Assem Mivida expert, The Views Real Estate Mivida');

    // Rich structured data for the project
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "RealEstateProject",
      "name": "EMAAR Mivida",
      "description": "Luxury residential development by EMAAR Misr in New Cairo featuring villas, apartments, and premium amenities",
      "developer": {
        "@type": "Organization",
        "name": "EMAAR Misr",
        "url": "https://www.emaar.com"
      },
      "location": {
        "@type": "Place",
        "name": "New Cairo",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "New Cairo",
          "addressRegion": "Cairo",
          "addressCountry": "Egypt"
        }
      },
      "offers": {
        "@type": "Offer",
        "availability": "https://schema.org/InStock",
        "priceRange": "Contact for pricing"
      },
      "amenityFeature": [
        {"@type": "LocationFeatureSpecification", "name": "Lake District"},
        {"@type": "LocationFeatureSpecification", "name": "Golf Course"},
        {"@type": "LocationFeatureSpecification", "name": "Shopping District"},
        {"@type": "LocationFeatureSpecification", "name": "International Schools"}
      ],
      "realEstateAgent": {
        "@type": "RealEstateAgent",
        "name": "The Views Real Estate",
        "employee": {
          "@type": "Person",
          "name": "Mohamed Assem"
        }
      }
    };

    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.querySelector('script[type="application/ld+json"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, []);

  return null;
}

export default function EMAAARMividaProject() {
  // Fetch Mivida properties
  const { data: mividaProperties = [], isLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties', { projectName: 'Mivida' }],
    queryFn: async () => {
      const response = await fetch('/api/properties?projectName=Mivida');
      if (!response.ok) throw new Error('Failed to fetch Mivida properties');
      const data = await response.json();
      return data.data || [];
    }
  });

  return (
    <div className="flex flex-col min-h-screen">
      <EMAAARMividaSEO />
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-[#333333] py-20 relative">
          <div className="absolute inset-0 opacity-25">
            <img 
              src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
              alt="EMAAR Mivida luxury development New Cairo" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#333333]/80 to-[#333333]/95"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center px-4 py-2 bg-[#D4AF37] text-white rounded-full text-sm font-medium mb-6">
                <Award className="w-4 h-4 mr-2" />
                Premium EMAAR Development
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
                EMAAR Mivida
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto">
                New Cairo's premier luxury residential community featuring Lake District, world-class amenities, and exceptional investment opportunities
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto text-center">
                <div className="text-white">
                  <div className="text-2xl font-bold text-[#D4AF37]">860</div>
                  <div className="text-sm">Acres</div>
                </div>
                <div className="text-white">
                  <div className="text-2xl font-bold text-[#D4AF37]">12,000</div>
                  <div className="text-sm">Units</div>
                </div>
                <div className="text-white">
                  <div className="text-2xl font-bold text-[#D4AF37]">18-Hole</div>
                  <div className="text-sm">Golf Course</div>
                </div>
                <div className="text-white">
                  <div className="text-2xl font-bold text-[#D4AF37]">33-Acre</div>
                  <div className="text-sm">Central Park</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Developer Introduction */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">About EMAAR Misr</h2>
                <p className="text-lg text-gray-600 mb-6">
                  EMAAR Misr, a joint venture between EMAAR Properties and Egypt's Government, brings world-class development expertise to the Egyptian market. With a proven track record of iconic projects globally, EMAAR delivers exceptional quality and innovative design.
                </p>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Building className="w-8 h-8 text-[#D4AF37] mx-auto mb-2" />
                    <div className="font-semibold text-gray-900">Global Developer</div>
                    <div className="text-sm text-gray-600">World-renowned expertise</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Award className="w-8 h-8 text-[#D4AF37] mx-auto mb-2" />
                    <div className="font-semibold text-gray-900">Proven Quality</div>
                    <div className="text-sm text-gray-600">International standards</div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
                  alt="EMAAR Misr development quality" 
                  className="w-full h-96 object-cover rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Project Zones */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Mivida Development Zones</h2>
              <p className="text-lg text-gray-600">Discover the different areas within this master-planned community</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Lake District */}
              <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                  <Waves className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Lake District Mivida</h3>
                <p className="text-gray-600 mb-6">
                  Premium waterfront living with direct lake access, luxury villas, and upscale apartments overlooking pristine waters.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Waterfront villas with private docks</li>
                  <li>• Lake-view apartments and penthouses</li>
                  <li>• Water sports and recreational facilities</li>
                  <li>• Exclusive community amenities</li>
                </ul>
              </div>

              {/* Mivida Gardens */}
              <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                  <TreePine className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Mivida Gardens</h3>
                <p className="text-gray-600 mb-6">
                  Lush landscaped residential area featuring family villas, townhouses, and apartments surrounded by green spaces.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Family-oriented villas and townhouses</li>
                  <li>• Landscaped gardens and parks</li>
                  <li>• Children's play areas and facilities</li>
                  <li>• Community centers and retail</li>
                </ul>
              </div>

              {/* Mivida Villas */}
              <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center mb-6">
                  <Home className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Mivida Villas</h3>
                <p className="text-gray-600 mb-6">
                  Exclusive standalone villas offering ultimate privacy, luxury finishes, and spacious layouts for discerning families.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Standalone luxury villas</li>
                  <li>• Private gardens and pools</li>
                  <li>• Premium architectural designs</li>
                  <li>• Exclusive neighborhood access</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Unit Types & Pricing */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Unit Types & Investment Opportunities</h2>
              <p className="text-lg text-gray-600">Diverse property options to suit different lifestyle preferences and investment goals</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="border border-gray-200 rounded-lg p-6 hover:border-[#D4AF37] transition-colors">
                <div className="text-center">
                  <div className="w-12 h-12 bg-[#D4AF37] rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Building className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Apartments</h3>
                  <p className="text-sm text-gray-600 mb-4">1-4 bedrooms with modern finishes</p>
                  <div className="text-2xl font-bold text-[#D4AF37] mb-2">From 80m²</div>
                  <div className="text-sm text-gray-500">Starting areas</div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 hover:border-[#D4AF37] transition-colors">
                <div className="text-center">
                  <div className="w-12 h-12 bg-[#D4AF37] rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Home className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Townhouses</h3>
                  <p className="text-sm text-gray-600 mb-4">3-4 bedrooms with private gardens</p>
                  <div className="text-2xl font-bold text-[#D4AF37] mb-2">From 200m²</div>
                  <div className="text-sm text-gray-500">Built-up areas</div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 hover:border-[#D4AF37] transition-colors">
                <div className="text-center">
                  <div className="w-12 h-12 bg-[#D4AF37] rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Villas</h3>
                  <p className="text-sm text-gray-600 mb-4">4-6 bedrooms standalone luxury</p>
                  <div className="text-2xl font-bold text-[#D4AF37] mb-2">From 350m²</div>
                  <div className="text-sm text-gray-500">Building areas</div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 hover:border-[#D4AF37] transition-colors">
                <div className="text-center">
                  <div className="w-12 h-12 bg-[#D4AF37] rounded-lg flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Penthouses</h3>
                  <p className="text-sm text-gray-600 mb-4">Luxury units with private terraces</p>
                  <div className="text-2xl font-bold text-[#D4AF37] mb-2">From 250m²</div>
                  <div className="text-sm text-gray-500">Plus terraces</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Amenities */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">World-Class Amenities</h2>
              <p className="text-lg text-gray-600">Resort-style living with comprehensive facilities for all ages</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#D4AF37] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Car className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">18-Hole Golf Course</h3>
                  <p className="text-gray-600">Championship golf course designed by world-renowned architects</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#D4AF37] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Community Clubhouse</h3>
                  <p className="text-gray-600">Social hub with dining, event spaces, and recreational facilities</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#D4AF37] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">International Schools</h3>
                  <p className="text-gray-600">Access to top-tier educational institutions within the community</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#D4AF37] rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Retail & Dining</h3>
                  <p className="text-gray-600">Shopping center with premium brands and fine dining options</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#D4AF37] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Waves className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Sports Facilities</h3>
                  <p className="text-gray-600">Tennis courts, swimming pools, and fitness centers</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#D4AF37] rounded-lg flex items-center justify-center flex-shrink-0">
                  <TreePine className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Central Park</h3>
                  <p className="text-gray-600">33-acre green space with walking trails and recreation areas</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Available Properties */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Available Mivida Properties</h2>
              <p className="text-lg text-gray-600">
                {mividaProperties.length} exclusive properties currently available in EMAAR Mivida
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
              </div>
            ) : mividaProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {mividaProperties.slice(0, 6).map(property => (
                  <div key={property.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-w-16 aspect-h-9">
                      <img 
                        src={property.images?.[0] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
                        alt={property.title}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-2">{property.title}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{property.description}</p>
                      <div className="flex justify-between items-center">
                        <div className="text-[#D4AF37] font-bold">
                          {property.price > 0 ? `${(property.price / 1000000).toFixed(1)}M L.E` : 'Contact for Price'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {property.bedrooms} BR • {property.bathrooms} BA
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No Mivida properties currently listed. Contact us for exclusive off-market opportunities.</p>
              </div>
            )}
          </div>
        </section>

        {/* Investment Analysis */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Invest in EMAAR Mivida?</h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-[#D4AF37] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div>
                      <h3 className="font-semibold">Prime New Cairo Location</h3>
                      <p className="text-gray-600">Strategic location with easy access to airports, business districts, and major highways</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-[#D4AF37] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div>
                      <h3 className="font-semibold">Proven Developer Track Record</h3>
                      <p className="text-gray-600">EMAAR's global expertise ensures quality construction and timely delivery</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-[#D4AF37] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div>
                      <h3 className="font-semibold">Strong Appreciation Potential</h3>
                      <p className="text-gray-600">Established community with consistent property value growth</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-[#D4AF37] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div>
                      <h3 className="font-semibold">Comprehensive Amenities</h3>
                      <p className="text-gray-600">Self-contained community reducing the need for external services</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-md">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Expert Consultation with Mohamed Assem</h3>
                <p className="text-gray-600 mb-6">
                  With over 30 years of experience in luxury real estate, Mohamed Assem provides exclusive insights into EMAAR Mivida investments and market trends.
                </p>
                <div className="space-y-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <Award className="w-5 h-5 text-[#D4AF37]" />
                    <span className="text-gray-700">EMAAR Mivida specialist since launch</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="w-5 h-5 text-[#D4AF37]" />
                    <span className="text-gray-700">Market analysis and investment guidance</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-[#D4AF37]" />
                    <span className="text-gray-700">Access to exclusive off-market units</span>
                  </div>
                </div>
                <a 
                  href="/contact" 
                  className="w-full bg-[#D4AF37] hover:bg-[#BF9B30] text-white font-medium py-3 px-6 rounded-md transition-colors inline-block text-center"
                >
                  Schedule Consultation
                </a>
              </div>
            </div>
          </div>
        </section>

        <ContactCTA />
      </main>
      <Footer />
    </div>
  );
}