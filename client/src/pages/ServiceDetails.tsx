import { useEffect } from "react";
import { useRoute } from "wouter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ContactCTA from "@/components/home/ContactCTA";
import { Link } from "wouter";

// Sample service details data
const serviceDetails = {
  "buying": {
    title: "Buying Services",
    subtitle: "Find Your Dream Property",
    description: "Our expert agents will guide you through the process of finding and purchasing your dream luxury property, with personalized service at every step.",
    process: [
      {
        title: "Initial Consultation",
        description: "We begin with a detailed consultation to understand your specific needs, preferences, and budget considerations. This allows us to tailor our property search to your exact requirements."
      },
      {
        title: "Property Selection",
        description: "Based on your criteria, we curate a selection of luxury properties that match your vision, saving you time by focusing only on relevant options."
      },
      {
        title: "Guided Viewings",
        description: "We accompany you on property viewings, providing expert insights on location value, property condition, and investment potential."
      },
      {
        title: "Offer & Negotiation",
        description: "When you find your ideal property, we help you prepare a competitive offer and negotiate skillfully on your behalf to secure the best possible terms."
      },
      {
        title: "Transaction Management",
        description: "We manage all aspects of the transaction process, coordinating with legal advisors, financial institutions, and other parties to ensure a smooth closing."
      }
    ],
    contactType: "form",
    bgImage: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTh8fGx1eHVyeSUyMHJlYWwlMjBlc3RhdGV8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60"
  },
  "selling": {
    title: "Selling Services",
    subtitle: "Maximize Your Property Value",
    description: "We leverage our extensive network and marketing expertise to showcase your property to qualified buyers and secure the best possible price.",
    process: [
      {
        title: "Property Valuation",
        description: "We conduct a thorough market analysis to determine the optimal listing price for your property, considering current market conditions and comparable sales."
      },
      {
        title: "Property Preparation",
        description: "Our team provides guidance on staging and presentation to enhance your property's appeal to luxury buyers and maximize its market value."
      },
      {
        title: "Premium Marketing",
        description: "We implement a sophisticated marketing strategy, including professional photography, virtual tours, and targeted exposure to our network of high-net-worth clients."
      },
      {
        title: "Buyer Qualification",
        description: "We carefully screen potential buyers to ensure they are financially qualified, saving you time and ensuring serious offers."
      },
      {
        title: "Closing Support",
        description: "Our team manages the entire closing process, from offer acceptance to final settlement, ensuring all details are handled professionally."
      }
    ],
    contactType: "whatsapp",
    bgImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTB8fGx1eHVyeSUyMHJlYWwlMjBlc3RhdGV8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60"
  },
  "consultation": {
    title: "Consultation Services",
    subtitle: "Expert Advice for Your Real Estate Decisions",
    description: "Our consultation services provide you with expert guidance on all aspects of real estate investment, whether you're buying, selling, or considering market opportunities.",
    process: [
      {
        title: "Investment Strategy",
        description: "We help you develop a comprehensive real estate investment strategy aligned with your financial goals and risk tolerance."
      },
      {
        title: "Market Analysis",
        description: "Our experts provide in-depth analysis of current market conditions, trends, and opportunities in your areas of interest."
      },
      {
        title: "Property Evaluation",
        description: "We offer detailed assessments of specific properties you're considering, analyzing value, potential issues, and growth prospects."
      },
      {
        title: "Portfolio Review",
        description: "For existing property owners, we review your current real estate portfolio to identify optimization opportunities and potential improvements."
      },
      {
        title: "Customized Recommendations",
        description: "Based on our consultation, we provide tailored recommendations and actionable steps to achieve your real estate objectives."
      }
    ],
    contactType: "questionnaire",
    bgImage: "https://images.unsplash.com/photo-1613553507747-5f8d62ad5904?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTZ8fGx1eHVyeSUyMHJlYWwlMjBlc3RhdGV8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60"
  }
};

