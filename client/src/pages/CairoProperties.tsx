import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Property } from "../types";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PropertyList from "@/components/properties/PropertyList";
import ContactCTA from "@/components/home/ContactCTA";
import { MapPin, Building, TrendingUp } from "lucide-react";

// SEO optimization for Cairo properties page
function CairoPropertiesSEO() {
  useEffect(() => {
    const title = "Luxury Properties in Cairo Egypt - Villas, Apartments, Penthouses | The Views Real Estate";
    const description = "Discover premium luxury properties in Cairo including EMAAR Misr, Mivida, Uptown Cairo developments. Expert real estate consultancy with Mohamed Assem.";
    
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
    metaKeywords.setAttribute('content', 'Cairo luxury properties, EMAAR Misr Cairo, Mivida properties, Uptown Cairo, luxury villas Cairo, apartments Cairo, penthouses Cairo, The Views Real Estate, Mohamed Assem real estate broker, Cairo Gate, Belle Vie, New Cairo properties');

    // Local business structured data for Cairo
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "RealEstateAgent",
      "name": "The Views Real Estate - Cairo Properties",
      "description": "Premium luxury real estate specialist in Cairo, Egypt",
      "areaServed": {
        "@type": "City",
        "name": "Cairo",
        "addressCountry": "EG"
      },
      "serviceArea": {
        "@type": "GeoCircle",
        "geoMidpoint": {
          "@type": "GeoCoordinates",
          "latitude": 30.0444,
          "longitude": 31.2357
        },
        "geoRadius": "50000"
      },
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Cairo",
        "addressCountry": "Egypt"
      },
      "telephone": "+20-XXX-XXX-XXXX",
      "email": "Sales@theviewsconsultancy.com",
      "url": "https://www.theviewsconsultancy.com/cairo-properties",
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

export default function CairoProperties() {
  // Fetch properties filtered for Cairo
  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties', { location: 'Cairo' }],
    queryFn: async () => {
      const response = await fetch('/api/properties?city=Cairo');
      if (!response.ok) throw new Error('Failed to fetch Cairo properties');
      const data = await response.json();
      return data.data || [];
    }
  });

  return (
    <div className="flex flex-col min-h-screen">
      <CairoPropertiesSEO />
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-[#333333] py-16 relative">
          <div className="absolute inset-0 opacity-20">
            <img 
              src="https://images.unsplash.com/photo-1539650116574-75c0c6d5d3ee?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
              alt="Cairo luxury properties skyline" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#333333]/70 to-[#333333]/90"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Luxury Properties in Cairo
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Discover premium villas, apartments, and penthouses in Cairo's most prestigious developments
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-300">
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#D4AF37]" />
                EMAAR Misr & Mivida
              </span>
              <span className="flex items-center gap-2">
                <Building className="w-4 h-4 text-[#D4AF37]" />
                Uptown Cairo & New Cairo
              </span>
              <span className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
                Premium Investment Opportunities
              </span>
            </div>
          </div>
        </section>

        {/* Featured Cairo Developments */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Premium Cairo Developments
              </h2>
              <p className="text-lg text-gray-600">
                Explore luxury properties in Cairo's most sought-after compounds
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-[#D4AF37] rounded-lg flex items-center justify-center mb-4">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">EMAAR Misr Developments</h3>
                <p className="text-gray-600 mb-4">
                  Luxury properties in Cairo's premier EMAAR developments including Uptown Cairo and Mivida compounds.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Uptown Cairo luxury units</li>
                  <li>• Mivida villas and apartments</li>
                  <li>• Cairo Gate premium properties</li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-[#D4AF37] rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">New Cairo Properties</h3>
                <p className="text-gray-600 mb-4">
                  Modern luxury living in New Cairo's most prestigious residential compounds and developments.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Lake District Mivida</li>
                  <li>• Mivida Gardens & Villas</li>
                  <li>• Belle Vie compound</li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-[#D4AF37] rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Investment Opportunities</h3>
                <p className="text-gray-600 mb-4">
                  High-value investment properties with strong appreciation potential in Cairo's luxury market.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Prime location properties</li>
                  <li>• High ROI developments</li>
                  <li>• Exclusive off-plan projects</li>
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
                Available Properties in Cairo
              </h2>
              <p className="text-lg text-gray-600">
                {properties.length} luxury properties available in Cairo
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