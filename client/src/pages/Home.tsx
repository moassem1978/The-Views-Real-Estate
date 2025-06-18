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
      <SEO 
        title="شقق للبيع في القاهرة الجديدة | Dubai Marina Luxury Apartments | Hassan Allam Properties | Mohamed Assem"
        description="شقق للبيع في القاهرة الجديدة, فيلات كمبوند للبيع, Dubai Marina luxury apartments for sale, Hassan Allam Swan Lake Resort properties, Binghatti Stars Business Bay. Expert real estate consultant Egypt Dubai with 30+ years experience."
        url="https://theviewsconsultancy.com/"
        structuredData={structuredData}
      />
      <Header />

      <main className="flex-grow">
        <h1 className="sr-only">Premium Real Estate Consultant Egypt Dubai - The Views Consultancy</h1>
        <HeroSection />
        <HighlightsCarousel />
        <BrowsePropertiesSection />
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