import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Building, MapPin } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { parseJsonArray } from "@/lib/utils";

interface Project {
  id: number;
  projectName: string;
  description: string;
  location: string;
  unitTypes: string;
  aboutDeveloper: string;
  images: string[];
  status?: string;
  createdAt?: string;
  updatedAt?: string | null;
}

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const [, setLocation] = useLocation();
  const [mainImage, setMainImage] = useState<string>("");

  useEffect(() => {
    // Set the main image when the project data loads
    const images = getImages() || [];
    const firstImage = images.length > 0 ? images[0] : "/placeholder-property.svg";
    setMainImage(firstImage);
  }, [project]);

  // Parse images from JSON string if necessary
  const getImages = () => {
    return parseJsonArray(project.images);
  };

  // Get a truncated description
  const truncateDescription = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Handle view details click
  const handleViewDetails = () => {
    setLocation(`/projects/${project.id}`);
  };

  return (
    <Card className="overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-52">
        <img
          src={mainImage}
          alt={project.projectName}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder-property.svg";
          }}
        />
      </div>
      
      <CardContent className="flex-grow flex flex-col p-4">
        <div className="mb-3">
          <h3 className="text-xl font-serif font-semibold text-gray-900 mb-1">
            {project.projectName}
          </h3>
          <div className="flex items-center text-gray-500 text-sm mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{project.location}</span>
          </div>
        </div>
        
        {project.unitTypes && (
          <div className="my-2">
            <Badge variant="outline" className="capitalize bg-gray-50">
              {project.unitTypes}
            </Badge>
          </div>
        )}
        
        <p className="text-gray-600 text-sm my-3">
          {truncateDescription(project.description)}
        </p>
        
        <div className="mt-auto">
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <Building className="h-4 w-4 mr-1" />
            <span>By {project.aboutDeveloper ? truncateDescription(project.aboutDeveloper, 40) : "Developer"}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={handleViewDetails} 
          className="w-full bg-[#964B00] hover:bg-[#B87333] text-white"
        >
          View Project
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;