// The form component for buying service
const ContactForm = () => (
  <div className="bg-white rounded-lg shadow-md p-6 border border-[#E8DACB]">
    <h3 className="text-xl font-serif font-semibold text-gray-800 mb-4">Contact an Agent</h3>
    <form className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input
          type="text"
          id="name"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#B87333] focus:border-[#B87333]"
          placeholder="Enter your full name"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          id="email"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#B87333] focus:border-[#B87333]"
          placeholder="Enter your email"
        />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
        <input
          type="tel"
          id="phone"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#B87333] focus:border-[#B87333]"
          placeholder="Enter your phone number"
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
        <textarea
          id="message"
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#B87333] focus:border-[#B87333]"
          placeholder="Tell us about the property you're looking for"
        ></textarea>
      </div>
      <button
        type="button"
        className="w-full bg-[#B87333] hover:bg-[#964B00] text-white py-2 px-4 rounded-md transition-colors"
      >
        Submit Request
      </button>
    </form>
  </div>
);

// The WhatsApp contact component for selling service
const WhatsAppContact = () => (
  <div className="bg-white rounded-lg shadow-md p-6 border border-[#E8DACB]">
    <h3 className="text-xl font-serif font-semibold text-gray-800 mb-4">Contact via WhatsApp</h3>
    <p className="text-gray-600 mb-6">
      Our selling specialists are ready to assist you with maximizing your property's value. Click the button below to start a conversation on WhatsApp.
    </p>
    <a
      href="https://wa.me/1234567890?text=I'm%20interested%20in%20selling%20my%20property"
      target="_blank"
      rel="noopener noreferrer"
      className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-3 px-4 rounded-md transition-colors flex justify-center items-center"
    >
      <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
      WhatsApp Agent
    </a>
    <div className="mt-6 text-center">
      <p className="text-gray-600 mb-2">Prefer a call?</p>
      <a
        href="tel:+1234567890"
        className="inline-flex items-center text-[#B87333] hover:text-[#964B00] font-medium transition-colors"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        +123 456 7890
      </a>
    </div>
  </div>
);

// The questionnaire component for consultation service
const ConsultationQuestionnaire = () => (
  <div className="bg-white rounded-lg shadow-md p-6 border border-[#E8DACB]">
    <h3 className="text-xl font-serif font-semibold text-gray-800 mb-4">Real Estate Consultation Questionnaire</h3>
    <form className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input
          type="text"
          id="name"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#B87333] focus:border-[#B87333]"
          placeholder="Enter your full name"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          id="email"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#B87333] focus:border-[#B87333]"
          placeholder="Enter your email"
        />
      </div>
      <div>
        <label htmlFor="investmentGoals" className="block text-sm font-medium text-gray-700 mb-1">Investment Goals</label>
        <select
          id="investmentGoals"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#B87333] focus:border-[#B87333]"
        >
          <option value="">Select your primary goal</option>
          <option value="residential">Residential Property</option>
          <option value="commercial">Commercial Property</option>
          <option value="rental">Rental Income</option>
          <option value="flip">Property Flipping</option>
          <option value="long-term">Long-term Investment</option>
        </select>
      </div>
      <div>
        <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">Investment Budget</label>
        <select
          id="budget"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#B87333] focus:border-[#B87333]"
        >
          <option value="">Select your budget range</option>
          <option value="under-1m">Under 1 Million L.E</option>
          <option value="1m-3m">1 - 3 Million L.E</option>
          <option value="3m-5m">3 - 5 Million L.E</option>
          <option value="5m-10m">5 - 10 Million L.E</option>
          <option value="over-10m">Over 10 Million L.E</option>
        </select>
      </div>
      <div>
        <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-1">Investment Timeline</label>
        <select
          id="timeline"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#B87333] focus:border-[#B87333]"
        >
          <option value="">Select your timeline</option>
          <option value="immediate">Immediate (0-3 months)</option>
          <option value="short">Short-term (3-6 months)</option>
          <option value="medium">Medium-term (6-12 months)</option>
          <option value="long">Long-term (1+ years)</option>
        </select>
      </div>
      <div>
        <label htmlFor="questions" className="block text-sm font-medium text-gray-700 mb-1">Specific Questions</label>
        <textarea
          id="questions"
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#B87333] focus:border-[#B87333]"
          placeholder="Any specific questions or areas you'd like our consultation to address?"
        ></textarea>
      </div>
      <button
        type="button"
        className="w-full bg-[#B87333] hover:bg-[#964B00] text-white py-2 px-4 rounded-md transition-colors"
      >
        Request Consultation
      </button>
    </form>
  </div>
);

