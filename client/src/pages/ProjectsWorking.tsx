import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { MapPin, Building } from "lucide-react";
import { Link } from "wouter";

export default function ProjectsWorking() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#F5F5DC] to-[#E6E6FA] py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold text-[#2C3E50] mb-6">
              Premium Real Estate Projects
            </h1>
            <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
              Discover luxury developments by Egypt's most prestigious developers including EMAAR, Sodic, and Hassan Allam
            </p>
          </div>
        </section>

        {/* Projects Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Marassi North Coast Project Card */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="relative">
                  <img
                    src="/api/placeholder/600/400"
                    alt="Marassi North Coast by EMAAR"
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23f5f5dc'/%3E%3Ctext x='300' y='200' text-anchor='middle' dy='0.3em' font-family='Arial' font-size='24' fill='%23d4af37'%3EMarassi North Coast%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-[#D4AF37] text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Premium
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#2C3E50] mb-2">
                    Marassi North Coast
                  </h3>
                  <div className="flex items-center text-gray-600 text-sm mb-4">
                    <MapPin className="w-4 h-4 mr-2" />
                    North Coast, Egypt - 125km from Cairo
                  </div>

                  <p className="text-gray-700 text-sm mb-4">
                    An exclusive beachfront resort community by EMAAR Misr, featuring luxury villas, chalets, and apartments with direct Mediterranean access on Egypt's pristine North Coast.
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                      Luxury Villas
                    </span>
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                      Beach Chalets
                    </span>
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                      Premium Apartments
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center text-[#D4AF37]">
                      <Building className="w-4 h-4 mr-1" />
                      <span className="text-sm font-semibold">EMAAR Misr</span>
                    </div>
                    <Link href="/projects/marassi-north-coast">
                      <Button className="bg-[#D4AF37] hover:bg-[#B8941F] text-white">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Additional project slots */}
              <div className="bg-gray-50 rounded-lg p-8 flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">More Premium Projects</h3>
                  <p className="text-gray-500 text-sm">Coming Soon</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-8 flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Exclusive Developments</h3>
                  <p className="text-gray-500 text-sm">By Top Developers</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}