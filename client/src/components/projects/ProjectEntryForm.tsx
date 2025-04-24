
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";

// Simplified schema for project entry
const projectSchema = z.object({
  projectName: z.string().min(3, "Project name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  developerName: z.string().min(3, "Developer name must be at least 3 characters"),
  location: z.string().min(1, "Please select a location"),
  startDate: z.string().min(1, "Start date is required"),
  completionDate: z.string().optional(),
  status: z.string().min(1, "Project status is required"),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectEntryFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: any;
  isEdit?: boolean;
}

const ProjectEntryForm: React.FC<ProjectEntryFormProps> = ({
  onSuccess,
  onCancel,
  initialData,
  isEdit = false,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadedImages, setUploadedImages] = useState<string[]>(initialData?.images || []);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      projectName: initialData?.projectName || "",
      description: initialData?.description || "",
      developerName: initialData?.developerName || "",
      location: initialData?.location || "",
      startDate: initialData?.startDate || "",
      completionDate: initialData?.completionDate || "",
      status: initialData?.status || "upcoming",
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    const formData = new FormData();
    
    Array.from(e.target.files).forEach((file) => {
      formData.append("images", file);
    });
    
    try {
      const response = await fetch("/api/upload/project-images", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload images");
      }
      
      const data = await response.json();
      setUploadedImages((prev) => [...prev, ...data.paths]);
      toast({
        title: "Images uploaded successfully",
        description: `${data.paths.length} image(s) uploaded.`,
      });
    } catch (error) {
      toast({
        title: "Image upload failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const mutation = useMutation({
    mutationFn: async (data: ProjectFormValues) => {
      const payload = {
        ...data,
        images: uploadedImages,
      };
      
      const url = isEdit ? `/api/projects/${initialData.id}` : "/api/projects";
      const method = isEdit ? "PUT" : "POST";
      
      return apiRequest(method, url, payload);
    },
    onSuccess: async () => {
      toast({
        title: `Project ${isEdit ? "updated" : "created"} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: `Failed to ${isEdit ? "update" : "create"} project`,
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
          <FormField
            control={form.control}
            name="projectName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter project name" {...field} />
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
                <FormLabel>Description *</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter project description" 
                    className="min-h-32" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="developerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Developer Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter developer name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter project location" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="completionDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected Completion Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Status *</FormLabel>
                <FormControl>
                  <select 
                    className="w-full p-2 border rounded-md"
                    {...field}
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Image Upload */}
          <div className="space-y-2">
            <FormLabel>Project Gallery</FormLabel>
            <div className="flex items-center gap-2">
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex items-center justify-center w-full h-12 px-4 transition-colors bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                <Upload className="mr-2 h-4 w-4" />
                <span>Upload Images</span>
                <input
                  id="image-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
              {isUploading && (
                <Loader2 className="h-4 w-4 animate-spin text-primary ml-2" />
              )}
            </div>

            {/* Image Preview */}
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Preview ${index + 1}`}
                      className="h-24 w-full object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 mt-8">
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
              disabled={mutation.isPending}
              className="bg-[#964B00] hover:bg-[#B87333]"
            >
              {mutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEdit ? "Update Project" : "Create Project"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ProjectEntryForm;
