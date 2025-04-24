import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import ProjectsList from "@/components/projects/ProjectsList";
import Paginator from "@/components/ui/paginator";

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
            <ProjectsList projects={projects} isLoading={isLoading} />

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