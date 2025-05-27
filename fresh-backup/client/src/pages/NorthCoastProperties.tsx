import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Property } from "../types";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PropertyList from "@/components/properties/PropertyList";
import ContactCTA from "@/components/home/ContactCTA";
import { MapPin, Building, TrendingUp } from "lucide-react";

// SEO optimization for North Coast properties page
function NorthCoastPropertiesSEO() {
  useEffect(() => {
    const title = "North Coast Luxury Properties Egypt - Marassi, Waterway, El Gouna | The Views Real Estate";
    const description = "Discover premium beachfront properties on Egypt's North Coast including Marassi Marina, Waterway developments, El Gouna with Mohamed Assem expert consultancy.";
    
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
    metaKeywords.setAttribute('content', 'North Coast luxury properties, Marassi North Coast, Marassi Marina, Marassi Beach, Waterway North Coast, El Gouna properties, Gouna Marina, Swan Lake North Coast, Almaza North Coast, Silversands, beachfront villas Egypt, The Views Real Estate, Mohamed Assem real estate broker');

    // Local business structured data for North Coast
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "RealEstateAgent",
      "name": "The Views Real Estate - North Coast Properties",
      "description": "Premium beachfront and luxury property specialist on Egypt's North Coast",
      "areaServed": {
        "@type": "Place",
        "name": "North Coast Egypt",
        "addressCountry": "EG"
      },
      "serviceArea": {
        "@type": "GeoCircle",
        "geoMidpoint": {
          "@type": "GeoCoordinates",
          "latitude": 31.0409,
          "longitude": 28.9735
        },
        "geoRadius": "100000"
      },
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "North Coast",
        "addressCountry": "Egypt"
      },
      "telephone": "+20-XXX-XXX-XXXX",
      "email": "Sales@theviewsconsultancy.com",
      "url": "https://www.theviewsconsultancy.com/north-coast-properties",
      "founder": {
        "@type": "Person",
        "name": "Mohamed Assem"
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

export default function NorthCoastProperties() {
  // Fetch properties filtered for North Coast
  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties', { location: 'North Coast' }],
    queryFn: async () => {
      const response = await fetch('/api/properties?city=North%20Coast');
      if (!response.ok) throw new Error('Failed to fetch North Coast properties');
      const data = await response.json();
      return data.data || [];
    }
  });

  return (
    <div className="flex flex-col min-h-screen">
      <NorthCoastPropertiesSEO />
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-[#333333] py-16 relative">
          <div className="absolute inset-0 opacity-20">
            <img 
              src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
              alt="North Coast Egypt beachfront luxury properties" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#333333]/70 to-[#333333]/90"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              North Coast Luxury Properties
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Exclusive beachfront villas, chalets, and luxury units in Egypt's premier coastal destinations
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-300">
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#D4AF37]" />
                Marassi & El Gouna
              </span>
              <span className="flex items-center gap-2">
                <Building className="w-4 h-4 text-[#D4AF37]" />
                Waterway & Swan Lake
              </span>
              <span className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
                Prime Beachfront Investments
              </span>
            </div>
          </div>
        </section>

        {/* Featured North Coast Developments */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Premier North Coast Developments
              </h2>
              <p className="text-lg text-gray-600">
                Discover beachfront luxury in Egypt's most exclusive coastal compounds
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-[#D4AF37] rounded-lg flex items-center justify-center mb-4">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Marassi Developments</h3>
                <p className="text-gray-600 mb-4">
                  Luxury beachfront properties in Marassi North Coast including Marina, Beach units, and exclusive villas.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Marassi Marina waterfront units</li>
                  <li>• Marassi Beach chalets</li>
                  <li>• Safi Marassi Beach properties</li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-[#D4AF37] rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">El Gouna & Red Sea</h3>
                <p className="text-gray-600 mb-4">
                  Premium properties in El Gouna Marina and Red Sea developments by Orascom.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• El Gouna Marina units</li>
                  <li>• Gouna beachfront villas</li>
                  <li>• Orascom luxury developments</li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-[#D4AF37] rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Waterway & Swan Lake</h3>
                <p className="text-gray-600 mb-4">
                  Exclusive properties in Waterway North Coast and Swan Lake coastal developments.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Waterway North Coast villas</li>
                  <li>• Swan Lake beachfront units</li>
                  <li>• Almaza North Coast properties</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Properties Listing */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Available Properties on North Coast
              </h2>
              <p className="text-lg text-gray-600">
                {properties.length} luxury beachfront properties available
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
              </div>
            ) : (
              <PropertyList properties={properties} />
            )}
          </div>
        </section>

        <ContactCTA />
      </main>
      <Footer />
    </div>
  );
}