export default function ServiceDetails() {
  // Get the service type from the URL
  const [, params] = useRoute("/services/:serviceType");
  const serviceType = params?.serviceType || "buying";
  
  // Get the service details (default to buying if not found)
  const service = serviceDetails[serviceType as keyof typeof serviceDetails] || serviceDetails.buying;
  
  // Scroll to top when component mounts or serviceType changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [serviceType]);
  
  // Determine which contact component to show
  const renderContactComponent = () => {
    switch (service.contactType) {
      case "whatsapp":
        return <WhatsAppContact />;
      case "questionnaire":
        return <ConsultationQuestionnaire />;
      case "form":
      default:
        return <ContactForm />;
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-[#333333] py-16 relative">
          <div className="absolute inset-0 opacity-20">
            <img 
              src={service.bgImage} 
              alt={service.title} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#333333]/70 to-[#333333]/90"></div>
          
          <div className="container mx-auto px-4 relative z-10 text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-semibold text-white leading-tight mb-2">
              {service.title}
            </h1>
            <p className="text-xl text-[#D4AF37] font-medium mb-4">
              {service.subtitle}
            </p>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              {service.description}
            </p>
          </div>
        </section>
        
        {/* Process Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-[#D4AF37] font-medium">Our Process</span>
              <h2 className="text-3xl md:text-4xl font-serif font-semibold text-gray-800 mt-2">
                How We Work With You
              </h2>
              <p className="mt-4 text-gray-600">
                Our tailored approach ensures you receive personalized service that meets your specific needs.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              {service.process.map((step, index) => (
                <div key={index} className="bg-[#F5F0E6] rounded-lg p-6 relative border-l-4 border-[#B87333]">
                  <div className="absolute -left-3 top-5 bg-[#B87333] text-white h-6 w-6 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-gray-800 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              <div className="md:col-span-2">
                <h3 className="font-serif text-2xl font-semibold text-gray-800 mb-4">Why Choose Our {service.title}</h3>
                <p className="text-gray-600 mb-6">
                  At The Views Real Estate, we pride ourselves on delivering exceptional service that goes beyond standard real estate transactions. Our {serviceType} services are designed to provide:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-[#B87333] mr-2 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">Personalized attention tailored to your specific needs and preferences</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-[#B87333] mr-2 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">Expert market knowledge and insights into the Egyptian luxury real estate market</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-[#B87333] mr-2 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">Access to exclusive properties not available on the general market</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-[#B87333] mr-2 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">Transparent communication throughout the entire process</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-[#B87333] mr-2 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">Comprehensive support from our team of seasoned professionals</span>
                  </li>
                </ul>
              </div>
              
              <div>
                {renderContactComponent()}
              </div>
            </div>
          </div>
        </section>
        
        {/* Other Services */}
        <section className="py-16 bg-[#F5F0E6]">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-[#D4AF37] font-medium">Explore More</span>
              <h2 className="text-3xl md:text-4xl font-serif font-semibold text-gray-800 mt-2">
                Other Services We Offer
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {Object.entries(serviceDetails)
                .filter(([key]) => key !== serviceType)
                .map(([key, otherService]) => (
                  <div key={key} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={otherService.bgImage} 
                        alt={otherService.title} 
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="font-serif text-xl font-semibold text-gray-800 mb-2">{otherService.title}</h3>
                      <p className="text-gray-600 mb-4">{otherService.description}</p>
                      <Link 
                        href={`/services/${key}`} 
                        className="inline-flex items-center text-[#B87333] hover:text-[#964B00] font-medium transition-colors"
                      >
                        Learn More
                        <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                ))}
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