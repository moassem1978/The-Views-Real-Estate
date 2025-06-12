import { Link } from "wouter";

export default function HeroSection() {
  return (
    <section className="relative bg-gray-800 h-[70vh] overflow-hidden">
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2075&q=80" 
          alt="Luxury waterfront property" 
          className="w-full h-full object-cover opacity-80"
          loading="eager"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-gray-800 via-gray-800/50 to-transparent"></div>
      
      <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
        <div className="max-w-2xl animate-in fade-in duration-700">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-semibold text-white leading-tight">
            Discover Exceptional <span className="text-[#D4AF37]">Luxury Properties</span>
          </h1>
          <p className="mt-4 text-lg text-white/90 max-w-xl">
            Curated selection of the world's most extraordinary homes and estates, 
            tailored to the discerning tastes of our clientele.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link href="/properties" className="px-6 py-3 bg-[#D4AF37] hover:bg-[#BF9B30] text-white font-medium rounded-md transition-colors shadow-lg transform hover:scale-[1.02] inline-flex items-center justify-center">
              Browse Properties
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
            <Link href="/services" className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-md transition-colors backdrop-blur-sm inline-flex items-center justify-center">
              Our Services
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
