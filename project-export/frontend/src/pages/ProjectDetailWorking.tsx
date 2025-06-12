import { useRoute } from "wouter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { MapPin, Building, Home, Calendar, Star, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function ProjectDetailWorking() {
  const [, params] = useRoute("/projects/:slug");
  const projectSlug = params?.slug;

  // Marassi North Coast project data
  const project = {
    id: 5,
    projectName: "Marassi North Coast",
    developerName: "EMAAR Misr",
    location: "North Coast, Egypt - 125km from Cairo",
    description: "An exclusive beachfront resort community by EMAAR Misr, featuring luxury villas, chalets, and apartments with direct Mediterranean access on Egypt's pristine North Coast.",
    unitTypes: ["Luxury Villas", "Beach Chalets", "Premium Apartments", "Penthouses", "Townhouses"],
    aboutDeveloper: "EMAAR Misr is the Egyptian arm of EMAAR Properties, the world-renowned developer behind iconic projects like Burj Khalifa and Dubai Mall. With decades of experience in luxury development, EMAAR brings international standards and exceptional quality to the Egyptian market.",
    features: [
      "Private beach access",
      "Crystal lagoons", 
      "Golf course",
      "Marina and yacht club",
      "Luxury spa and wellness center",
      "International restaurants",
      "Kids club and water park",
      "24/7 security and concierge"
    ]
  };

  if (projectSlug !== "marassi-north-coast") {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Project Not Found</h1>
            <Link href="/projects">
              <Button className="bg-[#D4AF37] hover:bg-[#B8941F] text-white">
                Back to Projects
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {/* Back to Projects */}
        <div className="bg-gray-50 py-4">
          <div className="container mx-auto px-4">
            <Link href="/projects">
              <Button variant="ghost" className="text-[#D4AF37] hover:text-[#B8941F]">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Projects
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#F5F5DC] to-[#E6E6FA] py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center mb-4">
                  <span className="bg-[#D4AF37] text-white px-3 py-1 rounded-full text-sm font-semibold mr-4">
                    Premium Development
                  </span>
                  <div className="flex items-center text-[#D4AF37]">
                    <Building className="w-5 h-5 mr-2" />
                    <span className="font-semibold">{project.developerName}</span>
                  </div>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold text-[#2C3E50] mb-4">
                  {project.projectName}
                </h1>
                
                <div className="flex items-center text-gray-700 mb-6">
                  <MapPin className="w-5 h-5 mr-2 text-[#D4AF37]" />
                  <span className="text-lg">{project.location}</span>
                </div>
                
                <p className="text-lg text-gray-700 leading-relaxed mb-8">
                  {project.description}
                </p>
                
                <Button className="bg-[#D4AF37] hover:bg-[#B8941F] text-white px-8 py-3 text-lg">
                  Contact Sales Team
                </Button>
              </div>
              
              <div className="relative">
                <img
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23f5f5dc'/%3E%3Ctext x='300' y='200' text-anchor='middle' dy='0.3em' font-family='Arial' font-size='24' fill='%23d4af37'%3EMarassi North Coast%3C/text%3E%3C/svg%3E"
                  alt={project.projectName}
                  className="w-full h-96 object-cover rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Unit Types */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-[#2C3E50] text-center mb-12">Available Unit Types</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {project.unitTypes.map((type, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
                  <Home className="w-8 h-8 text-[#D4AF37] mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-800">{type}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-[#2C3E50] text-center mb-12">Premium Amenities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {project.features.map((feature, index) => (
                <div key={index} className="flex items-center bg-white p-4 rounded-lg shadow-sm">
                  <Star className="w-5 h-5 text-[#D4AF37] mr-3 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Developer */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-[#2C3E50] mb-8">About {project.developerName}</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                {project.aboutDeveloper}
              </p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 bg-gradient-to-br from-[#2C3E50] to-[#34495E] text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Invest in {project.projectName}?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Contact our expert team today to learn more about available units and exclusive investment opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-[#D4AF37] hover:bg-[#B8941F] text-white px-8 py-3">
                Schedule Site Visit
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-[#2C3E50] px-8 py-3">
                Download Brochure
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}