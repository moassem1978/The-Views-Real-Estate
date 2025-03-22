import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import LogoDisplay from "@/components/ui/LogoDisplay";

// Define SiteSettings interface 
interface SiteSettings {
  companyName: string;
  companyLogo?: string;
  primaryColor?: string;
  contactEmail?: string;
  contactPhone?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  
  // Fetch site settings including logo
  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ['/api/site-settings'],
  });

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="sticky top-0 bg-white/90 backdrop-blur-sm z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          {/* Logo */}
          <div className="mr-8">
            <Link href="/" className="flex items-center">
              {settings?.companyLogo ? (
                <div className="h-10 w-10 overflow-hidden mr-2">
                  <img 
                    src={settings.companyLogo} 
                    alt={settings.companyName}
                    className="h-full w-full object-contain"
                  />
                </div>
              ) : (
                <div className="h-10 w-10 rounded-full bg-[#B87333] flex items-center justify-center shadow-md">
                  <span className="font-serif font-bold text-white text-lg">TV</span>
                </div>
              )}
              <span className="ml-2 font-serif text-gray-800 text-xl font-semibold">
                The <span className="text-[#B87333]">Views</span> <span className="text-gray-800">Real Estate</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            <Link 
              href="/" 
              className={`py-2 font-medium ${location === "/" ? "text-[#B87333]" : "text-gray-800 hover:text-[#B87333]"} transition-colors`}
            >
              Home
            </Link>
            <Link 
              href="/properties" 
              className={`py-2 font-medium ${location === "/properties" ? "text-[#B87333]" : "text-gray-800 hover:text-[#B87333]"} transition-colors`}
            >
              Properties
            </Link>
            <div className="relative group">
              <button className="py-2 font-medium text-gray-800 hover:text-[#A67C00] transition-colors flex items-center">
                Services
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <div className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-md overflow-hidden transform scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-200 origin-top-left z-50">
                <Link href="/services/buying" className="block px-4 py-2 text-sm text-gray-800 hover:bg-[#F5F0E6] hover:text-[#D4AF37] transition-colors">
                  Buying
                </Link>
                <Link href="/services/selling" className="block px-4 py-2 text-sm text-gray-800 hover:bg-[#F5F0E6] hover:text-[#D4AF37] transition-colors">
                  Selling
                </Link>
                <Link href="/services/investment" className="block px-4 py-2 text-sm text-gray-800 hover:bg-[#F5F0E6] hover:text-[#D4AF37] transition-colors">
                  Investment
                </Link>
                <Link href="/services/consultation" className="block px-4 py-2 text-sm text-gray-800 hover:bg-[#F5F0E6] hover:text-[#D4AF37] transition-colors">
                  Consultation
                </Link>
              </div>
            </div>
            <Link 
              href="/about" 
              className={`py-2 font-medium ${location === "/about" ? "text-[#B87333]" : "text-gray-800 hover:text-[#B87333]"} transition-colors`}
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className={`py-2 font-medium ${location === "/contact" ? "text-[#B87333]" : "text-gray-800 hover:text-[#B87333]"} transition-colors`}
            >
              Contact
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <button className="hidden md:flex items-center justify-center h-10 w-10 rounded-full text-gray-800 hover:text-[#B87333] hover:bg-[#F9F3E8] transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button className="hidden md:flex items-center justify-center h-10 w-10 rounded-full text-gray-800 hover:text-[#B87333] hover:bg-[#F9F3E8] transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          <Link href="/dashboard" className="hidden md:inline-flex items-center px-4 py-2 rounded bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors shadow-sm mr-2">
            <span>Dashboard</span>
          </Link>
          <Link href="/signin" className="hidden md:inline-flex items-center px-4 py-2 rounded bg-[#B87333] text-white hover:bg-[#955A28] transition-colors shadow-sm">
            <span>Sign In</span>
          </Link>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden flex items-center justify-center h-10 w-10 rounded-full text-gray-800 hover:text-[#B87333] hover:bg-[#F9F3E8] transition-all" 
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`md:hidden bg-white border-t border-[#E8DACB] ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="container mx-auto px-4 py-3">
          <nav className="flex flex-col space-y-2">
            <Link href="/" className="py-2 font-medium text-gray-800">Home</Link>
            <Link href="/properties" className="py-2 font-medium text-gray-800">Properties</Link>
            <div className="py-2">
              <button className="font-medium text-gray-800 flex justify-between w-full">
                Services
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="pl-4 mt-2 space-y-2">
                <Link href="/services/buying" className="block py-1 text-gray-800">Buying</Link>
                <Link href="/services/selling" className="block py-1 text-gray-800">Selling</Link>
                <Link href="/services/investment" className="block py-1 text-gray-800">Investment</Link>
                <Link href="/services/consultation" className="block py-1 text-gray-800">Consultation</Link>
              </div>
            </div>
            <Link href="/about" className="py-2 font-medium text-gray-800">About</Link>
            <Link href="/contact" className="py-2 font-medium text-gray-800">Contact</Link>
            <Link href="/dashboard" className="py-2 font-medium text-gray-800">Dashboard</Link>
            <div className="flex space-x-4 py-2">
              <Link href="/signin" className="inline-flex items-center px-4 py-2 rounded bg-[#B87333] text-white">
                <span>Sign In</span>
              </Link>
              <button className="flex items-center justify-center h-10 w-10 rounded-full text-gray-800 hover:text-[#B87333] hover:bg-[#F9F3E8]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
