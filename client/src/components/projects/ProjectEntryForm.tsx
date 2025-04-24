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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";

// Define unit type options
const unitTypeOptions = [
  "apartment",
  "penthouse",
  "duplex",
  "chalet",
  "townhouse",
  "twinhouse",
  "villa",
  "office",
  "retail",
  "studio"
];

// Location options
const locationOptions = [
  "Cairo",
  "Zayed",
  "North coast",
  "Red Sea"
];

// Form schema for project entry
const projectSchema = z.object({
  projectName: z.string().min(3, "Project name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(1, "Please select a location"),
  unitTypes: z.array(z.string()).min(1, "Select at least one unit type"),
  aboutDeveloper: z.string().min(10, "About developer must be at least 10 characters"),
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

  // Initialize form with default values
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      projectName: initialData?.projectName || "",
      description: initialData?.description || "",
      location: initialData?.location || "",
      unitTypes: initialData?.unitTypes || [],
      aboutDeveloper: initialData?.aboutDeveloper || "",
    },
  });

  // Handle image upload
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

  // Remove image from uploaded images
  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Create or update project mutation
  const mutation = useMutation({
    mutationFn: async (data: ProjectFormValues) => {
      const payload = {
        ...data,
        images: uploadedImages,
        status: "published",
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

  // Form submission handler
  const onSubmit = (data: ProjectFormValues) => {
    mutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-serif font-bold">
          {isEdit ? "Edit Project" : "Add New Project"}
        </h2>
        <p className="text-gray-500">
          Enter the project details below. Fields marked with * are required.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Project Name */}
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

          {/* Description */}
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

          {/* Location */}
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location *</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {locationOptions.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Unit Types */}
          <FormField
            control={form.control}
            name="unitTypes"
            render={() => (
              <FormItem>
                <FormLabel>Unit Types *</FormLabel>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {unitTypeOptions.map((type) => (
                    <FormField
                      key={type}
                      control={form.control}
                      name="unitTypes"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={type}
                            className="flex flex-row items-center space-x-2 space-y-0"
                          >
                            <input
                              type="checkbox"
                              id={type}
                              checked={field.value?.includes(type) || false}
                              onChange={(e) => {
                                const isChecked = e.target.checked;
                                const updatedValue = isChecked
                                  ? [...(field.value || []), type]
                                  : (field.value || []).filter(
                                      (val) => val !== type
                                    );
                                field.onChange(updatedValue);
                              }}
                              className="form-checkbox h-4 w-4 text-primary border-gray-300 rounded"
                            />
                            <label
                              htmlFor={type}
                              className="text-sm font-medium text-gray-700 capitalize"
                            >
                              {type}
                            </label>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* About Developer */}
          <FormField
            control={form.control}
            name="aboutDeveloper"
            render={({ field }) => (
              <FormItem>
                <FormLabel>About Developer *</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter information about the developer" 
                    className="min-h-32" 
                    {...field} 
                  />
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