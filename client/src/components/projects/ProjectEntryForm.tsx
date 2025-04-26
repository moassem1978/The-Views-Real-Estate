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
import DirectUploader from "../DirectUploader";

const projectSchema = z.object({
  projectName: z.string().min(3, "Project name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(1, "Location is required"),
  startDate: z.string().min(1, "Start date is required"),
  completionDate: z.string().optional(),
  status: z.string().min(1, "Project status is required"),
  developer: z.string().min(3, "Developer name is required"),
  numberOfUnits: z.string().min(1, "Number of units is required"),
  unitTypes: z.array(z.object({
    type: z.string(),
    area: z.string(),
    count: z.string()
  })).default([]),
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
  const [uploadedImages, setUploadedImages] = useState<string[]>(
    initialData?.images || []
  );

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      projectName: initialData?.projectName || "",
      description: initialData?.description || "",
      location: initialData?.location || "",
      startDate: initialData?.startDate || "",
      completionDate: initialData?.completionDate || "",
      status: initialData?.status || "upcoming",
      developer: initialData?.developer || "",
      numberOfUnits: initialData?.numberOfUnits || null, //Added default value
    },
  });

  const handleUploadSuccess = (urls: string[]) => {
    setUploadedImages((prev) => [...prev, ...urls]);
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
    onSuccess: () => {
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
            name="developer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Developer *</FormLabel>
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

          {/* Total Number of Units */}
          <FormField
            control={form.control}
            name="numberOfUnits"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Number of Units *</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="e.g. 100" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Unit Types */}
          <div className="space-y-4 border p-4 rounded-md">
            <h3 className="font-medium">Unit Types</h3>
            {form.watch('unitTypes')?.map((_, index) => (
              <div key={index} className="grid grid-cols-3 gap-2">
                <FormField
                  control={form.control}
                  name={`unitTypes.${index}.type`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Type (e.g. 2BR)" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`unitTypes.${index}.area`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Area (m²)" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`unitTypes.${index}.count`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Count" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const currentTypes = form.getValues('unitTypes') || [];
                form.setValue('unitTypes', [...currentTypes, { type: '', area: '', count: '' }]);
              }}
            >
              Add Unit Type
            </Button>
          </div>


          {/* Project Gallery */}
          <div className="space-y-2">
            <FormLabel>Project Gallery</FormLabel>
            <DirectUploader
              onUploadSuccess={handleUploadSuccess}
              maxFiles={10}
              label="Upload Project Images"
            />

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