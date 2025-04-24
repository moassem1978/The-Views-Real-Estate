import React, { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ArrowLeft, User, Calendar, MapPin, Building, Home } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import PropertyCard from "@/components/properties/PropertyCard";
import Paginator from "@/components/common/Paginator";
import { formatDate } from "@/lib/utils";

// Type definitions for projects and properties
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

interface Property {
  id: number;
  title: string;
  description: string;
  address: string;
  city: string;
  price: number;
  downPayment: number;
  listingType: string;
  projectName: string;
  bedrooms: number;
  bathrooms: number;
  builtUpArea: number;
  propertyType: string;
  images: string[];
  status: string;
  createdAt: string;
}

interface PaginatedProperties {
  data: Property[];
  totalCount: number;
  pageCount: number;
  page: number;
  pageSize: number;
}

const ProjectDetails: React.FC = () => {
  const [, params] = useRoute("/projects/:id");
  const projectId = params?.id ? parseInt(params.id) : 0;
  const [page, setPage] = useState(1);
  const pageSize = 9;

  const { data: project, isLoading: isLoadingProject, error: projectError } = useQuery<Project, Error>({
    queryKey: ["/api/projects", projectId],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch project details");
      }
      return response.json();
    },
    enabled: !!projectId,
  });

  const { data: propertiesData, isLoading: isLoadingProperties, error: propertiesError } = useQuery<PaginatedProperties, Error>({
    queryKey: ["/api/projects", projectId, "properties", page, pageSize],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/properties?page=${page}&pageSize=${pageSize}`);
      if (!response.ok) {
        throw new Error("Failed to fetch properties for this project");
      }
      return response.json();
    },
    enabled: !!projectId,
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (isLoadingProject || isLoadingProperties) {
    return (
      <div className="container mx-auto flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (projectError) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 p-4 rounded-md text-red-700">
          <p>Error loading project: {projectError.message}</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center p-12 border rounded-md">
          <p className="text-gray-500">Project not found.</p>
          <Link href="/projects">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const properties = propertiesData?.data || [];

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Link href="/projects">
          <Button variant="ghost" className="pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Project Details */}
        <div className="lg:col-span-3">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div>
                <h1 className="text-3xl font-serif font-bold text-gray-900">{project.projectName}</h1>
                <div className="flex items-center mt-2 text-gray-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{project.location}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {project.unitTypes.map((type, idx) => (
                  <Badge key={idx} className="bg-primary hover:bg-primary/90">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Project Gallery */}
            <div className="mt-6">
              {project.images && project.images.length > 0 ? (
                <Carousel className="w-full">
                  <CarouselContent>
                    {project.images.map((image, index) => (
                      <CarouselItem key={index}>
                        <div className="h-[400px] w-full overflow-hidden rounded-lg">
                          <img
                            src={image}
                            alt={`${project.projectName} - Image ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/placeholder-property.svg";
                            }}
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </Carousel>
              ) : (
                <div className="h-[400px] w-full overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
                  <img
                    src="/placeholder-property.svg"
                    alt="Placeholder"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Project Description */}
            <div className="mt-8">
              <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">Project Overview</h2>
              <p className="text-gray-700 whitespace-pre-line">{project.description}</p>
            </div>

            {/* About Developer */}
            {project.aboutDeveloper && (
              <div className="mt-8">
                <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">About the Developer</h2>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-3 rounded-full">
                        <Building className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-gray-700 whitespace-pre-line">{project.aboutDeveloper}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <Separator className="my-8" />

            {/* Property Listings in this Project */}
            <div>
              <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-6">Properties in {project.projectName}</h2>
              
              {isLoadingProperties ? (
                <div className="flex justify-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : propertiesError ? (
                <div className="bg-red-50 p-4 rounded-md text-red-700">
                  <p>Error loading properties: {propertiesError.message}</p>
                </div>
              ) : properties.length === 0 ? (
                <div className="text-center p-12 border rounded-md">
                  <Home className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No properties available in this project yet.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map((property) => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
                  </div>

                  {propertiesData && propertiesData.pageCount > 1 && (
                    <div className="mt-8 flex justify-center">
                      <Paginator
                        currentPage={page}
                        totalPages={propertiesData.pageCount}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;