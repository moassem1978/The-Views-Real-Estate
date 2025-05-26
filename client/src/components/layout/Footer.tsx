import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import LogoDisplay from "@/components/ui/LogoDisplay";
import { useToast } from "@/hooks/use-toast";

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

export default function Footer() {
  // Fetch site settings including logo and contact info
  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ['/api/site-settings'],
  });

  const companyName = settings?.companyName || "The Views Real Estate";
  const { toast } = useToast();

  // Newsletter form state
  const [newsletterData, setNewsletterData] = useState({
    name: "",
    email: "",
    phone: ""
  });

  // Newsletter subscription mutation
  const newsletterMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Successfully subscribed!",
        description: "Thank you for joining our exclusive newsletter.",
      });
      setNewsletterData({ name: "", email: "", phone: "" });
    },
    onError: () => {
      toast({
        title: "Subscription failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    },
  });

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterData.email) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    newsletterMutation.mutate({
      email: newsletterData.email,
      firstName: newsletterData.name,
      phone: newsletterData.phone,
      source: 'footer'
    });
  };

  const handleNewsletterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewsletterData({
      ...newsletterData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <footer className="bg-rich-black-light text-white pt-20 pb-10">
      {/* Decorative top border */}
      <div className="h-1 bg-gradient-to-r from-copper/30 via-copper to-copper/30 mb-12"></div>
      
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          <div>
            <div className="flex items-center mb-6">
              <div className="flex-shrink-0">
                <LogoDisplay 
                  logoUrl={settings?.companyLogo} 
                  companyName={companyName}
                  className="h-12 w-12 shadow-sm"
                  fallbackClassName="h-12 w-12 rounded-full bg-copper flex items-center justify-center shadow-sm border-2 border-cream/20"
                  fallbackInitials="TV"
                />
              </div>
              <div className="ml-3 flex flex-col">
                <span className="font-serif text-white text-xl font-semibold">
                  The <span className="text-copper">Views</span>
                </span>
                <span className="text-xs text-white/70 font-sans tracking-widest">
                  REAL ESTATE
                </span>
              </div>
            </div>
            <p className="text-white/70 mb-8 leading-relaxed">
              Exceptional properties for discerning clients in Egypt's most prestigious locations. Our commitment to excellence has established us as leaders in luxury real estate.
            </p>
            <div className="flex space-x-4">
              {settings?.socialLinks?.facebook && (
                <a 
                  href={settings.socialLinks.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="h-10 w-10 rounded-full border border-copper/30 hover:bg-copper/10 transition-all flex items-center justify-center group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-copper/80 group-hover:text-copper transition-colors" fill="currentColor" viewBox="0 0 320 512">
                    <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"/>
                  </svg>
                </a>
              )}
              {settings?.socialLinks?.instagram && (
                <a 
                  href={settings.socialLinks.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="h-10 w-10 rounded-full border border-copper/30 hover:bg-copper/10 transition-all flex items-center justify-center group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-copper/80 group-hover:text-copper transition-colors" fill="currentColor" viewBox="0 0 448 512">
                    <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
                  </svg>
                </a>
              )}
              {settings?.socialLinks?.linkedin && (
                <a 
                  href={settings.socialLinks.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="h-10 w-10 rounded-full border border-copper/30 hover:bg-copper/10 transition-all flex items-center justify-center group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-copper/80 group-hover:text-copper transition-colors" fill="currentColor" viewBox="0 0 448 512">
                    <path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"/>
                  </svg>
                </a>
              )}
              {settings?.socialLinks?.twitter && (
                <a 
                  href={settings.socialLinks.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="h-10 w-10 rounded-full border border-copper/30 hover:bg-copper/10 transition-all flex items-center justify-center group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-copper/80 group-hover:text-copper transition-colors" fill="currentColor" viewBox="0 0 512 512">
                    <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>
          
          <div className="mt-10 md:mt-0">
            <h3 className="font-serif text-lg text-copper mb-8 relative accent-underline font-semibold">Quick Links</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/" className="text-white/80 hover:text-copper transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2 text-copper/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Home
                </Link>
              </li>
              <li>
                <Link href="/properties" className="text-white/80 hover:text-copper transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2 text-copper/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Properties
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-white/80 hover:text-copper transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2 text-copper/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Services
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-white/80 hover:text-copper transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2 text-copper/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white/80 hover:text-copper transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2 text-copper/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-white/80 hover:text-copper transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2 text-copper/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="mt-10 lg:mt-0">
            <h3 className="font-serif text-lg text-copper mb-8 relative accent-underline font-semibold">Property Types</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/properties?propertyType=Apartment" className="text-white/80 hover:text-copper transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2 text-copper/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Apartments
                </Link>
              </li>
              <li>
                <Link href="/properties?propertyType=Villa" className="text-white/80 hover:text-copper transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2 text-copper/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Villas
                </Link>
              </li>
              <li>
                <Link href="/properties?propertyType=Penthouse" className="text-white/80 hover:text-copper transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2 text-copper/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Penthouses
                </Link>
              </li>
              <li>
                <Link href="/properties?propertyType=Townhouse" className="text-white/80 hover:text-copper transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2 text-copper/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Townhouses
                </Link>
              </li>
              <li>
                <Link href="/properties?propertyType=Compound" className="text-white/80 hover:text-copper transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2 text-copper/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Compounds
                </Link>
              </li>
              <li>
                <Link href="/properties?propertyType=Chalet" className="text-white/80 hover:text-copper transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2 text-copper/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Chalets
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="mt-10 lg:mt-0">
            <h3 className="font-serif text-lg text-copper mb-8 relative accent-underline font-semibold">Contact</h3>
            <ul className="space-y-6">
              <li className="flex">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-1 text-copper" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="ml-4 text-white/80">
                  New Cairo, Road 90<br/>
                  Egypt
                </span>
              </li>
              {settings?.contactPhone && (
                <li className="flex">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-1 text-copper" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href={`tel:${settings.contactPhone}`} className="ml-4 text-white/80 hover:text-copper transition-colors">
                    {settings.contactPhone}
                  </a>
                </li>
              )}
              {settings?.contactEmail && (
                <li className="flex">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-1 text-copper" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href={`mailto:${settings.contactEmail}`} className="ml-4 text-white/80 hover:text-copper transition-colors">
                    {settings.contactEmail}
                  </a>
                </li>
              )}
            </ul>
            
            <div className="mt-8">
              <h4 className="font-serif text-base mb-4 font-semibold">Subscribe to Our Newsletter</h4>
              <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                <input 
                  type="text" 
                  name="name"
                  value={newsletterData.name}
                  onChange={handleNewsletterChange}
                  placeholder="Your name" 
                  className="w-full px-4 py-3 bg-rich-black rounded-md focus:outline-none focus:ring-1 focus:ring-copper/50 text-white placeholder-white/40 border border-copper/20"
                />
                <input 
                  type="email" 
                  name="email"
                  value={newsletterData.email}
                  onChange={handleNewsletterChange}
                  placeholder="Your email *" 
                  required
                  className="w-full px-4 py-3 bg-rich-black rounded-md focus:outline-none focus:ring-1 focus:ring-copper/50 text-white placeholder-white/40 border border-copper/20"
                />
                <input 
                  type="tel" 
                  name="phone"
                  value={newsletterData.phone}
                  onChange={handleNewsletterChange}
                  placeholder="Your phone number" 
                  className="w-full px-4 py-3 bg-rich-black rounded-md focus:outline-none focus:ring-1 focus:ring-copper/50 text-white placeholder-white/40 border border-copper/20"
                />
                <button 
                  type="submit"
                  disabled={newsletterMutation.isPending}
                  className="w-full px-4 py-3 bg-copper hover:bg-copper-dark disabled:bg-gray-500 transition-colors rounded-md text-white font-medium"
                >
                  {newsletterMutation.isPending ? "Subscribing..." : "Subscribe to Newsletter"}
                </button>
              </form>
            </div>
          </div>
        </div>
        
        {/* Decorative divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-copper/30 to-transparent my-8"></div>
        
        <div className="pt-4 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/50 text-sm">© {new Date().getFullYear()} {companyName}. All rights reserved.</p>
          <div className="mt-5 md:mt-0 flex space-x-8">
            <Link href="/privacy" className="text-white/50 hover:text-copper text-sm transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-white/50 hover:text-copper text-sm transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
