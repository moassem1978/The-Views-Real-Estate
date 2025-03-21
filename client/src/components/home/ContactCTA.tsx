import { Link } from "wouter";

export default function ContactCTA() {
  return (
    <section className="py-20 bg-gray-800 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <img 
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
          alt="Luxury property background" 
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-800/90 to-gray-800/80"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold">
            Experience Unparalleled <span className="text-[#D4AF37]">Luxury Real Estate</span> Service
          </h2>
          <p className="mt-6 text-white/80 text-lg">
            Whether you're looking to buy, sell, or invest in luxury properties, our team of experienced professionals is ready to assist you every step of the way.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact" 
              className="px-8 py-4 bg-[#D4AF37] hover:bg-[#BF9B30] text-white font-medium rounded-md transition-colors shadow-lg inline-flex items-center justify-center"
            >
              Schedule a Consultation
            </Link>
            <Link 
              href="/contact?agent=true" 
              className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-medium rounded-md transition-colors inline-flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Contact an Agent
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
