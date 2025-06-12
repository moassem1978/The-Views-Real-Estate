import { useEffect } from 'react';

export default function MarassiNorthCoastGuide() {
  useEffect(() => {
    document.title = "Marassi North Coast by EMAAR Misr | Luxury Beachfront Properties";
    
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Marassi North Coast by EMAAR Misr",
      "description": "Egypt's premier luxury Mediterranean resort spanning 1,544 acres with 6.5km private beaches, championship golf course, and world-class amenities.",
      "author": {
        "@type": "Person",
        "name": "Mohamed Assem"
      },
      "datePublished": "2025-02-01"
    };

    let script = document.querySelector('#marassi-structured-data');
    if (!script) {
      script = document.createElement('script');
      script.id = 'marassi-structured-data';
      (script as HTMLScriptElement).type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(structuredData);
  }, []);

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-12">
        <div className="text-center">
          <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
            Project Reviews
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Marassi North Coast by EMAAR Misr
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Egypt's Premier Luxury Mediterranean Resort
          </p>
          <div className="flex items-center justify-center space-x-6 text-gray-600 mb-8">
            <span>February 1, 2025</span>
            <span>•</span>
            <span>15 min read</span>
            <span>•</span>
            <span>By Mohamed Assem</span>
          </div>
        </div>
      </header>

      <section className="mb-12">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 p-8 rounded-lg mb-8">
          <p className="text-xl text-gray-800 leading-relaxed mb-4 font-medium">
            Marassi North Coast represents the pinnacle of luxury coastal living in Egypt. This prestigious development by EMAAR Misr offers an unparalleled lifestyle experience with pristine beaches, world-class amenities, and architectural excellence.
          </p>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Project Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Facts</h3>
            <ul className="space-y-3 text-gray-700">
              <li><span className="font-medium">Location:</span> North Coast, Egypt - 125km west of Alexandria</li>
              <li><span className="font-medium">Total Area:</span> 1,544 acres</li>
              <li><span className="font-medium">Beachfront:</span> 6.5 kilometers of private beaches</li>
              <li><span className="font-medium">Golf Course:</span> 18-hole championship course</li>
              <li><span className="font-medium">Developer:</span> EMAAR Misr</li>
              <li><span className="font-medium">Payment Plans:</span> Up to 8 years</li>
            </ul>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Premium Amenities</h3>
            <ul className="space-y-3 text-gray-700">
              <li>• 18-hole championship golf course</li>
              <li>• Luxury marina with yacht facilities</li>
              <li>• Premium retail and dining districts</li>
              <li>• World-class spa and wellness centers</li>
              <li>• Multiple swimming pools and beach clubs</li>
              <li>• 24/7 security and concierge services</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">About EMAAR Misr</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            EMAAR Misr is the Egyptian subsidiary of EMAAR Properties, the world-renowned developer behind iconic projects such as Burj Khalifa and The Dubai Mall. With over 25 years of global experience, EMAAR brings world-class expertise to the Egyptian market.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            EMAAR Misr is committed to developing landmark destinations that redefine luxury living standards in Egypt, combining international expertise with local market understanding to create exceptional communities that enhance Egypt's real estate landscape.
          </p>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Property Types & Specifications</h2>
        
        <div className="mb-8 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">Beachfront Villas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Specifications:</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• Built-up Area: 300-800 sqm</li>
                <li>• Bedrooms: 3-6 bedrooms</li>
                <li>• Bathrooms: 3-7 bathrooms</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Premium Features:</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• Direct beach access</li>
                <li>• Private swimming pool</li>
                <li>• Landscaped garden</li>
                <li>• Unobstructed sea views</li>
                <li>• Premium finishing packages</li>
                <li>• Smart home systems</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mb-8 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">Golf Course Villas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Specifications:</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• Built-up Area: 250-600 sqm</li>
                <li>• Bedrooms: 3-5 bedrooms</li>
                <li>• Bathrooms: 3-6 bathrooms</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Premium Features:</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• Golf course frontage</li>
                <li>• Private garden terraces</li>
                <li>• Golf club membership included</li>
                <li>• Landscaped surroundings</li>
                <li>• Modern architectural design</li>
                <li>• Premium amenities access</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mb-8 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">Marina Apartments</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Specifications:</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• Built-up Area: 120-300 sqm</li>
                <li>• Bedrooms: 1-4 bedrooms</li>
                <li>• Bathrooms: 1-4 bathrooms</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Premium Features:</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• Marina and yacht views</li>
                <li>• Spacious balconies</li>
                <li>• Contemporary design</li>
                <li>• Resort-style amenities</li>
                <li>• 24/7 concierge services</li>
                <li>• Beach club access</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mb-8 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">Hilltop Estates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Specifications:</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• Built-up Area: 400-1000 sqm</li>
                <li>• Bedrooms: 4-7 bedrooms</li>
                <li>• Bathrooms: 4-8 bathrooms</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Ultra-Luxury Features:</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• Panoramic Mediterranean views</li>
                <li>• Private elevator access</li>
                <li>• Infinity swimming pools</li>
                <li>• Expansive landscaped grounds</li>
                <li>• Ultimate privacy and exclusivity</li>
                <li>• Helicopter landing pad access</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Investment Opportunities</h2>
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">Why Invest in Marassi?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Market Advantages:</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• EMAAR's international reputation</li>
                <li>• Limited beachfront supply</li>
                <li>• Growing luxury market demand</li>
                <li>• Strong rental yield potential</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Investment Highlights:</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• Flexible payment plans</li>
                <li>• Multiple phases available</li>
                <li>• 10% down payment options</li>
                <li>• Delivery: 2025-2027</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Expert Consultation</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">Professional Guidance</h3>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            As Egypt's premier luxury Mediterranean resort, Marassi North Coast by EMAAR Misr represents a unique opportunity to own in one of the region's most prestigious developments. With my 30+ years of experience in luxury real estate and direct relationships with EMAAR Misr, I provide exclusive access to the best available units with preferred pricing and payment terms.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Services Offered:</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• Exclusive unit selection</li>
                <li>• Preferred pricing structures</li>
                <li>• Investment strategy guidance</li>
                <li>• Legal and financial assistance</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Ongoing Support:</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• Property management services</li>
                <li>• Rental income optimization</li>
                <li>• Market performance tracking</li>
                <li>• Resale assistance</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <div className="bg-gray-900 text-white rounded-lg p-8 text-center">
          <h3 className="text-2xl font-semibold mb-4">Ready to Explore Marassi North Coast?</h3>
          <p className="text-gray-300 mb-6">
            Contact Mohamed Assem for exclusive access to the best available units and personalized investment guidance.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="font-semibold">Email</p>
              <p className="text-gray-300">Sales@theviewsrealestate.com</p>
            </div>
            <div>
              <p className="font-semibold">Phone & WhatsApp</p>
              <p className="text-gray-300">+20 106 311 1136</p>
            </div>
            <div>
              <p className="font-semibold">Business Hours</p>
              <p className="text-gray-300">Saturday-Friday 11:00-19:00</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <div className="border-t border-gray-200 pt-8">
          <div className="flex items-start space-x-6">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
              MA
            </div>
            <div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Mohamed Assem</h4>
              <p className="text-gray-600 mb-3">Senior Real Estate Consultant</p>
              <p className="text-gray-700 leading-relaxed">
                With over 30 years of experience in luxury real estate across Egypt and Dubai, Mohamed Assem specializes in North Coast developments and premium investment properties. His expertise in EMAAR projects and deep market knowledge provide clients with unparalleled insights for successful property investments.
              </p>
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}