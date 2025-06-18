import { useState } from "react";
import { Link } from "wouter";
import { Menu, X, ChevronDown, ChevronUp, Phone, Mail, Search } from "lucide-react";

export default function Header() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPropertiesOpen, setPropertiesOpen] = useState(false);
  const [isServicesOpen, setServicesOpen] = useState(false);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setPropertiesOpen(false);
    setServicesOpen(false);
  };

  return (
    <header className="bg-white shadow-sm z-50 relative">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3">
          <img src="/logo.png" alt="The Views Logo" className="h-12 w-auto object-contain" />
          <div>
            <h1 className="text-xl font-serif font-bold text-[#B87333] leading-none">The Views</h1>
            <p className="text-xs text-gray-700 tracking-wide">REAL ESTATE</p>
          </div>
        </Link>

        {/* Hamburger Toggle */}
        <button
          className="md:hidden text-[#B87333]"
          onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-6 text-sm text-gray-700 font-medium">
          <Link href="/">Home</Link>
          <Link href="/properties">Properties</Link>
          <Link href="/services">Services</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </div>

      {/* Full Screen Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-40 md:hidden">
          {/* Header with Logo and Close Button */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <img src="/logo.png" alt="The Views Logo" className="h-12 w-auto object-contain" />
              <div>
                <h1 className="text-lg font-serif font-bold text-[#B87333] leading-none">The Views</h1>
                <p className="text-xs text-gray-700 tracking-wide">REAL ESTATE</p>
              </div>
            </div>
            <button
              onClick={closeMobileMenu}
              className="text-[#B87333]"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>

          {/* Menu Content */}
          <div className="flex flex-col h-full">
            <nav className="flex-1 px-4 py-6 space-y-6">
              {/* Home */}
              <Link 
                href="/" 
                onClick={closeMobileMenu}
                className="block text-lg font-medium text-gray-900 py-2"
              >
                Home
              </Link>

              {/* Properties with Submenu */}
              <div>
                <button
                  onClick={() => setPropertiesOpen(!isPropertiesOpen)}
                  className="flex items-center justify-between w-full text-lg font-medium text-gray-900 py-2"
                >
                  Properties
                  {isPropertiesOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {isPropertiesOpen && (
                  <div className="ml-4 mt-2 space-y-3">
                    <Link 
                      href="/properties?type=Primary" 
                      onClick={closeMobileMenu}
                      className="block text-gray-700 py-1"
                    >
                      Primary
                    </Link>
                    <Link 
                      href="/properties?type=Resale" 
                      onClick={closeMobileMenu}
                      className="block text-gray-700 py-1"
                    >
                      Resale
                    </Link>
                    <Link 
                      href="/international" 
                      onClick={closeMobileMenu}
                      className="block text-gray-700 py-1"
                    >
                      International
                    </Link>
                  </div>
                )}
              </div>

              {/* Services with Submenu */}
              <div>
                <button
                  onClick={() => setServicesOpen(!isServicesOpen)}
                  className="flex items-center justify-between w-full text-lg font-medium text-gray-900 py-2"
                >
                  Services
                  {isServicesOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {isServicesOpen && (
                  <div className="ml-4 mt-2 space-y-3">
                    <Link 
                      href="/services/buyer-representation" 
                      onClick={closeMobileMenu}
                      className="block text-gray-700 py-1"
                    >
                      Buyer Representation
                    </Link>
                    <Link 
                      href="/services/seller-representation" 
                      onClick={closeMobileMenu}
                      className="block text-gray-700 py-1"
                    >
                      Seller Representation
                    </Link>
                    <Link 
                      href="/services/investment" 
                      onClick={closeMobileMenu}
                      className="block text-gray-700 py-1"
                    >
                      Investment Consultation
                    </Link>
                  </div>
                )}
              </div>

              {/* Other Menu Items */}
              <Link 
                href="/projects" 
                onClick={closeMobileMenu}
                className="block text-lg font-medium text-gray-900 py-2"
              >
                Projects
              </Link>
              
              <Link 
                href="/about" 
                onClick={closeMobileMenu}
                className="block text-lg font-medium text-gray-900 py-2"
              >
                About
              </Link>
              
              <Link 
                href="/contact" 
                onClick={closeMobileMenu}
                className="block text-lg font-medium text-gray-900 py-2"
              >
                Contact
              </Link>

              {/* Sign In Button */}
              <Link 
                href="/otp-login" 
                onClick={closeMobileMenu}
                className="flex items-center text-[#B87333] font-medium py-2"
              >
                <span className="mr-2">🔑</span>
                Sign In
              </Link>
            </nav>

            {/* Footer Section */}
            <div className="px-4 py-6 border-t border-gray-200 space-y-4">
              {/* Contact Info */}
              <div className="space-y-2">
                <a 
                  href="tel:01063111136" 
                  className="flex items-center text-gray-700"
                >
                  <Phone size={16} className="mr-2" />
                  01063111136
                </a>
                <a 
                  href="mailto:Sales@theviewsrealestate.com" 
                  className="flex items-center text-gray-700"
                >
                  <Mail size={16} className="mr-2" />
                  Sales@theviewsrealestate.com
                </a>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Link 
                  href="/otp-login" 
                  onClick={closeMobileMenu}
                  className="bg-[#B87333] text-white px-4 py-2 rounded font-medium"
                >
                  Sign In
                </Link>
                <button className="p-2 border border-gray-300 rounded">
                  <Search size={20} className="text-gray-600" />
                </button>
              </div>

              {/* Social Media */}
              <div className="flex space-x-4">
                <a href="#" className="text-blue-600">
                  <span className="text-xl">f</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}