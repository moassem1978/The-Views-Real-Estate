import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ContactCTA from "@/components/home/ContactCTA";
import { useEffect } from "react";
import { Link } from "wouter";
import SEO from "@/components/SEO";

export default function Services() {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const services = [
    {
      icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
      title: "Buying Services",
      description: "Our expert agents will guide you through the process of finding and purchasing your dream luxury property, with personalized service at every step."
    },
    {
      icon: "M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2",
      title: "Selling Services",
      description: "We leverage our extensive network and marketing expertise to showcase your property to qualified buyers and secure the best possible price."
    },
    {
      icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
      title: "Property Management",
      description: "Our comprehensive property management services ensure that your investment is professionally maintained and generates optimal returns."
    },
    {
      icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
      title: "Investment Advisory",
      description: "Our investment specialists will help you identify properties with the highest potential for appreciation and rental income."
    },
    {
      icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
      title: "Financing Solutions",
      description: "We connect you with premier financial institutions offering competitive rates and specialized loan products for luxury properties."
    },
    {
      icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
      title: "Relocation Assistance",
      description: "Our comprehensive relocation services help you transition smoothly to your new luxury residence, handling all details so you don't have to."
    }
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Real Estate Services",
    "description": "Comprehensive real estate services including buying, selling, investment consultation, and property management",
    "provider": {
      "@type": "RealEstateAgent",
      "name": "The Views Real Estate",
      "telephone": "+20-106-311-1136",
      "email": "Sales@theviewsrealestate.com"
    },
    "serviceType": [
      "Property Buying Services",
      "Property Selling Services", 
      "Investment Consultation",
      "Property Management",
      "Market Analysis",
      "Legal Advisory"
    ],
    "areaServed": [
      {
        "@type": "City",
        "name": "Cairo"
      },
      {
        "@type": "City",
        "name": "Dubai"
      },
      {
        "@type": "City",
        "name": "New Administrative Capital"
      },
      {
        "@type": "City",
        "name": "North Coast"
      }
    ]
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SEO
        title="Real Estate Services | Buying, Selling & Investment"
        description="Expert real estate services in Egypt and Dubai. Property buying, selling, investment consultation, and management services with professional guidance."
        url="/services"
        keywords="real estate services Egypt, property buying services, selling services Dubai, investment consultation, property management, luxury property services"
        structuredData={structuredData}
      />
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-[#333333] py-16 relative">
          <div className="absolute inset-0 opacity-20">
            <img loading="lazy" 
              src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
              alt="Luxury real estate services" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#333333]/70 to-[#333333]/90"></div>
          
          <div className="container mx-auto px-4 relative z-10 text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-semibold text-white leading-tight mb-4">
              Our Exclusive Services
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Discover our comprehensive suite of luxury real estate services designed to exceed the expectations of the most discerning clients.
            </p>
          </div>
        </section>
        
        {/* Services Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-[#D4AF37] font-medium">What We Offer</span>
              <h2 className="text-3xl md:text-4xl font-serif font-semibold text-gray-800 mt-2">
                Comprehensive Real Estate Services
              </h2>
              <p className="mt-4 text-gray-600">
                We provide end-to-end services for luxury property transactions, ensuring a seamless experience for our clients.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-8 hover:shadow-xl transition-shadow border border-[#E8DACB]">
                  <div className="h-14 w-14 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={service.icon} />
                    </svg>
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-gray-800 mb-3">{service.title}</h3>
                  <p className="text-gray-600 mb-4">
                    {service.description}
                  </p>
                  <Link 
                    href={`/services/${service.title.toLowerCase().replace(/\s+/g, '-')}`} 
                    className="text-[#D4AF37] hover:text-[#BF9B30] font-medium inline-flex items-center transition-colors"
                  >
                    Learn More
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Process Section */}
        <section className="py-16 bg-[#F5F0E6]">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-[#D4AF37] font-medium">Our Process</span>
              <h2 className="text-3xl md:text-4xl font-serif font-semibold text-gray-800 mt-2">
                How We Work With You
              </h2>
              <p className="mt-4 text-gray-600">
                Our streamlined process ensures a smooth and efficient experience from initial consultation to final closing.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="relative">
                <div className="bg-white rounded-lg shadow-md p-8 relative z-10">
                  <div className="h-12 w-12 rounded-full bg-[#D4AF37] text-white text-xl font-bold flex items-center justify-center mb-6">
                    1
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-gray-800 mb-3">Consultation</h3>
                  <p className="text-gray-600">
                    We begin with a detailed discussion to understand your specific needs, preferences, and goals.
                  </p>
                </div>
                <div className="hidden lg:block absolute top-1/2 right-0 w-1/2 h-2 bg-[#D4AF37]/30 transform translate-x-1/2"></div>
              </div>
              
              <div className="relative">
                <div className="bg-white rounded-lg shadow-md p-8 relative z-10">
                  <div className="h-12 w-12 rounded-full bg-[#D4AF37] text-white text-xl font-bold flex items-center justify-center mb-6">
                    2
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-gray-800 mb-3">Personalized Strategy</h3>
                  <p className="text-gray-600">
                    We develop a tailored approach based on your requirements and current market conditions.
                  </p>
                </div>
                <div className="hidden lg:block absolute top-1/2 right-0 w-1/2 h-2 bg-[#D4AF37]/30 transform translate-x-1/2"></div>
              </div>
              
              <div className="relative">
                <div className="bg-white rounded-lg shadow-md p-8 relative z-10">
                  <div className="h-12 w-12 rounded-full bg-[#D4AF37] text-white text-xl font-bold flex items-center justify-center mb-6">
                    3
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-gray-800 mb-3">Implementation</h3>
                  <p className="text-gray-600">
                    Our team executes the plan with precision, keeping you informed at every step of the process.
                  </p>
                </div>
                <div className="hidden lg:block absolute top-1/2 right-0 w-1/2 h-2 bg-[#D4AF37]/30 transform translate-x-1/2"></div>
              </div>
              
              <div className="relative">
                <div className="bg-white rounded-lg shadow-md p-8 relative z-10">
                  <div className="h-12 w-12 rounded-full bg-[#D4AF37] text-white text-xl font-bold flex items-center justify-center mb-6">
                    4
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-gray-800 mb-3">Successful Outcome</h3>
                  <p className="text-gray-600">
                    We guide you through closing and beyond, ensuring a seamless transition and lasting satisfaction.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Testimonial Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="bg-[#F5F0E6] rounded-lg p-8 md:p-12">
              <div className="max-w-4xl mx-auto text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#D4AF37] mx-auto mb-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="text-xl md:text-2xl font-serif text-gray-800 mb-8">
                  "LuxuryRealty provided an exceptional level of service during our recent property acquisition. Their expertise and attention to detail made what could have been a complex process feel effortless and smooth."
                </p>
                <div>
                  <p className="font-semibold text-gray-800">Jonathan & Sarah Peterson</p>
                  <p className="text-gray-600">Beverly Hills, CA</p>
                </div>
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