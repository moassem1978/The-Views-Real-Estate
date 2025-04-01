import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PropertySearch from "@/components/home/PropertySearch";
import Services from "@/components/home/Services";
import Testimonials from "@/components/home/Testimonials";
import ContactCTA from "@/components/home/ContactCTA";
import SimpleHeroCarousel from "@/components/home/SimpleHeroCarousel";
import AnnouncementsSection from "@/components/home/AnnouncementsSection";
import PropertiesByType from "@/components/home/PropertiesByType";

// Simplified Home component using the new lightweight carousel
export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <SimpleHeroCarousel />
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
