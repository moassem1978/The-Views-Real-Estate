import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Building, Plus, Edit, Trash2, ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ProjectEntryForm from "@/components/projects/ProjectEntryForm";

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

const ProjectManagement: React.FC = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch projects
  const { data, isLoading, error, refetch } = useQuery<{ data: Project[] }>({
    queryKey: ["/api/projects"],
    queryFn: async () => {
      const response = await fetch("/api/projects");
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }
      return response.json();
    },
  });

  // Check if user has permission to manage projects
  const hasPermission = user && (user.role === "admin" || user.role === "owner");

  // Handle edit project
  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setShowEditDialog(true);
  };

  // Handle delete project
  const handleDeleteProject = (project: Project) => {
    setSelectedProject(project);
    setShowDeleteDialog(true);
  };

  // Confirm delete project
  const confirmDeleteProject = async () => {
    if (!selectedProject) return;

    setIsDeleting(true);
    try {
      await apiRequest("DELETE", `/api/projects/${selectedProject.id}`);
      toast({
        title: "Project deleted successfully",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Failed to delete project",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setSelectedProject(null);
    }
  };

  // No permission message
  if (!hasPermission) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center min-h-[40vh]">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <AlertCircle className="h-12 w-12 text-red-500" />
                <h2 className="text-2xl font-bold">Permission Denied</h2>
                <p className="text-gray-500">
                  You don't have permission to manage projects. Please contact an
                  administrator.
                </p>
                <Button
                  onClick={() => setLocation("/")}
                  className="mt-4"
                  variant="outline"
                >
                  Go Back Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
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
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold font-serif">Project Management</h1>
            <p className="text-gray-500">
              Manage all your development projects from here
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setLocation("/projects")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              View Projects
            </Button>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-[#964B00] hover:bg-[#B87333]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Project
            </Button>
          </div>
        </div>

        {/* Project List */}
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 border rounded-md">
            <Building className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-700">No Projects Yet</h3>
            <p className="text-gray-500 mb-4">
              You haven't added any projects yet. Get started by adding your first
              project.
            </p>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-[#964B00] hover:bg-[#B87333]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Project
            </Button>
          </div>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Unit Types</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.projectName}</TableCell>
                    <TableCell>{project.location}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {project.unitTypes.map((type, idx) => (
                          <Badge key={idx} variant="outline">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={project.status === "published" ? "default" : "secondary"}>
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditProject(project)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteProject(project)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Add Project Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Project</DialogTitle>
            <DialogDescription>
              Add the details for your new project. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <ProjectEntryForm
            onSuccess={() => {
              setShowAddDialog(false);
              refetch();
            }}
            onCancel={() => setShowAddDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update the details for this project.
            </DialogDescription>
          </DialogHeader>
          {selectedProject && (
            <ProjectEntryForm
              initialData={selectedProject}
              isEdit
              onSuccess={() => {
                setShowEditDialog(false);
                setSelectedProject(null);
                refetch();
              }}
              onCancel={() => {
                setShowEditDialog(false);
                setSelectedProject(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the project "
              {selectedProject?.projectName}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setSelectedProject(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteProject}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Project
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectManagement;