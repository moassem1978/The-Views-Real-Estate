import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Building, Star } from "lucide-react";
import { Link } from "wouter";

export default function ProjectsSimple() {
  const { data: projectsResponse, isLoading, error } = useQuery({
    queryKey: ['/api/projects'],
  });

  const projects = Array.isArray(projectsResponse?.data) ? projectsResponse.data : [];

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-[#D4AF37] mb-8">Loading Projects...</h1>
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
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-red-600 mb-8">Error Loading Projects</h1>
            <p>{String(error)}</p>
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

        {/* Projects Grid */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            {projects.length === 0 ? (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-600 mb-4">No Projects Available</h2>
                <p className="text-gray-500">Check back soon for exciting new developments!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project: any) => (
                  <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <div className="relative">
                      {project.images && Array.isArray(project.images) && project.images.length > 0 && (
                        <img
                          src={project.images[0]}
                          alt={project.projectName || 'Project'}
                          className="w-full h-64 object-cover"
                        />
                      )}
                      <div className="absolute top-4 left-4">
                        <span className="bg-[#D4AF37] text-white px-3 py-1 rounded-full text-sm font-semibold">
                          Premium
                        </span>
                      </div>
                    </div>
                    
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-[#2C3E50]">
                        {project.projectName}
                      </CardTitle>
                      <div className="flex items-center text-gray-600 text-sm">
                        <MapPin className="w-4 h-4 mr-2" />
                        {project.location}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <p className="text-gray-700 text-sm line-clamp-3">
                        {project.description}
                      </p>

                      {project.unitTypes && Array.isArray(project.unitTypes) && project.unitTypes.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {project.unitTypes.slice(0, 3).map((type: string, index: number) => (
                            <span
                              key={index}
                              className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4">
                        <div className="flex items-center text-[#D4AF37]">
                          <Building className="w-4 h-4 mr-1" />
                          <span className="text-sm font-semibold">EMAAR</span>
                        </div>
                        <Link href={`/projects/marassi-north-coast`}>
                          <Button className="bg-[#D4AF37] hover:bg-[#B8941F] text-white">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}