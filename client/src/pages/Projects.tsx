import React, { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Paginator from "@/components/common/Paginator";

// Type definitions for projects
interface Project {
  id: number;
  projectName: string;
  description: string;
  location: string;
  unitTypes: string[];
  aboutDeveloper: string;
  images: string[];
  status: string;
  createdAt: string;
  updatedAt: string | null;
}

interface PaginatedProjects {
  data: Project[];
  totalCount: number;
  pageCount: number;
  page: number;
  pageSize: number;
}

const Projects: React.FC = () => {
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const { data, isLoading, error } = useQuery<PaginatedProjects, Error>({
    queryKey: ["/api/projects", page, pageSize],
    queryFn: async () => {
      const response = await fetch(`/api/projects?page=${page}&pageSize=${pageSize}`);
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }
      return response.json();
    }
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 p-4 rounded-md text-red-700">
          <p>Error loading projects: {error.message}</p>
        </div>
      </div>
    );
  }

  const projects = data?.data || [];

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Our Development Projects</h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Explore our exclusive selection of premier real estate development projects, each offering unique 
            living experiences with exceptional amenities, locations, and design.
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="text-center p-12 border rounded-md">
            <p className="text-gray-500">No projects available at the moment.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow">
                  <div className="h-60 overflow-hidden relative">
                    {project.images && project.images.length > 0 ? (
                      <img
                        src={project.images[0]}
                        alt={project.projectName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder-property.svg";
                        }}
                      />
                    ) : (
                      <img
                        src="/placeholder-property.svg"
                        alt="Placeholder"
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <Badge className="bg-primary hover:bg-primary">{project.location}</Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="font-serif text-xl">{project.projectName}</CardTitle>
                    <CardDescription className="line-clamp-1">
                      {project.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-gray-700 line-clamp-3 mb-3">{project.description}</p>
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-1">
                        {project.unitTypes.map((type, idx) => (
                          <Badge key={idx} variant="outline" className="bg-gray-100">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Link href={`/projects/${project.id}`}>
                      <Button className="w-full bg-primary hover:bg-primary/90">View Project</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {data && data.pageCount > 1 && (
              <div className="mt-8 flex justify-center">
                <Paginator
                  currentPage={page}
                  totalPages={data.pageCount}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Projects;