import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Link } from "wouter";

export default function ProjectsSimple() {
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['/api/projects'],
  });

  const projects = (response as any)?.data || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <section className="bg-gradient-to-b from-cream to-white py-16">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-rich-black mb-6">
                Premium Real Estate Projects
              </h1>
              <p className="text-lg text-gray-700 leading-relaxed">
                Discover exclusive developments by Egypt's most prestigious developers. 
                From luxury compounds to beachfront resorts, explore investment opportunities 
                in prime locations across Egypt and the region.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            {isLoading && (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading projects...</p>
              </div>
            )}
            
            {error && (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">Failed to load projects</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="bg-copper text-white px-6 py-2 rounded hover:bg-copper/90"
                >
                  Try Again
                </button>
              </div>
            )}
            
            {projects && projects.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project: any) => (
                  <div key={project.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {project.images && project.images[0] && (
                      <div className="aspect-video overflow-hidden">
                        <img loading="lazy"
                          src={project.images[0]}
                          alt={project.projectName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-rich-black mb-2">
                        {project.projectName}
                      </h3>
                      <div className="text-sm text-copper mb-2">
                        <span className="font-medium">Developer:</span> EMAAR Misr
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        <span className="font-medium">Location:</span> {project.location}
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed mb-4">
                        {project.description && project.description.length > 150 
                          ? `${project.description.substring(0, 150)}...` 
                          : project.description}
                      </p>
                      <Link href={`/projects/${project.id}`}>
                        <button className="w-full bg-copper text-white px-4 py-2 rounded hover:bg-copper/90 transition-colors">
                          View Project Details
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {projects && projects.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No Projects Available
                </h3>
                <p className="text-gray-500">
                  Check back soon for new development opportunities.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}