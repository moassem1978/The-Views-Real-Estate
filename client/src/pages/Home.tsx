import { useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PropertySearch from "@/components/home/PropertySearch";
import Services from "@/components/home/Services";
import Testimonials from "@/components/home/Testimonials";
import ContactCTA from "@/components/home/ContactCTA";
import OptimizedHeroCarousel from "@/components/home/OptimizedHeroCarousel";
import AnnouncementsSection from "@/components/home/AnnouncementsSection";
import PropertiesByType from "@/components/home/PropertiesByType";

// SEO optimization for homepage
function HomeSEO() {
  useEffect(() => {
    // Set optimized page title and meta description for luxury real estate in Egypt
    const title = "Properties For Sale Egypt Dubai | Off-Plan Dubai Marina | New Cairo Compounds | Mohamed Assem";
    const description = "Luxury properties Egypt for sale, off-plan properties Dubai Marina, premium compounds New Cairo, Dubai Hills Estate villas. Expert real estate investment Egypt Dubai, Binghatti properties specialist, Hassan Allam Properties consultant. 30+ years expertise.";
    
    document.title = title;
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    // Add keywords meta tag for SEO
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', 'properties for sale Egypt, apartments for sale Cairo, villas for sale New Cairo, compounds New Cairo, New Administrative Capital, North Coast properties, luxury properties Egypt for sale, off-plan properties Dubai, Dubai Marina apartments, Downtown Dubai properties, Business Bay apartments, Dubai Creek Harbour, Dubai Hills Estate villas, Palm Jumeirah villas, real estate investment Egypt, Dubai property investment, freehold properties Dubai, Emaar properties Dubai, Damac developments, Binghatti properties, Sobha Hartland, Sodic properties, Palm Hills developments, Hassan Allam Properties, luxury apartments Dubai Marina, penthouses Dubai Marina, off-plan properties Cairo, ready properties Dubai, Katameya Heights, Maadi properties, Sheikh Zayed properties, Arabian Ranches properties, best real estate agent Egypt Dubai, luxury property consultant Middle East, Mohamed Assem real estate broker, The Views Real Estate Egypt, عقارات للبيع في مصر, شقق للبيع في القاهرة, فيلات للبيع في القاهرة الجديدة, كمبوندات القاهرة الجديدة');

    // Add Open Graph tags for social media sharing
    const ogTags = [
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: window.location.href },
      { property: 'og:site_name', content: 'The Views Real Estate' },
      { property: 'og:locale', content: 'en_US' }
    ];

    ogTags.forEach(tag => {
      let metaTag = document.querySelector(`meta[property="${tag.property}"]`);
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('property', tag.property);
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute('content', tag.content);
    });

    // Add structured data for real estate business
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "RealEstateAgent",
      "name": "The Views Real Estate",
      "description": "Premium luxury real estate consultancy in Egypt specializing in high-end properties",
      "url": "https://www.theviewsconsultancy.com",
      "telephone": "+20 106 311 1136",
      "email": "Sales@theviewsconsultancy.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "New Cairo, Road 90",
        "addressLocality": "Cairo",
        "addressCountry": "Egypt"
      },
      "areaServed": [
        {
          "@type": "City",
          "name": "Cairo"
        },
        {
          "@type": "City", 
          "name": "North Coast"
        },
        {
          "@type": "City",
          "name": "New Administrative Capital"
        }
      ],
      "founder": {
        "@type": "Person",
        "name": "Mohamed Assem",
        "jobTitle": "Founder & Senior Real Estate Consultant"
      },
      "sameAs": [
        "https://www.theviewsconsultancy.com"
      ]
    };

    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      const scriptToRemove = document.querySelector('script[type="application/ld+json"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, []);

  return null;
}

// Home component using the optimized carousel for better performance
export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <HomeSEO />
      <Header />
      <main className="flex-grow">
        <OptimizedHeroCarousel />
        <PropertySearch />
        <PropertiesByType />
        <AnnouncementsSection />
        <Services />
        <Testimonials />
        <ContactCTA />
      </main>
      <Footer />
    </div>
  );
}
