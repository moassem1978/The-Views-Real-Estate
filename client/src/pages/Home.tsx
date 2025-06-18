
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
import SEO from "@/components/SEO";

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "The Views Real Estate",
    "description": "Premium real estate consultant specializing in luxury properties in Egypt and Dubai",
    "url": "https://theviewsconsultancy.com",
    "logo": "https://theviewsconsultancy.com/logo.png",
    "telephone": "+20-106-311-1136",
    "email": "Sales@theviewsrealestate.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "New Cairo",
      "addressLocality": "Cairo",
      "addressCountry": "EG"
    },
    "areaServed": [
      {
        "@type": "City",
        "name": "Cairo",
        "sameAs": "https://en.wikipedia.org/wiki/Cairo"
      },
      {
        "@type": "City", 
        "name": "North Coast",
        "sameAs": "https://en.wikipedia.org/wiki/North_Coast_(Egypt)"
      },
      {
        "@type": "City",
        "name": "New Administrative Capital",
        "sameAs": "https://en.wikipedia.org/wiki/New_Administrative_Capital"
      },
      {
        "@type": "City",
        "name": "Dubai",
        "sameAs": "https://en.wikipedia.org/wiki/Dubai"
      }
    ],
    "serviceType": [
      "Luxury property sales",
      "Property investment consultation",
      "Real estate portfolio management",
      "International property services"
    ],
    "priceRange": "Premium"
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SEO />
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