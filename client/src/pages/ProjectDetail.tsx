import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PropertyCard from "@/components/properties/PropertyCard";
import { Button } from "@/components/ui/button";
import { MapPin, Building, Home, Calendar, Star } from "lucide-react";
import type { Project, Property } from "@shared/schema";

interface ProjectDetailProps {}

export default function ProjectDetail({}: ProjectDetailProps) {
  const [, params] = useRoute("/projects/:slug");
  const projectSlug = params?.slug;

  // Fetch project details
  const { data: project, isLoading: projectLoading, error: projectError } = useQuery<Project>({
    queryKey: ['/api/projects', projectSlug],
    enabled: !!projectSlug,
  });

  // Fetch properties from this project
  const { data: projectProperties } = useQuery<Property[]>({
    queryKey: ['/api/projects', project?.id, 'properties'],
    enabled: !!project?.id,
  });

  // Fetch properties from same developer (different projects)
  const { data: developerProperties } = useQuery<Property[]>({
    queryKey: ['/api/properties', 'by-developer', project?.developerName],
    enabled: !!project?.developerName,
  });

  // Fetch 3 random properties as fallback
  const { data: fallbackProperties } = useQuery<Property[]>({
    queryKey: ['/api/properties', 'random', 3],
  });

  // SEO for project page
  useEffect(() => {
    if (project) {
      const title = project.metaTitle || `${project.projectName} by ${project.developerName} | The Views Real Estate`;
      const description = project.metaDescription || `Discover ${project.projectName} luxury development by ${project.developerName}. Premium properties in ${project.location} with The Views Real Estate.`;
      
      document.title = title;
      
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', description);

      // Add project-specific keywords
      const keywords = project.metaKeywords || `${project.projectName}, ${project.developerName}, ${project.location}, luxury properties, premium development, Mohamed Assem real estate`;
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', keywords);
    }
  }, [project]);

  if (projectLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading project details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h2>
            <p className="text-gray-600 mb-6">The project you're looking for doesn't exist.</p>
            <Button onClick={() => window.history.back()}>Go Back</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const specs = project.specs as any || {};
  const unitTypes = project.unitTypes as any[] || [];
  const images = project.images as string[] || [];
  const liveImages = project.liveImages as string[] || [];
  const brochureImages = project.brochureImages as string[] || [];

  // Determine which images to show (prefer live, fallback to brochure)
  const displayImages = liveImages.length > 0 ? liveImages : brochureImages.length > 0 ? brochureImages : images;

  // Properties to display
  const showProjectProperties = projectProperties && projectProperties.length > 0;
  const showDeveloperProperties = developerProperties && developerProperties.length > 0;
  const showFallbackProperties = !showProjectProperties && !showDeveloperProperties && fallbackProperties;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section with Project Images */}
        {displayImages.length > 0 && (
          <section className="relative h-[60vh] bg-gray-900">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${displayImages[0]})`,
              }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            </div>
            <div className="relative z-10 container mx-auto px-4 h-full flex items-end pb-12">
              <div className="text-white">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{project.projectName}</h1>
                <div className="flex items-center text-lg">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>{project.location}</span>
                  <Building className="w-5 h-5 ml-6 mr-2" />
                  <span>by {project.developerName}</span>
                </div>
              </div>
            </div>
          </section>
        )}

        <div className="container mx-auto px-4 py-12">
          {/* Project Introduction */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Project Introduction</h2>
            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 leading-relaxed">{project.introduction}</p>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Location */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-6 h-6 mr-2 text-[#D4AF37]" />
                  Location
                </h2>
                <p className="text-gray-700">{project.location}</p>
              </section>

              {/* Specifications */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Building className="w-6 h-6 mr-2 text-[#D4AF37]" />
                  Project Specifications
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(specs).map(([key, value]) => (
                    <div key={key} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 capitalize">{key.replace(/([A-Z])/g, ' $1')}</h3>
                      <p className="text-gray-700">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Unit Types */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Home className="w-6 h-6 mr-2 text-[#D4AF37]" />
                  Available Unit Types
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {unitTypes.map((unit, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">{unit.type}</h3>
                      <div className="space-y-2 text-gray-700">
                        {unit.area && <p>Area: {unit.area}</p>}
                        {unit.bedrooms && <p>Bedrooms: {unit.bedrooms}</p>}
                        {unit.bathrooms && <p>Bathrooms: {unit.bathrooms}</p>}
                        {unit.features && (
                          <div>
                            <p className="font-medium">Features:</p>
                            <ul className="list-disc list-inside pl-4">
                              {unit.features.map((feature: string, idx: number) => (
                                <li key={idx}>{feature}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Project Gallery */}
              {displayImages.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Project Gallery</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayImages.map((image, index) => (
                      <div key={index} className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={image}
                          alt={`${project.projectName} - Image ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {liveImages.length > 0 ? "Live project photos" : "Official project brochure images"}
                  </p>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Developer Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">About {project.developerName}</h3>
                <p className="text-gray-700">{project.aboutDeveloper}</p>
              </div>

              {/* Quick Facts */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Facts</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Developer:</span>
                    <span className="font-medium">{project.developerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{project.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Unit Types:</span>
                    <span className="font-medium">{unitTypes.length}</span>
                  </div>
                  {project.isFeatured && (
                    <div className="flex items-center text-[#D4AF37]">
                      <Star className="w-4 h-4 mr-1 fill-current" />
                      <span className="text-sm font-medium">Featured Project</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Available Units Section */}
          <section className="mt-16">
            {showProjectProperties && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Available Units in {project.projectName}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {projectProperties!.slice(0, 6).map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              </div>
            )}

            {showDeveloperProperties && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-8">
                  Other {project.developerName} Properties
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {developerProperties!.slice(0, 6).map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              </div>
            )}

            {showFallbackProperties && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Register Your Interest</h2>
                  <p className="text-gray-600 mb-6">
                    Be the first to know about new units in {project.projectName}
                  </p>
                  <p className="text-lg text-gray-800 mb-8">You may also like</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {fallbackProperties!.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              </div>
            )}

            {/* Browse All Properties Button */}
            <div className="text-center">
              <Button 
                onClick={() => window.location.href = '/properties'}
                className="bg-[#D4AF37] hover:bg-[#BF9B30] text-white px-8 py-3 text-lg"
              >
                Browse All Properties
              </Button>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}