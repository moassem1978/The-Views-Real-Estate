import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone, Mail, MapPin } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative h-[90vh] overflow-hidden bg-black text-white">
      {/* Background Placeholder for Static Image */}
      <div className="absolute inset-0">
        <div 
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url('/placeholder-hero.jpg')`,
            opacity: 0.3,
          }}
        />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-4">
            Discover Your <span className="text-[#B87333]">Luxury</span> Home
          </h1>
          <p className="text-lg md:text-xl font-light mb-10">
            Experience exceptional properties with The Views Real Estate
          </p>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/properties">
              <Button className="bg-[#B87333] hover:bg-[#964B00] text-white text-lg px-8 py-4 rounded-md">
                Browse Properties <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button className="bg-white text-[#B87333] hover:bg-white/90 hover:text-[#964B00] text-lg px-8 py-4 rounded-md border-2 border-white">
                Contact Us
              </Button>
            </Link>
          </div>

          {/* Quick Contact Info */}
          <div className="flex flex-col md:flex-row gap-6 justify-center text-sm opacity-80">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              +20 106 311 1136
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Sales@theviewsconsultancy.com
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Cairo • Dubai • North Coast
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}