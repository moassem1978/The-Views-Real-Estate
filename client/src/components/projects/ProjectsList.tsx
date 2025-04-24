import React from 'react';
import ProjectCard from './ProjectCard';

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

interface ProjectsListProps {
  projects: Project[];
  isLoading: boolean;
}

const ProjectsList: React.FC<ProjectsListProps> = ({ projects, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-[400px] bg-gray-100 animate-pulse rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center p-12 border rounded-md">
        <p className="text-gray-500">No projects available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
};

export default ProjectsList;