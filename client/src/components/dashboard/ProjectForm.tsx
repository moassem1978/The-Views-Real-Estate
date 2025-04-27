import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "../../lib/queryClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Project {
  id: number;
  name: string;
  description: string;
  developer: string;
  city: string;
  status: string;
  completionDate: string;
  images?: string[];
  createdAt: string;
  updatedAt?: string;
}

interface ProjectFormProps {
  projectId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ProjectForm({
  projectId,
  onSuccess,
  onCancel,
}: ProjectFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const isEditing = !!projectId;

  // Fetch project data if editing
  const { data: project, isLoading: isLoadingProject } = useQuery<Project>({
    queryKey: ["/api/projects", projectId],
    queryFn: () => apiRequest("GET", `/api/projects/${projectId}`).then(res => res.json()),
    enabled: !!projectId,
  });

  // Form setup
  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      developer: "",
      city: "",
      status: "upcoming", // Default status
      completionDate: "",
    },
  });

  // Set form values when project data is loaded
  useEffect(() => {
    if (project && isEditing) {
      form.reset({
        name: project.name,
        description: project.description,
        developer: project.developer,
        city: project.city,
        status: project.status,
        completionDate: project.completionDate,
      });
    }
  }, [project, isEditing, form]);

  // Create or update project mutation
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const url = isEditing ? `/api/projects/${projectId}` : '/api/projects';
      const method = isEditing ? 'PUT' : 'POST';
      
      // First, create or update the project
      const response = await apiRequest(method, url, data);
      const result = await response.json();
      
      // Then, if there are images to upload, upload them
      if (images.length > 0) {
        await uploadImages(result.id);
      }
      
      return result;
    },
    onSuccess: () => {
      toast({
        title: isEditing ? "Project updated" : "Project created",
        description: isEditing 
          ? "The project has been successfully updated." 
          : "The project has been successfully created.",
      });
      
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      if (isEditing) {
        queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId] });
      }
      
      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  // Handle image upload
  const uploadImages = async (projectId: number) => {
    try {
      setUploading(true);
      const formData = new FormData();
      images.forEach((image) => {
        formData.append('images', image);
      });
      
      const response = await fetch(`/api/upload/project-images/${projectId}`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload images');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  // Handle form submission
  const onSubmit = async (data: any) => {
    try {
      await mutation.mutateAsync(data);
    } catch (error) {
      console.error('Submission error:', error);
    }
  };
  
  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImages(Array.from(e.target.files));
    }
  };

  if (isLoadingProject && isEditing) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-[#B87333]" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-xl font-medium mb-4">
              {isEditing ? "Edit Project" : "Create New Project"}
            </h3>
            
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter project name" {...field} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description*</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter project description" 
                        className="min-h-[150px]" 
                        {...field} 
                        required 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="developer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Developer*</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter developer name" {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City*</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select city" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Cairo">Cairo</SelectItem>
                          <SelectItem value="Zayed">Zayed</SelectItem>
                          <SelectItem value="North coast">North Coast</SelectItem>
                          <SelectItem value="Red Sea">Red Sea</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status*</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="upcoming">Upcoming</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="completionDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Completion Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="pt-4">
                <FormLabel htmlFor="images">Project Images</FormLabel>
                <div className="mt-2 border rounded-md p-4">
                  <Label 
                    htmlFor="images" 
                    className="flex flex-col items-center justify-center gap-2 cursor-pointer text-center py-8"
                  >
                    <Upload className="h-8 w-8 text-[#B87333]" />
                    <span className="text-sm font-medium">
                      Click to select images
                      <span className="text-muted-foreground"> or drag and drop</span>
                    </span>
                    <span className="text-xs text-muted-foreground">
                      JPG, PNG, or GIF up to 10MB each
                    </span>
                  </Label>
                  <Input
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  
                  {images.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">{images.length} file(s) selected</p>
                      <ul className="text-xs text-muted-foreground">
                        {Array.from(images).map((file, index) => (
                          <li key={index}>{file.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end gap-4">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={mutation.isPending || uploading}
            className="bg-[#B87333] hover:bg-[#964B00]"
          >
            {(mutation.isPending || uploading) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isEditing ? "Update Project" : "Create Project"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// Label component to avoid dependency issues
function Label({ htmlFor, className, children }: { htmlFor: string, className?: string, children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className={className}>
      {children}
    </label>
  );
}