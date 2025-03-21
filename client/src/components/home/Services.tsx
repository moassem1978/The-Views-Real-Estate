import { Service } from "@/types";
import { Link } from "wouter";

export default function Services() {
  const services: Service[] = [
    {
      icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
      title: "Luxury Property Sales",
      description: "Expert representation for sellers of distinguished properties, with tailored marketing strategies to reach qualified buyers globally."
    },
    {
      icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
      title: "Buyer Representation",
      description: "Personalized property acquisition services, including exclusive access to off-market listings and thorough due diligence support."
    },
    {
      icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
      title: "Investment Advisory",
      description: "Strategic guidance for real estate portfolio development, property valuation, and market analysis for optimal investment opportunities."
    },
    {
      icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      title: "International Properties",
      description: "Access to an exclusive network of luxury properties worldwide, with specialized guidance for international transactions."
    },
    {
      icon: "M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z",
      title: "Marketing Excellence",
      description: "Sophisticated marketing campaigns featuring professional photography, cinematic videos, and targeted digital strategies."
    },
    {
      icon: "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z",
      title: "Concierge Services",
      description: "Premium concierge support for seamless transactions, including financing arrangements, legal services, and relocation assistance."
    }
  ];

  return (
    <section className="py-16 bg-[#F5F0E6]">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-[#D4AF37] font-medium">Our Expertise</span>
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-gray-800 mt-2">Premier Real Estate Services</h2>
          <p className="mt-4 text-gray-600">
            We offer a comprehensive range of specialized services designed to meet the unique needs of our distinguished clientele.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-8 hover:shadow-xl transition-shadow group">
              <div className="h-14 w-14 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center mb-6 group-hover:bg-[#D4AF37]/30 transition-colors">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6 text-[#D4AF37]" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={service.icon} />
                </svg>
              </div>
              <h3 className="font-serif text-xl font-semibold text-gray-800">{service.title}</h3>
              <p className="mt-3 text-gray-600">
                {service.description}
              </p>
              <Link 
                href={`/services/${service.title.toLowerCase().replace(/\s+/g, '-')}`} 
                className="mt-4 inline-flex items-center text-[#D4AF37] hover:text-[#BF9B30] font-medium transition-colors"
              >
                Learn More
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:ml-3 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
