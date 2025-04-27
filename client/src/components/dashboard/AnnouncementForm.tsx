import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Announcement } from "../../types";
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
import { Loader2, Upload, Calendar } from "lucide-react";
import { useForm } from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface AnnouncementFormProps {
  announcementId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function AnnouncementForm({
  announcementId,
  onSuccess,
  onCancel,
}: AnnouncementFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [image, setImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const isEditing = !!announcementId;

  // Fetch announcement data if editing
  const { data: announcement, isLoading: isLoadingAnnouncement } = useQuery<Announcement>({
    queryKey: ["/api/announcements", announcementId],
    queryFn: () => apiRequest("GET", `/api/announcements/${announcementId}`).then(res => res.json()),
    enabled: !!announcementId,
  });

  // Form setup
  const form = useForm({
    defaultValues: {
      title: "",
      content: "",
      startDate: new Date().toISOString().split('T')[0],
      endDate: "",
      isActive: true,
      isFeatured: false,
      isHighlighted: false,
    },
  });

  // Set form values when announcement data is loaded
  useEffect(() => {
    if (announcement && isEditing) {
      form.reset({
        title: announcement.title,
        content: announcement.content,
        startDate: announcement.startDate ? announcement.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
        endDate: announcement.endDate ? announcement.endDate.split('T')[0] : "",
        isActive: announcement.isActive,
        isFeatured: announcement.isFeatured,
        isHighlighted: announcement.isHighlighted,
      });
    }
  }, [announcement, isEditing, form]);

  // Create or update announcement mutation
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const url = isEditing ? `/api/announcements/${announcementId}` : '/api/announcements';
      const method = isEditing ? 'PUT' : 'POST';
      
      // First, create or update the announcement
      const response = await apiRequest(method, url, data);
      const result = await response.json();
      
      // Then, if there is an image to upload, upload it
      if (image) {
        await uploadImage(result.id);
      }
      
      return result;
    },
    onSuccess: () => {
      toast({
        title: isEditing ? "Announcement updated" : "Announcement created",
        description: isEditing 
          ? "The announcement has been successfully updated." 
          : "The announcement has been successfully created.",
      });
      
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      if (isEditing) {
        queryClient.invalidateQueries({ queryKey: ["/api/announcements", announcementId] });
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
  const uploadImage = async (announcementId: number) => {
    try {
      setUploading(true);
      const formData = new FormData();
      if (image) {
        formData.append('image', image);
      }
      
      const response = await fetch(`/api/upload/announcement-image/${announcementId}`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
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
      setImage(e.target.files[0]);
    }
  };

  if (isLoadingAnnouncement && isEditing) {
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
              {isEditing ? "Edit Announcement" : "Create New Announcement"}
            </h3>
            
            <div className="space-y-4">
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
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date*</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full pl-3 text-left font-normal ${
                                !field.value ? "text-muted-foreground" : ""
                              }`}
                            >
                              {field.value ? (
                                format(new Date(field.value), "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <Calendar className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                            disabled={(date) => date < new Date("1900-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
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
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full pl-3 text-left font-normal ${
                                !field.value ? "text-muted-foreground" : ""
                              }`}
                            >
                              {field.value ? (
                                format(new Date(field.value), "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <Calendar className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                            disabled={(date) => {
                              const startDate = form.getValues("startDate");
                              return date < new Date(startDate);
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Leave empty for announcements without an end date
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active</FormLabel>
                        <FormDescription>
                          Active announcements are visible on the website
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Featured</FormLabel>
                        <FormDescription>
                          Featured announcements appear in the main carousel
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isHighlighted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Highlighted</FormLabel>
                        <FormDescription>
                          Highlighted announcements appear in special sections
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="pt-4">
                <FormLabel htmlFor="image">Announcement Image</FormLabel>
                <div className="mt-2 border rounded-md p-4">
                  <FormLabel 
                    htmlFor="image" 
                    className="flex flex-col items-center justify-center gap-2 cursor-pointer text-center py-8"
                  >
                    <Upload className="h-8 w-8 text-[#B87333]" />
                    <span className="text-sm font-medium">
                      Click to select an image
                      <span className="text-muted-foreground"> or drag and drop</span>
                    </span>
                    <span className="text-xs text-muted-foreground">
                      JPG, PNG, or GIF up to 5MB
                    </span>
                  </FormLabel>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  
                  {image && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Selected image:</p>
                      <p className="text-xs text-muted-foreground">{image.name}</p>
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
            {isEditing ? "Update Announcement" : "Create Announcement"}
          </Button>
        </div>
      </form>
    </Form>
  );
}