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
    const title = "The Views Real Estate - Luxury Properties Egypt, Dubai & Red Sea | Mohamed Assem";
    const description = "Discover premium luxury properties in Egypt, Dubai & Red Sea with The Views Real Estate. Expert consultancy for Egyptian investors in EMAAR Dubai, Red Sea Global projects, and Egyptian compounds. 30+ years experience.";
    
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
    metaKeywords.setAttribute('content', 'Mohamed Assem Dubai real estate broker, The Views Real Estate Dubai, Dubai properties for Indian investors, Dubai properties Pakistani investors, Dubai properties British investors, Dubai properties Iranian investors, Dubai properties Chinese investors, Dubai properties Lebanese investors, Dubai properties Russian investors, EMAAR Dubai international investors, Dubai Marina global investment, Downtown Dubai international buyers, Dubai golden visa investors, Business Bay Dubai global, Dubai Hills Estate international, best Dubai real estate broker international, Dubai property investment global, AMAALA Red Sea international, Red Sea Global luxury investment, Dubai Creek Harbour international, Damac Properties global investors, luxury real estate Egypt Dubai Red Sea international');

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
