import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { Loader2, Calendar, ImageIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnnouncementFormProps {
  announcementId?: number;
  onClose: () => void;
}

export default function AnnouncementForm({ announcementId, onClose }: AnnouncementFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for handling image upload
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  // Form
  const form = useForm({
    defaultValues: {
      title: "",
      content: "",
      imageUrl: "",
      startDate: new Date(),
      endDate: null as Date | null,
      isFeatured: false,
      isHighlighted: false,
      status: "active",
    },
  });
  
  // Fetch announcement data if editing an existing announcement
  const { data: announcementData, isLoading: isLoadingAnnouncement } = useQuery({
    queryKey: ['/api/announcements', announcementId],
    queryFn: async () => {
      if (!announcementId) return null;
      
      const response = await fetch(`/api/announcements/${announcementId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch announcement');
      }
      return response.json();
    },
    enabled: !!announcementId,
  });
  
  // Upload image mutation
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      setIsUploading(true);
      setUploadProgress(0);
      
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/upload/announcement-image', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload image');
      }
      
      setUploadProgress(100);
      setIsUploading(false);
      
      return response.json();
    },
    onSuccess: (data) => {
      form.setValue('imageUrl', data.imageUrl);
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
      setIsUploading(false);
      setUploadProgress(0);
    },
  });
  
  // Create/Update announcement mutation
  const announcementMutation = useMutation({
    mutationFn: async (formData: any) => {
      if (announcementId) {
        // Update existing announcement
        return apiRequest('PUT', `/api/announcements/${announcementId}`, formData);
      } else {
        // Create new announcement
        return apiRequest('POST', '/api/announcements', formData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/announcements'] });
      queryClient.invalidateQueries({ queryKey: ['/api/announcements/highlighted'] });
      queryClient.invalidateQueries({ queryKey: ['/api/announcements/featured'] });
      
      toast({
        title: "Success",
        description: announcementId ? "Announcement updated successfully" : "Announcement created successfully",
      });
      
      form.reset();
      setImageFile(null);
      setImagePreview(null);
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save announcement",
        variant: "destructive",
      });
    },
  });
  
  // Set form values when editing an announcement
  useEffect(() => {
    if (announcementData) {
      form.reset({
        title: announcementData.title || "",
        content: announcementData.content || "",
        imageUrl: announcementData.imageUrl || "",
        startDate: announcementData.startDate ? new Date(announcementData.startDate) : new Date(),
        endDate: announcementData.endDate ? new Date(announcementData.endDate) : null,
        isFeatured: announcementData.isFeatured || false,
        isHighlighted: announcementData.isHighlighted || false,
        status: announcementData.status || "active",
      });
      
      if (announcementData.imageUrl) {
        setImagePreview(announcementData.imageUrl);
      }
    }
  }, [announcementData, form]);
  
  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Remove selected image
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    form.setValue('imageUrl', '');
  };
  
  // Upload image
  const uploadImage = () => {
    if (imageFile) {
      uploadImageMutation.mutate(imageFile);
    }
  };
  
  // Form submission
  const onSubmit = (data: any) => {
    // Format dates
    const formattedData = {
      ...data,
      startDate: data.startDate ? format(new Date(data.startDate), 'yyyy-MM-dd') : null,
      endDate: data.endDate ? format(new Date(data.endDate), 'yyyy-MM-dd') : null,
    };
    
    // Submit the form data
    announcementMutation.mutate(formattedData);
  };
  
  // Loading state when fetching announcement data
  if (announcementId && isLoadingAnnouncement) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title*</FormLabel>
              <FormControl>
                <Input placeholder="Enter announcement title" {...field} required />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content*</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter announcement content"
                  className="min-h-[120px]"
                  {...field}
                  required
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date*</FormLabel>
                <DatePicker
                  date={field.value ? new Date(field.value) : undefined}
                  setDate={(date) => field.onChange(date)}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date (Optional)</FormLabel>
                <DatePicker
                  date={field.value ? new Date(field.value) : undefined}
                  setDate={(date) => field.onChange(date)}
                />
                <FormDescription>
                  Leave empty for indefinite announcements
                </FormDescription>
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
              <FormLabel>Status*</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="isFeatured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Featured Announcement</FormLabel>
                  <FormDescription>
                    Display prominently in the featured section
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="isHighlighted"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Highlighted Announcement</FormLabel>
                  <FormDescription>
                    Show in the spotlight section on homepage
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Announcement Image</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  {/* Hidden input for file selection */}
                  <Input
                    type="hidden"
                    {...field}
                  />
                  
                  {/* Image preview */}
                  {imagePreview && (
                    <div className="relative inline-block">
                      <img
                        src={imagePreview.startsWith('data:') ? imagePreview : `/uploads/announcements/${imagePreview}`}
                        alt="Announcement image preview"
                        className="max-h-[200px] rounded-md object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full"
                        onClick={removeImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  {/* Image upload controls */}
                  {!imagePreview && (
                    <div className="flex items-center gap-4">
                      <label
                        className={cn(
                          "flex h-10 w-full items-center justify-center rounded-md border border-input cursor-pointer transition-colors hover:bg-muted/50",
                          isUploading && "pointer-events-none opacity-50"
                        )}
                      >
                        <Input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageChange}
                          disabled={isUploading}
                        />
                        <ImageIcon className="mr-2 h-4 w-4" />
                        Select Image
                      </label>
                    </div>
                  )}
                  
                  {/* Upload button and progress */}
                  {imageFile && !field.value && (
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={uploadImage}
                        disabled={isUploading}
                        className="w-full"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading... {uploadProgress}%
                          </>
                        ) : (
                          <>Upload Image</>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription>
                Upload an image to represent this announcement (optional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-[#B87333] hover:bg-[#964B00]"
            disabled={announcementMutation.isPending}
          >
            {announcementMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {announcementId ? "Update Announcement" : "Create Announcement"}
          </Button>
        </div>
      </form>
    </Form>
  );
}