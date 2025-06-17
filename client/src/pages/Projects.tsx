import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Building, Star, Calendar } from "lucide-react";
import { Link } from "wouter";
import type { Project } from "@shared/schema";

export default function Projects() {
  const { data: projectsResponse, isLoading, error } = useQuery({
    queryKey: ['/api/projects'],
  });

  const projects = projectsResponse?.data || [];

  // SEO for projects page
  useEffect(() => {
    const title = "Premium Real Estate Projects Egypt Dubai | EMAAR Marassi Hassan Allam";
    const description = "Discover premium real estate projects in Egypt and Dubai. Marassi by EMAAR, Hassan Allam developments, Katameya Dunes, Lake View, Swan Lake with The Views Real Estate.";
    
    document.title = title;
    
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', 'premium real estate projects Egypt, EMAAR Marassi North Coast, Hassan Allam developments, Katameya Dunes Golf Resort, Lake View Compound, Swan Lake Resort, luxury developments Egypt, Mohamed Assem projects, The Views Real Estate projects, EMAAR Misr projects, premium compounds Egypt');
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading premium projects...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load Projects</h2>
            <p className="text-gray-600 mb-6">Please try refreshing the page.</p>
            <Button onClick={() => window.location.reload()}>Refresh</Button>
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
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Premium Real Estate Projects</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Discover luxury developments from Egypt's most prestigious developers including EMAAR, Hassan Allam, and more
            </p>
          </div>
        </section>

        {/* Projects Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {projects && projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project) => {
                  const images = project.images as string[] || [];
                  const liveImages = project.liveImages as string[] || [];
                  const brochureImages = project.brochureImages as string[] || [];
                  const displayImage = liveImages[0] || brochureImages[0] || images[0];

                  return (
                    <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      {displayImage && (
                        <div className="aspect-video bg-gray-200 overflow-hidden">
                          <img loading="lazy"
                            src={displayImage}
                            alt={project.projectName}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                              {project.projectName}
                            </CardTitle>
                            <div className="flex items-center text-gray-600 mb-2">
                              <Building className="w-4 h-4 mr-1" />
                              <span className="text-sm">by {project.developerName}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span className="text-sm">{project.location}</span>
                            </div>
                          </div>
                          {project.isFeatured && (
                            <div className="flex items-center text-[#D4AF37]">
                              <Star className="w-4 h-4 fill-current" />
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                          {project.description}
                        </p>
                        
                        <Link href={`/projects/${project.slug}`}>
                          <Button className="w-full bg-[#D4AF37] hover:bg-[#BF9B30] text-white">
                            View Project Details
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">No Projects Available</h2>
                <p className="text-gray-600 mb-6">
                  We're currently updating our project portfolio. Please check back soon.
                </p>
                <Link href="/properties">
                  <Button className="bg-[#D4AF37] hover:bg-[#BF9B30] text-white">
                    Browse All Properties
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}