import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
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
    
    const keywords = [
      'EMAAR Mivida', 'Mivida New Cairo', 'EMAAR Egypt properties', 'Mivida villas for sale',
      'Lake District Mivida', 'Mivida Gardens', 'New Cairo developments', 'luxury properties Egypt',
      'EMAAR real estate Egypt', 'Mivida compound', 'Cairo luxury homes', 'gated community Egypt',
      'premium real estate New Cairo', 'EMAAR Misr properties', 'Mivida investment opportunities',
      'compound living Egypt', 'luxury villas New Cairo', 'Mohamed Assem real estate expert',
      'The Views Real Estate', 'Egypt property investment', 'New Cairo real estate market',
      'EMAAR developer Egypt', 'compound properties Cairo', 'high-end real estate Egypt',
      'Mivida resale properties', 'EMAAR Mivida pricing', 'luxury lifestyle Egypt',
      'New Cairo gated communities', 'premium developments Egypt', 'real estate consultation Egypt'
    ].join(', ');
    
    metaKeywords.setAttribute('content', keywords);

    // Structured data for better SEO
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "RealEstate",
      "name": "EMAAR Mivida Project",
      "description": description,
      "url": window.location.href,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "New Cairo",
        "addressRegion": "Cairo Governorate",
        "addressCountry": "Egypt"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "30.0444",
        "longitude": "31.2357"
      },
      "provider": {
        "@type": "RealEstateAgent",
        "name": "The Views Real Estate",
        "url": "https://www.theviewsconsultancy.com",
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+20-xxx-xxx-xxxx",
          "contactType": "sales"
        }
      }
    };

    let structuredDataScript = document.querySelector('script[type="application/ld+json"]');
    if (!structuredDataScript) {
      structuredDataScript = document.createElement('script');
      structuredDataScript.type = 'application/ld+json';
      document.head.appendChild(structuredDataScript);
    }
    structuredDataScript.textContent = JSON.stringify(structuredData);
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

  // Fetch all properties for intelligent presentation
  const { data: allPropertiesData } = useQuery({
    queryKey: ['/api/properties'],
    queryFn: async () => {
      const response = await fetch('/api/properties');
      if (!response.ok) throw new Error('Failed to fetch properties');
      return response.json();
    }
  });

  const properties = allPropertiesData?.data || [];

  return (
    <div className="flex flex-col min-h-screen">
      <EMAAARMividaSEO />
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
          <div className="absolute inset-0 bg-black/40"></div>
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('https://www.emaar.com/uploads/cache/large/uploads/media/61e1b9b4a2c5d.jpeg')"
            }}
          ></div>
          <div className="relative container mx-auto px-4 py-24">
            <div className="max-w-4xl mx-auto text-center">
              <div className="bg-blue-600 text-white text-sm px-4 py-2 rounded-full mb-6 inline-block">
                EMAAR MISR DEVELOPMENT
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                EMAAR <span className="text-[#D4AF37]">Mivida</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-gray-200">
                Premium Integrated Community in the Heart of New Cairo
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-[#D4AF37]" />
                  New Cairo, Egypt
                </div>
                <div className="flex items-center">
                  <Building className="h-5 w-5 mr-2 text-[#D4AF37]" />
                  EMAAR Misr
                </div>
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-[#D4AF37]" />
                  Premium Investment
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Project Overview */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Project Overview</h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  EMAAR Mivida represents the pinnacle of integrated community living in New Cairo, 
                  offering a harmonious blend of residential, commercial, and recreational facilities 
                  across a meticulously planned 860-acre development.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                  <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">860 Acres</h3>
                  <p className="text-sm text-gray-600">Total Development Area</p>
                </div>
                
                <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                  <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Home className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Multiple Units</h3>
                  <p className="text-sm text-gray-600">Villas, Townhouses & Apartments</p>
                </div>
                
                <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                  <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <TreePine className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">80% Green Space</h3>
                  <p className="text-sm text-gray-600">Landscaped Areas & Parks</p>
                </div>
                
                <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                  <div className="bg-orange-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Award className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Premium Location</h3>
                  <p className="text-sm text-gray-600">New Cairo's Golden Square</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Intelligent Property Presentation */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Available Properties</h2>
                <p className="text-lg text-gray-600">
                  Curated selection of premium properties in EMAAR Mivida and beyond
                </p>
              </div>

              {/* Priority 1: Mivida Properties */}
              {mividaProperties.length > 0 && (
                <div className="mb-16">
                  <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">EMAAR Mivida Properties</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {mividaProperties.slice(0, 6).map((property: Property) => (
                      <div key={property.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="aspect-w-16 aspect-h-9">
                          <img 
                            src={property.images?.[0] || "https://www.emaar.com/uploads/cache/large/uploads/media/61e1b9b4a2c5d.jpeg"}
                            alt={property.title}
                            className="w-full h-48 object-cover"
                          />
                        </div>
                        <div className="p-6">
                          <div className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full mb-3 inline-block">
                            MIVIDA PROPERTY
                          </div>
                          <h3 className="text-lg font-semibold mb-2">{property.title}</h3>
                          <p className="text-gray-600 text-sm mb-3">{property.projectName} • {property.city}</p>
                          <div className="flex justify-between items-center mb-4">
                            <div className="text-[#D4AF37] font-bold text-xl">
                              {property.price > 0 ? `${(property.price / 1000000).toFixed(1)}M L.E` : 'Contact for Price'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {property.bedrooms} BR • {property.bathrooms} BA
                            </div>
                          </div>
                          <Link 
                            href={`/properties/${property.id}`} 
                            className="w-full bg-[#D4AF37] text-white py-3 px-4 rounded hover:bg-[#B8941F] transition-colors text-center block font-medium"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Priority 2: Other EMAAR Properties */}
              {properties.filter((p: Property) => 
                (p.projectName?.toLowerCase().includes('marassi') || 
                 p.projectName?.toLowerCase().includes('emaar') ||
                 p.projectName?.toLowerCase().includes('uptown')) &&
                !p.projectName?.toLowerCase().includes('mivida')
              ).length > 0 && (
                <div className="mb-16">
                  <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Other EMAAR Developments</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {properties.filter((p: Property) => 
                      (p.projectName?.toLowerCase().includes('marassi') || 
                       p.projectName?.toLowerCase().includes('emaar') ||
                       p.projectName?.toLowerCase().includes('uptown')) &&
                      !p.projectName?.toLowerCase().includes('mivida')
                    ).slice(0, 3).map((property: Property) => (
                      <div key={property.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="aspect-w-16 aspect-h-9">
                          <img 
                            src={property.images?.[0] || "https://www.emaar.com/uploads/cache/large/uploads/media/61e1b9b4d7f2c.jpeg"}
                            alt={property.title}
                            className="w-full h-48 object-cover"
                          />
                        </div>
                        <div className="p-6">
                          <div className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full mb-3 inline-block">
                            EMAAR DEVELOPMENT
                          </div>
                          <h3 className="text-lg font-semibold mb-2">{property.title}</h3>
                          <p className="text-gray-600 text-sm mb-3">{property.projectName} • {property.city}</p>
                          <div className="flex justify-between items-center mb-4">
                            <div className="text-[#D4AF37] font-bold text-lg">
                              {property.price > 0 ? `${(property.price / 1000000).toFixed(1)}M L.E` : 'Contact for Price'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {property.bedrooms} BR • {property.bathrooms} BA
                            </div>
                          </div>
                          <Link 
                            href={`/properties/${property.id}`} 
                            className="w-full bg-[#D4AF37] text-white py-3 px-4 rounded hover:bg-[#B8941F] transition-colors text-center block font-medium"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Priority 3: You May Also Like - Curated Diverse Selection */}
              {properties.filter((p: Property) => 
                !p.projectName?.toLowerCase().includes('mivida') &&
                !p.projectName?.toLowerCase().includes('marassi') &&
                !p.projectName?.toLowerCase().includes('emaar') &&
                p.isHighlighted === true
              ).length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">You May Also Like</h3>
                  <p className="text-center text-gray-600 mb-8">Handpicked luxury properties from our exclusive portfolio</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {properties.filter((p: Property) => 
                      !p.projectName?.toLowerCase().includes('mivida') &&
                      !p.projectName?.toLowerCase().includes('marassi') &&
                      !p.projectName?.toLowerCase().includes('emaar') &&
                      p.isHighlighted === true
                    ).slice(0, 3).map((property: Property) => (
                      <div key={property.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="aspect-w-16 aspect-h-9">
                          <img 
                            src={property.images?.[0] || "https://www.emaar.com/uploads/cache/large/uploads/media/61e1b9b4d7f2c.jpeg"}
                            alt={property.title}
                            className="w-full h-48 object-cover"
                          />
                        </div>
                        <div className="p-6">
                          <div className="bg-green-600 text-white text-xs px-3 py-1 rounded-full mb-3 inline-block">
                            PREMIUM SELECTION
                          </div>
                          <h3 className="text-lg font-semibold mb-2">{property.title}</h3>
                          <p className="text-gray-600 text-sm mb-3">{property.projectName} • {property.city}</p>
                          <div className="flex justify-between items-center mb-4">
                            <div className="text-[#D4AF37] font-bold text-lg">
                              {property.price > 0 ? `${(property.price / 1000000).toFixed(1)}M L.E` : 'Contact for Price'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {property.bedrooms} BR • {property.bathrooms} BA
                            </div>
                          </div>
                          <Link 
                            href={`/properties/${property.id}`} 
                            className="w-full bg-[#D4AF37] text-white py-3 px-4 rounded hover:bg-[#B8941F] transition-colors text-center block font-medium"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <ContactCTA />
      </main>

      <Footer />
    </div>
  );
}