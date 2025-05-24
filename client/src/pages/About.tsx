import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ContactCTA from "@/components/home/ContactCTA";

export default function About() {

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-[#333333] py-16 relative">
          <div className="absolute inset-0 opacity-20">
            <img 
              src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
              alt="Luxury real estate company office" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#333333]/70 to-[#333333]/90"></div>
          
          <div className="container mx-auto px-4 relative z-10 text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-semibold text-white leading-tight mb-4">
              About LuxuryRealty
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Our commitment to excellence has established us as leaders in luxury real estate for over two decades.
            </p>
          </div>
        </section>
        
        {/* Our Story Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-[#D4AF37] font-medium">Our Story</span>
                <h2 className="text-3xl md:text-4xl font-serif font-semibold text-gray-800 mt-2 mb-6">
                  A Legacy of Luxury and Excellence
                </h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Founded in 2000 by Alexandra Reynolds, LuxuryRealty began with a simple vision: to create a boutique real estate firm that offers personalized service and unparalleled expertise in the luxury market.
                  </p>
                  <p>
                    What started as a small team of three dedicated professionals has grown into an internationally recognized brand with offices in Beverly Hills, Miami, New York, and London. Throughout our growth, we've maintained our commitment to personalized service and exclusive focus on the luxury market.
                  </p>
                  <p>
                    Our success stems from our deep understanding of the unique needs of discerning clients, our extensive network of high-net-worth individuals, and our dedication to discretion and confidentiality. We pride ourselves on our ability to match extraordinary properties with extraordinary people.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="rounded-lg overflow-hidden shadow-xl">
                  <img 
                    src="https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
                    alt="LuxuryRealty office building" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-8 -left-8 bg-white rounded-lg shadow-lg p-8 max-w-xs hidden md:block">
                  <div className="text-center">
                    <h3 className="font-serif text-2xl font-semibold text-gray-800 mb-2">20+</h3>
                    <p className="text-gray-600">Years of Excellence in Luxury Real Estate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Our Values Section */}
        <section className="py-16 bg-[#F5F0E6]">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-[#D4AF37] font-medium">Our Values</span>
              <h2 className="text-3xl md:text-4xl font-serif font-semibold text-gray-800 mt-2">
                What Sets Us Apart
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-xl transition-shadow">
                <div className="h-14 w-14 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl font-semibold text-gray-800 mb-3">Trust & Integrity</h3>
                <p className="text-gray-600">
                  We value honesty and transparency in all our dealings. Our commitment to ethical practices has earned us the trust of our clients worldwide.
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-xl transition-shadow">
                <div className="h-14 w-14 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl font-semibold text-gray-800 mb-3">Excellence & Innovation</h3>
                <p className="text-gray-600">
                  We continuously strive for excellence in every aspect of our service, embracing innovative approaches to meet the evolving needs of the luxury market.
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-xl transition-shadow">
                <div className="h-14 w-14 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl font-semibold text-gray-800 mb-3">Client-Centric Approach</h3>
                <p className="text-gray-600">
                  We place our clients at the center of everything we do, tailoring our services to meet their unique needs and exceed their expectations.
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-xl transition-shadow">
                <div className="h-14 w-14 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl font-semibold text-gray-800 mb-3">Global Reach</h3>
                <p className="text-gray-600">
                  Our international network and cultural understanding allow us to connect buyers and sellers across the globe, facilitating seamless transactions.
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-xl transition-shadow">
                <div className="h-14 w-14 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl font-semibold text-gray-800 mb-3">Discretion & Confidentiality</h3>
                <p className="text-gray-600">
                  We understand the importance of privacy in high-profile transactions and are committed to maintaining the utmost discretion.
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-xl transition-shadow">
                <div className="h-14 w-14 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl font-semibold text-gray-800 mb-3">Expertise & Knowledge</h3>
                <p className="text-gray-600">
                  Our team comprises industry experts with deep market knowledge and specialized skills, ensuring the best possible outcomes for our clients.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Founder Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <span className="text-[#D4AF37] font-medium">Leadership</span>
              <h2 className="text-3xl md:text-4xl font-serif font-semibold text-gray-800 mt-2 mb-12">
                Meet the Founder
              </h2>
              
              <div className="max-w-3xl mx-auto bg-gray-25 rounded-2xl p-8 md:p-12" style={{backgroundColor: '#fafafa'}}>
                <div className="text-center mb-8">
                  <div className="w-64 h-80 mx-auto mb-6 rounded-xl overflow-hidden shadow-xl">
                    <img 
                      src="/uploads/founder/mohamed-assem-cropped.jpeg" 
                      alt="Mohamed Assem - Founder & CEO"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-serif font-bold text-gray-800 mb-2">
                    Mohamed Assem
                  </h3>
                  <p className="text-[#D4AF37] font-semibold text-lg mb-6">
                    Founder & CEO
                  </p>
                </div>
                
                <div className="text-left space-y-6 text-gray-700 leading-relaxed">
                  <p className="text-lg font-medium">
                    With 30 years of professional experience across diverse sectors including tourism operations, events management, training, coaching, and sales, Mohamed Assem brings unparalleled expertise to the luxury real estate market.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold text-[#B87333] mb-3">Industry Expertise</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• Tourism & Events Management</li>
                        <li>• Real Estate Development & Brokerage</li>
                        <li>• Telecoms & Cable TV</li>
                        <li>• Training & Coaching</li>
                        <li>• Sales & Operations</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold text-[#B87333] mb-3">Global Experience</h4>
                      <ul className="space-y-2 text-sm">
                        <li>🇪🇬 Egypt</li>
                        <li>🇦🇪 UAE</li>
                        <li>🇸🇦 Saudi Arabia</li>
                        <li>🇸🇩 Sudan</li>
                        <li>🇿🇦 South Africa</li>
                        <li>🇬🇧 England & Scotland</li>
                      </ul>
                    </div>
                  </div>
                  
                  <p>
                    Mohamed has been active in the Egypt real estate market since 2015 and has been immersed in the real estate world since 2010. His extensive international experience across multiple countries and industries provides him with a unique perspective on luxury property markets and client needs.
                  </p>
                  
                  <div className="bg-gradient-to-r from-[#B87333]/10 to-[#D4AF37]/10 rounded-lg p-6 my-8 border-l-4 border-[#B87333]">
                    <h4 className="font-semibold text-[#B87333] mb-3">My Philosophy</h4>
                    <p className="italic text-gray-700 leading-relaxed">
                      "My ideology is to serve and represent. You hire my services so that you don't need to worry about selling - I am your eyes and your voice. With my years of in-depth experience in luxury real estate, I have created this platform solely for luxurious properties located in Egypt and international destinations."
                    </p>
                  </div>
                  
                  <p>
                    Under Mohamed's leadership, The Views Real Estate has established strong partnerships with leading developers and has successfully facilitated numerous landmark transactions, making luxury property ownership accessible to discerning clients worldwide.
                  </p>
                  
                  <div className="border-t border-gray-200 pt-6 mt-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                      <div>
                        <div className="text-2xl font-bold text-[#B87333]">30+</div>
                        <div className="text-sm text-gray-600">Years Professional Experience</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-[#B87333]">7</div>
                        <div className="text-sm text-gray-600">Countries Experience</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-[#B87333]">15+</div>
                        <div className="text-sm text-gray-600">Years Real Estate Expertise</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <ContactCTA />
      </main>
      <Footer />
    </div>
  );
}
