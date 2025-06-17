
import { useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import HighlightsCarousel from "@/components/home/HighlightsCarousel";
import BrowsePropertiesSection from "@/components/home/BrowsePropertiesSection";
import Services from "@/components/home/Services";
import Testimonials from "@/components/home/Testimonials";
import ContactCTA from "@/components/home/ContactCTA";
import AnnouncementsSection from "@/components/home/AnnouncementsSection";
import PropertiesByType from "@/components/home/PropertiesByType";
import SEOHead from "@/components/common/SEOHead";

// SEO optimization for homepage
function HomeSEO() {
  useEffect(() => {
    // Set optimized page title and meta description for luxury real estate in Egypt
    const title = "شقق للبيع في القاهرة الجديدة | Dubai Marina Luxury Apartments | Hassan Allam Properties | Mohamed Assem";
    const description = "شقق للبيع في القاهرة الجديدة, فيلات كمبوند للبيع, Dubai Marina luxury apartments for sale, Hassan Allam Swan Lake Resort properties, Binghatti Stars Business Bay. Expert real estate consultant Egypt Dubai with 30+ years experience.";

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
    metaKeywords.setAttribute('content', 'شقق للبيع في القاهرة الجديدة, فيلات كمبوند للبيع, عقارات بالتقسيط في مصر, أسعار العقارات في التجمع الخامس, أفضل وسيط عقاري في القاهرة, وسيط عقاري موثوق في مصر, مستشار استثمار عقاري مصر, خبير عقارات القاهرة الجديدة, وسيط عقارات الساحل الشمالي, premium real estate consultant Egypt Dubai, ultra-luxury property specialist, Dubai Marina property specialist, New Cairo compound expert, Palm Jumeirah specialist, investment property advisor, high-net-worth property consultant, luxury residential specialist Cairo, boutique real estate consultant Egypt, international real estate standards Egypt, exclusive property consultant Egypt, VIP property services, personalized property consultation, dedicated property advisor, Coldwell Banker Egypt luxury properties, RE/MAX Egypt property specialist, Century 21 Egypt real estate services, Engel Völkers Dubai luxury properties, Knight Frank Dubai luxury residential, Savills Dubai property services, Better Homes UAE largest independent agency, Allsopp Allsopp Dubai luxury residential, Haus Haus premium property consultancy, Metropolitan Premium Properties Dubai, George Azar ultra-high-net-worth property specialist, fäm Properties luxury specialist, Hassan Allam Swan Lake Resort properties, Binghatti Stars Business Bay apartments, Emaar Dubai Creek Harbour apartments, real estate consultation services, property investment advisory, market analysis and valuation, Golden visa property specialist, freehold property expert, virtual property tours specialist, digital property marketing, Mohamed Assem real estate broker Egypt Dubai');

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

// Enhanced homepage with final hero section and integrated property browsing
export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <HomeSEO />
      <SEOHead pageName="home" />
      <Header />

      {/* Main content with proper heading structure */}
      <main className="flex-grow">
        {/* H1 for homepage - hidden but SEO important */}
        <h1 className="sr-only">Premium Real Estate Consultant Egypt Dubai - The Views Consultancy</h1>

        {/* Hero Section with dark background */}
        <HeroSection />

        {/* Featured Highlights Carousel */}
        <HighlightsCarousel />

        {/* Browse All Properties Section */}
        <BrowsePropertiesSection />

        {/* Properties by Type with Primary Projects and Resale Units - Only tabs, no property cards */}
        <PropertiesByType />

        {/* Latest Announcements */}
        <AnnouncementsSection />

        {/* Services Overview */}
        <Services />

        {/* Client Testimonials */}
        <Testimonials />

        {/* Contact Call-to-Action */}
        <ContactCTA />
      </main>
      <Footer />
    </div>
  );
}