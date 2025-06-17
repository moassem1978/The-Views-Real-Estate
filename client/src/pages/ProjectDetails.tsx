import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Loader2, ArrowLeft, Building, MapPin, Home } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SimplePropertyCard from "@/components/projects/SimplePropertyCard";
import { parseJsonArray } from "@/lib/utils";

interface Project {
  id: number;
  projectName: string;
  description: string;
  location: string;
  unitTypes: string;
  aboutDeveloper: string;
  images: string[];
  status: string;
  createdAt: string;
  updatedAt: string | null;
}

interface Property {
  id: number;
  title: string;
  address: string;
  city: string;
  state: string;
  price: number;
  downPayment: number;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  builtUpArea: number;
  listingType: string;
  images: string[];
}

const ProjectDetails: React.FC = () => {
  const [match, params] = useRoute<{ id: string }>("/projects/:id");
  const [, setLocation] = useLocation();
  const [selectedImage, setSelectedImage] = useState<string>("");

  // Fetch project details
  const {
    data: project,
    isLoading: isLoadingProject,
    error: projectError
  } = useQuery<Project>({
    queryKey: ["/api/projects", params?.id],
    queryFn: async () => {
      if (!params?.id) throw new Error("No project ID provided");
      const response = await fetch(`/api/projects/${params.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch project details");
      }
      return response.json();
    },
    enabled: !!params?.id,
  });

  // Fetch properties associated with this project
  const {
    data: properties,
    isLoading: isLoadingProperties,
    error: propertiesError
  } = useQuery<Property[]>({
    queryKey: ["/api/projects", params?.id, "properties"],
    queryFn: async () => {
      if (!params?.id) throw new Error("No project ID provided");
      const response = await fetch(`/api/projects/${params.id}/properties`);
      if (!response.ok) {
        throw new Error("Failed to fetch associated properties");
      }
      return response.json();
    },
    enabled: !!params?.id,
  });

  // Handle image selection
  useEffect(() => {
    if (project) {
      const images = parseJsonArray(project.images);
      if (images.length > 0) {
        setSelectedImage(images[0]);
      }
    }
  }, [project]);

  const handleImageClick = (image: string) => {
    setSelectedImage(image);
  };

  // Handle back navigation
  const handleBack = () => {
    setLocation("/projects");
  };

  if (isLoadingProject) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 p-4 rounded-md text-red-700">
          <p>Error loading project details: {projectError instanceof Error ? projectError.message : "Unknown error"}</p>
          <Button onClick={handleBack} variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  // Parse images array
  const images = parseJsonArray(project.images) || [];
  const hasProperties = properties && properties.length > 0;

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Button onClick={handleBack} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
        </Button>
      </div>

      {/* Project Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">{project.projectName}</h1>
        <div className="flex items-center text-gray-600 mb-4">
          <MapPin className="h-5 w-5 mr-2" />
          <span>{project.location}</span>
        </div>
      </div>

      {/* Project Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-8">
        <div className="lg:col-span-4">
          <div className="relative h-[400px] mb-2 bg-gray-100 rounded-md overflow-hidden">
            {selectedImage ? (
              <img loading="lazy"
                src={selectedImage}
                alt={project.projectName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder-property.svg";
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-100">
                <Building className="h-16 w-16 text-gray-300" />
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {images.map((image, index) => (
                <div
                  key={index}
                  className={`relative h-20 cursor-pointer ${
                    selectedImage === image ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => handleImageClick(image)}
                >
                  <img loading="lazy"
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover rounded-sm"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder-property.svg";
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Project Info */}
        <div className="lg:col-span-1">
          <Card className="p-4 h-full">
            <h3 className="font-semibold text-lg mb-3 font-serif">Project Details</h3>
            {/* Unit Types */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Unit Types</h4>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="capitalize">
                  {project.unitTypes}
                </Badge>
              </div>
            </div>

            {/* Developer */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Developer</h4>
              <div className="flex items-start">
                <Building className="h-4 w-4 mr-1 mt-0.5 text-gray-500" />
                <p className="text-sm text-gray-600">{project.aboutDeveloper || "Information not available"}</p>
              </div>
            </div>

            {/* Property Count */}
            {!isLoadingProperties && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Available Units</h4>
                <div className="flex items-center">
                  <Home className="h-4 w-4 mr-1 text-gray-500" />
                  <p className="text-sm font-medium">
                    {properties ? properties.length : 0} Properties
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Project Description */}
      <div className="mb-10">
        <h2 className="text-2xl font-serif font-semibold mb-4">About this Project</h2>
        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-line">{project.description}</p>
        </div>
      </div>

      {/* Properties Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-serif font-semibold mb-2">Properties in this Project</h2>
        {isLoadingProperties ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : propertiesError ? (
          <div className="bg-red-50 p-4 rounded-md text-red-700">
            <p>Error loading properties: {propertiesError instanceof Error ? propertiesError.message : "Unknown error"}</p>
          </div>
        ) : !hasProperties ? (
          <div className="text-center py-12 border rounded-md">
            <Home className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No properties listed for this project yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {properties.map((property) => (
              <SimplePropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;