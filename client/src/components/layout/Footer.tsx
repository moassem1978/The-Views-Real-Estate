import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center mb-6">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F5E5A3] to-[#D4AF37] flex items-center justify-center shadow-md">
                <span className="font-serif font-bold text-white text-lg">LR</span>
              </div>
              <span className="ml-2 font-serif text-white text-xl font-semibold">
                Luxury<span className="text-[#D4AF37]">Realty</span>
              </span>
            </div>
            <p className="text-white/70 mb-6">
              Exceptional properties for discerning clients. Our commitment to excellence has established us as leaders in luxury real estate.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="h-10 w-10 rounded-full bg-white/10 hover:bg-[#D4AF37] transition-colors flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 320 512">
                  <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"/>
                </svg>
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-white/10 hover:bg-[#D4AF37] transition-colors flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 448 512">
                  <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
                </svg>
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-white/10 hover:bg-[#D4AF37] transition-colors flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 448 512">
                  <path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"/>
                </svg>
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-white/10 hover:bg-[#D4AF37] transition-colors flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 496 512">
                  <path d="M496 256c0 137-111 248-248 248-25.6 0-50.2-3.9-73.4-11.1 10.1-16.5 25.2-43.5 30.8-65 3-11.6 15.4-59 15.4-59 8.1 15.4 31.7 28.5 56.8 28.5 74.8 0 128.7-68.8 128.7-154.3 0-81.9-66.9-143.2-152.9-143.2-107 0-163.9 71.8-163.9 150.1 0 36.4 19.4 81.7 50.3 96.1 4.7 2.2 7.2 1.2 8.3-3.3.8-3.4 5-20.3 6.9-28.1.6-2.5.3-4.7-1.7-7.1-10.1-12.5-18.3-35.3-18.3-56.6 0-54.7 41.4-107.6 112-107.6 60.9 0 103.6 41.5 103.6 100.9 0 67.1-33.9 113.6-78 113.6-24.3 0-42.6-20.1-36.7-44.8 7-29.5 20.5-61.3 20.5-82.6 0-19-10.2-34.9-31.4-34.9-24.9 0-44.9 25.7-44.9 60.2 0 22 7.4 36.8 7.4 36.8s-24.5 103.8-29 123.2c-5 21.4-3 51.6-.9 71.2C65.4 450.9 0 361.1 0 256 0 119 111 8 248 8s248 111 248 248z"/>
                </svg>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-serif text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-white/70 hover:text-[#D4AF37] transition-colors">Home</Link></li>
              <li><Link href="/properties" className="text-white/70 hover:text-[#D4AF37] transition-colors">Properties</Link></li>
              <li><Link href="/services" className="text-white/70 hover:text-[#D4AF37] transition-colors">Services</Link></li>
              <li><Link href="/about" className="text-white/70 hover:text-[#D4AF37] transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-white/70 hover:text-[#D4AF37] transition-colors">Contact</Link></li>
              <li><Link href="/blog" className="text-white/70 hover:text-[#D4AF37] transition-colors">Blog</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-serif text-lg font-semibold mb-6">Locations</h3>
            <ul className="space-y-3">
              <li><Link href="/locations/beverly-hills" className="text-white/70 hover:text-[#D4AF37] transition-colors">Beverly Hills</Link></li>
              <li><Link href="/locations/miami" className="text-white/70 hover:text-[#D4AF37] transition-colors">Miami</Link></li>
              <li><Link href="/locations/new-york" className="text-white/70 hover:text-[#D4AF37] transition-colors">New York</Link></li>
              <li><Link href="/locations/hamptons" className="text-white/70 hover:text-[#D4AF37] transition-colors">The Hamptons</Link></li>
              <li><Link href="/locations/aspen" className="text-white/70 hover:text-[#D4AF37] transition-colors">Aspen</Link></li>
              <li><Link href="/locations/international" className="text-white/70 hover:text-[#D4AF37] transition-colors">International</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-serif text-lg font-semibold mb-6">Contact</h3>
            <ul className="space-y-4">
              <li className="flex">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-1 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="ml-3 text-white/70">1250 Beverly Hills Blvd, Beverly Hills, CA 90210</span>
              </li>
              <li className="flex">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-1 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="ml-3 text-white/70">+1 (310) 555-1234</span>
              </li>
              <li className="flex">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-1 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="ml-3 text-white/70">contact@luxuryrealty.com</span>
              </li>
            </ul>
            
            <div className="mt-6">
              <h4 className="font-medium mb-3">Newsletter</h4>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="px-4 py-2 bg-white/10 rounded-l-md focus:outline-none focus:bg-white/20 text-white placeholder-white/50 w-full"
                />
                <button className="px-4 py-2 bg-[#D4AF37] hover:bg-[#BF9B30] transition-colors rounded-r-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/50 text-sm">© {new Date().getFullYear()} LuxuryRealty. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <Link href="/privacy" className="text-white/50 hover:text-white text-sm transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-white/50 hover:text-white text-sm transition-colors">Terms of Service</Link>
            <Link href="/sitemap" className="text-white/50 hover:text-white text-sm transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
