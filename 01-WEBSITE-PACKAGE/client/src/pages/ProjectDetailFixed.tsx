import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { MapPin, Building, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function ProjectDetailFixed() {
  const [, params] = useRoute("/projects/:id");
  const projectId = params?.id;

  const { data: project, isLoading, error } = useQuery({
    queryKey: [`/api/projects/${projectId}`],
    enabled: !!projectId,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Loading your authentic project details...</p>
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
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Failed to load project</h1>
            <Link href="/projects">
              <Button className="bg-copper hover:bg-copper/90 text-white">
                Back to Projects
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Project Not Found</h1>
            <Link href="/projects">
              <Button className="bg-copper hover:bg-copper/90 text-white">
                Back to Projects
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const projectData = project as any;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <Link href="/projects" className="inline-flex items-center text-copper hover:text-copper/80 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Link>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Project Images */}
            <div className="space-y-4">
              {projectData.images && projectData.images.length > 0 && (
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={projectData.images[0]}
                    alt={projectData.projectName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = `
                        <div class="w-full h-full flex items-center justify-center bg-gray-100">
                          <p class="text-gray-500">Image loading...</p>
                        </div>
                      `;
                    }}
                  />
                </div>
              )}
              {projectData.images && projectData.images.length > 1 && (
                <div className="grid grid-cols-2 gap-4">
                  {projectData.images.slice(1, 5).map((image: string, index: number) => (
                    <div key={index} className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={image}
                        alt={`${projectData.projectName} - Image ${index + 2}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Project Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-rich-black mb-2">
                  {projectData.projectName}
                </h1>
                <div className="flex items-center text-copper mb-2">
                  <Building className="w-5 h-5 mr-2" />
                  <span className="font-medium">EMAAR Misr</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>{projectData.location}</span>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-rich-black mb-3">Project Overview</h2>
                <p className="text-gray-700 leading-relaxed">
                  {projectData.description}
                </p>
              </div>

              {projectData.unitTypes && projectData.unitTypes.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-rich-black mb-3">Unit Types</h2>
                  <div className="grid grid-cols-1 gap-2">
                    {projectData.unitTypes.map((unitType: any, index: number) => (
                      <div key={index} className="bg-cream p-3 rounded-lg">
                        <span className="text-sm font-medium text-rich-black">
                          {typeof unitType === 'string' ? unitType : unitType.type || 'Unit Type'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {projectData.aboutDeveloper && (
                <div>
                  <h2 className="text-xl font-semibold text-rich-black mb-3">About the Developer</h2>
                  <p className="text-gray-700 leading-relaxed">
                    {projectData.aboutDeveloper}
                  </p>
                </div>
              )}

              <div className="pt-4">
                <Link href="/contact">
                  <Button className="w-full bg-copper hover:bg-copper/90 text-white py-3">
                    Get More Information
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}