import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CompoundHeatMap from "@/components/CompoundHeatMap";
import ContactCTA from "@/components/home/ContactCTA";

// SEO optimization for Heat Map page
function HeatMapSEO() {
  useEffect(() => {
    const title = "Property Heat Map - Luxury Compound Analysis | The Views Real Estate";
    const description = "Interactive heat map showing property density and pricing across Egypt's premium compounds including EMAAR, Mivida, Marassi, Sodic, and Palm Hills developments.";
    
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
    metaKeywords.setAttribute('content', 'property heat map Egypt, compound analysis, luxury development density, EMAAR Mivida Marassi analysis, property price mapping, real estate visualization Egypt, compound property distribution, luxury real estate data');

    const ogTags = [
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: window.location.href }
    ];

    ogTags.forEach(tag => {
      let metaTag = document.querySelector(`meta[property="${tag.property}"]`);
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('property', tag.property);
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute('content', tag.content);
    });
  }, []);

  return null;
}

export default function HeatMap() {
  const [location, navigate] = useLocation();
  const [selectedCompound, setSelectedCompound] = useState<string | undefined>();

  // Handle compound selection
  const handleCompoundSelect = (compound: string) => {
    setSelectedCompound(compound);
    // Could navigate to properties filtered by this compound
    // navigate(`/properties?projectName=${encodeURIComponent(compound)}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <HeatMapSEO />
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-[#333333] py-16 relative">
          <div className="absolute inset-0 opacity-20">
            <img loading="lazy" 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
              alt="Property analytics and data visualization" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#333333]/70 to-[#333333]/90"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Property Heat Map
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Visualize luxury property distribution and pricing across Egypt's premium compounds
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-300">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#D4AF37] rounded-full"></div>
                Real-time data analysis
              </span>
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#D4AF37] rounded-full"></div>
                Interactive visualization
              </span>
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#D4AF37] rounded-full"></div>
                Market insights
              </span>
            </div>
          </div>
        </section>

        {/* Heat Map Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <CompoundHeatMap 
              selectedCompound={selectedCompound}
              onCompoundSelect={handleCompoundSelect}
            />
          </div>
        </section>

        {/* Insights Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Market Insights & Analysis
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Understand property distribution patterns and make informed investment decisions with our comprehensive heat map analysis
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <div className="w-6 h-6 bg-red-500 rounded-full"></div>
                </div>
                <h3 className="text-xl font-semibold mb-3">High Density Areas</h3>
                <p className="text-gray-600">
                  Compounds with 10+ properties indicate established luxury markets with strong developer presence and buyer interest.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <div className="w-5 h-5 bg-orange-500 rounded-full"></div>
                </div>
                <h3 className="text-xl font-semibold mb-3">Medium Density Areas</h3>
                <p className="text-gray-600">
                  Emerging luxury compounds with 5-9 properties, representing growth opportunities and competitive pricing.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                </div>
                <h3 className="text-xl font-semibold mb-3">Exclusive Properties</h3>
                <p className="text-gray-600">
                  Low density areas with 1-4 properties often feature ultra-luxury, unique properties with premium positioning.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How to Use Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                How to Use the Heat Map
              </h2>
              <p className="text-lg text-gray-600">
                Get the most out of our interactive property visualization tool
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Select Location</h3>
                <p className="text-gray-600 text-sm">Filter by specific areas like Cairo, North Coast, or New Capital</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Explore Densities</h3>
                <p className="text-gray-600 text-sm">Identify high-density compounds with multiple property options</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Compare Pricing</h3>
                <p className="text-gray-600 text-sm">View average prices and ranges across different compounds</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">4</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Make Decisions</h3>
                <p className="text-gray-600 text-sm">Use insights to identify investment opportunities and market trends</p>
              </div>
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