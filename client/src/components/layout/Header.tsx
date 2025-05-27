import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import LogoDisplay from "@/components/ui/LogoDisplay";
import { useAuth } from "@/hooks/use-auth";
import { Download } from "lucide-react";

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
  const [mobilePropertiesOpen, setMobilePropertiesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);

  const [canInstall, setCanInstall] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!installPrompt) return;

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;

    if (outcome === 'accepted') {
      setCanInstall(false);
      setInstallPrompt(null);
    }
  };
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [location] = useLocation();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Get auth information
  const { user, logoutMutation } = useAuth();

  // Fetch site settings including logo
  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ['/api/site-settings'],
  });

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
    setUserMenuOpen(false);
  };

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 bg-white/95 backdrop-blur-sm z-50 shadow-md border-b border-copper/10">
      {/* Top bar with contact info */}
      <div className="hidden lg:block bg-rich-black-light py-1">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-4 text-cream-dark text-sm">
            {settings?.contactPhone && (
              <a href={`tel:${settings.contactPhone}`} className="flex items-center hover:text-copper-light transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {settings.contactPhone}
              </a>
            )}
            {settings?.contactEmail && (
              <a href={`mailto:${settings.contactEmail}`} className="flex items-center hover:text-copper-light transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {settings.contactEmail}
              </a>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {settings?.socialLinks?.facebook && (
              <a href={settings.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-cream-dark hover:text-copper-light transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                </svg>
              </a>
            )}
            {settings?.socialLinks?.twitter && (
              <a href={settings.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-cream-dark hover:text-copper-light transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
            )}
            {settings?.socialLinks?.instagram && (
              <a href={settings.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-cream-dark hover:text-copper-light transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            )}
            {settings?.socialLinks?.linkedin && (
              <a href={settings.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-cream-dark hover:text-copper-light transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          {/* Logo */}
          <div className="mr-10">
            <Link href="/" className="flex items-center">
              <div className="flex-shrink-0">
                <LogoDisplay 
                  logoUrl={settings?.companyLogo} 
                  companyName={settings?.companyName || "The Views Real Estate"}
                  className="h-14 w-14 shadow-sm"
                  fallbackClassName="h-14 w-14 rounded-full bg-copper flex items-center justify-center shadow-sm border-2 border-cream-dark"
                  fallbackInitials="TV"
                />
              </div>
              <div className="ml-3 flex flex-col">
                <span className="font-serif text-rich-black-light text-xl font-semibold">
                  The <span className="text-copper">Views</span>
                </span>
                <span className="text-sm text-rich-black-light/80 font-sans tracking-wide">
                  REAL ESTATE
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              href="/" 
              className={`py-2 font-medium ${location === "/" 
                ? "text-copper relative after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1/2 after:h-0.5 after:bg-copper" 
                : "text-rich-black hover:text-copper"} transition-colors`}
            >
              Home
            </Link>
            <div className="relative group">
              <button className="py-2 font-medium text-rich-black group-hover:text-copper transition-colors flex items-center">
                Properties
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transition-transform group-hover:rotate-180" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <div className="absolute left-0 mt-1 w-52 bg-white shadow-lg rounded-md overflow-hidden transform scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-200 origin-top-left z-50 gold-border">
                <Link href="/properties?type=Primary" className="block px-4 py-3 text-sm text-rich-black hover:bg-cream hover:text-copper transition-colors border-b border-copper/10">
                  Primary
                </Link>
                <Link href="/properties?type=Resale" className="block px-4 py-3 text-sm text-rich-black hover:bg-cream hover:text-copper transition-colors border-b border-copper/10">
                  Resale
                </Link>
                <Link href="/international" className="block px-4 py-3 text-sm text-rich-black hover:bg-cream hover:text-copper transition-colors">
                  International
                </Link>
              </div>
            </div>

            <div className="relative group">
              <button className="py-2 font-medium text-rich-black group-hover:text-copper transition-colors flex items-center">
                Services
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transition-transform group-hover:rotate-180" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <div className="absolute left-0 mt-1 w-52 bg-white shadow-lg rounded-md overflow-hidden transform scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-200 origin-top-left z-50 gold-border">
                <Link href="/services/buyer-representation" className="block px-4 py-3 text-sm text-rich-black hover:bg-cream hover:text-copper transition-colors border-b border-copper/10">
                  Buyer Representation
                </Link>
                <Link href="/services/seller-representation" className="block px-4 py-3 text-sm text-rich-black hover:bg-cream hover:text-copper transition-colors border-b border-copper/10">
                  Seller Representation
                </Link>
                <Link href="/services/investment" className="block px-4 py-3 text-sm text-rich-black hover:bg-cream hover:text-copper transition-colors border-b border-copper/10">
                  Investment
                </Link>

              </div>
            </div>
            <Link 
              href="/qr-generator" 
              className={`py-2 font-medium ${location === "/qr-generator" 
                ? "text-copper relative after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1/2 after:h-0.5 after:bg-copper" 
                : "text-rich-black hover:text-copper"} transition-colors`}
            >
              QR Generator
            </Link>
            <Link 
              href="/about" 
              className={`py-2 font-medium ${location === "/about" 
                ? "text-copper relative after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1/2 after:h-0.5 after:bg-copper" 
                : "text-rich-black hover:text-copper"} transition-colors`}
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className={`py-2 font-medium ${location === "/contact" 
                ? "text-copper relative after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1/2 after:h-0.5 after:bg-copper" 
                : "text-rich-black hover:text-copper"} transition-colors`}
            >
              Contact
            </Link>
              {canInstall && (
                <button
                  onClick={handleInstallApp}
                  className="flex items-center space-x-1 text-copper hover:text-copper-dark transition-colors font-medium"
                  title="Install App"
                >
                  <Download className="h-4 w-4" />
                  <span>Install App</span>
                </button>
              )}
            </nav>
        </div>

        <div className="flex items-center space-x-4">
          <button className="hidden md:flex items-center justify-center h-10 w-10 rounded-full text-copper hover:text-copper-dark hover:bg-cream transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button className="hidden md:flex items-center justify-center h-10 w-10 rounded-full text-copper hover:text-copper-dark hover:bg-cream transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
{!user ? (
            <>
              <Link href="/signin" className="hidden md:inline-flex items-center px-5 py-2 rounded bg-copper text-white hover:bg-copper-dark transition-colors shadow-sm">
                <span className="font-medium">Sign In</span>
              </Link>
            </>
          ) : (
            <>
              {/* Direct logout button for desktop */}
              <button
                onClick={handleLogout}
                className="hidden md:inline-flex items-center px-4 py-2 mr-2 rounded bg-rich-black text-white hover:bg-rich-black-dark transition-colors shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="font-medium">Logout</span>
              </button>

              {/* Account dropdown menu */}
              <div className="relative" ref={userMenuRef}>
                <button 
                  onClick={toggleUserMenu}
                  className="hidden md:flex items-center space-x-2 px-5 py-2 rounded bg-copper text-white hover:bg-copper-dark transition-colors shadow-sm"
                >
                  <span className="font-medium">Account</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-md overflow-hidden z-50 gold-border">
                    <div className="px-4 py-3 border-b border-copper/10">
                      <p className="text-sm text-rich-black-light">Signed in as</p>
                      <p className="text-sm font-medium text-rich-black truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <Link 
                        href="/dashboard" 
                        className="block px-4 py-2 text-sm text-rich-black hover:bg-cream hover:text-copper transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Dashboard
                      </Link>

                      {/* Show User Management only for owner or admin roles */}
                      {(user.role === 'owner' || user.role === 'admin') && (
                        <>
                          <Link 
                            href="/user-management" 
                            className="block px-4 py-2 text-sm text-rich-black hover:bg-cream hover:text-copper transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            User Management
                          </Link>

                        </>
                      )}

                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 font-medium hover:bg-red-50 transition-colors border-t border-copper/10 mt-1"
                      >
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign Out
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Mobile menu button */}
          <button 
            className="md:hidden flex items-center justify-center h-10 w-10 rounded-full text-copper hover:text-copper-dark hover:bg-cream transition-all" 
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h1612h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden bg-white border-t border-copper/10 ${mobileMenuOpen ? 'block animate-in' : 'hidden'}`}>
        <div className="container mx-auto px-4 py-3">
          <nav className="flex flex-col space-y-3">
            {user && (
              <div className="flex items-center justify-between py-2 mb-2 border-b border-copper/20">
                <div>
                  <p className="font-medium text-rich-black">{user.fullName || user.username}</p>
                  <p className="text-xs text-rich-black-light">{user.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 rounded bg-copper text-white hover:bg-copper-dark transition-colors shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            )}
            <Link 
              href="/" 
              className={`py-2 font-medium ${location === "/" ? "text-copper" : "text-rich-black"} hover:text-copper transition-colors`}
            >
              Home
            </Link>
            <Link 
              href="/properties" 
              className={`py-2 font-medium ${location === "/properties" ? "text-copper" : "text-rich-black"} hover:text-copper transition-colors`}
              onClick={() => setMobileMenuOpen(false)}
            >
              All Properties
            </Link>
            <div className="py-2">
              <button 
                className="font-medium text-rich-black hover:text-copper transition-colors flex justify-between w-full"
                onClick={() => setMobilePropertiesOpen(!mobilePropertiesOpen)}
              >
                Property Types
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${mobilePropertiesOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className={`pl-4 mt-2 space-y-2 border-l-2 border-copper/20 ${mobilePropertiesOpen ? 'block' : 'hidden'}`}>
                <Link href="/properties?type=Primary" className="block py-1 text-rich-black hover:text-copper transition-colors" onClick={() => setMobileMenuOpen(false)}>Primary</Link>
                <Link href="/properties?type=Resale" className="block py-1 text-rich-black hover:text-copper transition-colors" onClick={() => setMobileMenuOpen(false)}>Resale</Link>
                <Link href="/international" className="block py-1 text-rich-black hover:text-copper transition-colors" onClick={() => setMobileMenuOpen(false)}>International</Link>
                <Link href="/heat-map" className="block py-1 text-rich-black hover:text-copper transition-colors" onClick={() => setMobileMenuOpen(false)}>Heat Map</Link>
              </div>
            </div>



            <div className="py-2">
              <button 
                className="font-medium text-rich-black hover:text-copper transition-colors flex justify-between w-full"
                onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
              >
                Services
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${mobileServicesOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className={`pl-4 mt-2 space-y-2 border-l-2 border-copper/20 ${mobileServicesOpen ? 'block' : 'hidden'}`}>
                <Link href="/services/buyer-representation" className="block py-1 text-rich-black hover:text-copper transition-colors">Buyer Representation</Link>
                <Link href="/services/seller-representation" className="block py-1 text-rich-black hover:text-copper transition-colors">Seller Representation</Link>
                <Link href="/services/investment" className="block py-1 text-rich-black hover:text-copper transition-colors">Investment</Link>
              </div>
            </div>

            <Link 
              href="/qr-generator" 
              className={`py-2 font-medium ${location === "/qr-generator" ? "text-copper" : "text-rich-black"} hover:text-copper transition-colors`}
            >
              QR Generator
            </Link>

            <Link 
              href="/about" 
              className={`py-2 font-medium ${location === "/about" ? "text-copper" : "text-rich-black"} hover:text-copper transition-colors`}
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className={`py-2 font-medium ${location === "/contact" ? "text-copper" : "text-rich-black"} hover:text-copper transition-colors`}
            >
              Contact
            </Link>
            {user && (
              <>
                <Link 
                  href="/dashboard" 
                  className={`py-2 font-medium ${location === "/dashboard" ? "text-copper" : "text-rich-black"} hover:text-copper transition-colors`}
                >
                  Dashboard
                </Link>

                {(user.role === 'owner' || user.role === 'admin') && (
                  <>
                    <Link 
                      href="/user-management" 
                      className={`py-2 font-medium ${location === "/user-management" ? "text-copper" : "text-rich-black"} hover:text-copper transition-colors`}
                    >
                      User Management
                    </Link>

                  </>
                )}
              </>
            )}

            {/* Sign In / Dashboard prominent link */}
            <div className="py-4 border-t border-copper/10">
              {!user ? (
                <Link href="/signin" className="flex items-center px-4 py-2 font-medium text-copper hover:text-copper-dark transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span className="text-lg">Sign In</span>
                </Link>
              ) : (
                <Link href="/dashboard" className="flex items-center px-4 py-2 font-medium text-copper hover:text-copper-dark transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span className="text-lg">Dashboard</span>
                </Link>
              )}
            </div>

            {/* Mobile contact info */}
            <div className="pt-2 space-y-3 text-sm">
              {settings?.contactPhone && (
                <a href={`tel:${settings.contactPhone}`} className="flex items-center text-rich-black hover:text-copper transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {settings.contactPhone}
                </a>
              )}
              {settings?.contactEmail && (
                <a href={`mailto:${settings.contactEmail}`} className="flex items-center text-rich-black hover:text-copper transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {settings.contactEmail}
                </a>
              )}
            </div>

            <div className="flex space-x-4 py-4">
              {!user ? (
                <Link href="/signin" className="inline-flex items-center px-4 py-2 rounded bg-copper text-white hover:bg-copper-dark transition-colors shadow-sm">
                  <span className="font-medium">Sign In</span>
                </Link>
              ) : (
                <>
                  {(user.role === 'owner' || user.role === 'admin') && (
                    <>
                      <Link href="/user-management" className="inline-flex items-center px-4 py-2 rounded border border-copper/20 text-rich-black hover:border-copper hover:text-copper transition-colors">
                        <span className="font-medium">User Management</span>
                      </Link>
                      <Link href="/project-management" className="inline-flex items-center px-4 py-2 rounded border border-copper/20 text-rich-black hover:border-copper hover:text-copper transition-colors">
                        <span className="font-medium">Project Management</span>
                      </Link>
                    </>
                  )}
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center px-4 py-2 rounded bg-copper text-white hover:bg-copper-dark transition-colors shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="font-medium">Sign Out</span>
                  </button>
                </>
              )}
              <button className="flex items-center justify-center h-10 w-10 rounded-full text-copper hover:text-copper-dark hover:bg-cream transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>

            {/* Social links in mobile */}
            <div className="flex space-x-4 pt-2 border-t border-copper/10">
              {settings?.socialLinks?.facebook && (
                <a href={settings.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-rich-black hover:text-copper transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                  </svg>
                </a>
              )}
              {settings?.socialLinks?.twitter && (
                <a href={settings.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-rich-black hover:text-copper transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
              )}
              {settings?.socialLinks?.instagram && (
                <a href={settings.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-rich-black hover:text-copper transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              )}
              {settings?.socialLinks?.linkedin && (
                <a href={settings.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-rich-black hover:text-copper transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
                  </svg>
                </a>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}