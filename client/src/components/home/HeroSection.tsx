import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Phone, Mail } from "lucide-react";

export default function HeroSection() {
  return (
    <section 
      className="relative h-[90vh] overflow-hidden"
      aria-labelledby="hero-heading"
      role="banner"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/hero-background.svg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
          role="img"
          aria-label="Luxury waterfront property with marina and high-rise buildings"
        />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            {/* Brand Logo/Name */}
            <div className="mb-8">
              <h1 
                id="hero-heading"
                className="text-5xl md:text-7xl font-serif font-bold mb-4 tracking-tight"
              >
                The <span className="text-[#B87333]">Views</span>
              </h1>
              <div className="w-32 h-1 bg-[#B87333] mx-auto mb-6" role="presentation"></div>
              <p className="text-xl md:text-2xl font-light opacity-90 tracking-wide">
                Real Estate Consultancy
              </p>
            </div>

            {/* Main Tagline */}
            <div className="mb-10">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-semibold mb-6 leading-tight">
                Discover Extraordinary Properties<br />
                <span className="text-[#B87333]">Beyond Expectations</span>
              </h2>
              <p className="text-lg md:text-xl opacity-90 max-w-3xl mx-auto leading-relaxed">
                Experience luxury real estate with Egypt's premier consultancy. 
                From exclusive Cairo compounds to Dubai's finest developments, 
                we bring you properties that define sophisticated living.
              </p>
            </div>

            {/* Call-to-Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12" role="group" aria-label="Primary actions">
              <Link href="/properties">
                <Button 
                  size="lg"
                  className="bg-[#B87333] hover:bg-[#964B00] focus:bg-[#964B00] focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent text-white px-8 py-4 text-lg font-semibold rounded-md shadow-lg transition-all duration-300 transform hover:scale-105 focus:scale-105 min-w-[200px]"
                  aria-describedby="browse-properties-desc"
                >
                  Browse Properties
                  <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-black focus:bg-white focus:text-black focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent px-8 py-4 text-lg font-semibold rounded-md transition-all duration-300 min-w-[200px]"
                  aria-describedby="contact-us-desc"
                >
                  <Phone className="w-5 h-5 mr-2" aria-hidden="true" />
                  Contact Us
                </Button>
              </Link>
            </div>

            {/* Hidden descriptions for screen readers */}
            <div className="sr-only">
              <p id="browse-properties-desc">View our complete collection of luxury properties for sale and rent</p>
              <p id="contact-us-desc">Get in touch with our real estate consultants for personalized assistance</p>
            </div>

            {/* Quick Contact Info */}
            <address className="flex flex-col md:flex-row justify-center items-center gap-6 text-sm opacity-80 not-italic">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" aria-hidden="true" />
                <a href="tel:+201063111136" className="hover:text-[#B87333] transition-colors focus:text-[#B87333] focus:outline-none focus:underline">
                  +20 106 311 1136
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" aria-hidden="true" />
                <a href="mailto:Sales@theviewsconsultancy.com" className="hover:text-[#B87333] transition-colors focus:text-[#B87333] focus:outline-none focus:underline">
                  Sales@theviewsconsultancy.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" aria-hidden="true" />
                <span>Cairo • Dubai • North Coast</span>
              </div>
            </address>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent rounded-full p-2"
        role="button"
        tabIndex={0}
        aria-label="Scroll down to view more content"
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
          }
        }}
      >
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}