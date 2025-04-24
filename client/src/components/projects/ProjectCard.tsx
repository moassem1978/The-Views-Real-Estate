import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { parseJsonArray } from "@/lib/utils";

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

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const [mainImage, setMainImage] = useState<string>('');

  useEffect(() => {
    // Set the main image when the project data loads
    const images = getImages() || [];
    const firstImage = images.length > 0 ? images[0] : '/placeholder-property.svg';
    setMainImage(firstImage);
  }, [project]);

  // Parse images from JSON string if necessary
  const getImages = () => {
    // Use our utility function to safely parse the images array
    return parseJsonArray(project.images);
  };

  // Truncate description to a certain length
  const truncateDescription = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow">
      <div className="h-60 overflow-hidden relative">
        <img
          src={mainImage}
          alt={project.projectName}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder-property.svg";
          }}
        />
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
        <p className="text-gray-700 line-clamp-3 mb-3">
          {truncateDescription(project.description)}
        </p>
        <div className="mt-2">
          <div className="flex flex-wrap gap-1">
            {Array.isArray(project.unitTypes) && project.unitTypes.map((type, idx) => (
              <Badge key={idx} variant="outline" className="bg-gray-100">
                {type}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Link href={`/projects/${project.id}`}>
          <Button className="w-full bg-[#964B00] hover:bg-[#B87333]">View Project</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;