import { useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ArrowLeft, MapPin, Building2, Users, Waves, TreePine, Car, Wifi } from "lucide-react";
import { Link } from "wouter";

export default function MarassiNorthCoastGuide() {
  useEffect(() => {
    const title = "Marassi North Coast by EMAAR Misr: Complete Development Guide 2025 | The Views";
    const description = "Comprehensive review of Egypt's premier luxury Mediterranean resort spanning 1,544 acres with 6.5km private beaches, championship golf course, and world-class amenities by EMAAR Misr.";
    
    document.title = title;
    
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    const keywords = 'Marassi North Coast, EMAAR Misr, North Coast luxury resort, Egypt beachfront properties, Mediterranean villas Egypt, luxury chalets North Coast, golf course communities Egypt, marina apartments Egypt, EMAAR developments Egypt, premium beach properties, North Coast investment';
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', keywords);

    // Add Article Schema
    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Marassi North Coast by EMAAR Misr: Complete Development Guide 2025",
      "description": description,
      "image": "https://www.theviewsconsultancy.com/uploads/projects/IMG_7037.jpeg",
      "author": {
        "@type": "Person",
        "name": "Mohamed Assem",
        "jobTitle": "Senior Real Estate Consultant",
        "worksFor": {
          "@type": "RealEstateAgent",
          "name": "The Views Real Estate"
        }
      },
      "publisher": {
        "@type": "Organization",
        "name": "The Views Real Estate",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.theviewsconsultancy.com/views-logo-new.png"
        }
      },
      "datePublished": "2025-02-01T09:00:00+02:00",
      "dateModified": "2025-02-01T09:00:00+02:00",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "https://www.theviewsconsultancy.com/blog/marassi-north-coast-emaar-complete-guide"
      },
      "articleSection": "Project Reviews",
      "keywords": keywords.split(', '),
      "wordCount": 2500,
      "about": {
        "@type": "Place",
        "name": "Marassi North Coast",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "North Coast",
          "addressCountry": "Egypt"
        }
      }
    };

    let articleSchemaScript = document.querySelector('#article-schema');
    if (!articleSchemaScript) {
      articleSchemaScript = document.createElement('script');
      articleSchemaScript.id = 'article-schema';
      articleSchemaScript.type = 'application/ld+json';
      document.head.appendChild(articleSchemaScript);
    }
    articleSchemaScript.textContent = JSON.stringify(articleSchema);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-24">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
          <div className="max-w-4xl mx-auto px-4">
            <Link to="/blog" className="inline-flex items-center text-blue-200 hover:text-white mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>
            
            <div className="mb-6">
              <span className="bg-blue-600 text-blue-100 px-3 py-1 rounded-full text-sm font-medium">
                Project Reviews
              </span>
              <span className="ml-4 text-blue-200 text-sm">
                February 1, 2025 • 15 min read
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Marassi North Coast by EMAAR Misr: Complete Development Guide 2025
            </h1>
            
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Comprehensive review of Egypt's premier luxury Mediterranean resort spanning 1,544 acres with 6.5km private beaches, championship golf course, and world-class amenities.
            </p>
            
            <div className="flex items-center">
              <div className="flex items-center mr-6">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold">MA</span>
                </div>
                <div>
                  <div className="font-semibold">Mohamed Assem</div>
                  <div className="text-blue-200 text-sm">Senior Real Estate Consultant</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <article className="max-w-4xl mx-auto px-4 py-12">
          
          {/* Project Overview */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Project Overview</h2>
            
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Facts</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-center">
                      <MapPin className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                      <span><strong>Location:</strong> North Coast, Egypt - 125km west of Alexandria</span>
                    </li>
                    <li className="flex items-center">
                      <Building2 className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                      <span><strong>Developer:</strong> EMAAR Misr</span>
                    </li>
                    <li className="flex items-center">
                      <Users className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                      <span><strong>Total Area:</strong> 1,544 acres (6.25 million sqm)</span>
                    </li>
                    <li className="flex items-center">
                      <Waves className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                      <span><strong>Beachfront:</strong> 6.5 kilometers of private beaches</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Premium Amenities</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-center">
                      <TreePine className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                      <span>18-hole championship golf course</span>
                    </li>
                    <li className="flex items-center">
                      <Car className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                      <span>Luxury marina with yacht facilities</span>
                    </li>
                    <li className="flex items-center">
                      <Building2 className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                      <span>Premium retail and dining districts</span>
                    </li>
                    <li className="flex items-center">
                      <Wifi className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                      <span>World-class spa and wellness centers</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Marassi North Coast represents the pinnacle of luxury coastal living in Egypt. This prestigious development by EMAAR Misr offers an unparalleled lifestyle experience with pristine Mediterranean beaches, world-class amenities, and sophisticated architectural design that sets new standards for resort communities in the region.
            </p>
            
            <p className="text-lg text-gray-700 leading-relaxed">
              Located 125 kilometers west of Alexandria on Egypt's coveted North Coast, Marassi spans an impressive 1,544 acres of prime Mediterranean waterfront. The development features 6.5 kilometers of private beaches, making it one of the most exclusive beachfront destinations in Egypt.
            </p>
          </section>

          {/* Developer Profile */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">About EMAAR Misr</h2>
            
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-8 border border-yellow-200">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                EMAAR Misr is the Egyptian subsidiary of EMAAR Properties, the world-renowned developer behind iconic projects such as Burj Khalifa and The Dubai Mall. With over 25 years of global experience, EMAAR brings world-class expertise to the Egyptian market.
              </p>
              
              <p className="text-lg text-gray-700 leading-relaxed">
                EMAAR Misr is committed to developing landmark destinations that redefine luxury living standards in Egypt, combining international expertise with local market understanding to create exceptional communities that enhance Egypt's real estate landscape.
              </p>
            </div>
          </section>

          {/* Unit Types */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Property Types & Specifications</h2>
            
            <div className="grid gap-8">
              
              {/* Beachfront Villas */}
              <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-600">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Beachfront Villas</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Specifications:</h4>
                    <ul className="text-gray-700 space-y-1">
                      <li>• Built-up Area: 300-800 sqm</li>
                      <li>• Bedrooms: 3-6 bedrooms</li>
                      <li>• Bathrooms: 3-7 bathrooms</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Premium Features:</h4>
                    <ul className="text-gray-700 space-y-1">
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

              {/* Golf Course Villas */}
              <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-600">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Golf Course Villas</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Specifications:</h4>
                    <ul className="text-gray-700 space-y-1">
                      <li>• Built-up Area: 250-600 sqm</li>
                      <li>• Bedrooms: 3-5 bedrooms</li>
                      <li>• Bathrooms: 3-6 bathrooms</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Premium Features:</h4>
                    <ul className="text-gray-700 space-y-1">
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

              {/* Marina Apartments */}
              <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-600">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Marina Apartments</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Specifications:</h4>
                    <ul className="text-gray-700 space-y-1">
                      <li>• Built-up Area: 120-300 sqm</li>
                      <li>• Bedrooms: 1-4 bedrooms</li>
                      <li>• Bathrooms: 1-4 bathrooms</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Premium Features:</h4>
                    <ul className="text-gray-700 space-y-1">
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

              {/* Hilltop Estates */}
              <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-600">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Hilltop Estates</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Specifications:</h4>
                    <ul className="text-gray-700 space-y-1">
                      <li>• Built-up Area: 400-1000 sqm</li>
                      <li>• Bedrooms: 4-7 bedrooms</li>
                      <li>• Bathrooms: 4-8 bathrooms</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Ultra-Luxury Features:</h4>
                    <ul className="text-gray-700 space-y-1">
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
            </div>
          </section>

          {/* Investment Analysis */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Investment Potential & Market Analysis</h2>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-8 border border-green-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Why Marassi Represents Exceptional Value</h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Market Advantages</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>• EMAAR's international reputation and track record</li>
                    <li>• Limited beachfront supply on North Coast</li>
                    <li>• Growing demand for luxury coastal properties</li>
                    <li>• Strong rental yield potential during summer season</li>
                    <li>• Capital appreciation from brand premium</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Investment Highlights</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Flexible payment plans available</li>
                    <li>• Handover ready and under-construction options</li>
                    <li>• Professional property management services</li>
                    <li>• High-end rental market targeting</li>
                    <li>• Long-term value appreciation potential</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Conclusion */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Expert Consultation & Next Steps</h2>
            
            <div className="bg-blue-900 text-white rounded-lg p-8">
              <h3 className="text-xl font-semibold mb-4">Professional Guidance for Marassi Investment</h3>
              <p className="text-blue-100 leading-relaxed mb-6">
                As Egypt's premier luxury Mediterranean resort, Marassi North Coast by EMAAR Misr represents a unique opportunity to own in one of the region's most prestigious developments. With limited beachfront inventory and EMAAR's world-class reputation, early investment positions offer the strongest value proposition.
              </p>
              
              <p className="text-blue-100 leading-relaxed mb-6">
                Our expertise in North Coast luxury properties and direct relationships with EMAAR Misr enable us to provide exclusive access to the best available units, preferred pricing structures, and comprehensive investment guidance tailored to your portfolio objectives.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/contact" className="bg-white text-blue-900 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-center">
                  Schedule Consultation
                </Link>
                <Link to="/projects" className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors text-center">
                  View Project Details
                </Link>
              </div>
            </div>
          </section>

          {/* Author Bio */}
          <section className="border-t border-gray-200 pt-8">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">MA</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">Mohamed Assem</h3>
                <p className="text-blue-600 mb-2">Senior Real Estate Consultant</p>
                <p className="text-gray-700 leading-relaxed">
                  With over 30 years of experience in luxury real estate across Egypt and Dubai, Mohamed Assem specializes in North Coast developments and premium investment properties. His expertise in EMAAR projects and deep market knowledge provide clients with unparalleled insights for successful property investments.
                </p>
              </div>
            </div>
          </section>
        </article>
      </main>
      
      <Footer />
    </div>
  );
}