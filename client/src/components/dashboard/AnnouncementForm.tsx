import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Image, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Announcement } from "../../types";
import { useToast } from "@/hooks/use-toast";

// Create a schema for announcements
const announcementSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  startDate: z.date(),
  endDate: z.date().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

type AnnouncementFormValues = z.infer<typeof announcementSchema>;

interface AnnouncementFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  defaultValues?: Partial<Announcement>;
  isEditing?: boolean;
}

export default function AnnouncementForm({ onSubmit, defaultValues, isEditing = false }: AnnouncementFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(defaultValues?.imageUrl || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Initialize form with default values or empty values
  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: defaultValues?.title || "",
      content: defaultValues?.content || "",
      startDate: defaultValues?.startDate ? new Date(defaultValues.startDate) : new Date(),
      endDate: defaultValues?.endDate ? new Date(defaultValues.endDate) : undefined,
      isActive: defaultValues?.isActive ?? true,
      isFeatured: defaultValues?.isFeatured ?? false,
    },
  });

  // Handle image file changes
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Image too large",
        description: "Please select an image less than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setImageFile(file);
  };

  // Handle form submission
  const handleSubmitForm = async (values: AnnouncementFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Create FormData object for multipart/form-data submission
      const formData = new FormData();
      
      // Add form values
      formData.append('title', values.title);
      formData.append('content', values.content);
      formData.append('startDate', values.startDate.toISOString());
      if (values.endDate) {
        formData.append('endDate', values.endDate.toISOString());
      }
      formData.append('isActive', String(values.isActive));
      formData.append('isFeatured', String(values.isFeatured));
      
      // Add image if selected
      if (imageFile) {
        formData.append('image', imageFile);
      }
      
      // Call parent component's submit handler
      await onSubmit(formData);
      
      // Reset form and image state after successful submission
      if (!isEditing) {
        form.reset();
        setImageFile(null);
        setImagePreview(null);
      }
      
      toast({
        title: `Announcement ${isEditing ? 'updated' : 'created'} successfully`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error submitting announcement:', error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} announcement`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmitForm)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter announcement title" {...field} />
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
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter announcement content" 
                  className="h-32 resize-none" 
                  {...field} 
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
                <FormLabel>Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
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
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      disabled={(date) => date < form.getValues("startDate")}
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Leave empty for announcements with no end date
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                <div className="space-y-0.5">
                  <FormLabel>Active Status</FormLabel>
                  <FormDescription>
                    Make this announcement visible to users
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="isFeatured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                <div className="space-y-0.5">
                  <FormLabel>Featured</FormLabel>
                  <FormDescription>
                    Show in the featured carousel on homepage
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="space-y-3">
          <FormLabel>Announcement Image (Optional)</FormLabel>
          <div className="border border-dashed rounded-md p-6 flex flex-col items-center justify-center">
            {imagePreview ? (
              <div className="space-y-4 w-full">
                <div className="relative w-full max-h-40 overflow-hidden rounded-md">
                  <img 
                    src={imagePreview} 
                    alt="Announcement preview" 
                    className="object-cover w-full h-auto" 
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-2">
                <Image className="h-8 w-8 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">
                  Drag an image here or click to upload
                </div>
                <div className="text-xs text-muted-foreground">
                  (Max file size: 5MB)
                </div>
              </div>
            )}
            <Input
              type="file"
              accept="image/*"
              className={cn(
                "cursor-pointer opacity-0 absolute inset-0",
                imagePreview ? "pointer-events-none" : ""
              )}
              onChange={handleImageChange}
              disabled={!!imagePreview}
            />
          </div>
        </div>
        
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? 'Update Announcement' : 'Create Announcement'}
        </Button>
      </form>
    </Form>
  );
}