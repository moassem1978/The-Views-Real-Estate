import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

interface Project {
  id: number;
  name: string;
  slug: string;
  location: string;
  developer: string;
  introduction: string;
  image_urls: string[];
}

function ProjectCard({ project }: { project: Project }) {
  const imageUrl = project.image_urls && project.image_urls.length > 0 
    ? project.image_urls[0] 
    : '/placeholder-project.jpg';

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video overflow-hidden">
        <img
          src={imageUrl}
          alt={project.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = '/placeholder-project.jpg';
          }}
        />
      </div>
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold text-rich-black mb-2">
          {project.name}
        </h3>
        <div className="text-sm text-copper mb-2">
          <span className="font-medium">Developer:</span> {project.developer}
        </div>
        <div className="text-sm text-gray-600 mb-3">
          <span className="font-medium">Location:</span> {project.location}
        </div>
        <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-3">
          {project.introduction}
        </p>
        <Link href={`/projects/${project.id}`}>
          <button className="w-full bg-copper text-white px-4 py-2 rounded hover:bg-copper/90 transition-colors">
            View Project Details
          </button>
        </Link>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="aspect-video w-full" />
          <CardContent className="p-6">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-4 w-2/3 mb-3" />
            <Skeleton className="h-16 w-full mb-4" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function ProjectsWorking() {
  const { data: projects, isLoading, error } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
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

        {/* Projects Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {isLoading && <LoadingSkeleton />}
            
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
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
            
            {projects && projects.length === 0 && (
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